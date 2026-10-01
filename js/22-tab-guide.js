/* Nexus共有 — 22-tab-guide （手引き：渡すリンクと使い方。絵はすべてコードで描く） */
var {
  useState
} = React;

// いま開いているアドレスから組み立てる。引っ越しても直さなくていい。
function 元のURL() {
  try {
    const u = location.origin + location.pathname.replace(/index\.html$/, "");
    return u.replace(/\/$/, "") + "/";
  } catch (e) {
    return "/";
  }
}

/* ── 絵。画像ファイルは使わず、線で描く。
      文字色を継ぐので、明るい画面でも暗い画面でも勝手になじむ ── */
const 絵 = {
  リンク: /*#__PURE__*/React.createElement("svg", {
    viewBox: "0 0 64 64",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: "2.6",
    strokeLinecap: "round",
    strokeLinejoin: "round"
  }, /*#__PURE__*/React.createElement("rect", {
    x: "16",
    y: "6",
    width: "32",
    height: "52",
    rx: "6"
  }), /*#__PURE__*/React.createElement("path", {
    d: "M28 12h8"
  }), /*#__PURE__*/React.createElement("path", {
    d: "M23 30h12M23 38h18",
    opacity: ".55"
  }), /*#__PURE__*/React.createElement("circle", {
    cx: "32",
    cy: "50",
    r: "2.2"
  })),
  文面: /*#__PURE__*/React.createElement("svg", {
    viewBox: "0 0 64 64",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: "2.6",
    strokeLinecap: "round",
    strokeLinejoin: "round"
  }, /*#__PURE__*/React.createElement("path", {
    d: "M8 14h34a4 4 0 014 4v16a4 4 0 01-4 4H22l-10 8V38H8a0 0 0 010 0z"
  }), /*#__PURE__*/React.createElement("path", {
    d: "M16 22h18M16 29h12",
    opacity: ".55"
  }), /*#__PURE__*/React.createElement("path", {
    d: "M50 26h6a0 0 0 010 0v16a4 4 0 01-4 4h-2v8l-8-8",
    opacity: ".45"
  })),
  合言葉: /*#__PURE__*/React.createElement("svg", {
    viewBox: "0 0 64 64",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: "2.6",
    strokeLinecap: "round",
    strokeLinejoin: "round"
  }, /*#__PURE__*/React.createElement("path", {
    d: "M38 20a10 10 0 100 20 10 10 0 000-20z"
  }), /*#__PURE__*/React.createElement("path", {
    d: "M30 30H8M12 30v7M20 30v5"
  }), /*#__PURE__*/React.createElement("circle", {
    cx: "41",
    cy: "27",
    r: "2",
    fill: "currentColor",
    stroke: "none"
  })),
  切替: /*#__PURE__*/React.createElement("svg", {
    viewBox: "0 0 64 64",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: "2.6",
    strokeLinecap: "round",
    strokeLinejoin: "round"
  }, /*#__PURE__*/React.createElement("path", {
    d: "M12 24h34l-7-7M52 40H18l7 7"
  }), /*#__PURE__*/React.createElement("circle", {
    cx: "12",
    cy: "40",
    r: "3",
    opacity: ".5"
  }), /*#__PURE__*/React.createElement("circle", {
    cx: "52",
    cy: "24",
    r: "3",
    opacity: ".5"
  })),
  ホーム: /*#__PURE__*/React.createElement("svg", {
    viewBox: "0 0 64 64",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: "2.6",
    strokeLinecap: "round",
    strokeLinejoin: "round"
  }, /*#__PURE__*/React.createElement("rect", {
    x: "18",
    y: "6",
    width: "28",
    height: "52",
    rx: "6"
  }), /*#__PURE__*/React.createElement("path", {
    d: "M32 20v16M26 29l6 7 6-7"
  }), /*#__PURE__*/React.createElement("path", {
    d: "M24 46h16",
    opacity: ".55"
  })),
  鍵: /*#__PURE__*/React.createElement("svg", {
    viewBox: "0 0 64 64",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: "2.6",
    strokeLinecap: "round",
    strokeLinejoin: "round"
  }, /*#__PURE__*/React.createElement("rect", {
    x: "14",
    y: "28",
    width: "36",
    height: "26",
    rx: "5"
  }), /*#__PURE__*/React.createElement("path", {
    d: "M22 28v-8a10 10 0 0120 0v8"
  }), /*#__PURE__*/React.createElement("circle", {
    cx: "32",
    cy: "41",
    r: "3.2"
  })),
  読込: /*#__PURE__*/React.createElement("svg", {
    viewBox: "0 0 64 64",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: "2.6",
    strokeLinecap: "round",
    strokeLinejoin: "round"
  }, /*#__PURE__*/React.createElement("path", {
    d: "M52 32a20 20 0 11-6-14"
  }), /*#__PURE__*/React.createElement("path", {
    d: "M48 6v13H35"
  }))
};

/* 段：番号つきの一区切り。GuideTab の外に置く。中で定義すると、
   状態が変わるたびに React が別の部品と見なし、画面を作り直してしまう。 */
function 段({
  番,
  色,
  題,
  副,
  印,
  children
}) {
  return /*#__PURE__*/React.createElement("section", {
    style: {
      background: "var(--card, #fff)",
      borderRadius: 16,
      marginBottom: 14,
      boxShadow: "var(--card-shadow)",
      overflow: "hidden",
      position: "relative"
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      position: "absolute",
      left: 0,
      top: 0,
      bottom: 0,
      width: 5,
      background: 色
    }
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      padding: "16px 16px 17px 20px"
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      alignItems: "center",
      gap: 11,
      marginBottom: 副 ? 3 : 10
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      flexShrink: 0,
      width: 30,
      height: 30,
      borderRadius: "50%",
      background: 色,
      color: "#fff",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      fontSize: 16,
      fontWeight: 900,
      lineHeight: 1
    }
  }, 番), /*#__PURE__*/React.createElement("h3", {
    style: {
      margin: 0,
      fontSize: 17,
      fontWeight: 900,
      color: "var(--ink)",
      letterSpacing: ".01em"
    }
  }, 題), /*#__PURE__*/React.createElement("span", {
    style: {
      marginLeft: "auto",
      width: 30,
      height: 30,
      flexShrink: 0,
      color: 色,
      opacity: .9
    }
  }, 印)), 副 && /*#__PURE__*/React.createElement("p", {
    style: {
      margin: "0 0 11px 41px",
      fontSize: 12.5,
      color: "var(--sub)",
      lineHeight: 1.8
    }
  }, 副), children));
}
function GuideTab() {
  const [写した, set写した] = useState("");
  const 写す = async (印, 文字) => {
    let できた = false;
    try {
      await navigator.clipboard.writeText(文字);
      できた = true;
    } catch (e) {}
    if (!できた) {
      // 古い端末むけの逃げ道
      try {
        const t = document.createElement("textarea");
        t.value = 文字;
        t.style.position = "fixed";
        t.style.opacity = "0";
        document.body.appendChild(t);
        t.select();
        document.execCommand("copy");
        document.body.removeChild(t);
        できた = true;
      } catch (e) {}
    }
    set写した(できた ? 印 : "失敗:" + 印);
    try {
      navigator.vibrate && navigator.vibrate(12);
    } catch (e) {}
    setTimeout(() => set写した(""), 1900);
  };
  const 基 = 元のURL();
  const 青果URL = 基 + "?seika";
  const 鮮魚URL = 基;
  // 部門の色は、いまどちらの画面にいるかに関係なく固定する。
  // 青果は緑、鮮魚は青。暗い画面では地に沈むので明るい側へ振る。
  const 暗い = (() => {
    try {
      return document.documentElement.getAttribute("data-theme") === "dark";
    } catch (e) {
      return false;
    }
  })();
  const 青果字 = 暗い ? "#7FCB8B" : "#2f7a3a";
  const 鮮魚字 = 暗い ? "#8FBDE8" : "#2f6fb0";
  const 青果塗 = "#2f7a3a";
  const 鮮魚塗 = "#2f6fb0";
  const 文面青果 = "生鮮共有ページです。\n" + 青果URL + "\n\n" + "・下のリンクを開くと、青果の売場ポップが見られます。\n" + "・写真を撮って上げるだけで、他店にも共有されます。\n" + "・毎回ひらくのが面倒なら、ブラウザの共有ボタンから「ホーム画面に追加」しておくと、アプリのように開けます。";
  const 文面鮮魚 = "生鮮共有ページです。\n" + 鮮魚URL + "\n\n" + "・下のリンクを開くと、鮮魚の売場ポップが見られます。\n" + "・写真を撮って上げるだけで、他店にも共有されます。\n" + "・毎回ひらくのが面倒なら、ブラウザの共有ボタンから「ホーム画面に追加」しておくと、アプリのように開けます。";

  /* ── 部品 ── */

  const 写すボタン = (印, 幅広) => ({
    border: "none",
    borderRadius: 10,
    padding: 幅広 ? "12px 14px" : "11px 15px",
    cursor: "pointer",
    flexShrink: 0,
    fontFamily: "inherit",
    fontSize: 13,
    fontWeight: 900,
    whiteSpace: "nowrap",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    background: 写した === 印 ? "#1d7d5d" : "var(--fill)",
    color: "#fff",
    transition: "background .18s ease"
  });
  const 字 = 印 => 写した === 印 ? "写しました" : 写した === "失敗:" + 印 ? "できず" : "コピー";
  const コピー印 = /*#__PURE__*/React.createElement("svg", {
    width: "14",
    height: "14",
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: "2.2",
    strokeLinecap: "round",
    strokeLinejoin: "round"
  }, /*#__PURE__*/React.createElement("rect", {
    x: "9",
    y: "9",
    width: "12",
    height: "12",
    rx: "2"
  }), /*#__PURE__*/React.createElement("path", {
    d: "M5 15V5a2 2 0 012-2h10"
  }));
  const 済印 = /*#__PURE__*/React.createElement("svg", {
    width: "14",
    height: "14",
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: "2.8",
    strokeLinecap: "round",
    strokeLinejoin: "round"
  }, /*#__PURE__*/React.createElement("path", {
    d: "M4 12.5l5 5L20 6"
  }));

  // 「宛先 ＋ アドレス ＋ コピー」のひとかたまり
  const リンク行 = (印, 宛, 値, 色, 塗) => /*#__PURE__*/React.createElement("div", {
    style: {
      marginBottom: 12
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 12.5,
      fontWeight: 900,
      color: 色,
      marginBottom: 6
    }
  }, 宛), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      gap: 8,
      alignItems: "stretch"
    }
  }, /*#__PURE__*/React.createElement("code", {
    style: {
      flex: 1,
      minWidth: 0,
      background: "var(--chip)",
      color: "var(--ink)",
      borderRadius: 10,
      padding: "10px 12px",
      fontSize: 12,
      fontWeight: 700,
      wordBreak: "break-all",
      lineHeight: 1.6,
      fontFamily: "ui-monospace, Menlo, monospace",
      display: "flex",
      alignItems: "center"
    }
  }, 値), /*#__PURE__*/React.createElement("button", {
    onClick: () => 写す(印, 値),
    style: {
      ...写すボタン(印),
      background: 写した === 印 ? "#1d7d5d" : 塗
    }
  }, 写した === 印 ? 済印 : コピー印, 字(印))));
  return /*#__PURE__*/React.createElement("div", {
    className: "min-vh",
    style: {
      background: "var(--bg)"
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      background: "linear-gradient(135deg, #15425f 0%, #1d6b8a 55%, #2f8f6a 100%)",
      padding: "calc(env(safe-area-inset-top) + 26px) 16px 26px",
      position: "relative",
      overflow: "hidden"
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      position: "absolute",
      inset: -40,
      background: "radial-gradient(40% 50% at 15% 20%, rgba(255,255,255,.14), transparent 70%)," + "radial-gradient(40% 50% at 85% 80%, rgba(120,220,160,.16), transparent 70%)"
    }
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      maxWidth: 820,
      margin: "0 auto",
      position: "relative"
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 11,
      fontWeight: 800,
      letterSpacing: ".3em",
      color: "rgba(255,255,255,.72)"
    }
  }, "GUIDE"), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 23,
      fontWeight: 900,
      color: "#fff",
      lineHeight: 1.35,
      marginTop: 4
    }
  }, "\u751F\u9BAE\u5171\u6709\u30B5\u30A4\u30C8\u306E\u4F7F\u3044\u65B9"), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 13,
      color: "rgba(255,255,255,.88)",
      marginTop: 7,
      lineHeight: 1.7
    }
  }, "\u307F\u3093\u306A\u3067\u30DD\u30C3\u30D7\u3092\u4F5C\u3063\u3066\u3001\u5171\u6709\u3057\u3066\u3001\u58F2\u5834\u3092\u3082\u3063\u3068\u697D\u3057\u304F\u3002", /*#__PURE__*/React.createElement("br", null), "\u4EBA\u306B\u6E21\u3059\u3068\u304D\u306E\u4E00\u5F0F\u3067\u3059\u3002", /*#__PURE__*/React.createElement("b", null, "\u62BC\u305B\u3070\u305D\u306E\u307E\u307E\u5199\u305B\u307E\u3059\u3002")))), /*#__PURE__*/React.createElement("div", {
    style: {
      maxWidth: 820,
      margin: "0 auto",
      padding: "16px 14px 140px"
    }
  }, /*#__PURE__*/React.createElement(段, {
    番: "1",
    色: "#2f6fb0",
    題: "\u6E21\u3059\u30EA\u30F3\u30AF",
    印: 絵.リンク,
    副: "\u76F8\u624B\u306E\u90E8\u9580\u306B\u5408\u308F\u305B\u3066\u6E21\u3057\u3066\u304F\u3060\u3055\u3044\u3002\u4E00\u5EA6\u3072\u3089\u3051\u3070\u305D\u306E\u7AEF\u672B\u304C\u899A\u3048\u308B\u306E\u3067\u3001\u6B21\u304B\u3089\u306F\u5408\u8A00\u8449\u306A\u3057\u306E\u30EA\u30F3\u30AF\u3067\u3082\u540C\u3058\u90E8\u9580\u3067\u958B\u304D\u307E\u3059\u3002"
  }, リンク行("seika", "🥬 青果の人へ", 青果URL, 青果字, 青果塗), リンク行("sengyo", "🐟 鮮魚の人へ", 鮮魚URL, 鮮魚字, 鮮魚塗)), /*#__PURE__*/React.createElement(段, {
    番: "2",
    色: "#b53c63",
    題: "\u305D\u306E\u307E\u307E\u9001\u308C\u308B\u6587\u9762",
    印: 絵.文面,
    副: "LINE\u3084\u30E1\u30FC\u30EB\u306B\u8CBC\u308B\u3060\u3051\u306E\u5F62\u306B\u3057\u3066\u3042\u308A\u307E\u3059\u3002\u540D\u524D\u3084\u4E00\u8A00\u3092\u8DB3\u3057\u3066\u4F7F\u3063\u3066\u304F\u3060\u3055\u3044\u3002"
  }, /*#__PURE__*/React.createElement("button", {
    onClick: () => 写す("文青", 文面青果),
    style: {
      ...写すボタン("文青", true),
      width: "100%",
      marginBottom: 8,
      background: 写した === "文青" ? "#1d7d5d" : 青果塗
    }
  }, 写した === "文青" ? 済印 : コピー印, 写した === "文青" ? "写しました" : "青果むけの文面をコピー"), /*#__PURE__*/React.createElement("button", {
    onClick: () => 写す("文鮮", 文面鮮魚),
    style: {
      ...写すボタン("文鮮", true),
      width: "100%",
      background: 写した === "文鮮" ? "#1d7d5d" : 鮮魚塗
    }
  }, 写した === "文鮮" ? 済印 : コピー印, 写した === "文鮮" ? "写しました" : "鮮魚むけの文面をコピー"), /*#__PURE__*/React.createElement("div", {
    style: {
      background: "var(--chip)",
      borderRadius: 10,
      padding: "12px 13px",
      marginTop: 11,
      fontSize: 12,
      color: "var(--text)",
      lineHeight: 1.9,
      whiteSpace: "pre-wrap",
      borderLeft: "3px solid #b53c63"
    }
  }, 文面青果)), /*#__PURE__*/React.createElement(段, {
    番: "3",
    色: "#b35f17",
    題: "\u5408\u8A00\u8449\u306E\u4E00\u89A7",
    印: 絵.合言葉,
    副: "\u30A2\u30C9\u30EC\u30B9\u306E\u3046\u3057\u308D\u306B\u4ED8\u3051\u308B\u3068\u3001\u305D\u306E\u90E8\u9580\u3067\u958B\u304D\u307E\u3059\u3002\u3069\u308C\u3092\u4F7F\u3063\u3066\u3082\u540C\u3058\u3067\u3059\u3002"
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      border: "1px solid var(--line)",
      borderRadius: 11,
      overflow: "hidden"
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: "grid",
      gridTemplateColumns: "1fr 1fr",
      background: "var(--chip)",
      fontSize: 12,
      fontWeight: 900,
      color: "var(--ink)"
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      padding: "9px 11px"
    }
  }, "\uD83E\uDD6C \u9752\u679C\u306B\u306A\u308B"), /*#__PURE__*/React.createElement("div", {
    style: {
      padding: "9px 11px",
      borderLeft: "1px solid var(--line)"
    }
  }, "\uD83D\uDC1F \u9BAE\u9B5A\u306B\u306A\u308B")), [["?seika", "?sengyo"], ["?yasai", "?sakana"], ["?produce", "?fish"], ["?dept=seika", "?dept=fish"], ["#seika", "#sengyo"]].map(([a, b]) => /*#__PURE__*/React.createElement("div", {
    key: a,
    style: {
      display: "grid",
      gridTemplateColumns: "1fr 1fr",
      borderTop: "1px solid var(--line)",
      fontSize: 12.5,
      fontWeight: 700,
      fontFamily: "ui-monospace, Menlo, monospace",
      color: "var(--text)"
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      padding: "9px 11px"
    }
  }, a), /*#__PURE__*/React.createElement("div", {
    style: {
      padding: "9px 11px",
      borderLeft: "1px solid var(--line)"
    }
  }, b)))), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 12,
      color: "var(--sub)",
      lineHeight: 1.8,
      marginTop: 10
    }
  }, "\u4F8B\uFF1A", /*#__PURE__*/React.createElement("code", {
    style: {
      background: "var(--chip)",
      color: "var(--ink)",
      borderRadius: 6,
      padding: "2px 6px",
      fontSize: 11.5,
      wordBreak: "break-all"
    }
  }, 基, /*#__PURE__*/React.createElement("b", null, "?seika")))), /*#__PURE__*/React.createElement(段, {
    番: "4",
    色: "#1f7a90",
    題: "\u90E8\u9580\u306E\u304B\u3048\u65B9",
    印: 絵.切替
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 13,
      color: "var(--text)",
      lineHeight: 1.95
    }
  }, "\u4E00\u89A7\u306E\u4E0A\u3001\u6587\u5B57\u30B5\u30A4\u30BA\u306E\u4E26\u3073\u306B\u3042\u308B ", /*#__PURE__*/React.createElement("b", {
    style: {
      color: 鮮魚字
    }
  }, "\u21C4 \u9BAE\u9B5A"), "\uFF08\u307E\u305F\u306F ", /*#__PURE__*/React.createElement("b", {
    style: {
      color: 青果字
    }
  }, "\u21C4 \u9752\u679C"), "\uFF09\u3092\u62BC\u3059\u3068\u5165\u308C\u304B\u308F\u308A\u307E\u3059\u3002", /*#__PURE__*/React.createElement("br", null), "\u753B\u9762\u306E\u8272\u3082", /*#__PURE__*/React.createElement("b", null, "\u9752\u3068\u7DD1"), "\u3067\u5909\u308F\u308B\u306E\u3067\u3001\u3044\u307E\u3069\u3061\u3089\u306B\u3044\u308B\u304B\u306F\u4E00\u76EE\u3067\u5206\u304B\u308A\u307E\u3059\u3002"), /*#__PURE__*/React.createElement("div", {
    style: {
      marginTop: 11,
      background: "var(--chip)",
      borderRadius: 10,
      padding: "11px 13px",
      fontSize: 12.5,
      color: "var(--text)",
      lineHeight: 1.85,
      borderLeft: "3px solid #1f7a90"
    }
  }, "\u30DD\u30C3\u30D7\u306F\u90E8\u9580\u3054\u3068\u306B\u5206\u304B\u308C\u3066\u3044\u307E\u3059\u3002", /*#__PURE__*/React.createElement("b", null, "\u9BAE\u9B5A\u3067\u4E0A\u3052\u305F\u3082\u306E\u304C\u9752\u679C\u306B\u51FA\u308B\u3053\u3068\u306F\u3042\u308A\u307E\u305B\u3093\u3002"))), /*#__PURE__*/React.createElement(段, {
    番: "5",
    色: "#35743d",
    題: "\u30DB\u30FC\u30E0\u753B\u9762\u306B\u7F6E\u304F",
    印: 絵.ホーム,
    副: "\u6BCE\u56DE\u30A2\u30C9\u30EC\u30B9\u3092\u5165\u308C\u305A\u306B\u6E08\u307F\u307E\u3059\u3002\u5408\u8A00\u8449\u3064\u304D\u306E\u30EA\u30F3\u30AF\u304B\u3089\u8FFD\u52A0\u3059\u308C\u3070\u3001\u305D\u306E\u90E8\u9580\u3067\u958B\u304D\u307E\u3059\u3002"
  }, [["iPhone（Safari）", "下の共有ボタン", "「ホーム画面に追加」"], ["Android（Chrome）", "右上の ⋮", "「ホーム画面に追加」"]].map(([機, 一, 二]) => /*#__PURE__*/React.createElement("div", {
    key: 機,
    style: {
      background: "var(--chip)",
      borderRadius: 10,
      padding: "11px 13px",
      marginBottom: 8
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 12.5,
      fontWeight: 900,
      color: "var(--ink)",
      marginBottom: 6
    }
  }, 機), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      alignItems: "center",
      gap: 7,
      flexWrap: "wrap",
      fontSize: 12.5,
      color: "var(--text)"
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      background: "#35743d",
      color: "#fff",
      width: 18,
      height: 18,
      borderRadius: "50%",
      display: "inline-flex",
      alignItems: "center",
      justifyContent: "center",
      fontSize: 11,
      fontWeight: 900
    }
  }, "1"), /*#__PURE__*/React.createElement("span", null, "\u3072\u3089\u304F"), /*#__PURE__*/React.createElement("span", {
    style: {
      color: "var(--faint)"
    }
  }, "\u2192"), /*#__PURE__*/React.createElement("span", null, 一), /*#__PURE__*/React.createElement("span", {
    style: {
      color: "var(--faint)"
    }
  }, "\u2192"), /*#__PURE__*/React.createElement("span", {
    style: {
      background: "#35743d",
      color: "#fff",
      width: 18,
      height: 18,
      borderRadius: "50%",
      display: "inline-flex",
      alignItems: "center",
      justifyContent: "center",
      fontSize: 11,
      fontWeight: 900
    }
  }, "2"), /*#__PURE__*/React.createElement("b", {
    style: {
      color: "var(--ink)"
    }
  }, 二))))), /*#__PURE__*/React.createElement(段, {
    番: "6",
    色: "#6b4ea0",
    題: "\u756A\u53F7\u306B\u3064\u3044\u3066",
    印: 絵.鍵
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 13,
      color: "var(--text)",
      lineHeight: 1.95
    }
  }, "\u5E97\u8217\u652F\u63F4\u30FB\u5869\u5E72\u767A\u6CE8\u30FB\u8A66\u4F5C\u30B7\u30B9\u30C6\u30E0\u30FB\u7BA1\u7406\u753B\u9762\u306B\u306F\u756A\u53F7\u304C\u304B\u304B\u3063\u3066\u3044\u307E\u3059\u3002"), /*#__PURE__*/React.createElement("div", {
    style: {
      marginTop: 10,
      background: "var(--chip)",
      borderRadius: 10,
      padding: "11px 13px",
      fontSize: 12.5,
      color: "var(--text)",
      lineHeight: 1.85,
      borderLeft: "3px solid #6b4ea0"
    }
  }, /*#__PURE__*/React.createElement("b", null, "\u756A\u53F7\u306F\u3053\u3053\u306B\u306F\u66F8\u304D\u307E\u305B\u3093\u3002"), "\u5FC5\u8981\u306A\u4EBA\u306B\u3060\u3051\u3001\u52DD\u90E8\u304B\u3089\u76F4\u63A5\u304A\u4F1D\u3048\u3057\u307E\u3059\u3002")), /*#__PURE__*/React.createElement(段, {
    番: "7",
    色: "#1d3a57",
    題: "\u958B\u304B\u306A\u3044\u3068\u304D",
    印: 絵.読込
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 13,
      color: "var(--text)",
      lineHeight: 1.95
    }
  }, "\u96FB\u6CE2\u306E\u5F31\u3044\u6240\u3067\u306F\u3001\u958B\u304F\u306E\u306B\u6642\u9593\u304C\u304B\u304B\u308B\u3053\u3068\u304C\u3042\u308A\u307E\u3059\u3002", /*#__PURE__*/React.createElement("br", null), "\u6B62\u307E\u3063\u305F\u3088\u3046\u306B\u898B\u3048\u305F\u3089\u3001\u753B\u9762\u306B\u51FA\u308B ", /*#__PURE__*/React.createElement("b", null, "\u300C\u8AAD\u307F\u8FBC\u307F\u76F4\u3059\u300D"), " \u3092\u62BC\u3057\u3066\u304F\u3060\u3055\u3044\u3002", /*#__PURE__*/React.createElement("br", null), "\u305D\u308C\u3067\u3082\u99C4\u76EE\u306A\u3089\u3001\u96FB\u6CE2\u306E\u826F\u3044\u6240\u3067\u3082\u3046\u4E00\u5EA6\u3072\u3089\u3044\u3066\u307F\u3066\u304F\u3060\u3055\u3044\u3002")), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 11.5,
      color: "var(--faint)",
      textAlign: "center",
      lineHeight: 1.9,
      marginTop: 18
    }
  }, "\u3053\u306E\u30DA\u30FC\u30B8\u306E\u30EA\u30F3\u30AF\u306F\u3001\u3044\u307E\u958B\u3044\u3066\u3044\u308B\u30A2\u30C9\u30EC\u30B9\u304B\u3089\u4F5C\u3063\u3066\u3044\u307E\u3059\u3002", /*#__PURE__*/React.createElement("br", null), "\u5F15\u3063\u8D8A\u3057\u3066\u3082\u66F8\u304D\u76F4\u3059\u5FC5\u8981\u306F\u3042\u308A\u307E\u305B\u3093\u3002")));
}
;
Object.assign(window, {
  GuideTab
});