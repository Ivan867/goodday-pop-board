/* GoodDay 鮮魚共有 — 08-tab-barcode （自動分割・window共有） */
var { useState, useEffect, useCallback, useRef } = React;

function BarcodeTab() {
  const ACCENT = "var(--primary)";
  const [libsReady, setLibsReady] = useState(typeof XLSX !== "undefined" && typeof JsBarcode !== "undefined");
  useEffect(() => {
    let alive = true;
    Promise.all([loadScriptOnce(XLSX_SRC), loadScriptOnce(JSBARCODE_SRC)])
      .then(() => { if (alive) setLibsReady(true); }).catch(e => console.error(e));
    return () => { alive = false; };
  }, []);

  const [master, setMaster] = useState([]);            // [{name,bcode,pcode,kubun,haccyu}]（重複除去済み）
  const [cat, setCat] = useState("tray");              // 選択中カテゴリ
  const [fileName, setFileName] = useState("");
  const [err, setErr] = useState("");
  const [over, setOver] = useState(false);
  const [search, setSearch] = useState("");
  const [list, setList] = useState([]);                // 作業リスト（印刷対象・順序つき）
  const [cols, setCols] = useState(4);
  const [showName, setShowName] = useState(true);
  const [listName, setListName] = useState("");
  const [srcOpen, setSrcOpen] = useState(true);
  const fileRef = React.useRef(null);
  const cfgRef = React.useRef(null);
  const sharedRef = React.useRef(null);
  const pdfRef = React.useRef(null);
  const [shAdmin, setShAdmin] = useState(false);
  const [shPwOpen, setShPwOpen] = useState(false);
  const [shPw, setShPw] = useState("");
  const [shPwErr, setShPwErr] = useState("");
  const [shSel, setShSel] = useState(() => new Set());
  const [shConfirm, setShConfirm] = useState(false);
  const [shBusy, setShBusy] = useState(false);
  const [shTab, setShTab] = useState("pdf");
  const [shared, setShared] = useState([]);
  const [sharedLoad, setSharedLoad] = useState(true);
  const previewRef = React.useRef(null);

  const [portalEl] = useState(() => { const el = document.createElement("div"); el.id = "barcode-print-portal"; return el; });
  useEffect(() => { document.body.appendChild(portalEl); return () => { try { document.body.removeChild(portalEl); } catch(e){} }; }, [portalEl]);

  const findCol = (header, cands) => {
    for (const c of cands) { const i = header.findIndex(x => String(x).replace(/\s/g,"") === c); if (i>=0) return i; }
    for (const c of cands) { const key = c.slice(0,6); const i = header.findIndex(x => String(x).includes(key)); if (i>=0) return i; }
    return -1;
  };

  // マスタ（エクセル）読み込み：全シート・スキャニングコードのある全商品を取得（区分は問わない）
  const handleFile = (file) => {
    if (!file) return;
    setErr("");
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        if (typeof XLSX === "undefined") throw new Error("ライブラリ読み込み中です。少し待って再試行してください");
        const wb = XLSX.read(new Uint8Array(e.target.result), { type:"array" });
        const out = []; const seen = new Set();
        wb.SheetNames.forEach(sheet => {
          const rows = XLSX.utils.sheet_to_json(wb.Sheets[sheet], { header:1, defval:"", raw:false });
          if (!rows.length) return;
          const header = rows[0];
          const iScan  = findCol(header, ["スキャニングコード1"]);
          const iKubun = findCol(header, ["スキャニングコード区分1"]);
          const iCode  = findCol(header, ["商品コード"]);
          const iName  = findCol(header, ["商品名(漢字_全角25文字)","商品名(漢字","商品名"]);
          const iHac   = findCol(header, ["発注先コード1"]);
          if (iScan < 0) return;
          for (let r=1; r<rows.length; r++) {
            const row = rows[r]; if (!row) continue;
            const bcode = String(row[iScan]).trim();
            if (!bcode || seen.has(bcode)) continue;
            seen.add(bcode);
            const pcode = iCode>=0 ? String(row[iCode]).trim() : "";
            const haccyu = iHac>=0 ? String(row[iHac]||"").trim() : "";
            const kubun = iKubun>=0 ? String(row[iKubun]).trim() : "";
            let name = iName>=0 ? String(row[iName]||"") : "";
            name = name.replace(/\u3000/g," ").replace(/\s+/g," ").trim();
            out.push({ name, pcode, bcode, kubun, haccyu });
          }
        });
        if (!out.length) throw new Error("スキャニングコードのデータが見つかりませんでした");
        setMaster(out); setFileName(file.name);
      } catch(ex) { setErr(ex.message); setMaster([]); setFileName(""); }
    };
    reader.readAsArrayBuffer(file);
  };

  const inList = (bcode) => list.some(it => it.bcode === bcode);
  const addItem = (it) => { if (inList(it.bcode)) return; setList(prev => [...prev, it]); };
  const removeItem = (bcode) => setList(prev => prev.filter(it => it.bcode !== bcode));
  const moveItem = (i, dir) => {
    setList(prev => { const j=i+dir; if (j<0||j>=prev.length) return prev; const a=prev.slice(); const [m]=a.splice(i,1); a.splice(j,0,m); return a; });
  };

  // 設定の書き出し／読み込み（テキスト）
  const exportCfg = () => {
    if (!list.length) return;
    const nm = (prompt("プリセット名（ファイル名）", listName || "発注リスト") || "発注リスト").trim();
    setListName(nm);
    const data = { type:"tray-list", v:2, name:nm, savedAt:new Date().toISOString(), items:list };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type:"text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a"); a.href = url; a.download = `${nm}.txt`;
    document.body.appendChild(a); a.click(); document.body.removeChild(a); URL.revokeObjectURL(url);
  };
  const importCfg = (file) => {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const parsed = JSON.parse(String(e.target.result));
        const items = Array.isArray(parsed) ? parsed : parsed.items;
        if (!Array.isArray(items)) throw new Error("形式が違います");
        const clean = items.filter(x => x && x.bcode).map(x => ({ name:x.name||"", pcode:x.pcode||"", bcode:String(x.bcode), kubun:x.kubun||"", haccyu:x.haccyu||"" }));
        setList(clean); if (parsed && parsed.name) setListName(parsed.name); setErr("");
      } catch(ex) { setErr("プリセットを読み込めませんでした"); }
    };
    reader.readAsText(file);
    if (cfgRef.current) cfgRef.current.value = "";
  };

  const drag = useDragList(list, setList, setList);

  useEffect(() => {
    api.listSharedPresets().then(d => { setShared(d); setSharedLoad(false); }).catch(() => setSharedLoad(false));
  }, []);
  const cleanItems = (items) => (items || []).filter(x => x && x.bcode).map(x => ({ name:x.name||"", pcode:x.pcode||"", bcode:String(x.bcode), kubun:x.kubun||"", haccyu:x.haccyu||"" }));
  const readText = (f) => new Promise((res, rej) => { const r = new FileReader(); r.onload = e => res(String(e.target.result)); r.onerror = rej; r.readAsText(f); });
  const loadShared = (p) => {
    if (master.length === 0) return;
    setList(cleanItems(p.data && p.data.items));
    setListName(p.name || (p.data && p.data.name) || ""); setErr("");
    scrollerTop(true);
  };
  const downloadShared = (p) => {
    if (master.length === 0) return;
    const data = { type:"tray-list", v:2, name:p.name||"preset", items: cleanItems(p.data && p.data.items) };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type:"text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a"); a.href=url; a.download=`${p.name||"preset"}.txt`;
    document.body.appendChild(a); a.click(); document.body.removeChild(a); URL.revokeObjectURL(url);
  };
  const uploadShared = async (files) => {
    const arr = Array.from(files || []); if (!arr.length) return;
    let base = shared.length;
    for (const f of arr) {
      try {
        const parsed = JSON.parse(await readText(f));
        const items = Array.isArray(parsed) ? parsed : parsed.items;
        if (!Array.isArray(items)) continue;
        const nm = (parsed && parsed.name) ? parsed.name : f.name.replace(/\.(txt|json)$/i, "");
        const row = await api.insertSharedPreset({ name:nm, data:{ type:"tray-list", v:2, name:nm, items: cleanItems(items) }, sort_order: base++ });
        setShared(s => [...s, row]);
      } catch(ex) {}
    }
    if (sharedRef.current) sharedRef.current.value = "";
  };
  const uploadSharedPdf = async (files) => {
    const arr = Array.from(files || []).filter(f => /pdf/i.test(f.type) || /\.pdf$/i.test(f.name));
    if (!arr.length) return;
    let base = shared.length;
    for (const f of arr) {
      try {
        const url = await api.uploadRaw(f);
        const nm = f.name.replace(/\.pdf$/i, "");
        const row = await api.insertSharedPreset({ name: nm, data: {}, pdf_url: url, sort_order: base++ });
        setShared(s => [...s, row]);
      } catch(ex) { alert("PDFの登録に失敗しました：" + (f.name || "")); }
    }
    if (pdfRef.current) pdfRef.current.value = "";
  };
  const downloadPdf = async (p) => {
    try {
      const res = await fetch(p.pdf_url);
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a"); a.href = url; a.download = (p.name || "preset") + ".pdf";
      document.body.appendChild(a); a.click(); document.body.removeChild(a); URL.revokeObjectURL(url);
    } catch(ex) { window.open(p.pdf_url, "_blank"); }
  };
  const unlockShAdmin = async () => {
    try {
      const ok = await api.verifyPassword("admin", shPw);
      if (ok) { setShAdmin(true); setShPwOpen(false); setShPw(""); setShPwErr(""); }
      else setShPwErr("パスワードが違います");
    } catch(ex) { setShPwErr("確認に失敗しました"); }
  };
  const toggleShSel = (id) => setShSel(s => { const n = new Set(s); n.has(id) ? n.delete(id) : n.add(id); return n; });
  const bulkDelShared = async () => {
    if (shSel.size === 0) return;
    setShBusy(true);
    try {
      for (const id of Array.from(shSel)) { await api.delSharedPreset(id); }
      setShared(s => s.filter(x => !shSel.has(x.id)));
      setShSel(new Set()); setShConfirm(false);
    } catch(ex) { alert("削除に失敗しました"); }
    setShBusy(false);
  };

  useEffect(() => {
    const draw = (root) => {
      if (!root || typeof JsBarcode === "undefined") return;
      root.querySelectorAll("svg[data-code]").forEach(svg => {
        try {
          const code = svg.getAttribute("data-code") || "";
          // 規格の使い分け：0始まりの店内コードはCODE128、メーカーJAN（13桁・チェックデジット正）はEAN-13で印字
          const isJan = /^[1-9]\d{12}$/.test(code) && (() => {
            const d = code.split("").map(Number);
            return ((10 - (d.slice(0,12).filter((_,i)=>i%2===0).reduce((a,b)=>a+b,0) + 3 * d.slice(0,12).filter((_,i)=>i%2===1).reduce((a,b)=>a+b,0)) % 10) % 10) === d[12];
          })();
          JsBarcode(svg, code, { format: isJan ? "EAN13" : "CODE128", displayValue:false, margin:0, height:42, width:2, flat:true });
          const w = svg.getAttribute("width"), hh = svg.getAttribute("height");
          if (w && hh) { svg.setAttribute("viewBox", `0 0 ${w} ${hh}`); svg.removeAttribute("width"); svg.removeAttribute("height"); svg.setAttribute("preserveAspectRatio", "none"); }
        } catch(e){}
      });
    };
    draw(previewRef.current); draw(portalEl);
  }, [list, cols, showName, portalEl, libsReady]);

  // カテゴリ別カウント
  const catCount = (c) => c.codes===null ? master.length : master.filter(m => c.codes.includes(m.haccyu)).length;

  // ── 会社（発注先コード）ごとの色分け：同じコードは常に同じ色になるよう決定的に生成 ──
  // ── 納品会社（5社・色＋模様）：使用者が各バーコードに手動で割り当てる ──
  const COMPANIES = [
    { key:"ueda",      name:"上田包装",  color:"#2f6fb0", pat:"yoko" },   // 青・横しま
    { key:"hinode",    name:"日の出包装", color:"#2f8a52", pat:"dot"  },   // 緑・ドット
    { key:"cgc",       name:"CGC",       color:"#7b5ea7", pat:"tate" },   // 紫・縦しま
    { key:"kobayashi", name:"小林冷蔵",  color:"#c0392b", pat:"naname" }, // 赤・ななめ
    { key:"sanrei",    name:"さんれい",  color:"#e08a1e", pat:"grid" },   // オレンジ・格子
    { key:"daikou",    name:"大幸",      color:"#0e8f9e", pat:"yoko" },   // ティール・横しま
    { key:"moranbon",  name:"モランボン", color:"#b0517f", pat:"dot" },    // ローズ・ドット
    { key:"daisho",    name:"ダイショー", color:"#3f51b5", pat:"naname2" },// インディゴ・逆ななめ
    { key:"nihonshokken", name:"日本食研", color:"#8a6d1f", pat:"tate" },  // 金茶・縦しま
  ];
  const companyPatStyle = (c) => {
    if (!c) return { background:"#eef1f4" };
    const col = c.color;
    if (c.pat === "yoko")   return { background:`repeating-linear-gradient(0deg, ${col} 0px, ${col} 1.6px, #fff 1.6px, #fff 4.6px)` };
    if (c.pat === "tate")   return { background:`repeating-linear-gradient(90deg, ${col} 0px, ${col} 1.6px, #fff 1.6px, #fff 4.6px)` };
    if (c.pat === "naname") return { background:`repeating-linear-gradient(45deg, ${col} 0px, ${col} 2px, #fff 2px, #fff 5.6px)` };
    if (c.pat === "naname2") return { background:`repeating-linear-gradient(-45deg, ${col} 0px, ${col} 2px, #fff 2px, #fff 5.6px)` };
    if (c.pat === "dot")    return { background:`radial-gradient(${col} 1.2px, transparent 1.35px)`, backgroundSize:"5.5px 5.5px", backgroundColor:"#fff" };
    if (c.pat === "grid")   return { background:`repeating-linear-gradient(0deg, ${col} 0px, ${col} 1.3px, transparent 1.3px, transparent 5px), repeating-linear-gradient(90deg, ${col} 0px, ${col} 1.3px, #fff 1.3px, #fff 5px)` };
    return { background: col };
  };
  const [bcCompany, setBcCompany] = useState(() => {
    try { return JSON.parse(localStorage.getItem("bcCompanyMap") || "{}"); } catch(e) { return {}; }
  });
  const setCompanyFor = (bcode, key) => {
    const next = { ...bcCompany };
    if (key) next[bcode] = key; else delete next[bcode];
    setBcCompany(next);
    try { localStorage.setItem("bcCompanyMap", JSON.stringify(next)); } catch(e) {}
  };
  const companyOf = (it) => COMPANIES.find(c => c.key === bcCompany[it.bcode]) || null;

  const COMPANY_PALETTE = ["#2f6fb0","#e0245e","#2f8a52","#e08a1e","#7b5ea7","#0e8f9e","#c0392b","#5a7d2a","#b0517f","#4a6fa5","#a9741f","#3f7d7d"];
  const companyColor = (arg) => {
    // オブジェクト（item）で渡された場合は会社割当を優先
    if (arg && typeof arg === "object") {
      const c = companyOf(arg);
      if (c) return c.color;
      arg = arg.haccyu;
    }
    const s = String(arg || "");
    if (!s) return "#9aa4ae";
    let h = 0; for (let i=0;i<s.length;i++) h = (h*31 + s.charCodeAt(i)) >>> 0;
    return COMPANY_PALETTE[h % COMPANY_PALETTE.length];
  };

  // ── 用途タグ：各バーコード（bcode）に手動で付ける。localStorageに保存 ──
  const USE_TAGS = ["刺身","寿司","寿司惣菜","惣菜","定番","スライス"];
  const [useTags, setUseTags] = useState(() => {
    try { return JSON.parse(localStorage.getItem("bcUseTags") || "{}"); } catch(e) { return {}; }
  });
  const [useFilter, setUseFilter] = useState("");   // 用途での絞り込み（空=すべて）
  const [tagEditFor, setTagEditFor] = useState(null); // タグ編集中のbcode
  const saveUseTags = (next) => {
    setUseTags(next);
    try { localStorage.setItem("bcUseTags", JSON.stringify(next)); } catch(e) {}
  };
  const toggleUseTag = (bcode, tag) => {
    const cur = useTags[bcode] || [];
    const has = cur.includes(tag);
    const nextTags = has ? cur.filter(t => t !== tag) : [...cur, tag];
    const next = { ...useTags };
    if (nextTags.length) next[bcode] = nextTags; else delete next[bcode];
    saveUseTags(next);
  };

  // 一覧（カテゴリ＋検索で絞り込み）
  const activeCat = TRAY_CATS.find(c => c.key===cat) || TRAY_CATS[0];
  const q = normJa(search.trim());
  const base = activeCat.codes===null ? master : master.filter(m => activeCat.codes.includes(m.haccyu));
  const srcFilteredRaw = q ? base.filter(it => normJa(it.name).includes(q) || it.bcode.includes(q) || it.pcode.includes(q)) : base;
  const srcFiltered = useFilter ? srcFilteredRaw.filter(it => (useTags[it.bcode] || []).includes(useFilter)) : srcFilteredRaw;
  const srcShown = srcFiltered;

  const ROWS = 4;
  const perPage = cols * ROWS;                 // 4列×4行＝16枚/ページ
  const pages = [];
  for (let i=0; i<list.length; i+=perPage) pages.push(list.slice(i, i+perPage));

  // 商品名を幅に合わせて自動縮小（全角=1em・半角≒0.55emで概算し、セル幅に収まるptを算出）
  const _emUnits = (name) => { let u=0; for (const c of String(name||"")) u += /[\u3040-\u30ff\u3400-\u9fff\uff00-\uffef\u2e80-\u303f]/.test(c) ? 1.0 : 0.55; return u || 1; };
  const _availMm = 277/cols - 7;                       // セル内で名前に使えるおおよその幅(mm)
  const nameFitPt = (name) => Math.max(7, Math.min(16, (_availMm*2.835)/_emUnits(name)));

  // ページ単位で描画。gridAutoFlow:"column" で「列ごとに上→下」の縦順に並ぶ。
  const renderPages = (forPrint) => pages.map((pg, pi) => (
    <div key={pi} className="bc-page"
      style={ forPrint
        ? { breakAfter:"page", pageBreakAfter:"always", position:"relative", height:"192mm" }
        : { position:"relative", aspectRatio:"297 / 210", border:"1px solid #d8dbe0", borderRadius:6, background:"#fff", padding:"5mm", marginBottom:22, boxShadow:"0 1px 6px rgba(0,0,0,0.07)" } }>
      {!forPrint && <div style={{ position:"absolute", top:-9, left:14, background:"var(--bg)", padding:"0 8px", fontSize:11, fontWeight:800, color:"var(--sub)" }}>{pi+1}ページ目（{pg.length}枚）</div>}
      <div className="bc-grid" style={{ display:"grid", gridTemplateColumns:`repeat(${cols},minmax(0,1fr))`, gridTemplateRows: forPrint?`repeat(${ROWS}, 40mm)`:`repeat(${ROWS}, minmax(0,1fr))`, gridAutoFlow:"column", gap: forPrint?"3mm":"2mm", height: forPrint?"auto":"100%" }}>
        {pg.map(it => {
          const comp = companyOf(it);
          const cc = companyColor(it);
          const tags = useTags[it.bcode] || [];
          return (
          <div key={it.bcode} className="bc-label"
            style={{ position:"relative", border:"1px solid #cfd8de", borderLeft:`${forPrint?"1.5mm":"4px"} solid ${cc}`, borderRadius:4, padding: forPrint?"2mm 1.5mm":"3px", paddingTop: comp ? (forPrint?"4.5mm":"11px") : undefined, breakInside:"avoid", display:"grid", minWidth:0, minHeight:0, gridTemplateRows: showName?"auto auto auto":"auto auto", alignContent:"center", justifyItems:"center", rowGap: forPrint?"1.5mm":"2px", background:"#fff", overflow:"hidden", textAlign:"center" }}>
            {comp && (
              <div style={{ position:"absolute", top:0, left:0, right:0, height: forPrint?"3.6mm":"9px", ...companyPatStyle(comp), borderBottom:`1px solid ${comp.color}`, display:"flex", alignItems:"center" }}>
                <span style={{ marginLeft: forPrint?"1.5mm":"3px", background:"#fff", border:`1px solid ${comp.color}`, color:comp.color, fontWeight:900, fontSize: forPrint?"6.5pt":"6px", borderRadius:3, padding: forPrint?"0 1.2mm":"0 3px", lineHeight:1.5, whiteSpace:"nowrap" }}>{comp.name}</span>
              </div>
            )}
            {tags.length>0 && <div style={{ position:"absolute", top: comp ? (forPrint?"0.4mm":"1px") : (forPrint?"1mm":"2px"), right: forPrint?"1.5mm":"3px", fontSize: forPrint?"8pt":"7px", fontWeight:800, color:cc, background: comp?"#fff":"transparent", borderRadius:3, padding: comp?"0 3px":0, lineHeight:1.5 }}>{tags[0]}</div>}
            {showName && <div style={{ fontSize: forPrint ? nameFitPt(it.name)+"pt" : "9.5px", fontWeight:800, lineHeight:1.2, color:"#000", width:"100%", overflow:"hidden", whiteSpace:"normal", wordBreak:"break-word" }}>{it.name}</div>}
            <div style={{ width:"100%", height: forPrint?"16mm":"28px" }}>
              <svg data-code={it.bcode} preserveAspectRatio="none" style={{ width:"100%", height:"100%", display:"block" }}></svg>
            </div>
            <div style={{ fontSize: forPrint?"15pt":"9px", fontWeight:700, letterSpacing: forPrint?"0.4mm":"0.2px", color:"var(--ink)", lineHeight:1 }}>{it.bcode}</div>
          </div>
        );})}
      </div>
      {listName && <div style={{ position:"absolute", right: forPrint?"4mm":"8px", bottom: forPrint?"2mm":"7px", fontSize: forPrint?"20pt":"18px", fontWeight:800, color:"var(--text)", letterSpacing:".02em" }}>{listName}</div>}
    </div>
  ));

  const seg = (active) => ({ padding:"7px 14px", border:"none", fontSize:13, fontWeight:700, cursor:"pointer", background: active?ACCENT:"#fff", color: active?"#fff":"#888" });
  const card = { background:"white", borderRadius:16, padding:"18px 20px", boxShadow:"0 2px 12px rgba(0,0,0,0.07)", marginBottom:16 };

  return (
    <div style={{ maxWidth:1080, margin:"0 auto", padding:"20px 16px 80px" }}>

      {/* 設定の保存・読み込み */}
      <div style={card}>
        <div style={{ fontSize:14, fontWeight:900, color:"var(--ink)", marginBottom:10 }}>発注バーコード生成</div>
        <div style={{ fontSize:12, color:"#8a6d00", background:"#fff8e1", border:"1px solid #ffe6a0", borderRadius:8, padding:"7px 11px", marginBottom:13, lineHeight:1.55 }}>※ この画面はパソコンのブラウザでの操作を推奨します（スマートフォンでは一覧が多いと動作が重くなる場合があります）。</div>
        <div style={{ display:"flex", gap:9, flexWrap:"wrap" }}>
          <button onClick={()=>cfgRef.current && cfgRef.current.click()} style={{ border:`1.5px solid ${ACCENT}`, background:"#fff", color:ACCENT, borderRadius:9, padding:"9px 14px", fontSize:13, fontWeight:800, cursor:"pointer" }}>プリセット読み込み</button>
          <button onClick={exportCfg} disabled={!list.length} style={{ border:"none", background: list.length?ACCENT:"#ccc", color:"#fff", borderRadius:9, padding:"9px 14px", fontSize:13, fontWeight:800, cursor: list.length?"pointer":"not-allowed" }}>プリセット保存（{list.length}）</button>
          <input ref={cfgRef} type="file" accept=".txt,.json,text/plain" onChange={e=>importCfg(e.target.files[0])} style={{ display:"none" }} />
        </div>
        <input value={listName} onChange={e=>setListName(e.target.value)} placeholder="プリセット名（印刷の右下に表示されます）"
          style={{ width:"100%", boxSizing:"border-box", marginTop:11, padding:"9px 12px", border:"1px solid #e2e2e4", borderRadius:9, fontSize:14, outline:"none" }} />
        {err && <div style={{ fontSize:13, color:"var(--primary)", fontWeight:700, marginTop:10 }}>{err}</div>}
      </div>

      {/* 共有プリセット */}
      <div style={card}>
        <div style={{ fontSize:14, fontWeight:900, color:"var(--ink)", marginBottom:4 }}>共有プリセット</div>
        <div style={{ fontSize:12, color:"var(--text)", marginBottom:12, lineHeight:1.55 }}>みんなで使う発注プリセットです。商品マスターを読み込むと使えるようになります。</div>

        {master.length===0 ? null : (
          <>
            <div style={{ display:"flex", borderRadius:10, overflow:"hidden", border:"1px solid var(--line)", marginBottom:12 }}>
              <button onClick={()=>setShTab("pdf")}
                style={{ flex:1, border:"none", padding:"9px", fontSize:13, fontWeight:800, cursor:"pointer", background: shTab==="pdf"?"#222":"#fff", color: shTab==="pdf"?"#fff":"#888" }}>PDF（すぐ印刷）</button>
              <button onClick={()=>setShTab("text")}
                style={{ flex:1, border:"none", padding:"9px", fontSize:13, fontWeight:800, cursor:"pointer", background: shTab==="text"?"#222":"#fff", color: shTab==="text"?"#fff":"#888" }}>テキスト・プリセット</button>
            </div>

            {sharedLoad ? (
              <div style={{ textAlign:"center", color:"var(--faint)", padding:"18px 0", fontSize:13 }}>読み込み中…</div>
            ) : (() => {
              const rows = shared.filter(p => !!p.pdf_url === (shTab==="pdf"));
              return rows.length===0 ? (
                <div style={{ textAlign:"center", color:"var(--faint)", padding:"18px 0", fontSize:13 }}>まだ登録がありません</div>
              ) : (
                <div style={{ display:"flex", flexDirection:"column", gap:6 }}>
                  {rows.map(p => {
                    const isPdf = !!p.pdf_url;
                    const cnt = ((p.data && p.data.items) || []).length;
                    const checked = shSel.has(p.id);
                    return (
                      <div key={p.id} onClick={ shAdmin ? ()=>toggleShSel(p.id) : undefined }
                        style={{ display:"flex", alignItems:"center", gap:8, background: shAdmin&&checked?"#eaf2ff":(isPdf?"#fef6ef":"#fafbfc"), border:`1px solid ${shAdmin&&checked?"#8ab4ff":(isPdf?"#f4d9c4":"#eef0f2")}`, borderRadius:10, padding:"8px 11px", cursor: shAdmin?"pointer":"default" }}>
                        {shAdmin && <input type="checkbox" checked={checked} readOnly style={{ width:18, height:18, accentColor:"#2f6fed", pointerEvents:"none" }} />}
                        <div style={{ flex:1, minWidth:0 }}>
                          <div style={{ fontSize:13.5, fontWeight:800, color:"#2c2c30", whiteSpace:"nowrap", overflow:"hidden", textOverflow:"ellipsis" }}>{p.name || "（無名）"}</div>
                          <div style={{ fontSize:11, color:"var(--sub)" }}>{isPdf ? "完成PDF（開く／DLして印刷）" : cnt+"点"}</div>
                        </div>
                        {!shAdmin && (isPdf ? (
                          <>
                            <button onClick={()=>window.open(p.pdf_url, "_blank")}
                              style={{ border:"none", background:ACCENT, color:"#fff", borderRadius:8, padding:"7px 13px", fontSize:13, fontWeight:800, cursor:"pointer" }}>開く</button>
                            <button onClick={()=>downloadPdf(p)}
                              style={{ border:`1.5px solid ${ACCENT}`, background:"#fff", color:ACCENT, borderRadius:8, padding:"7px 11px", fontSize:13, fontWeight:800, cursor:"pointer" }}>DL</button>
                          </>
                        ) : (
                          <>
                            <button onClick={()=>loadShared(p)}
                              style={{ border:"none", background:ACCENT, color:"#fff", borderRadius:8, padding:"7px 13px", fontSize:13, fontWeight:800, cursor:"pointer" }}>読込</button>
                            <button onClick={()=>downloadShared(p)}
                              style={{ border:`1.5px solid ${ACCENT}`, background:"#fff", color:ACCENT, borderRadius:8, padding:"7px 11px", fontSize:13, fontWeight:800, cursor:"pointer" }}>DL</button>
                          </>
                        ))}
                      </div>
                    );
                  })}
                </div>
              );
            })()}

            <div style={{ marginTop:12, borderTop:"1px solid #f0f0f2", paddingTop:12 }}>
              {shTab==="pdf" ? (
                <>
                  <button onClick={()=>pdfRef.current && pdfRef.current.click()}
                    style={{ border:"1.5px dashed #f0b48a", background:"#fff", color:"#c2410c", borderRadius:9, padding:"9px 14px", fontSize:13, fontWeight:800, cursor:"pointer" }}>＋ PDFを登録（完成表・複数可）</button>
                  <input ref={pdfRef} type="file" accept="application/pdf,.pdf" multiple onChange={e=>uploadSharedPdf(e.target.files)} style={{ display:"none" }} />
                  <div style={{ fontSize:11, color:"var(--sub)", marginTop:8, lineHeight:1.6 }}>完成したバーコード表のPDFです。生成せず、開く・DLしてそのまま印刷できます。全店で共有されます。</div>
                </>
              ) : (
                <>
                  <button onClick={()=>sharedRef.current && sharedRef.current.click()}
                    style={{ border:"1.5px dashed #c9c9d2", background:"#fff", color:"var(--text)", borderRadius:9, padding:"9px 14px", fontSize:13, fontWeight:800, cursor:"pointer" }}>＋ テキストを登録（.txt・複数可）</button>
                  <input ref={sharedRef} type="file" accept=".txt,.json,text/plain" multiple onChange={e=>uploadShared(e.target.files)} style={{ display:"none" }} />
                  <div style={{ fontSize:11, color:"var(--sub)", marginTop:8, lineHeight:1.6 }}>「プリセット保存」で書き出した.txtです。読込・DLできます。全店で共有されます。</div>
                </>
              )}
            </div>

            <div style={{ marginTop:12, borderTop:"1px solid #f0f0f2", paddingTop:12 }}>
              {!shAdmin && !shPwOpen && (
                <button onClick={()=>{ setShPwOpen(true); setShPwErr(""); }} style={{ border:"none", background:"none", color:"var(--sub)", fontSize:12, fontWeight:800, cursor:"pointer", padding:0, textDecoration:"underline" }}>🔧 管理モード（削除する）</button>
              )}
              {!shAdmin && shPwOpen && (
                <div style={{ display:"flex", alignItems:"center", gap:8, flexWrap:"wrap" }}>
                  <input type="password" value={shPw} onChange={e=>{ setShPw(e.target.value); setShPwErr(""); }} onKeyDown={e=>{ if(e.key==="Enter") unlockShAdmin(); }} placeholder="管理パスワード"
                    style={{ padding:"8px 11px", border:"1px solid #e2e2e6", borderRadius:8, fontSize:14, width:160, outline:"none" }} />
                  <button onClick={unlockShAdmin} style={{ border:"none", background:"#222", color:"#fff", borderRadius:8, padding:"8px 15px", fontSize:13, fontWeight:800, cursor:"pointer" }}>解除</button>
                  <button onClick={()=>{ setShPwOpen(false); setShPw(""); setShPwErr(""); }} style={{ border:"none", background:"none", color:"var(--sub)", fontSize:12, fontWeight:700, cursor:"pointer" }}>やめる</button>
                  {shPwErr && <span style={{ fontSize:12, color:"#e11", fontWeight:700 }}>{shPwErr}</span>}
                </div>
              )}
              {shAdmin && (
                <div style={{ display:"flex", alignItems:"center", gap:8, flexWrap:"wrap", background:"#fff4e5", border:"1px solid #ffc98a", borderRadius:10, padding:"9px 11px" }}>
                  <span style={{ fontSize:12.5, fontWeight:900, color:"#8a4b00" }}>管理モード：チェックで選択（今表示中のタブのみ）</span>
                  <button onClick={()=>setShSel(new Set(shared.filter(p=>!!p.pdf_url===(shTab==="pdf")).map(x=>x.id)))} style={{ border:"1px solid #e6c9a3", background:"#fff", color:"#8a4b00", borderRadius:7, padding:"6px 10px", fontSize:12, fontWeight:800, cursor:"pointer" }}>全選択</button>
                  <button onClick={()=>setShSel(new Set())} style={{ border:"1px solid #e6c9a3", background:"#fff", color:"#8a4b00", borderRadius:7, padding:"6px 10px", fontSize:12, fontWeight:800, cursor:"pointer" }}>選択解除</button>
                  <div style={{ flex:1 }} />
                  {!shConfirm ? (
                    <button onClick={()=> shSel.size>0 && setShConfirm(true)} disabled={shSel.size===0}
                      style={{ border:"none", background: shSel.size?"#c62828":"#e6bcbc", color:"#fff", borderRadius:8, padding:"8px 13px", fontSize:13, fontWeight:800, cursor: shSel.size?"pointer":"default" }}>選択した{shSel.size>0?`${shSel.size}件`:""}を削除</button>
                  ) : (
                    <span style={{ display:"flex", alignItems:"center", gap:6 }}>
                      <span style={{ fontSize:12.5, fontWeight:800, color:"#8a4b00" }}>{shSel.size}件を削除？</span>
                      <button onClick={bulkDelShared} disabled={shBusy} style={{ border:"none", background:"#c62828", color:"#fff", borderRadius:8, padding:"8px 12px", fontSize:13, fontWeight:800, cursor:"pointer" }}>{shBusy?"削除中…":"実行"}</button>
                      <button onClick={()=>setShConfirm(false)} style={{ border:"none", background:"none", color:"var(--sub)", fontSize:12, fontWeight:700, cursor:"pointer" }}>キャンセル</button>
                    </span>
                  )}
                  <button onClick={()=>{ setShAdmin(false); setShSel(new Set()); setShConfirm(false); }} style={{ border:"1px solid #ffc98a", background:"#fff", color:"#8a4b00", borderRadius:8, padding:"8px 12px", fontSize:12.5, fontWeight:800, cursor:"pointer" }}>終了</button>
                </div>
              )}
            </div>
          </>
        )}
      </div>

      {/* 作業リスト */}
      <div style={card}>
        <div style={{ display:"flex", alignItems:"baseline", justifyContent:"space-between", marginBottom:12 }}>
          <div style={{ fontSize:14, fontWeight:900, color:"var(--ink)" }}>発注リスト <span style={{ color:ACCENT }}>{list.length}</span></div>
          {list.length>0 && <button onClick={()=>{ if(confirm("リストを空にしますか？")) setList([]); }} style={{ border:"none", background:"none", color:"var(--faint)", fontSize:12, fontWeight:700, cursor:"pointer" }}>すべて消去</button>}
        </div>
        {list.length===0 ? (
          <div style={{ textAlign:"center", color:"var(--faint)", padding:"26px 0", fontSize:13, lineHeight:1.7 }}>
            下の一覧からタップで追加、または「プリセット読み込み」で復元してください
          </div>
        ) : (
          <div ref={drag.containerRef} style={{ display:"flex", flexDirection:"column", gap:8 }}>
            {list.map((it,i) => (
              <div key={it.bcode} data-row
                style={{ display:"flex", alignItems:"center", gap:10, background: drag.dragIdx===i?"#eef4ff":"#fafbfc", border:"1px solid #eef0f2", borderRadius:10, padding:"9px 11px", boxShadow: drag.dragIdx===i?"0 4px 14px rgba(0,0,0,0.12)":"none" }}>
                <button onPointerDown={drag.down(i)} onPointerMove={drag.move} onPointerUp={drag.up}
                  style={{ border:"none", background:"none", cursor:"grab", color:"#c4c4c8", fontSize:18, letterSpacing:"-3px", padding:"0 2px", touchAction:"none", lineHeight:1 }}>⋮⋮</button>
                <span style={{ width:18, textAlign:"center", fontSize:12, fontWeight:800, color:"#bfbfc4" }}>{i+1}</span>
                <div style={{ flex:1, minWidth:0 }}>
                  <div style={{ fontSize:13.5, fontWeight:700, color:"#2c2c30", whiteSpace:"nowrap", overflow:"hidden", textOverflow:"ellipsis" }}>{it.name || "（名称なし）"}</div>
                  <div style={{ display:"flex", alignItems:"center", gap:6, marginTop:2, flexWrap:"wrap" }}>
                    <span style={{ width:9, height:9, borderRadius:"50%", background:companyColor(it), flexShrink:0 }} title={(companyOf(it)||{}).name || ("発注先 "+(it.haccyu||"不明"))} />
                    <span style={{ fontSize:11, color:"var(--sub)", fontFamily:"monospace" }}>{it.bcode}</span>
                    {(useTags[it.bcode]||[]).map(t => (
                      <span key={t} style={{ fontSize:9, color:"#fff", background:"var(--primary)", fontWeight:800, borderRadius:4, padding:"1px 5px" }}>{t}</span>
                    ))}
                  </div>
                </div>
                <div style={{ display:"flex", flexDirection:"column", gap:2 }}>
                  <button onClick={()=>moveItem(i,-1)} disabled={i===0} style={{ border:"none", background:"#eef1f5", color:i===0?"#ccc":"#666", borderRadius:5, width:26, height:18, fontSize:10, cursor:i===0?"default":"pointer", lineHeight:1 }}>▲</button>
                  <button onClick={()=>moveItem(i,1)} disabled={i===list.length-1} style={{ border:"none", background:"#eef1f5", color:i===list.length-1?"#ccc":"#666", borderRadius:5, width:26, height:18, fontSize:10, cursor:i===list.length-1?"default":"pointer", lineHeight:1 }}>▼</button>
                </div>
                <button onClick={()=>removeItem(it.bcode)} style={{ border:"none", background:"none", color:"var(--faint)", fontSize:18, cursor:"pointer", padding:"0 2px", lineHeight:1 }}>×</button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* マスタから追加（カテゴリ別） */}
      <div style={card}>
        <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", cursor:"pointer" }} onClick={()=>setSrcOpen(o=>!o)}>
          <div style={{ fontSize:14, fontWeight:900, color:"var(--ink)" }}>商品を追加{master.length>0?`（${master.length}件）`:""}</div>
          <span style={{ color:"var(--faint)", fontSize:14 }}>{srcOpen?"▲":"▼"}</span>
        </div>

        {srcOpen && (
          <div style={{ marginTop:14 }}>
            {master.length===0 ? (
              <label
                onDragOver={e=>{e.preventDefault();setOver(true);}}
                onDragLeave={e=>{e.preventDefault();setOver(false);}}
                onDrop={e=>{e.preventDefault();setOver(false);handleFile(e.dataTransfer.files[0]);}}
                style={{ display:"block", border:`2px dashed ${over?ACCENT:"#e0e0e0"}`, borderRadius:12, padding:"24px 16px", textAlign:"center", cursor:"pointer", background: over?"#eef4ff":"#fafafa" }}>
                <div style={{ fontWeight:700, color:"var(--text)" }}>商品マスタ（エクセル）をドロップ／タップ</div>
                <div style={{ fontSize:12, color:"var(--sub)", marginTop:6 }}>包材・冷食・たれ・資材・生鮮をカテゴリで絞れます</div>
                <input ref={fileRef} type="file" accept=".xlsx,.xls" onChange={e=>handleFile(e.target.files[0])} style={{ display:"none" }} />
              </label>
            ) : (
              <>
                <div style={{ display:"flex", gap:"0 16px", marginBottom:12, borderBottom:"1px solid var(--line)", overflowX:"auto" }}>
                  {TRAY_CATS.map(c => {
                    const on = cat===c.key;
                    return (
                      <button key={c.key} onClick={()=>setCat(c.key)}
                        style={{ border:"none", background:"none", cursor:"pointer", padding:"4px 0 9px", flexShrink:0, whiteSpace:"nowrap", fontSize:13.5, fontWeight: on?800:600, color: on?ACCENT:"#999", borderBottom: on?`2px solid ${ACCENT}`:"2px solid transparent", marginBottom:-1 }}>
                        {c.label}<span style={{ fontSize:11, color: on?ACCENT:"#bbb", marginLeft:4 }}>{catCount(c)}</span>
                      </button>
                    );
                  })}
                </div>
                <div style={{ display:"flex", gap:8, alignItems:"center", marginBottom:10 }}>
                  <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="商品名・コードで絞り込み"
                    style={{ flex:1, padding:"9px 12px", border:"1px solid #e2e2e4", borderRadius:9, fontSize:14, outline:"none" }} />
                  <button onClick={()=>{ setMaster([]); setFileName(""); setSearch(""); }} style={{ border:"none", background:"none", color:"var(--faint)", fontSize:12, fontWeight:700, cursor:"pointer", whiteSpace:"nowrap" }}>読み直し</button>
                </div>
                <div style={{ display:"flex", gap:7, alignItems:"center", marginBottom:10, overflowX:"auto", paddingBottom:2 }}>
                  <span style={{ fontSize:11, color:"var(--faint)", fontWeight:800, flexShrink:0 }}>用途:</span>
                  <button onClick={()=>setUseFilter("")}
                    style={{ flexShrink:0, border: useFilter===""?"2px solid var(--primary)":"1px solid var(--line)", background: useFilter===""?"var(--soft)":"#fff", color: useFilter===""?"var(--primary)":"var(--sub)", borderRadius:16, padding:"5px 12px", fontSize:12, fontWeight:800, cursor:"pointer" }}>すべて</button>
                  {USE_TAGS.map(t => {
                    const on = useFilter===t;
                    const cnt = srcFilteredRaw.filter(it => (useTags[it.bcode]||[]).includes(t)).length;
                    return (
                      <button key={t} onClick={()=>setUseFilter(on?"":t)}
                        style={{ flexShrink:0, border: on?"2px solid var(--primary)":"1px solid var(--line)", background: on?"var(--primary)":"#fff", color: on?"#fff":"var(--sub)", borderRadius:16, padding:"5px 12px", fontSize:12, fontWeight:800, cursor:"pointer" }}>{t}<span style={{ fontSize:10, marginLeft:4, opacity:0.8 }}>{cnt}</span></button>
                    );
                  })}
                </div>
                <div style={{ border:"1px solid var(--line)", borderRadius:10, maxHeight:720, overflowY:"auto" }}>
                  {srcShown.length===0 ? (
                    <div style={{ padding:36, textAlign:"center", color:"var(--faint)" }}>該当する商品がありません</div>
                  ) : srcShown.map(it => {
                    const on = inList(it.bcode);
                    const tags = useTags[it.bcode] || [];
                    const cc = companyColor(it);
                    const comp = companyOf(it);
                    return (
                      <div key={it.bcode}
                        style={{ display:"flex", alignItems:"stretch", gap:0, borderBottom:"1px solid #f3f3f3", background: on?"#f3f8ff":"transparent" }}>
                        <div style={{ width:5, flexShrink:0, background:cc, borderRadius:0 }} title={"発注先 "+(it.haccyu||"不明")} />
                        <div onClick={()=>addItem(it)} style={{ flex:1, minWidth:0, display:"flex", alignItems:"center", gap:10, padding:"9px 13px", cursor: on?"default":"pointer" }}>
                          <span style={{ width:20, textAlign:"center", color: on?ACCENT:"#cfcfd3", fontWeight:800, fontSize:15 }}>{on?"✓":"＋"}</span>
                          <div style={{ flex:1, minWidth:0 }}>
                            <div style={{ fontSize:13.5, fontWeight:600, color:"var(--ink)", whiteSpace:"nowrap", overflow:"hidden", textOverflow:"ellipsis" }}>{it.name || "（名称なし）"}</div>
                            <div style={{ display:"flex", alignItems:"center", gap:6, marginTop:2, flexWrap:"wrap" }}>
                              <span style={{ fontSize:11, color:"var(--sub)", fontFamily:"monospace" }}>{it.bcode}</span>
                              <span style={{ fontSize:9.5, color:cc, fontWeight:800, border:"1px solid "+cc, borderRadius:5, padding:"0 5px" }}>{comp ? comp.name : (it.haccyu||"—")}</span>
                              {tags.map(t => (
                                <span key={t} style={{ fontSize:9.5, color:"#fff", background:"var(--primary)", fontWeight:800, borderRadius:5, padding:"1px 6px" }}>{t}</span>
                              ))}
                            </div>
                          </div>
                          {on && <span style={{ fontSize:11, color:ACCENT, fontWeight:700, whiteSpace:"nowrap" }}>追加済</span>}
                        </div>
                        <button onClick={(e)=>{ e.stopPropagation(); setTagEditFor(tagEditFor===it.bcode?null:it.bcode); }}
                          style={{ flexShrink:0, border:"none", background: tagEditFor===it.bcode?"var(--soft)":"transparent", color:"var(--sub)", padding:"0 12px", cursor:"pointer", fontSize:16 }} title="用途を設定">🏷</button>
                      </div>
                    );
                  })}
                  {tagEditFor && srcShown.some(it => it.bcode === tagEditFor) && (
                    <div style={{ padding:"12px 14px", background:"var(--soft)", borderBottom:"1px solid #f3f3f3" }}>
                      <div style={{ fontSize:11.5, fontWeight:800, color:"var(--ink)", marginBottom:8 }}>納品会社を選ぶ（色と模様がラベルに付きます）</div>
                      <div style={{ display:"flex", flexWrap:"wrap", gap:7, marginBottom:14 }}>
                        {COMPANIES.map(c => {
                          const active = bcCompany[tagEditFor] === c.key;
                          return (
                            <button key={c.key} onClick={()=>setCompanyFor(tagEditFor, active ? null : c.key)}
                              style={{ display:"flex", alignItems:"center", gap:6, border: active?`2px solid ${c.color}`:"1px solid var(--line)", background: active?"#fff":"#fff", color: active?c.color:"var(--text)", borderRadius:9, padding:"6px 11px", fontSize:12.5, fontWeight:800, cursor:"pointer" }}>
                              <span style={{ width:22, height:12, borderRadius:3, border:`1px solid ${c.color}`, ...companyPatStyle(c) }} />
                              {c.name}
                            </button>
                          );
                        })}
                      </div>
                      <div style={{ fontSize:11.5, fontWeight:800, color:"var(--ink)", marginBottom:8 }}>用途を選ぶ（複数可）</div>
                      <div style={{ display:"flex", flexWrap:"wrap", gap:7 }}>
                        {USE_TAGS.map(t => {
                          const active = (useTags[tagEditFor] || []).includes(t);
                          return (
                            <button key={t} onClick={()=>toggleUseTag(tagEditFor, t)}
                              style={{ border: active?"2px solid var(--primary)":"1px solid var(--line)", background: active?"var(--primary)":"#fff", color: active?"#fff":"var(--text)", borderRadius:9, padding:"7px 13px", fontSize:12.5, fontWeight:800, cursor:"pointer" }}>{t}</button>
                          );
                        })}
                      </div>
                      <button onClick={()=>setTagEditFor(null)} style={{ marginTop:10, border:"none", background:"transparent", color:"var(--sub)", fontSize:12, fontWeight:700, cursor:"pointer" }}>閉じる</button>
                    </div>
                  )}
                </div>
              </>
            )}
          </div>
        )}
      </div>

      {/* 印刷 */}
      <div style={card}>
        <div style={{ fontSize:14, fontWeight:900, color:"var(--ink)", marginBottom:14 }}>レイアウトと印刷</div>
        <div style={{ display:"flex", gap:22, flexWrap:"wrap", alignItems:"center", marginBottom:16 }}>
          <div style={{ display:"flex", alignItems:"center", gap:10 }}>
            <span style={{ fontSize:13, fontWeight:700, color:"var(--sub)" }}>1行の数</span>
            <div style={{ display:"inline-flex", border:"1px solid #e2e2e4", borderRadius:8, overflow:"hidden" }}>
              {[2,3,4].map(c=>(<button key={c} onClick={()=>setCols(c)} style={{ ...seg(cols===c), borderRight: c<4?"1px solid var(--line)":"none" }}>{c}列</button>))}
            </div>
          </div>
          <div style={{ display:"flex", alignItems:"center", gap:10 }}>
            <span style={{ fontSize:13, fontWeight:700, color:"var(--sub)" }}>商品名</span>
            <div style={{ display:"inline-flex", border:"1px solid #e2e2e4", borderRadius:8, overflow:"hidden" }}>
              <button onClick={()=>setShowName(true)} style={{ ...seg(showName), borderRight:"1px solid var(--line)" }}>表示</button>
              <button onClick={()=>setShowName(false)} style={seg(!showName)}>コードのみ</button>
            </div>
          </div>
          <button onClick={()=>window.print()} disabled={list.length===0}
            style={{ marginLeft:"auto", background: list.length?ACCENT:"#ccc", color:"white", border:"none", borderRadius:10, padding:"12px 22px", fontSize:14, fontWeight:900, cursor: list.length?"pointer":"not-allowed" }}>
            A4横で印刷（{list.length}件・{pages.length}ページ）
          </button>
        </div>

        {list.length > 0 && (
          <div style={{ borderTop:"1px solid var(--line)", paddingTop:14, marginTop:2 }}>
            <div style={{ fontSize:13, fontWeight:900, color:"var(--ink)", marginBottom:3 }}>納品会社の割り当て</div>
            <div style={{ fontSize:11.5, color:"var(--sub)", marginBottom:12, lineHeight:1.6 }}>各商品にラベル上部の色・模様・会社名が付きます。一括で全部に設定するか、商品ごとに個別で選べます。</div>

            <div style={{ display:"flex", alignItems:"center", gap:8, flexWrap:"wrap", marginBottom:14, paddingBottom:14, borderBottom:"1px dashed var(--line)" }}>
              <span style={{ fontSize:12, fontWeight:800, color:"var(--faint)" }}>一括：</span>
              {COMPANIES.map(c => (
                <button key={c.key} onClick={()=>{ const next={...bcCompany}; list.forEach(it=>{ next[it.bcode]=c.key; }); setBcCompany(next); try{localStorage.setItem("bcCompanyMap",JSON.stringify(next));}catch(e){} }}
                  style={{ display:"flex", alignItems:"center", gap:6, border:`1px solid ${c.color}`, background:"#fff", color:c.color, borderRadius:8, padding:"6px 10px", fontSize:12, fontWeight:800, cursor:"pointer" }}>
                  <span style={{ width:20, height:11, borderRadius:3, border:`1px solid ${c.color}`, ...companyPatStyle(c) }} />{c.name}
                </button>
              ))}
              <button onClick={()=>{ const next={...bcCompany}; list.forEach(it=>{ delete next[it.bcode]; }); setBcCompany(next); try{localStorage.setItem("bcCompanyMap",JSON.stringify(next));}catch(e){} }}
                style={{ border:"1px solid var(--line)", background:"#fff", color:"var(--sub)", borderRadius:8, padding:"6px 10px", fontSize:12, fontWeight:800, cursor:"pointer" }}>クリア</button>
            </div>

            <div style={{ display:"flex", flexDirection:"column", gap:8 }}>
              {list.map(it => {
                const cur = bcCompany[it.bcode];
                return (
                  <div key={it.bcode} style={{ display:"flex", alignItems:"center", gap:10, flexWrap:"wrap" }}>
                    <span style={{ fontSize:12.5, fontWeight:700, color:"var(--ink)", minWidth:120, flex:"0 0 auto", maxWidth:180, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{it.name || it.bcode}</span>
                    <div style={{ display:"flex", gap:6, flexWrap:"wrap" }}>
                      {COMPANIES.map(c => {
                        const on = cur === c.key;
                        return (
                          <button key={c.key} onClick={()=>setCompanyFor(it.bcode, on ? null : c.key)} title={c.name}
                            style={{ display:"flex", alignItems:"center", gap:5, border: on?`2px solid ${c.color}`:"1px solid var(--line)", background:"#fff", color: on?c.color:"var(--sub)", borderRadius:7, padding:"4px 8px", fontSize:11, fontWeight:800, cursor:"pointer" }}>
                            <span style={{ width:16, height:10, borderRadius:2, border:`1px solid ${c.color}`, ...companyPatStyle(c) }} />{c.name}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
        <div style={{ display:"none" }}>
        </div>
        <div style={{ fontSize:12, color:"var(--sub)", fontWeight:700, marginBottom:8 }}>プレビュー</div>
        <div ref={previewRef} style={{ background:"var(--bg)", border:"1px solid var(--line)", borderRadius:10, padding:"16px", minHeight:80 }}>
          {list.length===0 ? <div style={{ textAlign:"center", color:"var(--faint)", padding:"24px 0" }}>リストに追加するとここにプレビューが表示されます</div> : renderPages(false)}
        </div>
      </div>

      {ReactDOM.createPortal(<>{renderPages(true)}</>, portalEl)}
    </div>
  );
}


;Object.assign(window, { BarcodeTab });
