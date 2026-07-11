/* GoodDay 鮮魚共有 — 04-shared （自動分割・window共有） */
var { useState, useEffect, useCallback, useRef } = React;

// ═══════════ SHARED UI：投稿・詳細・カードなど共有部品 ═══════════
function UploadModal({ currentStore, onClose, onSuccess }) {
  const [store, setStore] = useState("木次店");
  const [author, setAuthor] = useState("");
  const [product, setProduct] = useState("");
  const [comment, setComment] = useState("");
  const [category, setCategory] = useState(CATEGORIES[0]);
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [ratioWarn, setRatioWarn] = useState("");

  const onFile = e => {
    const f = e.target.files[0];
    if (!f) return;
    setFile(f);
    const url = URL.createObjectURL(f);
    setPreview(url);
    setRatioWarn("");
    const im = new Image();
    im.onload = () => {
      const A4 = 1.41421, TOL = 0.06;
      const w = im.naturalWidth, h = im.naturalHeight;
      if (!w || !h) return;
      const isPortrait = h >= w;
      const ratio = isPortrait ? h / w : w / h;
      const diff = Math.abs(ratio - A4) / A4;
      if (diff > TOL) {
        const near = ratio > A4 ? "細長め" : "詰まり気味";
        setRatioWarn(`この画像は${isPortrait ? "縦" : "横"}向きですが、A4の比率（1:1.41）から${near}にずれています（今およそ 1:${ratio.toFixed(2)}）。このままでも投稿できますが、印刷時に余白や見切れが出る場合があります。`);
      }
    };
    im.src = url;
  };

  const submit = async () => {
    if (!product.trim()) { setError("商品名を入力してください"); return; }
    if (!author.trim())  { setError("名前を入力してください"); return; }
    if (!file)           { setError("画像を選択してください"); return; }
    setLoading(true); setError("");
    try {
      const image_url = await api.upload(file);
      const pop = await api.insert({ store_name: store, product_name: product.trim(), category, image_url, likes: 0, author: author.trim(), comment: comment.trim() });
      onSuccess(pop);
    } catch(e) { setError("エラー: " + e.message); }
    finally { setLoading(false); }
  };

  return (
    <div style={{ position:"fixed", inset:0, background:"rgba(0,0,0,0.5)", display:"flex", alignItems:"flex-end", justifyContent:"center", zIndex:1000 }}>
      <div style={{ background:"white", borderRadius:"22px 22px 0 0", padding:"8px 22px calc(20px + env(safe-area-inset-bottom))", width:"100%", maxWidth:560, maxHeight:"92vh", overflowY:"auto", animation:"sheetUp .32s cubic-bezier(.16,1,.3,1)" }}>
        <div style={{ width:40, height:5, background:"var(--line)", borderRadius:3, margin:"6px auto 16px" }} />
        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:14 }}>
          <div style={{ fontSize:21, fontWeight:900 }}>ポップをアップロード</div>
          <button onClick={onClose} style={{ background:"none", border:"none", fontSize:22, cursor:"pointer", color:"var(--sub)" }}>✕</button>
        </div>
        <div style={{ display:"flex", flexDirection:"column", gap:14 }}>
          <div>
            <div style={{ fontSize:12, fontWeight:700, color:"var(--text)", marginBottom:6 }}>店舗</div>
            <select value={store} onChange={e=>setStore(e.target.value)} style={{ width:"100%", padding:"10px 12px", border:"2px solid var(--line)", borderRadius:10, fontSize:14 }}>
              {STORES.map(s=><option key={s}>{s}</option>)}
            </select>
          </div>
          <div>
            <div style={{ fontSize:12, fontWeight:700, color:"var(--text)", marginBottom:6 }}>お名前 <span style={{ color:"var(--primary)" }}>*</span></div>
            <div style={{ display:"flex", gap:8, alignItems:"stretch" }}>
              <input value={author} onChange={e=>setAuthor(e.target.value)} placeholder="例：山田 太郎" style={{ flex:1, minWidth:0, padding:"10px 12px", border:"2px solid var(--line)", borderRadius:10, fontSize:14, outline:"none" }} />
              <button type="button" onClick={()=>setAuthor("勝部")} title="勝部を入力" style={{ flexShrink:0, width:46, border:"2px solid #ffd9bd", background:"#fff3ea", color:"var(--primary)", fontWeight:900, fontSize:18, borderRadius:10, cursor:"pointer", lineHeight:1 }}>※</button>
            </div>
          </div>
          <div>
            <div style={{ fontSize:12, fontWeight:700, color:"var(--text)", marginBottom:6 }}>商品名</div>
            <input value={product} onChange={e=>setProduct(e.target.value)} placeholder="例：本マグロ大トロ" style={{ width:"100%", padding:"10px 12px", border:"2px solid var(--line)", borderRadius:10, fontSize:14, outline:"none" }} />
          </div>
          <div>
            <div style={{ fontSize:12, fontWeight:700, color:"var(--text)", marginBottom:6 }}>カテゴリ</div>
            <select value={category} onChange={e=>setCategory(e.target.value)} style={{ width:"100%", padding:"10px 12px", border:"2px solid var(--line)", borderRadius:10, fontSize:14 }}>
              {CATEGORIES.map(c=><option key={c}>{c}</option>)}
            </select>
          </div>
          <div>
            <div style={{ fontSize:12, fontWeight:700, color:"var(--text)", marginBottom:6 }}>コメント <span style={{ fontWeight:400, color:"var(--faint)" }}>（任意）</span></div>
            <textarea value={comment} onChange={e=>setComment(e.target.value)} placeholder="例：脂がのっていておすすめ！刺身・塩焼きに。" rows={3} style={{ width:"100%", padding:"10px 12px", border:"2px solid var(--line)", borderRadius:10, fontSize:14, resize:"vertical", fontFamily:"inherit", outline:"none" }} />
          </div>
          <div>
            <div style={{ fontSize:12, fontWeight:700, color:"var(--text)", marginBottom:6 }}>画像</div>
            <label style={{ display:"block", border:"2px dashed #e0e0e0", borderRadius:12, padding:"14px", textAlign:"center", cursor:"pointer", background: preview?"transparent":"#fafafa" }}>
              {preview ? <img src={preview} style={{ maxWidth:"100%", maxHeight:200, borderRadius:8 }} /> : <div style={{ color:"var(--sub)", fontSize:14 }}>タップして選択</div>}
              <input type="file" accept="image/*" onChange={onFile} style={{ display:"none" }} />
            </label>
            {ratioWarn && (
              <div style={{ marginTop:8, background:"#fff6de", border:"1px solid #eeddad", color:"#8a6d00", borderRadius:10, padding:"10px 12px", fontSize:12, fontWeight:700, lineHeight:1.6, display:"flex", gap:8, alignItems:"flex-start" }}>
                <span style={{ fontSize:15, lineHeight:1.3 }}>📐</span>
                <span>{ratioWarn}</span>
              </div>
            )}
          </div>
          {error && <div style={{ color:"var(--primary)", fontSize:13, fontWeight:600 }}>{error}</div>}
          <button onClick={submit} disabled={loading} style={{ background:"var(--primary)", color:"white", border:"none", borderRadius:12, padding:"13px", fontSize:15, fontWeight:900, cursor:"pointer", opacity:loading?0.6:1 }}>
            {loading ? "アップロード中..." : "アップロード"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Pop Detail Modal ──
function PopDetail({ pop, onClose, onDelete, onLiked, onCommented, onCreateFromPop, navList, onNav }) {
  const navIdx = navList ? navList.findIndex(x => x.id === pop.id) : -1;
  const hasPrev = navList && navIdx > 0;
  const hasNext = navList && navIdx >= 0 && navIdx < navList.length - 1;
  const goPrev = () => { if (hasPrev && onNav) onNav(navList[navIdx - 1]); };
  const goNext = () => { if (hasNext && onNav) onNav(navList[navIdx + 1]); };
  const touchY = useRef(null);
  const onImgTouchStart = (e) => { touchY.current = e.touches[0].clientY; };
  const onImgTouchEnd = (e) => {
    if (touchY.current == null) return;
    const dy = e.changedTouches[0].clientY - touchY.current;
    touchY.current = null;
    if (Math.abs(dy) < 55) return;
    if (dy < 0) goNext(); else goPrev();
  };
  const [liked, setLiked] = useState(false);
  const [likes, setLikes] = useState(pop.likes||0);
  const [used, setUsed] = useState(false);
  const [usedCount, setUsedCount] = useState(pop.used_count||0);
  const [views, setViews] = useState(pop.view_count||0);
  const [deleting, setDeleting] = useState(false);
  const [showDelConfirm, setShowDelConfirm] = useState(false);
  const [pwInput, setPwInput] = useState("");
  const [pwError, setPwError] = useState("");
  const [comments, setComments] = useState([]);
  const [cStore, setCStore] = useState("バイヤー");
  const [cText, setCText] = useState("");
  const [cSubmitting, setCSubmitting] = useState(false);
  const [cError, setCError] = useState("");

  useEffect(() => {
    api.listComments(pop.id).then(setComments).catch(()=>{});
    setLiked(false); setLikes(pop.likes||0);
    setUsed(false); setUsedCount(pop.used_count||0);
    setViews(pop.view_count||0);
    api.addView(pop.id).then(counted => { if (counted) setViews(v => v + 1); });
    setShowDelConfirm(false); setPwInput(""); setPwError("");
    const sheet = document.getElementById("pd-sheet"); if (sheet) sheet.scrollTo({ top:0 });
  }, [pop.id]);

  const handleLike = async () => {
    if (liked) return;
    try {
      const updated = await api.like(pop.id, likes);
      setLikes(updated.likes);
      setLiked(true);
      onLiked && onLiked(pop.id, updated.likes);
    } catch(e) {}
  };

  const handleUsed = async () => {
    if (used) return;
    setUsed(true); setUsedCount(c => c + 1);
    try {
      const updated = await api.markUsed(pop.id, usedCount);
      if (updated && typeof updated.used_count === "number") setUsedCount(updated.used_count);
    } catch(e) { setUsed(false); setUsedCount(c => Math.max(0, c - 1)); }
  };

  const handleDownload = () => {
    const a = document.createElement("a");
    a.href = pop.image_url;
    a.download = `${pop.store_name}_${pop.product_name}.jpg`;
    a.target = "_blank";
    a.click();
  };

  const handleDeleteConfirm = async () => {
    if (deleting) return;
    setDeleting(true); setPwError("");
    try {
      const ok = await api.verifyPassword("delete", pwInput);
      if (!ok) {
        setPwError("パスワードが違います");
        setPwInput("");
        setDeleting(false);
        return;
      }
      await api.del(pop.id);
      onDelete(pop.id);
      onClose();
    } catch(e) {
      alert("削除に失敗しました");
      setDeleting(false);
    }
  };

  const handleAddComment = async () => {
    if (!cText.trim()) { setCError("コメントを入力してください"); return; }
    setCSubmitting(true); setCError("");
    try {
      const newC = await api.addComment(pop.id, cStore, cText.trim());
      setComments(c => [...c, newC]);
      setCText("");
      onCommented && onCommented(pop.id);
    } catch(e) { setCError("送信に失敗しました"); }
    finally { setCSubmitting(false); }
  };

  const handleQuickReply = async (text) => {
    if (cSubmitting) return;
    setCSubmitting(true); setCError("");
    try {
      const newC = await api.addComment(pop.id, "", text);
      setComments(c => [...c, newC]);
      onCommented && onCommented(pop.id);
    } catch(e) { setCError("送信に失敗しました"); }
    finally { setCSubmitting(false); }
  };

  useEffect(() => {
    window.dispatchEvent(new CustomEvent("popdetail", { detail: true }));
    return () => window.dispatchEvent(new CustomEvent("popdetail", { detail: false }));
  }, []);

  const ActionBtn = ({ onClick, disabled, active, emoji, label, activeColor }) => (
    <button onClick={onClick} disabled={disabled}
      style={{ border:"none", background:"transparent", cursor: disabled?"default":"pointer", display:"flex", flexDirection:"column", alignItems:"center", gap:2, padding:0 }}>
      <span style={{ width:44, height:44, borderRadius:"50%", background: active ? activeColor : "rgba(255,255,255,0.22)", backdropFilter:"blur(6px)", display:"flex", alignItems:"center", justifyContent:"center", fontSize:20 }}>{emoji}</span>
      <span style={{ fontSize:10, fontWeight:800, color:"#fff", textShadow:"0 1px 3px rgba(0,0,0,0.55)" }}>{label}</span>
    </button>
  );

  return (
    <div data-popdetail="1" style={{ position:"fixed", inset:0, background:"rgba(0,0,0,0.7)", display:"flex", alignItems:"flex-end", justifyContent:"center", zIndex:1000 }} onClick={onClose}>
      <div id="pd-sheet" style={{ background:"#fff", borderRadius:"22px 22px 0 0", width:"100%", maxWidth:560, maxHeight:"92vh", overflowY:"auto", animation:"sheetUp .32s cubic-bezier(.16,1,.3,1)", WebkitOverflowScrolling:"touch" }} onClick={e=>e.stopPropagation()}>

        {/* 画像エリア（ショート風・シート内で大きく） */}
        <div onTouchStart={onImgTouchStart} onTouchEnd={onImgTouchEnd} style={{ position:"relative", background:"var(--chip)", borderRadius:"22px 22px 0 0", overflow:"hidden", display:"flex", alignItems:"center", justifyContent:"center", minHeight:"52vh", maxHeight:"64vh" }}>
          <img src={pop.image_url} style={{ maxWidth:"100%", maxHeight:"64vh", objectFit:"contain", display:"block" }} />

          {hasPrev && (
            <button onClick={goPrev} aria-label="前のポップ" style={{ position:"absolute", top:12, left:"50%", transform:"translateX(-50%)", background:"rgba(0,0,0,0.4)", border:"none", color:"#fff", fontSize:16, width:38, height:30, borderRadius:15, cursor:"pointer", backdropFilter:"blur(4px)", zIndex:6, display:"flex", alignItems:"center", justifyContent:"center" }}>▲</button>
          )}
          {hasNext && (
            <button onClick={goNext} aria-label="次のポップ" style={{ position:"absolute", bottom:66, left:"50%", transform:"translateX(-50%)", background:"rgba(0,0,0,0.4)", border:"none", color:"#fff", fontSize:16, width:38, height:30, borderRadius:15, cursor:"pointer", backdropFilter:"blur(4px)", zIndex:6, display:"flex", alignItems:"center", justifyContent:"center" }}>▼</button>
          )}
          {navList && navIdx >= 0 && (
            <span style={{ position:"absolute", top:14, right:14, background:"rgba(0,0,0,0.4)", color:"#fff", fontSize:11, fontWeight:800, padding:"3px 9px", borderRadius:12, backdropFilter:"blur(4px)", zIndex:6 }}>{navIdx + 1} / {navList.length}</span>
          )}

          <button onClick={onClose} style={{ position:"absolute", bottom:14, left:14, background:"rgba(0,0,0,0.55)", border:"none", color:"#fff", fontSize:18, width:44, height:44, borderRadius:12, cursor:"pointer", backdropFilter:"blur(4px)", zIndex:6, display:"flex", alignItems:"center", justifyContent:"center" }}>✕</button>

          {/* 右側 縦積みアクション */}
          <div style={{ position:"absolute", right:11, bottom:16, display:"flex", flexDirection:"column", gap:13, zIndex:5 }}>
            <ActionBtn onClick={handleLike} active={liked} activeColor="#e0245e" emoji={liked ? "❤️" : "🤍"} label={String(likes)} />
            <ActionBtn onClick={handleUsed} active={used} activeColor="#2f6fb0" emoji={used ? "✅" : "🖐"} label={used ? `使った ${usedCount}` : "使った"} />
            <ActionBtn onClick={() => { const el = document.getElementById("pd-comments"); if (el) el.scrollIntoView({ behavior:"smooth" }); }} emoji="💬" label={String(comments.length)} />
            <ActionBtn onClick={handleDownload} emoji="⬇️" label="保存" />
            {onCreateFromPop && <ActionBtn onClick={() => { onCreateFromPop(pop); onClose(); }} emoji="✏️" label="作成" />}
            <ActionBtn onClick={() => { setShowDelConfirm(true); setPwInput(""); setPwError(""); }} emoji="🗑" label="削除" />
          </div>

          {/* 左下 情報オーバーレイ */}
          <div style={{ position:"absolute", left:0, right:64, bottom:0, padding:"36px 14px 14px 68px", background:"linear-gradient(to top, rgba(0,0,0,0.72), transparent)", zIndex:4 }}>
            <div style={{ fontSize:18, fontWeight:900, color:"#fff", textShadow:"0 1px 4px rgba(0,0,0,0.6)", lineHeight:1.3 }}>{pop.product_name}</div>
            <div style={{ fontSize:12, color:"rgba(255,255,255,0.9)", marginTop:3, textShadow:"0 1px 3px rgba(0,0,0,0.6)" }}>🏪 {pop.store_name}　·　{pop.category}{pop.author ? `　·　${pop.author}` : ""}{views > 0 ? `　·　閲覧${views}` : ""}</div>
            {pop.comment && <div style={{ fontSize:12, color:"rgba(255,255,255,0.92)", marginTop:6, lineHeight:1.6, textShadow:"0 1px 3px rgba(0,0,0,0.6)", display:"-webkit-box", WebkitLineClamp:2, WebkitBoxOrient:"vertical", overflow:"hidden" }}>{pop.comment}</div>}
          </div>

          {showDelConfirm && (
            <div style={{ position:"absolute", inset:0, background:"rgba(0,0,0,0.6)", display:"flex", alignItems:"center", justifyContent:"center", zIndex:10, padding:20 }} onClick={()=>{ setShowDelConfirm(false); setPwInput(""); setPwError(""); }}>
              <div onClick={e=>e.stopPropagation()} style={{ background:"#fff", borderRadius:16, padding:"18px", width:"100%", maxWidth:320 }}>
                <div style={{ fontSize:14, fontWeight:800, color:"#d05050", marginBottom:8 }}>本当に削除しますか？</div>
                <div style={{ fontSize:12, color:"var(--sub)", marginBottom:10 }}>ヒント：本社の郵便番号</div>
                <input type="password" value={pwInput} onChange={e=>{ setPwInput(e.target.value); setPwError(""); }}
                  onKeyDown={e=>e.key==="Enter" && handleDeleteConfirm()} placeholder="パスワードを入力" autoFocus
                  style={{ width:"100%", boxSizing:"border-box", padding:"11px 12px", border:`2px solid ${pwError?"var(--primary)":"#ffd0d0"}`, borderRadius:9, fontSize:14, outline:"none", marginBottom:10 }} />
                {pwError && <div style={{ fontSize:12, color:"var(--primary)", fontWeight:700, marginBottom:8 }}>{pwError}</div>}
                <div style={{ display:"flex", gap:8 }}>
                  <button onClick={()=>{ setShowDelConfirm(false); setPwInput(""); setPwError(""); }}
                    style={{ flex:1, padding:"10px", background:"var(--chip)", color:"var(--text)", border:"none", borderRadius:9, fontSize:13, fontWeight:800, cursor:"pointer" }}>戻る</button>
                  <button onClick={handleDeleteConfirm} disabled={deleting}
                    style={{ flex:1, padding:"10px", background:"#d05050", color:"#fff", border:"none", borderRadius:9, fontSize:13, fontWeight:800, cursor:"pointer", opacity:deleting?0.6:1 }}>{deleting ? "確認中…" : "削除する"}</button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* コメント欄（画像の下・シート内） */}
        <div id="pd-comments" style={{ padding:"14px 16px calc(18px + env(safe-area-inset-bottom))" }}>
          <div style={{ fontSize:13, fontWeight:900, color:"var(--ink)", marginBottom:12 }}>コメント {comments.length > 0 && <span style={{ color:"var(--faint)", fontWeight:600 }}>{comments.length}件</span>}</div>
          {comments.length > 0 && (
            <div style={{ display:"flex", flexDirection:"column", gap:15, marginBottom:16 }}>
              {comments.map(c => (
                <div key={c.id} style={{ display:"flex", gap:10, alignItems:"flex-start" }}>
                  <div style={{ width:30, height:30, borderRadius:"50%", background: c.store_name ? "var(--chip)" : "var(--bg)", color: c.store_name ? "var(--text)" : "var(--faint)", fontSize:12, fontWeight:800, display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0 }}>{c.store_name ? c.store_name.slice(0,1) : "·"}</div>
                  <div style={{ flex:1, minWidth:0 }}>
                    <div style={{ display:"flex", justifyContent:"space-between", alignItems:"baseline", marginBottom:2 }}>
                      <span style={{ fontSize:12.5, fontWeight:800, color: c.store_name ? "var(--ink)" : "var(--sub)" }}>{c.store_name || "ワンタップ返信"}</span>
                      <span style={{ fontSize:11, color:"var(--faint)" }}>{timeAgo(c.created_at)}</span>
                    </div>
                    <div style={{ fontSize:13.5, color:"var(--text)", lineHeight:1.65, whiteSpace:"pre-wrap" }}>{c.comment}</div>
                  </div>
                </div>
              ))}
            </div>
          )}
          <div style={{ display:"flex", gap:8, alignItems:"flex-end" }}>
            <select value={cStore} onChange={e=>setCStore(e.target.value)}
              style={{ padding:"10px 8px", border:"1.5px solid var(--line)", borderRadius:9, fontSize:12.5, outline:"none", background:"#fff", flexShrink:0, maxWidth:110 }}>
              {STORES.map(s=><option key={s}>{s}</option>)}
            </select>
            <textarea value={cText} onChange={e=>setCText(e.target.value)} placeholder="コメントを入力…" rows={1}
              style={{ flex:1, padding:"10px 11px", border:"1.5px solid var(--line)", borderRadius:9, fontSize:13.5, resize:"none", fontFamily:"inherit", outline:"none", lineHeight:1.5, maxHeight:90 }} />
            <button onClick={handleAddComment} disabled={cSubmitting}
              style={{ background:"var(--primary)", color:"#fff", border:"none", borderRadius:9, padding:"10px 15px", fontSize:13, fontWeight:900, cursor:"pointer", opacity:cSubmitting?0.6:1, flexShrink:0 }}>{cSubmitting ? "…" : "送信"}</button>
          </div>
          {cError && <div style={{ fontSize:11.5, color:"var(--primary)", marginTop:6 }}>{cError}</div>}
        </div>
      </div>
    </div>
  );
}

// ── Pop Card (shared) ──
function PopCard({ pop, index, onClick, hasComment }) {
  return (
    <div
      style={{ borderRadius:14, overflow:"hidden", background:"white", boxShadow:"0 2px 10px rgba(0,0,0,0.07)", cursor:"pointer", animation:`fadeUp 0.3s ease ${Math.min(index,10)*0.04}s both`, transition:"all 0.15s" }}
      onClick={()=>onClick(pop)}
      onMouseEnter={e=>{e.currentTarget.style.transform="translateY(-3px)";e.currentTarget.style.boxShadow="0 10px 28px rgba(0,0,0,0.14)"}}
      onMouseLeave={e=>{e.currentTarget.style.transform="none";e.currentTarget.style.boxShadow="0 2px 10px rgba(0,0,0,0.07)"}}>
      <div style={{ background:"#efefef", minHeight:120, position:"relative" }}>
        {pop.image_url
          ? <img src={pop.image_url} loading="lazy" decoding="async" className="fdin" onLoad={e => e.target.classList.add("ld")} style={{ width:"100%", display:"block" }} />
          : <div style={{ display:"flex", alignItems:"center", justifyContent:"center", height:120, color:"var(--faint)", fontSize:13 }}>読み込み中…</div>}
        <div style={{ position:"absolute", top:6, right:6, display:"flex", gap:4 }}>
          {hasComment && <div style={{ background:"rgba(194,78,0,0.9)", color:"white", fontSize:11, fontWeight:900, padding:"2px 7px", borderRadius:20 }}>コメント</div>}
          {pop.likes>0 && <div style={{ background:"rgba(255,107,107,0.9)", color:"white", fontSize:11, fontWeight:900, padding:"2px 7px", borderRadius:20 }}>{pop.likes}</div>}
          {(pop.view_count||0) >= 10 && <div style={{ background:"rgba(0,0,0,0.55)", color:"#ffd76a", fontSize:10.5, fontWeight:900, padding:"2px 7px", borderRadius:20, backdropFilter:"blur(3px)" }}>🔥 注目</div>}
        </div>
      </div>
      <div style={{ padding:"9px 12px", display:"flex", alignItems:"center", gap:6 }}>
        <div style={{ fontWeight:800, fontSize:13, whiteSpace:"nowrap", overflow:"hidden", textOverflow:"ellipsis", flex:1, minWidth:0 }}>{pop.product_name}</div>
        <div style={{ fontSize:11, color:"var(--sub)", whiteSpace:"nowrap", flexShrink:0 }}>{pop.store_name}</div>
        <div style={{ fontSize:11, background:"var(--chip)", padding:"2px 8px", borderRadius:20, fontWeight:700, color:"var(--text)", whiteSpace:"nowrap", flexShrink:0 }}>{pop.category}</div>
      </div>
    </div>
  );
}

// ── Board Tab ──


;Object.assign(window, { PopCard, PopDetail, UploadModal });
