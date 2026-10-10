/* Nexus共有 — 05-tab-board （自動分割・window共有） */
var { useState, useEffect, useCallback, useRef } = React;

// ═══════════ TABS：機能タブ（Board / Search / 各ツール…） ═══════════
function BoardTab({ onMenu, menuBadge, currentStore, actionsRef, onCreateFromPop, radialOpen, setRadialOpen, tipEnabled, tipMessage, feat, onFeatGo }) {
  const [pops, setPops] = useState([]);
  const [loading, setLoading] = useState(true);
  const [fStore, setFStore] = useState("");
  const [fCat, setFCat] = useState("");
  const [showUp, setShowUp] = useState(false);
  const [openGroup, setOpenGroup] = useState(null);   // 開いているまとまり
  const grpSwipe = React.useRef(null);
  const [reloading, setReloading] = useState(false);   // 更新ボタンの回転
  // 右から出る絞り込み（タグ・店舗・ことば）
  const [drawer, setDrawer] = useState(false);
  useEffect(() => {
    const open = () => { setDrawer(true); loadSpecies(); };
    window.addEventListener("openSearch", open);
    return () => window.removeEventListener("openSearch", open);
  }, []);
  useEffect(() => {
    try { window.dispatchEvent(new CustomEvent(drawer ? "searchOpened" : "searchClosed")); } catch(e) {}
  }, [drawer]);
  const [fGenre, setFGenre] = useState("");
  const [qText, setQText] = useState("");
  const [species, setSpecies] = useState([]);
  const [fSp, setFSp] = useState(null);            // 魚でしぼる
  const loadSpecies = () => {
    if (species.length || window.__speciesCache) { if (!species.length) setSpecies(window.__speciesCache); return; }
    api.listSpecies().then(r => { window.__speciesCache = r || []; setSpecies(r || []); }).catch(() => {});
  };
  // いまの一覧に何件あるかを数えて、多い順に出す
  const spCounts = React.useMemo(() => {
    if (!species.length) return [];
    const texts = pops.map(p => normJa([p.product_name, p.group_name, p.comment].filter(Boolean).join(" ")));
    return species.map(sp => {
      const al = (sp.aliases || []).concat([sp.canonical_name]).map(normJa).filter(a => a.length >= 2 || /[\u4e00-\u9faf]/.test(a));
      const n = texts.filter(t => al.some(a => t.includes(a))).length;
      return { sp, n };
    }).filter(x => x.n > 0).sort((a, b) => b.n - a.n).slice(0, 14);
  }, [species, pops]);

  const clearFilters = () => { setFGenre(""); setQText(""); setFStore(""); setFCat(""); setFSp(null); };
  const filterCount = (fGenre ? 1 : 0) + (qText.trim() ? 1 : 0) + (fStore ? 1 : 0) + (fCat ? 1 : 0) + (fSp ? 1 : 0);
  // 企画カレンダーを先に読んでおく（開いたときにすぐ出るように）
  useEffect(() => {
    const t = setTimeout(() => {
      const go = () => { try { if (window.prefetchBundles) window.prefetchBundles(); } catch(e) {} };
      if (window.requestIdleCallback) window.requestIdleCallback(go, { timeout: 3000 }); else go();
    }, 1500);
    return () => clearTimeout(t);
  }, []);
  // 画面の明るさ：暗い画面の切り替えは 2026-10-06 にやめた。いつも明るい画面
  useEffect(() => {
    try {
      document.documentElement.setAttribute("data-theme", "light");
      localStorage.removeItem("theme");
      const m = document.querySelector('meta[name="theme-color"]'); if (m) m.setAttribute("content", "#F5F2EC");
    } catch(e) {}
  }, []);               // まとまり画面のスワイプ判定
  // 文字サイズ：切り替えは 2026-10-06 にやめ、大きい方で固定
  useEffect(() => {
    try { document.documentElement.style.setProperty("--pc-name-size", "17px"); } catch(e) {}
  }, []);

  const [view, setView] = useState(() => { try { const v = localStorage.getItem("popView"); return (v === "md" || v === "lg") ? v : "md"; } catch(e) { return "md"; } });
  const setViewSave = (v) => { setView(v); try { localStorage.setItem("popView", v); } catch(e) {} };
  // 列の数。パソコンは4・6列、スマホは3・4列。入りきらない幅では自動で減る（2026-10-10）
  const [列好み, set列好み] = useState(() => 列の好み(false));
  const [列好み狭, set列好み狭] = useState(() => 列の好み(true));
  const 盤 = usePopCols(列好み, 列好み狭);
  const 束盤 = usePopCols(列好み, 列好み狭);
  const 列にする = (n) => {
    setViewSave("md");
    try {
      if (盤.狭い) { set列好み狭(n); localStorage.setItem("popColsS", String(n)); }
      else { set列好み(n); localStorage.setItem("popCols", String(n)); }
    } catch(e) {}
  };
  // 「1まい」は 2026-10-10 にやめた。前に選んでいた端末は列の表示にもどす
  useEffect(() => { if (view === "lg") setViewSave("md"); }, []);
  const [sel, setSel] = useState(null);
  const [commentedIds, setCommentedIds] = useState(new Set());
  const [radialChanged, setRadialChanged] = useState(false);
  const [hubSpin, setHubSpin] = useState(false);
  // 下の案内（季節のポップは…）は、同じ文なら端末ごとに1回だけ出す（2026-10-08）
  const [showNotice, setShowNotice] = useState(true);
  const [featShow, setFeatShow] = useState(() => {
    try { const seen = localStorage.getItem("featSeen"); return !feat || (seen !== (feat.ver || feat.message)); } catch(e) { return true; }
  });
  const tipOn = tipEnabled !== false;
  const tipText = tipMessage || "季節のポップや時期が過ぎたポップは「アーカイブ」に収納されます。";
  const [tip済み, setTip済み] = useState(() => { try { return localStorage.getItem("tipSeen") === tipText; } catch(e) { return false; } });
  useEffect(() => {
    let 済 = false; try { 済 = localStorage.getItem("tipSeen") === tipText; } catch(e) {}
    if (済) { setTip済み(true); return; }
    setTip済み(false);
    const t = setTimeout(() => { try { localStorage.setItem("tipSeen", tipText); } catch(e) {} }, 3000);   // 一度見えたら、次からは出さない
    return () => clearTimeout(t);
  }, [tipText]);

  const [読めず, set読めず] = useState(false);       // 取り直しても返事が来なかった
  // 静か=true のときは、今の一覧を出したまま裏で取り直す（戻ってきたときなど）
  const load = useCallback(async (静か) => {
    if (!静か) setLoading(true);
    try {
      const data = await api.listActive();
      setPops(data); set読めず(false);
    }
    catch(e) { console.error(e); if (!静か) set読めず(true); }
    finally { if (!静か) setLoading(false); }
  }, []);


  useEffect(() => { load(); }, [load]);
  // アプリが一時停止から戻ってきたら、一覧を取り直す（14-app が知らせる）
  useEffect(() => {
    const 戻った = () => load(pops.length > 0);
    window.addEventListener("appResume", 戻った);
    return () => window.removeEventListener("appResume", 戻った);
  }, [load, pops.length]);

  useEffect(() => {
    if (actionsRef) actionsRef.current = { refresh: load, openUpload: () => setShowUp(true) };
  }, [load, actionsRef]);

  useEffect(() => {
    if (!showNotice) return;
    const el = scroller(); if (!el) return;
    const onScroll = () => setShowNotice(false);
    el.addEventListener("scroll", onScroll, { passive: true });
    return () => el.removeEventListener("scroll", onScroll);
  }, [showNotice]);

  useEffect(() => {
    if (!radialOpen) return;
    const el = scroller(); if (!el) return;
    const onScroll = () => { setRadialOpen(false); setRadialChanged(false); };
    el.addEventListener("scroll", onScroll, { passive: true });
    return () => el.removeEventListener("scroll", onScroll);
  }, [radialOpen]);

  const counts = pops.reduce((a,p) => { a[p.store_name]=(a[p.store_name]||0)+1; return a; }, {});
  const qn = normJa(qText.trim());
  const filtered = pops.filter(p =>
      (!fStore || p.store_name === fStore) &&
      (!fCat || p.category === fCat) &&
      (!fGenre || p.genre === fGenre) &&
      (!qn || [p.product_name, p.group_name, p.comment, p.author, p.store_name]
        .some(x => x && normJa(String(x)).includes(qn))) &&
      (!fSp || (() => {
        const t = normJa([p.product_name, p.group_name, p.comment].filter(Boolean).join(" "));
        return (fSp.aliases || []).concat([fSp.canonical_name]).map(normJa)
          .filter(a => a.length >= 2 || /[\u4e00-\u9faf]/.test(a)).some(a => t.includes(a));
      })())
    ).sort((a,b) => (b.is_pinned ? 1 : 0) - (a.is_pinned ? 1 : 0));

  const handleHubClick = () => {
    if (!radialChanged) { setRadialOpen(v=>!v); return; }   // 未選択時は開閉トグル（写真を広く見たい時用）
    setHubSpin(true);
    load();
    setTimeout(()=>{ setHubSpin(false); setRadialChanged(false); }, 380); // 更新後も輪は開いたまま
  };
  const pickStore = (val) => { setFStore(val); setRadialChanged(true); };
  const pickCat = (val) => { setFCat(val); setRadialChanged(true); };

  const storeItems = [{lbl:"全店舗",val:""},...STORES.filter(s=>(counts[s]||0)>0).map(s=>({lbl:s,val:s}))];
  const catItems = ["",...deptCategories()].map(c=>({lbl:c||"すべて", val:c}));
  const storePos = arcPositions(storeItems.length, 104, 150, 30);
  const catPos = arcPositions(catItems.length, 152, 158, 22);
  const FAN_BOTTOM = "calc(92px + env(safe-area-inset-bottom))";

  return (
    <>
      <div style={{ maxWidth:1600, margin:"0 auto", padding:"9px 16px 110px" }}>
        {/* よく使う機能へのショートカット */}
        <div className="board-head">
        <div className="board-top" style={{ display:"contents" }}>
          {[
            ["__menu", "メニュー", false, <svg key="m" width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 7h16M4 12h16M4 17h16"/></svg>],

            ["__upload", "投稿", false, <svg key="d" width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round"><path d="M12 5v14M5 12h14"/></svg>],

            /* ↓ パソコンでだけ出る（スマホではCSSで隠す） */
            ["catalog", "カタログ", false, <svg key="c" width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round"><path d="M3 5.5s2.5-1.5 4.5-1.5S12 5.5 12 5.5v14s-2-1.5-4.5-1.5S3 19.5 3 19.5z"/><path d="M12 5.5s2.5-1.5 4.5-1.5S21 5.5 21 5.5v14s-2-1.5-4.5-1.5S12 19.5 12 19.5z"/></svg>],

            
            
          ].map(([key, label, primary, icon]) => (
            <button key={key} onClick={() => { if (key === "__menu") { onMenu && onMenu(); } else if (key === "__upload") setShowUp(true); else if (key === "search") { setDrawer(true); loadSpecies(); } else if (onFeatGo) onFeatGo(key); }} className={"hig-pill " + (key === "__menu" ? "bh-menu" : key === "__upload" ? "bh-post" : key === "catalog" ? "bh-catalog" : "bh-search")}
              style={{ display:"flex", flexDirection:"row", alignItems:"center", justifyContent:"center", gap:6, border: primary ? "none" : "1px solid var(--line)", background: primary ? "var(--primary-soft, #4a7ab0)" : "var(--card, #fff)", color: primary ? "#fff" : "var(--primary-soft, #4a7ab0)", borderRadius:11, padding:"9px 4px", minHeight:44, cursor:"pointer", position:"relative", boxShadow: primary ? "0 2px 8px rgba(74,122,176,0.3)" : "0 1px 3px rgba(0,0,0,0.05)" }}>
              {key === "__menu" && menuBadge && (
                <span style={{ position:"absolute", top:6, right:7, width:9, height:9, borderRadius:"50%", background:"#e0555f" }} />
              )}
              {icon}
              <span style={{ fontSize:14, fontWeight:800, color: primary ? "#fff" : "var(--ink)", whiteSpace:"nowrap" }}>{label}</span>
            </button>
          ))}
        </div>
          <div className="board-tools" style={{ display:"flex", alignItems:"center", justifyContent:"space-between", gap:4, marginBottom:10 }}>
            <div style={{ display:"flex", gap:3, background:"var(--chip)", borderRadius:10, padding:3, flexShrink:0 }}>
              {(盤.狭い
                // スマホ：3列（大きいマス）と4列（小さいマス）。字は出さずマークで（2026-10-10）
                ? [["md3", "3列（大きく）", <svg key="big" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round"><rect x="3.5" y="3.5" width="7" height="7" rx="1.2"/><rect x="13.5" y="3.5" width="7" height="7" rx="1.2"/><rect x="3.5" y="13.5" width="7" height="7" rx="1.2"/><rect x="13.5" y="13.5" width="7" height="7" rx="1.2"/></svg>], ["md4", "4列（小さく）", <svg key="small" width="20" height="20" viewBox="0 0 24 24" fill="currentColor" stroke="none"><rect x="3.5" y="3.5" width="4.4" height="4.4" rx=".8"/><rect x="9.8" y="3.5" width="4.4" height="4.4" rx=".8"/><rect x="16.1" y="3.5" width="4.4" height="4.4" rx=".8"/><rect x="3.5" y="9.8" width="4.4" height="4.4" rx=".8"/><rect x="9.8" y="9.8" width="4.4" height="4.4" rx=".8"/><rect x="16.1" y="9.8" width="4.4" height="4.4" rx=".8"/><rect x="3.5" y="16.1" width="4.4" height="4.4" rx=".8"/><rect x="9.8" y="16.1" width="4.4" height="4.4" rx=".8"/><rect x="16.1" y="16.1" width="4.4" height="4.4" rx=".8"/></svg>]]
                // パソコン・タブレット：4列（大きいマス）と6列（小さいマス）
                : [["md4", "4列（大きく）", <svg key="big" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round"><rect x="3.5" y="3.5" width="7" height="7" rx="1.2"/><rect x="13.5" y="3.5" width="7" height="7" rx="1.2"/><rect x="3.5" y="13.5" width="7" height="7" rx="1.2"/><rect x="13.5" y="13.5" width="7" height="7" rx="1.2"/></svg>], ["md6", "6列（小さく）", <svg key="small" width="20" height="20" viewBox="0 0 24 24" fill="currentColor" stroke="none"><rect x="3.5" y="3.5" width="4.4" height="4.4" rx=".8"/><rect x="9.8" y="3.5" width="4.4" height="4.4" rx=".8"/><rect x="16.1" y="3.5" width="4.4" height="4.4" rx=".8"/><rect x="3.5" y="9.8" width="4.4" height="4.4" rx=".8"/><rect x="9.8" y="9.8" width="4.4" height="4.4" rx=".8"/><rect x="16.1" y="9.8" width="4.4" height="4.4" rx=".8"/><rect x="3.5" y="16.1" width="4.4" height="4.4" rx=".8"/><rect x="9.8" y="16.1" width="4.4" height="4.4" rx=".8"/><rect x="16.1" y="16.1" width="4.4" height="4.4" rx=".8"/></svg>]]
              ).map(([k, label, icon]) => {
                const 選 = view === "md" && (盤.狭い ? 列好み狭 : 列好み) === +k.slice(2);
                return (
                <button key={k} onClick={() => 列にする(+k.slice(2))} title={label}
                  aria-label={label} aria-pressed={選} className={"bt-seg" + (選 ? " on" : "")} style={{ border:"none", background: 選 ? "var(--card, #fff)" : "transparent", color: 選 ? "var(--primary-soft)" : "var(--sub)", borderRadius:8, padding:0, cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center", boxShadow: 選 ? "0 1px 3px rgba(0,0,0,0.12)" : "none" }}>{icon}</button>
                );
              })}
            </div>

            {/* 部門の切り替えはメニューのマークの右へ移した。暗い画面の切り替えはやめた（2026-10-06） */}
          </div>
        </div>

        <TodayInfoCard />
        {feat && feat.enabled && feat.message && featShow && (
          <div onClick={() => { if (feat.tab && onFeatGo) onFeatGo(feat.tab); }}
            style={{ display:"flex", alignItems:"center", gap:10, background:"linear-gradient(135deg,#2f6fb0,#4a8fd4)", borderRadius:14, padding:"12px 14px", marginBottom:12, cursor: feat.tab ? "pointer" : "default", boxShadow:"0 4px 16px rgba(47,111,176,0.22)", animation:"fadeUp .35s ease" }}>
            <span style={{ fontSize:20, flexShrink:0 }}>🎉</span>
            <div style={{ minWidth:0, flex:1 }}>
              <div style={{ fontSize:12.5, fontWeight:800, color:"rgba(255,255,255,0.8)" }}>新機能のお知らせ</div>
              <div style={{ fontSize:13, fontWeight:800, color:"#fff", lineHeight:1.4 }}>{feat.message}</div>
            </div>
            {feat.tab && <span style={{ fontSize:12, fontWeight:800, color:"#2f6fb0", background:"var(--card, #fff)", borderRadius:8, padding:"4px 10px", flexShrink:0 }}>ひらく</span>}
            <button onClick={(e) => { e.stopPropagation(); try { localStorage.setItem("featSeen", feat.ver || feat.message); } catch(x){} setFeatShow(false); }}
              style={{ border:"none", background:"rgba(255,255,255,0.2)", color:"#fff", width:26, height:26, borderRadius:"50%", fontSize:14, fontWeight:800, cursor:"pointer", flexShrink:0, lineHeight:1 }}>✕</button>
          </div>
        )}
        {tipOn && showNotice && !tip済み && !radialOpen && (
          <div onClick={() => setShowNotice(false)}
            style={{ position:"fixed", left:0, right:0, bottom:"calc(90px + env(safe-area-inset-bottom))", zIndex:150, padding:"0 12px", cursor:"pointer", animation:"fadeUp .35s ease" }}>
            <div style={{ maxWidth:1600, margin:"0 auto", display:"flex", alignItems:"center", gap:10, background:"linear-gradient(135deg,#fff3ea,#ffe9d6)", border:"1.5px solid #ffd9bd", borderRadius:14, padding:"12px 14px", boxShadow:"0 4px 16px rgba(194,78,0,0.18)" }}>
              <span style={{ fontSize:13, fontWeight:700, color:"#a8480a", lineHeight:1.5, flex:1 }}>{tipText}</span>
            </div>
          </div>
        )}
        {loading ? (
          <div ref={盤.ref} className={"pop-grid v-" + view + (view === "md" ? 盤.cls : "")} style={view === "md" ? 盤.style : undefined}>
            {[0,1,2,3,4,5,6,7].map((h,i) => (
              <div key={i} style={{ background:"var(--card, #fff)", borderRadius:"var(--r-card, 12px)", overflow:"hidden", boxShadow:"var(--card-shadow)" }}>
                <div className="sk pc-img-el" style={{ width:"100%", aspectRatio:"1 / 1.414" }} />
                <div style={{ padding:"9px 11px" }}>
                  <div className="sk" style={{ width:"62%", height:11, borderRadius:6 }} />
                  <div className="sk" style={{ width:"40%", height:10, borderRadius:6, marginTop:7 }} />
                </div>
              </div>
            ))}
          </div>
        ) : (読めず && pops.length === 0) ? (
          <div style={{ textAlign:"center", padding:"70px 20px" }}>
            <div style={{ fontWeight:800, fontSize:16, color:"var(--ink)" }}>一覧を読み込めませんでした</div>
            <div style={{ fontSize:13, color:"var(--sub)", marginTop:6, lineHeight:1.8 }}>電波の弱い所では、返事が届かないことがあります。</div>
            <button onClick={() => load()} style={{ marginTop:16, border:"none", background:"var(--fill)", color:"#fff",
              borderRadius:12, padding:"12px 26px", fontSize:15, fontWeight:900, cursor:"pointer", fontFamily:"inherit" }}>もう一度読み込む</button>
          </div>
        ) : filtered.length===0 ? (
          <div style={{ textAlign:"center", padding:80, color:"var(--faint)" }}>
            
            <div style={{ fontWeight:800, fontSize:16, color:"var(--sub)" }}>ポップがまだありません</div>
            <div style={{ fontSize:13 }}>アップロードボタンから最初のポップを共有しましょう！</div>
          </div>
        ) : (
          <>
            <div ref={盤.ref} className={"pop-grid v-" + view + (view === "md" ? 盤.cls : "")} style={view === "md" ? 盤.style : undefined}>
              {(() => {
                // 同じまとまりは1件にたたむ（表紙に選んだ1枚＝group_posが小さいものを代表にする）
                const seen = {}; const list = [];
                filtered.forEach(pop => {
                  if (pop.group_id) {
                    const cur = seen[pop.group_id];
                    if (cur) {
                      cur.__count++;
                      // より表紙に近いもの（group_posが小さい）が来たら、絵だけ差し替える
                      const a = pop.group_pos == null ? 9999 : pop.group_pos;
                      const b = cur.group_pos == null ? 9999 : cur.group_pos;
                      if (a < b) {
                        cur.image_url = pop.image_url;
                        cur.rotation  = pop.rotation;
                        cur.group_pos = pop.group_pos;
                        cur.img_w = pop.img_w; cur.img_h = pop.img_h; cur.__imgId = pop.id;   // 絵の縦横も表紙のものに
                      }
                      return;
                    }
                    const head = { ...pop, __count: 1, __group: true, __imgId: pop.id };
                    seen[pop.group_id] = head; list.push(head);
                  } else list.push(pop);
                });
                // 並べ方（2026-10-10）：横長は2列ぶんを使う（CSS）。順番は投稿の新しい順のまま
                return list.map((pop, i) => (
                  <PopCard key={pop.id} pop={pop} index={i}
                    onClick={() => pop.__group ? setOpenGroup(pop) : setSel(pop)}
                    hasComment={(pop.comment_count||0) > 0 || commentedIds.has(pop.id)} />
                ));
              })()}
            </div>
          </>
        )}
      </div>
      {openGroup && (() => {
        const inGroup = pops.filter(p => p.group_id === openGroup.group_id)
          .sort((a,b) => (a.group_pos||0) - (b.group_pos||0));
        return (
          <div
            onTouchStart={(e) => { const t = e.touches[0]; grpSwipe.current = { x:t.clientX, y:t.clientY, t:Date.now() }; }}
            onTouchEnd={(e) => {
              const st = grpSwipe.current; if (!st) return;
              const t = e.changedTouches[0];
              const dx = t.clientX - st.x, dy = t.clientY - st.y;
              // 横に大きく、縦は小さく動かしたら「もどる」（右でも左でもよい）
              if (Math.abs(dx) > 70 && Math.abs(dy) < 60 && Date.now() - st.t < 700) setOpenGroup(null);
              grpSwipe.current = null;
            }}
            className="fs-top" style={{ position:"fixed", inset:0, zIndex:900, background:"var(--bg)", overflowY:"auto", WebkitOverflowScrolling:"touch" }}>
            <div style={{ position:"sticky", top:0, zIndex:2, background:"var(--fill)", color:"#fff", padding:"10px 14px", display:"flex", alignItems:"center", gap:10 }}>
              <button onClick={() => setOpenGroup(null)} aria-label="もどる"
                style={{ border:"none", background:"rgba(255,255,255,0.22)", color:"#fff", borderRadius:999, padding:"7px 14px 7px 10px",
                  display:"flex", alignItems:"center", gap:4, fontSize:13.5, fontWeight:800, cursor:"pointer", flexShrink:0 }}>
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round"><path d="M15 5l-7 7 7 7"/></svg>
                もどる
              </button>
              <span style={{ minWidth:0, flex:1 }}>
                <span style={{ display:"block", fontSize:15.5, fontWeight:800, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>
                  {openGroup.group_name || openGroup.product_name}
                </span>
                <span style={{ display:"block", fontSize:12.5, opacity:0.85 }}>{inGroup.length}枚 ／ {openGroup.store_name} ／ 横にスワイプでもどる</span>
              </span>
            </div>
            <div style={{ maxWidth:1600, margin:"0 auto", padding:"12px 14px 120px" }}>
              <div ref={束盤.ref} className={"pop-grid v-" + view + (view === "md" ? 束盤.cls : "")} style={view === "md" ? 束盤.style : undefined}>
                {inGroup.map((pop,i)=><PopCard key={pop.id} pop={pop} index={i} onClick={setSel}
                  hasComment={(pop.comment_count||0) > 0 || commentedIds.has(pop.id)} />)}
              </div>
            </div>
          </div>
        );
      })()}
      {/* 右から出る絞り込み */}
      {drawer && (
        <div onClick={() => setDrawer(false)}
          style={{ position:"fixed", inset:0, zIndex:1250, background:"rgba(12,18,26,0.5)" }}>
          <div onClick={e => e.stopPropagation()} className="fs-top"
            style={{ position:"absolute", top:0, right:0, bottom:0, width:"min(360px, 88vw)",
              background:"var(--drawer-bg, #fff)", backdropFilter:"blur(14px)", WebkitBackdropFilter:"blur(14px)", boxShadow:"-6px 0 24px rgba(10,20,35,0.22)",
              display:"flex", flexDirection:"column", animation:"drawerIn .24s cubic-bezier(.16,1,.3,1)" }}>

            <div style={{ display:"flex", alignItems:"center", gap:8, padding:"12px 14px 10px", borderBottom:"1px solid var(--line)" }}>
              <span style={{ fontSize:16, fontWeight:900, color:"var(--ink)" }}>さがす</span>
              <span style={{ fontSize:12.5, fontWeight:800, color:"var(--sub)" }}>{filtered.length}件</span>
              <button onClick={() => setDrawer(false)} aria-label="閉じる"
                style={{ marginLeft:"auto", border:"none", background:"var(--chip)", color:"var(--sub)",
                  borderRadius:9, width:34, height:34, cursor:"pointer", fontSize:15, fontWeight:900 }}>✕</button>
            </div>

            <div style={{ flex:"1 1 auto", overflowY:"auto", padding:"14px 14px 20px", WebkitOverflowScrolling:"touch" }}>
              <input value={qText} onChange={e => setQText(e.target.value)} placeholder="ことばでさがす（さんま・刺身 など）"
                style={{ width:"100%", boxSizing:"border-box", border:"1.5px solid var(--line)", borderRadius:11,
                  padding:"12px 13px", fontSize:15, outline:"none", fontFamily:"inherit",
                  background:"var(--card, #fff)", color:"var(--ink)", marginBottom:18 }} />

              {[
                { key:"genre", title:"ジャンルで絞り込む",
                  items: deptGenres().map(g => ({ v:g, l:g })), cur: fGenre,
                  set: (v) => { setFGenre(v); if (!v && !fSp) setFStore(""); } },
                { key:"fish", title: deptConf().ものの呼び名 + "で絞り込む",
                  items: spCounts.map(({ sp, n }) => ({ v:sp.id, l:sp.canonical_name, n, sp })),
                  cur: fSp ? fSp.id : "", set: (v, it) => { setFSp(it && it.sp ? it.sp : null); if (!v && !fGenre) setFStore(""); } },
                // お店は、ジャンルか魚を選んだあとで下に出す（最初は出さない）
                { key:"store", title:"お店で絞り込む",
                  items: (fGenre || fSp || fStore) ? STORES.map(x => ({ v:x, l:x })) : [], cur: fStore, set: setFStore },
              ].filter(sec => sec.items.length).map(sec => (
                <div key={sec.key} style={{ marginBottom:20 }}>
                  <div style={{ display:"flex", alignItems:"center", gap:7, paddingBottom:9, marginBottom:11,
                    borderBottom:"1px solid var(--line)" }}>
                    <span style={{ width:4, height:15, borderRadius:2, background:"var(--fill)" }} />
                    <span style={{ fontSize:14, fontWeight:900, color:"var(--ink)" }}>{sec.title}</span>
                  </div>
                  <div style={{ display:"flex", flexWrap:"wrap", gap:7 }}>
                    {sec.items.map(it => {
                      const on = sec.cur === it.v;
                      return (
                        <button key={it.v} onClick={() => sec.set(on ? "" : it.v, on ? null : it)} aria-pressed={on}
                          style={{ display:"flex", alignItems:"center", gap:7, cursor:"pointer",
                            border: on ? "1.5px solid var(--primary-soft)" : "1px solid var(--line)",
                            background: on ? "var(--soft)" : "var(--card, #fff)",
                            color: on ? "var(--soft-text)" : "var(--text)",
                            borderRadius:9, padding:"8px 12px 8px 9px", fontSize:13, fontWeight:700 }}>
                          <span style={{ width:15, height:15, borderRadius:"50%", flexShrink:0,
                            border: on ? "5px solid var(--primary-soft)" : "1.5px solid var(--line)",
                            background:"var(--card, #fff)", boxSizing:"border-box" }} />
                          {it.l}
                          {it.n != null && <span style={{ fontSize:12, fontWeight:900, opacity:0.6 }}>{it.n}</span>}
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>

            <div style={{ display:"flex", gap:8, padding:"10px 14px calc(12px + env(safe-area-inset-bottom))", borderTop:"1px solid var(--line)" }}>
              <button onClick={clearFilters} disabled={!filterCount}
                style={{ flex:1, border:"1px solid var(--line)", background:"var(--card, #fff)",
                  color: filterCount ? "var(--text)" : "var(--faint)", borderRadius:11, padding:"13px",
                  fontSize:14, fontWeight:800, cursor:"pointer" }}>絞り込みを解除</button>
              <button onClick={() => setDrawer(false)}
                style={{ flex:1.4, border:"none", background:"var(--fill)", color:"#fff",
                  borderRadius:11, padding:"13px", fontSize:14.5, fontWeight:900, cursor:"pointer" }}>
                絞り込む（{filtered.length}件）
              </button>
            </div>
          </div>
        </div>
      )}

      {showUp && <UploadModal currentStore={currentStore} onClose={()=>setShowUp(false)} onSuccess={pop=>{setPops(p=>[pop,...p]);setShowUp(false);}} />}
      {radialOpen && (
        <div onClick={()=>{ setRadialOpen(false); setRadialChanged(false); }}
          style={{ position:"fixed", inset:0, zIndex:160 }} />
      )}
      <div style={{ position:"fixed", left:"50%", bottom:FAN_BOTTOM, width:1, height:1, zIndex:165 }}>
        {storeItems.map((it,i) => {
          const active = it.val === fStore;
          const delay = radialOpen ? (50+i*30) : 0;
          return (
            <button key={"s"+it.val} onClick={(e)=>{ e.stopPropagation(); pickStore(it.val); }}
              style={{
                position:"absolute", left:0, bottom:0, transformOrigin:"50% 100%",
                transform: radialOpen ? `translate(-50%,0) translate(${storePos[i].tx}px, ${storePos[i].ty}px) scale(1)` : "translate(-50%,0) scale(0.2)",
                opacity: radialOpen?1:0, pointerEvents: radialOpen?"auto":"none",
                transitionProperty:"transform, opacity", transitionDuration:"0.6s, 0.4s",
                transitionTimingFunction:"cubic-bezier(.16,1.18,.3,1), ease",
                transitionDelay:`${delay}ms, ${delay}ms`,
                padding:"6px 11px", whiteSpace:"nowrap", fontSize:13, fontWeight: active?800:700, borderRadius:8,
                boxShadow:"0 3px 12px rgba(0,0,0,0.12)", cursor:"pointer",
                background:"rgba(255,255,255,0.7)", backdropFilter:"blur(3px)", color: active?"var(--primary)":"#222", border:"none",
                borderBottom: active?"2.5px solid var(--primary)":"2.5px solid transparent" }}>
              {it.lbl}
            </button>
          );
        })}
        {catItems.map((it,i) => {
          const active = it.val === fCat;
          const delay = radialOpen ? (170+i*30) : 0;
          return (
            <button key={"c"+it.val} onClick={(e)=>{ e.stopPropagation(); pickCat(it.val); }}
              style={{
                position:"absolute", left:0, bottom:0, transformOrigin:"50% 100%",
                transform: radialOpen ? `translate(-50%,0) translate(${catPos[i].tx}px, ${catPos[i].ty}px) scale(1)` : "translate(-50%,0) scale(0.2)",
                opacity: radialOpen?1:0, pointerEvents: radialOpen?"auto":"none",
                transitionProperty:"transform, opacity", transitionDuration:"0.6s, 0.4s",
                transitionTimingFunction:"cubic-bezier(.16,1.18,.3,1), ease",
                transitionDelay:`${delay}ms, ${delay}ms`,
                padding:"5px 10px", whiteSpace:"nowrap", fontSize:12, fontWeight: active?800:700, borderRadius:8,
                boxShadow:"0 3px 12px rgba(0,0,0,0.12)", cursor:"pointer",
                background:"rgba(255,255,255,0.7)", backdropFilter:"blur(3px)", color: active?"#111":"#222", border:"none",
                borderBottom: active?"2.5px solid #111":"2.5px solid transparent" }}>
              {it.lbl}
            </button>
          );
        })}
      </div>

      {sel && <PopDetail pop={sel} onClose={()=>setSel(null)}
        navList={filtered} onNav={setSel}
        onDelete={id=>setPops(p=>p.filter(x=>x.id!==id))}
        onLiked={(id,likes)=>setPops(p=>p.map(x=>x.id===id?{...x,likes}:x))}
        onCommented={id=>setCommentedIds(s=>new Set([...s, id]))}
        onCreateFromPop={onCreateFromPop}
      />}
    </>
  );
}

// ── Search Tab ──
function SearchTab({ onCreateFromPop, radialOpen, setRadialOpen }) {
  const 結果盤 = usePopCols();
  const [allPops, setAllPops] = useState([]);
  const [loaded, setLoaded] = useState(false);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [fStore, setFStore] = useState("");
  const [fCat, setFCat] = useState("");
  const [fGenre, setFGenre] = useState("");
  const [sel, setSel] = useState(null);

  // 初回は検索バーにフォーカスが当たった段階 or 文字入力時にロード
  const ensureLoaded = async () => {
    if (loaded || loading) return;
    setLoading(true);
    try { const data = await api.listActive(); setAllPops(data); setLoaded(true); }
    catch(e) { console.error(e); }
    finally { setLoading(false); }
  };

  useEffect(() => { ensureLoaded(); }, []);

  useEffect(() => {
    if (!radialOpen) return;
    const el = scroller(); if (!el) return;
    const onScroll = () => setRadialOpen(false);
    el.addEventListener("scroll", onScroll, { passive: true });
    return () => el.removeEventListener("scroll", onScroll);
  }, [radialOpen]);

  const q = normJa(search.trim());
  const results = !loaded ? [] : allPops.filter(p => {
    const matchStore  = !fStore || p.store_name === fStore;
    const matchCat    = !fCat   || p.category === fCat;
    const matchGenre  = !fGenre || p.genre === fGenre;
    const matchSearch = !q ||
      normJa(p.product_name).includes(q) ||
      normJa(p.store_name).includes(q) ||
      normJa(p.category).includes(q);
    return p.genre !== "除外" && matchStore && matchCat && matchGenre && matchSearch;
  });

  const hasFilter = q || fStore || fCat || fGenre;
  const storeCounts = allPops.reduce((a,p)=>{ a[p.store_name]=(a[p.store_name]||0)+1; return a; }, {});
  const fanStoreItems = STORES.filter(s=>(storeCounts[s]||0)>0).map(s=>({lbl:s,val:s}));
  const fanCatItems = ["",...deptCategories().filter(c=>c!=="その他")].map(c=>({lbl:c||"すべて", val:c}));
  const fanStorePos = arcPositions(fanStoreItems.length, 104, 150, 30);
  const fanCatPos = arcPositions(fanCatItems.length, 152, 158, 22);
  const FAN_BOTTOM = "calc(92px + env(safe-area-inset-bottom))";

  return (
    <div style={{ maxWidth:1600, margin:"0 auto", padding:"10px 16px 84px" }}>

      {/* 左端のジャンル付箋タブ（扇フィルターと同時に表示。勝部が選別したジャンルで絞り込み） */}
      <div className="genre-tabs" style={{ position:"fixed", left:0, top:"calc(50% + 16px)", transform:"translateY(-50%)", zIndex:166, display:"flex", flexDirection:"column", gap:3, maxHeight:"calc(100vh - 210px)", overflowY:"auto", overscrollBehavior:"contain", WebkitOverflowScrolling:"touch", paddingTop:2, paddingBottom:2 }}>
          {deptGenres().map(g => {
            const c = deptGenreColors()[g];
            const on = fGenre === g;
            return (
              <button key={g} onClick={() => { setFGenre(on ? "" : g); ensureLoaded(); }}
                style={{ writingMode:"vertical-rl", height: on ? 96 : 84, width: on ? 52 : 46,
                  display:"flex", alignItems:"center", justifyContent:"center",
                  border:"none", cursor:"pointer", letterSpacing:".04em",
                  background: on ? c.solid : c.soft, color: on ? "#fff" : c.text,
                  fontSize: on ? 14 : 12, fontWeight:800, borderRadius:"0 11px 11px 0",
                  boxShadow: on ? "2px 2px 9px rgba(0,0,0,0.20)" : "1px 1px 4px rgba(0,0,0,0.10)",
                  transition:"all .18s ease" }}>
                {g === "切身" ? "切身・生食" : g}
              </button>
            );
          })}
        </div>
      {/* 検索ボックス */}
      <div style={{ background:"var(--card)", borderRadius:18, padding:"18px 20px 16px", boxShadow:"0 4px 20px rgba(0,0,0,0.08)", marginBottom:20, marginLeft:46 }}>
        {/* 検索入力（最上部） */}
        <div style={{ position:"relative", marginBottom:12 }}>
          
          <input type="text" value={search} onChange={e=>{ setSearch(e.target.value); ensureLoaded(); }} onFocus={ensureLoaded}
            placeholder="商品名・店舗名・カテゴリで検索..."
            style={{ width:"100%", boxSizing:"border-box", padding:"12px 16px 12px 16px", border:"2px solid var(--line)", borderRadius:12, fontSize:15, outline:"none", background:"var(--bg)" }} />
          {search && (
            <button onClick={()=>setSearch("")} style={{ position:"absolute", right:11, top:"50%", transform:"translateY(-50%)", background:"#ddd", border:"none", borderRadius:"50%", width:24, height:24, cursor:"pointer", fontSize:13, color:"var(--text)", display:"flex", alignItems:"center", justifyContent:"center" }}>✕</button>
          )}
        </div>
        {/* 店舗フィルター */}
        <div style={{ display:"flex", gap:"0 15px", marginBottom:11, overflowX:"auto", paddingBottom:4 }}>
          {[{lbl:"全店舗",val:""},...STORES.filter(s=>(storeCounts[s]||0)>0).map(s=>({lbl:s,val:s}))].map(({lbl,val})=>(
            <button key={lbl} onClick={()=>{ setFStore(val); ensureLoaded(); }}
              style={{ border:"none", background:"none", cursor:"pointer", padding:"0 0 3px", flexShrink:0, whiteSpace:"nowrap", fontSize:13, fontWeight:fStore===val?700:600, color:fStore===val?"var(--primary)":"#888", borderBottom:fStore===val?"2px solid var(--primary)":"1px solid #ededef" }}>
              {lbl}
            </button>
          ))}
        </div>

        {/* カテゴリフィルター */}
        <div style={{ display:"flex", gap:"0 15px", flexWrap:"nowrap", overflowX:"auto", paddingBottom:4 }}>
          {["", "その他", ...deptCategories().filter(c=>c!=="その他")].map(c=>(
            <button key={c||"all"} onClick={()=>{ setFCat(c); ensureLoaded(); }}
              style={{ border:"none", background:"none", cursor:"pointer", padding:"0 0 3px", flexShrink:0, whiteSpace:"nowrap", fontSize:12.5, fontWeight:fCat===c?700:600, color:fCat===c?"#111":"#999", borderBottom:fCat===c?"2px solid #111":"1px solid #ededef" }}>
              {c||"すべて"}
            </button>
          ))}
        </div>

        {/* よく使う検索ワード（折り返しで全部表示） */}
        <div style={{ display:"flex", flexWrap:"wrap", gap:"9px 15px", alignItems:"baseline", marginTop:12 }}>
          {["刺身","寿司","切身","マグロ","サーモン","ブリ","鯛","エビ","いか","タコ","カニ","ホタテ","真あじ","生食","鮭","対面","夏","鯖","貝"].map(w=>{
            const on = search===w;
            return (
              <button key={w} onClick={()=>{ setSearch(on?"":w); ensureLoaded(); }}
                style={{ border:"none", background:"none", cursor:"pointer", padding:"0 0 3px", flexShrink:0, whiteSpace:"nowrap", fontSize:on?13.5:13, fontWeight:on?700:600, color:on?"var(--primary)":"#7a7a7f", borderBottom:on?"2px solid var(--primary)":"1px solid #e7e7e9" }}>
                {w}
              </button>
            );
          })}
        </div>

      </div>

      {/* 結果エリア */}
      <div style={{ paddingLeft:46 }}>
      {loading ? (
        <div style={{ textAlign:"center", padding:60, color:"var(--faint)" }}>
          
          <div style={{ animation:"pulse 1.5s infinite" }}>読み込み中...</div>
        </div>
      ) : !hasFilter ? (
        allPops.length === 0 ? (
          <div style={{ textAlign:"center", padding:"70px 40px", color:"var(--faint)" }}>
            <svg width="72" height="72" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" style={{ opacity:0.5, marginBottom:14 }}><path d="M3 12c2-4 6-6 10-6 3 0 5 1 6.5 2.5C21 10 21.5 12 21.5 12S21 14 19.5 15.5C18 17 16 18 13 18c-4 0-8-2-10-6z"/><path d="M3 12l-1.5-2.5M3 12l-1.5 2.5"/><circle cx="15" cy="10.5" r="0.9" fill="currentColor" stroke="none"/></svg>
            <div style={{ fontSize:15, fontWeight:800, color:"var(--sub)" }}>まだポップがありません</div>
            <div style={{ fontSize:12.5, marginTop:6, lineHeight:1.6 }}>「＋投稿」から最初のポップを共有してみましょう</div>
          </div>
        ) : (
          <div>
            <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:12, paddingLeft:2 }}>
              <span style={{ fontSize:14.5, fontWeight:900, color:"var(--ink)", letterSpacing:"-0.3px" }}>みんなのポップ</span>
              <span style={{ fontSize:12, fontWeight:900, color:"var(--primary-soft, #4a7ab0)", background:"var(--soft)", borderRadius:999, padding:"2px 10px" }}>{allPops.length}</span>
            </div>
            <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill, minmax(118px, 1fr))", gap:3 }}>
              {allPops.map(pop=>(
                <img alt={pop.product_name || ""} key={pop.id} src={pop.image_url} loading="lazy" onClick={()=>setSel(pop)}
                  style={{ width:"100%", aspectRatio:"1/1", objectFit:"cover", borderRadius:8, cursor:"pointer", background:"var(--chip)", display:"block" }} />
              ))}
            </div>
          </div>
        )
      ) : results.length === 0 ? (
        <div style={{ textAlign:"center", padding:"70px 40px", color:"var(--faint)" }}>
          <svg width="72" height="72" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" style={{ opacity:0.5, marginBottom:14 }}><path d="M3 12c2-4 6-6 10-6 3 0 5 1 6.5 2.5C21 10 21.5 12 21.5 12S21 14 19.5 15.5C18 17 16 18 13 18c-4 0-8-2-10-6z"/><path d="M3 12l-1.5-2.5M3 12l-1.5 2.5"/><circle cx="15" cy="10.5" r="0.9" fill="currentColor" stroke="none"/></svg>
          <div style={{ fontSize:15, fontWeight:800, color:"var(--sub)" }}>一致するポップが見つかりません</div>
          <div style={{ fontSize:12.5, marginTop:6 }}>{(fStore || fCat || fGenre) ? "絞り込みが多すぎるかもしれません" : "別のキーワードで試してみてください"}</div>
          {(fStore || fCat || fGenre || search) && (
            <button onClick={(e)=>{ e.stopPropagation(); setFStore(""); setFCat(""); setFGenre(""); setSearch(""); }}
              style={{ marginTop:16, border:"none", background:"var(--fill)", color:"#fff", borderRadius:999, padding:"10px 22px", fontSize:13, fontWeight:800, cursor:"pointer", boxShadow:"0 2px 8px rgba(74,122,176,0.3)" }}>
              絞り込みを外す
            </button>
          )}
        </div>
      ) : (
        <>
          <div style={{ fontSize:13, color:"var(--sub)", fontWeight:700, marginBottom:12 }}>
            {q && <span>「<span style={{ color:"var(--primary)" }}>{search}</span>」</span>}
            {(fGenre||fStore||fCat) && <span style={{ marginLeft: q?4:0 }}>{[fGenre,fStore,fCat].filter(Boolean).join(" · ")} </span>}
            の検索結果：<span style={{ color:"var(--ink)" }}>{results.length}件</span>
          </div>
          <div ref={結果盤.ref} className={"pop-grid v-md" + 結果盤.cls} style={結果盤.style}>
            {results.map((pop,i)=><PopCard key={pop.id} pop={pop} index={i} onClick={setSel} />)}
          </div>
        </>
      )}
      </div>

      {radialOpen && (
        <div onClick={()=>setRadialOpen(false)} style={{ position:"fixed", inset:0, zIndex:160 }} />
      )}
      <div style={{ position:"fixed", left:"50%", bottom:FAN_BOTTOM, width:1, height:1, zIndex:165 }}>
        {fanStoreItems.map((it,i) => {
          const active = it.val === fStore;
          const delay = radialOpen ? (50+i*30) : 0;
          return (
            <button key={"s"+it.val} onClick={(e)=>{ e.stopPropagation(); setFStore(it.val); ensureLoaded(); }}
              style={{ position:"absolute", left:0, bottom:0, transformOrigin:"50% 100%",
                transform: radialOpen ? `translate(-50%,0) translate(${fanStorePos[i].tx}px, ${fanStorePos[i].ty}px) scale(1)` : "translate(-50%,0) scale(0.2)",
                opacity: radialOpen?1:0, pointerEvents: radialOpen?"auto":"none",
                transitionProperty:"transform, opacity", transitionDuration:"0.6s, 0.4s",
                transitionTimingFunction:"cubic-bezier(.16,1.18,.3,1), ease",
                transitionDelay:`${delay}ms, ${delay}ms`,
                padding:"6px 11px", whiteSpace:"nowrap", fontSize:13, fontWeight: active?800:700, borderRadius:8,
                boxShadow:"0 3px 12px rgba(0,0,0,0.12)", cursor:"pointer",
                background:"rgba(255,255,255,0.7)", backdropFilter:"blur(3px)", color: active?"var(--primary)":"#222", border:"none",
                borderBottom: active?"2.5px solid var(--primary)":"2.5px solid transparent" }}>
              {it.lbl}
            </button>
          );
        })}
        {fanCatItems.map((it,i) => {
          if (it.val === "") return null;   // 「すべて」は左の付箋と重なるため非表示
          const active = it.val === fCat;
          const delay = radialOpen ? (170+i*30) : 0;
          return (
            <button key={"c"+it.val} onClick={(e)=>{ e.stopPropagation(); setFCat(it.val); ensureLoaded(); }}
              style={{ position:"absolute", left:0, bottom:0, transformOrigin:"50% 100%",
                transform: radialOpen ? `translate(-50%,0) translate(${fanCatPos[i].tx}px, ${fanCatPos[i].ty}px) scale(1)` : "translate(-50%,0) scale(0.2)",
                opacity: radialOpen?1:0, pointerEvents: radialOpen?"auto":"none",
                transitionProperty:"transform, opacity", transitionDuration:"0.6s, 0.4s",
                transitionTimingFunction:"cubic-bezier(.16,1.18,.3,1), ease",
                transitionDelay:`${delay}ms, ${delay}ms`,
                padding:"5px 10px", whiteSpace:"nowrap", fontSize:12, fontWeight: active?800:700, borderRadius:8,
                boxShadow:"0 3px 12px rgba(0,0,0,0.12)", cursor:"pointer",
                background:"rgba(255,255,255,0.7)", backdropFilter:"blur(3px)", color: active?"#111":"#222", border:"none",
                borderBottom: active?"2.5px solid #111":"2.5px solid transparent" }}>
              {it.lbl}
            </button>
          );
        })}
      </div>

      {sel && <PopDetail pop={sel} onClose={()=>setSel(null)}
        navList={results} onNav={setSel}
        onDelete={id=>{ setAllPops(p=>p.filter(x=>x.id!==id)); setSel(null); }}
        onLiked={(id,likes)=>setAllPops(p=>p.map(x=>x.id===id?{...x,likes}:x))}
        onCreateFromPop={onCreateFromPop}
      />}

    </div>
  );
}

// ── Blog Tab (売り場ノート) ──


;Object.assign(window, { BoardTab, SearchTab });
