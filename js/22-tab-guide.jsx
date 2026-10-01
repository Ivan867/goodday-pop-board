/* Nexus共有 — 22-tab-guide （手引き：渡すリンクと使い方。絵はすべてコードで描く） */
var { useState } = React;

// いま開いているアドレスから組み立てる。引っ越しても直さなくていい。
function 元のURL() {
  try {
    const u = location.origin + location.pathname.replace(/index\.html$/, "");
    return u.replace(/\/$/, "") + "/";
  } catch (e) { return "/"; }
}

/* ── 絵。画像ファイルは使わず、線で描く。
      文字色を継ぐので、明るい画面でも暗い画面でも勝手になじむ ── */
const 絵 = {
  リンク: (
    <svg viewBox="0 0 64 64" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round">
      <rect x="16" y="6" width="32" height="52" rx="6" />
      <path d="M28 12h8" />
      <path d="M23 30h12M23 38h18" opacity=".55" />
      <circle cx="32" cy="50" r="2.2" />
    </svg>
  ),
  文面: (
    <svg viewBox="0 0 64 64" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round">
      <path d="M8 14h34a4 4 0 014 4v16a4 4 0 01-4 4H22l-10 8V38H8a0 0 0 010 0z" />
      <path d="M16 22h18M16 29h12" opacity=".55" />
      <path d="M50 26h6a0 0 0 010 0v16a4 4 0 01-4 4h-2v8l-8-8" opacity=".45" />
    </svg>
  ),
  合言葉: (
    <svg viewBox="0 0 64 64" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round">
      <path d="M38 20a10 10 0 100 20 10 10 0 000-20z" />
      <path d="M30 30H8M12 30v7M20 30v5" />
      <circle cx="41" cy="27" r="2" fill="currentColor" stroke="none" />
    </svg>
  ),
  切替: (
    <svg viewBox="0 0 64 64" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 24h34l-7-7M52 40H18l7 7" />
      <circle cx="12" cy="40" r="3" opacity=".5" />
      <circle cx="52" cy="24" r="3" opacity=".5" />
    </svg>
  ),
  ホーム: (
    <svg viewBox="0 0 64 64" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round">
      <rect x="18" y="6" width="28" height="52" rx="6" />
      <path d="M32 20v16M26 29l6 7 6-7" />
      <path d="M24 46h16" opacity=".55" />
    </svg>
  ),
  鍵: (
    <svg viewBox="0 0 64 64" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round">
      <rect x="14" y="28" width="36" height="26" rx="5" />
      <path d="M22 28v-8a10 10 0 0120 0v8" />
      <circle cx="32" cy="41" r="3.2" />
    </svg>
  ),
  読込: (
    <svg viewBox="0 0 64 64" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round">
      <path d="M52 32a20 20 0 11-6-14" />
      <path d="M48 6v13H35" />
    </svg>
  ),
};

/* 段：番号つきの一区切り。GuideTab の外に置く。中で定義すると、
   状態が変わるたびに React が別の部品と見なし、画面を作り直してしまう。 */
function 段({ 番, 色, 題, 副, 印, children }) {
  return (
    <section style={{
      background: "var(--card, #fff)", borderRadius: 16, marginBottom: 14,
      boxShadow: "var(--card-shadow)", overflow: "hidden", position: "relative",
    }}>
      <div style={{ position: "absolute", left: 0, top: 0, bottom: 0, width: 5, background: 色 }} />
      <div style={{ padding: "16px 16px 17px 20px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 11, marginBottom: 副 ? 3 : 10 }}>
          <span style={{
            flexShrink: 0, width: 30, height: 30, borderRadius: "50%", background: 色, color: "#fff",
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: 16, fontWeight: 900, lineHeight: 1,
          }}>{番}</span>
          <h3 style={{ margin: 0, fontSize: 17, fontWeight: 900, color: "var(--ink)", letterSpacing: ".01em" }}>{題}</h3>
          <span style={{ marginLeft: "auto", width: 30, height: 30, flexShrink: 0, color: 色, opacity: .9 }}>{印}</span>
        </div>
        {副 && <p style={{ margin: "0 0 11px 41px", fontSize: 12.5, color: "var(--sub)", lineHeight: 1.8 }}>{副}</p>}
        {children}
      </div>
    </section>
  );
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
    try { navigator.vibrate && navigator.vibrate(12); } catch (e) {}
    setTimeout(() => set写した(""), 1900);
  };

  const 基 = 元のURL();
  const 青果URL = 基 + "?seika";
  const 鮮魚URL = 基;
  // 部門の色は、いまどちらの画面にいるかに関係なく固定する。
  // 青果は緑、鮮魚は青。暗い画面では地に沈むので明るい側へ振る。
  const 暗い = (() => { try { return document.documentElement.getAttribute("data-theme") === "dark"; } catch (e) { return false; } })();
  const 青果字 = 暗い ? "#7FCB8B" : "#2f7a3a";
  const 鮮魚字 = 暗い ? "#8FBDE8" : "#2f6fb0";
  const 青果塗 = "#2f7a3a";
  const 鮮魚塗 = "#2f6fb0";

  const 文面青果 = "生鮮共有ページです。\n" + 青果URL + "\n\n"
    + "・下のリンクを開くと、青果の売場ポップが見られます。\n"
    + "・写真を撮って上げるだけで、他店にも共有されます。\n"
    + "・毎回ひらくのが面倒なら、ブラウザの共有ボタンから「ホーム画面に追加」しておくと、アプリのように開けます。";
  const 文面鮮魚 = "生鮮共有ページです。\n" + 鮮魚URL + "\n\n"
    + "・下のリンクを開くと、鮮魚の売場ポップが見られます。\n"
    + "・写真を撮って上げるだけで、他店にも共有されます。\n"
    + "・毎回ひらくのが面倒なら、ブラウザの共有ボタンから「ホーム画面に追加」しておくと、アプリのように開けます。";

  /* ── 部品 ── */

  const 写すボタン = (印, 幅広) => ({
    border: "none", borderRadius: 10, padding: 幅広 ? "12px 14px" : "11px 15px", cursor: "pointer",
    flexShrink: 0, fontFamily: "inherit", fontSize: 13, fontWeight: 900, whiteSpace: "nowrap",
    display: "flex", alignItems: "center", justifyContent: "center", gap: 6,
    background: 写した === 印 ? "#1d7d5d" : "var(--fill)", color: "#fff",
    transition: "background .18s ease",
  });
  const 字 = (印) => 写した === 印 ? "写しました" : 写した === "失敗:" + 印 ? "できず" : "コピー";
  const コピー印 = (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="9" y="9" width="12" height="12" rx="2" /><path d="M5 15V5a2 2 0 012-2h10" />
    </svg>
  );
  const 済印 = (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.8" strokeLinecap="round" strokeLinejoin="round"><path d="M4 12.5l5 5L20 6" /></svg>
  );

  // 「宛先 ＋ アドレス ＋ コピー」のひとかたまり
  const リンク行 = (印, 宛, 値, 色, 塗) => (
    <div style={{ marginBottom: 12 }}>
      <div style={{ fontSize: 12.5, fontWeight: 900, color: 色, marginBottom: 6 }}>{宛}</div>
      <div style={{ display: "flex", gap: 8, alignItems: "stretch" }}>
        <code style={{
          flex: 1, minWidth: 0, background: "var(--chip)", color: "var(--ink)",
          borderRadius: 10, padding: "10px 12px", fontSize: 12, fontWeight: 700,
          wordBreak: "break-all", lineHeight: 1.6, fontFamily: "ui-monospace, Menlo, monospace",
          display: "flex", alignItems: "center",
        }}>{値}</code>
        <button onClick={() => 写す(印, 値)} style={{ ...写すボタン(印), background: 写した === 印 ? "#1d7d5d" : 塗 }}>
          {写した === 印 ? 済印 : コピー印}{字(印)}
        </button>
      </div>
    </div>
  );

  return (
    <div className="min-vh" style={{ background: "var(--bg)" }}>
      {/* ── 見出し ── */}
      <div style={{
        background: "linear-gradient(135deg, #15425f 0%, #1d6b8a 55%, #2f8f6a 100%)",
        padding: "calc(env(safe-area-inset-top) + 26px) 16px 26px", position: "relative", overflow: "hidden",
      }}>
        <div style={{
          position: "absolute", inset: -40,
          background: "radial-gradient(40% 50% at 15% 20%, rgba(255,255,255,.14), transparent 70%)," +
                      "radial-gradient(40% 50% at 85% 80%, rgba(120,220,160,.16), transparent 70%)",
        }} />
        <div style={{ maxWidth: 820, margin: "0 auto", position: "relative" }}>
          <div style={{ fontSize: 11, fontWeight: 800, letterSpacing: ".3em", color: "rgba(255,255,255,.72)" }}>GUIDE</div>
          <div style={{ fontSize: 23, fontWeight: 900, color: "#fff", lineHeight: 1.35, marginTop: 4 }}>
            生鮮共有サイトの使い方
          </div>
          <div style={{ fontSize: 13, color: "rgba(255,255,255,.88)", marginTop: 7, lineHeight: 1.7 }}>
            みんなでポップを作って、共有して、売場をもっと楽しく。<br />
            人に渡すときの一式です。<b>押せばそのまま写せます。</b>
          </div>
        </div>
      </div>

      <div style={{ maxWidth: 820, margin: "0 auto", padding: "16px 14px 140px" }}>

        <段 番="1" 色="#2f6fb0" 題="渡すリンク" 印={絵.リンク}
          副="相手の部門に合わせて渡してください。一度ひらけばその端末が覚えるので、次からは合言葉なしのリンクでも同じ部門で開きます。">
          {リンク行("seika", "🥬 青果の人へ", 青果URL, 青果字, 青果塗)}
          {リンク行("sengyo", "🐟 鮮魚の人へ", 鮮魚URL, 鮮魚字, 鮮魚塗)}
        </段>

        <段 番="2" 色="#b53c63" 題="そのまま送れる文面" 印={絵.文面}
          副="LINEやメールに貼るだけの形にしてあります。名前や一言を足して使ってください。">
          <button onClick={() => 写す("文青", 文面青果)} style={{ ...写すボタン("文青", true), width: "100%", marginBottom: 8, background: 写した === "文青" ? "#1d7d5d" : 青果塗 }}>
            {写した === "文青" ? 済印 : コピー印}{写した === "文青" ? "写しました" : "青果むけの文面をコピー"}
          </button>
          <button onClick={() => 写す("文鮮", 文面鮮魚)} style={{ ...写すボタン("文鮮", true), width: "100%", background: 写した === "文鮮" ? "#1d7d5d" : 鮮魚塗 }}>
            {写した === "文鮮" ? 済印 : コピー印}{写した === "文鮮" ? "写しました" : "鮮魚むけの文面をコピー"}
          </button>
          <div style={{
            background: "var(--chip)", borderRadius: 10, padding: "12px 13px", marginTop: 11,
            fontSize: 12, color: "var(--text)", lineHeight: 1.9, whiteSpace: "pre-wrap",
            borderLeft: "3px solid #b53c63",
          }}>{文面青果}</div>
        </段>

        <段 番="3" 色="#b35f17" 題="合言葉の一覧" 印={絵.合言葉}
          副="アドレスのうしろに付けると、その部門で開きます。どれを使っても同じです。">
          <div style={{ border: "1px solid var(--line)", borderRadius: 11, overflow: "hidden" }}>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", background: "var(--chip)", fontSize: 12, fontWeight: 900, color: "var(--ink)" }}>
              <div style={{ padding: "9px 11px" }}>🥬 青果になる</div>
              <div style={{ padding: "9px 11px", borderLeft: "1px solid var(--line)" }}>🐟 鮮魚になる</div>
            </div>
            {[["?seika", "?sengyo"], ["?yasai", "?sakana"], ["?produce", "?fish"],
              ["?dept=seika", "?dept=fish"], ["#seika", "#sengyo"]].map(([a, b]) => (
              <div key={a} style={{
                display: "grid", gridTemplateColumns: "1fr 1fr", borderTop: "1px solid var(--line)",
                fontSize: 12.5, fontWeight: 700, fontFamily: "ui-monospace, Menlo, monospace", color: "var(--text)",
              }}>
                <div style={{ padding: "9px 11px" }}>{a}</div>
                <div style={{ padding: "9px 11px", borderLeft: "1px solid var(--line)" }}>{b}</div>
              </div>
            ))}
          </div>
          <div style={{ fontSize: 12, color: "var(--sub)", lineHeight: 1.8, marginTop: 10 }}>
            例：<code style={{ background: "var(--chip)", color: "var(--ink)", borderRadius: 6, padding: "2px 6px", fontSize: 11.5, wordBreak: "break-all" }}>{基}<b>?seika</b></code>
          </div>
        </段>

        <段 番="4" 色="#1f7a90" 題="部門のかえ方" 印={絵.切替}>
          <div style={{ fontSize: 13, color: "var(--text)", lineHeight: 1.95 }}>
            一覧の上、文字サイズの並びにある <b style={{ color: 鮮魚字 }}>⇄ 鮮魚</b>（または <b style={{ color: 青果字 }}>⇄ 青果</b>）を押すと入れかわります。<br />
            画面の色も<b>青と緑</b>で変わるので、いまどちらにいるかは一目で分かります。
          </div>
          <div style={{
            marginTop: 11, background: "var(--chip)", borderRadius: 10, padding: "11px 13px",
            fontSize: 12.5, color: "var(--text)", lineHeight: 1.85, borderLeft: "3px solid #1f7a90",
          }}>
            ポップは部門ごとに分かれています。<b>鮮魚で上げたものが青果に出ることはありません。</b>
          </div>
        </段>

        <段 番="5" 色="#35743d" 題="ホーム画面に置く" 印={絵.ホーム}
          副="毎回アドレスを入れずに済みます。合言葉つきのリンクから追加すれば、その部門で開きます。">
          {[["iPhone（Safari）", "下の共有ボタン", "「ホーム画面に追加」"],
            ["Android（Chrome）", "右上の ⋮", "「ホーム画面に追加」"]].map(([機, 一, 二]) => (
            <div key={機} style={{ background: "var(--chip)", borderRadius: 10, padding: "11px 13px", marginBottom: 8 }}>
              <div style={{ fontSize: 12.5, fontWeight: 900, color: "var(--ink)", marginBottom: 6 }}>{機}</div>
              <div style={{ display: "flex", alignItems: "center", gap: 7, flexWrap: "wrap", fontSize: 12.5, color: "var(--text)" }}>
                <span style={{ background: "#35743d", color: "#fff", width: 18, height: 18, borderRadius: "50%", display: "inline-flex", alignItems: "center", justifyContent: "center", fontSize: 11, fontWeight: 900 }}>1</span>
                <span>ひらく</span>
                <span style={{ color: "var(--faint)" }}>→</span>
                <span>{一}</span>
                <span style={{ color: "var(--faint)" }}>→</span>
                <span style={{ background: "#35743d", color: "#fff", width: 18, height: 18, borderRadius: "50%", display: "inline-flex", alignItems: "center", justifyContent: "center", fontSize: 11, fontWeight: 900 }}>2</span>
                <b style={{ color: "var(--ink)" }}>{二}</b>
              </div>
            </div>
          ))}
        </段>

        <段 番="6" 色="#6b4ea0" 題="番号について" 印={絵.鍵}>
          <div style={{ fontSize: 13, color: "var(--text)", lineHeight: 1.95 }}>
            店舗支援・塩干発注・試作システム・管理画面には番号がかかっています。
          </div>
          <div style={{
            marginTop: 10, background: "var(--chip)", borderRadius: 10, padding: "11px 13px",
            fontSize: 12.5, color: "var(--text)", lineHeight: 1.85, borderLeft: "3px solid #6b4ea0",
          }}>
            <b>番号はここには書きません。</b>必要な人にだけ、勝部から直接お伝えします。
          </div>
        </段>

        <段 番="7" 色="#1d3a57" 題="開かないとき" 印={絵.読込}>
          <div style={{ fontSize: 13, color: "var(--text)", lineHeight: 1.95 }}>
            電波の弱い所では、開くのに時間がかかることがあります。<br />
            止まったように見えたら、画面に出る <b>「読み込み直す」</b> を押してください。<br />
            それでも駄目なら、電波の良い所でもう一度ひらいてみてください。
          </div>
        </段>

        <div style={{ fontSize: 11.5, color: "var(--faint)", textAlign: "center", lineHeight: 1.9, marginTop: 18 }}>
          このページのリンクは、いま開いているアドレスから作っています。<br />
          引っ越しても書き直す必要はありません。
        </div>
      </div>
    </div>
  );
}

;Object.assign(window, { GuideTab });
