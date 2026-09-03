/* GoodDay 鮮魚共有 — 12-tab-learn （自動分割・window共有） */
var { useState, useEffect, useCallback, useRef } = React;

function CalendarTab() {
  const today = new Date(); today.setHours(0,0,0,0);
  const [ym, setYm] = useState({ y: today.getFullYear(), m: today.getMonth() }); // m:0-11

  // 行事データ：共通データ seasonalEventsFor を利用
  const allEv = seasonalEventsFor(ym.y);
  const evOn = (y,m,d) => allEv.find(e => e.date.getFullYear()===y && e.date.getMonth()===m && e.date.getDate()===d);

  const firstDay = new Date(ym.y, ym.m, 1);
  const startWd = firstDay.getDay();
  const daysInMonth = new Date(ym.y, ym.m+1, 0).getDate();
  const cells = [];
  for (let i=0;i<startWd;i++) cells.push(null);
  for (let d=1;d<=daysInMonth;d++) cells.push(d);
  while (cells.length % 7 !== 0) cells.push(null);

  const monthHols = Object.entries((JP_HOLIDAYS[ym.y]||{}))
    .map(([k,name]) => { const [mm,dd] = k.split("-").map(Number); return { m:mm-1, d:dd, name }; })
    .filter(h => h.m === ym.m)
    .map(h => ({ date:new Date(ym.y, h.m, h.d), name:h.name, food:null, holiday:true }));
  const monthEvents = [...allEv.filter(e => e.date.getFullYear()===ym.y && e.date.getMonth()===ym.m), ...monthHols].sort((a,b)=>a.date-b.date);

  const prevM = () => setYm(v => v.m===0 ? {y:v.y-1,m:11} : {y:v.y,m:v.m-1});
  const nextM = () => setYm(v => v.m===11 ? {y:v.y+1,m:0} : {y:v.y,m:v.m+1});
  const jp = ["日","月","火","水","木","金","土"];

  return (
    <div className="min-vh" style={{ background:"var(--bg)" }}>
      <div style={{ background:"linear-gradient(180deg,#e7f1fa,#d3e5f4)", padding:"calc(env(safe-area-inset-top) + 20px) 16px 22px" }}>
        <div style={{ maxWidth:1600, margin:"0 auto" }}>
          <div style={{ color:"#1d3a57", fontSize:18, fontWeight:900 }}>行事カレンダー</div>
          <div style={{ color:"rgba(29,58,87,0.72)", fontSize:12, marginTop:2 }}>売場に関わる行事・ハレの日をチェック</div>
        </div>
      </div>
      <div style={{ maxWidth:1600, margin:"0 auto", padding:"16px 16px 120px" }}>
        <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:14 }}>
          <button onClick={prevM} style={{ border:"1px solid var(--line)", background:"#fff", borderRadius:10, width:38, height:38, fontSize:18, fontWeight:800, color:"var(--text)", cursor:"pointer" }}>‹</button>
          <div style={{ fontSize:17, fontWeight:900, color:"var(--ink)" }}>{ym.y}年 {ym.m+1}月</div>
          <button onClick={nextM} style={{ border:"1px solid var(--line)", background:"#fff", borderRadius:10, width:38, height:38, fontSize:18, fontWeight:800, color:"var(--text)", cursor:"pointer" }}>›</button>
        </div>

        <div style={{ background:"#fff", border:"1px solid var(--line)", borderRadius:14, padding:"10px 8px 8px", marginBottom:16 }}>
          <div style={{ display:"grid", gridTemplateColumns:"repeat(7,1fr)", marginBottom:4 }}>
            {jp.map((w,i) => (
              <div key={w} style={{ textAlign:"center", fontSize:11, fontWeight:800, padding:"4px 0", color: i===0?"#c0392b":i===6?"#2f6fb0":"var(--sub)" }}>{w}</div>
            ))}
          </div>
          <div style={{ display:"grid", gridTemplateColumns:"repeat(7,1fr)", gap:2 }}>
            {cells.map((d,i) => {
              if (d===null) return <div key={i} />;
              const isToday = ym.y===today.getFullYear() && ym.m===today.getMonth() && d===today.getDate();
              const ev = evOn(ym.y, ym.m, d);
              const hol = holidayName(ym.y, ym.m+1, d);
              const wd = (startWd + d - 1) % 7;
              const dayColor = ev ? "var(--primary)" : (hol || wd===0) ? "#c0392b" : wd===6 ? "#2f6fb0" : "var(--text)";
              return (
                <div key={i} style={{ minHeight:52, borderRadius:8, padding:"3px 2px", background: isToday ? "var(--soft)" : (hol ? "#fdeeee" : "transparent"), border: isToday ? "1.5px solid var(--primary)" : "1px solid transparent", display:"flex", flexDirection:"column", alignItems:"center" }}>
                  <span style={{ fontSize:12.5, fontWeight: isToday?900:700, color: dayColor }}>{d}</span>
                  {ev ? <span style={{ fontSize:8.5, fontWeight:800, color:"var(--soft-text)", lineHeight:1.15, textAlign:"center", marginTop:1 }}>{ev.name.length>4?ev.name.slice(0,4):ev.name}</span>
                    : hol ? <span style={{ fontSize:8, fontWeight:800, color:"#c0392b", lineHeight:1.1, textAlign:"center", marginTop:1 }}>{hol.length>4?hol.slice(0,4):hol}</span> : null}
                </div>
              );
            })}
          </div>
        </div>

        <div style={{ fontSize:13, fontWeight:900, color:"var(--ink)", marginBottom:9 }}>{ym.m+1}月の行事</div>
        {monthEvents.length === 0 ? (
          <div style={{ fontSize:12.5, color:"var(--sub)", background:"#fff", border:"1px solid var(--line)", borderRadius:12, padding:"16px", textAlign:"center" }}>この月の登録行事はありません</div>
        ) : monthEvents.map((e,i) => (
          <div key={i} style={{ display:"flex", alignItems:"center", gap:10, background:"#fff", border:"1px solid var(--line)", borderRadius:12, padding:"11px 13px", marginBottom:8 }}>
            <div style={{ flexShrink:0, width:44, textAlign:"center" }}>
              <div style={{ fontSize:16, fontWeight:900, color: e.holiday ? "#c0392b" : "var(--primary)", lineHeight:1 }}>{e.date.getDate()}</div>
              <div style={{ fontSize:10, color:"var(--sub)", fontWeight:700 }}>{jp[e.date.getDay()]}</div>
            </div>
            <div style={{ minWidth:0, flex:1 }}>
              <div style={{ fontSize:14, fontWeight:900, color:"var(--ink)" }}>{e.name}{e.holiday && <span style={{ fontSize:10, fontWeight:800, color:"#c0392b", background:"#fdeeee", borderRadius:6, padding:"1px 7px", marginLeft:7 }}>祝日</span>}</div>
              {e.food && <div style={{ fontSize:11.5, color:"var(--soft-text)", marginTop:2 }}>💡 {e.food}</div>}
            </div>
          </div>
        ))}
        <div style={{ fontSize:11, color:"var(--faint)", textAlign:"center", marginTop:8, lineHeight:1.7 }}>行事の追加・編集機能は今後対応予定です。<br/>まずは季節の売場づくりの目安にどうぞ。</div>
      </div>
    </div>
  );
}

function CompetitorTab() {
  const GROUPS = [
    {
      cat:"専門店型", emoji:"🐟", note:"鮮魚売場というより「魚屋」の強さ。職人感・対面・丸魚・珍魚・活気。POPは「本日入荷」「店内加工」「鮮魚担当おすすめ」「刺身できます」系が合う。",
      rows:[
        { name:"角上魚類", url:"https://www.kakujoe.co.jp/", desc:"新潟・寺泊発。漁港直結の仕入れ、珍魚、対面販売、職人加工、寿司・惣菜まで強い。", hint:"対面販売・丸魚陳列・珍魚の見せ方・寿司惣菜展開", pri:1 },
        { name:"魚耕", url:"https://www.uoko.co.jp/", desc:"関東の駅ナカ・駅ビル中心。刺身盛り・下処理・惣菜・テイクアウト寿司など小回りが強い。", hint:"駅ビル型の小スペース売場、刺身惣菜、通勤客向け商品", pri:12 },
        { name:"魚力", url:"https://www.uoriki.co.jp/", desc:"百貨店・駅ビルに強い老舗。鮮魚と寿司・焼魚など調理品のダブル主力。", hint:"百貨店型の高級感、刺身寿司の盛り付け、清潔感ある陳列", pri:11 },
      ]
    },
    {
      cat:"大手スーパー型", emoji:"🛒", note:"尖らせるより日常の買いやすさと提案力。店内加工・調理サービス・惣菜連携。POPは「焼くだけ」「煮付けにおすすめ」「下処理済み」「夕飯の一品に」系。",
      rows:[
        { name:"ライフ", url:"https://www.lifecorp.jp/", desc:"店内加工に積極的。刺身・対面販売・鮮度管理、寿司焼魚惣菜との連携。", hint:"大型店の店内加工、日常価格と品質のバランス", pri:9 },
        { name:"ヤオコー", url:"https://www.yaoko-net.com/", desc:"産地直送・市場直仕入れ、売場演出、食べ方提案、惣菜が強い。", hint:"調理提案POP、鮮魚惣菜、売場の見せ方、旬魚の打ち出し", pri:2 },
        { name:"イトーヨーカドー", url:"https://www.itoyokado.co.jp/", desc:"お魚調理サービス、クッキングサポート、魚離れ対策、買いやすさ重視。", hint:"調理サービスの案内方法、魚調理のハードルを下げるPOP", pri:13 },
        { name:"サミット", url:"https://www.summitstore.co.jp/", desc:"店内加工、丸魚・刺身・焼魚用まで幅広い商品展開。惣菜連携も強い。", hint:"日常使いの鮮魚売場、焼くだけ・煮るだけ系の提案", pri:8 },
      ]
    },
    {
      cat:"地域密着型", emoji:"🏘", note:"グッディーの売場に一番近い参考軸。地元の食文化・地魚・日替わり感・活気・鮮魚惣菜。山陰沖産・島根県産を打ち出すなら「地元で親しまれる魚」「山陰の旬」「今日はこの魚」と相性◎。",
      rows:[
        { name:"万代", url:"https://www.mandai-net.co.jp/", desc:"関西で人気。安くて新鮮、季節の地魚、珍しい魚、寿司・煮魚・焼魚惣菜が豊富。", hint:"安さと鮮度の見せ方、日替わり感、地魚惣菜展開", pri:3 },
        { name:"スーパーオカムラ", url:"https://www.google.com/maps/search/%E3%82%B9%E3%83%BC%E3%83%91%E3%83%BC%E3%82%AA%E3%82%AB%E3%83%A0%E3%83%A9+%E5%AF%8C%E5%A3%AB%E5%B8%82", desc:"静岡・富士エリア。駿河湾近海魚、深海魚、珍しい魚、地元食文化が強い。", hint:"地魚・珍魚の売り方、ローカル感、地域食文化POP", pri:4 },
        { name:"オオゼキ", url:"https://www.ozeki-net.co.jp/", desc:"東京・神奈川。市場のような活気、マグロ解体、対面販売、調理提案。", hint:"イベント型売場、マグロ解体、都市型の臨場感", pri:5 },
        { name:"バロー", url:"https://www.valor.co.jp/", desc:"中部中心。本部仕入れと現場目利きの両立。旬と価格・品質バランス。", hint:"地域スーパーでの魚の強さ、寿司惣菜との連動", pri:15 },
        { name:"関西スーパー", url:"https://www.kansaisuper.co.jp/", desc:"鮮魚と惣菜の融合が強み。寿司・煮付け・焼物を手頃価格で展開。", hint:"鮮魚惣菜の作り方、夕食需要向けの商品構成", pri:10 },
        { name:"平和堂", url:"https://www.heiwado.jp/", desc:"滋賀・関西圏。地元ニーズ、刺身・切身・味付け魚、惣菜寿司連携。", hint:"地域密着の安定感、日常の魚おかず提案", pri:14 },
      ]
    },
    {
      cat:"高級・高品質型", emoji:"✨", note:"価格勝負でなく上質感・少量・見た目・特別感。刺身・寿司・海鮮丼・うなぎ・お盆・年末年始・父の日POPの参考に。「ちょっと贅沢」「食卓を華やかに」「上質な味わい」「特別な日の一品」系。",
      rows:[
        { name:"成城石井", url:"https://www.seijoishii.com/", desc:"高品質・少量パック・単身者向け・惣菜や加工品が豊富。ちょっと贅沢路線。", hint:"少量高品質パック、パッケージ、上質感あるPOP", pri:7 },
        { name:"紀ノ国屋", url:"https://www.e-kinokuniya.com/", desc:"老舗高級スーパー。美しい盛り付け、上質なパッケージ、希少魚、特別感。", hint:"高級感、盛り付け、色使い、特別日向けの鮮魚演出", pri:6 },
      ]
    },
  ];

  return (
    <div className="min-vh" style={{ background:"var(--bg)" }}>
      <div style={{ background:"linear-gradient(180deg,#e7f1fa,#d3e5f4)", padding:"calc(env(safe-area-inset-top) + 20px) 16px 22px" }}>
        <div style={{ maxWidth:1600, margin:"0 auto" }}>
          <div style={{ color:"#1d3a57", fontSize:18, fontWeight:900 }}>競合情報</div>
          <div style={{ color:"rgba(29,58,87,0.72)", fontSize:12, marginTop:2 }}>鮮魚が強い15店舗を4タイプで整理。売り方のヒントに</div>
        </div>
      </div>
      <div style={{ maxWidth:1600, margin:"0 auto", padding:"16px 16px 120px" }}>
        {GROUPS.map(g => (
          <div key={g.cat} style={{ marginBottom:22 }}>
            <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:6 }}>
              <span style={{ fontSize:19 }}>{g.emoji}</span>
              <span style={{ fontSize:15.5, fontWeight:900, color:"var(--ink)" }}>{g.cat}</span>
            </div>
            <div style={{ fontSize:11.5, color:"var(--sub)", lineHeight:1.7, marginBottom:11, background:"var(--soft)", borderRadius:10, padding:"9px 11px" }}>{g.note}</div>
            {g.rows.map(r => (
              <a key={r.name} href={r.url} target="_blank" rel="noopener noreferrer"
                style={{ display:"block", textDecoration:"none", background:"#fff", border:"1px solid var(--line)", borderRadius:12, padding:"12px 13px", marginBottom:8 }}>
                <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:5 }}>
                  <span style={{ fontSize:14.5, fontWeight:900, color:"var(--ink)" }}>{r.name}</span>
                  <span style={{ fontSize:10, fontWeight:800, color:"var(--sub)", background:"var(--chip)", borderRadius:6, padding:"1px 6px" }}>注目度 {r.pri <= 5 ? "★★★" : r.pri <= 10 ? "★★" : "★"}</span>
                  <span style={{ marginLeft:"auto", color:"var(--faint)", fontSize:17 }}>↗</span>
                </div>
                <div style={{ fontSize:12, color:"var(--text)", lineHeight:1.65 }}>{r.desc}</div>
                <div style={{ fontSize:11, color:"var(--soft-text)", lineHeight:1.6, marginTop:5 }}>💡 {r.hint}</div>
              </a>
            ))}
          </div>
        ))}
        <div style={{ fontSize:11, color:"var(--faint)", textAlign:"center", marginTop:4, lineHeight:1.7 }}>店名をタップすると公式サイトが別タブで開きます。<br/>各社の売場づくりを参考に、うちの強みを磨きましょう。</div>
      </div>
    </div>
  );
}

function IndustryTab() {
  const [subTab, setSubTab] = useState("news");
  const [trends, setTrends] = useState([]);
  useEffect(() => {
    let alive = true;
    (async () => { try { const d = await api.listTrends(); if (alive) setTrends(d || []); } catch(e) {} })();
    return () => { alive = false; };
  }, []);
  useEffect(() => {
    // 魚図鑑は遅延ファイルにあるため、必要になったら読み込む
    if (subTab === "fish" && !window.FishTab && window.loadLazyTab) {
      window.loadLazyTab("15-tab-fish").then(() => setSubTab(s => s));
    }
  }, [subTab]);
  const GROUPS = [
    {
      cat:"専門店型", emoji:"🐟", note:"鮮魚売場というより「魚屋」の強さ。職人感・対面・丸魚・珍魚・活気。POPは「本日入荷」「店内加工」「鮮魚担当おすすめ」「刺身できます」系が合う。",
      rows:[
        { name:"角上魚類", url:"https://www.kakujoe.co.jp/", desc:"新潟・寺泊発。漁港直結の仕入れ、珍魚、対面販売、職人加工、寿司・惣菜まで強い。", hint:"対面販売・丸魚陳列・珍魚の見せ方・寿司惣菜展開", pri:1 },
        { name:"魚耕", url:"https://www.uoko.co.jp/", desc:"関東の駅ナカ・駅ビル中心。刺身盛り・下処理・惣菜・テイクアウト寿司など小回りが強い。", hint:"駅ビル型の小スペース売場、刺身惣菜、通勤客向け商品", pri:12 },
        { name:"魚力", url:"https://www.uoriki.co.jp/", desc:"百貨店・駅ビルに強い老舗。鮮魚と寿司・焼魚など調理品のダブル主力。", hint:"百貨店型の高級感、刺身寿司の盛り付け、清潔感ある陳列", pri:11 },
      ]
    },
    {
      cat:"大手スーパー型", emoji:"🛒", note:"尖らせるより日常の買いやすさと提案力。店内加工・調理サービス・惣菜連携。POPは「焼くだけ」「煮付けにおすすめ」「下処理済み」「夕飯の一品に」系。",
      rows:[
        { name:"ライフ", url:"https://www.lifecorp.jp/", desc:"店内加工に積極的。刺身・対面販売・鮮度管理、寿司焼魚惣菜との連携。", hint:"大型店の店内加工、日常価格と品質のバランス", pri:9 },
        { name:"ヤオコー", url:"https://www.yaoko-net.com/", desc:"産地直送・市場直仕入れ、売場演出、食べ方提案、惣菜が強い。", hint:"調理提案POP、鮮魚惣菜、売場の見せ方、旬魚の打ち出し", pri:2 },
        { name:"イトーヨーカドー", url:"https://www.itoyokado.co.jp/", desc:"お魚調理サービス、クッキングサポート、魚離れ対策、買いやすさ重視。", hint:"調理サービスの案内方法、魚調理のハードルを下げるPOP", pri:13 },
        { name:"サミット", url:"https://www.summitstore.co.jp/", desc:"店内加工、丸魚・刺身・焼魚用まで幅広い商品展開。惣菜連携も強い。", hint:"日常使いの鮮魚売場、焼くだけ・煮るだけ系の提案", pri:8 },
      ]
    },
    {
      cat:"地域密着型", emoji:"🏘", note:"グッディーの売場に一番近い参考軸。地元の食文化・地魚・日替わり感・活気・鮮魚惣菜。山陰沖産・島根県産を打ち出すなら「地元で親しまれる魚」「山陰の旬」「今日はこの魚」と相性◎。",
      rows:[
        { name:"万代", url:"https://www.mandai-net.co.jp/", desc:"関西で人気。安くて新鮮、季節の地魚、珍しい魚、寿司・煮魚・焼魚惣菜が豊富。", hint:"安さと鮮度の見せ方、日替わり感、地魚惣菜展開", pri:3 },
        { name:"スーパーオカムラ", url:"https://www.google.com/maps/search/%E3%82%B9%E3%83%BC%E3%83%91%E3%83%BC%E3%82%AA%E3%82%AB%E3%83%A0%E3%83%A9+%E5%AF%8C%E5%A3%AB%E5%B8%82", desc:"静岡・富士エリア。駿河湾近海魚、深海魚、珍しい魚、地元食文化が強い。", hint:"地魚・珍魚の売り方、ローカル感、地域食文化POP", pri:4 },
        { name:"オオゼキ", url:"https://www.ozeki-net.co.jp/", desc:"東京・神奈川。市場のような活気、マグロ解体、対面販売、調理提案。", hint:"イベント型売場、マグロ解体、都市型の臨場感", pri:5 },
        { name:"バロー", url:"https://www.valor.co.jp/", desc:"中部中心。本部仕入れと現場目利きの両立。旬と価格・品質バランス。", hint:"地域スーパーでの魚の強さ、寿司惣菜との連動", pri:15 },
        { name:"関西スーパー", url:"https://www.kansaisuper.co.jp/", desc:"鮮魚と惣菜の融合が強み。寿司・煮付け・焼物を手頃価格で展開。", hint:"鮮魚惣菜の作り方、夕食需要向けの商品構成", pri:10 },
        { name:"平和堂", url:"https://www.heiwado.jp/", desc:"滋賀・関西圏。地元ニーズ、刺身・切身・味付け魚、惣菜寿司連携。", hint:"地域密着の安定感、日常の魚おかず提案", pri:14 },
      ]
    },
    {
      cat:"高級・高品質型", emoji:"✨", note:"価格勝負でなく上質感・少量・見た目・特別感。刺身・寿司・海鮮丼・うなぎ・お盆・年末年始・父の日POPの参考に。「ちょっと贅沢」「食卓を華やかに」「上質な味わい」「特別な日の一品」系。",
      rows:[
        { name:"成城石井", url:"https://www.seijoishii.com/", desc:"高品質・少量パック・単身者向け・惣菜や加工品が豊富。ちょっと贅沢路線。", hint:"少量高品質パック、パッケージ、上質感あるPOP", pri:7 },
        { name:"紀ノ国屋", url:"https://www.e-kinokuniya.com/", desc:"老舗高級スーパー。美しい盛り付け、上質なパッケージ、希少魚、特別感。", hint:"高級感、盛り付け、色使い、特別日向けの鮮魚演出", pri:6 },
      ]
    },
  ];

  const SITES = [
    { name:"ダイヤモンド・チェーンストア オンライン", home:"https://diamond-rm.net/", feed:"https://diamond-rm.net/feed/", tag:"業界ニュース", emoji:"📰", color:"#2f6fb0" },
    { name:"食未来研究室", home:"https://nsk-shokumirai.com/", feed:"https://nsk-shokumirai.com/feed/", tag:"売場・行事提案", emoji:"🍳", color:"#2f6fb0" },
  ];
  const [data, setData] = useState(SITES.map(() => ({ status:"loading", items:[] })));

  useEffect(() => {
    let alive = true;
    SITES.forEach((site, idx) => {
      const url = "https://api.rss2json.com/v1/api.json?count=6&rss_url=" + encodeURIComponent(site.feed);
      fetch(url)
        .then(r => r.ok ? r.json() : null)
        .then(j => {
          if (!alive) return;
          if (j && j.status === "ok" && Array.isArray(j.items) && j.items.length) {
            setData(prev => { const n = [...prev]; n[idx] = { status:"ok", items: j.items.slice(0, 6) }; return n; });
          } else {
            setData(prev => { const n = [...prev]; n[idx] = { status:"error", items: [] }; return n; });
          }
        })
        .catch(() => { if (alive) setData(prev => { const n = [...prev]; n[idx] = { status:"error", items: [] }; return n; }); });
    });
    return () => { alive = false; };
  }, []);

  const fmtDate = (s) => { const d = new Date((s || "").replace(" ", "T")); if (isNaN(+d)) return ""; return `${d.getMonth()+1}/${d.getDate()}`; };
  const strip = (html) => { const t = (html || "").replace(/<[^>]*>/g, "").replace(/&nbsp;/g, " ").trim(); return t.length > 70 ? t.slice(0, 70) + "…" : t; };

  return (
    <div className="min-vh" style={{ background:"var(--bg)" }}>
      <div style={{ background:"linear-gradient(180deg,#e7f1fa,#d3e5f4)", padding:"calc(env(safe-area-inset-top) + 20px) 16px 22px" }}>
        <div style={{ maxWidth:1600, margin:"0 auto" }}>
          <div style={{ color:"#1d3a57", fontSize:18, fontWeight:900 }}>業界情報</div>
          <div style={{ color:"rgba(29,58,87,0.72)", fontSize:12, marginTop:2 }}>最新記事と、鮮魚が強い15店舗の売り方</div>
        </div>
      </div>
      <div style={{ maxWidth:1600, margin:"0 auto", padding:"14px 16px 120px" }}>

        <div style={{ display:"flex", gap:7, marginBottom:16 }}>
          {[["news","📰 記事・売り方"],["fish","🐠 魚図鑑"]].map(([k,l]) => (
            <button key={k} onClick={() => setSubTab(k)}
              style={{ flex:1, border:"1px solid var(--line)", borderRadius:11, padding:"10px 6px", fontSize:13, fontWeight:800, cursor:"pointer",
                background: subTab===k ? "var(--primary)" : "#fff", color: subTab===k ? "#fff" : "var(--text)" }}>{l}</button>
          ))}
        </div>

        {subTab === "fish" ? (
          window.FishTab ? React.createElement(window.FishTab, { embedded: true })
            : <div style={{ textAlign:"center", padding:40, color:"var(--faint)", fontSize:13 }}>読み込み中…</div>
        ) : (
        <>

        {/* 鮮魚ニュースへのショートカット（Googleニュース検索） */}
        <div className="ucard" style={{ background:"#fff", borderRadius:16, padding:"13px 15px", marginBottom:20 }}>
          <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:4 }}>
            <span style={{ fontSize:19 }}>🗞</span>
            <span style={{ fontSize:14.5, fontWeight:900, color:"var(--ink)" }}>鮮魚ニュースを探す</span>
          </div>
          <div style={{ fontSize:11.5, color:"var(--sub)", marginBottom:11, lineHeight:1.6 }}>気になるテーマをタップすると、Googleニュースの最新記事まとめが開きます。</div>
          <div style={{ display:"flex", flexWrap:"wrap", gap:7 }}>
            {[
              ["鮮魚 売場", "鮮魚 売場"],
              ["水産 市況", "水産 市況"],
              ["魚価", "魚価"],
              ["豊洲市場", "豊洲市場 水産"],
              ["漁獲・水揚げ", "漁獲量 水揚げ"],
              ["うなぎ", "うなぎ 相場"],
              ["寿司・刺身", "刺身 寿司 スーパー"],
              ["山陰の水産", "島根 水産 漁"],
            ].map(([label, q]) => (
              <a key={label} href={"https://news.google.com/search?q=" + encodeURIComponent(q) + "&hl=ja&gl=JP&ceid=JP%3Aja"} target="_blank" rel="noopener noreferrer"
                style={{ textDecoration:"none", fontSize:12.5, fontWeight:800, color:"#4a7ab0", background:"var(--soft)", border:"1px solid #cfe2f3", borderRadius:999, padding:"7px 13px" }}>{label}</a>
            ))}
          </div>
        </div>

        {SITES.map((site, idx) => {
          const st = data[idx];
          return (
            <div key={site.feed} style={{ marginBottom:20 }}>
              <a href={site.home} target="_blank" rel="noopener noreferrer"
                style={{ display:"flex", alignItems:"center", gap:9, textDecoration:"none", marginBottom:9 }}>
                <span style={{ fontSize:20, flexShrink:0 }}>{site.emoji}</span>
                <div style={{ minWidth:0, flex:1 }}>
                  <span style={{ display:"inline-block", fontSize:10, fontWeight:800, color:"var(--soft-text)", background:"var(--soft)", borderRadius:6, padding:"1px 7px" }}>{site.tag}</span>
                  <div style={{ fontSize:13.5, fontWeight:900, color:"var(--ink)", lineHeight:1.3 }}>{site.name}</div>
                </div>
                <span style={{ color:"var(--faint)", fontSize:18, flexShrink:0 }}>↗</span>
              </a>

              {st.status === "loading" && (
                <div>
                  {[0,1,2].map(i => (
                    <div key={i} style={{ background:"#fff", border:"1px solid var(--line)", borderRadius:12, padding:"12px 13px", marginBottom:8 }}>
                      <div className="sk" style={{ width:"85%", height:12, borderRadius:6 }} />
                      <div className="sk" style={{ width:"55%", height:10, borderRadius:6, marginTop:8 }} />
                    </div>
                  ))}
                </div>
              )}

              {st.status === "error" && (
                <a href={site.home} target="_blank" rel="noopener noreferrer"
                  style={{ display:"block", textDecoration:"none", background:"#fff", border:"1px solid var(--line)", borderRadius:12, padding:"14px 14px", color:"var(--text)", fontSize:12.5, lineHeight:1.7 }}>
                  最新記事を読み込めませんでした。<span style={{ color:site.color, fontWeight:800 }}>サイトを開く →</span>
                </a>
              )}

              {st.status === "ok" && st.items.map((it, i) => (
                <a key={i} href={it.link} target="_blank" rel="noopener noreferrer"
                  style={{ display:"block", textDecoration:"none", background:"#fff", border:"1px solid var(--line)", borderRadius:12, padding:"12px 13px", marginBottom:8 }}>
                  <div style={{ display:"flex", gap:8, alignItems:"baseline" }}>
                    {fmtDate(it.pubDate) && <span style={{ fontSize:10.5, fontWeight:800, color:site.color, flexShrink:0 }}>{fmtDate(it.pubDate)}</span>}
                    <span style={{ fontSize:13, fontWeight:800, color:"var(--ink)", lineHeight:1.45 }}>{it.title}</span>
                  </div>
                  {strip(it.description) && <div style={{ fontSize:11, color:"var(--sub)", lineHeight:1.6, marginTop:5 }}>{strip(it.description)}</div>}
                </a>
              ))}
            </div>
          );
        })}
        <div style={{ fontSize:11, color:"var(--faint)", textAlign:"center", marginTop:4, lineHeight:1.7 }}>記事はタップすると別タブで開きます。<br/>最新情報は各サイトから自動で取得しています。</div>

        {/* 競合の売り方（旧・競合情報） */}
        {trends.length > 0 && (
          <>
            <div style={{ height:1, background:"var(--line)", margin:"26px 0 20px" }} />
            <div style={{ fontSize:16, fontWeight:900, color:"var(--ink)", marginBottom:3 }}>いまの業界の動き</div>
            <div style={{ fontSize:11.5, color:"var(--sub)", marginBottom:14, lineHeight:1.6 }}>各社の予約カタログや発表から拾った傾向です</div>
            {trends.map(t => (
              <div key={t.id} style={{ background:"#fff", border:"1px solid var(--line)", borderRadius:13, padding:"13px 14px", marginBottom:10 }}>
                <div style={{ display:"flex", alignItems:"center", gap:6, marginBottom:8, flexWrap:"wrap" }}>
                  {t.season && <span style={{ fontSize:9.5, fontWeight:900, color:"var(--primary-soft)", background:"var(--soft)", borderRadius:6, padding:"2px 8px" }}>{t.season}{t.year ? " " + t.year : ""}</span>}
                  <span style={{ fontSize:14, fontWeight:900, color:"var(--ink)", lineHeight:1.4, flex:"1 1 100%" }}>{t.title}</span>
                </div>
                <ul style={{ margin:0, paddingLeft:17, listStyle:"none" }}>
                  {(Array.isArray(t.points) ? t.points : []).map((pt, i) => (
                    <li key={i} style={{ fontSize:12.5, color:"var(--text)", lineHeight:1.75, marginBottom:5, position:"relative" }}>
                      <span style={{ position:"absolute", left:-15, top:7, width:5, height:5, borderRadius:"50%", background:"var(--primary-soft)" }} />
                      {pt}
                    </li>
                  ))}
                </ul>
                {t.source && <div style={{ fontSize:10, color:"var(--faint)", fontWeight:800, marginTop:8 }}>出典：{t.source}</div>}
              </div>
            ))}
          </>
        )}

        <div style={{ height:1, background:"var(--line)", margin:"26px 0 20px" }} />
        <div style={{ fontSize:16, fontWeight:900, color:"var(--ink)", marginBottom:3 }}>鮮魚が強い店の売り方</div>
        <div style={{ fontSize:11.5, color:"var(--sub)", marginBottom:16, lineHeight:1.6 }}>全国15店舗を4タイプで整理。POPや売場づくりのヒントに</div>
        {GROUPS.map(g => (
          <div key={g.cat} style={{ marginBottom:22 }}>
            <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:6 }}>
              <span style={{ fontSize:19 }}>{g.emoji}</span>
              <span style={{ fontSize:15.5, fontWeight:900, color:"var(--ink)" }}>{g.cat}</span>
            </div>
            <div style={{ fontSize:11.5, color:"var(--sub)", lineHeight:1.7, marginBottom:11, background:"var(--soft)", borderRadius:10, padding:"9px 11px" }}>{g.note}</div>
            {g.rows.map(r => (
              <a key={r.name} href={r.url} target="_blank" rel="noopener noreferrer"
                style={{ display:"block", textDecoration:"none", background:"#fff", border:"1px solid var(--line)", borderRadius:12, padding:"12px 13px", marginBottom:8 }}>
                <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:5 }}>
                  <span style={{ fontSize:14.5, fontWeight:900, color:"var(--ink)" }}>{r.name}</span>
                  <span style={{ fontSize:10, fontWeight:800, color:"var(--sub)", background:"var(--chip)", borderRadius:6, padding:"1px 6px" }}>注目度 {r.pri <= 5 ? "★★★" : r.pri <= 10 ? "★★" : "★"}</span>
                  <span style={{ marginLeft:"auto", color:"var(--faint)", fontSize:17 }}>↗</span>
                </div>
                <div style={{ fontSize:12, color:"var(--text)", lineHeight:1.65 }}>{r.desc}</div>
                {r.hint && <div style={{ fontSize:11, color:"var(--primary)", fontWeight:800, marginTop:6, lineHeight:1.5 }}>見どころ：{r.hint}</div>}
              </a>
            ))}
          </div>
        ))}
        </>
        )}
      </div>
    </div>
  );
}

function SoubaTab({ onCreatePop }) {
  const [sub, setSub] = useState("souba");
  // 粗利
  const [aCost, setACost] = useState(""); const [aSell, setASell] = useState("");
  const [gRate, setGRate] = useState("30"); const [gCost, setGCost] = useState("");
  // 歩留まり
  const [yUnit, setYUnit] = useState(""); const [yRate, setYRate] = useState("55"); const [yMargin, setYMargin] = useState("35");
  // 値引き
  const [nPrice, setNPrice] = useState(""); const [nPct, setNPct] = useState("20");
  const [n2Price, setN2Price] = useState(""); const [n2Yen, setN2Yen] = useState("50");
  // グラム
  const [g100, setG100] = useState(""); const [gWt, setGWt] = useState("");
  const [g2Sell, setG2Sell] = useState(""); const [g2Wt, setG2Wt] = useState("");
  // 立て塩
  const [sWater, setSWater] = useState("1000"); const [sPct, setSPct] = useState("3");
  // 先週比
  const [last, setLast] = useState("199");
  const [now, setNow] = useState("179");
  const [copied, setCopied] = useState(false);
  // 売価計算
  const [cost, setCost] = useState("");
  const [margin, setMargin] = useState("30");

  const L = parseFloat(last), N = parseFloat(now);
  const valid = !isNaN(L) && !isNaN(N) && L > 0 && N > 0;
  const diff = valid ? L - N : 0;            // +なら安くなった
  const pct = valid ? (diff / L) * 100 : 0;  // +なら値引き
  const cheaper = diff > 0.0001;
  const same = valid && Math.abs(diff) < 0.0001;
  const wari = soubaWari(pct);

  const phrase = !valid ? ""
    : same ? "先週と同じ相場です"
    : cheaper ? `先週より${Math.round(diff)}円 ${wari}（${Math.abs(pct).toFixed(0)}%）おトク！`
    : `先週より${Math.round(-diff)}円高 ${wari}（${Math.abs(pct).toFixed(0)}%高）`;

  const copyPhrase = async () => {
    try { await navigator.clipboard.writeText(phrase); setCopied(true); setTimeout(() => setCopied(false), 1500); }
    catch (e) { /* クリップボード不可環境は無視 */ }
  };

  // 売価計算（利益率＝売価に対する割合＝値入率）
  const C = parseFloat(cost), M = parseFloat(margin);
  const sellValid = !isNaN(C) && C > 0 && !isNaN(M) && M >= 0 && M < 100;
  const sell = sellValid ? Math.ceil(C / (1 - M / 100)) : null;
  const profit = sellValid ? sell - Math.round(C) : null;
  const sellTax = sellValid ? Math.ceil(sell * 1.08) : null;

  const card = { background:"#fff", borderRadius:16, padding:20, marginBottom:16, boxShadow:"0 2px 12px rgba(0,0,0,0.06)" };
  const lbl = { fontSize:12, color:"var(--sub)", marginBottom:6 };
  const inp = { width:"100%", boxSizing:"border-box", border:"1px solid var(--line)", borderRadius:10, padding:"12px", fontSize:18, fontWeight:800, textAlign:"center", outline:"none" };
  const cell = (t, v, c) => (
    <div style={{ textAlign:"center" }}>
      <div style={{ fontSize:11, color:"var(--sub)" }}>{t}</div>
      <div style={{ fontSize:22, fontWeight:900, color:c }}>{v}</div>
    </div>
  );

  return (
    <div className="min-vh" style={{ background:"var(--bg)", paddingBottom:100 }}>
      <div style={{ background:"linear-gradient(180deg,#e7f1fa,#d3e5f4)", padding:"16px" }}>
        <div style={{ maxWidth:560, margin:"0 auto" }}>
          <div style={{ color:"#1d3a57", fontSize:18, fontWeight:900 }}>便利機能</div>
          <div style={{ color:"rgba(29,58,87,0.72)", fontSize:12, marginTop:2 }}>売場の計算をぜんぶここで。入力するだけでパッと答え</div>
          <div style={{ display:"flex", gap:6, marginTop:12, overflowX:"auto", WebkitOverflowScrolling:"touch", paddingBottom:2 }}>
            {[["souba","相場計算"],["arari","粗利"],["budomari","歩留まり"],["nebiki","値引き"],["gram","グラム"],["shio","立て塩"]].map(([k,l]) => (
              <button key={k} onClick={() => setSub(k)}
                style={{ flexShrink:0, border:"none", borderRadius:16, padding:"7px 14px", fontSize:13, fontWeight:800, cursor:"pointer",
                  background: sub===k ? "#fff" : "rgba(29,58,87,0.14)", color: sub===k ? "#2f6fb0" : "#17324e" }}>{l}</button>
            ))}
          </div>
        </div>
      </div>

      <div style={{ maxWidth:560, margin:"0 auto", padding:"16px" }}>

        {sub === "souba" && (<>
        {/* 先週比 */}
        <div style={card}>
          <div style={{ fontSize:15, fontWeight:900, color:"#2f6fb0", marginBottom:14 }}>先週とくらべて何割 相場安？</div>
          <div style={{ display:"flex", gap:10 }}>
            <div style={{ flex:1 }}>
              <div style={lbl}>先週の売価（100g 円）</div>
              <input value={last} onChange={e => setLast(e.target.value)} inputMode="decimal" style={inp} />
            </div>
            <div style={{ alignSelf:"center", paddingTop:18, fontSize:20, color:"var(--faint)" }}>→</div>
            <div style={{ flex:1 }}>
              <div style={lbl}>今週の売価（100g 円）</div>
              <input value={now} onChange={e => setNow(e.target.value)} inputMode="decimal" style={inp} />
            </div>
          </div>

          {valid && (
            <div style={{ marginTop:14, background: same ? "#f3f4f6" : cheaper ? "#eafaf0" : "#fff4ed", border:`1px solid ${same ? "#e5e7eb" : cheaper ? "#bde9cd" : "#ffd9bf"}`, borderRadius:12, padding:"14px 16px" }}>
              {!same && (
                <div style={{ display:"flex", justifyContent:"space-around", marginBottom:12 }}>
                  {cell("差額", `${Math.round(Math.abs(diff))}円`, cheaper ? "#2f6fb0" : "var(--primary)")}
                  {cell(cheaper ? "値引率" : "値上率", `${Math.abs(pct).toFixed(1)}%`, cheaper ? "#2f6fb0" : "var(--primary)")}
                  {cell("割", wari || "—", cheaper ? "#2f6fb0" : "var(--primary)")}
                </div>
              )}
              <div style={{ fontSize:16, fontWeight:900, color:"var(--ink)", textAlign:"center", lineHeight:1.5 }}>{phrase}</div>
              {!same && (
                <>
                <button onClick={copyPhrase} style={{ marginTop:12, width:"100%", border:"none", background: copied ? "#2f6fb0" : "#3f83c4", color:"#fff", borderRadius:10, padding:"10px", fontSize:14, fontWeight:800, cursor:"pointer" }}>
                  {copied ? "✓ コピーしました" : "POP用の文言をコピー"}
                </button>
                {cheaper && onCreatePop && (
                  <button onClick={()=>onCreatePop({ appeal: phrase })} style={{ marginTop:8, width:"100%", border:"1px solid #3f83c4", background:"#fff", color:"#2f6fb0", borderRadius:10, padding:"10px", fontSize:14, fontWeight:800, cursor:"pointer" }}>
                    このおトク文でPOPを作成 →
                  </button>
                )}
                </>
              )}
            </div>
          )}
        </div>

        {/* 売価計算 */}
        <div style={card}>
          <div style={{ fontSize:15, fontWeight:900, color:"#8B6914", marginBottom:4 }}>原価＋利益率 → 売価</div>
          <div style={{ fontSize:11, color:"var(--sub)", marginBottom:14 }}>売価 = 原価 ÷（1 − 利益率）。利益率は売価に対する割合（値入率）。</div>
          <div style={{ display:"flex", gap:10 }}>
            <div style={{ flex:1 }}>
              <div style={lbl}>原価（100g 円）</div>
              <input value={cost} onChange={e => setCost(e.target.value)} inputMode="decimal" placeholder="例：120" style={inp} />
            </div>
            <div style={{ flex:1 }}>
              <div style={lbl}>利益率（%）</div>
              <input value={margin} onChange={e => setMargin(e.target.value)} inputMode="decimal" style={inp} />
            </div>
          </div>
          {sellValid && (
            <>
            <div style={{ marginTop:14, background:"#fffaf0", border:"1px solid #f0e0c0", borderRadius:12, padding:"14px 16px", display:"flex", justifyContent:"space-around" }}>
              {cell("売価（税抜）", `${sell}円`, "#8B6914")}
              {cell("税込（8%）", `${sellTax}円`, "#b8860b")}
              {cell("利益額", `${profit}円`, "#2f6fb0")}
            </div>
            {onCreatePop && (
              <button onClick={()=>onCreatePop({ price: `${sell}円（税込${sellTax}円）` })} style={{ marginTop:10, width:"100%", border:"1px solid #b8860b", background:"#fff", color:"#8B6914", borderRadius:10, padding:"10px", fontSize:14, fontWeight:800, cursor:"pointer" }}>
                この売価でPOPを作成 →
              </button>
            )}
            </>
          )}
        </div>
        </>)}

        {sub === "arari" && (() => {
          const c = parseFloat(aCost), v = parseFloat(aSell);
          const ok = !isNaN(c) && !isNaN(v) && c > 0 && v > 0;
          const rate = ok ? (v - c) / v * 100 : null;
          const gc = parseFloat(gCost), gr = parseFloat(gRate);
          const gok = !isNaN(gc) && gc > 0 && !isNaN(gr) && gr >= 0 && gr < 100;
          const gsell = gok ? Math.ceil(gc / (1 - gr / 100)) : null;
          return (<>
            <div style={card}>
              <div style={{ fontSize:15, fontWeight:900, color:"#2f6fb0", marginBottom:14 }}>粗利率をチェック</div>
              <div style={{ display:"flex", gap:10 }}>
                <div style={{ flex:1 }}><div style={lbl}>原価（円）</div><input value={aCost} onChange={e=>setACost(e.target.value)} inputMode="decimal" style={inp} placeholder="120" /></div>
                <div style={{ flex:1 }}><div style={lbl}>売価（円）</div><input value={aSell} onChange={e=>setASell(e.target.value)} inputMode="decimal" style={inp} placeholder="198" /></div>
              </div>
              {ok && (
                <div style={{ display:"flex", justifyContent:"space-around", marginTop:16 }}>
                  {cell("粗利率", `${rate.toFixed(1)}%`, rate >= 30 ? "#2f6fb0" : "var(--primary)")}
                  {cell("値入額", `${Math.round(v - c)}円`, "var(--ink)")}
                  {cell("原価率", `${(c / v * 100).toFixed(1)}%`, "var(--sub)")}
                </div>
              )}
            </div>
            <div style={card}>
              <div style={{ fontSize:15, fontWeight:900, color:"#2f6fb0", marginBottom:14 }}>目標の粗利率から売価を逆算</div>
              <div style={{ display:"flex", gap:10 }}>
                <div style={{ flex:1 }}><div style={lbl}>原価（円）</div><input value={gCost} onChange={e=>setGCost(e.target.value)} inputMode="decimal" style={inp} placeholder="120" /></div>
                <div style={{ flex:1 }}><div style={lbl}>目標粗利率（%）</div><input value={gRate} onChange={e=>setGRate(e.target.value)} inputMode="decimal" style={inp} /></div>
              </div>
              {gok && (
                <div style={{ display:"flex", justifyContent:"space-around", marginTop:16 }}>
                  {cell("売価（税抜）", `${gsell}円`, "#2f6fb0")}
                  {cell("税込（8%）", `${Math.ceil(gsell * 1.08)}円`, "var(--sub)")}
                </div>
              )}
            </div>
          </>);
        })()}

        {sub === "budomari" && (() => {
          const u = parseFloat(yUnit), r = parseFloat(yRate), m = parseFloat(yMargin);
          const ok = !isNaN(u) && u > 0 && !isNaN(r) && r > 0 && r <= 100;
          const real = ok ? u / (r / 100) : null;
          const mok = ok && !isNaN(m) && m >= 0 && m < 100;
          const rec = mok ? real / (1 - m / 100) : null;
          return (
            <div style={card}>
              <div style={{ fontSize:15, fontWeight:900, color:"#2f6fb0", marginBottom:4 }}>歩留まりから実質原価を計算</div>
              <div style={{ fontSize:11.5, color:"var(--sub)", marginBottom:14 }}>丸魚を捌いたあとの「使える部分」あたりの原価が出ます（目安：ブリのフィレ 約55%、三枚おろし 約45〜50%）</div>
              <div style={{ display:"flex", gap:10 }}>
                <div style={{ flex:1 }}><div style={lbl}>仕入単価（円/kg）</div><input value={yUnit} onChange={e=>setYUnit(e.target.value)} inputMode="decimal" style={inp} placeholder="800" /></div>
                <div style={{ flex:1 }}><div style={lbl}>歩留まり（%）</div><input value={yRate} onChange={e=>setYRate(e.target.value)} inputMode="decimal" style={inp} /></div>
              </div>
              {ok && (
                <div style={{ display:"flex", justifyContent:"space-around", marginTop:16 }}>
                  {cell("実質原価", `${Math.round(real)}円/kg`, "var(--ink)")}
                  {cell("100gあたり", `${Math.round(real / 10)}円`, "var(--sub)")}
                </div>
              )}
              <div style={{ height:1, background:"var(--line)", margin:"16px 0" }} />
              <div style={{ display:"flex", gap:10, alignItems:"flex-end" }}>
                <div style={{ flex:1 }}><div style={lbl}>目標粗利率（%）</div><input value={yMargin} onChange={e=>setYMargin(e.target.value)} inputMode="decimal" style={inp} /></div>
                <div style={{ flex:2 }}>
                  {rec != null && (
                    <div style={{ display:"flex", justifyContent:"space-around" }}>
                      {cell("推奨売価", `${Math.ceil(rec / 10)}円/100g`, "#2f6fb0")}
                      {cell("kgあたり", `${Math.ceil(rec)}円`, "var(--sub)")}
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })()}

        {sub === "nebiki" && (() => {
          const p1 = parseFloat(nPrice), r1 = parseFloat(nPct);
          const ok1 = !isNaN(p1) && p1 > 0 && !isNaN(r1) && r1 >= 0 && r1 <= 100;
          const after1 = ok1 ? Math.round(p1 * (1 - r1 / 100)) : null;
          const p2 = parseFloat(n2Price), y2 = parseFloat(n2Yen);
          const ok2 = !isNaN(p2) && p2 > 0 && !isNaN(y2) && y2 >= 0;
          return (<>
            <div style={card}>
              <div style={{ fontSize:15, fontWeight:900, color:"#2f6fb0", marginBottom:14 }}>◯%引きの値段は？</div>
              <div style={{ display:"flex", gap:10 }}>
                <div style={{ flex:1 }}><div style={lbl}>元の売価（円）</div><input value={nPrice} onChange={e=>setNPrice(e.target.value)} inputMode="decimal" style={inp} placeholder="298" /></div>
                <div style={{ flex:1 }}><div style={lbl}>割引率（%）</div><input value={nPct} onChange={e=>setNPct(e.target.value)} inputMode="decimal" style={inp} /></div>
              </div>
              {ok1 && (
                <div style={{ display:"flex", justifyContent:"space-around", marginTop:16 }}>
                  {cell("値引き後", `${after1}円`, "var(--primary)")}
                  {cell("値引き額", `${Math.round(p1 - after1)}円`, "var(--sub)")}
                </div>
              )}
            </div>
            <div style={card}>
              <div style={{ fontSize:15, fontWeight:900, color:"#2f6fb0", marginBottom:14 }}>◯円引きは何%相当？</div>
              <div style={{ display:"flex", gap:10 }}>
                <div style={{ flex:1 }}><div style={lbl}>元の売価（円）</div><input value={n2Price} onChange={e=>setN2Price(e.target.value)} inputMode="decimal" style={inp} placeholder="398" /></div>
                <div style={{ flex:1 }}><div style={lbl}>値引き額（円）</div><input value={n2Yen} onChange={e=>setN2Yen(e.target.value)} inputMode="decimal" style={inp} /></div>
              </div>
              {ok2 && (
                <div style={{ display:"flex", justifyContent:"space-around", marginTop:16 }}>
                  {cell("割引率相当", `${(y2 / p2 * 100).toFixed(0)}%引き`, "var(--primary)")}
                  {cell("値引き後", `${Math.round(p2 - y2)}円`, "var(--sub)")}
                </div>
              )}
            </div>
          </>);
        })()}

        {sub === "gram" && (() => {
          const a = parseFloat(g100), b = parseFloat(gWt);
          const ok1 = !isNaN(a) && a > 0 && !isNaN(b) && b > 0;
          const c2 = parseFloat(g2Sell), d2 = parseFloat(g2Wt);
          const ok2 = !isNaN(c2) && c2 > 0 && !isNaN(d2) && d2 > 0;
          return (<>
            <div style={card}>
              <div style={{ fontSize:15, fontWeight:900, color:"#2f6fb0", marginBottom:14 }}>100g単価 → パック売価</div>
              <div style={{ display:"flex", gap:10 }}>
                <div style={{ flex:1 }}><div style={lbl}>100g単価（円）</div><input value={g100} onChange={e=>setG100(e.target.value)} inputMode="decimal" style={inp} placeholder="298" /></div>
                <div style={{ flex:1 }}><div style={lbl}>内容量（g）</div><input value={gWt} onChange={e=>setGWt(e.target.value)} inputMode="decimal" style={inp} placeholder="240" /></div>
              </div>
              {ok1 && (
                <div style={{ display:"flex", justifyContent:"space-around", marginTop:16 }}>
                  {cell("売価", `${Math.ceil(a * b / 100)}円`, "#2f6fb0")}
                  {cell("税込（8%）", `${Math.ceil(a * b / 100 * 1.08)}円`, "var(--sub)")}
                </div>
              )}
            </div>
            <div style={card}>
              <div style={{ fontSize:15, fontWeight:900, color:"#2f6fb0", marginBottom:14 }}>パック売価 → 100g単価</div>
              <div style={{ display:"flex", gap:10 }}>
                <div style={{ flex:1 }}><div style={lbl}>売価（円）</div><input value={g2Sell} onChange={e=>setG2Sell(e.target.value)} inputMode="decimal" style={inp} placeholder="698" /></div>
                <div style={{ flex:1 }}><div style={lbl}>内容量（g）</div><input value={g2Wt} onChange={e=>setG2Wt(e.target.value)} inputMode="decimal" style={inp} placeholder="240" /></div>
              </div>
              {ok2 && (
                <div style={{ display:"flex", justifyContent:"space-around", marginTop:16 }}>
                  {cell("100gあたり", `${Math.round(c2 / d2 * 100)}円`, "#2f6fb0")}
                </div>
              )}
            </div>
          </>);
        })()}

        {sub === "shio" && (() => {
          const w = parseFloat(sWater), pc = parseFloat(sPct);
          const ok = !isNaN(w) && w > 0 && !isNaN(pc) && pc > 0 && pc <= 30;
          const salt = ok ? w * pc / 100 : null;
          return (
            <div style={card}>
              <div style={{ fontSize:15, fontWeight:900, color:"#2f6fb0", marginBottom:4 }}>立て塩（塩水）の塩の量</div>
              <div style={{ fontSize:11.5, color:"var(--sub)", marginBottom:14 }}>目安：立て塩は3%前後（海水と同じくらい）。魚の下処理・臭み抜きに</div>
              <div style={{ display:"flex", gap:10 }}>
                <div style={{ flex:1 }}><div style={lbl}>水の量（ml）</div><input value={sWater} onChange={e=>setSWater(e.target.value)} inputMode="decimal" style={inp} /></div>
                <div style={{ flex:1 }}><div style={lbl}>濃度（%）</div><input value={sPct} onChange={e=>setSPct(e.target.value)} inputMode="decimal" style={inp} /></div>
              </div>
              {ok && (
                <div style={{ display:"flex", justifyContent:"space-around", marginTop:16 }}>
                  {cell("塩の量", `${salt.toFixed(salt < 10 ? 1 : 0)}g`, "#2f6fb0")}
                  {cell("大さじ換算", `約${(salt / 18).toFixed(1)}杯`, "var(--sub)")}
                </div>
              )}
            </div>
          );
        })()}

        <div style={{ fontSize:11, color:"var(--faint)", textAlign:"center", marginTop:4 }}>※ プロトタイプです。計算方法・表示・項目はご要望に合わせて調整できます。</div>
      </div>
    </div>
  );
}


// ===== 管理画面：パスワードで解錠 → 依頼一覧／アーカイブ管理 =====



// ═══════════ 予約カタログ：定数 ═══════════
const CAT_SEASON_OPTS = ["お盆", "年末", "クリスマス", "正月"];

const CAT_GENRE_OPTS = [
  { key:"both",    label:"両方" },
  { key:"sashimi", label:"お刺身盛り合わせ" },
  { key:"sushi",   label:"お寿司盛り合わせ" },
];

// 検索のしかた（ゆるい / しっかり）
const CAT_MODE_OPTS = [
  { key:"easy",   label:"かんたん", help:"言葉をそのまま並べて、雰囲気で幅広く探します" },
  { key:"strict", label:"しっかり", help:"言い回しを指定して、狙った商品にしぼって探します" },
];

// しっかり：ORは大文字。刺身か寿司の「どちらか」が出るようにする
const CAT_GENRE_QUERY = {
  both:    '("刺身盛り合わせ" OR "お造り盛り合わせ" OR "刺身セット" OR "寿司盛り合わせ" OR "にぎり盛り合わせ" OR "寿司セット")',
  sashimi: '("刺身盛り合わせ" OR "お造り盛り合わせ" OR "刺身セット")',
  sushi:   '("寿司盛り合わせ" OR "にぎり盛り合わせ" OR "寿司セット")',
};

// かんたん：引用符もORも使わず、素直な言葉だけ
const CAT_GENRE_EASY = {
  both:    "刺身 寿司 盛り合わせ",
  sashimi: "刺身 盛り合わせ",
  sushi:   "寿司 盛り合わせ",
};

const CAT_SEASON_QUERY = {
  "お盆":       '("お盆" OR "盆")',
  "年末":       '("年末" OR "歳末" OR "年末年始")',
  "クリスマス": '"クリスマス"',
  "正月":       '("正月" OR "年末年始" OR "新春")',
};

const CAT_RESERVATION_QUERY = '("予約" OR "ご予約" OR "予約承り")';

// ── 普段づかい：日常のPOP・売場を見るための語 ──
const DAILY_TARGET_OPTS = [
  { key:"pop",       label:"POP",     q:"POP" },
  { key:"fuda",      label:"値札",    q:"値札" },
  { key:"taimen",    label:"対面",    q:"対面" },
  { key:"uriba",     label:"売場",    q:"売場" },
  { key:"sashimi",   label:"刺身",    q:"刺身" },
  { key:"sushi",     label:"寿司",    q:"寿司" },
  { key:"kirimi",    label:"切身",    q:"切身" },
  { key:"himono",    label:"干物",    q:"干物" },
  { key:"kaisendon", label:"海鮮丼",  q:"海鮮丼" },
  { key:"souzai",    label:"惣菜",    q:"惣菜" },
];

const DAILY_WORD_SETS = [
  { key:"uriba",  label:"売場のつくり", words:["平台","冷ケース","対面","エンド","島陳列","レイアウト","什器"] },
  { key:"pop",    label:"POPの見せ方", words:["手書きPOP","プライスカード","産地表示","のぼり","黒板","シズル","キャッチコピー"] },
  { key:"uri",    label:"売り方",     words:["特売","日替わり","タイムセール","詰め放題","量り売り","半額","おつとめ品"] },
  { key:"shohin", label:"商品",       words:["刺身盛り","切身","干物","西京漬け","フライ","漬け丼","柵"] },
  { key:"kisetsu",label:"季節・鮮度", words:["旬","朝獲れ","天然","地魚","解凍","産地直送","入荷"] },
];

// 追加検索ワードの候補（タップで足せる）
const CAT_WORD_SETS = [
  { key:"grade",  label:"グレード", words:["特上","松","竹","梅","上","並","極","プレミアム","超特選"] },
  { key:"neta",   label:"ネタ",     words:["本まぐろ","大とろ","中とろ","赤身","うに","いくら","のどぐろ","甘えび","ずわいがに","帆立","穴子","サーモン"] },
  { key:"utsuwa", label:"器・盛り方", words:["桶","舟","オードブル","姿造り","大漁盛り","海賊盛り"] },
  { key:"ninzu",  label:"人数・量", words:["2人前","3人前","4人前","5人前","6人前","8点盛","10点盛","12点盛","10貫","18貫","20貫","28貫","32貫","40貫","48貫","50貫","少人数","大人数"] },
  { key:"gyoji",  label:"行事",     words:["祝い鯛","尾頭付き","おせち","かに","うなぎ","年越し","ちらし"] },
  { key:"sanchi", label:"産地・状態", words:["天然","養殖","国産","地魚","朝獲れ","活〆","解凍","刺身用"] },
  { key:"combo",  label:"組み合わせ", words:["特上 本まぐろ","松竹梅","桶盛り","祝い鯛 尾頭付き","4人前 盛り合わせ","のどぐろ 地魚","2人前 少人数"] },
];

const CAT_GROUPS = [
  { key:"major",   label:"大手スーパー",     color:"#3b7dd8" },
  { key:"local",   label:"ローカルスーパー", color:"#3f9e63" },
  { key:"pro",     label:"専門店",           color:"#d1554f" },
  { key:"premium", label:"高質スーパー",     color:"#c39a3c" },
  { key:"coop",    label:"生協",             color:"#e08a1e" },
];

// 全角・半角・大文字小文字・空白の揺れを吸収して比べる
const catNormalize = (value) => String(value == null ? "" : value)
  .normalize("NFKC").toLocaleLowerCase("ja").replace(/\s+/g, "").trim();

// ═══════════ CatalogTab：予約カタログ ═══════════
function CatalogTab() {
  const [list, setList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(false);

  // ── 上部の共通検索条件 ──
  const NOW_YEAR = new Date().getFullYear();
  const YEAR_OPTS = []; for (let y = NOW_YEAR + 1; y >= 2020; y--) YEAR_OPTS.push(y);
  const [searchYear, setSearchYear] = useState(NOW_YEAR);
  // 今の月から「次に準備する時期」を選ぶ（12月に年末を出しても遅いので前倒し）
  const seasonForMonth = (m) => {
    if (m >= 7 && m <= 10) return "年末";       // 夏〜秋：年末の準備
    if (m === 11) return "クリスマス";          // 11月：クリスマス直前
    if (m === 12) return "正月";                // 12月：正月直前
    return "お盆";                              // 1〜6月：夏の準備
  };
  const [season, setSeason] = useState(() => seasonForMonth(new Date().getMonth() + 1));
  const [genre, setGenre] = useState("both");
  const [mode, setMode] = useState(() => { try { return localStorage.getItem("catMode") || "easy"; } catch(e) { return "easy"; } });
  const setModeSave = (v) => { setMode(v); try { localStorage.setItem("catMode", v); } catch(e) {} };
  const [extraWords, setExtraWords] = useState("");   // Google検索に足す言葉
  const [openWordSet, setOpenWordSet] = useState("");  // 開いているワード集の分類
  // 企画（行事の予約）／普段（日常のPOP・売場）の切り替え
  const [pageMode, setPageMode] = useState(() => { try { return localStorage.getItem("catPageMode") || "event"; } catch(e) { return "event"; } });
  const setPageModeSave = (v) => { setPageMode(v); setOpenWordSet(""); try { localStorage.setItem("catPageMode", v); } catch(e) {} };
  const [dailyTarget, setDailyTarget] = useState("pop");

  // ワードをタップで足す／外す（同じ語をもう一度押すと消える）
  const toggleWord = (w) => setExtraWords(prev => {
    const cur = prev.trim().split(/\s+/).filter(Boolean);
    const parts = w.trim().split(/\s+/).filter(Boolean);
    const has = parts.every(x => cur.includes(x));
    const next = has ? cur.filter(x => !parts.includes(x)) : cur.concat(parts.filter(x => !cur.includes(x)));
    return next.join(" ");
  });
  const hasWord = (w) => {
    const cur = extraWords.trim().split(/\s+/).filter(Boolean);
    const parts = w.trim().split(/\s+/).filter(Boolean);
    return parts.length > 0 && parts.every(x => cur.includes(x));
  };

  // ── 絞り込み ──
  const [grp, setGrp] = useState("");
  const [favOnly, setFavOnly] = useState(false);
  const [fav, setFav] = useState(() => { try { return JSON.parse(localStorage.getItem("catFav") || "{}"); } catch(e) { return {}; } });
  const toggleFav = (id) => setFav(v => {
    const n = { ...v };
    if (n[id]) delete n[id]; else n[id] = true;
    try { localStorage.setItem("catFav", JSON.stringify(n)); } catch(e) {}
    return n;
  });

  const [cview, setCview] = useState(() => { try { return localStorage.getItem("catView") || "md"; } catch(e) { return "md"; } });
  const setCviewSave = (v) => { setCview(v); try { localStorage.setItem("catView", v); } catch(e) {} };

  useEffect(() => {
    let alive = true;
    (async () => {
      try { const d = await api.listCatalogs(true); if (alive) { setList(d || []); setLoadError(false); } }
      catch(e) { if (alive) setLoadError(true); }
      finally { if (alive) setLoading(false); }
    })();
    return () => { alive = false; };
  }, []);

  const gInfo = (k) => CAT_GROUPS.find(g => g.key === (k || "local")) || CAT_GROUPS[1];

  // ── 画像検索のURLを組み立てる（ORを含む式を作ってから一度だけエンコード）──
  // 検索に使う言葉だけを作る（GoogleにもPinterestにも使う）
  const buildQueryText = (c) => {
    const storeName = c.search_name || c.store;
    const extra = extraWords.trim();
    if (pageMode === "daily") {
      const t = DAILY_TARGET_OPTS.find(o => o.key === dailyTarget) || DAILY_TARGET_OPTS[0];
      return [storeName, "鮮魚", t.q, extra].filter(Boolean).join(" ");
    }
    return [storeName, season, "予約", CAT_GENRE_EASY[genre] || CAT_GENRE_EASY.both, extra, String(searchYear)].filter(Boolean).join(" ");
  };
  const buildPinterestUrl = (c) => "https://www.pinterest.jp/search/pins/?q=" + encodeURIComponent(buildQueryText(c));
  const buildYahooUrl = (c) => "https://search.yahoo.co.jp/image/search?p=" + encodeURIComponent(buildQueryText(c));
  const buildBingUrl  = (c) => "https://www.bing.com/images/search?q=" + encodeURIComponent(buildQueryText(c));

  const buildImageSearchUrl = (c) => {
    const storeName = c.search_name || c.store;
    const extra = extraWords.trim();
    let query;
    if (pageMode === "daily") {
      // 普段づかい：時期や予約を入れず、日常の売場・POPを探す
      const t = DAILY_TARGET_OPTS.find(o => o.key === dailyTarget) || DAILY_TARGET_OPTS[0];
      query = [storeName, "鮮魚", t.q, extra].filter(Boolean).join(" ");
      return "https://www.google.com/search?tbm=isch&q=" + encodeURIComponent(query);
    }
    if (mode === "easy") {
      // かんたん：引用符もORも使わず、そのまま並べる（雰囲気で幅広く）
      query = [storeName, season, "予約", CAT_GENRE_EASY[genre] || CAT_GENRE_EASY.both, extra, String(searchYear)]
        .filter(Boolean).join(" ");
    } else {
      const genreTerm  = CAT_GENRE_QUERY[genre] || CAT_GENRE_QUERY.both;
      const seasonTerm = CAT_SEASON_QUERY[season] || `"${season}"`;
      query = [`"${storeName}"`, seasonTerm, CAT_RESERVATION_QUERY, genreTerm, extra, String(searchYear)]
        .filter(Boolean).join(" ");
    }
    return "https://www.google.com/search?tbm=isch&q=" + encodeURIComponent(query);
  };

  // ── 表示対象の絞り込み（visible → 店名 → グループ → 重点調査 → purpose）──
  const base    = list.filter(c => c.visible !== false);
  const byGroup = grp ? base.filter(c => (c.group_type || "local") === grp) : base;
  const shown   = favOnly ? byGroup.filter(c => fav[c.id]) : byGroup;
  const cats    = shown.filter(c => (c.purpose || "catalog") === "catalog");
  const favCount  = base.filter(c => fav[c.id]).length;
  const groupsIn  = CAT_GROUPS.filter(g => base.some(c => (c.group_type || "local") === g.key));

  // ── カード ──
  const Card = ({ c }) => {
    const g = gInfo(c.group_type);
    const isFav = !!fav[c.id];
    const FavBtn = ({ size }) => (
      <button onClick={(e) => { e.preventDefault(); e.stopPropagation(); toggleFav(c.id); }}
        aria-label={isFav ? "重点調査から外す" : "重点調査に追加"} aria-pressed={isFav} title={isFav ? "重点調査から外す" : "重点調査に追加"}
        style={{ border:"none", background:"transparent", padding:0, cursor:"pointer", flexShrink:0, display:"flex", alignItems:"center", lineHeight:1 }}>
        <svg width={size} height={size} viewBox="0 0 24 24" fill={isFav ? "#e0a020" : "none"} stroke={isFav ? "#e0a020" : "var(--faint)"} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
          <path d="M12 17.5l-6.2 3.5 1.3-7.2L2 8.7l7.3-.9L12 1.5l2.7 6.3 7.3.9-5.1 5.1 1.3 7.2z"/>
        </svg>
      </button>
    );
    const SearchBtn = ({ compact }) => (
      <div style={{ display:"flex", gap:5 }}>
        <a href={buildImageSearchUrl(c)} target="_blank" rel="noopener noreferrer"
          style={{ flex:1, display:"block", textAlign:"center", textDecoration:"none", fontSize: compact ? 10.5 : 11.5, fontWeight:900,
            color:"#fff", background:g.color, borderRadius:8, padding: compact ? "7px 0" : "9px 0", whiteSpace:"nowrap" }}>画像で探す</a>
        <a href={buildYahooUrl(c)} target="_blank" rel="noopener noreferrer" title="Yahoo!画像検索で探す" aria-label="Yahoo!画像検索で探す"
          style={{ flexShrink:0, display:"flex", alignItems:"center", justifyContent:"center", textDecoration:"none",
            color:"var(--sub)", background:"#fff", border:"1px solid var(--line)", borderRadius:8, padding: compact ? "0 9px" : "0 11px", fontSize: compact ? 10 : 11, fontWeight:900, letterSpacing:"-0.2px" }}>Y!</a>
        <a href={buildBingUrl(c)} target="_blank" rel="noopener noreferrer" title="Bing画像検索で探す" aria-label="Bing画像検索で探す"
          style={{ flexShrink:0, display:"flex", alignItems:"center", justifyContent:"center", textDecoration:"none",
            color:"var(--sub)", background:"#fff", border:"1px solid var(--line)", borderRadius:8, padding: compact ? "0 9px" : "0 11px", fontSize: compact ? 10 : 11, fontWeight:900, letterSpacing:"-0.2px" }}>B</a>
        {pageMode === "daily" && (
          <a href={buildPinterestUrl(c)} target="_blank" rel="noopener noreferrer" title="Pinterestで探す" aria-label="Pinterestで探す"
            style={{ flexShrink:0, display:"flex", alignItems:"center", justifyContent:"center", textDecoration:"none",
              color:"var(--sub)", background:"#fff", border:"1px solid var(--line)", borderRadius:8, padding: compact ? "0 9px" : "0 11px", fontSize: compact ? 10 : 11, fontWeight:900, letterSpacing:"-0.2px" }}>P</a>
        )}
      </div>
    );

    if (cview === "list") {
      return (
        <div className="ucard" style={{ background:"#fff", borderRadius:9, padding:"8px 10px 8px 12px", borderLeft:`4px solid ${g.color}`, display:"flex", alignItems:"center", gap:10 }}>
          <FavBtn size={14} />
          <div style={{ minWidth:0, flex:1 }}>
            <div style={{ fontSize:13, fontWeight:900, color:"var(--ink)", whiteSpace:"nowrap", overflow:"hidden", textOverflow:"ellipsis" }}>{c.store}</div>
            {c.area && <div style={{ fontSize:9, color:"var(--faint)", fontWeight:800 }}>{c.area}</div>}
          </div>
          <div style={{ width:96, flexShrink:0 }}><SearchBtn compact /></div>
        </div>
      );
    }

    if (cview === "sm") {
      return (
        <div className="ucard" style={{ background:"#fff", borderRadius:9, padding:"9px 10px 9px 12px", borderLeft:`4px solid ${g.color}` }}>
          <div style={{ display:"flex", alignItems:"center", gap:6, marginBottom:7 }}>
            <FavBtn size={14} />
            <span style={{ fontSize:12.5, fontWeight:900, color:"var(--ink)", whiteSpace:"nowrap", overflow:"hidden", textOverflow:"ellipsis", flex:1, minWidth:0 }}>{c.store}</span>
          </div>
          <SearchBtn compact />
        </div>
      );
    }

    return (
      <div className="ucard" style={{ background:"#fff", borderRadius:10, padding:"10px 11px 10px 13px", borderLeft:`4px solid ${g.color}` }}>
        <div style={{ display:"flex", alignItems:"center", gap:6, marginBottom:6 }}>
          <span style={{ fontSize: cview === "lg" ? 16 : 15, fontWeight:900, color:"var(--ink)", letterSpacing:"-0.3px", whiteSpace:"nowrap", overflow:"hidden", textOverflow:"ellipsis", flex:1, minWidth:0 }}>{c.store}</span>
          <FavBtn size={16} />
        </div>
        <div style={{ display:"flex", alignItems:"center", gap:6, flexWrap:"wrap", marginBottom:6 }}>
          {c.area && <span style={{ fontSize:9.5, color:"var(--faint)", fontWeight:800 }}>{c.area}</span>}
          {c.stores_count ? <span style={{ fontSize:9.5, fontWeight:800, color:g.color, background:g.color + "12", borderRadius:5, padding:"1px 6px" }}>{c.stores_count}店</span> : null}
          {c.revenue ? <span style={{ fontSize:9.5, fontWeight:800, color:g.color, background:g.color + "12", borderRadius:5, padding:"1px 6px" }}>{c.revenue}</span> : null}
        </div>
        {c.strength && <div style={{ fontSize:10.5, color:"var(--text)", lineHeight:1.6, background:"var(--bg)", borderRadius:8, padding:"7px 9px", marginBottom:6 }}>{c.strength}</div>}
        {cview === "lg" && (c.store_scale || c.systems) && (
          <div style={{ marginBottom:8 }}>
            {c.store_scale && <div style={{ display:"flex", gap:5, fontSize:10, lineHeight:1.55, marginBottom:3 }}><span style={{ fontWeight:900, color:g.color, flexShrink:0 }}>規模</span><span style={{ color:"var(--sub)" }}>{c.store_scale}</span></div>}
            {c.systems && <div style={{ display:"flex", gap:5, fontSize:10, lineHeight:1.55 }}><span style={{ fontWeight:900, color:g.color, flexShrink:0 }}>仕組み</span><span style={{ color:"var(--sub)" }}>{c.systems}</span></div>}
          </div>
        )}
        <SearchBtn />
      </div>
    );
  };

  const selBase = { border:"1px solid var(--line)", borderRadius:8, padding:"9px 10px", fontSize:13, fontWeight:700, color:"var(--text)", background:"#fff", outline:"none", width:"100%", boxSizing:"border-box", minHeight:40 };

  return (
    <div>
      <div style={{ background:"var(--primary)", padding:"9px 16px", color:"#fff" }}>
        <div style={{ fontSize:16.5, fontWeight:800, letterSpacing:"-0.3px" }}>カタログ</div>
      </div>

      <div style={{ maxWidth:1600, margin:"0 auto", padding:"14px 16px 140px" }}>

        {/* ── 企画／普段の切り替え ── */}
        <div style={{ display:"flex", gap:7, marginBottom:12 }}>
          {[["event","企画・行事"],["daily","普段の売場"]].map(([k,l]) => (
            <button key={k} onClick={() => setPageModeSave(k)}
              style={{ flex:1, border:"1px solid var(--line)", borderRadius:10, padding:"11px 6px", fontSize:13, fontWeight:800, cursor:"pointer",
                background: pageMode===k ? "var(--primary)" : "#fff", color: pageMode===k ? "#fff" : "var(--text)" }}>{l}</button>
          ))}
        </div>

        {/* ── 共通の検索条件 ── */}
        <div style={{ background:"#fff", border:"1px solid var(--line)", borderRadius:10, padding:"12px 13px", marginBottom:12 }}>
          <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:9, gap:8 }}>
            <span style={{ fontSize:12.5, fontWeight:800, color:"var(--ink)", letterSpacing:"-0.2px" }}>{pageMode === "daily" ? "何を見たいですか？" : "検索条件をまとめて指定"}</span>
            <div style={{ display:"flex", gap:2, background:"rgba(120,120,128,0.12)", borderRadius:8, padding:2, flexShrink:0 }}>
              {[
                ["list", "リスト", <svg key="1" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M4 6h16M4 12h16M4 18h16"/></svg>],
                ["sm", "小", <svg key="2" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><rect x="3" y="3" width="5" height="5"/><rect x="10" y="3" width="5" height="5"/><rect x="17" y="3" width="4" height="5"/><rect x="3" y="10" width="5" height="5"/><rect x="10" y="10" width="5" height="5"/><rect x="17" y="10" width="4" height="5"/><rect x="3" y="17" width="5" height="4"/><rect x="10" y="17" width="5" height="4"/><rect x="17" y="17" width="4" height="4"/></svg>],
                ["md", "中", <svg key="3" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><rect x="3" y="3" width="8" height="8"/><rect x="13" y="3" width="8" height="8"/><rect x="3" y="13" width="8" height="8"/><rect x="13" y="13" width="8" height="8"/></svg>],
                ["lg", "大", <svg key="4" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><rect x="3" y="3" width="18" height="18" rx="1.5"/></svg>],
              ].map(([k, label, icon]) => (
                <button key={k} onClick={() => setCviewSave(k)} title={label} aria-label={"表示を" + label + "にする"} aria-pressed={cview===k}
                  style={{ border:"none", background: cview===k ? "#fff" : "transparent", color: cview===k ? "var(--ink)" : "var(--sub)", borderRadius:6, padding:"4px 8px", cursor:"pointer", display:"flex", alignItems:"center", boxShadow: cview===k ? "0 1px 2px rgba(0,0,0,0.1)" : "none" }}>{icon}</button>
              ))}
            </div>
          </div>

          <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit, minmax(150px, 1fr))", gap:8, marginBottom:8 }}>
            {pageMode === "daily" ? (
              <label style={{ display:"block" }}>
                <span style={{ display:"block", fontSize:10.5, fontWeight:800, color:"var(--sub)", marginBottom:4 }}>見たいもの</span>
                <select value={dailyTarget} onChange={e => setDailyTarget(e.target.value)} style={selBase}>
                  {DAILY_TARGET_OPTS.map(o => <option key={o.key} value={o.key}>{o.label}</option>)}
                </select>
              </label>
            ) : (
            <>
            <label style={{ display:"block" }}>
              <span style={{ display:"block", fontSize:10.5, fontWeight:800, color:"var(--sub)", marginBottom:4 }}>検索対象年</span>
              <select value={searchYear} onChange={e => setSearchYear(Number(e.target.value))} style={selBase}>
                {YEAR_OPTS.map(y => <option key={y} value={y}>{y}年</option>)}
              </select>
            </label>
            <label style={{ display:"block" }}>
              <span style={{ display:"block", fontSize:10.5, fontWeight:800, color:"var(--sub)", marginBottom:4 }}>時期</span>
              <select value={season} onChange={e => setSeason(e.target.value)} style={selBase}>
                {CAT_SEASON_OPTS.map(sn => <option key={sn} value={sn}>{sn}</option>)}
              </select>
            </label>
            <label style={{ display:"block" }}>
              <span style={{ display:"block", fontSize:10.5, fontWeight:800, color:"var(--sub)", marginBottom:4 }}>商品ジャンル</span>
              <select value={genre} onChange={e => setGenre(e.target.value)} style={selBase}>
                {CAT_GENRE_OPTS.map(o => <option key={o.key} value={o.key}>{o.label}</option>)}
              </select>
            </label>
            <label style={{ display:"block" }}>
              <span style={{ display:"block", fontSize:10.5, fontWeight:800, color:"var(--sub)", marginBottom:4 }}>検索のしかた</span>
              <select value={mode} onChange={e => setModeSave(e.target.value)} style={selBase}>
                {CAT_MODE_OPTS.map(o => <option key={o.key} value={o.key}>{o.label}</option>)}
              </select>
            </label>
            </>
            )}
            <label style={{ display:"block" }}>
              <span style={{ display:"block", fontSize:10.5, fontWeight:800, color:"var(--sub)", marginBottom:4 }}>追加検索ワード</span>
              <span style={{ position:"relative", display:"block" }}>
                <input value={extraWords} onChange={e => setExtraWords(e.target.value)}
                  onKeyDown={e => { if (e.key === "Enter") e.preventDefault(); }}
                  placeholder="例：まぐろ / 特上 / 4人前" aria-label="Google検索に足す言葉"
                  style={{ ...selBase, paddingRight: extraWords ? 34 : 10 }} />
                {extraWords && (
                  <button onClick={() => setExtraWords("")} aria-label="追加検索ワードを消す"
                    style={{ position:"absolute", right:6, top:"50%", transform:"translateY(-50%)", border:"none", background:"rgba(120,120,128,0.18)", color:"var(--sub)", borderRadius:"50%", width:22, height:22, fontSize:13, fontWeight:900, cursor:"pointer", lineHeight:1, display:"flex", alignItems:"center", justifyContent:"center" }}>×</button>
                )}
              </span>
            </label>
          </div>

          {/* ワード集：分類を押すと候補が開く */}
          <div style={{ marginBottom:9 }}>
            <div style={{ display:"flex", gap:5, flexWrap:"wrap" }}>
              {(pageMode === "daily" ? DAILY_WORD_SETS : CAT_WORD_SETS).map(ws => {
                const on = openWordSet === ws.key;
                const used = ws.words.filter(hasWord).length;
                return (
                  <button key={ws.key} onClick={() => setOpenWordSet(on ? "" : ws.key)} aria-expanded={on}
                    style={{ border: on ? "1.5px solid var(--primary-soft)" : "1px solid var(--line)", background: on ? "var(--soft)" : "#fff", color: on ? "var(--primary)" : "var(--sub)", borderRadius:999, padding:"4px 11px", fontSize:11.5, fontWeight:700, cursor:"pointer", display:"flex", alignItems:"center", gap:4 }}>
                    {ws.label}
                    {used > 0 && <span style={{ background:"var(--primary-soft)", color:"#fff", borderRadius:999, fontSize:9, fontWeight:900, padding:"0 5px", lineHeight:1.6 }}>{used}</span>}
                    <span style={{ fontSize:8, transform: on ? "rotate(180deg)" : "none", display:"inline-block", transition:"transform .2s" }}>▼</span>
                  </button>
                );
              })}
            </div>

            {openWordSet && (
              <div style={{ marginTop:7, padding:"9px 10px", background:"var(--bg)", borderRadius:9, display:"flex", gap:5, flexWrap:"wrap", animation:"fadeUp .2s ease" }}>
                {((pageMode === "daily" ? DAILY_WORD_SETS : CAT_WORD_SETS).find(w => w.key === openWordSet) || {words:[]}).words.map(w => {
                  const on = hasWord(w);
                  return (
                    <button key={w} onClick={() => toggleWord(w)} aria-pressed={on}
                      style={{ border: on ? "none" : "1px solid var(--line)", background: on ? "var(--primary-soft)" : "#fff", color: on ? "#fff" : "var(--text)", borderRadius:7, padding:"5px 10px", fontSize:12, fontWeight:700, cursor:"pointer", whiteSpace:"nowrap" }}>
                      {w}
                    </button>
                  );
                })}
              </div>
            )}
          </div>

        </div>

        {loading ? (
          <div style={{ textAlign:"center", color:"var(--faint)", padding:"40px 0", fontSize:13 }}>読み込み中…</div>
        ) : loadError ? (
          <div style={{ textAlign:"center", color:"var(--faint)", padding:"48px 20px", fontSize:13, lineHeight:1.8 }}>
            <div style={{ fontSize:15, fontWeight:800, color:"var(--sub)" }}>読み込めませんでした</div>
            <div style={{ marginTop:6 }}>電波の良いところで開き直してください</div>
          </div>
        ) : list.length === 0 ? (
          <div style={{ textAlign:"center", color:"var(--faint)", padding:"48px 20px", fontSize:13 }}>
            <div style={{ fontSize:15, fontWeight:800, color:"var(--sub)" }}>まだカタログがありません</div>
          </div>
        ) : (
          <>
            <div style={{ display:"flex", gap:6, flexWrap:"wrap", marginBottom:10 }}>
              <button onClick={() => setGrp("")} aria-pressed={!grp}
                style={{ border: !grp ? "2px solid var(--primary-soft)" : "1px solid var(--line)", background: !grp ? "var(--soft)" : "#fff", color: !grp ? "var(--primary)" : "var(--sub)", borderRadius:999, padding:"5px 13px", fontSize:12.5, fontWeight:600, cursor:"pointer" }}>すべて</button>
              {groupsIn.map(g => (
                <button key={g.key} onClick={() => setGrp(g.key)} aria-pressed={grp===g.key}
                  style={{ border: grp===g.key ? `2px solid ${g.color}` : "1px solid var(--line)", background: grp===g.key ? g.color + "14" : "#fff", color: grp===g.key ? g.color : "var(--sub)", borderRadius:999, padding:"5px 12px", fontSize:12.5, fontWeight:600, cursor:"pointer", display:"flex", alignItems:"center", gap:5 }}>
                  {g.label}
                </button>
              ))}
              {favCount > 0 && (
                <button onClick={() => setFavOnly(v => !v)} aria-pressed={favOnly}
                  style={{ border: favOnly ? "2px solid #e0a020" : "1px solid var(--line)", background: favOnly ? "#fdf3e0" : "#fff", color: favOnly ? "#b8860b" : "var(--sub)", borderRadius:999, padding:"5px 13px", fontSize:12.5, fontWeight:700, cursor:"pointer", display:"flex", alignItems:"center", gap:4 }}>
                  重点調査 {favCount}
                </button>
              )}
            </div>

            <div style={{ fontSize:11, fontWeight:700, color:"var(--sub)", marginBottom:10 }}>{shown.length}社を表示中</div>

            {shown.length === 0 ? (
              <div style={{ textAlign:"center", color:"var(--faint)", padding:"44px 20px", fontSize:13, lineHeight:1.8 }}>
                <div style={{ fontSize:15, fontWeight:800, color:"var(--sub)" }}>該当するお店がありません</div>
                <div style={{ marginTop:6 }}>絞り込みを外してみてください</div>
                <button onClick={() => { setGrp(""); setFavOnly(false); }}
                  style={{ marginTop:16, border:"none", background:"var(--primary-soft, #4a7ab0)", color:"#fff", borderRadius:999, padding:"10px 22px", fontSize:13, fontWeight:800, cursor:"pointer" }}>絞り込みを外す</button>
              </div>
            ) : (
              <>
                {grp || favOnly ? (
                  <div className={"cat-grid c-" + cview}>{cats.map(c => <Card key={c.id} c={c} />)}</div>
                ) : (
                  CAT_GROUPS.filter(g => cats.some(c => (c.group_type || "local") === g.key)).map(g => {
                    const rows = cats.filter(c => (c.group_type || "local") === g.key);
                    return (
                      <div key={g.key} style={{ marginBottom:20 }}>
                        <div style={{ display:"flex", alignItems:"center", gap:7, marginBottom:9, paddingLeft:2 }}>
                          <span style={{ width:4, height:15, borderRadius:2, background:g.color, flexShrink:0 }} />
                          <span style={{ fontSize:14, fontWeight:900, color:"var(--ink)" }}>{g.label}</span>
                          <span style={{ fontSize:10.5, fontWeight:900, color:g.color, background:g.color + "16", borderRadius:999, padding:"2px 9px" }}>{rows.length}</span>
                        </div>
                        <div className={"cat-grid c-" + cview}>{rows.map(c => <Card key={c.id} c={c} />)}</div>
                      </div>
                    );
                  })
                )}

              </>
            )}

          </>
        )}
      </div>
    </div>
  );
}


// ═══════════ OrderTab：発注記録（カレンダーで見る） ═══════════
const OI_WDAY = ["日","月","火","水","木","金","土"];
const SHEET_DAYS = [["mon","月"],["tue","火"],["wed","水"],["thu","木"],["fri","金"],["sat","土"],["sun","日"]];
const oiYmd = (d) => `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,"0")}-${String(d.getDate()).padStart(2,"0")}`;

function OrderTab() {
  // 簡易ロック（他の人が誤って開かないように）
  const [unlocked, setUnlocked] = useState(() => { try { return sessionStorage.getItem("orderUnlocked") === "1"; } catch(e) { return false; } });
  const [pw, setPw] = useState("");
  const [pwErr, setPwErr] = useState("");
  const tryUnlock = () => {
    if (pw.trim() === "5") {
      setUnlocked(true); setPwErr("");
      try { sessionStorage.setItem("orderUnlocked", "1"); } catch(e) {}
    } else { setPwErr("番号が違います"); setPw(""); }
  };

  const [items, setItems] = useState([]);
  const [logs, setLogs] = useState([]);
  // ── 週間の発注指示書 ──
  const mondayOf = (d) => { const x = new Date(d); const w = x.getDay(); x.setDate(x.getDate() - (w === 0 ? 6 : w - 1)); x.setHours(0,0,0,0); return x; };
  const [wkStart, setWkStart] = useState(() => mondayOf(new Date()));
  const [sheet, setSheet] = useState(null);
  const [rows, setRows] = useState([]);
  const [sheetVer, setSheetVer] = useState(0);
  const [sheetBusy, setSheetBusy] = useState(false);
  const [sheetNote, setSheetNote] = useState("");
  const [openCat, setOpenCat] = useState("");     // 開いている分類
  const [sheetDay, setSheetDay] = useState(() => { const d = new Date().getDay(); return d; });  // 指示書で編集中の曜日
  // 今日のチェック（日付が変わると消える）
  const [pickDay, setPickDay] = useState(() => new Date());
  // 日付ごとのチェック（{ "2026-08-25": {rowId:true} }）
  const [todayChecked, setTodayChecked] = useState(() => {
    try { return JSON.parse(localStorage.getItem("orderDayChecked") || "{}"); } catch(e) { return {}; }
  });
  const saveTodayChecked = (dayKey, v) => {
    const next = { ...todayChecked, [dayKey]: v };
    setTodayChecked(next);
    try { localStorage.setItem("orderDayChecked", JSON.stringify(next)); } catch(e) {}
  };
  const [loading, setLoading] = useState(true);
  const [ver, setVer] = useState(0);
  const [tab, setTab] = useState("today");            // cal=カレンダー / items=品目
  const [cursor, setCursor] = useState(() => { const d = new Date(); return new Date(d.getFullYear(), d.getMonth(), 1); });
  const [pickDate, setPickDate] = useState(oiYmd(new Date()));  // 記録を入れる日
  const [focusItem, setFocusItem] = useState("");   // 絞り込む品目（空=すべて）
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState("");

  // 品目フォーム
  const [formOpen, setFormOpen] = useState(false);
  const [editId, setEditId] = useState(null);
  const [form, setForm] = useState({ name:"", maker:"", unit:"ケース", qty:"", note:"" });

  const y = cursor.getFullYear(), mo = cursor.getMonth();
  const monthFrom = oiYmd(new Date(y, mo, 1));
  const monthTo   = oiYmd(new Date(y, mo + 1, 0));

  useEffect(() => {
    let alive = true; setLoading(true);
    (async () => {
      try {
        const [its, lgs] = await Promise.all([api.listOrderItems(), api.listOrderLogs(monthFrom, monthTo)]);
        if (alive) { setItems(its || []); setLogs(lgs || []); }
      } catch(e) { if (alive) setMsg("読み込めませんでした"); }
      finally { if (alive) setLoading(false); }
    })();
    return () => { alive = false; };
  }, [ver, monthFrom, monthTo]);

  const wkKey = oiYmd(wkStart);
  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        const sh = await api.getSheet(wkKey);
        if (!alive) return;
        setSheet(sh); setSheetNote(sh ? (sh.note || "") : "");
        if (sh) { const rs = await api.listSheetRows(sh.id); if (alive) setRows(rs || []); }
        else setRows([]);
      } catch(e) {}
    })();
    return () => { alive = false; };
  }, [wkKey, sheetVer]);

  const ensureSheet = async () => {
    if (sheet) return sheet;
    const created = await api.createSheet({ week_start: wkKey, author: localStorage.getItem("lastAuthor") || null });
    setSheet(created); return created;
  };
  const addRow = async (it) => {
    setSheetBusy(true);
    try {
      const sh = await ensureSheet();
      await api.addSheetRow({ sheet_id: sh.id, item_id: it.id, item_name: it.name, unit: it.unit || "ケース",
        maker: it.maker || null, price: it.price ?? null, life_kind: it.life_kind || null, life_days: it.life_days ?? null, thumb: it.thumb || null,
        sort_order: rows.length });
      setSheetVer(v => v + 1);
    } catch(e) {} finally { setSheetBusy(false); }
  };
  const setCell = async (row, key, val) => {
    const v = val === "" ? null : Number(val);
    setRows(rs => rs.map(r => r.id === row.id ? { ...r, [key]: v } : r));
    try { await api.updateSheetRow(row.id, { [key]: v }); } catch(e) {}
  };
  const setRowMemo = async (row, val) => {
    setRows(rs => rs.map(r => r.id === row.id ? { ...r, memo: val } : r));
    try { await api.updateSheetRow(row.id, { memo: val || null }); } catch(e) {}
  };
  const delRow = async (row) => {
    try { await api.deleteSheetRow(row.id); setSheetVer(v => v + 1); } catch(e) {}
  };
  const saveNote = async () => {
    try { const sh = await ensureSheet(); await api.updateSheet(sh.id, { note: sheetNote.trim() || null }); } catch(e) {}
  };
  // 前の週の内容をそのまま持ってくる
  const copyPrevWeek = async () => {
    setSheetBusy(true);
    try {
      const prev = new Date(wkStart); prev.setDate(prev.getDate() - 7);
      const ps = await api.getSheet(oiYmd(prev));
      if (!ps) { window.alert("前の週の指示書がありません"); return; }
      const prows = await api.listSheetRows(ps.id);
      const sh = await ensureSheet();
      for (let i = 0; i < prows.length; i++) {
        const r = prows[i];
        await api.addSheetRow({ sheet_id: sh.id, item_id: r.item_id, item_name: r.item_name, unit: r.unit,
          maker: r.maker || null, price: r.price ?? null, life_kind: r.life_kind || null, life_days: r.life_days ?? null,
          mon:r.mon, tue:r.tue, wed:r.wed, thu:r.thu, fri:r.fri, sat:r.sat, sun:r.sun, memo:r.memo, sort_order: i });
      }
      setSheetVer(v => v + 1);
    } catch(e) {} finally { setSheetBusy(false); }
  };

  const active = items.filter(i => i.active !== false);
  const itemById = (id) => active.find(i => i.id === id);
  const viewLogs = focusItem ? logs.filter(l => l.item_id === focusItem) : logs;

  // ── カレンダーの升目を作る ──
  const firstDow = new Date(y, mo, 1).getDay();
  const lastDate = new Date(y, mo + 1, 0).getDate();
  const cells = [];
  for (let i = 0; i < firstDow; i++) cells.push(null);
  for (let d = 1; d <= lastDate; d++) cells.push(d);
  while (cells.length % 7 !== 0) cells.push(null);

  const logsOn = (d) => {
    if (!d) return [];
    const key = oiYmd(new Date(y, mo, d));
    return viewLogs.filter(l => l.ordered_on === key);
  };

  // ── 週ごとの集計（回数と数量）──
  const weeks = [];
  for (let i = 0; i < cells.length; i += 7) {
    const chunk = cells.slice(i, i + 7).filter(Boolean);
    if (!chunk.length) continue;
    let cnt = 0, sum = 0;
    chunk.forEach(d => { logsOn(d).forEach(l => { cnt++; sum += Number(l.qty || 0); }); });
    weeks.push({ no: weeks.length + 1, from: chunk[0], to: chunk[chunk.length - 1], count: cnt, qty: sum });
  }
  const maxW = Math.max(1, ...weeks.map(w => w.count));
  const monthCount = weeks.reduce((a, w) => a + w.count, 0);
  const monthQty   = weeks.reduce((a, w) => a + w.qty, 0);

  // ── 記録する ──
  const [logQty, setLogQty] = useState({});   // {itemId: 数量}
  const addLog = async (it) => {
    const q = logQty[it.id] !== undefined && logQty[it.id] !== "" ? Number(logQty[it.id]) : (it.qty != null ? Number(it.qty) : null);
    setBusy(true);
    try {
      await api.addOrderLog({ item_id: it.id, ordered_on: pickDate, qty: q, author: localStorage.getItem("lastAuthor") || null });
      setLogQty(v => ({ ...v, [it.id]: "" }));
      setVer(v => v + 1);
      try { window.dispatchEvent(new CustomEvent("appToast", { detail: `${it.name} を記録しました` })); } catch(e) {}
    } catch(e) { setMsg("記録できませんでした"); }
    finally { setBusy(false); }
  };
  const delLog = async (l) => {
    if (!window.confirm("この記録を消しますか？")) return;
    try { await api.deleteOrderLog(l.id); setVer(v => v + 1); } catch(e) {}
  };

  // ── 品目の登録・編集 ──
  // ── Excel（売価・期限早見表）を画像ごと取り込む ──
  const xlsxRef = React.useRef(null);
  const [impBusy, setImpBusy] = useState(false);
  const [impMsg, setImpMsg] = useState("");

  const importExcel = async (file) => {
    if (!file) return;
    setImpBusy(true); setImpMsg("読み込んでいます…");
    try {
      await loadScriptOnce(XLSX_SRC);
      await loadScriptOnce(JSZIP_SRC);
      const buf = await file.arrayBuffer();

      // --- 表の中身（商品名・期限区分・D+・仕入先・売価）---
      const wb = XLSX.read(buf, { type:"array" });
      const found = [];
      wb.SheetNames.forEach(sn => {
        const grid = XLSX.utils.sheet_to_json(wb.Sheets[sn], { header:1, defval:null });
        [0, 3, 6].forEach(base => {
          for (let r = 0; r < grid.length; r++) {
            const row = grid[r] || [];
            if (String(row[base] || "").trim() !== "商品名" || !row[base+1]) continue;
            const rec = { category: sn, name: String(row[base+1]).trim(), row: r, base };
            for (let k = 1; k <= 4; k++) {
              const rr = grid[r+k] || [];
              const lab = String(rr[base] || "").trim(), val = rr[base+1];
              if (lab === "期限区分") rec.life_kind = val ? String(val).trim() : null;
              else if (lab === "D+") { const n = parseFloat(String(val).replace("５","5")); rec.life_days = isNaN(n) ? null : Math.round(n); }
              else if (lab === "仕入先") rec.maker = val ? String(val).trim() : null;
              else if (lab === "売価") { const n = parseFloat(val); rec.price = isNaN(n) ? null : Math.round(n); }
            }
            found.push(rec); r += 4;
          }
        });
      });
      if (found.length === 0) { setImpMsg("商品が見つかりませんでした"); setImpBusy(false); return; }

      // --- 埋め込み画像を取り出して、位置から商品に割り当てる ---
      setImpMsg(`${found.length}件を読みました。画像を取り出しています…`);
      const thumbs = {};
      try {
        const zip = await JSZip.loadAsync(buf);
        const txt = async (n) => zip.file(n) ? await zip.file(n).async("string") : "";
        for (let si = 0; si < wb.SheetNames.length; si++) {
          const sn = wb.SheetNames[si];
          const wsRel = await txt(`xl/worksheets/_rels/sheet${si+1}.xml.rels`);
          const dm = wsRel.match(/Target="\.\.\/(drawings\/drawing\d+\.xml)"/);
          if (!dm) continue;
          const dxml = await txt("xl/" + dm[1]);
          const drel = await txt("xl/drawings/_rels/" + dm[1].split("/")[1] + ".rels");
          const rid2img = {};
          (drel.match(/Id="rId\d+"[^>]*Target="[^"]+"/g) || []).forEach(t => {
            const a = t.match(/Id="(rId\d+)"/), b = t.match(/Target="\.\.\/media\/([^"]+)"/);
            if (a && b) rid2img[a[1]] = b[1];
          });
          const anchors = dxml.split(/(?=<xdr:(?:twoCell|oneCell|absolute)Anchor)/);
          for (const blk of anchors) {
            const mid = blk.match(/r:embed="(rId\d+)"/);
            const mc = blk.match(/<xdr:col>(\d+)<\/xdr:col>/);
            const mr = blk.match(/<xdr:row>(\d+)<\/xdr:row>/);
            if (!mid || !mc || !mr) continue;
            const col = +mc[1], row = +mr[1];
            const base = col < 3 ? 0 : col < 6 ? 3 : 6;
            // 同じシート・同じ列ブロックで、行が一番近い商品
            const cands = found.filter(f => f.category === sn && f.base === base);
            if (!cands.length) continue;
            let best = cands[0];
            cands.forEach(c => { if (Math.abs(c.row - row) < Math.abs(best.row - row)) best = c; });
            const fn = rid2img[mid[1]];
            if (!fn || thumbs[best.name]) continue;
            const blob = await zip.file("xl/media/" + fn).async("blob");
            thumbs[best.name] = await new Promise(res => {
              const img = new Image();
              img.onload = () => {
                const c = document.createElement("canvas");
                const sc = Math.min(1, 130 / Math.max(img.width, img.height));
                c.width = Math.round(img.width * sc); c.height = Math.round(img.height * sc);
                c.getContext("2d").drawImage(img, 0, 0, c.width, c.height);
                res(c.toDataURL("image/jpeg", 0.62));
                URL.revokeObjectURL(img.src);
              };
              img.onerror = () => res(null);
              img.src = URL.createObjectURL(blob);
            });
          }
        }
      } catch(e) { /* 画像が取れなくても本体は登録する */ }

      // --- 登録（同名は上書き）---
      let add = 0, upd = 0;
      for (let i = 0; i < found.length; i++) {
        const f = found[i];
        setImpMsg(`登録しています… ${i+1} / ${found.length}`);
        const body = { name:f.name, maker:f.maker || null, category:f.category,
          price: f.price ?? null, life_kind: f.life_kind || null, life_days: f.life_days ?? null,
          thumb: thumbs[f.name] || null, unit:"ケース" };
        const exist = items.find(x => x.name === f.name);
        if (exist) { await api.updateOrderItem(exist.id, body); upd++; }
        else { await api.addOrderItem({ ...body, sort_order: i }); add++; }
      }
      const withImg = Object.keys(thumbs).length;
      setImpMsg(`取り込みました：新規 ${add}件 / 更新 ${upd}件（写真 ${withImg}枚）`);
      setVer(v => v + 1);
    } catch(e) {
      setImpMsg("読み込めませんでした。ファイルを確認してください");
    } finally { setImpBusy(false); }
  };

  const setF = (k, v) => setForm(o => ({ ...o, [k]: v }));
  const openNew = () => { setEditId(null); setForm({ name:"", maker:"", unit:"ケース", qty:"", note:"" }); setFormOpen(true); setMsg(""); };
  const openEdit = (it) => { setEditId(it.id); setForm({ name:it.name||"", maker:it.maker||"", unit:it.unit||"ケース", qty:it.qty==null?"":String(it.qty), note:it.note||"" }); setFormOpen(true); setMsg(""); };
  const saveItem = async () => {
    if (!form.name.trim()) { setMsg("品名を入れてください"); return; }
    setBusy(true); setMsg("");
    try {
      const body = { name:form.name.trim(), maker:form.maker.trim()||null, unit:form.unit.trim()||"ケース",
        qty: form.qty === "" ? null : Number(form.qty), note: form.note.trim()||null };
      if (editId) await api.updateOrderItem(editId, body);
      else await api.addOrderItem({ ...body, sort_order: items.length });
      setFormOpen(false); setEditId(null); setVer(v => v + 1);
    } catch(e) { setMsg("保存できませんでした"); }
    finally { setBusy(false); }
  };
  // すぐ消さず「使わない」に切り替える（戻せる）
  const [confirmOff, setConfirmOff] = useState(null);   // 確認中の品目
  const [showOff, setShowOff] = useState(false);        // 使わないものを表示するか
  const toggleActive = async (it, next) => {
    try { await api.updateOrderItem(it.id, { active: next }); setVer(v => v + 1); setConfirmOff(null); } catch(e) {}
  };
  const removeItem = async (it) => {
    if (!window.confirm(`「${it.name}」を完全に消しますか？\nこの操作は戻せません。`)) return;
    try { await api.deleteOrderItem(it.id); setVer(v => v + 1); } catch(e) {}
  };

  const inp = { width:"100%", boxSizing:"border-box", border:"1px solid var(--line)", borderRadius:8, padding:"9px 10px", fontSize:13.5, outline:"none", fontFamily:"inherit" };
  const todayKey = oiYmd(new Date());

  if (!unlocked) {
    return (
      <div>
        <div style={{ background:"var(--primary)", padding:"9px 16px", color:"#fff" }}>
          <div style={{ fontSize:16.5, fontWeight:800, letterSpacing:"-0.3px" }}>管理</div>
        </div>
        <div style={{ maxWidth:420, margin:"0 auto", padding:"56px 24px" }}>
          <div style={{ textAlign:"center", marginBottom:22 }}>
            <div style={{ width:52, height:52, margin:"0 auto 14px", borderRadius:15, background:"var(--soft)", color:"var(--primary-soft)", display:"flex", alignItems:"center", justifyContent:"center" }}>
              <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round"><rect x="4.5" y="10.5" width="15" height="10" rx="2"/><path d="M8 10.5V7a4 4 0 018 0v3.5"/></svg>
            </div>
            <div style={{ fontSize:16, fontWeight:900, color:"var(--ink)", marginBottom:5 }}>番号を入れてください</div>
            <div style={{ fontSize:12, color:"var(--sub)" }}>番号を入れるとひらきます</div>
          </div>
          <span style={{ position:"relative", display:"block", marginBottom: pwErr ? 8 : 16 }}>
            <input type="password" inputMode="numeric" value={pw} maxLength={8}
              onChange={e => { setPw(e.target.value.replace(/[^0-9]/g, "")); setPwErr(""); }}
              onKeyDown={e => { if (e.key === "Enter") tryUnlock(); }}
              aria-label="番号"
              style={{ width:"100%", boxSizing:"border-box", border:"2px solid var(--line)", borderRadius:11, padding:"14px",
                fontSize:22, textAlign:"center", outline:"none", fontFamily:"inherit",
                color:"transparent", caretColor:"transparent", textShadow:"none", background:"#fff" }} />
            {pw.length > 0 && (
              <span style={{ position:"absolute", inset:0, display:"flex", alignItems:"center", justifyContent:"center",
                pointerEvents:"none", fontSize:13, fontWeight:800, color:"var(--sub)" }}>入力中</span>
            )}
          </span>
          {pwErr && <div style={{ fontSize:12.5, color:"#b3261e", fontWeight:800, textAlign:"center", marginBottom:12 }}>{pwErr}</div>}
          <button onClick={tryUnlock}
            style={{ width:"100%", border:"none", background:"var(--primary)", color:"#fff", borderRadius:11, padding:"14px", fontSize:15, fontWeight:800, cursor:"pointer" }}>ひらく</button>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div style={{ background:"var(--primary)", padding:"9px 16px", color:"#fff" }}>
        <div style={{ fontSize:16.5, fontWeight:800, letterSpacing:"-0.3px" }}>塩干発注</div>
      </div>

      <div style={{ maxWidth:1600, margin:"0 auto", padding:"14px 16px 150px" }}>
        <div style={{ display:"flex", gap:7, marginBottom:14 }}>
          {[["today","本日の発注"],["sheet","管理"],["print","印刷"],["cal","カレンダー"],["items",`品目（${active.length}）`]].map(([k,l]) => (
            <button key={k} onClick={() => setTab(k)}
              style={{ flex:1, border:"1px solid var(--line)", borderRadius:10, padding:"10px 6px", fontSize:13, fontWeight:800, cursor:"pointer",
                background: tab===k ? "var(--primary)" : "#fff", color: tab===k ? "#fff" : "var(--text)" }}>{l}</button>
          ))}
        </div>

        {loading ? (
          <div style={{ textAlign:"center", color:"var(--faint)", padding:"40px 0", fontSize:13 }}>読み込み中…</div>
        ) : tab === "today" ? (
          <>
            {(() => {
              const keyOf = ["sun","mon","tue","wed","thu","fri","sat"][pickDay.getDay()];
              const wd = OI_WDAY[pickDay.getDay()];
              const mine = rows.filter(r => r[keyOf] != null && r[keyOf] !== "");
              const dayKey = oiYmd(pickDay);
              const chk = todayChecked[dayKey] || {};
              const doneN = mine.filter(r => chk[r.id]).length;
              const isToday = dayKey === oiYmd(new Date());
              // その週の月〜日
              const mon = new Date(pickDay); mon.setDate(mon.getDate() - (mon.getDay() === 0 ? 6 : mon.getDay() - 1));
              const week = Array.from({ length: 7 }, (_, i) => { const d = new Date(mon); d.setDate(d.getDate() + i); return d; });

              return (
                <>
                  {/* 日付を選ぶ */}
                  <div style={{ display:"flex", gap:4, marginBottom:12 }}>
                    {week.map((d, i) => {
                      const k = oiYmd(d), sel = k === dayKey, tod = k === oiYmd(new Date());
                      const dk = ["sun","mon","tue","wed","thu","fri","sat"][d.getDay()];
                      const n = rows.filter(r => r[dk] != null && r[dk] !== "").length;
                      return (
                        <button key={k} onClick={() => setPickDay(d)}
                          style={{ flex:1, border: sel ? "none" : "1px solid var(--line)",
                            background: sel ? "var(--primary)" : "#fff", color: sel ? "#fff" : (i===6 ? "#d1554f" : i===5 ? "#3b7dd8" : "var(--text)"),
                            borderRadius:10, padding:"7px 0 6px", cursor:"pointer", position:"relative" }}>
                          <span style={{ display:"block", fontSize:9.5, fontWeight:800, opacity: sel ? 0.85 : 0.7 }}>{OI_WDAY[d.getDay()]}</span>
                          <span style={{ display:"block", fontSize:16, fontWeight:900, lineHeight:1.25 }}>{d.getDate()}</span>
                          {n > 0 && (
                            <span style={{ display:"block", fontSize:8.5, fontWeight:900, marginTop:1,
                              color: sel ? "#fff" : "var(--primary-soft)", opacity: sel ? 0.9 : 1 }}>{n}</span>
                          )}
                          {tod && !sel && <span style={{ position:"absolute", top:3, right:4, width:5, height:5, borderRadius:"50%", background:"#e0a020" }} />}
                        </button>
                      );
                    })}
                  </div>

                  <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:12 }}>
                    <button onClick={() => { const d = new Date(pickDay); d.setDate(d.getDate() - 7); setPickDay(d); }} aria-label="前の週"
                      style={{ border:"1px solid var(--line)", background:"#fff", borderRadius:7, width:26, height:26, fontSize:13, fontWeight:900, color:"var(--sub)", cursor:"pointer" }}>‹</button>
                    <span style={{ fontSize:13.5, fontWeight:900, color:"var(--ink)" }}>
                      {pickDay.getMonth()+1}月{pickDay.getDate()}日（{wd}）{isToday ? "・今日" : ""}
                    </span>
                    <button onClick={() => { const d = new Date(pickDay); d.setDate(d.getDate() + 7); setPickDay(d); }} aria-label="次の週"
                      style={{ border:"1px solid var(--line)", background:"#fff", borderRadius:7, width:26, height:26, fontSize:13, fontWeight:900, color:"var(--sub)", cursor:"pointer" }}>›</button>
                    {mine.length > 0 && (
                      <span style={{ marginLeft:"auto", fontSize:12, fontWeight:800, color: doneN === mine.length ? "#3f9e63" : "var(--sub)" }}>
                        {doneN} / {mine.length} 済み
                      </span>
                    )}
                  </div>

                  {mine.length === 0 ? (
                    <div style={{ textAlign:"center", color:"var(--faint)", padding:"44px 20px", fontSize:13, lineHeight:1.9 }}>
                      <div style={{ fontSize:16, fontWeight:800, color:"var(--sub)" }}>{wd}曜の発注はありません</div>
                      <div style={{ marginTop:6 }}>「管理」で曜日に品目を入れると、ここに出ます</div>
                    </div>
                  ) : (
                    <>
                      <div style={{ height:6, background:"var(--chip)", borderRadius:99, overflow:"hidden", marginBottom:14 }}>
                        <div style={{ width:`${(doneN / mine.length) * 100}%`, height:"100%", background:"#3f9e63", transition:"width .3s" }} />
                      </div>

                      <div style={{ display:"flex", flexDirection:"column", gap:9 }}>
                        {mine.map(r => {
                          const on = !!chk[r.id];
                          return (
                            <div key={r.id} style={{ display:"flex", alignItems:"center", gap:11,
                              border: on ? "1px solid #cfe8d8" : "1px solid var(--line)", background: on ? "#f4faf6" : "#fff",
                              borderRadius:12, padding:"11px 12px" }}>
                              <button onClick={() => { const n = { ...chk }; if (on) delete n[r.id]; else n[r.id] = true; saveTodayChecked(dayKey, n); }}
                                aria-label={on ? "まだにする" : "済みにする"} aria-pressed={on}
                                style={{ width:28, height:28, borderRadius:9, flexShrink:0, cursor:"pointer",
                                  border: on ? "none" : "2px solid var(--line)", background: on ? "#3f9e63" : "#fff",
                                  display:"flex", alignItems:"center", justifyContent:"center", padding:0 }}>
                                {on && <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="3.4" strokeLinecap="round" strokeLinejoin="round"><path d="M4 12.5l5 5L20 6.5"/></svg>}
                              </button>

                              {r.thumb
                                ? <img src={r.thumb} alt="" style={{ width:48, height:48, objectFit:"cover", borderRadius:8, flexShrink:0, background:"var(--bg)", opacity: on ? 0.55 : 1 }} />
                                : <span style={{ width:48, height:48, borderRadius:8, flexShrink:0, background:"var(--bg)", display:"flex", alignItems:"center", justifyContent:"center", fontSize:9, color:"var(--faint)" }}>写真なし</span>}

                              <div style={{ minWidth:0, flex:1 }}>
                                <div style={{ fontSize:14, fontWeight:900, color:"var(--ink)", overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap",
                                  textDecoration: on ? "line-through" : "none", opacity: on ? 0.6 : 1 }}>{r.item_name}</div>
                                <div style={{ fontSize:10, color:"var(--faint)", marginTop:2 }}>
                                  {[r.maker, r.price != null ? `¥${r.price}` : null, r.life_days != null ? `D+${r.life_days}` : null].filter(Boolean).join(" ／ ")}
                                </div>
                                {r.memo && <div style={{ fontSize:10.5, color:"#c07a1a", fontWeight:700, marginTop:3 }}>{r.memo}</div>}
                              </div>

                              <div style={{ display:"flex", alignItems:"center", gap:3, flexShrink:0 }}>
                                <input value={r[keyOf] == null ? "" : String(r[keyOf])}
                                  onChange={e => setCell(r, keyOf, e.target.value.replace(/[^0-9.]/g, ""))}
                                  inputMode="decimal" aria-label={`${r.item_name}の数量`}
                                  style={{ width:52, boxSizing:"border-box", border:"1px solid var(--line)", borderRadius:8, padding:"8px 4px",
                                    fontSize:15, fontWeight:900, textAlign:"center", outline:"none", fontFamily:"inherit", color:"var(--ink)" }} />
                                <span style={{ fontSize:10, color:"var(--faint)", width:26 }}>{r.unit || ""}</span>
                              </div>
                            </div>
                          );
                        })}
                      </div>

                      <div style={{ fontSize:10.5, color:"var(--faint)", lineHeight:1.7, marginTop:16 }}>
                        上の日付を押すと、その日の発注が出ます。数量はその場で直せます。
                      </div>
                    </>
                  )}
                </>
              );
            })()}
          </>
        ) : tab === "sheet" ? (
          <>
            {(() => {
              const DK = ["sun","mon","tue","wed","thu","fri","sat"];
              const dk = DK[sheetDay];          // いま編集している曜日
              const wd = OI_WDAY[sheetDay];
              const onDay = rows.filter(r => r[dk] != null && r[dk] !== "");
              const cats = [];
              active.forEach(it => { const c = it.category || "その他"; if (!cats.includes(c)) cats.push(c); });

              // その曜日に品目を入れる／外す（1タップ）
              const tapItem = async (it) => {
                const row = rows.find(r => r.item_id === it.id);
                if (row && row[dk] != null && row[dk] !== "") {
                  // すでに入っている → その曜日だけ外す
                  await setCell(row, dk, "");
                  return;
                }
                if (row) { await setCell(row, dk, it.qty != null ? String(it.qty) : "1"); return; }
                // 行がなければ作ってから入れる
                setSheetBusy(true);
                try {
                  const sh = await ensureSheet();
                  const body = { sheet_id: sh.id, item_id: it.id, item_name: it.name, unit: it.unit || "ケース",
                    maker: it.maker || null, price: it.price ?? null, life_kind: it.life_kind || null, life_days: it.life_days ?? null,
                    thumb: it.thumb || null, sort_order: rows.length };
                  body[dk] = it.qty != null ? it.qty : 1;
                  await api.addSheetRow(body);
                  setSheetVer(v => v + 1);
                } catch(e) {} finally { setSheetBusy(false); }
              };

              return (
                <>
                  {/* 週の切り替え */}
                  <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:10 }}>
                    <button onClick={() => { const d = new Date(wkStart); d.setDate(d.getDate() - 7); setWkStart(d); }} aria-label="前の週"
                      style={{ border:"1px solid var(--line)", background:"#fff", borderRadius:8, width:30, height:30, fontSize:14, fontWeight:900, color:"var(--sub)", cursor:"pointer" }}>‹</button>
                    <span style={{ fontSize:13, fontWeight:900, color:"var(--ink)" }}>
                      {wkStart.getMonth()+1}/{wkStart.getDate()}〜{(() => { const e = new Date(wkStart); e.setDate(e.getDate()+6); return `${e.getMonth()+1}/${e.getDate()}`; })()}
                    </span>
                    <button onClick={() => { const d = new Date(wkStart); d.setDate(d.getDate() + 7); setWkStart(d); }} aria-label="次の週"
                      style={{ border:"1px solid var(--line)", background:"#fff", borderRadius:8, width:30, height:30, fontSize:14, fontWeight:900, color:"var(--sub)", cursor:"pointer" }}>›</button>
                    <button onClick={() => setWkStart(mondayOf(new Date()))}
                      style={{ marginLeft:"auto", border:"1px solid var(--line)", background:"#fff", borderRadius:8, padding:"6px 11px", fontSize:11, fontWeight:800, color:"var(--sub)", cursor:"pointer" }}>今週</button>
                  </div>

                  {/* 曜日を選ぶ */}
                  <div style={{ display:"flex", gap:4, marginBottom:12 }}>
                    {[1,2,3,4,5,6,0].map(dnum => {
                      const k = DK[dnum], sel = dnum === sheetDay;
                      const n = rows.filter(r => r[k] != null && r[k] !== "").length;
                      const d = new Date(wkStart); d.setDate(d.getDate() + (dnum === 0 ? 6 : dnum - 1));
                      return (
                        <button key={dnum} onClick={() => setSheetDay(dnum)}
                          style={{ flex:1, border: sel ? "none" : "1px solid var(--line)",
                            background: sel ? "var(--primary)" : "#fff",
                            color: sel ? "#fff" : (dnum===0 ? "#d1554f" : dnum===6 ? "#3b7dd8" : "var(--text)"),
                            borderRadius:10, padding:"7px 0 6px", cursor:"pointer" }}>
                          <span style={{ display:"block", fontSize:11, fontWeight:900 }}>{OI_WDAY[dnum]}</span>
                          <span style={{ display:"block", fontSize:9, fontWeight:800, opacity:0.75, marginTop:1 }}>{d.getDate()}</span>
                          {n > 0 && <span style={{ display:"block", fontSize:9.5, fontWeight:900, marginTop:2, color: sel ? "#fff" : "var(--primary-soft)" }}>{n}</span>}
                        </button>
                      );
                    })}
                  </div>

                  {/* この曜日に入っているもの */}
                  <div style={{ background:"#fff", border:"1px solid var(--line)", borderRadius:11, padding:"11px 12px", marginBottom:12 }}>
                    <div style={{ fontSize:12, fontWeight:900, color:"var(--ink)", marginBottom: onDay.length ? 9 : 0 }}>
                      {wd}曜に発注するもの {onDay.length > 0 && <span style={{ fontSize:10, fontWeight:900, color:"var(--primary-soft)" }}>{onDay.length}件</span>}
                    </div>
                    {onDay.length === 0 ? (
                      <div style={{ fontSize:11.5, color:"var(--faint)", lineHeight:1.6, marginTop:6 }}>下から品目を押すと、この曜日に入ります</div>
                    ) : (
                      <div style={{ display:"flex", flexDirection:"column", gap:6 }}>
                        {onDay.map(r => (
                          <div key={r.id} style={{ display:"flex", alignItems:"center", gap:9, background:"var(--bg)", borderRadius:9, padding:"7px 9px" }}>
                            {r.thumb && <img src={r.thumb} alt="" style={{ width:34, height:34, objectFit:"cover", borderRadius:6, flexShrink:0 }} />}
                            <span style={{ fontSize:12.5, fontWeight:800, color:"var(--ink)", flex:1, minWidth:0, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{r.item_name}</span>
                            <button onClick={() => { const v = Number(r[dk] || 0) - 1; setCell(r, dk, v <= 0 ? "" : String(v)); }}
                              aria-label={`${r.item_name}を1へらす`}
                              style={{ width:28, height:28, flexShrink:0, border:"1px solid var(--line)", background:"#fff", color:"var(--sub)", borderRadius:7, fontSize:16, fontWeight:900, cursor:"pointer", lineHeight:1, padding:0, display:"flex", alignItems:"center", justifyContent:"center" }}>−</button>
                            <input value={r[dk] == null ? "" : String(r[dk])} onChange={e => setCell(r, dk, e.target.value.replace(/[^0-9.]/g, ""))}
                              inputMode="decimal" aria-label={`${r.item_name}の数量`}
                              style={{ width:42, boxSizing:"border-box", border:"1px solid var(--line)", borderRadius:7, padding:"6px 2px", fontSize:14, fontWeight:900, textAlign:"center", outline:"none", fontFamily:"inherit" }} />
                            <button onClick={() => setCell(r, dk, String(Number(r[dk] || 0) + 1))}
                              aria-label={`${r.item_name}を1ふやす`}
                              style={{ width:28, height:28, flexShrink:0, border:"1px solid var(--line)", background:"#fff", color:"var(--primary)", borderRadius:7, fontSize:16, fontWeight:900, cursor:"pointer", lineHeight:1, padding:0, display:"flex", alignItems:"center", justifyContent:"center" }}>＋</button>
                            <span style={{ fontSize:9.5, color:"var(--faint)", width:22, flexShrink:0 }}>{r.unit || ""}</span>
                            <button onClick={() => setCell(r, dk, "")} aria-label="この曜日から外す"
                              style={{ border:"none", background:"transparent", color:"var(--faint)", fontSize:15, fontWeight:900, cursor:"pointer", padding:"0 2px", flexShrink:0 }}>×</button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* 品目を押して入れる */}
                  {active.length > 0 && (
                    <div style={{ background:"#fff", border:"1px solid var(--line)", borderRadius:11, padding:"11px 12px", marginBottom:12 }}>
                      <div style={{ fontSize:11.5, fontWeight:800, color:"var(--sub)", marginBottom:9 }}>押すと{wd}曜に入ります</div>
                      <div style={{ display:"flex", gap:5, flexWrap:"wrap", marginBottom:9 }}>
                        {cats.map(c => {
                          const on = openCat === c;
                          const n = active.filter(it => (it.category || "その他") === c &&
                            rows.some(r => r.item_id === it.id && r[dk] != null && r[dk] !== "")).length;
                          return (
                            <button key={c} onClick={() => setOpenCat(on ? "" : c)} aria-expanded={on}
                              style={{ border: on ? "1.5px solid var(--primary-soft)" : "1px solid var(--line)", background: on ? "var(--soft)" : "#fff",
                                color: on ? "var(--primary)" : "var(--sub)", borderRadius:999, padding:"5px 12px", fontSize:11.5, fontWeight:800, cursor:"pointer", display:"flex", alignItems:"center", gap:5 }}>
                              {c}
                              {n > 0 && <span style={{ background:"var(--primary-soft)", color:"#fff", borderRadius:999, fontSize:9, fontWeight:900, padding:"0 5px", lineHeight:1.6 }}>{n}</span>}
                              <span style={{ fontSize:8, transform: on ? "rotate(180deg)" : "none", display:"inline-block" }}>▼</span>
                            </button>
                          );
                        })}
                      </div>

                      {openCat && (
                        <div style={{ background:"var(--bg)", borderRadius:9, padding:"8px", display:"flex", flexDirection:"column", gap:4 }}>
                          {active.filter(it => (it.category || "その他") === openCat).map(it => {
                            const row = rows.find(r => r.item_id === it.id);
                            const on = !!(row && row[dk] != null && row[dk] !== "");
                            return (
                              <button key={it.id} onClick={() => tapItem(it)} disabled={sheetBusy} aria-pressed={on}
                                style={{ display:"flex", alignItems:"center", gap:9, textAlign:"left", width:"100%",
                                  border: on ? "1px solid #cfe8d8" : "1px solid var(--line)", background: on ? "#f4faf6" : "#fff",
                                  borderRadius:8, padding:"8px 9px", cursor:"pointer" }}>
                                <span style={{ width:20, height:20, borderRadius:6, flexShrink:0, border: on ? "none" : "1.5px solid var(--line)",
                                  background: on ? "#3f9e63" : "#fff", display:"flex", alignItems:"center", justifyContent:"center" }}>
                                  {on && <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="3.6" strokeLinecap="round" strokeLinejoin="round"><path d="M4 12.5l5 5L20 6.5"/></svg>}
                                </span>
                                {it.thumb && <img src={it.thumb} alt="" style={{ width:34, height:34, objectFit:"cover", borderRadius:6, flexShrink:0 }} />}
                                <span style={{ minWidth:0, flex:1 }}>
                                  <span style={{ display:"block", fontSize:12.5, fontWeight:800, color:"var(--ink)", overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{it.name}</span>
                                  <span style={{ display:"block", fontSize:9.5, color:"var(--faint)", marginTop:1 }}>
                                    {[it.maker, it.life_days != null ? `D+${it.life_days}` : null].filter(Boolean).join(" ／ ")}
                                  </span>
                                </span>
                                {it.price != null && <span style={{ fontSize:12, fontWeight:900, color: on ? "#2c6b45" : "var(--sub)", flexShrink:0 }}>¥{it.price}</span>}
                              </button>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  )}

                  {/* 全体の補足 */}
                  <div style={{ background:"#fff", border:"1px solid var(--line)", borderRadius:11, padding:"11px 12px", marginBottom:12 }}>
                    <div style={{ fontSize:11.5, fontWeight:800, color:"var(--sub)", marginBottom:7 }}>全体の補足（紙に出ます）</div>
                    <textarea value={sheetNote} onChange={e => setSheetNote(e.target.value)} onBlur={saveNote} rows={2}
                      placeholder="例：数量は目安です。売れ行きを見て調整してください。"
                      style={{ width:"100%", boxSizing:"border-box", border:"1px solid var(--line)", borderRadius:8, padding:"8px 10px", fontSize:12.5, outline:"none", resize:"vertical", fontFamily:"inherit", lineHeight:1.6 }} />
                  </div>

                  <div style={{ display:"flex", gap:8 }}>
                    {rows.length === 0 && (
                      <button onClick={copyPrevWeek} disabled={sheetBusy}
                        style={{ flex:1, border:"1px solid var(--line)", background:"#fff", color:"var(--primary)", borderRadius:11, padding:"13px", fontSize:13, fontWeight:800, cursor:"pointer" }}>前の週をコピー</button>
                    )}
                    {rows.length > 0 && (
                      <button onClick={() => window.print()}
                        style={{ flex:1, border:"none", background:"var(--primary)", color:"#fff", borderRadius:11, padding:"13px", fontSize:14, fontWeight:900, cursor:"pointer" }}>印刷する（A4）</button>
                    )}
                  </div>
                </>
              );
            })()}

            {/* 印刷される中身（画面には出ない） */}
          </>
        ) : tab === "print" ? (
          <>
            <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:12 }}>
              <button onClick={() => { const d = new Date(wkStart); d.setDate(d.getDate() - 7); setWkStart(d); }} aria-label="前の週"
                style={{ border:"1px solid var(--line)", background:"#fff", borderRadius:8, width:30, height:30, fontSize:14, fontWeight:900, color:"var(--sub)", cursor:"pointer" }}>‹</button>
              <span style={{ fontSize:13.5, fontWeight:900, color:"var(--ink)" }}>
                {wkStart.getMonth()+1}/{wkStart.getDate()}〜{(() => { const e = new Date(wkStart); e.setDate(e.getDate()+6); return `${e.getMonth()+1}/${e.getDate()}`; })()}
              </span>
              <button onClick={() => { const d = new Date(wkStart); d.setDate(d.getDate() + 7); setWkStart(d); }} aria-label="次の週"
                style={{ border:"1px solid var(--line)", background:"#fff", borderRadius:8, width:30, height:30, fontSize:14, fontWeight:900, color:"var(--sub)", cursor:"pointer" }}>›</button>
              <button onClick={() => setWkStart(mondayOf(new Date()))}
                style={{ marginLeft:"auto", border:"1px solid var(--line)", background:"#fff", borderRadius:8, padding:"6px 11px", fontSize:11, fontWeight:800, color:"var(--sub)", cursor:"pointer" }}>今週</button>
            </div>

            {rows.length === 0 ? (
              <div style={{ textAlign:"center", color:"var(--faint)", padding:"44px 20px", fontSize:13, lineHeight:1.9 }}>
                <div style={{ fontSize:15, fontWeight:800, color:"var(--sub)" }}>この週の予定はまだ空です</div>
                <div style={{ marginTop:6 }}>「管理」から品目を入れてください</div>
              </div>
            ) : (
              <>
                {/* 画面のプレビュー */}
                <div style={{ background:"#fff", border:"1px solid var(--line)", borderRadius:12, padding:"13px", marginBottom:14 }}>
                  <div style={{ fontSize:12, fontWeight:900, color:"var(--sub)", marginBottom:11 }}>印刷される内容</div>
                  {SHEET_DAYS.map(([k, l], i) => {
                    const day = rows.filter(r => r[k] != null && r[k] !== "");
                    return (
                      <div key={k} style={{ marginBottom:11 }}>
                        <div style={{ display:"flex", alignItems:"center", gap:7, marginBottom:5 }}>
                          <span style={{ fontSize:12.5, fontWeight:900, color: i===6 ? "#d1554f" : i===5 ? "#3b7dd8" : "var(--ink)" }}>{l}曜</span>
                          <span style={{ fontSize:10, color:"var(--faint)" }}>{day.length}件</span>
                        </div>
                        {day.length === 0 ? (
                          <div style={{ fontSize:11, color:"var(--faint)", paddingLeft:4 }}>—</div>
                        ) : (
                          <div style={{ display:"flex", flexDirection:"column", gap:3 }}>
                            {day.map(r => (
                              <div key={r.id} style={{ display:"flex", alignItems:"center", gap:7, fontSize:11.5, color:"var(--text)", paddingLeft:4 }}>
                                <span style={{ flex:1, minWidth:0, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{r.item_name}</span>
                                <span style={{ fontWeight:900, flexShrink:0 }}>{r[k]}{r.unit || ""}</span>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>

                <button onClick={() => window.print()}
                  style={{ width:"100%", border:"none", background:"var(--primary)", color:"#fff", borderRadius:11, padding:"14px", fontSize:15, fontWeight:900, cursor:"pointer" }}>
                  1週間分を印刷する（A4）
                </button>
                <div style={{ fontSize:10.5, color:"var(--faint)", lineHeight:1.7, marginTop:12 }}>
                  曜日ごとに分かれた表が出ます。チェック欄と数量の記入欄があるので、そのまま現場で使えます。
                </div>
              </>
            )}
          </>
        ) : tab === "cal" ? (
          <>
            {/* 月の切り替え */}
            <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:11 }}>
              <button onClick={() => setCursor(new Date(y, mo - 1, 1))} aria-label="前の月"
                style={{ border:"1px solid var(--line)", background:"#fff", borderRadius:8, width:34, height:34, fontSize:15, fontWeight:900, color:"var(--sub)", cursor:"pointer" }}>‹</button>
              <span style={{ fontSize:15, fontWeight:900, color:"var(--ink)" }}>{y}年{mo + 1}月</span>
              <button onClick={() => setCursor(new Date(y, mo + 1, 1))} aria-label="次の月"
                style={{ border:"1px solid var(--line)", background:"#fff", borderRadius:8, width:34, height:34, fontSize:15, fontWeight:900, color:"var(--sub)", cursor:"pointer" }}>›</button>
              <span style={{ marginLeft:"auto", fontSize:11.5, fontWeight:800, color:"var(--sub)" }}>
                {monthCount}回 / {monthQty > 0 ? monthQty : 0}
              </span>
            </div>

            {/* 品目でしぼる */}
            {active.length > 0 && (
              <select value={focusItem} onChange={e => setFocusItem(e.target.value)}
                style={{ ...inp, marginBottom:11, fontSize:12.5, background:"#fff" }}>
                <option value="">すべての品目</option>
                {active.map(i => <option key={i.id} value={i.id}>{i.name}</option>)}
              </select>
            )}

            {/* カレンダー */}
            <div style={{ background:"#fff", border:"1px solid var(--line)", borderRadius:12, padding:"10px", marginBottom:12 }}>
              <div style={{ display:"grid", gridTemplateColumns:"repeat(7, 1fr)", gap:3, marginBottom:4 }}>
                {OI_WDAY.map((w, i) => (
                  <div key={w} style={{ textAlign:"center", fontSize:10.5, fontWeight:900, color: i===0?"#d1554f":i===6?"#3b7dd8":"var(--faint)", padding:"3px 0" }}>{w}</div>
                ))}
              </div>
              <div style={{ display:"grid", gridTemplateColumns:"repeat(7, 1fr)", gap:3 }}>
                {cells.map((d, i) => {
                  if (!d) return <div key={i} />;
                  const key = oiYmd(new Date(y, mo, d));
                  const ls = logsOn(d);
                  const isToday = key === todayKey;
                  const isPicked = key === pickDate;
                  const n = ls.length;
                  const bg = n === 0 ? "#fff" : n === 1 ? "#e6f0e9" : n === 2 ? "#c3e0cd" : "#8fc9a6";
                  return (
                    <button key={i} onClick={() => setPickDate(key)}
                      style={{ aspectRatio:"1", border: isPicked ? "2px solid var(--primary-soft)" : isToday ? "1.5px solid #e0a020" : "1px solid var(--line)",
                        background:bg, borderRadius:8, padding:2, cursor:"pointer", display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", gap:1 }}>
                      <span style={{ fontSize:11.5, fontWeight: isToday ? 900 : 700, color:"var(--ink)" }}>{d}</span>
                      {n > 0 && <span style={{ fontSize:9, fontWeight:900, color:"#2c6b45" }}>{n}件</span>}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* 週ごとの推移 */}
            <div style={{ background:"#fff", border:"1px solid var(--line)", borderRadius:12, padding:"12px 13px", marginBottom:12 }}>
              <div style={{ fontSize:12.5, fontWeight:900, color:"var(--ink)", marginBottom:9 }}>週ごとの推移</div>
              {weeks.map(w => (
                <div key={w.no} style={{ display:"flex", alignItems:"center", gap:8, marginBottom:7 }}>
                  <span style={{ fontSize:11, fontWeight:800, color:"var(--sub)", width:52, flexShrink:0 }}>第{w.no}週</span>
                  <div style={{ flex:1, height:16, background:"var(--bg)", borderRadius:5, overflow:"hidden", minWidth:0 }}>
                    <div style={{ width: `${(w.count / maxW) * 100}%`, height:"100%", background:"var(--primary-soft)", borderRadius:5, transition:"width .3s" }} />
                  </div>
                  <span style={{ fontSize:11.5, fontWeight:900, color:"var(--ink)", width:34, textAlign:"right", flexShrink:0 }}>{w.count}回</span>
                  <span style={{ fontSize:11, fontWeight:800, color:"var(--primary-soft)", width:46, textAlign:"right", flexShrink:0 }}>{w.qty > 0 ? w.qty : "—"}</span>
                </div>
              ))}
              {weeks.every(w => w.count === 0) && (
                <div style={{ fontSize:11.5, color:"var(--faint)", lineHeight:1.6 }}>この月の記録はまだありません</div>
              )}
            </div>

            {/* 選んだ日の記録 */}
            <div style={{ background:"#fff", border:"1px solid var(--line)", borderRadius:12, padding:"12px 13px" }}>
              <div style={{ fontSize:12.5, fontWeight:900, color:"var(--ink)", marginBottom:3 }}>
                {Number(pickDate.slice(5,7))}月{Number(pickDate.slice(8,10))}日（{OI_WDAY[new Date(pickDate + "T00:00:00").getDay()]}）に発注したもの
              </div>
              <div style={{ fontSize:10.5, color:"var(--sub)", marginBottom:10 }}>カレンダーの日を押すと切り替わります</div>

              {(() => {
                const dayLogs = logs.filter(l => l.ordered_on === pickDate);
                return dayLogs.length === 0 ? (
                  <div style={{ fontSize:11.5, color:"var(--faint)", marginBottom:12 }}>まだ記録がありません</div>
                ) : (
                  <div style={{ display:"flex", flexDirection:"column", gap:5, marginBottom:12 }}>
                    {dayLogs.map(l => {
                      const it = itemById(l.item_id);
                      return (
                        <div key={l.id} style={{ display:"flex", alignItems:"center", gap:8, background:"var(--bg)", borderRadius:8, padding:"7px 10px" }}>
                          <span style={{ fontSize:13, fontWeight:800, color:"var(--ink)", flex:1, minWidth:0, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{it ? it.name : "（削除済み）"}</span>
                          {l.qty != null && <span style={{ fontSize:12.5, fontWeight:900, color:"var(--primary-soft)", flexShrink:0 }}>{l.qty}{it ? (it.unit || "") : ""}</span>}
                          <button onClick={() => delLog(l)} aria-label="この記録を消す"
                            style={{ border:"none", background:"transparent", color:"var(--faint)", fontSize:15, fontWeight:900, cursor:"pointer", padding:"0 2px", lineHeight:1, flexShrink:0 }}>×</button>
                        </div>
                      );
                    })}
                  </div>
                );
              })()}

              {active.length === 0 ? (
                <div style={{ fontSize:11.5, color:"var(--faint)", lineHeight:1.6 }}>先に「品目」から登録してください</div>
              ) : (
                <>
                  <div style={{ fontSize:11.5, fontWeight:800, color:"var(--sub)", marginBottom:7 }}>この日に発注したものを記録する</div>
                  <div style={{ display:"flex", flexDirection:"column", gap:5 }}>
                    {active.map(it => (
                      <div key={it.id} style={{ display:"flex", alignItems:"center", gap:7 }}>
                        <span style={{ fontSize:12.5, fontWeight:700, color:"var(--text)", flex:1, minWidth:0, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{it.name}</span>
                        <input value={logQty[it.id] ?? ""} onChange={e => setLogQty(v => ({ ...v, [it.id]: e.target.value.replace(/[^0-9.]/g, "") }))}
                          inputMode="decimal" placeholder={it.qty != null ? String(it.qty) : "数量"}
                          style={{ width:64, flexShrink:0, boxSizing:"border-box", border:"1px solid var(--line)", borderRadius:7, padding:"6px 8px", fontSize:12.5, outline:"none", textAlign:"right", fontFamily:"inherit" }} />
                        <span style={{ fontSize:11, color:"var(--faint)", width:32, flexShrink:0 }}>{it.unit || ""}</span>
                        <button onClick={() => addLog(it)} disabled={busy}
                          style={{ border:"none", background:"var(--primary-soft)", color:"#fff", borderRadius:7, padding:"6px 13px", fontSize:12, fontWeight:800, cursor:"pointer", flexShrink:0 }}>記録</button>
                      </div>
                    ))}
                  </div>
                </>
              )}
              {msg && <div style={{ fontSize:12, color:"#b3261e", fontWeight:800, marginTop:9 }}>{msg}</div>}
            </div>
          </>
        ) : (
          <>
            <div style={{ display:"flex", gap:8, marginBottom:12 }}>
              <button onClick={openNew}
                style={{ flex:1, border:"none", background:"var(--primary-soft)", color:"#fff", borderRadius:10, padding:"11px", fontSize:13.5, fontWeight:800, cursor:"pointer" }}>＋ 品目を追加</button>
              <label style={{ flex:1, border:"1px solid var(--line)", background: impBusy ? "#f0f0f0" : "#fff", color:"var(--text)", borderRadius:10, padding:"11px", fontSize:13, fontWeight:800, cursor: impBusy ? "default" : "pointer", textAlign:"center", display:"block", boxSizing:"border-box", position:"relative", overflow:"hidden" }}>
                {impBusy ? "読み込み中…" : "早見表を取り込む"}
                <input ref={xlsxRef} type="file" accept=".xlsx,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" disabled={impBusy}
                  style={{ position:"absolute", inset:0, opacity:0, width:"100%", height:"100%", cursor:"pointer" }}
                  onChange={e => { const f = e.target.files && e.target.files[0]; e.target.value = ""; importExcel(f); }} />
              </label>
            </div>
            {impMsg && (
              <div style={{ fontSize:11.5, fontWeight:700, color: impMsg.includes("できません") || impMsg.includes("見つかり") ? "#b3261e" : "var(--primary)",
                background:"var(--soft)", borderRadius:8, padding:"8px 10px", marginBottom:12, lineHeight:1.6 }}>{impMsg}</div>
            )}

            {formOpen && (
              <div style={{ background:"#fff", border:"1px solid var(--line)", borderRadius:12, padding:"13px", marginBottom:14 }}>
                <div style={{ fontSize:13, fontWeight:900, color:"var(--ink)", marginBottom:10 }}>{editId ? "品目を直す" : "品目を追加"}</div>
                <input value={form.name} onChange={e => setF("name", e.target.value)} placeholder="品名（例：もずく）" style={{ ...inp, marginBottom:8 }} />
                <input value={form.maker} onChange={e => setF("maker", e.target.value)} placeholder="メーカー・仕入先（例：CGC）" style={{ ...inp, marginBottom:8, fontSize:12.5 }} />
                <div style={{ display:"flex", gap:8, marginBottom:8 }}>
                  <input value={form.qty} onChange={e => setF("qty", e.target.value.replace(/[^0-9.]/g, ""))} inputMode="decimal" placeholder="いつもの数量" style={{ ...inp, flex:1 }} />
                  <input value={form.unit} onChange={e => setF("unit", e.target.value)} placeholder="単位" style={{ ...inp, width:96, flexShrink:0 }} />
                </div>
                <input value={form.note} onChange={e => setF("note", e.target.value)} placeholder="メモ（例：連休前は多め）" style={{ ...inp, marginBottom:11, fontSize:12.5 }} />
                {msg && <div style={{ fontSize:12, color:"#b3261e", fontWeight:800, marginBottom:9 }}>{msg}</div>}
                <div style={{ display:"flex", gap:8 }}>
                  <button onClick={() => { setFormOpen(false); setEditId(null); setMsg(""); }}
                    style={{ flex:1, border:"none", background:"var(--chip)", color:"var(--text)", borderRadius:9, padding:"11px", fontSize:13, fontWeight:800, cursor:"pointer" }}>やめる</button>
                  <button onClick={saveItem} disabled={busy}
                    style={{ flex:2, border:"none", background: busy ? "#ccc" : "var(--primary-soft)", color:"#fff", borderRadius:9, padding:"11px", fontSize:13, fontWeight:900, cursor:"pointer" }}>{busy ? "保存中…" : (editId ? "直す" : "登録する")}</button>
                </div>
              </div>
            )}

            {(() => {
              const off = items.filter(i => i.active === false);
              return off.length > 0 ? (
                <div style={{ marginBottom:12 }}>
                  <button onClick={() => setShowOff(v => !v)}
                    style={{ border:"1px solid var(--line)", background:"#fff", color:"var(--sub)", borderRadius:8, padding:"7px 13px", fontSize:11.5, fontWeight:800, cursor:"pointer" }}>
                    使わないもの {off.length}件 {showOff ? "を隠す" : "を見る"}
                  </button>
                  {showOff && (
                    <div style={{ marginTop:8, display:"flex", flexDirection:"column", gap:6 }}>
                      {off.map(it => (
                        <div key={it.id} style={{ display:"flex", alignItems:"center", gap:9, border:"1px solid var(--line)", borderRadius:9, padding:"8px 10px", background:"#fafafa" }}>
                          {it.thumb && <img src={it.thumb} alt="" style={{ width:34, height:34, objectFit:"cover", borderRadius:6, flexShrink:0, opacity:0.5 }} />}
                          <span style={{ fontSize:12.5, fontWeight:700, color:"var(--sub)", flex:1, minWidth:0, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{it.name}</span>
                          <button onClick={() => toggleActive(it, true)}
                            style={{ border:"1px solid var(--line)", background:"#fff", color:"var(--primary)", borderRadius:7, padding:"5px 12px", fontSize:11.5, fontWeight:800, cursor:"pointer", flexShrink:0 }}>もどす</button>
                          <button onClick={() => removeItem(it)} aria-label="完全に消す"
                            style={{ border:"none", background:"transparent", color:"var(--faint)", fontSize:14, fontWeight:900, cursor:"pointer", padding:"0 3px", flexShrink:0 }}>×</button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ) : null;
            })()}

            {active.length === 0 ? (
              <div style={{ textAlign:"center", color:"var(--faint)", padding:"40px 20px", fontSize:13, lineHeight:1.8 }}>
                <div style={{ fontSize:15, fontWeight:800, color:"var(--sub)" }}>まだ品目がありません</div>
                <div style={{ marginTop:6 }}>よく発注するものから登録してみてください</div>
              </div>
            ) : (
              <div style={{ display:"flex", flexDirection:"column", gap:7 }}>
                {active.map(it => {
                  const n = logs.filter(l => l.item_id === it.id).length;
                  const q = logs.filter(l => l.item_id === it.id).reduce((a, l) => a + Number(l.qty || 0), 0);
                  return (
                    <div key={it.id} style={{ border:"1px solid var(--line)", borderRadius:11, padding:"11px 12px", background:"#fff", display:"flex", gap:11 }}>
                      {it.thumb && <img src={it.thumb} alt="" style={{ width:52, height:52, objectFit:"cover", borderRadius:8, flexShrink:0, background:"var(--bg)" }} />}
                      <div style={{ minWidth:0, flex:1 }}>
                      <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:5 }}>
                        <span style={{ fontSize:14.5, fontWeight:900, color:"var(--ink)", minWidth:0, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap", flex:1 }}>{it.name}</span>
                        {it.qty != null && <span style={{ fontSize:12, fontWeight:800, color:"var(--faint)", flexShrink:0 }}>いつも {it.qty}{it.unit || ""}</span>}
                      </div>
                      <div style={{ fontSize:11.5, fontWeight:800, color:"var(--primary-soft)", marginBottom:6 }}>{mo + 1}月：{n}回 / {q > 0 ? q + (it.unit || "") : "—"}</div>
                      {(it.maker || it.note) && <div style={{ fontSize:11.5, color:"var(--sub)", lineHeight:1.5, marginBottom:7 }}>{[it.maker, it.note].filter(Boolean).join(" / ")}</div>}
                      <div style={{ display:"flex", gap:6 }}>
                        <button onClick={() => openEdit(it)}
                          style={{ border:"1px solid var(--line)", background:"#fff", color:"var(--text)", borderRadius:7, padding:"5px 13px", fontSize:11.5, fontWeight:800, cursor:"pointer" }}>直す</button>
                        {confirmOff === it.id ? (
                          <span style={{ marginLeft:"auto", display:"flex", gap:5, alignItems:"center" }}>
                            <span style={{ fontSize:10.5, color:"var(--sub)", fontWeight:700 }}>使わない？</span>
                            <button onClick={() => setConfirmOff(null)}
                              style={{ border:"1px solid var(--line)", background:"#fff", color:"var(--sub)", borderRadius:7, padding:"5px 11px", fontSize:11.5, fontWeight:800, cursor:"pointer" }}>やめる</button>
                            <button onClick={() => toggleActive(it, false)}
                              style={{ border:"none", background:"#c07a1a", color:"#fff", borderRadius:7, padding:"5px 13px", fontSize:11.5, fontWeight:800, cursor:"pointer" }}>はい</button>
                          </span>
                        ) : (
                          <button onClick={() => setConfirmOff(it.id)}
                            style={{ marginLeft:"auto", border:"1px solid var(--line)", background:"#fff", color:"var(--sub)", borderRadius:7, padding:"5px 13px", fontSize:11.5, fontWeight:800, cursor:"pointer" }}>使わない</button>
                        )}
                      </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </>
        )}
        <div id="sheetPrint">
          {/* 見出し＋承認欄 */}
          <div style={{ display:"flex", alignItems:"flex-start", marginBottom:"4mm" }}>
            <div style={{ flex:1 }}>
              <div style={{ fontSize:15, fontWeight:700, letterSpacing:"1pt" }}>塩干　週間発注表</div>
              <div style={{ fontSize:"10pt", marginTop:"1mm" }}>
                {wkStart.getFullYear()}年 {wkStart.getMonth()+1}月{wkStart.getDate()}日（月）〜 {(() => { const e = new Date(wkStart); e.setDate(e.getDate()+6); return `${e.getMonth()+1}月${e.getDate()}日`; })()}（日）
              </div>
            </div>
            <table style={{ borderCollapse:"collapse", fontSize:"7pt" }}>
              <tbody>
                <tr>{["作成","確認","チーフ"].map(t => (
                  <td key={t} style={{ border:"1px solid #333", padding:"1mm 3mm", textAlign:"center", background:"#f2f2f2" }}>{t}</td>
                ))}</tr>
                <tr>{[0,1,2].map(i => (<td key={i} style={{ border:"1px solid #333", height:"9mm", minWidth:"14mm" }} />))}</tr>
              </tbody>
            </table>
          </div>

          {/* 曜日ごとの表 */}
          {SHEET_DAYS.map(([k, l], i) => {
            const day = rows.filter(r => r[k] != null && r[k] !== "");
            const d = new Date(wkStart); d.setDate(d.getDate() + i);
            const hd = i === 6 ? "#c00" : i === 5 ? "#06c" : "#333";
            return (
              <div key={k} style={{ marginBottom:"3.5mm", breakInside:"avoid" }}>
                <div style={{ borderLeft:`3px solid ${hd}`, paddingLeft:"2mm", marginBottom:"1mm",
                  display:"flex", alignItems:"baseline", gap:"3mm" }}>
                  <span style={{ fontSize:"12pt", fontWeight:700, color:hd }}>{l}曜</span>
                  <span style={{ fontSize:"9pt" }}>{d.getMonth()+1}/{d.getDate()}</span>
                  <span style={{ fontSize:"8pt", color:"#666" }}>{day.length}件</span>
                </div>
                {day.length === 0 ? (
                  <div style={{ fontSize:"9pt", color:"#999", paddingLeft:"3mm" }}>発注なし</div>
                ) : (
                  <table className="sheet-tbl">
                <thead>
                  <tr>
                    <th style={{ width:"7%" }}>済</th>
                    <th style={{ width:"30%" }}>品目</th>
                    <th style={{ width:"14%" }}>仕入先</th>
                    <th style={{ width:"9%" }}>売価</th>
                    <th style={{ width:"8%" }}>期限</th>
                    <th style={{ width:"10%" }}>数量</th>
                    <th style={{ width:"22%" }}>備考</th>
                  </tr>
                </thead>
                <tbody>
                  {day.map(r => (
                    <tr key={r.id}>
                      <td style={{ height:"7mm" }}>□</td>
                      <td className="nm">{r.item_name}</td>
                      <td style={{ fontSize:"7.5pt" }}>{r.maker || ""}</td>
                      <td style={{ fontSize:"8pt" }}>{r.price != null ? `¥${r.price}` : ""}</td>
                      <td style={{ fontSize:"7.5pt" }}>{r.life_days != null ? `D+${r.life_days}` : ""}</td>
                      <td style={{ fontWeight:700 }}>{r[k]}{r.unit || ""}</td>
                      <td style={{ fontSize:"7.5pt", textAlign:"left", paddingLeft:"1.5mm" }}>{r.memo || ""}</td>
                    </tr>
                  ))}
                </tbody>
                  </table>
                )}
              </div>
            );
          })}

          {sheetNote.trim() && (
            <div style={{ marginTop:"3mm", padding:"2mm 3mm", border:"0.3mm solid #999", background:"#fafafa", fontSize:"9pt", lineHeight:1.7, whiteSpace:"pre-wrap" }}>{sheetNote}</div>
          )}
        </div>

      </div>
    </div>
  );
}


// ═══════════ BundleTab：行事ごとのPOPのまとめ ═══════════
function BundleTab() {
  const [sel, setSel] = useState(null);          // 開いているPOP詳細
  const [bundles, setBundles] = useState([]);
  const [pops, setPops] = useState([]);
  const [loading, setLoading] = useState(true);
  const [counts, setCounts] = useState({});      // 束ごとのPOP枚数
  const [viewM, setViewM] = useState(new Date().getMonth() + 1);  // 見ている月
  const [openId, setOpenId] = useState("");      // 開いている束
  const [items, setItems] = useState([]);        // 開いた束の中身
  const [prompts, setPrompts] = useState([]);
  const [inner, setInner] = useState(false);
  const [ver, setVer] = useState(0);
  const [addOpen, setAddOpen] = useState(false); // POPを足すシート
  const [q, setQ] = useState("");
  const [busy, setBusy] = useState(false);
  const [tab, setTab] = useState("pop");         // pop / prompt
  const [pForm, setPForm] = useState({ title:"", prompt:"" });
  const [pOpen, setPOpen] = useState(false);
  const [copied, setCopied] = useState("");

  const NOW_M = new Date().getMonth() + 1;

  useEffect(() => {
    let alive = true; setLoading(true);
    (async () => {
      try {
        const [bs, ps, cnt] = await Promise.all([api.listBundles(), api.listAll(), api.listAllBundleItems()]);
        if (alive) {
          setBundles(bs || []); setPops(ps || []);
          const map = {};
          (cnt || []).forEach(r => { map[r.bundle_id] = (map[r.bundle_id] || 0) + 1; });
          setCounts(map);
        }
      } catch(e) {}
      finally { if (alive) setLoading(false); }
    })();
    return () => { alive = false; };
  }, [ver]);

  // 束を開く
  const openBundle = async (b) => {
    setOpenId(b.id); setInner(true); setTab("pop");
    try {
      const [its, prs] = await Promise.all([api.getBundleItems(b.id), api.getBundlePrompts(b.id)]);
      setItems(its || []); setPrompts(prs || []);
    } catch(e) { setItems([]); setPrompts([]); }
  };
  const reloadInner = async () => {
    if (!openId) return;
    try {
      const [its, prs] = await Promise.all([api.getBundleItems(openId), api.getBundlePrompts(openId)]);
      setItems(its || []); setPrompts(prs || []);
    } catch(e) {}
  };

  const popById = (id) => pops.find(p => p.id === id);
  const bundleNow = bundles.filter(b => Array.isArray(b.months) && b.months.includes(NOW_M) && b.months.length < 12);
  const bundleAll = bundles.filter(b => !bundleNow.some(x => x.id === b.id));
  const cur = bundles.find(b => b.id === openId);

  const addPop = async (p) => {
    setBusy(true);
    try { await api.addToBundle(openId, p.id, items.length); await reloadInner(); }
    catch(e) {} finally { setBusy(false); }
  };
  const delItem = async (it) => {
    try { await api.removeFromBundle(it.id); await reloadInner(); } catch(e) {}
  };
  const savePrompt = async () => {
    if (!pForm.prompt.trim()) return;
    setBusy(true);
    try {
      await api.addBundlePrompt({ bundle_id: openId, title: pForm.title.trim() || null, prompt: pForm.prompt.trim(), sort_order: prompts.length });
      setPForm({ title:"", prompt:"" }); setPOpen(false); await reloadInner();
    } catch(e) {} finally { setBusy(false); }
  };
  const delPrompt = async (pr) => {
    if (!window.confirm("このプロンプトを消しますか？")) return;
    try { await api.deleteBundlePrompt(pr.id); await reloadInner(); } catch(e) {}
  };
  const copyPrompt = async (pr) => {
    try {
      await navigator.clipboard.writeText(pr.prompt);
      setCopied(pr.id); setTimeout(() => setCopied(""), 1600);
    } catch(e) {}
  };

  // ── 束の中身 ──
  if (inner && cur) {
    const inIds = items.map(i => i.pop_id);
    const cands = pops.filter(p => !inIds.includes(p.id))
      .filter(p => !q.trim() || (p.product_name || "").includes(q.trim()) || (p.store_name || "").includes(q.trim()));
    return (
      <div>
        <div style={{ background:"var(--primary)", padding:"9px 16px", color:"#fff", display:"flex", alignItems:"center", gap:10 }}>
          <button onClick={() => { setInner(false); setOpenId(""); setQ(""); }} aria-label="もどる"
            style={{ border:"none", background:"rgba(255,255,255,0.2)", color:"#fff", borderRadius:8, width:30, height:30, fontSize:16, fontWeight:900, cursor:"pointer" }}>‹</button>
          <div style={{ minWidth:0 }}>
            <div style={{ fontSize:16, fontWeight:800, letterSpacing:"-0.3px", whiteSpace:"nowrap", overflow:"hidden", textOverflow:"ellipsis" }}>{cur.name}</div>
          </div>
        </div>

        <div style={{ maxWidth:1600, margin:"0 auto", padding:"14px 16px 150px" }}>
          {cur.note && <div style={{ fontSize:12, color:"var(--sub)", lineHeight:1.6, marginBottom:12 }}>{cur.note}</div>}

          <div style={{ display:"flex", gap:7, marginBottom:14 }}>
            {[["pop", `POP（${items.length}）`], ["prompt", `プロンプト（${prompts.length}）`]].map(([k, l]) => (
              <button key={k} onClick={() => setTab(k)}
                style={{ flex:1, border:"1px solid var(--line)", borderRadius:10, padding:"10px 6px", fontSize:13, fontWeight:800, cursor:"pointer",
                  background: tab===k ? "var(--primary)" : "#fff", color: tab===k ? "#fff" : "var(--text)" }}>{l}</button>
            ))}
          </div>

          {tab === "pop" ? (
            <>
              <button onClick={() => setAddOpen(v => !v)}
                style={{ width:"100%", border:"none", background: addOpen ? "var(--chip)" : "var(--primary-soft)", color: addOpen ? "var(--text)" : "#fff", borderRadius:10, padding:"11px", fontSize:13.5, fontWeight:800, cursor:"pointer", marginBottom:12 }}>
                {addOpen ? "とじる" : "＋ POPを足す"}
              </button>

              {addOpen && (
                <div style={{ background:"#fff", border:"1px solid var(--line)", borderRadius:11, padding:"11px 12px", marginBottom:14 }}>
                  <input value={q} onChange={e => setQ(e.target.value)} placeholder="品名でさがす"
                    style={{ width:"100%", boxSizing:"border-box", border:"1px solid var(--line)", borderRadius:8, padding:"9px 10px", fontSize:13, outline:"none", marginBottom:9, fontFamily:"inherit" }} />
                  <div style={{ maxHeight:260, overflowY:"auto", display:"flex", flexDirection:"column", gap:5 }}>
                    {cands.slice(0, 60).map(p => (
                      <button key={p.id} onClick={() => addPop(p)} disabled={busy}
                        style={{ display:"flex", alignItems:"center", gap:9, textAlign:"left", border:"1px solid var(--line)", background:"#fff", borderRadius:8, padding:"6px 8px", cursor:"pointer" }}>
                        <img src={p.image_url} alt="" style={{ width:32, height:44, objectFit:"cover", borderRadius:4, flexShrink:0, background:"var(--bg)" }} />
                        <span style={{ minWidth:0, flex:1 }}>
                          <span style={{ display:"block", fontSize:12.5, fontWeight:800, color:"var(--ink)", overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{p.product_name}</span>
                          <span style={{ display:"block", fontSize:10, color:"var(--faint)" }}>{p.store_name}</span>
                        </span>
                        <span style={{ fontSize:16, fontWeight:900, color:"var(--primary-soft)", flexShrink:0 }}>＋</span>
                      </button>
                    ))}
                    {cands.length === 0 && <div style={{ fontSize:11.5, color:"var(--faint)", padding:"8px 2px" }}>足せるPOPがありません</div>}
                  </div>
                </div>
              )}

              {items.length === 0 ? (
                <div style={{ textAlign:"center", color:"var(--faint)", padding:"40px 20px", fontSize:13, lineHeight:1.8 }}>
                  <div style={{ fontSize:15, fontWeight:800, color:"var(--sub)" }}>まだPOPが入っていません</div>
                  <div style={{ marginTop:6 }}>「＋ POPを足す」から入れてください</div>
                </div>
              ) : (
                <div className="pop-grid v-sm">
                  {items.map(it => {
                    const p = popById(it.pop_id);
                    if (!p) return null;
                    return (
                      <div key={it.id} style={{ position:"relative" }}>
                        <button onClick={() => setSel(p)}
                          style={{ display:"block", width:"100%", border:"1px solid var(--line)", background:"#fff", borderRadius:10, overflow:"hidden", cursor:"pointer", padding:0 }}>
                          <img src={p.image_url} alt={p.product_name} style={{ width:"100%", aspectRatio:"1/1.414", objectFit:"cover", display:"block", background:"var(--bg)" }} />
                          <span style={{ display:"block", fontSize:11, fontWeight:800, color:"var(--ink)", padding:"5px 6px", textAlign:"left", overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{p.product_name}</span>
                        </button>
                        <button onClick={() => delItem(it)} aria-label="この束から外す"
                          style={{ position:"absolute", top:4, right:4, border:"none", background:"rgba(20,20,25,0.6)", color:"#fff", borderRadius:"50%", width:22, height:22, fontSize:13, fontWeight:900, cursor:"pointer", lineHeight:1 }}>×</button>
                      </div>
                    );
                  })}
                </div>
              )}
            </>
          ) : (
            <>
              <button onClick={() => setPOpen(v => !v)}
                style={{ width:"100%", border:"none", background: pOpen ? "var(--chip)" : "var(--primary-soft)", color: pOpen ? "var(--text)" : "#fff", borderRadius:10, padding:"11px", fontSize:13.5, fontWeight:800, cursor:"pointer", marginBottom:12 }}>
                {pOpen ? "とじる" : "＋ プロンプトを足す"}
              </button>

              {pOpen && (
                <div style={{ background:"#fff", border:"1px solid var(--line)", borderRadius:11, padding:"12px", marginBottom:14 }}>
                  <input value={pForm.title} onChange={e => setPForm(o => ({ ...o, title:e.target.value }))} placeholder="名前（例：うなぎ縦A4）"
                    style={{ width:"100%", boxSizing:"border-box", border:"1px solid var(--line)", borderRadius:8, padding:"9px 10px", fontSize:13, outline:"none", marginBottom:8, fontFamily:"inherit" }} />
                  <textarea value={pForm.prompt} onChange={e => setPForm(o => ({ ...o, prompt:e.target.value }))} rows={6} placeholder="プロンプトを貼り付け"
                    style={{ width:"100%", boxSizing:"border-box", border:"1px solid var(--line)", borderRadius:8, padding:"9px 10px", fontSize:12.5, outline:"none", resize:"vertical", fontFamily:"inherit", lineHeight:1.6, marginBottom:10 }} />
                  <button onClick={savePrompt} disabled={busy || !pForm.prompt.trim()}
                    style={{ width:"100%", border:"none", background: (busy || !pForm.prompt.trim()) ? "#ccc" : "var(--primary-soft)", color:"#fff", borderRadius:9, padding:"11px", fontSize:13, fontWeight:900, cursor:"pointer" }}>保存する</button>
                </div>
              )}

              {prompts.length === 0 ? (
                <div style={{ textAlign:"center", color:"var(--faint)", padding:"40px 20px", fontSize:13, lineHeight:1.8 }}>
                  <div style={{ fontSize:15, fontWeight:800, color:"var(--sub)" }}>まだプロンプトがありません</div>
                  <div style={{ marginTop:6 }}>うまくいったプロンプトを残しておくと、来年そのまま使えます</div>
                </div>
              ) : (
                <div style={{ display:"flex", flexDirection:"column", gap:9 }}>
                  {prompts.map(pr => (
                    <div key={pr.id} style={{ background:"#fff", border:"1px solid var(--line)", borderRadius:11, padding:"11px 12px" }}>
                      <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:7 }}>
                        <span style={{ fontSize:13, fontWeight:900, color:"var(--ink)", flex:1, minWidth:0, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{pr.title || "（名前なし）"}</span>
                        <button onClick={() => copyPrompt(pr)}
                          style={{ border:"none", background: copied===pr.id ? "#3f9e63" : "var(--primary-soft)", color:"#fff", borderRadius:7, padding:"5px 12px", fontSize:11.5, fontWeight:800, cursor:"pointer", flexShrink:0 }}>
                          {copied===pr.id ? "コピーした" : "コピー"}
                        </button>
                        <button onClick={() => delPrompt(pr)} aria-label="消す"
                          style={{ border:"none", background:"transparent", color:"var(--faint)", fontSize:15, fontWeight:900, cursor:"pointer", padding:"0 2px", flexShrink:0 }}>×</button>
                      </div>
                      <div style={{ fontSize:11.5, color:"var(--sub)", lineHeight:1.6, whiteSpace:"pre-wrap", maxHeight:110, overflow:"hidden" }}>{pr.prompt}</div>
                    </div>
                  ))}
                </div>
              )}
            </>
          )}
        </div>
        {sel && <PopDetail pop={sel} onClose={() => setSel(null)}
          onDelete={() => { setSel(null); reloadInner(); }}
          navList={items.map(i => popById(i.pop_id)).filter(Boolean)}
          onNav={(p) => setSel(p)} />}
      </div>
    );
  }

  // ── 年間の図 ──
  const MONTH_LABEL = ["1","2","3","4","5","6","7","8","9","10","11","12"];
  const BAR_COLORS = ["#d1554f","#c39a3c","#3f9e63","#3b7dd8","#8a5fc4","#c4685f","#3f8f9e","#9e7b3f"];

  const seasonal = bundles.filter(b => Array.isArray(b.months) && b.months.length > 0 && b.months.length < 12);
  const always   = bundles.filter(b => !seasonal.some(x => x.id === b.id));
  const colorOf  = (b) => BAR_COLORS[seasonal.findIndex(x => x.id === b.id) % BAR_COLORS.length] || "#3f9e63";

  // 見ている月の行事／来月の予告
  const nextM = viewM === 12 ? 1 : viewM + 1;
  const inMonth = (m) => seasonal.filter(b => b.months.includes(m));
  const viewList = inMonth(viewM);
  const soonList = inMonth(nextM).filter(b => !b.months.includes(viewM));  // 来月から始まるもの

  const Card = ({ b, hot, soon }) => {
    const n = counts[b.id] || 0;
    const col = colorOf(b);
    return (
      <button onClick={() => openBundle(b)}
        style={{ display:"flex", alignItems:"center", gap:11, textAlign:"left", width:"100%",
          border: hot ? `1.5px solid ${col}` : "1px solid var(--line)",
          background: hot ? col + "0f" : "#fff", borderRadius:12, padding:"12px 13px", cursor:"pointer" }}>
        <span style={{ width:4, alignSelf:"stretch", borderRadius:2, background:col, flexShrink:0 }} />
        <span style={{ minWidth:0, flex:1 }}>
          <span style={{ display:"flex", alignItems:"center", gap:6, marginBottom:2 }}>
            <span style={{ fontSize:14.5, fontWeight:900, color:"var(--ink)", minWidth:0, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{b.name}</span>
            {soon && <span style={{ fontSize:9, fontWeight:900, color:"#fff", background:"#e0855f", borderRadius:999, padding:"1px 7px", flexShrink:0 }}>来月</span>}
          </span>
          {b.note && <span style={{ display:"block", fontSize:10.5, color:"var(--sub)", lineHeight:1.5, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{b.note}</span>}
        </span>
        <span style={{ fontSize:11, fontWeight:900, color: n > 0 ? col : "var(--faint)", flexShrink:0, whiteSpace:"nowrap" }}>
          {n > 0 ? `${n}枚` : "—"}
        </span>
        <span style={{ fontSize:16, fontWeight:900, color:"var(--faint)", flexShrink:0 }}>›</span>
      </button>
    );
  };

  return (
    <div>
      <div style={{ background:"var(--primary)", padding:"9px 16px", color:"#fff" }}>
        <div style={{ fontSize:16.5, fontWeight:800, letterSpacing:"-0.3px" }}>カレンダー</div>
      </div>

      <div style={{ maxWidth:1600, margin:"0 auto", padding:"14px 16px 150px" }}>
        {loading ? (
          <div style={{ textAlign:"center", color:"var(--faint)", padding:"40px 0", fontSize:13 }}>読み込み中…</div>
        ) : (
          <>
            {/* 年間の帯グラフ（月を押すと切り替わる） */}
            <div style={{ background:"#fff", border:"1px solid var(--line)", borderRadius:12, padding:"12px 10px 8px", marginBottom:12, overflowX:"auto" }}>
              <div style={{ minWidth:520 }}>
                {/* 月の見出し＝押せる */}
                <div style={{ display:"grid", gridTemplateColumns:"84px repeat(12, 1fr)", gap:2, marginBottom:6 }}>
                  <div />
                  {MONTH_LABEL.map((m, i) => {
                    const mm = i + 1;
                    const isNow = mm === NOW_M, isView = mm === viewM;
                    return (
                      <button key={m} onClick={() => setViewM(mm)} aria-label={`${mm}月を見る`}
                        style={{ border:"none", background: isView ? "var(--primary)" : "transparent",
                          color: isView ? "#fff" : isNow ? "var(--primary)" : "var(--faint)",
                          borderRadius:5, padding:"3px 0", fontSize:10, fontWeight:900, cursor:"pointer", lineHeight:1.3 }}>
                        {m}
                      </button>
                    );
                  })}
                </div>

                {/* 行事の帯 */}
                {seasonal.map(b => {
                  const col = colorOf(b);
                  const on = b.months.includes(viewM);
                  const n = counts[b.id] || 0;
                  return (
                    <button key={b.id} onClick={() => openBundle(b)}
                      style={{ display:"grid", gridTemplateColumns:"84px repeat(12, 1fr)", gap:2, width:"100%", alignItems:"center",
                        border:"none", background: on ? "var(--soft)" : "transparent", borderRadius:7, padding:"4px 2px", marginBottom:3, cursor:"pointer" }}>
                      <span style={{ display:"flex", alignItems:"center", gap:4, minWidth:0, paddingLeft:4 }}>
                        <span style={{ fontSize:10.5, fontWeight:800, color: on ? "var(--ink)" : "var(--sub)", overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{b.name}</span>
                        {n > 0 && <span style={{ fontSize:8, fontWeight:900, color:col, flexShrink:0 }}>{n}</span>}
                      </span>
                      {MONTH_LABEL.map((m, i) => {
                        const mm = i + 1, hit = b.months.includes(mm);
                        return (
                          <span key={m} style={{ height:15, borderRadius:3,
                            background: hit ? col : "var(--bg)",
                            opacity: hit ? (mm === viewM ? 1 : 0.6) : (mm === viewM ? 0.55 : 1),
                            outline: mm === NOW_M ? "1.5px solid var(--primary-soft)" : "none", outlineOffset:-1 }} />
                        );
                      })}
                    </button>
                  );
                })}

                {/* 今月の印 */}
                <div style={{ display:"grid", gridTemplateColumns:"84px repeat(12, 1fr)", gap:2, marginTop:3 }}>
                  <div style={{ fontSize:8, fontWeight:800, color:"var(--faint)", textAlign:"right", paddingRight:4 }}>今月</div>
                  {MONTH_LABEL.map((m, i) => (
                    <div key={m} style={{ textAlign:"center", fontSize:8, fontWeight:900, color:"var(--primary-soft)" }}>
                      {(i+1) === NOW_M ? "▲" : ""}
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* 選んだ月 */}
            <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:9 }}>
              <button onClick={() => setViewM(viewM === 1 ? 12 : viewM - 1)} aria-label="前の月"
                style={{ border:"1px solid var(--line)", background:"#fff", borderRadius:7, width:28, height:28, fontSize:14, fontWeight:900, color:"var(--sub)", cursor:"pointer" }}>‹</button>
              <span style={{ fontSize:13.5, fontWeight:900, color:"var(--ink)" }}>
                {viewM}月{viewM === NOW_M ? "（今月）" : ""}
              </span>
              <button onClick={() => setViewM(viewM === 12 ? 1 : viewM + 1)} aria-label="次の月"
                style={{ border:"1px solid var(--line)", background:"#fff", borderRadius:7, width:28, height:28, fontSize:14, fontWeight:900, color:"var(--sub)", cursor:"pointer" }}>›</button>
              {viewM !== NOW_M && (
                <button onClick={() => setViewM(NOW_M)}
                  style={{ marginLeft:"auto", border:"1px solid var(--line)", background:"#fff", borderRadius:7, padding:"6px 12px", fontSize:11, fontWeight:800, color:"var(--primary)", cursor:"pointer" }}>今月にもどる</button>
              )}
            </div>

            {viewList.length === 0 ? (
              <div style={{ textAlign:"center", color:"var(--faint)", padding:"26px 20px", fontSize:12.5, lineHeight:1.7, background:"#fff", border:"1px solid var(--line)", borderRadius:11, marginBottom:14 }}>
                {viewM}月に決まった行事はありません<br/>
                <span style={{ fontSize:11 }}>下の「いつでも使うもの」から選べます</span>
              </div>
            ) : (
              <div style={{ display:"flex", flexDirection:"column", gap:8, marginBottom:14 }}>
                {viewList.map(b => <Card key={b.id} b={b} hot />)}
              </div>
            )}

            {/* 来月の予告 */}
            {soonList.length > 0 && (
              <>
                <div style={{ fontSize:12, fontWeight:900, color:"var(--sub)", marginBottom:8 }}>そろそろ準備（{nextM}月）</div>
                <div style={{ display:"flex", flexDirection:"column", gap:8, marginBottom:20 }}>
                  {soonList.map(b => <Card key={b.id} b={b} soon />)}
                </div>
              </>
            )}

            {/* 通年 */}
            {always.length > 0 && (
              <>
                <div style={{ fontSize:12, fontWeight:900, color:"var(--sub)", marginBottom:8 }}>いつでも使うもの</div>
                <div style={{ display:"flex", flexDirection:"column", gap:8 }}>
                  {always.map(b => <Card key={b.id} b={b} />)}
                </div>
              </>
            )}

            <div style={{ fontSize:10.5, color:"var(--faint)", lineHeight:1.7, marginTop:18 }}>
              上の図の月を押すと、その月の行事に切り替わります。右の数字はPOPの枚数です。
            </div>
          </>
        )}
      </div>
    </div>
  );
}

;Object.assign(window, { BundleTab, OrderTab, CatalogTab, CalendarTab, CompetitorTab, IndustryTab, SoubaTab });
