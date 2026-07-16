/* GoodDay 鮮魚共有 — 11-tab-check-fish （自動分割・window共有） */
var {
  useState,
  useEffect,
  useCallback,
  useRef
} = React;
const POPCHECK_TH = {
  // 閾値（あとで調整しやすいよう定数化）
  RESIZE: 480,
  // 解析用の最大辺
  SAMPLE_STEP: 4,
  // KMeansのサンプリング間隔（px）
  KMEANS_K: 8,
  KMEANS_ITER: 10,
  COLOR_MIN_SHARE: 0.05,
  EDGE_MAG: 60,
  // エッジ判定のしきい値
  MARGIN_BAND: 0.08,
  // 余白判定：端から8%
  BRIGHT_IDEAL: 62,
  CONTRAST_LO: 40,
  CONTRAST_HI: 78,
  SAT_HI: 60,
  CLUTTER_HI: 45
};
function popcheckAnalyze(img) {
  const T = POPCHECK_TH;
  const scale = Math.min(1, T.RESIZE / Math.max(img.naturalWidth, img.naturalHeight));
  const w = Math.max(1, Math.round(img.naturalWidth * scale));
  const h = Math.max(1, Math.round(img.naturalHeight * scale));
  const cv = document.createElement("canvas");
  cv.width = w;
  cv.height = h;
  const ctx = cv.getContext("2d", {
    willReadFrequently: true
  });
  ctx.drawImage(img, 0, 0, w, h);
  const d = ctx.getImageData(0, 0, w, h).data;
  const N = w * h;

  // --- 輝度・彩度 ---
  const luma = new Float32Array(N);
  let sumL = 0,
    sumS = 0;
  for (let i = 0; i < N; i++) {
    const r = d[i * 4],
      g = d[i * 4 + 1],
      b = d[i * 4 + 2];
    const l = 0.299 * r + 0.587 * g + 0.114 * b;
    luma[i] = l;
    sumL += l;
    const mx = Math.max(r, g, b),
      mn = Math.min(r, g, b);
    sumS += mx === 0 ? 0 : (mx - mn) / mx;
  }
  const meanL = sumL / N;
  let varL = 0;
  for (let i = 0; i < N; i++) varL += (luma[i] - meanL) * (luma[i] - meanL);
  const stdL = Math.sqrt(varL / N);
  const brightness = Math.round(meanL / 255 * 100);
  const saturation = Math.round(sumS / N * 100);
  const contrast = Math.round(Math.min(100, stdL / 80 * 100));

  // --- エッジ（Sobel） ---
  const edge = new Uint8Array(N);
  let edgeCount = 0;
  for (let y = 1; y < h - 1; y++) for (let x = 1; x < w - 1; x++) {
    const i = y * w + x;
    const gx = -luma[i - w - 1] - 2 * luma[i - 1] - luma[i + w - 1] + luma[i - w + 1] + 2 * luma[i + 1] + luma[i + w + 1];
    const gy = -luma[i - w - 1] - 2 * luma[i - w] - luma[i - w + 1] + luma[i + w - 1] + 2 * luma[i + w] + luma[i + w + 1];
    if (Math.sqrt(gx * gx + gy * gy) > T.EDGE_MAG) {
      edge[i] = 1;
      edgeCount++;
    }
  }
  const clutter = Math.round(Math.min(100, edgeCount / N * 100 * 2.4));

  // --- 余白（端バンドのエッジ密度） ---
  const band = Math.max(2, Math.round(Math.min(w, h) * T.MARGIN_BAND));
  const bandDensity = (x0, y0, x1, y1) => {
    let c = 0,
      n = 0;
    for (let y = y0; y < y1; y++) for (let x = x0; x < x1; x++) {
      n++;
      if (edge[y * w + x]) c++;
    }
    return n ? c / n : 0;
  };
  const eTop = bandDensity(0, 0, w, band);
  const eBottom = bandDensity(0, h - band, w, h);
  const eLeft = bandDensity(0, 0, band, h);
  const eRight = bandDensity(w - band, 0, w, h);
  const worst = Math.max(eTop, eBottom, eLeft, eRight);
  const marginScore = Math.round(Math.max(0, 100 - worst * 100 * 2.2));

  // --- KMeans 主要色 ---
  const samples = [];
  for (let y = 0; y < h; y += T.SAMPLE_STEP) for (let x = 0; x < w; x += T.SAMPLE_STEP) {
    const i = (y * w + x) * 4;
    samples.push([d[i], d[i + 1], d[i + 2]]);
  }
  let cents = [];
  for (let k = 0; k < T.KMEANS_K; k++) cents.push(samples[Math.floor(samples.length * (k + 0.5) / T.KMEANS_K)].slice());
  let asn = new Array(samples.length).fill(0);
  for (let it = 0; it < T.KMEANS_ITER; it++) {
    for (let si = 0; si < samples.length; si++) {
      let bd = 1e12,
        bi = 0;
      for (let k = 0; k < cents.length; k++) {
        const dx = samples[si][0] - cents[k][0],
          dy = samples[si][1] - cents[k][1],
          dz = samples[si][2] - cents[k][2];
        const dist = dx * dx + dy * dy + dz * dz;
        if (dist < bd) {
          bd = dist;
          bi = k;
        }
      }
      asn[si] = bi;
    }
    const acc = cents.map(() => [0, 0, 0, 0]);
    for (let si = 0; si < samples.length; si++) {
      const a = acc[asn[si]];
      a[0] += samples[si][0];
      a[1] += samples[si][1];
      a[2] += samples[si][2];
      a[3]++;
    }
    cents = acc.map((a, k) => a[3] ? [a[0] / a[3], a[1] / a[3], a[2] / a[3]] : cents[k]);
  }
  const shares = cents.map((c, k) => ({
    c,
    n: asn.filter(a => a === k).length / samples.length
  })).sort((a, b) => b.n - a.n);
  const colorCount = shares.filter(x => x.n >= T.COLOR_MIN_SHARE).length;
  const hex = v => "#" + [0, 1, 2].map(j => Math.round(v[j]).toString(16).padStart(2, "0")).join("");
  const dominant = shares.slice(0, 5).map(x => hex(x.c));
  return {
    brightness,
    saturation,
    contrast,
    clutter,
    marginScore,
    colorCount,
    dominant,
    edges: {
      top: eTop,
      bottom: eBottom,
      left: eLeft,
      right: eRight
    }
  };
}
function popcheckJudge(m) {
  const T = POPCHECK_TH;
  const lv = {},
    cm = {};
  // 色数
  lv.color = m.colorCount <= 4 ? "少なめ" : m.colorCount <= 6 ? "適度" : "やや多い";
  cm.color = m.colorCount <= 4 ? "色数が絞られていて、まとまりのある印象です。" : m.colorCount <= 6 ? "色数は適度で、まとまりがあります。" : "主要色が多く、少しにぎやかに見える可能性があります。使う色を2〜3色に絞ると締まります。";
  // 明るさ
  lv.brightness = m.brightness >= 78 ? "かなり明るい" : m.brightness >= 55 ? "明るい" : m.brightness >= 35 ? "適度" : "暗め";
  cm.brightness = m.brightness >= 78 ? "かなり明るいため、白背景や黄色部分が眩しく見える可能性があります。" : m.brightness >= 55 ? "全体的に明るく、売場で目立ちやすいです。" : m.brightness >= 35 ? "明るさは落ち着いていて、上品な印象です。" : "やや暗めなので、商品名やメインコピーの視認性に注意してください。";
  // 彩度
  lv.saturation = m.saturation >= T.SAT_HI ? "高め" : m.saturation >= 30 ? "適度" : "落ち着き";
  cm.saturation = m.saturation >= 75 ? "彩度が高すぎるため、派手さや眩しさが出る可能性があります。" : m.saturation >= T.SAT_HI ? "彩度が高く、かなり目を引くPOPです。" : m.saturation >= 30 ? "彩度のバランスが良く、自然に目に入ります。" : "彩度は落ち着いており、和モダンな印象に向いています。";
  // コントラスト
  lv.contrast = m.contrast >= T.CONTRAST_HI ? "強め" : m.contrast >= T.CONTRAST_LO ? "適度" : "弱め";
  cm.contrast = m.contrast >= T.CONTRAST_HI ? "コントラストが強すぎるため、全体が少し騒がしく見える可能性があります。" : m.contrast >= T.CONTRAST_LO ? "コントラストがしっかりあり、見出しが目立ちやすい構成です。" : "コントラストが弱めなので、文字と背景の差を強くすると見やすくなります。";
  // 情報量
  lv.clutter = m.clutter >= 65 ? "多い" : m.clutter >= T.CLUTTER_HI ? "やや多い" : "適度";
  cm.clutter = m.clutter >= 65 ? "背景・イラスト・文字要素が多く、売場では少し読みにくい可能性があります。" : m.clutter >= T.CLUTTER_HI ? "細かい要素が多く、やや情報量が多いPOPです。" : "情報量は適度で、見やすい構成です。";
  // 余白
  lv.margin = m.marginScore >= 65 ? "十分" : m.marginScore >= 45 ? "やや狭い" : "狭い";
  const worstSide = Object.entries(m.edges).sort((a, b) => b[1] - a[1])[0][0];
  const sideJa = {
    top: "上",
    bottom: "下",
    left: "左",
    right: "右"
  }[worstSide];
  cm.margin = m.marginScore >= 65 ? "余白は比較的安定しており、印刷時にも安心です。" : m.marginScore >= 45 ? `${sideJa}端に要素が近く、印刷時に少し窮屈に見える可能性があります。` : `${sideJa}端をはじめ要素が端に詰まっていて、窮屈に見える可能性があります。`;

  // 個別の良さスコア（0-100）
  const gBright = Math.max(0, 100 - Math.abs(m.brightness - T.BRIGHT_IDEAL) * 1.6);
  const gSat = m.saturation <= T.SAT_HI ? 100 : Math.max(0, 100 - (m.saturation - T.SAT_HI) * 2.0);
  const gCon = m.contrast >= T.CONTRAST_LO && m.contrast <= T.CONTRAST_HI ? 100 : Math.max(0, 100 - Math.min(Math.abs(m.contrast - T.CONTRAST_LO), Math.abs(m.contrast - T.CONTRAST_HI)) * 1.8);
  const gClut = m.clutter <= T.CLUTTER_HI ? 100 : Math.max(0, 100 - (m.clutter - T.CLUTTER_HI) * 1.8);
  const gCol = m.colorCount <= 6 ? 100 : Math.max(0, 100 - (m.colorCount - 6) * 12);
  const total = Math.round(gBright * 0.15 + gSat * 0.2 + gCon * 0.15 + gClut * 0.25 + m.marginScore * 0.1 + gCol * 0.15);
  const grade = total >= 85 ? "A" : total >= 70 ? "B" : total >= 55 ? "C" : "D";
  const good = [];
  if (m.brightness >= 55 && m.brightness < 78) good.push("明るく目を引きやすい");
  if (m.contrast >= T.CONTRAST_LO && m.contrast <= T.CONTRAST_HI) good.push("見出しが目立ちやすいコントラスト");
  if (m.colorCount <= 6) good.push("色数がまとまっている");
  if (m.clutter < T.CLUTTER_HI) good.push("情報量が適度で読みやすい");
  if (m.marginScore >= 65) good.push("余白が安定していて印刷に安心");
  if (m.saturation >= 30 && m.saturation < T.SAT_HI) good.push("彩度のバランスが自然");
  if (!good.length) good.push("売場で注目されやすい存在感がある");
  const imp = [];
  if (m.saturation >= T.SAT_HI) imp.push("背景の彩度を少し下げる");
  if (m.clutter >= T.CLUTTER_HI) imp.push("説明文や装飾を少し減らす");
  if (m.marginScore < 65) imp.push("上下左右の余白を少し増やす");
  if (m.colorCount > 6) imp.push("使う色を2〜3色に絞る");
  if (m.brightness >= 78) imp.push("白・黄色の面積を少し抑える");
  if (m.brightness < 35) imp.push("背景を明るくして文字を読みやすく");
  if (m.contrast < T.CONTRAST_LO) imp.push("文字と背景の明暗差を強くする");
  if (!imp.length) imp.push("このままでOK。現状のバランスを保って");
  const summary = total >= 85 ? "色数・明るさ・余白のバランスが良く、売場で使いやすいPOPです。" : total >= 70 ? "全体的に目を引くPOPですが、" + (m.saturation >= T.SAT_HI ? "彩度" : "一部の要素") + (m.clutter >= T.CLUTTER_HI ? "と情報量がやや高めです。" : "がやや強めです。") + "少し整えるとさらに見やすくなります。" : total >= 55 ? "見出しは目立ちますが、要素が多めでややごちゃついて見える可能性があります。装飾を減らし余白を作ると改善します。" : "売場で読みにくくなる要素が重なっています。色数・情報量・余白を見直すことをおすすめします。";
  return {
    total,
    grade,
    summary,
    lv,
    cm,
    good,
    imp
  };
}
function PopCheckTab() {
  const [src, setSrc] = useState(null);
  const [busy, setBusy] = useState(false);
  const [res, setRes] = useState(null);
  const [err, setErr] = useState("");
  const [picker, setPicker] = useState(false);
  const [recent, setRecent] = useState([]);
  const imgRef = React.useRef(null);
  const runAnalyze = () => {
    const img = imgRef.current;
    if (!img || !img.complete || !img.naturalWidth) {
      setErr("画像の読み込みが終わっていません。少し待ってから再度お試しください。");
      return;
    }
    setBusy(true);
    setErr("");
    setTimeout(() => {
      try {
        const m = popcheckAnalyze(img);
        const j = popcheckJudge(m);
        setRes({
          m,
          j
        });
      } catch (e) {
        console.error(e);
        setErr("解析に失敗しました。画像形式が未対応（HEICなど）の可能性があります。JPEG/PNGでお試しください。");
      } finally {
        setBusy(false);
      }
    }, 60);
  };
  const onFile = e => {
    const f = e.target.files && e.target.files[0];
    if (!f) return;
    setRes(null);
    setErr("");
    setSrc(URL.createObjectURL(f));
  };
  const openPicker = async () => {
    setPicker(true);
    if (!recent.length) {
      try {
        const d = await api.listActive();
        setRecent(d.slice(0, 12));
      } catch (e) {}
    }
  };
  const barColor = v => v >= 70 ? "#2f6fb0" : v >= 45 ? "#C7892B" : "#b3261e";
  const Row = ({
    label,
    level,
    score,
    comment
  }) => /*#__PURE__*/React.createElement("div", {
    style: {
      marginBottom: 11
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      alignItems: "center",
      gap: 8
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 12.5,
      fontWeight: 900,
      color: "var(--ink)",
      width: 78,
      flexShrink: 0
    }
  }, label), /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 11,
      fontWeight: 800,
      color: "var(--soft-text)",
      background: "var(--soft)",
      borderRadius: 6,
      padding: "1px 7px",
      flexShrink: 0
    }
  }, level), /*#__PURE__*/React.createElement("div", {
    style: {
      flex: 1,
      height: 6,
      background: "var(--chip)",
      borderRadius: 3,
      overflow: "hidden"
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      width: `${score}%`,
      height: "100%",
      background: barColor(score),
      borderRadius: 3,
      transition: "width .5s ease"
    }
  })), /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 11,
      fontWeight: 800,
      color: "var(--sub)",
      width: 26,
      textAlign: "right",
      flexShrink: 0
    }
  }, score)), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 11.5,
      color: "var(--text)",
      lineHeight: 1.6,
      marginTop: 3,
      paddingLeft: 2
    }
  }, comment));
  return /*#__PURE__*/React.createElement("div", {
    className: "min-vh",
    style: {
      background: "var(--bg)"
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      background: "linear-gradient(180deg,#e7f1fa,#d3e5f4)",
      padding: "calc(env(safe-area-inset-top) + 20px) 16px 22px"
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      maxWidth: 600,
      margin: "0 auto"
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      color: "#1d3a57",
      fontSize: 18,
      fontWeight: 900
    }
  }, "POP診断"), /*#__PURE__*/React.createElement("div", {
    style: {
      color: "rgba(29,58,87,0.72)",
      fontSize: 12,
      marginTop: 2
    }
  }, "色・明るさ・情報量・余白を自動チェック。画像は外部に送信されません"))), /*#__PURE__*/React.createElement("div", {
    style: {
      maxWidth: 600,
      margin: "0 auto",
      padding: "16px 16px 120px"
    }
  }, /*#__PURE__*/React.createElement("div", {
    className: "wcard"
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      gap: 8
    }
  }, /*#__PURE__*/React.createElement("label", {
    style: {
      flex: 1,
      display: "block",
      textAlign: "center",
      border: "1.5px dashed var(--line)",
      borderRadius: 11,
      padding: "14px 8px",
      fontSize: 13,
      fontWeight: 800,
      color: "var(--text)",
      cursor: "pointer",
      background: "var(--bg)"
    }
  }, "📷 画像を選ぶ", /*#__PURE__*/React.createElement("input", {
    type: "file",
    accept: "image/*",
    onChange: onFile,
    style: {
      display: "none"
    }
  })), /*#__PURE__*/React.createElement("button", {
    onClick: openPicker,
    style: {
      flex: 1,
      border: "1.5px solid var(--line)",
      background: "#fff",
      borderRadius: 11,
      fontSize: 13,
      fontWeight: 800,
      color: "var(--text)",
      cursor: "pointer"
    }
  }, "🗂 最近のPOPから")), picker && /*#__PURE__*/React.createElement("div", {
    style: {
      display: "grid",
      gridTemplateColumns: "repeat(4,1fr)",
      gap: 6,
      marginTop: 10
    }
  }, recent.length === 0 ? /*#__PURE__*/React.createElement("div", {
    style: {
      gridColumn: "1/-1",
      fontSize: 12,
      color: "var(--faint)",
      textAlign: "center",
      padding: "10px 0"
    }
  }, "読み込み中…") : recent.map(pp => /*#__PURE__*/React.createElement("img", {
    key: pp.id,
    src: pp.image_url,
    onClick: () => {
      setRes(null);
      setErr("");
      setSrc(pp.image_url);
      setPicker(false);
    },
    style: {
      width: "100%",
      aspectRatio: "1/1",
      objectFit: "cover",
      borderRadius: 8,
      cursor: "pointer",
      border: "1px solid var(--line)"
    }
  })))), src && /*#__PURE__*/React.createElement("div", {
    className: "wcard",
    style: {
      textAlign: "center"
    }
  }, /*#__PURE__*/React.createElement("img", {
    ref: imgRef,
    src: src,
    crossOrigin: "anonymous",
    onError: () => setErr("画像を読み込めませんでした。形式が未対応（HEICなど）の可能性があります。"),
    style: {
      maxWidth: "100%",
      maxHeight: 260,
      borderRadius: 10,
      border: "1px solid var(--line)"
    }
  }), /*#__PURE__*/React.createElement("button", {
    onClick: runAnalyze,
    disabled: busy,
    style: {
      display: "block",
      width: "100%",
      marginTop: 11,
      border: "none",
      background: busy ? "#f0b48a" : "var(--primary)",
      color: "#fff",
      borderRadius: 11,
      padding: "12px",
      fontSize: 14.5,
      fontWeight: 900,
      cursor: busy ? "default" : "pointer"
    }
  }, busy ? "解析中…" : "🩺 このPOPを診断する")), err && /*#__PURE__*/React.createElement("div", {
    style: {
      background: "#fdeaea",
      border: "1px solid #f3c1bd",
      color: "#b3261e",
      borderRadius: 11,
      padding: "11px 13px",
      fontSize: 12.5,
      fontWeight: 700,
      marginBottom: 12
    }
  }, err), res && /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("div", {
    className: "wcard",
    style: {
      textAlign: "center"
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      gap: 14
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      width: 74,
      height: 74,
      borderRadius: "50%",
      background: res.j.total >= 70 ? "#2f6fb0" : res.j.total >= 55 ? "#C7892B" : "#b3261e",
      color: "#fff",
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      flexShrink: 0
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 27,
      fontWeight: 900,
      lineHeight: 1
    }
  }, res.j.grade), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 11,
      fontWeight: 800
    }
  }, res.j.total, "点")), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 12.5,
      color: "var(--text)",
      lineHeight: 1.75,
      textAlign: "left",
      fontWeight: 700
    }
  }, res.j.summary)), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      justifyContent: "center",
      gap: 6,
      marginTop: 12
    }
  }, res.m.dominant.map(c => /*#__PURE__*/React.createElement("div", {
    key: c,
    style: {
      textAlign: "center"
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      width: 34,
      height: 34,
      borderRadius: 9,
      background: c,
      border: "1px solid var(--line)"
    }
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 8.5,
      color: "var(--faint)",
      marginTop: 2
    }
  }, c)))), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 10.5,
      color: "var(--sub)",
      marginTop: 6
    }
  }, "主要カラー\u3000／\u3000推定色数：", res.m.colorCount, "色")), /*#__PURE__*/React.createElement("div", {
    className: "wcard"
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 13.5,
      fontWeight: 900,
      color: "var(--ink)",
      marginBottom: 12
    }
  }, "診断項目"), /*#__PURE__*/React.createElement(Row, {
    label: "色数",
    level: res.j.lv.color,
    score: res.m.colorCount <= 6 ? 100 - (res.m.colorCount - 3) * 8 : Math.max(20, 100 - (res.m.colorCount - 6) * 15),
    comment: res.j.cm.color
  }), /*#__PURE__*/React.createElement(Row, {
    label: "明るさ",
    level: res.j.lv.brightness,
    score: res.m.brightness,
    comment: res.j.cm.brightness
  }), /*#__PURE__*/React.createElement(Row, {
    label: "彩度",
    level: res.j.lv.saturation,
    score: res.m.saturation,
    comment: res.j.cm.saturation
  }), /*#__PURE__*/React.createElement(Row, {
    label: "コントラスト",
    level: res.j.lv.contrast,
    score: res.m.contrast,
    comment: res.j.cm.contrast
  }), /*#__PURE__*/React.createElement(Row, {
    label: "情報量",
    level: res.j.lv.clutter,
    score: res.m.clutter,
    comment: res.j.cm.clutter
  }), /*#__PURE__*/React.createElement(Row, {
    label: "余白",
    level: res.j.lv.margin,
    score: res.m.marginScore,
    comment: res.j.cm.margin
  })), /*#__PURE__*/React.createElement("div", {
    className: "wcard"
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 13,
      fontWeight: 900,
      color: "#2f6fb0",
      marginBottom: 7
    }
  }, "👍 良い点"), res.j.good.map((g, i) => /*#__PURE__*/React.createElement("div", {
    key: i,
    style: {
      fontSize: 12.5,
      color: "var(--text)",
      lineHeight: 1.9
    }
  }, "・", g)), /*#__PURE__*/React.createElement("div", {
    style: {
      height: 1,
      background: "var(--line)",
      margin: "10px 0"
    }
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 13,
      fontWeight: 900,
      color: "var(--primary)",
      marginBottom: 7
    }
  }, "🔧 改善案"), res.j.imp.map((g, i) => /*#__PURE__*/React.createElement("div", {
    key: i,
    style: {
      fontSize: 12.5,
      color: "var(--text)",
      lineHeight: 1.9
    }
  }, "・", g))), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 11,
      color: "var(--faint)",
      textAlign: "center",
      lineHeight: 1.7
    }
  }, "診断は機械的な目安です。最後は売場での見え方を優先してください。"))));
}
;
Object.assign(window, {
  POPCHECK_TH,
  PopCheckTab,
  popcheckAnalyze,
  popcheckJudge
});