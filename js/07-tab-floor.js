/* GoodDay 鮮魚共有 — 07-tab-floor （自動分割・window共有） */
var {
  useState,
  useEffect,
  useCallback,
  useRef
} = React;
function FloorPhotoTab() {
  const [photos, setPhotos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [mode, setMode] = useState("gallery"); // "gallery" | "compare"
  const [fStore, setFStore] = useState("");
  const [fCat, setFCat] = useState("");
  const [compareCat, setCompareCat] = useState(FLOOR_CATS[0]);
  const [showUp, setShowUp] = useState(false);
  const [sel, setSel] = useState(null);
  const [delTarget, setDelTarget] = useState(null);
  const [pwInput, setPwInput] = useState("");
  const [pwError, setPwError] = useState("");
  const [fDeleting, setFDeleting] = useState(false);
  const load = useCallback(async () => {
    setLoading(true);
    try {
      const data = await api.listFloorPhotos("", "");
      setPhotos(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, []);
  useEffect(() => {
    load();
  }, [load]);
  const filtered = photos.filter(p => (!fStore || p.store_name === fStore) && (!fCat || p.category === fCat));

  // 比較モード：カテゴリー選択 → 各店舗の最新写真を並べる
  const compareData = FLOOR_STORES.filter(s => s !== "推奨モデル").map(store => ({
    store,
    photos: photos.filter(p => p.store_name === store && p.category === compareCat)
  }));
  const handleDelete = async () => {
    if (fDeleting) return;
    setFDeleting(true);
    setPwError("");
    try {
      const ok = await api.verifyPassword("delete", pwInput);
      if (!ok) {
        setPwError("パスワードが違います");
        setPwInput("");
        setFDeleting(false);
        return;
      }
      await api.delFloorPhoto(delTarget.id);
      setPhotos(p => p.filter(x => x.id !== delTarget.id));
      setDelTarget(null);
      setSel(null);
      setPwInput("");
      setPwError("");
    } catch (e) {
      alert("削除に失敗しました");
    } finally {
      setFDeleting(false);
    }
  };
  return /*#__PURE__*/React.createElement("div", {
    className: "min-vh",
    style: {
      background: "var(--bg)"
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      background: "linear-gradient(180deg,#e7f1fa,#d3e5f4)",
      padding: "14px 16px"
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      maxWidth: 1080,
      margin: "0 auto",
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
      flexWrap: "wrap",
      gap: 10
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      color: "#17324e",
      fontSize: 14,
      fontWeight: 700,
      opacity: 0.9
    }
  }, "各店の売場写真を共有・比較"), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      gap: 8
    }
  }, /*#__PURE__*/React.createElement("button", {
    onClick: () => setMode("gallery"),
    style: {
      padding: "8px 16px",
      borderRadius: 8,
      border: "none",
      cursor: "pointer",
      fontSize: 13,
      fontWeight: 700,
      background: mode === "gallery" ? "white" : "rgba(29,58,87,0.12)",
      color: mode === "gallery" ? "#111" : "#17324e"
    }
  }, "ギャラリー"), /*#__PURE__*/React.createElement("button", {
    onClick: () => setMode("compare"),
    style: {
      padding: "8px 16px",
      borderRadius: 8,
      border: "none",
      cursor: "pointer",
      fontSize: 13,
      fontWeight: 700,
      background: mode === "compare" ? "white" : "rgba(29,58,87,0.12)",
      color: mode === "compare" ? "#111" : "#17324e"
    }
  }, "店舗比較"), /*#__PURE__*/React.createElement("button", {
    onClick: () => setShowUp(true),
    style: {
      padding: "8px 16px",
      borderRadius: 8,
      border: "none",
      cursor: "pointer",
      fontSize: 13,
      fontWeight: 900,
      background: "var(--primary)",
      color: "white"
    }
  }, "＋ 投稿")))), mode === "gallery" && /*#__PURE__*/React.createElement("div", {
    style: {
      maxWidth: 1080,
      margin: "0 auto",
      padding: "16px 16px 40px"
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      gap: 8,
      marginBottom: 12,
      flexWrap: "wrap"
    }
  }, [{
    lbl: "全店舗",
    val: ""
  }, ...FLOOR_STORES.map(s => ({
    lbl: s,
    val: s
  }))].map(({
    lbl,
    val
  }) => /*#__PURE__*/React.createElement("button", {
    key: lbl,
    onClick: () => setFStore(val),
    style: {
      padding: "6px 14px",
      borderRadius: 20,
      fontSize: 12,
      fontWeight: 700,
      border: "2px solid",
      cursor: "pointer",
      borderColor: fStore === val ? "#17181a" : "#ddd",
      background: fStore === val ? "#17181a" : "white",
      color: fStore === val ? "white" : "#666"
    }
  }, lbl))), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      gap: 8,
      marginBottom: 20,
      flexWrap: "wrap"
    }
  }, ["", ...FLOOR_CATS].map(c => /*#__PURE__*/React.createElement("button", {
    key: c || "all",
    onClick: () => setFCat(c),
    style: {
      padding: "6px 14px",
      borderRadius: 20,
      fontSize: 12,
      fontWeight: 700,
      border: "2px solid",
      cursor: "pointer",
      borderColor: fCat === c ? "#111" : "#ddd",
      background: fCat === c ? "#111" : "white",
      color: fCat === c ? "white" : "#666"
    }
  }, c || "すべて"))), loading ? /*#__PURE__*/React.createElement("div", {
    style: {
      textAlign: "center",
      padding: 80,
      color: "var(--faint)"
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      animation: "pulse 1.5s infinite"
    }
  }, "読み込み中...")) : filtered.length === 0 ? /*#__PURE__*/React.createElement("div", {
    style: {
      textAlign: "center",
      padding: 80,
      color: "var(--faint)"
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontWeight: 800,
      fontSize: 16,
      color: "var(--sub)"
    }
  }, "写真がまだありません"), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 13,
      marginTop: 6
    }
  }, "「＋ 投稿」ボタンから売場写真を共有しましょう")) : /*#__PURE__*/React.createElement("div", {
    style: {
      display: "grid",
      gridTemplateColumns: "repeat(auto-fill, minmax(158px, 1fr))",
      gap: 12,
      alignItems: "start"
    }
  }, filtered.map((photo, i) => /*#__PURE__*/React.createElement("div", {
    key: photo.id,
    style: {
      borderRadius: 14,
      overflow: "hidden",
      background: "white",
      boxShadow: "0 2px 10px rgba(0,0,0,0.07)",
      cursor: "pointer",
      animation: `fadeUp 0.3s ease ${Math.min(i, 10) * 0.04}s both`,
      transition: "all 0.15s"
    },
    onClick: () => setSel(photo),
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
  }, /*#__PURE__*/React.createElement("img", {
    src: photo.image_url,
    style: {
      width: "100%",
      display: "block"
    }
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      position: "absolute",
      top: 6,
      left: 6,
      background: "rgba(47,111,176,0.9)",
      color: "white",
      fontSize: 11,
      fontWeight: 900,
      padding: "2px 8px",
      borderRadius: 20
    }
  }, photo.category)), /*#__PURE__*/React.createElement("div", {
    style: {
      padding: "10px 12px"
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontWeight: 800,
      fontSize: 13,
      marginBottom: 3
    }
  }, photo.store_name), photo.comment && /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 12,
      color: "var(--text)",
      marginBottom: 3,
      overflow: "hidden",
      textOverflow: "ellipsis",
      whiteSpace: "nowrap"
    }
  }, photo.comment), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 11,
      color: "var(--faint)"
    }
  }, timeAgo(photo.created_at))))))), mode === "compare" && /*#__PURE__*/React.createElement("div", {
    style: {
      maxWidth: 1400,
      margin: "0 auto",
      padding: "16px 16px 40px"
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      background: "white",
      borderRadius: 14,
      padding: "16px 18px",
      marginBottom: 20,
      border: "1px solid var(--line)"
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 13,
      fontWeight: 800,
      color: "var(--ink)",
      marginBottom: 12
    }
  }, "カテゴリーを選んで各店舗を比較"), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      gap: 8,
      flexWrap: "wrap"
    }
  }, FLOOR_CATS.map(c => /*#__PURE__*/React.createElement("button", {
    key: c,
    onClick: () => setCompareCat(c),
    style: {
      padding: "8px 18px",
      borderRadius: 20,
      fontSize: 13,
      fontWeight: 700,
      border: "2px solid",
      cursor: "pointer",
      borderColor: compareCat === c ? "#17181a" : "#ddd",
      background: compareCat === c ? "#17181a" : "white",
      color: compareCat === c ? "white" : "#666"
    }
  }, c)))), loading ? /*#__PURE__*/React.createElement("div", {
    style: {
      textAlign: "center",
      padding: 60,
      color: "var(--faint)"
    }
  }, "読み込み中...") : /*#__PURE__*/React.createElement("div", {
    style: {
      display: "grid",
      gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))",
      gap: 14
    }
  }, compareData.map(({
    store,
    photos: storePhotos
  }) => /*#__PURE__*/React.createElement("div", {
    key: store,
    style: {
      background: "white",
      borderRadius: 14,
      overflow: "hidden",
      boxShadow: "0 2px 10px rgba(0,0,0,0.07)"
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      background: "linear-gradient(180deg,#e7f1fa,#d3e5f4)",
      padding: "10px 14px"
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 13,
      fontWeight: 900,
      color: "#17324e"
    }
  }, store), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 11,
      color: "rgba(255,255,255,0.7)",
      marginTop: 2
    }
  }, storePhotos.length, "枚")), storePhotos.length === 0 ? /*#__PURE__*/React.createElement("div", {
    style: {
      padding: "30px 14px",
      textAlign: "center",
      color: "var(--faint)"
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 12
    }
  }, "写真なし")) : /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
    style: {
      cursor: "pointer",
      position: "relative"
    },
    onClick: () => setSel(storePhotos[0])
  }, /*#__PURE__*/React.createElement("img", {
    src: storePhotos[0].image_url,
    style: {
      width: "100%",
      display: "block",
      maxHeight: 220,
      objectFit: "cover"
    }
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      position: "absolute",
      bottom: 6,
      right: 6,
      background: "rgba(0,0,0,0.55)",
      color: "white",
      fontSize: 11,
      padding: "2px 7px",
      borderRadius: 10
    }
  }, timeAgo(storePhotos[0].created_at))), storePhotos[0].comment && /*#__PURE__*/React.createElement("div", {
    style: {
      padding: "8px 12px",
      fontSize: 12,
      color: "var(--text)",
      borderBottom: "1px solid var(--line)",
      lineHeight: 1.5
    }
  }, storePhotos[0].comment), storePhotos.length > 1 && /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      gap: 4,
      padding: "8px 10px",
      overflowX: "auto"
    }
  }, storePhotos.slice(1).map(p => /*#__PURE__*/React.createElement("img", {
    key: p.id,
    src: p.image_url,
    onClick: () => setSel(p),
    style: {
      width: 50,
      height: 50,
      objectFit: "cover",
      borderRadius: 6,
      cursor: "pointer",
      flexShrink: 0,
      opacity: 0.75
    }
  })))))))), showUp && /*#__PURE__*/React.createElement(FloorUploadModal, {
    onClose: () => setShowUp(false),
    onSuccess: p => {
      setPhotos(prev => [p, ...prev]);
      setShowUp(false);
    }
  }), sel && /*#__PURE__*/React.createElement("div", {
    style: {
      position: "fixed",
      inset: 0,
      background: "rgba(0,0,0,0.75)",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      zIndex: 1000,
      padding: 16
    },
    onClick: () => {
      setSel(null);
      setDelTarget(null);
      setPwInput("");
      setPwError("");
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      background: "white",
      borderRadius: 20,
      width: "100%",
      maxWidth: 500,
      maxHeight: "90vh",
      overflowY: "auto",
      animation: "fadeUp 0.2s ease"
    },
    onClick: e => e.stopPropagation()
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      position: "relative"
    }
  }, /*#__PURE__*/React.createElement("img", {
    src: sel.image_url,
    style: {
      width: "100%",
      display: "block",
      borderRadius: "20px 20px 0 0"
    }
  }), /*#__PURE__*/React.createElement("button", {
    onClick: () => {
      setSel(null);
      setDelTarget(null);
      setPwInput("");
      setPwError("");
    },
    style: {
      position: "absolute",
      top: 12,
      right: 12,
      background: "rgba(0,0,0,0.5)",
      border: "none",
      color: "white",
      fontSize: 18,
      width: 36,
      height: 36,
      borderRadius: "50%",
      cursor: "pointer"
    }
  }, "✕"), /*#__PURE__*/React.createElement("div", {
    style: {
      position: "absolute",
      top: 12,
      left: 12,
      background: "rgba(47,111,176,0.9)",
      color: "white",
      fontSize: 12,
      fontWeight: 800,
      padding: "3px 10px",
      borderRadius: 20
    }
  }, sel.category)), /*#__PURE__*/React.createElement("div", {
    style: {
      padding: "16px 20px"
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      justifyContent: "space-between",
      alignItems: "flex-start",
      marginBottom: 8
    }
  }, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 17,
      fontWeight: 900
    }
  }, sel.store_name), sel.author && /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 13,
      color: "var(--sub)",
      marginTop: 2
    }
  }, "投稿者：", sel.author)), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 12,
      color: "var(--faint)"
    }
  }, formatDate(sel.created_at))), sel.comment && /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 14,
      color: "var(--text)",
      background: "var(--bg)",
      borderRadius: 10,
      padding: "10px 12px",
      lineHeight: 1.7,
      whiteSpace: "pre-wrap",
      marginBottom: 14
    }
  }, sel.comment), delTarget?.id === sel.id ? /*#__PURE__*/React.createElement("div", {
    style: {
      background: "#fff5f5",
      border: "2px solid #ffd0d0",
      borderRadius: 12,
      padding: "14px",
      marginBottom: 12
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 13,
      fontWeight: 700,
      color: "#d05050",
      marginBottom: 8
    }
  }, "本当に削除しますか？"), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 12,
      color: "var(--sub)",
      marginBottom: 8
    }
  }, "ヒント：本社の郵便番号"), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      gap: 8
    }
  }, /*#__PURE__*/React.createElement("input", {
    type: "password",
    value: pwInput,
    onChange: e => {
      setPwInput(e.target.value);
      setPwError("");
    },
    onKeyDown: e => e.key === "Enter" && handleDelete(),
    placeholder: "パスワード",
    autoFocus: true,
    style: {
      flex: 1,
      padding: "9px 12px",
      border: `2px solid ${pwError ? "var(--primary)" : "#ffd0d0"}`,
      borderRadius: 8,
      fontSize: 14,
      outline: "none"
    }
  }), /*#__PURE__*/React.createElement("button", {
    onClick: handleDelete,
    disabled: fDeleting,
    style: {
      padding: "9px 14px",
      background: fDeleting ? "#dba0a0" : "#d05050",
      color: "white",
      border: "none",
      borderRadius: 8,
      fontSize: 13,
      fontWeight: 700,
      cursor: fDeleting ? "default" : "pointer"
    }
  }, fDeleting ? "確認中…" : "削除"), /*#__PURE__*/React.createElement("button", {
    onClick: () => {
      setDelTarget(null);
      setPwInput("");
      setPwError("");
    },
    style: {
      padding: "9px 12px",
      background: "var(--chip)",
      color: "var(--text)",
      border: "none",
      borderRadius: 8,
      fontSize: 13,
      fontWeight: 700,
      cursor: "pointer"
    }
  }, "戻る")), pwError && /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 12,
      color: "var(--primary)",
      marginTop: 6
    }
  }, pwError)) : /*#__PURE__*/React.createElement("button", {
    onClick: () => setDelTarget(sel),
    style: {
      width: "100%",
      background: "#fff5f5",
      border: "2px solid #ffd0d0",
      borderRadius: 12,
      padding: "10px",
      fontSize: 14,
      fontWeight: 700,
      cursor: "pointer",
      color: "#d05050"
    }
  }, "削除")))));
}
function FloorUploadModal({
  onClose,
  onSuccess
}) {
  const [store, setStore] = useState(FLOOR_STORES[0]);
  const [category, setCategory] = useState(FLOOR_CATS[0]);
  const [author, setAuthor] = useState("");
  const [comment, setComment] = useState("");
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
    if (!file) {
      setError("写真を選択してください");
      return;
    }
    if (!author.trim()) {
      setError("お名前を入力してください");
      return;
    }
    setLoading(true);
    setError("");
    try {
      const image_url = await api.upload(file);
      const photo = await api.insertFloorPhoto({
        store_name: store,
        category,
        image_url,
        author: author.trim(),
        comment: comment.trim()
      });
      onSuccess(photo);
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
      background: "rgba(0,0,0,0.55)",
      display: "flex",
      alignItems: "flex-end",
      justifyContent: "center",
      zIndex: 1000
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      background: "white",
      borderRadius: "22px 22px 0 0",
      padding: "8px 24px calc(22px + env(safe-area-inset-bottom))",
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
      marginBottom: 18
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 21,
      fontWeight: 900
    }
  }, "売場写真を投稿"), /*#__PURE__*/React.createElement("button", {
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
      gap: 13
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      gap: 10
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      flex: 1
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 12,
      fontWeight: 700,
      color: "var(--text)",
      marginBottom: 5
    }
  }, "店舗"), /*#__PURE__*/React.createElement("select", {
    value: store,
    onChange: e => setStore(e.target.value),
    style: {
      width: "100%",
      padding: "9px 10px",
      border: "2px solid var(--line)",
      borderRadius: 8,
      fontSize: 13,
      outline: "none"
    }
  }, FLOOR_STORES.map(s => /*#__PURE__*/React.createElement("option", {
    key: s
  }, s)))), /*#__PURE__*/React.createElement("div", {
    style: {
      flex: 1
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 12,
      fontWeight: 700,
      color: "var(--text)",
      marginBottom: 5
    }
  }, "カテゴリー"), /*#__PURE__*/React.createElement("select", {
    value: category,
    onChange: e => setCategory(e.target.value),
    style: {
      width: "100%",
      padding: "9px 10px",
      border: "2px solid var(--line)",
      borderRadius: 8,
      fontSize: 13,
      outline: "none"
    }
  }, FLOOR_CATS.map(c => /*#__PURE__*/React.createElement("option", {
    key: c
  }, c))))), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 12,
      fontWeight: 700,
      color: "var(--text)",
      marginBottom: 5
    }
  }, "お名前 ", /*#__PURE__*/React.createElement("span", {
    style: {
      color: "var(--primary)"
    }
  }, "*")), /*#__PURE__*/React.createElement("input", {
    value: author,
    onChange: e => setAuthor(e.target.value),
    placeholder: "例：山田 太郎",
    style: {
      width: "100%",
      padding: "9px 12px",
      border: "2px solid var(--line)",
      borderRadius: 8,
      fontSize: 14,
      outline: "none"
    }
  })), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 12,
      fontWeight: 700,
      color: "var(--text)",
      marginBottom: 5
    }
  }, "コメント ", /*#__PURE__*/React.createElement("span", {
    style: {
      fontWeight: 400,
      color: "var(--faint)"
    }
  }, "（任意）")), /*#__PURE__*/React.createElement("textarea", {
    value: comment,
    onChange: e => setComment(e.target.value),
    placeholder: "売り場の状況や工夫など...",
    rows: 2,
    style: {
      width: "100%",
      padding: "9px 12px",
      border: "2px solid var(--line)",
      borderRadius: 8,
      fontSize: 13,
      resize: "vertical",
      fontFamily: "inherit",
      outline: "none"
    }
  })), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 12,
      fontWeight: 700,
      color: "var(--text)",
      marginBottom: 5
    }
  }, "写真 ", /*#__PURE__*/React.createElement("span", {
    style: {
      color: "var(--primary)"
    }
  }, "*")), /*#__PURE__*/React.createElement("label", {
    style: {
      display: "block",
      border: "2px dashed #e0e0e0",
      borderRadius: 12,
      padding: 16,
      textAlign: "center",
      cursor: "pointer",
      background: preview ? "transparent" : "#fafafa"
    }
  }, preview ? /*#__PURE__*/React.createElement("img", {
    src: preview,
    style: {
      maxWidth: "100%",
      maxHeight: 180,
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
  }))), error && /*#__PURE__*/React.createElement("div", {
    style: {
      color: "var(--primary)",
      fontSize: 13,
      fontWeight: 600
    }
  }, error), /*#__PURE__*/React.createElement("button", {
    onClick: submit,
    disabled: loading,
    style: {
      background: "#2f6fb0",
      color: "white",
      border: "none",
      borderRadius: 12,
      padding: "13px",
      fontSize: 15,
      fontWeight: 900,
      cursor: "pointer",
      opacity: loading ? 0.6 : 1
    }
  }, loading ? "投稿中..." : "投稿する"))));
}

// ── 発注バーコード Tab ──
// ドラッグ＋▲▼で並べ替えできるリスト用フック（タッチ対応）
function useDragList(list, setLocal, persist) {
  const containerRef = React.useRef(null);
  const st = React.useRef({
    list,
    idx: -1
  });
  st.current.list = list;
  const [dragIdx, setDragIdx] = useState(-1);
  const down = i => e => {
    e.preventDefault();
    st.current.idx = i;
    setDragIdx(i);
    try {
      e.currentTarget.setPointerCapture(e.pointerId);
    } catch (_) {}
  };
  const move = e => {
    const di = st.current.idx;
    if (di < 0) return;
    e.preventDefault();
    const cont = containerRef.current;
    if (!cont) return;
    const rows = Array.from(cont.querySelectorAll("[data-row]"));
    const y = e.clientY;
    let target = rows.length - 1;
    for (let k = 0; k < rows.length; k++) {
      const r = rows[k].getBoundingClientRect();
      if (y < r.top + r.height / 2) {
        target = k;
        break;
      }
    }
    if (target !== di && target >= 0) {
      const arr = st.current.list.slice();
      const [m] = arr.splice(di, 1);
      arr.splice(target, 0, m);
      st.current.list = arr;
      st.current.idx = target;
      setDragIdx(target);
      setLocal(arr);
    }
  };
  const up = e => {
    const di = st.current.idx;
    st.current.idx = -1;
    setDragIdx(-1);
    if (di >= 0) persist(st.current.list);
  };
  return {
    containerRef,
    dragIdx,
    down,
    move,
    up
  };
}

// バーコードのカテゴリ（発注先コードで仕分け）。codes:null は「すべて（全検索）」。
// ここを書き換えればカテゴリの中身（どの発注先を含めるか）を調整できる。
const TRAY_CATS = [{
  key: "all",
  label: "すべて",
  codes: null
}, {
  key: "tray",
  label: "包材・トレー",
  codes: ["876101", "874603"]
}, {
  key: "frozen",
  label: "冷食・たれ",
  codes: ["220001", "300701", "200401", "180101", "402203", "420201", "680701", "301403", "420401", "101"]
}, {
  key: "shizai",
  label: "資材",
  codes: ["880401"]
}, {
  key: "fresh",
  label: "生鮮",
  codes: ["990001", "999901", "999902"]
}];
;
Object.assign(window, {
  FloorPhotoTab,
  FloorUploadModal,
  TRAY_CATS,
  useDragList
});