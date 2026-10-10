/* Nexus共有 — 01-config （自動分割・window共有） */
var { useState, useEffect, useCallback, useRef } = React;
window.__appRan = 1;   // 本体のファイルが動き始めた印（起動が止まったとき、どこまで来たかを見るため）




const STORES = ["北部店","木次店","大田店","斐川店","医大通り店","平田店","バイヤー"];

// ═══════════ TAB_REGISTRY：☰メニューの全タブ定義（追加はここ1箇所） ═══════════
// section は将来のメニュー見出し用（Phase 4）。現時点では並び順のみ使用。
const TAB_REGISTRY = [
  { key:"search",     icon:"🔍", label:"検索",               section:"毎日つかう" },
  { key:"bundle",     icon:"📅", label:"企画カレンダー",     section:"毎日つかう" },
  { key:"tool",       icon:"✏️", label:"作成",               section:"毎日つかう", hideInMenu:true },   // カタログの中に移した
  { key:"request",    icon:"📮", label:"お問い合わせ",       section:"毎日つかう" },
  { key:"order",      icon:"🔒", label:"店舗支援",           section:"毎日つかう" },
  { key:"lab",        icon:"🧪", label:"試作システム",       section:"ツール" },
  { key:"barcode",    icon:"🏷", label:"バーコード",         section:"ツール" },
  { key:"catalog",    icon:"📖", label:"カタログ",           section:"ツール" },
  { key:"gne",        icon:"🅖", label:"入力支援",           section:"ツール" },
  { key:"trend",      icon:"📈", label:"トレンド",           section:"ツール", hideInMenu:true },   // カタログの中に移した
  { key:"archive",    icon:"🗄", label:"アーカイブ",         section:"管理" },
  { key:"guide",      icon:"📘", label:"手引き",             section:"管理" },
  { key:"admin",      icon:"🔒", label:"管理画面",           section:"管理" },
];
const CATEGORIES = ["鮮魚","刺身・寿司","惣菜","塩干","その他"];

// ═══════════ 部門（鮮魚 / 青果）═══════════
// 部門ごとに変わるのは「言葉」と「色」だけ。仕組みは共通のまま。
const DEPT_VEG_NAMES = ["ダイコン","ニンジン","タマネギ","ジャガイモ","サツマイモ","サトイモ","ナガイモ","ゴボウ","レンコン","カブ","ハクサイ","キャベツ","レタス","サニーレタス","ホウレンソウ","コマツナ","シュンギク","ミズナ","チンゲンサイ","ニラ","ネギ","ワケギ","ミツバ","セロリ","アスパラガス","ブロッコリー","カリフラワー","キュウリ","ナス","トマト","ミニトマト","ピーマン","パプリカ","シシトウ","ズッキーニ","カボチャ","ゴーヤ","オクラ","トウモロコシ","エダマメ","サヤインゲン","サヤエンドウ","スナップエンドウ","ソラマメ","モヤシ","カイワレ","ニンニク","ショウガ","ミョウガ","シソ","パセリ","バジル","セリ","フキ","ウド","タケノコ","ワラビ","ゼンマイ","タラノメ","ナノハナ","シイタケ","シメジ","エノキ","マイタケ","エリンギ","ナメコ","マッシュルーム","キクラゲ","マツタケ","ヒラタケ","リンゴ","フジ","ミカン","デコポン","イヨカン","ハッサク","ネーブル","グレープフルーツ","レモン","ユズ","カボス","スダチ","イチゴ","ブドウ","シャインマスカット","ピオーネ","デラウェア","ナシ","ニホンナシ","ラフランス","モモ","スモモ","サクランボ","カキ","イチジク","クリ","ウメ","ビワ","キウイ","メロン","スイカ","バナナ","パイナップル","マンゴー","アボカド","ブルーベリー","ラズベリー","プルーン","ザクロ","ポンカン"];
const DEPTS = {
  fish: {
    key: "fish", label: "鮮魚", 短い: "魚",
    categories: ["鮮魚","刺身・寿司","惣菜","塩干","その他"],
    genres: ["丸魚","切身","切身提案","生食・海藻・貝","惣菜","寿司・刺身","行事","塩干","均一","説明・比較","案内・注意","業務用","素材・テンプレ","その他"],
    ものの呼び名: "魚",
  },
  produce: {
    key: "produce", label: "青果", 短い: "菜",
    categories: ["野菜","果物","カット・サラダ","漬物・惣菜","その他"],
    genres: ["葉物","根菜","果菜","きのこ","果物","カット","地物","行事","均一","その他"],
    ものの呼び名: "品目",
  },
};
// いま開いている部門。端末が覚える（売場のiPadは一度選べばそのまま）
function deptKey() {
  try { const d = localStorage.getItem("dept"); return DEPTS[d] ? d : "fish"; } catch (e) { return "fish"; }
}
// 次の部門（今ひとつしかないので、押すたびに入れ替わる）
function deptNext() {
  const ks = Object.keys(DEPTS); const i = ks.indexOf(deptKey());
  return ks[(i + 1) % ks.length];
}
function deptConf() { return DEPTS[deptKey()] || DEPTS.fish; }
// 部門を変える。色も言葉も全部変わるので、読み込み直すのが一番確実で安全
function setDeptKey(k) {
  if (!DEPTS[k] || k === deptKey()) return;
  try { localStorage.setItem("dept", k); } catch (e) {}
  // 住所の合言葉を落としてから読み込み直す（残っていると元の部門に引き戻される）
  try { location.replace(location.pathname); } catch (e) { location.reload(); }
}
function deptCategories() { return deptConf().categories; }
function deptGenres() { return deptConf().genres; }

// 検索の縦タブ用ジャンル（管理画面で勝部だけが選別する）。色は売場でひと目で見分ける用。
const GENRES = ["丸魚","切身","切身提案","生食・海藻・貝","惣菜","寿司・刺身","行事","塩干","均一","説明・比較","案内・注意","業務用","素材・テンプレ","その他"];
const GENRE_COLORS = {
  "その他":      { solid:"#B08968", soft:"#F4EDE4", text:"#6E4F2F" },
  "塩干":        { solid:"#378ADD", soft:"#E6F1FB", text:"#0C447C" },
  "寿司・刺身":   { solid:"#D85A30", soft:"#FAECE7", text:"#993C1D" },
  "切身":        { solid:"#1D9E75", soft:"#E1F5EE", text:"#0F6E56" },
  "丸魚":        { solid:"#639922", soft:"#EAF3DE", text:"#3B6D11" },
  "均一":        { solid:"#D94C7A", soft:"#FCE9F0", text:"#96284F" },
  "生食・海藻・貝": { solid:"#2AA3A3", soft:"#E2F4F4", text:"#136868" },
  "惣菜":        { solid:"#E08A2B", soft:"#FBF0E0", text:"#96560F" },
  "行事":        { solid:"#6C5CC7", soft:"#EEEDFE", text:"#3C3489" },
  "切身提案":     { solid:"#C7892B", soft:"#F8EFDD", text:"#8A5A12" },
  // ポップの役割で分ける4つ（2026-10-06。「その他」に混ざっていたもの）
  "説明・比較":   { solid:"#5B6FD6", soft:"#ECEEFC", text:"#2E3A8C" },
  "案内・注意":   { solid:"#94730E", soft:"#FAF4DC", text:"#6E5A0F" },
  "業務用":      { solid:"#5F7A8A", soft:"#E9EFF2", text:"#34505E" },
  "素材・テンプレ": { solid:"#A0629B", soft:"#F5E9F4", text:"#6A3466" },
  "除外":        { solid:"#8A9099", soft:"#EEF0F2", text:"#565B61" },
};
// 青果のジャンル色。明暗の差は鮮魚と同じ組み方にしてある
const GENRE_COLORS_PRODUCE = {
  "葉物":   { solid:"#3E8E41", soft:"#E7F3E7", text:"#245C27" },
  "根菜":   { solid:"#B0703A", soft:"#F6EDE3", text:"#6E4218" },
  "果菜":   { solid:"#D2483F", soft:"#FAE9E7", text:"#8F2820" },
  "きのこ": { solid:"#8A6A4F", soft:"#F0EAE3", text:"#55402C" },
  "果物":   { solid:"#D94C7A", soft:"#FCE9F0", text:"#96284F" },
  "カット": { solid:"#2AA3A3", soft:"#E2F4F4", text:"#136868" },
  "地物":   { solid:"#639922", soft:"#EAF3DE", text:"#3B6D11" },
  "行事":   { solid:"#6C5CC7", soft:"#EEEDFE", text:"#3C3489" },
  "均一":   { solid:"#E08A2B", soft:"#FBF0E0", text:"#96560F" },
  "その他": { solid:"#B08968", soft:"#F4EDE4", text:"#6E4F2F" },
  "除外":   { solid:"#8A9099", soft:"#EEF0F2", text:"#565B61" },
};
function deptGenreColors() { return deptKey() === "produce" ? GENRE_COLORS_PRODUCE : GENRE_COLORS; }

function deptRainNames() { return deptKey() === "produce" ? DEPT_VEG_NAMES : null; }

const FLOOR_CATS = ["対面","丸魚","切身","刺身","寿司","塩干","その他"];
const FLOOR_STORES = ["北部店","木次店","大田店","斐川店","医大通り店","平田店","推奨モデル"];
// パスワードはSupabase側（verify_password関数）で照合。生の値はこのファイルに持たない。
// お知らせ・更新履歴は js/24-news.jsx に移した（開いたときだけ読む。起動を軽くするため・2026-10-10）
const ANN_TYPES = {
  "新機能":   { bg:"#eaf2fb", color:"#2f6fb0", border:"#c6dcf2" },
  "改善":     { bg:"#fff4e6", color:"#b86a00", border:"#ffe0b3" },
  "修正":     { bg:"#eef3f8", color:"var(--primary)", border:"#cfe0ef" },
  "お知らせ": { bg:"#f3f3f5", color:"#6b7280", border:"#e0e0e5" },
};
// 必要になったときだけ外部ライブラリを読み込む（初回ロードを軽くするため）
const XLSX_SRC = "https://cdnjs.cloudflare.com/ajax/libs/xlsx/0.18.5/xlsx.full.min.js";

// 日本語の表記揺れ吸収：全角半角・大小・カタカナ/ひらがなを統一して検索用の共通形にする
function normJa(s) {
  if (s == null) return "";
  return String(s)
    .normalize("NFKC")                                              // 全角→半角・互換文字を標準化
    .toLowerCase()
    .replace(/[\u30a1-\u30f6]/g, c => String.fromCharCode(c.charCodeAt(0) - 0x60)); // カタカナ→ひらがな
}
const JSBARCODE_SRC = "https://cdnjs.cloudflare.com/ajax/libs/jsbarcode/3.11.6/JsBarcode.all.min.js";
const JSZIP_SRC = "https://cdnjs.cloudflare.com/ajax/libs/jszip/3.10.1/jszip.min.js";
const TESSERACT_SRC = "https://cdnjs.cloudflare.com/ajax/libs/tesseract.js/5.1.1/tesseract.min.js";
const JSPDF_SRC = "https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js";
const PDFJS_SRC = "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js";
const PDFJS_WORKER = "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js";
const GNE_FONT_NAME = "Noto Sans JP";
// ★本番はフル版Blackのwoff2をSupabase Storageに置いてこのURLを差し替え（全漢字カバー＆環境差ゼロ）
const GNE_FONT_URL = "https://cdn.jsdelivr.net/fontsource/fonts/noto-sans-jp@latest/japanese-900-normal.woff2";
// GNEで選べるフォント（選択時に woff2 を遅延ロード）。本番は Supabase Storage に置いた woff2 URL に差し替え可。
const GNE_FONTS = [
  { id:"noto",   label:"ゴシック太",  family:"Noto Sans JP",    weight:"900", url:"https://cdn.jsdelivr.net/fontsource/fonts/noto-sans-jp@latest/japanese-900-normal.woff2" },
  { id:"dela",   label:"極太ポップ",  family:"Dela Gothic One", weight:"400", url:"https://cdn.jsdelivr.net/fontsource/fonts/dela-gothic-one@latest/japanese-400-normal.woff2" },
  { id:"mochiy", label:"丸ゴシック",  family:"Mochiy Pop One",  weight:"400", url:"https://cdn.jsdelivr.net/fontsource/fonts/mochiy-pop-one@latest/japanese-400-normal.woff2" },
  { id:"reggae", label:"レゲエ体",    family:"Reggae One",      weight:"400", url:"https://cdn.jsdelivr.net/fontsource/fonts/reggae-one@latest/japanese-400-normal.woff2" },
  { id:"yuji",   label:"筆文字",      family:"Yuji Syuku",      weight:"400", url:"https://cdn.jsdelivr.net/fontsource/fonts/yuji-syuku@latest/japanese-400-normal.woff2" },
  { id:"hachi",  label:"手書き丸",    family:"Hachi Maru Pop",  weight:"400", url:"https://cdn.jsdelivr.net/fontsource/fonts/hachi-maru-pop@latest/japanese-400-normal.woff2" },
];
function loadScriptOnce(src) {
  return new Promise((resolve, reject) => {
    if (document.querySelector(`script[src="${src}"]`)) return resolve();
    const s = document.createElement("script");
    s.src = src; s.async = true;
    s.onload = () => resolve();
    s.onerror = () => reject(new Error("load failed: " + src));
    document.head.appendChild(s);
  });
}



;Object.assign(window, { DEPTS, deptKey, deptNext, deptConf, setDeptKey, deptCategories, deptGenres, deptGenreColors, deptRainNames, GENRE_COLORS_PRODUCE, DEPT_VEG_NAMES, ANN_TYPES, CATEGORIES, FLOOR_CATS, FLOOR_STORES, GENRES, GENRE_COLORS, GNE_FONTS, GNE_FONT_NAME, GNE_FONT_URL, JSBARCODE_SRC, JSPDF_SRC, JSZIP_SRC, TESSERACT_SRC, PDFJS_SRC, PDFJS_WORKER, STORES, TAB_REGISTRY, XLSX_SRC, loadScriptOnce, normJa });
