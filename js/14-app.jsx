/* GoodDay 鮮魚共有 — 14-app （自動分割・window共有） */
var { useState, useEffect, useCallback, useRef } = React;

// ═══════════ APP：シェル（ルーティング・ナビ・メニュー・テーマ） ═══════════
// 遅延タブの対応表：タブkey → { ファイル名, window上のコンポーネント名 }
var LAZY_TABS = {
  barcode: { file:"08-tab-barcode", comp:"BarcodeTab" },
  gne:     { file:"10-tab-gne",     comp:"GeneratorTab" },
  fish:    { file:"15-tab-fish",    comp:"FishTab" },
  admin:   { file:"13-tab-admin",   comp:"AdminTab" },
  request: { file:"13-tab-admin",   comp:"RequestTab" },   // お問い合わせ（管理ファイル内のため遅延経由で）
  archive: { file:"13-tab-admin",   comp:"ArchiveTab" },   // アーカイブ（同上）
};

// 遅延タブの器：まだ読めていなければ読み込み、ロード中はスピナー、失敗時は再試行
function LazyTab(props) {
  var info = LAZY_TABS[props.tabKey];
  var readyState = useState(!!(window.__lazyLoaded && window.__lazyLoaded[info.file]));
  var ready = readyState[0], setReady = readyState[1];
  var errState = useState(null);
  var err = errState[0], setErr = errState[1];

  useEffect(function(){
    var alive = true;
    if (window[info.comp]) { setReady(true); return; }
    setErr(null);
    window.loadLazyTab(info.file).then(function(){
      if (alive) setReady(true);
    }).catch(function(e){
      if (alive) setErr(e);
    });
    return function(){ alive = false; };
  }, [props.tabKey]);

  if (err) {
    return React.createElement("div", { style:{ padding:"60px 20px", textAlign:"center" } },
      React.createElement("div", { style:{ fontSize:14, color:"var(--sub)", marginBottom:14, lineHeight:1.7 } }, "読み込みに失敗しました。\n通信環境をご確認ください。"),
      React.createElement("button", { onClick:function(){ setErr(null); window.loadLazyTab(info.file).then(function(){ setReady(true); }).catch(setErr); },
        style:{ border:"1px solid var(--line)", background:"#fff", color:"var(--text)", borderRadius:9, padding:"9px 18px", fontSize:13, fontWeight:800, cursor:"pointer" } }, "もう一度読み込む"));
  }
  var Comp = window[info.comp];
  if (!(window.__lazyLoaded && window.__lazyLoaded[info.file]) || !Comp) {
    return React.createElement("div", { style:{ padding:"80px 20px", textAlign:"center" } },
      React.createElement("div", { className:"spinner", style:{ margin:"0 auto 14px" } }),
      React.createElement("div", { style:{ fontSize:13, color:"var(--faint)", fontWeight:700 } }, "読み込み中…"));
  }
  return React.createElement(Comp, props.compProps || {});
}

function App() {
  const [tab, setTab] = useState("board");

  const [currentStore, setCurrentStore] = useState(STORES[0]);
  useEffect(() => { api.logDeviceVisit(currentStore); }, []); // 端末記録：起動時に1回（1日1回まで）
  const boardActions = React.useRef({});
  const [showUpload, setShowUpload] = useState(false);
  const [toolSeed, setToolSeed] = useState(null);
  const [moreOpen, setMoreOpen] = useState(false);
  const [showToTop, setShowToTop] = useState(false);
  const [popDetailOpen, setPopDetailOpen] = useState(false);
  useEffect(() => {
    const h = (e) => setPopDetailOpen(!!e.detail);
    window.addEventListener("popdetail", h);
    const g = (e) => { if (e.detail) { setRadialOpen(false); setTab(e.detail); } };
    window.addEventListener("gotoTab", g);
    return () => { window.removeEventListener("popdetail", h); window.removeEventListener("gotoTab", g); };
  }, []);

  // 一覧を開いたとき、横スライダーは「業界情報・競合情報」が中央に来る位置で表示
  useEffect(() => {
    if (tab !== "board") return;
    requestAnimationFrame(() => {
      const sc = document.getElementById("shelf-scroll");
      const a = document.getElementById("shelf-industry");
      const b = document.getElementById("shelf-competitor");
      if (!sc || !a || !b) return;
      const mid = (a.offsetLeft + (b.offsetLeft + b.offsetWidth)) / 2;
      sc.scrollLeft = Math.max(0, mid - sc.clientWidth / 2);
    });
  }, [tab]);
  const [wxCode, setWxCode] = useState(null);

  // 天気テーマ（ヘッダー背景をDynamic Island裏まで描画）
  const skyTheme = (() => {
    const hour = new Date().getHours();
    const night = hour >= 19 || hour < 5;
    const base = { bg:"linear-gradient(180deg,#8FA0B0 0%,#E8ECEF 70%,#ffffff 100%)", txtDark:true };  // フォールバック（通常）
    if (wxCode == null) return base;
    if (night) return { bg:"linear-gradient(180deg,#1E2A4A 0%,#2F3E63 55%,#4A5B85 100%)", pat:"radial-gradient(circle, rgba(255,255,255,0.85) 0.7px, transparent 1px)", patSize:"110px 80px", txtDark:false };
    const c = wxCode;
    if (c <= 1) return { bg:"linear-gradient(180deg,#5B9BD5 0%,#93C4EC 55%,#CFE7F9 100%)", txtDark:true };
    if (c <= 3 || c === 45 || c === 48) return { bg:"linear-gradient(180deg,#8A9BAC 0%,#BECAD5 55%,#E9EDF1 100%)", txtDark:true };
    if ((c >= 71 && c <= 77) || c === 85 || c === 86) return { bg:"linear-gradient(180deg,#93AEC4 0%,#C9DCEA 60%,#EFF6FB 100%)", pat:"radial-gradient(circle, #ffffff 1.2px, transparent 1.5px)", patSize:"48px 40px", txtDark:true };
    return { bg:"linear-gradient(180deg,#3F4F66 0%,#5A6C86 60%,#7C90A7 100%)", pat:"repeating-linear-gradient(75deg, rgba(255,255,255,0.10) 0px, rgba(255,255,255,0.10) 1px, transparent 1px, transparent 15px)", txtDark:false };  // 雨・雷
  })();
  const [radialOpen, setRadialOpen] = useState(false);
  const [scrollP, setScrollP] = useState(0); // 0=最上部 ... 1=ヘッダーがガラス化しきった状態
  const [toast, setToast] = useState(null);
  useEffect(() => {
    const h = (e) => {
      setToast(e.detail || "完了しました");
      setTimeout(() => setToast(null), 2200);
    };
    window.addEventListener("appToast", h);
    return () => window.removeEventListener("appToast", h);
  }, []);
  const [pullY, setPullY] = useState(0);
  const [refreshing, setRefreshing] = useState(false);
  const [dataVer, setDataVer] = useState(0);
  const [notice, setNotice] = useState({ enabled:false, message:"", tip_enabled:false, tip_message:"季節のポップや時期が過ぎたポップは「アーカイブ」に収納されます。", feat_enabled:false, feat_message:"", feat_tab:"", feat_ver:"", badge_tab:"", badge_text:"", badge_ver:"", badge_until:null });
  const [badgeOn, setBadgeOn] = useState(false);
  const [bubbleShow, setBubbleShow] = useState(false);   // 開いた瞬間だけ出る吹き出し
  const pullActive = React.useRef(false);
  const pullStart = React.useRef(0);
  const pullDist = React.useRef(0);

  useEffect(() => {
    const FADE_RANGE = 68;
    const el = scroller(); if (!el) return;
    const onScroll = () => {
      const y = Math.min(el.scrollTop, FADE_RANGE);
      setScrollP(y / FADE_RANGE);
      setShowToTop(el.scrollTop > 400);
    };
    el.addEventListener("scroll", onScroll, { passive: true });
    return () => el.removeEventListener("scroll", onScroll);
  }, []);

  const doRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      if (tab === "board" && boardActions.current && boardActions.current.refresh) {
        await boardActions.current.refresh();
      } else if (tab === "search" || tab === "floor") {
        setDataVer(v => v + 1);
      }
    } catch(e) { console.error(e); }
    setTimeout(() => setRefreshing(false), 700);
  }, [tab]);

  useEffect(() => {
    const TH = 70;
    const el = scroller(); if (!el) return;
    const onStart = (e) => {
      if (el.scrollTop <= 0 && !refreshing && !moreOpen && !radialOpen) {
        pullActive.current = true; pullStart.current = e.touches[0].clientY;
      } else { pullActive.current = false; }
    };
    const onMove = (e) => {
      if (!pullActive.current) return;
      const dy = e.touches[0].clientY - pullStart.current;
      if (dy > 0 && el.scrollTop <= 0) {
        const d = Math.min(dy * 0.5, 90);
        pullDist.current = d; setPullY(d);
        if (dy > 6 && e.cancelable) e.preventDefault();
      } else { pullActive.current = false; pullDist.current = 0; setPullY(0); }
    };
    const onEnd = () => {
      if (!pullActive.current) return;
      pullActive.current = false;
      if (pullDist.current >= TH) doRefresh();
      pullDist.current = 0; setPullY(0);
    };
    el.addEventListener("touchstart", onStart, { passive: true });
    el.addEventListener("touchmove", onMove, { passive: false });
    el.addEventListener("touchend", onEnd, { passive: true });
    el.addEventListener("touchcancel", onEnd, { passive: true });
    return () => {
      el.removeEventListener("touchstart", onStart);
      el.removeEventListener("touchmove", onMove);
      el.removeEventListener("touchend", onEnd);
      el.removeEventListener("touchcancel", onEnd);
    };
  }, [refreshing, moreOpen, radialOpen, doRefresh]);

  useEffect(() => {
    api.getNotice().then(n => {
      setNotice(n);
      // ナビの赤バッジ：期間内で、まだ見ていないお知らせだけ光らせる
      if (n && n.badge_tab && n.badge_ver) {
        const alive = !n.badge_until || new Date(n.badge_until).getTime() > Date.now();
        let seen = "";
        try { seen = localStorage.getItem("badgeSeenVer") || ""; } catch(e) {}
        if (alive && n.badge_ver !== seen) {
          setBadgeOn(true);
          setBubbleShow(true);
          setTimeout(() => setBubbleShow(false), 4000);   // 4秒でふわっと消える（赤丸は残る）
        }
      }
    }).catch(()=>{});
  }, []);
  const clearBadge = () => {
    setBadgeOn(false);
    setBubbleShow(false);
    try { localStorage.setItem("badgeSeenVer", notice.badge_ver || ""); } catch(e) {}
  };

  useEffect(() => {
    const sp = document.getElementById("splash");
    if (!sp) return;
    const t0 = window.__splashT0 || 0;
    const wait = Math.max(0, 900 - (Date.now() - t0));
    const h = setTimeout(() => { sp.classList.add("hide"); setTimeout(() => sp.remove(), 500); }, wait);
    return () => clearTimeout(h);
  }, []);

  const handleCreateFromPop = (pop) => {
    setToolSeed({ product: pop.product_name || "", image_url: pop.image_url });
    setTab("tool");
  };
  const handleCreatePop = (seed) => { setToolSeed(seed); setTab("tool"); };

  const tabs = [
    { key:"board",   icon:"📌", label:"一覧",       color:"var(--primary)" },
    { key:"floor",   icon:"📸", label:"売場",       color:"#2f6fb0" },
    { key:"tool",    icon:"✏️", label:"作成",       color:"#8B6914" },
    { key:"search",  icon:"🔍", label:"検索",       color:"#059669" },
    { key:"catalog", icon:"📖", label:"予約カタログ", color:"#b8860b" },
    { key:"barcode", icon:"🏷", label:"発注バーコード生成", color:"var(--primary)" },
    { key:"dev",     icon:"ℹ️", label:"お知らせ",   color:"#6b7280" },
    { key:"gne",     icon:"🅖", label:"入力ジェネレーター",      color:"#7c3aed" },
  ];

  return (
    <div id="app-scroll" style={{ background:"var(--bg)", paddingBottom:"calc(70px + env(safe-area-inset-bottom))" }}>
      {(pullY > 0 || refreshing) && (
        <div style={{ position:"fixed", top:0, left:"50%", transform:"translateX(-50%)", zIndex:150, pointerEvents:"none",
          marginTop: refreshing ? 12 : Math.max(pullY - 30, 4),
          transition: pullActive.current ? "none" : "margin-top .25s" }}>
          <div style={{ width:34, height:34, borderRadius:"50%", background:"#fff", boxShadow:"0 3px 12px rgba(0,0,0,0.18)", display:"flex", alignItems:"center", justifyContent:"center", color:"var(--primary)", fontSize:18, fontWeight:900,
            transform: refreshing ? undefined : `rotate(${pullY*4}deg)`,
            animation: refreshing ? "spin 0.7s linear infinite" : "none" }}>↻</div>
        </div>
      )}
      <div style={{ paddingTop:"env(safe-area-inset-top)", background:"var(--bg)" }} />

      {notice.enabled && notice.message && (
        <div style={{ maxWidth:1600, margin:"0 auto", padding:"10px 16px 0" }}>
          <div style={{ background:"#fff4e5", border:"1px solid #ffc98a", color:"#8a4b00", borderRadius:12, padding:"12px 14px", fontSize:13.5, fontWeight:700, lineHeight:1.6, display:"flex", gap:9, alignItems:"flex-start", boxShadow:"0 1px 6px rgba(0,0,0,0.06)" }}>
            <span style={{ fontSize:16, lineHeight:1.3 }}>⚠️</span>
            <span style={{ whiteSpace:"pre-wrap" }}>{notice.message}</span>
          </div>
        </div>
      )}
      {tab==="board"  && <BoardTab currentStore={currentStore} actionsRef={boardActions} onCreateFromPop={handleCreateFromPop} radialOpen={radialOpen} setRadialOpen={setRadialOpen} tipEnabled={notice.tip_enabled} tipMessage={notice.tip_message} feat={{ enabled: notice.feat_enabled, message: notice.feat_message, tab: notice.feat_tab, ver: notice.feat_ver }} onFeatGo={(t)=>setTab(t)} />}
      {tab==="barcode" && <LazyTab tabKey="barcode" />}
      {tab==="floor"  && <FloorPhotoTab key={"floor"+dataVer} />}
      {tab==="tool"   && <PopToolTab seed={toolSeed} onSeedConsumed={()=>setToolSeed(null)} />}
      {tab==="catalog" && <CatalogTab />}
      {tab==="order"   && <OrderTab />}
      {tab==="bundle"  && <BundleTab />}
      {tab==="search" && <SearchTab key={"search"+dataVer} onCreateFromPop={handleCreateFromPop} radialOpen={radialOpen} setRadialOpen={setRadialOpen} />}
      {tab==="gne"    && <LazyTab tabKey="gne" compProps={{ onCreatePop: handleCreatePop }} />}
      {tab==="souba"  && <SoubaTab onCreatePop={handleCreatePop} />}
      {tab==="industry" && <IndustryTab />}
      {tab==="competitor" && <CompetitorTab />}
      {tab==="calendar" && <CalendarTab />}
      {tab==="fish" && <LazyTab tabKey="fish" />}
      {tab==="popcheck" && <PopCheckTab />}
      {tab==="admin"  && <LazyTab tabKey="admin" compProps={{ onNoticeChange:setNotice, onCreateFromPop:handleCreateFromPop }} />}
      {tab==="request" && <LazyTab tabKey="request" />}
      {tab==="archive" && <LazyTab tabKey="archive" compProps={{ onCreateFromPop:handleCreateFromPop }} />}
      {tab==="dev"    && <DevTab />}

      {/* 下部固定ナビ */}

      {showToTop && !moreOpen && !radialOpen && !popDetailOpen && (
        <button onClick={() => scrollerTop(true)} aria-label="上へ戻る"
          style={{ position:"fixed", left:14, bottom: tab === "board" ? "calc(46px + env(safe-area-inset-bottom))" : "calc(30px + env(safe-area-inset-bottom))", zIndex:190, width:46, height:46, borderRadius:12, border:"none", background:"rgba(0,0,0,0.62)", backdropFilter:"blur(6px)", boxShadow:"0 3px 12px rgba(0,0,0,0.25)", color:"#fff", fontSize:22, fontWeight:900, cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center", animation:"fadeUp .25s ease" }}>↑</button>
      )}

      {toast && (
        <div style={{ position:"fixed", left:0, right:0, bottom:"calc(96px + env(safe-area-inset-bottom))", zIndex:400, display:"flex", justifyContent:"center", pointerEvents:"none", padding:"0 24px" }}>
          <div style={{ display:"flex", alignItems:"center", gap:8, background:"rgba(26,43,60,0.94)", color:"#fff", borderRadius:999, padding:"11px 20px", fontSize:13.5, fontWeight:800, boxShadow:"0 6px 20px rgba(0,0,0,0.28)", animation:"fadeUp .28s ease", backdropFilter:"blur(8px)", maxWidth:"100%" }}>
            <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="#6fe08a" strokeWidth="2.8" strokeLinecap="round" strokeLinejoin="round"><path d="M4 12.5l5 5L20 6.5"/></svg>
            <span style={{ overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{toast}</span>
          </div>
        </div>
      )}

      <div style={{ position:"fixed", left:0, right:0, bottom:"max(calc(env(safe-area-inset-bottom) - 22px), 0px)", zIndex:205, display:"flex", justifyContent:"center", padding:"0 6px", pointerEvents:"none" }}>
       <div style={{ display:"flex", alignItems:"center", justifyContent:"space-around", gap:4, width:"100%", maxWidth:1600, background:"var(--primary-soft)", border:"none", borderRadius:18, boxShadow:"0 2px 12px rgba(74,122,176,0.35)", padding:"12px 10px", pointerEvents:"auto" }}>
        {[tabs[0], { key:"bundle", icon:"📅", label:"カレンダー", color:"#3f7cb0" }, { key:"catalog", icon:"📖", label:"カタログ", color:"#b8860b" }, { key:"__more", icon:"≡", label:"メニュー", color:"#6b7280", more:true }].map(({key,icon,label,color,action,more,filter})=>{
          const active = filter ? radialOpen : more ? TAB_REGISTRY.some(t => t.key === tab) : (!action && tab===key && !moreOpen);
          const onClick = action ? () => { setRadialOpen(false); setTab("board"); setShowUpload(true); }
            : filter ? () => { setMoreOpen(false); setTab("board"); setRadialOpen(v=>!v); }
            : more ? () => { setRadialOpen(false); setMoreOpen(v=>!v); }
            : key==="search" ? () => { setMoreOpen(false); setTab("search"); setRadialOpen(v=>!v); }
            : () => { setMoreOpen(false); setRadialOpen(false); setTab(key); };
          const NAV_SVG = {
            board: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 10.5L12 3l9 7.5"/><path d="M5 9.5V20h14V9.5"/></svg>,
            search: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="7"/><path d="M20 20l-3.5-3.5"/></svg>,
            more: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 7h16M4 12h16M4 17h16"/></svg>,
            catalog: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 5.5s2.5-1.5 4.5-1.5S12 5.5 12 5.5v14s-2-1.5-4.5-1.5S3 19.5 3 19.5z"/><path d="M12 5.5s2.5-1.5 4.5-1.5S21 5.5 21 5.5v14s-2-1.5-4.5-1.5S12 19.5 12 19.5z"/></svg>,
            close: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M6 6l12 12M18 6L6 18"/></svg>,
            bundle: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3.5" y="5" width="17" height="16" rx="2"/><path d="M3.5 10h17M8 3v4M16 3v4"/></svg>,
          };
          const navIcon = key==="board" ? NAV_SVG.board : key==="bundle" ? NAV_SVG.bundle : key==="catalog" ? NAV_SVG.catalog : key==="search" ? NAV_SVG.search : NAV_SVG.more;
          const navLabel = more ? (moreOpen ? "閉じる" : "メニュー") : label;
          const showBadge = badgeOn && key === notice.badge_tab;
            return (
            <button key={key} onClick={() => { if (showBadge) clearBadge(); onClick(); }} className="hig-pill" aria-label={navLabel} title={navLabel}
              style={{ position:"relative", border:"none", cursor:"pointer", padding:"12px 17px", display:"flex", flexDirection:"row", alignItems:"center", justifyContent:"center", borderRadius:26, background: active ? "#fff" : "transparent", color: active ? "var(--primary-soft)" : "rgba(255,255,255,0.92)", transition:"background .2s" }}>
              <span style={{ display:"flex", lineHeight:1, opacity: active ? 1 : 0.95 }}>{moreOpen && more ? NAV_SVG.close : navIcon}</span>

              {showBadge && (
                <>
                  <span style={{ position:"absolute", top:6, right:12, width:9, height:9, borderRadius:"50%", background:"#e0555f", boxShadow:"0 0 0 2px var(--primary-soft)" }} />
                  {notice.badge_text && (
                    <span style={{ position:"absolute", bottom:"calc(100% + 9px)", left:"50%", transform: bubbleShow ? "translateX(-50%) translateY(0)" : "translateX(-50%) translateY(6px)", background:"#e0555f", color:"#fff", fontSize:11, fontWeight:800, borderRadius:9, padding:"6px 11px", whiteSpace:"nowrap", boxShadow:"0 3px 10px rgba(0,0,0,0.22)", pointerEvents:"none", opacity: bubbleShow ? 1 : 0, visibility: bubbleShow ? "visible" : "hidden", transition:"opacity .5s ease, transform .5s ease, visibility 0s linear .5s" }}>
                      {notice.badge_text}
                      <span style={{ position:"absolute", top:"100%", left:"50%", transform:"translateX(-50%)", width:0, height:0, borderLeft:"5px solid transparent", borderRight:"5px solid transparent", borderTop:"5px solid #e0555f" }} />
                    </span>
                  )}
                </>
              )}
            </button>
          );
        })}
       </div>
      </div>

      {moreOpen && (
        <>
          <div onClick={()=>setMoreOpen(false)}
            style={{ position:"fixed", inset:0, zIndex:201, background:"rgba(0,0,0,0.28)" }} />
          <div style={{ position:"fixed", left:0, right:0, bottom:0, zIndex:202, background:"var(--bg)", borderRadius:"22px 22px 0 0", boxShadow:"0 -8px 30px rgba(0,0,0,0.18)", animation:"sheetUp .28s cubic-bezier(.32,.72,.28,1)", padding:"10px 16px calc(92px + env(safe-area-inset-bottom))" }}>
            <div style={{ width:40, height:4.5, background:"var(--line)", borderRadius:3, margin:"0 auto 12px" }} />
            <div style={{ fontSize:13, fontWeight:900, color:"var(--sub)", marginBottom:12, paddingLeft:2 }}>メニュー</div>
            <div style={{ display:"grid", gridTemplateColumns:"repeat(3, 1fr)", gap:"14px 8px" }}>
              {TAB_REGISTRY.map(o=>(
                <button key={o.key} onClick={()=>{ setTab(o.key); setMoreOpen(false); }}
                  style={{ border:"none", background:"none", padding:0, cursor:"pointer", display:"flex", flexDirection:"column", alignItems:"center", gap:6 }}>
                  <span style={{ position:"relative", width:58, height:58, borderRadius:18, background: tab===o.key ? "var(--soft)" : "#fff", display:"flex", alignItems:"center", justifyContent:"center", fontSize:26, border: tab===o.key ? "1.5px solid var(--primary)" : "1px solid var(--line)", boxShadow: tab===o.key ? "none" : "0 1px 4px rgba(120,100,70,0.06)" }}>
                    {o.icon}
                    {o.badge && <span style={{ position:"absolute", top:-5, right:-9, background:"var(--primary)", color:"#fff", fontSize:8.5, fontWeight:900, padding:"2px 5px", borderRadius:7, letterSpacing:0.4 }}>{o.badge}</span>}
                  </span>
                  <span style={{ fontSize:11.5, fontWeight:800, color: tab===o.key ? "var(--primary)" : "var(--text)", lineHeight:1.25, textAlign:"center" }}>{o.label}</span>
                </button>
              ))}
            </div>
          </div>
        </>
      )}

      {showUpload && <UploadModal currentStore={currentStore}
        onClose={()=>setShowUpload(false)}
        onSuccess={()=>{ setShowUpload(false); if (boardActions.current && boardActions.current.refresh) boardActions.current.refresh(); }} />}
    </div>
  );
}

// 画面が真っ白になるのを防ぎ、原因をその場に表示する安全網
class ErrBoundary extends React.Component {
  constructor(p) { super(p); this.state = { err: null }; }
  static getDerivedStateFromError(err) { return { err }; }
  componentDidCatch(err, info) { try { console.error("画面エラー:", err, info); } catch(e) {} }
  render() {
    if (!this.state.err) return this.props.children;
    const msg = String(this.state.err && (this.state.err.stack || this.state.err.message || this.state.err));
    return (
      <div style={{ padding:"28px 20px", maxWidth:640, margin:"0 auto", fontFamily:"inherit" }}>
        <div style={{ fontSize:17, fontWeight:900, color:"#b3261e", marginBottom:8 }}>表示できませんでした</div>
        <div style={{ fontSize:13, color:"var(--sub)", lineHeight:1.7, marginBottom:14 }}>
          下の内容をそのままコピーして開発担当に送ってください。アプリの他の画面は使えます。
        </div>
        <textarea readOnly value={msg}
          style={{ width:"100%", boxSizing:"border-box", height:180, fontSize:11, lineHeight:1.6, border:"1px solid var(--line)", borderRadius:10, padding:"10px 12px", background:"#fff", fontFamily:"monospace" }} />
        <div style={{ display:"flex", gap:8, marginTop:12 }}>
          <button onClick={() => { try { navigator.clipboard.writeText(msg); } catch(e) {} }}
            style={{ flex:1, border:"none", background:"var(--primary-soft, #4a7ab0)", color:"#fff", borderRadius:10, padding:"12px", fontSize:14, fontWeight:800, cursor:"pointer" }}>コピーする</button>
          <button onClick={() => { this.setState({ err: null }); }}
            style={{ flex:1, border:"1px solid var(--line)", background:"#fff", color:"var(--text)", borderRadius:10, padding:"12px", fontSize:14, fontWeight:800, cursor:"pointer" }}>戻る</button>
        </div>
      </div>
    );
  }
}

ReactDOM.render(<ErrBoundary><App /></ErrBoundary>, document.getElementById("root"));


;Object.assign(window, { App });
