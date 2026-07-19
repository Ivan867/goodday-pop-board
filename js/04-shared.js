/* GoodDay 鮮魚共有 — 04-shared （自動分割・window共有） */
var {
  useState,
  useEffect,
  useCallback,
  useRef
} = React;

// ═══════════ SHARED UI：投稿・詳細・カードなど共有部品 ═══════════
function UploadModal({
  currentStore,
  onClose,
  onSuccess
}) {
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
      const A4 = 1.41421,
        TOL = 0.06;
      const w = im.naturalWidth,
        h = im.naturalHeight;
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
    if (!product.trim()) {
      setError("商品名を入力してください");
      return;
    }
    if (!author.trim()) {
      setError("名前を入力してください");
      return;
    }
    if (!file) {
      setError("画像を選択してください");
      return;
    }
    setLoading(true);
    setError("");
    try {
      const image_url = await api.upload(file);
      const pop = await api.insert({
        store_name: store,
        product_name: product.trim(),
        category,
        image_url,
        likes: 0,
        author: author.trim(),
        comment: comment.trim()
      });
      onSuccess(pop);
    } catch (e) {
      setError("エラー: " + e.message);
    } finally {
      setLoading(false);
    }
  };
  return /*#__PURE__*/React.createElement("div", {
    style: {
      position: "fixed",
      inset: 0,
      background: "rgba(0,0,0,0.5)",
      display: "flex",
      alignItems: "flex-end",
      justifyContent: "center",
      zIndex: 1000
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      background: "white",
      borderRadius: "22px 22px 0 0",
      padding: "8px 22px calc(20px + env(safe-area-inset-bottom))",
      width: "100%",
      maxWidth: 560,
      maxHeight: "92vh",
      overflowY: "auto",
      animation: "sheetUp .32s cubic-bezier(.16,1,.3,1)"
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      width: 40,
      height: 5,
      background: "var(--line)",
      borderRadius: 3,
      margin: "6px auto 16px"
    }
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
      marginBottom: 14
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 21,
      fontWeight: 900
    }
  }, "ポップをアップロード"), /*#__PURE__*/React.createElement("button", {
    onClick: onClose,
    style: {
      background: "none",
      border: "none",
      fontSize: 22,
      cursor: "pointer",
      color: "var(--sub)"
    }
  }, "✕")), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      flexDirection: "column",
      gap: 14
    }
  }, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 12,
      fontWeight: 700,
      color: "var(--text)",
      marginBottom: 6
    }
  }, "店舗"), /*#__PURE__*/React.createElement("select", {
    value: store,
    onChange: e => setStore(e.target.value),
    style: {
      width: "100%",
      padding: "10px 12px",
      border: "2px solid var(--line)",
      borderRadius: 10,
      fontSize: 14
    }
  }, STORES.map(s => /*#__PURE__*/React.createElement("option", {
    key: s
  }, s)))), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 12,
      fontWeight: 700,
      color: "var(--text)",
      marginBottom: 6
    }
  }, "お名前 ", /*#__PURE__*/React.createElement("span", {
    style: {
      color: "var(--primary)"
    }
  }, "*")), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      gap: 8,
      alignItems: "stretch"
    }
  }, /*#__PURE__*/React.createElement("input", {
    value: author,
    onChange: e => setAuthor(e.target.value),
    placeholder: "例：山田 太郎",
    style: {
      flex: 1,
      minWidth: 0,
      padding: "10px 12px",
      border: "2px solid var(--line)",
      borderRadius: 10,
      fontSize: 14,
      outline: "none"
    }
  }), /*#__PURE__*/React.createElement("button", {
    type: "button",
    onClick: () => setAuthor("勝部"),
    title: "勝部を入力",
    style: {
      flexShrink: 0,
      width: 46,
      border: "2px solid #ffd9bd",
      background: "#fff3ea",
      color: "var(--primary)",
      fontWeight: 900,
      fontSize: 18,
      borderRadius: 10,
      cursor: "pointer",
      lineHeight: 1
    }
  }, "※"))), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 12,
      fontWeight: 700,
      color: "var(--text)",
      marginBottom: 6
    }
  }, "商品名"), /*#__PURE__*/React.createElement("input", {
    value: product,
    onChange: e => setProduct(e.target.value),
    placeholder: "例：本マグロ大トロ",
    style: {
      width: "100%",
      padding: "10px 12px",
      border: "2px solid var(--line)",
      borderRadius: 10,
      fontSize: 14,
      outline: "none"
    }
  })), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 12,
      fontWeight: 700,
      color: "var(--text)",
      marginBottom: 6
    }
  }, "カテゴリ"), /*#__PURE__*/React.createElement("select", {
    value: category,
    onChange: e => setCategory(e.target.value),
    style: {
      width: "100%",
      padding: "10px 12px",
      border: "2px solid var(--line)",
      borderRadius: 10,
      fontSize: 14
    }
  }, CATEGORIES.map(c => /*#__PURE__*/React.createElement("option", {
    key: c
  }, c)))), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 12,
      fontWeight: 700,
      color: "var(--text)",
      marginBottom: 6
    }
  }, "コメント ", /*#__PURE__*/React.createElement("span", {
    style: {
      fontWeight: 400,
      color: "var(--faint)"
    }
  }, "（任意）")), /*#__PURE__*/React.createElement("textarea", {
    value: comment,
    onChange: e => setComment(e.target.value),
    placeholder: "例：脂がのっていておすすめ！刺身・塩焼きに。",
    rows: 3,
    style: {
      width: "100%",
      padding: "10px 12px",
      border: "2px solid var(--line)",
      borderRadius: 10,
      fontSize: 14,
      resize: "vertical",
      fontFamily: "inherit",
      outline: "none"
    }
  })), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 12,
      fontWeight: 700,
      color: "var(--text)",
      marginBottom: 6
    }
  }, "画像"), /*#__PURE__*/React.createElement("label", {
    style: {
      display: "block",
      border: "2px dashed #e0e0e0",
      borderRadius: 12,
      padding: "14px",
      textAlign: "center",
      cursor: "pointer",
      background: preview ? "transparent" : "#fafafa"
    }
  }, preview ? /*#__PURE__*/React.createElement("img", {
    src: preview,
    style: {
      maxWidth: "100%",
      maxHeight: 200,
      borderRadius: 8
    }
  }) : /*#__PURE__*/React.createElement("div", {
    style: {
      color: "var(--sub)",
      fontSize: 14
    }
  }, "タップして選択"), /*#__PURE__*/React.createElement("input", {
    type: "file",
    accept: "image/*",
    onChange: onFile,
    style: {
      display: "none"
    }
  })), ratioWarn && /*#__PURE__*/React.createElement("div", {
    style: {
      marginTop: 8,
      background: "#fff6de",
      border: "1px solid #eeddad",
      color: "#8a6d00",
      borderRadius: 10,
      padding: "10px 12px",
      fontSize: 12,
      fontWeight: 700,
      lineHeight: 1.6,
      display: "flex",
      gap: 8,
      alignItems: "flex-start"
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 15,
      lineHeight: 1.3
    }
  }, "📐"), /*#__PURE__*/React.createElement("span", null, ratioWarn))), error && /*#__PURE__*/React.createElement("div", {
    style: {
      color: "var(--primary)",
      fontSize: 13,
      fontWeight: 600
    }
  }, error), /*#__PURE__*/React.createElement("button", {
    onClick: submit,
    disabled: loading,
    style: {
      background: "var(--primary)",
      color: "white",
      border: "none",
      borderRadius: 12,
      padding: "13px",
      fontSize: 15,
      fontWeight: 900,
      cursor: "pointer",
      opacity: loading ? 0.6 : 1
    }
  }, loading ? "アップロード中..." : "アップロード"))));
}

// ── Pop Detail Modal ──
function PopDetail({
  pop,
  onClose,
  onDelete,
  onLiked,
  onCommented,
  onCreateFromPop,
  navList,
  onNav
}) {
  const navIdx = navList ? navList.findIndex(x => x.id === pop.id) : -1;
  const hasPrev = navList && navIdx > 0;
  const hasNext = navList && navIdx >= 0 && navIdx < navList.length - 1;
  const goPrev = () => {
    if (hasPrev && onNav) onNav(navList[navIdx - 1]);
  };
  const goNext = () => {
    if (hasNext && onNav) onNav(navList[navIdx + 1]);
  };
  const touchY = useRef(null);
  const onImgTouchStart = e => {
    touchY.current = e.touches[0].clientY;
  };
  const onImgTouchEnd = e => {
    if (touchY.current == null) return;
    const dy = e.changedTouches[0].clientY - touchY.current;
    touchY.current = null;
    if (Math.abs(dy) < 55) return;
    if (dy < 0) {
      goNext();
    } else {
      onClose && onClose();
    } // 上スワイプ＝次のポップ / 下スワイプ＝閉じて一覧へ
  };
  const [liked, setLiked] = useState(false);
  const [likes, setLikes] = useState(pop.likes || 0);
  const [used, setUsed] = useState(false);
  const [usedCount, setUsedCount] = useState(pop.used_count || 0);
  const [views, setViews] = useState(pop.view_count || 0);
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
    api.listComments(pop.id).then(setComments).catch(() => {});
    setLiked(false);
    setLikes(pop.likes || 0);
    setUsed(false);
    setUsedCount(pop.used_count || 0);
    setViews(pop.view_count || 0);
    api.addView(pop.id).then(counted => {
      if (counted) setViews(v => v + 1);
    });
    setShowDelConfirm(false);
    setPwInput("");
    setPwError("");
    const sheet = document.getElementById("pd-sheet");
    if (sheet) sheet.scrollTo({
      top: 0
    });
  }, [pop.id]);
  const handleLike = async () => {
    if (liked) return;
    try {
      const updated = await api.like(pop.id, likes);
      setLikes(updated.likes);
      setLiked(true);
      onLiked && onLiked(pop.id, updated.likes);
    } catch (e) {}
  };
  const handleUsed = async () => {
    if (used) return;
    setUsed(true);
    setUsedCount(c => c + 1);
    try {
      const updated = await api.markUsed(pop.id, usedCount);
      if (updated && typeof updated.used_count === "number") setUsedCount(updated.used_count);
    } catch (e) {
      setUsed(false);
      setUsedCount(c => Math.max(0, c - 1));
    }
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
    setDeleting(true);
    setPwError("");
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
    } catch (e) {
      alert("削除に失敗しました");
      setDeleting(false);
    }
  };
  const handleAddComment = async () => {
    if (!cText.trim()) {
      setCError("コメントを入力してください");
      return;
    }
    setCSubmitting(true);
    setCError("");
    try {
      const newC = await api.addComment(pop.id, cStore, cText.trim());
      setComments(c => [...c, newC]);
      setCText("");
      onCommented && onCommented(pop.id);
    } catch (e) {
      setCError("送信に失敗しました");
    } finally {
      setCSubmitting(false);
    }
  };
  const handleQuickReply = async text => {
    if (cSubmitting) return;
    setCSubmitting(true);
    setCError("");
    try {
      const newC = await api.addComment(pop.id, "", text);
      setComments(c => [...c, newC]);
      onCommented && onCommented(pop.id);
    } catch (e) {
      setCError("送信に失敗しました");
    } finally {
      setCSubmitting(false);
    }
  };
  useEffect(() => {
    window.dispatchEvent(new CustomEvent("popdetail", {
      detail: true
    }));
    return () => window.dispatchEvent(new CustomEvent("popdetail", {
      detail: false
    }));
  }, []);

  // 線画アイコン（1.9px stroke・iOS SF Symbols風）
  const Ico = ({
    d,
    fill
  }) => /*#__PURE__*/React.createElement("svg", {
    width: "23",
    height: "23",
    viewBox: "0 0 24 24",
    fill: fill || "none",
    stroke: "currentColor",
    strokeWidth: "1.9",
    strokeLinecap: "round",
    strokeLinejoin: "round"
  }, d);
  const ICONS = {
    heart: /*#__PURE__*/React.createElement("path", {
      d: "M12 20.5C12 20.5 3.5 15 3.5 8.9 3.5 6.1 5.7 4 8.4 4c1.7 0 3.1.9 3.6 2 .5-1.1 1.9-2 3.6-2 2.7 0 4.9 2.1 4.9 4.9 0 6.1-8.5 11.6-8.5 11.6z"
    }),
    check: /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("path", {
      d: "M4 12.5l5 5L20 6.5"
    })),
    hand: /*#__PURE__*/React.createElement("path", {
      d: "M9 11V5.5a1.5 1.5 0 013 0V11m0-1V4.5a1.5 1.5 0 013 0V11m0-.5V6.5a1.5 1.5 0 013 0V15a6 6 0 01-6 6h-1.5a5 5 0 01-3.6-1.5L4 15.8a1.6 1.6 0 012.3-2.2L8 15V6a1.5 1.5 0 013 0"
    }),
    chat: /*#__PURE__*/React.createElement("path", {
      d: "M20 11.5a7.5 7.5 0 01-10.9 6.7L4 19.5l1.4-4.4A7.5 7.5 0 1120 11.5z"
    }),
    save: /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("path", {
      d: "M12 3.5v11m0 0l-4-4m4 4l4-4"
    }), /*#__PURE__*/React.createElement("path", {
      d: "M4 16.5v2a2 2 0 002 2h12a2 2 0 002-2v-2"
    })),
    edit: /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("path", {
      d: "M4 20h4L18.5 9.5a2 2 0 00-2.8-2.8L5 17.2 4 20z"
    }), /*#__PURE__*/React.createElement("path", {
      d: "M14 6.5l3.5 3.5"
    })),
    trash: /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("path", {
      d: "M4 7h16M9 7V5a1.5 1.5 0 013 0v0a1.5 1.5 0 013 0v2M6 7l1 12.5A1.5 1.5 0 008.5 21h7A1.5 1.5 0 0017 19.5L18 7"
    }))
  };
  const ActionBtn = ({
    onClick,
    disabled,
    active,
    icon,
    label,
    activeColor,
    fillWhenActive
  }) => /*#__PURE__*/React.createElement("button", {
    onClick: onClick,
    disabled: disabled,
    style: {
      border: "none",
      background: "transparent",
      cursor: disabled ? "default" : "pointer",
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      gap: 3,
      padding: 0
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      width: 46,
      height: 46,
      borderRadius: "50%",
      background: active ? activeColor : "rgba(255,255,255,0.16)",
      border: active ? "none" : "1px solid rgba(255,255,255,0.3)",
      backdropFilter: "blur(8px)",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      color: "#fff",
      boxShadow: active ? "0 3px 10px rgba(0,0,0,0.25)" : "none",
      transition: "all .18s ease"
    }
  }, /*#__PURE__*/React.createElement(Ico, {
    d: ICONS[icon],
    fill: active && fillWhenActive ? "#fff" : "none"
  })), /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 10,
      fontWeight: 800,
      color: "#fff",
      textShadow: "0 1px 3px rgba(0,0,0,0.55)",
      letterSpacing: "-0.2px"
    }
  }, label));
  return /*#__PURE__*/React.createElement("div", {
    "data-popdetail": "1",
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
    id: "pd-sheet",
    style: {
      background: "#fff",
      borderRadius: "22px 22px 0 0",
      width: "100%",
      maxWidth: 560,
      maxHeight: "92vh",
      overflowY: "auto",
      animation: "sheetUp .32s cubic-bezier(.16,1,.3,1)",
      WebkitOverflowScrolling: "touch"
    },
    onClick: e => e.stopPropagation()
  }, /*#__PURE__*/React.createElement("div", {
    onTouchStart: onImgTouchStart,
    onTouchEnd: onImgTouchEnd,
    style: {
      position: "relative",
      background: "var(--chip)",
      borderRadius: "22px 22px 0 0",
      overflow: "hidden",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      minHeight: "52vh",
      maxHeight: "64vh"
    }
  }, /*#__PURE__*/React.createElement("img", {
    src: pop.image_url,
    style: {
      maxWidth: "100%",
      maxHeight: "64vh",
      objectFit: "contain",
      display: "block"
    }
  }), navList && navIdx >= 0 && /*#__PURE__*/React.createElement("span", {
    style: {
      position: "absolute",
      top: 14,
      right: 14,
      background: "rgba(0,0,0,0.4)",
      color: "#fff",
      fontSize: 11,
      fontWeight: 800,
      padding: "3px 9px",
      borderRadius: 12,
      backdropFilter: "blur(4px)",
      zIndex: 6
    }
  }, navIdx + 1, " / ", navList.length), /*#__PURE__*/React.createElement("button", {
    onClick: onClose,
    style: {
      position: "absolute",
      bottom: 14,
      left: 14,
      background: "rgba(0,0,0,0.55)",
      border: "none",
      color: "#fff",
      fontSize: 18,
      width: 44,
      height: 44,
      borderRadius: 12,
      cursor: "pointer",
      backdropFilter: "blur(4px)",
      zIndex: 6,
      display: "flex",
      alignItems: "center",
      justifyContent: "center"
    }
  }, "✕"), /*#__PURE__*/React.createElement("div", {
    style: {
      position: "absolute",
      right: 11,
      bottom: 16,
      display: "flex",
      flexDirection: "column",
      gap: 13,
      zIndex: 5
    }
  }, /*#__PURE__*/React.createElement(ActionBtn, {
    onClick: handleLike,
    active: liked,
    activeColor: "#e0245e",
    fillWhenActive: true,
    icon: "heart",
    label: String(likes)
  }), /*#__PURE__*/React.createElement(ActionBtn, {
    onClick: handleUsed,
    active: used,
    activeColor: "#2f6fb0",
    icon: used ? "check" : "hand",
    label: used ? `使った ${usedCount}` : "使った"
  }), /*#__PURE__*/React.createElement(ActionBtn, {
    onClick: () => {
      const el = document.getElementById("pd-comments");
      if (el) el.scrollIntoView({
        behavior: "smooth"
      });
    },
    icon: "chat",
    label: String(comments.length)
  }), /*#__PURE__*/React.createElement(ActionBtn, {
    onClick: handleDownload,
    icon: "save",
    label: "保存"
  }), onCreateFromPop && /*#__PURE__*/React.createElement(ActionBtn, {
    onClick: () => {
      onCreateFromPop(pop);
      onClose();
    },
    icon: "edit",
    label: "作成"
  }), /*#__PURE__*/React.createElement(ActionBtn, {
    onClick: () => {
      setShowDelConfirm(true);
      setPwInput("");
      setPwError("");
    },
    icon: "trash",
    label: "削除"
  })), /*#__PURE__*/React.createElement("div", {
    style: {
      position: "absolute",
      left: 0,
      right: 64,
      bottom: 0,
      padding: "36px 14px 14px 68px",
      background: "linear-gradient(to top, rgba(0,0,0,0.72), transparent)",
      zIndex: 4
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 18,
      fontWeight: 900,
      color: "#fff",
      textShadow: "0 1px 4px rgba(0,0,0,0.6)",
      lineHeight: 1.3
    }
  }, pop.product_name), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 12,
      color: "rgba(255,255,255,0.9)",
      marginTop: 3,
      textShadow: "0 1px 3px rgba(0,0,0,0.6)"
    }
  }, "🏪 ", pop.store_name, "\u3000·\u3000", pop.category, pop.author ? `　·　${pop.author}` : ""), pop.comment && /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 12,
      color: "rgba(255,255,255,0.92)",
      marginTop: 6,
      lineHeight: 1.6,
      textShadow: "0 1px 3px rgba(0,0,0,0.6)",
      display: "-webkit-box",
      WebkitLineClamp: 2,
      WebkitBoxOrient: "vertical",
      overflow: "hidden"
    }
  }, pop.comment)), showDelConfirm && /*#__PURE__*/React.createElement("div", {
    style: {
      position: "absolute",
      inset: 0,
      background: "rgba(0,0,0,0.6)",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      zIndex: 10,
      padding: 20
    },
    onClick: () => {
      setShowDelConfirm(false);
      setPwInput("");
      setPwError("");
    }
  }, /*#__PURE__*/React.createElement("div", {
    onClick: e => e.stopPropagation(),
    style: {
      background: "#fff",
      borderRadius: 16,
      padding: "18px",
      width: "100%",
      maxWidth: 320
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 14,
      fontWeight: 800,
      color: "#d05050",
      marginBottom: 8
    }
  }, "本当に削除しますか？"), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 12,
      color: "var(--sub)",
      marginBottom: 10
    }
  }, "ヒント：本社の郵便番号"), /*#__PURE__*/React.createElement("input", {
    type: "password",
    value: pwInput,
    onChange: e => {
      setPwInput(e.target.value);
      setPwError("");
    },
    onKeyDown: e => e.key === "Enter" && handleDeleteConfirm(),
    placeholder: "パスワードを入力",
    autoFocus: true,
    style: {
      width: "100%",
      boxSizing: "border-box",
      padding: "11px 12px",
      border: `2px solid ${pwError ? "var(--primary)" : "#ffd0d0"}`,
      borderRadius: 9,
      fontSize: 14,
      outline: "none",
      marginBottom: 10
    }
  }), pwError && /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 12,
      color: "var(--primary)",
      fontWeight: 700,
      marginBottom: 8
    }
  }, pwError), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      gap: 8
    }
  }, /*#__PURE__*/React.createElement("button", {
    onClick: () => {
      setShowDelConfirm(false);
      setPwInput("");
      setPwError("");
    },
    style: {
      flex: 1,
      padding: "10px",
      background: "var(--chip)",
      color: "var(--text)",
      border: "none",
      borderRadius: 9,
      fontSize: 13,
      fontWeight: 800,
      cursor: "pointer"
    }
  }, "戻る"), /*#__PURE__*/React.createElement("button", {
    onClick: handleDeleteConfirm,
    disabled: deleting,
    style: {
      flex: 1,
      padding: "10px",
      background: "#d05050",
      color: "#fff",
      border: "none",
      borderRadius: 9,
      fontSize: 13,
      fontWeight: 800,
      cursor: "pointer",
      opacity: deleting ? 0.6 : 1
    }
  }, deleting ? "確認中…" : "削除する"))))), /*#__PURE__*/React.createElement("div", {
    id: "pd-comments",
    style: {
      padding: "14px 16px calc(18px + env(safe-area-inset-bottom))"
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 13,
      fontWeight: 900,
      color: "var(--ink)",
      marginBottom: 12
    }
  }, "コメント ", comments.length > 0 && /*#__PURE__*/React.createElement("span", {
    style: {
      color: "var(--faint)",
      fontWeight: 600
    }
  }, comments.length, "件")), comments.length > 0 && /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      flexDirection: "column",
      gap: 15,
      marginBottom: 16
    }
  }, comments.map(c => /*#__PURE__*/React.createElement("div", {
    key: c.id,
    style: {
      display: "flex",
      gap: 10,
      alignItems: "flex-start"
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      width: 30,
      height: 30,
      borderRadius: "50%",
      background: c.store_name ? "var(--chip)" : "var(--bg)",
      color: c.store_name ? "var(--text)" : "var(--faint)",
      fontSize: 12,
      fontWeight: 800,
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      flexShrink: 0
    }
  }, c.store_name ? c.store_name.slice(0, 1) : "·"), /*#__PURE__*/React.createElement("div", {
    style: {
      flex: 1,
      minWidth: 0
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      justifyContent: "space-between",
      alignItems: "baseline",
      marginBottom: 2
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 12.5,
      fontWeight: 800,
      color: c.store_name ? "var(--ink)" : "var(--sub)"
    }
  }, c.store_name || "ワンタップ返信"), /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 11,
      color: "var(--faint)"
    }
  }, timeAgo(c.created_at))), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 13.5,
      color: "var(--text)",
      lineHeight: 1.65,
      whiteSpace: "pre-wrap"
    }
  }, c.comment))))), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      gap: 8,
      alignItems: "flex-end"
    }
  }, /*#__PURE__*/React.createElement("select", {
    value: cStore,
    onChange: e => setCStore(e.target.value),
    style: {
      padding: "10px 8px",
      border: "1.5px solid var(--line)",
      borderRadius: 9,
      fontSize: 12.5,
      outline: "none",
      background: "#fff",
      flexShrink: 0,
      maxWidth: 110
    }
  }, STORES.map(s => /*#__PURE__*/React.createElement("option", {
    key: s
  }, s))), /*#__PURE__*/React.createElement("textarea", {
    value: cText,
    onChange: e => setCText(e.target.value),
    placeholder: "コメントを入力…",
    rows: 1,
    style: {
      flex: 1,
      padding: "10px 11px",
      border: "1.5px solid var(--line)",
      borderRadius: 9,
      fontSize: 13.5,
      resize: "none",
      fontFamily: "inherit",
      outline: "none",
      lineHeight: 1.5,
      maxHeight: 90
    }
  }), /*#__PURE__*/React.createElement("button", {
    onClick: handleAddComment,
    disabled: cSubmitting,
    style: {
      background: "var(--primary)",
      color: "#fff",
      border: "none",
      borderRadius: 9,
      padding: "10px 15px",
      fontSize: 13,
      fontWeight: 900,
      cursor: "pointer",
      opacity: cSubmitting ? 0.6 : 1,
      flexShrink: 0
    }
  }, cSubmitting ? "…" : "送信")), cError && /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 11.5,
      color: "var(--primary)",
      marginTop: 6
    }
  }, cError))));
}

// ── Pop Card (shared) ──
function PopCard({
  pop,
  index,
  onClick,
  hasComment
}) {
  return /*#__PURE__*/React.createElement("div", {
    style: {
      borderRadius: 14,
      overflow: "hidden",
      background: "white",
      boxShadow: "0 2px 10px rgba(0,0,0,0.07)",
      cursor: "pointer",
      animation: `fadeUp 0.3s ease ${Math.min(index, 10) * 0.04}s both`,
      transition: "all 0.15s"
    },
    onClick: () => onClick(pop),
    onMouseEnter: e => {
      e.currentTarget.style.transform = "translateY(-3px)";
      e.currentTarget.style.boxShadow = "0 10px 28px rgba(0,0,0,0.14)";
    },
    onMouseLeave: e => {
      e.currentTarget.style.transform = "none";
      e.currentTarget.style.boxShadow = "0 2px 10px rgba(0,0,0,0.07)";
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      background: "#efefef",
      minHeight: 120,
      position: "relative"
    }
  }, pop.image_url ? /*#__PURE__*/React.createElement("img", {
    src: pop.image_url,
    loading: "lazy",
    decoding: "async",
    className: "fdin",
    onLoad: e => e.target.classList.add("ld"),
    style: {
      width: "100%",
      display: "block"
    }
  }) : /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      height: 120,
      color: "var(--faint)",
      fontSize: 13
    }
  }, "読み込み中…"), /*#__PURE__*/React.createElement("div", {
    style: {
      position: "absolute",
      top: 6,
      right: 6,
      display: "flex",
      gap: 4
    }
  }, hasComment && /*#__PURE__*/React.createElement("div", {
    style: {
      background: "rgba(194,78,0,0.9)",
      color: "white",
      fontSize: 11,
      fontWeight: 900,
      padding: "2px 7px",
      borderRadius: 20
    }
  }, "コメント"), pop.likes > 0 && /*#__PURE__*/React.createElement("div", {
    style: {
      background: "rgba(255,107,107,0.9)",
      color: "white",
      fontSize: 11,
      fontWeight: 900,
      padding: "2px 7px",
      borderRadius: 20
    }
  }, pop.likes))), /*#__PURE__*/React.createElement("div", {
    style: {
      padding: "9px 12px",
      display: "flex",
      alignItems: "center",
      gap: 6
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontWeight: 800,
      fontSize: 13,
      whiteSpace: "nowrap",
      overflow: "hidden",
      textOverflow: "ellipsis",
      flex: 1,
      minWidth: 0
    }
  }, pop.product_name), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 11,
      color: "var(--sub)",
      whiteSpace: "nowrap",
      flexShrink: 0
    }
  }, pop.store_name), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 11,
      background: "var(--chip)",
      padding: "2px 8px",
      borderRadius: 20,
      fontWeight: 700,
      color: "var(--text)",
      whiteSpace: "nowrap",
      flexShrink: 0
    }
  }, pop.category)));
}

// ── Board Tab ──

;
Object.assign(window, {
  PopCard,
  PopDetail,
  UploadModal
});