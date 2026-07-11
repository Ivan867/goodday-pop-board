/* GoodDay 鮮魚共有 — 11-tab-check-fish （自動分割・window共有） */
var { useState, useEffect, useCallback, useRef } = React;

const POPCHECK_TH = {  // 閾値（あとで調整しやすいよう定数化）
  RESIZE: 480,          // 解析用の最大辺
  SAMPLE_STEP: 4,       // KMeansのサンプリング間隔（px）
  KMEANS_K: 8, KMEANS_ITER: 10, COLOR_MIN_SHARE: 0.05,
  EDGE_MAG: 60,         // エッジ判定のしきい値
  MARGIN_BAND: 0.08,    // 余白判定：端から8%
  BRIGHT_IDEAL: 62, CONTRAST_LO: 40, CONTRAST_HI: 78, SAT_HI: 60, CLUTTER_HI: 45,
};

function popcheckAnalyze(img) {
  const T = POPCHECK_TH;
  const scale = Math.min(1, T.RESIZE / Math.max(img.naturalWidth, img.naturalHeight));
  const w = Math.max(1, Math.round(img.naturalWidth * scale));
  const h = Math.max(1, Math.round(img.naturalHeight * scale));
  const cv = document.createElement("canvas"); cv.width = w; cv.height = h;
  const ctx = cv.getContext("2d", { willReadFrequently: true });
  ctx.drawImage(img, 0, 0, w, h);
  const d = ctx.getImageData(0, 0, w, h).data;
  const N = w * h;

  // --- 輝度・彩度 ---
  const luma = new Float32Array(N);
  let sumL = 0, sumS = 0;
  for (let i = 0; i < N; i++) {
    const r = d[i*4], g = d[i*4+1], b = d[i*4+2];
    const l = 0.299*r + 0.587*g + 0.114*b;
    luma[i] = l; sumL += l;
    const mx = Math.max(r,g,b), mn = Math.min(r,g,b);
    sumS += mx === 0 ? 0 : (mx - mn) / mx;
  }
  const meanL = sumL / N;
  let varL = 0; for (let i = 0; i < N; i++) varL += (luma[i]-meanL)*(luma[i]-meanL);
  const stdL = Math.sqrt(varL / N);
  const brightness = Math.round(meanL / 255 * 100);
  const saturation = Math.round(sumS / N * 100);
  const contrast = Math.round(Math.min(100, stdL / 80 * 100));

  // --- エッジ（Sobel） ---
  const edge = new Uint8Array(N);
  let edgeCount = 0;
  for (let y = 1; y < h-1; y++) for (let x = 1; x < w-1; x++) {
    const i = y*w+x;
    const gx = -luma[i-w-1] - 2*luma[i-1] - luma[i+w-1] + luma[i-w+1] + 2*luma[i+1] + luma[i+w+1];
    const gy = -luma[i-w-1] - 2*luma[i-w] - luma[i-w+1] + luma[i+w-1] + 2*luma[i+w] + luma[i+w+1];
    if (Math.sqrt(gx*gx + gy*gy) > T.EDGE_MAG) { edge[i] = 1; edgeCount++; }
  }
  const clutter = Math.round(Math.min(100, edgeCount / N * 100 * 2.4));

  // --- 余白（端バンドのエッジ密度） ---
  const band = Math.max(2, Math.round(Math.min(w, h) * T.MARGIN_BAND));
  const bandDensity = (x0, y0, x1, y1) => {
    let c = 0, n = 0;
    for (let y = y0; y < y1; y++) for (let x = x0; x < x1; x++) { n++; if (edge[y*w+x]) c++; }
    return n ? c / n : 0;
  };
  const eTop = bandDensity(0, 0, w, band);
  const eBottom = bandDensity(0, h-band, w, h);
  const eLeft = bandDensity(0, 0, band, h);
  const eRight = bandDensity(w-band, 0, w, h);
  const worst = Math.max(eTop, eBottom, eLeft, eRight);
  const marginScore = Math.round(Math.max(0, 100 - worst * 100 * 2.2));

  // --- KMeans 主要色 ---
  const samples = [];
  for (let y = 0; y < h; y += T.SAMPLE_STEP) for (let x = 0; x < w; x += T.SAMPLE_STEP) {
    const i = (y*w+x)*4; samples.push([d[i], d[i+1], d[i+2]]);
  }
  let cents = [];
  for (let k = 0; k < T.KMEANS_K; k++) cents.push(samples[Math.floor(samples.length * (k + 0.5) / T.KMEANS_K)].slice());
  let asn = new Array(samples.length).fill(0);
  for (let it = 0; it < T.KMEANS_ITER; it++) {
    for (let si = 0; si < samples.length; si++) {
      let bd = 1e12, bi = 0;
      for (let k = 0; k < cents.length; k++) {
        const dx = samples[si][0]-cents[k][0], dy = samples[si][1]-cents[k][1], dz = samples[si][2]-cents[k][2];
        const dist = dx*dx + dy*dy + dz*dz;
        if (dist < bd) { bd = dist; bi = k; }
      }
      asn[si] = bi;
    }
    const acc = cents.map(() => [0,0,0,0]);
    for (let si = 0; si < samples.length; si++) { const a = acc[asn[si]]; a[0]+=samples[si][0]; a[1]+=samples[si][1]; a[2]+=samples[si][2]; a[3]++; }
    cents = acc.map((a,k) => a[3] ? [a[0]/a[3], a[1]/a[3], a[2]/a[3]] : cents[k]);
  }
  const shares = cents.map((c,k) => ({ c, n: asn.filter(a => a === k).length / samples.length })).sort((a,b) => b.n - a.n);
  const colorCount = shares.filter(x => x.n >= T.COLOR_MIN_SHARE).length;
  const hex = v => "#" + [0,1,2].map(j => Math.round(v[j]).toString(16).padStart(2,"0")).join("");
  const dominant = shares.slice(0, 5).map(x => hex(x.c));

  return { brightness, saturation, contrast, clutter, marginScore, colorCount, dominant,
           edges: { top: eTop, bottom: eBottom, left: eLeft, right: eRight } };
}

function popcheckJudge(m) {
  const T = POPCHECK_TH;
  const lv = {}, cm = {};
  // 色数
  lv.color = m.colorCount <= 4 ? "少なめ" : m.colorCount <= 6 ? "適度" : "やや多い";
  cm.color = m.colorCount <= 4 ? "色数が絞られていて、まとまりのある印象です。"
    : m.colorCount <= 6 ? "色数は適度で、まとまりがあります。"
    : "主要色が多く、少しにぎやかに見える可能性があります。使う色を2〜3色に絞ると締まります。";
  // 明るさ
  lv.brightness = m.brightness >= 78 ? "かなり明るい" : m.brightness >= 55 ? "明るい" : m.brightness >= 35 ? "適度" : "暗め";
  cm.brightness = m.brightness >= 78 ? "かなり明るいため、白背景や黄色部分が眩しく見える可能性があります。"
    : m.brightness >= 55 ? "全体的に明るく、売場で目立ちやすいです。"
    : m.brightness >= 35 ? "明るさは落ち着いていて、上品な印象です。"
    : "やや暗めなので、商品名やメインコピーの視認性に注意してください。";
  // 彩度
  lv.saturation = m.saturation >= T.SAT_HI ? "高め" : m.saturation >= 30 ? "適度" : "落ち着き";
  cm.saturation = m.saturation >= 75 ? "彩度が高すぎるため、派手さや眩しさが出る可能性があります。"
    : m.saturation >= T.SAT_HI ? "彩度が高く、かなり目を引くPOPです。"
    : m.saturation >= 30 ? "彩度のバランスが良く、自然に目に入ります。"
    : "彩度は落ち着いており、和モダンな印象に向いています。";
  // コントラスト
  lv.contrast = m.contrast >= T.CONTRAST_HI ? "強め" : m.contrast >= T.CONTRAST_LO ? "適度" : "弱め";
  cm.contrast = m.contrast >= T.CONTRAST_HI ? "コントラストが強すぎるため、全体が少し騒がしく見える可能性があります。"
    : m.contrast >= T.CONTRAST_LO ? "コントラストがしっかりあり、見出しが目立ちやすい構成です。"
    : "コントラストが弱めなので、文字と背景の差を強くすると見やすくなります。";
  // 情報量
  lv.clutter = m.clutter >= 65 ? "多い" : m.clutter >= T.CLUTTER_HI ? "やや多い" : "適度";
  cm.clutter = m.clutter >= 65 ? "背景・イラスト・文字要素が多く、売場では少し読みにくい可能性があります。"
    : m.clutter >= T.CLUTTER_HI ? "細かい要素が多く、やや情報量が多いPOPです。"
    : "情報量は適度で、見やすい構成です。";
  // 余白
  lv.margin = m.marginScore >= 65 ? "十分" : m.marginScore >= 45 ? "やや狭い" : "狭い";
  const worstSide = Object.entries(m.edges).sort((a,b) => b[1]-a[1])[0][0];
  const sideJa = { top:"上", bottom:"下", left:"左", right:"右" }[worstSide];
  cm.margin = m.marginScore >= 65 ? "余白は比較的安定しており、印刷時にも安心です。"
    : m.marginScore >= 45 ? `${sideJa}端に要素が近く、印刷時に少し窮屈に見える可能性があります。`
    : `${sideJa}端をはじめ要素が端に詰まっていて、窮屈に見える可能性があります。`;

  // 個別の良さスコア（0-100）
  const gBright = Math.max(0, 100 - Math.abs(m.brightness - T.BRIGHT_IDEAL) * 1.6);
  const gSat = m.saturation <= T.SAT_HI ? 100 : Math.max(0, 100 - (m.saturation - T.SAT_HI) * 2.0);
  const gCon = (m.contrast >= T.CONTRAST_LO && m.contrast <= T.CONTRAST_HI) ? 100 : Math.max(0, 100 - Math.min(Math.abs(m.contrast - T.CONTRAST_LO), Math.abs(m.contrast - T.CONTRAST_HI)) * 1.8);
  const gClut = m.clutter <= T.CLUTTER_HI ? 100 : Math.max(0, 100 - (m.clutter - T.CLUTTER_HI) * 1.8);
  const gCol = m.colorCount <= 6 ? 100 : Math.max(0, 100 - (m.colorCount - 6) * 12);
  const total = Math.round(gBright*0.15 + gSat*0.2 + gCon*0.15 + gClut*0.25 + m.marginScore*0.1 + gCol*0.15);
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

  const summary = total >= 85 ? "色数・明るさ・余白のバランスが良く、売場で使いやすいPOPです。"
    : total >= 70 ? "全体的に目を引くPOPですが、" + (m.saturation >= T.SAT_HI ? "彩度" : "一部の要素") + (m.clutter >= T.CLUTTER_HI ? "と情報量がやや高めです。" : "がやや強めです。") + "少し整えるとさらに見やすくなります。"
    : total >= 55 ? "見出しは目立ちますが、要素が多めでややごちゃついて見える可能性があります。装飾を減らし余白を作ると改善します。"
    : "売場で読みにくくなる要素が重なっています。色数・情報量・余白を見直すことをおすすめします。";

  return { total, grade, summary, lv, cm, good, imp };
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
    if (!img || !img.complete || !img.naturalWidth) { setErr("画像の読み込みが終わっていません。少し待ってから再度お試しください。"); return; }
    setBusy(true); setErr("");
    setTimeout(() => {
      try {
        const m = popcheckAnalyze(img);
        const j = popcheckJudge(m);
        setRes({ m, j });
      } catch(e) {
        console.error(e);
        setErr("解析に失敗しました。画像形式が未対応（HEICなど）の可能性があります。JPEG/PNGでお試しください。");
      } finally { setBusy(false); }
    }, 60);
  };

  const onFile = (e) => {
    const f = e.target.files && e.target.files[0];
    if (!f) return;
    setRes(null); setErr("");
    setSrc(URL.createObjectURL(f));
  };

  const openPicker = async () => {
    setPicker(true);
    if (!recent.length) {
      try { const d = await api.listActive(); setRecent(d.slice(0, 12)); } catch(e) {}
    }
  };

  const barColor = (v) => v >= 70 ? "#2f6fb0" : v >= 45 ? "#C7892B" : "#b3261e";
  const Row = ({ label, level, score, comment }) => (
    <div style={{ marginBottom:11 }}>
      <div style={{ display:"flex", alignItems:"center", gap:8 }}>
        <span style={{ fontSize:12.5, fontWeight:900, color:"var(--ink)", width:78, flexShrink:0 }}>{label}</span>
        <span style={{ fontSize:11, fontWeight:800, color:"var(--soft-text)", background:"var(--soft)", borderRadius:6, padding:"1px 7px", flexShrink:0 }}>{level}</span>
        <div style={{ flex:1, height:6, background:"var(--chip)", borderRadius:3, overflow:"hidden" }}>
          <div style={{ width:`${score}%`, height:"100%", background:barColor(score), borderRadius:3, transition:"width .5s ease" }} />
        </div>
        <span style={{ fontSize:11, fontWeight:800, color:"var(--sub)", width:26, textAlign:"right", flexShrink:0 }}>{score}</span>
      </div>
      <div style={{ fontSize:11.5, color:"var(--text)", lineHeight:1.6, marginTop:3, paddingLeft:2 }}>{comment}</div>
    </div>
  );

  return (
    <div className="min-vh" style={{ background:"var(--bg)" }}>
      <div style={{ background:"linear-gradient(180deg,#e7f1fa,#d3e5f4)", padding:"calc(env(safe-area-inset-top) + 20px) 16px 22px" }}>
        <div style={{ maxWidth:600, margin:"0 auto" }}>
          <div style={{ color:"#1d3a57", fontSize:18, fontWeight:900 }}>POP診断</div>
          <div style={{ color:"rgba(29,58,87,0.72)", fontSize:12, marginTop:2 }}>色・明るさ・情報量・余白を自動チェック。画像は外部に送信されません</div>
        </div>
      </div>
      <div style={{ maxWidth:600, margin:"0 auto", padding:"16px 16px 120px" }}>

        <div className="wcard">
          <div style={{ display:"flex", gap:8 }}>
            <label style={{ flex:1, display:"block", textAlign:"center", border:"1.5px dashed var(--line)", borderRadius:11, padding:"14px 8px", fontSize:13, fontWeight:800, color:"var(--text)", cursor:"pointer", background:"var(--bg)" }}>
              📷 画像を選ぶ
              <input type="file" accept="image/*" onChange={onFile} style={{ display:"none" }} />
            </label>
            <button onClick={openPicker} style={{ flex:1, border:"1.5px solid var(--line)", background:"#fff", borderRadius:11, fontSize:13, fontWeight:800, color:"var(--text)", cursor:"pointer" }}>🗂 最近のPOPから</button>
          </div>
          {picker && (
            <div style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:6, marginTop:10 }}>
              {recent.length === 0 ? <div style={{ gridColumn:"1/-1", fontSize:12, color:"var(--faint)", textAlign:"center", padding:"10px 0" }}>読み込み中…</div>
                : recent.map(pp => (
                  <img key={pp.id} src={pp.image_url} onClick={() => { setRes(null); setErr(""); setSrc(pp.image_url); setPicker(false); }}
                    style={{ width:"100%", aspectRatio:"1/1", objectFit:"cover", borderRadius:8, cursor:"pointer", border:"1px solid var(--line)" }} />
                ))}
            </div>
          )}
        </div>

        {src && (
          <div className="wcard" style={{ textAlign:"center" }}>
            <img ref={imgRef} src={src} crossOrigin="anonymous"
              onError={() => setErr("画像を読み込めませんでした。形式が未対応（HEICなど）の可能性があります。")}
              style={{ maxWidth:"100%", maxHeight:260, borderRadius:10, border:"1px solid var(--line)" }} />
            <button onClick={runAnalyze} disabled={busy}
              style={{ display:"block", width:"100%", marginTop:11, border:"none", background: busy ? "#f0b48a" : "var(--primary)", color:"#fff", borderRadius:11, padding:"12px", fontSize:14.5, fontWeight:900, cursor: busy ? "default" : "pointer" }}>
              {busy ? "解析中…" : "🩺 このPOPを診断する"}
            </button>
          </div>
        )}

        {err && <div style={{ background:"#fdeaea", border:"1px solid #f3c1bd", color:"#b3261e", borderRadius:11, padding:"11px 13px", fontSize:12.5, fontWeight:700, marginBottom:12 }}>{err}</div>}

        {res && (
          <>
            <div className="wcard" style={{ textAlign:"center" }}>
              <div style={{ display:"flex", alignItems:"center", justifyContent:"center", gap:14 }}>
                <div style={{ width:74, height:74, borderRadius:"50%", background: res.j.total >= 70 ? "#2f6fb0" : res.j.total >= 55 ? "#C7892B" : "#b3261e", color:"#fff", display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", flexShrink:0 }}>
                  <div style={{ fontSize:27, fontWeight:900, lineHeight:1 }}>{res.j.grade}</div>
                  <div style={{ fontSize:11, fontWeight:800 }}>{res.j.total}点</div>
                </div>
                <div style={{ fontSize:12.5, color:"var(--text)", lineHeight:1.75, textAlign:"left", fontWeight:700 }}>{res.j.summary}</div>
              </div>
              <div style={{ display:"flex", justifyContent:"center", gap:6, marginTop:12 }}>
                {res.m.dominant.map(c => (
                  <div key={c} style={{ textAlign:"center" }}>
                    <div style={{ width:34, height:34, borderRadius:9, background:c, border:"1px solid var(--line)" }} />
                    <div style={{ fontSize:8.5, color:"var(--faint)", marginTop:2 }}>{c}</div>
                  </div>
                ))}
              </div>
              <div style={{ fontSize:10.5, color:"var(--sub)", marginTop:6 }}>主要カラー　／　推定色数：{res.m.colorCount}色</div>
            </div>

            <div className="wcard">
              <div style={{ fontSize:13.5, fontWeight:900, color:"var(--ink)", marginBottom:12 }}>診断項目</div>
              <Row label="色数" level={res.j.lv.color} score={res.m.colorCount <= 6 ? 100 - (res.m.colorCount-3)*8 : Math.max(20, 100-(res.m.colorCount-6)*15)} comment={res.j.cm.color} />
              <Row label="明るさ" level={res.j.lv.brightness} score={res.m.brightness} comment={res.j.cm.brightness} />
              <Row label="彩度" level={res.j.lv.saturation} score={res.m.saturation} comment={res.j.cm.saturation} />
              <Row label="コントラスト" level={res.j.lv.contrast} score={res.m.contrast} comment={res.j.cm.contrast} />
              <Row label="情報量" level={res.j.lv.clutter} score={res.m.clutter} comment={res.j.cm.clutter} />
              <Row label="余白" level={res.j.lv.margin} score={res.m.marginScore} comment={res.j.cm.margin} />
            </div>

            <div className="wcard">
              <div style={{ fontSize:13, fontWeight:900, color:"#2f6fb0", marginBottom:7 }}>👍 良い点</div>
              {res.j.good.map((g,i) => <div key={i} style={{ fontSize:12.5, color:"var(--text)", lineHeight:1.9 }}>・{g}</div>)}
              <div style={{ height:1, background:"var(--line)", margin:"10px 0" }} />
              <div style={{ fontSize:13, fontWeight:900, color:"var(--primary)", marginBottom:7 }}>🔧 改善案</div>
              {res.j.imp.map((g,i) => <div key={i} style={{ fontSize:12.5, color:"var(--text)", lineHeight:1.9 }}>・{g}</div>)}
            </div>
            <div style={{ fontSize:11, color:"var(--faint)", textAlign:"center", lineHeight:1.7 }}>診断は機械的な目安です。最後は売場での見え方を優先してください。</div>
          </>
        )}
      </div>
    </div>
  );
}

const FISH_DB = [
  { name:"真あじ", kana:"まあじ", months:[5,6,7,8], point:"初夏〜夏が旬の定番魚。脂と旨みのバランスが良く、山陰沖の地物は鮮度が売り。刺身・たたき・なめろうと生食提案がしやすい。", cook:"刺身／たたき／塩焼き／フライ／南蛮漬け", pop:"「山陰沖どれ 朝どれあじ」「今日はたたきで一杯」", local:"島根の定番地魚。浜田のどんちっちあじは脂の乗りで有名。" },
  { name:"鯖", kana:"さば", months:[10,11,12,1,2], point:"秋〜冬に脂が乗る。ノルウェー産は年間安定、国産秋さばは季節の目玉。しめ鯖・塩焼き・味噌煮と用途が広い。", cook:"塩焼き／味噌煮／しめ鯖／竜田揚げ", pop:"「脂のり抜群 秋さば入荷」「ごはんがすすむ味噌煮に」", local:"アニサキス対策の下処理説明があると生食系の安心感UP。" },
  { name:"ブリ", kana:"ぶり", months:[12,1,2], point:"冬の主役。寒ブリは脂の甘みが最大の訴求。切身・刺身・ぶりしゃぶ・照り焼きまで展開幅が広く、年末年始の柱。", cook:"刺身／ぶりしゃぶ／照り焼き／ぶり大根", pop:"「寒ブリ入荷！」「今夜はぶりしゃぶで温まる」", local:"山陰の冬の看板。境港の天然寒ブリは全国区の知名度。" },
  { name:"真鯛", kana:"まだい", months:[3,4,5,11,12], point:"春の桜鯛・秋の紅葉鯛。祝い事・ハレの日の魚として強く、姿売り・刺身・切身と全対応。養殖は年間安定。", cook:"刺身／塩焼き／鯛めし／カルパッチョ／あら炊き", pop:"「お祝いに姿鯛」「春の桜鯛、入荷しました」", local:"入学・卒業・節句シーズンは姿売り予約の案内が効く。" },
  { name:"マグロ", kana:"まぐろ", months:[1,2,3,4,5,6,7,8,9,10,11,12], point:"刺身売場の主役で年間需要。赤身の低脂質・高たんぱく訴求は健康志向にも合う。中トロ・ネギトロで単価と間口の両取り。", cook:"刺身／漬け丼／ネギトロ／山かけ", pop:"「本マグロ中トロ 今日だけ」「赤身は高たんぱくでヘルシー」", local:"境港は生本マグロの水揚げで有名（夏）。地元産訴求のチャンス。" },
  { name:"サーモン", kana:"さーもん", months:[1,2,3,4,5,6,7,8,9,10,11,12], point:"子どもから大人まで人気No.1級。年間安定供給で計画が立てやすい。刺身・寿司・ムニエルと洋風提案も可能。", cook:"刺身／カルパッチョ／ムニエル／ホイル焼き", pop:"「お子さまに大人気」「サーモン好き集合！」", local:"生食用アトランティックと焼き用秋鮭・銀鮭の使い分け表示が親切。" },
  { name:"白いか", kana:"しろいか", months:[6,7,8,9], point:"夏の山陰の看板イカ（ケンサキイカ）。上品な甘みとねっとり食感で、刺身の単価が取れる地物。", cook:"刺身／いかそうめん／天ぷら／一夜干し", pop:"「山陰の夏の味 白いか入荷」「甘み抜群、まずは刺身で」", local:"山陰では夏の最重要地物のひとつ。漁火漁の話題性も◎。" },
  { name:"タコ", kana:"たこ", months:[6,7,8], point:"半夏生（7/2頃）とセットで売れる夏商材。酢の物・たこ焼き・カルパッチョと用途提案がしやすい。", cook:"刺身／酢の物／たこ焼き／唐揚げ", pop:"「半夏生にはタコ」「夏バテ予防にタウリン」", local:"半夏生の由来POP（豊作祈願）を添えると売場に物語が出る。" },
  { name:"甘えび", kana:"あまえび", months:[9,10,11,12,1,2,3], point:"とろける甘さで刺身盛りの華。子どもにも人気で、寿司・海鮮丼の具としても強い。", cook:"刺身／寿司／唐揚げ（頭）／味噌汁", pop:"「とろける甘さ 甘えび」「頭は唐揚げ・味噌汁でどうぞ」", local:"日本海の秋冬の定番。頭の出汁活用まで案内するとロス削減にも。" },
  { name:"ノドグロ", kana:"のどぐろ", months:[9,10,11,12,1], point:"山陰の高級魚（アカムツ）。「白身のトロ」の一言で価値が伝わる。贈答・ハレの日・ちょっと贅沢需要に。", cook:"塩焼き／煮付け／炙り刺身／一夜干し", pop:"「白身のトロ ノドグロ」「特別な日の一尾に」", local:"山陰の看板高級魚。観光客・帰省客への訴求も強い。" },
  { name:"カレイ", kana:"かれい", months:[10,11,12,1,2,3], point:"煮付けの王道で年配客の支持が厚い。エテガレイ（笹がれい）の一夜干しは山陰土産の定番。", cook:"煮付け／唐揚げ／一夜干し／ムニエル", pop:"「今夜は煮付けでほっこり」「山陰名物 えてがれい干物」", local:"子持ちガレイの季節（冬〜春）は煮付け需要のピーク。" },
  { name:"宍道湖しじみ", kana:"しじみ", months:[1,2,6,7], point:"島根が誇る全国ブランド。土用しじみ（夏）と寒しじみ（冬）の年2回の旬。肝臓に優しいオルニチン訴求が定番。", cook:"味噌汁／酒蒸し／しぐれ煮", pop:"「宍道湖産 寒しじみ」「飲んだ翌朝に、しじみ汁」", local:"地元最強の名産。砂抜き方法・冷凍で旨み増の豆知識POPが効く。" },
  { name:"松葉ガニ", kana:"まつばがに", months:[11,12,1,2,3], point:"山陰の冬の王様（ズワイガニ雄）。解禁日（11月上旬）は年間最大級の売場イベント。雌のセコガニは地元通向け。", cook:"茹で／焼きガニ／カニ鍋／カニ刺し", pop:"「松葉ガニ解禁！」「冬の王様、入荷しました」", local:"解禁日カウントダウンPOPで期待感づくり。タグ付きは産地証明。" },
  { name:"岩がき", kana:"いわがき", months:[6,7,8], point:"夏が旬の「夏がき」。冬の真がきとの違い（大ぶり・クリーミー・生食）を伝えると価値が上がる。", cook:"生食／蒸しがき／フライ", pop:"「海のミルク 夏の岩がき」「隠岐の岩がき、入荷」", local:"隠岐・島根沿岸は岩がきの好産地。海洋深層水浄化などの安心訴求も。" },
  { name:"うなぎ", kana:"うなぎ", months:[7,8], point:"土用の丑が年間最大の山。予約・当日・翌日以降の3段構えで売り切る。国産・産地表示が単価の決め手。", cook:"蒲焼き／うな丼／ひつまぶし／う巻き", pop:"「土用の丑はうなぎで精をつける」「国産うなぎ 予約承り中」", local:"丑の日前後は保冷・温めなおし方法のPOPが親切。" },
  { name:"さわら", kana:"さわら", months:[12,1,2,3,4,5], point:"字は「春の魚」だが、山陰・関西で本当に旨いのは脂ののった冬の寒鰆。柔らかい身は焼き物向きで、西京焼き・炙り刺身は単価が取れる。", cook:"西京焼き／塩焼き／炙り刺身／竜田揚げ", pop:"「脂のり最高 寒鰆入荷」「今夜は西京焼きでごちそうに」", local:"日本海の寒鰆は冬のごちそう枠。切身の厚さで価値が伝わる。" },
  { name:"いさき", kana:"いさき", months:[5,6,7], point:"初夏〜梅雨が旬の「梅雨いさき」。産卵前の脂がのり、白身なのにコクがある。刺身・塩焼きどちらも強い初夏の主役。", cook:"刺身／塩焼き／なめろう／カルパッチョ", pop:"「梅雨いさき、今だけの脂」「初夏の白身の王様」", local:"初夏の山陰の定番。皮目を炙ると香りが立つと一言添えて。" },
  { name:"かます", kana:"かます", months:[9,10,11], point:"秋が旬。「カマスの焼き食い一升飯」と言われる焼き物の名手。水分が多い魚なので一夜干しにすると旨みが凝縮。", cook:"塩焼き／一夜干し／フライ／炙り刺身", pop:"「焼き食い一升飯 秋かます」「干物でうまみ凝縮」", local:"秋の焼き魚提案の柱。干物加工で日持ちとロス対策も。" },
  { name:"スルメイカ", kana:"するめいか", months:[6,7,8,9], point:"夏〜秋の大衆イカの代表。丸ごと1杯の値頃感が武器で、刺身から煮付け・イカ飯まで捨てるところなし。", cook:"刺身／煮付け／イカ飯／沖漬け／塩辛", pop:"「まるごと1杯お値打ち」「ワタまで美味しいスルメイカ」", local:"白いか（高級）との使い分けで売場に幅が出る。" },
  { name:"飛魚（あご）", kana:"とびうお あご", months:[6,7,8], point:"島根県の「県の魚」。夏が旬で、刺身・すり身・焼きと万能。あご野焼き・あごだしは島根の食文化そのもの。", cook:"刺身／たたき／すり身汁／塩焼き", pop:"「島根県の魚 あご入荷」「あごだしの旨さは飛魚から」", local:"あご野焼きは島根名物。県の魚であることをPOPで誇っていい。" },
  { name:"白カレイ", kana:"しろがれい", months:[11,12,1,2], point:"山陰の冬の食卓を支える上品な白身ガレイ。煮付け・干物の定番で、年配のお客様の指名買いが多い。", cook:"煮付け／一夜干し／唐揚げ／塩焼き", pop:"「山陰の冬の味 白がれい」「ふっくら煮付けで」", local:"山陰では干物・煮付け文化の中心。地物表記が効く。" },
  { name:"赤カレイ", kana:"あかがれい", months:[11,12,1,2,3], point:"冬の子持ち赤がれいの煮付けは日本海側の冬のごちそう。卵の食べ応えで満足感が高く、単価も取りやすい。", cook:"煮付け（子持ち）／唐揚げ／塩焼き", pop:"「子持ち赤がれい入荷」「冬の煮付けはこれで決まり」", local:"子持ちシーズンは売場の顔。卵の入り具合が価値。" },
  { name:"カラスガレイ", kana:"からすがれい", months:[1,2,3,4,5,6,7,8,9,10,11,12], point:"輸入の脂がのった切身カレイで通年安定。骨離れが良く柔らかいので、煮付け・西京漬けの加工向き。価格も安定。", cook:"煮付け／西京漬け／ムニエル／照り焼き", pop:"「とろける脂 カラスガレイ」「骨離れ良く食べやすい」", local:"地物ガレイと輸入切身の2本立てで価格帯をカバー。" },
  { name:"カツオ", kana:"かつお", months:[4,5,9,10], point:"春の初鰹はさっぱり、秋の戻り鰹は脂しっかりの2度旬。たたき＋にんにく・薬味のセット販売が鉄板。", cook:"たたき／刺身／漬け丼／竜田揚げ", pop:"「目には青葉 初鰹」「脂のり抜群 戻り鰹」", local:"薬味（にんにく・生姜・ねぎ）の関連陳列で客単価UP。" },
  { name:"ヒラメ", kana:"ひらめ", months:[11,12,1,2], point:"冬の寒平目は白身の最高峰クラス。刺身・昆布締めの上品な旨みと、えんがわの希少価値で特別感を演出できる。", cook:"刺身／昆布締め／えんがわ／ムニエル", pop:"「寒平目、旨みの頂点」「えんがわ入り刺身盛り」", local:"年末年始の刺身盛りの格上げ役。天然表記は強い。" },
  { name:"石鯛", kana:"いしだい", months:[6,7,8], point:"磯の王者と呼ばれる夏の高級魚。歯ごたえある甘い白身で、刺身の食べ比べ提案に向く。入荷したら目玉に。", cook:"刺身／薄造り／塩焼き／あら汁", pop:"「磯の王者 石鯛入荷」「コリコリ甘い夏の白身」", local:"数が出る魚ではないので「本日限り」の希少訴求で。" },
  { name:"メバル", kana:"めばる", months:[3,4,5], point:"春告魚（はるつげうお）。煮付けにして旨い魚の代表格で、春の売場の空気を作る。ふっくらした身離れの良さが持ち味。", cook:"煮付け／塩焼き／唐揚げ／アクアパッツァ", pop:"「春告魚 めばる入荷」「今夜はふっくら煮付けで」", local:"「春を告げる魚」の一言で季節感が一気に出る。" },
  { name:"キカナ（アオハタ）", kana:"きかな あおはた", months:[6,7,8,9], point:"島根県東部・鳥取県西部での呼び名。ハタ類らしい上品で甘い白身は鍋・煮付け・刺身と万能。地物の顔になる魚。", cook:"煮付け／鍋／刺身／塩焼き", pop:"「地物キカナ（アオハタ）入荷」「ハタの旨みをお値打ちに」", local:"「キカナ」の呼び名自体が地元の言葉。呼び名POPで会話が生まれる。" },
  { name:"連子鯛", kana:"れんこだい", months:[9,10,11,12], point:"標準和名キダイ。小ぶりで手頃な「もうひとつの鯛」。塩焼き・姿焼きで祝い需要にも応えられるコスパの良さが武器。", cook:"塩焼き／姿焼き／煮付け／鯛めし", pop:"「お手頃サイズの祝い鯛」「連子鯛の塩焼きで晩酌」", local:"日本海側で水揚げが多い。真鯛より気軽な鯛として提案。" },
  { name:"チヌ（クロダイ）", kana:"ちぬ くろだい", months:[4,5,6], point:"春の乗っ込みシーズンが食べどき。真鯛に劣らぬ白身で価格は手頃。下処理（血抜き・皮目）をきちんと伝えると評価が上がる。", cook:"刺身／洗い／塩焼き／煮付け", pop:"「春のちぬ、お値打ち白身」「洗いでさっぱりと」", local:"釣り人に馴染み深い魚。地物・天然表記との相性が良い。" },
  { name:"シイラ", kana:"しいら", months:[7,8,9], point:"夏の魚。ハワイでは高級魚「マヒマヒ」。クセのない身はムニエル・フライで化ける。鮮度落ちが早いので回転勝負。", cook:"ムニエル／フライ／竜田揚げ／照り焼き", pop:"「ハワイの高級魚マヒマヒ」「フライでふわふわ」", local:"洋風提案が刺さる若い層向け。切身加工で買いやすく。" },
  { name:"アトランティックサーモン", kana:"あとらんてぃっくさーもん", months:[1,2,3,4,5,6,7,8,9,10,11,12], point:"ノルウェー等の海面養殖で、生食用サーモンの主力。脂のりと品質が年間ブレないので刺身・寿司の計画が立てやすい。", cook:"刺身／寿司／カルパッチョ／ポキ丼", pop:"「とろけるノルウェーサーモン」「サーモン祭り開催」", local:"「生食用・養殖・ノルウェー産」の3点表示で安心感。" },
  { name:"トラウトサーモン", kana:"とらうとさーもん", months:[1,2,3,4,5,6,7,8,9,10,11,12], point:"チリ等で海面養殖されるニジマス。鮮やかな色と手頃な価格が武器で、アトランティックとの価格2段構えが組める。", cook:"刺身／寿司／漬け丼／ホイル焼き", pop:"「色鮮やか トラウトサーモン」「お値打ちサーモンはこちら」", local:"名前の違いを聞かれたら「養殖ニジマス」と答えられるように。" },
  { name:"エイ", kana:"えい", months:[1,2,3,4,5,6,7,8,9,10,11,12], point:"煮付け・煮こごりで愛される通好みの魚。コリコリした軟骨ごと食べられ、冷めると煮こごりになるのが持ち味。", cook:"煮付け／煮こごり／唐揚げ／味噌煮", pop:"「昔ながらのエイの煮付け」「煮こごりまで美味しい」", local:"年配のお客様の指名買いが根強い。切身で買いやすく。" },
  { name:"パンガシウス", kana:"ぱんがしうす", months:[1,2,3,4,5,6,7,8,9,10,11,12], point:"東南アジア養殖の白身魚。骨なし・皮なしでクセがなく、フライ・ムニエルで子どもに食べさせやすい。低価格で通年安定。", cook:"フライ／ムニエル／ソテー／天ぷら", pop:"「骨なし白身でお子さまも安心」「フライにぴったり」", local:"「魚は骨が…」という声への答え。時短・簡便needsに。" },
  { name:"ホタルイカ", kana:"ほたるいか", months:[3,4,5], point:"春の風物詩。ボイルの酢味噌和えが定番で、沖漬け・炊き込みご飯など提案の幅も広い。春の売場の彩り役。", cook:"ボイル酢味噌／沖漬け／炊き込みご飯／パスタ", pop:"「春の便り ホタルイカ」「酢味噌でキュッと一杯」", local:"季節の入れ替わりを告げる商材。菜の花と関連陳列も春らしい。" },
  { name:"ハマグリ", kana:"はまぐり", months:[2,3,4], point:"ひな祭りの必需品。「貝殻がぴったり合うのは一対だけ＝良縁」の縁起で、お吸い物需要が集中する。焼きはまぐりも強い。", cook:"お吸い物／酒蒸し／焼きはまぐり／パスタ", pop:"「ひな祭りにははまぐりのお吸い物」「良縁を願う縁起物」", local:"3月3日前の1週間が勝負。縁起の由来POPが効く。" },
  { name:"ホンビノス貝", kana:"ほんびのすがい", months:[1,2,3,4,5,6,7,8,9,10,11,12], point:"出汁の濃さとお値打ち感で急成長中の貝。ハマグリより安く、酒蒸し・クラムチャウダー・BBQと洋和どちらもいける。", cook:"酒蒸し／クラムチャウダー／焼き貝／パスタ", pop:"「濃厚だしのホンビノス貝」「BBQの主役にどうぞ」", local:"「白ハマグリ」とも。ハマグリとの価格比較で値頃感が際立つ。" },
  { name:"牡蠣（真がき）", kana:"かき まがき", months:[11,12,1,2,3], point:"冬の主役。鍋・カキフライ・生食と用途が広く、加熱用と生食用の表示区分をはっきり見せるのが信頼の基本。", cook:"カキフライ／土手鍋／生食／蒸し牡蠣", pop:"「海のミルク 真がき入荷」「今夜はカキフライで決まり」", local:"夏の岩がきと冬の真がきで年間の牡蠣売場が完成する。" },
  { name:"鱈", kana:"たら", months:[12,1,2], point:"冬の鍋の王道白身。切身は鍋・ムニエル・ホイル焼きと万能で、白子は冬だけの宝物として別格の単価が取れる。", cook:"鍋／ムニエル／ホイル焼き／白子ポン酢", pop:"「鍋の王様 真だら」「冬だけのごちそう 白子入荷」", local:"白子は入荷したら必ず目立たせる。鍋つゆの関連陳列も。" },
  { name:"クエ", kana:"くえ", months:[11,12,1,2], point:"「幻の高級魚」。上品な脂とゼラチン質の旨みで鍋の最高峰。入荷自体がニュースなので、予約や特別な日需要と組み合わせる。", cook:"クエ鍋／刺身／湯引き／あら炊き", pop:"「幻の高級魚クエ、入荷しました」「一年に一度の贅沢鍋」", local:"「本日入荷」の速報性が最大の武器。SNS映えする売場に。" },
  { name:"ヒラマサ", kana:"ひらまさ", months:[5,6,7,8], point:"ブリ御三家（ブリ・カンパチ・ヒラマサ）の夏担当。ブリより上品な脂と強い歯ごたえで、夏に刺身が売れる青物。", cook:"刺身／カルパッチョ／照り焼き／漬け丼", pop:"「夏のブリ格 ヒラマサ」「歯ごたえ自慢の夏刺身」", local:"「夏はブリじゃなくヒラマサ」の一言で違いが伝わる。" },
  { name:"しらす", kana:"しらす", months:[4,5,9,10], point:"春と秋の2度旬。釜揚げのふんわり感と手軽さで、丼・冷奴・パスタと毎日の食卓に入り込める。カルシウム訴求も鉄板。", cook:"しらす丼／冷奴／卵とじ／ペペロンチーノ", pop:"「ふんわり釜揚げしらす」「カルシウムたっぷり」", local:"ごはん・豆腐売場との関連販売で買い忘れを防ぐ。" },
  { name:"ばとう鯛（マトウダイ）", kana:"ばとうだい まとうだい", months:[11,12,1,2], point:"島根で「バトウ」と呼ばれる冬の白身。フランスでは高級魚（サンピエール）でムニエルの定番。肝も美味しい通の魚。", cook:"刺身／ムニエル／煮付け／肝ポン酢", pop:"「山陰の冬の白身 バトウ」「フランスでは高級魚サンピエール」", local:"的のような模様が名の由来。島根の冬の隠れた名物。" },
];

function FishTab() {
  const [q, setQ] = useState("");
  const [openIdx, setOpenIdx] = useState(null);
  const nowM = new Date().getMonth() + 1;
  const inSeason = f => f.months.includes(nowM);
  const seasonAll = f => f.months.length >= 12;
  const nq = normJa(q);
  const list = FISH_DB
    .filter(f => !nq || normJa(f.name).includes(nq) || normJa(f.kana).includes(nq) || normJa(f.point).includes(nq))
    .sort((a,b) => (inSeason(b) && !seasonAll(b) ? 1 : 0) - (inSeason(a) && !seasonAll(a) ? 1 : 0));
  const mLabel = f => seasonAll(f) ? "通年" : f.months.join("・") + "月";

  return (
    <div className="min-vh" style={{ background:"var(--bg)" }}>
      <div style={{ background:"linear-gradient(180deg,#e7f1fa,#d3e5f4)", padding:"calc(env(safe-area-inset-top) + 20px) 16px 22px" }}>
        <div style={{ maxWidth:600, margin:"0 auto" }}>
          <div style={{ color:"#1d3a57", fontSize:18, fontWeight:900 }}>魚図鑑</div>
          <div style={{ color:"rgba(29,58,87,0.72)", fontSize:12, marginTop:2 }}>旬・売りポイント・調理・POPフレーズをまとめた鮮魚データベース</div>
        </div>
      </div>
      <div style={{ maxWidth:600, margin:"0 auto", padding:"14px 16px 120px" }}>
        <input value={q} onChange={e=>setQ(e.target.value)} placeholder="魚の名前やキーワードで検索…"
          style={{ width:"100%", boxSizing:"border-box", border:"1.5px solid var(--line)", borderRadius:12, padding:"11px 14px", fontSize:14, marginBottom:12, background:"#fff" }} />
        <div style={{ display:"grid", gridTemplateColumns:"repeat(2, 1fr)", gap:9 }}>
          {list.map((f) => {
            const idx = FISH_DB.indexOf(f);
            const now = inSeason(f) && !seasonAll(f);
            return (
              <div key={f.name} onClick={() => setOpenIdx(idx)}
                style={{ background:"#fff", border: now ? "1.5px solid var(--primary)" : "1px solid var(--line)", borderRadius:13, padding:"13px 12px", cursor:"pointer", position:"relative", minHeight:92, display:"flex", flexDirection:"column" }}>
                {now && <span style={{ position:"absolute", top:8, right:8, fontSize:9, fontWeight:900, color:"#fff", background:"var(--primary)", borderRadius:6, padding:"2px 6px" }}>今が旬</span>}
                <div style={{ fontSize:15.5, fontWeight:900, color:"var(--ink)", lineHeight:1.3, marginBottom:4 }}>{f.name}</div>
                <span style={{ fontSize:10, fontWeight:800, color:"var(--sub)", background:"var(--chip)", borderRadius:6, padding:"1px 7px", alignSelf:"flex-start", marginBottom:6 }}>{mLabel(f)}</span>
                <div style={{ fontSize:11, color:"var(--sub)", lineHeight:1.55, display:"-webkit-box", WebkitLineClamp:2, WebkitBoxOrient:"vertical", overflow:"hidden" }}>{f.point}</div>
              </div>
            );
          })}
        </div>
        {list.length === 0 && <div style={{ textAlign:"center", color:"var(--faint)", padding:"30px 0", fontSize:13 }}>見つかりませんでした</div>}
        <div style={{ fontSize:11, color:"var(--faint)", textAlign:"center", marginTop:12, lineHeight:1.7 }}>内容はAIが知識から書き下ろした参考情報です。<br/>追加したい魚や直したい内容があれば管理者へ。</div>
      </div>

      {openIdx != null && FISH_DB[openIdx] && (() => {
        const f = FISH_DB[openIdx];
        const now = inSeason(f) && !seasonAll(f);
        return (
          <>
            <div onClick={() => setOpenIdx(null)} style={{ position:"fixed", inset:0, zIndex:301, background:"rgba(0,0,0,0.4)" }} />
            <div style={{ position:"fixed", left:0, right:0, bottom:0, zIndex:302, background:"#fff", borderRadius:"22px 22px 0 0", boxShadow:"0 -8px 30px rgba(0,0,0,0.2)", animation:"sheetUp .28s cubic-bezier(.32,.72,.28,1)", padding:"10px 18px calc(24px + env(safe-area-inset-bottom))", maxHeight:"82vh", overflowY:"auto" }}>
              <div style={{ width:40, height:4.5, background:"var(--line)", borderRadius:3, margin:"0 auto 14px" }} />
              <div style={{ display:"flex", alignItems:"center", gap:9, marginBottom:12 }}>
                <span style={{ fontSize:20, fontWeight:900, color:"var(--ink)" }}>{f.name}</span>
                {now && <span style={{ fontSize:10.5, fontWeight:900, color:"#fff", background:"var(--primary)", borderRadius:7, padding:"2px 8px" }}>今が旬</span>}
                <span style={{ fontSize:11, fontWeight:800, color:"var(--sub)", background:"var(--chip)", borderRadius:6, padding:"2px 8px" }}>{mLabel(f)}</span>
                <button onClick={() => setOpenIdx(null)} style={{ marginLeft:"auto", border:"none", background:"var(--chip)", color:"var(--text)", width:32, height:32, borderRadius:"50%", fontSize:16, fontWeight:800, cursor:"pointer" }}>✕</button>
              </div>
              <div style={{ fontSize:13, color:"var(--text)", lineHeight:1.85 }}>
                <div>{f.point}</div>
                <div style={{ height:1, background:"var(--line)", margin:"12px 0" }} />
                <div style={{ marginBottom:8 }}><b style={{ color:"var(--ink)" }}>🍳 調理・食べ方</b><br/>{f.cook}</div>
                <div style={{ marginBottom:8 }}><b style={{ color:"var(--ink)" }}>📝 POPフレーズ例</b><br/><span style={{ color:"var(--soft-text)" }}>{f.pop}</span></div>
                <div><b style={{ color:"var(--ink)" }}>📍 山陰メモ</b><br/>{f.local}</div>
              </div>
            </div>
          </>
        );
      })()}
    </div>
  );
}



;Object.assign(window, { FISH_DB, FishTab, POPCHECK_TH, PopCheckTab, popcheckAnalyze, popcheckJudge });
