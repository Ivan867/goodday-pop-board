/* GoodDay 鮮魚共有 — 12-tab-learn （自動分割・window共有） */
var {
  useState,
  useEffect,
  useCallback,
  useRef
} = React;
function CalendarTab() {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const [ym, setYm] = useState({
    y: today.getFullYear(),
    m: today.getMonth()
  }); // m:0-11

  // 行事データ：共通データ seasonalEventsFor を利用
  const allEv = seasonalEventsFor(ym.y);
  const evOn = (y, m, d) => allEv.find(e => e.date.getFullYear() === y && e.date.getMonth() === m && e.date.getDate() === d);
  const firstDay = new Date(ym.y, ym.m, 1);
  const startWd = firstDay.getDay();
  const daysInMonth = new Date(ym.y, ym.m + 1, 0).getDate();
  const cells = [];
  for (let i = 0; i < startWd; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(d);
  while (cells.length % 7 !== 0) cells.push(null);
  const monthHols = Object.entries(JP_HOLIDAYS[ym.y] || {}).map(([k, name]) => {
    const [mm, dd] = k.split("-").map(Number);
    return {
      m: mm - 1,
      d: dd,
      name
    };
  }).filter(h => h.m === ym.m).map(h => ({
    date: new Date(ym.y, h.m, h.d),
    name: h.name,
    food: null,
    holiday: true
  }));
  const monthEvents = [...allEv.filter(e => e.date.getFullYear() === ym.y && e.date.getMonth() === ym.m), ...monthHols].sort((a, b) => a.date - b.date);
  const prevM = () => setYm(v => v.m === 0 ? {
    y: v.y - 1,
    m: 11
  } : {
    y: v.y,
    m: v.m - 1
  });
  const nextM = () => setYm(v => v.m === 11 ? {
    y: v.y + 1,
    m: 0
  } : {
    y: v.y,
    m: v.m + 1
  });
  const jp = ["日", "月", "火", "水", "木", "金", "土"];
  return /*#__PURE__*/React.createElement("div", {
    className: "min-vh",
    style: {
      background: "var(--bg)"
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      background: "linear-gradient(180deg,#e7f1fa,#d3e5f4)",
      padding: "calc(env(safe-area-inset-top) + 20px) 16px 22px"
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      maxWidth: 600,
      margin: "0 auto"
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      color: "#1d3a57",
      fontSize: 18,
      fontWeight: 900
    }
  }, "行事カレンダー"), /*#__PURE__*/React.createElement("div", {
    style: {
      color: "rgba(29,58,87,0.72)",
      fontSize: 12,
      marginTop: 2
    }
  }, "売場に関わる行事・ハレの日をチェック"))), /*#__PURE__*/React.createElement("div", {
    style: {
      maxWidth: 600,
      margin: "0 auto",
      padding: "16px 16px 120px"
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      marginBottom: 14
    }
  }, /*#__PURE__*/React.createElement("button", {
    onClick: prevM,
    style: {
      border: "1px solid var(--line)",
      background: "#fff",
      borderRadius: 10,
      width: 38,
      height: 38,
      fontSize: 18,
      fontWeight: 800,
      color: "var(--text)",
      cursor: "pointer"
    }
  }, "‹"), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 17,
      fontWeight: 900,
      color: "var(--ink)"
    }
  }, ym.y, "年 ", ym.m + 1, "月"), /*#__PURE__*/React.createElement("button", {
    onClick: nextM,
    style: {
      border: "1px solid var(--line)",
      background: "#fff",
      borderRadius: 10,
      width: 38,
      height: 38,
      fontSize: 18,
      fontWeight: 800,
      color: "var(--text)",
      cursor: "pointer"
    }
  }, "›")), /*#__PURE__*/React.createElement("div", {
    style: {
      background: "#fff",
      border: "1px solid var(--line)",
      borderRadius: 14,
      padding: "10px 8px 8px",
      marginBottom: 16
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: "grid",
      gridTemplateColumns: "repeat(7,1fr)",
      marginBottom: 4
    }
  }, jp.map((w, i) => /*#__PURE__*/React.createElement("div", {
    key: w,
    style: {
      textAlign: "center",
      fontSize: 11,
      fontWeight: 800,
      padding: "4px 0",
      color: i === 0 ? "#c0392b" : i === 6 ? "#2f6fb0" : "var(--sub)"
    }
  }, w))), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "grid",
      gridTemplateColumns: "repeat(7,1fr)",
      gap: 2
    }
  }, cells.map((d, i) => {
    if (d === null) return /*#__PURE__*/React.createElement("div", {
      key: i
    });
    const isToday = ym.y === today.getFullYear() && ym.m === today.getMonth() && d === today.getDate();
    const ev = evOn(ym.y, ym.m, d);
    const hol = holidayName(ym.y, ym.m + 1, d);
    const wd = (startWd + d - 1) % 7;
    const dayColor = ev ? "var(--primary)" : hol || wd === 0 ? "#c0392b" : wd === 6 ? "#2f6fb0" : "var(--text)";
    return /*#__PURE__*/React.createElement("div", {
      key: i,
      style: {
        minHeight: 52,
        borderRadius: 8,
        padding: "3px 2px",
        background: isToday ? "var(--soft)" : hol ? "#fdeeee" : "transparent",
        border: isToday ? "1.5px solid var(--primary)" : "1px solid transparent",
        display: "flex",
        flexDirection: "column",
        alignItems: "center"
      }
    }, /*#__PURE__*/React.createElement("span", {
      style: {
        fontSize: 12.5,
        fontWeight: isToday ? 900 : 700,
        color: dayColor
      }
    }, d), ev ? /*#__PURE__*/React.createElement("span", {
      style: {
        fontSize: 8.5,
        fontWeight: 800,
        color: "var(--soft-text)",
        lineHeight: 1.15,
        textAlign: "center",
        marginTop: 1
      }
    }, ev.name.length > 4 ? ev.name.slice(0, 4) : ev.name) : hol ? /*#__PURE__*/React.createElement("span", {
      style: {
        fontSize: 8,
        fontWeight: 800,
        color: "#c0392b",
        lineHeight: 1.1,
        textAlign: "center",
        marginTop: 1
      }
    }, hol.length > 4 ? hol.slice(0, 4) : hol) : null);
  }))), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 13,
      fontWeight: 900,
      color: "var(--ink)",
      marginBottom: 9
    }
  }, ym.m + 1, "月の行事"), monthEvents.length === 0 ? /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 12.5,
      color: "var(--sub)",
      background: "#fff",
      border: "1px solid var(--line)",
      borderRadius: 12,
      padding: "16px",
      textAlign: "center"
    }
  }, "この月の登録行事はありません") : monthEvents.map((e, i) => /*#__PURE__*/React.createElement("div", {
    key: i,
    style: {
      display: "flex",
      alignItems: "center",
      gap: 10,
      background: "#fff",
      border: "1px solid var(--line)",
      borderRadius: 12,
      padding: "11px 13px",
      marginBottom: 8
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      flexShrink: 0,
      width: 44,
      textAlign: "center"
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 16,
      fontWeight: 900,
      color: e.holiday ? "#c0392b" : "var(--primary)",
      lineHeight: 1
    }
  }, e.date.getDate()), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 10,
      color: "var(--sub)",
      fontWeight: 700
    }
  }, jp[e.date.getDay()])), /*#__PURE__*/React.createElement("div", {
    style: {
      minWidth: 0,
      flex: 1
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 14,
      fontWeight: 900,
      color: "var(--ink)"
    }
  }, e.name, e.holiday && /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 10,
      fontWeight: 800,
      color: "#c0392b",
      background: "#fdeeee",
      borderRadius: 6,
      padding: "1px 7px",
      marginLeft: 7
    }
  }, "祝日")), e.food && /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 11.5,
      color: "var(--soft-text)",
      marginTop: 2
    }
  }, "💡 ", e.food)))), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 11,
      color: "var(--faint)",
      textAlign: "center",
      marginTop: 8,
      lineHeight: 1.7
    }
  }, "行事の追加・編集機能は今後対応予定です。", /*#__PURE__*/React.createElement("br", null), "まずは季節の売場づくりの目安にどうぞ。")));
}
function CompetitorTab() {
  const GROUPS = [{
    cat: "専門店型",
    emoji: "🐟",
    note: "鮮魚売場というより「魚屋」の強さ。職人感・対面・丸魚・珍魚・活気。POPは「本日入荷」「店内加工」「鮮魚担当おすすめ」「刺身できます」系が合う。",
    rows: [{
      name: "角上魚類",
      url: "https://www.kakujoe.co.jp/",
      desc: "新潟・寺泊発。漁港直結の仕入れ、珍魚、対面販売、職人加工、寿司・惣菜まで強い。",
      hint: "対面販売・丸魚陳列・珍魚の見せ方・寿司惣菜展開",
      pri: 1
    }, {
      name: "魚耕",
      url: "https://www.uoko.co.jp/",
      desc: "関東の駅ナカ・駅ビル中心。刺身盛り・下処理・惣菜・テイクアウト寿司など小回りが強い。",
      hint: "駅ビル型の小スペース売場、刺身惣菜、通勤客向け商品",
      pri: 12
    }, {
      name: "魚力",
      url: "https://www.uoriki.co.jp/",
      desc: "百貨店・駅ビルに強い老舗。鮮魚と寿司・焼魚など調理品のダブル主力。",
      hint: "百貨店型の高級感、刺身寿司の盛り付け、清潔感ある陳列",
      pri: 11
    }]
  }, {
    cat: "大手スーパー型",
    emoji: "🛒",
    note: "尖らせるより日常の買いやすさと提案力。店内加工・調理サービス・惣菜連携。POPは「焼くだけ」「煮付けにおすすめ」「下処理済み」「夕飯の一品に」系。",
    rows: [{
      name: "ライフ",
      url: "https://www.lifecorp.jp/",
      desc: "店内加工に積極的。刺身・対面販売・鮮度管理、寿司焼魚惣菜との連携。",
      hint: "大型店の店内加工、日常価格と品質のバランス",
      pri: 9
    }, {
      name: "ヤオコー",
      url: "https://www.yaoko-net.com/",
      desc: "産地直送・市場直仕入れ、売場演出、食べ方提案、惣菜が強い。",
      hint: "調理提案POP、鮮魚惣菜、売場の見せ方、旬魚の打ち出し",
      pri: 2
    }, {
      name: "イトーヨーカドー",
      url: "https://www.itoyokado.co.jp/",
      desc: "お魚調理サービス、クッキングサポート、魚離れ対策、買いやすさ重視。",
      hint: "調理サービスの案内方法、魚調理のハードルを下げるPOP",
      pri: 13
    }, {
      name: "サミット",
      url: "https://www.summitstore.co.jp/",
      desc: "店内加工、丸魚・刺身・焼魚用まで幅広い商品展開。惣菜連携も強い。",
      hint: "日常使いの鮮魚売場、焼くだけ・煮るだけ系の提案",
      pri: 8
    }]
  }, {
    cat: "地域密着型",
    emoji: "🏘",
    note: "グッディーの売場に一番近い参考軸。地元の食文化・地魚・日替わり感・活気・鮮魚惣菜。山陰沖産・島根県産を打ち出すなら「地元で親しまれる魚」「山陰の旬」「今日はこの魚」と相性◎。",
    rows: [{
      name: "万代",
      url: "https://www.mandai-net.co.jp/",
      desc: "関西で人気。安くて新鮮、季節の地魚、珍しい魚、寿司・煮魚・焼魚惣菜が豊富。",
      hint: "安さと鮮度の見せ方、日替わり感、地魚惣菜展開",
      pri: 3
    }, {
      name: "スーパーオカムラ",
      url: "https://www.google.com/maps/search/%E3%82%B9%E3%83%BC%E3%83%91%E3%83%BC%E3%82%AA%E3%82%AB%E3%83%A0%E3%83%A9+%E5%AF%8C%E5%A3%AB%E5%B8%82",
      desc: "静岡・富士エリア。駿河湾近海魚、深海魚、珍しい魚、地元食文化が強い。",
      hint: "地魚・珍魚の売り方、ローカル感、地域食文化POP",
      pri: 4
    }, {
      name: "オオゼキ",
      url: "https://www.ozeki-net.co.jp/",
      desc: "東京・神奈川。市場のような活気、マグロ解体、対面販売、調理提案。",
      hint: "イベント型売場、マグロ解体、都市型の臨場感",
      pri: 5
    }, {
      name: "バロー",
      url: "https://www.valor.co.jp/",
      desc: "中部中心。本部仕入れと現場目利きの両立。旬と価格・品質バランス。",
      hint: "地域スーパーでの魚の強さ、寿司惣菜との連動",
      pri: 15
    }, {
      name: "関西スーパー",
      url: "https://www.kansaisuper.co.jp/",
      desc: "鮮魚と惣菜の融合が強み。寿司・煮付け・焼物を手頃価格で展開。",
      hint: "鮮魚惣菜の作り方、夕食需要向けの商品構成",
      pri: 10
    }, {
      name: "平和堂",
      url: "https://www.heiwado.jp/",
      desc: "滋賀・関西圏。地元ニーズ、刺身・切身・味付け魚、惣菜寿司連携。",
      hint: "地域密着の安定感、日常の魚おかず提案",
      pri: 14
    }]
  }, {
    cat: "高級・高品質型",
    emoji: "✨",
    note: "価格勝負でなく上質感・少量・見た目・特別感。刺身・寿司・海鮮丼・うなぎ・お盆・年末年始・父の日POPの参考に。「ちょっと贅沢」「食卓を華やかに」「上質な味わい」「特別な日の一品」系。",
    rows: [{
      name: "成城石井",
      url: "https://www.seijoishii.com/",
      desc: "高品質・少量パック・単身者向け・惣菜や加工品が豊富。ちょっと贅沢路線。",
      hint: "少量高品質パック、パッケージ、上質感あるPOP",
      pri: 7
    }, {
      name: "紀ノ国屋",
      url: "https://www.e-kinokuniya.com/",
      desc: "老舗高級スーパー。美しい盛り付け、上質なパッケージ、希少魚、特別感。",
      hint: "高級感、盛り付け、色使い、特別日向けの鮮魚演出",
      pri: 6
    }]
  }];
  return /*#__PURE__*/React.createElement("div", {
    className: "min-vh",
    style: {
      background: "var(--bg)"
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      background: "linear-gradient(180deg,#e7f1fa,#d3e5f4)",
      padding: "calc(env(safe-area-inset-top) + 20px) 16px 22px"
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      maxWidth: 600,
      margin: "0 auto"
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      color: "#1d3a57",
      fontSize: 18,
      fontWeight: 900
    }
  }, "競合情報"), /*#__PURE__*/React.createElement("div", {
    style: {
      color: "rgba(29,58,87,0.72)",
      fontSize: 12,
      marginTop: 2
    }
  }, "鮮魚が強い15店舗を4タイプで整理。売り方のヒントに"))), /*#__PURE__*/React.createElement("div", {
    style: {
      maxWidth: 600,
      margin: "0 auto",
      padding: "16px 16px 120px"
    }
  }, GROUPS.map(g => /*#__PURE__*/React.createElement("div", {
    key: g.cat,
    style: {
      marginBottom: 22
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      alignItems: "center",
      gap: 8,
      marginBottom: 6
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 19
    }
  }, g.emoji), /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 15.5,
      fontWeight: 900,
      color: "var(--ink)"
    }
  }, g.cat)), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 11.5,
      color: "var(--sub)",
      lineHeight: 1.7,
      marginBottom: 11,
      background: "var(--soft)",
      borderRadius: 10,
      padding: "9px 11px"
    }
  }, g.note), g.rows.map(r => /*#__PURE__*/React.createElement("a", {
    key: r.name,
    href: r.url,
    target: "_blank",
    rel: "noopener noreferrer",
    style: {
      display: "block",
      textDecoration: "none",
      background: "#fff",
      border: "1px solid var(--line)",
      borderRadius: 12,
      padding: "12px 13px",
      marginBottom: 8
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      alignItems: "center",
      gap: 8,
      marginBottom: 5
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 14.5,
      fontWeight: 900,
      color: "var(--ink)"
    }
  }, r.name), /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 10,
      fontWeight: 800,
      color: "var(--sub)",
      background: "var(--chip)",
      borderRadius: 6,
      padding: "1px 6px"
    }
  }, "注目度 ", r.pri <= 5 ? "★★★" : r.pri <= 10 ? "★★" : "★"), /*#__PURE__*/React.createElement("span", {
    style: {
      marginLeft: "auto",
      color: "var(--faint)",
      fontSize: 17
    }
  }, "↗")), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 12,
      color: "var(--text)",
      lineHeight: 1.65
    }
  }, r.desc), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 11,
      color: "var(--soft-text)",
      lineHeight: 1.6,
      marginTop: 5
    }
  }, "💡 ", r.hint))))), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 11,
      color: "var(--faint)",
      textAlign: "center",
      marginTop: 4,
      lineHeight: 1.7
    }
  }, "店名をタップすると公式サイトが別タブで開きます。", /*#__PURE__*/React.createElement("br", null), "各社の売場づくりを参考に、うちの強みを磨きましょう。")));
}
function IndustryTab() {
  const SITES = [{
    name: "ダイヤモンド・チェーンストア オンライン",
    home: "https://diamond-rm.net/",
    feed: "https://diamond-rm.net/feed/",
    tag: "業界ニュース",
    emoji: "📰",
    color: "#2f6fb0"
  }, {
    name: "食未来研究室",
    home: "https://nsk-shokumirai.com/",
    feed: "https://nsk-shokumirai.com/feed/",
    tag: "売場・行事提案",
    emoji: "🍳",
    color: "#2f6fb0"
  }];
  const [data, setData] = useState(SITES.map(() => ({
    status: "loading",
    items: []
  })));
  useEffect(() => {
    let alive = true;
    SITES.forEach((site, idx) => {
      const url = "https://api.rss2json.com/v1/api.json?count=6&rss_url=" + encodeURIComponent(site.feed);
      fetch(url).then(r => r.ok ? r.json() : null).then(j => {
        if (!alive) return;
        if (j && j.status === "ok" && Array.isArray(j.items) && j.items.length) {
          setData(prev => {
            const n = [...prev];
            n[idx] = {
              status: "ok",
              items: j.items.slice(0, 6)
            };
            return n;
          });
        } else {
          setData(prev => {
            const n = [...prev];
            n[idx] = {
              status: "error",
              items: []
            };
            return n;
          });
        }
      }).catch(() => {
        if (alive) setData(prev => {
          const n = [...prev];
          n[idx] = {
            status: "error",
            items: []
          };
          return n;
        });
      });
    });
    return () => {
      alive = false;
    };
  }, []);
  const fmtDate = s => {
    const d = new Date((s || "").replace(" ", "T"));
    if (isNaN(+d)) return "";
    return `${d.getMonth() + 1}/${d.getDate()}`;
  };
  const strip = html => {
    const t = (html || "").replace(/<[^>]*>/g, "").replace(/&nbsp;/g, " ").trim();
    return t.length > 70 ? t.slice(0, 70) + "…" : t;
  };
  return /*#__PURE__*/React.createElement("div", {
    className: "min-vh",
    style: {
      background: "var(--bg)"
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      background: "linear-gradient(180deg,#e7f1fa,#d3e5f4)",
      padding: "calc(env(safe-area-inset-top) + 20px) 16px 22px"
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      maxWidth: 600,
      margin: "0 auto"
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      color: "#1d3a57",
      fontSize: 18,
      fontWeight: 900
    }
  }, "業界情報"), /*#__PURE__*/React.createElement("div", {
    style: {
      color: "rgba(29,58,87,0.72)",
      fontSize: 12,
      marginTop: 2
    }
  }, "売場づくりや業界の動きに役立つ最新記事"))), /*#__PURE__*/React.createElement("div", {
    style: {
      maxWidth: 600,
      margin: "0 auto",
      padding: "16px 16px 120px"
    }
  }, /*#__PURE__*/React.createElement("div", {
    className: "ucard",
    style: {
      background: "#fff",
      borderRadius: 16,
      padding: "13px 15px",
      marginBottom: 20
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      alignItems: "center",
      gap: 8,
      marginBottom: 4
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 19
    }
  }, "🗞"), /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 14.5,
      fontWeight: 900,
      color: "var(--ink)"
    }
  }, "鮮魚ニュースを探す")), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 11.5,
      color: "var(--sub)",
      marginBottom: 11,
      lineHeight: 1.6
    }
  }, "気になるテーマをタップすると、Googleニュースの最新記事まとめが開きます。"), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      flexWrap: "wrap",
      gap: 7
    }
  }, [["鮮魚 売場", "鮮魚 売場"], ["水産 市況", "水産 市況"], ["魚価", "魚価"], ["豊洲市場", "豊洲市場 水産"], ["漁獲・水揚げ", "漁獲量 水揚げ"], ["うなぎ", "うなぎ 相場"], ["寿司・刺身", "刺身 寿司 スーパー"], ["山陰の水産", "島根 水産 漁"]].map(([label, q]) => /*#__PURE__*/React.createElement("a", {
    key: label,
    href: "https://news.google.com/search?q=" + encodeURIComponent(q) + "&hl=ja&gl=JP&ceid=JP%3Aja",
    target: "_blank",
    rel: "noopener noreferrer",
    style: {
      textDecoration: "none",
      fontSize: 12.5,
      fontWeight: 800,
      color: "#4a7ab0",
      background: "var(--soft)",
      border: "1px solid #cfe2f3",
      borderRadius: 999,
      padding: "7px 13px"
    }
  }, label)))), SITES.map((site, idx) => {
    const st = data[idx];
    return /*#__PURE__*/React.createElement("div", {
      key: site.feed,
      style: {
        marginBottom: 20
      }
    }, /*#__PURE__*/React.createElement("a", {
      href: site.home,
      target: "_blank",
      rel: "noopener noreferrer",
      style: {
        display: "flex",
        alignItems: "center",
        gap: 9,
        textDecoration: "none",
        marginBottom: 9
      }
    }, /*#__PURE__*/React.createElement("span", {
      style: {
        fontSize: 20,
        flexShrink: 0
      }
    }, site.emoji), /*#__PURE__*/React.createElement("div", {
      style: {
        minWidth: 0,
        flex: 1
      }
    }, /*#__PURE__*/React.createElement("span", {
      style: {
        display: "inline-block",
        fontSize: 10,
        fontWeight: 800,
        color: "var(--soft-text)",
        background: "var(--soft)",
        borderRadius: 6,
        padding: "1px 7px"
      }
    }, site.tag), /*#__PURE__*/React.createElement("div", {
      style: {
        fontSize: 13.5,
        fontWeight: 900,
        color: "var(--ink)",
        lineHeight: 1.3
      }
    }, site.name)), /*#__PURE__*/React.createElement("span", {
      style: {
        color: "var(--faint)",
        fontSize: 18,
        flexShrink: 0
      }
    }, "↗")), st.status === "loading" && /*#__PURE__*/React.createElement("div", null, [0, 1, 2].map(i => /*#__PURE__*/React.createElement("div", {
      key: i,
      style: {
        background: "#fff",
        border: "1px solid var(--line)",
        borderRadius: 12,
        padding: "12px 13px",
        marginBottom: 8
      }
    }, /*#__PURE__*/React.createElement("div", {
      className: "sk",
      style: {
        width: "85%",
        height: 12,
        borderRadius: 6
      }
    }), /*#__PURE__*/React.createElement("div", {
      className: "sk",
      style: {
        width: "55%",
        height: 10,
        borderRadius: 6,
        marginTop: 8
      }
    })))), st.status === "error" && /*#__PURE__*/React.createElement("a", {
      href: site.home,
      target: "_blank",
      rel: "noopener noreferrer",
      style: {
        display: "block",
        textDecoration: "none",
        background: "#fff",
        border: "1px solid var(--line)",
        borderRadius: 12,
        padding: "14px 14px",
        color: "var(--text)",
        fontSize: 12.5,
        lineHeight: 1.7
      }
    }, "最新記事を読み込めませんでした。", /*#__PURE__*/React.createElement("span", {
      style: {
        color: site.color,
        fontWeight: 800
      }
    }, "サイトを開く →")), st.status === "ok" && st.items.map((it, i) => /*#__PURE__*/React.createElement("a", {
      key: i,
      href: it.link,
      target: "_blank",
      rel: "noopener noreferrer",
      style: {
        display: "block",
        textDecoration: "none",
        background: "#fff",
        border: "1px solid var(--line)",
        borderRadius: 12,
        padding: "12px 13px",
        marginBottom: 8
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        display: "flex",
        gap: 8,
        alignItems: "baseline"
      }
    }, fmtDate(it.pubDate) && /*#__PURE__*/React.createElement("span", {
      style: {
        fontSize: 10.5,
        fontWeight: 800,
        color: site.color,
        flexShrink: 0
      }
    }, fmtDate(it.pubDate)), /*#__PURE__*/React.createElement("span", {
      style: {
        fontSize: 13,
        fontWeight: 800,
        color: "var(--ink)",
        lineHeight: 1.45
      }
    }, it.title)), strip(it.description) && /*#__PURE__*/React.createElement("div", {
      style: {
        fontSize: 11,
        color: "var(--sub)",
        lineHeight: 1.6,
        marginTop: 5
      }
    }, strip(it.description)))));
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 11,
      color: "var(--faint)",
      textAlign: "center",
      marginTop: 4,
      lineHeight: 1.7
    }
  }, "記事はタップすると別タブで開きます。", /*#__PURE__*/React.createElement("br", null), "最新情報は各サイトから自動で取得しています。")));
}
function SoubaTab({
  onCreatePop
}) {
  const [sub, setSub] = useState("souba");
  // 粗利
  const [aCost, setACost] = useState("");
  const [aSell, setASell] = useState("");
  const [gRate, setGRate] = useState("30");
  const [gCost, setGCost] = useState("");
  // 歩留まり
  const [yUnit, setYUnit] = useState("");
  const [yRate, setYRate] = useState("55");
  const [yMargin, setYMargin] = useState("35");
  // 値引き
  const [nPrice, setNPrice] = useState("");
  const [nPct, setNPct] = useState("20");
  const [n2Price, setN2Price] = useState("");
  const [n2Yen, setN2Yen] = useState("50");
  // グラム
  const [g100, setG100] = useState("");
  const [gWt, setGWt] = useState("");
  const [g2Sell, setG2Sell] = useState("");
  const [g2Wt, setG2Wt] = useState("");
  // 立て塩
  const [sWater, setSWater] = useState("1000");
  const [sPct, setSPct] = useState("3");
  // 先週比
  const [last, setLast] = useState("199");
  const [now, setNow] = useState("179");
  const [copied, setCopied] = useState(false);
  // 売価計算
  const [cost, setCost] = useState("");
  const [margin, setMargin] = useState("30");
  const L = parseFloat(last),
    N = parseFloat(now);
  const valid = !isNaN(L) && !isNaN(N) && L > 0 && N > 0;
  const diff = valid ? L - N : 0; // +なら安くなった
  const pct = valid ? diff / L * 100 : 0; // +なら値引き
  const cheaper = diff > 0.0001;
  const same = valid && Math.abs(diff) < 0.0001;
  const wari = soubaWari(pct);
  const phrase = !valid ? "" : same ? "先週と同じ相場です" : cheaper ? `先週より${Math.round(diff)}円 ${wari}（${Math.abs(pct).toFixed(0)}%）おトク！` : `先週より${Math.round(-diff)}円高 ${wari}（${Math.abs(pct).toFixed(0)}%高）`;
  const copyPhrase = async () => {
    try {
      await navigator.clipboard.writeText(phrase);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch (e) {/* クリップボード不可環境は無視 */}
  };

  // 売価計算（利益率＝売価に対する割合＝値入率）
  const C = parseFloat(cost),
    M = parseFloat(margin);
  const sellValid = !isNaN(C) && C > 0 && !isNaN(M) && M >= 0 && M < 100;
  const sell = sellValid ? Math.ceil(C / (1 - M / 100)) : null;
  const profit = sellValid ? sell - Math.round(C) : null;
  const sellTax = sellValid ? Math.ceil(sell * 1.08) : null;
  const card = {
    background: "#fff",
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    boxShadow: "0 2px 12px rgba(0,0,0,0.06)"
  };
  const lbl = {
    fontSize: 12,
    color: "var(--sub)",
    marginBottom: 6
  };
  const inp = {
    width: "100%",
    boxSizing: "border-box",
    border: "1px solid var(--line)",
    borderRadius: 10,
    padding: "12px",
    fontSize: 18,
    fontWeight: 800,
    textAlign: "center",
    outline: "none"
  };
  const cell = (t, v, c) => /*#__PURE__*/React.createElement("div", {
    style: {
      textAlign: "center"
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 11,
      color: "var(--sub)"
    }
  }, t), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 22,
      fontWeight: 900,
      color: c
    }
  }, v));
  return /*#__PURE__*/React.createElement("div", {
    className: "min-vh",
    style: {
      background: "var(--bg)",
      paddingBottom: 100
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      background: "linear-gradient(180deg,#e7f1fa,#d3e5f4)",
      padding: "16px"
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      maxWidth: 560,
      margin: "0 auto"
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      color: "#1d3a57",
      fontSize: 18,
      fontWeight: 900
    }
  }, "便利機能"), /*#__PURE__*/React.createElement("div", {
    style: {
      color: "rgba(29,58,87,0.72)",
      fontSize: 12,
      marginTop: 2
    }
  }, "売場の計算をぜんぶここで。入力するだけでパッと答え"), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      gap: 6,
      marginTop: 12,
      overflowX: "auto",
      WebkitOverflowScrolling: "touch",
      paddingBottom: 2
    }
  }, [["souba", "相場計算"], ["arari", "粗利"], ["budomari", "歩留まり"], ["nebiki", "値引き"], ["gram", "グラム"], ["shio", "立て塩"]].map(([k, l]) => /*#__PURE__*/React.createElement("button", {
    key: k,
    onClick: () => setSub(k),
    style: {
      flexShrink: 0,
      border: "none",
      borderRadius: 16,
      padding: "7px 14px",
      fontSize: 13,
      fontWeight: 800,
      cursor: "pointer",
      background: sub === k ? "#fff" : "rgba(29,58,87,0.14)",
      color: sub === k ? "#2f6fb0" : "#17324e"
    }
  }, l))))), /*#__PURE__*/React.createElement("div", {
    style: {
      maxWidth: 560,
      margin: "0 auto",
      padding: "16px"
    }
  }, sub === "souba" && /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("div", {
    style: card
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 15,
      fontWeight: 900,
      color: "#2f6fb0",
      marginBottom: 14
    }
  }, "先週とくらべて何割 相場安？"), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      gap: 10
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      flex: 1
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: lbl
  }, "先週の売価（100g 円）"), /*#__PURE__*/React.createElement("input", {
    value: last,
    onChange: e => setLast(e.target.value),
    inputMode: "decimal",
    style: inp
  })), /*#__PURE__*/React.createElement("div", {
    style: {
      alignSelf: "center",
      paddingTop: 18,
      fontSize: 20,
      color: "var(--faint)"
    }
  }, "→"), /*#__PURE__*/React.createElement("div", {
    style: {
      flex: 1
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: lbl
  }, "今週の売価（100g 円）"), /*#__PURE__*/React.createElement("input", {
    value: now,
    onChange: e => setNow(e.target.value),
    inputMode: "decimal",
    style: inp
  }))), valid && /*#__PURE__*/React.createElement("div", {
    style: {
      marginTop: 14,
      background: same ? "#f3f4f6" : cheaper ? "#eafaf0" : "#fff4ed",
      border: `1px solid ${same ? "#e5e7eb" : cheaper ? "#bde9cd" : "#ffd9bf"}`,
      borderRadius: 12,
      padding: "14px 16px"
    }
  }, !same && /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      justifyContent: "space-around",
      marginBottom: 12
    }
  }, cell("差額", `${Math.round(Math.abs(diff))}円`, cheaper ? "#2f6fb0" : "var(--primary)"), cell(cheaper ? "値引率" : "値上率", `${Math.abs(pct).toFixed(1)}%`, cheaper ? "#2f6fb0" : "var(--primary)"), cell("割", wari || "—", cheaper ? "#2f6fb0" : "var(--primary)")), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 16,
      fontWeight: 900,
      color: "var(--ink)",
      textAlign: "center",
      lineHeight: 1.5
    }
  }, phrase), !same && /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("button", {
    onClick: copyPhrase,
    style: {
      marginTop: 12,
      width: "100%",
      border: "none",
      background: copied ? "#2f6fb0" : "#3f83c4",
      color: "#fff",
      borderRadius: 10,
      padding: "10px",
      fontSize: 14,
      fontWeight: 800,
      cursor: "pointer"
    }
  }, copied ? "✓ コピーしました" : "POP用の文言をコピー"), cheaper && onCreatePop && /*#__PURE__*/React.createElement("button", {
    onClick: () => onCreatePop({
      appeal: phrase
    }),
    style: {
      marginTop: 8,
      width: "100%",
      border: "1px solid #3f83c4",
      background: "#fff",
      color: "#2f6fb0",
      borderRadius: 10,
      padding: "10px",
      fontSize: 14,
      fontWeight: 800,
      cursor: "pointer"
    }
  }, "このおトク文でPOPを作成 →")))), /*#__PURE__*/React.createElement("div", {
    style: card
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 15,
      fontWeight: 900,
      color: "#8B6914",
      marginBottom: 4
    }
  }, "原価＋利益率 → 売価"), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 11,
      color: "var(--sub)",
      marginBottom: 14
    }
  }, "売価 = 原価 ÷（1 − 利益率）。利益率は売価に対する割合（値入率）。"), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      gap: 10
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      flex: 1
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: lbl
  }, "原価（100g 円）"), /*#__PURE__*/React.createElement("input", {
    value: cost,
    onChange: e => setCost(e.target.value),
    inputMode: "decimal",
    placeholder: "例：120",
    style: inp
  })), /*#__PURE__*/React.createElement("div", {
    style: {
      flex: 1
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: lbl
  }, "利益率（%）"), /*#__PURE__*/React.createElement("input", {
    value: margin,
    onChange: e => setMargin(e.target.value),
    inputMode: "decimal",
    style: inp
  }))), sellValid && /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("div", {
    style: {
      marginTop: 14,
      background: "#fffaf0",
      border: "1px solid #f0e0c0",
      borderRadius: 12,
      padding: "14px 16px",
      display: "flex",
      justifyContent: "space-around"
    }
  }, cell("売価（税抜）", `${sell}円`, "#8B6914"), cell("税込（8%）", `${sellTax}円`, "#b8860b"), cell("利益額", `${profit}円`, "#2f6fb0")), onCreatePop && /*#__PURE__*/React.createElement("button", {
    onClick: () => onCreatePop({
      price: `${sell}円（税込${sellTax}円）`
    }),
    style: {
      marginTop: 10,
      width: "100%",
      border: "1px solid #b8860b",
      background: "#fff",
      color: "#8B6914",
      borderRadius: 10,
      padding: "10px",
      fontSize: 14,
      fontWeight: 800,
      cursor: "pointer"
    }
  }, "この売価でPOPを作成 →")))), sub === "arari" && (() => {
    const c = parseFloat(aCost),
      v = parseFloat(aSell);
    const ok = !isNaN(c) && !isNaN(v) && c > 0 && v > 0;
    const rate = ok ? (v - c) / v * 100 : null;
    const gc = parseFloat(gCost),
      gr = parseFloat(gRate);
    const gok = !isNaN(gc) && gc > 0 && !isNaN(gr) && gr >= 0 && gr < 100;
    const gsell = gok ? Math.ceil(gc / (1 - gr / 100)) : null;
    return /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("div", {
      style: card
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        fontSize: 15,
        fontWeight: 900,
        color: "#2f6fb0",
        marginBottom: 14
      }
    }, "粗利率をチェック"), /*#__PURE__*/React.createElement("div", {
      style: {
        display: "flex",
        gap: 10
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        flex: 1
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: lbl
    }, "原価（円）"), /*#__PURE__*/React.createElement("input", {
      value: aCost,
      onChange: e => setACost(e.target.value),
      inputMode: "decimal",
      style: inp,
      placeholder: "120"
    })), /*#__PURE__*/React.createElement("div", {
      style: {
        flex: 1
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: lbl
    }, "売価（円）"), /*#__PURE__*/React.createElement("input", {
      value: aSell,
      onChange: e => setASell(e.target.value),
      inputMode: "decimal",
      style: inp,
      placeholder: "198"
    }))), ok && /*#__PURE__*/React.createElement("div", {
      style: {
        display: "flex",
        justifyContent: "space-around",
        marginTop: 16
      }
    }, cell("粗利率", `${rate.toFixed(1)}%`, rate >= 30 ? "#2f6fb0" : "var(--primary)"), cell("値入額", `${Math.round(v - c)}円`, "var(--ink)"), cell("原価率", `${(c / v * 100).toFixed(1)}%`, "var(--sub)"))), /*#__PURE__*/React.createElement("div", {
      style: card
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        fontSize: 15,
        fontWeight: 900,
        color: "#2f6fb0",
        marginBottom: 14
      }
    }, "目標の粗利率から売価を逆算"), /*#__PURE__*/React.createElement("div", {
      style: {
        display: "flex",
        gap: 10
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        flex: 1
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: lbl
    }, "原価（円）"), /*#__PURE__*/React.createElement("input", {
      value: gCost,
      onChange: e => setGCost(e.target.value),
      inputMode: "decimal",
      style: inp,
      placeholder: "120"
    })), /*#__PURE__*/React.createElement("div", {
      style: {
        flex: 1
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: lbl
    }, "目標粗利率（%）"), /*#__PURE__*/React.createElement("input", {
      value: gRate,
      onChange: e => setGRate(e.target.value),
      inputMode: "decimal",
      style: inp
    }))), gok && /*#__PURE__*/React.createElement("div", {
      style: {
        display: "flex",
        justifyContent: "space-around",
        marginTop: 16
      }
    }, cell("売価（税抜）", `${gsell}円`, "#2f6fb0"), cell("税込（8%）", `${Math.ceil(gsell * 1.08)}円`, "var(--sub)"))));
  })(), sub === "budomari" && (() => {
    const u = parseFloat(yUnit),
      r = parseFloat(yRate),
      m = parseFloat(yMargin);
    const ok = !isNaN(u) && u > 0 && !isNaN(r) && r > 0 && r <= 100;
    const real = ok ? u / (r / 100) : null;
    const mok = ok && !isNaN(m) && m >= 0 && m < 100;
    const rec = mok ? real / (1 - m / 100) : null;
    return /*#__PURE__*/React.createElement("div", {
      style: card
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        fontSize: 15,
        fontWeight: 900,
        color: "#2f6fb0",
        marginBottom: 4
      }
    }, "歩留まりから実質原価を計算"), /*#__PURE__*/React.createElement("div", {
      style: {
        fontSize: 11.5,
        color: "var(--sub)",
        marginBottom: 14
      }
    }, "丸魚を捌いたあとの「使える部分」あたりの原価が出ます（目安：ブリのフィレ 約55%、三枚おろし 約45〜50%）"), /*#__PURE__*/React.createElement("div", {
      style: {
        display: "flex",
        gap: 10
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        flex: 1
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: lbl
    }, "仕入単価（円/kg）"), /*#__PURE__*/React.createElement("input", {
      value: yUnit,
      onChange: e => setYUnit(e.target.value),
      inputMode: "decimal",
      style: inp,
      placeholder: "800"
    })), /*#__PURE__*/React.createElement("div", {
      style: {
        flex: 1
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: lbl
    }, "歩留まり（%）"), /*#__PURE__*/React.createElement("input", {
      value: yRate,
      onChange: e => setYRate(e.target.value),
      inputMode: "decimal",
      style: inp
    }))), ok && /*#__PURE__*/React.createElement("div", {
      style: {
        display: "flex",
        justifyContent: "space-around",
        marginTop: 16
      }
    }, cell("実質原価", `${Math.round(real)}円/kg`, "var(--ink)"), cell("100gあたり", `${Math.round(real / 10)}円`, "var(--sub)")), /*#__PURE__*/React.createElement("div", {
      style: {
        height: 1,
        background: "var(--line)",
        margin: "16px 0"
      }
    }), /*#__PURE__*/React.createElement("div", {
      style: {
        display: "flex",
        gap: 10,
        alignItems: "flex-end"
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        flex: 1
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: lbl
    }, "目標粗利率（%）"), /*#__PURE__*/React.createElement("input", {
      value: yMargin,
      onChange: e => setYMargin(e.target.value),
      inputMode: "decimal",
      style: inp
    })), /*#__PURE__*/React.createElement("div", {
      style: {
        flex: 2
      }
    }, rec != null && /*#__PURE__*/React.createElement("div", {
      style: {
        display: "flex",
        justifyContent: "space-around"
      }
    }, cell("推奨売価", `${Math.ceil(rec / 10)}円/100g`, "#2f6fb0"), cell("kgあたり", `${Math.ceil(rec)}円`, "var(--sub)")))));
  })(), sub === "nebiki" && (() => {
    const p1 = parseFloat(nPrice),
      r1 = parseFloat(nPct);
    const ok1 = !isNaN(p1) && p1 > 0 && !isNaN(r1) && r1 >= 0 && r1 <= 100;
    const after1 = ok1 ? Math.round(p1 * (1 - r1 / 100)) : null;
    const p2 = parseFloat(n2Price),
      y2 = parseFloat(n2Yen);
    const ok2 = !isNaN(p2) && p2 > 0 && !isNaN(y2) && y2 >= 0;
    return /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("div", {
      style: card
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        fontSize: 15,
        fontWeight: 900,
        color: "#2f6fb0",
        marginBottom: 14
      }
    }, "◯%引きの値段は？"), /*#__PURE__*/React.createElement("div", {
      style: {
        display: "flex",
        gap: 10
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        flex: 1
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: lbl
    }, "元の売価（円）"), /*#__PURE__*/React.createElement("input", {
      value: nPrice,
      onChange: e => setNPrice(e.target.value),
      inputMode: "decimal",
      style: inp,
      placeholder: "298"
    })), /*#__PURE__*/React.createElement("div", {
      style: {
        flex: 1
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: lbl
    }, "割引率（%）"), /*#__PURE__*/React.createElement("input", {
      value: nPct,
      onChange: e => setNPct(e.target.value),
      inputMode: "decimal",
      style: inp
    }))), ok1 && /*#__PURE__*/React.createElement("div", {
      style: {
        display: "flex",
        justifyContent: "space-around",
        marginTop: 16
      }
    }, cell("値引き後", `${after1}円`, "var(--primary)"), cell("値引き額", `${Math.round(p1 - after1)}円`, "var(--sub)"))), /*#__PURE__*/React.createElement("div", {
      style: card
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        fontSize: 15,
        fontWeight: 900,
        color: "#2f6fb0",
        marginBottom: 14
      }
    }, "◯円引きは何%相当？"), /*#__PURE__*/React.createElement("div", {
      style: {
        display: "flex",
        gap: 10
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        flex: 1
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: lbl
    }, "元の売価（円）"), /*#__PURE__*/React.createElement("input", {
      value: n2Price,
      onChange: e => setN2Price(e.target.value),
      inputMode: "decimal",
      style: inp,
      placeholder: "398"
    })), /*#__PURE__*/React.createElement("div", {
      style: {
        flex: 1
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: lbl
    }, "値引き額（円）"), /*#__PURE__*/React.createElement("input", {
      value: n2Yen,
      onChange: e => setN2Yen(e.target.value),
      inputMode: "decimal",
      style: inp
    }))), ok2 && /*#__PURE__*/React.createElement("div", {
      style: {
        display: "flex",
        justifyContent: "space-around",
        marginTop: 16
      }
    }, cell("割引率相当", `${(y2 / p2 * 100).toFixed(0)}%引き`, "var(--primary)"), cell("値引き後", `${Math.round(p2 - y2)}円`, "var(--sub)"))));
  })(), sub === "gram" && (() => {
    const a = parseFloat(g100),
      b = parseFloat(gWt);
    const ok1 = !isNaN(a) && a > 0 && !isNaN(b) && b > 0;
    const c2 = parseFloat(g2Sell),
      d2 = parseFloat(g2Wt);
    const ok2 = !isNaN(c2) && c2 > 0 && !isNaN(d2) && d2 > 0;
    return /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("div", {
      style: card
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        fontSize: 15,
        fontWeight: 900,
        color: "#2f6fb0",
        marginBottom: 14
      }
    }, "100g単価 → パック売価"), /*#__PURE__*/React.createElement("div", {
      style: {
        display: "flex",
        gap: 10
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        flex: 1
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: lbl
    }, "100g単価（円）"), /*#__PURE__*/React.createElement("input", {
      value: g100,
      onChange: e => setG100(e.target.value),
      inputMode: "decimal",
      style: inp,
      placeholder: "298"
    })), /*#__PURE__*/React.createElement("div", {
      style: {
        flex: 1
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: lbl
    }, "内容量（g）"), /*#__PURE__*/React.createElement("input", {
      value: gWt,
      onChange: e => setGWt(e.target.value),
      inputMode: "decimal",
      style: inp,
      placeholder: "240"
    }))), ok1 && /*#__PURE__*/React.createElement("div", {
      style: {
        display: "flex",
        justifyContent: "space-around",
        marginTop: 16
      }
    }, cell("売価", `${Math.ceil(a * b / 100)}円`, "#2f6fb0"), cell("税込（8%）", `${Math.ceil(a * b / 100 * 1.08)}円`, "var(--sub)"))), /*#__PURE__*/React.createElement("div", {
      style: card
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        fontSize: 15,
        fontWeight: 900,
        color: "#2f6fb0",
        marginBottom: 14
      }
    }, "パック売価 → 100g単価"), /*#__PURE__*/React.createElement("div", {
      style: {
        display: "flex",
        gap: 10
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        flex: 1
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: lbl
    }, "売価（円）"), /*#__PURE__*/React.createElement("input", {
      value: g2Sell,
      onChange: e => setG2Sell(e.target.value),
      inputMode: "decimal",
      style: inp,
      placeholder: "698"
    })), /*#__PURE__*/React.createElement("div", {
      style: {
        flex: 1
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: lbl
    }, "内容量（g）"), /*#__PURE__*/React.createElement("input", {
      value: g2Wt,
      onChange: e => setG2Wt(e.target.value),
      inputMode: "decimal",
      style: inp,
      placeholder: "240"
    }))), ok2 && /*#__PURE__*/React.createElement("div", {
      style: {
        display: "flex",
        justifyContent: "space-around",
        marginTop: 16
      }
    }, cell("100gあたり", `${Math.round(c2 / d2 * 100)}円`, "#2f6fb0"))));
  })(), sub === "shio" && (() => {
    const w = parseFloat(sWater),
      pc = parseFloat(sPct);
    const ok = !isNaN(w) && w > 0 && !isNaN(pc) && pc > 0 && pc <= 30;
    const salt = ok ? w * pc / 100 : null;
    return /*#__PURE__*/React.createElement("div", {
      style: card
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        fontSize: 15,
        fontWeight: 900,
        color: "#2f6fb0",
        marginBottom: 4
      }
    }, "立て塩（塩水）の塩の量"), /*#__PURE__*/React.createElement("div", {
      style: {
        fontSize: 11.5,
        color: "var(--sub)",
        marginBottom: 14
      }
    }, "目安：立て塩は3%前後（海水と同じくらい）。魚の下処理・臭み抜きに"), /*#__PURE__*/React.createElement("div", {
      style: {
        display: "flex",
        gap: 10
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        flex: 1
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: lbl
    }, "水の量（ml）"), /*#__PURE__*/React.createElement("input", {
      value: sWater,
      onChange: e => setSWater(e.target.value),
      inputMode: "decimal",
      style: inp
    })), /*#__PURE__*/React.createElement("div", {
      style: {
        flex: 1
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: lbl
    }, "濃度（%）"), /*#__PURE__*/React.createElement("input", {
      value: sPct,
      onChange: e => setSPct(e.target.value),
      inputMode: "decimal",
      style: inp
    }))), ok && /*#__PURE__*/React.createElement("div", {
      style: {
        display: "flex",
        justifyContent: "space-around",
        marginTop: 16
      }
    }, cell("塩の量", `${salt.toFixed(salt < 10 ? 1 : 0)}g`, "#2f6fb0"), cell("大さじ換算", `約${(salt / 18).toFixed(1)}杯`, "var(--sub)")));
  })(), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 11,
      color: "var(--faint)",
      textAlign: "center",
      marginTop: 4
    }
  }, "※ プロトタイプです。計算方法・表示・項目はご要望に合わせて調整できます。")));
}

// ===== 管理画面：パスワードで解錠 → 依頼一覧／アーカイブ管理 =====

;
Object.assign(window, {
  CalendarTab,
  CompetitorTab,
  IndustryTab,
  SoubaTab
});