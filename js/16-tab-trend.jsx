var { useState, useEffect, useCallback, useRef } = React;

// ===== トレンド：魚種ごとの「今使える訴求文脈」を見る・貯める =====
function TrendTab() {
  const [species, setSpecies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sel, setSel] = useState(null);          // 選んだ魚種
  const [signals, setSignals] = useState([]);
  const [scores, setScores] = useState([]);
  const [detailBusy, setDetailBusy] = useState(false);
  const [top, setTop] = useState([]);
  const [tab, setTab] = useState("fish");        // fish=魚種を選ぶ / week=直近1週
  const [q, setQ] = useState("");

  // 追加フォーム
  const [addOpen, setAddOpen] = useState(false);
  const [term, setTerm] = useState("");
  const [ctx, setCtx] = useState("");
  const [pw, setPw] = useState("");
  const [addBusy, setAddBusy] = useState(false);
  const [addMsg, setAddMsg] = useState("");

  useEffect(() => {
    let alive = true;
    Promise.all([api.listSpecies(), api.topWow()])
      .then(([sp, tw]) => { if (!alive) return; setSpecies(sp || []); setTop(tw || []); })
      .catch(() => {})
      .finally(() => { if (alive) setLoading(false); });
    return () => { alive = false; };
  }, []);

  const openFish = async (f) => {
    setSel(f); setDetailBusy(true); setSignals([]); setScores([]);
    try {
      const [sg, sc] = await Promise.all([api.speciesSignals(f.id, 40), api.speciesScores(f.id)]);
      setSignals(sg || []); setScores(sc || []);
    } catch (e) {} finally { setDetailBusy(false); }
  };

  const submitNote = async () => {
    if (!term.trim()) { setAddMsg("ことばを入れてください"); return; }
    setAddBusy(true); setAddMsg("");
    try {
      const ok = await api.verifyPasswordEx("admin", pw);
      if (!ok.ok) {
        setAddMsg(ok.locked
          ? `間違いが続いたので、${api.lockText(ok.seconds)}ほど待ってください`
          : "パスワードが違います");
        setAddBusy(false); return;
      }
      const list = ctx.split(/[、,\s]+/).map(x => x.trim()).filter(Boolean);
      const r = await api.addTrendNote(term.trim(), sel ? sel.canonical_name : null, list);
      setAddMsg(r && r.matched ? "入れました" : "入れました（魚種は結びつきませんでした）");
      setTerm(""); setCtx("");
      if (sel) openFish(sel);
      const tw = await api.topWow().catch(() => []);
      setTop(tw || []);
      setTimeout(() => { setAddOpen(false); setAddMsg(""); }, 1200);
    } catch (e) { setAddMsg("入れられませんでした"); }
    finally { setAddBusy(false); }
  };

  const card = { background:"#fff", border:"1px solid var(--line)", borderRadius:14, padding:"14px 15px" };
  const now = new Date().getMonth() + 1;

  const shown = species.filter(f => {
    if (!q.trim()) return true;
    const n = normJa(q);
    return normJa(f.canonical_name).includes(n)
        || (f.aliases || []).some(a => normJa(a).includes(n));
  });

  return (
    <div style={{ maxWidth:900, margin:"0 auto", padding:"10px 16px 120px" }}>
      <div style={{ background:"var(--primary)", color:"#fff", borderRadius:14, padding:"14px 16px", marginBottom:14 }}>
        <div style={{ fontSize:16.5, fontWeight:800, letterSpacing:"-0.3px" }}>トレンド</div>
        <div style={{ fontSize:11.5, opacity:0.85, marginTop:3 }}>魚ごとに、いま使える売り文句をためておく場所です</div>
      </div>

      {/* 切り替え */}
      <div style={{ display:"flex", gap:2, background:"var(--chip)", borderRadius:9, padding:3, marginBottom:14 }}>
        {[["fish","魚から見る"],["week","この1週間"]].map(([k,l]) => (
          <button key={k} onClick={() => setTab(k)} aria-pressed={tab===k}
            style={{ flex:1, border:"none", background: tab===k ? "#fff" : "transparent",
              color: tab===k ? "var(--ink)" : "var(--sub)", borderRadius:7, padding:"9px 6px",
              fontSize:13, fontWeight:800, cursor:"pointer",
              boxShadow: tab===k ? "0 1px 2px rgba(0,0,0,0.1)" : "none" }}>{l}</button>
        ))}
      </div>

      {loading ? (
        <div style={{ textAlign:"center", color:"var(--faint)", padding:"44px 0", fontSize:13 }}>読み込んでいます…</div>
      ) : tab === "week" ? (
        top.length === 0 ? (
          <div style={{ textAlign:"center", color:"var(--faint)", padding:"44px 20px", fontSize:13, lineHeight:1.9 }}>
            <div style={{ fontSize:15, fontWeight:800, color:"var(--sub)" }}>まだ何もありません</div>
            <div style={{ marginTop:6 }}>「魚から見る」で魚を選んで、気づいたことを足してください</div>
          </div>
        ) : (
          <div style={{ display:"flex", flexDirection:"column", gap:8 }}>
            {top.map((t, i) => (
              <button key={i} onClick={() => { const f = species.find(x => x.id === (t.fish_species && t.fish_species.id)); if (f) { setTab("fish"); openFish(f); } }}
                style={{ ...card, display:"flex", alignItems:"center", gap:11, textAlign:"left", cursor:"pointer", width:"100%" }}>
                <span style={{ fontSize:15.5, fontWeight:900, color:"var(--ink)", flexShrink:0 }}>
                  {t.fish_species ? t.fish_species.canonical_name : "—"}
                </span>
                <span style={{ fontSize:12, color:"var(--sub)", minWidth:0, flex:1, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>
                  {(t.context_terms || []).join(" ／ ")}
                </span>
                <span style={{ fontSize:12.5, fontWeight:900, color:"var(--primary-soft)", flexShrink:0 }}>{t.raw_count}</span>
              </button>
            ))}
          </div>
        )
      ) : sel ? (
        <>
          <button onClick={() => setSel(null)}
            style={{ display:"flex", alignItems:"center", gap:5, border:"1px solid var(--line)", background:"#fff",
              color:"var(--sub)", borderRadius:10, padding:"8px 14px 8px 10px", fontSize:13, fontWeight:800,
              cursor:"pointer", marginBottom:14 }}>
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round"><path d="M15 5l-7 7 7 7"/></svg>
            魚を選びなおす
          </button>

          <div style={{ ...card, marginBottom:12 }}>
            <div style={{ display:"flex", alignItems:"baseline", gap:9, marginBottom:8 }}>
              <span style={{ fontSize:19, fontWeight:900, color:"var(--ink)" }}>{sel.canonical_name}</span>
              {(sel.season_months || []).includes(now) && (
                <span style={{ fontSize:11, fontWeight:900, color:"#2c6b45", background:"#eaf6ee", borderRadius:6, padding:"3px 8px" }}>いまが旬</span>
              )}
            </div>
            {(sel.season_months || []).length > 0 && (
              <div style={{ fontSize:12, color:"var(--sub)", marginBottom:6 }}>
                旬：{sel.season_months.join("・")}月
              </div>
            )}
            {(sel.common_cuts || []).length > 0 && (
              <div style={{ fontSize:12, color:"var(--sub)", marginBottom:6 }}>
                売り方：{sel.common_cuts.join("／")}
              </div>
            )}
            {(sel.common_dishes || []).length > 0 && (
              <div style={{ fontSize:12, color:"var(--sub)" }}>
                料理：{sel.common_dishes.join("／")}
              </div>
            )}
            {sel.note && <div style={{ fontSize:11.5, color:"var(--faint)", marginTop:8, lineHeight:1.7 }}>{sel.note}</div>}
          </div>

          {/* 文脈語 */}
          {scores.length > 0 && scores.some(s => (s.context_terms || []).length) && (
            <div style={{ ...card, marginBottom:12 }}>
              <div style={{ fontSize:12.5, fontWeight:800, color:"var(--sub)", marginBottom:9 }}>ためた切り口</div>
              <div style={{ display:"flex", flexWrap:"wrap", gap:6 }}>
                {[...new Set(scores.flatMap(s => s.context_terms || []))].map((c, i) => (
                  <span key={i} style={{ fontSize:12.5, fontWeight:700, color:"var(--soft-text)",
                    background:"var(--soft)", borderRadius:8, padding:"5px 10px" }}>{c}</span>
                ))}
              </div>
            </div>
          )}

          {/* 直近のことば */}
          <div style={{ ...card, marginBottom:12 }}>
            <div style={{ fontSize:12.5, fontWeight:800, color:"var(--sub)", marginBottom:9 }}>これまでのことば</div>
            {detailBusy ? (
              <div style={{ fontSize:12.5, color:"var(--faint)", padding:"14px 0", textAlign:"center" }}>読み込んでいます…</div>
            ) : signals.length === 0 ? (
              <div style={{ fontSize:12.5, color:"var(--faint)", padding:"14px 0", textAlign:"center" }}>
                まだありません。下から足してください
              </div>
            ) : (
              <div style={{ display:"flex", flexDirection:"column", gap:7 }}>
                {signals.map((s, i) => {
                  const r = s.trend_raw_signals || {};
                  return (
                    <div key={i} style={{ display:"flex", alignItems:"center", gap:9,
                      borderBottom: i < signals.length - 1 ? "1px solid var(--line)" : "none", paddingBottom:7 }}>
                      <span style={{ fontSize:13.5, fontWeight:700, color:"var(--ink)", flex:1, minWidth:0 }}>{r.term}</span>
                      <span style={{ fontSize:10.5, color:"var(--faint)", flexShrink:0 }}>
                        {r.captured_at ? String(r.captured_at).slice(5,10).replace("-","/") : ""}
                      </span>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          <button onClick={() => { setAddOpen(true); setAddMsg(""); }}
            style={{ width:"100%", border:"none", background:"var(--primary)", color:"#fff",
              borderRadius:12, padding:"14px", fontSize:14.5, fontWeight:900, cursor:"pointer" }}>
            ＋ この魚の切り口を足す
          </button>
        </>
      ) : (
        <>
          <input value={q} onChange={e => setQ(e.target.value)} placeholder="魚の名前でさがす（ぶり・ハマチ・鰤 など）"
            style={{ width:"100%", boxSizing:"border-box", border:"1px solid var(--line)", borderRadius:11,
              padding:"12px 14px", fontSize:15, outline:"none", fontFamily:"inherit", marginBottom:12 }} />
          <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill, minmax(104px, 1fr))", gap:8 }}>
            {shown.map(f => {
              const inSeason = (f.season_months || []).includes(now);
              return (
                <button key={f.id} onClick={() => openFish(f)}
                  style={{ background:"#fff", border: inSeason ? "1.5px solid #3f9e63" : "1px solid var(--line)",
                    borderRadius:12, padding:"14px 8px", cursor:"pointer", display:"flex", flexDirection:"column",
                    alignItems:"center", gap:5, minHeight:64 }}>
                  <span style={{ fontSize:14, fontWeight:800, color:"var(--ink)" }}>{f.canonical_name}</span>
                  {inSeason && <span style={{ fontSize:10, fontWeight:900, color:"#2c6b45" }}>いまが旬</span>}
                </button>
              );
            })}
          </div>
          {shown.length === 0 && (
            <div style={{ textAlign:"center", color:"var(--faint)", padding:"40px 0", fontSize:13 }}>
              見つかりませんでした
            </div>
          )}
        </>
      )}

      {/* 足す画面 */}
      {addOpen && (
        <div onClick={() => !addBusy && setAddOpen(false)}
          style={{ position:"fixed", inset:0, zIndex:1300, background:"rgba(15,25,38,0.6)",
            display:"flex", alignItems:"center", justifyContent:"center", padding:20 }}>
          <div onClick={e => e.stopPropagation()}
            style={{ background:"#fff", borderRadius:16, width:"100%", maxWidth:420, padding:"22px 20px" }}>
            <div style={{ fontSize:16.5, fontWeight:900, color:"var(--ink)", marginBottom:4 }}>
              切り口を足す{sel ? `（${sel.canonical_name}）` : ""}
            </div>
            <div style={{ fontSize:11.5, color:"var(--sub)", lineHeight:1.7, marginBottom:14 }}>
              売場で気づいたこと、お客様の声、使えそうな言い回しなど
            </div>

            <div style={{ fontSize:11.5, fontWeight:800, color:"var(--sub)", marginBottom:6 }}>ことば</div>
            <input value={term} onChange={e => setTerm(e.target.value)} placeholder="例：寒ブリ 脂のりが最高"
              style={{ width:"100%", boxSizing:"border-box", border:"2px solid var(--line)", borderRadius:10,
                padding:"11px 12px", fontSize:15, outline:"none", fontFamily:"inherit", marginBottom:12 }} />

            <div style={{ fontSize:11.5, fontWeight:800, color:"var(--sub)", marginBottom:6 }}>
              調理法・季節（あれば・読点で区切る）
            </div>
            <input value={ctx} onChange={e => setCtx(e.target.value)} placeholder="例：刺身、しゃぶしゃぶ、年末"
              style={{ width:"100%", boxSizing:"border-box", border:"2px solid var(--line)", borderRadius:10,
                padding:"11px 12px", fontSize:15, outline:"none", fontFamily:"inherit", marginBottom:12 }} />

            <div style={{ fontSize:11.5, fontWeight:800, color:"var(--sub)", marginBottom:6 }}>パスワード</div>
            <input type="password" inputMode="numeric" value={pw} onChange={e => setPw(e.target.value)}
              onKeyDown={e => { if (e.key === "Enter") submitNote(); }}
              style={{ width:"100%", boxSizing:"border-box", border:"2px solid var(--line)", borderRadius:10,
                padding:"11px 12px", fontSize:15, outline:"none", fontFamily:"inherit",
                marginBottom: addMsg ? 8 : 16 }} />

            {addMsg && (
              <div style={{ fontSize:12.5, fontWeight:800, marginBottom:12,
                color: addMsg.includes("入れました") ? "#2c6b45" : "#b3261e" }}>{addMsg}</div>
            )}

            <div style={{ display:"flex", gap:9 }}>
              <button onClick={() => setAddOpen(false)} disabled={addBusy}
                style={{ flex:1, border:"none", background:"var(--chip)", color:"var(--text)",
                  borderRadius:10, padding:"12px", fontSize:14, fontWeight:800, cursor:"pointer" }}>やめる</button>
              <button onClick={submitNote} disabled={addBusy || !term.trim()}
                style={{ flex:1, border:"none", background:(addBusy || !term.trim()) ? "#ccc" : "var(--primary)",
                  color:"#fff", borderRadius:10, padding:"12px", fontSize:14, fontWeight:900, cursor:"pointer" }}>
                {addBusy ? "入れています…" : "入れる"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

;Object.assign(window, { TrendTab });
