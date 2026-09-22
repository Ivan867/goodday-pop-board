var {
  useState,
  useEffect,
  useCallback,
  useRef
} = React;

// ===== トレンド：魚種ごとの「今使える訴求文脈」を見る・貯める =====
function TrendTab({
  embedded
} = {}) {
  const [species, setSpecies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sel, setSel] = useState(null); // 選んだ魚種
  const [signals, setSignals] = useState([]);
  const [scores, setScores] = useState([]);
  const [detailBusy, setDetailBusy] = useState(false);
  const [top, setTop] = useState([]);
  const [tab, setTab] = useState("fish"); // fish=魚種を選ぶ / week=直近1週
  const [q, setQ] = useState("");

  // 追加フォーム
  const [addOpen, setAddOpen] = useState(false);
  const [term, setTerm] = useState("");
  const [ctx, setCtx] = useState("");
  const [pw, setPw] = useState("");
  const [addBusy, setAddBusy] = useState(false);
  const [addMsg, setAddMsg] = useState("");
  useEffect(() => {
    let alive = true;
    Promise.all([api.listSpecies(), api.topWow()]).then(([sp, tw]) => {
      if (!alive) return;
      setSpecies(sp || []);
      setTop(tw || []);
    }).catch(() => {}).finally(() => {
      if (alive) setLoading(false);
    });
    return () => {
      alive = false;
    };
  }, []);
  const openFish = async f => {
    setSel(f);
    setDetailBusy(true);
    setSignals([]);
    setScores([]);
    try {
      const [sg, sc] = await Promise.all([api.speciesSignals(f.id, 40), api.speciesScores(f.id)]);
      setSignals(sg || []);
      setScores(sc || []);
    } catch (e) {} finally {
      setDetailBusy(false);
    }
  };
  const submitNote = async () => {
    if (!term.trim()) {
      setAddMsg("ことばを入れてください");
      return;
    }
    setAddBusy(true);
    setAddMsg("");
    try {
      const ok = await api.verifyPasswordEx("admin", pw);
      if (!ok.ok) {
        setAddMsg(ok.locked ? `間違いが続いたので、${api.lockText(ok.seconds)}ほど待ってください` : "パスワードが違います");
        setAddBusy(false);
        return;
      }
      const list = ctx.split(/[、,\s]+/).map(x => x.trim()).filter(Boolean);
      const r = await api.addTrendNote(term.trim(), sel ? sel.canonical_name : null, list);
      setAddMsg(r && r.matched ? "入れました" : "入れました（魚種は結びつきませんでした）");
      setTerm("");
      setCtx("");
      if (sel) openFish(sel);
      const tw = await api.topWow().catch(() => []);
      setTop(tw || []);
      setTimeout(() => {
        setAddOpen(false);
        setAddMsg("");
      }, 1200);
    } catch (e) {
      setAddMsg("入れられませんでした");
    } finally {
      setAddBusy(false);
    }
  };
  const card = {
    background: "#fff",
    border: "1px solid var(--line)",
    borderRadius: 14,
    padding: "14px 15px"
  };
  const now = new Date().getMonth() + 1;
  const shown = species.filter(f => {
    if (!q.trim()) return true;
    const n = normJa(q);
    return normJa(f.canonical_name).includes(n) || (f.aliases || []).some(a => normJa(a).includes(n));
  });
  return /*#__PURE__*/React.createElement("div", {
    style: {
      maxWidth: 900,
      margin: "0 auto",
      padding: embedded ? "0 16px 120px" : "10px 16px 120px"
    }
  }, !embedded && /*#__PURE__*/React.createElement("div", {
    style: {
      background: "var(--primary)",
      color: "#fff",
      borderRadius: 14,
      padding: "14px 16px",
      marginBottom: 14
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 16.5,
      fontWeight: 800,
      letterSpacing: "-0.3px"
    }
  }, "\u30C8\u30EC\u30F3\u30C9"), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 11.5,
      opacity: 0.85,
      marginTop: 3
    }
  }, "\u9B5A\u3054\u3068\u306B\u3001\u3044\u307E\u4F7F\u3048\u308B\u58F2\u308A\u6587\u53E5\u3092\u305F\u3081\u3066\u304A\u304F\u5834\u6240\u3067\u3059")), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      gap: 2,
      background: "var(--chip)",
      borderRadius: 9,
      padding: 3,
      marginBottom: 14
    }
  }, [["fish", "魚から見る"], ["week", "この1週間"]].map(([k, l]) => /*#__PURE__*/React.createElement("button", {
    key: k,
    onClick: () => setTab(k),
    "aria-pressed": tab === k,
    style: {
      flex: 1,
      border: "none",
      background: tab === k ? "#fff" : "transparent",
      color: tab === k ? "var(--ink)" : "var(--sub)",
      borderRadius: 7,
      padding: "9px 6px",
      fontSize: 13,
      fontWeight: 800,
      cursor: "pointer",
      boxShadow: tab === k ? "0 1px 2px rgba(0,0,0,0.1)" : "none"
    }
  }, l))), loading ? /*#__PURE__*/React.createElement("div", {
    style: {
      textAlign: "center",
      color: "var(--faint)",
      padding: "44px 0",
      fontSize: 13
    }
  }, "\u8AAD\u307F\u8FBC\u3093\u3067\u3044\u307E\u3059\u2026") : tab === "week" ? top.length === 0 ? /*#__PURE__*/React.createElement("div", {
    style: {
      textAlign: "center",
      color: "var(--faint)",
      padding: "44px 20px",
      fontSize: 13,
      lineHeight: 1.9
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 15,
      fontWeight: 800,
      color: "var(--sub)"
    }
  }, "\u307E\u3060\u4F55\u3082\u3042\u308A\u307E\u305B\u3093"), /*#__PURE__*/React.createElement("div", {
    style: {
      marginTop: 6
    }
  }, "\u300C\u9B5A\u304B\u3089\u898B\u308B\u300D\u3067\u9B5A\u3092\u9078\u3093\u3067\u3001\u6C17\u3065\u3044\u305F\u3053\u3068\u3092\u8DB3\u3057\u3066\u304F\u3060\u3055\u3044")) : /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      flexDirection: "column",
      gap: 8
    }
  }, top.map((t, i) => /*#__PURE__*/React.createElement("button", {
    key: i,
    onClick: () => {
      const f = species.find(x => x.id === (t.fish_species && t.fish_species.id));
      if (f) {
        setTab("fish");
        openFish(f);
      }
    },
    style: {
      ...card,
      display: "flex",
      alignItems: "center",
      gap: 11,
      textAlign: "left",
      cursor: "pointer",
      width: "100%"
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 15.5,
      fontWeight: 900,
      color: "var(--ink)",
      flexShrink: 0
    }
  }, t.fish_species ? t.fish_species.canonical_name : "—"), /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 12,
      color: "var(--sub)",
      minWidth: 0,
      flex: 1,
      overflow: "hidden",
      textOverflow: "ellipsis",
      whiteSpace: "nowrap"
    }
  }, (t.context_terms || []).join(" ／ ")), /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 12.5,
      fontWeight: 900,
      color: "var(--primary-soft)",
      flexShrink: 0
    }
  }, t.raw_count)))) : sel ? /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("button", {
    onClick: () => setSel(null),
    style: {
      display: "flex",
      alignItems: "center",
      gap: 5,
      border: "1px solid var(--line)",
      background: "#fff",
      color: "var(--sub)",
      borderRadius: 10,
      padding: "8px 14px 8px 10px",
      fontSize: 13,
      fontWeight: 800,
      cursor: "pointer",
      marginBottom: 14
    }
  }, /*#__PURE__*/React.createElement("svg", {
    width: "15",
    height: "15",
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: "2.4",
    strokeLinecap: "round",
    strokeLinejoin: "round"
  }, /*#__PURE__*/React.createElement("path", {
    d: "M15 5l-7 7 7 7"
  })), "\u9B5A\u3092\u9078\u3073\u306A\u304A\u3059"), /*#__PURE__*/React.createElement("div", {
    style: {
      ...card,
      marginBottom: 12
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      alignItems: "baseline",
      gap: 9,
      marginBottom: 8
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 19,
      fontWeight: 900,
      color: "var(--ink)"
    }
  }, sel.canonical_name), (sel.season_months || []).includes(now) && /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 11,
      fontWeight: 900,
      color: "#2c6b45",
      background: "#eaf6ee",
      borderRadius: 6,
      padding: "3px 8px"
    }
  }, "\u3044\u307E\u304C\u65EC")), (sel.season_months || []).length > 0 && /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 12,
      color: "var(--sub)",
      marginBottom: 6
    }
  }, "\u65EC\uFF1A", sel.season_months.join("・"), "\u6708"), (sel.common_cuts || []).length > 0 && /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 12,
      color: "var(--sub)",
      marginBottom: 6
    }
  }, "\u58F2\u308A\u65B9\uFF1A", sel.common_cuts.join("／")), (sel.common_dishes || []).length > 0 && /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 12,
      color: "var(--sub)"
    }
  }, "\u6599\u7406\uFF1A", sel.common_dishes.join("／")), sel.note && /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 11.5,
      color: "var(--faint)",
      marginTop: 8,
      lineHeight: 1.7
    }
  }, sel.note)), scores.length > 0 && scores.some(s => (s.context_terms || []).length) && /*#__PURE__*/React.createElement("div", {
    style: {
      ...card,
      marginBottom: 12
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 12.5,
      fontWeight: 800,
      color: "var(--sub)",
      marginBottom: 9
    }
  }, "\u305F\u3081\u305F\u5207\u308A\u53E3"), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      flexWrap: "wrap",
      gap: 6
    }
  }, [...new Set(scores.flatMap(s => s.context_terms || []))].map((c, i) => /*#__PURE__*/React.createElement("span", {
    key: i,
    style: {
      fontSize: 12.5,
      fontWeight: 700,
      color: "var(--soft-text)",
      background: "var(--soft)",
      borderRadius: 8,
      padding: "5px 10px"
    }
  }, c)))), /*#__PURE__*/React.createElement("div", {
    style: {
      ...card,
      marginBottom: 12
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 12.5,
      fontWeight: 800,
      color: "var(--sub)",
      marginBottom: 9
    }
  }, "\u3053\u308C\u307E\u3067\u306E\u3053\u3068\u3070"), detailBusy ? /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 12.5,
      color: "var(--faint)",
      padding: "14px 0",
      textAlign: "center"
    }
  }, "\u8AAD\u307F\u8FBC\u3093\u3067\u3044\u307E\u3059\u2026") : signals.length === 0 ? /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 12.5,
      color: "var(--faint)",
      padding: "14px 0",
      textAlign: "center"
    }
  }, "\u307E\u3060\u3042\u308A\u307E\u305B\u3093\u3002\u4E0B\u304B\u3089\u8DB3\u3057\u3066\u304F\u3060\u3055\u3044") : /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      flexDirection: "column",
      gap: 7
    }
  }, signals.map((s, i) => {
    const r = s.trend_raw_signals || {};
    return /*#__PURE__*/React.createElement("div", {
      key: i,
      style: {
        display: "flex",
        alignItems: "center",
        gap: 9,
        borderBottom: i < signals.length - 1 ? "1px solid var(--line)" : "none",
        paddingBottom: 7
      }
    }, /*#__PURE__*/React.createElement("span", {
      style: {
        fontSize: 13.5,
        fontWeight: 700,
        color: "var(--ink)",
        flex: 1,
        minWidth: 0
      }
    }, r.term), /*#__PURE__*/React.createElement("span", {
      style: {
        fontSize: 10.5,
        color: "var(--faint)",
        flexShrink: 0
      }
    }, r.captured_at ? String(r.captured_at).slice(5, 10).replace("-", "/") : ""));
  }))), /*#__PURE__*/React.createElement("button", {
    onClick: () => {
      setAddOpen(true);
      setAddMsg("");
    },
    style: {
      width: "100%",
      border: "none",
      background: "var(--primary)",
      color: "#fff",
      borderRadius: 12,
      padding: "14px",
      fontSize: 14.5,
      fontWeight: 900,
      cursor: "pointer"
    }
  }, "\uFF0B \u3053\u306E\u9B5A\u306E\u5207\u308A\u53E3\u3092\u8DB3\u3059")) : /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("input", {
    value: q,
    onChange: e => setQ(e.target.value),
    placeholder: "\u9B5A\u306E\u540D\u524D\u3067\u3055\u304C\u3059\uFF08\u3076\u308A\u30FB\u30CF\u30DE\u30C1\u30FB\u9C24 \u306A\u3069\uFF09",
    style: {
      width: "100%",
      boxSizing: "border-box",
      border: "1px solid var(--line)",
      borderRadius: 11,
      padding: "12px 14px",
      fontSize: 15,
      outline: "none",
      fontFamily: "inherit",
      marginBottom: 12
    }
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "grid",
      gridTemplateColumns: "repeat(auto-fill, minmax(104px, 1fr))",
      gap: 8
    }
  }, shown.map(f => {
    const inSeason = (f.season_months || []).includes(now);
    return /*#__PURE__*/React.createElement("button", {
      key: f.id,
      onClick: () => openFish(f),
      style: {
        background: "#fff",
        border: inSeason ? "1.5px solid #3f9e63" : "1px solid var(--line)",
        borderRadius: 12,
        padding: "14px 8px",
        cursor: "pointer",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: 5,
        minHeight: 64
      }
    }, /*#__PURE__*/React.createElement("span", {
      style: {
        fontSize: 14,
        fontWeight: 800,
        color: "var(--ink)"
      }
    }, f.canonical_name), inSeason && /*#__PURE__*/React.createElement("span", {
      style: {
        fontSize: 10,
        fontWeight: 900,
        color: "#2c6b45"
      }
    }, "\u3044\u307E\u304C\u65EC"));
  })), shown.length === 0 && /*#__PURE__*/React.createElement("div", {
    style: {
      textAlign: "center",
      color: "var(--faint)",
      padding: "40px 0",
      fontSize: 13
    }
  }, "\u898B\u3064\u304B\u308A\u307E\u305B\u3093\u3067\u3057\u305F")), addOpen && /*#__PURE__*/React.createElement("div", {
    onClick: () => !addBusy && setAddOpen(false),
    style: {
      position: "fixed",
      inset: 0,
      zIndex: 1300,
      background: "rgba(15,25,38,0.6)",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      padding: 20
    }
  }, /*#__PURE__*/React.createElement("div", {
    onClick: e => e.stopPropagation(),
    style: {
      background: "#fff",
      borderRadius: 16,
      width: "100%",
      maxWidth: 420,
      padding: "22px 20px"
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 16.5,
      fontWeight: 900,
      color: "var(--ink)",
      marginBottom: 4
    }
  }, "\u5207\u308A\u53E3\u3092\u8DB3\u3059", sel ? `（${sel.canonical_name}）` : ""), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 11.5,
      color: "var(--sub)",
      lineHeight: 1.7,
      marginBottom: 14
    }
  }, "\u58F2\u5834\u3067\u6C17\u3065\u3044\u305F\u3053\u3068\u3001\u304A\u5BA2\u69D8\u306E\u58F0\u3001\u4F7F\u3048\u305D\u3046\u306A\u8A00\u3044\u56DE\u3057\u306A\u3069"), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 11.5,
      fontWeight: 800,
      color: "var(--sub)",
      marginBottom: 6
    }
  }, "\u3053\u3068\u3070"), /*#__PURE__*/React.createElement("input", {
    value: term,
    onChange: e => setTerm(e.target.value),
    placeholder: "\u4F8B\uFF1A\u5BD2\u30D6\u30EA \u8102\u306E\u308A\u304C\u6700\u9AD8",
    style: {
      width: "100%",
      boxSizing: "border-box",
      border: "2px solid var(--line)",
      borderRadius: 10,
      padding: "11px 12px",
      fontSize: 15,
      outline: "none",
      fontFamily: "inherit",
      marginBottom: 12
    }
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 11.5,
      fontWeight: 800,
      color: "var(--sub)",
      marginBottom: 6
    }
  }, "\u8ABF\u7406\u6CD5\u30FB\u5B63\u7BC0\uFF08\u3042\u308C\u3070\u30FB\u8AAD\u70B9\u3067\u533A\u5207\u308B\uFF09"), /*#__PURE__*/React.createElement("input", {
    value: ctx,
    onChange: e => setCtx(e.target.value),
    placeholder: "\u4F8B\uFF1A\u523A\u8EAB\u3001\u3057\u3083\u3076\u3057\u3083\u3076\u3001\u5E74\u672B",
    style: {
      width: "100%",
      boxSizing: "border-box",
      border: "2px solid var(--line)",
      borderRadius: 10,
      padding: "11px 12px",
      fontSize: 15,
      outline: "none",
      fontFamily: "inherit",
      marginBottom: 12
    }
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 11.5,
      fontWeight: 800,
      color: "var(--sub)",
      marginBottom: 6
    }
  }, "\u30D1\u30B9\u30EF\u30FC\u30C9"), /*#__PURE__*/React.createElement("input", {
    type: "password",
    inputMode: "numeric",
    value: pw,
    onChange: e => setPw(e.target.value),
    onKeyDown: e => {
      if (e.key === "Enter") submitNote();
    },
    style: {
      width: "100%",
      boxSizing: "border-box",
      border: "2px solid var(--line)",
      borderRadius: 10,
      padding: "11px 12px",
      fontSize: 15,
      outline: "none",
      fontFamily: "inherit",
      marginBottom: addMsg ? 8 : 16
    }
  }), addMsg && /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 12.5,
      fontWeight: 800,
      marginBottom: 12,
      color: addMsg.includes("入れました") ? "#2c6b45" : "#b3261e"
    }
  }, addMsg), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      gap: 9
    }
  }, /*#__PURE__*/React.createElement("button", {
    onClick: () => setAddOpen(false),
    disabled: addBusy,
    style: {
      flex: 1,
      border: "none",
      background: "var(--chip)",
      color: "var(--text)",
      borderRadius: 10,
      padding: "12px",
      fontSize: 14,
      fontWeight: 800,
      cursor: "pointer"
    }
  }, "\u3084\u3081\u308B"), /*#__PURE__*/React.createElement("button", {
    onClick: submitNote,
    disabled: addBusy || !term.trim(),
    style: {
      flex: 1,
      border: "none",
      background: addBusy || !term.trim() ? "#ccc" : "var(--primary)",
      color: "#fff",
      borderRadius: 10,
      padding: "12px",
      fontSize: 14,
      fontWeight: 900,
      cursor: "pointer"
    }
  }, addBusy ? "入れています…" : "入れる")))));
}
;
Object.assign(window, {
  TrendTab
});