# -*- coding: utf-8 -*-
"""配る前にこれ1つを実行する。 python3 release.py [新しい版]
   ① 起動用のJSを1本にまとめる ② index.html に版を刻む
   分けてやると片方を忘れるので、まとめてある。"""
import io, json, re, subprocess, sys
for cmd in (["python3","bundle.py"], ["python3","stamp.py"] + sys.argv[1:]):
    r = subprocess.run(cmd)
    if r.returncode != 0: sys.exit(r.returncode)

# 版だけを書いた小さなファイル。端末はこれを毎回見て、古ければ開き直す。
ver = re.search(r'window\.APP_VER = "([^"]*)"', io.open("index.html", encoding="utf-8").read()).group(1)
io.open("version.json", "w", encoding="utf-8").write(json.dumps({"v": ver}) + "\n")
print("version.json =", ver)
