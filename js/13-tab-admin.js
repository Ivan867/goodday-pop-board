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
  const [section, setSection] = useState("home"); // home（タイル一覧）| 各画面

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
  const [delAsk, setDelAsk] = useState(false); // 一括削除の確認中か
  const [delWord, setDelWord] = useState(""); // 確認の入力
  const [delBusy, setDelBusy] = useState(false);
  const [delPops, setDelPops] = useState([]); // 消された投稿
  const [trashSel, setTrashSel] = useState({}); // ゴミ箱での選択
  const [trashOpen, setTrashOpen] = useState(null); // ゴミ箱で開いているポップ
  const [trashBusy, setTrashBusy] = useState(false);
  const [opLogs, setOpLogs] = useState([]);
  const [bkBusy, setBkBusy] = useState(false);
  const [bkMsg, setBkMsg] = useState("");
  const [bkDone, setBkDone] = useState("");
  // アイデア（管理画面から投稿）
  const [ideas, setIdeas] = useState([]);
  const [idFiles, setIdFiles] = useState([]); // { file, preview }
  const [idTitle, setIdTitle] = useState("");
  const [idMemo, setIdMemo] = useState("");
  const [idTags, setIdTags] = useState("");
  const [idBusy, setIdBusy] = useState(false);
  const [idMsg, setIdMsg] = useState("");
  const [idDel, setIdDel] = useState(null);
  const [grpAsk, setGrpAsk] = useState(false); // まとめる確認中か
  const [grpName, setGrpName] = useState("");
  const [grpBusy, setGrpBusy] = useState(false);
  const [grpCover, setGrpCover] = useState(null); // 表紙にするポップ

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
  const loadTrash = useCallback(async () => {
    try {
      setDelPops((await api.listDeleted()) || []);
    } catch (e) {
      setDelPops([]);
    }
  }, []);
  const loadIdeas = useCallback(async () => {
    try {
      setIdeas((await api.listIdeas()) || []);
    } catch (e) {
      setIdeas([]);
    }
  }, []);
  const loadOpLogs = useCallback(async () => {
    try {
      setOpLogs((await api.listOpLogs(200)) || []);
    } catch (e) {
      setOpLogs([]);
    }
  }, []);
  useEffect(() => {
    if (unlocked) {
      load();
      loadReqs();
      loadTrash();
      loadOpLogs();
      loadIdeas();
    }
  }, [unlocked, load, loadReqs, loadTrash, loadOpLogs, loadIdeas]);
  const tryUnlock = async () => {
    if (gChecking) return;
    setGChecking(true);
    setGErr("");
    try {
      const r = await api.verifyPasswordEx("admin", gpw);
      if (r.ok) {
        setUnlocked(true);
        setGErr("");
      } else {
        setGErr(r.locked ? `間違いが続いたので、${api.lockText(r.seconds)}ほど待ってください` : r.left > 0 ? `パスワードが違います（あと${r.left}回）` : "パスワードが違います");
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
    }, "\u7BA1\u7406\u753B\u9762"), /*#__PURE__*/React.createElement("div", {
      style: {
        fontSize: 13,
        color: "var(--sub)",
        marginBottom: 18
      }
    }, "\u30D1\u30B9\u30EF\u30FC\u30C9\u3092\u5165\u529B\u3057\u3066\u304F\u3060\u3055\u3044"), /*#__PURE__*/React.createElement("input", {
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
      placeholder: "\u30D1\u30B9\u30EF\u30FC\u30C9",
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
  const doGroup = async (name, cover) => {
    setGrpBusy(true);
    try {
      await api.groupPops(selIds, name, cover);
      const n = selIds.length;
      setSel({});
      setGrpAsk(false);
      setGrpName("");
      await load();
      try {
        window.dispatchEvent(new CustomEvent("appToast", {
          detail: name ? `${n}件をまとめました` : `${n}件のまとまりを解除しました`
        }));
      } catch (e) {}
    } catch (e) {
      alert("まとめられませんでした：" + (e && e.message ? e.message : ""));
    } finally {
      setGrpBusy(false);
    }
  };
  const doDelete = async () => {
    if (delWord.trim() !== "削除") return;
    setDelBusy(true);
    try {
      await api.delMany(selIds);
      const n = selIds.length;
      setSel({});
      setDelAsk(false);
      setDelWord("");
      await load();
      try {
        window.dispatchEvent(new CustomEvent("appToast", {
          detail: `${n}件を消しました`
        }));
      } catch (e) {}
    } catch (e) {
      alert("削除できませんでした：" + (e && e.message ? e.message : ""));
    } finally {
      setDelBusy(false);
    }
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
  }, label, "\uFF08", n, "\uFF09");

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
  const pinnedCount = pops.filter(p => p.is_pinned).length;
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
        fontSize: 11.5,
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
  }, "\u7BA1\u7406\u753B\u9762"), section === "home" ? /*#__PURE__*/React.createElement("div", {
    style: {
      display: "grid",
      gridTemplateColumns: "repeat(auto-fill, minmax(104px, 1fr))",
      gap: 10
    }
  }, [["req", "依頼", openReqs || 0, "#c2691a", /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("path", {
    d: "M4 5.5h16v13H4z"
  }), /*#__PURE__*/React.createElement("path", {
    d: "M4 7l8 6 8-6"
  }))], ["genre", "ジャンル", genreCount("未分類") || 0, "#6b4ea0", /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("path", {
    d: "M20.6 13.4L12 4.8H4v8l8.6 8.6a2 2 0 002.8 0l5.2-5.2a2 2 0 000-2.8z"
  }), /*#__PURE__*/React.createElement("circle", {
    cx: "7.5",
    cy: "7.5",
    r: "1.3"
  }))], ["archive", "アーカイブ", arCount, "#2f6fb0", /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("rect", {
    x: "3",
    y: "4",
    width: "18",
    height: "5",
    rx: "1.5"
  }), /*#__PURE__*/React.createElement("path", {
    d: "M5 9v9.5A1.5 1.5 0 006.5 20h11a1.5 1.5 0 001.5-1.5V9M10 13h4"
  }))], ["trash", "ゴミ箱", delPops.length || 0, "#b3261e", /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("path", {
    d: "M4 7h16M9.5 7V5h5v2M6.5 7l1 13h9l1-13"
  }))], ["oplog", "操作の記録", opLogs.length || 0, "#3f8f9e", /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("circle", {
    cx: "12",
    cy: "12",
    r: "8.5"
  }), /*#__PURE__*/React.createElement("path", {
    d: "M12 7.5V12l3 2"
  }))], ["idea", "アイデア", ideas.length || 0, "#c39a3c", /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("path", {
    d: "M9 18h6M10 21h4"
  }), /*#__PURE__*/React.createElement("path", {
    d: "M12 3a6 6 0 00-3.6 10.8c.7.5 1.1 1.3 1.1 2.2h5c0-.9.4-1.7 1.1-2.2A6 6 0 0012 3z"
  }))], ["backup", "控えを取る", null, "#3f9e63", /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("path", {
    d: "M12 3v11M8 10.5l4 4 4-4"
  }), /*#__PURE__*/React.createElement("path", {
    d: "M4 16.5v2.5a1.5 1.5 0 001.5 1.5h13a1.5 1.5 0 001.5-1.5v-2.5"
  }))], ["notice", "お知らせ", null, "#c39a3c", /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("path", {
    d: "M4 9.5h4l7-4.5v14l-7-4.5H4z"
  }), /*#__PURE__*/React.createElement("path", {
    d: "M18 9a4 4 0 010 6"
  }))], ["pinned", "ピン留め", pinnedCount, "#d1554f", /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("path", {
    d: "M12 17v4M8 3h8l-1 6 3 3v2H6v-2l3-3z"
  }))], ["memo", "制作メモ", null, "#9e7b3f", /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("path", {
    d: "M12 20h9"
  }), /*#__PURE__*/React.createElement("path", {
    d: "M16.5 3.5a2.1 2.1 0 013 3L7 19l-4 1 1-4z"
  }))], ["ranking", "記録", null, "#2aa3a3", /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("path", {
    d: "M4 20V10M10 20V4M16 20v-7M22 20H2"
  }))], ["device", "端末", null, "#8a9099", /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("rect", {
    x: "6",
    y: "3",
    width: "12",
    height: "18",
    rx: "2.5"
  }), /*#__PURE__*/React.createElement("path", {
    d: "M11 18h2"
  }))], ["res", "資料", null, "#1d9e75", /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("path", {
    d: "M5 4.5h9l5 5v10H5z"
  }), /*#__PURE__*/React.createElement("path", {
    d: "M14 4.5v5h5"
  }))], ["cat", "カタログ", null, "#378add", /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("path", {
    d: "M4 5.5h7v14H4zM13 5.5h7v14h-7z"
  }))], ["dev", "更新履歴", null, "#639922", /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("circle", {
    cx: "12",
    cy: "12",
    r: "8.5"
  }), /*#__PURE__*/React.createElement("path", {
    d: "M8 12h8M12 8v8"
  }))], ["rot", "向き", null, "#b08968", /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("path", {
    d: "M20 12a8 8 0 11-2.3-5.6"
  }), /*#__PURE__*/React.createElement("path", {
    d: "M20 4v5h-5"
  }))]].map(([k, label, n, col, icon]) => /*#__PURE__*/React.createElement("button", {
    key: k,
    onClick: () => setSection(k),
    style: {
      position: "relative",
      background: "#fff",
      border: "1px solid var(--line)",
      borderRadius: 14,
      padding: "18px 8px 13px",
      cursor: "pointer",
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      gap: 9,
      minHeight: 104,
      boxShadow: "0 1px 3px rgba(20,40,70,0.06)"
    }
  }, /*#__PURE__*/React.createElement("svg", {
    width: "30",
    height: "30",
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: col,
    strokeWidth: "1.7",
    strokeLinecap: "round",
    strokeLinejoin: "round"
  }, icon), /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 12.5,
      fontWeight: 800,
      color: "var(--text)",
      lineHeight: 1.3,
      textAlign: "center"
    }
  }, label), n != null && n > 0 && /*#__PURE__*/React.createElement("span", {
    style: {
      position: "absolute",
      top: 8,
      right: 9,
      background: col,
      color: "#fff",
      fontSize: 11.5,
      fontWeight: 900,
      minWidth: 21,
      height: 21,
      borderRadius: 11,
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      padding: "0 5px"
    }
  }, n)))) : /*#__PURE__*/React.createElement("button", {
    onClick: () => setSection("home"),
    style: {
      display: "flex",
      alignItems: "center",
      gap: 5,
      border: "1px solid var(--line)",
      background: "#fff",
      color: "var(--sub)",
      borderRadius: 10,
      padding: "8px 14px 8px 10px",
      fontSize: 13.5,
      fontWeight: 800,
      cursor: "pointer",
      marginBottom: 16
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
  })), "\u30E1\u30CB\u30E5\u30FC\u3078"), section === "notice" && /*#__PURE__*/React.createElement(NoticeAdmin, {
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
  }, "\u8AAD\u307F\u8FBC\u307F\u4E2D\u2026")), section === "rot" && /*#__PURE__*/React.createElement(DimsBackfill, null), section === "rot" && /*#__PURE__*/React.createElement(RotateAdmin, null), section === "req" && (reqLoading ? /*#__PURE__*/React.createElement("div", {
    style: {
      textAlign: "center",
      color: "var(--sub)",
      padding: "40px 0",
      fontSize: 14
    }
  }, "\u8AAD\u307F\u8FBC\u307F\u4E2D\u2026") : reqs.length === 0 ? /*#__PURE__*/React.createElement("div", {
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
  }, "\u4F9D\u983C\u306F\u307E\u3060\u3042\u308A\u307E\u305B\u3093"), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 13,
      marginTop: 6,
      color: "var(--faint)"
    }
  }, "\u300C\u30DD\u30C3\u30D7\u4F9D\u983C\u300D\u304B\u3089\u307F\u3093\u306A\u304C\u6295\u7A3F\u3067\u304D\u307E\u3059")) : /*#__PURE__*/React.createElement("div", {
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
        fontSize: 11.5,
        fontWeight: 900,
        padding: "2px 7px",
        borderRadius: 7
      }
    }, "\u6025\u304E"), done && /*#__PURE__*/React.createElement("span", {
      style: {
        display: "flex",
        alignItems: "center",
        gap: 3,
        background: "#3f9e63",
        color: "#fff",
        fontSize: 11.5,
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
    })), "\u5BFE\u5FDC\u6E08\u307F"), r.kind && r.kind !== "POP作成依頼" && /*#__PURE__*/React.createElement("span", {
      style: {
        fontSize: 11.5,
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
        fontSize: 12,
        color: "var(--faint)",
        whiteSpace: "nowrap"
      }
    }, fmtDate(r.created_at), " \u53D7\u4ED8")), /*#__PURE__*/React.createElement("div", {
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
    }, r.reason), Array.isArray(r.files) && r.files.length > 0 && /*#__PURE__*/React.createElement("div", {
      style: {
        display: "flex",
        gap: 6,
        flexWrap: "wrap",
        marginBottom: 10
      }
    }, r.files.map((f, i) => /*#__PURE__*/React.createElement("a", {
      key: i,
      href: f.url,
      target: "_blank",
      rel: "noopener noreferrer",
      download: f.name,
      style: {
        display: "flex",
        alignItems: "center",
        gap: 7,
        textDecoration: "none",
        border: "1px solid var(--line)",
        borderRadius: 8,
        padding: "5px 9px 5px 5px",
        background: "#fff"
      }
    }, (f.type || "").startsWith("image/") ? /*#__PURE__*/React.createElement("img", {
      src: f.url,
      alt: "",
      style: {
        width: 30,
        height: 30,
        objectFit: "cover",
        borderRadius: 5,
        background: "var(--bg)"
      }
    }) : /*#__PURE__*/React.createElement("span", {
      style: {
        width: 30,
        height: 30,
        borderRadius: 5,
        background: "var(--bg)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontSize: 11.5,
        fontWeight: 900,
        color: "var(--sub)"
      }
    }, (String(f.name).split(".").pop() || "").slice(0, 4).toUpperCase()), /*#__PURE__*/React.createElement("span", {
      style: {
        fontSize: 12,
        fontWeight: 700,
        color: "var(--primary)",
        maxWidth: 130,
        overflow: "hidden",
        textOverflow: "ellipsis",
        whiteSpace: "nowrap"
      }
    }, f.name)))), done && r.reply && /*#__PURE__*/React.createElement("div", {
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
    }, "\u8FD4\u7B54\uFF1A"), r.reply, r.replied_at && /*#__PURE__*/React.createElement("span", {
      style: {
        marginLeft: 8,
        fontSize: 11.5,
        color: "#6a9a7c"
      }
    }, "\uFF08", fmtDate(r.replied_at), "\uFF09")), /*#__PURE__*/React.createElement("input", {
      value: replyDraft[r.id] ?? r.reply ?? "",
      onChange: e => setReplyDraft(v => ({
        ...v,
        [r.id]: e.target.value
      })),
      placeholder: "\u8FD4\u7B54\u30E1\u30E2\uFF08\u4F8B\uFF1A\u6765\u9031\u4F5C\u308A\u307E\u3059\uFF0F\u3059\u3067\u306B\u6295\u7A3F\u6E08\u307F\u3067\u3059\uFF09",
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
    }, "\u524A\u9664")));
  }))), section === "genre" && /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 13,
      color: "var(--sub)",
      marginBottom: 14,
      lineHeight: 1.6
    }
  }, "\u691C\u7D22\u753B\u9762\u306E\u5DE6\u30BF\u30D6\u3067\u4F7F\u3046\u30B8\u30E3\u30F3\u30EB\u3092\u3001\u3053\u3053\u3067\u632F\u308A\u5206\u3051\u307E\u3059\u3002\u30DC\u30BF\u30F3\u3092\u30BF\u30C3\u30D7\u3067\u8A2D\u5B9A\uFF08\u540C\u3058\u3082\u306E\u3092\u3082\u3046\u4E00\u5EA6\u30BF\u30C3\u30D7\u3067\u672A\u5206\u985E\u306B\u623B\u3059\uFF09\u3002\u516C\u958B\u4E2D\u306EPOP\u306E\u307F\u8868\u793A\u3002\u300C\u9664\u5916\u300D\u3092\u9078\u3076\u3068\u3001\u305D\u306EPOP\u306F\u691C\u7D22\u7D50\u679C\u306B\u51FA\u306A\u304F\u306A\u308A\u307E\u3059\uFF08\u4E00\u89A7\u306B\u306F\u6B8B\u308A\u3001\u5DE6\u30BF\u30D6\u306B\u3082\u51FA\u307E\u305B\u3093\uFF09\u3002"), /*#__PURE__*/React.createElement("div", {
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
    }, g, "\uFF08", genreCount(g), "\uFF09");
  })), loading ? /*#__PURE__*/React.createElement("div", {
    style: {
      textAlign: "center",
      color: "var(--sub)",
      padding: "40px 0",
      fontSize: 14
    }
  }, "\u8AAD\u307F\u8FBC\u307F\u4E2D\u2026") : genreList.length === 0 ? /*#__PURE__*/React.createElement("div", {
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
  }))))))), section === "idea" && (() => {
    const pick = list => {
      const fs2 = Array.from(list || []).filter(f => /^image\//.test(f.type || ""));
      setIdFiles(v => v.concat(fs2.map(f => ({
        file: f,
        preview: URL.createObjectURL(f)
      }))));
      setIdMsg("");
    };
    const submit = async () => {
      if (!idFiles.length) {
        setIdMsg("画像を選んでください");
        return;
      }
      if (!idTitle.trim()) {
        setIdMsg("名前を入れてください");
        return;
      }
      setIdBusy(true);
      setIdMsg("");
      try {
        const urls = [];
        for (let i = 0; i < idFiles.length; i++) {
          setIdMsg(`画像を上げています… ${i + 1}/${idFiles.length}`);
          urls.push(await api.upload(idFiles[i].file));
        }
        const tags = idTags.split(/[、,\s]+/).map(x => x.trim()).filter(Boolean);
        await api.addIdea(idTitle.trim(), idMemo.trim(), urls, tags);
        setIdFiles([]);
        setIdTitle("");
        setIdMemo("");
        setIdTags("");
        setIdMsg("のせました");
        loadIdeas();
        loadOpLogs();
      } catch (e) {
        setIdMsg("のせられませんでした");
      } finally {
        setIdBusy(false);
      }
    };
    const inp = {
      width: "100%",
      boxSizing: "border-box",
      border: "1px solid var(--line)",
      borderRadius: 10,
      padding: "11px 12px",
      fontSize: 15,
      outline: "none",
      fontFamily: "inherit",
      background: "var(--card, #fff)",
      color: "var(--ink)"
    };
    const lbl = {
      fontSize: 12,
      fontWeight: 800,
      color: "var(--sub)",
      margin: "12px 0 6px"
    };
    return /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
      style: {
        fontSize: 12.5,
        color: "var(--sub)",
        lineHeight: 1.8,
        marginBottom: 6
      }
    }, "\u307B\u304B\u306E\u58F2\u5834\u3092\u624B\u304C\u304B\u308A\u306BAI\u3067\u8D77\u3053\u3057\u305F\u30DD\u30C3\u30D7\u30FB\u30D0\u30CA\u30FC\u306A\u3069\u3092\u306E\u305B\u308B\u5834\u6240\u3067\u3059\u3002", /*#__PURE__*/React.createElement("br", null), "\u3053\u3053\u306B\u306E\u305B\u305F\u3082\u306E\u306F\u4E00\u89A7\u306B\u306F\u51FA\u305A\u3001\u4E00\u89A7\u306E\u96FB\u7403\u30DE\u30FC\u30AF\u304B\u3089\u898B\u3089\u308C\u307E\u3059\u3002"), /*#__PURE__*/React.createElement("label", {
      style: {
        display: "block",
        border: "1.5px dashed var(--line)",
        borderRadius: 12,
        padding: "18px 12px",
        textAlign: "center",
        cursor: "pointer",
        background: "var(--card, #fff)",
        color: "var(--primary-soft)",
        fontSize: 14,
        fontWeight: 800,
        marginTop: 10
      }
    }, "\uFF0B \u753B\u50CF\u3092\u9078\u3076\uFF08\u4F55\u679A\u3067\u3082\uFF09", /*#__PURE__*/React.createElement("input", {
      type: "file",
      accept: "image/*",
      multiple: true,
      onChange: e => {
        const l = Array.from(e.target.files || []);
        e.target.value = "";
        pick(l);
      },
      style: {
        position: "absolute",
        opacity: 0,
        width: 1,
        height: 1,
        pointerEvents: "none"
      }
    })), idFiles.length > 0 && /*#__PURE__*/React.createElement("div", {
      style: {
        display: "flex",
        gap: 7,
        overflowX: "auto",
        padding: "10px 0 2px"
      }
    }, idFiles.map((f, i) => /*#__PURE__*/React.createElement("div", {
      key: i,
      style: {
        position: "relative",
        flexShrink: 0
      }
    }, /*#__PURE__*/React.createElement("img", {
      src: f.preview,
      alt: "",
      style: {
        width: 70,
        height: 90,
        objectFit: "cover",
        borderRadius: 6,
        border: "1px solid var(--line)",
        display: "block"
      }
    }), /*#__PURE__*/React.createElement("button", {
      onClick: () => setIdFiles(v => v.filter((_, k) => k !== i)),
      "aria-label": "\u5916\u3059",
      style: {
        position: "absolute",
        top: -6,
        right: -6,
        width: 22,
        height: 22,
        borderRadius: 11,
        border: "none",
        background: "#b3261e",
        color: "#fff",
        fontSize: 13,
        fontWeight: 900,
        cursor: "pointer",
        lineHeight: 1
      }
    }, "\xD7")))), /*#__PURE__*/React.createElement("div", {
      style: lbl
    }, "\u540D\u524D\uFF08\u5FC5\u9808\uFF09"), /*#__PURE__*/React.createElement("input", {
      value: idTitle,
      onChange: e => setIdTitle(e.target.value),
      placeholder: "\u4F8B\uFF1A\u3055\u3093\u307E\u306E\u70AD\u706B\u713C\u304D \u5B9F\u6F14\u30D0\u30CA\u30FC",
      style: inp
    }), /*#__PURE__*/React.createElement("div", {
      style: lbl
    }, "\u30E1\u30E2\uFF08\u5143\u306B\u3057\u305F\u58F2\u5834\u30FB\u306D\u3089\u3044\u306A\u3069\uFF09"), /*#__PURE__*/React.createElement("textarea", {
      value: idMemo,
      onChange: e => setIdMemo(e.target.value),
      rows: 3,
      placeholder: "\u4F8B\uFF1A\u25CB\u25CB\u30B9\u30FC\u30D1\u30FC\u306E\u79CB\u306E\u58F2\u5834\u3092\u53C2\u8003\u306B",
      style: {
        ...inp,
        resize: "vertical",
        lineHeight: 1.6
      }
    }), /*#__PURE__*/React.createElement("div", {
      style: lbl
    }, "\u30BF\u30B0\uFF08\u8AAD\u70B9\u3067\u533A\u5207\u308B\uFF09"), /*#__PURE__*/React.createElement("input", {
      value: idTags,
      onChange: e => setIdTags(e.target.value),
      placeholder: "\u4F8B\uFF1A\u3055\u3093\u307E\u3001\u30D0\u30CA\u30FC\u3001\u79CB",
      style: inp
    }), /*#__PURE__*/React.createElement("button", {
      onClick: submit,
      disabled: idBusy,
      style: {
        width: "100%",
        border: "none",
        background: idBusy ? "#ccc" : "var(--primary)",
        color: "#fff",
        borderRadius: 12,
        padding: "14px",
        fontSize: 15,
        fontWeight: 900,
        cursor: "pointer",
        marginTop: 16
      }
    }, idBusy ? "のせています…" : "アイデアにのせる"), idMsg && /*#__PURE__*/React.createElement("div", {
      style: {
        marginTop: 10,
        fontSize: 13,
        fontWeight: 800,
        textAlign: "center",
        color: idMsg === "のせました" ? "#2c6b45" : idMsg.includes("…") ? "var(--sub)" : "#b3261e"
      }
    }, idMsg), /*#__PURE__*/React.createElement("div", {
      style: {
        fontSize: 12.5,
        fontWeight: 800,
        color: "var(--sub)",
        margin: "24px 0 8px"
      }
    }, "\u306E\u305B\u305F\u3082\u306E\uFF08", ideas.length, "\uFF09"), /*#__PURE__*/React.createElement("div", {
      style: {
        display: "flex",
        flexDirection: "column",
        gap: 7
      }
    }, ideas.map(it => /*#__PURE__*/React.createElement("div", {
      key: it.id,
      style: {
        display: "flex",
        alignItems: "center",
        gap: 10,
        background: "var(--card, #fff)",
        border: "1px solid var(--line)",
        borderRadius: 10,
        padding: "8px 10px"
      }
    }, /*#__PURE__*/React.createElement("img", {
      src: (it.images || [])[0],
      alt: "",
      style: {
        width: 44,
        height: 56,
        objectFit: "cover",
        borderRadius: 4,
        flexShrink: 0,
        background: "var(--bg)"
      }
    }), /*#__PURE__*/React.createElement("span", {
      style: {
        flex: 1,
        minWidth: 0
      }
    }, /*#__PURE__*/React.createElement("span", {
      style: {
        display: "block",
        fontSize: 13.5,
        fontWeight: 800,
        color: "var(--ink)",
        overflow: "hidden",
        textOverflow: "ellipsis",
        whiteSpace: "nowrap"
      }
    }, it.title), /*#__PURE__*/React.createElement("span", {
      style: {
        display: "block",
        fontSize: 11.5,
        color: "var(--faint)"
      }
    }, fmtDate(it.created_at), " \uFF0F ", (it.images || []).length, "\u679A")), idDel === it.id ? /*#__PURE__*/React.createElement("button", {
      onClick: async () => {
        try {
          await api.deleteIdea(it.id);
          setIdDel(null);
          loadIdeas();
          loadOpLogs();
        } catch (e) {
          alert("消せませんでした");
        }
      },
      style: {
        border: "none",
        background: "#b3261e",
        color: "#fff",
        borderRadius: 8,
        padding: "7px 11px",
        fontSize: 12.5,
        fontWeight: 900,
        cursor: "pointer"
      }
    }, "\u672C\u5F53\u306B\u6D88\u3059") : /*#__PURE__*/React.createElement("button", {
      onClick: () => setIdDel(it.id),
      style: {
        border: "1px solid var(--line)",
        background: "transparent",
        color: "var(--sub)",
        borderRadius: 8,
        padding: "7px 11px",
        fontSize: 12.5,
        fontWeight: 800,
        cursor: "pointer"
      }
    }, "\u6D88\u3059")))));
  })(), section === "backup" && (() => {
    const run = async () => {
      setBkBusy(true);
      setBkDone("");
      setBkMsg("はじめます…");
      try {
        const data = await api.makeBackup((i, n, t) => setBkMsg(`${i} / ${n} … ${t}`));
        const json = JSON.stringify(data, null, 1);
        const blob = new Blob([json], {
          type: "application/json"
        });
        const d = new Date();
        const nm = `GoodDay控え_${d.getFullYear()}${String(d.getMonth() + 1).padStart(2, "0")}${String(d.getDate()).padStart(2, "0")}.json`;
        const a = document.createElement("a");
        a.href = URL.createObjectURL(blob);
        a.download = nm;
        a.click();
        setTimeout(() => URL.revokeObjectURL(a.href), 4000);
        const total = Object.values(data.中身).reduce((s2, v) => s2 + (Array.isArray(v) ? v.length : 0), 0);
        setBkMsg("");
        setBkDone(`${total}件を書き出しました（${Math.round(json.length / 1024)}KB）`);
      } catch (e) {
        setBkMsg("");
        setBkDone("うまくいきませんでした：" + (e && e.message || ""));
      } finally {
        setBkBusy(false);
      }
    };
    return /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
      style: {
        fontSize: 13,
        color: "var(--text)",
        lineHeight: 1.9,
        marginBottom: 16
      }
    }, "\u3044\u307E\u306E\u4E2D\u8EAB\u3092\u307E\u3068\u3081\u30661\u3064\u306E\u30D5\u30A1\u30A4\u30EB\u306B\u66F8\u304D\u51FA\u3057\u307E\u3059\u3002", /*#__PURE__*/React.createElement("br", null), "\u30DD\u30C3\u30D7\u306E\u540D\u524D\u30FB\u30AB\u30BF\u30ED\u30B0\u30FB\u767A\u6CE8\u306E\u54C1\u76EE\u30FB\u884C\u4E8B\u306A\u3069\u3001\u6587\u5B57\u306E\u60C5\u5831\u304C\u5165\u308A\u307E\u3059\u3002"), /*#__PURE__*/React.createElement("div", {
      style: {
        background: "#fff6de",
        border: "1px solid #eeddad",
        color: "#8a6d00",
        borderRadius: 10,
        padding: "11px 13px",
        fontSize: 12,
        lineHeight: 1.8,
        marginBottom: 18
      }
    }, "\u5199\u771F\u305D\u306E\u3082\u306E\u306F\u5165\u308A\u307E\u305B\u3093\u3002\u5199\u771F\u306F\u30B5\u30FC\u30D0\u30FC\u306B\u7F6E\u3044\u305F\u307E\u307E\u3067\u3059\u3002", /*#__PURE__*/React.createElement("br", null), "\u6708\u306B\u4E00\u5EA6\u306A\u3069\u3001\u3068\u304D\u3069\u304D\u53D6\u3063\u3066\u304A\u304F\u3068\u5B89\u5FC3\u3067\u3059\u3002"), /*#__PURE__*/React.createElement("button", {
      onClick: run,
      disabled: bkBusy,
      style: {
        width: "100%",
        border: "none",
        background: bkBusy ? "#ccc" : "var(--primary)",
        color: "#fff",
        borderRadius: 12,
        padding: "15px",
        fontSize: 15,
        fontWeight: 900,
        cursor: "pointer"
      }
    }, bkBusy ? "書き出しています…" : "控えを取る（ファイルに保存）"), bkMsg && /*#__PURE__*/React.createElement("div", {
      style: {
        fontSize: 12,
        color: "var(--sub)",
        marginTop: 12,
        textAlign: "center"
      }
    }, bkMsg), bkDone && /*#__PURE__*/React.createElement("div", {
      style: {
        marginTop: 14,
        background: bkDone.includes("うまく") ? "#fdeceb" : "#eaf6ee",
        color: bkDone.includes("うまく") ? "#b3261e" : "#2c6b45",
        border: "1px solid " + (bkDone.includes("うまく") ? "#f5c6c2" : "#c9e6d4"),
        borderRadius: 10,
        padding: "12px 13px",
        fontSize: 13,
        fontWeight: 800
      }
    }, bkDone), /*#__PURE__*/React.createElement("div", {
      style: {
        fontSize: 11.5,
        color: "var(--faint)",
        lineHeight: 1.8,
        marginTop: 18
      }
    }, "\u53D6\u3063\u305F\u30D5\u30A1\u30A4\u30EB\u306F\u3001\u30D1\u30BD\u30B3\u30F3\u3084 iCloud \u306A\u3069\u624B\u5143\u306B\u6B8B\u3057\u3066\u304A\u3044\u3066\u304F\u3060\u3055\u3044\u3002", /*#__PURE__*/React.createElement("br", null), "\u3082\u3057\u4E2D\u8EAB\u304C\u6D88\u3048\u3066\u3082\u3001\u3053\u306E\u30D5\u30A1\u30A4\u30EB\u304C\u3042\u308C\u3070\u623B\u305B\u307E\u3059\u3002"));
  })(), trashOpen && /*#__PURE__*/React.createElement(PopDetail, {
    pop: trashOpen,
    onClose: () => setTrashOpen(null),
    onDelete: () => {
      setTrashOpen(null);
      loadTrash();
    },
    onLiked: () => {},
    onCommented: () => {},
    navList: delPops,
    onNav: p => setTrashOpen(p)
  }), section === "oplog" && (() => {
    const LABEL = {
      delete: "消した",
      rename: "名前を直した",
      restore: "戻した",
      purge: "完全に消した",
      group: "まとめた",
      idea_add: "アイデアをのせた",
      idea_del: "アイデアを消した"
    };
    const COLOR = {
      delete: "#c2691a",
      rename: "#2f6fb0",
      restore: "#3f9e63",
      purge: "#b3261e",
      group: "#6b4ea0",
      idea_add: "#c39a3c",
      idea_del: "#8a9099"
    };
    return /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
      style: {
        fontSize: 12.5,
        color: "var(--sub)",
        lineHeight: 1.8,
        marginBottom: 14
      }
    }, "\u6D88\u3057\u305F\u308A\u540D\u524D\u3092\u76F4\u3057\u305F\u308A\u3057\u305F\u8A18\u9332\u3067\u3059\u3002\u65B0\u3057\u3044\u9806\u306B200\u4EF6\u307E\u3067\u898B\u3089\u308C\u307E\u3059\u3002"), opLogs.length === 0 ? /*#__PURE__*/React.createElement("div", {
      style: {
        textAlign: "center",
        color: "var(--faint)",
        padding: "44px 20px",
        fontSize: 13
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        fontSize: 15,
        fontWeight: 800,
        color: "var(--sub)"
      }
    }, "\u307E\u3060\u8A18\u9332\u304C\u3042\u308A\u307E\u305B\u3093")) : /*#__PURE__*/React.createElement("div", {
      style: {
        display: "flex",
        flexDirection: "column",
        gap: 6
      }
    }, opLogs.map(lg => /*#__PURE__*/React.createElement("div", {
      key: lg.id,
      style: {
        display: "flex",
        alignItems: "flex-start",
        gap: 9,
        background: "#fff",
        border: "1px solid var(--line)",
        borderRadius: 10,
        padding: "9px 11px"
      }
    }, /*#__PURE__*/React.createElement("span", {
      style: {
        fontSize: 11.5,
        fontWeight: 900,
        color: "#fff",
        background: COLOR[lg.action] || "#889",
        borderRadius: 6,
        padding: "3px 7px",
        flexShrink: 0,
        whiteSpace: "nowrap"
      }
    }, LABEL[lg.action] || lg.action), /*#__PURE__*/React.createElement("span", {
      style: {
        minWidth: 0,
        flex: 1
      }
    }, /*#__PURE__*/React.createElement("span", {
      style: {
        display: "block",
        fontSize: 13,
        fontWeight: 800,
        color: "var(--ink)",
        overflow: "hidden",
        textOverflow: "ellipsis",
        whiteSpace: "nowrap"
      }
    }, lg.target_name || "（名前なし）"), lg.detail && /*#__PURE__*/React.createElement("span", {
      style: {
        display: "block",
        fontSize: 11.5,
        color: "var(--sub)",
        marginTop: 2
      }
    }, lg.detail), /*#__PURE__*/React.createElement("span", {
      style: {
        display: "block",
        fontSize: 11.5,
        color: "var(--faint)",
        marginTop: 2
      }
    }, fmtDate(lg.created_at), lg.store_name ? ` ／ ${lg.store_name}` : ""))))));
  })(), section === "trash" && (() => {
    const ids = Object.keys(trashSel).filter(k => trashSel[k]);
    const doRestore = async () => {
      setTrashBusy(true);
      try {
        await api.restorePops(ids);
        setTrashSel({});
        await loadTrash();
        await load();
        try {
          window.dispatchEvent(new CustomEvent("appToast", {
            detail: `${ids.length}件を戻しました`
          }));
        } catch (e) {}
      } catch (e) {
        alert("戻せませんでした");
      } finally {
        setTrashBusy(false);
      }
    };
    const doPurge = async () => {
      if (!window.confirm(`${ids.length}件を完全に消しますか？\nこの操作は戻せません。`)) return;
      setTrashBusy(true);
      try {
        await api.delMany(ids);
        setTrashSel({});
        await loadTrash();
        try {
          window.dispatchEvent(new CustomEvent("appToast", {
            detail: `${ids.length}件を消しました`
          }));
        } catch (e) {}
      } catch (e) {
        alert("消せませんでした");
      } finally {
        setTrashBusy(false);
      }
    };
    return /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
      style: {
        fontSize: 12.5,
        color: "var(--sub)",
        lineHeight: 1.8,
        marginBottom: 14
      }
    }, "\u307F\u3093\u306A\u304C\u6D88\u3057\u305F\u6295\u7A3F\u3067\u3059\u3002\u4E00\u89A7\u306B\u306F\u51FA\u307E\u305B\u3093\u304C\u3001\u3053\u3053\u304B\u3089\u623B\u305B\u307E\u3059\u3002"), delPops.length === 0 ? /*#__PURE__*/React.createElement("div", {
      style: {
        textAlign: "center",
        color: "var(--faint)",
        padding: "44px 20px",
        fontSize: 13
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        fontSize: 15,
        fontWeight: 800,
        color: "var(--sub)"
      }
    }, "\u6D88\u3055\u308C\u305F\u6295\u7A3F\u306F\u3042\u308A\u307E\u305B\u3093")) : /*#__PURE__*/React.createElement(React.Fragment, null, ids.length > 0 && /*#__PURE__*/React.createElement("div", {
      style: {
        position: "sticky",
        top: 0,
        zIndex: 5,
        background: "var(--bg)",
        padding: "10px 0",
        display: "flex",
        alignItems: "center",
        gap: 8,
        marginBottom: 10
      }
    }, /*#__PURE__*/React.createElement("span", {
      style: {
        fontSize: 13.5,
        fontWeight: 800,
        color: "var(--ink)"
      }
    }, ids.length, "\u4EF6 \u9078\u629E\u4E2D"), /*#__PURE__*/React.createElement("button", {
      onClick: () => setTrashSel({}),
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
    }, "\u89E3\u9664"), /*#__PURE__*/React.createElement("button", {
      onClick: doRestore,
      disabled: trashBusy,
      style: {
        border: "none",
        background: "#3f9e63",
        color: "#fff",
        borderRadius: 9,
        padding: "9px 15px",
        fontSize: 13,
        fontWeight: 800,
        cursor: "pointer"
      }
    }, "\u3082\u3069\u3059"), /*#__PURE__*/React.createElement("button", {
      onClick: doPurge,
      disabled: trashBusy,
      style: {
        border: "1px solid #f0c8c4",
        background: "#fff",
        color: "#b3261e",
        borderRadius: 9,
        padding: "9px 13px",
        fontSize: 13,
        fontWeight: 800,
        cursor: "pointer"
      }
    }, "\u5B8C\u5168\u306B\u6D88\u3059")), /*#__PURE__*/React.createElement("div", {
      className: "pop-grid v-sm"
    }, delPops.map(pop => {
      const on = !!trashSel[pop.id];
      return /*#__PURE__*/React.createElement("div", {
        key: pop.id,
        onClick: () => setTrashOpen(pop),
        style: {
          position: "relative",
          border: on ? "2.5px solid var(--primary)" : "1px solid var(--line)",
          background: "var(--card, #fff)",
          borderRadius: 10,
          overflow: "hidden",
          cursor: "pointer",
          textAlign: "left"
        }
      }, /*#__PURE__*/React.createElement("img", {
        src: pop.image_url,
        alt: "",
        style: {
          width: "100%",
          aspectRatio: "1/1.414",
          objectFit: "contain",
          display: "block",
          background: "var(--card, #fff)",
          opacity: 0.75
        }
      }), /*#__PURE__*/React.createElement("span", {
        style: {
          display: "block",
          fontSize: 12.5,
          fontWeight: 800,
          color: "var(--ink)",
          padding: "6px 7px 2px",
          lineHeight: 1.4
        }
      }, pop.product_name), /*#__PURE__*/React.createElement("span", {
        style: {
          display: "block",
          fontSize: 11.5,
          color: "var(--faint)",
          padding: "0 7px 7px"
        }
      }, fmtDate(pop.deleted_at), " \u306B\u524A\u9664"), /*#__PURE__*/React.createElement("button", {
        onClick: e => {
          e.stopPropagation();
          setTrashSel(v => ({
            ...v,
            [pop.id]: !v[pop.id]
          }));
        },
        "aria-label": on ? "選ぶのをやめる" : "選ぶ",
        "aria-pressed": on,
        style: {
          position: "absolute",
          top: 6,
          right: 6,
          width: 28,
          height: 28,
          borderRadius: "50%",
          cursor: "pointer",
          border: on ? "none" : "1.5px solid rgba(255,255,255,0.9)",
          background: on ? "var(--primary)" : "rgba(20,25,35,0.45)",
          color: "#fff",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: 14,
          fontWeight: 900,
          padding: 0
        }
      }, on ? "✓" : ""));
    }))));
  })(), section === "archive" && /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 13,
      color: "var(--sub)",
      marginBottom: 14
    }
  }, "\u5199\u771F\u3092\u30BF\u30C3\u30D7\u3057\u3066\u9078\u3073\u3001\u307E\u3068\u3081\u3066\u30A2\u30FC\u30AB\u30A4\u30D6\uFF0F\u516C\u958B\u306B\u623B\u305B\u307E\u3059\u3002"), /*#__PURE__*/React.createElement("div", {
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
  }, "\u8AAD\u307F\u8FBC\u307F\u4E2D\u2026") : list.length === 0 ? /*#__PURE__*/React.createElement("div", {
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
    }, "\u2713"), /*#__PURE__*/React.createElement("div", {
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
        fontSize: 12,
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
  }, selIds.length, "\u4EF6 \u9078\u629E\u4E2D"), /*#__PURE__*/React.createElement("button", {
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
  }, "\u89E3\u9664"), /*#__PURE__*/React.createElement("button", {
    onClick: () => {
      setGrpAsk(true);
      setGrpName("");
      setGrpCover(selIds[0] || null);
    },
    style: {
      border: "1px solid var(--line)",
      background: "#fff",
      color: "var(--primary)",
      borderRadius: 9,
      padding: "9px 13px",
      fontSize: 13,
      fontWeight: 800,
      cursor: "pointer"
    }
  }, "\u307E\u3068\u3081\u308B"), /*#__PURE__*/React.createElement("button", {
    onClick: () => {
      setDelAsk(true);
      setDelWord("");
    },
    style: {
      border: "1px solid #f0c8c4",
      background: "#fff",
      color: "#b3261e",
      borderRadius: 9,
      padding: "9px 13px",
      fontSize: 13,
      fontWeight: 800,
      cursor: "pointer"
    }
  }, "\u6D88\u3059"), /*#__PURE__*/React.createElement("button", {
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
  }, applying ? "処理中…" : toArchive ? "アーカイブする" : "公開に戻す")), grpAsk && /*#__PURE__*/React.createElement("div", {
    onClick: () => !grpBusy && setGrpAsk(false),
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
      fontSize: 17,
      fontWeight: 900,
      color: "var(--ink)",
      marginBottom: 8
    }
  }, selIds.length, "\u4EF6\u3092\u3072\u3068\u307E\u3068\u3081\u306B\u3057\u307E\u3059"), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 12.5,
      color: "var(--sub)",
      lineHeight: 1.8,
      marginBottom: 14
    }
  }, "\u4E00\u89A7\u306B\u306F\u3001\u3053\u306E\u540D\u524D\u30671\u4EF6\u3060\u3051\u51FA\u308B\u3088\u3046\u306B\u306A\u308A\u307E\u3059\u3002\u62BC\u3059\u3068\u4E2D\u306E\u5168\u90E8\u304C\u898B\u3089\u308C\u307E\u3059\u3002"), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 12,
      fontWeight: 800,
      color: "var(--sub)",
      marginBottom: 6
    }
  }, "\u307E\u3068\u307E\u308A\u306E\u540D\u524D"), /*#__PURE__*/React.createElement("input", {
    value: grpName,
    onChange: e => setGrpName(e.target.value),
    placeholder: "\u4F8B\uFF1A9\u67088\u65E5\u306E\u6708\u66DC\u8CA9\u4FC3",
    style: {
      width: "100%",
      boxSizing: "border-box",
      border: "2px solid var(--line)",
      borderRadius: 10,
      padding: "11px 12px",
      fontSize: 15,
      outline: "none",
      fontFamily: "inherit",
      marginBottom: 14
    }
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 11.5,
      fontWeight: 800,
      color: "var(--sub)",
      marginBottom: 6
    }
  }, "\u8868\u7D19\u306B\u3059\u308B\u30DD\u30C3\u30D7\uFF08\u4E00\u89A7\u306B\u51FA\u307E\u3059\uFF09"), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      gap: 7,
      overflowX: "auto",
      paddingBottom: 6,
      marginBottom: 14
    }
  }, selIds.map(id => {
    const p2 = pops.find(x => x.id === id);
    if (!p2) return null;
    const on = grpCover === id;
    return /*#__PURE__*/React.createElement("button", {
      key: id,
      onClick: () => setGrpCover(id),
      "aria-pressed": on,
      style: {
        flexShrink: 0,
        width: 62,
        border: on ? "2.5px solid var(--primary)" : "1px solid var(--line)",
        background: "#fff",
        borderRadius: 9,
        padding: 3,
        cursor: "pointer"
      }
    }, /*#__PURE__*/React.createElement("img", {
      src: p2.image_url,
      alt: "",
      style: {
        width: "100%",
        aspectRatio: "1/1.414",
        objectFit: "contain",
        background: "#fff",
        borderRadius: 5,
        display: "block"
      }
    }));
  })), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      gap: 9,
      marginBottom: 10
    }
  }, /*#__PURE__*/React.createElement("button", {
    onClick: () => setGrpAsk(false),
    disabled: grpBusy,
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
    onClick: () => doGroup(grpName.trim(), grpCover),
    disabled: grpBusy || !grpName.trim(),
    style: {
      flex: 1,
      border: "none",
      background: grpBusy || !grpName.trim() ? "#ddd" : "var(--primary)",
      color: "#fff",
      borderRadius: 10,
      padding: "12px",
      fontSize: 14,
      fontWeight: 900,
      cursor: "pointer"
    }
  }, grpBusy ? "まとめています…" : "まとめる")), /*#__PURE__*/React.createElement("button", {
    onClick: () => doGroup(""),
    disabled: grpBusy,
    style: {
      width: "100%",
      border: "1px solid var(--line)",
      background: "#fff",
      color: "var(--sub)",
      borderRadius: 10,
      padding: "10px",
      fontSize: 12.5,
      fontWeight: 700,
      cursor: "pointer"
    }
  }, "\u307E\u3068\u307E\u308A\u3092\u89E3\u9664\u3059\u308B\uFF08\u30D0\u30E9\u30D0\u30E9\u306B\u623B\u3059\uFF09"))), delAsk && /*#__PURE__*/React.createElement("div", {
    onClick: () => !delBusy && setDelAsk(false),
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
      fontSize: 17,
      fontWeight: 900,
      color: "#b3261e",
      marginBottom: 8
    }
  }, selIds.length, "\u4EF6\u3092\u5B8C\u5168\u306B\u6D88\u3057\u307E\u3059"), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 12.5,
      color: "var(--text)",
      lineHeight: 1.8,
      marginBottom: 14
    }
  }, "\u9078\u3093\u3060\u30DD\u30C3\u30D7\u3068\u3001\u305D\u3053\u306B\u4ED8\u3044\u305F\u30B3\u30E1\u30F3\u30C8\u3082\u4E00\u7DD2\u306B\u6D88\u3048\u307E\u3059\u3002", /*#__PURE__*/React.createElement("br", null), /*#__PURE__*/React.createElement("b", null, "\u4E00\u5EA6\u6D88\u3059\u3068\u5143\u306B\u623B\u305B\u307E\u305B\u3093\u3002"), /*#__PURE__*/React.createElement("br", null), "\u6B8B\u3057\u3066\u304A\u304D\u305F\u3044\u3060\u3051\u306A\u3089\u300C\u30A2\u30FC\u30AB\u30A4\u30D6\u3059\u308B\u300D\u3092\u304A\u4F7F\u3044\u304F\u3060\u3055\u3044\u3002"), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 12,
      fontWeight: 800,
      color: "var(--sub)",
      marginBottom: 6
    }
  }, "\u78BA\u8A8D\u306E\u305F\u3081\u300C\u524A\u9664\u300D\u3068\u5165\u529B\u3057\u3066\u304F\u3060\u3055\u3044"), /*#__PURE__*/React.createElement("input", {
    value: delWord,
    onChange: e => setDelWord(e.target.value),
    placeholder: "\u524A\u9664",
    style: {
      width: "100%",
      boxSizing: "border-box",
      border: "2px solid var(--line)",
      borderRadius: 10,
      padding: "11px 12px",
      fontSize: 15,
      outline: "none",
      fontFamily: "inherit",
      marginBottom: 16
    }
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      gap: 9
    }
  }, /*#__PURE__*/React.createElement("button", {
    onClick: () => setDelAsk(false),
    disabled: delBusy,
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
    onClick: doDelete,
    disabled: delBusy || delWord.trim() !== "削除",
    style: {
      flex: 1,
      border: "none",
      background: delBusy || delWord.trim() !== "削除" ? "#ddd" : "#b3261e",
      color: "#fff",
      borderRadius: 10,
      padding: "12px",
      fontSize: 14,
      fontWeight: 900,
      cursor: "pointer"
    }
  }, delBusy ? "消しています…" : "完全に消す")))), section === "pinned" && /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 13,
      color: "var(--sub)",
      marginBottom: 14
    }
  }, "\u30DB\u30FC\u30E0\u753B\u9762\u306E\u4E00\u89A7\u6700\u4E0A\u90E8\u306B\u56FA\u5B9A\u3059\u308BPOP\u3092\u9078\u629E\u3067\u304D\u307E\u3059"), loading ? /*#__PURE__*/React.createElement("div", {
    style: {
      textAlign: "center",
      color: "var(--sub)",
      padding: "40px 0",
      fontSize: 14
    }
  }, "\u8AAD\u307F\u8FBC\u307F\u4E2D\u2026") : /*#__PURE__*/React.createElement(React.Fragment, null, pinnedPopId && /*#__PURE__*/React.createElement("div", {
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
  }, "\uD83D\uDCCC \u73FE\u5728\u306E\u30D4\u30F3\u7559\u3081"), pops.find(p => p.id === pinnedPopId) && /*#__PURE__*/React.createElement("div", {
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
  }, "\u5916\u3059"))), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 12,
      fontWeight: 800,
      color: "var(--sub)",
      marginBottom: 8
    }
  }, "\u6700\u8FD1\u6295\u7A3F\u3057\u305FPOP"), /*#__PURE__*/React.createElement("div", {
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
  }, "\uD83D\uDCCC")))))), section === "memo" && /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 13,
      color: "var(--sub)",
      marginBottom: 12
    }
  }, "\u5236\u4F5C\u6642\u306E\u6C17\u3065\u304D\u30FB\u5931\u6557\u70B9\u30FB\u5DE5\u592B\u3092\u7B87\u6761\u66F8\u304D\u3067\u8A18\u9332\u3002\u30E1\u30E2\u5185\u306EPOP\u540D\u306F\u81EA\u52D5\u3067\u30EA\u30F3\u30AF\u306B\u306A\u308A\u307E\u3059"), /*#__PURE__*/React.createElement("textarea", {
    value: memoText,
    onChange: e => {
      setMemoText(e.target.value);
      setMemoDirty(true);
    },
    placeholder: "\u30FB\u5546\u54C1\u540D\uFF0F\u30AD\u30E3\u30F3\u30DA\u30FC\u30F3\u540D\n\u30FB\u7528\u9014\uFF0F\u58F2\u5834\n\u30FB\u30E1\u30A4\u30F3\u8A34\u6C42\n\u30FB\u30C7\u30B6\u30A4\u30F3\u65B9\u5411\n\u30FB\u4FEE\u6B63\u3057\u305F\u70B9\n\u30FBAI\u304C\u5931\u6557\u3057\u305F\u70B9\n\u30FB\u6B21\u56DE\u6D41\u7528\u3067\u304D\u308B\u70B9",
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
  }, "\u30A2\u30FC\u30AB\u30A4\u30D6"), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 13,
      color: "var(--sub)",
      marginBottom: 14
    }
  }, "\u8CA9\u58F2\u304C\u7D42\u308F\u3063\u305FPOP\u306E\u4FDD\u7BA1\u5EAB\u3067\u3059\u3002\u904E\u53BB\u306E\u53C2\u8003\u306B\u3069\u3046\u305E\u3002"), loading ? /*#__PURE__*/React.createElement("div", {
    style: {
      textAlign: "center",
      color: "var(--sub)",
      padding: "50px 0",
      fontSize: 14
    }
  }, "\u8AAD\u307F\u8FBC\u307F\u4E2D\u2026") : pops.length === 0 ? /*#__PURE__*/React.createElement("div", {
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
  }, "\u30A2\u30FC\u30AB\u30A4\u30D6\u306F\u307E\u3060\u7A7A\u3067\u3059"), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 13,
      marginTop: 6,
      color: "var(--faint)"
    }
  }, "\u7BA1\u7406\u753B\u9762\u304B\u3089POP\u3092\u30A2\u30FC\u30AB\u30A4\u30D6\u3067\u304D\u307E\u3059")) : /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 13,
      fontWeight: 800,
      color: "var(--sub)",
      marginBottom: 12,
      paddingLeft: 2
    }
  }, "\u30A2\u30FC\u30AB\u30A4\u30D6\u6E08\u307F\uFF08", pops.length, "\uFF09"), /*#__PURE__*/React.createElement("div", {
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
    title: "\u8CC7\u6599\u306B\u767B\u9332",
    style: {
      position: "absolute",
      right: 5,
      bottom: 5,
      border: "none",
      background: "rgba(29,58,87,0.86)",
      color: "#fff",
      borderRadius: 999,
      padding: "4px 9px",
      fontSize: 11.5,
      fontWeight: 900,
      cursor: "pointer"
    }
  }, "\u8CC7\u6599\u3078"))))), resTarget && /*#__PURE__*/React.createElement("div", {
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
  }, "\u8CC7\u6599\u306B\u767B\u9332"), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 12,
      color: "var(--sub)",
      lineHeight: 1.6,
      marginBottom: 12
    }
  }, "\u3053\u306E\u30DD\u30C3\u30D7\u306E\u753B\u50CF\u3092\u8CC7\u6599\u3068\u3057\u3066\u767B\u9332\u3057\u307E\u3059\u3002\u300C\u4E00\u89A7\u306B\u8868\u793A\u3059\u308B\u300D\u3092\u5165\u308C\u306A\u3051\u308C\u3070\u3001\u7BA1\u7406\u753B\u9762\u304B\u3089\u3060\u3051\u898B\u3089\u308C\u307E\u3059\u3002"), /*#__PURE__*/React.createElement("img", {
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
    placeholder: "\u30BF\u30A4\u30C8\u30EB",
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
    placeholder: "\u8AAC\u660E\uFF08\u4EFB\u610F\uFF09",
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
  }), "\u4E00\u89A7\u306B\u8868\u793A\u3059\u308B\uFF08\u307F\u3093\u306A\u304C\u898B\u3089\u308C\u307E\u3059\uFF09"), resMsg && /*#__PURE__*/React.createElement("div", {
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
  }, "\u3084\u3081\u308B"), /*#__PURE__*/React.createElement("button", {
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
  const [files, setFiles] = useState([]); // 添付ファイル [{name,url,type,size}]
  const [upBusy, setUpBusy] = useState(false);
  const isPop = kind === "POP作成依頼";
  const MAX_MB = 10;
  const pickFiles = async list => {
    if (!list || !list.length) return;
    setUpBusy(true);
    setError("");
    try {
      const added = [];
      for (const f of Array.from(list)) {
        if (f.size > MAX_MB * 1024 * 1024) {
          setError(`${f.name} は大きすぎます（${MAX_MB}MBまで）`);
          continue;
        }
        const url = await api.uploadRaw(f);
        added.push({
          name: f.name,
          url,
          type: f.type || "",
          size: f.size
        });
      }
      if (added.length) setFiles(v => v.concat(added));
    } catch (e) {
      setError("ファイルを送れませんでした");
    } finally {
      setUpBusy(false);
    }
  };
  const isImg = f => (f.type || "").startsWith("image/");
  const fileKB = n => n >= 1024 * 1024 ? `${(n / 1024 / 1024).toFixed(1)}MB` : `${Math.round(n / 1024)}KB`;
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
        priority: isPop ? priority : "普通",
        files
      });
      setDone(true);
      setFiles([]);
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
    }, "\u9001\u4FE1\u3057\u307E\u3057\u305F"), /*#__PURE__*/React.createElement("div", {
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
    }, "\u7D9A\u3051\u3066\u9001\u4FE1\u3059\u308B")));
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
  }, "\u304A\u554F\u3044\u5408\u308F\u305B"), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 13,
      color: "var(--sub)",
      marginBottom: 14
    }
  }, "POP\u306E\u4F5C\u6210\u4F9D\u983C\u3001\u30A2\u30D7\u30EA\u3084\u58F2\u5834\u3078\u306E\u3054\u8981\u671B\u3001\u8CEA\u554F\u306A\u3069\u3001\u306A\u3093\u3067\u3082\u3053\u3053\u304B\u3089\u3069\u3046\u305E\u3002\u5185\u5BB9\u306F\u62C5\u5F53\u8005\u306B\u5C4A\u304D\u307E\u3059\u3002"), /*#__PURE__*/React.createElement("div", {
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
  }, isPop ? /*#__PURE__*/React.createElement(React.Fragment, null, "\u5546\u54C1\u540D ", /*#__PURE__*/React.createElement("span", {
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
  }, "\u5E97\u8217"), /*#__PURE__*/React.createElement("select", {
    value: store,
    onChange: e => setStore(e.target.value),
    style: inp
  }, /*#__PURE__*/React.createElement("option", {
    value: ""
  }, "\u672A\u6307\u5B9A"), STORES.map(s => /*#__PURE__*/React.createElement("option", {
    key: s,
    value: s
  }, s)))), isPop && /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
    style: lbl
  }, "\u512A\u5148\u5EA6"), /*#__PURE__*/React.createElement("div", {
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
  }, isPop ? "要望・メモ" : /*#__PURE__*/React.createElement(React.Fragment, null, "\u5185\u5BB9 ", /*#__PURE__*/React.createElement("span", {
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
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      marginTop: 12
    }
  }, /*#__PURE__*/React.createElement("label", {
    style: {
      display: "block",
      position: "relative",
      overflow: "hidden",
      border: "1px dashed var(--line)",
      background: upBusy ? "#f6f6f6" : "#fff",
      borderRadius: 10,
      padding: "13px",
      textAlign: "center",
      cursor: upBusy ? "default" : "pointer"
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 13,
      fontWeight: 800,
      color: "var(--sub)"
    }
  }, upBusy ? "送っています…" : "＋ ファイルを添付する"), /*#__PURE__*/React.createElement("span", {
    style: {
      display: "block",
      fontSize: 11.5,
      color: "var(--faint)",
      marginTop: 3
    }
  }, "\u5199\u771F\u30FBExcel\u30FBPDF\u30FBWord\u30FB\u30C6\u30AD\u30B9\u30C8\u306A\u3069\uFF081\u3064", MAX_MB, "MB\u307E\u3067\uFF09"), /*#__PURE__*/React.createElement("input", {
    type: "file",
    multiple: true,
    disabled: upBusy,
    accept: "image/*,.pdf,.xlsx,.xls,.csv,.doc,.docx,.txt,.png,.jpg,.jpeg,.gif,.webp,.bmp,.heic",
    style: {
      position: "absolute",
      inset: 0,
      opacity: 0,
      width: "100%",
      height: "100%",
      cursor: "pointer"
    },
    onChange: e => {
      const l = e.target.files;
      e.target.value = "";
      pickFiles(l);
    }
  })), files.length > 0 && /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      flexDirection: "column",
      gap: 6,
      marginTop: 9
    }
  }, files.map((f, i) => /*#__PURE__*/React.createElement("div", {
    key: i,
    style: {
      display: "flex",
      alignItems: "center",
      gap: 9,
      border: "1px solid var(--line)",
      borderRadius: 9,
      padding: "7px 9px",
      background: "#fff"
    }
  }, isImg(f) ? /*#__PURE__*/React.createElement("img", {
    src: f.url,
    alt: "",
    style: {
      width: 38,
      height: 38,
      objectFit: "cover",
      borderRadius: 6,
      flexShrink: 0,
      background: "var(--bg)"
    }
  }) : /*#__PURE__*/React.createElement("span", {
    style: {
      width: 38,
      height: 38,
      borderRadius: 6,
      flexShrink: 0,
      background: "var(--bg)",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      fontSize: 11.5,
      fontWeight: 900,
      color: "var(--sub)"
    }
  }, (f.name.split(".").pop() || "").slice(0, 4).toUpperCase()), /*#__PURE__*/React.createElement("span", {
    style: {
      minWidth: 0,
      flex: 1
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      display: "block",
      fontSize: 12,
      fontWeight: 700,
      color: "var(--ink)",
      overflow: "hidden",
      textOverflow: "ellipsis",
      whiteSpace: "nowrap"
    }
  }, f.name), /*#__PURE__*/React.createElement("span", {
    style: {
      display: "block",
      fontSize: 11.5,
      color: "var(--faint)"
    }
  }, fileKB(f.size))), /*#__PURE__*/React.createElement("button", {
    onClick: () => setFiles(v => v.filter((_, k) => k !== i)),
    "aria-label": `${f.name}を外す`,
    style: {
      border: "none",
      background: "transparent",
      color: "var(--faint)",
      fontSize: 16,
      fontWeight: 900,
      cursor: "pointer",
      padding: "0 3px",
      flexShrink: 0
    }
  }, "\xD7")))))), error && /*#__PURE__*/React.createElement("div", {
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
  }, "\u8AAD\u307F\u8FBC\u307F\u4E2D\u2026");
  return /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
    style: {
      ...card,
      fontSize: 13,
      color: "var(--text)",
      lineHeight: 1.7
    }
  }, "2\u7A2E\u985E\u306E\u304A\u77E5\u3089\u305B\u3092\u3001\u3053\u3053\u304B\u3089ON/OFF\u3067\u304D\u307E\u3059\u3002\u2460\u306F\u4E0D\u5177\u5408\u306A\u3069\u306E", /*#__PURE__*/React.createElement("b", null, "\u7DCA\u6025\u306E\u304A\u77E5\u3089\u305B\u30D0\u30CA\u30FC"), "\uFF08\u30E1\u30A4\u30F3\u30DA\u30FC\u30B8\u4E0A\u90E8\u306B\u56FA\u5B9A\uFF09\u3001\u2461\u306F\u30DB\u30FC\u30E0\u753B\u9762\u4E0B\u306B\u51FA\u308B", /*#__PURE__*/React.createElement("b", null, "\u6848\u5185\u30E1\u30C3\u30BB\u30FC\u30B8"), "\uFF08\u30BF\u30C3\u30D7\uFF0F\u30B9\u30AF\u30ED\u30FC\u30EB\u3067\u6D88\u3048\u308B\u3082\u306E\uFF09\u3067\u3059\u3002\u4FDD\u5B58\u3059\u308B\u3068\u3001\u307F\u3093\u306A\u306E\u753B\u9762\u306B\u53CD\u6620\u3055\u308C\u307E\u3059\u3002"), /*#__PURE__*/React.createElement("div", {
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
  }, "\u2460 \u7DCA\u6025\u304A\u77E5\u3089\u305B\u30D0\u30CA\u30FC\u3092\u8868\u793A\u3059\u308B"), /*#__PURE__*/React.createElement("button", {
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
  }, "\u304A\u77E5\u3089\u305B\u6587"), /*#__PURE__*/React.createElement("textarea", {
    value: message,
    onChange: e => setMessage(e.target.value),
    rows: 4,
    placeholder: "\u4F8B\uFF1A\u767A\u6CE8\u30D0\u30FC\u30B3\u30FC\u30C9\u306E\u5370\u5237\u304CWindows\u3067\u4E00\u90E8\u305A\u308C\u308B\u4E0D\u5177\u5408\u306E\u305F\u3081\u3001\u5370\u5237\u6A5F\u80FD\u3092\u4E00\u6642\u8ABF\u6574\u4E2D\u3067\u3059\u3002Mac\u3084iPhone\u3067\u306F\u5229\u7528\u3067\u304D\u307E\u3059\u3002",
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
  }, "\u30D7\u30EC\u30D3\u30E5\u30FC\uFF08\u5B9F\u969B\u306E\u898B\u3048\u65B9\uFF09"), /*#__PURE__*/React.createElement("div", {
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
  }, "\u26A0\uFE0F"), /*#__PURE__*/React.createElement("span", {
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
  }, "\u2461 \u30DB\u30FC\u30E0\u753B\u9762\u306E\u6848\u5185\u30E1\u30C3\u30BB\u30FC\u30B8"), /*#__PURE__*/React.createElement("button", {
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
      fontSize: 12,
      color: "var(--sub)",
      marginBottom: 12,
      lineHeight: 1.6
    }
  }, "\u30BF\u30C3\u30D7\u307E\u305F\u306F\u30B9\u30AF\u30ED\u30FC\u30EB\u3067\u81EA\u52D5\u7684\u306B\u6D88\u3048\u308B\u3001\u30DB\u30FC\u30E0\u753B\u9762\u4E0B\u306E\u30D5\u30ED\u30FC\u30C6\u30A3\u30F3\u30B0\u6848\u5185\u3067\u3059\u3002\u300C\u5B63\u7BC0\u306E\u30DD\u30C3\u30D7\u306F\u81EA\u52D5\u3067\u30A2\u30FC\u30AB\u30A4\u30D6\u3055\u308C\u307E\u3059\u300D\u3068\u3044\u3063\u305F\u8EFD\u3044\u6848\u5185\u306B\u4F7F\u3044\u307E\u3059\u3002"), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 13,
      fontWeight: 800,
      color: "var(--text)",
      marginBottom: 6
    }
  }, "\u6848\u5185\u6587"), /*#__PURE__*/React.createElement("textarea", {
    value: tipMessage,
    onChange: e => setTipMessage(e.target.value),
    rows: 2,
    placeholder: "\u4F8B\uFF1A\u5B63\u7BC0\u306E\u30DD\u30C3\u30D7\u3084\u6642\u671F\u304C\u904E\u304E\u305F\u30DD\u30C3\u30D7\u306F\u300C\u30A2\u30FC\u30AB\u30A4\u30D6\u300D\u306B\u53CE\u7D0D\u3055\u308C\u307E\u3059\u3002",
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
  }, "\u30D7\u30EC\u30D3\u30E5\u30FC"), /*#__PURE__*/React.createElement("div", {
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
  }, "\u2462 \u65B0\u6A5F\u80FD\u306E\u304A\u77E5\u3089\u305B\u30D0\u30CA\u30FC"), /*#__PURE__*/React.createElement("button", {
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
      fontSize: 12,
      color: "var(--sub)",
      marginBottom: 12,
      lineHeight: 1.6
    }
  }, "\u65B0\u6A5F\u80FD\u3092\u8FFD\u52A0\u3057\u305F\u3068\u304D\u306B\u3001\u30DB\u30FC\u30E0\u753B\u9762\u306E\u4E0A\u90E8\u306B\u51FA\u3059\u6848\u5185\u3067\u3059\u3002\u5404\u81EA\u304C\u4E00\u5EA6\u300C\xD7\u300D\u3067\u9589\u3058\u308B\u3068\u3001\u305D\u306E\u4EBA\u306B\u306F\u518D\u8868\u793A\u3055\u308C\u307E\u305B\u3093\uFF08\u6587\u9762\u3092\u5909\u3048\u3066\u4FDD\u5B58\u3059\u308B\u3068\u3001\u307E\u305F\u5168\u54E1\u306B\u8868\u793A\u3055\u308C\u307E\u3059\uFF09\u3002"), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 13,
      fontWeight: 800,
      color: "var(--text)",
      marginBottom: 6
    }
  }, "\u304A\u77E5\u3089\u305B\u6587"), /*#__PURE__*/React.createElement("textarea", {
    value: featMessage,
    onChange: e => setFeatMessage(e.target.value),
    rows: 2,
    placeholder: "\u4F8B\uFF1A\u9B5A\u56F3\u9451\u304C\u3067\u304D\u307E\u3057\u305F\uFF01\u65EC\u306E\u9B5A\u3084\u58F2\u308A\u65B9\u306E\u30D2\u30F3\u30C8\u304C\u898B\u3089\u308C\u307E\u3059\u3002",
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
  }, "\u30BF\u30C3\u30D7\u3067\u958B\u304F\u6A5F\u80FD\uFF08\u4EFB\u610F\uFF09"), /*#__PURE__*/React.createElement("select", {
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
  }, "\uFF08\u79FB\u52D5\u3057\u306A\u3044\uFF09"), TAB_REGISTRY.filter(t => t.key !== "admin").map(t => /*#__PURE__*/React.createElement("option", {
    key: t.key,
    value: t.key
  }, t.label))), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 12,
      color: "var(--sub)",
      margin: "14px 0 6px",
      fontWeight: 700
    }
  }, "\u30D7\u30EC\u30D3\u30E5\u30FC"), /*#__PURE__*/React.createElement("div", {
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
  }, featMessage.trim() || "（ここにお知らせ文が表示されます）")), featTab && /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 12,
      fontWeight: 800,
      color: "#2f6fb0",
      background: "#fff",
      borderRadius: 8,
      padding: "4px 10px"
    }
  }, "\u3072\u3089\u304F"))), /*#__PURE__*/React.createElement("div", {
    style: card
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 15,
      fontWeight: 900,
      color: "var(--ink)",
      marginBottom: 4
    }
  }, "\u30E1\u30CB\u30E5\u30FC\u306B\u51FA\u3059\u3082\u306E\u3092\u3048\u3089\u3076"), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 12,
      color: "var(--sub)",
      marginBottom: 11,
      lineHeight: 1.6
    }
  }, "\u30C1\u30A7\u30C3\u30AF\u3092\u5916\u3059\u3068\u3001\u30E1\u30CB\u30E5\u30FC\u304B\u3089\u6D88\u3048\u307E\u3059\uFF08\u300C\u7BA1\u7406\u753B\u9762\u300D\u306F\u5E38\u306B\u51FA\u307E\u3059\uFF09"), /*#__PURE__*/React.createElement("div", {
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
        fontSize: 11.5,
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
  }, "\u2463 \u4E0B\u306E\u30DC\u30BF\u30F3\u306B\u8D64\u3044\u5370\u3092\u3064\u3051\u308B"), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 12,
      color: "var(--sub)",
      marginBottom: 12,
      lineHeight: 1.6
    }
  }, "\u4E0B\u306E\u30D0\u30FC\u306E\u30DC\u30BF\u30F3\u306B\u8D64\u3044\u4E38\u3068\u5439\u304D\u51FA\u3057\u3092\u51FA\u3057\u307E\u3059\u3002\u300C\u30AB\u30BF\u30ED\u30B0\u306B\u30CF\u30ED\u30FC\u30C7\u30A4\u3092\u8FFD\u52A0\u3057\u307E\u3057\u305F\u300D\u306E\u3088\u3046\u306B\u3001\u5BFE\u5FDC\u3057\u305F\u3053\u3068\u3092\u77E5\u3089\u305B\u305F\u3044\u6642\u306B\u3002\u4E00\u5EA6\u30BF\u30C3\u30D7\u3059\u308B\u3068\u6D88\u3048\u3001\u6307\u5B9A\u3057\u305F\u65E5\u6570\u304C\u904E\u304E\u3066\u3082\u81EA\u52D5\u3067\u6D88\u3048\u307E\u3059\u3002"), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 13,
      fontWeight: 800,
      color: "var(--text)",
      marginBottom: 6
    }
  }, "\u3069\u306E\u30DC\u30BF\u30F3\u306B\u4ED8\u3051\u308B\u304B"), /*#__PURE__*/React.createElement("select", {
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
  }, "\uFF08\u4ED8\u3051\u306A\u3044\uFF09"), /*#__PURE__*/React.createElement("option", {
    value: "board"
  }, "\u4E00\u89A7"), /*#__PURE__*/React.createElement("option", {
    value: "catalog"
  }, "\u30AB\u30BF\u30ED\u30B0"), /*#__PURE__*/React.createElement("option", {
    value: "__more"
  }, "\u30E1\u30CB\u30E5\u30FC")), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 13,
      fontWeight: 800,
      color: "var(--text)",
      marginBottom: 6
    }
  }, "\u5439\u304D\u51FA\u3057\u306E\u6587\u8A00"), /*#__PURE__*/React.createElement("input", {
    value: badgeText,
    onChange: e => setBadgeText(e.target.value),
    placeholder: "\u4F8B\uFF1A\u30CF\u30ED\u30FC\u30C7\u30A4\u8FFD\u52A0\u3057\u307E\u3057\u305F\uFF01",
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
  }, "\u8868\u793A\u3059\u308B\u65E5\u6570"), /*#__PURE__*/React.createElement("div", {
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
  }, d, "\u65E5\u9593"))), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 12,
      color: "var(--sub)",
      marginBottom: 6,
      fontWeight: 700
    }
  }, "\u30D7\u30EC\u30D3\u30E5\u30FC"), /*#__PURE__*/React.createElement("div", {
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
  }, "\u30AB\u30BF\u30ED\u30B0"), /*#__PURE__*/React.createElement("span", {
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
      fontSize: 12,
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
  }, "\u6A2A\u5411\u304D\u306B\u306A\u3063\u3066\u3057\u307E\u3063\u305F\u30DD\u30C3\u30D7\u3092\u300190\u5EA6\u305A\u3064\u56DE\u3057\u3066\u76F4\u305B\u307E\u3059\u3002\u898B\u305F\u76EE\u3060\u3051\u3092\u56DE\u3059\u65B9\u5F0F\u306A\u306E\u3067\u3001\u6295\u7A3F\u65E5\u306F\u5909\u308F\u3089\u305A", /*#__PURE__*/React.createElement("b", null, "\u4E26\u3073\u9806\u3082\u305D\u306E\u307E\u307E"), "\u3067\u3059\u3002"), /*#__PURE__*/React.createElement("label", {
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
  }), "\u56DE\u8EE2\u3055\u305B\u305F\u3082\u306E\u3060\u3051\u8868\u793A"), msg && /*#__PURE__*/React.createElement("div", {
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
  }, "\u8AAD\u307F\u8FBC\u307F\u4E2D\u2026") : shown.length === 0 ? /*#__PURE__*/React.createElement("div", {
    style: {
      textAlign: "center",
      color: "var(--faint)",
      padding: "36px 0",
      fontSize: 13
    }
  }, "\u8A72\u5F53\u3059\u308B\u30DD\u30C3\u30D7\u304C\u3042\u308A\u307E\u305B\u3093") : /*#__PURE__*/React.createElement("div", {
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
        fontSize: 12,
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
      title: "\u5DE6\u306B90\u5EA6"
    }, "\u21BA"), /*#__PURE__*/React.createElement("button", {
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
      title: "\u53F3\u306B90\u5EA6"
    }, "\u21BB"), rot !== 0 && /*#__PURE__*/React.createElement("button", {
      onClick: () => rotate(pop, -rot),
      disabled: busyId === pop.id,
      style: {
        border: "1px solid var(--line)",
        background: "var(--soft)",
        color: "var(--primary)",
        borderRadius: 7,
        padding: "6px 8px",
        fontSize: 11.5,
        fontWeight: 800,
        cursor: "pointer"
      },
      title: "\u5143\u306B\u623B\u3059"
    }, "\u623B\u3059")), rot !== 0 && /*#__PURE__*/React.createElement("div", {
      style: {
        fontSize: 11.5,
        color: "var(--primary-soft)",
        fontWeight: 800,
        marginTop: 5,
        textAlign: "center"
      }
    }, rot, "\u5EA6"));
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
  }, "\u5404\u30B9\u30FC\u30D1\u30FC\u306E\u4E88\u7D04\u30AB\u30BF\u30ED\u30B0\u3092\u767B\u9332\u3057\u307E\u3059\u3002\u5199\u771F\u3084PDF\u3092\u30A2\u30C3\u30D7\u30ED\u30FC\u30C9\u3059\u308B\u304B\u3001Web\u30AB\u30BF\u30ED\u30B0\u306EURL\u3092\u8CBC\u3063\u3066\u304F\u3060\u3055\u3044\u3002\u300C\u8868\u793A\u300D\u306B\u3057\u305F\u3082\u306E\u304C\u4E88\u7D04\u30AB\u30BF\u30ED\u30B0\u306E\u30DA\u30FC\u30B8\u306B\u4E26\u3073\u307E\u3059\u3002"), /*#__PURE__*/React.createElement("div", {
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
  }, "\u30AB\u30BF\u30ED\u30B0\u3092\u8FFD\u52A0"), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 12,
      fontWeight: 800,
      color: "var(--sub)",
      marginBottom: 5
    }
  }, "\u30B9\u30FC\u30D1\u30FC\u540D"), /*#__PURE__*/React.createElement("div", {
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
    placeholder: "\u4E0A\u306B\u7121\u3051\u308C\u3070\u5165\u529B\uFF08\u4F8B\uFF1A\u30DE\u30EB\u30DE\u30F3\uFF09",
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
      fontSize: 12,
      fontWeight: 800,
      color: "var(--sub)",
      marginBottom: 4
    }
  }, "\u5E74"), /*#__PURE__*/React.createElement("input", {
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
      fontSize: 12,
      fontWeight: 800,
      color: "var(--sub)",
      marginBottom: 4
    }
  }, "\u6642\u671F"), /*#__PURE__*/React.createElement("select", {
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
      fontSize: 12,
      fontWeight: 800,
      color: "var(--sub)",
      marginBottom: 4
    }
  }, "\u8868\u7D19\u306E\u753B\u50CF\uFF08\u4EFB\u610F\u30FB\u30DA\u30FC\u30B8\u304C\u6D88\u3048\u3066\u3082\u6B8B\u308A\u307E\u3059\uFF09"), /*#__PURE__*/React.createElement("input", {
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
    placeholder: "\u30AB\u30BF\u30ED\u30B0\u540D\uFF08\u4F8B\uFF1A\u304A\u6B73\u66AE 2026\uFF09",
    style: {
      ...inp,
      marginBottom: 8
    }
  }), /*#__PURE__*/React.createElement("input", {
    value: form.note,
    onChange: e => setF("note", e.target.value),
    placeholder: "\u30E1\u30E2\uFF08\u4F8B\uFF1A\u7DE0\u5207 12/10\uFF09",
    style: {
      ...inp,
      marginBottom: 8
    }
  }), /*#__PURE__*/React.createElement("input", {
    value: form.url,
    onChange: e => setF("url", e.target.value),
    placeholder: "URL\uFF08\u30D5\u30A1\u30A4\u30EB\u3092\u9078\u3076\u3068\u81EA\u52D5\u3067\u5165\u308A\u307E\u3059\uFF09",
    style: {
      ...inp,
      marginBottom: 11,
      fontSize: 12
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
  }), "\u307F\u3093\u306A\u306B\u8868\u793A\u3059\u308B"), /*#__PURE__*/React.createElement("button", {
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
      fontSize: 12,
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
  }, "\u767B\u9332\u6E08\u307F\uFF08", list.length, "\uFF09"), loading ? /*#__PURE__*/React.createElement("div", {
    style: {
      textAlign: "center",
      color: "var(--faint)",
      padding: "26px 0",
      fontSize: 13
    }
  }, "\u8AAD\u307F\u8FBC\u307F\u4E2D\u2026") : list.length === 0 ? /*#__PURE__*/React.createElement("div", {
    style: {
      textAlign: "center",
      color: "var(--faint)",
      padding: "32px 0",
      fontSize: 13
    }
  }, "\u307E\u3060\u767B\u9332\u304C\u3042\u308A\u307E\u305B\u3093") : /*#__PURE__*/React.createElement("div", {
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
  }, "\uD83D\uDCC4"), /*#__PURE__*/React.createElement("div", {
    style: {
      minWidth: 0,
      flex: 1
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 11.5,
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
      fontSize: 12,
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
      fontSize: 11.5,
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
      fontSize: 11.5,
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
      fontSize: 11.5,
      fontWeight: 800,
      cursor: "pointer"
    }
  }, "\u524A\u9664"))))));
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
  }, "PDF\u30FB\u753B\u50CF\u306F\u3053\u3053\u304B\u3089\u30A2\u30C3\u30D7\u30ED\u30FC\u30C9\u3067\u304D\u307E\u3059\u3002\u30B9\u30D7\u30EC\u30C3\u30C9\u30B7\u30FC\u30C8\u306A\u3069\u306FURL\u3092\u8CBC\u308A\u4ED8\u3051\u3066\u304F\u3060\u3055\u3044\u3002\u300C\u8868\u793A\u300D\u3092\u30AA\u30F3\u306B\u3057\u305F\u3082\u306E\u304C\u3001\u4E00\u89A7\u30DA\u30FC\u30B8\u306E\u8CC7\u6599\u30AB\u30FC\u30C9\u306B\u4E26\u3073\u307E\u3059\u3002"), /*#__PURE__*/React.createElement("div", {
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
  }, "\u8CC7\u6599\u3092\u8FFD\u52A0"), /*#__PURE__*/React.createElement("div", {
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
    placeholder: "\u30BF\u30A4\u30C8\u30EB\uFF08\u4F8B\uFF1A\u9B5A\u58F2\u5834POP 10\u30B7\u30EA\u30FC\u30BA\uFF09",
    style: {
      ...inp,
      marginBottom: 8
    }
  }), /*#__PURE__*/React.createElement("input", {
    value: form.description,
    onChange: e => setF("description", e.target.value),
    placeholder: "\u8AAC\u660E\uFF08\u4EFB\u610F\uFF09",
    style: {
      ...inp,
      marginBottom: 8
    }
  }), /*#__PURE__*/React.createElement("input", {
    value: form.url,
    onChange: e => setF("url", e.target.value),
    placeholder: "URL\uFF08\u30D5\u30A1\u30A4\u30EB\u3092\u9078\u3076\u3068\u81EA\u52D5\u3067\u5165\u308A\u307E\u3059\uFF09",
    style: {
      ...inp,
      marginBottom: 10,
      fontSize: 12
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
  }), "\u4E00\u89A7\u306B\u8868\u793A\u3059\u308B"), /*#__PURE__*/React.createElement("button", {
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
      fontSize: 12,
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
  }, "\u767B\u9332\u6E08\u307F\uFF08", list.length, "\uFF09"), /*#__PURE__*/React.createElement("button", {
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
  }, "\u8AAD\u307F\u8FBC\u307F\u4E2D\u2026") : list.length === 0 ? /*#__PURE__*/React.createElement("div", {
    style: {
      textAlign: "center",
      color: "var(--faint)",
      padding: "32px 0",
      fontSize: 13
    }
  }, "\u307E\u3060\u767B\u9332\u304C\u3042\u308A\u307E\u305B\u3093") : /*#__PURE__*/React.createElement("div", {
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
      fontSize: 12,
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
      fontSize: 12,
      fontWeight: 800,
      color: "var(--primary-soft)",
      textDecoration: "none",
      flexShrink: 0
    }
  }, "\u958B\u304F")), /*#__PURE__*/React.createElement("div", {
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
      fontSize: 12,
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
      fontSize: 12,
      fontWeight: 800,
      cursor: i === 0 ? "default" : "pointer"
    }
  }, "\u2191"), /*#__PURE__*/React.createElement("button", {
    onClick: () => move(r, 1),
    disabled: i === list.length - 1,
    style: {
      border: "1px solid var(--line)",
      background: "#fff",
      color: i === list.length - 1 ? "var(--faint)" : "var(--text)",
      borderRadius: 7,
      padding: "5px 10px",
      fontSize: 12,
      fontWeight: 800,
      cursor: i === list.length - 1 ? "default" : "pointer"
    }
  }, "\u2193"), /*#__PURE__*/React.createElement("button", {
    onClick: () => del(r),
    style: {
      marginLeft: "auto",
      border: "1px solid #f0c8c4",
      background: "#fff",
      color: "#b3261e",
      borderRadius: 7,
      padding: "5px 11px",
      fontSize: 12,
      fontWeight: 800,
      cursor: "pointer"
    }
  }, "\u524A\u9664"))))));
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
  }, /*#__PURE__*/React.createElement("span", null, label), /*#__PURE__*/React.createElement("span", null, n, "\u4EF6\uFF08", total ? Math.round(n / total * 100) : 0, "%\uFF09")), /*#__PURE__*/React.createElement("div", {
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
  }, "\u76F4\u8FD1", total, "\u4EF6\u306E\u30A2\u30AF\u30BB\u30B9\u306E\u5185\u8A33\u3067\u3059\uFF08\u540C\u3058\u7AEF\u672B\u306F1\u65E51\u56DE\u307E\u3067\u96C6\u8A08\uFF09\u3002", /*#__PURE__*/React.createElement("br", null), "\u500B\u4EBA\u306F\u7279\u5B9A\u3057\u3066\u3044\u307E\u305B\u3093\u3002"), /*#__PURE__*/React.createElement("button", {
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
  }, "\u8AAD\u307F\u8FBC\u307F\u4E2D\u2026") : total === 0 ? /*#__PURE__*/React.createElement("div", {
    style: {
      textAlign: "center",
      color: "var(--faint)",
      padding: "40px 0",
      fontSize: 13,
      lineHeight: 1.8
    }
  }, "\u307E\u3060\u8A18\u9332\u304C\u3042\u308A\u307E\u305B\u3093\u3002") : /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 13,
      fontWeight: 900,
      color: "var(--ink)",
      marginBottom: 10
    }
  }, "\u6A5F\u7A2E"), platforms.map(([k, n]) => /*#__PURE__*/React.createElement(Bar, {
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
  }, "\u30D6\u30E9\u30A6\u30B6"), browsers.map(([k, n]) => /*#__PURE__*/React.createElement(Bar, {
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
  }, "\u30DD\u30C3\u30D7\u306E\u95B2\u89A7\u30FB\u4F7F\u3063\u305F\u56DE\u6570\u30FB\u3044\u3044\u306D\u306E\u8A18\u9332\u3067\u3059\u3002", /*#__PURE__*/React.createElement("br", null), "\u300C\u6700\u8FD1\u300D\u306F\u76F4\u8FD1", days, "\u65E5\u3067\u3088\u304F\u898B\u3089\u308C\u305F\u30DD\u30C3\u30D7\u3067\u3059\u3002"), /*#__PURE__*/React.createElement("button", {
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
      fontSize: 12,
      fontWeight: 700,
      opacity: 0.75,
      marginTop: 2
    }
  }, "\u8A08 ", totals[x.key])))), loading ? /*#__PURE__*/React.createElement("div", null, [0, 1, 2, 3, 4].map(i => /*#__PURE__*/React.createElement("div", {
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
  }, "\u307E\u3060\u8A18\u9332\u304C\u3042\u308A\u307E\u305B\u3093\u3002", /*#__PURE__*/React.createElement("br", null), "\u30DD\u30C3\u30D7\u304C\u898B\u3089\u308C\u308B\u30FB\u4F7F\u308F\u308C\u308B\u3068\u3001\u3053\u3053\u306B\u9806\u4F4D\u304C\u4E26\u3073\u307E\u3059\u3002") : ranked.map((p, i) => {
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
        fontSize: 12,
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
        fontSize: 11.5,
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

// ポップの縦横をまとめて測る（並べ方を最初から正しくするため・一度だけでよい）
function DimsBackfill() {
  const [st, setSt] = useState({
    busy: false,
    done: 0,
    total: 0,
    msg: ""
  });
  const run = async () => {
    setSt({
      busy: true,
      done: 0,
      total: 0,
      msg: "まだ測っていないものを探しています…"
    });
    try {
      const all = await api.listAll();
      const todo = (all || []).filter(p => !p.img_w && p.image_url);
      if (!todo.length) {
        setSt({
          busy: false,
          done: 0,
          total: 0,
          msg: "すべて測り終わっています"
        });
        return;
      }
      let n = 0;
      for (const p of todo) {
        const d = await api.measureImage(p.image_url);
        if (d && d.w && d.h) await api.setPopDims(p.id, d.w, d.h);
        n++;
        if (n % 5 === 0 || n === todo.length) setSt({
          busy: true,
          done: n,
          total: todo.length,
          msg: ""
        });
      }
      setSt({
        busy: false,
        done: n,
        total: todo.length,
        msg: `${n}件を測りました。一覧を開き直すと反映されます`
      });
    } catch (e) {
      setSt({
        busy: false,
        done: 0,
        total: 0,
        msg: "うまくいきませんでした"
      });
    }
  };
  return /*#__PURE__*/React.createElement("div", {
    style: {
      background: "var(--card, #fff)",
      border: "1px solid var(--line)",
      borderRadius: 12,
      padding: "14px 15px",
      marginBottom: 16
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 14,
      fontWeight: 900,
      color: "var(--ink)",
      marginBottom: 4
    }
  }, "\u30DD\u30C3\u30D7\u306E\u7E26\u9577\u30FB\u6A2A\u9577\u3092\u6E2C\u308B"), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 12,
      color: "var(--sub)",
      lineHeight: 1.8,
      marginBottom: 10
    }
  }, "\u4E00\u89A7\u3067\u6A2A\u9577\u306E\u30DD\u30C3\u30D7\u30922\u5217\u3076\u3093\u306E\u5E45\u3067\u4E26\u3079\u308B\u305F\u3081\u306B\u3001\u5F62\u3092\u8A18\u9332\u3057\u307E\u3059\u3002\u4E00\u5EA6\u3084\u308C\u3070\u5341\u5206\u3067\u3059\uFF08\u65B0\u3057\u3044\u6295\u7A3F\u306F\u81EA\u52D5\u3067\u8A18\u9332\u3055\u308C\u307E\u3059\uFF09\u3002"), /*#__PURE__*/React.createElement("button", {
    onClick: run,
    disabled: st.busy,
    style: {
      width: "100%",
      border: "none",
      background: st.busy ? "#ccc" : "var(--primary)",
      color: "#fff",
      borderRadius: 10,
      padding: "12px",
      fontSize: 14,
      fontWeight: 900,
      cursor: "pointer"
    }
  }, st.busy ? st.total ? `測っています… ${st.done} / ${st.total}` : "準備しています…" : "まとめて測る"), st.msg && /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 12.5,
      fontWeight: 800,
      color: "var(--sub)",
      marginTop: 9,
      textAlign: "center"
    }
  }, st.msg));
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