# -*- coding: utf-8 -*-
"""index.html の APP_VER と、読み込むJSの ?v= を必ず同じにする。
   デプロイのたびに実行する。手で書かないので、印がずれない。"""
import io, re, sys
p = "index.html"; s = io.open(p, encoding="utf-8").read()
ver = sys.argv[1] if len(sys.argv) > 1 else None
if ver:
    s = re.sub(r'window\.APP_VER = "[^"]*"', 'window.APP_VER = "%s"' % ver, s, count=1)
else:
    ver = re.search(r'window\.APP_VER = "([^"]*)"', s).group(1)
s, n = re.subn(r'(<script src="js/[0-9a-z.\-]+\.js\?v=)[^"]*(")', r'\g<1>%s\g<2>' % ver, s)
io.open(p, "w", encoding="utf-8").write(s)
print("APP_VER =", ver, "／ 刻んだタグ", n, "本")
if n != 1: sys.exit("★ 起動用のタグは1本のはず（まとめたもの）: %d" % n)
