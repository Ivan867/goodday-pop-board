/* GoodDay 鮮魚共有 — 09-tab-info （自動分割・window共有） */
var {
  useState,
  useEffect,
  useCallback,
  useRef
} = React;
function PromptCard({
  it,
  accent,
  onDelete
}) {
  const [copied, setCopied] = useState(false);
  const [open, setOpen] = useState(false);
  const longText = (it.prompt || "").length > 180;
  const copy = () => {
    const t = it.prompt || "";
    const done = () => {
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    };
    const fb = () => {
      const ta = document.createElement("textarea");
      ta.value = t;
      document.body.appendChild(ta);
      ta.select();
      try {
        document.execCommand("copy");
      } catch (e) {}
      document.body.removeChild(ta);
      done();
    };
    if (navigator.clipboard && navigator.clipboard.writeText) navigator.clipboard.writeText(t).then(done).catch(fb);else fb();
  };
  return /*#__PURE__*/React.createElement("div", {
    style: {
      background: "white",
      borderRadius: 16,
      boxShadow: "0 2px 12px rgba(0,0,0,0.07)",
      marginBottom: 16,
      overflow: "hidden"
    }
  }, it.image_url && /*#__PURE__*/React.createElement("img", {
    src: it.image_url,
    alt: "",
    onClick: () => setOpen(o => !o),
    style: {
      width: "100%",
      maxHeight: open ? "none" : 340,
      objectFit: "cover",
      display: "block",
      cursor: "zoom-in"
    }
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      padding: "13px 15px 15px"
    }
  }, it.title && /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 15,
      fontWeight: 800,
      color: "var(--ink)",
      marginBottom: 9
    }
  }, it.title), /*#__PURE__*/React.createElement("div", {
    style: {
      position: "relative",
      background: "var(--bg)",
      border: "1px solid var(--line)",
      borderRadius: 10,
      padding: "11px 12px",
      fontSize: 13,
      lineHeight: 1.6,
      color: "var(--ink)",
      whiteSpace: "pre-wrap",
      wordBreak: "break-word",
      maxHeight: open ? "none" : 150,
      overflow: "hidden"
    }
  }, it.prompt, !open && longText && /*#__PURE__*/React.createElement("div", {
    style: {
      position: "absolute",
      left: 0,
      right: 0,
      bottom: 0,
      height: 42,
      background: "linear-gradient(transparent,#f7f7fa)"
    }
  })), longText && /*#__PURE__*/React.createElement("button", {
    onClick: () => setOpen(o => !o),
    style: {
      border: "none",
      background: "none",
      color: "var(--sub)",
      fontSize: 12,
      fontWeight: 700,
      cursor: "pointer",
      marginTop: 6,
      padding: 0
    }
  }, open ? "閉じる" : "全文を見る"), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      alignItems: "center",
      gap: 12,
      marginTop: 11
    }
  }, /*#__PURE__*/React.createElement("button", {
    onClick: copy,
    style: {
      flex: 1,
      border: "none",
      background: copied ? "#2f6fb0" : accent,
      color: "#fff",
      borderRadius: 10,
      padding: "10px",
      fontSize: 14,
      fontWeight: 800,
      cursor: "pointer"
    }
  }, copied ? "✓ コピーしました" : "プロンプトをコピー"), /*#__PURE__*/React.createElement("button", {
    onClick: onDelete,
    style: {
      border: "none",
      background: "none",
      color: "var(--faint)",
      fontSize: 13,
      fontWeight: 700,
      cursor: "pointer"
    }
  }, "削除")), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 11,
      color: "var(--sub)",
      marginTop: 8
    }
  }, it.author || "匿名")));
}
function PromptAddModal({
  accent,
  onClose,
  onPosted
}) {
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [title, setTitle] = useState("");
  const [ptext, setPtext] = useState("");
  const [author, setAuthor] = useState("");
  const [busy, setBusy] = useState(false);
  const input = {
    width: "100%",
    boxSizing: "border-box",
    padding: "11px 13px",
    border: "1px solid #e2e2e6",
    borderRadius: 10,
    fontSize: 14,
    outline: "none",
    marginBottom: 11
  };
  const pick = f => {
    if (!f) return;
    setFile(f);
    setPreview(URL.createObjectURL(f));
  };
  const submit = async () => {
    if (!ptext.trim()) {
      alert("プロンプトを入力してください");
      return;
    }
    setBusy(true);
    try {
      let image_url = null;
      if (file) image_url = await api.upload(file);
      const row = await api.insertPrompt({
        title: title.trim(),
        prompt: ptext.trim(),
        image_url,
        author: author.trim() || "匿名"
      });
      onPosted(row);
    } catch (e) {
      alert("保存に失敗しました");
      setBusy(false);
    }
  };
  return /*#__PURE__*/React.createElement("div", {
    onClick: onClose,
    style: {
      position: "fixed",
      inset: 0,
      background: "rgba(0,0,0,0.45)",
      zIndex: 1000,
      display: "flex",
      alignItems: "flex-end"
    }
  }, /*#__PURE__*/React.createElement("div", {
    onClick: e => e.stopPropagation(),
    style: {
      background: "#fff",
      width: "100%",
      borderRadius: "20px 20px 0 0",
      padding: "10px 18px calc(20px + env(safe-area-inset-bottom))",
      maxHeight: "90vh",
      overflowY: "auto",
      animation: "sheetUp 0.28s ease"
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      width: 40,
      height: 4,
      background: "#ddd",
      borderRadius: 2,
      margin: "6px auto 14px"
    }
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 16,
      fontWeight: 900,
      color: "var(--ink)",
      marginBottom: 14
    }
  }, "プロンプトを追加"), /*#__PURE__*/React.createElement("label", {
    style: {
      display: "block",
      border: "2px dashed #d8d8e0",
      borderRadius: 12,
      padding: preview ? 0 : "22px",
      textAlign: "center",
      cursor: "pointer",
      overflow: "hidden",
      marginBottom: 13
    }
  }, preview ? /*#__PURE__*/React.createElement("img", {
    src: preview,
    alt: "",
    style: {
      width: "100%",
      display: "block"
    }
  }) : /*#__PURE__*/React.createElement("div", {
    style: {
      color: "var(--sub)",
      fontWeight: 700
    }
  }, "画像を選ぶ（任意）"), /*#__PURE__*/React.createElement("input", {
    type: "file",
    accept: "image/*",
    onChange: e => pick(e.target.files[0]),
    style: {
      display: "none"
    }
  })), /*#__PURE__*/React.createElement("input", {
    value: title,
    onChange: e => setTitle(e.target.value),
    placeholder: "タイトル（例：刺身盛り 縦POP）",
    style: input
  }), /*#__PURE__*/React.createElement("textarea", {
    value: ptext,
    onChange: e => setPtext(e.target.value),
    placeholder: "使ったプロンプトをここに貼り付け",
    rows: 6,
    style: {
      ...input,
      resize: "vertical",
      fontFamily: "inherit",
      lineHeight: 1.6
    }
  }), /*#__PURE__*/React.createElement("input", {
    value: author,
    onChange: e => setAuthor(e.target.value),
    placeholder: "お名前（任意）",
    style: input
  }), /*#__PURE__*/React.createElement("button", {
    onClick: submit,
    disabled: busy,
    style: {
      width: "100%",
      border: "none",
      background: busy ? "#bbb" : accent,
      color: "#fff",
      borderRadius: 12,
      padding: "13px",
      fontSize: 15,
      fontWeight: 800,
      cursor: busy ? "default" : "pointer",
      marginTop: 4
    }
  }, busy ? "保存中…" : "保存する")));
}
function PromptGuide({
  accent
}) {
  const sec = {
    background: "white",
    borderRadius: 16,
    boxShadow: "0 2px 12px rgba(0,0,0,0.07)",
    padding: "16px 18px",
    marginBottom: 14
  };
  const hd = {
    fontSize: 15,
    fontWeight: 900,
    color: "var(--ink)",
    marginBottom: 10
  };
  const p = {
    fontSize: 13.5,
    lineHeight: 1.8,
    color: "var(--text)",
    margin: "0 0 10px"
  };
  const tag = {
    display: "inline-block",
    background: "#f1edff",
    color: accent,
    fontWeight: 700,
    fontSize: 12.5,
    borderRadius: 7,
    padding: "3px 9px",
    margin: "0 6px 6px 0"
  };
  return /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
    style: sec
  }, /*#__PURE__*/React.createElement("div", {
    style: hd
  }, "プロンプトの読み解き方"), /*#__PURE__*/React.createElement("p", {
    style: p
  }, "良いプロンプトを見つけたら、次の要素に分解すると「どこを変えれば自分用になるか」が見えます。コピーした文を、この単位で書き換えていくのがコツです。"), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("span", {
    style: tag
  }, "被写体（何を）"), /*#__PURE__*/React.createElement("span", {
    style: tag
  }, "構図・アングル"), /*#__PURE__*/React.createElement("span", {
    style: tag
  }, "ライティング（光）"), /*#__PURE__*/React.createElement("span", {
    style: tag
  }, "質感・素材"), /*#__PURE__*/React.createElement("span", {
    style: tag
  }, "背景"), /*#__PURE__*/React.createElement("span", {
    style: tag
  }, "色味・雰囲気"), /*#__PURE__*/React.createElement("span", {
    style: tag
  }, "文字・レイアウト"), /*#__PURE__*/React.createElement("span", {
    style: tag
  }, "仕上げ（縦横比・解像度）")), /*#__PURE__*/React.createElement("p", {
    style: {
      ...p,
      margin: "10px 0 0"
    }
  }, "例：「まぐろの刺身（被写体）を / 真上から（アングル）/ 柔らかい自然光で（光）/ 黒い石の皿に（背景）/ 高級感のある雰囲気で（色味）/ 縦A4（仕上げ）」のように、( )の部分だけ自分の商品に差し替えれば再利用できます。")), /*#__PURE__*/React.createElement("div", {
    style: sec
  }, /*#__PURE__*/React.createElement("div", {
    style: hd
  }, "画像を再利用する手順"), /*#__PURE__*/React.createElement("p", {
    style: p
  }, "1. 記録集から、近いイメージの画像と「プロンプトをコピー」。"), /*#__PURE__*/React.createElement("p", {
    style: p
  }, "2. GeminiやChatGPTに、その画像を一緒に添付する（「この画像を参考に」と伝える）。"), /*#__PURE__*/React.createElement("p", {
    style: p
  }, "3. コピーしたプロンプトを貼り、変えたい所だけ書き換える。よく使う指示："), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("span", {
    style: tag
  }, "商品だけ差し替え"), /*#__PURE__*/React.createElement("span", {
    style: tag
  }, "背景だけ変更"), /*#__PURE__*/React.createElement("span", {
    style: tag
  }, "色味はそのまま"), /*#__PURE__*/React.createElement("span", {
    style: tag
  }, "文字を入れる/消す"), /*#__PURE__*/React.createElement("span", {
    style: tag
  }, "縦→横にする"), /*#__PURE__*/React.createElement("span", {
    style: tag
  }, "同じ構図で")), /*#__PURE__*/React.createElement("p", {
    style: {
      ...p,
      margin: "10px 0 0"
    }
  }, "「この画像の構図・雰囲気はそのままで、商品を〇〇に変えて」と伝えると、雰囲気を保ったまま中身だけ差し替えられます。")), /*#__PURE__*/React.createElement("div", {
    style: sec
  }, /*#__PURE__*/React.createElement("div", {
    style: hd
  }, "うまくいくコツ"), /*#__PURE__*/React.createElement("p", {
    style: p
  }, "・POPに文字を入れる時は、画像生成では文字が崩れやすいので、文字なしで作って後から差し込むのも手。"), /*#__PURE__*/React.createElement("p", {
    style: p
  }, "・縦横比は最初に指定（縦A4／横A4）。後から変えると崩れやすい。"), /*#__PURE__*/React.createElement("p", {
    style: p
  }, "・うまくいったプロンプトは必ずこの「記録集」に画像付きで残す。次から探す手間が消えます。")));
}
function PromptTab({
  embedded
}) {
  const ACCENT = "var(--primary)";
  const [seg, setSeg] = useState("list");
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(false);
  const load = () => {
    setLoading(true);
    api.listPrompts().then(d => {
      setItems(d);
      setLoading(false);
    }).catch(() => setLoading(false));
  };
  useEffect(() => {
    load();
  }, []);
  const remove = async it => {
    const pw = prompt("削除パスワードを入力");
    if (pw === null) return;
    try {
      const ok = await api.verifyPassword("delete", pw);
      if (!ok) {
        alert("パスワードが違います");
        return;
      }
      await api.delPrompt(it.id);
      setItems(s => s.filter(x => x.id !== it.id));
    } catch (e) {
      alert("削除に失敗しました");
    }
  };
  const segBtn = (k, label) => /*#__PURE__*/React.createElement("button", {
    onClick: () => setSeg(k),
    style: {
      flex: 1,
      border: "none",
      background: "none",
      padding: "11px 0",
      fontSize: 14,
      fontWeight: seg === k ? 800 : 600,
      color: seg === k ? ACCENT : "#999",
      borderBottom: seg === k ? `2.5px solid ${ACCENT}` : "2.5px solid transparent",
      cursor: "pointer"
    }
  }, label);
  return /*#__PURE__*/React.createElement("div", {
    style: {
      maxWidth: 760,
      margin: "0 auto",
      padding: embedded ? "10px 16px 84px" : "16px 16px 84px"
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      marginBottom: 16,
      borderBottom: "1px solid var(--line)"
    }
  }, segBtn("list", "プロンプト記録集"), segBtn("guide", "手引き")), seg === "list" ? /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("button", {
    onClick: () => setShowAdd(true),
    style: {
      width: "100%",
      border: "none",
      background: ACCENT,
      color: "#fff",
      borderRadius: 12,
      padding: "13px",
      fontSize: 15,
      fontWeight: 800,
      cursor: "pointer",
      marginBottom: 16
    }
  }, "＋ プロンプトを追加"), loading ? /*#__PURE__*/React.createElement("div", {
    style: {
      textAlign: "center",
      color: "var(--faint)",
      padding: "40px 0"
    }
  }, "読み込み中…") : items.length === 0 ? /*#__PURE__*/React.createElement("div", {
    style: {
      textAlign: "center",
      color: "var(--faint)",
      padding: "40px 16px",
      fontSize: 13.5,
      lineHeight: 1.8
    }
  }, "まだ登録がありません。", /*#__PURE__*/React.createElement("br", null), "うまくいった画像とプロンプトを「＋ プロンプトを追加」から残しておくと、次から再利用できます。") : items.map(it => /*#__PURE__*/React.createElement(PromptCard, {
    key: it.id,
    it: it,
    accent: ACCENT,
    onDelete: () => remove(it)
  }))) : /*#__PURE__*/React.createElement(PromptGuide, {
    accent: ACCENT
  }), showAdd && /*#__PURE__*/React.createElement(PromptAddModal, {
    accent: ACCENT,
    onClose: () => setShowAdd(false),
    onPosted: row => {
      setItems(s => [row, ...s]);
      setShowAdd(false);
    }
  }));
}
function TodayInfoCard() {
  const [wx, setWx] = useState(null);
  const [warns, setWarns] = useState([]);

  // 気象庁 警報・注意報（島根県→出雲市）
  useEffect(() => {
    const WMAP = {
      "33": {
        n: "大雨特別警報",
        lv: 3
      },
      "32": {
        n: "暴風雪特別警報",
        lv: 3
      },
      "35": {
        n: "暴風特別警報",
        lv: 3
      },
      "36": {
        n: "大雪特別警報",
        lv: 3
      },
      "37": {
        n: "波浪特別警報",
        lv: 3
      },
      "38": {
        n: "高潮特別警報",
        lv: 3
      },
      "03": {
        n: "大雨警報",
        lv: 2
      },
      "02": {
        n: "暴風雪警報",
        lv: 2
      },
      "04": {
        n: "洪水警報",
        lv: 2
      },
      "05": {
        n: "暴風警報",
        lv: 2
      },
      "06": {
        n: "大雪警報",
        lv: 2
      },
      "07": {
        n: "波浪警報",
        lv: 2
      },
      "08": {
        n: "高潮警報",
        lv: 2
      },
      "10": {
        n: "大雨注意報",
        lv: 1
      },
      "12": {
        n: "大雪注意報",
        lv: 1
      },
      "13": {
        n: "風雪注意報",
        lv: 1
      },
      "14": {
        n: "雷注意報",
        lv: 1
      },
      "15": {
        n: "強風注意報",
        lv: 1
      },
      "16": {
        n: "波浪注意報",
        lv: 1
      },
      "17": {
        n: "融雪注意報",
        lv: 1
      },
      "18": {
        n: "洪水注意報",
        lv: 1
      },
      "19": {
        n: "高潮注意報",
        lv: 1
      },
      "20": {
        n: "濃霧注意報",
        lv: 1
      },
      "21": {
        n: "乾燥注意報",
        lv: 1
      },
      "22": {
        n: "なだれ注意報",
        lv: 1
      },
      "23": {
        n: "低温注意報",
        lv: 1
      },
      "24": {
        n: "霜注意報",
        lv: 1
      },
      "25": {
        n: "着氷注意報",
        lv: 1
      },
      "26": {
        n: "着雪注意報",
        lv: 1
      }
    };
    const KEY = "jmaWarnV1";
    const parse = j => {
      const out = [];
      try {
        (j.areaTypes || []).forEach(t => (t.areas || []).forEach(a => {
          if (!String(a.code).startsWith("32203")) return; // 出雲市
          (a.warnings || []).forEach(w => {
            if (w.status === "解除") return;
            const m = WMAP[w.code];
            if (m && !out.some(x => x.n === m.n)) out.push(m);
          });
        }));
      } catch (e) {}
      out.sort((a, b) => b.lv - a.lv);
      return out;
    };
    const go = retry => fetch("https://www.jma.go.jp/bosai/warning/data/warning/320000.json").then(r => r.ok ? r.json() : null).then(j => {
      if (!j) throw 0;
      const w = parse(j);
      setWarns(w);
      try {
        localStorage.setItem(KEY, JSON.stringify({
          t: Date.now(),
          w
        }));
      } catch (e) {}
    }).catch(() => {
      try {
        const c = JSON.parse(localStorage.getItem(KEY) || "null");
        if (c && Date.now() - c.t < 3600000) setWarns(c.w || []);
      } catch (e) {}
      if (retry > 0) setTimeout(() => go(retry - 1), 6000);
    });
    go(1);
  }, []);
  const [hol, setHol] = useState(null);
  useEffect(() => {
    // 気温：過去7日＋今日を取得して前日差・前週差を計算
    const WURL = "https://api.open-meteo.com/v1/forecast?latitude=35.367&longitude=132.755&daily=weather_code,temperature_2m_max,temperature_2m_min&timezone=Asia%2FTokyo&past_days=7&forecast_days=2";
    const WKEY = "wxCardV1";
    const applyWx = d => {
      if (!d || !d.daily || !d.daily.temperature_2m_max) return false;
      const t = d.daily.temperature_2m_max,
        i = t.length - 2; // i=今日, i+1=明日
      if (t[i] == null || t[i - 1] == null || t[i - 7] == null) return false;
      const mn = d.daily.temperature_2m_min || [];
      const r = v => v == null ? null : Math.round(v);
      setWx({
        today: Math.round(t[i]),
        yest: Math.round(t[i - 1]),
        dy: Math.round(t[i] - t[i - 1]),
        dw: Math.round(t[i] - t[i - 7]),
        code: d.daily.weather_code[i],
        tmMax: t[i + 1] == null ? null : Math.round(t[i + 1]),
        tmCode: d.daily.weather_code[i + 1],
        tmDiff: t[i + 1] == null ? null : Math.round(t[i + 1] - t[i]),
        tmMin: mn[i] != null ? Math.round(mn[i]) : null,
        loDiff: mn[i] != null && mn[i - 1] != null ? Math.round(mn[i]) - Math.round(mn[i - 1]) : null,
        series: [{
          label: "昨日",
          hi: r(t[i - 1]),
          lo: r(mn[i - 1])
        }, {
          label: "今日",
          hi: r(t[i]),
          lo: r(mn[i])
        }, {
          label: "明日",
          hi: r(t[i + 1]),
          lo: r(mn[i + 1])
        }]
      });
      return true;
    };
    const goWx = retry => fetch(WURL).then(r => r.ok ? r.json() : null).then(d => {
      if (applyWx(d)) {
        try {
          localStorage.setItem(WKEY, JSON.stringify({
            t: Date.now(),
            d
          }));
        } catch (e) {}
      } else throw 0;
    }).catch(() => {
      try {
        const c = JSON.parse(localStorage.getItem(WKEY) || "null");
        if (c && Date.now() - c.t < 86400000) applyWx(c.d);
      } catch (e) {}
      if (retry > 0) setTimeout(() => goWx(retry - 1), 5000);
    });
    goWx(2);
    // 祝日：holidays-jp（前年・今年・翌年分）
    fetch("https://holidays-jp.github.io/api/v1/date.json").then(r => r.ok ? r.json() : null).then(hs => {
      if (!hs) return;
      const hset = new Set(Object.keys(hs));
      const now = new Date();
      now.setHours(0, 0, 0, 0);
      const pad = n => String(n).padStart(2, "0");
      const fmt = d => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
      const todayName = hs[fmt(now)] || null;
      const dates = Object.keys(hs).filter(k => k > fmt(now)).sort();
      if (!dates.length) {
        setHol({
          todayName
        });
        return;
      }
      const next = dates[0];
      const nd = new Date(next + "T00:00:00");
      const isOff = d => {
        const w = d.getDay();
        return w === 0 || w === 6 || hset.has(fmt(d));
      };
      let bs = new Date(nd),
        be = new Date(nd);
      for (;;) {
        const q = new Date(bs);
        q.setDate(q.getDate() - 1);
        if (isOff(q)) bs = q;else break;
      }
      for (;;) {
        const q = new Date(be);
        q.setDate(q.getDate() + 1);
        if (isOff(q)) be = q;else break;
      }
      const len = Math.round((be - bs) / 86400000) + 1;
      const days = Math.round((nd - now) / 86400000);
      setHol({
        todayName,
        date: nd,
        name: hs[next],
        blockStart: bs,
        blockEnd: be,
        len,
        days
      });
    }).catch(() => {});
  }, []);
  // ハレの日（行事）：共通データ seasonalEventsFor から算出
  const events = (() => {
    const now = new Date();
    now.setHours(0, 0, 0, 0);
    const list = [...seasonalEventsFor(now.getFullYear()), ...seasonalEventsFor(now.getFullYear() + 1)];
    const todayEv = list.find(e => e.date.getTime() === now.getTime()) || null;
    const up = list.filter(e => e.date > now && (e.date - now) / 86400000 <= 60).sort((a, b) => a.date - b.date);
    return {
      todayEv,
      next: up[0] || null,
      next2: up[1] || null
    };
  })();
  const jd = d => `${d.getMonth() + 1}/${d.getDate()}`;
  const wd = d => ["日", "月", "火", "水", "木", "金", "土"][d.getDay()];
  const wmoIcon = c => {
    if (c === 0) return {
      e: "☀️",
      t: "快晴"
    };
    if (c === 1) return {
      e: "🌤",
      t: "晴れ"
    };
    if (c === 2) return {
      e: "⛅",
      t: "時々曇り"
    };
    if (c === 3) return {
      e: "☁️",
      t: "曇り"
    };
    if (c === 45 || c === 48) return {
      e: "🌫",
      t: "霧"
    };
    if (c >= 51 && c <= 57) return {
      e: "🌦",
      t: "霧雨"
    };
    if (c >= 61 && c <= 67) return {
      e: "🌧",
      t: "雨"
    };
    if (c >= 71 && c <= 77) return {
      e: "❄️",
      t: "雪"
    };
    if (c >= 80 && c <= 82) return {
      e: "🌦",
      t: "にわか雨"
    };
    if (c === 85 || c === 86) return {
      e: "🌨",
      t: "にわか雪"
    };
    if (c >= 95) return {
      e: "⛈",
      t: "雷雨"
    };
    return {
      e: "☁️",
      t: "曇り"
    };
  };
  const sign = v => v > 0 ? `+${v}°` : v < 0 ? `${v}°` : "±0°";
  const dcol = v => v > 0 ? "var(--primary)" : v < 0 ? "#4a86c5" : "#888";
  const rainy = wx && (wx.code >= 61 && wx.code <= 67 || wx.code >= 80 && wx.code <= 82 || wx.code >= 95);
  let hint = null;
  if (wx) {
    if (wx.dy >= 3) hint = "昨日よりグッと暑い日。刺身・たたき・冷たい系が動きやすい。";else if (wx.dy <= -3) hint = "昨日より涼しい日。鍋・煮付け・フライなど温か系が動きやすい。";else if (rainy) hint = "雨予報。まとめ買い・簡便系の提案が効きやすい日。";
  }
  let hintShort = "通常展開でOK";
  if (wx) {
    if (wx.dy >= 3) hintShort = "刺身・涼味を強めに";else if (wx.dy >= 1) hintShort = "刺身・涼味やや強め";else if (wx.dy <= -3) hintShort = "鍋・温か系を強めに";else if (wx.dy <= -1) hintShort = "温か系やや強め";else if (rainy) hintShort = "まとめ買い・簡便系";
  }
  const now = new Date();
  const METAL = "repeating-linear-gradient(115deg, rgba(255,255,255,0.05) 0px, rgba(255,255,255,0.05) 1px, rgba(0,0,0,0.06) 1px, rgba(0,0,0,0.06) 3px), linear-gradient(120deg, #1c3350 0%, #2f4d72 42%, #587aa6 60%, #2f4d72 78%, #1c3350 100%)";
  // 時間帯で変わる空（朝＝日の出／昼＝晴天／夕＝夕焼け／夜＝夜空）。天気が悪い日はやや暗く。
  const timeSky = (() => {
    const hr = new Date().getHours();
    const bad = wx && wx.code >= 61; // 雨・雪・雷など
    let g, emo, sun;
    if (hr >= 5 && hr < 8) {
      g = "linear-gradient(135deg,#f6b17a 0%,#fcd9a8 40%,#a9c7e0 100%)";
      emo = "🌅";
      sun = true;
    } // 朝焼け
    else if (hr >= 8 && hr < 16) {
      g = "linear-gradient(135deg,#4a9fe0 0%,#7fc0f2 55%,#bfe3f8 100%)";
      emo = "☀️";
      sun = true;
    } // 日中
    else if (hr >= 16 && hr < 19) {
      g = "linear-gradient(135deg,#e97b52 0%,#f4a261 45%,#8a6a9e 100%)";
      emo = "🌇";
      sun = true;
    } // 夕焼け
    else {
      g = "linear-gradient(160deg,#0f1e3a 0%,#1c3358 55%,#2a3f66 100%)";
      emo = "🌙";
      sun = false;
    } // 夜
    if (bad) g = "linear-gradient(135deg,#4a5a72 0%,#6a7a92 55%,#8a97ab 100%)";
    return {
      g,
      emo,
      sun
    };
  })();
  // 行事名から関連イラスト（絵文字）を選ぶ
  const eventArt = (name, food) => {
    const s = (name || "") + (food || "");
    if (/海の日|海開き/.test(s)) return "🌊";
    if (/土用|丑|うなぎ|鰻/.test(s)) return "🍱";
    if (/お盆|盆/.test(s)) return "🏮";
    if (/正月|元日|元旦/.test(s)) return "🎍";
    if (/節分/.test(s)) return "👹";
    if (/ひな|雛|桃の節句/.test(s)) return "🎎";
    if (/こどもの日|端午|子供の日/.test(s)) return "🎏";
    if (/クリスマス/.test(s)) return "🎄";
    if (/大晦日|年越し|年末/.test(s)) return "🎌";
    if (/敬老/.test(s)) return "🎁";
    if (/月見|十五夜/.test(s)) return "🌕";
    if (/バレンタイン/.test(s)) return "🍫";
    if (/花見|桜/.test(s)) return "🌸";
    if (/夏祭|祭り|花火/.test(s)) return "🎆";
    if (/母の日/.test(s)) return "🌷";
    if (/父の日/.test(s)) return "👔";
    if (/ハロウィン/.test(s)) return "🎃";
    if (/恵方巻/.test(s)) return "🍙";
    return "🗓";
  };
  // 当日の行事名（祝日 or 季節行事）
  const todayLabel = hol && hol.todayName ? hol.todayName : events.todayEv ? events.todayEv.name : "";
  const jumpCal = () => window.dispatchEvent(new CustomEvent("gotoTab", {
    detail: "calendar"
  }));
  const daysLeft = d => Math.max(0, Math.round((d - now) / 86400000));
  return /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      flexDirection: "column",
      gap: 9,
      marginBottom: 10
    }
  }, /*#__PURE__*/React.createElement("div", {
    className: "ucard",
    onClick: jumpCal,
    style: {
      background: "#fff",
      borderRadius: 16,
      padding: "13px 12px",
      cursor: "pointer"
    }
  }, (() => {
    const dcol = v => v > 0 ? "#e0555f" : v < 0 ? "#4a86c5" : "var(--sub)";
    const IconWrap = ({
      children
    }) => /*#__PURE__*/React.createElement("div", {
      style: {
        width: 40,
        height: 40,
        borderRadius: 12,
        background: "var(--soft)",
        color: "var(--primary-soft, #4a7ab0)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        flexShrink: 0
      }
    }, children);
    const trendSvg = /*#__PURE__*/React.createElement("svg", {
      width: "20",
      height: "20",
      viewBox: "0 0 24 24",
      fill: "none",
      stroke: "currentColor",
      strokeWidth: "2",
      strokeLinecap: "round",
      strokeLinejoin: "round"
    }, /*#__PURE__*/React.createElement("path", {
      d: "M3 17l6-6 4 4 7-8"
    }), /*#__PURE__*/React.createElement("path", {
      d: "M14 7h6v6"
    }));
    const calSvg = /*#__PURE__*/React.createElement("svg", {
      width: "20",
      height: "20",
      viewBox: "0 0 24 24",
      fill: "none",
      stroke: "currentColor",
      strokeWidth: "2",
      strokeLinecap: "round",
      strokeLinejoin: "round"
    }, /*#__PURE__*/React.createElement("rect", {
      x: "3",
      y: "4.5",
      width: "18",
      height: "17",
      rx: "2.5"
    }), /*#__PURE__*/React.createElement("path", {
      d: "M3 9h18M8 2.5v4M16 2.5v4"
    }));
    const bulbSvg = /*#__PURE__*/React.createElement("svg", {
      width: "20",
      height: "20",
      viewBox: "0 0 24 24",
      fill: "none",
      stroke: "currentColor",
      strokeWidth: "2",
      strokeLinecap: "round",
      strokeLinejoin: "round"
    }, /*#__PURE__*/React.createElement("path", {
      d: "M9 18h6M10 21h4"
    }), /*#__PURE__*/React.createElement("path", {
      d: "M12 3a6.5 6.5 0 00-4 11.6c.7.6 1 1.4 1 2.4h6c0-1 .3-1.8 1-2.4A6.5 6.5 0 0012 3z"
    }));
    const Cell = ({
      icon,
      label,
      children
    }) => /*#__PURE__*/React.createElement("div", {
      style: {
        flex: 1,
        minWidth: 0,
        display: "flex",
        alignItems: "center",
        gap: 9,
        padding: "0 4px"
      }
    }, /*#__PURE__*/React.createElement(IconWrap, null, icon), /*#__PURE__*/React.createElement("div", {
      style: {
        minWidth: 0
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        fontSize: 10.5,
        fontWeight: 800,
        color: "var(--sub)",
        whiteSpace: "nowrap"
      }
    }, label), /*#__PURE__*/React.createElement("div", {
      style: {
        marginTop: 2,
        whiteSpace: "nowrap",
        overflow: "hidden",
        textOverflow: "ellipsis"
      }
    }, children)));
    const Div = () => /*#__PURE__*/React.createElement("div", {
      style: {
        width: 1,
        alignSelf: "stretch",
        background: "var(--line)",
        flexShrink: 0
      }
    });
    return /*#__PURE__*/React.createElement("div", {
      style: {
        display: "flex",
        alignItems: "stretch"
      }
    }, /*#__PURE__*/React.createElement(Cell, {
      icon: trendSvg,
      label: "昨日比"
    }, wx ? /*#__PURE__*/React.createElement("span", {
      style: {
        fontSize: 13.5,
        fontWeight: 900
      }
    }, /*#__PURE__*/React.createElement("span", {
      style: {
        color: "var(--sub)",
        fontSize: 11
      }
    }, "最高 "), /*#__PURE__*/React.createElement("span", {
      style: {
        color: dcol(wx.dy)
      }
    }, sign(wx.dy)), wx.loDiff != null && /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("span", {
      style: {
        color: "var(--faint)"
      }
    }, " / "), /*#__PURE__*/React.createElement("span", {
      style: {
        color: "var(--sub)",
        fontSize: 11
      }
    }, "最低 "), /*#__PURE__*/React.createElement("span", {
      style: {
        color: dcol(wx.loDiff)
      }
    }, sign(wx.loDiff)))) : /*#__PURE__*/React.createElement("span", {
      style: {
        fontSize: 12,
        color: "var(--faint)"
      }
    }, "—")), /*#__PURE__*/React.createElement(Div, null), /*#__PURE__*/React.createElement(Cell, {
      icon: calSvg,
      label: "先週比"
    }, wx ? /*#__PURE__*/React.createElement("span", {
      style: {
        fontSize: 15,
        fontWeight: 900,
        color: dcol(wx.dw)
      }
    }, sign(wx.dw)) : /*#__PURE__*/React.createElement("span", {
      style: {
        fontSize: 12,
        color: "var(--faint)"
      }
    }, "—")), /*#__PURE__*/React.createElement(Div, null), /*#__PURE__*/React.createElement(Cell, {
      icon: bulbSvg,
      label: "売場ヒント"
    }, /*#__PURE__*/React.createElement("span", {
      style: {
        display: "inline-block",
        fontSize: 11,
        fontWeight: 900,
        color: "var(--primary)",
        background: "var(--soft)",
        borderRadius: 999,
        padding: "2px 10px",
        maxWidth: "100%",
        overflow: "hidden",
        textOverflow: "ellipsis"
      }
    }, hintShort)));
  })()), (() => {
    const up = [];
    if (hol && hol.date) up.push({
      d: hol.date,
      name: hol.name,
      food: null,
      isHol: true
    });
    if (events.next) up.push({
      d: events.next.date,
      name: events.next.name,
      food: events.next.food,
      isHol: false
    });
    up.sort((a, b) => a.d - b.d);
    if (!up.length) return null;
    const main = up[0];
    const nextItems = up.slice(1).concat(events.next2 ? [{
      d: events.next2.date,
      name: events.next2.name,
      food: events.next2.food
    }] : []);
    const art = eventArt(main.name, main.food);
    return /*#__PURE__*/React.createElement("div", {
      className: "ucard",
      onClick: jumpCal,
      style: {
        background: "#fff",
        borderRadius: 16,
        overflow: "hidden",
        cursor: "pointer"
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        display: "flex",
        alignItems: "stretch"
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        flex: 1,
        minWidth: 0,
        padding: "12px 14px"
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        display: "inline-block",
        fontSize: 10.5,
        fontWeight: 900,
        color: "var(--primary)",
        border: "1.5px solid var(--primary)",
        borderRadius: 7,
        padding: "1px 8px",
        marginBottom: 7
      }
    }, "次の販促"), /*#__PURE__*/React.createElement("div", {
      style: {
        display: "flex",
        alignItems: "center",
        gap: 10
      }
    }, /*#__PURE__*/React.createElement("span", {
      style: {
        fontSize: 30,
        flexShrink: 0
      }
    }, art), /*#__PURE__*/React.createElement("div", {
      style: {
        minWidth: 0
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        fontSize: 16,
        fontWeight: 900,
        color: "var(--ink)",
        lineHeight: 1.3
      }
    }, main.name, "\u3000", /*#__PURE__*/React.createElement("span", {
      style: {
        fontSize: 13,
        color: "var(--sub)",
        fontWeight: 800
      }
    }, jd(main.d), "（", wd(main.d), "）"), main.food ? /*#__PURE__*/React.createElement("span", {
      style: {
        fontSize: 12,
        color: "var(--sub)"
      }
    }, "〈", main.food, "〉") : null), nextItems[0] && /*#__PURE__*/React.createElement("div", {
      style: {
        fontSize: 11.5,
        color: "var(--sub)",
        fontWeight: 700,
        marginTop: 3
      }
    }, "次：", jd(nextItems[0].d), " ", nextItems[0].name)))), /*#__PURE__*/React.createElement("div", {
      style: {
        flexShrink: 0,
        width: 92,
        background: "var(--primary-soft)",
        color: "#fff",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        lineHeight: 1.1
      }
    }, /*#__PURE__*/React.createElement("span", {
      style: {
        fontSize: 11,
        fontWeight: 800,
        opacity: 0.85
      }
    }, "あと"), /*#__PURE__*/React.createElement("span", {
      style: {
        fontSize: 30,
        fontWeight: 900
      }
    }, daysLeft(main.d), /*#__PURE__*/React.createElement("span", {
      style: {
        fontSize: 14
      }
    }, "日")))), nextItems[0] && /*#__PURE__*/React.createElement("div", {
      style: {
        borderTop: "1px solid var(--line)",
        padding: "8px 14px",
        display: "flex",
        alignItems: "center",
        gap: 9
      }
    }, /*#__PURE__*/React.createElement("span", {
      style: {
        fontSize: 17,
        flexShrink: 0
      }
    }, eventArt(nextItems[0].name, nextItems[0].food)), /*#__PURE__*/React.createElement("span", {
      style: {
        fontSize: 12.5,
        fontWeight: 800,
        color: "var(--ink)",
        flex: 1,
        minWidth: 0
      }
    }, jd(nextItems[0].d), "（", wd(nextItems[0].d), "）\u3000", nextItems[0].name), /*#__PURE__*/React.createElement("span", {
      style: {
        fontSize: 12,
        fontWeight: 800,
        color: "var(--sub)"
      }
    }, "あと", daysLeft(nextItems[0].d), "日")));
  })(), (() => {
    const chips = [];
    warns.forEach(w => chips.push({
      t: (w.lv >= 2 ? "⚠️ " : "") + w.n,
      lv: w.lv
    }));
    if (!chips.length) return null;
    const shike = warns.some(w => ["波浪警報", "波浪注意報", "強風注意報", "暴風警報", "波浪特別警報", "暴風特別警報"].includes(w.n));
    return /*#__PURE__*/React.createElement("div", {
      className: "ucard",
      style: {
        background: "#fff",
        borderRadius: 16,
        padding: "11px 14px"
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        display: "flex",
        flexWrap: "wrap",
        gap: 5
      }
    }, chips.map((c, i) => /*#__PURE__*/React.createElement("span", {
      key: i,
      style: {
        fontSize: 11,
        fontWeight: 800,
        borderRadius: 8,
        padding: "3px 9px",
        background: c.lv >= 3 ? "#3b0d3f" : c.lv === 2 ? "#fdeaea" : "#fff6de",
        color: c.lv >= 3 ? "#fff" : c.lv === 2 ? "#b3261e" : "#8a6d00",
        border: c.lv >= 3 ? "none" : c.lv === 2 ? "1px solid #f3c1bd" : "1px solid #eeddad"
      }
    }, c.t))), shike && /*#__PURE__*/React.createElement("div", {
      style: {
        fontSize: 11.5,
        color: "#b3261e",
        fontWeight: 800,
        marginTop: 5
      }
    }, "🌊 時化のおそれ：入荷・地物に影響が出るかも"));
  })());
}
function WeatherWidget({
  onTheme
}) {
  const [daily, setDaily] = useState(null);
  const [open, setOpen] = useState(false);
  const [wxFailed, setWxFailed] = useState(false);
  const emit = React.useCallback(dd => {
    try {
      if (onTheme && dd && dd.weather_code) onTheme(dd.weather_code[0]);
    } catch (e) {}
  }, [onTheme]);
  const loadWx = React.useCallback(() => {
    setWxFailed(false);
    const URL = "https://api.open-meteo.com/v1/forecast?latitude=35.367&longitude=132.755&daily=weather_code,temperature_2m_max,temperature_2m_min&timezone=Asia%2FTokyo&forecast_days=2";
    const KEY = "wxHeadV1";
    const ok = d => {
      if (d && d.daily) {
        setDaily(d.daily);
        emit(d.daily);
        try {
          localStorage.setItem(KEY, JSON.stringify({
            t: Date.now(),
            d
          }));
        } catch (e) {}
        return true;
      }
      return false;
    };
    const fallback = () => {
      try {
        const c = JSON.parse(localStorage.getItem(KEY) || "null");
        if (c && Date.now() - c.t < 86400000 && c.d && c.d.daily) {
          setDaily(c.d.daily);
          emit(c.d.daily);
          return true;
        }
      } catch (e) {}
      return false;
    };
    const go = retry => fetch(URL).then(r => r.ok ? r.json() : null).then(d => {
      if (!ok(d)) throw 0;
    }).catch(() => {
      if (retry > 0) {
        setTimeout(() => go(retry - 1), 5000);
        return;
      }
      if (!fallback()) setWxFailed(true);
    });
    go(2);
  }, []);
  useEffect(() => {
    loadWx();
  }, [loadWx]);
  if (!daily) {
    if (!wxFailed) return null;
    return /*#__PURE__*/React.createElement("div", {
      onClick: loadWx,
      style: {
        fontSize: 10.5,
        color: "var(--sub)",
        fontWeight: 700,
        cursor: "pointer",
        whiteSpace: "nowrap",
        border: "1px solid var(--line)",
        borderRadius: 9,
        padding: "5px 9px"
      }
    }, "天気を取得できません", /*#__PURE__*/React.createElement("br", null), /*#__PURE__*/React.createElement("span", {
      style: {
        textDecoration: "underline"
      }
    }, "タップで再試行"));
  }
  const wmo = c => {
    if (c === 0) return {
      e: "☀️",
      t: "快晴"
    };
    if (c === 1) return {
      e: "🌤",
      t: "晴れ"
    };
    if (c === 2) return {
      e: "⛅",
      t: "時々曇り"
    };
    if (c === 3) return {
      e: "☁️",
      t: "曇り"
    };
    if (c === 45 || c === 48) return {
      e: "🌫",
      t: "霧"
    };
    if (c >= 51 && c <= 57) return {
      e: "🌦",
      t: "霧雨"
    };
    if (c >= 61 && c <= 67) return {
      e: "🌧",
      t: "雨"
    };
    if (c >= 71 && c <= 77) return {
      e: "❄️",
      t: "雪"
    };
    if (c >= 80 && c <= 82) return {
      e: "🌦",
      t: "にわか雨"
    };
    if (c === 85 || c === 86) return {
      e: "🌨",
      t: "にわか雪"
    };
    if (c >= 95) return {
      e: "⛈",
      t: "雷雨"
    };
    return {
      e: "☁️",
      t: "曇り"
    };
  };
  const Day = ({
    label,
    i
  }) => {
    const w = wmo(daily.weather_code[i]);
    const hi = Math.round(daily.temperature_2m_max[i]);
    const lo = Math.round(daily.temperature_2m_min[i]);
    return /*#__PURE__*/React.createElement("div", {
      style: {
        display: "flex",
        alignItems: "center",
        gap: 4,
        whiteSpace: "nowrap"
      }
    }, /*#__PURE__*/React.createElement("span", {
      style: {
        fontSize: 9.5,
        color: "rgba(255,255,255,0.85)",
        fontWeight: 800
      }
    }, label), /*#__PURE__*/React.createElement("span", {
      style: {
        fontSize: 15,
        filter: "drop-shadow(0 1px 2px rgba(0,0,0,0.25))"
      }
    }, w.e), /*#__PURE__*/React.createElement("span", {
      style: {
        fontSize: 11.5,
        fontWeight: 800
      }
    }, /*#__PURE__*/React.createElement("span", {
      style: {
        color: "#fff"
      }
    }, hi, "°"), /*#__PURE__*/React.createElement("span", {
      style: {
        color: "rgba(255,255,255,0.55)"
      }
    }, "/"), /*#__PURE__*/React.createElement("span", {
      style: {
        color: "rgba(255,255,255,0.8)"
      }
    }, lo, "°")));
  };

  // 今日の天気コードから空のグラデーションを決める
  // 参考画像のブラッシュメタル調（斜めヘアライン×濃紺青）。天気で明度だけ変える。
  const skyBg = (() => {
    const c = daily.weather_code[0];
    let base = "#2f4d72",
      lite = "#587aa6",
      dark = "#1c3350";
    if (c <= 1) {
      base = "#356199";
      lite = "#6f9fce";
      dark = "#1f3f66";
    } else if (c <= 3) {
      base = "#3a5578";
      lite = "#6683a6";
      dark = "#22374f";
    } else if (c >= 95) {
      base = "#28324a";
      lite = "#4a5a78";
      dark = "#161d2e";
    } else if (c >= 71 && c <= 86 && !(c >= 80 && c <= 82)) {
      base = "#465f82";
      lite = "#8aa3c4";
      dark = "#2c3f5a";
    } else {
      base = "#2f4d72";
      lite = "#587aa6";
      dark = "#1c3350";
    }
    return `repeating-linear-gradient(115deg, rgba(255,255,255,0.05) 0px, rgba(255,255,255,0.05) 1px, rgba(0,0,0,0.05) 1px, rgba(0,0,0,0.05) 3px), linear-gradient(120deg, ${dark} 0%, ${base} 42%, ${lite} 60%, ${base} 78%, ${dark} 100%)`;
  })();
  return /*#__PURE__*/React.createElement("div", {
    style: {
      position: "relative"
    }
  }, /*#__PURE__*/React.createElement("div", {
    onClick: () => window.open("https://tenki.jp/forecast/7/35/6810/32203/10days.html", "_blank", "noopener"),
    style: {
      display: "flex",
      alignItems: "center",
      gap: 8,
      background: skyBg,
      border: "1px solid rgba(255,255,255,0.35)",
      borderRadius: 11,
      height: 28,
      boxSizing: "border-box",
      padding: "0 12px",
      whiteSpace: "nowrap",
      flexShrink: 0,
      cursor: "pointer",
      boxShadow: "0 2px 8px rgba(0,0,0,0.15), inset 0 1px 0 rgba(255,255,255,0.35)"
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 10.5,
      color: "rgba(255,255,255,0.9)",
      fontWeight: 800
    }
  }, (() => {
    const n = new Date();
    return `${n.getMonth() + 1}/${n.getDate()}`;
  })()), /*#__PURE__*/React.createElement("div", {
    style: {
      width: 1,
      height: 15,
      background: "rgba(255,255,255,0.35)"
    }
  }), /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 16,
      filter: "drop-shadow(0 1px 2px rgba(0,0,0,0.25))"
    }
  }, wmo(daily.weather_code[0]).e), /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 13,
      fontWeight: 800
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      color: "#fff"
    }
  }, Math.round(daily.temperature_2m_max[0]), "°"), /*#__PURE__*/React.createElement("span", {
    style: {
      color: "rgba(255,255,255,0.55)"
    }
  }, "/"), /*#__PURE__*/React.createElement("span", {
    style: {
      color: "rgba(255,255,255,0.8)"
    }
  }, Math.round(daily.temperature_2m_min[0]), "°"))), open && /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("div", {
    onClick: () => setOpen(false),
    style: {
      position: "fixed",
      inset: 0,
      zIndex: 210
    }
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      position: "absolute",
      top: "calc(100% + 8px)",
      right: 0,
      zIndex: 211,
      background: "#fff",
      borderRadius: 14,
      boxShadow: "0 8px 30px rgba(0,0,0,0.18)",
      padding: "13px 15px",
      width: 230,
      animation: "fadeUp .2s ease"
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 12.5,
      fontWeight: 900,
      color: "var(--ink)",
      marginBottom: 8
    }
  }, "📍 天気の観測地点"), /*#__PURE__*/React.createElement("svg", {
    viewBox: "0 0 220 100",
    style: {
      width: "100%",
      display: "block",
      marginBottom: 8
    }
  }, /*#__PURE__*/React.createElement("path", {
    d: "M8,62 L30,72 L58,78 L92,74 L112,66 L128,60 L150,50 L172,40 L196,28 L210,20 L212,30 L196,44 L176,56 L154,66 L132,74 L110,82 L86,88 L56,90 L26,84 L6,72 Z",
    fill: "#dce8f5",
    stroke: "#9db8d4",
    strokeWidth: "1.5",
    strokeLinejoin: "round"
  }), /*#__PURE__*/React.createElement("path", {
    d: "M104,60 L124,52 L146,44 L142,52 L122,60 L106,66 Z",
    fill: "#dce8f5",
    stroke: "#9db8d4",
    strokeWidth: "1.5",
    strokeLinejoin: "round"
  }), /*#__PURE__*/React.createElement("ellipse", {
    cx: "128",
    cy: "62",
    rx: "10",
    ry: "4",
    fill: "#aecdea"
  }), /*#__PURE__*/React.createElement("circle", {
    cx: "106",
    cy: "68",
    r: "5",
    fill: "#C24E00",
    stroke: "#fff",
    strokeWidth: "1.5"
  }), /*#__PURE__*/React.createElement("text", {
    x: "106",
    y: "52",
    textAnchor: "middle",
    fontSize: "11",
    fontWeight: "800",
    fill: "#a8480a"
  }, "出雲"), /*#__PURE__*/React.createElement("text", {
    x: "196",
    y: "16",
    textAnchor: "middle",
    fontSize: "9",
    fill: "#8fa8c2"
  }, "松江"), /*#__PURE__*/React.createElement("circle", {
    cx: "188",
    cy: "30",
    r: "2.5",
    fill: "#8fa8c2"
  }), /*#__PURE__*/React.createElement("text", {
    x: "30",
    y: "60",
    fontSize: "9",
    fill: "#8fa8c2"
  }, "浜田")), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 11.5,
      color: "var(--text)",
      lineHeight: 1.7,
      fontWeight: 600
    }
  }, /*#__PURE__*/React.createElement("b", null, "出雲市周辺"), "の予報を表示しています。ホームの「今日の売場情報」の気温も同じ地点です。"), /*#__PURE__*/React.createElement("a", {
    href: "https://tenki.jp/forecast/7/35/6810/32203/10days.html",
    target: "_blank",
    rel: "noopener noreferrer",
    onClick: e => e.stopPropagation(),
    style: {
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      gap: 6,
      marginTop: 11,
      textDecoration: "none",
      background: "var(--primary)",
      color: "#fff",
      borderRadius: 10,
      padding: "10px",
      fontSize: 13,
      fontWeight: 800
    }
  }, "週間予報を見る（tenki.jp）→"), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 10,
      color: "var(--faint)",
      marginTop: 8
    }
  }, "データ：Open-Meteo"))));
}

// ── 開発・お知らせ Tab ──
function DevTab() {
  return /*#__PURE__*/React.createElement("div", {
    style: {
      maxWidth: 680,
      margin: "0 auto",
      padding: "20px 16px 60px"
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 22,
      fontWeight: 900,
      color: "var(--ink)",
      marginBottom: 4
    }
  }, "お知らせ・更新履歴"), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 12,
      color: "var(--sub)",
      marginBottom: 20
    }
  }, "アプリの更新履歴とお知らせ"), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      flexDirection: "column",
      gap: 12
    }
  }, ANNOUNCEMENTS.map((a, i) => {
    const t = ANN_TYPES[a.type] || ANN_TYPES["お知らせ"];
    return /*#__PURE__*/React.createElement("div", {
      key: i,
      style: {
        background: "white",
        borderRadius: 14,
        padding: "16px 18px",
        border: "1px solid #ececec",
        boxShadow: "0 1px 4px rgba(0,0,0,0.04)"
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        display: "flex",
        alignItems: "center",
        gap: 8,
        marginBottom: 8
      }
    }, /*#__PURE__*/React.createElement("span", {
      style: {
        background: t.bg,
        color: t.color,
        border: `1px solid ${t.border}`,
        borderRadius: 20,
        padding: "3px 10px",
        fontSize: 11,
        fontWeight: 800
      }
    }, a.type), /*#__PURE__*/React.createElement("span", {
      style: {
        fontSize: 11,
        color: "var(--faint)",
        fontWeight: 700
      }
    }, a.date)), /*#__PURE__*/React.createElement("div", {
      style: {
        fontSize: 15,
        fontWeight: 800,
        color: "var(--ink)",
        marginBottom: 6
      }
    }, a.title), /*#__PURE__*/React.createElement("div", {
      style: {
        fontSize: 13,
        color: "var(--text)",
        lineHeight: 1.75,
        whiteSpace: "pre-wrap"
      }
    }, a.body));
  }), ANNOUNCEMENTS.length === 0 && /*#__PURE__*/React.createElement("div", {
    style: {
      textAlign: "center",
      color: "var(--faint)",
      fontSize: 13,
      padding: "40px 0"
    }
  }, "まだお知らせはありません")));
}

// ── Main App ──
// ===== GNE：POP画像ジェネレーター（Canvasで柄テンプレに文字を焼く） =====

// ── ヘッダー用：今日の行事チップ（今日が祝日・行事の日だけ表示） ──
function TodayEventChip() {
  const now = new Date();
  const n0 = new Date(now);
  n0.setHours(0, 0, 0, 0);
  const holName = holidayName(now.getFullYear(), now.getMonth() + 1, now.getDate());
  const ev = [...seasonalEventsFor(now.getFullYear())].find(e => e.date.getTime() === n0.getTime()) || null;
  if (!holName && !ev) return null;
  const label = holName ? `今日は「${holName}」🎌` : `今日は「${ev.name}」${ev.food ? "〈" + ev.food + "〉" : ""}`;
  return /*#__PURE__*/React.createElement("div", {
    style: {
      flexShrink: 1,
      minWidth: 0,
      overflow: "hidden",
      textOverflow: "ellipsis",
      whiteSpace: "nowrap",
      fontSize: 11,
      fontWeight: 700,
      letterSpacing: "-0.2px",
      color: "#0f0f0f",
      background: "rgba(255,255,255,0.92)",
      borderRadius: 11,
      height: 28,
      boxSizing: "border-box",
      display: "flex",
      alignItems: "center",
      padding: "0 12px",
      backdropFilter: "blur(8px)",
      boxShadow: "0 1px 4px rgba(0,0,0,0.08)"
    }
  }, label);
}

// ── ヘッダー用：今日の天気アイコン＋最高/最低（軽量・3時間キャッシュ） ──
function HeaderWeather() {
  const [w, setW] = useState(null);
  useEffect(() => {
    const KEY = "hdrWx1";
    try {
      const c = JSON.parse(localStorage.getItem(KEY) || "null");
      if (c && Date.now() - c.t < 3 * 3600 * 1000) {
        setW(c.w);
        return;
      }
    } catch (e) {}
    fetch("https://api.open-meteo.com/v1/forecast?latitude=35.367&longitude=132.755&daily=weather_code,temperature_2m_max,temperature_2m_min&timezone=Asia%2FTokyo&forecast_days=1").then(r => r.ok ? r.json() : null).then(d => {
      if (!d || !d.daily || d.daily.temperature_2m_max[0] == null) return;
      const w2 = {
        code: d.daily.weather_code[0],
        hi: Math.round(d.daily.temperature_2m_max[0]),
        lo: Math.round(d.daily.temperature_2m_min[0])
      };
      setW(w2);
      try {
        localStorage.setItem(KEY, JSON.stringify({
          t: Date.now(),
          w: w2
        }));
      } catch (e) {}
    }).catch(() => {});
  }, []);
  if (!w) return null;
  return /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      alignItems: "center",
      gap: 5,
      flexShrink: 0
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 20,
      lineHeight: 1
    }
  }, wmoIcon(w.code).e), /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 16,
      fontWeight: 900,
      whiteSpace: "nowrap"
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      color: "#e0555f"
    }
  }, w.hi, "°"), /*#__PURE__*/React.createElement("span", {
    style: {
      color: "var(--faint)",
      fontSize: 13
    }
  }, " / "), /*#__PURE__*/React.createElement("span", {
    style: {
      color: "#4a86c5"
    }
  }, w.lo, "°")));
}
;
Object.assign(window, {
  DevTab,
  HeaderWeather,
  PromptAddModal,
  PromptCard,
  PromptGuide,
  PromptTab,
  TodayEventChip,
  TodayInfoCard,
  WeatherWidget
});