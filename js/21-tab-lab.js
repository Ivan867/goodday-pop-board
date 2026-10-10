/* Nexus共有 — 21-tab-lab （試作システム：まだ本番では使わない道具をまとめる） */
var {
  useState
} = React;

// 番号はファイルに書かない。サーバー側（check_secret_limited）で照合する（2026-10-10）

function LabTab() {
  const [開いた, set開いた] = useState(() => {
    try {
      return sessionStorage.getItem("labOpen") === "1";
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
      const r = await api.verifyPasswordEx("lab", 番号.trim());
      if (r.ok) {
        set開いた(true);
        try {
          sessionStorage.setItem("labOpen", "1");
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
  const 品 = [["scan", "読み込み", "伝票PDFの向き・傾き・濃さを整える"], ["check", "伝票検算", "蛍光ペンで塗った金額を読んで合算する"], ["barcode", "バーコード", "発注用のバーコードを作って印刷する"], ["shio", "塩干発注", "品目の一覧と資料（書き換えは管理の合言葉）"]];
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
    }, "\u8A66\u4F5C\u30B7\u30B9\u30C6\u30E0"), /*#__PURE__*/React.createElement("div", {
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
      background: どれ === k ? "var(--fill)" : "var(--card, #fff)",
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
  }, 説明))))), どれ === "shio" ? typeof OrderTab === "function" ? /*#__PURE__*/React.createElement(OrderTab, null) : null : React.createElement(LazyTab, {
    tabKey: どれ
  }));
}
;
Object.assign(window, {
  LabTab
});