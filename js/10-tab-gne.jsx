/* GoodDay 鮮魚共有 — 10-tab-gne （自動分割・window共有） */
var { useState, useEffect, useCallback, useRef } = React;

const GNE_LAYOUT = {
  origin:   { x:44,  y:1118, size:84,  fill:"#ffffff", stroke:"#141414", sw:9,  align:"left",   maxW:1130 },
  name:     { x:600, y:1296, size:210, fill:"#ffffff", stroke:"#141414", sw:15, align:"center", maxW:1130 },
  count:    { x:46,  y:1588, size:140, fill:"#ffffff", stroke:"#141414", sw:12, align:"left",   maxW:235  },
  price:    { x:548, y:1545, size:255, fill:"#e31414", stroke:"#ffffff", sw:12, align:"center", maxW:560  },
  plus:     { x:872, y:1548, size:54,  fill:"#e31414", stroke:"#ffffff", sw:4,  align:"center" },
  yen:      { x:868, y:1628, size:58,  fill:"#141414", stroke:"#ffffff", sw:3,  align:"center" },
  taxLabel: { x:1050,y:1552, size:62,  fill:"#141414", stroke:"#ffffff", sw:3,  align:"center" },
  taxPrice: { x:1048,y:1632, size:74,  fill:"#e31414", stroke:"#ffffff", sw:5,  align:"center" },
};
const GNE_FIXED = { plus:"+税", yen:"円", taxLabel:"税込価格" };
const GNE_W = 1200, GNE_H = 1697;
const GNE_FONT_STACK = `"${GNE_FONT_NAME}", "Hiragino Sans", "Yu Gothic", sans-serif`;

function gneCalcTax(price, mode, rate) {
  const r = (rate == null || isNaN(+rate)) ? 8 : +rate;
  const raw = price * (1 + r / 100);
  if (mode === "ceil") return Math.ceil(raw);
  if (mode === "floor") return Math.floor(raw);
  return Math.round(raw);
}
function gneSanitize(s) { return String(s).replace(/[\\/:*?"<>|]/g, "_").trim(); }

function gneDrawField(ctx, text, cfg, font) {
  if (text == null || text === "") return;
  text = String(text);
  const fam = font ? `"${font.family}", "Hiragino Sans", sans-serif` : GNE_FONT_STACK;
  const wt = font ? font.weight : "900";
  let size = cfg.size;
  ctx.textAlign = cfg.align;
  ctx.textBaseline = "middle";
  ctx.font = `${wt} ${size}px ${fam}`;
  if (cfg.maxW) {
    while (ctx.measureText(text).width > cfg.maxW && size > 12) {
      size -= 4;
      ctx.font = `${wt} ${size}px ${fam}`;
    }
  }
  ctx.lineJoin = "round";
  ctx.miterLimit = 2;
  ctx.strokeStyle = cfg.stroke;
  ctx.lineWidth = cfg.sw * 2;
  ctx.strokeText(text, cfg.x, cfg.y);
  ctx.fillStyle = cfg.fill;
  ctx.fillText(text, cfg.x, cfg.y);
}

function gneRender(ctx, f, tpl, taxMode, font, taxRate, off) {
  const dx = (off && off.x) || 0, dy = (off && off.y) || 0;
  const sc = (off && off.scale) || 1;
  const fs = (off && off.fieldScale) || {};
  const GROUP = { origin:"origin", name:"name", count:"count", price:"price", plus:"price", yen:"price", taxLabel:"tax", taxPrice:"tax" };
  const L = {};
  for (const k in GNE_LAYOUT) {
    const o = GNE_LAYOUT[k];
    const fsc = ((fs[GROUP[k]] || 100) / 100) * sc;   // 全体倍率 × フィールド別倍率
    L[k] = { ...o, x: o.x + dx, y: o.y + dy, size: Math.round(o.size * fsc), sw: Math.max(1, Math.round(o.sw * fsc)) };
    if (o.maxW) L[k].maxW = o.maxW;  // 折り返し幅は据え置き（はみ出し防止）
  }
  ctx.clearRect(0, 0, GNE_W, GNE_H);
  if (tpl) {
    ctx.drawImage(tpl, 0, 0, GNE_W, GNE_H);
  } else {
    const g = ctx.createLinearGradient(0, 0, 0, GNE_H);
    g.addColorStop(0, "#cdddee"); g.addColorStop(1, "#aac2dd");
    ctx.fillStyle = g; ctx.fillRect(0, 0, GNE_W, GNE_H);
    ctx.fillStyle = "rgba(255,255,255,0.55)"; ctx.fillRect(40, 40, GNE_W - 80, 940);
    ctx.fillStyle = "#5a708c"; ctx.textAlign = "center"; ctx.textBaseline = "middle";
    ctx.font = `900 46px ${GNE_FONT_STACK}`;
    ctx.fillText("テンプレ画像を選択してください", GNE_W / 2, 500);
  }
  if (f.origin) gneDrawField(ctx, f.origin, L.origin, font);
  if (f.name)   gneDrawField(ctx, f.name,   L.name, font);
  if (f.count)  gneDrawField(ctx, f.count,  L.count, font);
  if (f.price !== "" && f.price != null && !isNaN(+f.price)) {
    const p = parseInt(f.price, 10);
    gneDrawField(ctx, String(p), L.price, font);
    gneDrawField(ctx, `${gneCalcTax(p, taxMode, taxRate)}円`, L.taxPrice, font);
  }
  gneDrawField(ctx, GNE_FIXED.plus, L.plus, font);
  gneDrawField(ctx, GNE_FIXED.yen, L.yen, font);
  gneDrawField(ctx, GNE_FIXED.taxLabel, L.taxLabel, font);
}

function GeneratorTab() {
  const previewRef = React.useRef(null);
  const tplInput = React.useRef(null);
  const xlsxInput = React.useRef(null);
  const [tpl, setTpl] = useState(null);
  const [fontId, setFontId] = useState(GNE_FONTS[0].id);
  const [loadedFonts, setLoadedFonts] = useState({});
  const font = GNE_FONTS.find(x => x.id === fontId) || GNE_FONTS[0];
  const [taxMode, setTaxMode] = useState("ceil");
  const [taxRate, setTaxRate] = useState(8);
  const [f, setF] = useState({ origin:"鹿児島県産（養殖・解凍）", name:"うなぎかば焼き", count:"1尾", price:"2390" });
  const [rows, setRows] = useState([]);
  const [busy, setBusy] = useState(false);
  const [status, setStatus] = useState("");

  // 選択フォント(woff2)をFontFaceで遅延ロード（読み込み済みはスキップ）
  useEffect(() => {
    if (loadedFonts[font.family]) return;
    if (!(document.fonts && window.FontFace)) return;
    let cancelled = false;
    const face = new FontFace(font.family, `url(${font.url})`, { weight: font.weight });
    face.load()
      .then((lf) => { if (cancelled) return; document.fonts.add(lf); setLoadedFonts((s) => ({ ...s, [font.family]: true })); })
      .catch(() => { if (!cancelled) setLoadedFonts((s) => ({ ...s, [font.family]: "failed" })); });
    return () => { cancelled = true; };
  }, [fontId]);

  const [gx, setGx] = useState(0);       // 文字位置オフセット（横：-120〜+120）
  const [gy, setGy] = useState(0);       // 文字位置オフセット（縦：-320〜+40）
  const [gScale, setGScale] = useState(100);  // 文字サイズ（%）：70〜130
  const [fScale, setFScale] = useState({ origin:100, name:100, count:100, price:100, tax:100 });  // フィールド別（%）

  useEffect(() => {
    const cv = previewRef.current; if (!cv) return;
    gneRender(cv.getContext("2d"), f, tpl, taxMode, font, taxRate, { x: gx, y: gy, scale: gScale / 100, fieldScale: fScale });
  }, [f, tpl, taxMode, fontId, loadedFonts, taxRate, gx, gy, gScale, fScale]);

  const onTpl = (file) => {
    if (!file) return;
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => { setTpl(img); URL.revokeObjectURL(url); };
    img.src = url;
  };

  const downloadOne = () => {
    const cv = previewRef.current;
    cv.toBlob((b) => { const a = document.createElement("a"); a.href = URL.createObjectURL(b); a.download = (gneSanitize(f.name) || "pop") + ".png"; a.click(); URL.revokeObjectURL(a.href); }, "image/png");
  };

  const onExcel = async (file) => {
    if (!file) return;
    setStatus("読み込み中…");
    try {
      await loadScriptOnce(XLSX_SRC);
      const buf = await file.arrayBuffer();
      const wb = XLSX.read(new Uint8Array(buf), { type:"array" });
      const ws = wb.Sheets[wb.SheetNames[0]];
      const json = XLSX.utils.sheet_to_json(ws, { defval:"" });
      const rs = json.map((r) => ({ origin:r["産地"] ?? "", name:r["商品名"] ?? "", count:r["個数"] ?? "", price:r["本体価格"] ?? "" })).filter((r) => r.name);
      setRows(rs);
      setStatus(`${rs.length} 件を読み込みました`);
    } catch (e) { setStatus("Excel読み込みに失敗しました"); }
  };

  const renderBlob = (row) => new Promise((res) => {
    const c = document.createElement("canvas"); c.width = GNE_W; c.height = GNE_H;
    gneRender(c.getContext("2d"), row, tpl, taxMode, font, taxRate, { x: gx, y: gy, scale: gScale / 100, fieldScale: fScale });
    c.toBlob((b) => res(b), "image/png");
  });

  const generateZip = useCallback(async () => {
    if (!rows.length) return;
    setBusy(true); setStatus("生成中…");
    try {
      await loadScriptOnce(JSZIP_SRC);
      const zip = new JSZip(); const used = {};
      for (let i = 0; i < rows.length; i++) {
        const blob = await renderBlob(rows[i]);
        let base = gneSanitize(rows[i].name) || `pop_${i + 1}`;
        if (used[base]) { used[base]++; base = `${base}_${used[base]}`; } else { used[base] = 1; }
        zip.file(`${base}.png`, blob);
        setStatus(`生成中… ${i + 1}/${rows.length}`);
      }
      const out = await zip.generateAsync({ type:"blob" });
      const a = document.createElement("a"); a.href = URL.createObjectURL(out); a.download = "pop_output.zip"; a.click(); URL.revokeObjectURL(a.href);
      setStatus(`完了：${rows.length} 件を ZIP 出力しました`);
    } catch (e) { setStatus("ZIP生成に失敗しました（通信制限の可能性）"); }
    finally { setBusy(false); }
  }, [rows, tpl, taxMode, fontId, taxRate, gx, gy, gScale, fScale]);

  const set = (k) => (e) => setF((p) => ({ ...p, [k]: e.target.value }));
  const taxPreview = f.price && !isNaN(+f.price) ? `${gneCalcTax(parseInt(f.price, 10), taxMode, taxRate)}円` : "—";
  const fontSt = loadedFonts[font.family];
  const fontNote = fontSt === true ? "" : fontSt === "failed" ? "（このフォントは取得失敗・代替表示中）" : "（フォント読込中…）";

  const card = { background:"#fff", borderRadius:14, boxShadow:"0 2px 12px rgba(0,0,0,0.06)", padding:16 };
  const ACC = "#7c3aed";

  return (
    <div style={{ maxWidth:1080, margin:"0 auto", padding:16, animation:"fadeUp .3s ease" }}>
      <div style={{ fontSize:22, fontWeight:900, color:"var(--ink)", marginBottom:4 }}>GNE｜POP画像ジェネレーター</div>
      <div style={{ fontSize:13, color:"var(--sub)", marginBottom:16 }}>柄テンプレに文字を焼いて PNG 出力。単品ライブ編集と Excel 一括（ZIP）に対応。</div>

      <div style={{ display:"grid", gridTemplateColumns:"minmax(0, 1fr)", gap:14 }}>
        <div style={card}>
          <div style={{ fontSize:14, fontWeight:800, color:"var(--ink)", marginBottom:8 }}>テンプレ画像（文字なし・1200×1697推奨）</div>
          <button onClick={() => tplInput.current && tplInput.current.click()} style={{ border:"1px dashed #ccc", background:"var(--bg)", borderRadius:10, padding:"10px 14px", fontSize:14, fontWeight:700, color:"var(--text)", cursor:"pointer" }}>画像を選択</button>
          {tpl && <span style={{ marginLeft:10, fontSize:12, color:"#2f6fb0", fontWeight:700 }}>読込済み</span>}
          <input ref={tplInput} type="file" accept="image/*" onChange={(e) => onTpl(e.target.files[0])} style={{ display:"none" }} />
        </div>

        <div style={card}>
          <div style={{ fontSize:12, color:"var(--sub)", marginBottom:8 }}>プレビュー {fontNote}</div>
          <canvas ref={previewRef} width={GNE_W} height={GNE_H} style={{ width:"100%", maxWidth:"100%", height:"auto", borderRadius:10, border:"1px solid var(--line)", display:"block" }} />
        </div>

        <div style={card}>
          <div style={{ fontSize:14, fontWeight:800, color:"var(--ink)", marginBottom:4 }}>文字の位置・サイズ</div>
          <div style={{ fontSize:11.5, color:"var(--sub)", marginBottom:12 }}>文字ブロック全体の位置と大きさを変えられます。ボタンでざっくり→スライダーで微調整</div>
          <div style={{ display:"flex", gap:14, alignItems:"flex-start" }}>
            <div style={{ display:"grid", gridTemplateColumns:"repeat(3, 44px)", gap:5, flexShrink:0 }}>
              {[[-90,-300,"↖"],[0,-300,"↑"],[90,-300,"↗"],[-90,-150,"←"],[0,-150,"・"],[90,-150,"→"],[-90,0,"↙"],[0,0,"↓"],[90,0,"↘"]].map(([px,py,lbl],i) => {
                const on = gx === px && gy === py;
                return (
                  <button key={i} onClick={() => { setGx(px); setGy(py); }}
                    style={{ width:44, height:44, border: on ? "2px solid var(--primary)" : "1px solid var(--line)", background: on ? "var(--soft)" : "#fff", color: on ? "var(--primary)" : "var(--text)", borderRadius:10, fontSize:16, fontWeight:900, cursor:"pointer" }}>{lbl}</button>
                );
              })}
            </div>
            <div style={{ flex:1, minWidth:0 }}>
              <div style={{ fontSize:11.5, fontWeight:800, color:"var(--text)", marginBottom:2 }}>横（左 ⇄ 右）：{gx > 0 ? `+${gx}` : gx}</div>
              <input type="range" min={-120} max={120} step={5} value={gx} onChange={e => setGx(+e.target.value)} style={{ width:"100%" }} />
              <div style={{ fontSize:11.5, fontWeight:800, color:"var(--text)", margin:"10px 0 2px" }}>縦（上 ⇄ 下）：{gy > 0 ? `+${gy}` : gy}</div>
              <input type="range" min={-320} max={40} step={5} value={gy} onChange={e => setGy(+e.target.value)} style={{ width:"100%" }} />
              <div style={{ fontSize:11.5, fontWeight:800, color:"var(--text)", margin:"10px 0 2px" }}>文字サイズ（全体）：{gScale}%</div>
              <input type="range" min={70} max={130} step={5} value={gScale} onChange={e => setGScale(+e.target.value)} style={{ width:"100%" }} />
            </div>
          </div>

          <div style={{ height:1, background:"var(--line)", margin:"14px 0 12px" }} />
          <div style={{ fontSize:12.5, fontWeight:900, color:"var(--ink)", marginBottom:8 }}>フィールド別サイズ</div>
          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:"8px 14px" }}>
            {[["origin","産地"],["name","商品名"],["count","個数"],["price","価格"],["tax","税込表示"]].map(([k, lbl]) => (
              <div key={k} style={{ display:"flex", alignItems:"center", gap:6 }}>
                <span style={{ fontSize:12, fontWeight:800, color:"var(--text)", width:56, flexShrink:0 }}>{lbl}</span>
                <button onClick={() => setFScale(v => ({ ...v, [k]: Math.max(60, v[k] - 10) }))}
                  style={{ width:30, height:30, border:"1px solid var(--line)", background:"#fff", borderRadius:8, fontSize:15, fontWeight:900, color:"var(--text)", cursor:"pointer", lineHeight:1 }}>−</button>
                <span style={{ fontSize:12, fontWeight:900, color: fScale[k] !== 100 ? "var(--primary)" : "var(--sub)", width:40, textAlign:"center" }}>{fScale[k]}%</span>
                <button onClick={() => setFScale(v => ({ ...v, [k]: Math.min(160, v[k] + 10) }))}
                  style={{ width:30, height:30, border:"1px solid var(--line)", background:"#fff", borderRadius:8, fontSize:15, fontWeight:900, color:"var(--text)", cursor:"pointer", lineHeight:1 }}>＋</button>
              </div>
            ))}
          </div>
          <div style={{ display:"flex" }}>
              {(gx !== 0 || gy !== 0 || gScale !== 100 || Object.values(fScale).some(v => v !== 100)) && (
                <button onClick={() => { setGx(0); setGy(0); setGScale(100); setFScale({ origin:100, name:100, count:100, price:100, tax:100 }); }}
                  style={{ marginTop:12, border:"1px solid var(--line)", background:"#fff", color:"var(--text)", borderRadius:9, padding:"7px 14px", fontSize:12, fontWeight:800, cursor:"pointer" }}>標準に戻す</button>
              )}
          </div>
          <div style={{ fontSize:11, color:"var(--faint)", marginTop:10 }}>※ Excelからの一括生成にも同じ位置・サイズが適用されます</div>
        </div>

        <div style={card}>
          <div style={{ fontSize:14, fontWeight:800, color:"var(--ink)", marginBottom:10 }}>フォント</div>
          <div style={{ display:"flex", gap:8, overflowX:"auto", paddingBottom:4 }}>
            {GNE_FONTS.map(o => {
              const on = o.id === fontId;
              return (
                <button key={o.id} onClick={() => setFontId(o.id)}
                  style={{ flexShrink:0, border:`2px solid ${on?ACC:"#e6e0f5"}`, background:on?ACC:"#faf8ff", color:on?"#fff":"#6b4bb0",
                    borderRadius:12, padding:"9px 14px", fontSize:14, fontWeight:800, cursor:"pointer", whiteSpace:"nowrap" }}>
                  {o.label}
                </button>
              );
            })}
          </div>
        </div>

        <div style={{ ...card, display:"flex", flexDirection:"column", gap:10 }}>
          <div style={{ fontSize:14, fontWeight:800, color:"var(--ink)" }}>単品入力（ライブプレビュー）</div>
          {[["産地","origin"],["商品名","name"],["個数","count"],["本体価格","price"]].map(([label, key]) => (
            <div key={key}>
              <div style={{ fontSize:12, color:"var(--sub)", marginBottom:4 }}>{label}</div>
              <input value={f[key]} onChange={set(key)} inputMode={key === "price" ? "numeric" : "text"}
                style={{ width:"100%", border:"1px solid var(--line)", borderRadius:10, padding:"10px 12px", fontSize:15 }} />
            </div>
          ))}
          <div style={{ display:"flex", flexDirection:"column", gap:10 }}>
            <div style={{ display:"flex", alignItems:"center", gap:10, flexWrap:"wrap" }}>
              <span style={{ fontSize:12, color:"var(--sub)" }}>税込丸め</span>
              <select value={taxMode} onChange={(e) => setTaxMode(e.target.value)} style={{ border:"1px solid var(--line)", borderRadius:8, padding:"6px 8px", fontSize:14 }}>
                <option value="ceil">切り上げ</option>
                <option value="round">四捨五入</option>
                <option value="floor">切り捨て</option>
              </select>
              <span style={{ fontSize:12, color:"var(--sub)" }}>税込（{taxRate}%）：<b style={{ color:"var(--ink)" }}>{taxPreview}</b></span>
            </div>
            <div style={{ display:"flex", alignItems:"center", gap:6, flexWrap:"wrap" }}>
              <span style={{ fontSize:12, color:"var(--sub)", marginRight:2 }}>税率</span>
              {[1,2,3,4,5,6,7,8,9,10].map(r => (
                <button key={r} onClick={() => setTaxRate(r)}
                  style={{ minWidth:36, padding:"6px 0", borderRadius:8, fontSize:13, fontWeight:800, cursor:"pointer",
                    border: taxRate === r ? `2px solid ${ACC}` : "1px solid var(--line)",
                    background: taxRate === r ? ACC : "#fff",
                    color: taxRate === r ? "#fff" : "#555" }}>{r}%</button>
              ))}
            </div>
          </div>
          <button onClick={downloadOne} style={{ width:"100%", border:"none", background:ACC, color:"#fff", borderRadius:10, padding:"12px", fontSize:15, fontWeight:800, cursor:"pointer" }}>この1枚を PNG ダウンロード</button>
        </div>

        <div style={{ ...card, display:"flex", flexDirection:"column", gap:10 }}>
          <div style={{ fontSize:14, fontWeight:800, color:"var(--ink)" }}>Excel 一括（products.xlsx）</div>
          <div style={{ fontSize:12, color:"var(--sub)" }}>列：産地／商品名／個数／本体価格。読み込んで ZIP で一括出力。</div>
          <button onClick={() => xlsxInput.current && xlsxInput.current.click()} style={{ border:"1px dashed #ccc", background:"var(--bg)", borderRadius:10, padding:"10px 14px", fontSize:14, fontWeight:700, color:"var(--text)", cursor:"pointer", width:"fit-content" }}>.xlsx を選択</button>
          <input ref={xlsxInput} type="file" accept=".xlsx,.xls" onChange={(e) => onExcel(e.target.files[0])} style={{ display:"none" }} />
          <button onClick={generateZip} disabled={!rows.length || busy}
            style={{ width:"100%", border:"none", background:(!rows.length || busy) ? "#cbb8ef" : "#2f6fb0", color:"#fff", borderRadius:10, padding:"12px", fontSize:15, fontWeight:800, cursor:(!rows.length || busy) ? "default" : "pointer" }}>
            {busy ? "生成中…" : (rows.length ? `${rows.length} 件を ZIP 出力` : "ファイル未読込")}
          </button>
          {status && <div style={{ fontSize:12, color:"var(--sub)" }}>{status}</div>}
        </div>
      </div>
    </div>
  );
}


// ===== 相場タブ：先週比の「相場安」計算＋売価計算（プロトタイプ） =====
function soubaWari(pct) {
  const w = Math.round(Math.abs(pct) / 10 * 2) / 2; // 0.5割きざみ
  if (w <= 0) return "";
  const s = Number.isInteger(w) ? String(w) : w.toFixed(1);
  return `約${s}割`;
}

// ===== POP診断：画像をブラウザ内で解析（外部送信なし） =====


;Object.assign(window, { GNE_FIXED, GNE_FONT_STACK, GNE_LAYOUT, GNE_W, GeneratorTab, gneCalcTax, gneDrawField, gneRender, gneSanitize, soubaWari });
