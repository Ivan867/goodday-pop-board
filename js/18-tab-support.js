/* GoodDay 鮮魚共有 — 18-tab-support （店舗支援：画像を上げて見るだけ） */
var {
  useState,
  useEffect,
  useCallback,
  useRef
} = React;

// 番号で入る。消す機能は付けない（上げる・見る・落とすだけ）
const SUPPORT_PIN = "8";
const SUPPORT_CAT = "店舗支援";
function SupportTab() {
  const [unlocked, setUnlocked] = useState(() => {
    try {
      return sessionStorage.getItem("supportOpen") === "1";
    } catch (e) {
      return false;
    }
  });
  const [pin, setPin] = useState("");
  const [pinErr, setPinErr] = useState("");
  const [list, setList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(0); // 何枚目を上げているか
  const [total, setTotal] = useState(0);
  const [open, setOpen] = useState(null); // 拡大して見ている画像
  const fileRef = useRef(null);
  const load = useCallback(async () => {
    setLoading(true);
    try {
      setList((await api.listFloorPhotos(null, SUPPORT_CAT)) || []);
    } catch (e) {
      setList([]);
    }
    setLoading(false);
  }, []);
  useEffect(() => {
    if (unlocked) load();
  }, [unlocked, load]);
  const tryUnlock = () => {
    if (pin.trim() === SUPPORT_PIN) {
      setUnlocked(true);
      setPinErr("");
      try {
        sessionStorage.setItem("supportOpen", "1");
      } catch (e) {}
    } else {
      setPinErr("番号が違います");
      setPin("");
    }
  };
  const pick = async e => {
    const files = Array.from(e.target.files || []);
    e.target.value = "";
    if (!files.length) return;
    setTotal(files.length);
    for (let i = 0; i < files.length; i++) {
      setBusy(i + 1);
      try {
        const url = await api.upload(files[i]);
        await api.insertFloorPhoto({
          store_name: "共有",
          category: SUPPORT_CAT,
          image_url: url,
          comment: "",
          author: (() => {
            try {
              return localStorage.getItem("lastAuthor") || "";
            } catch (e) {
              return "";
            }
          })()
        });
      } catch (err) {/* 失敗は赤いお知らせが出る */}
    }
    setBusy(0);
    setTotal(0);
    load();
  };

  // ── 番号の入力 ──
  if (!unlocked) {
    return /*#__PURE__*/React.createElement("div", {
      style: {
        maxWidth: 420,
        margin: "0 auto",
        padding: "40px 20px 120px"
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        background: "var(--card, #fff)",
        border: "1px solid var(--line)",
        borderRadius: 16,
        padding: 24,
        textAlign: "center"
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        fontSize: 17,
        fontWeight: 900,
        color: "var(--ink)",
        marginBottom: 6
      }
    }, "\u5E97\u8217\u652F\u63F4"), /*#__PURE__*/React.createElement("div", {
      style: {
        fontSize: 13,
        color: "var(--sub)",
        marginBottom: 18
      }
    }, "\u756A\u53F7\u3092\u5165\u308C\u3066\u304F\u3060\u3055\u3044"), /*#__PURE__*/React.createElement("input", {
      value: pin,
      autoFocus: true,
      inputMode: "numeric",
      type: "password",
      onChange: e => {
        setPin(e.target.value);
        setPinErr("");
      },
      onKeyDown: e => {
        if (e.key === "Enter") tryUnlock();
      },
      placeholder: "\u756A\u53F7",
      style: {
        width: "100%",
        boxSizing: "border-box",
        border: "2px solid var(--line)",
        background: "var(--card, #fff)",
        color: "var(--ink)",
        borderRadius: 10,
        padding: "12px",
        fontSize: 16,
        textAlign: "center",
        outline: "none",
        marginBottom: pinErr ? 8 : 16
      }
    }), pinErr && /*#__PURE__*/React.createElement("div", {
      style: {
        fontSize: 13,
        color: "#b3261e",
        fontWeight: 700,
        marginBottom: 12
      }
    }, pinErr), /*#__PURE__*/React.createElement("button", {
      onClick: tryUnlock,
      style: {
        width: "100%",
        border: "none",
        background: "var(--primary)",
        color: "#fff",
        borderRadius: 10,
        padding: "13px",
        fontSize: 15,
        fontWeight: 800,
        cursor: "pointer"
      }
    }, "\u3072\u3089\u304F")));
  }

  // ── 本体 ──
  return /*#__PURE__*/React.createElement("div", {
    style: {
      maxWidth: 1100,
      margin: "0 auto",
      padding: "6px 16px 120px"
    }
  }, /*#__PURE__*/React.createElement("input", {
    ref: fileRef,
    type: "file",
    accept: "image/*",
    multiple: true,
    onChange: pick,
    style: {
      display: "none"
    }
  }), /*#__PURE__*/React.createElement("button", {
    onClick: () => fileRef.current && fileRef.current.click(),
    disabled: busy > 0,
    style: {
      width: "100%",
      border: "none",
      borderRadius: 12,
      padding: "15px 12px",
      marginBottom: 14,
      background: busy > 0 ? "var(--chip)" : "var(--primary-soft)",
      color: busy > 0 ? "var(--sub)" : "#fff",
      fontSize: 15.5,
      fontWeight: 900,
      cursor: busy > 0 ? "default" : "pointer",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      gap: 8
    }
  }, busy > 0 ? `上げています… ${busy}/${total}` : /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("svg", {
    width: "19",
    height: "19",
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: "2.3",
    strokeLinecap: "round",
    strokeLinejoin: "round"
  }, /*#__PURE__*/React.createElement("path", {
    d: "M12 16V5"
  }), /*#__PURE__*/React.createElement("path", {
    d: "M6.5 10.5L12 5l5.5 5.5"
  }), /*#__PURE__*/React.createElement("path", {
    d: "M4 19h16"
  })), "\u753B\u50CF\u3092\u4E0A\u3052\u308B")), loading ? /*#__PURE__*/React.createElement("div", {
    style: {
      textAlign: "center",
      color: "var(--sub)",
      fontSize: 13,
      padding: "40px 0"
    }
  }, "\u8AAD\u307F\u8FBC\u307F\u4E2D\u2026") : list.length === 0 ? /*#__PURE__*/React.createElement("div", {
    style: {
      textAlign: "center",
      color: "var(--sub)",
      fontSize: 13.5,
      lineHeight: 1.9,
      padding: "46px 0"
    }
  }, "\u307E\u3060\u4F55\u3082\u3042\u308A\u307E\u305B\u3093\u3002", /*#__PURE__*/React.createElement("br", null), "\u4E0A\u306E\u30DC\u30BF\u30F3\u304B\u3089\u753B\u50CF\u3092\u4E0A\u3052\u3066\u304F\u3060\u3055\u3044\u3002") : /*#__PURE__*/React.createElement("div", {
    style: {
      display: "grid",
      gridTemplateColumns: "repeat(auto-fill, minmax(150px, 1fr))",
      gap: 10
    }
  }, list.map(p => /*#__PURE__*/React.createElement("button", {
    key: p.id,
    onClick: () => setOpen(p),
    style: {
      border: "1px solid var(--line)",
      background: "var(--card, #fff)",
      borderRadius: 12,
      overflow: "hidden",
      padding: 0,
      cursor: "pointer",
      display: "block"
    }
  }, /*#__PURE__*/React.createElement("img", {
    src: p.image_url,
    alt: "",
    loading: "lazy",
    style: {
      width: "100%",
      aspectRatio: "3/4",
      objectFit: "cover",
      display: "block",
      background: "var(--chip)"
    }
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 11.5,
      color: "var(--sub)",
      padding: "7px 8px",
      textAlign: "left"
    }
  }, formatDate ? formatDate(p.created_at) : String(p.created_at || "").slice(0, 10))))), open && /*#__PURE__*/React.createElement("div", {
    onClick: () => setOpen(null),
    style: {
      position: "fixed",
      inset: 0,
      zIndex: 300,
      background: "rgba(8,14,20,0.92)",
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      padding: 16
    }
  }, /*#__PURE__*/React.createElement("img", {
    src: open.image_url,
    alt: "",
    style: {
      maxWidth: "100%",
      maxHeight: "calc(100vh - 150px)",
      objectFit: "contain",
      borderRadius: 6
    }
  }), /*#__PURE__*/React.createElement("div", {
    onClick: e => e.stopPropagation(),
    style: {
      display: "flex",
      gap: 10,
      marginTop: 16
    }
  }, /*#__PURE__*/React.createElement("a", {
    href: open.image_url,
    download: true,
    target: "_blank",
    rel: "noopener noreferrer",
    style: {
      border: "none",
      background: "var(--primary-soft)",
      color: "#fff",
      borderRadius: 10,
      padding: "12px 22px",
      fontSize: 14,
      fontWeight: 800,
      textDecoration: "none"
    }
  }, "\u4FDD\u5B58\u3059\u308B"), /*#__PURE__*/React.createElement("button", {
    onClick: () => setOpen(null),
    style: {
      border: "1px solid rgba(255,255,255,0.3)",
      background: "transparent",
      color: "#fff",
      borderRadius: 10,
      padding: "12px 22px",
      fontSize: 14,
      fontWeight: 800,
      cursor: "pointer"
    }
  }, "\u3068\u3058\u308B"))));
}
;
Object.assign(window, {
  SupportTab
});