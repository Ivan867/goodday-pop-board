/* GoodDay 鮮魚共有 — 06-tab-create （自動分割・window共有） */
var { useState, useEffect, useCallback, useRef } = React;

function NewPostForm({ onPost, onCancel }) {
  const [text, setText] = useState("");
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const onFile = e => {
    const f = e.target.files[0];
    if (!f) return;
    setFile(f);
    setPreview(URL.createObjectURL(f));
  };

  const submit = async () => {
    if (!text.trim() && !file) { setError("テキストまたは画像を入力してください"); return; }
    setLoading(true); setError("");
    try {
      let image_url = null;
      if (file) image_url = await api.upload(file);
      const post = await api.insertPost({ text: text.trim(), image_url });
      onPost(post);
    } catch(e) { setError("エラー: "+e.message); }
    finally { setLoading(false); }
  };

  return (
    <div style={{ background:"white", borderRadius:16, padding:20, marginBottom:20, boxShadow:"0 2px 12px rgba(0,0,0,0.08)" }}>
      <div style={{ fontWeight:900, fontSize:15, marginBottom:14, color:"#2d6a4f" }}>新しい投稿</div>
      <textarea value={text} onChange={e=>setText(e.target.value)} placeholder="売り場の様子、発見、コツなど..." rows={4} style={{ width:"100%", padding:"10px 12px", border:"2px solid var(--line)", borderRadius:10, fontSize:14, resize:"vertical", fontFamily:"inherit", outline:"none", marginBottom:10 }} />
      <label style={{ display:"block", border:"2px dashed #e0e0e0", borderRadius:10, padding:12, textAlign:"center", cursor:"pointer", marginBottom:10, background:preview?"transparent":"#fafafa" }}>
        {preview ? <img src={preview} style={{ maxWidth:"100%", maxHeight:160, borderRadius:6 }} /> : <div style={{ color:"var(--faint)", fontSize:13 }}>写真を追加（任意）</div>}
        <input type="file" accept="image/*" onChange={onFile} style={{ display:"none" }} />
      </label>
      {error && <div style={{ color:"var(--primary)", fontSize:13, marginBottom:8 }}>{error}</div>}
      <div style={{ display:"flex", gap:10 }}>
        <button onClick={onCancel} style={{ flex:1, background:"#f5f5f5", color:"var(--text)", border:"none", borderRadius:10, padding:"11px", fontSize:14, fontWeight:700, cursor:"pointer" }}>キャンセル</button>
        <button onClick={submit} disabled={loading} style={{ flex:2, background:"#2d6a4f", color:"white", border:"none", borderRadius:10, padding:"11px", fontSize:14, fontWeight:900, cursor:"pointer", opacity:loading?0.6:1 }}>
          {loading ? "投稿中..." : "投稿する"}
        </button>
      </div>
    </div>
  );
}

function PostCard({ post, onOpen }) {
  return (
    <div onClick={()=>onOpen(post)} style={{ background:"white", borderRadius:14, overflow:"hidden", cursor:"pointer", boxShadow:"0 2px 10px rgba(0,0,0,0.07)", transition:"all 0.15s" }}
      onMouseEnter={e=>{e.currentTarget.style.transform="translateY(-2px)";e.currentTarget.style.boxShadow="0 8px 24px rgba(0,0,0,0.12)"}}
      onMouseLeave={e=>{e.currentTarget.style.transform="none";e.currentTarget.style.boxShadow="0 2px 10px rgba(0,0,0,0.07)"}}>
      {post.image_url && <img src={post.image_url} style={{ width:"100%", height:200, objectFit:"cover", display:"block" }} />}
      <div style={{ padding:"14px 16px" }}>
        {post.text && <div style={{ fontSize:14, color:"var(--ink)", lineHeight:1.6, marginBottom:8, display:"-webkit-box", WebkitLineClamp:3, WebkitBoxOrient:"vertical", overflow:"hidden" }}>{post.text}</div>}
        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center" }}>
          <div style={{ fontSize:11, color:"var(--faint)" }}>{timeAgo(post.created_at)}</div>
          {post.views>0 && <div style={{ fontSize:11, color:"var(--faint)" }}>{post.views}</div>}
        </div>
      </div>
    </div>
  );
}

function PostModal({ post, onClose, onViewed }) {
  useEffect(() => { onViewed && onViewed(post.id, post.views); }, []);
  return (
    <div style={{ position:"fixed", inset:0, background:"rgba(0,0,0,0.7)", display:"flex", alignItems:"flex-end", justifyContent:"center", zIndex:1000 }} onClick={onClose}>
      <div style={{ background:"white", borderRadius:"22px 22px 0 0", width:"100%", maxWidth:560, maxHeight:"92vh", overflow:"auto", animation:"sheetUp .32s cubic-bezier(.16,1,.3,1)" }} onClick={e=>e.stopPropagation()}>
        <div style={{ position:"relative" }}>
          <button onClick={onClose} style={{ position:"absolute", top:12, right:12, background:"rgba(0,0,0,0.5)", border:"none", color:"white", fontSize:16, width:32, height:32, borderRadius:"50%", cursor:"pointer", zIndex:1 }}>✕</button>
          {post.image_url && <img src={post.image_url} style={{ width:"100%", display:"block", borderRadius:"22px 22px 0 0" }} />}
        </div>
        <div style={{ padding:20 }}>
          <div style={{ fontSize:15, color:"var(--ink)", lineHeight:1.8, marginBottom:14, whiteSpace:"pre-wrap" }}>{post.text}</div>
          <div style={{ display:"flex", justifyContent:"space-between", fontSize:12, color:"var(--faint)" }}>
            <span>{formatDate(post.created_at)}</span>
            <span>{(post.views||0)+1} 閲覧</span>
          </div>
        </div>
      </div>
    </div>
  );
}

function BlogTab() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [openPost, setOpenPost] = useState(null);

  const load = async () => {
    setLoading(true);
    try { const data = await api.listPosts(); setPosts(data); }
    catch(e) {} finally { setLoading(false); }
  };
  useEffect(() => { load(); }, []);

  const handlePost = post => { setPosts(p=>[post,...p]); setShowForm(false); };
  const handleView = async (id, currentViews) => {
    try { const updated = await api.incrementViews(id, currentViews); setPosts(p=>p.map(x=>x.id===id?updated:x)); } catch(e) {}
  };

  return (
    <div>
      <div style={{ background:"linear-gradient(135deg,#2d6a4f 0%,#40916c 100%)", padding:"16px 20px", display:"flex", justifyContent:"space-between", alignItems:"center" }}>
        <div style={{ color:"rgba(255,255,255,0.8)", fontSize:13 }}>鮮魚部の情報共有スペース</div>
        <button onClick={()=>setShowForm(f=>!f)} style={{ background:showForm?"#2d5a3d":"#52b788", color:"white", border:"none", borderRadius:10, padding:"9px 16px", fontSize:13, fontWeight:700, cursor:"pointer" }}>
          {showForm?"✕ 閉じる":"＋ 投稿"}
        </button>
      </div>
      <div style={{ maxWidth:560, margin:"0 auto", padding:"20px 16px" }}>
        {showForm && <NewPostForm onPost={handlePost} onCancel={()=>setShowForm(false)} />}
        {loading ? (
          <div style={{ textAlign:"center", padding:60, color:"var(--faint)" }}>
            
            <div style={{ marginTop:8, animation:"pulse 1.5s infinite" }}>読み込み中...</div>
          </div>
        ) : posts.length===0 ? (
          <div style={{ textAlign:"center", padding:80 }}>
            
            <div style={{ fontSize:15, color:"var(--sub)" }}>まだ投稿がありません</div>
          </div>
        ) : (
          <div style={{ display:"grid", gap:14 }}>
            {posts.map(post=><PostCard key={post.id} post={post} onOpen={p=>setOpenPost(p)} />)}
          </div>
        )}
      </div>
      {openPost && <PostModal post={openPost} onClose={()=>setOpenPost(null)} onViewed={handleView} />}
    </div>
  );
}

// ── POP作成ツール Tab（統合版）──
function PopToolTab({ seed, onSeedConsumed }) {
  const [toolSub, setToolSub] = useState("create");
  return (
    <div>
      <div style={{ maxWidth:680, margin:"0 auto", padding:"14px 16px 0", display:"flex", gap:8 }}>
        {[["create","✏️ 作成"],["prompts","💡 プロンプト集"]].map(([k,l]) => (
          <button key={k} onClick={()=>setToolSub(k)}
            style={{ flex:1, border:"1px solid var(--line)", borderRadius:11, padding:"10px 6px", fontSize:13.5, fontWeight:800, cursor:"pointer",
              background: toolSub===k ? "var(--primary)" : "#fff", color: toolSub===k ? "#fff" : "var(--text)" }}>{l}</button>
        ))}
      </div>
      {toolSub === "create" ? <PopCreateInner seed={seed} onSeedConsumed={onSeedConsumed} /> : <PromptTab embedded />}
    </div>
  );
}

function PopCreateInner({ seed, onSeedConsumed }) {
  const isRefSeed = !!(seed && seed.image_url);
  const [mode, setMode] = useState(isRefSeed ? "ref" : "new");
  const [size, setSize] = useState("縦");
  const [fields, setFields] = useState(
    isRefSeed
      ? { product:"", usage:"", price:"", appeal:"", mood:"", refProduct:"", refNoShow: seed.product || "" }
      : seed
        ? { product: seed.product||"", usage: seed.usage||"", price: seed.price||"", appeal: seed.appeal||"", mood: seed.mood||"", refProduct:"", refNoShow:"" }
        : { product:"", usage:"", price:"", appeal:"", mood:"", refProduct:"", refNoShow:"" });
  const [refImage] = useState(isRefSeed ? seed.image_url : null);
  const [prompt, setPrompt] = useState("");
  const [copied, setCopied] = useState(false);
  const [scanning, setScanning] = useState(false);
  const [scanError, setScanError] = useState("");
  const [showTips, setShowTips] = useState(false);
  const scanInputRef = React.useRef(null);

  const setF = (k, v) => setFields(f => ({...f, [k]: v}));

  useEffect(() => { if (seed && onSeedConsumed) onSeedConsumed(); }, []);

  const SIZES = [
    { key:"縦", label:"縦A4（210×297mm）" },
    { key:"横", label:"横A4（297×210mm）" },
  ];
  const sizeLabel = SIZES.find(s=>s.key===size).label;

  const toBase64 = (file) => new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result.split(",")[1]);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });

  const handleScan = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setScanning(true); setScanError("");
    try {
      const imageBase64 = await toBase64(file);
      const res = await fetch(`${SB_URL}/functions/v1/extract-pop`, {
        method: "POST",
        headers: { "Content-Type": "application/json", "apikey": SB_KEY, "Authorization": `Bearer ${SB_KEY}` },
        body: JSON.stringify({ imageBase64, mimeType: file.type }),
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      setFields(f => ({
        ...f,
        product: data.product || f.product,
        usage:   data.usage   || f.usage,
        price:   data.price   || f.price,
        appeal:  data.appeal  || f.appeal,
        mood:    data.mood    || f.mood,
      }));
    } catch(err) { setScanError("読み取りに失敗しました：" + err.message); }
    finally { setScanning(false); e.target.value = ""; }
  };

  const generate = () => {
    if (mode === "new") {
      setPrompt(
        `あなたはスーパーの鮮魚売り場専門のデザイナーです。\n` +
        `【商品】${fields.product}\n` +
        `【用途】${fields.usage}\n` +
        `【価格】${fields.price || "表記なし"}\n` +
        `【一言アピール】${fields.appeal}\n` +
        `【サイズ】${sizeLabel}\n` +
        `【雰囲気】${fields.mood}\n` +
        `このPOPの画像を作ってください。`
      );
    } else if (mode === "bg") {
      setPrompt(size === "縦"
        ? `背景の売り場は必要ないんだ。サイズ縦A4（210×297mm）でポップ部分のみで作成して`
        : `背景の売り場は必要なし、サイズは横A4（297×210mm）でポップ部分のみで作成して`
      );
    } else {
      const p = fields.refProduct || "　";
      const n = fields.refNoShow || p;
      setPrompt(`この画像をレイアウト、配色のみを参考に、「${p}」のポップをサイズ${sizeLabel}で作成してください\n※「${n}」の表記はしないでください`);
    }
  };

  const copy = () => {
    if (!prompt) return;
    navigator.clipboard.writeText(prompt).catch(() => {
      const ta = document.createElement("textarea");
      ta.value = prompt;
      document.body.appendChild(ta); ta.select();
      document.execCommand("copy"); document.body.removeChild(ta);
    });
    setCopied(true);
    setTimeout(() => { setCopied(false); setPrompt(""); }, 2000);
  };

  const inp = { width:"100%", padding:"11px 13px", borderRadius:8, border:"1px solid #3a3a3a", background:"#2a2a2a", color:"white", fontSize:14, outline:"none", fontFamily:"inherit" };
  const lbl = { fontSize:12, color:"var(--sub)", marginBottom:5 };
  const MODES = [
    { key:"new", label:"① 新規POP作成" },
    { key:"bg",  label:"② 背景修正" },
    { key:"ref", label:"③ 参考画像あり" },
  ];

  return (
    <div style={{ maxWidth:680, margin:"0 auto", padding:"20px 16px 60px" }}>
      <div style={{ background:"#111", borderRadius:16, padding:"24px 22px", color:"white" }}>

        <div style={{ fontSize:16, fontWeight:900, marginBottom:20, color:"#eee" }}>鮮魚売り場 POP作成ツール</div>

        {/* モード */}
        <div style={{ fontSize:12, color:"var(--sub)", marginBottom:8 }}>モード選択</div>
        <div style={{ display:"flex", gap:8, marginBottom:20 }}>
          {MODES.map(m=>(
            <button key={m.key} onClick={()=>{ setMode(m.key); setPrompt(""); }}
              style={{ flex:1, padding:"11px 6px", borderRadius:8, border:"none", cursor:"pointer", fontSize:13, fontWeight:700,
                background: mode===m.key ? "#8B6914" : "#2a2a2a", color: mode===m.key ? "white" : "#aaa", transition:"all 0.15s" }}>
              {m.label}
            </button>
          ))}
        </div>

        {/* サイズ */}
        <div style={{ fontSize:12, color:"var(--sub)", marginBottom:8 }}>サイズ</div>
        <div style={{ display:"flex", gap:8, marginBottom:20 }}>
          {SIZES.map(s=>(
            <button key={s.key} onClick={()=>setSize(s.key)}
              style={{ flex:1, padding:"11px", borderRadius:8, cursor:"pointer", fontSize:13, fontWeight:700,
                border:`2px solid ${size===s.key ? "#8B6914" : "#3a3a3a"}`,
                background:"#1e1e1e", color: size===s.key ? "white" : "#777", transition:"all 0.15s" }}>
              {s.label}
            </button>
          ))}
        </div>

        {/* モード① */}
        {mode === "new" && (
          <>
            <input ref={scanInputRef} type="file" accept="image/*" onChange={handleScan} style={{ display:"none" }} />
            <button onClick={()=>scanInputRef.current.click()} disabled={scanning}
              style={{ width:"100%", padding:"11px", borderRadius:8, border:"1px dashed #8B6914", marginBottom:16,
                background: scanning ? "#1a1a0a" : "#1e1800", color: scanning ? "#888" : "#c8a840",
                fontSize:13, fontWeight:700, cursor: scanning ? "default" : "pointer" }}>
              {scanning ? "AI読み取り中..." : "既存POPから自動入力（AI読み取り）"}
            </button>
            {scanError && <div style={{ fontSize:12, color:"var(--primary)", marginBottom:10 }}>{scanError}</div>}
            <div style={{ fontSize:12, color:"var(--sub)", marginBottom:10 }}>入力</div>
            <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:10, marginBottom:10 }}>
              <div><div style={lbl}>商品</div><input value={fields.product} onChange={e=>setF("product",e.target.value)} placeholder="例：天然マダイ（1尾）" style={inp} /></div>
              <div><div style={lbl}>用途</div><input value={fields.usage} onChange={e=>setF("usage",e.target.value)} placeholder="例：お刺身・塩焼き" style={inp} /></div>
              <div><div style={lbl}>価格</div><input value={fields.price} onChange={e=>setF("price",e.target.value)} placeholder="例：980円（税込）" style={inp} /></div>
              <div><div style={lbl}>一言アピール</div><input value={fields.appeal} onChange={e=>setF("appeal",e.target.value)} placeholder="例：産地直送！鮮度抜群" style={inp} /></div>
            </div>
            <div><div style={lbl}>雰囲気</div><input value={fields.mood} onChange={e=>setF("mood",e.target.value)} placeholder="例：夏らしい涼しげなデザイン、和風テイスト" style={inp} /></div>
          </>
        )}

        {/* モード② */}
        {mode === "bg" && (
          <div style={{ background:"#1e1e1e", border:"1px solid #3a3a3a", borderRadius:8, padding:"13px 15px", fontSize:13, color:"var(--sub)", lineHeight:1.8 }}>
            Geminiで修正したいPOP画像を貼り付けてから、下のプロンプトをコピーして送信してください。
          </div>
        )}

        {/* モード③ */}
        {mode === "ref" && (
          <>
            <div style={{ background:"#1a2a1a", border:"1px solid #2d4a2d", borderRadius:8, padding:"11px 13px", fontSize:12, color:"#7ec87e", lineHeight:1.75, marginBottom:14 }}>
              Geminiに参考にしたいPOP画像を先にアップロードしてから、生成したプロンプトを貼り付けてください。
            </div>
            {refImage && (
              <div style={{ background:"#1e1e1e", border:"1px solid #3a3a3a", borderRadius:8, padding:"11px 13px", marginBottom:14, display:"flex", gap:12, alignItems:"center" }}>
                <img src={refImage} style={{ width:64, height:64, objectFit:"cover", borderRadius:6, flexShrink:0, background:"#111" }} />
                <div style={{ fontSize:12, color:"#c8a840", lineHeight:1.7 }}>
                  <div style={{ fontWeight:800, marginBottom:2 }}>このPOPを参照元にします</div>
                  <div style={{ color:"var(--sub)" }}>この画像を長押しで保存し、AIにアップロードしてから下のプロンプトを貼り付けてください。</div>
                </div>
              </div>
            )}
            <div style={{ display:"flex", flexDirection:"column", gap:10 }}>
              <div><div style={lbl}>ポップの内容（商品名など）</div><input value={fields.refProduct} onChange={e=>setF("refProduct",e.target.value)} placeholder="例：天然マダイ お刺身用" style={inp} /></div>
              <div><div style={lbl}>表記しない内容 <span style={{ color:"var(--text)" }}>（空欄の場合は上と同じ）</span></div><input value={fields.refNoShow} onChange={e=>setF("refNoShow",e.target.value)} placeholder="例：天然マダイ" style={inp} /></div>
            </div>
          </>
        )}

        {/* 区切り */}
        <div style={{ borderTop:"1px solid #2a2a2a", margin:"18px 0 14px" }} />

        {/* 生成されたプロンプト */}
        <div style={{ fontSize:12, color:"var(--sub)", marginBottom:8 }}>生成されたプロンプト</div>
        <textarea value={prompt} readOnly placeholder="← 上の項目を入力して「プロンプト生成」を押してください" rows={5}
          style={{ width:"100%", padding:"12px 13px", borderRadius:8, border:"1px solid #2a2a2a", background:"#1a1a1a",
            color: prompt ? "#eee" : "#555", fontSize:13, resize:"vertical", fontFamily:"inherit", outline:"none", lineHeight:1.75, marginBottom:12 }} />

        {/* ボタン */}
        <div style={{ display:"flex", gap:8, marginBottom:16 }}>
          <button onClick={generate}
            style={{ flex:3, padding:"14px", borderRadius:8, border:"1px solid #3a3a3a", background:"#222", color:"#ddd", fontSize:14, fontWeight:700, cursor:"pointer" }}
            onMouseEnter={e=>e.currentTarget.style.background="#2e2e2e"}
            onMouseLeave={e=>e.currentTarget.style.background="#222"}>
            プロンプト生成
          </button>
          <button onClick={copy} disabled={!prompt}
            style={{ flex:1, padding:"14px", borderRadius:8, border:"none",
              background: copied ? "#16a34a" : (prompt ? "#8B6914" : "#333"),
              color:"white", fontSize:14, fontWeight:700, cursor: prompt ? "pointer" : "default",
              opacity: !prompt ? 0.4 : 1, transition:"all 0.2s" }}>
            {copied ? "コピー済" : "コピー"}
          </button>
        </div>

        {/* 使い方ヒント（折りたたみ） */}
        <button onClick={()=>setShowTips(t=>!t)}
          style={{ width:"100%", background:"#1a1a1a", border:"1px solid #2a2a2a", borderRadius:8, padding:"10px 14px",
            color:"var(--text)", fontSize:12, fontWeight:700, cursor:"pointer", textAlign:"left", transition:"all 0.15s" }}>
          {showTips ? "▲ 使い方・ヒントを閉じる" : "▼ 使い方・ヒントを見る"}
        </button>
        {showTips && (
          <div style={{ marginTop:12, display:"flex", flexDirection:"column", gap:10 }}>
            <div style={{ background:"#1a1a0a", border:"1px solid #3a3a00", borderRadius:10, padding:"13px 15px" }}>
              <div style={{ fontSize:12, fontWeight:800, color:"#c8a840", marginBottom:8 }}>使い方（4ステップ）</div>
              <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:"6px 12px" }}>
                {[["①","モードとサイズを選ぶ"],["②","入力欄を埋める"],["③","「プロンプト生成」を押す"],["④","「コピー」→Geminiに貼り付け"]].map(([n,t])=>(
                  <div key={n} style={{ display:"flex", alignItems:"center", gap:6, fontSize:12, color:"var(--sub)" }}>
                    <div style={{ width:20, height:20, background:"#3a3a00", borderRadius:"50%", display:"flex", alignItems:"center", justifyContent:"center", fontSize:10, fontWeight:900, color:"#c8a840", flexShrink:0 }}>{n}</div>
                    <div>{t}</div>
                  </div>
                ))}
              </div>
            </div>
            <div style={{ background:"#0a1a0a", border:"1px solid #1a3a1a", borderRadius:10, padding:"13px 15px", fontSize:12, color:"#7ec87e", lineHeight:1.75 }}>
              <strong style={{ color:"#52c87e" }}>価格を入れたくない場合</strong>は価格欄を空欄にすると「表記なし」が自動で入ります。
            </div>
          </div>
        )}

      </div>
    </div>
  );
}

// ── Floor Photo Tab ──


;Object.assign(window, { BlogTab, NewPostForm, PopCreateInner, PopToolTab, PostCard, PostModal });
