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
  const filtered = pops.filter(p => (!fStore || p.store_name === fStore) && (!fCat || p.category === fCat)).sort((a, b) => (b.is_pinned ? 1 : 0) - (a.is_pinned ? 1 : 0));
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
      maxWidth: 1080,
      margin: "0 auto",
      padding: "12px 16px 185px"
    }
  }, /*#__PURE__*/React.createElement(TodayInfoCard, null), feat && feat.enabled && feat.message && featShow && /*#__PURE__*/React.createElement("div", {
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
  }, "🎉"), /*#__PURE__*/React.createElement("div", {
    style: {
      minWidth: 0,
      flex: 1
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 10.5,
      fontWeight: 800,
      color: "rgba(255,255,255,0.8)"
    }
  }, "新機能のお知らせ"), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 13,
      fontWeight: 800,
      color: "#fff",
      lineHeight: 1.4
    }
  }, feat.message)), feat.tab && /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 11,
      fontWeight: 800,
      color: "#2f6fb0",
      background: "#fff",
      borderRadius: 8,
      padding: "4px 10px",
      flexShrink: 0
    }
  }, "ひらく"), /*#__PURE__*/React.createElement("button", {
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
  }, "✕")), tipOn && showNotice && !radialOpen && /*#__PURE__*/React.createElement("div", {
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
      maxWidth: 1080,
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
    style: {
      display: "grid",
      gridTemplateColumns: "repeat(auto-fill, minmax(158px, 1fr))",
      gap: 12,
      alignItems: "start"
    }
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
  }, "ポップがまだありません"), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 13
    }
  }, "アップロードボタンから最初のポップを共有しましょう！")) : /*#__PURE__*/React.createElement("div", {
    style: {
      display: "grid",
      gridTemplateColumns: "repeat(auto-fill, minmax(158px, 1fr))",
      gap: 12,
      alignItems: "start"
    }
  }, filtered.map((pop, i) => /*#__PURE__*/React.createElement(PopCard, {
    key: pop.id,
    pop: pop,
    index: i,
    onClick: setSel,
    hasComment: (pop.comment_count || 0) > 0 || commentedIds.has(pop.id)
  })))), showUp && /*#__PURE__*/React.createElement(UploadModal, {
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
      maxWidth: 1080,
      margin: "0 auto",
      padding: "10px 16px 84px"
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      position: "fixed",
      left: 0,
      top: "46%",
      transform: "translateY(-50%)",
      zIndex: 166,
      display: "flex",
      flexDirection: "column",
      gap: 4
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
        height: on ? 100 : 86,
        width: on ? 40 : 33,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        border: "none",
        cursor: "pointer",
        letterSpacing: ".08em",
        background: on ? c.solid : c.soft,
        color: on ? "#fff" : c.text,
        fontSize: on ? 15 : 13,
        fontWeight: 800,
        borderRadius: "0 12px 12px 0",
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
    placeholder: "商品名・店舗名・カテゴリで検索...",
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
  }, "✕")), /*#__PURE__*/React.createElement("div", {
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
  }, "読み込み中...")) : !hasFilter ? allPops.length === 0 ? /*#__PURE__*/React.createElement("div", {
    style: {
      textAlign: "center",
      padding: 60,
      color: "var(--faint)"
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 15,
      fontWeight: 700,
      color: "var(--sub)"
    }
  }, "まだポップがありません")) : /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 13,
      fontWeight: 800,
      color: "var(--sub)",
      marginBottom: 12,
      paddingLeft: 2
    }
  }, "みんなのポップ（", allPops.length, "）"), /*#__PURE__*/React.createElement("div", {
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
      padding: 60,
      color: "var(--faint)"
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 15,
      fontWeight: 700,
      color: "var(--sub)"
    }
  }, "一致するポップが見つかりません"), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 13,
      marginTop: 6
    }
  }, "別のキーワードで試してみてください")) : /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 13,
      color: "var(--sub)",
      fontWeight: 700,
      marginBottom: 12
    }
  }, q && /*#__PURE__*/React.createElement("span", null, "「", /*#__PURE__*/React.createElement("span", {
    style: {
      color: "var(--primary)"
    }
  }, search), "」"), (fGenre || fStore || fCat) && /*#__PURE__*/React.createElement("span", {
    style: {
      marginLeft: q ? 4 : 0
    }
  }, [fGenre, fStore, fCat].filter(Boolean).join(" · "), " "), "の検索結果：", /*#__PURE__*/React.createElement("span", {
    style: {
      color: "var(--ink)"
    }
  }, results.length, "件")), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "grid",
      gridTemplateColumns: "repeat(auto-fill, minmax(158px, 1fr))",
      gap: 12,
      alignItems: "start"
    }
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