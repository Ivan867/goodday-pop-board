/* GoodDay 鮮魚共有 — 17-tab-idea （アイデア：見るだけ。投稿は管理画面から） */
var { useState, useEffect, useCallback, useRef } = React;

function IdeaTab() {
  const [ideas, setIdeas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [q, setQ] = useState("");
  const [open, setOpen] = useState(null);

  useEffect(() => {
    let alive = true;
    api.listIdeas()
      .then(r => { if (alive) setIdeas(Array.isArray(r) ? r : []); })
      .catch(() => {})
      .finally(() => { if (alive) setLoading(false); });
    return () => { alive = false; };
  }, []);

  const shown = ideas.filter(it => {
    if (!q.trim()) return true;
    const n = normJa(q);
    return normJa(it.title).includes(n) || normJa(it.memo || "").includes(n)
        || (it.tags || []).some(t => normJa(t).includes(n));
  });
  const fmt = (d) => { try { const x = new Date(d); return `${x.getMonth()+1}/${x.getDate()}`; } catch(e) { return ""; } };
  const imgs = (it) => Array.isArray(it.images) ? it.images : [];

  return (
    <div style={{ maxWidth:1100, margin:"0 auto", padding:"10px 16px 120px" }}>
      <div style={{ background:"var(--primary)", color:"#fff", borderRadius:14, padding:"14px 16px", marginBottom:14 }}>
        <div style={{ fontSize:16.5, fontWeight:800, letterSpacing:"-0.3px" }}>アイデア</div>
        <div style={{ fontSize:11.5, opacity:0.85, marginTop:3 }}>ほかの売場を手がかりに起こした、ポップや売場の案です</div>
      </div>

      <input value={q} onChange={e => setQ(e.target.value)} placeholder="さがす（さんま・刺身・バナー など）"
        style={{ width:"100%", boxSizing:"border-box", border:"1px solid var(--line)", borderRadius:11,
          padding:"12px 14px", fontSize:15, outline:"none", fontFamily:"inherit", marginBottom:12,
          background:"var(--card, #fff)", color:"var(--ink)" }} />

      {loading ? (
        <div style={{ textAlign:"center", color:"var(--faint)", padding:"44px 0", fontSize:13 }}>読み込んでいます…</div>
      ) : shown.length === 0 ? (
        <div style={{ textAlign:"center", color:"var(--faint)", padding:"44px 20px", fontSize:13 }}>
          <div style={{ fontSize:15, fontWeight:800, color:"var(--sub)" }}>{ideas.length ? "見つかりませんでした" : "まだアイデアがありません"}</div>
        </div>
      ) : (
        <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill, minmax(150px, 1fr))", gap:12 }}>
          {shown.map(it => {
            const im = imgs(it);
            return (
              <button key={it.id} onClick={() => setOpen(it)}
                style={{ border:"1px solid var(--line)", background:"var(--card, #fff)", borderRadius:4, padding:0,
                  cursor:"pointer", textAlign:"left", overflow:"hidden", position:"relative" }}>
                <img src={im[0]} alt="" loading="lazy"
                  style={{ width:"100%", aspectRatio:"1 / 1.2", objectFit:"contain", display:"block", background:"var(--card, #fff)" }} />
                {im.length > 1 && (
                  <span style={{ position:"absolute", top:6, right:6, background:"rgba(22,30,42,0.7)", color:"#fff",
                    fontSize:11.5, fontWeight:900, borderRadius:10, padding:"2px 8px" }}>{im.length}枚</span>
                )}
                <span style={{ display:"block", padding:"8px 9px 9px", borderTop:"1px solid var(--line)" }}>
                  <span style={{ display:"block", fontSize:13.5, fontWeight:800, color:"var(--ink)", overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{it.title}</span>
                  <span style={{ display:"block", fontSize:11.5, color:"var(--faint)", marginTop:2 }}>{fmt(it.created_at)}</span>
                </span>
              </button>
            );
          })}
        </div>
      )}

      {open && (
        <div onClick={() => setOpen(null)}
          className="fs-top" style={{ position:"fixed", inset:0, zIndex:1200, background:"rgba(10,16,24,0.92)", overflowY:"auto", WebkitOverflowScrolling:"touch" }}>
          <div onClick={e => e.stopPropagation()} style={{ maxWidth:760, margin:"0 auto", padding:"14px 14px 60px" }}>
            <button onClick={() => setOpen(null)} aria-label="もどる"
              style={{ position:"sticky", top:10, zIndex:2, display:"flex", alignItems:"center", gap:5, border:"none",
                background:"rgba(255,255,255,0.16)", color:"#fff", borderRadius:999, padding:"8px 15px 8px 11px",
                fontSize:13.5, fontWeight:800, cursor:"pointer", marginBottom:12 }}>
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round"><path d="M15 5l-7 7 7 7"/></svg>
              もどる
            </button>
            <div style={{ color:"#fff", fontSize:18, fontWeight:900, marginBottom:6 }}>{open.title}</div>
            {open.memo && <div style={{ color:"rgba(255,255,255,0.82)", fontSize:13.5, lineHeight:1.8, marginBottom:10, whiteSpace:"pre-wrap" }}>{open.memo}</div>}
            {(open.tags || []).length > 0 && (
              <div style={{ display:"flex", flexWrap:"wrap", gap:6, marginBottom:12 }}>
                {open.tags.map((t, i) => (
                  <span key={i} style={{ fontSize:12, fontWeight:800, color:"#cfe3f7", background:"rgba(111,163,216,0.22)", borderRadius:7, padding:"3px 9px" }}>{t}</span>
                ))}
              </div>
            )}
            <div style={{ display:"flex", flexDirection:"column", gap:12 }}>
              {imgs(open).map((u, i) => (
                <a key={i} href={u} target="_blank" rel="noopener noreferrer" style={{ display:"block" }}>
                  <img src={u} alt="" style={{ width:"100%", display:"block", borderRadius:4, background:"#fff" }} />
                </a>
              ))}
            </div>
            <div style={{ color:"rgba(255,255,255,0.55)", fontSize:11.5, marginTop:12, lineHeight:1.8 }}>
              画像を押すと大きく開きます。長押しで保存できます。
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

;Object.assign(window, { IdeaTab });
