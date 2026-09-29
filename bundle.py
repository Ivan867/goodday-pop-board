# -*- coding: utf-8 -*-
"""起動時に必ず要るJSを1本にまとめる。
   電波が弱いときに「11本のうち1本だけ届かなくて壊れる」を無くすため。
   ファイルの分割（01〜21）はそのまま。まとめるのは配る直前だけ。"""
import io, json, os, subprocess, sys

ORDER = json.load(io.open("eager-order.json", encoding="utf-8"))
OUT = "js/app.js"

parts = []
for name in ORDER:
    p = "js/%s.js" % name
    if not os.path.exists(p):
        sys.exit("★ ありません: " + p)
    parts.append("/* ───────── %s ───────── */\n%s\n" % (name, io.open(p, encoding="utf-8").read()))
code = "/* このファイルは bundle.py が自動で作ります。直接さわらないでください。 */\n" + "".join(parts)
io.open(OUT, "w", encoding="utf-8").write(code)

# まとめたものが壊れていないか、その場で構文を見る
r = subprocess.run(["node", "--check", OUT], capture_output=True, text=True)
if r.returncode != 0:
    sys.exit("★ まとめた結果が壊れています:\n" + r.stderr[:2000])

print("まとめました %s : %d本 → %d KB" % (OUT, len(ORDER), len(code.encode()) // 1024))
