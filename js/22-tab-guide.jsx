/* Nexus共有 — 22-tab-guide （手引き：渡すリンクと使い方を1ページに） */
var { useState } = React;

// いま開いているアドレスから組み立てる。引っ越しても直さなくていい。
function 元のURL() {
  try {
    const u = location.origin + location.pathname.replace(/index\.html$/, "");
    return u.replace(/\/$/, "") + "/";
  } catch (e) { return "/"; }
}

function GuideTab() {
  const [写した, set写した] = useState("");
  const 写す = async (印, 文字) => {
    let できた = false;
    try { await navigator.clipboard.writeText(文字); できた = true; } catch (e) {}
    if (!できた) {                       // 古い端末むけの逃げ道
      try {
        const t = document.createElement("textarea");
        t.value = 文字; t.style.position = "fixed"; t.style.opacity = "0";
        document.body.appendChild(t); t.select(); document.execCommand("copy");
        document.body.removeChild(t); できた = true;
      } catch (e) {}
    }
    set写した(できた ? 印 : "失敗:" + 印);
    setTimeout(() => set写した(""), 1800);
  };

  const 基 = 元のURL();
  const 青果URL = 基 + "?seika";
  const 鮮魚URL = 基;

  const 文面青果 = "生鮮共有ページです。\n" + 青果URL + "\n\n"
    + "・下のリンクを開くと、青果の売場ポップが見られます。\n"
    + "・写真を撮って上げるだけで、他店にも共有されます。\n"
    + "・毎回ひらくのが面倒なら、ブラウザの共有ボタンから「ホーム画面に追加」しておくと、アプリのように開けます。";
  const 文面鮮魚 = "生鮮共有ページです。\n" + 鮮魚URL + "\n\n"
    + "・下のリンクを開くと、鮮魚の売場ポップが見られます。\n"
    + "・写真を撮って上げるだけで、他店にも共有されます。\n"
    + "・毎回ひらくのが面倒なら、ブラウザの共有ボタンから「ホーム画面に追加」しておくと、アプリのように開けます。";

  // 緑は画面の明暗で変える。暗い画面で濃い緑のままだと地に沈んで読めない。
  const 暗い = (() => { try { return document.documentElement.getAttribute("data-theme") === "dark"; } catch(e) { return false; } })();
  const 青果色 = 暗い ? "#7FCB8B" : "#2f6b38";      // 文字として使う緑
  const 青果塗 = "#35743d";                          // 白文字を載せる塗り
  const 枠 = { background:"var(--card, #fff)", border:"1px solid var(--line)", borderRadius:14, padding:"14px 15px", marginBottom:12 };
  const 見出し = { fontSize:14, fontWeight:900, color:"var(--ink)", marginBottom:4 };
  const 説明 = { fontSize:12.5, color:"var(--sub)", lineHeight:1.8, marginBottom:11 };
  const 写すボタン = (印) => ({
    border:"none", borderRadius:9, padding:"10px 14px", cursor:"pointer", flexShrink:0,
    fontFamily:"inherit", fontSize:13, fontWeight:900, whiteSpace:"nowrap",
    background: 写した === 印 ? "#1d7d5d" : "var(--fill)", color:"#fff",
  });
  const 字 = (印) => 写した === 印 ? "写した" : 写した === "失敗:" + 印 ? "できず" : "コピー";

  // 「値＋コピーボタン」のひとかたまり
  const 一行 = (印, 値, 色) => (
    <div style={{ display:"flex", gap:8, alignItems:"stretch" }}>
      <code style={{ flex:1, minWidth:0, background:"var(--chip)", color: 色 || "var(--ink)",
        borderRadius:9, padding:"10px 12px", fontSize:12.5, fontWeight:700,
        wordBreak:"break-all", lineHeight:1.6, fontFamily:"ui-monospace, Menlo, monospace" }}>{値}</code>
      <button onClick={() => 写す(印, 値)} style={写すボタン(印)}>{字(印)}</button>
    </div>
  );

  return (
    <div className="min-vh" style={{ background:"var(--bg)" }}>
      <div style={{ background:"linear-gradient(180deg, var(--soft), var(--chip))", padding:"calc(env(safe-area-inset-top) + 20px) 16px 20px" }}>
        <div style={{ maxWidth:820, margin:"0 auto" }}>
          <div style={{ color:"var(--primary)", fontSize:18, fontWeight:900 }}>手引き</div>
          <div style={{ color:"var(--sub)", fontSize:12, marginTop:2 }}>人に渡すときの一式。押せばそのまま写せます</div>
        </div>
      </div>

      <div style={{ maxWidth:820, margin:"0 auto", padding:"16px 16px 140px" }}>

        {/* ── リンク ── */}
        <div style={枠}>
          <div style={見出し}>① 渡すリンク</div>
          <div style={説明}>
            相手の部門に合わせて渡してください。<b>一度ひらけばその端末が覚える</b>ので、次からは合言葉なしのリンクでも同じ部門で開きます。
          </div>
          <div style={{ fontSize:12.5, fontWeight:900, color:青果色, marginBottom:6 }}>青果の人へ</div>
          {一行("seika", 青果URL, 青果色)}
          <div style={{ height:12 }} />
          <div style={{ fontSize:12.5, fontWeight:900, color:"var(--primary-soft)", marginBottom:6 }}>鮮魚の人へ</div>
          {一行("sengyo", 鮮魚URL)}
        </div>

        {/* ── 文面 ── */}
        <div style={枠}>
          <div style={見出し}>② そのまま送れる文面</div>
          <div style={説明}>LINEやメールに貼るだけの形にしてあります。名前や一言を足して使ってください。</div>
          <div style={{ display:"flex", gap:8, marginBottom:8 }}>
            <button onClick={() => 写す("文青", 文面青果)} style={{ ...写すボタン("文青"), flex:1, background: 写した==="文青" ? "#1d7d5d" : 青果塗 }}>
              {写した==="文青" ? "写した" : "青果むけの文面をコピー"}
            </button>
          </div>
          <div style={{ display:"flex", gap:8 }}>
            <button onClick={() => 写す("文鮮", 文面鮮魚)} style={{ ...写すボタン("文鮮"), flex:1 }}>
              {写した==="文鮮" ? "写した" : "鮮魚むけの文面をコピー"}
            </button>
          </div>
          <div style={{ background:"var(--chip)", borderRadius:9, padding:"11px 12px", marginTop:10,
            fontSize:12, color:"var(--sub)", lineHeight:1.9, whiteSpace:"pre-wrap" }}>{文面青果}</div>
        </div>

        {/* ── 合言葉 ── */}
        <div style={枠}>
          <div style={見出し}>③ 合言葉の一覧</div>
          <div style={説明}>アドレスのうしろに付けると、その部門で開きます。どれを使っても同じです。</div>
          <div style={{ border:"1px solid var(--line)", borderRadius:10, overflow:"hidden" }}>
            <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", background:"var(--chip)",
              fontSize:12, fontWeight:900, color:"var(--ink)" }}>
              <div style={{ padding:"9px 11px" }}>青果になる</div>
              <div style={{ padding:"9px 11px", borderLeft:"1px solid var(--line)" }}>鮮魚になる</div>
            </div>
            {[["?seika", "?sengyo"], ["?yasai", "?sakana"], ["?produce", "?fish"],
              ["?dept=seika", "?dept=fish"], ["#seika", "#sengyo"]].map(([a, b], i) => (
              <div key={a} style={{ display:"grid", gridTemplateColumns:"1fr 1fr",
                borderTop:"1px solid var(--line)", fontSize:12.5, fontWeight:700,
                fontFamily:"ui-monospace, Menlo, monospace" }}>
                <div style={{ padding:"9px 11px", color:青果色 }}>{a}</div>
                <div style={{ padding:"9px 11px", borderLeft:"1px solid var(--line)", color:"var(--soft-text)" }}>{b}</div>
              </div>
            ))}
          </div>
        </div>

        {/* ── 使い方 ── */}
        <div style={枠}>
          <div style={見出し}>④ 部門のかえ方</div>
          <div style={説明}>
            一覧の上、文字サイズの並びにある <b>⇄ 鮮魚</b>（または <b>⇄ 青果</b>）を押すと入れかわります。
            画面の色も青と緑で変わるので、いまどちらにいるかは一目で分かります。<br />
            ポップは部門ごとに分かれています。鮮魚で上げたものが青果に出ることはありません。
          </div>
        </div>

        <div style={枠}>
          <div style={見出し}>⑤ ホーム画面に置く</div>
          <div style={説明}>
            <b>iPhone</b>：Safariでひらく → 下の共有ボタン → 「ホーム画面に追加」<br />
            <b>Android</b>：Chromeでひらく → 右上の … → 「ホーム画面に追加」<br />
            アプリのように開けて、毎回アドレスを入れずに済みます。合言葉つきのリンクから追加すれば、その部門で開きます。
          </div>
        </div>

        <div style={枠}>
          <div style={見出し}>⑥ 番号について</div>
          <div style={説明}>
            店舗支援・塩干発注・試作システム・管理画面には番号がかかっています。
            番号はここには書きません。必要な人にだけ、勝部から直接お伝えします。
          </div>
        </div>

        <div style={枠}>
          <div style={見出し}>⑦ 開かないとき</div>
          <div style={説明}>
            電波の弱い所では、開くのに時間がかかることがあります。
            止まったように見えたら、画面に出る <b>「読み込み直す」</b> を押してください。
            それでも駄目なら、電波の良い所でもう一度ひらいてみてください。
          </div>
        </div>

        <div style={{ fontSize:11.5, color:"var(--faint)", textAlign:"center", lineHeight:1.9, marginTop:4 }}>
          このページのリンクは、いま開いているアドレスから作っています。<br />
          引っ越しても書き直す必要はありません。
        </div>
      </div>
    </div>
  );
}

;Object.assign(window, { GuideTab });
