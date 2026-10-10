function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
/* Nexus共有 — 07-tab-floor （自動分割・window共有） */
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
      maxWidth: 1600,
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
  }, "\u5404\u5E97\u306E\u58F2\u5834\u5199\u771F\u3092\u5171\u6709\u30FB\u6BD4\u8F03"), /*#__PURE__*/React.createElement("div", {
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
      background: mode === "gallery" ? "var(--card)" : "rgba(29,58,87,0.12)",
      color: mode === "gallery" ? "#111" : "#17324e"
    }
  }, "\u30AE\u30E3\u30E9\u30EA\u30FC"), /*#__PURE__*/React.createElement("button", {
    onClick: () => setMode("compare"),
    style: {
      padding: "8px 16px",
      borderRadius: 8,
      border: "none",
      cursor: "pointer",
      fontSize: 13,
      fontWeight: 700,
      background: mode === "compare" ? "var(--card)" : "rgba(29,58,87,0.12)",
      color: mode === "compare" ? "#111" : "#17324e"
    }
  }, "\u5E97\u8217\u6BD4\u8F03"), /*#__PURE__*/React.createElement("button", {
    onClick: () => setShowUp(true),
    style: {
      padding: "8px 16px",
      borderRadius: 8,
      border: "none",
      cursor: "pointer",
      fontSize: 13,
      fontWeight: 900,
      background: "var(--fill)",
      color: "white"
    }
  }, "\uFF0B \u6295\u7A3F")))), mode === "gallery" && /*#__PURE__*/React.createElement("div", {
    style: {
      maxWidth: 1600,
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
      background: fStore === val ? "#17181a" : "var(--card)",
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
      background: fCat === c ? "#111" : "var(--card)",
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
  }, "\u8AAD\u307F\u8FBC\u307F\u4E2D...")) : filtered.length === 0 ? /*#__PURE__*/React.createElement("div", {
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
  }, "\u5199\u771F\u304C\u307E\u3060\u3042\u308A\u307E\u305B\u3093"), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 13,
      marginTop: 6
    }
  }, "\u300C\uFF0B \u6295\u7A3F\u300D\u30DC\u30BF\u30F3\u304B\u3089\u58F2\u5834\u5199\u771F\u3092\u5171\u6709\u3057\u307E\u3057\u3087\u3046")) : /*#__PURE__*/React.createElement("div", {
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
      background: "var(--card)",
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
    alt: "",
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
      background: "var(--card)",
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
  }, "\u30AB\u30C6\u30B4\u30EA\u30FC\u3092\u9078\u3093\u3067\u5404\u5E97\u8217\u3092\u6BD4\u8F03"), /*#__PURE__*/React.createElement("div", {
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
      background: compareCat === c ? "#17181a" : "var(--card)",
      color: compareCat === c ? "white" : "#666"
    }
  }, c)))), loading ? /*#__PURE__*/React.createElement("div", {
    style: {
      textAlign: "center",
      padding: 60,
      color: "var(--faint)"
    }
  }, "\u8AAD\u307F\u8FBC\u307F\u4E2D...") : /*#__PURE__*/React.createElement("div", {
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
      background: "var(--card)",
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
  }, storePhotos.length, "\u679A")), storePhotos.length === 0 ? /*#__PURE__*/React.createElement("div", {
    style: {
      padding: "30px 14px",
      textAlign: "center",
      color: "var(--faint)"
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 12
    }
  }, "\u5199\u771F\u306A\u3057")) : /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
    style: {
      cursor: "pointer",
      position: "relative"
    },
    onClick: () => setSel(storePhotos[0])
  }, /*#__PURE__*/React.createElement("img", {
    alt: "",
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
    alt: p.store_name ? p.store_name + "の売場写真" : "売場写真",
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
      background: "var(--card)",
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
    alt: "",
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
  }, "\u2715"), /*#__PURE__*/React.createElement("div", {
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
  }, "\u6295\u7A3F\u8005\uFF1A", sel.author)), /*#__PURE__*/React.createElement("div", {
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
  }, "\u672C\u5F53\u306B\u524A\u9664\u3057\u307E\u3059\u304B\uFF1F"), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 12,
      color: "var(--sub)",
      marginBottom: 8
    }
  }, "\u30D2\u30F3\u30C8\uFF1A\u672C\u793E\u306E\u90F5\u4FBF\u756A\u53F7"), /*#__PURE__*/React.createElement("div", {
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
    placeholder: "\u30D1\u30B9\u30EF\u30FC\u30C9",
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
  }, "\u623B\u308B")), pwError && /*#__PURE__*/React.createElement("div", {
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
  }, "\u524A\u9664")))));
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
  const dzFloor = useDropZone(f => onFile({
    target: {
      files: [f]
    }
  }), "image");
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
      background: "var(--card)",
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
  }, "\u58F2\u5834\u5199\u771F\u3092\u6295\u7A3F"), /*#__PURE__*/React.createElement("button", {
    onClick: onClose,
    style: {
      background: "none",
      border: "none",
      fontSize: 22,
      cursor: "pointer",
      color: "var(--sub)"
    }
  }, "\u2715")), /*#__PURE__*/React.createElement("div", {
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
  }, "\u5E97\u8217"), /*#__PURE__*/React.createElement("select", {
    "aria-label": "\u5E97\u8217",
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
  }, "\u30AB\u30C6\u30B4\u30EA\u30FC"), /*#__PURE__*/React.createElement("select", {
    "aria-label": "\u7A2E\u985E",
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
  }, "\u304A\u540D\u524D ", /*#__PURE__*/React.createElement("span", {
    style: {
      color: "var(--primary)"
    }
  }, "*")), /*#__PURE__*/React.createElement("input", {
    value: author,
    onChange: e => setAuthor(e.target.value),
    placeholder: "\u4F8B\uFF1A\u5C71\u7530 \u592A\u90CE",
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
  }, "\u30B3\u30E1\u30F3\u30C8 ", /*#__PURE__*/React.createElement("span", {
    style: {
      fontWeight: 400,
      color: "var(--faint)"
    }
  }, "\uFF08\u4EFB\u610F\uFF09")), /*#__PURE__*/React.createElement("textarea", {
    value: comment,
    onChange: e => setComment(e.target.value),
    placeholder: "\u58F2\u308A\u5834\u306E\u72B6\u6CC1\u3084\u5DE5\u592B\u306A\u3069...",
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
  }, "\u5199\u771F ", /*#__PURE__*/React.createElement("span", {
    style: {
      color: "var(--primary)"
    }
  }, "*")), /*#__PURE__*/React.createElement("label", _extends({}, dzFloor.props, {
    style: {
      display: "block",
      border: "2px dashed #e0e0e0",
      borderRadius: 12,
      padding: 16,
      textAlign: "center",
      cursor: "pointer",
      background: preview ? "transparent" : "#fafafa",
      ...dzFloor.style
    }
  }), preview ? /*#__PURE__*/React.createElement("img", {
    alt: "",
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
  }, dzFloor.over ? "ここに離してください" : "タップして選択（ドラッグでもOK）"), /*#__PURE__*/React.createElement("input", {
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