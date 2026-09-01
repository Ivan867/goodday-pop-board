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
  const [replyDraft, setReplyDraft] = useState({}); // 依頼の返答メモ（{id: 入力中の文字}）
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
  const saveReply = async r => {
    const text = (replyDraft[r.id] ?? r.reply ?? "").trim();
    try {
      await api.updateRequest(r.id, {
        reply: text,
        replied_at: new Date().toISOString(),
        status: "対応済み"
      });
      setReqs(rs => rs.map(x => x.id === r.id ? {
        ...x,
        reply: text,
        replied_at: new Date().toISOString(),
        status: "対応済み"
      } : x));
    } catch (e) {}
  };
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
      const p2 = n => String(n).padStart(2, "0");
      return `${d.getMonth() + 1}/${d.getDate()} ${p2(d.getHours())}:${p2(d.getMinutes())}`;
    } catch (e) {
      return "";
    }
  };
  const SEG_ICON = {
    req: /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("path", {
      d: "M20 11.5a7.5 7.5 0 01-10.9 6.7L4 19.5l1.4-4.4A7.5 7.5 0 1120 11.5z"
    })),
    genre: /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("path", {
      d: "M4 5h16M7 12h13M10 19h10"
    }), /*#__PURE__*/React.createElement("circle", {
      cx: "4",
      cy: "12",
      r: "1.2"
    }), /*#__PURE__*/React.createElement("circle", {
      cx: "6.5",
      cy: "19",
      r: "1.2"
    })),
    archive: /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("path", {
      d: "M3 8.5h18v11a1.5 1.5 0 01-1.5 1.5h-15A1.5 1.5 0 013 19.5z"
    }), /*#__PURE__*/React.createElement("path", {
      d: "M2.5 4.5h19v4h-19zM9.5 12.5h5"
    })),
    notice: /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("path", {
      d: "M18 8.5a6 6 0 10-12 0c0 6-2.5 7.5-2.5 7.5h17S18 14.5 18 8.5z"
    }), /*#__PURE__*/React.createElement("path", {
      d: "M10.5 20a2 2 0 003 0"
    })),
    pinned: /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("path", {
      d: "M15 3l6 6-3 1-4.5 4.5L12 21l-2.5-6L3 12l6.5-1.5L14 6z"
    })),
    memo: /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("path", {
      d: "M4 20h4L18.5 9.5a2 2 0 00-2.8-2.8L5 17.2 4 20z"
    }), /*#__PURE__*/React.createElement("path", {
      d: "M14 6.5l3.5 3.5"
    })),
    ranking: /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("path", {
      d: "M4 20V11M10 20V5M16 20v-6M22 20H2"
    })),
    device: /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("rect", {
      x: "7",
      y: "2.5",
      width: "10",
      height: "19",
      rx: "2.5"
    }), /*#__PURE__*/React.createElement("path", {
      d: "M10.5 18.5h3"
    })),
    res: /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("path", {
      d: "M5 3.5h9l5 5v12H5z"
    }), /*#__PURE__*/React.createElement("path", {
      d: "M14 3.5v5h5M8.5 13h7M8.5 16.5h5"
    })),
    cat: /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("path", {
      d: "M3 5.5s2.5-1.5 4.5-1.5S12 5.5 12 5.5v14s-2-1.5-4.5-1.5S3 19.5 3 19.5z"
    }), /*#__PURE__*/React.createElement("path", {
      d: "M12 5.5s2.5-1.5 4.5-1.5S21 5.5 21 5.5v14s-2-1.5-4.5-1.5S12 19.5 12 19.5z"
    })),
    dev: /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("circle", {
      cx: "12",
      cy: "12",
      r: "9"
    }), /*#__PURE__*/React.createElement("path", {
      d: "M12 16v-5M12 8h.01"
    })),
    rot: /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("path", {
      d: "M3.5 12a8.5 8.5 0 018.5-8.5c3 0 5.6 1.6 7.1 3.9"
    }), /*#__PURE__*/React.createElement("path", {
      d: "M20.5 4v4h-4"
    }), /*#__PURE__*/React.createElement("path", {
      d: "M20.5 12a8.5 8.5 0 01-8.5 8.5c-3 0-5.6-1.6-7.1-3.9"
    }), /*#__PURE__*/React.createElement("path", {
      d: "M3.5 20v-4h4"
    }))
  };
  const mainSeg = (v, label, badge) => {
    const on = section === v;
    return /*#__PURE__*/React.createElement("button", {
      onClick: () => setSection(v),
      className: "hig-pill",
      style: {
        position: "relative",
        border: on ? "2px solid var(--primary-soft)" : "1px solid var(--line)",
        background: on ? "var(--soft)" : "#fff",
        color: on ? "var(--primary)" : "var(--text)",
        borderRadius: 12,
        padding: "11px 6px",
        fontSize: 12,
        fontWeight: 800,
        cursor: "pointer",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: 5,
        lineHeight: 1.3
      }
    }, /*#__PURE__*/React.createElement("svg", {
      width: "20",
      height: "20",
      viewBox: "0 0 24 24",
      fill: "none",
      stroke: "currentColor",
      strokeWidth: "1.9",
      strokeLinecap: "round",
      strokeLinejoin: "round"
    }, SEG_ICON[v]), /*#__PURE__*/React.createElement("span", {
      style: {
        whiteSpace: "nowrap"
      }
    }, label), badge ? /*#__PURE__*/React.createElement("span", {
      style: {
        position: "absolute",
        top: 5,
        right: 6,
        background: "#e0555f",
        color: "#fff",
        fontSize: 9.5,
        fontWeight: 900,
        borderRadius: 999,
        minWidth: 16,
        height: 16,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "0 4px"
      }
    }, badge) : null);
  };
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
      display: "grid",
      gridTemplateColumns: "repeat(auto-fit, minmax(76px, 1fr))",
      gap: 7,
      marginBottom: 16
    }
  }, mainSeg("req", "依頼", openReqs || 0), mainSeg("genre", "ジャンル", genreCount("未分類") || 0), mainSeg("archive", "アーカイブ"), mainSeg("notice", "お知らせ"), mainSeg("pinned", "ピン留め"), mainSeg("memo", "制作メモ"), mainSeg("ranking", "記録"), mainSeg("device", "端末"), mainSeg("res", "資料"), mainSeg("cat", "カタログ"), mainSeg("dev", "更新履歴"), mainSeg("rot", "向き")), section === "notice" && /*#__PURE__*/React.createElement(NoticeAdmin, {
    onNoticeChange: onNoticeChange
  }), section === "ranking" && /*#__PURE__*/React.createElement(RankingPanel, {
    onCreateFromPop: onCreateFromPop
  }), section === "device" && /*#__PURE__*/React.createElement(DeviceStatsPanel, null), section === "res" && /*#__PURE__*/React.createElement(ResourceAdmin, null), section === "cat" && /*#__PURE__*/React.createElement(CatalogAdmin, null), section === "dev" && (window.DevTab ? React.createElement(window.DevTab, {
    embedded: true
  }) : /*#__PURE__*/React.createElement("div", {
    style: {
      textAlign: "center",
      padding: 40,
      color: "var(--faint)",
      fontSize: 13
    }
  }, "読み込み中…")), section === "rot" && /*#__PURE__*/React.createElement(RotateAdmin, null), section === "req" && (reqLoading ? /*#__PURE__*/React.createElement("div", {
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
        background: done ? "#f6faf7" : "#fff",
        borderRadius: 14,
        border: done ? "1px solid #cfe8d8" : "1px solid var(--line)",
        padding: 14,
        borderLeft: `5px solid ${done ? "#3f9e63" : urgent ? "#e01010" : "var(--primary)"}`
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
        display: "flex",
        alignItems: "center",
        gap: 3,
        background: "#3f9e63",
        color: "#fff",
        fontSize: 10.5,
        fontWeight: 900,
        padding: "3px 9px",
        borderRadius: 7
      }
    }, /*#__PURE__*/React.createElement("svg", {
      width: "11",
      height: "11",
      viewBox: "0 0 24 24",
      fill: "none",
      stroke: "currentColor",
      strokeWidth: "3",
      strokeLinecap: "round",
      strokeLinejoin: "round"
    }, /*#__PURE__*/React.createElement("path", {
      d: "M4 12.5l5 5L20 6.5"
    })), "対応済み"), r.kind && r.kind !== "POP作成依頼" && /*#__PURE__*/React.createElement("span", {
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
        color: "var(--faint)",
        whiteSpace: "nowrap"
      }
    }, fmtDate(r.created_at), " 受付")), /*#__PURE__*/React.createElement("div", {
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
    }, r.reason), done && r.reply && /*#__PURE__*/React.createElement("div", {
      style: {
        fontSize: 12.5,
        color: "#2c6b45",
        lineHeight: 1.6,
        background: "#eaf6ee",
        borderRadius: 8,
        padding: "8px 10px",
        marginBottom: 10,
        whiteSpace: "pre-wrap"
      }
    }, /*#__PURE__*/React.createElement("span", {
      style: {
        fontWeight: 900
      }
    }, "返答："), r.reply, r.replied_at && /*#__PURE__*/React.createElement("span", {
      style: {
        marginLeft: 8,
        fontSize: 10.5,
        color: "#6a9a7c"
      }
    }, "（", fmtDate(r.replied_at), "）")), /*#__PURE__*/React.createElement("input", {
      value: replyDraft[r.id] ?? r.reply ?? "",
      onChange: e => setReplyDraft(v => ({
        ...v,
        [r.id]: e.target.value
      })),
      placeholder: "返答メモ（例：来週作ります／すでに投稿済みです）",
      style: {
        width: "100%",
        boxSizing: "border-box",
        border: "1px solid var(--line)",
        borderRadius: 8,
        padding: "8px 10px",
        fontSize: 12.5,
        outline: "none",
        marginBottom: 8,
        fontFamily: "inherit"
      }
    }), /*#__PURE__*/React.createElement("div", {
      style: {
        display: "flex",
        gap: 8
      }
    }, /*#__PURE__*/React.createElement("button", {
      onClick: () => done ? setReqStatus(r, "未対応") : saveReply(r),
      style: {
        flex: 1,
        border: "none",
        background: done ? "#eee" : "#3f9e63",
        color: done ? "#888" : "#fff",
        fontWeight: 800,
        fontSize: 13,
        borderRadius: 9,
        padding: "9px",
        cursor: "pointer"
      }
    }, done ? "未対応に戻す" : "返答して対応済みにする"), /*#__PURE__*/React.createElement("button", {
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
  const [resTarget, setResTarget] = useState(null);
  const [resTitle, setResTitle] = useState("");
  const [resDesc, setResDesc] = useState("");
  const [resVisible, setResVisible] = useState(false);
  const [resBusy, setResBusy] = useState(false);
  const [resMsg, setResMsg] = useState("");
  const openResForm = (pop, e) => {
    if (e) e.stopPropagation();
    setResTarget(pop);
    setResTitle(pop.product_name || "");
    setResDesc("");
    setResVisible(false);
    setResMsg("");
  };
  const saveAsResource = async () => {
    if (!resTitle.trim()) {
      setResMsg("タイトルを入力してください");
      return;
    }
    setResBusy(true);
    setResMsg("");
    try {
      await api.addResource({
        title: resTitle.trim(),
        description: resDesc.trim() || null,
        kind: "image",
        url: resTarget.image_url,
        emoji: "🖼",
        visible: resVisible,
        sort_order: 99
      });
      setResMsg("資料に登録しました");
      setTimeout(() => setResTarget(null), 900);
    } catch (e) {
      setResMsg("登録に失敗しました：" + (e.message || ""));
    } finally {
      setResBusy(false);
    }
  };
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
  }, pops.map(pop => /*#__PURE__*/React.createElement("div", {
    key: pop.id,
    style: {
      position: "relative"
    }
  }, /*#__PURE__*/React.createElement("img", {
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
  }), /*#__PURE__*/React.createElement("button", {
    onClick: e => openResForm(pop, e),
    title: "資料に登録",
    style: {
      position: "absolute",
      right: 5,
      bottom: 5,
      border: "none",
      background: "rgba(29,58,87,0.86)",
      color: "#fff",
      borderRadius: 999,
      padding: "4px 9px",
      fontSize: 10,
      fontWeight: 900,
      cursor: "pointer"
    }
  }, "資料へ"))))), resTarget && /*#__PURE__*/React.createElement("div", {
    onClick: () => setResTarget(null),
    style: {
      position: "fixed",
      inset: 0,
      background: "rgba(0,0,0,0.55)",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      zIndex: 1100,
      padding: 20
    }
  }, /*#__PURE__*/React.createElement("div", {
    onClick: e => e.stopPropagation(),
    style: {
      background: "#fff",
      borderRadius: 16,
      padding: 18,
      width: "100%",
      maxWidth: 340,
      maxHeight: "86vh",
      overflowY: "auto"
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 14.5,
      fontWeight: 900,
      color: "var(--ink)",
      marginBottom: 4
    }
  }, "資料に登録"), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 11.5,
      color: "var(--sub)",
      lineHeight: 1.6,
      marginBottom: 12
    }
  }, "このポップの画像を資料として登録します。「一覧に表示する」を入れなければ、管理画面からだけ見られます。"), /*#__PURE__*/React.createElement("img", {
    src: resTarget.image_url,
    style: {
      width: "100%",
      borderRadius: 10,
      marginBottom: 12,
      background: "var(--chip)"
    }
  }), /*#__PURE__*/React.createElement("input", {
    value: resTitle,
    onChange: e => setResTitle(e.target.value),
    placeholder: "タイトル",
    style: {
      width: "100%",
      boxSizing: "border-box",
      padding: "10px 11px",
      border: "1px solid var(--line)",
      borderRadius: 9,
      fontSize: 13.5,
      outline: "none",
      marginBottom: 8
    }
  }), /*#__PURE__*/React.createElement("input", {
    value: resDesc,
    onChange: e => setResDesc(e.target.value),
    placeholder: "説明（任意）",
    style: {
      width: "100%",
      boxSizing: "border-box",
      padding: "10px 11px",
      border: "1px solid var(--line)",
      borderRadius: 9,
      fontSize: 13,
      outline: "none",
      marginBottom: 11
    }
  }), /*#__PURE__*/React.createElement("label", {
    style: {
      display: "flex",
      alignItems: "center",
      gap: 7,
      fontSize: 12.5,
      fontWeight: 800,
      color: "var(--text)",
      cursor: "pointer",
      marginBottom: 13
    }
  }, /*#__PURE__*/React.createElement("input", {
    type: "checkbox",
    checked: resVisible,
    onChange: e => setResVisible(e.target.checked)
  }), "一覧に表示する（みんなが見られます）"), resMsg && /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 12,
      color: "var(--sub)",
      fontWeight: 700,
      marginBottom: 10
    }
  }, resMsg), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      gap: 8
    }
  }, /*#__PURE__*/React.createElement("button", {
    onClick: () => setResTarget(null),
    style: {
      flex: 1,
      padding: "11px",
      background: "var(--chip)",
      color: "var(--text)",
      border: "none",
      borderRadius: 9,
      fontSize: 13,
      fontWeight: 800,
      cursor: "pointer"
    }
  }, "やめる"), /*#__PURE__*/React.createElement("button", {
    onClick: saveAsResource,
    disabled: resBusy,
    style: {
      flex: 1,
      padding: "11px",
      background: resBusy ? "#ccc" : "var(--primary-soft, #4a7ab0)",
      color: "#fff",
      border: "none",
      borderRadius: 9,
      fontSize: 13,
      fontWeight: 900,
      cursor: resBusy ? "default" : "pointer"
    }
  }, resBusy ? "登録中…" : "登録する")))), sel && /*#__PURE__*/React.createElement(PopDetail, {
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
  const [menuHidden, setMenuHidden] = useState([]); // メニューで隠すタブ
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
      setEnabled(!!n.enabled);
      setMessage(n.message || "");
      setTipEnabled(n.tip_enabled !== false);
      setTipMessage(n.tip_message || "季節のポップや時期が過ぎたポップは「アーカイブ」に収納されます。");
      setFeatEnabled(!!n.feat_enabled);
      setFeatMessage(n.feat_message || "");
      setFeatTab(n.feat_tab || "");
      setBadgeTab(n.badge_tab || "");
      setBadgeText(n.badge_text || "");
      setMenuHidden(Array.isArray(n.menu_hidden) ? n.menu_hidden : []);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);
  const save = async () => {
    setSaving(true);
    setSaved(false);
    try {
      const featVer = featEnabled && featMessage.trim() ? featMessage.trim().slice(0, 40) + "|" + Date.now() : "";
      const on = !!(badgeTab && badgeText.trim());
      const badgeVer = on ? badgeText.trim().slice(0, 40) + "|" + Date.now() : "";
      const badgeUntil = on ? new Date(Date.now() + (Number(badgeDays) || 3) * 86400000).toISOString() : null;
      const row = await api.updateNotice({
        enabled,
        message: message.trim(),
        tip_enabled: tipEnabled,
        tip_message: tipMessage.trim(),
        feat_enabled: featEnabled,
        feat_message: featMessage.trim(),
        feat_tab: featTab,
        feat_ver: featVer,
        badge_tab: badgeTab,
        badge_text: badgeText.trim(),
        badge_ver: badgeVer,
        badge_until: badgeUntil,
        menu_hidden: menuHidden
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
  }, "ひらく"))), /*#__PURE__*/React.createElement("div", {
    style: card
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 15,
      fontWeight: 900,
      color: "var(--ink)",
      marginBottom: 4
    }
  }, "メニューに出すものをえらぶ"), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 12,
      color: "var(--sub)",
      marginBottom: 11,
      lineHeight: 1.6
    }
  }, "チェックを外すと、メニューから消えます（「管理画面」は常に出ます）"), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      flexDirection: "column",
      gap: 5,
      marginBottom: 22
    }
  }, TAB_REGISTRY.filter(t => t.key !== "admin").map(t => {
    const on = !menuHidden.includes(t.key);
    return /*#__PURE__*/React.createElement("button", {
      key: t.key,
      onClick: () => setMenuHidden(v => on ? v.concat(t.key) : v.filter(x => x !== t.key)),
      "aria-pressed": on,
      style: {
        display: "flex",
        alignItems: "center",
        gap: 10,
        textAlign: "left",
        width: "100%",
        border: on ? "1px solid #cfe8d8" : "1px solid var(--line)",
        background: on ? "#f4faf6" : "#fafafa",
        borderRadius: 9,
        padding: "9px 11px",
        cursor: "pointer"
      }
    }, /*#__PURE__*/React.createElement("span", {
      style: {
        width: 20,
        height: 20,
        borderRadius: 6,
        flexShrink: 0,
        border: on ? "none" : "1.5px solid var(--line)",
        background: on ? "#3f9e63" : "#fff",
        display: "flex",
        alignItems: "center",
        justifyContent: "center"
      }
    }, on && /*#__PURE__*/React.createElement("svg", {
      width: "12",
      height: "12",
      viewBox: "0 0 24 24",
      fill: "none",
      stroke: "#fff",
      strokeWidth: "3.6",
      strokeLinecap: "round",
      strokeLinejoin: "round"
    }, /*#__PURE__*/React.createElement("path", {
      d: "M4 12.5l5 5L20 6.5"
    }))), /*#__PURE__*/React.createElement("span", {
      style: {
        fontSize: 17,
        width: 24,
        textAlign: "center",
        flexShrink: 0,
        opacity: on ? 1 : 0.4
      }
    }, t.icon), /*#__PURE__*/React.createElement("span", {
      style: {
        fontSize: 13.5,
        fontWeight: 800,
        color: on ? "var(--ink)" : "var(--faint)",
        flex: 1
      }
    }, t.label), /*#__PURE__*/React.createElement("span", {
      style: {
        fontSize: 10.5,
        color: "var(--faint)",
        flexShrink: 0
      }
    }, t.section));
  })), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 15,
      fontWeight: 900,
      color: "var(--ink)",
      marginBottom: 4
    }
  }, "④ 下のボタンに赤い印をつける"), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 11.5,
      color: "var(--sub)",
      marginBottom: 12,
      lineHeight: 1.6
    }
  }, "下のバーのボタンに赤い丸と吹き出しを出します。「カタログにハローデイを追加しました」のように、対応したことを知らせたい時に。一度タップすると消え、指定した日数が過ぎても自動で消えます。"), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 13,
      fontWeight: 800,
      color: "var(--text)",
      marginBottom: 6
    }
  }, "どのボタンに付けるか"), /*#__PURE__*/React.createElement("select", {
    value: badgeTab,
    onChange: e => setBadgeTab(e.target.value),
    style: {
      width: "100%",
      boxSizing: "border-box",
      padding: "11px 13px",
      border: "1px solid #e2e2e6",
      borderRadius: 10,
      fontSize: 14,
      background: "#fff",
      fontFamily: "inherit",
      marginBottom: 12
    }
  }, /*#__PURE__*/React.createElement("option", {
    value: ""
  }, "（付けない）"), /*#__PURE__*/React.createElement("option", {
    value: "board"
  }, "一覧"), /*#__PURE__*/React.createElement("option", {
    value: "catalog"
  }, "カタログ"), /*#__PURE__*/React.createElement("option", {
    value: "__more"
  }, "メニュー")), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 13,
      fontWeight: 800,
      color: "var(--text)",
      marginBottom: 6
    }
  }, "吹き出しの文言"), /*#__PURE__*/React.createElement("input", {
    value: badgeText,
    onChange: e => setBadgeText(e.target.value),
    placeholder: "例：ハローデイ追加しました！",
    style: {
      width: "100%",
      boxSizing: "border-box",
      padding: "11px 13px",
      border: "1px solid #e2e2e6",
      borderRadius: 10,
      fontSize: 14,
      outline: "none",
      fontFamily: "inherit",
      marginBottom: 12
    }
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 13,
      fontWeight: 800,
      color: "var(--text)",
      marginBottom: 6
    }
  }, "表示する日数"), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      gap: 6,
      marginBottom: 14
    }
  }, [3, 5, 7].map(d => /*#__PURE__*/React.createElement("button", {
    key: d,
    onClick: () => setBadgeDays(d),
    style: {
      flex: 1,
      border: badgeDays === d ? "2px solid var(--primary-soft)" : "1px solid var(--line)",
      background: badgeDays === d ? "var(--soft)" : "#fff",
      color: badgeDays === d ? "var(--primary)" : "var(--sub)",
      borderRadius: 9,
      padding: "9px 0",
      fontSize: 13,
      fontWeight: 800,
      cursor: "pointer"
    }
  }, d, "日間"))), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 12,
      color: "var(--sub)",
      marginBottom: 6,
      fontWeight: 700
    }
  }, "プレビュー"), /*#__PURE__*/React.createElement("div", {
    style: {
      background: "var(--primary-soft)",
      borderRadius: 14,
      padding: "22px 14px 12px",
      display: "flex",
      justifyContent: "center"
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      position: "relative",
      display: "flex",
      alignItems: "center",
      gap: 7,
      background: "#fff",
      color: "var(--primary-soft)",
      borderRadius: 24,
      padding: "9px 18px"
    }
  }, /*#__PURE__*/React.createElement("svg", {
    width: "18",
    height: "18",
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: "2",
    strokeLinecap: "round",
    strokeLinejoin: "round"
  }, /*#__PURE__*/React.createElement("path", {
    d: "M3 5.5s2.5-1.5 4.5-1.5S12 5.5 12 5.5v14s-2-1.5-4.5-1.5S3 19.5 3 19.5z"
  }), /*#__PURE__*/React.createElement("path", {
    d: "M12 5.5s2.5-1.5 4.5-1.5S21 5.5 21 5.5v14s-2-1.5-4.5-1.5S12 19.5 12 19.5z"
  })), /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 13,
      fontWeight: 800
    }
  }, "カタログ"), /*#__PURE__*/React.createElement("span", {
    style: {
      position: "absolute",
      top: 2,
      right: 10,
      width: 9,
      height: 9,
      borderRadius: "50%",
      background: "#e0555f",
      boxShadow: "0 0 0 2px #fff"
    }
  }), badgeText.trim() && /*#__PURE__*/React.createElement("span", {
    style: {
      position: "absolute",
      bottom: "calc(100% + 8px)",
      left: "50%",
      transform: "translateX(-50%)",
      background: "#e0555f",
      color: "#fff",
      fontSize: 11,
      fontWeight: 800,
      borderRadius: 9,
      padding: "6px 11px",
      whiteSpace: "nowrap"
    }
  }, badgeText.trim())))), /*#__PURE__*/React.createElement("button", {
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
      try {
        const d = await api.listAll();
        if (alive) setPops(d || []);
      } catch (e) {
        if (alive) setMsg("読み込みに失敗しました");
      } finally {
        if (alive) setLoading(false);
      }
    })();
    return () => {
      alive = false;
    };
  }, []);
  const rotate = async (pop, delta) => {
    const next = (((pop.rotation || 0) + delta) % 360 + 360) % 360;
    setBusyId(pop.id);
    setMsg("");
    try {
      await api.setRotation(pop.id, next);
      setPops(list => list.map(x => x.id === pop.id ? {
        ...x,
        rotation: next
      } : x));
    } catch (e) {
      setMsg("保存に失敗しました（パスワードを確認してください）");
    } finally {
      setBusyId(null);
    }
  };
  const shown = onlyRotated ? pops.filter(p => (p.rotation || 0) !== 0) : pops;
  return /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 12,
      color: "var(--sub)",
      lineHeight: 1.6,
      marginBottom: 10
    }
  }, "横向きになってしまったポップを、90度ずつ回して直せます。見た目だけを回す方式なので、投稿日は変わらず", /*#__PURE__*/React.createElement("b", null, "並び順もそのまま"), "です。"), /*#__PURE__*/React.createElement("label", {
    style: {
      display: "flex",
      alignItems: "center",
      gap: 7,
      fontSize: 12,
      fontWeight: 800,
      color: "var(--text)",
      marginBottom: 12,
      cursor: "pointer"
    }
  }, /*#__PURE__*/React.createElement("input", {
    type: "checkbox",
    checked: onlyRotated,
    onChange: e => setOnlyRotated(e.target.checked)
  }), "回転させたものだけ表示"), msg && /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 12,
      color: "#b3261e",
      fontWeight: 800,
      marginBottom: 10
    }
  }, msg), loading ? /*#__PURE__*/React.createElement("div", {
    style: {
      textAlign: "center",
      color: "var(--faint)",
      padding: "30px 0",
      fontSize: 13
    }
  }, "読み込み中…") : shown.length === 0 ? /*#__PURE__*/React.createElement("div", {
    style: {
      textAlign: "center",
      color: "var(--faint)",
      padding: "36px 0",
      fontSize: 13
    }
  }, "該当するポップがありません") : /*#__PURE__*/React.createElement("div", {
    style: {
      display: "grid",
      gridTemplateColumns: "repeat(auto-fill, minmax(132px, 1fr))",
      gap: 10
    }
  }, shown.map(pop => {
    const rot = pop.rotation || 0;
    const side = rot === 90 || rot === 270;
    return /*#__PURE__*/React.createElement("div", {
      key: pop.id,
      style: {
        border: "1px solid var(--line)",
        borderRadius: 11,
        padding: 8,
        background: "#fff"
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        width: "100%",
        aspectRatio: "1/1",
        overflow: "hidden",
        borderRadius: 8,
        background: "var(--chip)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        marginBottom: 7
      }
    }, /*#__PURE__*/React.createElement("img", {
      src: pop.image_url,
      loading: "lazy",
      style: {
        maxWidth: side ? "100%" : "100%",
        maxHeight: "100%",
        objectFit: "contain",
        transform: rot ? `rotate(${rot}deg)` : "none",
        transition: "transform .25s ease"
      }
    })), /*#__PURE__*/React.createElement("div", {
      style: {
        fontSize: 11,
        fontWeight: 800,
        color: "var(--ink)",
        whiteSpace: "nowrap",
        overflow: "hidden",
        textOverflow: "ellipsis",
        marginBottom: 6
      }
    }, pop.product_name || "（無題）"), /*#__PURE__*/React.createElement("div", {
      style: {
        display: "flex",
        alignItems: "center",
        gap: 5
      }
    }, /*#__PURE__*/React.createElement("button", {
      onClick: () => rotate(pop, -90),
      disabled: busyId === pop.id,
      style: {
        flex: 1,
        border: "1px solid var(--line)",
        background: "#fff",
        color: "var(--text)",
        borderRadius: 7,
        padding: "6px 0",
        fontSize: 13,
        fontWeight: 900,
        cursor: "pointer"
      },
      title: "左に90度"
    }, "↺"), /*#__PURE__*/React.createElement("button", {
      onClick: () => rotate(pop, 90),
      disabled: busyId === pop.id,
      style: {
        flex: 1,
        border: "1px solid var(--line)",
        background: "#fff",
        color: "var(--text)",
        borderRadius: 7,
        padding: "6px 0",
        fontSize: 13,
        fontWeight: 900,
        cursor: "pointer"
      },
      title: "右に90度"
    }, "↻"), rot !== 0 && /*#__PURE__*/React.createElement("button", {
      onClick: () => rotate(pop, -rot),
      disabled: busyId === pop.id,
      style: {
        border: "1px solid var(--line)",
        background: "var(--soft)",
        color: "var(--primary)",
        borderRadius: 7,
        padding: "6px 8px",
        fontSize: 10,
        fontWeight: 800,
        cursor: "pointer"
      },
      title: "元に戻す"
    }, "戻す")), rot !== 0 && /*#__PURE__*/React.createElement("div", {
      style: {
        fontSize: 10,
        color: "var(--primary-soft)",
        fontWeight: 800,
        marginTop: 5,
        textAlign: "center"
      }
    }, rot, "度"));
  })));
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
  const SEASONS = ["お盆", "年末年始", "土用の丑", "お花見", "GW", "母の日", "父の日", "敬老の日", "クリスマス", "恵方巻", "通年"];
  const [form, setForm] = useState({
    store: "グッディー",
    title: "",
    note: "",
    kind: "image",
    url: "",
    visible: true,
    season: "お盆",
    year: NOW_Y,
    thumb_url: ""
  });
  const thumbRef = useRef(null);
  const fileRef = useRef(null);
  useEffect(() => {
    let alive = true;
    setLoading(true);
    (async () => {
      try {
        const d = await api.listCatalogs(false);
        if (alive) setList(d || []);
      } catch (e) {
        if (alive) setMsg("読み込みに失敗しました");
      } finally {
        if (alive) setLoading(false);
      }
    })();
    return () => {
      alive = false;
    };
  }, [ver]);
  const setF = (k, v) => setForm(o => ({
    ...o,
    [k]: v
  }));
  const pickFile = async e => {
    const f = e.target.files && e.target.files[0];
    if (!f) return;
    setBusy(true);
    setMsg("アップロード中…");
    try {
      const url = await api.uploadRaw(f);
      const isImg = /^image\//.test(f.type);
      setForm(o => ({
        ...o,
        url,
        kind: isImg ? "image" : "pdf",
        title: o.title || (f.name || "").replace(/\.[^.]+$/, "")
      }));
      setMsg("アップロードしました。内容を確認して「追加」を押してください");
    } catch (err) {
      setMsg("アップロードに失敗しました");
    } finally {
      setBusy(false);
      if (fileRef.current) fileRef.current.value = "";
    }
  };
  const pickThumb = async e => {
    const f = e.target.files && e.target.files[0];
    if (!f) return;
    setBusy(true);
    setMsg("表紙をアップロード中…");
    try {
      const url = await api.uploadRaw(f);
      setForm(o => ({
        ...o,
        thumb_url: url
      }));
      setMsg("表紙を登録しました");
    } catch (err) {
      setMsg("表紙のアップロードに失敗しました");
    } finally {
      setBusy(false);
      if (thumbRef.current) thumbRef.current.value = "";
    }
  };
  const add = async () => {
    if (!form.title.trim() || !form.url.trim()) {
      setMsg("カタログ名とファイル（またはURL）が必要です");
      return;
    }
    setBusy(true);
    setMsg("");
    try {
      await api.addCatalog({
        ...form,
        title: form.title.trim(),
        url: form.url.trim(),
        note: form.note.trim() || null,
        sort_order: list.length
      });
      setForm({
        store: form.store,
        title: "",
        note: "",
        kind: "image",
        url: "",
        visible: true,
        season: form.season,
        year: form.year,
        thumb_url: ""
      });
      setMsg("追加しました");
      setVer(v => v + 1);
    } catch (e) {
      setMsg("追加に失敗しました");
    } finally {
      setBusy(false);
    }
  };
  const toggle = async c => {
    try {
      await api.updateCatalog(c.id, {
        visible: !c.visible
      });
      setVer(v => v + 1);
    } catch (e) {
      setMsg("変更に失敗しました");
    }
  };
  const toggleDead = async c => {
    const next = c.link_status === "dead" ? "ok" : "dead";
    try {
      await api.updateCatalog(c.id, {
        link_status: next,
        checked_at: new Date().toISOString()
      });
      setVer(v => v + 1);
    } catch (e) {
      setMsg("変更に失敗しました");
    }
  };
  const del = async c => {
    if (!window.confirm(`「${c.title}」を削除しますか？`)) return;
    try {
      await api.deleteCatalog(c.id);
      setVer(v => v + 1);
    } catch (e) {
      setMsg("削除に失敗しました");
    }
  };
  const inp = {
    width: "100%",
    boxSizing: "border-box",
    padding: "9px 10px",
    border: "1px solid var(--line)",
    borderRadius: 9,
    fontSize: 13,
    outline: "none",
    background: "#fff",
    color: "var(--text)"
  };
  return /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 12,
      color: "var(--sub)",
      lineHeight: 1.6,
      marginBottom: 12
    }
  }, "各スーパーの予約カタログを登録します。写真やPDFをアップロードするか、WebカタログのURLを貼ってください。「表示」にしたものが予約カタログのページに並びます。"), /*#__PURE__*/React.createElement("div", {
    style: {
      border: "1px solid var(--line)",
      borderRadius: 12,
      padding: 13,
      marginBottom: 16,
      background: "#fff"
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 13,
      fontWeight: 900,
      color: "var(--ink)",
      marginBottom: 10
    }
  }, "カタログを追加"), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 11,
      fontWeight: 800,
      color: "var(--sub)",
      marginBottom: 5
    }
  }, "スーパー名"), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      gap: 5,
      flexWrap: "wrap",
      marginBottom: 10
    }
  }, STORES.map(st => /*#__PURE__*/React.createElement("button", {
    key: st,
    onClick: () => setF("store", st),
    style: {
      border: form.store === st ? "2px solid var(--primary-soft)" : "1px solid var(--line)",
      background: "#fff",
      color: form.store === st ? "var(--primary)" : "var(--sub)",
      borderRadius: 8,
      padding: "5px 11px",
      fontSize: 12,
      fontWeight: 800,
      cursor: "pointer"
    }
  }, st))), /*#__PURE__*/React.createElement("input", {
    value: STORES.includes(form.store) ? "" : form.store,
    onChange: e => setF("store", e.target.value),
    placeholder: "上に無ければ入力（例：マルマン）",
    style: {
      ...inp,
      marginBottom: 10,
      fontSize: 12
    }
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      gap: 6,
      marginBottom: 10
    }
  }, [["image", "写真"], ["pdf", "PDF"], ["link", "リンク"]].map(([k, l]) => /*#__PURE__*/React.createElement("button", {
    key: k,
    onClick: () => setF("kind", k),
    style: {
      flex: 1,
      border: form.kind === k ? "2px solid var(--primary-soft)" : "1px solid var(--line)",
      background: "#fff",
      color: form.kind === k ? "var(--primary)" : "var(--sub)",
      borderRadius: 8,
      padding: "7px 0",
      fontSize: 12,
      fontWeight: 800,
      cursor: "pointer"
    }
  }, l))), form.kind !== "link" && /*#__PURE__*/React.createElement("input", {
    ref: fileRef,
    type: "file",
    accept: form.kind === "image" ? "image/*" : "application/pdf,image/*",
    onChange: pickFile,
    disabled: busy,
    style: {
      fontSize: 12,
      width: "100%",
      marginBottom: 10
    }
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      gap: 7,
      marginBottom: 9
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      flex: 1
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 11,
      fontWeight: 800,
      color: "var(--sub)",
      marginBottom: 4
    }
  }, "年"), /*#__PURE__*/React.createElement("input", {
    value: form.year,
    onChange: e => setF("year", e.target.value.replace(/[^0-9]/g, "")),
    inputMode: "numeric",
    placeholder: "2026",
    style: {
      ...inp
    }
  })), /*#__PURE__*/React.createElement("div", {
    style: {
      flex: 2,
      minWidth: 0
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 11,
      fontWeight: 800,
      color: "var(--sub)",
      marginBottom: 4
    }
  }, "時期"), /*#__PURE__*/React.createElement("select", {
    value: form.season,
    onChange: e => setF("season", e.target.value),
    style: {
      ...inp,
      appearance: "auto"
    }
  }, SEASONS.map(x => /*#__PURE__*/React.createElement("option", {
    key: x,
    value: x
  }, x))))), /*#__PURE__*/React.createElement("div", {
    style: {
      marginBottom: 9
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 11,
      fontWeight: 800,
      color: "var(--sub)",
      marginBottom: 4
    }
  }, "表紙の画像（任意・ページが消えても残ります）"), /*#__PURE__*/React.createElement("input", {
    ref: thumbRef,
    type: "file",
    accept: "image/*",
    onChange: pickThumb,
    disabled: busy,
    style: {
      fontSize: 12,
      width: "100%"
    }
  }), form.thumb_url && /*#__PURE__*/React.createElement("img", {
    src: form.thumb_url,
    style: {
      width: 60,
      borderRadius: 6,
      marginTop: 6,
      display: "block"
    }
  })), /*#__PURE__*/React.createElement("input", {
    value: form.title,
    onChange: e => setF("title", e.target.value),
    placeholder: "カタログ名（例：お歳暮 2026）",
    style: {
      ...inp,
      marginBottom: 8
    }
  }), /*#__PURE__*/React.createElement("input", {
    value: form.note,
    onChange: e => setF("note", e.target.value),
    placeholder: "メモ（例：締切 12/10）",
    style: {
      ...inp,
      marginBottom: 8
    }
  }), /*#__PURE__*/React.createElement("input", {
    value: form.url,
    onChange: e => setF("url", e.target.value),
    placeholder: "URL（ファイルを選ぶと自動で入ります）",
    style: {
      ...inp,
      marginBottom: 11,
      fontSize: 11.5
    }
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      alignItems: "center",
      gap: 10
    }
  }, /*#__PURE__*/React.createElement("label", {
    style: {
      display: "flex",
      alignItems: "center",
      gap: 6,
      fontSize: 12,
      fontWeight: 800,
      color: "var(--text)",
      cursor: "pointer"
    }
  }, /*#__PURE__*/React.createElement("input", {
    type: "checkbox",
    checked: form.visible,
    onChange: e => setF("visible", e.target.checked)
  }), "みんなに表示する"), /*#__PURE__*/React.createElement("button", {
    onClick: add,
    disabled: busy,
    style: {
      marginLeft: "auto",
      border: "none",
      background: busy ? "#ccc" : "var(--primary-soft)",
      color: "#fff",
      borderRadius: 9,
      padding: "10px 20px",
      fontSize: 13,
      fontWeight: 900,
      cursor: busy ? "default" : "pointer"
    }
  }, busy ? "処理中…" : "追加")), msg && /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 11.5,
      color: "var(--sub)",
      marginTop: 9,
      lineHeight: 1.5
    }
  }, msg)), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 13,
      fontWeight: 900,
      color: "var(--ink)",
      marginBottom: 9
    }
  }, "登録済み（", list.length, "）"), loading ? /*#__PURE__*/React.createElement("div", {
    style: {
      textAlign: "center",
      color: "var(--faint)",
      padding: "26px 0",
      fontSize: 13
    }
  }, "読み込み中…") : list.length === 0 ? /*#__PURE__*/React.createElement("div", {
    style: {
      textAlign: "center",
      color: "var(--faint)",
      padding: "32px 0",
      fontSize: 13
    }
  }, "まだ登録がありません") : /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      flexDirection: "column",
      gap: 8
    }
  }, list.map(c => /*#__PURE__*/React.createElement("div", {
    key: c.id,
    style: {
      border: "1px solid var(--line)",
      borderRadius: 11,
      padding: "10px 12px",
      background: "#fff",
      opacity: c.visible ? 1 : 0.55,
      display: "flex",
      alignItems: "center",
      gap: 10
    }
  }, c.kind === "image" ? /*#__PURE__*/React.createElement("img", {
    src: c.url,
    style: {
      width: 38,
      height: 48,
      objectFit: "cover",
      borderRadius: 6,
      flexShrink: 0,
      background: "var(--chip)"
    }
  }) : /*#__PURE__*/React.createElement("div", {
    style: {
      width: 38,
      height: 48,
      borderRadius: 6,
      background: "var(--soft)",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      flexShrink: 0,
      color: "var(--primary-soft)",
      fontSize: 17
    }
  }, "📄"), /*#__PURE__*/React.createElement("div", {
    style: {
      minWidth: 0,
      flex: 1
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 10,
      fontWeight: 900,
      color: "var(--primary-soft)"
    }
  }, c.store, c.year ? `　${c.year}${c.season || ""}` : "", c.link_status === "dead" ? "　⚠リンク切れ" : ""), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 13,
      fontWeight: 900,
      color: "var(--ink)",
      whiteSpace: "nowrap",
      overflow: "hidden",
      textOverflow: "ellipsis"
    }
  }, c.title), c.note && /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 11,
      color: "var(--sub)",
      whiteSpace: "nowrap",
      overflow: "hidden",
      textOverflow: "ellipsis"
    }
  }, c.note)), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      flexDirection: "column",
      gap: 5,
      flexShrink: 0
    }
  }, /*#__PURE__*/React.createElement("button", {
    onClick: () => toggle(c),
    style: {
      border: "1px solid var(--line)",
      background: c.visible ? "var(--soft)" : "#fff",
      color: c.visible ? "var(--primary)" : "var(--sub)",
      borderRadius: 7,
      padding: "4px 10px",
      fontSize: 10.5,
      fontWeight: 800,
      cursor: "pointer"
    }
  }, c.visible ? "表示中" : "非表示"), /*#__PURE__*/React.createElement("button", {
    onClick: () => toggleDead(c),
    style: {
      border: "1px solid var(--line)",
      background: c.link_status === "dead" ? "#fdeaea" : "#fff",
      color: c.link_status === "dead" ? "#b3261e" : "var(--sub)",
      borderRadius: 7,
      padding: "4px 10px",
      fontSize: 10.5,
      fontWeight: 800,
      cursor: "pointer"
    }
  }, c.link_status === "dead" ? "切れ中" : "切れ報告"), /*#__PURE__*/React.createElement("button", {
    onClick: () => del(c),
    style: {
      border: "1px solid #f0c8c4",
      background: "#fff",
      color: "#b3261e",
      borderRadius: 7,
      padding: "4px 10px",
      fontSize: 10.5,
      fontWeight: 800,
      cursor: "pointer"
    }
  }, "削除"))))));
}

// ═══════════ ResourceAdmin：資料（PDF/画像/シート/リンク）の管理 ═══════════
function ResourceAdmin() {
  const KINDS = [{
    k: "pdf",
    label: "PDF",
    emoji: "📄"
  }, {
    k: "image",
    label: "画像",
    emoji: "🖼"
  }, {
    k: "sheet",
    label: "スプレッドシート",
    emoji: "📊"
  }, {
    k: "link",
    label: "リンク",
    emoji: "🔗"
  }];
  const [list, setList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [ver, setVer] = useState(0);
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState("");
  const [form, setForm] = useState({
    title: "",
    description: "",
    kind: "pdf",
    url: "",
    emoji: "📄",
    visible: true
  });
  const fileRef = useRef(null);
  useEffect(() => {
    let alive = true;
    setLoading(true);
    (async () => {
      try {
        const d = await api.listResources(false);
        if (alive) setList(d || []);
      } catch (e) {
        if (alive) setMsg("読み込みに失敗しました");
      } finally {
        if (alive) setLoading(false);
      }
    })();
    return () => {
      alive = false;
    };
  }, [ver]);
  const setF = (k, v) => setForm(o => ({
    ...o,
    [k]: v
  }));
  const pickFile = async e => {
    const f = e.target.files && e.target.files[0];
    if (!f) return;
    setBusy(true);
    setMsg("アップロード中…");
    try {
      const url = await api.uploadRaw(f);
      const isImg = /^image\//.test(f.type);
      setForm(o => ({
        ...o,
        url,
        kind: isImg ? "image" : "pdf",
        emoji: isImg ? "🖼" : "📄",
        title: o.title || (f.name || "").replace(/\.[^.]+$/, "")
      }));
      setMsg("アップロードしました。タイトルを確認して「追加」を押してください");
    } catch (err) {
      setMsg("アップロードに失敗しました：" + (err.message || ""));
    } finally {
      setBusy(false);
      if (fileRef.current) fileRef.current.value = "";
    }
  };
  const add = async () => {
    if (!form.title.trim() || !form.url.trim()) {
      setMsg("タイトルとURL（またはファイル）が必要です");
      return;
    }
    setBusy(true);
    setMsg("");
    try {
      await api.addResource({
        ...form,
        title: form.title.trim(),
        url: form.url.trim(),
        sort_order: list.length
      });
      setForm({
        title: "",
        description: "",
        kind: "pdf",
        url: "",
        emoji: "📄",
        visible: true
      });
      setMsg("追加しました");
      setVer(v => v + 1);
    } catch (e) {
      setMsg("追加に失敗しました：" + (e.message || ""));
    } finally {
      setBusy(false);
    }
  };
  const toggleVisible = async r => {
    try {
      await api.updateResource(r.id, {
        visible: !r.visible
      });
      setVer(v => v + 1);
    } catch (e) {
      setMsg("変更に失敗しました");
    }
  };
  const move = async (r, dir) => {
    const i = list.findIndex(x => x.id === r.id);
    const j = i + dir;
    if (j < 0 || j >= list.length) return;
    try {
      await api.updateResource(list[i].id, {
        sort_order: j
      });
      await api.updateResource(list[j].id, {
        sort_order: i
      });
      setVer(v => v + 1);
    } catch (e) {
      setMsg("並び替えに失敗しました");
    }
  };
  const del = async r => {
    if (!window.confirm(`「${r.title}」を削除しますか？`)) return;
    try {
      await api.deleteResource(r.id);
      setVer(v => v + 1);
    } catch (e) {
      setMsg("削除に失敗しました");
    }
  };
  const inp = {
    width: "100%",
    boxSizing: "border-box",
    padding: "9px 10px",
    border: "1px solid var(--line)",
    borderRadius: 9,
    fontSize: 13,
    outline: "none",
    background: "#fff",
    color: "var(--text)"
  };
  return /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 12,
      color: "var(--sub)",
      lineHeight: 1.6,
      marginBottom: 12
    }
  }, "PDF・画像はここからアップロードできます。スプレッドシートなどはURLを貼り付けてください。「表示」をオンにしたものが、一覧ページの資料カードに並びます。"), /*#__PURE__*/React.createElement("div", {
    style: {
      border: "1px solid var(--line)",
      borderRadius: 12,
      padding: 13,
      marginBottom: 16,
      background: "#fff"
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 13,
      fontWeight: 900,
      color: "var(--ink)",
      marginBottom: 10
    }
  }, "資料を追加"), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      gap: 6,
      marginBottom: 10,
      flexWrap: "wrap"
    }
  }, KINDS.map(k => /*#__PURE__*/React.createElement("button", {
    key: k.k,
    onClick: () => {
      setF("kind", k.k);
      setF("emoji", k.emoji);
    },
    style: {
      border: form.kind === k.k ? "2px solid var(--primary-soft)" : "1px solid var(--line)",
      background: "#fff",
      color: form.kind === k.k ? "var(--primary)" : "var(--sub)",
      borderRadius: 8,
      padding: "6px 11px",
      fontSize: 12,
      fontWeight: 800,
      cursor: "pointer"
    }
  }, k.emoji, " ", k.label))), (form.kind === "pdf" || form.kind === "image") && /*#__PURE__*/React.createElement("div", {
    style: {
      marginBottom: 10
    }
  }, /*#__PURE__*/React.createElement("input", {
    ref: fileRef,
    type: "file",
    accept: form.kind === "image" ? "image/*" : "application/pdf,image/*",
    onChange: pickFile,
    disabled: busy,
    style: {
      fontSize: 12,
      width: "100%"
    }
  })), /*#__PURE__*/React.createElement("input", {
    value: form.title,
    onChange: e => setF("title", e.target.value),
    placeholder: "タイトル（例：魚売場POP 10シリーズ）",
    style: {
      ...inp,
      marginBottom: 8
    }
  }), /*#__PURE__*/React.createElement("input", {
    value: form.description,
    onChange: e => setF("description", e.target.value),
    placeholder: "説明（任意）",
    style: {
      ...inp,
      marginBottom: 8
    }
  }), /*#__PURE__*/React.createElement("input", {
    value: form.url,
    onChange: e => setF("url", e.target.value),
    placeholder: "URL（ファイルを選ぶと自動で入ります）",
    style: {
      ...inp,
      marginBottom: 10,
      fontSize: 11.5
    }
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      alignItems: "center",
      gap: 10
    }
  }, /*#__PURE__*/React.createElement("label", {
    style: {
      display: "flex",
      alignItems: "center",
      gap: 6,
      fontSize: 12,
      fontWeight: 800,
      color: "var(--text)",
      cursor: "pointer"
    }
  }, /*#__PURE__*/React.createElement("input", {
    type: "checkbox",
    checked: form.visible,
    onChange: e => setF("visible", e.target.checked)
  }), "一覧に表示する"), /*#__PURE__*/React.createElement("button", {
    onClick: add,
    disabled: busy,
    style: {
      marginLeft: "auto",
      border: "none",
      background: busy ? "#ccc" : "var(--primary-soft)",
      color: "#fff",
      borderRadius: 9,
      padding: "10px 20px",
      fontSize: 13,
      fontWeight: 900,
      cursor: busy ? "default" : "pointer"
    }
  }, busy ? "処理中…" : "追加")), msg && /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 11.5,
      color: "var(--sub)",
      marginTop: 9,
      lineHeight: 1.5
    }
  }, msg)), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      marginBottom: 9
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 13,
      fontWeight: 900,
      color: "var(--ink)"
    }
  }, "登録済み（", list.length, "）"), /*#__PURE__*/React.createElement("button", {
    onClick: () => setVer(v => v + 1),
    disabled: loading,
    style: {
      border: "1px solid var(--line)",
      background: "#fff",
      color: "var(--text)",
      borderRadius: 9,
      padding: "6px 12px",
      fontSize: 12,
      fontWeight: 800,
      cursor: "pointer"
    }
  }, loading ? "更新中…" : "更新")), loading ? /*#__PURE__*/React.createElement("div", {
    style: {
      textAlign: "center",
      color: "var(--faint)",
      padding: "26px 0",
      fontSize: 13
    }
  }, "読み込み中…") : list.length === 0 ? /*#__PURE__*/React.createElement("div", {
    style: {
      textAlign: "center",
      color: "var(--faint)",
      padding: "32px 0",
      fontSize: 13
    }
  }, "まだ登録がありません") : /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      flexDirection: "column",
      gap: 8
    }
  }, list.map((r, i) => /*#__PURE__*/React.createElement("div", {
    key: r.id,
    style: {
      border: "1px solid var(--line)",
      borderRadius: 11,
      padding: "10px 12px",
      background: "#fff",
      opacity: r.visible ? 1 : 0.55
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      alignItems: "center",
      gap: 9
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 19,
      flexShrink: 0
    }
  }, r.emoji || "📄"), /*#__PURE__*/React.createElement("div", {
    style: {
      minWidth: 0,
      flex: 1
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 13,
      fontWeight: 900,
      color: "var(--ink)",
      whiteSpace: "nowrap",
      overflow: "hidden",
      textOverflow: "ellipsis"
    }
  }, r.title), r.description && /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 11,
      color: "var(--sub)",
      whiteSpace: "nowrap",
      overflow: "hidden",
      textOverflow: "ellipsis"
    }
  }, r.description)), /*#__PURE__*/React.createElement("a", {
    href: r.url,
    target: "_blank",
    rel: "noopener noreferrer",
    style: {
      fontSize: 11,
      fontWeight: 800,
      color: "var(--primary-soft)",
      textDecoration: "none",
      flexShrink: 0
    }
  }, "開く")), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      gap: 6,
      marginTop: 9,
      flexWrap: "wrap"
    }
  }, /*#__PURE__*/React.createElement("button", {
    onClick: () => toggleVisible(r),
    style: {
      border: "1px solid var(--line)",
      background: r.visible ? "var(--soft)" : "#fff",
      color: r.visible ? "var(--primary)" : "var(--sub)",
      borderRadius: 7,
      padding: "5px 11px",
      fontSize: 11,
      fontWeight: 800,
      cursor: "pointer"
    }
  }, r.visible ? "表示中" : "非表示"), /*#__PURE__*/React.createElement("button", {
    onClick: () => move(r, -1),
    disabled: i === 0,
    style: {
      border: "1px solid var(--line)",
      background: "#fff",
      color: i === 0 ? "var(--faint)" : "var(--text)",
      borderRadius: 7,
      padding: "5px 10px",
      fontSize: 11,
      fontWeight: 800,
      cursor: i === 0 ? "default" : "pointer"
    }
  }, "↑"), /*#__PURE__*/React.createElement("button", {
    onClick: () => move(r, 1),
    disabled: i === list.length - 1,
    style: {
      border: "1px solid var(--line)",
      background: "#fff",
      color: i === list.length - 1 ? "var(--faint)" : "var(--text)",
      borderRadius: 7,
      padding: "5px 10px",
      fontSize: 11,
      fontWeight: 800,
      cursor: i === list.length - 1 ? "default" : "pointer"
    }
  }, "↓"), /*#__PURE__*/React.createElement("button", {
    onClick: () => del(r),
    style: {
      marginLeft: "auto",
      border: "1px solid #f0c8c4",
      background: "#fff",
      color: "#b3261e",
      borderRadius: 7,
      padding: "5px 11px",
      fontSize: 11,
      fontWeight: 800,
      cursor: "pointer"
    }
  }, "削除"))))));
}

// ═══════════ DeviceStatsPanel：管理画面内の端末アクセス集計 ═══════════
// 一般メニューには出さない。個人は特定せず、機種・ブラウザの傾向だけを見る。
function DeviceStatsPanel() {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [ver, setVer] = useState(0);
  useEffect(() => {
    let alive = true;
    setLoading(true);
    (async () => {
      try {
        const d = await api.listDeviceVisits(500);
        if (alive) setRows(d);
      } catch (e) {} finally {
        if (alive) setLoading(false);
      }
    })();
    return () => {
      alive = false;
    };
  }, [ver]);
  const count = (arr, key) => {
    const m = {};
    arr.forEach(r => {
      m[r[key]] = (m[r[key]] || 0) + 1;
    });
    return Object.entries(m).sort((a, b) => b[1] - a[1]);
  };
  const platforms = count(rows, "platform");
  const browsers = count(rows, "browser");
  const total = rows.length;
  const Bar = ({
    label,
    n
  }) => /*#__PURE__*/React.createElement("div", {
    style: {
      marginBottom: 9
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      justifyContent: "space-between",
      fontSize: 12.5,
      fontWeight: 800,
      color: "var(--ink)",
      marginBottom: 4
    }
  }, /*#__PURE__*/React.createElement("span", null, label), /*#__PURE__*/React.createElement("span", null, n, "件（", total ? Math.round(n / total * 100) : 0, "%）")), /*#__PURE__*/React.createElement("div", {
    style: {
      height: 8,
      background: "var(--chip)",
      borderRadius: 5,
      overflow: "hidden"
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      height: "100%",
      width: total ? `${n / total * 100}%` : "0%",
      background: "var(--primary)",
      borderRadius: 5
    }
  })));
  return /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      marginBottom: 12
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 12,
      color: "var(--sub)",
      lineHeight: 1.6
    }
  }, "直近", total, "件のアクセスの内訳です（同じ端末は1日1回まで集計）。", /*#__PURE__*/React.createElement("br", null), "個人は特定していません。"), /*#__PURE__*/React.createElement("button", {
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
  }, loading ? "更新中…" : "更新")), loading ? /*#__PURE__*/React.createElement("div", {
    style: {
      textAlign: "center",
      color: "var(--faint)",
      padding: "30px 0",
      fontSize: 13
    }
  }, "読み込み中…") : total === 0 ? /*#__PURE__*/React.createElement("div", {
    style: {
      textAlign: "center",
      color: "var(--faint)",
      padding: "40px 0",
      fontSize: 13,
      lineHeight: 1.8
    }
  }, "まだ記録がありません。") : /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 13,
      fontWeight: 900,
      color: "var(--ink)",
      marginBottom: 10
    }
  }, "機種"), platforms.map(([k, n]) => /*#__PURE__*/React.createElement(Bar, {
    key: k,
    label: k,
    n: n
  })), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 13,
      fontWeight: 900,
      color: "var(--ink)",
      margin: "18px 0 10px"
    }
  }, "ブラウザ"), browsers.map(([k, n]) => /*#__PURE__*/React.createElement(Bar, {
    key: k,
    label: k,
    n: n
  }))));
}
function RankingPanel({
  onCreateFromPop
}) {
  const [pops, setPops] = useState([]);
  const [loading, setLoading] = useState(true);
  const [metric, setMetric] = useState("recent");
  const [sel, setSel] = useState(null);
  const [ver, setVer] = useState(0);
  const [recent, setRecent] = useState({}); // pop_id -> 回数
  const [days, setDays] = useState(7);
  useEffect(() => {
    let alive = true;
    setLoading(true);
    (async () => {
      try {
        const d = await api.listActive();
        if (alive) setPops(d);
      } catch (e) {}
      try {
        const v = await api.listRecentViews(days);
        if (alive) {
          const m = {};
          (v || []).forEach(x => {
            m[x.pop_id] = (m[x.pop_id] || 0) + 1;
          });
          setRecent(m);
        }
      } catch (e) {
        if (alive) setRecent({});
      } finally {
        if (alive) setLoading(false);
      }
    })();
    return () => {
      alive = false;
    };
  }, [ver, days]);
  const METRICS = [{
    key: "recent",
    label: "最近",
    get: p => recent[p.id] || 0,
    unit: "回"
  }, {
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
  }, "ポップの閲覧・使った回数・いいねの記録です。", /*#__PURE__*/React.createElement("br", null), "「最近」は直近", days, "日でよく見られたポップです。"), /*#__PURE__*/React.createElement("button", {
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
  }, loading ? "更新中…" : "更新")), metric === "recent" && /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      gap: 6,
      marginBottom: 10
    }
  }, [3, 7, 30].map(d => /*#__PURE__*/React.createElement("button", {
    key: d,
    onClick: () => setDays(d),
    style: {
      border: days === d ? "2px solid var(--primary-soft)" : "1px solid var(--line)",
      background: days === d ? "var(--soft)" : "#fff",
      color: days === d ? "var(--primary)" : "var(--sub)",
      borderRadius: 999,
      padding: "5px 14px",
      fontSize: 12,
      fontWeight: 800,
      cursor: "pointer"
    }
  }, d === 30 ? "1か月" : d + "日間"))), /*#__PURE__*/React.createElement("div", {
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
  CatalogAdmin,
  RotateAdmin,
  ResourceAdmin,
  DeviceStatsPanel,
  RankingPanel,
  AdminTab,
  ArchiveTab,
  NoticeAdmin,
  RequestTab
});