/* Nexus共有 — 13-tab-admin （自動分割・window共有） */
var { useState, useEffect, useCallback, useRef } = React;

/* 解錠画面の背景に降るカタカナ。この画面を閉じると止まる */
function RainCanvas() {
  const ref = React.useRef(null);
  useEffect(() => {
    const cv = ref.current; if (!cv) return;
    const ctx = cv.getContext && cv.getContext("2d"); if (!ctx) return;
    // 降ってくるのは魚の名前。1つの列が、上から1文字ずつ名前を書いていく
    const 魚 = (typeof deptRainNames === "function" && deptRainNames()) || ["マグロ","ホンマグロ","メバチ","キハダ","ビンチョウ","カツオ","ブリ","ハマチ","カンパチ","ヒラマサ","タイ","マダイ","チダイ","クロダイ","イサキ","ヒラメ","カレイ","マコガレイ","アカガレイ","カワハギ","アジ","マアジ","シマアジ","ムロアジ","サバ","マサバ","ゴマサバ","イワシ","マイワシ","ウルメイワシ","カタクチイワシ","サンマ","サケ","シロザケ","ギンザケ","ベニザケ","トラウト","マス","タラ","マダラ","スケソウダラ","ホッケ","キンキ","キンメダイ","ノドグロ","アカムツ","クロムツ","メバル","カサゴ","アラ","クエ","スズキ","シーバス","ボラ","コノシロ","コハダ","サヨリ","キス","アナゴ","ウナギ","ハモ","ドジョウ","アユ","ワカサギ","シシャモ","キビナゴ","トビウオ","カマス","タチウオ","マナガツオ","イトヨリ","アマダイ","ハタハタ","フグ","トラフグ","アンコウ","オコゼ","メヒカリ","ニシン","シラス","イカ","スルメイカ","ヤリイカ","ケンサキイカ","アオリイカ","コウイカ","ホタルイカ","タコ","マダコ","ミズダコ","イイダコ","エビ","クルマエビ","ブラックタイガー","バナメイ","アマエビ","ボタンエビ","シバエビ","サクラエビ","シャコ","カニ","ズワイガニ","ベニズワイ","タラバガニ","ケガニ","ワタリガニ","ホタテ","アサリ","シジミ","ハマグリ","サザエ","アワビ","トコブシ","ミルガイ","ホッキガイ","アカガイ","トリガイ","バイガイ","ツブガイ","カキ","イワガキ","ムール","ウニ","ムラサキウニ","バフンウニ","ナマコ","ホヤ","クラゲ","スジコ","イクラ","タラコ","メンタイコ","カズノコ","シラウオ","シロウオ","ワカメ","メカブ","コンブ","ヒジキ","モズク","アオサ","ノリ","テングサ","ウマヅラ","アイナメ","ソイ","ハタ","キジハタ"];
    const えらぶ = () => 魚[(Math.random() * 魚.length) | 0];
    const FS = 13;
    let drops = [], raf = 0, last = 0, w = 0, h = 0, stopped = false;
    const reduce = (() => { try { return window.matchMedia("(prefers-reduced-motion: reduce)").matches; } catch(e) { return false; } })();
    const size = () => {
      const r = cv.getBoundingClientRect();
      w = cv.width = Math.max(1, Math.floor(r.width));
      h = cv.height = Math.max(1, Math.floor(r.height));
      const cols = Math.max(1, Math.floor(w / FS));
      drops = new Array(cols).fill(0).map(() => ({
        y: Math.random() * -(h / FS),          // 先頭がどこまで降りたか
        名: えらぶ(),                            // いま書いている魚
        i: 0,                                  // その何文字目か
      }));
      ctx.font = FS + "px ui-monospace, Menlo, monospace";
      ctx.textBaseline = "top";
    };
    const frame = (t) => {
      if (stopped) return;
      raf = requestAnimationFrame(frame);
      if (t - last < 55) return;                 // 秒18コマ程度に抑える
      last = t;
      ctx.fillStyle = "rgba(6, 13, 15, 0.10)";   // 尾を引かせる
      ctx.fillRect(0, 0, w, h);
      for (let i = 0; i < drops.length; i++) {
        const d = drops[i];
        const y = d.y * FS;
        ctx.fillStyle = "rgba(150, 232, 214, 0.85)";   // 先頭の1文字は明るく
        ctx.fillText(d.名[d.i], i * FS, y);
        if (d.i > 0) {                                  // 直前の文字を淡く重ねて、尾に見せる
          ctx.fillStyle = "rgba(58, 148, 132, 0.30)";
          ctx.fillText(d.名[d.i - 1], i * FS, y - FS);
        }
        d.i += 1;
        if (d.i >= d.名.length) {                       // 名前を書き終えたら、次の魚へ
          d.名 = えらぶ(); d.i = 0; d.y += 2;            // 名前と名前の間を少し空ける
        }
        d.y += 1;
        if (d.y * FS > h && Math.random() > 0.975) { d.y = 0; d.名 = えらぶ(); d.i = 0; }
      }
    };
    size();
    if (reduce) {                                 // 動きを減らす設定なら1枚だけ描く
      ctx.fillStyle = "rgba(58, 148, 132, 0.22)";
      for (let i = 0; i < drops.length; i++) {
        let j = Math.floor(Math.random() * 4);
        while (j < h / FS) {
          const 名 = えらぶ();
          for (let k = 0; k < 名.length && j < h / FS; k++, j++) ctx.fillText(名[k], i * FS, j * FS);
          j += 3;
        }
      }
      return;
    }
    raf = requestAnimationFrame(frame);
    window.addEventListener("resize", size);
    return () => { stopped = true; cancelAnimationFrame(raf); window.removeEventListener("resize", size); };
  }, []);
  return <canvas ref={ref} aria-hidden="true"
    style={{ position:"absolute", inset:0, width:"100%", height:"100%", opacity:0.5 }} />;
}

function AdminTab({ onNoticeChange, onCreateFromPop }) {
  const [unlocked, setUnlocked] = useState(false);
  const [replyDraft, setReplyDraft] = useState({});   // 依頼の返答メモ（{id: 入力中の文字}）
  const [gpw, setGpw] = useState("");
  const [gErr, setGErr] = useState("");
  const [gChecking, setGChecking] = useState(false);
  const [gKeyMode, setGKeyMode] = useState(false);   // 数字キーで入れる（逃げ道）
  const [gBoot, setGBoot] = useState("");            // 起動メッセージを1文字ずつ
  const [gFlash, setGFlash] = useState(0);           // 押した点を光らせる
  const [gOK, setGOK] = useState(false);             // 解錠できたときの一瞬の表示
  const [section, setSection] = useState("home"); // home（タイル一覧）| 各画面

  // アーカイブ管理用
  const [pops, setPops] = useState([]);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState("active"); // active | archived
  const [sel, setSel] = useState({});
  const [applying, setApplying] = useState(false);
  const [gFilter, setGFilter] = useState("未分類"); // ジャンル選別の表示フィルタ

  // 依頼一覧用
  const [reqs, setReqs] = useState([]);
  const [reqLoading, setReqLoading] = useState(true);

  // ピン留め用
  const [pinnedPopId, setPinnedPopId] = useState(null);
  const [pinnedBusy, setPinnedBusy] = useState(false);
  const [delAsk, setDelAsk] = useState(false);   // 一括削除の確認中か
  const [delWord, setDelWord] = useState("");    // 確認の入力
  const [delBusy, setDelBusy] = useState(false);
  const [delPops, setDelPops] = useState([]);      // 消された投稿
  const [trashSel, setTrashSel] = useState({});    // ゴミ箱での選択
  const [trashOpen, setTrashOpen] = useState(null);  // ゴミ箱で開いているポップ
  const [supPhotos, setSupPhotos] = useState([]);   // 店舗支援に上がった画像
  const [supOpen, setSupOpen] = useState(null);     // 拡大して見ている画像
  const [supTrash, setSupTrash] = useState([]);     // 店舗支援のゴミ箱
  const [supView, setSupView] = useState("live");   // live | trash
  const [trashBusy, setTrashBusy] = useState(false);
  const [opLogs, setOpLogs] = useState([]);
  const [bkBusy, setBkBusy] = useState(false);
  const [bkMsg, setBkMsg] = useState("");
  const [oplogTab, setOplogTab] = useState("op");   // 記録・更新履歴のどちらを見ているか
  const [scope, setScope] = useState("all");        // "all"=鮮魚の管理者 / "produce"=青果だけの副管理者
  const [bkDone, setBkDone] = useState("");
  const [idMsg, setIdMsg] = useState("");
  const [idDel, setIdDel] = useState(null);
  const [grpAsk, setGrpAsk] = useState(false);    // まとめる確認中か
  const [grpName, setGrpName] = useState("");
  const [grpBusy, setGrpBusy] = useState(false);
  const [grpCover, setGrpCover] = useState(null);   // 表紙にするポップ

  const setPinned = async (popId) => {
    setPinnedBusy(true);
    try {
      await api.setPinned(popId);
      setPinnedPopId(popId);
      await load();
    } catch(e) {
      alert("ピン留め更新に失敗しました");
      console.error(e);
    } finally {
      setPinnedBusy(false);
    }
  };

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const d = await api.listAll(); setPops(d);
      // ピン留めPOPを取得
      const pp = d.find(x => x.is_pinned);
      setPinnedPopId(pp ? pp.id : null);
    }
    catch (e) { console.error(e); } finally { setLoading(false); }
  }, []);
  const loadReqs = useCallback(async () => {
    setReqLoading(true);
    try { const d = await api.listRequests(); setReqs(d); }
    catch (e) { console.error(e); } finally { setReqLoading(false); }
  }, []);
  const loadTrash = useCallback(async () => {
    try { setDelPops(await api.listDeleted() || []); } catch(e) { setDelPops([]); }
  }, []);
  const loadSupport = useCallback(async () => {
    try { setSupPhotos(await api.listFloorPhotos(null, "店舗支援") || []); } catch(e) { setSupPhotos([]); }
    try { setSupTrash(await api.listFloorPhotos(null, "店舗支援ゴミ箱") || []); } catch(e) { setSupTrash([]); }
  }, []);
  const loadOpLogs = useCallback(async () => {
    try { setOpLogs(await api.listOpLogs(200) || []); } catch(e) { setOpLogs([]); }
  }, []);
  useEffect(() => { if (unlocked) { load(); loadReqs(); loadTrash(); loadOpLogs(); loadSupport(); } }, [unlocked, load, loadReqs, loadTrash, loadOpLogs, loadSupport]);

  // 認証画面のあいだは、下のページが動かないように止める（点を押すと画面ごと動いていた）
  useEffect(() => {
    if (unlocked) return;
    const h = document.documentElement, b = document.body;
    const 前 = { y: window.scrollY, hO: h.style.overflow, bO: b.style.overflow, bP: b.style.position, bT: b.style.top, bW: b.style.width, oB: h.style.overscrollBehavior };
    h.style.overflow = "hidden"; h.style.overscrollBehavior = "none";
    b.style.overflow = "hidden"; b.style.position = "fixed"; b.style.top = (-前.y) + "px"; b.style.width = "100%";
    return () => {
      h.style.overflow = 前.hO; h.style.overscrollBehavior = 前.oB;
      b.style.overflow = 前.bO; b.style.position = 前.bP; b.style.top = 前.bT; b.style.width = 前.bW;
      window.scrollTo(0, 前.y);
    };
  }, [unlocked]);

  useEffect(() => {
    if (unlocked) return;
    const t = "> 接続中 ... OK\n> 端末を確認 ... OK\n> 認証待ち";
    let i = 0;
    const iv = setInterval(() => { i += 1; setGBoot(t.slice(0, i)); if (i >= t.length) clearInterval(iv); }, 16);
    return () => clearInterval(iv);
  }, [unlocked]);

  const tryUnlockWith = async (pw) => {
    if (gChecking) return;
    setGChecking(true); setGErr("");
    try {
      const 青果 = (typeof deptKey === "function" && deptKey() === "produce");
      let r = { ok:false, locked:false };
      if (青果) {
        // 青果の副管理者。通れば、青果のポップだけを扱える立場になる
        r = await api.verifyPasswordEx("admin_produce", pw);
        if (r.ok) setScope("produce");
      }
      if (!r.ok) {
        const r2 = await api.verifyPasswordEx("admin", pw);
        if (r2.ok) setScope("all");
        if (r2.ok || !青果) r = r2;        // 青果で両方外れたときは、青果側の残り回数を見せる
      }
      if (r.ok) { setGErr(""); setGOK(true); setTimeout(() => setUnlocked(true), 620); }
      else {
        setGErr(r.locked
          ? `${api.lockText(r.seconds)}ほど待ってください`
          : (r.left > 0 ? "パスワードが違います" : "パスワードが違います"));
        setGpw("");
      }
    } catch (e) {
      setGErr("電波を確認してください");
    } finally {
      setGChecking(false);
    }
  };
  const tryUnlock = () => tryUnlockWith(gpw);

  if (!unlocked) {
    const DOTS = [1,2,3,4,5,6,7,8,9];
    const PIN_LEN = 4;
    const AM  = "#f0a44a";
    const AMB = "#ffdcae";
    const DIM = "#8a6a45";
    const tapDot = (n) => {
      if (gChecking || gOK) return;
      setGErr(""); setGFlash(n);
      setTimeout(() => setGFlash(0), 170);
      try { navigator.vibrate && navigator.vibrate(12); } catch(e) {}
      setGpw(v => {
        const nv = (v.length >= 12 ? v : v + n);
        if (nv.length === PIN_LEN) setTimeout(() => tryUnlockWith(nv), 200);
        return nv;
      });
    };
    const goBack = () => { try { window.dispatchEvent(new CustomEvent("goBoard")); } catch(e) {} };

    return (
      <div style={{ position:"fixed", inset:0, zIndex:210, overflow:"hidden", touchAction:"none",
        background:"radial-gradient(120% 90% at 50% 26%, #123033 0%, #0a181c 45%, #050d0f 100%)",
        display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center",
        fontFamily:'ui-monospace, SFMono-Regular, Menlo, Consolas, monospace' }}>

        <RainCanvas />
        <div aria-hidden="true" style={{ position:"absolute", inset:0, pointerEvents:"none",
          background:"radial-gradient(52% 38% at 50% 44%, rgba(240,164,74,0.15), transparent 72%), radial-gradient(100% 62% at 50% 100%, rgba(0,0,0,0.6), transparent 62%)" }} />

        {/* 一覧へ戻る：文字は出さず、左上の小さな「‹」だけ */}
        <button onClick={goBack} aria-label="一覧にもどる"
          style={{ position:"absolute", zIndex:4, left:10, top:"calc(env(safe-area-inset-top, 0px) + 8px)",
            border:"none", background:"transparent", color:DIM, fontSize:26, lineHeight:1,
            cursor:"pointer", fontFamily:"inherit", padding:"8px 12px", opacity:0.7 }}>‹</button>

        <div className={gErr ? "g-shake" : ""} style={{ position:"relative", zIndex:3, display:"flex", flexDirection:"column", alignItems:"center",
          padding:"0 20px" }}>

          {/* 文字は出さない。違ったときは点の並びが揺れて、最初からになる */}
          <div role="status" aria-live="polite" style={{ position:"absolute", width:1, height:1, overflow:"hidden", clip:"rect(0 0 0 0)" }}>
            {gChecking ? "確認中" : (gErr || "")}
          </div>
          <div style={{ display:"grid", gridTemplateColumns:"repeat(3, 1fr)", gap:20, justifyItems:"center" }}>
            {DOTS.map(n => (
              <button key={n} onClick={() => tapDot(n)} aria-label={n + "を入力"} disabled={gChecking || gOK}
                style={{ position:"relative", width:58, height:58, borderRadius:"50%", cursor:"pointer", padding:0,
                  touchAction:"manipulation", WebkitTapHighlightColor:"transparent",
                  border:"1px solid " + (gFlash === n ? AMB : "rgba(240,164,74,0.32)"),
                  background: gFlash === n ? AM : "rgba(240,164,74,0.045)",
                  boxShadow: gFlash === n ? "0 0 20px "+AM+", 0 0 46px rgba(240,164,74,0.5)" : "none",
                  transition:"background .14s, box-shadow .14s, border-color .14s" }}>
                {gFlash === n && <span aria-hidden="true" className="g-ripple" />}
              </button>
            ))}
          </div>
        </div>

        {gOK && (
          <div aria-hidden="true" style={{ position:"absolute", inset:0, zIndex:6, display:"flex",
            alignItems:"center", justifyContent:"center", background:"rgba(5,13,15,0.92)", animation:"fadeUp .18s ease" }}>
          </div>
        )}
      </div>
    );
  }

  // ---- アーカイブ管理 ----
  const list = pops.filter(p => view === "archived" ? p.archived : !p.archived);
  const selIds = Object.keys(sel).filter(k => sel[k]);
  const toArchive = view === "active";
  const aCount = pops.filter(p => !p.archived).length;
  const arCount = pops.filter(p => p.archived).length;
  const toggle = (id) => setSel(s => ({ ...s, [id]: !s[id] }));
  const switchView = (v) => { setView(v); setSel({}); };
  const doGroup = async (name, cover) => {
    setGrpBusy(true);
    try {
      await api.groupPops(selIds, name, cover);
      const n = selIds.length;
      setSel({}); setGrpAsk(false); setGrpName("");
      await load();
      try { window.dispatchEvent(new CustomEvent("appToast", { detail: name ? `${n}件をまとめました` : `${n}件のまとまりを解除しました` })); } catch(e) {}
    } catch (e) { alert("まとめられませんでした：" + (e && e.message ? e.message : "")); }
    finally { setGrpBusy(false); }
  };

  const doDelete = async () => {
    if (delWord.trim() !== "削除") return;
    setDelBusy(true);
    try {
      await api.delMany(selIds);
      const n = selIds.length;
      setSel({}); setDelAsk(false); setDelWord("");
      await load();
      try { window.dispatchEvent(new CustomEvent("appToast", { detail: `${n}件を消しました` })); } catch(e) {}
    } catch (e) { alert("削除できませんでした：" + (e && e.message ? e.message : "")); }
    finally { setDelBusy(false); }
  };

  const apply = async () => {
    if (!selIds.length) return;
    setApplying(true);
    try { await api.setArchivedMany(selIds, toArchive); setSel({}); await load(); }
    catch (e) { alert("更新に失敗しました（archived列の追加SQLは実行済みですか？）"); }
    finally { setApplying(false); }
  };
  const seg = (v, label, n) => (
    <button onClick={() => switchView(v)}
      style={{ flex:1, border:"none", padding:"10px", fontSize:14, fontWeight:600,
        background: view===v ? "var(--fill)" : "var(--card)", color: view===v ? "#fff" : "#888", cursor:"pointer" }}>
      {label}（{n}）
    </button>
  );

  // ---- ジャンル選別 ----
  const activePops = pops.filter(p => !p.archived);
  const genreCount = (g) => g === "未分類" ? activePops.filter(p => !p.genre).length : activePops.filter(p => p.genre === g).length;
  const genreList = activePops.filter(p => gFilter === "未分類" ? !p.genre : p.genre === gFilter);
  const assignGenre = async (p, genre) => {
    const next = p.genre === genre ? null : genre; // 同じものを再タップで未分類に戻す
    setPops(ps => ps.map(x => x.id === p.id ? { ...x, genre: next } : x)); // 先に画面反映
    try { await api.setGenre(p.id, next); }
    catch (e) {
      setPops(ps => ps.map(x => x.id === p.id ? { ...x, genre: p.genre } : x)); // 失敗したら戻す
      alert("更新に失敗しました（genre列の追加SQLは実行済みですか？）");
    }
  };

  // ---- 依頼 ----
  const openReqs = reqs.filter(r => r.status !== "対応済み").length;
  const pinnedCount = pops.filter(p => p.is_pinned).length;
  const saveReply = async (r) => {
    const text = (replyDraft[r.id] ?? r.reply ?? "").trim();
    try {
      await api.updateRequest(r.id, { reply: text, replied_at: new Date().toISOString(), status: "対応済み" });
      setReqs(rs => rs.map(x => x.id === r.id ? { ...x, reply: text, replied_at: new Date().toISOString(), status: "対応済み" } : x));
    } catch(e) {}
  };
  const setReqStatus = async (r, status) => {
    try { await api.updateRequest(r.id, { status }); setReqs(rs => rs.map(x => x.id === r.id ? { ...x, status } : x)); }
    catch (e) { alert("更新に失敗しました"); }
  };
  const delReq = async (r) => {
    if (!confirm("この依頼を削除しますか？")) return;
    try { await api.delRequest(r.id); setReqs(rs => rs.filter(x => x.id !== r.id)); }
    catch (e) { alert("削除に失敗しました"); }
  };
  const fmtDate = (s) => { try { const d = new Date(s); const p2 = (n) => String(n).padStart(2,"0"); return `${d.getMonth()+1}/${d.getDate()} ${p2(d.getHours())}:${p2(d.getMinutes())}`; } catch(e){ return ""; } };

  const SEG_ICON = {
    req:     <><path d="M20 11.5a7.5 7.5 0 01-10.9 6.7L4 19.5l1.4-4.4A7.5 7.5 0 1120 11.5z"/></>,
    genre:   <><path d="M4 5h16M7 12h13M10 19h10"/><circle cx="4" cy="12" r="1.2"/><circle cx="6.5" cy="19" r="1.2"/></>,
    archive: <><path d="M3 8.5h18v11a1.5 1.5 0 01-1.5 1.5h-15A1.5 1.5 0 013 19.5z"/><path d="M2.5 4.5h19v4h-19zM9.5 12.5h5"/></>,
    notice:  <><path d="M18 8.5a6 6 0 10-12 0c0 6-2.5 7.5-2.5 7.5h17S18 14.5 18 8.5z"/><path d="M10.5 20a2 2 0 003 0"/></>,
    pinned:  <><path d="M15 3l6 6-3 1-4.5 4.5L12 21l-2.5-6L3 12l6.5-1.5L14 6z"/></>,
    memo:    <><path d="M4 20h4L18.5 9.5a2 2 0 00-2.8-2.8L5 17.2 4 20z"/><path d="M14 6.5l3.5 3.5"/></>,
    ranking: <><path d="M4 20V11M10 20V5M16 20v-6M22 20H2"/></>,
    device:  <><rect x="7" y="2.5" width="10" height="19" rx="2.5"/><path d="M10.5 18.5h3"/></>,
    res:     <><path d="M5 3.5h9l5 5v12H5z"/><path d="M14 3.5v5h5M8.5 13h7M8.5 16.5h5"/></>,
    cat:     <><path d="M3 5.5s2.5-1.5 4.5-1.5S12 5.5 12 5.5v14s-2-1.5-4.5-1.5S3 19.5 3 19.5z"/><path d="M12 5.5s2.5-1.5 4.5-1.5S21 5.5 21 5.5v14s-2-1.5-4.5-1.5S12 19.5 12 19.5z"/></>,
    dev:     <><circle cx="12" cy="12" r="9"/><path d="M12 16v-5M12 8h.01"/></>,
    rot:     <><path d="M3.5 12a8.5 8.5 0 018.5-8.5c3 0 5.6 1.6 7.1 3.9"/><path d="M20.5 4v4h-4"/><path d="M20.5 12a8.5 8.5 0 01-8.5 8.5c-3 0-5.6-1.6-7.1-3.9"/><path d="M3.5 20v-4h4"/></>,
  };
  const mainSeg = (v, label, badge) => {
    const on = section === v;
    return (
      <button onClick={() => setSection(v)} className="hig-pill"
        style={{ position:"relative", border: on ? "2px solid var(--primary-soft)" : "1px solid var(--line)",
          background: on ? "var(--soft)" : "var(--card)", color: on ? "var(--primary)" : "var(--text)",
          borderRadius:12, padding:"11px 6px", fontSize:12.5, fontWeight:600, cursor:"pointer",
          display:"flex", flexDirection:"column", alignItems:"center", gap:5, lineHeight:1.3 }}>
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round">{SEG_ICON[v]}</svg>
        <span style={{ whiteSpace:"nowrap" }}>{label}</span>
        {badge ? <span style={{ position:"absolute", top:5, right:6, background:"#e0555f", color:"#fff", fontSize:12.5, fontWeight:700, borderRadius:999, minWidth:16, height:16, display:"flex", alignItems:"center", justifyContent:"center", padding:"0 4px" }}>{badge}</span> : null}
      </button>
    );
  };

  return (
    <div style={{ maxWidth:1080, margin:"0 auto", padding:16, paddingBottom:140, animation:"fadeUp .3s ease" }}>
      <div style={{ fontSize:22, fontWeight:700, color:"var(--ink)", marginBottom: scope === "produce" ? 4 : 12 }}>
        {scope === "produce" ? "青果の管理" : "管理画面"}
      </div>
      {scope === "produce" && (
        <div style={{ fontSize:12.5, color:"var(--sub)", lineHeight:1.8, marginBottom:14 }}>
          扱えるのは<b>青果のポップだけ</b>です。鮮魚のポップには、ここからは手が届きません。
        </div>
      )}

      {section === "home" ? (
        <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill, minmax(104px, 1fr))", gap:10 }}>
          {[
            ["req","依頼",openReqs||0,"#c2691a",<><path d="M4 5.5h16v13H4z"/><path d="M4 7l8 6 8-6"/></>],
            ["rename","名前の見直し",pops.filter(p => 仮の名前(p.product_name)).length||0,"#d07a1f",<><path d="M4 20h4l10.5-10.5a2.1 2.1 0 00-3-3L5 17v3z"/><path d="M13.5 6.5l3 3"/></>],
            ["genre","ジャンル",genreCount("未分類")||0,"#6b4ea0",<><path d="M20.6 13.4L12 4.8H4v8l8.6 8.6a2 2 0 002.8 0l5.2-5.2a2 2 0 000-2.8z"/><circle cx="7.5" cy="7.5" r="1.3"/></>],
            ["archive","アーカイブ",arCount,"#2f6fb0",<><rect x="3" y="4" width="18" height="5" rx="1.5"/><path d="M5 9v9.5A1.5 1.5 0 006.5 20h11a1.5 1.5 0 001.5-1.5V9M10 13h4"/></>],
            ["trash","ゴミ箱",delPops.length||0,"#b3261e",<><path d="M4 7h16M9.5 7V5h5v2M6.5 7l1 13h9l1-13"/></>],
            ["oplog","操作の記録・更新履歴",opLogs.length||0,"#3f8f9e",<><circle cx="12" cy="12" r="8.5"/><path d="M12 7.5V12l3 2"/></>],
            ["backup","控えを取る",null,"#3f9e63",<><path d="M12 3v11M8 10.5l4 4 4-4"/><path d="M4 16.5v2.5a1.5 1.5 0 001.5 1.5h13a1.5 1.5 0 001.5-1.5v-2.5"/></>],
            ["notice","お知らせ",null,"#c39a3c",<><path d="M4 9.5h4l7-4.5v14l-7-4.5H4z"/><path d="M18 9a4 4 0 010 6"/></>],
            ["pinned","ピン留め",pinnedCount,"#d1554f",<><path d="M12 17v4M8 3h8l-1 6 3 3v2H6v-2l3-3z"/></>],
            ["ranking","記録",null,"#2aa3a3",<><path d="M4 20V10M10 20V4M16 20v-7M22 20H2"/></>],
            ["device","端末",null,"#8a9099",<><rect x="6" y="3" width="12" height="18" rx="2.5"/><path d="M11 18h2"/></>],
            ["res","資料",null,"#1d9e75",<><path d="M5 4.5h9l5 5v10H5z"/><path d="M14 4.5v5h5"/></>],
            ["rot","向き",null,"#b08968",<><path d="M20 12a8 8 0 11-2.3-5.6"/><path d="M20 4v5h-5"/></>],
          ].filter(([k]) => scope !== "produce" || ["rename","genre","archive","trash","pinned"].includes(k))
           .map(([k,label,n,col,icon]) => (
            <button key={k} onClick={() => setSection(k)}
              style={{ position:"relative", background:"var(--card, #fff)", border:"1px solid var(--line)", borderRadius:12,
                padding:"18px 8px 13px", cursor:"pointer", display:"flex", flexDirection:"column",
                alignItems:"center", gap:8, minHeight:100, boxShadow:"var(--card-shadow)" }}>
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="var(--primary-soft)"
                strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">{icon}</svg>
              <span style={{ fontSize:12.5, fontWeight:600, color:"var(--text)", lineHeight:1.3, textAlign:"center" }}>{label}</span>
              {n != null && n > 0 && (
                <span style={{ position:"absolute", top:8, right:9, background:"var(--fill)", color:"#fff",
                  fontSize:12.5, fontWeight:700, minWidth:21, height:21, borderRadius:10,
                  display:"flex", alignItems:"center", justifyContent:"center", padding:"0 5px" }}>{n}</span>
              )}
            </button>
          ))}
        </div>
      ) : (
        <button onClick={() => setSection("home")}
          style={{ display:"flex", alignItems:"center", gap:5, border:"1px solid var(--line)", background:"var(--card, #fff)",
            color:"var(--sub)", borderRadius:10, padding:"8px 14px 8px 10px", fontSize:13.5, fontWeight:600,
            cursor:"pointer", marginBottom:16 }}>
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round"><path d="M15 5l-7 7 7 7"/></svg>
          メニューへ
        </button>
      )}

      {section === "notice" && <NoticeAdmin onNoticeChange={onNoticeChange} />}

      {section === "ranking" && <RankingPanel onCreateFromPop={onCreateFromPop} />}

      {section === "device" && <DeviceStatsPanel />}

      {section === "res" && <ResourceAdmin />}
      {section === "rename" && <RenameReview pops={pops} onRenamed={(id, nm) => setPops(ps => ps.map(x => x.id === id ? { ...x, product_name: nm } : x))} />}


      {section === "rot" && <DimsBackfill />}
      {section === "rot" && <RotateAdmin />}

      {section === "req" && (
        reqLoading ? (
          <div style={{ textAlign:"center", color:"var(--sub)", padding:"40px 0", fontSize:14 }}>読み込み中…</div>
        ) : reqs.length === 0 ? (
          <div style={{ textAlign:"center", padding:50, color:"var(--faint)" }}>
            
            <div style={{ fontSize:15, fontWeight:700, color:"var(--sub)" }}>依頼はまだありません</div>
            <div style={{ fontSize:13.5, marginTop:6, color:"var(--faint)" }}>「ポップ依頼」からみんなが投稿できます</div>
          </div>
        ) : (
          <div style={{ display:"flex", flexDirection:"column", gap:10 }}>
            {reqs.map(r => {
              const done = r.status === "対応済み";
              const urgent = r.priority === "急ぎ";
              return (
                <div key={r.id} style={{ background: done ? "#f6faf7" : "var(--card)", borderRadius:12, border: done ? "1px solid #cfe8d8" : "1px solid var(--line)", padding:14, borderLeft:`5px solid ${done?"#3f9e63":urgent?"#e01010":"var(--primary)"}` }}>
                  <div style={{ display:"flex", alignItems:"center", gap:7, marginBottom:6, flexWrap:"wrap" }}>
                    {urgent && !done && <span style={{ background:"#e01010", color:"#fff", fontSize:12.5, fontWeight:700, padding:"2px 7px", borderRadius:8 }}>急ぎ</span>}
                    {done && (
                      <span style={{ display:"flex", alignItems:"center", gap:3, background:"#3f9e63", color:"#fff", fontSize:12.5, fontWeight:700, padding:"3px 9px", borderRadius:8 }}>
                        <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M4 12.5l5 5L20 6.5"/></svg>
                        対応済み
                      </span>
                    )}
                    {r.kind && r.kind !== "POP作成依頼" && <span style={{ fontSize:12.5, fontWeight:600, color:"#2f6fb0", background:"#eaf2fb", borderRadius:8, padding:"2px 7px", marginRight:6, flexShrink:0 }}>{r.kind}</span>}
                    <span style={{ fontSize:15, fontWeight:700, color:"var(--ink)" }}>{r.product_name}</span>
                    <span style={{ marginLeft:"auto", fontSize:12.5, color:"var(--faint)", whiteSpace:"nowrap" }}>{fmtDate(r.created_at)} 受付</span>
                  </div>
                  <div style={{ fontSize:12.5, color:"var(--sub)", marginBottom: r.reason ? 8 : 10 }}>{r.store_name}</div>
                  {r.reason && <div style={{ fontSize:13.5, color:"var(--text)", lineHeight:1.5, background:"var(--bg)", borderRadius:8, padding:"8px 10px", marginBottom:10, whiteSpace:"pre-wrap" }}>{r.reason}</div>}
                  {Array.isArray(r.files) && r.files.length > 0 && (
                    <div style={{ display:"flex", gap:6, flexWrap:"wrap", marginBottom:10 }}>
                      {r.files.map((f, i) => (
                        <a key={i} href={f.url} target="_blank" rel="noopener noreferrer" download={f.name}
                          style={{ display:"flex", alignItems:"center", gap:7, textDecoration:"none", border:"1px solid var(--line)", borderRadius:8, padding:"5px 9px 5px 5px", background:"var(--card, #fff)" }}>
                          {(f.type || "").startsWith("image/")
                            ? <img src={f.url} alt="" style={{ width:30, height:30, objectFit:"cover", borderRadius:5, background:"var(--bg)" }} />
                            : <span style={{ width:30, height:30, borderRadius:5, background:"var(--bg)", display:"flex", alignItems:"center", justifyContent:"center", fontSize:12.5, fontWeight:700, color:"var(--sub)" }}>
                                {(String(f.name).split(".").pop() || "").slice(0,4).toUpperCase()}
                              </span>}
                          <span style={{ fontSize:12.5, fontWeight:700, color:"var(--primary)", maxWidth:130, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{f.name}</span>
                        </a>
                      ))}
                    </div>
                  )}

                  {done && r.reply && (
                    <div style={{ fontSize:12.5, color:"#2c6b45", lineHeight:1.6, background:"#eaf6ee", borderRadius:8, padding:"8px 10px", marginBottom:10, whiteSpace:"pre-wrap" }}>
                      <span style={{ fontWeight:700 }}>返答：</span>{r.reply}
                      {r.replied_at && <span style={{ marginLeft:8, fontSize:12.5, color:"#6a9a7c" }}>（{fmtDate(r.replied_at)}）</span>}
                    </div>
                  )}

                  <input value={replyDraft[r.id] ?? r.reply ?? ""} onChange={e => setReplyDraft(v => ({ ...v, [r.id]: e.target.value }))}
                    placeholder="返答メモ（例：来週作ります／すでに投稿済みです）"
                    style={{ width:"100%", boxSizing:"border-box", border:"1px solid var(--line)", borderRadius:8, padding:"8px 10px", fontSize:12.5, outline:"none", marginBottom:8, fontFamily:"inherit" }} />

                  <div style={{ display:"flex", gap:8 }}>
                    <button onClick={()=> done ? setReqStatus(r, "未対応") : saveReply(r)}
                      style={{ flex:1, border:"none", background: done ? "var(--chip)" : "var(--fill)", color: done ? "var(--sub)" : "#fff", fontWeight:600, fontSize:13.5, borderRadius:8, padding:"9px", cursor:"pointer" }}>
                      {done ? "未対応に戻す" : "返答して対応済みにする"}
                    </button>
                    <button onClick={()=>delReq(r)}
                      style={{ border:"1px solid #f0d0d0", background:"var(--card, #fff)", color:"#d33", fontWeight:600, fontSize:13.5, borderRadius:8, padding:"9px 14px", cursor:"pointer" }}>削除</button>
                  </div>
                </div>
              );
            })}
          </div>
        )
      )}

      {section === "genre" && (
        <div>
          <div style={{ fontSize:13.5, color:"var(--sub)", marginBottom:14, lineHeight:1.6 }}>
            検索画面の左タブで使うジャンルを、ここで振り分けます。ボタンをタップで設定（同じものをもう一度タップで未分類に戻す）。公開中のPOPのみ表示。「除外」を選ぶと、そのPOPは検索結果に出なくなります（一覧には残り、左タブにも出ません）。
          </div>
          <div style={{ display:"flex", gap:8, flexWrap:"wrap", marginBottom:16 }}>
            {["未分類", ...deptGenres(), "除外"].map(g => {
              const on = gFilter === g;
              const c = deptGenreColors()[g];
              return (
                <button key={g} onClick={() => setGFilter(g)}
                  style={{ border: on ? "none" : "1px solid var(--line)",
                    background: on ? (c ? c.solid : "#222") : "var(--card)",
                    color: on ? "#fff" : "#777", fontSize:13.5, fontWeight:600,
                    padding:"8px 12px", borderRadius:8, cursor:"pointer" }}>
                  {g}（{genreCount(g)}）
                </button>
              );
            })}
          </div>
          {loading ? (
            <div style={{ textAlign:"center", color:"var(--sub)", padding:"40px 0", fontSize:14 }}>読み込み中…</div>
          ) : genreList.length === 0 ? (
            <div style={{ textAlign:"center", color:"var(--faint)", padding:"40px 0", fontSize:14 }}>
              {gFilter === "未分類" ? "未分類のPOPはありません（すべて振り分け済み）" : `「${gFilter}」のPOPはありません`}
            </div>
          ) : (
            <div style={{ display:"flex", flexDirection:"column", gap:10 }}>
              {genreList.map(p => (
                <div key={p.id} style={{ background:"var(--card, #fff)", borderRadius:12, boxShadow:"0 1px 8px rgba(0,0,0,0.06)", padding:10, display:"flex", gap:11, alignItems:"flex-start" }}>
                  <img loading="lazy" decoding="async" src={p.image_url} alt="" style={{ width:52, height:68, objectFit:"cover", borderRadius:8, background:"var(--chip)", flexShrink:0 }} />
                  <div style={{ flex:1, minWidth:0 }}>
                    <div style={{ fontSize:14, fontWeight:600, color:"var(--ink)", whiteSpace:"nowrap", overflow:"hidden", textOverflow:"ellipsis" }}>{p.product_name}</div>
                    <div style={{ fontSize:12.5, color:"var(--sub)", marginBottom:8 }}>{p.store_name}{p.category ? ` ・ ${p.category}` : ""}</div>
                    <div style={{ display:"flex", flexWrap:"wrap", gap:6 }}>
                      {[...deptGenres(), "除外"].map(g => {
                        const gc = deptGenreColors()[g];
                        const on = p.genre === g;
                        return (
                          <button key={g} onClick={() => assignGenre(p, g)}
                            style={{ border:`1.5px solid ${gc.solid}`, background: on ? gc.solid : "var(--card)",
                              color: on ? "#fff" : gc.solid, fontSize:12.5, fontWeight:600,
                              padding:"7px 11px", borderRadius:8, cursor:"pointer", whiteSpace:"nowrap" }}>
                            {g}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {section === "backup" && (() => {
        const run = async () => {
          setBkBusy(true); setBkDone(""); setBkMsg("はじめます…");
          try {
            const data = await api.makeBackup((i, n, t) => setBkMsg(`${i} / ${n} … ${t}`));
            const json = JSON.stringify(data, null, 1);
            const blob = new Blob([json], { type:"application/json" });
            const d = new Date();
            const nm = `GoodDay控え_${d.getFullYear()}${String(d.getMonth()+1).padStart(2,"0")}${String(d.getDate()).padStart(2,"0")}.json`;
            const a = document.createElement("a");
            a.href = URL.createObjectURL(blob); a.download = nm; a.click();
            setTimeout(() => URL.revokeObjectURL(a.href), 4000);
            const total = Object.values(data.中身).reduce((s2, v) => s2 + (Array.isArray(v) ? v.length : 0), 0);
            setBkMsg(""); setBkDone(`${total}件を書き出しました（${Math.round(json.length/1024)}KB）`);
          } catch (e) { setBkMsg(""); setBkDone("うまくいきませんでした：" + ((e && e.message) || "")); }
          finally { setBkBusy(false); }
        };
        return (
          <div>
            <div style={{ fontSize:13.5, color:"var(--text)", lineHeight:1.9, marginBottom:16 }}>
              いまの中身をまとめて1つのファイルに書き出します。<br/>
              ポップの名前・カタログ・発注の品目・行事など、文字の情報が入ります。
            </div>
            <div style={{ background:"#fff6de", border:"1px solid #eeddad", color:"#8a6d00", borderRadius:10, padding:"11px 13px", fontSize:12.5, lineHeight:1.8, marginBottom:18 }}>
              写真そのものは入りません。写真はサーバーに置いたままです。<br/>
              月に一度など、ときどき取っておくと安心です。
            </div>
            <button onClick={run} disabled={bkBusy}
              style={{ width:"100%", border:"none", background: bkBusy ? "#ccc" : "var(--fill)", color:"#fff",
                borderRadius:12, padding:"15px", fontSize:15, fontWeight:700, cursor:"pointer" }}>
              {bkBusy ? "書き出しています…" : "控えを取る（ファイルに保存）"}
            </button>
            {bkMsg && <div style={{ fontSize:12.5, color:"var(--sub)", marginTop:12, textAlign:"center" }}>{bkMsg}</div>}
            {bkDone && (
              <div style={{ marginTop:14, background: bkDone.includes("うまく") ? "#fdeceb" : "#eaf6ee",
                color: bkDone.includes("うまく") ? "#b3261e" : "#2c6b45", border:"1px solid " + (bkDone.includes("うまく") ? "#f5c6c2" : "#c9e6d4"),
                borderRadius:10, padding:"12px 13px", fontSize:13.5, fontWeight:600 }}>{bkDone}</div>
            )}
            <div style={{ fontSize:12.5, color:"var(--faint)", lineHeight:1.8, marginTop:18 }}>
              取ったファイルは、パソコンや iCloud など手元に残しておいてください。<br/>
              もし中身が消えても、このファイルがあれば戻せます。
            </div>
          </div>
      );})()}

      {trashOpen && (
        <PopDetail pop={trashOpen} onClose={() => setTrashOpen(null)}
          onDelete={() => { setTrashOpen(null); loadTrash(); }}
          onLiked={() => {}} onCommented={() => {}}
          navList={delPops} onNav={(p) => setTrashOpen(p)} />
      )}

      {section === "oplog" && (() => {
        const 札 = (k, label) => (
          <button key={k} onClick={() => setOplogTab(k)} aria-pressed={oplogTab === k}
            style={{ flex:1, border:"none", borderRadius:8, padding:"9px 0", cursor:"pointer", fontFamily:"inherit",
              fontSize:13.5, fontWeight:600,
              background: oplogTab === k ? "var(--card, #fff)" : "transparent",
              color: oplogTab === k ? "var(--ink)" : "var(--sub)",
              boxShadow: oplogTab === k ? "0 1px 3px rgba(0,0,0,0.12)" : "none" }}>{label}</button>
        );
        const 切替 = (
          <div style={{ display:"flex", gap:3, background:"var(--chip)", borderRadius:10, padding:3, marginBottom:14 }}>
            {札("op", "操作の記録")}{札("dev", "更新履歴")}
          </div>
        );
        if (oplogTab === "dev") return (
          <div>
            {切替}
            {window.DevTab ? React.createElement(window.DevTab, { embedded: true })
              : <div style={{ textAlign:"center", padding:40, color:"var(--faint)", fontSize:13.5 }}>読み込み中…</div>}
          </div>
        );
        const LABEL = { delete:"消した", rename:"名前を直した", restore:"戻した", purge:"完全に消した", group:"まとめた", idea_add:"アイデアをのせた", idea_del:"アイデアを消した" };
        const COLOR = { delete:"#c2691a", rename:"#2f6fb0", restore:"#3f9e63", purge:"#b3261e", group:"#6b4ea0", idea_add:"#c39a3c", idea_del:"#8a9099" };
        return (
          <div>
            {切替}
            <div style={{ fontSize:12.5, color:"var(--sub)", lineHeight:1.8, marginBottom:14 }}>
              消したり名前を直したりした記録です。新しい順に200件まで見られます。
            </div>
            {opLogs.length === 0 ? (
              <div style={{ textAlign:"center", color:"var(--faint)", padding:"44px 20px", fontSize:13.5 }}>
                <div style={{ fontSize:15, fontWeight:600, color:"var(--sub)" }}>まだ記録がありません</div>
              </div>
            ) : (
              <div style={{ display:"flex", flexDirection:"column", gap:6 }}>
                {opLogs.map(lg => (
                  <div key={lg.id} style={{ display:"flex", alignItems:"flex-start", gap:9, background:"var(--card, #fff)", border:"1px solid var(--line)", borderRadius:10, padding:"9px 11px" }}>
                    <span style={{ fontSize:12.5, fontWeight:700, color:"#fff", background: COLOR[lg.action] || "#889",
                      borderRadius:8, padding:"3px 7px", flexShrink:0, whiteSpace:"nowrap" }}>{LABEL[lg.action] || lg.action}</span>
                    <span style={{ minWidth:0, flex:1 }}>
                      <span style={{ display:"block", fontSize:13.5, fontWeight:600, color:"var(--ink)", overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>
                        {lg.target_name || "（名前なし）"}
                      </span>
                      {lg.detail && <span style={{ display:"block", fontSize:12.5, color:"var(--sub)", marginTop:2 }}>{lg.detail}</span>}
                      <span style={{ display:"block", fontSize:12.5, color:"var(--faint)", marginTop:2 }}>
                        {fmtDate(lg.created_at)}{lg.store_name ? ` ／ ${lg.store_name}` : ""}
                      </span>
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
      );})()}

      {section === "support" && (() => {
        const rows = supView === "trash" ? supTrash : supPhotos;
        const restore = async (p2) => {
          try {
            await api.insertFloorPhoto({ store_name: p2.store_name || "共有", category:"店舗支援",
              image_url: p2.image_url, comment: p2.comment || "", author: p2.author || "", created_at: p2.created_at });
            await api.deleteFloorPhoto(p2.id);
            loadSupport();
          } catch(e) {}
        };
        const erase = async (p2) => {
          if (!window.confirm("完全に消します。元に戻せません。よろしいですか？")) return;
          try { await api.deleteFloorPhoto(p2.id); await api.deleteStoredImage(p2.image_url); loadSupport(); } catch(e) {}
        };
        return (
        <div>
          <div style={{ display:"flex", gap:8, marginBottom:12 }}>
            {[["live", "今ある", supPhotos.length], ["trash", "ゴミ箱", supTrash.length]].map(([k, label, n]) => (
              <button key={k} onClick={() => setSupView(k)}
                style={{ flex:1, border:"1px solid " + (supView===k ? "var(--primary)" : "var(--line)"),
                  background: supView===k ? "var(--fill)" : "var(--card, #fff)",
                  color: supView===k ? "#fff" : "var(--text)", borderRadius:10, padding:"10px 6px",
                  fontSize:13.5, fontWeight:600, cursor:"pointer" }}>{label}（{n}）</button>
            ))}
          </div>

          <div style={{ fontSize:12.5, color:"var(--sub)", lineHeight:1.8, marginBottom:12 }}>
            {supView === "trash"
              ? "店舗支援で消された画像です。戻すか、完全に消すかを選べます。完全に消すと元に戻せません。"
              : "店舗支援に上がっている画像です。上げてから3日で自動的に消えます。"}
          </div>

          {rows.length === 0 ? (
            <div style={{ textAlign:"center", color:"var(--sub)", fontSize:13.5, padding:"40px 0" }}>
              {supView === "trash" ? "ゴミ箱は空です。" : "まだ1枚もありません。"}
            </div>
          ) : (
            <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill, minmax(150px, 1fr))", gap:10 }}>
              {rows.map(p2 => (
                <div key={p2.id} style={{ border:"1px solid var(--line)", background:"var(--card, #fff)",
                  borderRadius:12, overflow:"hidden" }}>
                  <button onClick={() => setSupOpen(p2)}
                    style={{ border:"none", background:"transparent", padding:0, cursor:"pointer", display:"block", width:"100%" }}>
                    <img src={p2.image_url} alt="" loading="lazy"
                      style={{ width:"100%", aspectRatio:"3/4", objectFit:"cover", display:"block", background:"var(--chip)" }} />
                  </button>
                  <div style={{ padding:"7px 9px 9px" }}>
                    <div style={{ fontSize:12, color:"var(--sub)", marginBottom:7 }}>
                      {formatDate ? formatDate(p2.created_at) : String(p2.created_at || "").slice(0, 10)}
                      {p2.author ? "　" + p2.author : ""}
                    </div>
                    {supView === "trash" ? (
                      <div style={{ display:"flex", gap:6 }}>
                        <button onClick={() => restore(p2)}
                          style={{ flex:1, border:"1px solid var(--primary-soft)", background:"transparent",
                            color:"var(--primary-soft)", borderRadius:8, padding:"7px 4px", fontSize:12.5,
                            fontWeight:600, cursor:"pointer" }}>戻す</button>
                        <button onClick={() => erase(p2)}
                          style={{ flex:1, border:"1px solid #b3261e", background:"transparent", color:"#b3261e",
                            borderRadius:8, padding:"7px 4px", fontSize:12.5, fontWeight:600, cursor:"pointer" }}>完全に消す</button>
                      </div>
                    ) : (
                      <button onClick={() => erase(p2)}
                        style={{ width:"100%", border:"1px solid #b3261e", background:"transparent", color:"#b3261e",
                          borderRadius:8, padding:"7px", fontSize:12.5, fontWeight:600, cursor:"pointer" }}>完全に消す</button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}

          {supOpen && (
            <div onClick={() => setSupOpen(null)}
              style={{ position:"fixed", inset:0, zIndex:300, background:"rgba(8,14,20,0.92)",
                display:"flex", alignItems:"center", justifyContent:"center", padding:16 }}>
              <img src={supOpen.image_url} alt=""
                style={{ maxWidth:"100%", maxHeight:"92vh", objectFit:"contain", borderRadius:8 }} />
            </div>
          )}
        </div>
        );
      })()}

      {section === "trash" && (() => {
        const ids = Object.keys(trashSel).filter(k => trashSel[k]);
        const doRestore = async () => {
          setTrashBusy(true);
          try { await api.restorePops(ids); setTrashSel({}); await loadTrash(); await load();
            try { window.dispatchEvent(new CustomEvent("appToast", { detail:`${ids.length}件を戻しました` })); } catch(e) {}
          } catch(e) { alert("戻せませんでした"); } finally { setTrashBusy(false); }
        };
        const doPurge = async () => {
          if (!window.confirm(`${ids.length}件を完全に消しますか？\nこの操作は戻せません。`)) return;
          setTrashBusy(true);
          try { await api.delMany(ids); setTrashSel({}); await loadTrash();
            try { window.dispatchEvent(new CustomEvent("appToast", { detail:`${ids.length}件を消しました` })); } catch(e) {}
          } catch(e) { alert("消せませんでした"); } finally { setTrashBusy(false); }
        };
        return (
          <div>
            <div style={{ fontSize:12.5, color:"var(--sub)", lineHeight:1.8, marginBottom:14 }}>
              みんなが消した投稿です。一覧には出ませんが、ここから戻せます。
            </div>
            {delPops.length === 0 ? (
              <div style={{ textAlign:"center", color:"var(--faint)", padding:"44px 20px", fontSize:13.5 }}>
                <div style={{ fontSize:15, fontWeight:600, color:"var(--sub)" }}>消された投稿はありません</div>
              </div>
            ) : (
              <>
                {ids.length > 0 && (
                  <div style={{ position:"sticky", top:0, zIndex:5, background:"var(--bg)", padding:"10px 0", display:"flex", alignItems:"center", gap:8, marginBottom:10 }}>
                    <span style={{ fontSize:13.5, fontWeight:600, color:"var(--ink)" }}>{ids.length}件 選択中</span>
                    <button onClick={() => setTrashSel({})}
                      style={{ marginLeft:"auto", border:"1px solid var(--line)", background:"var(--card, #fff)", color:"var(--sub)", borderRadius:8, padding:"9px 12px", fontSize:13.5, fontWeight:700, cursor:"pointer" }}>解除</button>
                    <button onClick={doRestore} disabled={trashBusy}
                      style={{ border:"none", background:"var(--fill)", color:"#fff", borderRadius:8, padding:"9px 15px", fontSize:13.5, fontWeight:600, cursor:"pointer" }}>もどす</button>
                    <button onClick={doPurge} disabled={trashBusy}
                      style={{ border:"1px solid #f0c8c4", background:"var(--card, #fff)", color:"#b3261e", borderRadius:8, padding:"9px 13px", fontSize:13.5, fontWeight:600, cursor:"pointer" }}>完全に消す</button>
                  </div>
                )}
                <div className="pop-grid v-sm">
                  {delPops.map(pop => {
                    const on = !!trashSel[pop.id];
                    return (
                      <div key={pop.id} onClick={() => setTrashOpen(pop)}
                        style={{ position:"relative", border: on ? "2.5px solid var(--primary)" : "1px solid var(--line)",
                          background:"var(--card, #fff)", borderRadius:10, overflow:"hidden", cursor:"pointer", textAlign:"left" }}>
                        <img loading="lazy" decoding="async" src={pop.image_url} alt="" style={{ width:"100%", aspectRatio:"1/1.414", objectFit:"contain", display:"block", background:"var(--card, #fff)", opacity:0.75 }} />
                        <span style={{ display:"block", fontSize:12.5, fontWeight:600, color:"var(--ink)", padding:"6px 7px 2px", lineHeight:1.4 }}>{pop.product_name}</span>
                        <span style={{ display:"block", fontSize:12.5, color:"var(--faint)", padding:"0 7px 7px" }}>{fmtDate(pop.deleted_at)} に削除</span>
                        <button onClick={(e) => { e.stopPropagation(); setTrashSel(v => ({ ...v, [pop.id]: !v[pop.id] })); }}
                          aria-label={on ? "選ぶのをやめる" : "選ぶ"} aria-pressed={on}
                          style={{ position:"absolute", top:6, right:6, width:28, height:28, borderRadius:"50%", cursor:"pointer",
                            border: on ? "none" : "1.5px solid rgba(255,255,255,0.9)",
                            background: on ? "var(--fill)" : "rgba(20,25,35,0.45)", color:"#fff",
                            display:"flex", alignItems:"center", justifyContent:"center", fontSize:14, fontWeight:700, padding:0 }}>
                          {on ? "✓" : ""}
                        </button>
                      </div>
                    );
                  })}
                </div>
              </>
            )}
          </div>
      );})()}

      {section === "archive" && (
        <div>
          <div style={{ fontSize:13.5, color:"var(--sub)", marginBottom:14 }}>写真をタップして選び、まとめてアーカイブ／公開に戻せます。</div>
          <div style={{ display:"flex", borderRadius:10, overflow:"hidden", border:"1px solid var(--line)", marginBottom:14 }}>
            {seg("active","公開中",aCount)}
            {seg("archived","アーカイブ済み",arCount)}
          </div>
          {loading ? (
            <div style={{ textAlign:"center", color:"var(--sub)", padding:"40px 0", fontSize:14 }}>読み込み中…</div>
          ) : list.length === 0 ? (
            <div style={{ textAlign:"center", color:"var(--faint)", padding:"40px 0", fontSize:14 }}>
              {view==="archived" ? "アーカイブ済みのPOPはありません" : "公開中のPOPはありません"}
            </div>
          ) : (
            <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill, minmax(108px, 1fr))", gap:10 }}>
              {list.map(p => {
                const on = !!sel[p.id];
                return (
                  <button key={p.id} onClick={() => toggle(p.id)}
                    style={{ position:"relative", border: on ? "3px solid var(--primary)" : "1px solid var(--line)", borderRadius:12, overflow:"hidden",
                      background:"var(--card, #fff)", padding:0, cursor:"pointer", textAlign:"left", boxShadow:"0 1px 6px rgba(0,0,0,0.06)" }}>
                    <img loading="lazy" decoding="async" src={p.image_url} alt="" style={{ width:"100%", aspectRatio:"3 / 4", objectFit:"cover", display:"block", background:"var(--chip)", opacity: on ? 0.85 : 1 }} />
                    {on && <span style={{ position:"absolute", top:6, right:6, width:24, height:24, borderRadius:"50%", background:"var(--fill)", color:"#fff", display:"flex", alignItems:"center", justifyContent:"center", fontSize:15, fontWeight:700, lineHeight:1 }}>✓</span>}
                    <div style={{ padding:"6px 8px" }}>
                      <div style={{ fontSize:12.5, fontWeight:600, color:"var(--ink)", whiteSpace:"nowrap", overflow:"hidden", textOverflow:"ellipsis" }}>{p.product_name}</div>
                      <div style={{ fontSize:12.5, color:"var(--sub)", whiteSpace:"nowrap", overflow:"hidden", textOverflow:"ellipsis" }}>{p.store_name}</div>
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </div>
      )}

      {section === "archive" && selIds.length > 0 && (
        <div style={{ position:"fixed", left:0, right:0, bottom:"calc(78px + env(safe-area-inset-bottom))", zIndex:190,
          background:"var(--card, #fff)", borderTop:"1px solid #ececec", boxShadow:"0 -2px 14px rgba(0,0,0,0.1)", padding:"12px 16px",
          display:"flex", alignItems:"center", gap:12 }}>
          <span style={{ fontSize:14, fontWeight:600, color:"var(--ink)" }}>{selIds.length}件 選択中</span>
          <button onClick={() => setSel({})}
            style={{ marginLeft:"auto", border:"1px solid var(--line)", background:"var(--card, #fff)", color:"var(--sub)", borderRadius:8, padding:"9px 12px", fontSize:13.5, fontWeight:700, cursor:"pointer" }}>解除</button>
          <button onClick={() => { setGrpAsk(true); setGrpName(""); setGrpCover(selIds[0] || null); }}
            style={{ border:"1px solid var(--line)", background:"var(--card, #fff)", color:"var(--primary)", borderRadius:8, padding:"9px 13px", fontSize:13.5, fontWeight:600, cursor:"pointer" }}>まとめる</button>
          <button onClick={() => { setDelAsk(true); setDelWord(""); }}
            style={{ border:"1px solid #f0c8c4", background:"var(--card, #fff)", color:"#b3261e", borderRadius:8, padding:"9px 13px", fontSize:13.5, fontWeight:600, cursor:"pointer" }}>消す</button>
          <button onClick={apply} disabled={applying}
            style={{ border:"none", background: toArchive ? "var(--fill)" : "#2f6fb0", color:"#fff", borderRadius:8, padding:"10px 16px", fontSize:14, fontWeight:600, cursor:"pointer", opacity: applying ? 0.6 : 1 }}>
            {applying ? "処理中…" : (toArchive ? "アーカイブする" : "公開に戻す")}
          </button>
        </div>
      )}

      {grpAsk && (
        <div onClick={() => !grpBusy && setGrpAsk(false)}
          style={{ position:"fixed", inset:0, zIndex:1300, background:"rgba(15,25,38,0.6)", display:"flex", alignItems:"center", justifyContent:"center", padding:20 }}>
          <div onClick={e => e.stopPropagation()}
            style={{ background:"var(--card, #fff)", borderRadius:12, width:"100%", maxWidth:420, padding:"22px 20px" }}>
            <div style={{ fontSize:17, fontWeight:700, color:"var(--ink)", marginBottom:8 }}>{selIds.length}件をひとまとめにします</div>
            <div style={{ fontSize:12.5, color:"var(--sub)", lineHeight:1.8, marginBottom:14 }}>
              一覧には、この名前で1件だけ出るようになります。押すと中の全部が見られます。
            </div>
            <div style={{ fontSize:12.5, fontWeight:600, color:"var(--sub)", marginBottom:6 }}>まとまりの名前</div>
            <input value={grpName} onChange={e => setGrpName(e.target.value)} placeholder="例：9月8日の月曜販促"
              style={{ width:"100%", boxSizing:"border-box", border:"2px solid var(--line)", borderRadius:10, padding:"11px 12px", fontSize:15, outline:"none", fontFamily:"inherit", marginBottom:14 }} />
            <div style={{ fontSize:12.5, fontWeight:600, color:"var(--sub)", marginBottom:6 }}>表紙にするポップ（一覧に出ます）</div>
            <div style={{ display:"flex", gap:7, overflowX:"auto", paddingBottom:6, marginBottom:14 }}>
              {selIds.map(id => {
                const p2 = pops.find(x => x.id === id);
                if (!p2) return null;
                const on = grpCover === id;
                return (
                  <button key={id} onClick={() => setGrpCover(id)} aria-pressed={on}
                    style={{ flexShrink:0, width:62, border: on ? "2.5px solid var(--primary)" : "1px solid var(--line)",
                      background:"var(--card, #fff)", borderRadius:8, padding:3, cursor:"pointer" }}>
                    <img loading="lazy" decoding="async" src={p2.image_url} alt="" style={{ width:"100%", aspectRatio:"1/1.414", objectFit:"contain", background:"var(--card)", borderRadius:5, display:"block" }} />
                  </button>
                );
              })}
            </div>

            <div style={{ display:"flex", gap:9, marginBottom:10 }}>
              <button onClick={() => setGrpAsk(false)} disabled={grpBusy}
                style={{ flex:1, border:"none", background:"var(--chip)", color:"var(--text)", borderRadius:10, padding:"12px", fontSize:14, fontWeight:600, cursor:"pointer" }}>やめる</button>
              <button onClick={() => doGroup(grpName.trim(), grpCover)} disabled={grpBusy || !grpName.trim()}
                style={{ flex:1, border:"none", background: (grpBusy || !grpName.trim()) ? "#ddd" : "var(--fill)", color:"#fff", borderRadius:10, padding:"12px", fontSize:14, fontWeight:700, cursor:"pointer" }}>
                {grpBusy ? "まとめています…" : "まとめる"}
              </button>
            </div>
            <button onClick={() => doGroup("")} disabled={grpBusy}
              style={{ width:"100%", border:"1px solid var(--line)", background:"var(--card, #fff)", color:"var(--sub)", borderRadius:10, padding:"10px", fontSize:12.5, fontWeight:700, cursor:"pointer" }}>
              まとまりを解除する（バラバラに戻す）
            </button>
          </div>
        </div>
      )}

      {delAsk && (
        <div onClick={() => !delBusy && setDelAsk(false)}
          style={{ position:"fixed", inset:0, zIndex:1300, background:"rgba(15,25,38,0.6)", display:"flex", alignItems:"center", justifyContent:"center", padding:20 }}>
          <div onClick={e => e.stopPropagation()}
            style={{ background:"var(--card, #fff)", borderRadius:12, width:"100%", maxWidth:420, padding:"22px 20px" }}>
            <div style={{ fontSize:17, fontWeight:700, color:"#b3261e", marginBottom:8 }}>{selIds.length}件を完全に消します</div>
            <div style={{ fontSize:12.5, color:"var(--text)", lineHeight:1.8, marginBottom:14 }}>
              選んだポップと、そこに付いたコメントも一緒に消えます。<br/>
              <b>一度消すと元に戻せません。</b><br/>
              残しておきたいだけなら「アーカイブする」をお使いください。
            </div>
            <div style={{ fontSize:12.5, fontWeight:600, color:"var(--sub)", marginBottom:6 }}>確認のため「削除」と入力してください</div>
            <input value={delWord} onChange={e => setDelWord(e.target.value)} placeholder="削除"
              style={{ width:"100%", boxSizing:"border-box", border:"2px solid var(--line)", borderRadius:10, padding:"11px 12px", fontSize:15, outline:"none", fontFamily:"inherit", marginBottom:16 }} />
            <div style={{ display:"flex", gap:9 }}>
              <button onClick={() => setDelAsk(false)} disabled={delBusy}
                style={{ flex:1, border:"none", background:"var(--chip)", color:"var(--text)", borderRadius:10, padding:"12px", fontSize:14, fontWeight:600, cursor:"pointer" }}>やめる</button>
              <button onClick={doDelete} disabled={delBusy || delWord.trim() !== "削除"}
                style={{ flex:1, border:"none", background: (delBusy || delWord.trim() !== "削除") ? "#ddd" : "#b3261e", color:"#fff", borderRadius:10, padding:"12px", fontSize:14, fontWeight:700, cursor:"pointer" }}>
                {delBusy ? "消しています…" : "完全に消す"}
              </button>
            </div>
          </div>
        </div>
      )}

      {section === "pinned" && (
        <div>
          <div style={{ fontSize:13.5, color:"var(--sub)", marginBottom:14 }}>ホーム画面の一覧最上部に固定するPOPを選択できます</div>
          {loading ? (
            <div style={{ textAlign:"center", color:"var(--sub)", padding:"40px 0", fontSize:14 }}>読み込み中…</div>
          ) : (
            <>
              {pinnedPopId && (
                <div style={{ background:"#fff8f0", border:"2px solid var(--primary)", borderRadius:12, padding:12, marginBottom:14 }}>
                  <div style={{ fontSize:12.5, fontWeight:600, color:"var(--primary)", marginBottom:6 }}>📌 現在のピン留め</div>
                  {pops.find(p => p.id === pinnedPopId) && (
                    <div style={{ display:"flex", gap:8, alignItems:"center" }}>
                      <img src={pops.find(p => p.id === pinnedPopId).image_url} style={{ width:60, height:60, objectFit:"cover", borderRadius:8 }} />
                      <div style={{ flex:1, fontSize:13.5, fontWeight:700 }}>{pops.find(p => p.id === pinnedPopId).product_name || "無題"}</div>
                      <button onClick={() => setPinned(null)} style={{ border:"none", background:"var(--chip)", color:"var(--text)", borderRadius:8, padding:"6px 12px", fontSize:12.5, fontWeight:700, cursor:"pointer" }}>外す</button>
                    </div>
                  )}
                </div>
              )}
              <div style={{ fontSize:12.5, fontWeight:600, color:"var(--sub)", marginBottom:8 }}>最近投稿したPOP</div>
              <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill, minmax(100px, 1fr))", gap:8 }}>
                {pops.slice(0, 20).map(p => (
                  <div key={p.id} onClick={() => setPinned(p.id)} style={{ cursor:"pointer", opacity: p.id === pinnedPopId ? 0.5 : 1, position:"relative" }}>
                    <img loading="lazy" decoding="async" src={p.image_url} style={{ width:"100%", aspectRatio:"1/1", objectFit:"cover", borderRadius:8, border: p.id === pinnedPopId ? "3px solid var(--primary)" : "none" }} />
                    {p.id === pinnedPopId && <div style={{ position:"absolute", inset:0, display:"flex", alignItems:"center", justifyContent:"center", fontSize:24 }}>📌</div>}
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}

// ===== アーカイブ：販売終了POPの保管庫（誰でも閲覧可・読み取り専用） =====
function ArchiveTab({ onCreateFromPop }) {
  const [pops, setPops] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sel, setSel] = useState(null);
  const [resTarget, setResTarget] = useState(null);
  const [resTitle, setResTitle] = useState("");
  const [resDesc, setResDesc] = useState("");
  const [resVisible, setResVisible] = useState(false);
  const [resBusy, setResBusy] = useState(false);
  const [resMsg, setResMsg] = useState("");

  const openResForm = (pop, e) => {
    if (e) e.stopPropagation();
    setResTarget(pop); setResTitle(pop.product_name || ""); setResDesc(""); setResVisible(false); setResMsg("");
  };
  const saveAsResource = async () => {
    if (!resTitle.trim()) { setResMsg("タイトルを入力してください"); return; }
    setResBusy(true); setResMsg("");
    try {
      await api.addResource({ title: resTitle.trim(), description: resDesc.trim() || null, kind:"image", url: resTarget.image_url, emoji:"🖼", visible: resVisible, sort_order: 99 });
      setResMsg("資料に登録しました");
      setTimeout(() => setResTarget(null), 900);
    } catch (e) { setResMsg("登録に失敗しました：" + (e.message || "")); }
    finally { setResBusy(false); }
  };

  useEffect(() => {
    let alive = true;
    (async () => {
      try { const d = await api.listArchived(); if (alive) setPops(d); }
      catch (e) { console.error(e); }
      finally { if (alive) setLoading(false); }
    })();
    return () => { alive = false; };
  }, []);

  return (
    <div style={{ maxWidth:1080, margin:"0 auto", padding:16, paddingBottom:90, animation:"fadeUp .3s ease" }}>
      <div style={{ fontSize:22, fontWeight:700, color:"var(--ink)", marginBottom:4 }}>アーカイブ</div>
      <div style={{ fontSize:13.5, color:"var(--sub)", marginBottom:14 }}>販売が終わったPOPの保管庫です。過去の参考にどうぞ。</div>

      {loading ? (
        <div style={{ textAlign:"center", color:"var(--sub)", padding:"50px 0", fontSize:14 }}>読み込み中…</div>
      ) : pops.length === 0 ? (
        <div style={{ textAlign:"center", padding:60, color:"var(--faint)" }}>
          
          <div style={{ fontSize:15, fontWeight:700, color:"var(--sub)" }}>アーカイブはまだ空です</div>
          <div style={{ fontSize:13.5, marginTop:6, color:"var(--faint)" }}>管理画面からPOPをアーカイブできます</div>
        </div>
      ) : (
        <>
          <div style={{ fontSize:13.5, fontWeight:600, color:"var(--sub)", marginBottom:12, paddingLeft:2 }}>アーカイブ済み（{pops.length}）</div>
          <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill, minmax(118px, 1fr))", gap:3 }}>
            {pops.map(pop => (
              <div key={pop.id} style={{ position:"relative" }}>
                <img src={pop.image_url} loading="lazy" onClick={() => setSel(pop)}
                  style={{ width:"100%", aspectRatio:"1/1", objectFit:"cover", borderRadius:8, cursor:"pointer", background:"var(--chip)", display:"block" }} />
                <button onClick={(e) => openResForm(pop, e)} title="資料に登録"
                  style={{ position:"absolute", right:5, bottom:5, border:"none", background:"rgba(29,58,87,0.86)", color:"#fff", borderRadius:999, padding:"4px 9px", fontSize:12.5, fontWeight:700, cursor:"pointer" }}>
                  資料へ
                </button>
              </div>
            ))}
          </div>
        </>
      )}

      {resTarget && (
        <div onClick={() => setResTarget(null)}
          style={{ position:"fixed", inset:0, background:"rgba(0,0,0,0.55)", display:"flex", alignItems:"center", justifyContent:"center", zIndex:1100, padding:20 }}>
          <div onClick={e => e.stopPropagation()}
            style={{ background:"var(--card, #fff)", borderRadius:12, padding:18, width:"100%", maxWidth:340, maxHeight:"86vh", overflowY:"auto" }}>
            <div style={{ fontSize:14, fontWeight:700, color:"var(--ink)", marginBottom:4 }}>資料に登録</div>
            <div style={{ fontSize:12.5, color:"var(--sub)", lineHeight:1.6, marginBottom:12 }}>このポップの画像を資料として登録します。「一覧に表示する」を入れなければ、管理画面からだけ見られます。</div>
            <img src={resTarget.image_url} style={{ width:"100%", borderRadius:10, marginBottom:12, background:"var(--chip)" }} />
            <input value={resTitle} onChange={e => setResTitle(e.target.value)} placeholder="タイトル"
              style={{ width:"100%", boxSizing:"border-box", padding:"10px 11px", border:"1px solid var(--line)", borderRadius:8, fontSize:13.5, outline:"none", marginBottom:8 }} />
            <input value={resDesc} onChange={e => setResDesc(e.target.value)} placeholder="説明（任意）"
              style={{ width:"100%", boxSizing:"border-box", padding:"10px 11px", border:"1px solid var(--line)", borderRadius:8, fontSize:13.5, outline:"none", marginBottom:11 }} />
            <label style={{ display:"flex", alignItems:"center", gap:7, fontSize:12.5, fontWeight:600, color:"var(--text)", cursor:"pointer", marginBottom:13 }}>
              <input type="checkbox" checked={resVisible} onChange={e => setResVisible(e.target.checked)} />
              一覧に表示する（みんなが見られます）
            </label>
            {resMsg && <div style={{ fontSize:12.5, color:"var(--sub)", fontWeight:700, marginBottom:10 }}>{resMsg}</div>}
            <div style={{ display:"flex", gap:8 }}>
              <button onClick={() => setResTarget(null)}
                style={{ flex:1, padding:"11px", background:"var(--chip)", color:"var(--text)", border:"none", borderRadius:8, fontSize:13.5, fontWeight:600, cursor:"pointer" }}>やめる</button>
              <button onClick={saveAsResource} disabled={resBusy}
                style={{ flex:1, padding:"11px", background: resBusy ? "#ccc" : "var(--primary-soft, #4a7ab0)", color:"#fff", border:"none", borderRadius:8, fontSize:13.5, fontWeight:700, cursor: resBusy ? "default" : "pointer" }}>{resBusy ? "登録中…" : "登録する"}</button>
            </div>
          </div>
        </div>
      )}

      {sel && <PopDetail pop={sel} onClose={() => setSel(null)}
        navList={pops} onNav={setSel}
        onDelete={id => { setPops(p => p.filter(x => x.id !== id)); setSel(null); }}
        onLiked={(id, likes) => setPops(p => p.map(x => x.id === id ? { ...x, likes } : x))}
        onCreateFromPop={onCreateFromPop}
      />}
    </div>
  );
}

// ===== ポップ依頼：作ってほしいPOPの依頼フォーム（誰でも投稿可） =====
function RequestTab() {
  const [kind, setKind] = useState("POP作成依頼");
  const [store, setStore] = useState("");
  const [product, setProduct] = useState("");
  const [priority, setPriority] = useState("普通");
  const [reason, setReason] = useState("");
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState("");
  const [files, setFiles] = useState([]);        // 添付ファイル [{name,url,type,size}]
  const [upBusy, setUpBusy] = useState(false);
  const isPop = kind === "POP作成依頼";

  const MAX_MB = 10;
  const pickFiles = async (list) => {
    if (!list || !list.length) return;
    setUpBusy(true); setError("");
    try {
      const added = [];
      for (const f of Array.from(list)) {
        if (f.size > MAX_MB * 1024 * 1024) { setError(`${f.name} は大きすぎます（${MAX_MB}MBまで）`); continue; }
        const url = await api.uploadRaw(f);
        added.push({ name: f.name, url, type: f.type || "", size: f.size });
      }
      if (added.length) setFiles(v => v.concat(added));
    } catch(e) { setError("ファイルを送れませんでした"); }
    finally { setUpBusy(false); }
  };
  const isImg = (f) => (f.type || "").startsWith("image/");
  const fileKB = (n) => n >= 1024*1024 ? `${(n/1024/1024).toFixed(1)}MB` : `${Math.round(n/1024)}KB`;

  const submit = async () => {
    if (isPop && !product.trim()) { setError("商品名を入力してください"); return; }
    if (!isPop && !reason.trim()) { setError("内容を入力してください"); return; }
    setBusy(true); setError("");
    try {
      await api.insertRequest({ kind, store_name: store || "未指定", product_name: isPop ? product.trim() : (product.trim() || kind), reason: reason.trim(), author: "匿名", priority: isPop ? priority : "普通", files });
      setDone(true); setFiles([]);
    } catch (e) { setError("送信に失敗しました: " + e.message); }
    finally { setBusy(false); }
  };
  const reset = () => { setProduct(""); setReason(""); setPriority("普通"); setDone(false); setError(""); };

  const card = { background:"var(--card, #fff)", borderRadius:12, boxShadow:"var(--card-shadow)", padding:16 };
  const lbl = { fontSize:12, color:"var(--sub)", marginBottom:5, fontWeight:700 };
  const inp = { width:"100%", boxSizing:"border-box", border:"1px solid var(--line)", borderRadius:10, padding:"11px 12px", fontSize:15, outline:"none", background:"var(--card, #fff)" };

  if (done) {
    return (
      <div style={{ maxWidth:560, margin:"0 auto", padding:16, animation:"fadeUp .3s ease" }}>
        <div style={{ ...card, textAlign:"center", padding:"40px 24px" }}>
          
          <div style={{ fontSize:17, fontWeight:700, color:"var(--ink)", marginBottom:6 }}>送信しました</div>
          <div style={{ fontSize:13.5, color:"var(--sub)", marginBottom:20, lineHeight:1.6 }}>{isPop ? "担当者に届きました。POPができるまでお待ちください。" : "担当者に届きました。内容を確認して対応します。"}</div>
          <button onClick={reset} style={{ border:"none", background:"var(--fill)", color:"#fff", fontWeight:600, fontSize:15, borderRadius:10, padding:"12px 24px", cursor:"pointer" }}>続けて送信する</button>
        </div>
      </div>
    );
  }

  return (
    <div style={{ maxWidth:560, margin:"0 auto", padding:16, animation:"fadeUp .3s ease" }}>
      <div style={{ fontSize:22, fontWeight:700, color:"var(--ink)", marginBottom:4 }}>お問い合わせ</div>
      <div style={{ fontSize:13.5, color:"var(--sub)", marginBottom:14 }}>POPの作成依頼、アプリや売場へのご要望、質問など、なんでもここからどうぞ。内容は担当者に届きます。</div>
      <div style={{ display:"flex", gap:7, marginBottom:16 }}>
        {["POP作成依頼","ご要望","質問・お問い合わせ"].map(k => {
          const on = kind === k;
          return (
            <button key={k} onClick={() => { setKind(k); setError(""); }}
              style={{ flex:1, border: on ? "2px solid var(--primary)" : "1px solid var(--line)", background: on ? "var(--soft)" : "var(--card)", color: on ? "var(--primary)" : "var(--text)", fontWeight:600, fontSize:12.5, borderRadius:10, padding:"10px 4px", cursor:"pointer", lineHeight:1.3 }}>{k}</button>
          );
        })}
      </div>
      <div style={{ ...card, display:"flex", flexDirection:"column", gap:14 }}>
        <div>
          <div style={lbl}>{isPop ? <>商品名 <span style={{ color:"var(--primary)" }}>*</span></> : "件名（任意）"}</div>
          <input value={product} onChange={e=>setProduct(e.target.value)} placeholder={isPop ? "例：生本まぐろ 中トロ" : "例：魚図鑑に追加してほしい魚がある"} style={inp} />
        </div>
        <div>
          <div style={lbl}>店舗</div>
          <select value={store} onChange={e=>setStore(e.target.value)} style={inp}>
            <option value="">未指定</option>
            {STORES.map(s=><option key={s} value={s}>{s}</option>)}
          </select>
        </div>
        {isPop && <div>
          <div style={lbl}>優先度</div>
          <div style={{ display:"flex", gap:8 }}>
            {["普通","急ぎ"].map(pr=>{
              const on = priority===pr; const urgent = pr==="急ぎ";
              return (
                <button key={pr} onClick={()=>setPriority(pr)}
                  style={{ flex:1, border:`2px solid ${on?(urgent?"#c21a1a":"var(--primary)"):"var(--line)"}`,
                    background: on ? "var(--soft)" : "var(--card)",
                    color: on ? (urgent?"#c21a1a":"var(--primary)") : "var(--sub)", fontWeight:600, fontSize:14, borderRadius:10, padding:"9px", cursor:"pointer" }}>
                  {urgent?"急ぎ":"普通"}
                </button>
              );
            })}
          </div>
        </div>}
        <div>
          <div style={lbl}>{isPop ? "要望・メモ" : <>内容 <span style={{ color:"var(--primary)" }}>*</span></>}</div>
          <textarea value={reason} onChange={e=>setReason(e.target.value)} placeholder={isPop ? "サイズ、訴求ポイント、産地、希望日など" : kind === "ご要望" ? "例：便利機能に◯◯の計算を追加してほしい／売場写真を店舗別に見たい など" : "例：アーカイブの使い方が分からない／パスワードを忘れた など"} rows={isPop ? 3 : 5} style={{ ...inp, resize:"vertical", lineHeight:1.5 }} />

          {/* 添付ファイル */}
          <div style={{ marginTop:12 }}>
            <label style={{ display:"block", position:"relative", overflow:"hidden", border:"1px dashed var(--line)", background: upBusy ? "#f6f6f6" : "var(--card)",
              borderRadius:10, padding:"13px", textAlign:"center", cursor: upBusy ? "default" : "pointer" }}>
              <span style={{ fontSize:13.5, fontWeight:600, color:"var(--sub)" }}>
                {upBusy ? "送っています…" : "＋ ファイルを添付する"}
              </span>
              <span style={{ display:"block", fontSize:12.5, color:"var(--faint)", marginTop:3 }}>
                写真・Excel・PDF・Word・テキストなど（1つ{MAX_MB}MBまで）
              </span>
              <input type="file" multiple disabled={upBusy}
                accept="image/*,.pdf,.xlsx,.xls,.csv,.doc,.docx,.txt,.png,.jpg,.jpeg,.gif,.webp,.bmp,.heic"
                style={{ position:"absolute", inset:0, opacity:0, width:"100%", height:"100%", cursor:"pointer" }}
                onChange={e => { const l = e.target.files; e.target.value = ""; pickFiles(l); }} />
            </label>

            {files.length > 0 && (
              <div style={{ display:"flex", flexDirection:"column", gap:6, marginTop:9 }}>
                {files.map((f, i) => (
                  <div key={i} style={{ display:"flex", alignItems:"center", gap:9, border:"1px solid var(--line)", borderRadius:8, padding:"7px 9px", background:"var(--card, #fff)" }}>
                    {isImg(f)
                      ? <img src={f.url} alt="" style={{ width:38, height:38, objectFit:"cover", borderRadius:8, flexShrink:0, background:"var(--bg)" }} />
                      : <span style={{ width:38, height:38, borderRadius:8, flexShrink:0, background:"var(--bg)", display:"flex", alignItems:"center", justifyContent:"center", fontSize:12.5, fontWeight:700, color:"var(--sub)" }}>
                          {(f.name.split(".").pop() || "").slice(0,4).toUpperCase()}
                        </span>}
                    <span style={{ minWidth:0, flex:1 }}>
                      <span style={{ display:"block", fontSize:12.5, fontWeight:700, color:"var(--ink)", overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{f.name}</span>
                      <span style={{ display:"block", fontSize:12.5, color:"var(--faint)" }}>{fileKB(f.size)}</span>
                    </span>
                    <button onClick={() => setFiles(v => v.filter((_, k) => k !== i))} aria-label={`${f.name}を外す`}
                      style={{ border:"none", background:"transparent", color:"var(--faint)", fontSize:17, fontWeight:700, cursor:"pointer", padding:"0 3px", flexShrink:0 }}>×</button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
        {error && <div style={{ fontSize:13.5, color:"#e01010", fontWeight:700 }}>{error}</div>}
        <button onClick={submit} disabled={busy}
          style={{ border:"none", background:"var(--fill)", color:"#fff", fontWeight:600, fontSize:15, borderRadius:10, padding:"13px", cursor:"pointer", opacity:busy?0.6:1 }}>
          {busy ? "送信中…" : "送信する"}
        </button>
      </div>
    </div>
  );
}

function NoticeAdmin({ onNoticeChange }) {
  const [menuHidden, setMenuHidden] = useState([]);   // メニューで隠すタブ
  const [enabled, setEnabled] = useState(false);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [tipEnabled, setTipEnabled] = useState(false);
  const [tipMessage, setTipMessage] = useState("");
  const [featEnabled, setFeatEnabled] = useState(false);
  const [featMessage, setFeatMessage] = useState("");
  const [featTab, setFeatTab] = useState("");
  const [badgeTab, setBadgeTab] = useState("");
  const [badgeText, setBadgeText] = useState("");
  const [badgeDays, setBadgeDays] = useState(3);
  useEffect(() => {
    api.getNotice().then(n => {
      setEnabled(!!n.enabled); setMessage(n.message || "");
      setTipEnabled(n.tip_enabled !== false); setTipMessage(n.tip_message || "季節のポップや時期が過ぎたポップは「アーカイブ」に収納されます。");
      setFeatEnabled(!!n.feat_enabled); setFeatMessage(n.feat_message || ""); setFeatTab(n.feat_tab || "");
      setBadgeTab(n.badge_tab || ""); setBadgeText(n.badge_text || "");
      setMenuHidden(Array.isArray(n.menu_hidden) ? n.menu_hidden : []);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);
  const save = async () => {
    setSaving(true); setSaved(false);
    try {
      const featVer = featEnabled && featMessage.trim() ? (featMessage.trim().slice(0,40) + "|" + Date.now()) : "";
      const on = !!(badgeTab && badgeText.trim());
      const badgeVer = on ? (badgeText.trim().slice(0,40) + "|" + Date.now()) : "";
      const badgeUntil = on ? new Date(Date.now() + (Number(badgeDays) || 3) * 86400000).toISOString() : null;
      const row = await api.updateNotice({ enabled, message: message.trim(), tip_enabled: tipEnabled, tip_message: tipMessage.trim(), feat_enabled: featEnabled, feat_message: featMessage.trim(), feat_tab: featTab, feat_ver: featVer, badge_tab: badgeTab, badge_text: badgeText.trim(), badge_ver: badgeVer, badge_until: badgeUntil, menu_hidden: menuHidden });
      const next = {
        enabled: row ? !!row.enabled : enabled, message: row ? (row.message || "") : message.trim(),
        tip_enabled: row ? row.tip_enabled !== false : tipEnabled, tip_message: row ? (row.tip_message || "") : tipMessage.trim(),
        feat_enabled: row ? !!row.feat_enabled : featEnabled, feat_message: row ? (row.feat_message || "") : featMessage.trim(),
        feat_tab: row ? (row.feat_tab || "") : featTab, feat_ver: row ? (row.feat_ver || "") : featVer
      };
      if (onNoticeChange) onNoticeChange(next);
      setSaved(true); setTimeout(() => setSaved(false), 2000);
    } catch(e) { alert("保存に失敗しました"); }
    setSaving(false);
  };
  const card = { background:"var(--card, #fff)", borderRadius:12, boxShadow:"var(--card-shadow)", padding:"16px 18px", marginBottom:14 };
  if (loading) return <div style={{ textAlign:"center", color:"var(--faint)", padding:"30px 0" }}>読み込み中…</div>;
  return (
    <div>
      <div style={{ ...card, fontSize:13.5, color:"var(--text)", lineHeight:1.7 }}>
        2種類のお知らせを、ここからON/OFFできます。①は不具合などの<b>緊急のお知らせバナー</b>（メインページ上部に固定）、②はホーム画面下に出る<b>案内メッセージ</b>（タップ／スクロールで消えるもの）です。保存すると、みんなの画面に反映されます。
      </div>
      <div style={card}>
        <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:4 }}>
          <div style={{ fontSize:15, fontWeight:700, color:"var(--ink)" }}>① 緊急お知らせバナーを表示する</div>
          <button onClick={() => setEnabled(v => !v)}
            style={{ width:58, height:32, borderRadius:12, border:"none", cursor:"pointer", position:"relative", background: enabled?"var(--fill)":"#d4d4d8", transition:"background .2s" }}>
            <span style={{ position:"absolute", top:3, left: enabled?29:3, width:26, height:26, borderRadius:"50%", background:"var(--card, #fff)", boxShadow:"0 1px 3px rgba(0,0,0,0.3)", transition:"left .2s" }} />
          </button>
        </div>
        <div style={{ fontSize:12.5, color: enabled?"var(--primary)":"#999", fontWeight:700, marginBottom:14 }}>{enabled ? "● 表示中（保存すると全員に出ます）" : "○ 非表示"}</div>

        <div style={{ fontSize:13.5, fontWeight:600, color:"var(--text)", marginBottom:6 }}>お知らせ文</div>
        <textarea value={message} onChange={e => setMessage(e.target.value)} rows={4}
          placeholder="例：発注バーコードの印刷がWindowsで一部ずれる不具合のため、印刷機能を一時調整中です。MacやiPhoneでは利用できます。"
          style={{ width:"100%", boxSizing:"border-box", padding:"11px 13px", border:"1px solid var(--line)", borderRadius:10, fontSize:14, outline:"none", resize:"vertical", fontFamily:"inherit", lineHeight:1.6 }} />

        <div style={{ fontSize:12.5, color:"var(--sub)", margin:"14px 0 6px", fontWeight:700 }}>プレビュー（実際の見え方）</div>
        <div className="notice-line">
          <span className="notice-dot" aria-hidden="true" />
          <span style={{ whiteSpace:"pre-wrap", color: message.trim() ? "var(--ink)" : "var(--faint)" }}>{message.trim() || "（ここにお知らせ文が表示されます）"}</span>
        </div>

      </div>

      <div style={card}>
        <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:4 }}>
          <div style={{ fontSize:15, fontWeight:700, color:"var(--ink)" }}>② ホーム画面の案内メッセージ</div>
          <button onClick={() => setTipEnabled(v => !v)}
            style={{ width:58, height:32, borderRadius:12, border:"none", cursor:"pointer", position:"relative", background: tipEnabled?"#2f6fed":"#d4d4d8", transition:"background .2s" }}>
            <span style={{ position:"absolute", top:3, left: tipEnabled?29:3, width:26, height:26, borderRadius:"50%", background:"var(--card, #fff)", boxShadow:"0 1px 3px rgba(0,0,0,0.3)", transition:"left .2s" }} />
          </button>
        </div>
        <div style={{ fontSize:12.5, color: tipEnabled?"#2f6fed":"#999", fontWeight:700, marginBottom:6 }}>{tipEnabled ? "● 表示中（ホーム画面下に出ます）" : "○ 非表示"}</div>
        <div style={{ fontSize:12.5, color:"var(--sub)", marginBottom:12, lineHeight:1.6 }}>タップまたはスクロールで自動的に消える、ホーム画面下のフローティング案内です。「季節のポップは自動でアーカイブされます」といった軽い案内に使います。</div>

        <div style={{ fontSize:13.5, fontWeight:600, color:"var(--text)", marginBottom:6 }}>案内文</div>
        <textarea value={tipMessage} onChange={e => setTipMessage(e.target.value)} rows={2}
          placeholder="例：季節のポップや時期が過ぎたポップは「アーカイブ」に収納されます。"
          style={{ width:"100%", boxSizing:"border-box", padding:"11px 13px", border:"1px solid var(--line)", borderRadius:10, fontSize:14, outline:"none", resize:"vertical", fontFamily:"inherit", lineHeight:1.6 }} />

        <div style={{ fontSize:12.5, color:"var(--sub)", margin:"14px 0 6px", fontWeight:700 }}>プレビュー</div>
        <div style={{ display:"flex", alignItems:"center", gap:10, background:"linear-gradient(135deg,#fff3ea,#ffe9d6)", border:"1.5px solid #ffd9bd", borderRadius:12, padding:"12px 14px" }}>
          <span style={{ fontSize:13.5, fontWeight:700, color:"#a8480a", lineHeight:1.5, flex:1 }}>{tipMessage.trim() || "（ここに案内文が表示されます）"}</span>
        </div>
      </div>

      <div style={card}>
        <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:4 }}>
          <div style={{ fontSize:15, fontWeight:700, color:"var(--ink)" }}>③ 新機能のお知らせバナー</div>
          <button onClick={() => setFeatEnabled(v => !v)}
            style={{ width:58, height:32, borderRadius:12, border:"none", cursor:"pointer", position:"relative", background: featEnabled?"#2f6fb0":"#d4d4d8", transition:"background .2s" }}>
            <span style={{ position:"absolute", top:3, left: featEnabled?29:3, width:26, height:26, borderRadius:"50%", background:"var(--card, #fff)", boxShadow:"0 1px 3px rgba(0,0,0,0.3)", transition:"left .2s" }} />
          </button>
        </div>
        <div style={{ fontSize:12.5, color: featEnabled?"#2f6fb0":"#999", fontWeight:700, marginBottom:6 }}>{featEnabled ? "● 表示中（ホーム上部に青のバナー）" : "○ 非表示"}</div>
        <div style={{ fontSize:12.5, color:"var(--sub)", marginBottom:12, lineHeight:1.6 }}>新機能を追加したときに、ホーム画面の上部に出す案内です。各自が一度「×」で閉じると、その人には再表示されません（文面を変えて保存すると、また全員に表示されます）。</div>

        <div style={{ fontSize:13.5, fontWeight:600, color:"var(--text)", marginBottom:6 }}>お知らせ文</div>
        <textarea value={featMessage} onChange={e => setFeatMessage(e.target.value)} rows={2}
          placeholder="例：魚図鑑ができました！旬の魚や売り方のヒントが見られます。"
          style={{ width:"100%", boxSizing:"border-box", padding:"11px 13px", border:"1px solid var(--line)", borderRadius:10, fontSize:14, outline:"none", resize:"vertical", fontFamily:"inherit", lineHeight:1.6 }} />

        <div style={{ fontSize:13.5, fontWeight:600, color:"var(--text)", margin:"14px 0 6px" }}>タップで開く機能（任意）</div>
        <select value={featTab} onChange={e => setFeatTab(e.target.value)}
          style={{ width:"100%", boxSizing:"border-box", padding:"11px 13px", border:"1px solid var(--line)", borderRadius:10, fontSize:14, background:"var(--card, #fff)", fontFamily:"inherit" }}>
          <option value="">（移動しない）</option>
          {TAB_REGISTRY.filter(t => t.key !== "admin").map(t => <option key={t.key} value={t.key}>{t.label}</option>)}
        </select>

        <div style={{ fontSize:12.5, color:"var(--sub)", margin:"14px 0 6px", fontWeight:700 }}>プレビュー</div>
        <div style={{ display:"flex", alignItems:"center", gap:10, background:"linear-gradient(135deg,#2f6fb0,#4a8fd4)", borderRadius:12, padding:"12px 14px" }}>
          <span style={{ fontSize:20 }}>🎉</span>
          <div style={{ minWidth:0, flex:1 }}>
            <div style={{ fontSize:12.5, fontWeight:600, color:"rgba(255,255,255,0.8)" }}>新機能のお知らせ</div>
            <div style={{ fontSize:13.5, fontWeight:600, color:"#fff", lineHeight:1.4 }}>{featMessage.trim() || "（ここにお知らせ文が表示されます）"}</div>
          </div>
          {featTab && <span style={{ fontSize:12.5, fontWeight:600, color:"#2f6fb0", background:"var(--card, #fff)", borderRadius:8, padding:"4px 10px" }}>ひらく</span>}
        </div>
      </div>

      <div style={card}>
        <div style={{ fontSize:15, fontWeight:700, color:"var(--ink)", marginBottom:4 }}>メニューに出すものをえらぶ</div>
        <div style={{ fontSize:12.5, color:"var(--sub)", marginBottom:11, lineHeight:1.6 }}>
          チェックを外すと、メニューから消えます（「管理画面」は常に出ます）
        </div>
        <div style={{ display:"flex", flexDirection:"column", gap:5, marginBottom:22 }}>
          {TAB_REGISTRY.filter(t => t.key !== "admin").map(t => {
            const on = !menuHidden.includes(t.key);
            return (
              <button key={t.key} onClick={() => setMenuHidden(v => on ? v.concat(t.key) : v.filter(x => x !== t.key))}
                aria-pressed={on}
                style={{ display:"flex", alignItems:"center", gap:10, textAlign:"left", width:"100%",
                  border: on ? "1px solid #cfe8d8" : "1px solid var(--line)", background: on ? "#f4faf6" : "#fafafa",
                  borderRadius:8, padding:"9px 11px", cursor:"pointer" }}>
                <span style={{ width:20, height:20, borderRadius:8, flexShrink:0, border: on ? "none" : "1.5px solid var(--line)",
                  background: on ? "#3f9e63" : "var(--card)", display:"flex", alignItems:"center", justifyContent:"center" }}>
                  {on && <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="3.6" strokeLinecap="round" strokeLinejoin="round"><path d="M4 12.5l5 5L20 6.5"/></svg>}
                </span>
                <span style={{ fontSize:17, width:24, textAlign:"center", flexShrink:0, opacity: on ? 1 : 0.4 }}>{t.icon}</span>
                <span style={{ fontSize:13.5, fontWeight:600, color: on ? "var(--ink)" : "var(--faint)", flex:1 }}>{t.label}</span>
                <span style={{ fontSize:12.5, color:"var(--faint)", flexShrink:0 }}>{t.section}</span>
              </button>
            );
          })}
        </div>

        <div style={{ fontSize:15, fontWeight:700, color:"var(--ink)", marginBottom:4 }}>④ 下のボタンに赤い印をつける</div>
        <div style={{ fontSize:12.5, color:"var(--sub)", marginBottom:12, lineHeight:1.6 }}>下のバーのボタンに赤い丸と吹き出しを出します。「カタログにハローデイを追加しました」のように、対応したことを知らせたい時に。一度タップすると消え、指定した日数が過ぎても自動で消えます。</div>

        <div style={{ fontSize:13.5, fontWeight:600, color:"var(--text)", marginBottom:6 }}>どのボタンに付けるか</div>
        <select value={badgeTab} onChange={e => setBadgeTab(e.target.value)}
          style={{ width:"100%", boxSizing:"border-box", padding:"11px 13px", border:"1px solid var(--line)", borderRadius:10, fontSize:14, background:"var(--card, #fff)", fontFamily:"inherit", marginBottom:12 }}>
          <option value="">（付けない）</option>
          <option value="board">一覧</option>
          <option value="catalog">カタログ</option>
          <option value="__more">メニュー</option>
        </select>

        <div style={{ fontSize:13.5, fontWeight:600, color:"var(--text)", marginBottom:6 }}>吹き出しの文言</div>
        <input value={badgeText} onChange={e => setBadgeText(e.target.value)}
          placeholder="例：ハローデイ追加しました！"
          style={{ width:"100%", boxSizing:"border-box", padding:"11px 13px", border:"1px solid var(--line)", borderRadius:10, fontSize:14, outline:"none", fontFamily:"inherit", marginBottom:12 }} />

        <div style={{ fontSize:13.5, fontWeight:600, color:"var(--text)", marginBottom:6 }}>表示する日数</div>
        <div style={{ display:"flex", gap:6, marginBottom:14 }}>
          {[3, 5, 7].map(d => (
            <button key={d} onClick={() => setBadgeDays(d)}
              style={{ flex:1, border: badgeDays===d ? "2px solid var(--primary-soft)" : "1px solid var(--line)", background: badgeDays===d ? "var(--soft)" : "var(--card)", color: badgeDays===d ? "var(--primary)" : "var(--sub)", borderRadius:8, padding:"9px 0", fontSize:13.5, fontWeight:600, cursor:"pointer" }}>{d}日間</button>
          ))}
        </div>

        <div style={{ fontSize:12.5, color:"var(--sub)", marginBottom:6, fontWeight:700 }}>プレビュー</div>
        <div style={{ background:"var(--fill)", borderRadius:12, padding:"22px 14px 12px", display:"flex", justifyContent:"center" }}>
          <div style={{ position:"relative", display:"flex", alignItems:"center", gap:7, background:"var(--card, #fff)", color:"var(--primary-soft)", borderRadius:24, padding:"9px 18px" }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 5.5s2.5-1.5 4.5-1.5S12 5.5 12 5.5v14s-2-1.5-4.5-1.5S3 19.5 3 19.5z"/><path d="M12 5.5s2.5-1.5 4.5-1.5S21 5.5 21 5.5v14s-2-1.5-4.5-1.5S12 19.5 12 19.5z"/></svg>
            <span style={{ fontSize:13.5, fontWeight:600 }}>カタログ</span>
            <span style={{ position:"absolute", top:2, right:10, width:9, height:9, borderRadius:"50%", background:"#e0555f", boxShadow:"0 0 0 2px #fff" }} />
            {badgeText.trim() && (
              <span style={{ position:"absolute", bottom:"calc(100% + 8px)", left:"50%", transform:"translateX(-50%)", background:"#e0555f", color:"#fff", fontSize:12.5, fontWeight:600, borderRadius:8, padding:"6px 11px", whiteSpace:"nowrap" }}>{badgeText.trim()}</span>
            )}
          </div>
        </div>
      </div>

      <button onClick={save} disabled={saving}
        style={{ width:"100%", border:"none", background: saving?"#bbb":(saved?"#2f6fb0":"var(--fill)"), color:"#fff", borderRadius:10, padding:"13px", fontSize:15, fontWeight:600, cursor: saving?"default":"pointer", marginBottom:14 }}>
        {saving ? "保存中…" : saved ? "✓ 保存しました（全員に反映）" : "まとめて保存する"}
      </button>
    </div>
  );
}



// ═══════════ RankingPanel：管理画面内の記録（閲覧数・使った・いいね）═══════════
// 一般メニューには出さない。管理画面にログインした管理者だけが見られる。
// ═══════════ RotateAdmin：画像の向きを直す（表示だけ回す。並び順は変わりません） ═══════════
function RotateAdmin() {
  const [pops, setPops] = useState([]);
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState(null);
  const [msg, setMsg] = useState("");
  const [onlyRotated, setOnlyRotated] = useState(false);

  useEffect(() => {
    let alive = true;
    (async () => {
      try { const d = await api.listAll(); if (alive) setPops(d || []); }
      catch(e) { if (alive) setMsg("読み込みに失敗しました"); }
      finally { if (alive) setLoading(false); }
    })();
    return () => { alive = false; };
  }, []);

  const rotate = async (pop, delta) => {
    const next = (((pop.rotation || 0) + delta) % 360 + 360) % 360;
    setBusyId(pop.id); setMsg("");
    try {
      await api.setRotation(pop.id, next);
      setPops(list => list.map(x => x.id === pop.id ? { ...x, rotation: next } : x));
    } catch(e) { setMsg("保存に失敗しました（パスワードを確認してください）"); }
    finally { setBusyId(null); }
  };

  const shown = onlyRotated ? pops.filter(p => (p.rotation || 0) !== 0) : pops;

  return (
    <div>
      <div style={{ fontSize:12.5, color:"var(--sub)", lineHeight:1.6, marginBottom:10 }}>
        横向きになってしまったポップを、90度ずつ回して直せます。見た目だけを回す方式なので、投稿日は変わらず<b>並び順もそのまま</b>です。
      </div>
      <label style={{ display:"flex", alignItems:"center", gap:7, fontSize:12.5, fontWeight:600, color:"var(--text)", marginBottom:12, cursor:"pointer" }}>
        <input type="checkbox" checked={onlyRotated} onChange={e => setOnlyRotated(e.target.checked)} />
        回転させたものだけ表示
      </label>
      {msg && <div style={{ fontSize:12.5, color:"#b3261e", fontWeight:600, marginBottom:10 }}>{msg}</div>}

      {loading ? (
        <div style={{ textAlign:"center", color:"var(--faint)", padding:"30px 0", fontSize:13.5 }}>読み込み中…</div>
      ) : shown.length === 0 ? (
        <div style={{ textAlign:"center", color:"var(--faint)", padding:"36px 0", fontSize:13.5 }}>該当するポップがありません</div>
      ) : (
        <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill, minmax(132px, 1fr))", gap:10 }}>
          {shown.map(pop => {
            const rot = pop.rotation || 0;
            const side = (rot === 90 || rot === 270);
            return (
              <div key={pop.id} style={{ border:"1px solid var(--line)", borderRadius:10, padding:8, background:"var(--card, #fff)" }}>
                <div style={{ width:"100%", aspectRatio:"1/1", overflow:"hidden", borderRadius:8, background:"var(--chip)", display:"flex", alignItems:"center", justifyContent:"center", marginBottom:7 }}>
                  <img src={pop.image_url} loading="lazy"
                    style={{ maxWidth: side ? "100%" : "100%", maxHeight:"100%", objectFit:"contain", transform: rot ? `rotate(${rot}deg)` : "none", transition:"transform .25s ease" }} />
                </div>
                <div style={{ fontSize:12.5, fontWeight:600, color:"var(--ink)", whiteSpace:"nowrap", overflow:"hidden", textOverflow:"ellipsis", marginBottom:6 }}>{pop.product_name || "（無題）"}</div>
                <div style={{ display:"flex", alignItems:"center", gap:5 }}>
                  <button onClick={() => rotate(pop, -90)} disabled={busyId === pop.id}
                    style={{ flex:1, border:"1px solid var(--line)", background:"var(--card, #fff)", color:"var(--text)", borderRadius:8, padding:"6px 0", fontSize:13.5, fontWeight:700, cursor:"pointer" }} title="左に90度">↺</button>
                  <button onClick={() => rotate(pop, 90)} disabled={busyId === pop.id}
                    style={{ flex:1, border:"1px solid var(--line)", background:"var(--card, #fff)", color:"var(--text)", borderRadius:8, padding:"6px 0", fontSize:13.5, fontWeight:700, cursor:"pointer" }} title="右に90度">↻</button>
                  {rot !== 0 && (
                    <button onClick={() => rotate(pop, -rot)} disabled={busyId === pop.id}
                      style={{ border:"1px solid var(--line)", background:"var(--soft)", color:"var(--primary)", borderRadius:8, padding:"6px 8px", fontSize:12.5, fontWeight:600, cursor:"pointer" }} title="元に戻す">戻す</button>
                  )}
                </div>
                {rot !== 0 && <div style={{ fontSize:12.5, color:"var(--primary-soft)", fontWeight:600, marginTop:5, textAlign:"center" }}>{rot}度</div>}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

// ═══════════ CatalogAdmin：予約カタログの登録 ═══════════
function CatalogAdmin() {
  const STORES = ["グッディー", "イオン", "ゆめタウン", "みしまや", "キヌヤ", "その他"];
  const [list, setList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [ver, setVer] = useState(0);
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState("");
  const NOW_Y = new Date().getFullYear();
  const SEASONS = ["お盆","年末年始","土用の丑","お花見","GW","母の日","父の日","敬老の日","クリスマス","恵方巻","通年"];
  const [form, setForm] = useState({ store:"グッディー", title:"", note:"", kind:"image", url:"", visible:true, season:"お盆", year:NOW_Y, thumb_url:"" });
  const thumbRef = useRef(null);
  const fileRef = useRef(null);

  useEffect(() => {
    let alive = true; setLoading(true);
    (async () => {
      try { const d = await api.listCatalogs(false); if (alive) setList(d || []); }
      catch(e) { if (alive) setMsg("読み込みに失敗しました"); }
      finally { if (alive) setLoading(false); }
    })();
    return () => { alive = false; };
  }, [ver]);

  const setF = (k, v) => setForm(o => ({ ...o, [k]: v }));

  const pickFile = async (e) => {
    const f = e.target.files && e.target.files[0];
    if (!f) return;
    setBusy(true); setMsg("アップロード中…");
    try {
      const url = await api.uploadRaw(f);
      const isImg = /^image\//.test(f.type);
      setForm(o => ({ ...o, url, kind: isImg ? "image" : "pdf", title: o.title || (f.name || "").replace(/\.[^.]+$/, "") }));
      setMsg("アップロードしました。内容を確認して「追加」を押してください");
    } catch(err) { setMsg("アップロードに失敗しました"); }
    finally { setBusy(false); if (fileRef.current) fileRef.current.value = ""; }
  };

  const pickThumb = async (e) => {
    const f = e.target.files && e.target.files[0];
    if (!f) return;
    setBusy(true); setMsg("表紙をアップロード中…");
    try {
      const url = await api.uploadRaw(f);
      setForm(o => ({ ...o, thumb_url: url }));
      setMsg("表紙を登録しました");
    } catch(err) { setMsg("表紙のアップロードに失敗しました"); }
    finally { setBusy(false); if (thumbRef.current) thumbRef.current.value = ""; }
  };

  const add = async () => {
    if (!form.title.trim() || !form.url.trim()) { setMsg("カタログ名とファイル（またはURL）が必要です"); return; }
    setBusy(true); setMsg("");
    try {
      await api.addCatalog({ ...form, title: form.title.trim(), url: form.url.trim(), note: form.note.trim() || null, sort_order: list.length });
      setForm({ store: form.store, title:"", note:"", kind:"image", url:"", visible:true, season: form.season, year: form.year, thumb_url:"" });
      setMsg("追加しました"); setVer(v => v + 1);
    } catch(e) { setMsg("追加に失敗しました"); }
    finally { setBusy(false); }
  };

  const toggle = async (c) => { try { await api.updateCatalog(c.id, { visible: !c.visible }); setVer(v=>v+1); } catch(e) { setMsg("変更に失敗しました"); } };
  const toggleDead = async (c) => {
    const next = c.link_status === "dead" ? "ok" : "dead";
    try { await api.updateCatalog(c.id, { link_status: next, checked_at: new Date().toISOString() }); setVer(v=>v+1); }
    catch(e) { setMsg("変更に失敗しました"); }
  };
  const del = async (c) => {
    if (!window.confirm(`「${c.title}」を削除しますか？`)) return;
    try { await api.deleteCatalog(c.id); setVer(v=>v+1); } catch(e) { setMsg("削除に失敗しました"); }
  };

  const inp = { width:"100%", boxSizing:"border-box", padding:"9px 10px", border:"1px solid var(--line)", borderRadius:9, fontSize:13, outline:"none", background:"var(--card, #fff)", color:"var(--text)" };

  return (
    <div>
      <div style={{ fontSize:12.5, color:"var(--sub)", lineHeight:1.6, marginBottom:12 }}>
        各スーパーの予約カタログを登録します。写真やPDFをアップロードするか、WebカタログのURLを貼ってください。「表示」にしたものが予約カタログのページに並びます。
      </div>

      <div style={{ border:"1px solid var(--line)", borderRadius:12, padding:13, marginBottom:16, background:"var(--card, #fff)" }}>
        <div style={{ fontSize:13.5, fontWeight:700, color:"var(--ink)", marginBottom:10 }}>カタログを追加</div>

        <div style={{ fontSize:12.5, fontWeight:600, color:"var(--sub)", marginBottom:5 }}>スーパー名</div>
        <div style={{ display:"flex", gap:5, flexWrap:"wrap", marginBottom:10 }}>
          {STORES.map(st => (
            <button key={st} onClick={() => setF("store", st)}
              style={{ border: form.store===st ? "2px solid var(--primary-soft)" : "1px solid var(--line)", background:"var(--card, #fff)", color: form.store===st ? "var(--primary)" : "var(--sub)", borderRadius:8, padding:"5px 11px", fontSize:12.5, fontWeight:600, cursor:"pointer" }}>{st}</button>
          ))}
        </div>
        <input value={STORES.includes(form.store) ? "" : form.store} onChange={e => setF("store", e.target.value)} placeholder="上に無ければ入力（例：マルマン）"
          style={{ ...inp, marginBottom:10, fontSize:12.5 }} />

        <div style={{ display:"flex", gap:6, marginBottom:10 }}>
          {[["image","写真"],["pdf","PDF"],["link","リンク"]].map(([k,l]) => (
            <button key={k} onClick={() => setF("kind", k)}
              style={{ flex:1, border: form.kind===k ? "2px solid var(--primary-soft)" : "1px solid var(--line)", background:"var(--card, #fff)", color: form.kind===k ? "var(--primary)" : "var(--sub)", borderRadius:8, padding:"7px 0", fontSize:12.5, fontWeight:600, cursor:"pointer" }}>{l}</button>
          ))}
        </div>

        {form.kind !== "link" && (
          <input ref={fileRef} type="file" accept={form.kind === "image" ? "image/*" : "application/pdf,image/*"} onChange={pickFile} disabled={busy}
            style={{ fontSize:12.5, width:"100%", marginBottom:10 }} />
        )}

        <div style={{ display:"flex", gap:7, marginBottom:9 }}>
          <div style={{ flex:1 }}>
            <div style={{ fontSize:12.5, fontWeight:600, color:"var(--sub)", marginBottom:4 }}>年</div>
            <input value={form.year} onChange={e => setF("year", e.target.value.replace(/[^0-9]/g, ""))} inputMode="numeric" placeholder="2026" style={{ ...inp }} />
          </div>
          <div style={{ flex:2, minWidth:0 }}>
            <div style={{ fontSize:12.5, fontWeight:600, color:"var(--sub)", marginBottom:4 }}>時期</div>
            <select value={form.season} onChange={e => setF("season", e.target.value)} style={{ ...inp, appearance:"auto" }}>
              {SEASONS.map(x => <option key={x} value={x}>{x}</option>)}
            </select>
          </div>
        </div>

        <div style={{ marginBottom:9 }}>
          <div style={{ fontSize:12.5, fontWeight:600, color:"var(--sub)", marginBottom:4 }}>表紙の画像（任意・ページが消えても残ります）</div>
          <input ref={thumbRef} type="file" accept="image/*" onChange={pickThumb} disabled={busy} style={{ fontSize:12.5, width:"100%" }} />
          {form.thumb_url && <img src={form.thumb_url} style={{ width:60, borderRadius:8, marginTop:6, display:"block" }} />}
        </div>

        <input value={form.title} onChange={e => setF("title", e.target.value)} placeholder="カタログ名（例：お歳暮 2026）" style={{ ...inp, marginBottom:8 }} />
        <input value={form.note} onChange={e => setF("note", e.target.value)} placeholder="メモ（例：締切 12/10）" style={{ ...inp, marginBottom:8 }} />
        <input value={form.url} onChange={e => setF("url", e.target.value)} placeholder="URL（ファイルを選ぶと自動で入ります）" style={{ ...inp, marginBottom:11, fontSize:12.5 }} />

        <div style={{ display:"flex", alignItems:"center", gap:10 }}>
          <label style={{ display:"flex", alignItems:"center", gap:6, fontSize:12.5, fontWeight:600, color:"var(--text)", cursor:"pointer" }}>
            <input type="checkbox" checked={form.visible} onChange={e => setF("visible", e.target.checked)} />
            みんなに表示する
          </label>
          <button onClick={add} disabled={busy}
            style={{ marginLeft:"auto", border:"none", background: busy ? "#ccc" : "var(--primary-soft)", color:"#fff", borderRadius:8, padding:"10px 20px", fontSize:13.5, fontWeight:700, cursor: busy ? "default" : "pointer" }}>{busy ? "処理中…" : "追加"}</button>
        </div>
        {msg && <div style={{ fontSize:12.5, color:"var(--sub)", marginTop:9, lineHeight:1.5 }}>{msg}</div>}
      </div>

      <div style={{ fontSize:13.5, fontWeight:700, color:"var(--ink)", marginBottom:9 }}>登録済み（{list.length}）</div>
      {loading ? (
        <div style={{ textAlign:"center", color:"var(--faint)", padding:"26px 0", fontSize:13.5 }}>読み込み中…</div>
      ) : list.length === 0 ? (
        <div style={{ textAlign:"center", color:"var(--faint)", padding:"32px 0", fontSize:13.5 }}>まだ登録がありません</div>
      ) : (
        <div style={{ display:"flex", flexDirection:"column", gap:8 }}>
          {list.map(c => (
            <div key={c.id} style={{ border:"1px solid var(--line)", borderRadius:10, padding:"10px 12px", background:"var(--card, #fff)", opacity: c.visible ? 1 : 0.55, display:"flex", alignItems:"center", gap:10 }}>
              {c.kind === "image"
                ? <img src={c.url} style={{ width:38, height:48, objectFit:"cover", borderRadius:8, flexShrink:0, background:"var(--chip)" }} />
                : <div style={{ width:38, height:48, borderRadius:8, background:"var(--soft)", display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0, color:"var(--primary-soft)", fontSize:17 }}>📄</div>}
              <div style={{ minWidth:0, flex:1 }}>
                <div style={{ fontSize:12.5, fontWeight:700, color:"var(--primary-soft)" }}>{c.store}{c.year ? `　${c.year}${c.season || ""}` : ""}{c.link_status === "dead" ? "　⚠リンク切れ" : ""}</div>
                <div style={{ fontSize:13.5, fontWeight:700, color:"var(--ink)", whiteSpace:"nowrap", overflow:"hidden", textOverflow:"ellipsis" }}>{c.title}</div>
                {c.note && <div style={{ fontSize:12.5, color:"var(--sub)", whiteSpace:"nowrap", overflow:"hidden", textOverflow:"ellipsis" }}>{c.note}</div>}
              </div>
              <div style={{ display:"flex", flexDirection:"column", gap:5, flexShrink:0 }}>
                <button onClick={() => toggle(c)}
                  style={{ border:"1px solid var(--line)", background: c.visible ? "var(--soft)" : "var(--card)", color: c.visible ? "var(--primary)" : "var(--sub)", borderRadius:8, padding:"4px 10px", fontSize:12.5, fontWeight:600, cursor:"pointer" }}>{c.visible ? "表示中" : "非表示"}</button>
                <button onClick={() => toggleDead(c)}
                  style={{ border:"1px solid var(--line)", background: c.link_status === "dead" ? "#fdeaea" : "var(--card)", color: c.link_status === "dead" ? "#b3261e" : "var(--sub)", borderRadius:8, padding:"4px 10px", fontSize:12.5, fontWeight:600, cursor:"pointer" }}>{c.link_status === "dead" ? "切れ中" : "切れ報告"}</button>
                <button onClick={() => del(c)}
                  style={{ border:"1px solid #f0c8c4", background:"var(--card, #fff)", color:"#b3261e", borderRadius:8, padding:"4px 10px", fontSize:12.5, fontWeight:600, cursor:"pointer" }}>削除</button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ═══════════ 名前の見直し：ファイル名のまま上がったポップを集めて、まとめて直す ═══════════
/* 「仮の名前」と見なすもの（実際の投稿から）。当てはまらなければ null。
   - iPhoneの写真の番号     例: D5205761 BC51 418E BC56 3F52FE07D85A
   - AIで作った画像の名前   例: ChatGPT 画像 2026年9月29日 20 26 06 / Gemini_Generated_Image_…
   - PDFのページ            例: page 01
   - カメラ・画面写真の名前 例: IMG_1234 / DSC01234 / スクリーンショット / Screenshot
   - 長い数字・拡張子       例: 1791166022178 / ○○.png
   「BBQ」「FISHWORKS PROJECT」のような英字だけの名前は対象にしない。 */
function 仮の名前(nm) {
  const t = String(nm || "").trim();
  if (!t) return "名前なし";
  if (/^[0-9A-F]{8}[\s_-][0-9A-F]{4}[\s_-][0-9A-F]{4}/i.test(t)) return "写真の番号";
  if (/chatgpt|gemini|dall[\s·-]?e|midjourney|generated|firefly/i.test(t)) return "AI画像の名前";
  if (/^page[\s_-]*\d+$/i.test(t) || /^ページ\s*\d+$/.test(t)) return "PDFのページ";
  if (/^(img|dsc|dscn|pxl|photo|image)[\s_-]?\d+/i.test(t) || /スクリーンショット|screenshot|無題|untitled/i.test(t)) return "写真の名前";
  if (/\d{8,}/.test(t)) return "長い数字";
  if (/\.(png|jpe?g|webp|heic|gif|pdf)$/i.test(t)) return "ファイル名";
  if (/\(\d+\)\s*$/.test(t)) return "コピーの印 (1)";
  if (/[\u0900-\u0DFF\u0E00-\u0FFF]/.test(t)) return "読めない文字";
  return null;
}

function RenameReview({ pops, onRenamed }) {
  const [番号, set番号] = useState("");
  const [通った, set通った] = useState(!!PW_CACHE.delete);
  const [番号Err, set番号Err] = useState("");
  const [新, set新] = useState({});          // id → 入力中の名前
  const [保存中, set保存中] = useState({});
  const [済み, set済み] = useState({});      // この画面で直したもの（一覧から消さずに「直しました」と出す）
  const [アーカイブも, setアーカイブも] = useState(true);

  const 対象 = pops.filter(p => (済み[p.id] || 仮の名前(p.product_name)) && (アーカイブも || !p.archived))
    .sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
  const 残り = 対象.filter(p => !済み[p.id]).length;

  const 確かめる = async () => {
    set番号Err("");
    try {
      const r = await api.verifyPasswordEx("delete", 番号.trim());
      if (r.ok) { set通った(true); set番号(""); }
      else set番号Err(r.locked ? `${api.lockText(r.seconds)}ほど待ってください` : (r.left > 0 ? `番号が違います（あと${r.left}回）` : "番号が違います"));
    } catch (e) { set番号Err("確かめられませんでした"); }
  };
  const 保存 = async (p) => {
    const nm = String(新[p.id] || "").trim();
    if (!nm) return;
    set保存中(v => ({ ...v, [p.id]: true }));
    try {
      await api.renamePop(p.id, nm);
      onRenamed && onRenamed(p.id, nm);
      set済み(v => ({ ...v, [p.id]: true }));
      set新(v => ({ ...v, [p.id]: "" }));
    } catch (e) { alert("直せませんでした：" + (e && e.message ? e.message : "")); }
    finally { set保存中(v => ({ ...v, [p.id]: false })); }
  };

  return (
    <div>
      <div style={{ fontSize:13.5, color:"var(--sub)", lineHeight:1.7, marginBottom:12 }}>
        写真の番号や「ChatGPT 画像…」のように、ファイル名のまま上がったポップを集めています。
        中身の分かる名前（例：真さば 刺身用）にすると、さがすで見つかるようになります。
        いま <b style={{ color:"var(--ink)" }}>{残り}件</b>。
      </div>

      {!通った ? (
        <div style={{ background:"var(--card)", border:"1px solid var(--line)", borderRadius:12, padding:14, marginBottom:14 }}>
          <div style={{ fontSize:13.5, fontWeight:600, color:"var(--ink)", marginBottom:8 }}>名前を直すには、削除と同じ番号を1回だけ入れてください</div>
          <div style={{ display:"flex", gap:8 }}>
            <input type="password" inputMode="numeric" value={番号} onChange={e => set番号(e.target.value)}
              onKeyDown={e => { if (e.key === "Enter") 確かめる(); }}
              style={{ flex:1, minWidth:0, border:"1px solid var(--line)", borderRadius:10, padding:"10px 12px", fontSize:17, background:"var(--bg)", color:"var(--text)" }} />
            <button onClick={確かめる} disabled={!番号.trim()}
              style={{ border:"none", background:"var(--fill)", color:"#fff", borderRadius:10, padding:"0 18px", fontSize:14, fontWeight:600, cursor:"pointer" }}>確かめる</button>
          </div>
          {番号Err && <div style={{ fontSize:12.5, color:"#b3261e", marginTop:6, fontWeight:700 }}>{番号Err}</div>}
        </div>
      ) : null}

      <label style={{ display:"inline-flex", alignItems:"center", gap:6, fontSize:12.5, color:"var(--sub)", marginBottom:10, cursor:"pointer" }}>
        <input type="checkbox" checked={アーカイブも} onChange={e => setアーカイブも(e.target.checked)} /> アーカイブしたものも出す
      </label>

      {対象.length === 0 ? (
        <div style={{ textAlign:"center", padding:"40px 0", color:"var(--sub)", fontSize:14, fontWeight:700 }}>直す必要のある名前はありません</div>
      ) : (
        <div className="rn-grid">
          {対象.map(p => {
            const 理由 = 仮の名前(p.product_name);
            const 直した = !!済み[p.id];
            return (
              <div key={p.id} className={"rn-card" + (直した ? " done" : "")}>
                <img src={p.image_url} alt="" loading="lazy" decoding="async" className="rn-img" />
                <div className="rn-body">
                  <div style={{ display:"flex", gap:5, flexWrap:"wrap", marginBottom:4 }}>
                    {直した ? <span className="rn-tag ok">直しました</span> : <span className="rn-tag">{理由}</span>}
                    {p.archived && <span className="rn-tag gray">アーカイブ</span>}
                    {p.group_name && <span className="rn-tag gray">まとまり：{p.group_name}</span>}
                  </div>
                  <div className="rn-old" title={p.product_name}>{p.product_name}</div>
                  <div style={{ display:"flex", gap:6, marginTop:6 }}>
                    <input value={新[p.id] || ""} placeholder="新しい名前（例：真さば 刺身用）" disabled={!通った || 保存中[p.id]}
                      onChange={e => set新(v => ({ ...v, [p.id]: e.target.value }))}
                      onKeyDown={e => { if (e.key === "Enter" && !e.isComposing) 保存(p); }}
                      style={{ flex:1, minWidth:0, border:"1px solid var(--line)", borderRadius:8, padding:"9px 10px", fontSize:15, background:"var(--bg)", color:"var(--text)" }} />
                    <button onClick={() => 保存(p)} disabled={!通った || 保存中[p.id] || !String(新[p.id] || "").trim()}
                      style={{ border:"none", background:"var(--fill)", color:"#fff", borderRadius:8, padding:"0 14px", fontSize:13.5, fontWeight:600, cursor:"pointer",
                        opacity: (!通った || !String(新[p.id] || "").trim()) ? 0.45 : 1 }}>{保存中[p.id] ? "…" : "直す"}</button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

// ═══════════ ResourceAdmin：資料（PDF/画像/シート/リンク）の管理 ═══════════
/* 資料の絵・色・名は 04-shared にある（店舗支援でも使うため） */

function ResourceAdmin() {
  const KINDS = [
    { k:"pdf",   label:"PDF",       emoji:"📄" },
    { k:"image", label:"画像",      emoji:"🖼" },
    { k:"sheet", label:"スプレッドシート", emoji:"📊" },
    { k:"link",  label:"リンク",    emoji:"🔗" },
  ];
  const [list, setList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [ver, setVer] = useState(0);
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState("");
  const [form, setForm] = useState({ title:"", description:"", kind:"pdf", url:"", emoji:"📄", visible:true });
  const fileRef = useRef(null);

  useEffect(() => {
    let alive = true;
    setLoading(true);
    (async () => {
      try { const d = await api.listResources(false); if (alive) setList(d || []); }
      catch(e) { if (alive) setMsg("読み込みに失敗しました"); }
      finally { if (alive) setLoading(false); }
    })();
    return () => { alive = false; };
  }, [ver]);

  const setF = (k, v) => setForm(o => ({ ...o, [k]: v }));

  const pickFile = async (e) => {
    const f = e.target.files && e.target.files[0];
    if (!f) return;
    setBusy(true); setMsg("アップロード中…");
    try {
      const url = await api.uploadRaw(f);
      const isImg = /^image\//.test(f.type);
      setForm(o => ({ ...o, url, kind: isImg ? "image" : "pdf", emoji: isImg ? "🖼" : "📄", title: o.title || (f.name || "").replace(/\.[^.]+$/, "") }));
      setMsg("アップロードしました。タイトルを確認して「追加」を押してください");
    } catch(err) { setMsg("アップロードに失敗しました：" + (err.message || "")); }
    finally { setBusy(false); if (fileRef.current) fileRef.current.value = ""; }
  };

  const add = async () => {
    if (!form.title.trim() || !form.url.trim()) { setMsg("タイトルとURL（またはファイル）が必要です"); return; }
    setBusy(true); setMsg("");
    try {
      await api.addResource({ ...form, title: form.title.trim(), url: form.url.trim(), sort_order: list.length });
      setForm({ title:"", description:"", kind:"pdf", url:"", emoji:"📄", visible:true });
      setMsg("追加しました");
      setVer(v => v + 1);
    } catch(e) { setMsg("追加に失敗しました：" + (e.message || "")); }
    finally { setBusy(false); }
  };

  const toggleVisible = async (r) => {
    try { await api.updateResource(r.id, { visible: !r.visible }); setVer(v => v + 1); }
    catch(e) { setMsg("変更に失敗しました"); }
  };
  const move = async (r, dir) => {
    const i = list.findIndex(x => x.id === r.id);
    const j = i + dir;
    if (j < 0 || j >= list.length) return;
    try {
      await api.updateResource(list[i].id, { sort_order: j });
      await api.updateResource(list[j].id, { sort_order: i });
      setVer(v => v + 1);
    } catch(e) { setMsg("並び替えに失敗しました"); }
  };
  const del = async (r) => {
    if (!window.confirm(`「${r.title}」を削除しますか？`)) return;
    try { await api.deleteResource(r.id); setVer(v => v + 1); }
    catch(e) { setMsg("削除に失敗しました"); }
  };

  const inp = { width:"100%", boxSizing:"border-box", padding:"9px 10px", border:"1px solid var(--line)", borderRadius:9, fontSize:13, outline:"none", background:"var(--card, #fff)", color:"var(--text)" };

  return (
    <div>
      <div style={{ fontSize:12.5, color:"var(--sub)", lineHeight:1.6, marginBottom:12 }}>
        PDF・画像はここからアップロードできます。スプレッドシートなどはURLを貼り付けてください。「表示」をオンにしたものが、一覧ページの資料カードに並びます。
      </div>

      {/* 追加フォーム */}
      <div style={{ border:"1px solid var(--line)", borderRadius:12, padding:13, marginBottom:16, background:"var(--card, #fff)" }}>
        <div style={{ fontSize:13.5, fontWeight:700, color:"var(--ink)", marginBottom:10 }}>資料を追加</div>

        <div style={{ display:"flex", gap:6, marginBottom:10, flexWrap:"wrap" }}>
          {KINDS.map(k => (
            <button key={k.k} onClick={() => { setF("kind", k.k); setF("emoji", k.emoji); }}
              style={{ border: form.kind===k.k ? "2px solid var(--primary-soft)" : "1px solid var(--line)", background:"var(--card, #fff)", color: form.kind===k.k ? "var(--primary)" : "var(--sub)", borderRadius:8, padding:"6px 11px", fontSize:12.5, fontWeight:600, cursor:"pointer" }}>
              {k.emoji} {k.label}
            </button>
          ))}
        </div>

        {(form.kind === "pdf" || form.kind === "image") && (
          <div style={{ marginBottom:10 }}>
            <input ref={fileRef} type="file" accept={form.kind === "image" ? "image/*" : "application/pdf,image/*"} onChange={pickFile} disabled={busy}
              style={{ fontSize:12.5, width:"100%" }} />
          </div>
        )}

        <input value={form.title} onChange={e => setF("title", e.target.value)} placeholder="タイトル（例：魚売場POP 10シリーズ）" style={{ ...inp, marginBottom:8 }} />
        <input value={form.description} onChange={e => setF("description", e.target.value)} placeholder="説明（任意）" style={{ ...inp, marginBottom:8 }} />
        <input value={form.url} onChange={e => setF("url", e.target.value)} placeholder="URL（ファイルを選ぶと自動で入ります）" style={{ ...inp, marginBottom:10, fontSize:12.5 }} />

        <div style={{ display:"flex", alignItems:"center", gap:10 }}>
          <label style={{ display:"flex", alignItems:"center", gap:6, fontSize:12.5, fontWeight:600, color:"var(--text)", cursor:"pointer" }}>
            <input type="checkbox" checked={form.visible} onChange={e => setF("visible", e.target.checked)} />
            一覧に表示する
          </label>
          <button onClick={add} disabled={busy}
            style={{ marginLeft:"auto", border:"none", background: busy ? "#ccc" : "var(--primary-soft)", color:"#fff", borderRadius:8, padding:"10px 20px", fontSize:13.5, fontWeight:700, cursor: busy ? "default" : "pointer" }}>
            {busy ? "処理中…" : "追加"}
          </button>
        </div>
        {msg && <div style={{ fontSize:12.5, color:"var(--sub)", marginTop:9, lineHeight:1.5 }}>{msg}</div>}
      </div>

      {/* 一覧 */}
      <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:9 }}>
        <div style={{ fontSize:13.5, fontWeight:700, color:"var(--ink)" }}>登録済み（{list.length}）</div>
        <button onClick={() => setVer(v => v + 1)} disabled={loading}
          style={{ border:"1px solid var(--line)", background:"var(--card, #fff)", color:"var(--text)", borderRadius:8, padding:"6px 12px", fontSize:12.5, fontWeight:600, cursor:"pointer" }}>{loading ? "更新中…" : "更新"}</button>
      </div>

      {loading ? (
        <div style={{ textAlign:"center", color:"var(--sub)", padding:"26px 0", fontSize:13.5 }}>読み込み中…</div>
      ) : list.length === 0 ? (
        <div style={{ textAlign:"center", color:"var(--sub)", padding:"32px 0", fontSize:13.5 }}>まだ登録がありません</div>
      ) : (
        <div className="res-grid">
          {list.map((r, i) => (
            <div key={r.id} className="res-card" style={{ opacity: r.visible ? 1 : 0.6 }}>
              <a href={r.url} target="_blank" rel="noopener noreferrer" className="res-thumb" aria-label={r.title + "を開く"}>
                <資料の絵 r={r} />
                <span className="res-kind" style={{ background: 資料の色(r.kind) }}>{資料の名(r.kind)}</span>
                {!r.visible && <span className="res-hidden">非表示</span>}
              </a>
              <div className="res-body">
                <div className="res-title">{r.title}</div>
                {r.description && <div className="res-desc">{r.description}</div>}
              </div>
              <div className="res-ops">
                <button onClick={() => toggleVisible(r)} aria-pressed={!!r.visible}
                  style={{ background: r.visible ? "var(--soft)" : "var(--card)", color: r.visible ? "var(--primary)" : "var(--sub)" }}>
                  {r.visible ? "表示中" : "非表示"}
                </button>
                <button onClick={() => move(r, -1)} disabled={i === 0} aria-label="前へ">←</button>
                <button onClick={() => move(r, 1)} disabled={i === list.length - 1} aria-label="後ろへ">→</button>
                <button onClick={() => del(r)} className="res-del" aria-label="削除">削除</button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ═══════════ DeviceStatsPanel：管理画面内の端末アクセス集計 ═══════════
// 一般メニューには出さない。個人は特定せず、機種・ブラウザの傾向だけを見る。
/* ───────────── 集計の部品（端末・記録で共用） ─────────────
   色は塗り色1つだけ（1系列なので凡例は付けない）。数値はタップで出す。 */
const 日キー = (d) => { const x = new Date(d); return x.getFullYear() + "-" + (x.getMonth()+1) + "-" + x.getDate(); };
const 直近の日 = (n) => {
  const 出 = [], 今 = new Date(); 今.setHours(0,0,0,0);
  for (let i = n - 1; i >= 0; i--) { const d = new Date(今); d.setDate(今.getDate() - i); 出.push(d); }
  return 出;
};
const 曜 = ["日","月","火","水","木","金","土"];
const 期間内 = (rows, 何日前から, 何日前まで) => {
  const 今 = Date.now();
  return rows.filter(r => { const t = 今 - new Date(r.created_at).getTime(); return t >= 何日前まで*86400000 && t < 何日前から*86400000; });
};

function 数字札({ 名, 値, 差, 単位, 注 }) {
  const 上 = 差 > 0, 下 = 差 < 0;
  return (
    <div style={{ flex:"1 1 0", minWidth:0, background:"var(--card)", borderRadius:12, padding:"11px 12px", boxShadow:"var(--card-shadow)" }}>
      <div style={{ fontSize:12, fontWeight:600, color:"var(--sub)", whiteSpace:"nowrap" }}>{名}</div>
      <div style={{ fontSize:24, fontWeight:700, color:"var(--ink)", lineHeight:1.15, marginTop:3, fontVariantNumeric:"tabular-nums" }}>
        {値}<span style={{ fontSize:12.5, fontWeight:600, color:"var(--sub)", marginLeft:2 }}>{単位}</span>
      </div>
      {差 != null && (
        <div style={{ fontSize:12, fontWeight:600, marginTop:2, color: 上 ? "var(--ink)" : "var(--sub)" }}>
          <span style={{ fontWeight:700, color:"var(--sub)" }}>{注 || "先週より "}</span>{上 ? "▲" : 下 ? "▼" : "±"}{Math.abs(差)}
        </div>
      )}
    </div>
  );
}

function 見出し({ children, 補 }) {
  return (
    <div style={{ display:"flex", alignItems:"baseline", gap:8, margin:"20px 0 9px" }}>
      <div style={{ fontSize:14, fontWeight:700, color:"var(--ink)" }}>{children}</div>
      {補 && <div style={{ fontSize:12, color:"var(--sub)" }}>{補}</div>}
    </div>
  );
}

// 日ごとの縦棒。押した棒の値を上に出す。
function 日別棒({ rows, 日数, 単位 }) {
  const [選, set選] = useState(null);
  const 日 = 直近の日(日数);
  const 数 = {}; rows.forEach(r => { const k = 日キー(r.created_at); 数[k] = (数[k] || 0) + 1; });
  const 値 = 日.map(d => 数[日キー(d)] || 0);
  const 最大 = Math.max(1, ...値);
  const 合計 = 値.reduce((a, b) => a + b, 0);
  const i = 選 == null ? null : 選;
  const 表示 = i == null ? `${日数}日で ${合計}${単位}・最多 ${最大}${単位}/日` : `${日[i].getMonth()+1}/${日[i].getDate()}（${曜[日[i].getDay()]}） ${値[i]}${単位}`;
  return (
    <div style={{ background:"var(--card)", borderRadius:12, padding:"12px 12px 10px", boxShadow:"var(--card-shadow)" }}>
      <div style={{ fontSize:12.5, fontWeight:600, color: i == null ? "var(--sub)" : "var(--ink)", marginBottom:8, minHeight:18 }}>{表示}</div>
      <div style={{ display:"flex", alignItems:"flex-end", gap:2, height:96, borderBottom:"1px solid var(--line)" }}>
        {値.map((v, k) => (
          <button key={k} onClick={() => set選(選 === k ? null : k)} title={`${日[k].getMonth()+1}/${日[k].getDate()} ${v}${単位}`}
            aria-label={`${日[k].getMonth()+1}月${日[k].getDate()}日 ${v}${単位}`}
            style={{ flex:"1 1 0", minWidth:0, height:"100%", border:"none", padding:0, background:"transparent", cursor:"pointer",
              display:"flex", alignItems:"flex-end" }}>
            <span style={{ display:"block", width:"100%", height: v ? `${Math.max(4, v/最大*100)}%` : 0,
              background:"var(--fill)", borderRadius:"4px 4px 0 0",
              opacity: i == null || i === k ? 1 : .35, transition:"opacity .15s" }} />
          </button>
        ))}
      </div>
      <div style={{ display:"flex", justifyContent:"space-between", fontSize:10.5, color:"var(--sub)", marginTop:4, fontWeight:700 }}>
        <span>{日[0].getMonth()+1}/{日[0].getDate()}</span>
        <span>{日[Math.floor(日数/2)].getMonth()+1}/{日[Math.floor(日数/2)].getDate()}</span>
        <span>今日</span>
      </div>
    </div>
  );
}

// 曜日 × 時間帯。濃いほど多い（1色の濃淡）。
function 時間帯の地図({ rows }) {
  const [選, set選] = useState(null);
  const 帯 = [[6,"6"],[8,"8"],[10,"10"],[12,"12"],[14,"14"],[16,"16"],[18,"18"],[20,"20"]];
  const 帯番 = (h) => { if (h < 6) return -1; return Math.min(7, Math.floor((h - 6) / 2)); };
  const 表 = Array.from({ length:7 }, () => Array(8).fill(0));
  let 夜 = 0;
  rows.forEach(r => { const d = new Date(r.created_at); const b = 帯番(d.getHours()); if (b < 0) 夜++; else 表[d.getDay()][b]++; });
  const 最大 = Math.max(1, ...表.flat());
  const 順 = [1,2,3,4,5,6,0];  // 月曜はじまり
  return (
    <div style={{ background:"var(--card)", borderRadius:12, padding:"12px", boxShadow:"var(--card-shadow)" }}>
      <div style={{ fontSize:12.5, fontWeight:600, color: 選 ? "var(--ink)" : "var(--sub)", marginBottom:8, minHeight:18 }}>
        {選 ? `${曜[選[0]]}曜 ${帯[選[1]][0]}〜${帯[選[1]][0]+2}時 … ${表[選[0]][選[1]]}件` : "濃いほど多く使われています。マスを押すと件数が出ます"}
      </div>
      <div style={{ display:"grid", gridTemplateColumns:"22px repeat(8, 1fr)", gap:2 }}>
        <span />
        {帯.map(([, l]) => <span key={l} style={{ fontSize:10, color:"var(--sub)", textAlign:"center", fontWeight:700 }}>{l}</span>)}
        {順.map(w => (
          <React.Fragment key={w}>
            <span style={{ fontSize:12, color:"var(--sub)", fontWeight:600, alignSelf:"center" }}>{曜[w]}</span>
            {表[w].map((v, b) => (
              <button key={b} onClick={() => set選(選 && 選[0]===w && 選[1]===b ? null : [w, b])}
                title={`${曜[w]} ${帯[b][0]}時台 ${v}件`} aria-label={`${曜[w]}曜 ${帯[b][0]}時から ${v}件`}
                style={{ height:24, border: 選 && 選[0]===w && 選[1]===b ? "2px solid var(--ink)" : "none", borderRadius:4, padding:0, cursor:"pointer",
                  background: v ? "var(--fill)" : "var(--chip)", opacity: v ? (0.18 + 0.82 * v / 最大) : 1 }} />
            ))}
          </React.Fragment>
        ))}
      </div>
      {夜 > 0 && <div style={{ fontSize:12, color:"var(--sub)", marginTop:7 }}>※ 6時より前の利用 {夜}件 は表に入れていません</div>}
    </div>
  );
}

// 横棒。名前と数字は文字色、棒だけ塗り色。
function 横棒({ items, 単位, 上限 }) {
  const 並 = items.slice(0, 上限 || 8);
  const 最大 = Math.max(1, ...並.map(x => x[1]));
  const 合計 = items.reduce((a, x) => a + x[1], 0);
  if (!並.length) return <div style={{ fontSize:12.5, color:"var(--sub)", padding:"10px 0" }}>まだ記録がありません</div>;
  return (
    <div style={{ background:"var(--card)", borderRadius:12, padding:"12px 13px 4px", boxShadow:"var(--card-shadow)" }}>
      {並.map(([名, n]) => (
        <div key={名} style={{ marginBottom:10 }}>
          <div style={{ display:"flex", justifyContent:"space-between", fontSize:12.5, fontWeight:600, color:"var(--ink)", marginBottom:4 }}>
            <span style={{ overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{名}</span>
            <span style={{ fontVariantNumeric:"tabular-nums", flexShrink:0, marginLeft:8 }}>{n}{単位}<span style={{ color:"var(--sub)", fontWeight:700 }}>（{合計 ? Math.round(n/合計*100) : 0}%）</span></span>
          </div>
          <div style={{ height:8, background:"var(--chip)", borderRadius:4, overflow:"hidden" }}>
            <div style={{ height:"100%", width:`${n/最大*100}%`, background:"var(--fill)", borderRadius:4 }} />
          </div>
        </div>
      ))}
      {items.length > 並.length && <div style={{ fontSize:12, color:"var(--sub)", marginBottom:8 }}>ほか {items.length - 並.length}件</div>}
    </div>
  );
}

const 数える = (arr, f) => { const m = {}; arr.forEach(r => { const k = f(r); if (k) m[k] = (m[k] || 0) + 1; }); return Object.entries(m).sort((a, b) => b[1] - a[1]); };

/* ───────────── 端末：いつ・何で使われているか ───────────── */
function DeviceStatsPanel() {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [ver, setVer] = useState(0);
  const [日数, set日数] = useState(14);
  const [機能, set機能] = useState([]);

  useEffect(() => {
    let alive = true;
    setLoading(true);
    (async () => {
      try { const d = await api.listDeviceVisits(1500); if (alive) setRows(d || []); }
      catch(e) {}
      try { const f = await api.listFeatureUses(90); if (alive) set機能(f || []); }
      catch(e) { if (alive) set機能([]); }
      finally { if (alive) setLoading(false); }
    })();
    return () => { alive = false; };
  }, [ver]);

  const 今日 = 期間内(rows, 1, 0).filter(r => 日キー(r.created_at) === 日キー(Date.now())).length;
  const 今週 = 期間内(rows, 7, 0).length, 先週 = 期間内(rows, 14, 7).length;
  const 今月 = 期間内(rows, 30, 0).length;
  const 対象 = 期間内(rows, 日数, 0);

  return (
    <div>
      <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", gap:10, marginBottom:12 }}>
        <div style={{ fontSize:12.5, color:"var(--sub)", lineHeight:1.7 }}>
          アプリを開いた端末の記録です。同じ端末は1日1回まで数えます。誰が使ったかは記録していません。
        </div>
        <button onClick={() => setVer(v => v + 1)} disabled={loading}
          style={{ flexShrink:0, border:"1px solid var(--line)", background:"var(--card)", color:"var(--text)", borderRadius:8, padding:"7px 13px", fontSize:12.5, fontWeight:600, cursor:"pointer" }}>
          {loading ? "…" : "更新"}
        </button>
      </div>
      {loading ? (
        <div style={{ textAlign:"center", color:"var(--sub)", padding:"30px 0", fontSize:13.5 }}>読み込み中…</div>
      ) : rows.length === 0 ? (
        <div style={{ textAlign:"center", color:"var(--sub)", padding:"40px 0", fontSize:13.5 }}>まだ記録がありません。</div>
      ) : (
        <>
          <div style={{ display:"flex", gap:8 }}>
            <数字札 名="今日" 値={今日} 単位="台" />
            <数字札 名="この7日" 値={今週} 単位="台" 差={今週 - 先週} />
            <数字札 名="この30日" 値={今月} 単位="台" />
          </div>

          <見出し 補="のべ台数">毎日の利用</見出し>
          <div style={{ display:"flex", gap:6, marginBottom:8 }}>
            {[14, 30, 90].map(d => (
              <button key={d} onClick={() => set日数(d)} aria-pressed={日数 === d}
                style={{ border: 日数 === d ? "2px solid var(--primary)" : "1px solid var(--line)", background: 日数 === d ? "var(--soft)" : "var(--card)",
                  color: 日数 === d ? "var(--primary)" : "var(--text)", borderRadius:8, padding:"6px 12px", fontSize:12.5, fontWeight:600, cursor:"pointer" }}>
                {d === 90 ? "3か月" : d + "日"}
              </button>
            ))}
          </div>
          <日別棒 rows={対象} 日数={日数} 単位="台" />

          <見出し 補={`直近${日数}日`}>使われる時間帯</見出し>
          <時間帯の地図 rows={対象} />

          <見出し 補={`直近${日数}日`}>機種</見出し>
          <横棒 items={数える(対象, r => r.platform)} 単位="台" />
          <見出し 補={`直近${日数}日`}>ブラウザ</見出し>
          <横棒 items={数える(対象, r => r.browser)} 単位="台" />

          {(() => {
            // 10/2 から記録している項目。それより前の行は空欄なので、記録のある行だけで数える
            const 新 = 対象.filter(r => r.launch);
            const 機能対象 = 期間内(機能, 日数, 0);
            const 名前 = (f) => {
              if (f.startsWith("画面:")) {
                const k = f.slice(3);
                if (k === "board") return "一覧";
                const t = (typeof TAB_REGISTRY !== "undefined" ? TAB_REGISTRY : []).find(x => x.key === k);
                return t ? t.label : k;
              }
              return f;
            };
            const 幅 = (w) => !w ? null : w < 600 ? "スマホ（〜599px）" : w < 1024 ? "タブレット（600〜1023px）" : "PC（1024px〜）";
            return (
              <>
                <見出し 補={`直近${日数}日・何が、だけ数えています`}>よく使われる機能</見出し>
                {機能対象.length
                  ? <横棒 items={数える(機能対象, f => 名前(f.feature))} 単位="回" 上限={12} />
                  : <div style={{ fontSize:12.5, color:"var(--sub)", padding:"4px 0" }}>10/2 から記録を始めました。使われると、ここに出ます。</div>}

                <見出し 補={新.length ? `記録のある${新.length}台` : "10/2 から記録"}>どこから来たか</見出し>
                {新.length ? <横棒 items={数える(新, r => r.source)} 単位="台" /> : <div style={{ fontSize:12.5, color:"var(--sub)", padding:"4px 0" }}>まだ記録がありません。</div>}

                <見出し 補={新.length ? `記録のある${新.length}台` : "10/2 から記録"}>ホーム画面か、ブラウザか</見出し>
                {新.length ? <横棒 items={数える(新, r => r.launch === "アプリ" ? "ホーム画面のアプリ" : "ブラウザ")} 単位="台" /> : <div style={{ fontSize:12.5, color:"var(--sub)", padding:"4px 0" }}>まだ記録がありません。</div>}

                <見出し 補={新.length ? `記録のある${新.length}台` : "10/2 から記録"}>画面の大きさ</見出し>
                {新.length ? <横棒 items={数える(新, r => 幅(r.screen_w))} 単位="台" /> : <div style={{ fontSize:12.5, color:"var(--sub)", padding:"4px 0" }}>まだ記録がありません。</div>}

                <見出し 補={新.length ? `記録のある${新.length}台` : "10/2 から記録"}>部門</見出し>
                {新.length ? <横棒 items={数える(新, r => r.dept === "produce" ? "青果" : r.dept === "fish" ? "鮮魚" : null)} 単位="台" /> : <div style={{ fontSize:12.5, color:"var(--sub)", padding:"4px 0" }}>まだ記録がありません。</div>}
              </>
            );
          })()}

          <div style={{ fontSize:12, color:"var(--sub)", lineHeight:1.8, marginTop:16 }}>
            ※ 店舗別の集計は出していません。これまでの記録は、どの店で開いても「北部店」として残っていたためです。
          </div>
        </>
      )}
    </div>
  );
}

/* ───────────── 記録：何が見られているか（一覧の上にのせる要約） ───────────── */
function ViewInsights({ pops, views }) {
  const [日数, set日数] = useState(14);
  const 公開 = pops.filter(p => !p.archived);
  const 名簿 = {}; pops.forEach(p => { 名簿[p.id] = p; });
  const 自部門 = views.filter(v => 名簿[v.pop_id]);           // いまの部門のポップだけ
  const 今週 = 期間内(自部門, 7, 0).length, 先週 = 期間内(自部門, 14, 7).length;
  const 対象 = 期間内(自部門, 日数, 0);
  const 見られた = new Set(期間内(自部門, 30, 0).map(v => v.pop_id));
  const 二週前 = Date.now() - 14 * 86400000;
  const 眠り = 公開.filter(p => !見られた.has(p.id) && new Date(p.created_at).getTime() < 二週前).length;

  return (
    <div style={{ marginBottom:18 }}>
      <div style={{ display:"flex", gap:8 }}>
        <数字札 名="この7日の閲覧" 値={今週} 単位="回" 差={今週 - 先週} />
        <数字札 名="30日で見られた" 値={見られた.size} 単位="枚" />
        <数字札 名="眠っている" 値={眠り} 単位="枚" />
      </div>
      <div style={{ fontSize:12, color:"var(--sub)", marginTop:6, lineHeight:1.7 }}>
        「眠っている」は、公開中・投稿から2週間以上・30日間開かれていないもの。下の順位の「眠っている」から整理できます。
      </div>

      <見出し 補="のべ回数">毎日の閲覧</見出し>
      <div style={{ display:"flex", gap:6, marginBottom:8 }}>
        {[14, 30, 90].map(d => (
          <button key={d} onClick={() => set日数(d)} aria-pressed={日数 === d}
            style={{ border: 日数 === d ? "2px solid var(--primary)" : "1px solid var(--line)", background: 日数 === d ? "var(--soft)" : "var(--card)",
              color: 日数 === d ? "var(--primary)" : "var(--text)", borderRadius:8, padding:"6px 12px", fontSize:12.5, fontWeight:600, cursor:"pointer" }}>
            {d === 90 ? "3か月" : d + "日"}
          </button>
        ))}
      </div>
      <日別棒 rows={対象} 日数={日数} 単位="回" />

      <見出し 補={`直近${日数}日`}>よく見られるジャンル</見出し>
      <横棒 items={数える(対象, v => (名簿[v.pop_id] && 名簿[v.pop_id].genre) || "未分類")} 単位="回" />

      <見出し 補={`直近${日数}日・投稿した店`}>どの店のポップが見られているか</見出し>
      <横棒 items={数える(対象, v => 名簿[v.pop_id] && 名簿[v.pop_id].store_name)} 単位="回" />
    </div>
  );
}

function RankingPanel({ onCreateFromPop }) {
  const [pops, setPops] = useState([]);
  const [loading, setLoading] = useState(true);
  const [metric, setMetric] = useState("recent");
  const [sel, setSel] = useState(null);
  const [ver, setVer] = useState(0);
  const [recent, setRecent] = useState({});     // pop_id -> 回数
  const [views, setViews] = useState([]);       // 直近90日の閲覧（pop_id, created_at）
  const [days, setDays] = useState(3);

  useEffect(() => {
    let alive = true;
    setLoading(true);
    (async () => {
      try { const d = await api.listActive(); if (alive) setPops(d); }
      catch(e) {}
      try {
        const v = await api.listRecentViews(90);
        if (alive) {
          setViews(v || []);
          const 境 = Date.now() - days * 86400000;
          const m = {};
          (v || []).forEach(x => { if (new Date(x.created_at).getTime() >= 境) m[x.pop_id] = (m[x.pop_id] || 0) + 1; });
          setRecent(m);
        }
      } catch(e) { if (alive) setRecent({}); }
      finally { if (alive) setLoading(false); }
    })();
    return () => { alive = false; };
  }, [ver, days]);

  // 急上昇：この7日と、その前の7日の差
  const 週 = {}, 前週 = {};
  views.forEach(v => { const t = Date.now() - new Date(v.created_at).getTime();
    if (t < 7*86400000) 週[v.pop_id] = (週[v.pop_id] || 0) + 1;
    else if (t < 14*86400000) 前週[v.pop_id] = (前週[v.pop_id] || 0) + 1; });
  // 眠っている：公開中・投稿から2週間以上・30日見られていない。古い順
  const 見30 = new Set(views.filter(v => Date.now() - new Date(v.created_at).getTime() < 30*86400000).map(v => v.pop_id));
  const 眠り = pops.filter(p => !p.archived && !見30.has(p.id) && Date.now() - new Date(p.created_at).getTime() > 14*86400000)
    .sort((a, b) => new Date(a.created_at) - new Date(b.created_at));
  const [片付け中, set片付け中] = useState("");
  const 寝かせる = async (p) => {
    if (!confirm(`「${p.product_name}」をアーカイブへ移します。よろしいですか？\n（アーカイブからいつでも戻せます）`)) return;
    set片付け中(p.id);
    try { await api.setArchivedMany([p.id], true); setPops(ps => ps.map(x => x.id === p.id ? { ...x, archived:true } : x)); }
    catch(e) { alert("移せませんでした。管理画面に入り直してから試してください"); }
    finally { set片付け中(""); }
  };
  const METRICS = [
    { key:"recent", label:"最近", get: p => recent[p.id] || 0, unit:"回" },
    { key:"view", label:"閲覧数", get: p => p.view_count || 0, unit:"回" },
    { key:"used", label:"使った", get: p => p.used_count || 0, unit:"回" },
    { key:"like", label:"いいね", get: p => p.likes || 0, unit:"" },
    { key:"rise", label:"急上昇", get: p => (週[p.id] || 0) - (前週[p.id] || 0), unit:"回増" },
    { key:"cold", label:"眠っている", get: () => 0, unit:"" },
  ];
  const m = METRICS.find(x => x.key === metric);
  const ranked = [...pops].filter(p => m.get(p) > 0).sort((a, b) => m.get(b) - m.get(a));
  const totals = METRICS.reduce((acc, x) => { acc[x.key] = pops.reduce((n, p) => n + x.get(p), 0); return acc; }, {});
  const rankStyle = (i) => i === 0 ? { bg:"#f7b733", fg:"#fff" } : i === 1 ? { bg:"#b9c2cc", fg:"#fff" } : i === 2 ? { bg:"#c98a5a", fg:"#fff" } : { bg:"var(--chip)", fg:"var(--sub)" };

  return (
    <div>
      <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:10 }}>
        <div style={{ fontSize:12.5, color:"var(--sub)", lineHeight:1.6 }}>ポップの閲覧・使った回数・いいねの記録です。<br/>「最近」は直近{days}日でよく見られたポップです。</div>
        <button onClick={() => setVer(v => v + 1)} disabled={loading}
          style={{ flexShrink:0, border:"1px solid var(--line)", background:"var(--card, #fff)", color:"var(--text)", borderRadius:8, padding:"7px 13px", fontSize:12.5, fontWeight:600, cursor: loading?"default":"pointer" }}>{loading ? "更新中…" : "更新"}</button>
      </div>

      {!loading && <ViewInsights pops={pops} views={views} />}
      <div style={{ fontSize:14, fontWeight:700, color:"var(--ink)", margin:"4px 0 9px" }}>ポップごとの順位</div>

      {metric === "recent" && (
        <div style={{ display:"flex", gap:6, marginBottom:10 }}>
          {[3,7,30].map(d => (
            <button key={d} onClick={() => setDays(d)}
              style={{ border: days===d ? "2px solid var(--primary-soft)" : "1px solid var(--line)", background: days===d ? "var(--soft)" : "var(--card)", color: days===d ? "var(--primary)" : "var(--sub)", borderRadius:999, padding:"5px 14px", fontSize:12.5, fontWeight:600, cursor:"pointer" }}>
              {d === 30 ? "1か月" : d + "日間"}
            </button>
          ))}
        </div>
      )}

      <div style={{ display:"grid", gridTemplateColumns:"repeat(3, 1fr)", gap:7, marginBottom:12 }}>
        {METRICS.map(x => (
          <button key={x.key} onClick={() => setMetric(x.key)}
            style={{ flex:1, border: metric === x.key ? "2px solid var(--primary)" : "1px solid var(--line)", borderRadius:10, padding:"9px 6px", cursor:"pointer",
              background: metric === x.key ? "var(--soft)" : "var(--card)", color: metric === x.key ? "var(--primary)" : "var(--text)" }}>
            <div style={{ fontSize:13.5, fontWeight:600 }}>{x.label}</div>
            <div style={{ fontSize:12.5, fontWeight:700, opacity:0.75, marginTop:2 }}>
              {x.key === "cold" ? `${眠り.length}枚` : x.key === "rise" ? `${pops.filter(p => x.get(p) > 0).length}枚` : `計 ${totals[x.key]}`}
            </div>
          </button>
        ))}
      </div>

      {loading ? (
        <div>{[0,1,2,3,4].map(i => (
          <div key={i} style={{ display:"flex", gap:11, alignItems:"center", background:"var(--card, #fff)", border:"1px solid var(--line)", borderRadius:12, padding:"10px 12px", marginBottom:9 }}>
            <div className="sk" style={{ width:34, height:34, borderRadius:8 }} />
            <div className="sk" style={{ width:56, height:56, borderRadius:8 }} />
            <div style={{ flex:1 }}><div className="sk" style={{ width:"70%", height:13, borderRadius:8 }} /><div className="sk" style={{ width:"40%", height:11, borderRadius:8, marginTop:7 }} /></div>
          </div>
        ))}</div>
      ) : metric === "cold" ? (
        眠り.filter(p => !p.archived).length === 0 ? (
          <div style={{ textAlign:"center", color:"var(--sub)", padding:"36px 0", fontSize:13.5, lineHeight:1.8 }}>眠っているポップはありません。</div>
        ) : (
          <div>
            <div style={{ fontSize:12.5, color:"var(--sub)", lineHeight:1.8, marginBottom:10 }}>
              公開中で、投稿から2週間以上たち、30日間だれにも開かれていないものです。古い順。<br />
              売場で使い終わったものは、アーカイブへ移すと一覧がすっきりします（いつでも戻せます）。
            </div>
            {眠り.filter(p => !p.archived).map(p => {
              const 日 = Math.floor((Date.now() - new Date(p.created_at).getTime()) / 86400000);
              return (
                <div key={p.id} style={{ display:"flex", gap:11, alignItems:"center", background:"var(--card)", borderRadius:12, padding:"9px 10px", marginBottom:8, boxShadow:"var(--card-shadow)" }}>
                  <img src={p.image_url} alt="" loading="lazy" onClick={() => setSel(p)}
                    style={{ width:52, height:52, objectFit:"cover", borderRadius:8, background:"var(--mat)", flexShrink:0, cursor:"pointer" }} />
                  <div style={{ flex:1, minWidth:0, cursor:"pointer" }} onClick={() => setSel(p)}>
                    <div style={{ fontSize:13.5, fontWeight:600, color:"var(--ink)", overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{p.product_name}</div>
                    <div style={{ fontSize:12, color:"var(--sub)", marginTop:2 }}>{[p.genre, p.store_name].filter(Boolean).join(" · ")}　投稿から{日}日</div>
                  </div>
                  <button onClick={() => 寝かせる(p)} disabled={片付け中 === p.id}
                    style={{ flexShrink:0, border:"1px solid var(--line)", background:"var(--card)", color:"var(--text)", borderRadius:8,
                      padding:"8px 10px", fontSize:12.5, fontWeight:600, cursor:"pointer", fontFamily:"inherit" }}>
                    {片付け中 === p.id ? "移しています…" : "アーカイブへ"}
                  </button>
                </div>
              );
            })}
          </div>
        )
      ) : ranked.length === 0 ? (
        <div style={{ textAlign:"center", color:"var(--faint)", padding:"40px 0", fontSize:13.5, lineHeight:1.8 }}>まだ記録がありません。<br/>ポップが見られる・使われると、ここに順位が並びます。</div>
      ) : ranked.map((p, i) => {
        const rs = rankStyle(i);
        return (
          <div key={p.id} onClick={() => setSel(p)}
            style={{ display:"flex", gap:11, alignItems:"center", background:"var(--card, #fff)", border: i < 3 ? "1.5px solid " + rs.bg : "1px solid var(--line)", borderRadius:12, padding:"10px 12px", marginBottom:9, cursor:"pointer" }}>
            <div style={{ width:34, height:34, borderRadius:8, background:rs.bg, color:rs.fg, display:"flex", alignItems:"center", justifyContent:"center", fontSize: i < 3 ? 16 : 13, fontWeight:700, flexShrink:0 }}>{i + 1}</div>
            <img src={p.image_url} loading="lazy" style={{ width:56, height:56, objectFit:"cover", borderRadius:8, flexShrink:0, border:"1px solid var(--line)" }} />
            <div style={{ minWidth:0, flex:1 }}>
              <div style={{ fontSize:14, fontWeight:700, color:"var(--ink)", overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{p.product_name}</div>
              <div style={{ fontSize:12.5, color:"var(--sub)", marginTop:2 }}>{p.store_name}{p.author ? `　·　${p.author}` : ""}</div>
            </div>
            <div style={{ textAlign:"right", flexShrink:0 }}>
              <div style={{ fontSize:17, fontWeight:700, color: i < 3 ? "var(--primary)" : "var(--ink)", lineHeight:1 }}>{m.get(p)}</div>
              <div style={{ fontSize:12.5, color:"var(--faint)", fontWeight:700 }}>{m.label}{m.unit}</div>
            </div>
          </div>
        );
      })}

      {sel && <PopDetail pop={sel} onClose={() => setSel(null)}
        navList={ranked} onNav={setSel}
        onDelete={id => { setPops(ps => ps.filter(x => x.id !== id)); setSel(null); }}
        onLiked={(id, likes) => setPops(ps => ps.map(x => x.id === id ? { ...x, likes } : x))}
        onCreateFromPop={onCreateFromPop}
      />}
    </div>
  );
}

// ポップの縦横をまとめて測る（並べ方を最初から正しくするため・一度だけでよい）
function DimsBackfill() {
  const [st, setSt] = useState({ busy:false, done:0, total:0, msg:"" });
  const run = async () => {
    setSt({ busy:true, done:0, total:0, msg:"まだ測っていないものを探しています…" });
    try {
      const all = await api.listAll();
      const todo = (all || []).filter(p => !p.img_w && p.image_url);
      if (!todo.length) { setSt({ busy:false, done:0, total:0, msg:"すべて測り終わっています" }); return; }
      let n = 0;
      for (const p of todo) {
        const d = await api.measureImage(p.image_url);
        if (d && d.w && d.h) await api.setPopDims(p.id, d.w, d.h);
        n++;
        if (n % 5 === 0 || n === todo.length) setSt({ busy:true, done:n, total:todo.length, msg:"" });
      }
      setSt({ busy:false, done:n, total:todo.length, msg:`${n}件を測りました。一覧を開き直すと反映されます` });
    } catch(e) { setSt({ busy:false, done:0, total:0, msg:"うまくいきませんでした" }); }
  };
  return (
    <div style={{ background:"var(--card, #fff)", border:"1px solid var(--line)", borderRadius:12, padding:"14px 15px", marginBottom:16 }}>
      <div style={{ fontSize:14, fontWeight:700, color:"var(--ink)", marginBottom:4 }}>ポップの縦長・横長を測る</div>
      <div style={{ fontSize:12.5, color:"var(--sub)", lineHeight:1.8, marginBottom:10 }}>
        一覧で横長のポップを2列ぶんの幅で並べるために、形を記録します。一度やれば十分です（新しい投稿は自動で記録されます）。
      </div>
      <button onClick={run} disabled={st.busy}
        style={{ width:"100%", border:"none", background: st.busy ? "#ccc" : "var(--fill)", color:"#fff",
          borderRadius:10, padding:"12px", fontSize:14, fontWeight:700, cursor:"pointer" }}>
        {st.busy ? (st.total ? `測っています… ${st.done} / ${st.total}` : "準備しています…") : "まとめて測る"}
      </button>
      {st.msg && <div style={{ fontSize:12.5, fontWeight:600, color:"var(--sub)", marginTop:9, textAlign:"center" }}>{st.msg}</div>}
    </div>
  );
}

;Object.assign(window, { CatalogAdmin, RotateAdmin, ResourceAdmin, DeviceStatsPanel, RankingPanel, AdminTab, ArchiveTab, NoticeAdmin, RequestTab });
