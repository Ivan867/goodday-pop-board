/* Nexus共有 — 18-tab-support （店舗支援：画像を上げて見るだけ） */
var {
  useState,
  useEffect,
  useCallback,
  useRef
} = React;

// 番号で入る。消す機能は付けない（上げる・見る・落とすだけ）
// 番号はファイルに書かない。サーバー側（check_secret_limited）で照合する（2026-10-10）
const SUPPORT_CAT = "店舗支援";
const SUPPORT_TRASH = "店舗支援ゴミ箱"; // 消したものの行き先
const SUPPORT_DAYS = 3; // 上げてから何日で消えるか
const SUPPORT_MS = SUPPORT_DAYS * 24 * 60 * 60 * 1000;

// あと何日で消えるか
function supportLeft(created) {
  const ms = SUPPORT_MS - (Date.now() - new Date(created).getTime());
  if (ms <= 0) return null;
  return Math.ceil(ms / (24 * 60 * 60 * 1000));
}
function SupportTab() {
  const [開いた, set開いた] = useState(() => {
    try {
      return sessionStorage.getItem("supportOpen") === "1";
    } catch (e) {
      return false;
    }
  });
  const [番号, set番号] = useState("");
  const [誤り, set誤り] = useState("");
  const [照合中, set照合中] = useState(false);
  const ひらく = async () => {
    if (!番号.trim() || 照合中) return;
    set照合中(true);
    set誤り("");
    try {
      const r = await api.verifyPasswordEx("support", 番号.trim());
      if (r.ok) {
        set開いた(true);
        try {
          sessionStorage.setItem("supportOpen", "1");
        } catch (e) {}
      } else {
        set誤り(r.locked ? `まちがいが続いたので、${api.lockText(r.seconds)}ほど待ってください` : "番号が違います");
        set番号("");
      }
    } catch (e) {
      set誤り("電波を確かめて、もう一度押してください");
    } finally {
      set照合中(false);
    }
  };

  // 開いたら、まず資料。塩干発注と画像の共有は下の小さな入口から
  const [どれ, setどれ] = useState("docs");
  const 選ぶ = k => {
    setどれ(k);
    try {
      window.scrollTo(0, 0);
      const 面 = document.getElementById("app-scroll");
      if (面) 面.scrollTop = 0;
    } catch (e) {}
  };

  // ── 番号を入れるまでは、中に何があるかも出さない ──
  if (!開いた) {
    return /*#__PURE__*/React.createElement("div", {
      style: {
        maxWidth: 420,
        margin: "0 auto",
        padding: "20px 20px 120px"
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
      value: 番号,
      autoFocus: true,
      inputMode: "numeric",
      type: "password",
      onChange: e => {
        set番号(e.target.value);
        set誤り("");
      },
      onKeyDown: e => {
        if (e.key === "Enter") ひらく();
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
        marginBottom: 誤り ? 8 : 16
      }
    }), 誤り && /*#__PURE__*/React.createElement("div", {
      style: {
        fontSize: 13,
        color: "#b3261e",
        fontWeight: 700,
        marginBottom: 12
      }
    }, 誤り), /*#__PURE__*/React.createElement("button", {
      onClick: ひらく,
      disabled: 照合中,
      style: {
        width: "100%",
        border: "none",
        background: "var(--fill)",
        color: "#fff",
        borderRadius: 10,
        padding: "13px",
        fontSize: 15,
        fontWeight: 800,
        cursor: "pointer",
        opacity: 照合中 ? 0.6 : 1
      }
    }, 照合中 ? "確かめています…" : "ひらく")));
  }

  // ── 番号のあと：資料が主役。ほかの2つは下に小さく ──
  const 戻る = /*#__PURE__*/React.createElement("div", {
    style: {
      maxWidth: 1100,
      margin: "0 auto",
      padding: "8px 16px 0"
    }
  }, /*#__PURE__*/React.createElement("button", {
    onClick: () => 選ぶ("docs"),
    style: {
      border: "1px solid var(--line)",
      background: "var(--card)",
      color: "var(--text)",
      borderRadius: 10,
      padding: "9px 14px",
      fontSize: 13,
      fontWeight: 800,
      cursor: "pointer",
      fontFamily: "inherit",
      marginBottom: 12
    }
  }, "\u2039 \u8CC7\u6599\u3078\u623B\u308B"));
  // 塩干発注は、この先で店舗ごとの番号に分かれる（お店によって中身が違うため）
  // 塩干発注は 2026-10-10 に試作システムへ移した
  // 画像の共有は 2026-10-06 にやめた
  // 試作システムは 2026-10-10 に店舗支援の中へ移した。開くときは今までどおり試作システムの番号を聞く
  if (どれ === "lab") return /*#__PURE__*/React.createElement("div", null, 戻る, React.createElement(LazyTab, {
    tabKey: "lab"
  }));
  return /*#__PURE__*/React.createElement(SupportDocs, {
    選ぶ: 選ぶ
  });
}

// 店舗支援の資料。管理画面で「表示」にしたものだけを並べる
function SupportDocs({
  選ぶ
}) {
  const [一覧, set一覧] = useState(null);
  const [失敗, set失敗] = useState(false);
  const 読む = useCallback(async () => {
    set失敗(false);
    try {
      set一覧((await api.listResources(true)) || []);
    } catch (e) {
      set失敗(true);
      set一覧([]);
    }
  }, []);
  useEffect(() => {
    読む();
  }, [読む]);
  const 小入口 = (k, 題, 説明, 絵) => /*#__PURE__*/React.createElement("button", {
    onClick: () => 選ぶ(k),
    className: "sup-mini"
  }, /*#__PURE__*/React.createElement("span", {
    className: "sup-mini-ic",
    "aria-hidden": "true"
  }, 絵), /*#__PURE__*/React.createElement("span", {
    style: {
      minWidth: 0,
      textAlign: "left"
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      display: "block",
      fontSize: 13.5,
      fontWeight: 900,
      color: "var(--ink)"
    }
  }, 題), /*#__PURE__*/React.createElement("span", {
    style: {
      display: "block",
      fontSize: 11.5,
      color: "var(--sub)",
      marginTop: 1
    }
  }, 説明)), /*#__PURE__*/React.createElement("span", {
    style: {
      marginLeft: "auto",
      color: "var(--sub)",
      fontSize: 18
    },
    "aria-hidden": "true"
  }, "\u203A"));
  return /*#__PURE__*/React.createElement("div", {
    style: {
      maxWidth: 1100,
      margin: "0 auto",
      padding: "8px 16px 130px"
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 12.5,
      color: "var(--sub)",
      margin: "6px 0 12px"
    }
  }, "\u8CC7\u6599\u3092\u62BC\u3059\u3068\u958B\u304D\u307E\u3059\u3002"), 一覧 === null ? /*#__PURE__*/React.createElement("div", {
    className: "res-grid"
  }, [0, 1, 2, 3].map(i => /*#__PURE__*/React.createElement("div", {
    key: i,
    className: "res-card"
  }, /*#__PURE__*/React.createElement("div", {
    className: "res-thumb sk"
  }), /*#__PURE__*/React.createElement("div", {
    className: "res-body"
  }, /*#__PURE__*/React.createElement("div", {
    className: "sk",
    style: {
      height: 12,
      width: "70%",
      borderRadius: 6,
      marginBottom: 8
    }
  }))))) : 失敗 ? /*#__PURE__*/React.createElement("div", {
    style: {
      textAlign: "center",
      padding: "40px 0"
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 14,
      fontWeight: 800,
      color: "var(--ink)"
    }
  }, "\u8CC7\u6599\u3092\u8AAD\u307F\u8FBC\u3081\u307E\u305B\u3093\u3067\u3057\u305F"), /*#__PURE__*/React.createElement("button", {
    onClick: 読む,
    style: {
      marginTop: 12,
      border: "none",
      background: "var(--fill)",
      color: "#fff",
      borderRadius: 10,
      padding: "10px 20px",
      fontSize: 14,
      fontWeight: 900,
      cursor: "pointer",
      fontFamily: "inherit"
    }
  }, "\u3082\u3046\u4E00\u5EA6\u8AAD\u307F\u8FBC\u3080")) : 一覧.length === 0 ? /*#__PURE__*/React.createElement("div", {
    style: {
      textAlign: "center",
      color: "var(--sub)",
      padding: "40px 0",
      fontSize: 13,
      lineHeight: 1.8
    }
  }, "\u307E\u3060\u8CC7\u6599\u304C\u3042\u308A\u307E\u305B\u3093\u3002", /*#__PURE__*/React.createElement("br", null), "\u7BA1\u7406\u753B\u9762\u306E\u300C\u8CC7\u6599\u300D\u3067\u8FFD\u52A0\u3057\u3001\u300C\u8868\u793A\u300D\u306B\u3059\u308B\u3068\u3001\u3053\u3053\u306B\u4E26\u3073\u307E\u3059\u3002") : /*#__PURE__*/React.createElement("div", {
    className: "res-grid"
  }, 一覧.map(r => /*#__PURE__*/React.createElement("a", {
    key: r.id,
    href: r.url,
    target: "_blank",
    rel: "noopener noreferrer",
    className: "res-card sup-doc",
    "aria-label": r.title + "を開く"
  }, /*#__PURE__*/React.createElement("span", {
    className: "res-thumb"
  }, typeof 資料の絵 === "function" ? /*#__PURE__*/React.createElement(資料の絵, {
    r: r
  }) : null, /*#__PURE__*/React.createElement("span", {
    className: "res-kind",
    style: {
      background: typeof 資料の色 === "function" ? 資料の色(r.kind) : "#59636f"
    }
  }, typeof 資料の名 === "function" ? 資料の名(r.kind) : "資料")), /*#__PURE__*/React.createElement("span", {
    className: "res-body",
    style: {
      display: "block",
      paddingBottom: 12
    }
  }, /*#__PURE__*/React.createElement("span", {
    className: "res-title",
    style: {
      display: "block"
    }
  }, r.title), r.description && /*#__PURE__*/React.createElement("span", {
    className: "res-desc",
    style: {
      display: "block"
    }
  }, r.description))))), /*#__PURE__*/React.createElement("div", {
    style: {
      marginTop: 28
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 12.5,
      fontWeight: 600,
      color: "var(--sub)",
      margin: "0 2px 8px"
    }
  }, "\u8A66\u4F5C\u4E2D\u306E\u9053\u5177"), 小入口("lab", "試作システム", "読み込み・伝票検算・バーコード・塩干発注（別の番号が要ります）", /*#__PURE__*/React.createElement("svg", {
    width: "20",
    height: "20",
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: "1.75",
    strokeLinecap: "round",
    strokeLinejoin: "round"
  }, /*#__PURE__*/React.createElement("path", {
    d: "M9.5 3v6.2L4.8 17a2 2 0 001.7 3h11a2 2 0 001.7-3l-4.7-7.8V3"
  }), /*#__PURE__*/React.createElement("path", {
    d: "M8.5 3h7M8 14h8"
  })))));
}
function SupportPhotos() {
  const [list, setList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(0); // 何枚目を上げているか
  const [total, setTotal] = useState(0);
  const [open, setOpen] = useState(null); // 拡大して見ている画像
  const fileRef = useRef(null);
  const load = useCallback(async () => {
    setLoading(true);
    try {
      const all = (await api.listFloorPhotos(null, SUPPORT_CAT)) || [];
      const limit = Date.now() - SUPPORT_MS;
      setList(all.filter(p => new Date(p.created_at).getTime() > limit));
      // 期限の切れたものは、この場で本当に消す（画像そのものも）
      for (const d of all.filter(p => new Date(p.created_at).getTime() <= limit)) {
        try {
          await api.deleteFloorPhoto(d.id);
          await api.deleteStoredImage(d.image_url);
        } catch (e) {}
      }
    } catch (e) {
      setList([]);
    }
    setLoading(false);
  }, []);
  useEffect(() => {
    load();
  }, [load]);
  const toTrash = async p => {
    if (!window.confirm("この画像を消します。管理画面のゴミ箱に入ります。")) return;
    try {
      await api.insertFloorPhoto({
        store_name: p.store_name || "共有",
        category: SUPPORT_TRASH,
        image_url: p.image_url,
        comment: p.comment || "",
        author: p.author || "",
        created_at: p.created_at
      });
      await api.deleteFloorPhoto(p.id);
      setList(v => v.filter(x => x.id !== p.id));
    } catch (err) {/* 失敗は赤いお知らせが出る */}
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

  // ── 本体 ──
  return /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
    style: {
      maxWidth: 1100,
      margin: "0 auto",
      padding: "0 16px 120px"
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
  })), "\u753B\u50CF\u3092\u4E0A\u3052\u308B")), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 12,
      color: "var(--sub)",
      lineHeight: 1.8,
      marginBottom: 12,
      textAlign: "center"
    }
  }, "\u4E0A\u3052\u305F\u753B\u50CF\u306F", SUPPORT_DAYS, "\u65E5\u3067\u81EA\u52D5\u7684\u306B\u6D88\u3048\u307E\u3059"), loading ? /*#__PURE__*/React.createElement("div", {
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
  }, list.map(p => /*#__PURE__*/React.createElement("div", {
    key: p.id,
    style: {
      border: "1px solid var(--line)",
      background: "var(--card, #fff)",
      borderRadius: 12,
      overflow: "hidden"
    }
  }, /*#__PURE__*/React.createElement("button", {
    onClick: () => setOpen(p),
    style: {
      border: "none",
      background: "transparent",
      padding: 0,
      cursor: "pointer",
      display: "block",
      width: "100%"
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
      display: "flex",
      alignItems: "center",
      gap: 6,
      fontSize: 11.5,
      color: "var(--sub)",
      padding: "7px 8px",
      textAlign: "left"
    }
  }, /*#__PURE__*/React.createElement("span", null, formatDate ? formatDate(p.created_at) : String(p.created_at || "").slice(0, 10)), (() => {
    const d = supportLeft(p.created_at);
    return d == null ? null : /*#__PURE__*/React.createElement("span", {
      style: {
        marginLeft: "auto",
        background: "var(--soft)",
        color: "var(--soft-text)",
        borderRadius: 6,
        padding: "2px 6px",
        fontSize: 11,
        fontWeight: 800,
        whiteSpace: "nowrap"
      }
    }, "\u3042\u3068", d, "\u65E5");
  })())), /*#__PURE__*/React.createElement("div", {
    style: {
      padding: "0 8px 8px"
    }
  }, /*#__PURE__*/React.createElement("button", {
    onClick: () => toTrash(p),
    style: {
      width: "100%",
      border: "1px solid var(--line)",
      background: "transparent",
      color: "var(--sub)",
      borderRadius: 8,
      padding: "7px",
      fontSize: 12.5,
      fontWeight: 800,
      cursor: "pointer"
    }
  }, "\u6D88\u3059"))))), open && /*#__PURE__*/React.createElement("div", {
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
      background: "var(--fill)",
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
  }, "\u3068\u3058\u308B")))));
}
;
Object.assign(window, {
  SupportTab
});