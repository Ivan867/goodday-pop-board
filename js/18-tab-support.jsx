/* Nexus共有 — 18-tab-support （店舗支援：画像を上げて見るだけ） */
var { useState, useEffect, useCallback, useRef } = React;

// 番号で入る。消す機能は付けない（上げる・見る・落とすだけ）
const SUPPORT_PIN = "8";
const SUPPORT_CAT = "店舗支援";
const SUPPORT_TRASH = "店舗支援ゴミ箱";           // 消したものの行き先
const SUPPORT_DAYS = 3;                       // 上げてから何日で消えるか
const SUPPORT_MS = SUPPORT_DAYS * 24 * 60 * 60 * 1000;

// あと何日で消えるか
function supportLeft(created) {
  const ms = SUPPORT_MS - (Date.now() - new Date(created).getTime());
  if (ms <= 0) return null;
  return Math.ceil(ms / (24 * 60 * 60 * 1000));
}

function SupportTab() {
  const [開いた, set開いた] = useState(() => {
    try { return sessionStorage.getItem("supportOpen") === "1"; } catch(e) { return false; }
  });
  const [番号, set番号] = useState("");
  const [誤り, set誤り] = useState("");
  const ひらく = () => {
    if (番号.trim() === SUPPORT_PIN) {
      set開いた(true); set誤り("");
      try { sessionStorage.setItem("supportOpen", "1"); } catch(e) {}
    } else { set誤り("番号が違います"); set番号(""); }
  };

  // 開いたら、まず資料。塩干発注と画像の共有は下の小さな入口から
  const [どれ, setどれ] = useState("docs");
  const 選ぶ = (k) => { setどれ(k); try { window.scrollTo(0, 0); const 面 = document.getElementById("app-scroll"); if (面) 面.scrollTop = 0; } catch (e) {} };

  // ── 番号を入れるまでは、中に何があるかも出さない ──
  if (!開いた) {
    return (
      <div style={{ maxWidth:420, margin:"0 auto", padding:"20px 20px 120px" }}>
        <div style={{ background:"var(--card, #fff)", border:"1px solid var(--line)", borderRadius:16, padding:24, textAlign:"center" }}>
          <div style={{ fontSize:17, fontWeight:900, color:"var(--ink)", marginBottom:6 }}>店舗支援</div>
          <div style={{ fontSize:13, color:"var(--sub)", marginBottom:18 }}>番号を入れてください</div>
          <input value={番号} autoFocus inputMode="numeric" type="password"
            onChange={e => { set番号(e.target.value); set誤り(""); }}
            onKeyDown={e => { if (e.key === "Enter") ひらく(); }}
            placeholder="番号"
            style={{ width:"100%", boxSizing:"border-box", border:"2px solid var(--line)",
              background:"var(--card, #fff)", color:"var(--ink)", borderRadius:10, padding:"12px",
              fontSize:16, textAlign:"center", outline:"none", marginBottom: 誤り ? 8 : 16 }} />
          {誤り && <div style={{ fontSize:13, color:"#b3261e", fontWeight:700, marginBottom:12 }}>{誤り}</div>}
          <button onClick={ひらく}
            style={{ width:"100%", border:"none", background:"var(--fill)", color:"#fff", borderRadius:10,
              padding:"13px", fontSize:15, fontWeight:800, cursor:"pointer" }}>ひらく</button>
        </div>
      </div>
    );
  }

  // ── 番号のあと：資料が主役。ほかの2つは下に小さく ──
  const 戻る = (
    <div style={{ maxWidth:1100, margin:"0 auto", padding:"8px 16px 0" }}>
      <button onClick={() => 選ぶ("docs")}
        style={{ border:"1px solid var(--line)", background:"var(--card)", color:"var(--text)", borderRadius:10,
          padding:"9px 14px", fontSize:13, fontWeight:800, cursor:"pointer", fontFamily:"inherit", marginBottom:12 }}>
        ‹ 資料へ戻る
      </button>
    </div>
  );
  // 塩干発注は、この先で店舗ごとの番号に分かれる（お店によって中身が違うため）
  if (どれ === "order") return (<div>{戻る}{typeof OrderTab === "function" ? <OrderTab /> : null}</div>);
  if (どれ === "photo") return (<div>{戻る}<SupportPhotos /></div>);
  return <SupportDocs 選ぶ={選ぶ} />;
}

// 店舗支援の資料。管理画面で「表示」にしたものだけを並べる
function SupportDocs({ 選ぶ }) {
  const [一覧, set一覧] = useState(null);
  const [失敗, set失敗] = useState(false);
  const 読む = useCallback(async () => {
    set失敗(false);
    try { set一覧(await api.listResources(true) || []); }
    catch (e) { set失敗(true); set一覧([]); }
  }, []);
  useEffect(() => { 読む(); }, [読む]);

  const 小入口 = (k, 題, 説明, 絵) => (
    <button onClick={() => 選ぶ(k)} className="sup-mini">
      <span className="sup-mini-ic" aria-hidden="true">{絵}</span>
      <span style={{ minWidth:0, textAlign:"left" }}>
        <span style={{ display:"block", fontSize:13.5, fontWeight:900, color:"var(--ink)" }}>{題}</span>
        <span style={{ display:"block", fontSize:11.5, color:"var(--sub)", marginTop:1 }}>{説明}</span>
      </span>
      <span style={{ marginLeft:"auto", color:"var(--sub)", fontSize:18 }} aria-hidden="true">›</span>
    </button>
  );

  return (
    <div style={{ maxWidth:1100, margin:"0 auto", padding:"8px 16px 130px" }}>
      <div style={{ fontSize:12.5, color:"var(--sub)", margin:"6px 0 12px" }}>資料を押すと開きます。</div>

      {一覧 === null ? (
        <div className="res-grid">
          {[0,1,2,3].map(i => <div key={i} className="res-card"><div className="res-thumb sk" /><div className="res-body"><div className="sk" style={{ height:12, width:"70%", borderRadius:6, marginBottom:8 }} /></div></div>)}
        </div>
      ) : 失敗 ? (
        <div style={{ textAlign:"center", padding:"40px 0" }}>
          <div style={{ fontSize:14, fontWeight:800, color:"var(--ink)" }}>資料を読み込めませんでした</div>
          <button onClick={読む} style={{ marginTop:12, border:"none", background:"var(--fill)", color:"#fff", borderRadius:10, padding:"10px 20px", fontSize:14, fontWeight:900, cursor:"pointer", fontFamily:"inherit" }}>もう一度読み込む</button>
        </div>
      ) : 一覧.length === 0 ? (
        <div style={{ textAlign:"center", color:"var(--sub)", padding:"40px 0", fontSize:13, lineHeight:1.8 }}>
          まだ資料がありません。<br />管理画面の「資料」で追加し、「表示」にすると、ここに並びます。
        </div>
      ) : (
        <div className="res-grid">
          {一覧.map(r => (
            <a key={r.id} href={r.url} target="_blank" rel="noopener noreferrer" className="res-card sup-doc" aria-label={r.title + "を開く"}>
              <span className="res-thumb">
                {typeof 資料の絵 === "function" ? <資料の絵 r={r} /> : null}
                <span className="res-kind" style={{ background: typeof 資料の色 === "function" ? 資料の色(r.kind) : "#59636f" }}>
                  {typeof 資料の名 === "function" ? 資料の名(r.kind) : "資料"}
                </span>
              </span>
              <span className="res-body" style={{ display:"block", paddingBottom:12 }}>
                <span className="res-title" style={{ display:"block" }}>{r.title}</span>
                {r.description && <span className="res-desc" style={{ display:"block" }}>{r.description}</span>}
              </span>
            </a>
          ))}
        </div>
      )}

      <div style={{ fontSize:12, fontWeight:800, color:"var(--sub)", margin:"28px 0 8px" }}>そのほか</div>
      <div style={{ display:"grid", gap:8 }}>
        {小入口("order", "塩干発注", "店舗ごとの番号で入ります",
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 5.5h16v13H4z"/><path d="M8 9.5h8M8 13h5"/></svg>)}
        {小入口("photo", "画像の共有", "上げてから3日で消えます",
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="5" width="18" height="14" rx="2"/><path d="M3 15l5-4.5 4 3.5 3-2.5 6 5"/></svg>)}
      </div>
    </div>
  );
}

function SupportPhotos() {
  const [list, setList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(0);        // 何枚目を上げているか
  const [total, setTotal] = useState(0);
  const [open, setOpen] = useState(null);     // 拡大して見ている画像
  const fileRef = useRef(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const all = await api.listFloorPhotos(null, SUPPORT_CAT) || [];
      const limit = Date.now() - SUPPORT_MS;
      setList(all.filter(p => new Date(p.created_at).getTime() > limit));
      // 期限の切れたものは、この場で本当に消す（画像そのものも）
      for (const d of all.filter(p => new Date(p.created_at).getTime() <= limit)) {
        try { await api.deleteFloorPhoto(d.id); await api.deleteStoredImage(d.image_url); } catch(e) {}
      }
    } catch(e) { setList([]); }
    setLoading(false);
  }, []);
  useEffect(() => { load(); }, [load]);

  const toTrash = async (p) => {
    if (!window.confirm("この画像を消します。管理画面のゴミ箱に入ります。")) return;
    try {
      await api.insertFloorPhoto({
        store_name: p.store_name || "共有", category: SUPPORT_TRASH, image_url: p.image_url,
        comment: p.comment || "", author: p.author || "", created_at: p.created_at,
      });
      await api.deleteFloorPhoto(p.id);
      setList(v => v.filter(x => x.id !== p.id));
    } catch (err) { /* 失敗は赤いお知らせが出る */ }
  };

  const pick = async (e) => {
    const files = Array.from(e.target.files || []);
    e.target.value = "";
    if (!files.length) return;
    setTotal(files.length);
    for (let i = 0; i < files.length; i++) {
      setBusy(i + 1);
      try {
        const url = await api.upload(files[i]);
        await api.insertFloorPhoto({
          store_name: "共有", category: SUPPORT_CAT, image_url: url,
          comment: "", author: (() => { try { return localStorage.getItem("lastAuthor") || ""; } catch(e) { return ""; } })(),
        });
      } catch (err) { /* 失敗は赤いお知らせが出る */ }
    }
    setBusy(0); setTotal(0);
    load();
  };

  // ── 本体 ──
  return (
    <div>
    <div style={{ maxWidth:1100, margin:"0 auto", padding:"0 16px 120px" }}>
      <input ref={fileRef} type="file" accept="image/*" multiple onChange={pick} style={{ display:"none" }} />

      <button onClick={() => fileRef.current && fileRef.current.click()} disabled={busy > 0}
        style={{ width:"100%", border:"none", borderRadius:12, padding:"15px 12px", marginBottom:14,
          background: busy > 0 ? "var(--chip)" : "var(--primary-soft)", color: busy > 0 ? "var(--sub)" : "#fff",
          fontSize:15.5, fontWeight:900, cursor: busy > 0 ? "default" : "pointer",
          display:"flex", alignItems:"center", justifyContent:"center", gap:8 }}>
        {busy > 0 ? `上げています… ${busy}/${total}` : (
          <>
            <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.3" strokeLinecap="round" strokeLinejoin="round"><path d="M12 16V5"/><path d="M6.5 10.5L12 5l5.5 5.5"/><path d="M4 19h16"/></svg>
            画像を上げる
          </>
        )}
      </button>

      <div style={{ fontSize:12, color:"var(--sub)", lineHeight:1.8, marginBottom:12, textAlign:"center" }}>
        上げた画像は{SUPPORT_DAYS}日で自動的に消えます
      </div>

      {loading ? (
        <div style={{ textAlign:"center", color:"var(--sub)", fontSize:13, padding:"40px 0" }}>読み込み中…</div>
      ) : list.length === 0 ? (
        <div style={{ textAlign:"center", color:"var(--sub)", fontSize:13.5, lineHeight:1.9, padding:"46px 0" }}>
          まだ何もありません。<br />上のボタンから画像を上げてください。
        </div>
      ) : (
        <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill, minmax(150px, 1fr))", gap:10 }}>
          {list.map(p => (
            <div key={p.id} style={{ border:"1px solid var(--line)", background:"var(--card, #fff)",
              borderRadius:12, overflow:"hidden" }}>
            <button onClick={() => setOpen(p)}
              style={{ border:"none", background:"transparent", padding:0, cursor:"pointer", display:"block", width:"100%" }}>
              <img src={p.image_url} alt="" loading="lazy"
                style={{ width:"100%", aspectRatio:"3/4", objectFit:"cover", display:"block", background:"var(--chip)" }} />
              <div style={{ display:"flex", alignItems:"center", gap:6, fontSize:11.5, color:"var(--sub)", padding:"7px 8px", textAlign:"left" }}>
                <span>{formatDate ? formatDate(p.created_at) : String(p.created_at || "").slice(0, 10)}</span>
                {(() => { const d = supportLeft(p.created_at);
                  return d == null ? null : (
                    <span style={{ marginLeft:"auto", background:"var(--soft)", color:"var(--soft-text)",
                      borderRadius:6, padding:"2px 6px", fontSize:11, fontWeight:800, whiteSpace:"nowrap" }}>
                      あと{d}日
                    </span>
                  ); })()}
              </div>
            </button>
              <div style={{ padding:"0 8px 8px" }}>
                <button onClick={() => toTrash(p)}
                  style={{ width:"100%", border:"1px solid var(--line)", background:"transparent",
                    color:"var(--sub)", borderRadius:8, padding:"7px", fontSize:12.5, fontWeight:800,
                    cursor:"pointer" }}>消す</button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* 拡大して見る／保存する */}
      {open && (
        <div onClick={() => setOpen(null)}
          style={{ position:"fixed", inset:0, zIndex:300, background:"rgba(8,14,20,0.92)",
            display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", padding:16 }}>
          <img src={open.image_url} alt=""
            style={{ maxWidth:"100%", maxHeight:"calc(100vh - 150px)", objectFit:"contain", borderRadius:6 }} />
          <div onClick={e => e.stopPropagation()} style={{ display:"flex", gap:10, marginTop:16 }}>
            <a href={open.image_url} download target="_blank" rel="noopener noreferrer"
              style={{ border:"none", background:"var(--fill)", color:"#fff", borderRadius:10,
                padding:"12px 22px", fontSize:14, fontWeight:800, textDecoration:"none" }}>保存する</a>
            <button onClick={() => setOpen(null)}
              style={{ border:"1px solid rgba(255,255,255,0.3)", background:"transparent", color:"#fff",
                borderRadius:10, padding:"12px 22px", fontSize:14, fontWeight:800, cursor:"pointer" }}>とじる</button>
          </div>
        </div>
      )}
    </div>
    </div>
  );
}

;Object.assign(window, { SupportTab });
