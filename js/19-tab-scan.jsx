/* GoodDay 鮮魚共有 — 19-tab-scan （読み込みシステム：伝票PDF補正ツールの手順） */
var { useState } = React;

const SCAN_STEPS = [
  { t:"PDFを入れる", d:"コピー機でまとめてスキャンした伝票PDFを、ツールの「01_補正前」フォルダに入れます。何枚でも構いません。" },
  { t:"補正を実行.bat をダブルクリック", d:"黒い画面が出て、進み具合が日本語で表示されます。終わると「成功◯件／失敗◯件」と出ます。" },
  { t:"02_補正後 を確認", d:"補正済みのPDFが出ています。このフォルダを伝票入力アプリの読み取り先にしておけば、あとはいつもどおりです。" },
  { t:"元のPDFは消えていません", d:"「03_原本保管」の中に、日付のフォルダを作って移してあります。消したり上書きしたりは一切しません。" },
];

const SCAN_SETTINGS = [
  ["向きの自動判定", "入", "横向き・逆さまのページを正しい向きに回す"],
  ["傾き補正", "入", "斜めにスキャンされた紙を水平に戻す"],
  ["解像度をそろえる", "入", "300dpi相当にそろえる。小さい伝票は拡大する"],
  ["コントラスト強化", "入", "薄い複写伝票の印字を濃くする"],
  ["白黒化", "切", "2色にする。効くかどうか比べたい項目"],
  ["白紙ページの除去", "入", "裏面など、何も写っていないページを捨てる"],
];

const SCAN_TROUBLE = [
  ["黒い画面が一瞬で閉じる", "「環境チェック.bat」を実行してください。Pythonが入っていない可能性があります。"],
  ["日本語が読めていない", "Tesseractを入れるとき「Japanese」のチェックを入れ忘れています。入れ直せば直ります。"],
  ["ocrmypdf が失敗と出る", "Ghostscriptがありません。config.json の エンジン を tesseract に変えれば、無くても動きます。"],
  ["ページが減りすぎる", "白紙と間違えられています。「白紙と判断する黒画素の割合」を 0.002 に下げてください。"],
  ["文字がつぶれる", "「白黒化」を切にして、「コントラスト強化の強さ」を 1.5 に下げてください。"],
  ["処理が遅い", "「目標dpi」を 200 に、「向きの自動判定」を切にすると速くなります。"],
];

function ScanTab() {
  const [開いた, set開いた] = useState(null);
  const 箱 = { background:"var(--card, #fff)", border:"1px solid var(--line)", borderRadius:14,
               padding:14, marginBottom:12 };
  const 見出し = { fontSize:14.5, fontWeight:900, color:"var(--ink)", marginBottom:10 };

  return (
    <div style={{ maxWidth:720, margin:"0 auto", padding:"6px 16px 120px" }}>

      <div style={{ ...箱, background:"var(--soft)", border:"1px solid var(--line)" }}>
        <div style={{ fontSize:13.5, fontWeight:900, color:"var(--soft-text)", marginBottom:7 }}>
          伝票PDFの読み取り精度を上げる道具
        </div>
        <div style={{ fontSize:12.5, color:"var(--text)", lineHeight:1.9 }}>
          スキャンした伝票を、伝票入力アプリに渡す前に整えます。
          向きと傾きを直し、薄い印字を濃くしてから、文字データを埋め込みます。
          <b>パソコンの中だけで処理</b>するので、伝票の画像が外に出ることはありません。
        </div>
      </div>

      <div style={箱}>
        <div style={見出し}>使う手順</div>
        {SCAN_STEPS.map((s, i) => (
          <div key={i} style={{ display:"flex", gap:11, marginBottom: i === SCAN_STEPS.length-1 ? 0 : 13 }}>
            <span style={{ flex:"0 0 24px", height:24, borderRadius:"50%", background:"var(--primary-soft)",
              color:"#fff", fontSize:12.5, fontWeight:900, display:"flex", alignItems:"center",
              justifyContent:"center" }}>{i+1}</span>
            <div style={{ flex:1, minWidth:0 }}>
              <div style={{ fontSize:13.5, fontWeight:800, color:"var(--ink)", marginBottom:3 }}>{s.t}</div>
              <div style={{ fontSize:12.5, color:"var(--sub)", lineHeight:1.8 }}>{s.d}</div>
            </div>
          </div>
        ))}
      </div>

      <div style={箱}>
        <div style={見出し}>どれが効くか比べたいとき</div>
        <div style={{ fontSize:12.5, color:"var(--sub)", lineHeight:1.9 }}>
          <b style={{ color:"var(--ink)" }}>比較テストを実行.bat</b> をダブルクリックすると、
          同じPDFから3種類（補正なし／補正あり／補正あり＋白黒）を作ります。
          3つとも伝票入力アプリに読ませて、どれが一番正しく読めるか比べてください。
          このときは元のPDFは移動しないので、何度でも試せます。
        </div>
      </div>

      <div style={箱}>
        <div style={見出し}>設定（config.json）</div>
        <div style={{ fontSize:12, color:"var(--sub)", lineHeight:1.8, marginBottom:11 }}>
          メモ帳で開いて書き換えられます。入＝true、切＝false です。
        </div>
        {SCAN_SETTINGS.map(([名, 既定, 説明], i) => (
          <div key={i} style={{ display:"flex", alignItems:"flex-start", gap:9,
            padding:"8px 0", borderTop: i === 0 ? "none" : "1px solid var(--line)" }}>
            <span style={{ flex:"0 0 34px", textAlign:"center", fontSize:11, fontWeight:900,
              borderRadius:6, padding:"3px 0",
              background: 既定 === "入" ? "var(--soft)" : "var(--chip)",
              color: 既定 === "入" ? "var(--soft-text)" : "var(--sub)" }}>{既定}</span>
            <div style={{ flex:1, minWidth:0 }}>
              <div style={{ fontSize:13, fontWeight:800, color:"var(--ink)" }}>{名}</div>
              <div style={{ fontSize:12, color:"var(--sub)", lineHeight:1.7 }}>{説明}</div>
            </div>
          </div>
        ))}
      </div>

      <div style={箱}>
        <div style={見出し}>うまくいかないとき</div>
        {SCAN_TROUBLE.map(([症状, 対処], i) => (
          <div key={i} style={{ borderTop: i === 0 ? "none" : "1px solid var(--line)" }}>
            <button onClick={() => set開いた(開いた === i ? null : i)}
              style={{ width:"100%", border:"none", background:"transparent", cursor:"pointer",
                padding:"11px 0", display:"flex", alignItems:"center", gap:8, textAlign:"left" }}>
              <span style={{ flex:1, fontSize:13, fontWeight:800, color:"var(--ink)" }}>{症状}</span>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--faint)"
                strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round"
                style={{ flexShrink:0, transform: 開いた === i ? "rotate(90deg)" : "none", transition:"transform .15s" }}>
                <path d="M9 6l6 6-6 6"/>
              </svg>
            </button>
            {開いた === i && (
              <div style={{ fontSize:12.5, color:"var(--sub)", lineHeight:1.9, padding:"0 0 12px" }}>{対処}</div>
            )}
          </div>
        ))}
      </div>

      <div style={{ ...箱, marginBottom:0 }}>
        <div style={見出し}>守られていること</div>
        <div style={{ fontSize:12.5, color:"var(--sub)", lineHeight:1.95 }}>
          ・既存の伝票入力アプリのファイルには一切触れません<br />
          ・元のPDFは消しません。原本保管へ移すだけです<br />
          ・同じ名前があっても上書きしません<br />
          ・補正に失敗したときは、元のPDFをそのまま出力先へコピーします（業務を止めません）<br />
          ・通信は一切しません。インターネットに繋がっていなくても動きます
        </div>
      </div>
    </div>
  );
}

;Object.assign(window, { ScanTab });
