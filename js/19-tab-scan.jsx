/* GoodDay 鮮魚共有 — 19-tab-scan （読み込みシステム：伝票PDFをブラウザの中で補正する）
   外部に画像を送りません。すべてこの端末の中だけで処理します。 */
var { useState, useRef, useCallback } = React;

// ── 画像の補正（すべて素のJavaScript。外部に送らない） ──────────────

// 白い紙を前提に、黒い点の割合を数える
function scanInkRatio(data, w, h) {
  let 黒 = 0, 数 = 0;
  const 端 = Math.floor(Math.min(w, h) * 0.03);
  for (let y = 端; y < h - 端; y += 2) {
    for (let x = 端; x < w - 端; x += 2) {
      const i = (y * w + x) * 4;
      const v = (data[i] * 299 + data[i+1] * 587 + data[i+2] * 114) / 1000;
      if (v < 160) 黒++;
      数++;
    }
  }
  return 数 ? 黒 / 数 : 0;
}

// 行ごとの黒の量がいちばんはっきり分かれる角度＝文字が水平（射影プロファイル法）
function scanScoreAt(gray, w, h, deg) {
  const r = deg * Math.PI / 180, cos = Math.cos(r), sin = Math.sin(r);
  const cx = w / 2, cy = h / 2;
  const 行和 = new Float64Array(h);
  for (let y = 0; y < h; y += 2) {
    for (let x = 0; x < w; x += 2) {
      const dx = x - cx, dy = y - cy;
      const sx = Math.round(cx + dx * cos + dy * sin);
      const sy = Math.round(cy - dx * sin + dy * cos);
      if (sx < 0 || sy < 0 || sx >= w || sy >= h) continue;
      if (gray[sy * w + sx] < 160) 行和[y]++;
    }
  }
  let 得点 = 0;
  for (let y = 2; y < h; y += 2) { const d = 行和[y] - 行和[y-2]; 得点 += d * d; }
  return 得点;
}

function scanToGray(ctx, w, h) {
  const d = ctx.getImageData(0, 0, w, h).data;
  const g = new Uint8Array(w * h);
  for (let i = 0, j = 0; j < g.length; i += 4, j++)
    g[j] = (d[i] * 299 + d[i+1] * 587 + d[i+2] * 114) / 1000;
  return g;
}

// 横向き（90度単位）を直す。上下逆さまは文字構造では判別できないので触らない
function scanDetectQuarter(gray, w, h) {
  const 縦 = scanScoreAt(gray, w, h, 0);
  // 90度回した状態の得点は、幅と高さを入れ替えて測るのと同じ
  const g2 = new Uint8Array(w * h);
  for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) g2[x * h + y] = gray[y * w + x];
  const 横 = scanScoreAt(g2, h, w, 0);
  return 横 > 縦 * 1.25 ? 90 : 0;
}

function scanFindSkew(gray, w, h, 上限) {
  let 粗 = 0, 最高 = -1;
  for (let a = -上限; a <= 上限; a += 1) {
    const s = scanScoreAt(gray, w, h, a);
    if (s > 最高) { 最高 = s; 粗 = a; }
  }
  let 細 = 粗; 最高 = -1;
  for (let a = 粗 - 1; a <= 粗 + 1; a += 0.2) {
    const s = scanScoreAt(gray, w, h, a);
    if (s > 最高) { 最高 = s; 細 = a; }
  }
  return Math.abs(細) < 0.2 || Math.abs(細) > 上限 ? 0 : Math.round(細 * 10) / 10;
}

// 薄い複写伝票を濃くする（明るさの分布を引き伸ばす）
function scanStretch(img, 強さ) {
  const d = img.data, 度数 = new Uint32Array(256);
  for (let i = 0; i < d.length; i += 4)
    度数[(d[i] * 299 + d[i+1] * 587 + d[i+2] * 114) / 1000 | 0]++;
  const 総数 = d.length / 4;
  const 切る = 総数 * (0.005 * 強さ);
  let 下 = 0, 上 = 255, 積 = 0;
  for (let v = 0; v < 256; v++) { 積 += 度数[v]; if (積 > 切る) { 下 = v; break; } }
  積 = 0;
  for (let v = 255; v >= 0; v--) { 積 += 度数[v]; if (積 > 切る) { 上 = v; break; } }
  if (上 - 下 < 20) return img;
  const 表 = new Uint8Array(256);
  for (let v = 0; v < 256; v++)
    表[v] = Math.max(0, Math.min(255, Math.round((v - 下) * 255 / (上 - 下))));
  for (let i = 0; i < d.length; i += 4) { d[i] = 表[d[i]]; d[i+1] = 表[d[i+1]]; d[i+2] = 表[d[i+2]]; }
  return img;
}

// 白黒にする（まわりの明るさと比べて決める＝局所しきい値）
function scanBinarize(img, w, h, 補正値) {
  const d = img.data;
  const g = new Float64Array(w * h);
  for (let i = 0, j = 0; j < g.length; i += 4, j++)
    g[j] = (d[i] * 299 + d[i+1] * 587 + d[i+2] * 114) / 1000;
  // 積分画像で、まわりの平均を速く求める
  const 積 = new Float64Array((w + 1) * (h + 1));
  for (let y = 0; y < h; y++) {
    let 行 = 0;
    for (let x = 0; x < w; x++) {
      行 += g[y * w + x];
      積[(y + 1) * (w + 1) + (x + 1)] = 積[y * (w + 1) + (x + 1)] + 行;
    }
  }
  const 半 = Math.max(8, Math.round(Math.min(w, h) / 45));
  for (let y = 0; y < h; y++) {
    const y1 = Math.max(0, y - 半), y2 = Math.min(h - 1, y + 半);
    for (let x = 0; x < w; x++) {
      const x1 = Math.max(0, x - 半), x2 = Math.min(w - 1, x + 半);
      const 面積 = (y2 - y1 + 1) * (x2 - x1 + 1);
      const 合計 = 積[(y2+1)*(w+1)+(x2+1)] - 積[y1*(w+1)+(x2+1)]
                 - 積[(y2+1)*(w+1)+x1] + 積[y1*(w+1)+x1];
      const v = g[y * w + x] < (合計 / 面積 - 補正値) ? 0 : 255;
      const i = (y * w + x) * 4;
      d[i] = d[i+1] = d[i+2] = v;
    }
  }
  return img;
}

// ── 本体 ────────────────────────────────────────────────────
function ScanTab() {
  const [設定, set設定] = useState({
    向き: true, 傾き: true, 解像度: true, 濃さ: true, 白黒: false, 白紙: true,
    dpi: 200, 上限角度: 8, 濃さの強さ: 1.0, 白黒の補正値: 12, 白紙のしきい値: 0.004,
  });
  const [状態, set状態] = useState("待機");      // 待機 | 処理中 | 完了
  const [進捗, set進捗] = useState("");
  const [結果, set結果] = useState([]);
  const [記録, set記録] = useState([]);
  const fileRef = useRef(null);
  const 切替 = (k) => set設定(o => ({ ...o, [k]: !o[k] }));
  const 変更 = (k, v) => set設定(o => ({ ...o, [k]: v }));

  const ページを補正 = useCallback((canvas, s) => {
    const ctx = canvas.getContext("2d", { willReadFrequently: true });
    let w = canvas.width, h = canvas.height;
    const 記 = { 回転: 0, 傾き: 0, 白紙: false };

    if (s.向き) {
      const g = scanToGray(ctx, w, h);
      if (scanDetectQuarter(g, w, h) === 90) {
        const tmp = document.createElement("canvas");
        tmp.width = h; tmp.height = w;
        const c2 = tmp.getContext("2d");
        c2.translate(h / 2, w / 2); c2.rotate(Math.PI / 2);
        c2.drawImage(canvas, -w / 2, -h / 2);
        canvas.width = h; canvas.height = w;
        ctx.setTransform(1, 0, 0, 1, 0, 0);
        ctx.drawImage(tmp, 0, 0);
        w = canvas.width; h = canvas.height; 記.回転 = 90;
      }
    }

    if (s.傾き) {
      const g = scanToGray(ctx, w, h);
      const 角 = scanFindSkew(g, w, h, s.上限角度);
      if (角 !== 0) {
        const tmp = document.createElement("canvas");
        tmp.width = w; tmp.height = h;
        const c2 = tmp.getContext("2d");
        c2.fillStyle = "#fff"; c2.fillRect(0, 0, w, h);
        c2.translate(w / 2, h / 2); c2.rotate(角 * Math.PI / 180);
        c2.drawImage(canvas, -w / 2, -h / 2);
        ctx.setTransform(1, 0, 0, 1, 0, 0);
        ctx.drawImage(tmp, 0, 0);
        記.傾き = 角;
      }
    }

    let img = ctx.getImageData(0, 0, w, h);
    if (s.濃さ) img = scanStretch(img, s.濃さの強さ);
    if (s.白黒) img = scanBinarize(img, w, h, s.白黒の補正値);
    ctx.putImageData(img, 0, 0);

    if (s.白紙 && scanInkRatio(img.data, w, h) < s.白紙のしきい値) 記.白紙 = true;
    return 記;
  }, []);

  const 実行 = async (files) => {
    if (!files || !files.length) return;
    set状態("処理中"); set結果([]); set記録([]);
    try {
      await loadScriptOnce(PDFJS_SRC);
      await loadScriptOnce(JSPDF_SRC);
      const pdfjs = window.pdfjsLib || window["pdfjs-dist/build/pdf"];
      pdfjs.GlobalWorkerOptions.workerSrc = PDFJS_WORKER;
      const jsPDFctor = (window.jspdf && window.jspdf.jsPDF) || window.jsPDF;

      const 出来上がり = [], 記録行 = [];
      for (let f = 0; f < files.length; f++) {
        const ファイル = files[f];
        set進捗(`${f + 1}／${files.length}　${ファイル.name}　を開いています…`);
        const doc = await pdfjs.getDocument({ data: await ファイル.arrayBuffer() }).promise;
        const 出力 = new jsPDFctor({ unit: "pt", compress: true });
        let 入れた = 0, 白紙数 = 0, 回転数 = 0, 傾き合計 = 0;

        for (let p = 1; p <= doc.numPages; p++) {
          set進捗(`${f + 1}／${files.length}　${ファイル.name}　${p}／${doc.numPages}ページ を補正中…`);
          await new Promise(r => setTimeout(r, 0));     // 画面を固まらせない
          const page = await doc.getPage(p);
          const 倍率 = 設定.解像度 ? 設定.dpi / 72 : 1.5;
          const vp = page.getViewport({ scale: 倍率 });
          const cv = document.createElement("canvas");
          cv.width = Math.round(vp.width); cv.height = Math.round(vp.height);
          const cx = cv.getContext("2d", { willReadFrequently: true });
          cx.fillStyle = "#fff"; cx.fillRect(0, 0, cv.width, cv.height);
          await page.render({ canvasContext: cx, viewport: vp }).promise;

          const 記 = ページを補正(cv, 設定);
          if (記.回転) 回転数++;
          if (記.傾き) 傾き合計++;
          if (記.白紙) { 白紙数++; continue; }

          const 幅pt = cv.width * 72 / (設定.解像度 ? 設定.dpi : 108);
          const 高pt = cv.height * 72 / (設定.解像度 ? 設定.dpi : 108);
          if (入れた > 0) 出力.addPage([幅pt, 高pt], 幅pt > 高pt ? "l" : "p");
          else 出力.deletePage(1), 出力.addPage([幅pt, 高pt], 幅pt > 高pt ? "l" : "p");
          出力.addImage(cv.toDataURL("image/jpeg", 0.88), "JPEG", 0, 0, 幅pt, 高pt);
          入れた++;
        }
        doc.destroy();

        if (入れた === 0) {
          記録行.push({ 名: ファイル.name, 結果: "失敗", 内容: "すべて白紙と判定されました" });
          continue;
        }
        const 名 = ファイル.name.replace(/\.pdf$/i, "") + "_補正済.pdf";
        出来上がり.push({ 名, url: URL.createObjectURL(出力.output("blob")), ページ: 入れた });
        記録行.push({ 名: ファイル.name, 結果: "成功", ページ: 入れた,
                    白紙: 白紙数, 回転: 回転数, 傾き: 傾き合計 });
      }
      set結果(出来上がり); set記録(記録行); set状態("完了"); set進捗("");
    } catch (e) {
      set状態("完了"); set進捗("");
      set記録([{ 名: "—", 結果: "失敗", 内容: String(e && e.message || e).slice(0, 120) }]);
    }
  };

  const 箱 = { background:"var(--card, #fff)", border:"1px solid var(--line)", borderRadius:14,
               padding:14, marginBottom:12 };
  const 見出し = { fontSize:14.5, fontWeight:900, color:"var(--ink)", marginBottom:10 };

  const 項目 = [
    ["向き", "向きを直す", "横向きのページを縦に戻します"],
    ["傾き", "傾きを直す", "斜めにスキャンされた紙を水平にします"],
    ["解像度", "解像度をそろえる", "細かい字がつぶれにくくなります"],
    ["濃さ", "濃さを上げる", "薄い複写伝票の印字を濃くします"],
    ["白黒", "白黒にする", "2色にします。効くかどうか比べてください"],
    ["白紙", "白紙を捨てる", "裏面など、何も写っていないページを除きます"],
  ];

  return (
    <div style={{ maxWidth:720, margin:"0 auto", padding:"6px 16px 120px" }}>
      <input ref={fileRef} type="file" accept="application/pdf" multiple style={{ display:"none" }}
        onChange={e => { const fs = Array.from(e.target.files || []); e.target.value = ""; 実行(fs); }} />

      <div style={{ ...箱, background:"var(--soft)" }}>
        <div style={{ fontSize:12.5, color:"var(--text)", lineHeight:1.9 }}>
          スキャンした伝票PDFを、伝票入力アプリに渡す前に整えます。
          <b>処理はこの端末の中だけで行います。</b>画像がどこかに送られることはありません。
        </div>
      </div>

      <div style={箱}>
        <div style={見出し}>何を直すか</div>
        {項目.map(([k, 名, 説明], i) => (
          <button key={k} onClick={() => 切替(k)} disabled={状態 === "処理中"}
            style={{ width:"100%", border:"none", background:"transparent", cursor:"pointer",
              display:"flex", alignItems:"center", gap:11, padding:"10px 0", textAlign:"left",
              borderTop: i === 0 ? "none" : "1px solid var(--line)" }}>
            <span style={{ flex:"0 0 42px", height:25, borderRadius:999, position:"relative",
              background: 設定[k] ? "var(--primary-soft)" : "var(--chip)", transition:"background .15s" }}>
              <span style={{ position:"absolute", top:3, left: 設定[k] ? 20 : 3, width:19, height:19,
                borderRadius:"50%", background:"#fff", transition:"left .15s",
                boxShadow:"0 1px 3px rgba(0,0,0,0.25)" }} />
            </span>
            <span style={{ flex:1, minWidth:0 }}>
              <span style={{ display:"block", fontSize:13.5, fontWeight:800, color:"var(--ink)" }}>{名}</span>
              <span style={{ display:"block", fontSize:12, color:"var(--sub)", lineHeight:1.7 }}>{説明}</span>
            </span>
          </button>
        ))}
        <div style={{ borderTop:"1px solid var(--line)", paddingTop:11, marginTop:4,
          display:"flex", alignItems:"center", gap:10 }}>
          <span style={{ fontSize:13, fontWeight:800, color:"var(--ink)" }}>細かさ</span>
          <div style={{ marginLeft:"auto", display:"flex", gap:6 }}>
            {[150, 200, 300].map(v => (
              <button key={v} onClick={() => 変更("dpi", v)} disabled={状態 === "処理中"}
                style={{ border:"1px solid " + (設定.dpi === v ? "var(--primary-soft)" : "var(--line)"),
                  background: 設定.dpi === v ? "var(--soft)" : "var(--card, #fff)",
                  color: 設定.dpi === v ? "var(--soft-text)" : "var(--sub)",
                  borderRadius:999, padding:"6px 13px", fontSize:12.5, fontWeight:800,
                  cursor:"pointer" }}>{v}</button>
            ))}
          </div>
        </div>
        <div style={{ fontSize:11.5, color:"var(--sub)", marginTop:7, lineHeight:1.7 }}>
          数字が大きいほどきれいですが、処理に時間がかかります。まず200でお試しください。
        </div>
      </div>

      <button onClick={() => fileRef.current && fileRef.current.click()} disabled={状態 === "処理中"}
        style={{ width:"100%", border:"none", borderRadius:12, padding:"16px 12px", marginBottom:12,
          background: 状態 === "処理中" ? "var(--chip)" : "var(--primary-soft)",
          color: 状態 === "処理中" ? "var(--sub)" : "#fff",
          fontSize:15.5, fontWeight:900, cursor: 状態 === "処理中" ? "default" : "pointer" }}>
        {状態 === "処理中" ? "処理中…" : "PDFを選んで補正する"}
      </button>

      {状態 === "処理中" && (
        <div style={{ ...箱, textAlign:"center" }}>
          <div style={{ width:26, height:26, margin:"0 auto 10px", border:"3px solid var(--chip)",
            borderTopColor:"var(--primary-soft)", borderRadius:"50%", animation:"spinR .8s linear infinite" }} />
          <div style={{ fontSize:12.5, color:"var(--sub)", lineHeight:1.8 }}>{進捗}</div>
        </div>
      )}

      {結果.length > 0 && (
        <div style={箱}>
          <div style={見出し}>できあがり</div>
          {結果.map((r, i) => (
            <a key={i} href={r.url} download={r.名}
              style={{ display:"flex", alignItems:"center", gap:10, textDecoration:"none",
                border:"1px solid var(--line)", borderRadius:10, padding:"12px 13px", marginBottom:8,
                background:"var(--card, #fff)" }}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--primary-soft)"
                strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink:0 }}>
                <path d="M12 4v11M7.5 10.5L12 15l4.5-4.5"/><path d="M4 19h16"/></svg>
              <span style={{ flex:1, minWidth:0, fontSize:13, fontWeight:800, color:"var(--ink)",
                overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{r.名}</span>
              <span style={{ fontSize:11.5, color:"var(--sub)", whiteSpace:"nowrap" }}>{r.ページ}ページ</span>
            </a>
          ))}
          <div style={{ fontSize:11.5, color:"var(--sub)", lineHeight:1.8, marginTop:4 }}>
            押すと端末に保存されます。これを伝票入力アプリに読ませてください。
          </div>
        </div>
      )}

      {記録.length > 0 && (
        <div style={箱}>
          <div style={見出し}>処理の記録</div>
          {記録.map((r, i) => (
            <div key={i} style={{ fontSize:12.5, lineHeight:1.9, color:"var(--sub)",
              paddingTop: i === 0 ? 0 : 8, borderTop: i === 0 ? "none" : "1px solid var(--line)" }}>
              <b style={{ color: r.結果 === "成功" ? "var(--ink)" : "#b3261e" }}>{r.名}</b>　{r.結果}
              {r.結果 === "成功"
                ? `　／　${r.ページ}ページ　白紙${r.白紙}枚を除去　向き${r.回転}枚　傾き${r.傾き}枚を補正`
                : `　／　${r.内容 || ""}`}
            </div>
          ))}
        </div>
      )}

      <div style={{ ...箱, marginBottom:0 }}>
        <div style={見出し}>うまくいかないとき</div>
        <div style={{ fontSize:12.5, color:"var(--sub)", lineHeight:1.95 }}>
          ・ページが減りすぎる　→　「白紙を捨てる」を切にしてください<br />
          ・文字がつぶれる　→　「白黒にする」を切に。それでも駄目なら「濃さを上げる」も切に<br />
          ・傾きがかえって悪くなる　→　「傾きを直す」を切にしてください<br />
          ・時間がかかりすぎる　→　細かさを150にしてください<br />
          ・上下が逆さまのまま　→　紙の向きは文字だけでは判別できません。スキャンし直してください
        </div>
      </div>
    </div>
  );
}

;Object.assign(window, { ScanTab });
