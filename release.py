# -*- coding: utf-8 -*-
"""配る前にこれ1つを実行する。 python3 release.py [新しい版]

まとめたJSを「版を名前に含めたファイル」として書き出す。
index.html と JS が別々に古くなって混ざる、という事故を構造的になくすため。
（同じ名前＋?v= だと、端末によっては中身が入れ替わって食い違う）
"""
import glob, io, json, os, re, subprocess, sys

ORDER = json.load(io.open("eager-order.json", encoding="utf-8"))
html = io.open("index.html", encoding="utf-8").read()
ver = sys.argv[1] if len(sys.argv) > 1 else re.search(r'window\.APP_VER = "([^"]*)"', html).group(1)

# ① まとめる
parts = ["/* このファイルは release.py が自動で作ります。直接さわらないでください。 */\n"]
for name in ORDER:
    p = "js/%s.js" % name
    if not os.path.exists(p): sys.exit("★ ありません: " + p)
    parts.append("/* ───────── %s ───────── */\n%s\n" % (name, io.open(p, encoding="utf-8").read()))
out = "js/app.%s.js" % ver
io.open(out, "w", encoding="utf-8").write("".join(parts))
r = subprocess.run(["node", "--check", out], capture_output=True, text=True)
if r.returncode != 0: sys.exit("★ まとめた結果が壊れています:\n" + r.stderr[:2000])

# ② index.html を書き換える
html = re.sub(r'window\.APP_VER = "[^"]*"', 'window.APP_VER = "%s"' % ver, html, count=1)
html, n = re.subn(r'<script src="js/app[^"]*\.js[^"]*"></script>',
                  '<script src="%s"></script>' % out, html)
if n != 1: sys.exit("★ 起動用のタグは1本のはず: %d" % n)
io.open("index.html", "w", encoding="utf-8").write(html)

# ③ 古いまとめファイルは、直近3つだけ残す
古い = sorted(glob.glob("js/app.*.js"), key=os.path.getmtime, reverse=True)[3:]
for f in 古い: os.remove(f)

print("まとめました %s : %d本 → %d KB ／ 古いもの %d 件を削除" %
      (out, len(ORDER), os.path.getsize(out)//1024, len(古い)))
