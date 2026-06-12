// index.html（人が編集する読みやすい版）を読み込み、JSXを事前にコンパイルして
// dist/index.html（Babel不要の高速版）を書き出す。GitHub Actions から実行される。
const fs = require("fs");
const path = require("path");
const babel = require("@babel/standalone");

const SRC = "index.html";
const OUT_DIR = "dist";

const html = fs.readFileSync(SRC, "utf8");

// <script type="text/babel"> ... </script> を取り出す
const re = /<script type="text\/babel">([\s\S]*?)<\/script>/;
const m = html.match(re);
if (!m) {
  console.error('ERROR: <script type="text/babel"> が見つかりません');
  process.exit(1);
}

// JSX を素の JS に変換（React.createElement 形式）
let compiled;
try {
  compiled = babel.transform(m[1], { presets: ["react"] }).code;
} catch (e) {
  console.error("Babel compile failed:", e.message);
  process.exit(1);
}

// babel-standalone の読み込みを削除し、text/babel を素の <script> に差し替える
const out = html
  .replace(/[ \t]*<script src="[^"]*babel-standalone[^"]*"><\/script>\n?/, "")
  .replace(re, "<script>\n" + compiled + "\n</script>");

fs.mkdirSync(OUT_DIR, { recursive: true });
fs.writeFileSync(path.join(OUT_DIR, "index.html"), out);
console.log(
  "Built " + OUT_DIR + "/index.html : " +
  html.length + " bytes (src) -> " + out.length + " bytes (built)"
);
