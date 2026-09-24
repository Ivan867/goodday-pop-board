/* GoodDay 鮮魚共有 — 05-tab-board （自動分割・window共有） */
var {
  useState,
  useEffect,
  useCallback,
  useRef
} = React;

// ═══════════ TABS：機能タブ（Board / Search / 各ツール…） ═══════════
function BoardTab({
  currentStore,
  actionsRef,
  onCreateFromPop,
  radialOpen,
  setRadialOpen,
  tipEnabled,
  tipMessage,
  feat,
  onFeatGo
}) {
  const [pops, setPops] = useState([]);
  const [loading, setLoading] = useState(true);
  const [fStore, setFStore] = useState("");
  const [fCat, setFCat] = useState("");
  const [showUp, setShowUp] = useState(false);
  const [openGroup, setOpenGroup] = useState(null); // 開いているまとまり
  const grpSwipe = React.useRef(null);
  const [reloading, setReloading] = useState(false); // 更新ボタンの回転
  // 右から出る絞り込み（タグ・店舗・ことば）
  const [drawer, setDrawer] = useState(false);
  const [fGenre, setFGenre] = useState("");
  const [qText, setQText] = useState("");
  const clearFilters = () => {
    setFGenre("");
    setQText("");
    setFStore("");
    setFCat("");
  };
  const filterCount = (fGenre ? 1 : 0) + (qText.trim() ? 1 : 0) + (fStore ? 1 : 0) + (fCat ? 1 : 0);
  // 行事カレンダーを先に読んでおく（開いたときにすぐ出るように）
  useEffect(() => {
    const t = setTimeout(() => {
      const go = () => {
        try {
          if (window.prefetchBundles) window.prefetchBundles();
        } catch (e) {}
      };
      if (window.requestIdleCallback) window.requestIdleCallback(go, {
        timeout: 3000
      });else go();
    }, 1500);
    return () => clearTimeout(t);
  }, []);
  // 画面の明るさ
  const [dark, setDark] = useState(() => {
    try {
      return localStorage.getItem("theme") === "dark";
    } catch (e) {
      return false;
    }
  });
  const setDarkSave = v => {
    setDark(v);
    try {
      localStorage.setItem("theme", v ? "dark" : "light");
    } catch (e) {}
    try {
      const m = document.querySelector('meta[name="theme-color"]');
      if (m) m.setAttribute("content", v ? "#161d25" : "#F5F2EC");
    } catch (e) {}
  };
  useEffect(() => {
    try {
      document.documentElement.setAttribute("data-theme", dark ? "dark" : "light");
    } catch (e) {}
  }, [dark]); // まとまり画面のスワイプ判定
  // 文字サイズ（標準／拡大）
  const TEXT_SIZES = {
    sm: "12px",
    md: "14.5px",
    lg: "19px"
  };
  const [textSize, setTextSize] = useState(() => {
    try {
      const v = localStorage.getItem("textSize");
      if (v === "md" || v === "lg") return v;
      return localStorage.getItem("bigText") === "1" ? "lg" : "md"; // 前の設定を引き継ぐ
    } catch (e) {
      return "md";
    }
  });
  const setTextSizeSave = v => {
    setTextSize(v);
    try {
      localStorage.setItem("textSize", v);
    } catch (e) {}
  };
  useEffect(() => {
    try {
      document.documentElement.style.setProperty("--pc-name-size", TEXT_SIZES[textSize] || TEXT_SIZES.md);
    } catch (e) {}
  }, [textSize]);
  const [view, setView] = useState(() => {
    try {
      const v = localStorage.getItem("popView");
      return v === "md" || v === "lg" ? v : "md";
    } catch (e) {
      return "md";
    }
  });
  const setViewSave = v => {
    setView(v);
    try {
      localStorage.setItem("popView", v);
    } catch (e) {}
  };
  const [sel, setSel] = useState(null);
  const [commentedIds, setCommentedIds] = useState(new Set());
  const [radialChanged, setRadialChanged] = useState(false);
  const [hubSpin, setHubSpin] = useState(false);
  const [showNotice, setShowNotice] = useState(true);
  const [featShow, setFeatShow] = useState(() => {
    try {
      const seen = localStorage.getItem("featSeen");
      return !feat || seen !== (feat.ver || feat.message);
    } catch (e) {
      return true;
    }
  });
  const tipOn = tipEnabled !== false;
  const tipText = tipMessage || "季節のポップや時期が過ぎたポップは「アーカイブ」に収納されます。";
  const load = useCallback(async () => {
    setLoading(true);
    try {
      const data = await api.listActive();
      setPops(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, []);
  useEffect(() => {
    load();
  }, [load]);
  useEffect(() => {
    if (actionsRef) actionsRef.current = {
      refresh: load,
      openUpload: () => setShowUp(true)
    };
  }, [load, actionsRef]);
  useEffect(() => {
    if (!showNotice) return;
    const el = scroller();
    if (!el) return;
    const onScroll = () => setShowNotice(false);
    el.addEventListener("scroll", onScroll, {
      passive: true
    });
    return () => el.removeEventListener("scroll", onScroll);
  }, [showNotice]);
  useEffect(() => {
    if (!radialOpen) return;
    const el = scroller();
    if (!el) return;
    const onScroll = () => {
      setRadialOpen(false);
      setRadialChanged(false);
    };
    el.addEventListener("scroll", onScroll, {
      passive: true
    });
    return () => el.removeEventListener("scroll", onScroll);
  }, [radialOpen]);
  const counts = pops.reduce((a, p) => {
    a[p.store_name] = (a[p.store_name] || 0) + 1;
    return a;
  }, {});
  const qn = normJa(qText.trim());
  const filtered = pops.filter(p => (!fStore || p.store_name === fStore) && (!fCat || p.category === fCat) && (!fGenre || p.genre === fGenre) && (!qn || [p.product_name, p.group_name, p.comment, p.author, p.store_name].some(x => x && normJa(String(x)).includes(qn)))).sort((a, b) => (b.is_pinned ? 1 : 0) - (a.is_pinned ? 1 : 0));
  const handleHubClick = () => {
    if (!radialChanged) {
      setRadialOpen(v => !v);
      return;
    } // 未選択時は開閉トグル（写真を広く見たい時用）
    setHubSpin(true);
    load();
    setTimeout(() => {
      setHubSpin(false);
      setRadialChanged(false);
    }, 380); // 更新後も輪は開いたまま
  };
  const pickStore = val => {
    setFStore(val);
    setRadialChanged(true);
  };
  const pickCat = val => {
    setFCat(val);
    setRadialChanged(true);
  };
  const storeItems = [{
    lbl: "全店舗",
    val: ""
  }, ...STORES.filter(s => (counts[s] || 0) > 0).map(s => ({
    lbl: s,
    val: s
  }))];
  const catItems = ["", ...CATEGORIES].map(c => ({
    lbl: c || "すべて",
    val: c
  }));
  const storePos = arcPositions(storeItems.length, 104, 150, 30);
  const catPos = arcPositions(catItems.length, 152, 158, 22);
  const FAN_BOTTOM = "calc(92px + env(safe-area-inset-bottom))";
  return /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("div", {
    style: {
      maxWidth: 1600,
      margin: "0 auto",
      padding: "9px 16px 185px"
    }
  }, /*#__PURE__*/React.createElement("div", {
    className: "board-top",
    style: {
      display: "grid",
      gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
      gap: 8,
      marginBottom: 10
    }
  }, [["__upload", "投稿", false, /*#__PURE__*/React.createElement("svg", {
    key: "d",
    width: "19",
    height: "19",
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: "2.4",
    strokeLinecap: "round",
    strokeLinejoin: "round"
  }, /*#__PURE__*/React.createElement("path", {
    d: "M12 5v14M5 12h14"
  }))], ["search", "検索", false, /*#__PURE__*/React.createElement("svg", {
    key: "e",
    width: "18",
    height: "18",
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: "2.1",
    strokeLinecap: "round",
    strokeLinejoin: "round"
  }, /*#__PURE__*/React.createElement("circle", {
    cx: "11",
    cy: "11",
    r: "7"
  }), /*#__PURE__*/React.createElement("path", {
    d: "M20 20l-3.6-3.6"
  }))]].map(([key, label, primary, icon]) => /*#__PURE__*/React.createElement("button", {
    key: key,
    onClick: () => {
      if (key === "__upload") setShowUp(true);else if (key === "search") setDrawer(true);else if (onFeatGo) onFeatGo(key);
    },
    className: "hig-pill",
    style: {
      display: "flex",
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      gap: 6,
      border: primary ? "none" : "1px solid var(--line)",
      background: primary ? "var(--primary-soft, #4a7ab0)" : "var(--card, #fff)",
      color: primary ? "#fff" : "var(--primary-soft, #4a7ab0)",
      borderRadius: 11,
      padding: "9px 4px",
      minHeight: 44,
      cursor: "pointer",
      boxShadow: primary ? "0 2px 8px rgba(74,122,176,0.3)" : "0 1px 3px rgba(0,0,0,0.05)"
    }
  }, icon, /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 14,
      fontWeight: 800,
      color: primary ? "#fff" : "var(--ink)",
      whiteSpace: "nowrap"
    }
  }, label)))), /*#__PURE__*/React.createElement(TodayInfoCard, null), feat && feat.enabled && feat.message && featShow && /*#__PURE__*/React.createElement("div", {
    onClick: () => {
      if (feat.tab && onFeatGo) onFeatGo(feat.tab);
    },
    style: {
      display: "flex",
      alignItems: "center",
      gap: 10,
      background: "linear-gradient(135deg,#2f6fb0,#4a8fd4)",
      borderRadius: 14,
      padding: "12px 14px",
      marginBottom: 12,
      cursor: feat.tab ? "pointer" : "default",
      boxShadow: "0 4px 16px rgba(47,111,176,0.22)",
      animation: "fadeUp .35s ease"
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 20,
      flexShrink: 0
    }
  }, "\uD83C\uDF89"), /*#__PURE__*/React.createElement("div", {
    style: {
      minWidth: 0,
      flex: 1
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 11.5,
      fontWeight: 800,
      color: "rgba(255,255,255,0.8)"
    }
  }, "\u65B0\u6A5F\u80FD\u306E\u304A\u77E5\u3089\u305B"), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 13,
      fontWeight: 800,
      color: "#fff",
      lineHeight: 1.4
    }
  }, feat.message)), feat.tab && /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 12,
      fontWeight: 800,
      color: "#2f6fb0",
      background: "#fff",
      borderRadius: 8,
      padding: "4px 10px",
      flexShrink: 0
    }
  }, "\u3072\u3089\u304F"), /*#__PURE__*/React.createElement("button", {
    onClick: e => {
      e.stopPropagation();
      try {
        localStorage.setItem("featSeen", feat.ver || feat.message);
      } catch (x) {}
      setFeatShow(false);
    },
    style: {
      border: "none",
      background: "rgba(255,255,255,0.2)",
      color: "#fff",
      width: 26,
      height: 26,
      borderRadius: "50%",
      fontSize: 14,
      fontWeight: 800,
      cursor: "pointer",
      flexShrink: 0,
      lineHeight: 1
    }
  }, "\u2715")), tipOn && showNotice && !radialOpen && /*#__PURE__*/React.createElement("div", {
    onClick: () => setShowNotice(false),
    style: {
      position: "fixed",
      left: 0,
      right: 0,
      bottom: "calc(90px + env(safe-area-inset-bottom))",
      zIndex: 150,
      padding: "0 12px",
      cursor: "pointer",
      animation: "fadeUp .35s ease"
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      maxWidth: 1600,
      margin: "0 auto",
      display: "flex",
      alignItems: "center",
      gap: 10,
      background: "linear-gradient(135deg,#fff3ea,#ffe9d6)",
      border: "1.5px solid #ffd9bd",
      borderRadius: 14,
      padding: "12px 14px",
      boxShadow: "0 4px 16px rgba(194,78,0,0.18)"
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 13,
      fontWeight: 700,
      color: "#a8480a",
      lineHeight: 1.5,
      flex: 1
    }
  }, tipText))), loading ? /*#__PURE__*/React.createElement("div", {
    className: "pop-grid v-" + view
  }, [210, 150, 180, 230, 160, 200, 140, 190].map((h, i) => /*#__PURE__*/React.createElement("div", {
    key: i,
    style: {
      background: "#fff",
      border: "1px solid var(--line)",
      borderRadius: 14,
      overflow: "hidden"
    }
  }, /*#__PURE__*/React.createElement("div", {
    className: "sk",
    style: {
      width: "100%",
      height: h
    }
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      padding: "9px 11px"
    }
  }, /*#__PURE__*/React.createElement("div", {
    className: "sk",
    style: {
      width: "62%",
      height: 11,
      borderRadius: 6
    }
  }), /*#__PURE__*/React.createElement("div", {
    className: "sk",
    style: {
      width: "40%",
      height: 10,
      borderRadius: 6,
      marginTop: 7
    }
  }))))) : filtered.length === 0 ? /*#__PURE__*/React.createElement("div", {
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
  }, "\u30DD\u30C3\u30D7\u304C\u307E\u3060\u3042\u308A\u307E\u305B\u3093"), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 13
    }
  }, "\u30A2\u30C3\u30D7\u30ED\u30FC\u30C9\u30DC\u30BF\u30F3\u304B\u3089\u6700\u521D\u306E\u30DD\u30C3\u30D7\u3092\u5171\u6709\u3057\u307E\u3057\u3087\u3046\uFF01")) : /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("div", {
    className: "board-tools",
    style: {
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      gap: 4,
      marginBottom: 10
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      gap: 2,
      background: "var(--chip)",
      borderRadius: 10,
      padding: 3,
      flexShrink: 0
    }
  }, [["md", "A"], ["lg", "A"]].map(([v, l], idx) => /*#__PURE__*/React.createElement("button", {
    key: v,
    onClick: () => setTextSizeSave(v),
    "aria-pressed": textSize === v,
    "aria-label": idx === 0 ? "文字を中くらいにする" : "文字を大きくする",
    className: "bt-seg bt-a" + (idx === 0 ? " bt-a-s" : " bt-a-l"),
    style: {
      border: "none",
      background: textSize === v ? "var(--card, #fff)" : "transparent",
      color: textSize === v ? "var(--ink)" : "var(--sub)",
      borderRadius: 7,
      padding: 0,
      fontWeight: 800,
      cursor: "pointer",
      lineHeight: 1,
      boxShadow: textSize === v ? "0 1px 2px rgba(0,0,0,0.12)" : "none"
    }
  }, l))), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      gap: 3,
      background: "var(--chip)",
      borderRadius: 10,
      padding: 3,
      flexShrink: 0
    }
  }, [["md", "2まい", /*#__PURE__*/React.createElement("svg", {
    key: "3",
    width: "18",
    height: "18",
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: "1.8"
  }, /*#__PURE__*/React.createElement("rect", {
    x: "3",
    y: "3",
    width: "8",
    height: "8"
  }), /*#__PURE__*/React.createElement("rect", {
    x: "13",
    y: "3",
    width: "8",
    height: "8"
  }), /*#__PURE__*/React.createElement("rect", {
    x: "3",
    y: "13",
    width: "8",
    height: "8"
  }), /*#__PURE__*/React.createElement("rect", {
    x: "13",
    y: "13",
    width: "8",
    height: "8"
  }))], ["lg", "1まい", /*#__PURE__*/React.createElement("svg", {
    key: "4",
    width: "18",
    height: "18",
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: "1.8"
  }, /*#__PURE__*/React.createElement("rect", {
    x: "3",
    y: "3",
    width: "18",
    height: "18",
    rx: "1.5"
  }))]].map(([k, label, icon]) => /*#__PURE__*/React.createElement("button", {
    key: k,
    onClick: () => setViewSave(k),
    title: label,
    "aria-label": label,
    className: "bt-seg",
    style: {
      border: "none",
      background: view === k ? "var(--card, #fff)" : "transparent",
      color: view === k ? "var(--primary-soft)" : "var(--sub)",
      borderRadius: 7,
      padding: 0,
      cursor: "pointer",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      boxShadow: view === k ? "0 1px 3px rgba(0,0,0,0.12)" : "none"
    }
  }, icon))), /*#__PURE__*/React.createElement("button", {
    onClick: () => onFeatGo && onFeatGo("bundle"),
    "aria-label": "\u884C\u4E8B\u30AB\u30EC\u30F3\u30C0\u30FC\u3092\u958B\u304F",
    title: "\u884C\u4E8B\u30AB\u30EC\u30F3\u30C0\u30FC",
    style: {
      border: "1px solid var(--line)",
      background: "var(--card, #fff)",
      color: "var(--primary-soft)",
      borderRadius: 10,
      padding: 0,
      cursor: "pointer",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      flexShrink: 0
    },
    className: "bt-btn"
  }, /*#__PURE__*/React.createElement("svg", {
    width: "19",
    height: "19",
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: "2",
    strokeLinecap: "round",
    strokeLinejoin: "round"
  }, /*#__PURE__*/React.createElement("rect", {
    x: "3",
    y: "5",
    width: "18",
    height: "16",
    rx: "2.5"
  }), /*#__PURE__*/React.createElement("path", {
    d: "M3 10h18M8 3v4M16 3v4"
  }))), /*#__PURE__*/React.createElement("button", {
    onClick: () => onFeatGo && onFeatGo("idea"),
    "aria-label": "\u30A2\u30A4\u30C7\u30A2\u3092\u958B\u304F",
    title: "\u30A2\u30A4\u30C7\u30A2",
    style: {
      border: "1px solid var(--line)",
      background: "var(--card, #fff)",
      color: "var(--primary-soft)",
      borderRadius: 10,
      padding: 0,
      cursor: "pointer",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      flexShrink: 0
    },
    className: "bt-btn"
  }, /*#__PURE__*/React.createElement("svg", {
    width: "19",
    height: "19",
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: "2",
    strokeLinecap: "round",
    strokeLinejoin: "round"
  }, /*#__PURE__*/React.createElement("path", {
    d: "M9 18h6M10 21h4"
  }), /*#__PURE__*/React.createElement("path", {
    d: "M12 3a6 6 0 00-3.6 10.8c.7.5 1.1 1.3 1.1 2.2h5c0-.9.4-1.7 1.1-2.2A6 6 0 0012 3z"
  }))), /*#__PURE__*/React.createElement("button", {
    onClick: async () => {
      if (reloading) return;
      setReloading(true);
      try {
        await load();
        try {
          window.__bundleCache = null;
        } catch (e) {}
        try {
          window.dispatchEvent(new CustomEvent("appToast", {
            detail: "新しくしました"
          }));
        } catch (e) {}
      } finally {
        setTimeout(() => setReloading(false), 400);
      }
    },
    "aria-label": "\u6700\u65B0\u306E\u72B6\u614B\u306B\u3059\u308B",
    title: "\u66F4\u65B0",
    disabled: reloading,
    style: {
      border: "1px solid var(--line)",
      background: "var(--card, #fff)",
      color: "var(--primary-soft)",
      borderRadius: 10,
      padding: 0,
      cursor: "pointer",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      flexShrink: 0
    },
    className: "bt-btn"
  }, /*#__PURE__*/React.createElement("svg", {
    width: "19",
    height: "19",
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: "2",
    strokeLinecap: "round",
    strokeLinejoin: "round",
    style: {
      animation: reloading ? "spinR 0.8s linear infinite" : "none"
    }
  }, /*#__PURE__*/React.createElement("path", {
    d: "M20 12a8 8 0 11-2.3-5.6"
  }), /*#__PURE__*/React.createElement("path", {
    d: "M20 4v5h-5"
  }))), /*#__PURE__*/React.createElement("button", {
    onClick: () => setDarkSave(!dark),
    "aria-pressed": dark,
    "aria-label": dark ? "明るい画面にする" : "暗い画面にする",
    style: {
      border: "1px solid var(--line)",
      background: "var(--card, #fff)",
      borderRadius: 10,
      padding: 0,
      cursor: "pointer",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      color: "var(--primary-soft)",
      flexShrink: 0
    },
    className: "bt-btn"
  }, dark ? /*#__PURE__*/React.createElement("svg", {
    width: "19",
    height: "19",
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: "2",
    strokeLinecap: "round",
    strokeLinejoin: "round"
  }, /*#__PURE__*/React.createElement("circle", {
    cx: "12",
    cy: "12",
    r: "4.2"
  }), /*#__PURE__*/React.createElement("path", {
    d: "M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"
  })) : /*#__PURE__*/React.createElement("svg", {
    width: "19",
    height: "19",
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: "2",
    strokeLinecap: "round",
    strokeLinejoin: "round"
  }, /*#__PURE__*/React.createElement("path", {
    d: "M20 14.5A8.5 8.5 0 019.5 4a8.5 8.5 0 1010.5 10.5z"
  })))), /*#__PURE__*/React.createElement("div", {
    className: "pop-grid v-" + view
  }, (() => {
    // 同じまとまりは1件にたたむ（表紙に選んだ1枚＝group_posが小さいものを代表にする）
    const seen = {};
    const list = [];
    filtered.forEach(pop => {
      if (pop.group_id) {
        const cur = seen[pop.group_id];
        if (cur) {
          cur.__count++;
          // より表紙に近いもの（group_posが小さい）が来たら、絵だけ差し替える
          const a = pop.group_pos == null ? 9999 : pop.group_pos;
          const b = cur.group_pos == null ? 9999 : cur.group_pos;
          if (a < b) {
            cur.image_url = pop.image_url;
            cur.rotation = pop.rotation;
            cur.group_pos = pop.group_pos;
            cur.img_w = pop.img_w;
            cur.img_h = pop.img_h;
            cur.__imgId = pop.id; // 絵の縦横も表紙のものに
          }
          return;
        }
        const head = {
          ...pop,
          __count: 1,
          __group: true,
          __imgId: pop.id
        };
        seen[pop.group_id] = head;
        list.push(head);
      } else list.push(pop);
    });
    // 2まい表示：縦長どうし・横長どうしを同じ段に
    const cols = typeof window !== "undefined" && window.innerWidth >= 620 ? 3 : 2;
    const shown = view === "md" ? pairByShape(list, cols) : list;
    return shown.map((pop, i) => /*#__PURE__*/React.createElement(PopCard, {
      key: pop.id,
      pop: pop,
      index: i,
      onClick: () => pop.__group ? setOpenGroup(pop) : setSel(pop),
      hasComment: (pop.comment_count || 0) > 0 || commentedIds.has(pop.id)
    }));
  })()))), openGroup && (() => {
    const inGroup = pops.filter(p => p.group_id === openGroup.group_id).sort((a, b) => (a.group_pos || 0) - (b.group_pos || 0));
    return /*#__PURE__*/React.createElement("div", {
      onTouchStart: e => {
        const t = e.touches[0];
        grpSwipe.current = {
          x: t.clientX,
          y: t.clientY,
          t: Date.now()
        };
      },
      onTouchEnd: e => {
        const st = grpSwipe.current;
        if (!st) return;
        const t = e.changedTouches[0];
        const dx = t.clientX - st.x,
          dy = t.clientY - st.y;
        // 横に大きく、縦は小さく動かしたら「もどる」（右でも左でもよい）
        if (Math.abs(dx) > 70 && Math.abs(dy) < 60 && Date.now() - st.t < 700) setOpenGroup(null);
        grpSwipe.current = null;
      },
      className: "fs-top",
      style: {
        position: "fixed",
        inset: 0,
        zIndex: 900,
        background: "var(--bg)",
        overflowY: "auto",
        WebkitOverflowScrolling: "touch"
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        position: "sticky",
        top: 0,
        zIndex: 2,
        background: "var(--primary)",
        color: "#fff",
        padding: "10px 14px",
        display: "flex",
        alignItems: "center",
        gap: 10
      }
    }, /*#__PURE__*/React.createElement("button", {
      onClick: () => setOpenGroup(null),
      "aria-label": "\u3082\u3069\u308B",
      style: {
        border: "none",
        background: "rgba(255,255,255,0.22)",
        color: "#fff",
        borderRadius: 999,
        padding: "7px 14px 7px 10px",
        display: "flex",
        alignItems: "center",
        gap: 4,
        fontSize: 13.5,
        fontWeight: 800,
        cursor: "pointer",
        flexShrink: 0
      }
    }, /*#__PURE__*/React.createElement("svg", {
      width: "15",
      height: "15",
      viewBox: "0 0 24 24",
      fill: "none",
      stroke: "currentColor",
      strokeWidth: "2.6",
      strokeLinecap: "round",
      strokeLinejoin: "round"
    }, /*#__PURE__*/React.createElement("path", {
      d: "M15 5l-7 7 7 7"
    })), "\u3082\u3069\u308B"), /*#__PURE__*/React.createElement("span", {
      style: {
        minWidth: 0,
        flex: 1
      }
    }, /*#__PURE__*/React.createElement("span", {
      style: {
        display: "block",
        fontSize: 15.5,
        fontWeight: 800,
        overflow: "hidden",
        textOverflow: "ellipsis",
        whiteSpace: "nowrap"
      }
    }, openGroup.group_name || openGroup.product_name), /*#__PURE__*/React.createElement("span", {
      style: {
        display: "block",
        fontSize: 11.5,
        opacity: 0.85
      }
    }, inGroup.length, "\u679A \uFF0F ", openGroup.store_name, " \uFF0F \u6A2A\u306B\u30B9\u30EF\u30A4\u30D7\u3067\u3082\u3069\u308B"))), /*#__PURE__*/React.createElement("div", {
      style: {
        maxWidth: 1600,
        margin: "0 auto",
        padding: "12px 14px 120px"
      }
    }, /*#__PURE__*/React.createElement("div", {
      className: "pop-grid v-" + view
    }, (view === "md" ? pairByShape(inGroup, window.innerWidth >= 620 ? 3 : 2) : inGroup).map((pop, i) => /*#__PURE__*/React.createElement(PopCard, {
      key: pop.id,
      pop: pop,
      index: i,
      onClick: setSel,
      hasComment: (pop.comment_count || 0) > 0 || commentedIds.has(pop.id)
    })))));
  })(), drawer && /*#__PURE__*/React.createElement("div", {
    onClick: () => setDrawer(false),
    style: {
      position: "fixed",
      inset: 0,
      zIndex: 1250,
      background: "rgba(12,18,26,0.5)"
    }
  }, /*#__PURE__*/React.createElement("div", {
    onClick: e => e.stopPropagation(),
    className: "fs-top",
    style: {
      position: "absolute",
      top: 0,
      right: 0,
      bottom: 0,
      width: "min(360px, 88vw)",
      background: "var(--card, #fff)",
      boxShadow: "-6px 0 24px rgba(10,20,35,0.25)",
      display: "flex",
      flexDirection: "column",
      animation: "drawerIn .24s cubic-bezier(.16,1,.3,1)"
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      alignItems: "center",
      gap: 8,
      padding: "12px 14px 10px",
      borderBottom: "1px solid var(--line)"
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 16,
      fontWeight: 900,
      color: "var(--ink)"
    }
  }, "\u3055\u304C\u3059"), /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 12.5,
      fontWeight: 800,
      color: "var(--sub)"
    }
  }, filtered.length, "\u4EF6"), /*#__PURE__*/React.createElement("button", {
    onClick: () => setDrawer(false),
    "aria-label": "\u9589\u3058\u308B",
    style: {
      marginLeft: "auto",
      border: "none",
      background: "var(--chip)",
      color: "var(--sub)",
      borderRadius: 9,
      width: 34,
      height: 34,
      cursor: "pointer",
      fontSize: 15,
      fontWeight: 900
    }
  }, "\u2715")), /*#__PURE__*/React.createElement("div", {
    style: {
      flex: "1 1 auto",
      overflowY: "auto",
      padding: "12px 14px 20px",
      WebkitOverflowScrolling: "touch"
    }
  }, /*#__PURE__*/React.createElement("input", {
    value: qText,
    onChange: e => setQText(e.target.value),
    placeholder: "\u3053\u3068\u3070\u3067\u3055\u304C\u3059\uFF08\u3055\u3093\u307E\u30FB\u523A\u8EAB \u306A\u3069\uFF09",
    style: {
      width: "100%",
      boxSizing: "border-box",
      border: "1.5px solid var(--line)",
      borderRadius: 11,
      padding: "12px 13px",
      fontSize: 15,
      outline: "none",
      fontFamily: "inherit",
      background: "var(--card, #fff)",
      color: "var(--ink)",
      marginBottom: 16
    }
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 12,
      fontWeight: 800,
      color: "var(--sub)",
      marginBottom: 8
    }
  }, "\u30B8\u30E3\u30F3\u30EB"), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      flexWrap: "wrap",
      gap: 6,
      marginBottom: 18
    }
  }, [["", "すべて"]].concat(GENRES.map(g => [g, g])).map(([v, l]) => {
    const on = fGenre === v;
    const c = GENRE_COLORS[v];
    return /*#__PURE__*/React.createElement("button", {
      key: l,
      onClick: () => setFGenre(v),
      "aria-pressed": on,
      style: {
        border: on ? "none" : "1px solid var(--line)",
        cursor: "pointer",
        background: on ? c ? c.solid : "var(--primary)" : c ? c.soft : "var(--card, #fff)",
        color: on ? "#fff" : c ? c.text : "var(--text)",
        borderRadius: 999,
        padding: "8px 13px",
        fontSize: 13,
        fontWeight: 800
      }
    }, l);
  })), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 12,
      fontWeight: 800,
      color: "var(--sub)",
      marginBottom: 8
    }
  }, "\u304A\u5E97"), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      flexWrap: "wrap",
      gap: 6,
      marginBottom: 18
    }
  }, [["", "全店"]].concat(STORES.map(x => [x, x])).map(([v, l]) => {
    const on = fStore === v;
    return /*#__PURE__*/React.createElement("button", {
      key: l,
      onClick: () => setFStore(v),
      "aria-pressed": on,
      style: {
        border: on ? "none" : "1px solid var(--line)",
        cursor: "pointer",
        background: on ? "var(--primary)" : "var(--card, #fff)",
        color: on ? "#fff" : "var(--text)",
        borderRadius: 999,
        padding: "8px 13px",
        fontSize: 13,
        fontWeight: 800
      }
    }, l);
  })), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 12,
      fontWeight: 800,
      color: "var(--sub)",
      marginBottom: 8
    }
  }, "\u7A2E\u985E"), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      flexWrap: "wrap",
      gap: 6
    }
  }, [["", "すべて"]].concat(CATEGORIES.map(x => [x, x])).map(([v, l]) => {
    const on = fCat === v;
    return /*#__PURE__*/React.createElement("button", {
      key: l,
      onClick: () => setFCat(v),
      "aria-pressed": on,
      style: {
        border: on ? "none" : "1px solid var(--line)",
        cursor: "pointer",
        background: on ? "var(--primary)" : "var(--card, #fff)",
        color: on ? "#fff" : "var(--text)",
        borderRadius: 999,
        padding: "8px 13px",
        fontSize: 13,
        fontWeight: 800
      }
    }, l);
  }))), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      gap: 8,
      padding: "10px 14px calc(12px + env(safe-area-inset-bottom))",
      borderTop: "1px solid var(--line)"
    }
  }, /*#__PURE__*/React.createElement("button", {
    onClick: clearFilters,
    disabled: !filterCount,
    style: {
      flex: 1,
      border: "1px solid var(--line)",
      background: "var(--card, #fff)",
      color: filterCount ? "var(--text)" : "var(--faint)",
      borderRadius: 11,
      padding: "13px",
      fontSize: 14,
      fontWeight: 800,
      cursor: "pointer"
    }
  }, "\u305C\u3093\u3076\u89E3\u9664"), /*#__PURE__*/React.createElement("button", {
    onClick: () => setDrawer(false),
    style: {
      flex: 1.4,
      border: "none",
      background: "var(--primary)",
      color: "#fff",
      borderRadius: 11,
      padding: "13px",
      fontSize: 14.5,
      fontWeight: 900,
      cursor: "pointer"
    }
  }, filtered.length, "\u4EF6\u3092\u898B\u308B")))), showUp && /*#__PURE__*/React.createElement(UploadModal, {
    currentStore: currentStore,
    onClose: () => setShowUp(false),
    onSuccess: pop => {
      setPops(p => [pop, ...p]);
      setShowUp(false);
    }
  }), radialOpen && /*#__PURE__*/React.createElement("div", {
    onClick: () => {
      setRadialOpen(false);
      setRadialChanged(false);
    },
    style: {
      position: "fixed",
      inset: 0,
      zIndex: 160
    }
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      position: "fixed",
      left: "50%",
      bottom: FAN_BOTTOM,
      width: 1,
      height: 1,
      zIndex: 165
    }
  }, storeItems.map((it, i) => {
    const active = it.val === fStore;
    const delay = radialOpen ? 50 + i * 30 : 0;
    return /*#__PURE__*/React.createElement("button", {
      key: "s" + it.val,
      onClick: e => {
        e.stopPropagation();
        pickStore(it.val);
      },
      style: {
        position: "absolute",
        left: 0,
        bottom: 0,
        transformOrigin: "50% 100%",
        transform: radialOpen ? `translate(-50%,0) translate(${storePos[i].tx}px, ${storePos[i].ty}px) scale(1)` : "translate(-50%,0) scale(0.2)",
        opacity: radialOpen ? 1 : 0,
        pointerEvents: radialOpen ? "auto" : "none",
        transitionProperty: "transform, opacity",
        transitionDuration: "0.6s, 0.4s",
        transitionTimingFunction: "cubic-bezier(.16,1.18,.3,1), ease",
        transitionDelay: `${delay}ms, ${delay}ms`,
        padding: "6px 11px",
        whiteSpace: "nowrap",
        fontSize: 13,
        fontWeight: active ? 800 : 700,
        borderRadius: 8,
        boxShadow: "0 3px 12px rgba(0,0,0,0.12)",
        cursor: "pointer",
        background: "rgba(255,255,255,0.7)",
        backdropFilter: "blur(3px)",
        color: active ? "var(--primary)" : "#222",
        border: "none",
        borderBottom: active ? "2.5px solid var(--primary)" : "2.5px solid transparent"
      }
    }, it.lbl);
  }), catItems.map((it, i) => {
    const active = it.val === fCat;
    const delay = radialOpen ? 170 + i * 30 : 0;
    return /*#__PURE__*/React.createElement("button", {
      key: "c" + it.val,
      onClick: e => {
        e.stopPropagation();
        pickCat(it.val);
      },
      style: {
        position: "absolute",
        left: 0,
        bottom: 0,
        transformOrigin: "50% 100%",
        transform: radialOpen ? `translate(-50%,0) translate(${catPos[i].tx}px, ${catPos[i].ty}px) scale(1)` : "translate(-50%,0) scale(0.2)",
        opacity: radialOpen ? 1 : 0,
        pointerEvents: radialOpen ? "auto" : "none",
        transitionProperty: "transform, opacity",
        transitionDuration: "0.6s, 0.4s",
        transitionTimingFunction: "cubic-bezier(.16,1.18,.3,1), ease",
        transitionDelay: `${delay}ms, ${delay}ms`,
        padding: "5px 10px",
        whiteSpace: "nowrap",
        fontSize: 12,
        fontWeight: active ? 800 : 700,
        borderRadius: 8,
        boxShadow: "0 3px 12px rgba(0,0,0,0.12)",
        cursor: "pointer",
        background: "rgba(255,255,255,0.7)",
        backdropFilter: "blur(3px)",
        color: active ? "#111" : "#222",
        border: "none",
        borderBottom: active ? "2.5px solid #111" : "2.5px solid transparent"
      }
    }, it.lbl);
  })), sel && /*#__PURE__*/React.createElement(PopDetail, {
    pop: sel,
    onClose: () => setSel(null),
    navList: filtered,
    onNav: setSel,
    onDelete: id => setPops(p => p.filter(x => x.id !== id)),
    onLiked: (id, likes) => setPops(p => p.map(x => x.id === id ? {
      ...x,
      likes
    } : x)),
    onCommented: id => setCommentedIds(s => new Set([...s, id])),
    onCreateFromPop: onCreateFromPop
  }));
}

// ── Search Tab ──
function SearchTab({
  onCreateFromPop,
  radialOpen,
  setRadialOpen
}) {
  const [allPops, setAllPops] = useState([]);
  const [loaded, setLoaded] = useState(false);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [fStore, setFStore] = useState("");
  const [fCat, setFCat] = useState("");
  const [fGenre, setFGenre] = useState("");
  const [sel, setSel] = useState(null);

  // 初回は検索バーにフォーカスが当たった段階 or 文字入力時にロード
  const ensureLoaded = async () => {
    if (loaded || loading) return;
    setLoading(true);
    try {
      const data = await api.listActive();
      setAllPops(data);
      setLoaded(true);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    ensureLoaded();
  }, []);
  useEffect(() => {
    if (!radialOpen) return;
    const el = scroller();
    if (!el) return;
    const onScroll = () => setRadialOpen(false);
    el.addEventListener("scroll", onScroll, {
      passive: true
    });
    return () => el.removeEventListener("scroll", onScroll);
  }, [radialOpen]);
  const q = normJa(search.trim());
  const results = !loaded ? [] : allPops.filter(p => {
    const matchStore = !fStore || p.store_name === fStore;
    const matchCat = !fCat || p.category === fCat;
    const matchGenre = !fGenre || p.genre === fGenre;
    const matchSearch = !q || normJa(p.product_name).includes(q) || normJa(p.store_name).includes(q) || normJa(p.category).includes(q);
    return p.genre !== "除外" && matchStore && matchCat && matchGenre && matchSearch;
  });
  const hasFilter = q || fStore || fCat || fGenre;
  const storeCounts = allPops.reduce((a, p) => {
    a[p.store_name] = (a[p.store_name] || 0) + 1;
    return a;
  }, {});
  const fanStoreItems = STORES.filter(s => (storeCounts[s] || 0) > 0).map(s => ({
    lbl: s,
    val: s
  }));
  const fanCatItems = ["", ...CATEGORIES.filter(c => c !== "その他")].map(c => ({
    lbl: c || "すべて",
    val: c
  }));
  const fanStorePos = arcPositions(fanStoreItems.length, 104, 150, 30);
  const fanCatPos = arcPositions(fanCatItems.length, 152, 158, 22);
  const FAN_BOTTOM = "calc(92px + env(safe-area-inset-bottom))";
  return /*#__PURE__*/React.createElement("div", {
    style: {
      maxWidth: 1600,
      margin: "0 auto",
      padding: "10px 16px 84px"
    }
  }, /*#__PURE__*/React.createElement("div", {
    className: "genre-tabs",
    style: {
      position: "fixed",
      left: 0,
      top: "calc(50% + 16px)",
      transform: "translateY(-50%)",
      zIndex: 166,
      display: "flex",
      flexDirection: "column",
      gap: 3,
      maxHeight: "calc(100vh - 210px)",
      overflowY: "auto",
      overscrollBehavior: "contain",
      WebkitOverflowScrolling: "touch",
      paddingTop: 2,
      paddingBottom: 2
    }
  }, GENRES.map(g => {
    const c = GENRE_COLORS[g];
    const on = fGenre === g;
    return /*#__PURE__*/React.createElement("button", {
      key: g,
      onClick: () => {
        setFGenre(on ? "" : g);
        ensureLoaded();
      },
      style: {
        writingMode: "vertical-rl",
        height: on ? 96 : 84,
        width: on ? 52 : 46,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        border: "none",
        cursor: "pointer",
        letterSpacing: ".04em",
        background: on ? c.solid : c.soft,
        color: on ? "#fff" : c.text,
        fontSize: on ? 14 : 12,
        fontWeight: 800,
        borderRadius: "0 11px 11px 0",
        boxShadow: on ? "2px 2px 9px rgba(0,0,0,0.20)" : "1px 1px 4px rgba(0,0,0,0.10)",
        transition: "all .18s ease"
      }
    }, g === "切身" ? "切身・生食" : g);
  })), /*#__PURE__*/React.createElement("div", {
    style: {
      background: "white",
      borderRadius: 18,
      padding: "18px 20px 16px",
      boxShadow: "0 4px 20px rgba(0,0,0,0.08)",
      marginBottom: 20,
      marginLeft: 46
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      position: "relative",
      marginBottom: 12
    }
  }, /*#__PURE__*/React.createElement("input", {
    type: "text",
    value: search,
    onChange: e => {
      setSearch(e.target.value);
      ensureLoaded();
    },
    onFocus: ensureLoaded,
    placeholder: "\u5546\u54C1\u540D\u30FB\u5E97\u8217\u540D\u30FB\u30AB\u30C6\u30B4\u30EA\u3067\u691C\u7D22...",
    style: {
      width: "100%",
      boxSizing: "border-box",
      padding: "12px 16px 12px 16px",
      border: "2px solid var(--line)",
      borderRadius: 12,
      fontSize: 15,
      outline: "none",
      background: "var(--bg)"
    }
  }), search && /*#__PURE__*/React.createElement("button", {
    onClick: () => setSearch(""),
    style: {
      position: "absolute",
      right: 11,
      top: "50%",
      transform: "translateY(-50%)",
      background: "#ddd",
      border: "none",
      borderRadius: "50%",
      width: 24,
      height: 24,
      cursor: "pointer",
      fontSize: 13,
      color: "var(--text)",
      display: "flex",
      alignItems: "center",
      justifyContent: "center"
    }
  }, "\u2715")), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      gap: "0 15px",
      marginBottom: 11,
      overflowX: "auto",
      paddingBottom: 4
    }
  }, [{
    lbl: "全店舗",
    val: ""
  }, ...STORES.filter(s => (storeCounts[s] || 0) > 0).map(s => ({
    lbl: s,
    val: s
  }))].map(({
    lbl,
    val
  }) => /*#__PURE__*/React.createElement("button", {
    key: lbl,
    onClick: () => {
      setFStore(val);
      ensureLoaded();
    },
    style: {
      border: "none",
      background: "none",
      cursor: "pointer",
      padding: "0 0 3px",
      flexShrink: 0,
      whiteSpace: "nowrap",
      fontSize: 13,
      fontWeight: fStore === val ? 700 : 600,
      color: fStore === val ? "var(--primary)" : "#888",
      borderBottom: fStore === val ? "2px solid var(--primary)" : "1px solid #ededef"
    }
  }, lbl))), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      gap: "0 15px",
      flexWrap: "nowrap",
      overflowX: "auto",
      paddingBottom: 4
    }
  }, ["", "その他", ...CATEGORIES.filter(c => c !== "その他")].map(c => /*#__PURE__*/React.createElement("button", {
    key: c || "all",
    onClick: () => {
      setFCat(c);
      ensureLoaded();
    },
    style: {
      border: "none",
      background: "none",
      cursor: "pointer",
      padding: "0 0 3px",
      flexShrink: 0,
      whiteSpace: "nowrap",
      fontSize: 12.5,
      fontWeight: fCat === c ? 700 : 600,
      color: fCat === c ? "#111" : "#999",
      borderBottom: fCat === c ? "2px solid #111" : "1px solid #ededef"
    }
  }, c || "すべて"))), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      flexWrap: "wrap",
      gap: "9px 15px",
      alignItems: "baseline",
      marginTop: 12
    }
  }, ["刺身", "寿司", "切身", "マグロ", "サーモン", "ブリ", "鯛", "エビ", "いか", "タコ", "カニ", "ホタテ", "真あじ", "生食", "鮭", "対面", "夏", "鯖", "貝"].map(w => {
    const on = search === w;
    return /*#__PURE__*/React.createElement("button", {
      key: w,
      onClick: () => {
        setSearch(on ? "" : w);
        ensureLoaded();
      },
      style: {
        border: "none",
        background: "none",
        cursor: "pointer",
        padding: "0 0 3px",
        flexShrink: 0,
        whiteSpace: "nowrap",
        fontSize: on ? 13.5 : 13,
        fontWeight: on ? 700 : 600,
        color: on ? "var(--primary)" : "#7a7a7f",
        borderBottom: on ? "2px solid var(--primary)" : "1px solid #e7e7e9"
      }
    }, w);
  }))), /*#__PURE__*/React.createElement("div", {
    style: {
      paddingLeft: 46
    }
  }, loading ? /*#__PURE__*/React.createElement("div", {
    style: {
      textAlign: "center",
      padding: 60,
      color: "var(--faint)"
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      animation: "pulse 1.5s infinite"
    }
  }, "\u8AAD\u307F\u8FBC\u307F\u4E2D...")) : !hasFilter ? allPops.length === 0 ? /*#__PURE__*/React.createElement("div", {
    style: {
      textAlign: "center",
      padding: "70px 40px",
      color: "var(--faint)"
    }
  }, /*#__PURE__*/React.createElement("svg", {
    width: "72",
    height: "72",
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: "1.4",
    strokeLinecap: "round",
    strokeLinejoin: "round",
    style: {
      opacity: 0.5,
      marginBottom: 14
    }
  }, /*#__PURE__*/React.createElement("path", {
    d: "M3 12c2-4 6-6 10-6 3 0 5 1 6.5 2.5C21 10 21.5 12 21.5 12S21 14 19.5 15.5C18 17 16 18 13 18c-4 0-8-2-10-6z"
  }), /*#__PURE__*/React.createElement("path", {
    d: "M3 12l-1.5-2.5M3 12l-1.5 2.5"
  }), /*#__PURE__*/React.createElement("circle", {
    cx: "15",
    cy: "10.5",
    r: "0.9",
    fill: "currentColor",
    stroke: "none"
  })), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 15,
      fontWeight: 800,
      color: "var(--sub)"
    }
  }, "\u307E\u3060\u30DD\u30C3\u30D7\u304C\u3042\u308A\u307E\u305B\u3093"), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 12.5,
      marginTop: 6,
      lineHeight: 1.6
    }
  }, "\u300C\uFF0B\u6295\u7A3F\u300D\u304B\u3089\u6700\u521D\u306E\u30DD\u30C3\u30D7\u3092\u5171\u6709\u3057\u3066\u307F\u307E\u3057\u3087\u3046")) : /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      alignItems: "center",
      gap: 8,
      marginBottom: 12,
      paddingLeft: 2
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 14.5,
      fontWeight: 900,
      color: "var(--ink)",
      letterSpacing: "-0.3px"
    }
  }, "\u307F\u3093\u306A\u306E\u30DD\u30C3\u30D7"), /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 12,
      fontWeight: 900,
      color: "var(--primary-soft, #4a7ab0)",
      background: "var(--soft)",
      borderRadius: 999,
      padding: "2px 10px"
    }
  }, allPops.length)), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "grid",
      gridTemplateColumns: "repeat(auto-fill, minmax(118px, 1fr))",
      gap: 3
    }
  }, allPops.map(pop => /*#__PURE__*/React.createElement("img", {
    key: pop.id,
    src: pop.image_url,
    loading: "lazy",
    onClick: () => setSel(pop),
    style: {
      width: "100%",
      aspectRatio: "1/1",
      objectFit: "cover",
      borderRadius: 8,
      cursor: "pointer",
      background: "var(--chip)",
      display: "block"
    }
  })))) : results.length === 0 ? /*#__PURE__*/React.createElement("div", {
    style: {
      textAlign: "center",
      padding: "70px 40px",
      color: "var(--faint)"
    }
  }, /*#__PURE__*/React.createElement("svg", {
    width: "72",
    height: "72",
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: "1.4",
    strokeLinecap: "round",
    strokeLinejoin: "round",
    style: {
      opacity: 0.5,
      marginBottom: 14
    }
  }, /*#__PURE__*/React.createElement("path", {
    d: "M3 12c2-4 6-6 10-6 3 0 5 1 6.5 2.5C21 10 21.5 12 21.5 12S21 14 19.5 15.5C18 17 16 18 13 18c-4 0-8-2-10-6z"
  }), /*#__PURE__*/React.createElement("path", {
    d: "M3 12l-1.5-2.5M3 12l-1.5 2.5"
  }), /*#__PURE__*/React.createElement("circle", {
    cx: "15",
    cy: "10.5",
    r: "0.9",
    fill: "currentColor",
    stroke: "none"
  })), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 15,
      fontWeight: 800,
      color: "var(--sub)"
    }
  }, "\u4E00\u81F4\u3059\u308B\u30DD\u30C3\u30D7\u304C\u898B\u3064\u304B\u308A\u307E\u305B\u3093"), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 12.5,
      marginTop: 6
    }
  }, fStore || fCat || fGenre ? "絞り込みが多すぎるかもしれません" : "別のキーワードで試してみてください"), (fStore || fCat || fGenre || search) && /*#__PURE__*/React.createElement("button", {
    onClick: e => {
      e.stopPropagation();
      setFStore("");
      setFCat("");
      setFGenre("");
      setSearch("");
    },
    style: {
      marginTop: 16,
      border: "none",
      background: "var(--primary-soft, #4a7ab0)",
      color: "#fff",
      borderRadius: 999,
      padding: "10px 22px",
      fontSize: 13,
      fontWeight: 800,
      cursor: "pointer",
      boxShadow: "0 2px 8px rgba(74,122,176,0.3)"
    }
  }, "\u7D5E\u308A\u8FBC\u307F\u3092\u5916\u3059")) : /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 13,
      color: "var(--sub)",
      fontWeight: 700,
      marginBottom: 12
    }
  }, q && /*#__PURE__*/React.createElement("span", null, "\u300C", /*#__PURE__*/React.createElement("span", {
    style: {
      color: "var(--primary)"
    }
  }, search), "\u300D"), (fGenre || fStore || fCat) && /*#__PURE__*/React.createElement("span", {
    style: {
      marginLeft: q ? 4 : 0
    }
  }, [fGenre, fStore, fCat].filter(Boolean).join(" · "), " "), "\u306E\u691C\u7D22\u7D50\u679C\uFF1A", /*#__PURE__*/React.createElement("span", {
    style: {
      color: "var(--ink)"
    }
  }, results.length, "\u4EF6")), /*#__PURE__*/React.createElement("div", {
    className: "pop-grid v-md"
  }, results.map((pop, i) => /*#__PURE__*/React.createElement(PopCard, {
    key: pop.id,
    pop: pop,
    index: i,
    onClick: setSel
  }))))), radialOpen && /*#__PURE__*/React.createElement("div", {
    onClick: () => setRadialOpen(false),
    style: {
      position: "fixed",
      inset: 0,
      zIndex: 160
    }
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      position: "fixed",
      left: "50%",
      bottom: FAN_BOTTOM,
      width: 1,
      height: 1,
      zIndex: 165
    }
  }, fanStoreItems.map((it, i) => {
    const active = it.val === fStore;
    const delay = radialOpen ? 50 + i * 30 : 0;
    return /*#__PURE__*/React.createElement("button", {
      key: "s" + it.val,
      onClick: e => {
        e.stopPropagation();
        setFStore(it.val);
        ensureLoaded();
      },
      style: {
        position: "absolute",
        left: 0,
        bottom: 0,
        transformOrigin: "50% 100%",
        transform: radialOpen ? `translate(-50%,0) translate(${fanStorePos[i].tx}px, ${fanStorePos[i].ty}px) scale(1)` : "translate(-50%,0) scale(0.2)",
        opacity: radialOpen ? 1 : 0,
        pointerEvents: radialOpen ? "auto" : "none",
        transitionProperty: "transform, opacity",
        transitionDuration: "0.6s, 0.4s",
        transitionTimingFunction: "cubic-bezier(.16,1.18,.3,1), ease",
        transitionDelay: `${delay}ms, ${delay}ms`,
        padding: "6px 11px",
        whiteSpace: "nowrap",
        fontSize: 13,
        fontWeight: active ? 800 : 700,
        borderRadius: 8,
        boxShadow: "0 3px 12px rgba(0,0,0,0.12)",
        cursor: "pointer",
        background: "rgba(255,255,255,0.7)",
        backdropFilter: "blur(3px)",
        color: active ? "var(--primary)" : "#222",
        border: "none",
        borderBottom: active ? "2.5px solid var(--primary)" : "2.5px solid transparent"
      }
    }, it.lbl);
  }), fanCatItems.map((it, i) => {
    if (it.val === "") return null; // 「すべて」は左の付箋と重なるため非表示
    const active = it.val === fCat;
    const delay = radialOpen ? 170 + i * 30 : 0;
    return /*#__PURE__*/React.createElement("button", {
      key: "c" + it.val,
      onClick: e => {
        e.stopPropagation();
        setFCat(it.val);
        ensureLoaded();
      },
      style: {
        position: "absolute",
        left: 0,
        bottom: 0,
        transformOrigin: "50% 100%",
        transform: radialOpen ? `translate(-50%,0) translate(${fanCatPos[i].tx}px, ${fanCatPos[i].ty}px) scale(1)` : "translate(-50%,0) scale(0.2)",
        opacity: radialOpen ? 1 : 0,
        pointerEvents: radialOpen ? "auto" : "none",
        transitionProperty: "transform, opacity",
        transitionDuration: "0.6s, 0.4s",
        transitionTimingFunction: "cubic-bezier(.16,1.18,.3,1), ease",
        transitionDelay: `${delay}ms, ${delay}ms`,
        padding: "5px 10px",
        whiteSpace: "nowrap",
        fontSize: 12,
        fontWeight: active ? 800 : 700,
        borderRadius: 8,
        boxShadow: "0 3px 12px rgba(0,0,0,0.12)",
        cursor: "pointer",
        background: "rgba(255,255,255,0.7)",
        backdropFilter: "blur(3px)",
        color: active ? "#111" : "#222",
        border: "none",
        borderBottom: active ? "2.5px solid #111" : "2.5px solid transparent"
      }
    }, it.lbl);
  })), sel && /*#__PURE__*/React.createElement(PopDetail, {
    pop: sel,
    onClose: () => setSel(null),
    navList: results,
    onNav: setSel,
    onDelete: id => {
      setAllPops(p => p.filter(x => x.id !== id));
      setSel(null);
    },
    onLiked: (id, likes) => setAllPops(p => p.map(x => x.id === id ? {
      ...x,
      likes
    } : x)),
    onCreateFromPop: onCreateFromPop
  }));
}

// ── Blog Tab (売り場ノート) ──

;
Object.assign(window, {
  BoardTab,
  SearchTab
});