/* GoodDay 鮮魚共有 — 21-tab-lab （試作システム：まだ本番では使わない道具をまとめる） */
var {
  useState
} = React;
function LabTab() {
  const [どれ, setどれ] = useState(() => {
    try {
      return localStorage.getItem("labMode") || "scan";
    } catch (e) {
      return "scan";
    }
  });
  const 選ぶ = k => {
    setどれ(k);
    try {
      localStorage.setItem("labMode", k);
    } catch (e) {}
  };
  const 品 = [["scan", "読み込み", "伝票PDFの向き・傾き・濃さを整える"], ["check", "伝票検算", "蛍光ペンで塗った金額を読んで合算する"]];
  return /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
    style: {
      maxWidth: 820,
      margin: "0 auto",
      padding: "6px 16px 0"
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      gap: 8,
      marginBottom: 6
    }
  }, 品.map(([k, 名, 説明]) => /*#__PURE__*/React.createElement("button", {
    key: k,
    onClick: () => 選ぶ(k),
    style: {
      flex: 1,
      border: "1px solid " + (どれ === k ? "var(--primary)" : "var(--line)"),
      background: どれ === k ? "var(--primary)" : "var(--card, #fff)",
      color: どれ === k ? "#fff" : "var(--text)",
      borderRadius: 11,
      padding: "11px 8px",
      cursor: "pointer",
      textAlign: "left"
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      display: "block",
      fontSize: 13.5,
      fontWeight: 900
    }
  }, 名), /*#__PURE__*/React.createElement("span", {
    style: {
      display: "block",
      fontSize: 11,
      marginTop: 3,
      lineHeight: 1.5,
      opacity: どれ === k ? 0.85 : 0.75
    }
  }, 説明))))), React.createElement(LazyTab, {
    tabKey: どれ
  }));
}
;
Object.assign(window, {
  LabTab
});