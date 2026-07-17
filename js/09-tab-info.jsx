/* GoodDay 鮮魚共有 — 09-tab-info （自動分割・window共有） */
var { useState, useEffect, useCallback, useRef } = React;

function PromptCard({ it, accent, onDelete }) {
  const [copied, setCopied] = useState(false);
  const [open, setOpen] = useState(false);
  const longText = (it.prompt || "").length > 180;
  const copy = () => {
    const t = it.prompt || "";
    const done = () => { setCopied(true); setTimeout(()=>setCopied(false), 1500); };
    const fb = () => { const ta=document.createElement("textarea"); ta.value=t; document.body.appendChild(ta); ta.select(); try{document.execCommand("copy");}catch(e){} document.body.removeChild(ta); done(); };
    if (navigator.clipboard && navigator.clipboard.writeText) navigator.clipboard.writeText(t).then(done).catch(fb);
    else fb();
  };
  return (
    <div style={{ background:"white", borderRadius:16, boxShadow:"0 2px 12px rgba(0,0,0,0.07)", marginBottom:16, overflow:"hidden" }}>
      {it.image_url && <img src={it.image_url} alt="" onClick={()=>setOpen(o=>!o)} style={{ width:"100%", maxHeight: open?"none":340, objectFit:"cover", display:"block", cursor:"zoom-in" }} />}
      <div style={{ padding:"13px 15px 15px" }}>
        {it.title && <div style={{ fontSize:15, fontWeight:800, color:"var(--ink)", marginBottom:9 }}>{it.title}</div>}
        <div style={{ position:"relative", background:"var(--bg)", border:"1px solid var(--line)", borderRadius:10, padding:"11px 12px", fontSize:13, lineHeight:1.6, color:"var(--ink)", whiteSpace:"pre-wrap", wordBreak:"break-word", maxHeight: open?"none":150, overflow:"hidden" }}>
          {it.prompt}
          {!open && longText && <div style={{ position:"absolute", left:0, right:0, bottom:0, height:42, background:"linear-gradient(transparent,#f7f7fa)" }} />}
        </div>
        {longText && <button onClick={()=>setOpen(o=>!o)} style={{ border:"none", background:"none", color:"var(--sub)", fontSize:12, fontWeight:700, cursor:"pointer", marginTop:6, padding:0 }}>{open?"閉じる":"全文を見る"}</button>}
        <div style={{ display:"flex", alignItems:"center", gap:12, marginTop:11 }}>
          <button onClick={copy} style={{ flex:1, border:"none", background: copied?"#2f6fb0":accent, color:"#fff", borderRadius:10, padding:"10px", fontSize:14, fontWeight:800, cursor:"pointer" }}>{copied?"✓ コピーしました":"プロンプトをコピー"}</button>
          <button onClick={onDelete} style={{ border:"none", background:"none", color:"var(--faint)", fontSize:13, fontWeight:700, cursor:"pointer" }}>削除</button>
        </div>
        <div style={{ fontSize:11, color:"var(--sub)", marginTop:8 }}>{it.author || "匿名"}</div>
      </div>
    </div>
  );
}

function PromptAddModal({ accent, onClose, onPosted }) {
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [title, setTitle] = useState("");
  const [ptext, setPtext] = useState("");
  const [author, setAuthor] = useState("");
  const [busy, setBusy] = useState(false);
  const input = { width:"100%", boxSizing:"border-box", padding:"11px 13px", border:"1px solid #e2e2e6", borderRadius:10, fontSize:14, outline:"none", marginBottom:11 };
  const pick = (f) => { if(!f) return; setFile(f); setPreview(URL.createObjectURL(f)); };
  const submit = async () => {
    if (!ptext.trim()) { alert("プロンプトを入力してください"); return; }
    setBusy(true);
    try {
      let image_url = null;
      if (file) image_url = await api.upload(file);
      const row = await api.insertPrompt({ title:title.trim(), prompt:ptext.trim(), image_url, author:author.trim()||"匿名" });
      onPosted(row);
    } catch(e){ alert("保存に失敗しました"); setBusy(false); }
  };
  return (
    <div onClick={onClose} style={{ position:"fixed", inset:0, background:"rgba(0,0,0,0.45)", zIndex:1000, display:"flex", alignItems:"flex-end" }}>
      <div onClick={e=>e.stopPropagation()} style={{ background:"#fff", width:"100%", borderRadius:"20px 20px 0 0", padding:"10px 18px calc(20px + env(safe-area-inset-bottom))", maxHeight:"90vh", overflowY:"auto", animation:"sheetUp 0.28s ease" }}>
        <div style={{ width:40, height:4, background:"#ddd", borderRadius:2, margin:"6px auto 14px" }} />
        <div style={{ fontSize:16, fontWeight:900, color:"var(--ink)", marginBottom:14 }}>プロンプトを追加</div>
        <label style={{ display:"block", border:"2px dashed #d8d8e0", borderRadius:12, padding: preview?0:"22px", textAlign:"center", cursor:"pointer", overflow:"hidden", marginBottom:13 }}>
          {preview ? <img src={preview} alt="" style={{ width:"100%", display:"block" }} /> : <div style={{ color:"var(--sub)", fontWeight:700 }}>画像を選ぶ（任意）</div>}
          <input type="file" accept="image/*" onChange={e=>pick(e.target.files[0])} style={{ display:"none" }} />
        </label>
        <input value={title} onChange={e=>setTitle(e.target.value)} placeholder="タイトル（例：刺身盛り 縦POP）" style={input} />
        <textarea value={ptext} onChange={e=>setPtext(e.target.value)} placeholder="使ったプロンプトをここに貼り付け" rows={6} style={{ ...input, resize:"vertical", fontFamily:"inherit", lineHeight:1.6 }} />
        <input value={author} onChange={e=>setAuthor(e.target.value)} placeholder="お名前（任意）" style={input} />
        <button onClick={submit} disabled={busy} style={{ width:"100%", border:"none", background: busy?"#bbb":accent, color:"#fff", borderRadius:12, padding:"13px", fontSize:15, fontWeight:800, cursor: busy?"default":"pointer", marginTop:4 }}>{busy?"保存中…":"保存する"}</button>
      </div>
    </div>
  );
}

function PromptGuide({ accent }) {
  const sec = { background:"white", borderRadius:16, boxShadow:"0 2px 12px rgba(0,0,0,0.07)", padding:"16px 18px", marginBottom:14 };
  const hd  = { fontSize:15, fontWeight:900, color:"var(--ink)", marginBottom:10 };
  const p   = { fontSize:13.5, lineHeight:1.8, color:"var(--text)", margin:"0 0 10px" };
  const tag = { display:"inline-block", background:"#f1edff", color:accent, fontWeight:700, fontSize:12.5, borderRadius:7, padding:"3px 9px", margin:"0 6px 6px 0" };
  return (
    <div>
      <div style={sec}>
        <div style={hd}>プロンプトの読み解き方</div>
        <p style={p}>良いプロンプトを見つけたら、次の要素に分解すると「どこを変えれば自分用になるか」が見えます。コピーした文を、この単位で書き換えていくのがコツです。</p>
        <div>
          <span style={tag}>被写体（何を）</span><span style={tag}>構図・アングル</span><span style={tag}>ライティング（光）</span><span style={tag}>質感・素材</span>
          <span style={tag}>背景</span><span style={tag}>色味・雰囲気</span><span style={tag}>文字・レイアウト</span><span style={tag}>仕上げ（縦横比・解像度）</span>
        </div>
        <p style={{ ...p, margin:"10px 0 0" }}>例：「まぐろの刺身（被写体）を / 真上から（アングル）/ 柔らかい自然光で（光）/ 黒い石の皿に（背景）/ 高級感のある雰囲気で（色味）/ 縦A4（仕上げ）」のように、( )の部分だけ自分の商品に差し替えれば再利用できます。</p>
      </div>

      <div style={sec}>
        <div style={hd}>画像を再利用する手順</div>
        <p style={p}>1. 記録集から、近いイメージの画像と「プロンプトをコピー」。</p>
        <p style={p}>2. GeminiやChatGPTに、その画像を一緒に添付する（「この画像を参考に」と伝える）。</p>
        <p style={p}>3. コピーしたプロンプトを貼り、変えたい所だけ書き換える。よく使う指示：</p>
        <div>
          <span style={tag}>商品だけ差し替え</span><span style={tag}>背景だけ変更</span><span style={tag}>色味はそのまま</span>
          <span style={tag}>文字を入れる/消す</span><span style={tag}>縦→横にする</span><span style={tag}>同じ構図で</span>
        </div>
        <p style={{ ...p, margin:"10px 0 0" }}>「この画像の構図・雰囲気はそのままで、商品を〇〇に変えて」と伝えると、雰囲気を保ったまま中身だけ差し替えられます。</p>
      </div>

      <div style={sec}>
        <div style={hd}>うまくいくコツ</div>
        <p style={p}>・POPに文字を入れる時は、画像生成では文字が崩れやすいので、文字なしで作って後から差し込むのも手。</p>
        <p style={p}>・縦横比は最初に指定（縦A4／横A4）。後から変えると崩れやすい。</p>
        <p style={p}>・うまくいったプロンプトは必ずこの「記録集」に画像付きで残す。次から探す手間が消えます。</p>
      </div>
    </div>
  );
}

function PromptTab({ embedded }) {
  const ACCENT = "var(--primary)";
  const [seg, setSeg] = useState("list");
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(false);
  const load = () => { setLoading(true); api.listPrompts().then(d=>{ setItems(d); setLoading(false); }).catch(()=>setLoading(false)); };
  useEffect(() => { load(); }, []);

  const remove = async (it) => {
    const pw = prompt("削除パスワードを入力");
    if (pw === null) return;
    try {
      const ok = await api.verifyPassword("delete", pw);
      if (!ok) { alert("パスワードが違います"); return; }
      await api.delPrompt(it.id);
      setItems(s => s.filter(x => x.id !== it.id));
    } catch(e){ alert("削除に失敗しました"); }
  };

  const segBtn = (k,label) => (
    <button onClick={()=>setSeg(k)} style={{ flex:1, border:"none", background:"none", padding:"11px 0", fontSize:14, fontWeight: seg===k?800:600, color: seg===k?ACCENT:"#999", borderBottom: seg===k?`2.5px solid ${ACCENT}`:"2.5px solid transparent", cursor:"pointer" }}>{label}</button>
  );

  return (
    <div style={{ maxWidth:760, margin:"0 auto", padding: embedded ? "10px 16px 84px" : "16px 16px 84px" }}>
      <div style={{ display:"flex", marginBottom:16, borderBottom:"1px solid var(--line)" }}>
        {segBtn("list","プロンプト記録集")}
        {segBtn("guide","手引き")}
      </div>

      {seg==="list" ? (
        <>
          <button onClick={()=>setShowAdd(true)} style={{ width:"100%", border:"none", background:ACCENT, color:"#fff", borderRadius:12, padding:"13px", fontSize:15, fontWeight:800, cursor:"pointer", marginBottom:16 }}>＋ プロンプトを追加</button>
          {loading ? (
            <div style={{ textAlign:"center", color:"var(--faint)", padding:"40px 0" }}>読み込み中…</div>
          ) : items.length===0 ? (
            <div style={{ textAlign:"center", color:"var(--faint)", padding:"40px 16px", fontSize:13.5, lineHeight:1.8 }}>まだ登録がありません。<br/>うまくいった画像とプロンプトを「＋ プロンプトを追加」から残しておくと、次から再利用できます。</div>
          ) : (
            items.map(it => <PromptCard key={it.id} it={it} accent={ACCENT} onDelete={()=>remove(it)} />)
          )}
        </>
      ) : (
        <PromptGuide accent={ACCENT} />
      )}

      {showAdd && <PromptAddModal accent={ACCENT} onClose={()=>setShowAdd(false)} onPosted={(row)=>{ setItems(s=>[row, ...s]); setShowAdd(false); }} />}
    </div>
  );
}

function TodayInfoCard() {
  const [wx, setWx] = useState(null);
  const [warns, setWarns] = useState([]);

  // 気象庁 警報・注意報（島根県→出雲市）
  useEffect(() => {
    const WMAP = {
      "33":{n:"大雨特別警報",lv:3},"32":{n:"暴風雪特別警報",lv:3},"35":{n:"暴風特別警報",lv:3},"36":{n:"大雪特別警報",lv:3},"37":{n:"波浪特別警報",lv:3},"38":{n:"高潮特別警報",lv:3},
      "03":{n:"大雨警報",lv:2},"02":{n:"暴風雪警報",lv:2},"04":{n:"洪水警報",lv:2},"05":{n:"暴風警報",lv:2},"06":{n:"大雪警報",lv:2},"07":{n:"波浪警報",lv:2},"08":{n:"高潮警報",lv:2},
      "10":{n:"大雨注意報",lv:1},"12":{n:"大雪注意報",lv:1},"13":{n:"風雪注意報",lv:1},"14":{n:"雷注意報",lv:1},"15":{n:"強風注意報",lv:1},"16":{n:"波浪注意報",lv:1},"17":{n:"融雪注意報",lv:1},"18":{n:"洪水注意報",lv:1},"19":{n:"高潮注意報",lv:1},"20":{n:"濃霧注意報",lv:1},"21":{n:"乾燥注意報",lv:1},"22":{n:"なだれ注意報",lv:1},"23":{n:"低温注意報",lv:1},"24":{n:"霜注意報",lv:1},"25":{n:"着氷注意報",lv:1},"26":{n:"着雪注意報",lv:1}
    };
    const KEY = "jmaWarnV1";
    const parse = (j) => {
      const out = [];
      try {
        (j.areaTypes || []).forEach(t => (t.areas || []).forEach(a => {
          if (!String(a.code).startsWith("32203")) return; // 出雲市
          (a.warnings || []).forEach(w => {
            if (w.status === "解除") return;
            const m = WMAP[w.code];
            if (m && !out.some(x => x.n === m.n)) out.push(m);
          });
        }));
      } catch(e) {}
      out.sort((a,b) => b.lv - a.lv);
      return out;
    };
    const go = (retry) => fetch("https://www.jma.go.jp/bosai/warning/data/warning/320000.json")
      .then(r => r.ok ? r.json() : null)
      .then(j => {
        if (!j) throw 0;
        const w = parse(j);
        setWarns(w);
        try { localStorage.setItem(KEY, JSON.stringify({ t: Date.now(), w })); } catch(e) {}
      })
      .catch(() => {
        try { const c = JSON.parse(localStorage.getItem(KEY) || "null"); if (c && Date.now() - c.t < 3600000) setWarns(c.w || []); } catch(e) {}
        if (retry > 0) setTimeout(() => go(retry - 1), 6000);
      });
    go(1);
  }, []);
  const [hol, setHol] = useState(null);
  useEffect(() => {
    // 気温：過去7日＋今日を取得して前日差・前週差を計算
    const WURL = "https://api.open-meteo.com/v1/forecast?latitude=35.367&longitude=132.755&daily=weather_code,temperature_2m_max&timezone=Asia%2FTokyo&past_days=7&forecast_days=2";
    const WKEY = "wxCardV1";
    const applyWx = (d) => {
      if (!d || !d.daily || !d.daily.temperature_2m_max) return false;
      const t = d.daily.temperature_2m_max, i = t.length - 2;   // i=今日, i+1=明日
      if (t[i] == null || t[i-1] == null || t[i-7] == null) return false;
      setWx({
        today: Math.round(t[i]), yest: Math.round(t[i-1]), dy: Math.round(t[i] - t[i-1]), dw: Math.round(t[i] - t[i-7]), code: d.daily.weather_code[i],
        tmMax: t[i+1] == null ? null : Math.round(t[i+1]), tmCode: d.daily.weather_code[i+1], tmDiff: t[i+1] == null ? null : Math.round(t[i+1] - t[i])
      });
      return true;
    };
    const goWx = (retry) => fetch(WURL).then(r => r.ok ? r.json() : null).then(d => {
      if (applyWx(d)) { try { localStorage.setItem(WKEY, JSON.stringify({ t: Date.now(), d })); } catch(e) {} }
      else throw 0;
    }).catch(() => {
      try { const c = JSON.parse(localStorage.getItem(WKEY) || "null"); if (c && Date.now() - c.t < 86400000) applyWx(c.d); } catch(e) {}
      if (retry > 0) setTimeout(() => goWx(retry - 1), 5000);
    });
    goWx(2);
    // 祝日：holidays-jp（前年・今年・翌年分）
    fetch("https://holidays-jp.github.io/api/v1/date.json")
      .then(r => r.ok ? r.json() : null)
      .then(hs => {
        if (!hs) return;
        const hset = new Set(Object.keys(hs));
        const now = new Date(); now.setHours(0,0,0,0);
        const pad = n => String(n).padStart(2, "0");
        const fmt = d => `${d.getFullYear()}-${pad(d.getMonth()+1)}-${pad(d.getDate())}`;
        const todayName = hs[fmt(now)] || null;
        const dates = Object.keys(hs).filter(k => k > fmt(now)).sort();
        if (!dates.length) { setHol({ todayName }); return; }
        const next = dates[0];
        const nd = new Date(next + "T00:00:00");
        const isOff = d => { const w = d.getDay(); return w === 0 || w === 6 || hset.has(fmt(d)); };
        let bs = new Date(nd), be = new Date(nd);
        for (;;) { const q = new Date(bs); q.setDate(q.getDate()-1); if (isOff(q)) bs = q; else break; }
        for (;;) { const q = new Date(be); q.setDate(q.getDate()+1); if (isOff(q)) be = q; else break; }
        const len = Math.round((be - bs) / 86400000) + 1;
        const days = Math.round((nd - now) / 86400000);
        setHol({ todayName, date: nd, name: hs[next], blockStart: bs, blockEnd: be, len, days });
      }).catch(() => {});
  }, []);
  // ハレの日（行事）：共通データ seasonalEventsFor から算出
  const events = (() => {
    const now = new Date(); now.setHours(0,0,0,0);
    const list = [...seasonalEventsFor(now.getFullYear()), ...seasonalEventsFor(now.getFullYear()+1)];
    const todayEv = list.find(e => e.date.getTime() === now.getTime()) || null;
    const up = list.filter(e => e.date > now && (e.date - now)/86400000 <= 60).sort((a,b)=>a.date-b.date);
    return { todayEv, next: up[0] || null, next2: up[1] || null };
  })();
  const jd = d => `${d.getMonth()+1}/${d.getDate()}`;
  const wd = d => ["日","月","火","水","木","金","土"][d.getDay()];
  const wmoIcon = (c) => {
    if (c === 0) return { e:"☀️", t:"快晴" };
    if (c === 1) return { e:"🌤", t:"晴れ" };
    if (c === 2) return { e:"⛅", t:"時々曇り" };
    if (c === 3) return { e:"☁️", t:"曇り" };
    if (c === 45 || c === 48) return { e:"🌫", t:"霧" };
    if (c >= 51 && c <= 57) return { e:"🌦", t:"霧雨" };
    if (c >= 61 && c <= 67) return { e:"🌧", t:"雨" };
    if (c >= 71 && c <= 77) return { e:"❄️", t:"雪" };
    if (c >= 80 && c <= 82) return { e:"🌦", t:"にわか雨" };
    if (c === 85 || c === 86) return { e:"🌨", t:"にわか雪" };
    if (c >= 95) return { e:"⛈", t:"雷雨" };
    return { e:"☁️", t:"曇り" };
  };
  const sign = v => v > 0 ? `+${v}°` : v < 0 ? `${v}°` : "±0°";
  const dcol = v => v > 0 ? "var(--primary)" : v < 0 ? "#4a86c5" : "#888";
  const rainy = wx && ((wx.code >= 61 && wx.code <= 67) || (wx.code >= 80 && wx.code <= 82) || wx.code >= 95);
  let hint = null;
  if (wx) {
    if (wx.dy >= 3) hint = "昨日よりグッと暑い日。刺身・たたき・冷たい系が動きやすい。";
    else if (wx.dy <= -3) hint = "昨日より涼しい日。鍋・煮付け・フライなど温か系が動きやすい。";
    else if (rainy) hint = "雨予報。まとめ買い・簡便系の提案が効きやすい日。";
  }
  const now = new Date();
  return (
    <div className="wcard">
      <div style={{ display:"flex", alignItems:"baseline", gap:8, marginBottom:6, flexWrap:"wrap" }}>
        <span style={{ fontSize:12.5, fontWeight:900, color:"var(--ink)" }}>今日の情報</span>
        <span style={{ fontSize:11.5, color:"var(--ink)", fontWeight:800 }}>{jd(now)}（{wd(now)}）<span style={{ color:"var(--sub)", fontWeight:800 }}>　出雲市</span>{hol && hol.todayName ? `・今日は「${hol.todayName}」🎌` : ""}{events.todayEv ? `・今日は「${events.todayEv.name}」${events.todayEv.food ? "〈"+events.todayEv.food+"〉" : ""}` : ""}</span>
      </div>
      {(() => {
        const chips = [];
        warns.forEach(w => chips.push({ t:(w.lv >= 2 ? "⚠️ " : "") + w.n, lv:w.lv }));
        if (wx && wx.today >= 35) chips.push({ t:"🥵 猛暑日予想", lv:2 });
        else if (wx && wx.today >= 33) chips.push({ t:"☀️ 厳しい暑さ", lv:1 });
        if (!chips.length) return null;
        const shike = warns.some(w => ["波浪警報","波浪注意報","強風注意報","暴風警報","波浪特別警報","暴風特別警報"].includes(w.n));
        return (
          <div style={{ marginBottom:7 }}>
            <div style={{ display:"flex", flexWrap:"wrap", gap:5 }}>
              {chips.map((c,i) => (
                <span key={i} style={{ fontSize:11, fontWeight:800, borderRadius:8, padding:"3px 9px",
                  background: c.lv >= 3 ? "#3b0d3f" : c.lv === 2 ? "#fdeaea" : "#fff6de",
                  color: c.lv >= 3 ? "#fff" : c.lv === 2 ? "#b3261e" : "#8a6d00",
                  border: c.lv >= 3 ? "none" : c.lv === 2 ? "1px solid #f3c1bd" : "1px solid #eeddad" }}>{c.t}</span>
              ))}
            </div>
            {shike && <div style={{ fontSize:11.5, color:"#b3261e", fontWeight:800, marginTop:5 }}>🌊 時化のおそれ：入荷・地物に影響が出るかも</div>}
          </div>
        );
      })()}
      <div style={{ fontSize:12.5, fontWeight:700, color:"var(--text)", lineHeight:1.8, textAlign:"left" }}>
        {wx && (
          <>
            <div style={{ display:"flex", alignItems:"center", padding:"3px 0 2px" }}>
              <div style={{ textAlign:"center", flex:1 }}>
                <div style={{ fontSize:10.5, color:"var(--ink)", fontWeight:800, lineHeight:1.3 }}>昨日</div>
                <div style={{ fontSize:15, fontWeight:800, color:"var(--ink)", lineHeight:1.4 }}>{wx.yest}°</div>
              </div>
              <div style={{ fontSize:26, fontWeight:900, color:dcol(wx.dy), flexShrink:0, lineHeight:1, padding:"0 2px", textShadow:"0.6px 0 currentColor, -0.6px 0 currentColor" }}>{wx.dy > 0 ? "↗" : wx.dy < 0 ? "↘" : "→"}</div>
              <div style={{ textAlign:"center", flex:1.3 }}>
                <div style={{ fontSize:10.5, color:"var(--ink)", fontWeight:800, lineHeight:1.3 }}>今日</div>
                <div style={{ fontSize:18, fontWeight:900, color:"var(--ink)", lineHeight:1.4 }}>{wmoIcon(wx.code).e}{wx.today}°</div>
              </div>
              {wx.tmMax != null && (
                <>
                  <div style={{ fontSize:26, fontWeight:900, color:dcol(wx.tmDiff), flexShrink:0, lineHeight:1, padding:"0 2px", textShadow:"0.6px 0 currentColor, -0.6px 0 currentColor" }}>{wx.tmDiff > 0 ? "↗" : wx.tmDiff < 0 ? "↘" : "→"}</div>
                  <div style={{ textAlign:"center", flex:1 }}>
                    <div style={{ fontSize:10.5, color:"var(--ink)", fontWeight:800, lineHeight:1.3 }}>明日</div>
                    <div style={{ fontSize:15, fontWeight:800, color:"var(--ink)", lineHeight:1.4 }}>{wmoIcon(wx.tmCode).e}{wx.tmMax}°</div>
                  </div>
                </>
              )}
            </div>
            <div style={{ fontSize:11, color:"var(--ink)", textAlign:"center", fontWeight:800, marginBottom:2 }}>先週より<span style={{ color:dcol(wx.dw) }}>{sign(wx.dw)}</span>{wx.dw > 0 ? "、暑い一日" : wx.dw < 0 ? "、涼しい一日" : ""}</div>
          </>
        )}
        {wx && (hint || hol && hol.date || events.next) ? <div style={{ height:1, background:"var(--line)", margin:"7px 0" }} /> : null}
        {hint && <div style={{ fontSize:12, color:"#a8480a", fontWeight:700 }}>💡 {hint}</div>}
        {(() => {
          const badge = (days) => <span style={{ background:"var(--soft)", color:"var(--soft-text)", borderRadius:7, padding:"1px 7px", marginLeft:5, fontSize:11, fontWeight:800, whiteSpace:"nowrap" }}>{days === 1 ? "明日" : `あと${days}日`}</span>;
          const rows = [];
          if (hol && hol.date) rows.push({ t: +hol.date, el: (
            <div key="hol">🎌 {jd(hol.date)}（{wd(hol.date)}）{hol.name}{hol.len >= 2 ? `・${hol.len}連休（${jd(hol.blockStart)}〜${jd(hol.blockEnd)}）` : ""}{badge(hol.days)}</div>
          )});
          if (events.next) rows.push({ t: +events.next.date, el: (
            <div key="ev">🗓 {jd(events.next.date)}（{wd(events.next.date)}）{events.next.name}{events.next.food ? `〈${events.next.food}〉` : ""}{badge(Math.round((events.next.date - now)/86400000))}{events.next2 ? <span style={{ color:"var(--sub)" }}>　次：{jd(events.next2.date)} {events.next2.name}</span> : null}</div>
          )});
          rows.sort((a, b) => a.t - b.t);
          if (!rows.length) return null;
          return (
            <div onClick={() => window.dispatchEvent(new CustomEvent("gotoTab", { detail: "calendar" }))}
              style={{ cursor:"pointer" }} title="行事カレンダーを開く">
              {rows.map(r => r.el)}
              <div style={{ fontSize:10.5, color:"var(--faint)", fontWeight:700, marginTop:3 }}>タップで行事カレンダーへ →</div>
            </div>
          );
        })()}
      </div>
    </div>
  );
}

function WeatherWidget({ onTheme }) {
  const [daily, setDaily] = useState(null);
  const [open, setOpen] = useState(false);
  const [wxFailed, setWxFailed] = useState(false);
  const emit = React.useCallback((dd) => { try { if (onTheme && dd && dd.weather_code) onTheme(dd.weather_code[0]); } catch(e) {} }, [onTheme]);
  const loadWx = React.useCallback(() => {
    setWxFailed(false);
    const URL = "https://api.open-meteo.com/v1/forecast?latitude=35.367&longitude=132.755&daily=weather_code,temperature_2m_max,temperature_2m_min&timezone=Asia%2FTokyo&forecast_days=2";
    const KEY = "wxHeadV1";
    const ok = (d) => { if (d && d.daily) { setDaily(d.daily); emit(d.daily); try { localStorage.setItem(KEY, JSON.stringify({ t: Date.now(), d })); } catch(e) {} return true; } return false; };
    const fallback = () => { try { const c = JSON.parse(localStorage.getItem(KEY) || "null"); if (c && Date.now() - c.t < 86400000 && c.d && c.d.daily) { setDaily(c.d.daily); emit(c.d.daily); return true; } } catch(e) {} return false; };
    const go = (retry) => fetch(URL).then(r => r.ok ? r.json() : null).then(d => { if (!ok(d)) throw 0; }).catch(() => {
      if (retry > 0) { setTimeout(() => go(retry - 1), 5000); return; }
      if (!fallback()) setWxFailed(true);
    });
    go(2);
  }, []);
  useEffect(() => { loadWx(); }, [loadWx]);
  if (!daily) {
    if (!wxFailed) return null;
    return (
      <div onClick={loadWx} style={{ fontSize:10.5, color:"var(--sub)", fontWeight:700, cursor:"pointer", whiteSpace:"nowrap", border:"1px solid var(--line)", borderRadius:9, padding:"5px 9px" }}>
        天気を取得できません<br/><span style={{ textDecoration:"underline" }}>タップで再試行</span>
      </div>
    );
  }

  const wmo = (c) => {
    if (c === 0) return { e:"☀️", t:"快晴" };
    if (c === 1) return { e:"🌤", t:"晴れ" };
    if (c === 2) return { e:"⛅", t:"時々曇り" };
    if (c === 3) return { e:"☁️", t:"曇り" };
    if (c === 45 || c === 48) return { e:"🌫", t:"霧" };
    if (c >= 51 && c <= 57) return { e:"🌦", t:"霧雨" };
    if (c >= 61 && c <= 67) return { e:"🌧", t:"雨" };
    if (c >= 71 && c <= 77) return { e:"❄️", t:"雪" };
    if (c >= 80 && c <= 82) return { e:"🌦", t:"にわか雨" };
    if (c === 85 || c === 86) return { e:"🌨", t:"にわか雪" };
    if (c >= 95) return { e:"⛈", t:"雷雨" };
    return { e:"☁️", t:"曇り" };
  };

  const Day = ({ label, i }) => {
    const w = wmo(daily.weather_code[i]);
    const hi = Math.round(daily.temperature_2m_max[i]);
    const lo = Math.round(daily.temperature_2m_min[i]);
    return (
      <div style={{ display:"flex", alignItems:"center", gap:3, whiteSpace:"nowrap" }}>
        <span style={{ fontSize:10, color:"var(--sub)", fontWeight:700 }}>{label}</span>
        <span style={{ fontSize:13 }}>{w.e}</span>
        <span style={{ fontSize:11, fontWeight:700 }}>
          <span style={{ color:"var(--primary)" }}>{hi}°</span>
          <span style={{ color:"var(--faint)" }}>/</span>
          <span style={{ color:"#4a86c5" }}>{lo}°</span>
        </span>
      </div>
    );
  };

  return (
    <div style={{ position:"relative" }}>
      <div onClick={() => setOpen(v => !v)}
        style={{ display:"flex", alignItems:"center", gap:8, background:"rgba(255,255,255,0.9)", border:"1px solid rgba(255,255,255,0.5)", borderRadius:9, padding:"5px 9px", whiteSpace:"nowrap", flexShrink:0, cursor:"pointer", backdropFilter:"blur(4px)" }}>
        <Day label="今日" i={0} />
        <div style={{ width:1, height:14, background:"var(--line)" }} />
        <Day label="明日" i={1} />
      </div>
      {open && (
        <>
          <div onClick={() => setOpen(false)} style={{ position:"fixed", inset:0, zIndex:210 }} />
          <div style={{ position:"absolute", top:"calc(100% + 8px)", right:0, zIndex:211, background:"#fff", borderRadius:14, boxShadow:"0 8px 30px rgba(0,0,0,0.18)", padding:"13px 15px", width:230, animation:"fadeUp .2s ease" }}>
            <div style={{ fontSize:12.5, fontWeight:900, color:"var(--ink)", marginBottom:8 }}>📍 天気の観測地点</div>
            <svg viewBox="0 0 220 100" style={{ width:"100%", display:"block", marginBottom:8 }}>
              <path d="M8,62 L30,72 L58,78 L92,74 L112,66 L128,60 L150,50 L172,40 L196,28 L210,20 L212,30 L196,44 L176,56 L154,66 L132,74 L110,82 L86,88 L56,90 L26,84 L6,72 Z"
                fill="#dce8f5" stroke="#9db8d4" strokeWidth="1.5" strokeLinejoin="round" />
              <path d="M104,60 L124,52 L146,44 L142,52 L122,60 L106,66 Z" fill="#dce8f5" stroke="#9db8d4" strokeWidth="1.5" strokeLinejoin="round" />
              <ellipse cx="128" cy="62" rx="10" ry="4" fill="#aecdea" />
              <circle cx="106" cy="68" r="5" fill="#C24E00" stroke="#fff" strokeWidth="1.5" />
              <text x="106" y="52" textAnchor="middle" fontSize="11" fontWeight="800" fill="#a8480a">出雲</text>
              <text x="196" y="16" textAnchor="middle" fontSize="9" fill="#8fa8c2">松江</text>
              <circle cx="188" cy="30" r="2.5" fill="#8fa8c2" />
              <text x="30" y="60" fontSize="9" fill="#8fa8c2">浜田</text>
            </svg>
            <div style={{ fontSize:11.5, color:"var(--text)", lineHeight:1.7, fontWeight:600 }}>
              <b>出雲市周辺</b>の予報を表示しています。ホームの「今日の売場情報」の気温も同じ地点です。
            </div>
            <a href="https://tenki.jp/forecast/7/35/6810/32203/10days.html" target="_blank" rel="noopener noreferrer"
              onClick={(e) => e.stopPropagation()}
              style={{ display:"flex", alignItems:"center", justifyContent:"center", gap:6, marginTop:11, textDecoration:"none", background:"var(--primary)", color:"#fff", borderRadius:10, padding:"10px", fontSize:13, fontWeight:800 }}>
              週間予報を見る（tenki.jp）→
            </a>
            <div style={{ fontSize:10, color:"var(--faint)", marginTop:8 }}>データ：Open-Meteo</div>
          </div>
        </>
      )}
    </div>
  );
}

// ── 開発・お知らせ Tab ──
function DevTab() {
  return (
    <div style={{ maxWidth:680, margin:"0 auto", padding:"20px 16px 60px" }}>
      <div style={{ fontSize:22, fontWeight:900, color:"var(--ink)", marginBottom:4 }}>お知らせ・更新履歴</div>
      <div style={{ fontSize:12, color:"var(--sub)", marginBottom:20 }}>アプリの更新履歴とお知らせ</div>
      <div style={{ display:"flex", flexDirection:"column", gap:12 }}>
        {ANNOUNCEMENTS.map((a,i)=>{
          const t = ANN_TYPES[a.type] || ANN_TYPES["お知らせ"];
          return (
            <div key={i} style={{ background:"white", borderRadius:14, padding:"16px 18px", border:"1px solid #ececec", boxShadow:"0 1px 4px rgba(0,0,0,0.04)" }}>
              <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:8 }}>
                <span style={{ background:t.bg, color:t.color, border:`1px solid ${t.border}`, borderRadius:20, padding:"3px 10px", fontSize:11, fontWeight:800 }}>{a.type}</span>
                <span style={{ fontSize:11, color:"var(--faint)", fontWeight:700 }}>{a.date}</span>
              </div>
              <div style={{ fontSize:15, fontWeight:800, color:"var(--ink)", marginBottom:6 }}>{a.title}</div>
              <div style={{ fontSize:13, color:"var(--text)", lineHeight:1.75, whiteSpace:"pre-wrap" }}>{a.body}</div>
            </div>
          );
        })}
        {ANNOUNCEMENTS.length === 0 && (
          <div style={{ textAlign:"center", color:"var(--faint)", fontSize:13, padding:"40px 0" }}>まだお知らせはありません</div>
        )}
      </div>
    </div>
  );
}

// ── Main App ──
// ===== GNE：POP画像ジェネレーター（Canvasで柄テンプレに文字を焼く） =====


;Object.assign(window, { DevTab, PromptAddModal, PromptCard, PromptGuide, PromptTab, TodayInfoCard, WeatherWidget });
