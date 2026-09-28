/* GoodDay 鮮魚共有 — 20-tab-check （伝票検算：蛍光ペンで塗った金額を読む・試作）
   伝票の画像は外に出しません。すべてこの端末の中だけで処理します。 */
var { useState, useRef, useCallback } = React;

// ── 蛍光ペンの色を見つける ──────────────────────────────────
// 明るくて色の濃い画素＝蛍光ペン。黒い文字・白い紙・薄い影は外れる。
function chkHue(r, g, b) {
  const 最大 = Math.max(r, g, b), 最小 = Math.min(r, g, b);
  const 差 = 最大 - 最小;
  if (差 === 0) return { h: 0, s: 0, v: 最大 };
  let h;
  if (最大 === r) h = 60 * (((g - b) / 差) % 6);
  else if (最大 === g) h = 60 * ((b - r) / 差 + 2);
  else h = 60 * ((r - g) / 差 + 4);
  if (h < 0) h += 360;
  return { h, s: 差 / 最大, v: 最大 };
}

function chkIsMarker(r, g, b, 色) {
  const { h, s, v } = chkHue(r, g, b);
  if (s < 0.28 || v < 110) return false;              // 色が薄い・暗いものは除く
  const ピンク = (h >= 290 || h <= 20);
  const 橙黄  = (h > 20 && h <= 70);
  if (色 === "pink")   return ピンク;
  if (色 === "orange") return 橙黄;
  return ピンク || 橙黄;                              // 両方
}

// 塗られた場所を四角のかたまりとして取り出す
function chkFindRegions(data, w, h, 色) {
  const 縮 = 4;                                       // 4分の1にして探す（速さのため）
  const W = Math.floor(w / 縮), H = Math.floor(h / 縮);
  const 印 = new Uint8Array(W * H);
  for (let y = 0; y < H; y++) {
    for (let x = 0; x < W; x++) {
      const i = ((y * 縮) * w + x * 縮) * 4;
      if (chkIsMarker(data[i], data[i+1], data[i+2], 色)) 印[y * W + x] = 1;
    }
  }
  const 見た = new Uint8Array(W * H), 結果 = [];
  const 待ち = new Int32Array(W * H);
  for (let p = 0; p < 印.length; p++) {
    if (!印[p] || 見た[p]) continue;
    let 先頭 = 0, 末尾 = 0;
    待ち[末尾++] = p; 見た[p] = 1;
    let x1 = W, y1 = H, x2 = 0, y2 = 0, 数 = 0;
    while (先頭 < 末尾) {
      const q = 待ち[先頭++], qx = q % W, qy = (q / W) | 0;
      数++;
      if (qx < x1) x1 = qx; if (qx > x2) x2 = qx;
      if (qy < y1) y1 = qy; if (qy > y2) y2 = qy;
      for (let dy = -2; dy <= 2; dy++) {              // 少し離れていても同じ塊とみなす
        for (let dx = -2; dx <= 2; dx++) {
          const nx = qx + dx, ny = qy + dy;
          if (nx < 0 || ny < 0 || nx >= W || ny >= H) continue;
          const n = ny * W + nx;
          if (印[n] && !見た[n]) { 見た[n] = 1; 待ち[末尾++] = n; }
        }
      }
    }
    const 幅 = (x2 - x1 + 1) * 縮, 高 = (y2 - y1 + 1) * 縮;
    if (数 < 20 || 幅 < 30 || 高 < 10) continue;       // 小さすぎるものは汚れとみなす
    const 余 = 6;
    結果.push({
      x: Math.max(0, x1 * 縮 - 余), y: Math.max(0, y1 * 縮 - 余),
      w: Math.min(w, 幅 + 余 * 2), h: Math.min(h, 高 + 余 * 2),
    });
  }
  return 結果.sort((a, b) => a.y - b.y || a.x - b.x);
}

// 切り抜きを読みやすく整える（色を飛ばして白黒にする）
function chkPrepCrop(src, 枠) {
  const cv = document.createElement("canvas");
  const 倍 = Math.max(1, Math.min(4, 220 / 枠.h));    // 小さい字は拡大して読ませる
  cv.width = Math.round(枠.w * 倍); cv.height = Math.round(枠.h * 倍);
  const cx = cv.getContext("2d", { willReadFrequently: true });
  cx.imageSmoothingQuality = "high";
  cx.drawImage(src, 枠.x, 枠.y, 枠.w, 枠.h, 0, 0, cv.width, cv.height);
  const img = cx.getImageData(0, 0, cv.width, cv.height);
  const d = img.data;
  for (let i = 0; i < d.length; i += 4) {
    // 蛍光色は紙とみなして白へ、濃い画素だけ黒として残す
    const 明 = (d[i] * 299 + d[i+1] * 587 + d[i+2] * 114) / 1000;
    const { s } = chkHue(d[i], d[i+1], d[i+2]);
    const v = (明 < 135 && s < 0.55) ? 0 : 255;
    d[i] = d[i+1] = d[i+2] = v; d[i+3] = 255;
  }
  cx.putImageData(img, 0, 0);
  return cv;
}

// 読み取った文字から金額らしい数字を取り出す
function chkParseAmount(text) {
  const 候補 = String(text || "").replace(/[ｰ―—\-]/g, "")
    .match(/\d{1,3}(?:[,，]\d{3})+|\d{2,}/g) || [];
  const 数 = 候補.map(t => parseInt(t.replace(/[,，]/g, ""), 10))
                 .filter(n => !isNaN(n) && n > 0);
  if (!数.length) return null;
  return Math.max.apply(null, 数);                    // 金額は行内で最も大きい数
}

function CheckTab() {
  const [色, set色] = useState("both");
  const [dpi, setDpi] = useState(300);
  const [状態, set状態] = useState("待機");
  const [進捗, set進捗] = useState("");
  const [行, set行] = useState([]);
  const fileRef = useRef(null);
  const workerRef = useRef(null);

  const 読み手を用意 = useCallback(async () => {
    if (workerRef.current) return workerRef.current;
    await loadScriptOnce(TESSERACT_SRC);
    const T = window.Tesseract;
    const w = await T.createWorker("eng");             // 数字だけなので英数で足りる
    await w.setParameters({
      tessedit_char_whitelist: "0123456789,.",
      tessedit_pageseg_mode: "7",                      // 1行として読む
    });
    workerRef.current = w;
    return w;
  }, []);

  const 実行 = async (files) => {
    if (!files || !files.length) return;
    set状態("処理中"); set行([]);
    try {
      await loadScriptOnce(PDFJS_SRC);
      const pdfjs = window.pdfjsLib || window["pdfjs-dist/build/pdf"];
      pdfjs.GlobalWorkerOptions.workerSrc = PDFJS_WORKER;
      set進捗("文字を読む準備をしています（初回は少し待ちます）…");
      // OCRが使えなくても止めない。切り抜きだけ出せば、人が読んで打てる
      let worker = null, 読めない理由 = "";
      try { worker = await 読み手を用意(); }
      catch (e) { 読めない理由 = "文字を読む部品を用意できませんでした（通信を確認してください）。切り抜きだけ表示します"; }
      if (読めない理由) set進捗(読めない理由);

      const 出来 = [];
      for (let f = 0; f < files.length; f++) {
        const doc = await pdfjs.getDocument({ data: await files[f].arrayBuffer() }).promise;
        for (let p = 1; p <= doc.numPages; p++) {
          set進捗(`${files[f].name}　${p}／${doc.numPages}ページ を見ています…`);
          await new Promise(r => setTimeout(r, 0));
          const page = await doc.getPage(p);
          const vp = page.getViewport({ scale: dpi / 72 });
          const cv = document.createElement("canvas");
          cv.width = Math.round(vp.width); cv.height = Math.round(vp.height);
          const cx = cv.getContext("2d", { willReadFrequently: true });
          cx.fillStyle = "#fff"; cx.fillRect(0, 0, cv.width, cv.height);
          await page.render({ canvasContext: cx, viewport: vp }).promise;

          const data = cx.getImageData(0, 0, cv.width, cv.height).data;
          const 枠達 = chkFindRegions(data, cv.width, cv.height, 色);
          const 金額 = [];
          for (const 枠 of 枠達) {
            const 切 = chkPrepCrop(cv, 枠);
            let 値 = null, 生 = "";
            if (worker) {
              try {
                const r = await worker.recognize(切);
                生 = (r.data.text || "").trim();
                値 = chkParseAmount(生);
              } catch (e) {}
            }
            金額.push({ 画像: 切.toDataURL("image/png"), 値, 生 });
          }
          出来.push({
            ファイル: files[f].name, ページ: p, 注意: 読めない理由,
            金額,
            合計: 金額.reduce((a, b) => a + (b.値 || 0), 0),
            手入力: "",
            要確認: 金額.length === 0 || 金額.some(m => m.値 == null),
          });
          set行([...出来]);
        }
        doc.destroy();
      }
      set状態("完了"); set進捗("");
    } catch (e) {
      set状態("完了"); set進捗("");
      set行(v => [...v, { ファイル: "—", ページ: 0, 金額: [], 合計: 0,
                          要確認: true, エラー: String(e && e.message || e).slice(0, 120) }]);
    }
  };

  const 直す = (i, v) => set行(r => r.map((x, j) => j === i ? { ...x, 手入力: v } : x));
  const 確定値 = (r) => (r.手入力 !== "" && !isNaN(parseInt(r.手入力, 10)))
    ? parseInt(String(r.手入力).replace(/[,，]/g, ""), 10) : r.合計;
  const 束の合計 = 行.reduce((a, r) => a + 確定値(r), 0);

  const CSVを出す = () => {
    const 見出し = ["ファイル名", "ページ", "読み取った金額", "合計", "手入力", "採用値", "要確認"];
    const 中身 = 行.map(r => [r.ファイル, r.ページ,
      r.金額.map(m => m.値 == null ? "読めず" : m.値).join(" + "),
      r.合計, r.手入力, 確定値(r), r.要確認 ? "要確認" : ""]);
    const csv = "﻿" + [見出し, ...中身]
      .map(a => a.map(v => `"${String(v).replace(/"/g, '""')}"`).join(",")).join("\r\n");
    const a = document.createElement("a");
    a.href = URL.createObjectURL(new Blob([csv], { type: "text/csv" }));
    a.download = `伝票検算_${new Date().toISOString().slice(0,10)}.csv`;
    a.click();
  };

  const 箱 = { background:"var(--card, #fff)", border:"1px solid var(--line)", borderRadius:14,
               padding:14, marginBottom:12 };
  const 見出し = { fontSize:14.5, fontWeight:900, color:"var(--ink)", marginBottom:10 };
  const 並べ = [...行].sort((a, b) => (b.要確認 ? 1 : 0) - (a.要確認 ? 1 : 0));

  return (
    <div style={{ maxWidth:820, margin:"0 auto", padding:"6px 16px 120px" }}>
      <input ref={fileRef} type="file" accept="application/pdf" multiple style={{ display:"none" }}
        onChange={e => { const fs = Array.from(e.target.files || []); e.target.value = ""; 実行(fs); }} />

      <div style={{ ...箱, background:"var(--soft)" }}>
        <div style={{ fontSize:12.5, fontWeight:900, color:"var(--soft-text)", marginBottom:6 }}>
          試作品です（まだ本番では使わないでください）
        </div>
        <div style={{ fontSize:12.5, color:"var(--text)", lineHeight:1.9 }}>
          管理表に入れる金額を<b>蛍光ペンで塗って</b>カラースキャンしてください。
          塗った所だけを読みます。<b>2か所塗れば足します。</b>
          どれを採るかは人が決め、読むのは機械、という分担です。
          画像は外に出ません。
        </div>
      </div>

      <div style={箱}>
        <div style={見出し}>設定</div>
        <div style={{ display:"flex", alignItems:"center", gap:10, marginBottom:12 }}>
          <span style={{ fontSize:13, fontWeight:800, color:"var(--ink)" }}>ペンの色</span>
          <div style={{ marginLeft:"auto", display:"flex", gap:6 }}>
            {[["both","両方"],["pink","ピンク"],["orange","オレンジ"]].map(([k, l]) => (
              <button key={k} onClick={() => set色(k)} disabled={状態==="処理中"}
                style={{ border:"1px solid " + (色===k ? "var(--primary-soft)" : "var(--line)"),
                  background: 色===k ? "var(--soft)" : "var(--card, #fff)",
                  color: 色===k ? "var(--soft-text)" : "var(--sub)",
                  borderRadius:999, padding:"6px 13px", fontSize:12.5, fontWeight:800, cursor:"pointer" }}>{l}</button>
            ))}
          </div>
        </div>
        <div style={{ display:"flex", alignItems:"center", gap:10 }}>
          <span style={{ fontSize:13, fontWeight:800, color:"var(--ink)" }}>細かさ</span>
          <div style={{ marginLeft:"auto", display:"flex", gap:6 }}>
            {[200, 300, 400].map(v => (
              <button key={v} onClick={() => setDpi(v)} disabled={状態==="処理中"}
                style={{ border:"1px solid " + (dpi===v ? "var(--primary-soft)" : "var(--line)"),
                  background: dpi===v ? "var(--soft)" : "var(--card, #fff)",
                  color: dpi===v ? "var(--soft-text)" : "var(--sub)",
                  borderRadius:999, padding:"6px 13px", fontSize:12.5, fontWeight:800, cursor:"pointer" }}>{v}</button>
            ))}
          </div>
        </div>
      </div>

      <button onClick={() => fileRef.current && fileRef.current.click()} disabled={状態==="処理中"}
        style={{ width:"100%", border:"none", borderRadius:12, padding:"16px 12px", marginBottom:12,
          background: 状態==="処理中" ? "var(--chip)" : "var(--primary-soft)",
          color: 状態==="処理中" ? "var(--sub)" : "#fff",
          fontSize:15.5, fontWeight:900, cursor: 状態==="処理中" ? "default" : "pointer" }}>
        {状態==="処理中" ? "読んでいます…" : "スキャンしたPDFを選ぶ"}
      </button>

      {状態==="処理中" && (
        <div style={{ ...箱, textAlign:"center" }}>
          <div style={{ width:26, height:26, margin:"0 auto 10px", border:"3px solid var(--chip)",
            borderTopColor:"var(--primary-soft)", borderRadius:"50%", animation:"spinR .8s linear infinite" }} />
          <div style={{ fontSize:12.5, color:"var(--sub)", lineHeight:1.8 }}>{進捗}</div>
        </div>
      )}

      {行.length > 0 && (
        <>
          <div style={{ ...箱, display:"flex", alignItems:"center", gap:10 }}>
            <span style={{ fontSize:13.5, fontWeight:800, color:"var(--ink)" }}>束の合計</span>
            <span style={{ marginLeft:"auto", fontSize:22, fontWeight:900, color:"var(--primary-soft)" }}>
              {束の合計.toLocaleString()}
            </span>
            <span style={{ fontSize:12.5, color:"var(--sub)" }}>円</span>
          </div>

          {並べ.map((r, i) => {
            const 元 = 行.indexOf(r);
            return (
              <div key={i} style={{ ...箱, border:"1px solid " + (r.要確認 ? "#d9a441" : "var(--line)"),
                background: r.要確認 ? "rgba(217,164,65,0.06)" : "var(--card, #fff)" }}>
                <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:9 }}>
                  <span style={{ fontSize:12.5, fontWeight:800, color:"var(--ink)", overflow:"hidden",
                    textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{r.ファイル}</span>
                  <span style={{ fontSize:11.5, color:"var(--sub)", flexShrink:0 }}>{r.ページ}ページ目</span>
                  {r.要確認 && (
                    <span style={{ marginLeft:"auto", flexShrink:0, background:"#d9a441", color:"#fff",
                      borderRadius:6, padding:"2px 8px", fontSize:11, fontWeight:900 }}>要確認</span>
                  )}
                </div>

                {r.注意 && (
                  <div style={{ fontSize:11.5, color:"#8a6a1a", background:"rgba(217,164,65,0.12)",
                    borderRadius:7, padding:"7px 9px", marginBottom:9, lineHeight:1.7 }}>{r.注意}</div>
                )}
                {r.エラー ? (
                  <div style={{ fontSize:12.5, color:"#b3261e" }}>{r.エラー}</div>
                ) : r.金額.length === 0 ? (
                  <div style={{ fontSize:12.5, color:"var(--sub)", lineHeight:1.8 }}>
                    蛍光ペンの塗りが見つかりませんでした。塗り忘れか、色の設定が合っていない可能性があります。
                  </div>
                ) : (
                  <div style={{ display:"flex", flexDirection:"column", gap:8 }}>
                    {r.金額.map((m, j) => (
                      <div key={j} style={{ display:"flex", alignItems:"center", gap:10 }}>
                        <img src={m.画像} alt="" style={{ height:34, maxWidth:210, objectFit:"contain",
                          border:"1px solid var(--line)", borderRadius:6, background:"#fff", flexShrink:0 }} />
                        <span style={{ fontSize:17, fontWeight:900,
                          color: m.値 == null ? "#b3261e" : "var(--ink)" }}>
                          {m.値 == null ? "読めず" : m.値.toLocaleString()}
                        </span>
                      </div>
                    ))}
                    {r.金額.length > 1 && (
                      <div style={{ fontSize:13, fontWeight:800, color:"var(--soft-text)",
                        borderTop:"1px solid var(--line)", paddingTop:8 }}>
                        合算　{r.合計.toLocaleString()}
                      </div>
                    )}
                  </div>
                )}

                <div style={{ display:"flex", alignItems:"center", gap:8, marginTop:11,
                  borderTop:"1px solid var(--line)", paddingTop:10 }}>
                  <span style={{ fontSize:12, color:"var(--sub)", fontWeight:800 }}>手で直す</span>
                  <input value={r.手入力 || ""} inputMode="numeric" placeholder="金額"
                    onChange={e => 直す(元, e.target.value)}
                    style={{ marginLeft:"auto", width:130, border:"1px solid var(--line)",
                      background:"var(--card, #fff)", color:"var(--ink)", borderRadius:8,
                      padding:"8px 10px", fontSize:14, textAlign:"right", outline:"none" }} />
                </div>
              </div>
            );
          })}

          <button onClick={CSVを出す}
            style={{ width:"100%", border:"1px solid var(--primary-soft)", background:"transparent",
              color:"var(--primary-soft)", borderRadius:12, padding:"13px", fontSize:14.5,
              fontWeight:900, cursor:"pointer" }}>結果をCSVで書き出す</button>
        </>
      )}
    </div>
  );
}

;Object.assign(window, { CheckTab });
