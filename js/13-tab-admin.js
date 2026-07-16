/* GoodDay 鮮魚共有 — 13-tab-admin （自動分割・window共有） */
var {
  useState,
  useEffect,
  useCallback,
  useRef
} = React;
function AdminTab({
  onNoticeChange,
  onCreateFromPop
}) {
  const [unlocked, setUnlocked] = useState(false);
  const [gpw, setGpw] = useState("");
  const [gErr, setGErr] = useState("");
  const [gChecking, setGChecking] = useState(false);
  const [section, setSection] = useState("req"); // req | archive

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

  // ピン留め・制作メモ用
  const [pinnedPopId, setPinnedPopId] = useState(null);
  const [memoText, setMemoText] = useState("");
  const [memoLoading, setMemoLoading] = useState(false);
  const [memoDirty, setMemoDirty] = useState(false);
  const [pinnedBusy, setPinnedBusy] = useState(false);
  const setPinned = async popId => {
    setPinnedBusy(true);
    try {
      await api.setPinned(popId);
      setPinnedPopId(popId);
      await load();
    } catch (e) {
      alert("ピン留め更新に失敗しました");
      console.error(e);
    } finally {
      setPinnedBusy(false);
    }
  };
  const load = useCallback(async () => {
    setLoading(true);
    try {
      const d = await api.listAll();
      setPops(d);
      // ピン留めPOPを取得
      const pp = d.find(x => x.is_pinned);
      setPinnedPopId(pp ? pp.id : null);
      // 制作メモを取得
      try {
        const memo = await api.getMemo();
        setMemoText(memo?.text || "");
      } catch (e) {}
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, []);
  const loadReqs = useCallback(async () => {
    setReqLoading(true);
    try {
      const d = await api.listRequests();
      setReqs(d);
    } catch (e) {
      console.error(e);
    } finally {
      setReqLoading(false);
    }
  }, []);
  useEffect(() => {
    if (unlocked) {
      load();
      loadReqs();
    }
  }, [unlocked, load, loadReqs]);
  const tryUnlock = async () => {
    if (gChecking) return;
    setGChecking(true);
    setGErr("");
    try {
      const ok = await api.verifyPassword("admin", gpw);
      if (ok) {
        setUnlocked(true);
        setGErr("");
      } else {
        setGErr("パスワードが違います");
      }
    } catch (e) {
      setGErr("通信に失敗しました。電波を確認してください");
    } finally {
      setGChecking(false);
    }
  };
  if (!unlocked) {
    return /*#__PURE__*/React.createElement("div", {
      style: {
        maxWidth: 420,
        margin: "0 auto",
        padding: "60px 20px",
        animation: "fadeUp .3s ease"
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        background: "#fff",
        borderRadius: 16,
        boxShadow: "0 2px 14px rgba(0,0,0,0.07)",
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
    }, "管理画面"), /*#__PURE__*/React.createElement("div", {
      style: {
        fontSize: 13,
        color: "var(--sub)",
        marginBottom: 18
      }
    }, "パスワードを入力してください"), /*#__PURE__*/React.createElement("input", {
      type: "password",
      value: gpw,
      autoFocus: true,
      inputMode: "numeric",
      onChange: e => {
        setGpw(e.target.value);
        setGErr("");
      },
      onKeyDown: e => {
        if (e.key === "Enter") tryUnlock();
      },
      placeholder: "パスワード",
      disabled: gChecking,
      style: {
        width: "100%",
        boxSizing: "border-box",
        border: "2px solid var(--line)",
        borderRadius: 10,
        padding: "12px",
        fontSize: 16,
        textAlign: "center",
        outline: "none",
        marginBottom: gErr ? 8 : 16
      }
    }), gErr && /*#__PURE__*/React.createElement("div", {
      style: {
        fontSize: 13,
        color: "var(--primary)",
        fontWeight: 700,
        marginBottom: 12
      }
    }, gErr), /*#__PURE__*/React.createElement("button", {
      onClick: tryUnlock,
      disabled: gChecking,
      style: {
        width: "100%",
        border: "none",
        background: gChecking ? "#f0b48a" : "var(--primary)",
        color: "#fff",
        borderRadius: 10,
        padding: "12px",
        fontSize: 15,
        fontWeight: 800,
        cursor: gChecking ? "default" : "pointer"
      }
    }, gChecking ? "確認中…" : "解錠する")));
  }

  // ---- アーカイブ管理 ----
  const list = pops.filter(p => view === "archived" ? p.archived : !p.archived);
  const selIds = Object.keys(sel).filter(k => sel[k]);
  const toArchive = view === "active";
  const aCount = pops.filter(p => !p.archived).length;
  const arCount = pops.filter(p => p.archived).length;
  const toggle = id => setSel(s => ({
    ...s,
    [id]: !s[id]
  }));
  const switchView = v => {
    setView(v);
    setSel({});
  };
  const apply = async () => {
    if (!selIds.length) return;
    setApplying(true);
    try {
      await api.setArchivedMany(selIds, toArchive);
      setSel({});
      await load();
    } catch (e) {
      alert("更新に失敗しました（archived列の追加SQLは実行済みですか？）");
    } finally {
      setApplying(false);
    }
  };
  const seg = (v, label, n) => /*#__PURE__*/React.createElement("button", {
    onClick: () => switchView(v),
    style: {
      flex: 1,
      border: "none",
      padding: "10px",
      fontSize: 14,
      fontWeight: 800,
      background: view === v ? "var(--primary)" : "#fff",
      color: view === v ? "#fff" : "#888",
      cursor: "pointer"
    }
  }, label, "（", n, "）");

  // ---- ジャンル選別 ----
  const activePops = pops.filter(p => !p.archived);
  const genreCount = g => g === "未分類" ? activePops.filter(p => !p.genre).length : activePops.filter(p => p.genre === g).length;
  const genreList = activePops.filter(p => gFilter === "未分類" ? !p.genre : p.genre === gFilter);
  const assignGenre = async (p, genre) => {
    const next = p.genre === genre ? null : genre; // 同じものを再タップで未分類に戻す
    setPops(ps => ps.map(x => x.id === p.id ? {
      ...x,
      genre: next
    } : x)); // 先に画面反映
    try {
      await api.setGenre(p.id, next);
    } catch (e) {
      setPops(ps => ps.map(x => x.id === p.id ? {
        ...x,
        genre: p.genre
      } : x)); // 失敗したら戻す
      alert("更新に失敗しました（genre列の追加SQLは実行済みですか？）");
    }
  };

  // ---- 依頼 ----
  const openReqs = reqs.filter(r => r.status !== "対応済み").length;
  const setReqStatus = async (r, status) => {
    try {
      await api.updateRequest(r.id, {
        status
      });
      setReqs(rs => rs.map(x => x.id === r.id ? {
        ...x,
        status
      } : x));
    } catch (e) {
      alert("更新に失敗しました");
    }
  };
  const delReq = async r => {
    if (!confirm("この依頼を削除しますか？")) return;
    try {
      await api.delRequest(r.id);
      setReqs(rs => rs.filter(x => x.id !== r.id));
    } catch (e) {
      alert("削除に失敗しました");
    }
  };
  const fmtDate = s => {
    try {
      const d = new Date(s);
      return `${d.getMonth() + 1}/${d.getDate()}`;
    } catch (e) {
      return "";
    }
  };
  const mainSeg = (v, label) => /*#__PURE__*/React.createElement("button", {
    onClick: () => setSection(v),
    style: {
      flex: 1,
      border: "none",
      padding: "11px",
      fontSize: 14,
      fontWeight: 800,
      background: section === v ? "#222" : "#fff",
      color: section === v ? "#fff" : "#888",
      cursor: "pointer"
    }
  }, label);
  return /*#__PURE__*/React.createElement("div", {
    style: {
      maxWidth: 1080,
      margin: "0 auto",
      padding: 16,
      paddingBottom: 140,
      animation: "fadeUp .3s ease"
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 22,
      fontWeight: 900,
      color: "var(--ink)",
      marginBottom: 12
    }
  }, "管理画面"), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      borderRadius: 10,
      overflow: "hidden",
      border: "1px solid var(--line)",
      marginBottom: 16,
      flexWrap: "wrap"
    }
  }, mainSeg("req", `依頼${openReqs ? `（${openReqs}）` : ""}`), mainSeg("genre", `ジャンル選別${genreCount("未分類") ? `（${genreCount("未分類")}）` : ""}`), mainSeg("archive", "アーカイブ"), mainSeg("notice", "お知らせ"), mainSeg("pinned", "ピン留め"), mainSeg("memo", "制作メモ"), mainSeg("ranking", "記録")), section === "notice" && /*#__PURE__*/React.createElement(NoticeAdmin, {
    onNoticeChange: onNoticeChange
  }), section === "ranking" && /*#__PURE__*/React.createElement(RankingPanel, {
    onCreateFromPop: onCreateFromPop
  }), section === "req" && (reqLoading ? /*#__PURE__*/React.createElement("div", {
    style: {
      textAlign: "center",
      color: "var(--sub)",
      padding: "40px 0",
      fontSize: 14
    }
  }, "読み込み中…") : reqs.length === 0 ? /*#__PURE__*/React.createElement("div", {
    style: {
      textAlign: "center",
      padding: 50,
      color: "var(--faint)"
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 15,
      fontWeight: 700,
      color: "var(--sub)"
    }
  }, "依頼はまだありません"), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 13,
      marginTop: 6,
      color: "var(--faint)"
    }
  }, "「ポップ依頼」からみんなが投稿できます")) : /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      flexDirection: "column",
      gap: 10
    }
  }, reqs.map(r => {
    const done = r.status === "対応済み";
    const urgent = r.priority === "急ぎ";
    return /*#__PURE__*/React.createElement("div", {
      key: r.id,
      style: {
        background: "#fff",
        borderRadius: 14,
        border: "1px solid var(--line)",
        padding: 14,
        borderLeft: `5px solid ${done ? "#bbb" : urgent ? "#e01010" : "var(--primary)"}`,
        opacity: done ? 0.6 : 1
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        display: "flex",
        alignItems: "center",
        gap: 7,
        marginBottom: 6,
        flexWrap: "wrap"
      }
    }, urgent && !done && /*#__PURE__*/React.createElement("span", {
      style: {
        background: "#e01010",
        color: "#fff",
        fontSize: 10,
        fontWeight: 900,
        padding: "2px 7px",
        borderRadius: 7
      }
    }, "急ぎ"), done && /*#__PURE__*/React.createElement("span", {
      style: {
        background: "#bbb",
        color: "#fff",
        fontSize: 10,
        fontWeight: 900,
        padding: "2px 7px",
        borderRadius: 7
      }
    }, "対応済み"), r.kind && r.kind !== "POP作成依頼" && /*#__PURE__*/React.createElement("span", {
      style: {
        fontSize: 10,
        fontWeight: 800,
        color: "#2f6fb0",
        background: "#eaf2fb",
        borderRadius: 6,
        padding: "2px 7px",
        marginRight: 6,
        flexShrink: 0
      }
    }, r.kind), /*#__PURE__*/React.createElement("span", {
      style: {
        fontSize: 15,
        fontWeight: 900,
        color: "var(--ink)"
      }
    }, r.product_name), /*#__PURE__*/React.createElement("span", {
      style: {
        marginLeft: "auto",
        fontSize: 11,
        color: "var(--faint)"
      }
    }, fmtDate(r.created_at))), /*#__PURE__*/React.createElement("div", {
      style: {
        fontSize: 12,
        color: "var(--sub)",
        marginBottom: r.reason ? 8 : 10
      }
    }, r.store_name), r.reason && /*#__PURE__*/React.createElement("div", {
      style: {
        fontSize: 13,
        color: "var(--text)",
        lineHeight: 1.5,
        background: "var(--bg)",
        borderRadius: 8,
        padding: "8px 10px",
        marginBottom: 10,
        whiteSpace: "pre-wrap"
      }
    }, r.reason), /*#__PURE__*/React.createElement("div", {
      style: {
        display: "flex",
        gap: 8
      }
    }, /*#__PURE__*/React.createElement("button", {
      onClick: () => setReqStatus(r, done ? "未対応" : "対応済み"),
      style: {
        flex: 1,
        border: "none",
        background: done ? "#eee" : "#2f6fb0",
        color: done ? "#888" : "#fff",
        fontWeight: 800,
        fontSize: 13,
        borderRadius: 9,
        padding: "9px",
        cursor: "pointer"
      }
    }, done ? "未対応に戻す" : "対応済みにする"), /*#__PURE__*/React.createElement("button", {
      onClick: () => delReq(r),
      style: {
        border: "1px solid #f0d0d0",
        background: "#fff",
        color: "#d33",
        fontWeight: 800,
        fontSize: 13,
        borderRadius: 9,
        padding: "9px 14px",
        cursor: "pointer"
      }
    }, "削除")));
  }))), section === "genre" && /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 13,
      color: "var(--sub)",
      marginBottom: 14,
      lineHeight: 1.6
    }
  }, "検索画面の左タブで使うジャンルを、ここで振り分けます。ボタンをタップで設定（同じものをもう一度タップで未分類に戻す）。公開中のPOPのみ表示。「除外」を選ぶと、そのPOPは検索結果に出なくなります（一覧には残り、左タブにも出ません）。"), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      gap: 8,
      flexWrap: "wrap",
      marginBottom: 16
    }
  }, ["未分類", ...GENRES, "除外"].map(g => {
    const on = gFilter === g;
    const c = GENRE_COLORS[g];
    return /*#__PURE__*/React.createElement("button", {
      key: g,
      onClick: () => setGFilter(g),
      style: {
        border: on ? "none" : "1px solid var(--line)",
        background: on ? c ? c.solid : "#222" : "#fff",
        color: on ? "#fff" : "#777",
        fontSize: 13,
        fontWeight: 800,
        padding: "8px 12px",
        borderRadius: 9,
        cursor: "pointer"
      }
    }, g, "（", genreCount(g), "）");
  })), loading ? /*#__PURE__*/React.createElement("div", {
    style: {
      textAlign: "center",
      color: "var(--sub)",
      padding: "40px 0",
      fontSize: 14
    }
  }, "読み込み中…") : genreList.length === 0 ? /*#__PURE__*/React.createElement("div", {
    style: {
      textAlign: "center",
      color: "var(--faint)",
      padding: "40px 0",
      fontSize: 14
    }
  }, gFilter === "未分類" ? "未分類のPOPはありません（すべて振り分け済み）" : `「${gFilter}」のPOPはありません`) : /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      flexDirection: "column",
      gap: 10
    }
  }, genreList.map(p => /*#__PURE__*/React.createElement("div", {
    key: p.id,
    style: {
      background: "#fff",
      borderRadius: 12,
      boxShadow: "0 1px 8px rgba(0,0,0,0.06)",
      padding: 10,
      display: "flex",
      gap: 11,
      alignItems: "flex-start"
    }
  }, /*#__PURE__*/React.createElement("img", {
    src: p.image_url,
    alt: "",
    style: {
      width: 52,
      height: 68,
      objectFit: "cover",
      borderRadius: 8,
      background: "var(--chip)",
      flexShrink: 0
    }
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      flex: 1,
      minWidth: 0
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 14,
      fontWeight: 800,
      color: "var(--ink)",
      whiteSpace: "nowrap",
      overflow: "hidden",
      textOverflow: "ellipsis"
    }
  }, p.product_name), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 12,
      color: "var(--sub)",
      marginBottom: 8
    }
  }, p.store_name, p.category ? ` ・ ${p.category}` : ""), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      flexWrap: "wrap",
      gap: 6
    }
  }, [...GENRES, "除外"].map(g => {
    const gc = GENRE_COLORS[g];
    const on = p.genre === g;
    return /*#__PURE__*/React.createElement("button", {
      key: g,
      onClick: () => assignGenre(p, g),
      style: {
        border: `1.5px solid ${gc.solid}`,
        background: on ? gc.solid : "#fff",
        color: on ? "#fff" : gc.solid,
        fontSize: 12,
        fontWeight: 800,
        padding: "7px 11px",
        borderRadius: 8,
        cursor: "pointer",
        whiteSpace: "nowrap"
      }
    }, g);
  }))))))), section === "archive" && /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 13,
      color: "var(--sub)",
      marginBottom: 14
    }
  }, "写真をタップして選び、まとめてアーカイブ／公開に戻せます。"), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      borderRadius: 10,
      overflow: "hidden",
      border: "1px solid var(--line)",
      marginBottom: 14
    }
  }, seg("active", "公開中", aCount), seg("archived", "アーカイブ済み", arCount)), loading ? /*#__PURE__*/React.createElement("div", {
    style: {
      textAlign: "center",
      color: "var(--sub)",
      padding: "40px 0",
      fontSize: 14
    }
  }, "読み込み中…") : list.length === 0 ? /*#__PURE__*/React.createElement("div", {
    style: {
      textAlign: "center",
      color: "var(--faint)",
      padding: "40px 0",
      fontSize: 14
    }
  }, view === "archived" ? "アーカイブ済みのPOPはありません" : "公開中のPOPはありません") : /*#__PURE__*/React.createElement("div", {
    style: {
      display: "grid",
      gridTemplateColumns: "repeat(auto-fill, minmax(108px, 1fr))",
      gap: 10
    }
  }, list.map(p => {
    const on = !!sel[p.id];
    return /*#__PURE__*/React.createElement("button", {
      key: p.id,
      onClick: () => toggle(p.id),
      style: {
        position: "relative",
        border: on ? "3px solid var(--primary)" : "1px solid var(--line)",
        borderRadius: 12,
        overflow: "hidden",
        background: "#fff",
        padding: 0,
        cursor: "pointer",
        textAlign: "left",
        boxShadow: "0 1px 6px rgba(0,0,0,0.06)"
      }
    }, /*#__PURE__*/React.createElement("img", {
      src: p.image_url,
      alt: "",
      style: {
        width: "100%",
        aspectRatio: "3 / 4",
        objectFit: "cover",
        display: "block",
        background: "var(--chip)",
        opacity: on ? 0.85 : 1
      }
    }), on && /*#__PURE__*/React.createElement("span", {
      style: {
        position: "absolute",
        top: 6,
        right: 6,
        width: 24,
        height: 24,
        borderRadius: "50%",
        background: "var(--primary)",
        color: "#fff",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontSize: 15,
        fontWeight: 900,
        lineHeight: 1
      }
    }, "✓"), /*#__PURE__*/React.createElement("div", {
      style: {
        padding: "6px 8px"
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        fontSize: 12,
        fontWeight: 800,
        color: "var(--ink)",
        whiteSpace: "nowrap",
        overflow: "hidden",
        textOverflow: "ellipsis"
      }
    }, p.product_name), /*#__PURE__*/React.createElement("div", {
      style: {
        fontSize: 11,
        color: "var(--sub)",
        whiteSpace: "nowrap",
        overflow: "hidden",
        textOverflow: "ellipsis"
      }
    }, p.store_name)));
  }))), section === "archive" && selIds.length > 0 && /*#__PURE__*/React.createElement("div", {
    style: {
      position: "fixed",
      left: 0,
      right: 0,
      bottom: "calc(78px + env(safe-area-inset-bottom))",
      zIndex: 190,
      background: "#fff",
      borderTop: "1px solid #ececec",
      boxShadow: "0 -2px 14px rgba(0,0,0,0.1)",
      padding: "12px 16px",
      display: "flex",
      alignItems: "center",
      gap: 12
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 14,
      fontWeight: 800,
      color: "var(--ink)"
    }
  }, selIds.length, "件 選択中"), /*#__PURE__*/React.createElement("button", {
    onClick: () => setSel({}),
    style: {
      marginLeft: "auto",
      border: "1px solid var(--line)",
      background: "#fff",
      color: "var(--sub)",
      borderRadius: 9,
      padding: "9px 12px",
      fontSize: 13,
      fontWeight: 700,
      cursor: "pointer"
    }
  }, "解除"), /*#__PURE__*/React.createElement("button", {
    onClick: apply,
    disabled: applying,
    style: {
      border: "none",
      background: toArchive ? "var(--primary)" : "#2f6fb0",
      color: "#fff",
      borderRadius: 9,
      padding: "10px 16px",
      fontSize: 14,
      fontWeight: 800,
      cursor: "pointer",
      opacity: applying ? 0.6 : 1
    }
  }, applying ? "処理中…" : toArchive ? "アーカイブする" : "公開に戻す")), section === "pinned" && /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 13,
      color: "var(--sub)",
      marginBottom: 14
    }
  }, "ホーム画面の一覧最上部に固定するPOPを選択できます"), loading ? /*#__PURE__*/React.createElement("div", {
    style: {
      textAlign: "center",
      color: "var(--sub)",
      padding: "40px 0",
      fontSize: 14
    }
  }, "読み込み中…") : /*#__PURE__*/React.createElement(React.Fragment, null, pinnedPopId && /*#__PURE__*/React.createElement("div", {
    style: {
      background: "#fff8f0",
      border: "2px solid var(--primary)",
      borderRadius: 12,
      padding: 12,
      marginBottom: 14
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 12,
      fontWeight: 800,
      color: "var(--primary)",
      marginBottom: 6
    }
  }, "📌 現在のピン留め"), pops.find(p => p.id === pinnedPopId) && /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      gap: 8,
      alignItems: "center"
    }
  }, /*#__PURE__*/React.createElement("img", {
    src: pops.find(p => p.id === pinnedPopId).image_url,
    style: {
      width: 60,
      height: 60,
      objectFit: "cover",
      borderRadius: 8
    }
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      flex: 1,
      fontSize: 13,
      fontWeight: 700
    }
  }, pops.find(p => p.id === pinnedPopId).product_name || "無題"), /*#__PURE__*/React.createElement("button", {
    onClick: () => setPinned(null),
    style: {
      border: "none",
      background: "var(--chip)",
      color: "var(--text)",
      borderRadius: 8,
      padding: "6px 12px",
      fontSize: 12,
      fontWeight: 700,
      cursor: "pointer"
    }
  }, "外す"))), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 12,
      fontWeight: 800,
      color: "var(--sub)",
      marginBottom: 8
    }
  }, "最近投稿したPOP"), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "grid",
      gridTemplateColumns: "repeat(auto-fill, minmax(100px, 1fr))",
      gap: 8
    }
  }, pops.slice(0, 20).map(p => /*#__PURE__*/React.createElement("div", {
    key: p.id,
    onClick: () => setPinned(p.id),
    style: {
      cursor: "pointer",
      opacity: p.id === pinnedPopId ? 0.5 : 1,
      position: "relative"
    }
  }, /*#__PURE__*/React.createElement("img", {
    src: p.image_url,
    style: {
      width: "100%",
      aspectRatio: "1/1",
      objectFit: "cover",
      borderRadius: 8,
      border: p.id === pinnedPopId ? "3px solid var(--primary)" : "none"
    }
  }), p.id === pinnedPopId && /*#__PURE__*/React.createElement("div", {
    style: {
      position: "absolute",
      inset: 0,
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      fontSize: 24
    }
  }, "📌")))))), section === "memo" && /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 13,
      color: "var(--sub)",
      marginBottom: 12
    }
  }, "制作時の気づき・失敗点・工夫を箇条書きで記録。メモ内のPOP名は自動でリンクになります"), /*#__PURE__*/React.createElement("textarea", {
    value: memoText,
    onChange: e => {
      setMemoText(e.target.value);
      setMemoDirty(true);
    },
    placeholder: "・商品名／キャンペーン名\n・用途／売場\n・メイン訴求\n・デザイン方向\n・修正した点\n・AIが失敗した点\n・次回流用できる点",
    style: {
      width: "100%",
      minHeight: 200,
      boxSizing: "border-box",
      border: "1px solid var(--line)",
      borderRadius: 10,
      padding: 12,
      fontSize: 13,
      fontFamily: "monospace",
      lineHeight: 1.7,
      marginBottom: 12
    }
  }), memoDirty && /*#__PURE__*/React.createElement("button", {
    onClick: async () => {
      setMemoLoading(true);
      try {
        await api.saveMemo(memoText);
        setMemoDirty(false);
      } catch (e) {
        alert("保存に失敗しました");
      } finally {
        setMemoLoading(false);
      }
    },
    disabled: memoLoading,
    style: {
      border: "none",
      background: memoLoading ? "#f0b48a" : "var(--primary)",
      color: "#fff",
      borderRadius: 10,
      padding: "10px 16px",
      fontSize: 14,
      fontWeight: 800,
      cursor: memoLoading ? "default" : "pointer"
    }
  }, memoLoading ? "保存中…" : "保存する")));
}

// ===== アーカイブ：販売終了POPの保管庫（誰でも閲覧可・読み取り専用） =====
function ArchiveTab({
  onCreateFromPop
}) {
  const [pops, setPops] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sel, setSel] = useState(null);
  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        const d = await api.listArchived();
        if (alive) setPops(d);
      } catch (e) {
        console.error(e);
      } finally {
        if (alive) setLoading(false);
      }
    })();
    return () => {
      alive = false;
    };
  }, []);
  return /*#__PURE__*/React.createElement("div", {
    style: {
      maxWidth: 1080,
      margin: "0 auto",
      padding: 16,
      paddingBottom: 90,
      animation: "fadeUp .3s ease"
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 22,
      fontWeight: 900,
      color: "var(--ink)",
      marginBottom: 4
    }
  }, "アーカイブ"), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 13,
      color: "var(--sub)",
      marginBottom: 14
    }
  }, "販売が終わったPOPの保管庫です。過去の参考にどうぞ。"), loading ? /*#__PURE__*/React.createElement("div", {
    style: {
      textAlign: "center",
      color: "var(--sub)",
      padding: "50px 0",
      fontSize: 14
    }
  }, "読み込み中…") : pops.length === 0 ? /*#__PURE__*/React.createElement("div", {
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
  }, "アーカイブはまだ空です"), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 13,
      marginTop: 6,
      color: "var(--faint)"
    }
  }, "管理画面からPOPをアーカイブできます")) : /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 13,
      fontWeight: 800,
      color: "var(--sub)",
      marginBottom: 12,
      paddingLeft: 2
    }
  }, "アーカイブ済み（", pops.length, "）"), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "grid",
      gridTemplateColumns: "repeat(auto-fill, minmax(118px, 1fr))",
      gap: 3
    }
  }, pops.map(pop => /*#__PURE__*/React.createElement("img", {
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
  })))), sel && /*#__PURE__*/React.createElement(PopDetail, {
    pop: sel,
    onClose: () => setSel(null),
    navList: pops,
    onNav: setSel,
    onDelete: id => {
      setPops(p => p.filter(x => x.id !== id));
      setSel(null);
    },
    onLiked: (id, likes) => setPops(p => p.map(x => x.id === id ? {
      ...x,
      likes
    } : x)),
    onCreateFromPop: onCreateFromPop
  }));
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
  const isPop = kind === "POP作成依頼";
  const submit = async () => {
    if (isPop && !product.trim()) {
      setError("商品名を入力してください");
      return;
    }
    if (!isPop && !reason.trim()) {
      setError("内容を入力してください");
      return;
    }
    setBusy(true);
    setError("");
    try {
      await api.insertRequest({
        kind,
        store_name: store || "未指定",
        product_name: isPop ? product.trim() : product.trim() || kind,
        reason: reason.trim(),
        author: "匿名",
        priority: isPop ? priority : "普通"
      });
      setDone(true);
    } catch (e) {
      setError("送信に失敗しました: " + e.message);
    } finally {
      setBusy(false);
    }
  };
  const reset = () => {
    setProduct("");
    setReason("");
    setPriority("普通");
    setDone(false);
    setError("");
  };
  const card = {
    background: "#fff",
    borderRadius: 14,
    boxShadow: "0 2px 12px rgba(0,0,0,0.06)",
    padding: 16
  };
  const lbl = {
    fontSize: 12,
    color: "var(--sub)",
    marginBottom: 5,
    fontWeight: 700
  };
  const inp = {
    width: "100%",
    boxSizing: "border-box",
    border: "1px solid var(--line)",
    borderRadius: 10,
    padding: "11px 12px",
    fontSize: 15,
    outline: "none",
    background: "#fff"
  };
  if (done) {
    return /*#__PURE__*/React.createElement("div", {
      style: {
        maxWidth: 560,
        margin: "0 auto",
        padding: 16,
        animation: "fadeUp .3s ease"
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        ...card,
        textAlign: "center",
        padding: "40px 24px"
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        fontSize: 17,
        fontWeight: 900,
        color: "var(--ink)",
        marginBottom: 6
      }
    }, "送信しました"), /*#__PURE__*/React.createElement("div", {
      style: {
        fontSize: 13,
        color: "var(--sub)",
        marginBottom: 20,
        lineHeight: 1.6
      }
    }, isPop ? "担当者に届きました。POPができるまでお待ちください。" : "担当者に届きました。内容を確認して対応します。"), /*#__PURE__*/React.createElement("button", {
      onClick: reset,
      style: {
        border: "none",
        background: "var(--primary)",
        color: "#fff",
        fontWeight: 800,
        fontSize: 15,
        borderRadius: 10,
        padding: "12px 24px",
        cursor: "pointer"
      }
    }, "続けて送信する")));
  }
  return /*#__PURE__*/React.createElement("div", {
    style: {
      maxWidth: 560,
      margin: "0 auto",
      padding: 16,
      animation: "fadeUp .3s ease"
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 22,
      fontWeight: 900,
      color: "var(--ink)",
      marginBottom: 4
    }
  }, "お問い合わせ"), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 13,
      color: "var(--sub)",
      marginBottom: 14
    }
  }, "POPの作成依頼、アプリや売場へのご要望、質問など、なんでもここからどうぞ。内容は担当者に届きます。"), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      gap: 7,
      marginBottom: 16
    }
  }, ["POP作成依頼", "ご要望", "質問・お問い合わせ"].map(k => {
    const on = kind === k;
    return /*#__PURE__*/React.createElement("button", {
      key: k,
      onClick: () => {
        setKind(k);
        setError("");
      },
      style: {
        flex: 1,
        border: on ? "2px solid var(--primary)" : "1px solid var(--line)",
        background: on ? "var(--soft)" : "#fff",
        color: on ? "var(--primary)" : "var(--text)",
        fontWeight: 800,
        fontSize: 12,
        borderRadius: 11,
        padding: "10px 4px",
        cursor: "pointer",
        lineHeight: 1.3
      }
    }, k);
  })), /*#__PURE__*/React.createElement("div", {
    style: {
      ...card,
      display: "flex",
      flexDirection: "column",
      gap: 14
    }
  }, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
    style: lbl
  }, isPop ? /*#__PURE__*/React.createElement(React.Fragment, null, "商品名 ", /*#__PURE__*/React.createElement("span", {
    style: {
      color: "var(--primary)"
    }
  }, "*")) : "件名（任意）"), /*#__PURE__*/React.createElement("input", {
    value: product,
    onChange: e => setProduct(e.target.value),
    placeholder: isPop ? "例：生本まぐろ 中トロ" : "例：魚図鑑に追加してほしい魚がある",
    style: inp
  })), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
    style: lbl
  }, "店舗"), /*#__PURE__*/React.createElement("select", {
    value: store,
    onChange: e => setStore(e.target.value),
    style: inp
  }, /*#__PURE__*/React.createElement("option", {
    value: ""
  }, "未指定"), STORES.map(s => /*#__PURE__*/React.createElement("option", {
    key: s,
    value: s
  }, s)))), isPop && /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
    style: lbl
  }, "優先度"), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      gap: 8
    }
  }, ["普通", "急ぎ"].map(pr => {
    const on = priority === pr;
    const urgent = pr === "急ぎ";
    return /*#__PURE__*/React.createElement("button", {
      key: pr,
      onClick: () => setPriority(pr),
      style: {
        flex: 1,
        border: `2px solid ${on ? urgent ? "#e01010" : "var(--primary)" : "#eee"}`,
        background: on ? urgent ? "#fff0f0" : "#fff3ea" : "#fff",
        color: on ? urgent ? "#e01010" : "var(--primary)" : "#999",
        fontWeight: 800,
        fontSize: 14,
        borderRadius: 10,
        padding: "9px",
        cursor: "pointer"
      }
    }, urgent ? "急ぎ" : "普通");
  }))), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
    style: lbl
  }, isPop ? "要望・メモ" : /*#__PURE__*/React.createElement(React.Fragment, null, "内容 ", /*#__PURE__*/React.createElement("span", {
    style: {
      color: "var(--primary)"
    }
  }, "*"))), /*#__PURE__*/React.createElement("textarea", {
    value: reason,
    onChange: e => setReason(e.target.value),
    placeholder: isPop ? "サイズ、訴求ポイント、産地、希望日など" : kind === "ご要望" ? "例：便利機能に◯◯の計算を追加してほしい／売場写真を店舗別に見たい など" : "例：アーカイブの使い方が分からない／パスワードを忘れた など",
    rows: isPop ? 3 : 5,
    style: {
      ...inp,
      resize: "vertical",
      lineHeight: 1.5
    }
  })), error && /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 13,
      color: "#e01010",
      fontWeight: 700
    }
  }, error), /*#__PURE__*/React.createElement("button", {
    onClick: submit,
    disabled: busy,
    style: {
      border: "none",
      background: "var(--primary)",
      color: "#fff",
      fontWeight: 800,
      fontSize: 15,
      borderRadius: 10,
      padding: "13px",
      cursor: "pointer",
      opacity: busy ? 0.6 : 1
    }
  }, busy ? "送信中…" : "送信する")));
}
function NoticeAdmin({
  onNoticeChange
}) {
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
  useEffect(() => {
    api.getNotice().then(n => {
      setEnabled(!!n.enabled);
      setMessage(n.message || "");
      setTipEnabled(n.tip_enabled !== false);
      setTipMessage(n.tip_message || "季節のポップや時期が過ぎたポップは「アーカイブ」に収納されます。");
      setFeatEnabled(!!n.feat_enabled);
      setFeatMessage(n.feat_message || "");
      setFeatTab(n.feat_tab || "");
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);
  const save = async () => {
    setSaving(true);
    setSaved(false);
    try {
      const featVer = featEnabled && featMessage.trim() ? featMessage.trim().slice(0, 40) + "|" + Date.now() : "";
      const row = await api.updateNotice({
        enabled,
        message: message.trim(),
        tip_enabled: tipEnabled,
        tip_message: tipMessage.trim(),
        feat_enabled: featEnabled,
        feat_message: featMessage.trim(),
        feat_tab: featTab,
        feat_ver: featVer
      });
      const next = {
        enabled: row ? !!row.enabled : enabled,
        message: row ? row.message || "" : message.trim(),
        tip_enabled: row ? row.tip_enabled !== false : tipEnabled,
        tip_message: row ? row.tip_message || "" : tipMessage.trim(),
        feat_enabled: row ? !!row.feat_enabled : featEnabled,
        feat_message: row ? row.feat_message || "" : featMessage.trim(),
        feat_tab: row ? row.feat_tab || "" : featTab,
        feat_ver: row ? row.feat_ver || "" : featVer
      };
      if (onNoticeChange) onNoticeChange(next);
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch (e) {
      alert("保存に失敗しました");
    }
    setSaving(false);
  };
  const card = {
    background: "#fff",
    borderRadius: 14,
    boxShadow: "0 2px 12px rgba(0,0,0,0.07)",
    padding: "16px 18px",
    marginBottom: 14
  };
  if (loading) return /*#__PURE__*/React.createElement("div", {
    style: {
      textAlign: "center",
      color: "var(--faint)",
      padding: "30px 0"
    }
  }, "読み込み中…");
  return /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
    style: {
      ...card,
      fontSize: 13,
      color: "var(--text)",
      lineHeight: 1.7
    }
  }, "2種類のお知らせを、ここからON/OFFできます。①は不具合などの", /*#__PURE__*/React.createElement("b", null, "緊急のお知らせバナー"), "（メインページ上部に固定）、②はホーム画面下に出る", /*#__PURE__*/React.createElement("b", null, "案内メッセージ"), "（タップ／スクロールで消えるもの）です。保存すると、みんなの画面に反映されます。"), /*#__PURE__*/React.createElement("div", {
    style: card
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      marginBottom: 4
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 15,
      fontWeight: 900,
      color: "var(--ink)"
    }
  }, "① 緊急お知らせバナーを表示する"), /*#__PURE__*/React.createElement("button", {
    onClick: () => setEnabled(v => !v),
    style: {
      width: 58,
      height: 32,
      borderRadius: 16,
      border: "none",
      cursor: "pointer",
      position: "relative",
      background: enabled ? "var(--primary)" : "#d4d4d8",
      transition: "background .2s"
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      position: "absolute",
      top: 3,
      left: enabled ? 29 : 3,
      width: 26,
      height: 26,
      borderRadius: "50%",
      background: "#fff",
      boxShadow: "0 1px 3px rgba(0,0,0,0.3)",
      transition: "left .2s"
    }
  }))), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 12,
      color: enabled ? "var(--primary)" : "#999",
      fontWeight: 700,
      marginBottom: 14
    }
  }, enabled ? "● 表示中（保存すると全員に出ます）" : "○ 非表示"), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 13,
      fontWeight: 800,
      color: "var(--text)",
      marginBottom: 6
    }
  }, "お知らせ文"), /*#__PURE__*/React.createElement("textarea", {
    value: message,
    onChange: e => setMessage(e.target.value),
    rows: 4,
    placeholder: "例：発注バーコードの印刷がWindowsで一部ずれる不具合のため、印刷機能を一時調整中です。MacやiPhoneでは利用できます。",
    style: {
      width: "100%",
      boxSizing: "border-box",
      padding: "11px 13px",
      border: "1px solid #e2e2e6",
      borderRadius: 10,
      fontSize: 14,
      outline: "none",
      resize: "vertical",
      fontFamily: "inherit",
      lineHeight: 1.6
    }
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 12,
      color: "var(--sub)",
      margin: "14px 0 6px",
      fontWeight: 700
    }
  }, "プレビュー（実際の見え方）"), /*#__PURE__*/React.createElement("div", {
    style: {
      background: "#fff4e5",
      border: "1px solid #ffc98a",
      color: "#8a4b00",
      borderRadius: 12,
      padding: "12px 14px",
      fontSize: 13.5,
      fontWeight: 700,
      lineHeight: 1.6,
      display: "flex",
      gap: 9,
      alignItems: "flex-start"
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 16,
      lineHeight: 1.3
    }
  }, "⚠️"), /*#__PURE__*/React.createElement("span", {
    style: {
      whiteSpace: "pre-wrap",
      color: message.trim() ? "#8a4b00" : "#c79a6a"
    }
  }, message.trim() || "（ここにお知らせ文が表示されます）"))), /*#__PURE__*/React.createElement("div", {
    style: card
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      marginBottom: 4
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 15,
      fontWeight: 900,
      color: "var(--ink)"
    }
  }, "② ホーム画面の案内メッセージ"), /*#__PURE__*/React.createElement("button", {
    onClick: () => setTipEnabled(v => !v),
    style: {
      width: 58,
      height: 32,
      borderRadius: 16,
      border: "none",
      cursor: "pointer",
      position: "relative",
      background: tipEnabled ? "#2f6fed" : "#d4d4d8",
      transition: "background .2s"
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      position: "absolute",
      top: 3,
      left: tipEnabled ? 29 : 3,
      width: 26,
      height: 26,
      borderRadius: "50%",
      background: "#fff",
      boxShadow: "0 1px 3px rgba(0,0,0,0.3)",
      transition: "left .2s"
    }
  }))), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 12,
      color: tipEnabled ? "#2f6fed" : "#999",
      fontWeight: 700,
      marginBottom: 6
    }
  }, tipEnabled ? "● 表示中（ホーム画面下に出ます）" : "○ 非表示"), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 11.5,
      color: "var(--sub)",
      marginBottom: 12,
      lineHeight: 1.6
    }
  }, "タップまたはスクロールで自動的に消える、ホーム画面下のフローティング案内です。「季節のポップは自動でアーカイブされます」といった軽い案内に使います。"), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 13,
      fontWeight: 800,
      color: "var(--text)",
      marginBottom: 6
    }
  }, "案内文"), /*#__PURE__*/React.createElement("textarea", {
    value: tipMessage,
    onChange: e => setTipMessage(e.target.value),
    rows: 2,
    placeholder: "例：季節のポップや時期が過ぎたポップは「アーカイブ」に収納されます。",
    style: {
      width: "100%",
      boxSizing: "border-box",
      padding: "11px 13px",
      border: "1px solid #e2e2e6",
      borderRadius: 10,
      fontSize: 14,
      outline: "none",
      resize: "vertical",
      fontFamily: "inherit",
      lineHeight: 1.6
    }
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 12,
      color: "var(--sub)",
      margin: "14px 0 6px",
      fontWeight: 700
    }
  }, "プレビュー"), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      alignItems: "center",
      gap: 10,
      background: "linear-gradient(135deg,#fff3ea,#ffe9d6)",
      border: "1.5px solid #ffd9bd",
      borderRadius: 14,
      padding: "12px 14px"
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 13,
      fontWeight: 700,
      color: "#a8480a",
      lineHeight: 1.5,
      flex: 1
    }
  }, tipMessage.trim() || "（ここに案内文が表示されます）"))), /*#__PURE__*/React.createElement("div", {
    style: card
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      marginBottom: 4
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 15,
      fontWeight: 900,
      color: "var(--ink)"
    }
  }, "③ 新機能のお知らせバナー"), /*#__PURE__*/React.createElement("button", {
    onClick: () => setFeatEnabled(v => !v),
    style: {
      width: 58,
      height: 32,
      borderRadius: 16,
      border: "none",
      cursor: "pointer",
      position: "relative",
      background: featEnabled ? "#2f6fb0" : "#d4d4d8",
      transition: "background .2s"
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      position: "absolute",
      top: 3,
      left: featEnabled ? 29 : 3,
      width: 26,
      height: 26,
      borderRadius: "50%",
      background: "#fff",
      boxShadow: "0 1px 3px rgba(0,0,0,0.3)",
      transition: "left .2s"
    }
  }))), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 12,
      color: featEnabled ? "#2f6fb0" : "#999",
      fontWeight: 700,
      marginBottom: 6
    }
  }, featEnabled ? "● 表示中（ホーム上部に青のバナー）" : "○ 非表示"), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 11.5,
      color: "var(--sub)",
      marginBottom: 12,
      lineHeight: 1.6
    }
  }, "新機能を追加したときに、ホーム画面の上部に出す案内です。各自が一度「×」で閉じると、その人には再表示されません（文面を変えて保存すると、また全員に表示されます）。"), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 13,
      fontWeight: 800,
      color: "var(--text)",
      marginBottom: 6
    }
  }, "お知らせ文"), /*#__PURE__*/React.createElement("textarea", {
    value: featMessage,
    onChange: e => setFeatMessage(e.target.value),
    rows: 2,
    placeholder: "例：魚図鑑ができました！旬の魚や売り方のヒントが見られます。",
    style: {
      width: "100%",
      boxSizing: "border-box",
      padding: "11px 13px",
      border: "1px solid #e2e2e6",
      borderRadius: 10,
      fontSize: 14,
      outline: "none",
      resize: "vertical",
      fontFamily: "inherit",
      lineHeight: 1.6
    }
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 13,
      fontWeight: 800,
      color: "var(--text)",
      margin: "14px 0 6px"
    }
  }, "タップで開く機能（任意）"), /*#__PURE__*/React.createElement("select", {
    value: featTab,
    onChange: e => setFeatTab(e.target.value),
    style: {
      width: "100%",
      boxSizing: "border-box",
      padding: "11px 13px",
      border: "1px solid #e2e2e6",
      borderRadius: 10,
      fontSize: 14,
      background: "#fff",
      fontFamily: "inherit"
    }
  }, /*#__PURE__*/React.createElement("option", {
    value: ""
  }, "（移動しない）"), TAB_REGISTRY.filter(t => t.key !== "admin").map(t => /*#__PURE__*/React.createElement("option", {
    key: t.key,
    value: t.key
  }, t.label))), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 12,
      color: "var(--sub)",
      margin: "14px 0 6px",
      fontWeight: 700
    }
  }, "プレビュー"), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      alignItems: "center",
      gap: 10,
      background: "linear-gradient(135deg,#2f6fb0,#4a8fd4)",
      borderRadius: 14,
      padding: "12px 14px"
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 20
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
  }, featMessage.trim() || "（ここにお知らせ文が表示されます）")), featTab && /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 11,
      fontWeight: 800,
      color: "#2f6fb0",
      background: "#fff",
      borderRadius: 8,
      padding: "4px 10px"
    }
  }, "ひらく"))), /*#__PURE__*/React.createElement("button", {
    onClick: save,
    disabled: saving,
    style: {
      width: "100%",
      border: "none",
      background: saving ? "#bbb" : saved ? "#2f6fb0" : "var(--primary)",
      color: "#fff",
      borderRadius: 11,
      padding: "13px",
      fontSize: 15,
      fontWeight: 800,
      cursor: saving ? "default" : "pointer",
      marginBottom: 14
    }
  }, saving ? "保存中…" : saved ? "✓ 保存しました（全員に反映）" : "まとめて保存する"));
}

// ═══════════ RankingPanel：管理画面内の記録（閲覧数・使った・いいね）═══════════
// 一般メニューには出さない。管理画面にログインした管理者だけが見られる。
function RankingPanel({
  onCreateFromPop
}) {
  const [pops, setPops] = useState([]);
  const [loading, setLoading] = useState(true);
  const [metric, setMetric] = useState("view");
  const [sel, setSel] = useState(null);
  const [ver, setVer] = useState(0);
  useEffect(() => {
    let alive = true;
    setLoading(true);
    (async () => {
      try {
        const d = await api.listActive();
        if (alive) setPops(d);
      } catch (e) {} finally {
        if (alive) setLoading(false);
      }
    })();
    return () => {
      alive = false;
    };
  }, [ver]);
  const METRICS = [{
    key: "view",
    label: "閲覧数",
    get: p => p.view_count || 0,
    unit: "回"
  }, {
    key: "used",
    label: "使った",
    get: p => p.used_count || 0,
    unit: "回"
  }, {
    key: "like",
    label: "いいね",
    get: p => p.likes || 0,
    unit: ""
  }];
  const m = METRICS.find(x => x.key === metric);
  const ranked = [...pops].filter(p => m.get(p) > 0).sort((a, b) => m.get(b) - m.get(a));
  const totals = METRICS.reduce((acc, x) => {
    acc[x.key] = pops.reduce((n, p) => n + x.get(p), 0);
    return acc;
  }, {});
  const rankStyle = i => i === 0 ? {
    bg: "#f7b733",
    fg: "#fff"
  } : i === 1 ? {
    bg: "#b9c2cc",
    fg: "#fff"
  } : i === 2 ? {
    bg: "#c98a5a",
    fg: "#fff"
  } : {
    bg: "var(--chip)",
    fg: "var(--sub)"
  };
  return /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      marginBottom: 10
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 12,
      color: "var(--sub)",
      lineHeight: 1.6
    }
  }, "ポップの閲覧数・使った回数・いいねの記録です。", /*#__PURE__*/React.createElement("br", null), "この画面は管理者だけが見られます。"), /*#__PURE__*/React.createElement("button", {
    onClick: () => setVer(v => v + 1),
    disabled: loading,
    style: {
      flexShrink: 0,
      border: "1px solid var(--line)",
      background: "#fff",
      color: "var(--text)",
      borderRadius: 9,
      padding: "7px 13px",
      fontSize: 12,
      fontWeight: 800,
      cursor: loading ? "default" : "pointer"
    }
  }, loading ? "更新中…" : "更新")), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      gap: 7,
      marginBottom: 12
    }
  }, METRICS.map(x => /*#__PURE__*/React.createElement("button", {
    key: x.key,
    onClick: () => setMetric(x.key),
    style: {
      flex: 1,
      border: metric === x.key ? "2px solid var(--primary)" : "1px solid var(--line)",
      borderRadius: 11,
      padding: "9px 6px",
      cursor: "pointer",
      background: metric === x.key ? "var(--soft)" : "#fff",
      color: metric === x.key ? "var(--primary)" : "var(--text)"
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 13,
      fontWeight: 800
    }
  }, x.label), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 11,
      fontWeight: 700,
      opacity: 0.75,
      marginTop: 2
    }
  }, "計 ", totals[x.key])))), loading ? /*#__PURE__*/React.createElement("div", null, [0, 1, 2, 3, 4].map(i => /*#__PURE__*/React.createElement("div", {
    key: i,
    style: {
      display: "flex",
      gap: 11,
      alignItems: "center",
      background: "#fff",
      border: "1px solid var(--line)",
      borderRadius: 13,
      padding: "10px 12px",
      marginBottom: 9
    }
  }, /*#__PURE__*/React.createElement("div", {
    className: "sk",
    style: {
      width: 34,
      height: 34,
      borderRadius: 9
    }
  }), /*#__PURE__*/React.createElement("div", {
    className: "sk",
    style: {
      width: 56,
      height: 56,
      borderRadius: 9
    }
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      flex: 1
    }
  }, /*#__PURE__*/React.createElement("div", {
    className: "sk",
    style: {
      width: "70%",
      height: 13,
      borderRadius: 6
    }
  }), /*#__PURE__*/React.createElement("div", {
    className: "sk",
    style: {
      width: "40%",
      height: 11,
      borderRadius: 6,
      marginTop: 7
    }
  }))))) : ranked.length === 0 ? /*#__PURE__*/React.createElement("div", {
    style: {
      textAlign: "center",
      color: "var(--faint)",
      padding: "40px 0",
      fontSize: 13,
      lineHeight: 1.8
    }
  }, "まだ記録がありません。", /*#__PURE__*/React.createElement("br", null), "ポップが見られる・使われると、ここに順位が並びます。") : ranked.map((p, i) => {
    const rs = rankStyle(i);
    return /*#__PURE__*/React.createElement("div", {
      key: p.id,
      onClick: () => setSel(p),
      style: {
        display: "flex",
        gap: 11,
        alignItems: "center",
        background: "#fff",
        border: i < 3 ? "1.5px solid " + rs.bg : "1px solid var(--line)",
        borderRadius: 13,
        padding: "10px 12px",
        marginBottom: 9,
        cursor: "pointer"
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        width: 34,
        height: 34,
        borderRadius: 9,
        background: rs.bg,
        color: rs.fg,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontSize: i < 3 ? 16 : 13,
        fontWeight: 900,
        flexShrink: 0
      }
    }, i + 1), /*#__PURE__*/React.createElement("img", {
      src: p.image_url,
      loading: "lazy",
      style: {
        width: 56,
        height: 56,
        objectFit: "cover",
        borderRadius: 9,
        flexShrink: 0,
        border: "1px solid var(--line)"
      }
    }), /*#__PURE__*/React.createElement("div", {
      style: {
        minWidth: 0,
        flex: 1
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        fontSize: 14,
        fontWeight: 900,
        color: "var(--ink)",
        overflow: "hidden",
        textOverflow: "ellipsis",
        whiteSpace: "nowrap"
      }
    }, p.product_name), /*#__PURE__*/React.createElement("div", {
      style: {
        fontSize: 11.5,
        color: "var(--sub)",
        marginTop: 2
      }
    }, p.store_name, p.author ? `　·　${p.author}` : "")), /*#__PURE__*/React.createElement("div", {
      style: {
        textAlign: "right",
        flexShrink: 0
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        fontSize: 17,
        fontWeight: 900,
        color: i < 3 ? "var(--primary)" : "var(--ink)",
        lineHeight: 1
      }
    }, m.get(p)), /*#__PURE__*/React.createElement("div", {
      style: {
        fontSize: 10,
        color: "var(--faint)",
        fontWeight: 700
      }
    }, m.label, m.unit)));
  }), sel && /*#__PURE__*/React.createElement(PopDetail, {
    pop: sel,
    onClose: () => setSel(null),
    navList: ranked,
    onNav: setSel,
    onDelete: id => {
      setPops(ps => ps.filter(x => x.id !== id));
      setSel(null);
    },
    onLiked: (id, likes) => setPops(ps => ps.map(x => x.id === id ? {
      ...x,
      likes
    } : x)),
    onCreateFromPop: onCreateFromPop
  }));
}
;
Object.assign(window, {
  RankingPanel,
  AdminTab,
  ArchiveTab,
  NoticeAdmin,
  RequestTab
});