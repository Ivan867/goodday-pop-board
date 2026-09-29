/* Nexus共有 — 22-tab-guide （手引き：渡すリンクと使い方を1ページに） */
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
    setTimeout(() => set写した(""), 1800);
  };
  const 基 = 元のURL();
  const 青果URL = 基 + "?seika";
  const 鮮魚URL = 基;
  const 文面青果 = "生鮮共有ページです。\n" + 青果URL + "\n\n" + "・下のリンクを開くと、青果の売場ポップが見られます。\n" + "・写真を撮って上げるだけで、他店にも共有されます。\n" + "・毎回ひらくのが面倒なら、ブラウザの共有ボタンから「ホーム画面に追加」しておくと、アプリのように開けます。";
  const 文面鮮魚 = "生鮮共有ページです。\n" + 鮮魚URL + "\n\n" + "・下のリンクを開くと、鮮魚の売場ポップが見られます。\n" + "・写真を撮って上げるだけで、他店にも共有されます。\n" + "・毎回ひらくのが面倒なら、ブラウザの共有ボタンから「ホーム画面に追加」しておくと、アプリのように開けます。";
  const 枠 = {
    background: "var(--card, #fff)",
    border: "1px solid var(--line)",
    borderRadius: 14,
    padding: "14px 15px",
    marginBottom: 12
  };
  const 見出し = {
    fontSize: 14,
    fontWeight: 900,
    color: "var(--ink)",
    marginBottom: 4
  };
  const 説明 = {
    fontSize: 12.5,
    color: "var(--sub)",
    lineHeight: 1.8,
    marginBottom: 11
  };
  const 写すボタン = 印 => ({
    border: "none",
    borderRadius: 9,
    padding: "10px 14px",
    cursor: "pointer",
    flexShrink: 0,
    fontFamily: "inherit",
    fontSize: 13,
    fontWeight: 900,
    whiteSpace: "nowrap",
    background: 写した === 印 ? "#1d9e75" : "var(--primary-soft)",
    color: "#fff"
  });
  const 字 = 印 => 写した === 印 ? "写した" : 写した === "失敗:" + 印 ? "できず" : "コピー";

  // 「値＋コピーボタン」のひとかたまり
  const 一行 = (印, 値, 色) => /*#__PURE__*/React.createElement("div", {
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
      color: 色 || "var(--ink)",
      borderRadius: 9,
      padding: "10px 12px",
      fontSize: 12.5,
      fontWeight: 700,
      wordBreak: "break-all",
      lineHeight: 1.6,
      fontFamily: "ui-monospace, Menlo, monospace"
    }
  }, 値), /*#__PURE__*/React.createElement("button", {
    onClick: () => 写す(印, 値),
    style: 写すボタン(印)
  }, 字(印)));
  return /*#__PURE__*/React.createElement("div", {
    className: "min-vh",
    style: {
      background: "var(--bg)"
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      background: "linear-gradient(180deg, var(--soft), var(--chip))",
      padding: "calc(env(safe-area-inset-top) + 20px) 16px 20px"
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      maxWidth: 820,
      margin: "0 auto"
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      color: "var(--primary)",
      fontSize: 18,
      fontWeight: 900
    }
  }, "\u624B\u5F15\u304D"), /*#__PURE__*/React.createElement("div", {
    style: {
      color: "var(--sub)",
      fontSize: 12,
      marginTop: 2
    }
  }, "\u4EBA\u306B\u6E21\u3059\u3068\u304D\u306E\u4E00\u5F0F\u3002\u62BC\u305B\u3070\u305D\u306E\u307E\u307E\u5199\u305B\u307E\u3059"))), /*#__PURE__*/React.createElement("div", {
    style: {
      maxWidth: 820,
      margin: "0 auto",
      padding: "16px 16px 140px"
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: 枠
  }, /*#__PURE__*/React.createElement("div", {
    style: 見出し
  }, "\u2460 \u6E21\u3059\u30EA\u30F3\u30AF"), /*#__PURE__*/React.createElement("div", {
    style: 説明
  }, "\u76F8\u624B\u306E\u90E8\u9580\u306B\u5408\u308F\u305B\u3066\u6E21\u3057\u3066\u304F\u3060\u3055\u3044\u3002", /*#__PURE__*/React.createElement("b", null, "\u4E00\u5EA6\u3072\u3089\u3051\u3070\u305D\u306E\u7AEF\u672B\u304C\u899A\u3048\u308B"), "\u306E\u3067\u3001\u6B21\u304B\u3089\u306F\u5408\u8A00\u8449\u306A\u3057\u306E\u30EA\u30F3\u30AF\u3067\u3082\u540C\u3058\u90E8\u9580\u3067\u958B\u304D\u307E\u3059\u3002"), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 12.5,
      fontWeight: 900,
      color: "#3f8447",
      marginBottom: 6
    }
  }, "\u9752\u679C\u306E\u4EBA\u3078"), 一行("seika", 青果URL, "#1d6b2e"), /*#__PURE__*/React.createElement("div", {
    style: {
      height: 12
    }
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 12.5,
      fontWeight: 900,
      color: "var(--primary-soft)",
      marginBottom: 6
    }
  }, "\u9BAE\u9B5A\u306E\u4EBA\u3078"), 一行("sengyo", 鮮魚URL)), /*#__PURE__*/React.createElement("div", {
    style: 枠
  }, /*#__PURE__*/React.createElement("div", {
    style: 見出し
  }, "\u2461 \u305D\u306E\u307E\u307E\u9001\u308C\u308B\u6587\u9762"), /*#__PURE__*/React.createElement("div", {
    style: 説明
  }, "LINE\u3084\u30E1\u30FC\u30EB\u306B\u8CBC\u308B\u3060\u3051\u306E\u5F62\u306B\u3057\u3066\u3042\u308A\u307E\u3059\u3002\u540D\u524D\u3084\u4E00\u8A00\u3092\u8DB3\u3057\u3066\u4F7F\u3063\u3066\u304F\u3060\u3055\u3044\u3002"), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      gap: 8,
      marginBottom: 8
    }
  }, /*#__PURE__*/React.createElement("button", {
    onClick: () => 写す("文青", 文面青果),
    style: {
      ...写すボタン("文青"),
      flex: 1,
      background: 写した === "文青" ? "#1d9e75" : "#3f8447"
    }
  }, 写した === "文青" ? "写した" : "青果むけの文面をコピー")), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      gap: 8
    }
  }, /*#__PURE__*/React.createElement("button", {
    onClick: () => 写す("文鮮", 文面鮮魚),
    style: {
      ...写すボタン("文鮮"),
      flex: 1
    }
  }, 写した === "文鮮" ? "写した" : "鮮魚むけの文面をコピー")), /*#__PURE__*/React.createElement("div", {
    style: {
      background: "var(--chip)",
      borderRadius: 9,
      padding: "11px 12px",
      marginTop: 10,
      fontSize: 12,
      color: "var(--sub)",
      lineHeight: 1.9,
      whiteSpace: "pre-wrap"
    }
  }, 文面青果)), /*#__PURE__*/React.createElement("div", {
    style: 枠
  }, /*#__PURE__*/React.createElement("div", {
    style: 見出し
  }, "\u2462 \u5408\u8A00\u8449\u306E\u4E00\u89A7"), /*#__PURE__*/React.createElement("div", {
    style: 説明
  }, "\u30A2\u30C9\u30EC\u30B9\u306E\u3046\u3057\u308D\u306B\u4ED8\u3051\u308B\u3068\u3001\u305D\u306E\u90E8\u9580\u3067\u958B\u304D\u307E\u3059\u3002\u3069\u308C\u3092\u4F7F\u3063\u3066\u3082\u540C\u3058\u3067\u3059\u3002"), /*#__PURE__*/React.createElement("div", {
    style: {
      border: "1px solid var(--line)",
      borderRadius: 10,
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
  }, "\u9752\u679C\u306B\u306A\u308B"), /*#__PURE__*/React.createElement("div", {
    style: {
      padding: "9px 11px",
      borderLeft: "1px solid var(--line)"
    }
  }, "\u9BAE\u9B5A\u306B\u306A\u308B")), [["?seika", "?sengyo"], ["?yasai", "?sakana"], ["?produce", "?fish"], ["?dept=seika", "?dept=fish"], ["#seika", "#sengyo"]].map(([a, b], i) => /*#__PURE__*/React.createElement("div", {
    key: a,
    style: {
      display: "grid",
      gridTemplateColumns: "1fr 1fr",
      borderTop: "1px solid var(--line)",
      fontSize: 12.5,
      fontWeight: 700,
      fontFamily: "ui-monospace, Menlo, monospace"
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      padding: "9px 11px",
      color: "#1d6b2e"
    }
  }, a), /*#__PURE__*/React.createElement("div", {
    style: {
      padding: "9px 11px",
      borderLeft: "1px solid var(--line)",
      color: "var(--soft-text)"
    }
  }, b))))), /*#__PURE__*/React.createElement("div", {
    style: 枠
  }, /*#__PURE__*/React.createElement("div", {
    style: 見出し
  }, "\u2463 \u90E8\u9580\u306E\u304B\u3048\u65B9"), /*#__PURE__*/React.createElement("div", {
    style: 説明
  }, "\u4E00\u89A7\u306E\u4E0A\u3001\u6587\u5B57\u30B5\u30A4\u30BA\u306E\u4E26\u3073\u306B\u3042\u308B ", /*#__PURE__*/React.createElement("b", null, "\u21C4 \u9BAE\u9B5A"), "\uFF08\u307E\u305F\u306F ", /*#__PURE__*/React.createElement("b", null, "\u21C4 \u9752\u679C"), "\uFF09\u3092\u62BC\u3059\u3068\u5165\u308C\u304B\u308F\u308A\u307E\u3059\u3002 \u753B\u9762\u306E\u8272\u3082\u9752\u3068\u7DD1\u3067\u5909\u308F\u308B\u306E\u3067\u3001\u3044\u307E\u3069\u3061\u3089\u306B\u3044\u308B\u304B\u306F\u4E00\u76EE\u3067\u5206\u304B\u308A\u307E\u3059\u3002", /*#__PURE__*/React.createElement("br", null), "\u30DD\u30C3\u30D7\u306F\u90E8\u9580\u3054\u3068\u306B\u5206\u304B\u308C\u3066\u3044\u307E\u3059\u3002\u9BAE\u9B5A\u3067\u4E0A\u3052\u305F\u3082\u306E\u304C\u9752\u679C\u306B\u51FA\u308B\u3053\u3068\u306F\u3042\u308A\u307E\u305B\u3093\u3002")), /*#__PURE__*/React.createElement("div", {
    style: 枠
  }, /*#__PURE__*/React.createElement("div", {
    style: 見出し
  }, "\u2464 \u30DB\u30FC\u30E0\u753B\u9762\u306B\u7F6E\u304F"), /*#__PURE__*/React.createElement("div", {
    style: 説明
  }, /*#__PURE__*/React.createElement("b", null, "iPhone"), "\uFF1ASafari\u3067\u3072\u3089\u304F \u2192 \u4E0B\u306E\u5171\u6709\u30DC\u30BF\u30F3 \u2192 \u300C\u30DB\u30FC\u30E0\u753B\u9762\u306B\u8FFD\u52A0\u300D", /*#__PURE__*/React.createElement("br", null), /*#__PURE__*/React.createElement("b", null, "Android"), "\uFF1AChrome\u3067\u3072\u3089\u304F \u2192 \u53F3\u4E0A\u306E \u2026 \u2192 \u300C\u30DB\u30FC\u30E0\u753B\u9762\u306B\u8FFD\u52A0\u300D", /*#__PURE__*/React.createElement("br", null), "\u30A2\u30D7\u30EA\u306E\u3088\u3046\u306B\u958B\u3051\u3066\u3001\u6BCE\u56DE\u30A2\u30C9\u30EC\u30B9\u3092\u5165\u308C\u305A\u306B\u6E08\u307F\u307E\u3059\u3002\u5408\u8A00\u8449\u3064\u304D\u306E\u30EA\u30F3\u30AF\u304B\u3089\u8FFD\u52A0\u3059\u308C\u3070\u3001\u305D\u306E\u90E8\u9580\u3067\u958B\u304D\u307E\u3059\u3002")), /*#__PURE__*/React.createElement("div", {
    style: 枠
  }, /*#__PURE__*/React.createElement("div", {
    style: 見出し
  }, "\u2465 \u756A\u53F7\u306B\u3064\u3044\u3066"), /*#__PURE__*/React.createElement("div", {
    style: 説明
  }, "\u5E97\u8217\u652F\u63F4\u30FB\u5869\u5E72\u767A\u6CE8\u30FB\u8A66\u4F5C\u30B7\u30B9\u30C6\u30E0\u30FB\u7BA1\u7406\u753B\u9762\u306B\u306F\u756A\u53F7\u304C\u304B\u304B\u3063\u3066\u3044\u307E\u3059\u3002 \u756A\u53F7\u306F\u3053\u3053\u306B\u306F\u66F8\u304D\u307E\u305B\u3093\u3002\u5FC5\u8981\u306A\u4EBA\u306B\u3060\u3051\u3001\u52DD\u90E8\u304B\u3089\u76F4\u63A5\u304A\u4F1D\u3048\u3057\u307E\u3059\u3002")), /*#__PURE__*/React.createElement("div", {
    style: 枠
  }, /*#__PURE__*/React.createElement("div", {
    style: 見出し
  }, "\u2466 \u958B\u304B\u306A\u3044\u3068\u304D"), /*#__PURE__*/React.createElement("div", {
    style: 説明
  }, "\u96FB\u6CE2\u306E\u5F31\u3044\u6240\u3067\u306F\u3001\u958B\u304F\u306E\u306B\u6642\u9593\u304C\u304B\u304B\u308B\u3053\u3068\u304C\u3042\u308A\u307E\u3059\u3002 \u6B62\u307E\u3063\u305F\u3088\u3046\u306B\u898B\u3048\u305F\u3089\u3001\u753B\u9762\u306B\u51FA\u308B ", /*#__PURE__*/React.createElement("b", null, "\u300C\u8AAD\u307F\u8FBC\u307F\u76F4\u3059\u300D"), " \u3092\u62BC\u3057\u3066\u304F\u3060\u3055\u3044\u3002 \u305D\u308C\u3067\u3082\u99C4\u76EE\u306A\u3089\u3001\u96FB\u6CE2\u306E\u826F\u3044\u6240\u3067\u3082\u3046\u4E00\u5EA6\u3072\u3089\u3044\u3066\u307F\u3066\u304F\u3060\u3055\u3044\u3002")), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 11.5,
      color: "var(--faint)",
      textAlign: "center",
      lineHeight: 1.9,
      marginTop: 4
    }
  }, "\u3053\u306E\u30DA\u30FC\u30B8\u306E\u30EA\u30F3\u30AF\u306F\u3001\u3044\u307E\u958B\u3044\u3066\u3044\u308B\u30A2\u30C9\u30EC\u30B9\u304B\u3089\u4F5C\u3063\u3066\u3044\u307E\u3059\u3002", /*#__PURE__*/React.createElement("br", null), "\u5F15\u3063\u8D8A\u3057\u3066\u3082\u66F8\u304D\u76F4\u3059\u5FC5\u8981\u306F\u3042\u308A\u307E\u305B\u3093\u3002")));
}
;
Object.assign(window, {
  GuideTab
});