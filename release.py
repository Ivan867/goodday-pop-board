# -*- coding: utf-8 -*-
"""配る前にこれ1つを実行する。 python3 release.py [新しい版]
   ① 起動用のJSを1本にまとめる ② index.html に版を刻む
   分けてやると片方を忘れるので、まとめてある。"""
import subprocess, sys
for cmd in (["python3","bundle.py"], ["python3","stamp.py"] + sys.argv[1:]):
    r = subprocess.run(cmd)
    if r.returncode != 0: sys.exit(r.returncode)
