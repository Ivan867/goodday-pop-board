/* Nexus共有 — 06-tab-create （自動分割・window共有） */
var {
  useState,
  useEffect,
  useCallback,
  useRef
} = React;
function NewPostForm({
  onPost,
  onCancel
}) {
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
    if (!text.trim() && !file) {
      setError("テキストまたは画像を入力してください");
      return;
    }
    setLoading(true);
    setError("");
    try {
      let image_url = null;
      if (file) image_url = await api.upload(file);
      const post = await api.insertPost({
        text: text.trim(),
        image_url
      });
      onPost(post);
    } catch (e) {
      setError("エラー: " + e.message);
    } finally {
      setLoading(false);
    }
  };
  return /*#__PURE__*/React.createElement("div", {
    style: {
      background: "var(--card)",
      borderRadius: 16,
      padding: 20,
      marginBottom: 20,
      boxShadow: "0 2px 12px rgba(0,0,0,0.08)"
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontWeight: 900,
      fontSize: 15,
      marginBottom: 14,
      color: "#2d6a4f"
    }
  }, "\u65B0\u3057\u3044\u6295\u7A3F"), /*#__PURE__*/React.createElement("textarea", {
    value: text,
    onChange: e => setText(e.target.value),
    placeholder: "\u58F2\u308A\u5834\u306E\u69D8\u5B50\u3001\u767A\u898B\u3001\u30B3\u30C4\u306A\u3069...",
    rows: 4,
    style: {
      width: "100%",
      padding: "10px 12px",
      border: "2px solid var(--line)",
      borderRadius: 10,
      fontSize: 14,
      resize: "vertical",
      fontFamily: "inherit",
      outline: "none",
      marginBottom: 10
    }
  }), /*#__PURE__*/React.createElement("label", {
    style: {
      display: "block",
      border: "2px dashed #e0e0e0",
      borderRadius: 10,
      padding: 12,
      textAlign: "center",
      cursor: "pointer",
      marginBottom: 10,
      background: preview ? "transparent" : "#fafafa"
    }
  }, preview ? /*#__PURE__*/React.createElement("img", {
    alt: "",
    src: preview,
    style: {
      maxWidth: "100%",
      maxHeight: 160,
      borderRadius: 6
    }
  }) : /*#__PURE__*/React.createElement("div", {
    style: {
      color: "var(--faint)",
      fontSize: 13
    }
  }, "\u5199\u771F\u3092\u8FFD\u52A0\uFF08\u4EFB\u610F\uFF09"), /*#__PURE__*/React.createElement("input", {
    type: "file",
    accept: "image/*",
    onChange: onFile,
    style: {
      display: "none"
    }
  })), error && /*#__PURE__*/React.createElement("div", {
    style: {
      color: "var(--primary)",
      fontSize: 13,
      marginBottom: 8
    }
  }, error), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      gap: 10
    }
  }, /*#__PURE__*/React.createElement("button", {
    onClick: onCancel,
    style: {
      flex: 1,
      background: "#f5f5f5",
      color: "var(--text)",
      border: "none",
      borderRadius: 10,
      padding: "11px",
      fontSize: 14,
      fontWeight: 700,
      cursor: "pointer"
    }
  }, "\u30AD\u30E3\u30F3\u30BB\u30EB"), /*#__PURE__*/React.createElement("button", {
    onClick: submit,
    disabled: loading,
    style: {
      flex: 2,
      background: "#2d6a4f",
      color: "white",
      border: "none",
      borderRadius: 10,
      padding: "11px",
      fontSize: 14,
      fontWeight: 900,
      cursor: "pointer",
      opacity: loading ? 0.6 : 1
    }
  }, loading ? "投稿中..." : "投稿する")));
}
function PostCard({
  post,
  onOpen
}) {
  return /*#__PURE__*/React.createElement("div", {
    onClick: () => onOpen(post),
    style: {
      background: "var(--card)",
      borderRadius: 14,
      overflow: "hidden",
      cursor: "pointer",
      boxShadow: "0 2px 10px rgba(0,0,0,0.07)",
      transition: "all 0.15s"
    },
    onMouseEnter: e => {
      e.currentTarget.style.transform = "translateY(-2px)";
      e.currentTarget.style.boxShadow = "0 8px 24px rgba(0,0,0,0.12)";
    },
    onMouseLeave: e => {
      e.currentTarget.style.transform = "none";
      e.currentTarget.style.boxShadow = "0 2px 10px rgba(0,0,0,0.07)";
    }
  }, post.image_url && /*#__PURE__*/React.createElement("img", {
    alt: "",
    src: post.image_url,
    style: {
      width: "100%",
      height: 200,
      objectFit: "cover",
      display: "block"
    }
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      padding: "14px 16px"
    }
  }, post.text && /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 14,
      color: "var(--ink)",
      lineHeight: 1.6,
      marginBottom: 8,
      display: "-webkit-box",
      WebkitLineClamp: 3,
      WebkitBoxOrient: "vertical",
      overflow: "hidden"
    }
  }, post.text), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center"
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 12,
      color: "var(--faint)"
    }
  }, timeAgo(post.created_at)), post.views > 0 && /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 12,
      color: "var(--faint)"
    }
  }, post.views))));
}
function PostModal({
  post,
  onClose,
  onViewed
}) {
  useEffect(() => {
    onViewed && onViewed(post.id, post.views);
  }, []);
  return /*#__PURE__*/React.createElement("div", {
    style: {
      position: "fixed",
      inset: 0,
      background: "rgba(0,0,0,0.7)",
      display: "flex",
      alignItems: "flex-end",
      justifyContent: "center",
      zIndex: 1000
    },
    onClick: onClose
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      background: "var(--card)",
      borderRadius: "22px 22px 0 0",
      width: "100%",
      maxWidth: 560,
      maxHeight: "92vh",
      overflow: "auto",
      animation: "sheetUp .32s cubic-bezier(.16,1,.3,1)"
    },
    onClick: e => e.stopPropagation()
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      position: "relative"
    }
  }, /*#__PURE__*/React.createElement("button", {
    onClick: onClose,
    style: {
      position: "absolute",
      top: 12,
      right: 12,
      background: "rgba(0,0,0,0.5)",
      border: "none",
      color: "white",
      fontSize: 16,
      width: 32,
      height: 32,
      borderRadius: "50%",
      cursor: "pointer",
      zIndex: 1
    }
  }, "\u2715"), post.image_url && /*#__PURE__*/React.createElement("img", {
    alt: "",
    src: post.image_url,
    style: {
      width: "100%",
      display: "block",
      borderRadius: "22px 22px 0 0"
    }
  })), /*#__PURE__*/React.createElement("div", {
    style: {
      padding: 20
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 15,
      color: "var(--ink)",
      lineHeight: 1.8,
      marginBottom: 14,
      whiteSpace: "pre-wrap"
    }
  }, post.text), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      justifyContent: "space-between",
      fontSize: 12,
      color: "var(--faint)"
    }
  }, /*#__PURE__*/React.createElement("span", null, formatDate(post.created_at)), /*#__PURE__*/React.createElement("span", null, (post.views || 0) + 1, " \u95B2\u89A7")))));
}
function BlogTab() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [openPost, setOpenPost] = useState(null);
  const load = async () => {
    setLoading(true);
    try {
      const data = await api.listPosts();
      setPosts(data);
    } catch (e) {} finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    load();
  }, []);
  const handlePost = post => {
    setPosts(p => [post, ...p]);
    setShowForm(false);
  };
  const handleView = async (id, currentViews) => {
    try {
      const updated = await api.incrementViews(id, currentViews);
      setPosts(p => p.map(x => x.id === id ? updated : x));
    } catch (e) {}
  };
  return /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
    style: {
      background: "linear-gradient(135deg,#2d6a4f 0%,#40916c 100%)",
      padding: "16px 20px",
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center"
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      color: "rgba(255,255,255,0.8)",
      fontSize: 13
    }
  }, "\u9BAE\u9B5A\u90E8\u306E\u60C5\u5831\u5171\u6709\u30B9\u30DA\u30FC\u30B9"), /*#__PURE__*/React.createElement("button", {
    onClick: () => setShowForm(f => !f),
    style: {
      background: showForm ? "#2d5a3d" : "#52b788",
      color: "white",
      border: "none",
      borderRadius: 10,
      padding: "9px 16px",
      fontSize: 13,
      fontWeight: 700,
      cursor: "pointer"
    }
  }, showForm ? "✕ 閉じる" : "＋ 投稿")), /*#__PURE__*/React.createElement("div", {
    style: {
      maxWidth: 560,
      margin: "0 auto",
      padding: "20px 16px"
    }
  }, showForm && /*#__PURE__*/React.createElement(NewPostForm, {
    onPost: handlePost,
    onCancel: () => setShowForm(false)
  }), loading ? /*#__PURE__*/React.createElement("div", {
    style: {
      textAlign: "center",
      padding: 60,
      color: "var(--faint)"
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      marginTop: 8,
      animation: "pulse 1.5s infinite"
    }
  }, "\u8AAD\u307F\u8FBC\u307F\u4E2D...")) : posts.length === 0 ? /*#__PURE__*/React.createElement("div", {
    style: {
      textAlign: "center",
      padding: 80
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 15,
      color: "var(--sub)"
    }
  }, "\u307E\u3060\u6295\u7A3F\u304C\u3042\u308A\u307E\u305B\u3093")) : /*#__PURE__*/React.createElement("div", {
    style: {
      display: "grid",
      gap: 14
    }
  }, posts.map(post => /*#__PURE__*/React.createElement(PostCard, {
    key: post.id,
    post: post,
    onOpen: p => setOpenPost(p)
  })))), openPost && /*#__PURE__*/React.createElement(PostModal, {
    post: openPost,
    onClose: () => setOpenPost(null),
    onViewed: handleView
  }));
}

// ── POP作成ツール Tab（統合版）──
function PopToolTab({
  seed,
  onSeedConsumed
}) {
  const [toolSub, setToolSub] = useState("create");
  return /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
    style: {
      maxWidth: 680,
      margin: "0 auto",
      padding: "14px 16px 0",
      display: "flex",
      gap: 7
    }
  }, [["create", "✏️ 作成"], ["check", "🩺 診断"], ["prompts", "💡 プロンプト集"]].map(([k, l]) => /*#__PURE__*/React.createElement("button", {
    key: k,
    onClick: () => setToolSub(k),
    style: {
      flex: 1,
      border: "1px solid var(--line)",
      borderRadius: 11,
      padding: "10px 4px",
      fontSize: 12.5,
      fontWeight: 800,
      cursor: "pointer",
      whiteSpace: "nowrap",
      background: toolSub === k ? "var(--fill)" : "var(--card)",
      color: toolSub === k ? "#fff" : "var(--text)"
    }
  }, l))), toolSub === "create" ? /*#__PURE__*/React.createElement(PopCreateInner, {
    seed: seed,
    onSeedConsumed: onSeedConsumed
  }) : toolSub === "check" ? window.PopCheckTab ? React.createElement(window.PopCheckTab) : /*#__PURE__*/React.createElement("div", {
    style: {
      textAlign: "center",
      padding: 40,
      color: "var(--faint)",
      fontSize: 13
    }
  }, "\u8AAD\u307F\u8FBC\u307F\u4E2D\u2026") : /*#__PURE__*/React.createElement(PromptTab, {
    embedded: true
  }));
}
function PopCreateInner({
  seed,
  onSeedConsumed
}) {
  // ── 見本スタイルかんたん作成（投稿されたプロンプト見本3種の型を内蔵） ──
  const [qsStyle, setQsStyle] = useState("wamodern");
  const [qs, setQs] = useState({
    fish: "",
    origin: "",
    catchcopy: "",
    appeal: "",
    price: "",
    recipes: "",
    size: "縦A4"
  });
  const [qsPrompt, setQsPrompt] = useState("");
  const [qsCopied, setQsCopied] = useState(false);
  const qsSet = (k, v) => setQs(o => ({
    ...o,
    [k]: v
  }));
  // タップで入力できる候補タグ（見本3枚の言葉から抽出）
  const QS_TAGS = {
    fish: ["真あじ", "ブリ", "さば", "さわら", "真鯛", "のどぐろ", "白いか", "ヒラマサ", "イサキ", "サーモン"],
    origin: ["山陰沖", "島根県産", "境港", "地元", "日本海", "浜田港"],
    catchcopy: ["旬の味", "朝どれ", "鮮度に自信", "今が食べごろ", "脂のり抜群", "日本海から直送", "地元で育った"],
    appeal: ["脂のり抜群！", "ふっくらジューシー！", "とろける旨み！", "上品な甘み！", "焼いてふっくら！", "鮮度抜群！"],
    recipes: ["刺身", "塩焼き", "煮付け", "フライ", "ムニエル", "炙り", "漬け丼", "鍋"]
  };
  // recipes は複数選択（カンマ区切りで追加/削除）、それ以外はタップで入力（同じタグ再タップで消す）
  const qsTagTap = (k, tag) => {
    if (k === "recipes") {
      const cur = qs.recipes ? qs.recipes.split("、").filter(Boolean) : [];
      const next = cur.includes(tag) ? cur.filter(t => t !== tag) : [...cur, tag];
      qsSet("recipes", next.join("、"));
    } else {
      qsSet(k, qs[k] === tag ? "" : tag);
    }
  };
  const qsTagOn = (k, tag) => k === "recipes" ? (qs.recipes || "").split("、").includes(tag) : qs[k] === tag;
  const qsGen = () => {
    const f = qs.fish.trim() || "旬の魚";
    const org = qs.origin.trim();
    const cc = qs.catchcopy.trim();
    const ap = qs.appeal.trim();
    const rc = qs.recipes.trim();
    const pn = parseInt(qs.price, 10);
    const hasP = !isNaN(pn) && pn > 0;
    const taxP = hasP ? Math.round(pn * 1.08) : 0;
    const sz = qs.size === "横A4" ? "横A4（1.414:1）" : "縦A4（1:1.414）";
    let t = "";
    if (qsStyle === "wamodern") {
      t = `高級感のある和モダンな魚売り場ポップ。${sz}、4K高解像度。テーマは${org ? org + "の" : ""}「${f}」。

背景は白〜生成り色の和紙テクスチャ。余白を贅沢に使い、洗練された静けさを表現。上部に「${cc || "旬の味 " + f}」と上質な明朝体（金箔調の文字色）で大きく配置。

中央に、墨絵・水彩風で繊細に描かれた${f}を一尾。鱗の質感と銀色の輝きを上品に表現し、写実とアートの中間の美しさ。背景にさりげなく波の線描や青海波（せいがいは）文様をあしらう。

下部に縦書きの説明文をすっきりと配置：「${ap || "今が旬。脂がのり、食卓の主役に。"}」${rc ? `

下部に料理レシピを小さく添える：${rc}` : ""}${hasP ? `

下部に価格表示：本体${pn}円（税込${taxP}円）。価格は読みやすく、装飾は控えめに。` : ""}

全体の配色は生成り・墨色・藍・差し色に金。料亭や百貨店の鮮魚コーナーを思わせる、静かで品のある高級感。装飾は控えめで、余白と質感で魅せる構図。文字は正確な日本語で描く。`;
    } else if (qsStyle === "navygold") {
      t = `スーパーマーケット鮮魚売場の高級販促ポップ。${sz}、4K高解像度。テーマは${org ? org + "産" : ""}「${f}」。

【配色】ベースは深みのある紺色（ネイビー）のグラデーション。アソートカラーはゴールド、アクセントに桜のピンク。文字色は白とゴールドの2色。

【レイアウト・上から順に】
・最上部：ゴールドの刷毛目のあしらい＋小さめのリード文「${cc || "特別な日の、ごちそうに。"}」を中央揃え。
・上部：メインタイトル「${f}」を紙面で最も目立つ太い文字で中央に大きく。すぐ下に＼ ／で挟んだ帯文字「${ap || "旨さ、堂々。"}」。
・中央：黒い丸皿に盛った${f}の料理写真を大きく傾けて配置。右側の紺色スペースに短い解説テキスト。
・下部：ゴールドの青海波（せいがいは）模様を敷き、その上に金の二重丸フレームを3つ横並びに。各フレームに太字タイトル＋細字の説明${rc ? `（例：${rc}）` : ""}。空きスペースに桜の花びらを数枚。${hasP ? `
・価格：本体${pn}円（税込${taxP}円）を白フチ付きの大きな数字で。` : ""}

高級寿司店・百貨店催事のような格式ある仕上がり。文字は正確な日本語で、遠くからでも読めるサイズ。`;
    } else {
      t = `スーパーマーケット鮮魚売場で使用する${sz}の販促ポスター。高級感と売場でのインパクトを両立し、百貨店の食品売場のような上質な仕上がり。

■メイン商品：中央に${org ? org + "産" : ""}${f}の切身を3切れ、大きく配置。実際の${f}らしい身色・皮目・血合い・脂の質感を正確に、みずみずしく透明感のあるフォトリアル表現。氷の上に並べ、砕いた氷や大葉で鮮度感を演出。3切れは角度・厚み・断面を少しずつ変える。

■背景：${org || "産地"}を象徴する漁港・海の風景。商品が最も目立つよう背景は適度にぼかす。

■上部コピー：小さめの力強い文字で「${cc || "鮮度に自信"}」。

■商品名：中央上部に大きな筆文字で「${org ? org + " " : ""}${f}」。白フチ＋黒い影で背景に埋もれないように。売場の遠くからでも読める大きさ。

■右上エンブレム：紺色の円形和風エンブレム（金の細い縁取り＋波の装飾）。中に金文字で「${ap || "鮮度抜群！"}」。

■左下スタンプ：赤い判子風スタンプに「${ap || "脂のり抜群！"}」。${rc ? `

■食べ方：下部に小さく「おすすめ：${rc}」。` : ""}${hasP ? `

■価格表示：下部に大きく確保。大きな赤文字で「${pn}円」、近くに小さく「税込${taxP}円」。白フチ＋薄い影付きで、数字と税込表記は正確に描く。` : ""}

■配色：赤・紺・白・金。金は装飾と縁取りに限定。

■仕上がり：超高解像度、フォトリアル、広告写真品質。チラシ風・漫画風・不自然な魚の形は避ける。重要な文字や価格が端で切れないよう余白を確保。文字は正確な日本語で描く。`;
    }
    setQsPrompt(t);
    setQsCopied(false);
  };
  const qsCopy = async () => {
    try {
      await navigator.clipboard.writeText(qsPrompt);
      setQsCopied(true);
      setTimeout(() => setQsCopied(false), 1800);
    } catch (e) {}
  };
  const isRefSeed = !!(seed && seed.image_url);
  const [mode, setMode] = useState(isRefSeed ? "ref" : "new");
  const [size, setSize] = useState("縦");
  const [fields, setFields] = useState(isRefSeed ? {
    product: "",
    usage: "",
    price: "",
    appeal: "",
    mood: "",
    refProduct: "",
    refNoShow: seed.product || ""
  } : seed ? {
    product: seed.product || "",
    usage: seed.usage || "",
    price: seed.price || "",
    appeal: seed.appeal || "",
    mood: seed.mood || "",
    refProduct: "",
    refNoShow: ""
  } : {
    product: "",
    usage: "",
    price: "",
    appeal: "",
    mood: "",
    refProduct: "",
    refNoShow: ""
  });
  const [refImage] = useState(isRefSeed ? seed.image_url : null);
  const [prompt, setPrompt] = useState("");
  const [copied, setCopied] = useState(false);
  const [scanning, setScanning] = useState(false);
  const [scanError, setScanError] = useState("");
  const [showTips, setShowTips] = useState(false);
  const scanInputRef = React.useRef(null);
  const setF = (k, v) => setFields(f => ({
    ...f,
    [k]: v
  }));
  useEffect(() => {
    if (seed && onSeedConsumed) onSeedConsumed();
  }, []);
  const SIZES = [{
    key: "縦",
    label: "縦A4（210×297mm）"
  }, {
    key: "横",
    label: "横A4（297×210mm）"
  }];
  const sizeLabel = SIZES.find(s => s.key === size).label;
  const toBase64 = file => new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result.split(",")[1]);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
  const handleScan = async e => {
    const file = e.target.files[0];
    if (!file) return;
    setScanning(true);
    setScanError("");
    try {
      const imageBase64 = await toBase64(file);
      const res = await fetch(`${SB_URL}/functions/v1/extract-pop`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "apikey": SB_KEY,
          "Authorization": `Bearer ${SB_KEY}`
        },
        body: JSON.stringify({
          imageBase64,
          mimeType: file.type
        })
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      setFields(f => ({
        ...f,
        product: data.product || f.product,
        usage: data.usage || f.usage,
        price: data.price || f.price,
        appeal: data.appeal || f.appeal,
        mood: data.mood || f.mood
      }));
    } catch (err) {
      setScanError("読み取りに失敗しました：" + err.message);
    } finally {
      setScanning(false);
      e.target.value = "";
    }
  };
  const generate = () => {
    if (mode === "new") {
      setPrompt(`あなたはスーパーの鮮魚売り場専門のデザイナーです。\n` + `【商品】${fields.product}\n` + `【用途】${fields.usage}\n` + `【価格】${fields.price || "表記なし"}\n` + `【一言アピール】${fields.appeal}\n` + `【サイズ】${sizeLabel}\n` + `【雰囲気】${fields.mood}\n` + `このPOPの画像を作ってください。`);
    } else if (mode === "bg") {
      setPrompt(size === "縦" ? `背景の売り場は必要ないんだ。サイズ縦A4（210×297mm）でポップ部分のみで作成して` : `背景の売り場は必要なし、サイズは横A4（297×210mm）でポップ部分のみで作成して`);
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
      document.body.appendChild(ta);
      ta.select();
      document.execCommand("copy");
      document.body.removeChild(ta);
    });
    setCopied(true);
    setTimeout(() => {
      setCopied(false);
      setPrompt("");
    }, 2000);
  };
  const inp = {
    width: "100%",
    padding: "11px 13px",
    borderRadius: 8,
    border: "1px solid #3a3a3a",
    background: "#2a2a2a",
    color: "white",
    fontSize: 14,
    outline: "none",
    fontFamily: "inherit"
  };
  const lbl = {
    fontSize: 12,
    color: "var(--sub)",
    marginBottom: 5
  };
  const MODES = [{
    key: "new",
    label: "① 新規POP作成"
  }, {
    key: "bg",
    label: "② 背景修正"
  }, {
    key: "ref",
    label: "③ 参考画像あり"
  }];
  return /*#__PURE__*/React.createElement("div", {
    style: {
      maxWidth: 680,
      margin: "0 auto",
      padding: "20px 16px 60px"
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      background: "#111",
      borderRadius: 16,
      padding: "24px 22px",
      color: "white"
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 16,
      fontWeight: 900,
      marginBottom: 20,
      color: "#eee"
    }
  }, "\u9BAE\u9B5A\u58F2\u308A\u5834 POP\u4F5C\u6210\u30C4\u30FC\u30EB"), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 12,
      color: "var(--sub)",
      marginBottom: 8
    }
  }, "\u30E2\u30FC\u30C9\u9078\u629E"), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      gap: 8,
      marginBottom: 20
    }
  }, MODES.map(m => /*#__PURE__*/React.createElement("button", {
    key: m.key,
    onClick: () => {
      setMode(m.key);
      setPrompt("");
    },
    style: {
      flex: 1,
      padding: "11px 6px",
      borderRadius: 8,
      border: "none",
      cursor: "pointer",
      fontSize: 13,
      fontWeight: 700,
      background: mode === m.key ? "#8B6914" : "#2a2a2a",
      color: mode === m.key ? "white" : "#aaa",
      transition: "all 0.15s"
    }
  }, m.label))), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 12,
      color: "var(--sub)",
      marginBottom: 8
    }
  }, "\u30B5\u30A4\u30BA"), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      gap: 8,
      marginBottom: 20
    }
  }, SIZES.map(s => /*#__PURE__*/React.createElement("button", {
    key: s.key,
    onClick: () => setSize(s.key),
    style: {
      flex: 1,
      padding: "11px",
      borderRadius: 8,
      cursor: "pointer",
      fontSize: 13,
      fontWeight: 700,
      border: `2px solid ${size === s.key ? "#8B6914" : "#3a3a3a"}`,
      background: "#1e1e1e",
      color: size === s.key ? "white" : "#777",
      transition: "all 0.15s"
    }
  }, s.label))), mode === "new" && /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("input", {
    ref: scanInputRef,
    type: "file",
    accept: "image/*",
    onChange: handleScan,
    style: {
      display: "none"
    }
  }), /*#__PURE__*/React.createElement("button", {
    onClick: () => scanInputRef.current.click(),
    disabled: scanning,
    style: {
      width: "100%",
      padding: "11px",
      borderRadius: 8,
      border: "1px dashed #8B6914",
      marginBottom: 16,
      background: scanning ? "#1a1a0a" : "#1e1800",
      color: scanning ? "#888" : "#c8a840",
      fontSize: 13,
      fontWeight: 700,
      cursor: scanning ? "default" : "pointer"
    }
  }, scanning ? "AI読み取り中..." : "既存POPから自動入力（AI読み取り）"), scanError && /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 12,
      color: "var(--primary)",
      marginBottom: 10
    }
  }, scanError), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 12,
      color: "var(--sub)",
      marginBottom: 10
    }
  }, "\u5165\u529B"), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "grid",
      gridTemplateColumns: "1fr 1fr",
      gap: 10,
      marginBottom: 10
    }
  }, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
    style: lbl
  }, "\u5546\u54C1"), /*#__PURE__*/React.createElement("input", {
    value: fields.product,
    onChange: e => setF("product", e.target.value),
    placeholder: "\u4F8B\uFF1A\u5929\u7136\u30DE\u30C0\u30A4\uFF081\u5C3E\uFF09",
    style: inp
  })), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
    style: lbl
  }, "\u7528\u9014"), /*#__PURE__*/React.createElement("input", {
    value: fields.usage,
    onChange: e => setF("usage", e.target.value),
    placeholder: "\u4F8B\uFF1A\u304A\u523A\u8EAB\u30FB\u5869\u713C\u304D",
    style: inp
  })), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
    style: lbl
  }, "\u4FA1\u683C"), /*#__PURE__*/React.createElement("input", {
    value: fields.price,
    onChange: e => setF("price", e.target.value),
    placeholder: "\u4F8B\uFF1A980\u5186\uFF08\u7A0E\u8FBC\uFF09",
    style: inp
  })), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
    style: lbl
  }, "\u4E00\u8A00\u30A2\u30D4\u30FC\u30EB"), /*#__PURE__*/React.createElement("input", {
    value: fields.appeal,
    onChange: e => setF("appeal", e.target.value),
    placeholder: "\u4F8B\uFF1A\u7523\u5730\u76F4\u9001\uFF01\u9BAE\u5EA6\u629C\u7FA4",
    style: inp
  }))), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
    style: lbl
  }, "\u96F0\u56F2\u6C17"), /*#__PURE__*/React.createElement("input", {
    value: fields.mood,
    onChange: e => setF("mood", e.target.value),
    placeholder: "\u4F8B\uFF1A\u590F\u3089\u3057\u3044\u6DBC\u3057\u3052\u306A\u30C7\u30B6\u30A4\u30F3\u3001\u548C\u98A8\u30C6\u30A4\u30B9\u30C8",
    style: inp
  }))), mode === "bg" && /*#__PURE__*/React.createElement("div", {
    style: {
      background: "#1e1e1e",
      border: "1px solid #3a3a3a",
      borderRadius: 8,
      padding: "13px 15px",
      fontSize: 13,
      color: "var(--sub)",
      lineHeight: 1.8
    }
  }, "Gemini\u3067\u4FEE\u6B63\u3057\u305F\u3044POP\u753B\u50CF\u3092\u8CBC\u308A\u4ED8\u3051\u3066\u304B\u3089\u3001\u4E0B\u306E\u30D7\u30ED\u30F3\u30D7\u30C8\u3092\u30B3\u30D4\u30FC\u3057\u3066\u9001\u4FE1\u3057\u3066\u304F\u3060\u3055\u3044\u3002"), mode === "ref" && /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("div", {
    style: {
      background: "#1a2a1a",
      border: "1px solid #2d4a2d",
      borderRadius: 8,
      padding: "11px 13px",
      fontSize: 12,
      color: "#7ec87e",
      lineHeight: 1.75,
      marginBottom: 14
    }
  }, "Gemini\u306B\u53C2\u8003\u306B\u3057\u305F\u3044POP\u753B\u50CF\u3092\u5148\u306B\u30A2\u30C3\u30D7\u30ED\u30FC\u30C9\u3057\u3066\u304B\u3089\u3001\u751F\u6210\u3057\u305F\u30D7\u30ED\u30F3\u30D7\u30C8\u3092\u8CBC\u308A\u4ED8\u3051\u3066\u304F\u3060\u3055\u3044\u3002"), refImage && /*#__PURE__*/React.createElement("div", {
    style: {
      background: "#1e1e1e",
      border: "1px solid #3a3a3a",
      borderRadius: 8,
      padding: "11px 13px",
      marginBottom: 14,
      display: "flex",
      gap: 12,
      alignItems: "center"
    }
  }, /*#__PURE__*/React.createElement("img", {
    alt: "",
    src: refImage,
    style: {
      width: 64,
      height: 64,
      objectFit: "cover",
      borderRadius: 6,
      flexShrink: 0,
      background: "#111"
    }
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 12,
      color: "#c8a840",
      lineHeight: 1.7
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontWeight: 800,
      marginBottom: 2
    }
  }, "\u3053\u306EPOP\u3092\u53C2\u7167\u5143\u306B\u3057\u307E\u3059"), /*#__PURE__*/React.createElement("div", {
    style: {
      color: "var(--sub)"
    }
  }, "\u3053\u306E\u753B\u50CF\u3092\u9577\u62BC\u3057\u3067\u4FDD\u5B58\u3057\u3001AI\u306B\u30A2\u30C3\u30D7\u30ED\u30FC\u30C9\u3057\u3066\u304B\u3089\u4E0B\u306E\u30D7\u30ED\u30F3\u30D7\u30C8\u3092\u8CBC\u308A\u4ED8\u3051\u3066\u304F\u3060\u3055\u3044\u3002"))), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      flexDirection: "column",
      gap: 10
    }
  }, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
    style: lbl
  }, "\u30DD\u30C3\u30D7\u306E\u5185\u5BB9\uFF08\u5546\u54C1\u540D\u306A\u3069\uFF09"), /*#__PURE__*/React.createElement("input", {
    value: fields.refProduct,
    onChange: e => setF("refProduct", e.target.value),
    placeholder: "\u4F8B\uFF1A\u5929\u7136\u30DE\u30C0\u30A4 \u304A\u523A\u8EAB\u7528",
    style: inp
  })), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
    style: lbl
  }, "\u8868\u8A18\u3057\u306A\u3044\u5185\u5BB9 ", /*#__PURE__*/React.createElement("span", {
    style: {
      color: "var(--text)"
    }
  }, "\uFF08\u7A7A\u6B04\u306E\u5834\u5408\u306F\u4E0A\u3068\u540C\u3058\uFF09")), /*#__PURE__*/React.createElement("input", {
    value: fields.refNoShow,
    onChange: e => setF("refNoShow", e.target.value),
    placeholder: "\u4F8B\uFF1A\u5929\u7136\u30DE\u30C0\u30A4",
    style: inp
  })))), /*#__PURE__*/React.createElement("div", {
    style: {
      borderTop: "1px solid #2a2a2a",
      margin: "18px 0 14px"
    }
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 12,
      color: "var(--sub)",
      marginBottom: 8
    }
  }, "\u751F\u6210\u3055\u308C\u305F\u30D7\u30ED\u30F3\u30D7\u30C8"), /*#__PURE__*/React.createElement("textarea", {
    value: prompt,
    readOnly: true,
    placeholder: "\u2190 \u4E0A\u306E\u9805\u76EE\u3092\u5165\u529B\u3057\u3066\u300C\u30D7\u30ED\u30F3\u30D7\u30C8\u751F\u6210\u300D\u3092\u62BC\u3057\u3066\u304F\u3060\u3055\u3044",
    rows: 5,
    style: {
      width: "100%",
      padding: "12px 13px",
      borderRadius: 8,
      border: "1px solid #2a2a2a",
      background: "#1a1a1a",
      color: prompt ? "#eee" : "#555",
      fontSize: 13,
      resize: "vertical",
      fontFamily: "inherit",
      outline: "none",
      lineHeight: 1.75,
      marginBottom: 12
    }
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      gap: 8,
      marginBottom: 16
    }
  }, /*#__PURE__*/React.createElement("button", {
    onClick: generate,
    style: {
      flex: 3,
      padding: "14px",
      borderRadius: 8,
      border: "1px solid #3a3a3a",
      background: "#222",
      color: "#ddd",
      fontSize: 14,
      fontWeight: 700,
      cursor: "pointer"
    },
    onMouseEnter: e => e.currentTarget.style.background = "#2e2e2e",
    onMouseLeave: e => e.currentTarget.style.background = "#222"
  }, "\u30D7\u30ED\u30F3\u30D7\u30C8\u751F\u6210"), /*#__PURE__*/React.createElement("button", {
    onClick: copy,
    disabled: !prompt,
    style: {
      flex: 1,
      padding: "14px",
      borderRadius: 8,
      border: "none",
      background: copied ? "#16a34a" : prompt ? "#8B6914" : "#333",
      color: "white",
      fontSize: 14,
      fontWeight: 700,
      cursor: prompt ? "pointer" : "default",
      opacity: !prompt ? 0.4 : 1,
      transition: "all 0.2s"
    }
  }, copied ? "コピー済" : "コピー")), true && /*#__PURE__*/React.createElement("div", {
    style: {
      marginTop: 12,
      display: "flex",
      flexDirection: "column",
      gap: 10
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      background: "#1a1a0a",
      border: "1px solid #3a3a00",
      borderRadius: 10,
      padding: "13px 15px"
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 12,
      fontWeight: 800,
      color: "#c8a840",
      marginBottom: 8
    }
  }, "\u4F7F\u3044\u65B9\uFF084\u30B9\u30C6\u30C3\u30D7\uFF09"), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "grid",
      gridTemplateColumns: "1fr 1fr",
      gap: "6px 12px"
    }
  }, [["①", "モードとサイズを選ぶ"], ["②", "入力欄を埋める"], ["③", "「プロンプト生成」を押す"], ["④", "「コピー」→Geminiに貼り付け"]].map(([n, t]) => /*#__PURE__*/React.createElement("div", {
    key: n,
    style: {
      display: "flex",
      alignItems: "center",
      gap: 6,
      fontSize: 12,
      color: "var(--sub)"
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      width: 20,
      height: 20,
      background: "#3a3a00",
      borderRadius: "50%",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      fontSize: 11,
      fontWeight: 900,
      color: "#c8a840",
      flexShrink: 0
    }
  }, n), /*#__PURE__*/React.createElement("div", null, t))))), /*#__PURE__*/React.createElement("div", {
    style: {
      background: "#0a1a0a",
      border: "1px solid #1a3a1a",
      borderRadius: 10,
      padding: "13px 15px",
      fontSize: 12,
      color: "#7ec87e",
      lineHeight: 1.75
    }
  }, /*#__PURE__*/React.createElement("strong", {
    style: {
      color: "#52c87e"
    }
  }, "\u4FA1\u683C\u3092\u5165\u308C\u305F\u304F\u306A\u3044\u5834\u5408"), "\u306F\u4FA1\u683C\u6B04\u3092\u7A7A\u6B04\u306B\u3059\u308B\u3068\u300C\u8868\u8A18\u306A\u3057\u300D\u304C\u81EA\u52D5\u3067\u5165\u308A\u307E\u3059\u3002")), /*#__PURE__*/React.createElement("div", {
    style: {
      marginTop: 14,
      background: "#141414",
      border: "1px solid #2e2a1a",
      borderRadius: 12,
      padding: "15px 15px 17px"
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 13.5,
      fontWeight: 900,
      color: "#c8a840",
      marginBottom: 3
    }
  }, "\uD83C\uDFA8 \u898B\u672C\u30B9\u30BF\u30A4\u30EB\u3067\u304B\u3093\u305F\u3093\u4F5C\u6210"), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 12.5,
      color: "var(--sub)",
      marginBottom: 12,
      lineHeight: 1.6
    }
  }, "\u6295\u7A3F\u3055\u308C\u305F\u30D7\u30ED\u30F3\u30D7\u30C8\u898B\u672C3\u7A2E\u306E\u578B\u3092\u5185\u8535\u3002\u30B9\u30BF\u30A4\u30EB\u3092\u9078\u3093\u3067\u7A7A\u6B04\u3092\u57CB\u3081\u308B\u3060\u3051\u3067\u3001\u5B8C\u6210\u30D7\u30ED\u30F3\u30D7\u30C8\u304C\u3067\u304D\u307E\u3059\u3002"), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      gap: 7,
      marginBottom: 13
    }
  }, [["wamodern", "和モダン", "墨絵・和紙・上品"], ["navygold", "紺×金 高級", "寿司・ハレの日"], ["kirimi", "切身リアル", "写真風・産地推し"]].map(([k, l, d]) => {
    const on = qsStyle === k;
    return /*#__PURE__*/React.createElement("button", {
      key: k,
      onClick: () => setQsStyle(k),
      style: {
        flex: 1,
        border: on ? "2px solid #c8a840" : "1px solid #2a2a2a",
        background: on ? "#231f0f" : "#1a1a1a",
        color: on ? "#e6c860" : "var(--text)",
        borderRadius: 10,
        padding: "9px 4px",
        cursor: "pointer"
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        fontSize: 12.5,
        fontWeight: 900
      }
    }, l), /*#__PURE__*/React.createElement("div", {
      style: {
        fontSize: 9.5,
        opacity: 0.7,
        marginTop: 2
      }
    }, d));
  })), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      flexDirection: "column",
      gap: 11,
      marginBottom: 11
    }
  }, [["fish", "魚種・商品名 *", "例：イサキ"], ["origin", "産地名", "例：山陰沖"], ["catchcopy", "キャッチコピー", "例：旬の味"], ["appeal", "ひとこと訴求", "例：脂のり抜群！"], ["recipes", "食べ方・レシピ（複数タップ可）", "例：刺身、塩焼き"], ["price", "本体価格（円）", "例：498"]].map(([k, l, ph]) => /*#__PURE__*/React.createElement("div", {
    key: k
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 12,
      fontWeight: 800,
      color: "var(--sub)",
      marginBottom: 4
    }
  }, l), /*#__PURE__*/React.createElement("input", {
    value: qs[k],
    onChange: e => qsSet(k, e.target.value),
    placeholder: ph,
    inputMode: k === "price" ? "numeric" : undefined,
    style: {
      width: "100%",
      boxSizing: "border-box",
      padding: "9px 10px",
      background: "#1a1a1a",
      border: "1px solid #2a2a2a",
      borderRadius: 8,
      color: "var(--text)",
      fontSize: 13,
      outline: "none"
    }
  }), QS_TAGS[k] && /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      flexWrap: "wrap",
      gap: 6,
      marginTop: 6
    }
  }, QS_TAGS[k].map(tag => {
    const on = qsTagOn(k, tag);
    return /*#__PURE__*/React.createElement("button", {
      key: tag,
      onClick: () => qsTagTap(k, tag),
      style: {
        border: on ? "1.5px solid #c8a840" : "1px solid #2e2e2e",
        background: on ? "#231f0f" : "#1c1c1c",
        color: on ? "#e6c860" : "#9a9a9a",
        borderRadius: 14,
        padding: "4px 11px",
        fontSize: 12.5,
        fontWeight: 700,
        cursor: "pointer",
        lineHeight: 1.4
      }
    }, tag);
  }))))), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      gap: 7,
      marginBottom: 12
    }
  }, ["縦A4", "横A4"].map(v => /*#__PURE__*/React.createElement("button", {
    key: v,
    onClick: () => qsSet("size", v),
    style: {
      flex: 1,
      border: qs.size === v ? "2px solid #c8a840" : "1px solid #2a2a2a",
      background: qs.size === v ? "#231f0f" : "#1a1a1a",
      color: qs.size === v ? "#e6c860" : "var(--text)",
      borderRadius: 8,
      padding: "8px",
      fontSize: 12.5,
      fontWeight: 800,
      cursor: "pointer"
    }
  }, v))), qsPrompt && /*#__PURE__*/React.createElement("textarea", {
    value: qsPrompt,
    readOnly: true,
    rows: 6,
    style: {
      width: "100%",
      boxSizing: "border-box",
      padding: "11px 12px",
      background: "#0f0f0f",
      border: "1px solid #2a2a2a",
      borderRadius: 8,
      color: "var(--text)",
      fontSize: 12,
      lineHeight: 1.6,
      resize: "vertical",
      marginBottom: 10
    }
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      gap: 8
    }
  }, /*#__PURE__*/React.createElement("button", {
    onClick: qsGen,
    style: {
      flex: 1.4,
      padding: "13px",
      borderRadius: 8,
      border: "none",
      background: qs.fish.trim() ? "#c8a840" : "#333",
      color: qs.fish.trim() ? "#141414" : "#888",
      fontSize: 14,
      fontWeight: 900,
      cursor: "pointer"
    }
  }, "\u30D7\u30ED\u30F3\u30D7\u30C8\u751F\u6210"), /*#__PURE__*/React.createElement("button", {
    onClick: qsCopy,
    disabled: !qsPrompt,
    style: {
      flex: 1,
      padding: "13px",
      borderRadius: 8,
      border: "none",
      background: qsCopied ? "#16a34a" : qsPrompt ? "#8B6914" : "#333",
      color: "white",
      fontSize: 14,
      fontWeight: 700,
      cursor: qsPrompt ? "pointer" : "default",
      opacity: !qsPrompt ? 0.4 : 1
    }
  }, qsCopied ? "コピー済" : "コピー")), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 11.5,
      color: "var(--faint)",
      marginTop: 9
    }
  }, "\u203B \u4FA1\u683C\u3092\u7A7A\u6B04\u306B\u3059\u308B\u3068\u4FA1\u683C\u8868\u8A18\u306A\u3057\u3067\u751F\u6210\u3055\u308C\u307E\u3059\u3002\u7A0E\u8FBC\u306F8%\u3067\u81EA\u52D5\u8A08\u7B97\u3002"))));
}

// ── Floor Photo Tab ──

;
Object.assign(window, {
  BlogTab,
  NewPostForm,
  PopCreateInner,
  PopToolTab,
  PostCard,
  PostModal
});