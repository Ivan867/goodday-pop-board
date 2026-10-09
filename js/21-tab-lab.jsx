/* Nexus共有 — 21-tab-lab （試作システム：まだ本番では使わない道具をまとめる） */
var { useState } = React;

const LAB_PIN = "3106";

function LabTab() {
  const [開いた, set開いた] = useState(() => {
    try { return sessionStorage.getItem("labOpen") === "1"; } catch (e) { return false; }
  });
  const [番号, set番号] = useState("");
  const [誤り, set誤り] = useState("");
  const ひらく = () => {
    if (番号.trim() === LAB_PIN) {
      set開いた(true); set誤り("");
      try { sessionStorage.setItem("labOpen", "1"); } catch (e) {}
    } else { set誤り("番号が違います"); set番号(""); }
  };
  const [どれ, setどれ] = useState(() => {
    try { return localStorage.getItem("labMode") || "scan"; } catch (e) { return "scan"; }
  });
  const 選ぶ = (k) => { setどれ(k); try { localStorage.setItem("labMode", k); } catch (e) {} };

  const 品 = [
    ["scan",    "読み込み",   "伝票PDFの向き・傾き・濃さを整える"],
    ["check",   "伝票検算",   "蛍光ペンで塗った金額を読んで合算する"],
    ["barcode", "バーコード", "発注用のバーコードを作って印刷する"],
    ["shio",    "塩干発注",   "品目の一覧と資料（書き換えは管理の合言葉）"],
  ];

  if (!開いた) {
    return (
      <div style={{ maxWidth:420, margin:"0 auto", padding:"20px 20px 120px" }}>
        <div style={{ background:"var(--card, #fff)", border:"1px solid var(--line)", borderRadius:16, padding:24, textAlign:"center" }}>
          <div style={{ fontSize:17, fontWeight:900, color:"var(--ink)", marginBottom:6 }}>試作システム</div>
          <div style={{ fontSize:13, color:"var(--sub)", marginBottom:18 }}>番号を入れてください</div>
          <input value={番号} autoFocus inputMode="numeric" type="password"
            onChange={e => { set番号(e.target.value); set誤り(""); }}
            onKeyDown={e => { if (e.key === "Enter") ひらく(); }}
            placeholder="番号"
            style={{ width:"100%", boxSizing:"border-box", border:"2px solid var(--line)",
              background:"var(--card, #fff)", color:"var(--ink)", borderRadius:10, padding:"12px",
              fontSize:16, textAlign:"center", outline:"none", marginBottom: 誤り ? 8 : 16 }} />
          {誤り && <div style={{ fontSize:13, color:"#b3261e", fontWeight:700, marginBottom:12 }}>{誤り}</div>}
          <button onClick={ひらく}
            style={{ width:"100%", border:"none", background:"var(--fill)", color:"#fff", borderRadius:10,
              padding:"13px", fontSize:15, fontWeight:800, cursor:"pointer" }}>ひらく</button>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div style={{ maxWidth:820, margin:"0 auto", padding:"6px 16px 0" }}>
        <div style={{ display:"flex", gap:8, marginBottom:6 }}>
          {品.map(([k, 名, 説明]) => (
            <button key={k} onClick={() => 選ぶ(k)}
              style={{ flex:1, border:"1px solid " + (どれ===k ? "var(--primary)" : "var(--line)"),
                background: どれ===k ? "var(--fill)" : "var(--card, #fff)",
                color: どれ===k ? "#fff" : "var(--text)", borderRadius:11, padding:"11px 8px",
                cursor:"pointer", textAlign:"left" }}>
              <span style={{ display:"block", fontSize:13.5, fontWeight:900 }}>{名}</span>
              <span style={{ display:"block", fontSize:11, marginTop:3, lineHeight:1.5,
                opacity: どれ===k ? 0.85 : 0.75 }}>{説明}</span>
            </button>
          ))}
        </div>
      </div>
      {どれ === "shio"
        ? (typeof OrderTab === "function" ? <OrderTab /> : null)
        : React.createElement(LazyTab, { tabKey: どれ })}
    </div>
  );
}

;Object.assign(window, { LabTab });
