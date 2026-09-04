/* GoodDay 鮮魚共有 — 10-tab-gne （自動分割・window共有） */
var {
  useState,
  useEffect,
  useCallback,
  useRef
} = React;
const GNE_LAYOUT = {
  origin: {
    x: 44,
    y: 1118,
    size: 84,
    fill: "#ffffff",
    stroke: "#141414",
    sw: 9,
    align: "left",
    maxW: 1130
  },
  name: {
    x: 600,
    y: 1296,
    size: 210,
    fill: "#ffffff",
    stroke: "#141414",
    sw: 15,
    align: "center",
    maxW: 1130
  },
  count: {
    x: 46,
    y: 1588,
    size: 140,
    fill: "#ffffff",
    stroke: "#141414",
    sw: 12,
    align: "left",
    maxW: 235
  },
  price: {
    x: 548,
    y: 1545,
    size: 255,
    fill: "#e31414",
    stroke: "#ffffff",
    sw: 12,
    align: "center",
    maxW: 560
  },
  plus: {
    x: 872,
    y: 1548,
    size: 54,
    fill: "#e31414",
    stroke: "#ffffff",
    sw: 4,
    align: "center"
  },
  yen: {
    x: 868,
    y: 1628,
    size: 58,
    fill: "#141414",
    stroke: "#ffffff",
    sw: 3,
    align: "center"
  },
  taxLabel: {
    x: 1050,
    y: 1552,
    size: 62,
    fill: "#141414",
    stroke: "#ffffff",
    sw: 3,
    align: "center"
  },
  taxPrice: {
    x: 1048,
    y: 1632,
    size: 74,
    fill: "#e31414",
    stroke: "#ffffff",
    sw: 5,
    align: "center"
  }
};
// A4よこ用の配置（1697 x 1200）
const GNE_LAYOUT_LAND = {
  origin: {
    x: 70,
    y: 445,
    size: 86,
    fill: "#ffffff",
    stroke: "#141414",
    sw: 9,
    align: "left",
    maxW: 1560
  },
  name: {
    x: 848,
    y: 600,
    size: 190,
    fill: "#ffffff",
    stroke: "#141414",
    sw: 15,
    align: "center",
    maxW: 1560
  },
  count: {
    x: 660,
    y: 735,
    size: 96,
    fill: "#141414",
    stroke: "#ffffff",
    sw: 5,
    align: "left",
    maxW: 420
  },
  price: {
    x: 980,
    y: 940,
    size: 300,
    fill: "#e31414",
    stroke: "#ffffff",
    sw: 14,
    align: "center",
    maxW: 700
  },
  plus: {
    x: 1560,
    y: 900,
    size: 56,
    fill: "#e31414",
    stroke: "#ffffff",
    sw: 4,
    align: "center"
  },
  yen: {
    x: 1420,
    y: 1000,
    size: 110,
    fill: "#141414",
    stroke: "#ffffff",
    sw: 6,
    align: "center"
  },
  taxLabel: {
    x: 1300,
    y: 1120,
    size: 56,
    fill: "#141414",
    stroke: "#ffffff",
    sw: 3,
    align: "center"
  },
  taxPrice: {
    x: 1530,
    y: 1125,
    size: 78,
    fill: "#e31414",
    stroke: "#ffffff",
    sw: 5,
    align: "center"
  }
};
const GNE_FIXED = {
  plus: "+税",
  yen: "円",
  taxLabel: "税込価格"
};
const GNE_W = 1200,
  GNE_H = 1697; // A4たて
const GNE_W_LAND = 1697,
  GNE_H_LAND = 1200; // A4よこ
const GNE_FONT_STACK = `"${GNE_FONT_NAME}", "Hiragino Sans", "Yu Gothic", sans-serif`;
function gneCalcTax(price, mode, rate) {
  const r = rate == null || isNaN(+rate) ? 8 : +rate;
  const raw = price * (1 + r / 100);
  if (mode === "ceil") return Math.ceil(raw);
  if (mode === "floor") return Math.floor(raw);
  return Math.round(raw);
}
function gneSanitize(s) {
  return String(s).replace(/[\\/:*?"<>|]/g, "_").trim();
}
function gneDrawField(ctx, text, cfg, font) {
  if (text == null || text === "") return;
  text = String(text);
  const fam = font ? `"${font.family}", "Hiragino Sans", sans-serif` : GNE_FONT_STACK;
  const wt = font ? font.weight : "900";
  let size = cfg.size;
  ctx.textAlign = cfg.align;
  ctx.textBaseline = "middle";
  ctx.font = `${wt} ${size}px ${fam}`;
  if (cfg.maxW) {
    while (ctx.measureText(text).width > cfg.maxW && size > 12) {
      size -= 4;
      ctx.font = `${wt} ${size}px ${fam}`;
    }
  }
  ctx.lineJoin = "round";
  ctx.miterLimit = 2;
  ctx.strokeStyle = cfg.stroke;
  ctx.lineWidth = cfg.sw * 2;
  ctx.strokeText(text, cfg.x, cfg.y);
  ctx.fillStyle = cfg.fill;
  ctx.fillText(text, cfg.x, cfg.y);
}
function gneRender(ctx, f, tpl, taxMode, font, taxRate, off, dim) {
  const CW = dim && dim.w || GNE_W,
    CH = dim && dim.h || GNE_H;
  const LAY = CW > CH ? GNE_LAYOUT_LAND : GNE_LAYOUT;
  const dx = off && off.x || 0,
    dy = off && off.y || 0;
  const sc = off && off.scale || 1;
  const fs = off && off.fieldScale || {};
  const fp = off && off.fieldPos || {};
  const GROUP = {
    origin: "origin",
    name: "name",
    count: "count",
    price: "price",
    plus: "price",
    yen: "price",
    taxLabel: "tax",
    taxPrice: "tax"
  };
  const L = {};
  for (const k in LAY) {
    const o = LAY[k];
    const g = GROUP[k];
    const fsc = (fs[g] || 100) / 100 * sc; // 全体倍率 × フィールド別倍率
    const fo = {
      x: fp[g + "_x"] || 0,
      y: fp[g + "_y"] || 0
    }; // フィールド別の位置ずらし
    L[k] = {
      ...o,
      x: o.x + dx + fo.x,
      y: o.y + dy + fo.y,
      size: Math.round(o.size * fsc),
      sw: Math.max(1, Math.round(o.sw * fsc))
    };
    if (o.maxW) L[k].maxW = o.maxW; // 折り返し幅は据え置き（はみ出し防止）
  }
  ctx.clearRect(0, 0, CW, CH);
  if (tpl) {
    ctx.drawImage(tpl, 0, 0, CW, CH);
  } else {
    const g = ctx.createLinearGradient(0, 0, 0, CH);
    g.addColorStop(0, "#cdddee");
    g.addColorStop(1, "#aac2dd");
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, CW, CH);
    ctx.fillStyle = "rgba(255,255,255,0.55)";
    ctx.fillRect(40, 40, CW - 80, CH * 0.55);
    ctx.fillStyle = "#5a708c";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.font = `900 46px ${GNE_FONT_STACK}`;
    ctx.fillText("テンプレ画像を選択してください", CW / 2, CH * 0.3);
  }
  // 産地と補足（養殖・解凍など）を1行に結合して描く
  const originLine = [f.origin, f.origin2 ? `（${String(f.origin2).replace(/^（|）$/g, "")}）` : ""].filter(Boolean).join("");
  if (originLine) gneDrawField(ctx, originLine, L.origin, font);
  if (f.name) gneDrawField(ctx, f.name, L.name, font);
  if (f.count) gneDrawField(ctx, f.count, L.count, font);
  if (f.price !== "" && f.price != null && !isNaN(+f.price)) {
    const p = parseInt(f.price, 10);
    gneDrawField(ctx, String(p), L.price, font);
    gneDrawField(ctx, `${gneCalcTax(p, taxMode, taxRate)}円`, L.taxPrice, font);
  }
  gneDrawField(ctx, GNE_FIXED.yen, L.yen, font);
  gneDrawField(ctx, GNE_FIXED.taxLabel, L.taxLabel, font);
}
function GeneratorTab({
  onCreatePop
}) {
  const [gTab, setGTab] = useState("gne"); // gne=POP画像 / souba=便利機能
  const [land, setLand] = useState(() => {
    try {
      return localStorage.getItem("gneLand") === "1";
    } catch (e) {
      return false;
    }
  });
  const setLandSave = v => {
    setLand(v);
    try {
      localStorage.setItem("gneLand", v ? "1" : "0");
    } catch (e) {}
  };
  const CW = land ? GNE_W_LAND : GNE_W,
    CH = land ? GNE_H_LAND : GNE_H;
  const previewRef = React.useRef(null);
  const tplInput = React.useRef(null);
  const xlsxInput = React.useRef(null);
  const [tpl, setTpl] = useState(null);
  const [fontId, setFontId] = useState(GNE_FONTS[0].id);
  const [loadedFonts, setLoadedFonts] = useState({});
  const font = GNE_FONTS.find(x => x.id === fontId) || GNE_FONTS[0];
  const [taxMode, setTaxMode] = useState("ceil");
  const [taxRate, setTaxRate] = useState(8);
  const [f, setF] = useState({
    origin: "鹿児島県産",
    origin2: "養殖・解凍",
    name: "うなぎかば焼き",
    count: "1尾",
    price: "2390"
  });
  const [rows, setRows] = useState([]);
  const [busy, setBusy] = useState(false);
  const [status, setStatus] = useState("");

  // 選択フォント(woff2)をFontFaceで遅延ロード（読み込み済みはスキップ）
  useEffect(() => {
    if (loadedFonts[font.family]) return;
    if (!(document.fonts && window.FontFace)) return;
    let cancelled = false;
    const face = new FontFace(font.family, `url(${font.url})`, {
      weight: font.weight
    });
    face.load().then(lf => {
      if (cancelled) return;
      document.fonts.add(lf);
      setLoadedFonts(s => ({
        ...s,
        [font.family]: true
      }));
    }).catch(() => {
      if (!cancelled) setLoadedFonts(s => ({
        ...s,
        [font.family]: "failed"
      }));
    });
    return () => {
      cancelled = true;
    };
  }, [fontId]);
  const [gx, setGx] = useState(0); // 文字位置オフセット（横：-120〜+120）
  const [gy, setGy] = useState(0); // 文字位置オフセット（縦：-320〜+40）
  const [gScale, setGScale] = useState(100); // 文字サイズ（%）：70〜130
  const [fScale, setFScale] = useState({
    origin: 100,
    name: 100,
    count: 100,
    price: 100,
    tax: 100
  }); // フィールド別（%）
  // フィールド別の位置ずらし（px）。平坦なキー（name_x など）で持つとReactが変化を確実に検知できる
  const ZERO_POS = {
    origin_x: 0,
    origin_y: 0,
    name_x: 0,
    name_y: 0,
    count_x: 0,
    count_y: 0,
    price_x: 0,
    price_y: 0,
    tax_x: 0,
    tax_y: 0
  };
  const [fPos, setFPos] = useState(ZERO_POS);
  const [posTarget, setPosTarget] = useState("name"); // いま位置を動かす対象

  // ── プリセット：文字の位置・サイズ・税設定をまとめて保存／呼び出し ──
  const LS_KEY = "gnePresets";
  const [presets, setPresets] = useState([]); // 端末に保存した分
  const [shared, setShared] = useState([]); // みんなと共有した分
  const [pName, setPName] = useState("");
  const [pMsg, setPMsg] = useState("");
  const [pBusy, setPBusy] = useState(false);
  const currentSettings = () => ({
    gx,
    gy,
    gScale,
    fScale,
    fPos,
    taxMode,
    taxRate,
    fontId
  });
  const applySettings = v => {
    if (!v) return;
    if (typeof v.gx === "number") setGx(v.gx);
    if (typeof v.gy === "number") setGy(v.gy);
    if (typeof v.gScale === "number") setGScale(v.gScale);
    if (v.fScale) setFScale({
      origin: 100,
      name: 100,
      count: 100,
      price: 100,
      tax: 100,
      ...v.fScale
    });
    if (v.fPos) setFPos({
      ...ZERO_POS,
      ...v.fPos
    });
    if (v.taxMode) setTaxMode(v.taxMode);
    if (typeof v.taxRate === "number") setTaxRate(v.taxRate);
    if (v.fontId) setFontId(v.fontId);
    setPMsg("設定を読み込みました");
    setTimeout(() => setPMsg(""), 1800);
  };
  useEffect(() => {
    try {
      setPresets(JSON.parse(localStorage.getItem(LS_KEY) || "[]"));
    } catch (e) {}
    (async () => {
      try {
        const d = await api.listPresets();
        setShared(d || []);
      } catch (e) {}
    })();
  }, []);
  const saveLocal = () => {
    const nm = pName.trim() || `設定 ${presets.length + 1}`;
    const next = [{
      id: "L" + Date.now(),
      name: nm,
      settings: currentSettings()
    }, ...presets].slice(0, 20);
    setPresets(next);
    try {
      localStorage.setItem(LS_KEY, JSON.stringify(next));
    } catch (e) {}
    setPName("");
    setPMsg("この端末に保存しました");
    setTimeout(() => setPMsg(""), 1800);
  };
  const saveShared = async () => {
    const nm = pName.trim();
    if (!nm) {
      setPMsg("名前を入れてください");
      return;
    }
    setPBusy(true);
    setPMsg("");
    try {
      await api.addPreset({
        name: nm,
        settings: currentSettings()
      });
      const d = await api.listPresets();
      setShared(d || []);
      setPName("");
      setPMsg("みんなと共有しました");
    } catch (e) {
      setPMsg("共有に失敗しました");
    } finally {
      setPBusy(false);
      setTimeout(() => setPMsg(""), 2200);
    }
  };
  const delLocal = id => {
    const next = presets.filter(x => x.id !== id);
    setPresets(next);
    try {
      localStorage.setItem(LS_KEY, JSON.stringify(next));
    } catch (e) {}
  };
  const delShared = async id => {
    if (!window.confirm("この共有プリセットを削除しますか？")) return;
    try {
      await api.deletePreset(id);
      const d = await api.listPresets();
      setShared(d || []);
    } catch (e) {
      setPMsg("削除に失敗しました");
    }
  };
  const nudge = (k, ax, d) => setFPos(v => ({
    ...v,
    [k + "_" + ax]: (v[k + "_" + ax] || 0) + d
  }));
  const resetOne = k => setFPos(v => ({
    ...v,
    [k + "_x"]: 0,
    [k + "_y"]: 0
  }));
  const posOf = k => ({
    x: fPos[k + "_x"] || 0,
    y: fPos[k + "_y"] || 0
  });
  useEffect(() => {
    const cv = previewRef.current;
    if (!cv) return;
    gneRender(cv.getContext("2d"), f, tpl, taxMode, font, taxRate, {
      x: gx,
      y: gy,
      scale: gScale / 100,
      fieldScale: fScale,
      fieldPos: fPos
    }, {
      w: CW,
      h: CH
    });
  }, [f, tpl, taxMode, fontId, loadedFonts, taxRate, gx, gy, gScale, fScale, fPos]);
  const onTpl = file => {
    if (!file) return;
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      setTpl(img);
      URL.revokeObjectURL(url);
    };
    img.src = url;
  };
  const downloadOne = () => {
    const cv = previewRef.current;
    cv.toBlob(b => {
      const a = document.createElement("a");
      a.href = URL.createObjectURL(b);
      a.download = (gneSanitize(f.name) || "pop") + ".png";
      a.click();
      URL.revokeObjectURL(a.href);
    }, "image/png");
  };
  const onExcel = async file => {
    if (!file) return;
    setStatus("読み込み中…");
    try {
      await loadScriptOnce(XLSX_SRC);
      const buf = await file.arrayBuffer();
      const wb = XLSX.read(new Uint8Array(buf), {
        type: "array"
      });
      const ws = wb.Sheets[wb.SheetNames[0]];
      const json = XLSX.utils.sheet_to_json(ws, {
        defval: ""
      });
      const rs = json.map(r => ({
        origin: r["産地"] ?? "",
        origin2: r["補足"] ?? "",
        name: r["商品名"] ?? "",
        count: r["個数"] ?? "",
        price: r["本体価格"] ?? ""
      })).filter(r => r.name);
      setRows(rs);
      setStatus(`${rs.length} 件を読み込みました`);
    } catch (e) {
      setStatus("Excel読み込みに失敗しました");
    }
  };

  // 見本の Excel をその場で作ってダウンロード（列名を間違えないように）
  const downloadTemplate = async () => {
    setStatus("見本を作成中…");
    try {
      await loadScriptOnce(XLSX_SRC);
      const data = [{
        "産地": "山陰沖",
        "補足": "天然",
        "商品名": "天然ぶり刺身",
        "個数": "5切",
        "本体価格": 498
      }, {
        "産地": "北海道",
        "補足": "解凍",
        "商品名": "秋鮭切身",
        "個数": "2切",
        "本体価格": 380
      }, {
        "産地": "島根県産",
        "補足": "",
        "商品名": "宍道湖しじみ",
        "個数": "200g",
        "本体価格": 298
      }];
      const ws = XLSX.utils.json_to_sheet(data, {
        header: ["産地", "補足", "商品名", "個数", "本体価格"]
      });
      ws["!cols"] = [{
        wch: 14
      }, {
        wch: 14
      }, {
        wch: 22
      }, {
        wch: 10
      }, {
        wch: 12
      }];
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, "商品リスト");
      XLSX.writeFile(wb, "products_見本.xlsx");
      setStatus("見本をダウンロードしました。中身を書き換えて読み込んでください");
    } catch (e) {
      setStatus("見本の作成に失敗しました");
    }
  };
  const dzTpl = useDropZone(f => onTpl(f), "image");
  const dzXlsx = useDropZone(f => onExcel(f), "excel");
  const renderBlob = row => new Promise(res => {
    const c = document.createElement("canvas");
    c.width = CW;
    c.height = CH;
    gneRender(c.getContext("2d"), row, tpl, taxMode, font, taxRate, {
      x: gx,
      y: gy,
      scale: gScale / 100,
      fieldScale: fScale,
      fieldPos: fPos
    }, {
      w: CW,
      h: CH
    });
    c.toBlob(b => res(b), "image/png");
  });
  const generateZip = useCallback(async () => {
    if (!rows.length) return;
    setBusy(true);
    setStatus("生成中…");
    try {
      await loadScriptOnce(JSZIP_SRC);
      const zip = new JSZip();
      const used = {};
      for (let i = 0; i < rows.length; i++) {
        const blob = await renderBlob(rows[i]);
        let base = gneSanitize(rows[i].name) || `pop_${i + 1}`;
        if (used[base]) {
          used[base]++;
          base = `${base}_${used[base]}`;
        } else {
          used[base] = 1;
        }
        zip.file(`${base}.png`, blob);
        setStatus(`生成中… ${i + 1}/${rows.length}`);
      }
      const out = await zip.generateAsync({
        type: "blob"
      });
      const a = document.createElement("a");
      a.href = URL.createObjectURL(out);
      a.download = "pop_output.zip";
      a.click();
      URL.revokeObjectURL(a.href);
      setStatus(`完了：${rows.length} 件を ZIP 出力しました`);
    } catch (e) {
      setStatus("ZIP生成に失敗しました（通信制限の可能性）");
    } finally {
      setBusy(false);
    }
  }, [rows, tpl, taxMode, fontId, taxRate, gx, gy, gScale, fScale]);
  const set = k => e => setF(p => ({
    ...p,
    [k]: e.target.value
  }));
  const taxPreview = f.price && !isNaN(+f.price) ? `${gneCalcTax(parseInt(f.price, 10), taxMode, taxRate)}円` : "—";
  const fontSt = loadedFonts[font.family];
  const fontNote = fontSt === true ? "" : fontSt === "failed" ? "（このフォントは取得失敗・代替表示中）" : "（フォント読込中…）";
  const card = {
    background: "#fff",
    borderRadius: 14,
    boxShadow: "0 2px 12px rgba(0,0,0,0.06)",
    padding: 16
  };
  const ACC = "#7c3aed";
  return /*#__PURE__*/React.createElement("div", {
    style: {
      maxWidth: 1600,
      margin: "0 auto",
      padding: 16,
      animation: "fadeUp .3s ease"
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 22,
      fontWeight: 900,
      color: "var(--ink)",
      marginBottom: 12
    }
  }, "入力支援"), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      gap: 7,
      marginBottom: 16
    }
  }, [["gne", "POP画像をつくる"], ["souba", "便利機能"]].map(([k, l]) => /*#__PURE__*/React.createElement("button", {
    key: k,
    onClick: () => setGTab(k),
    style: {
      flex: 1,
      border: "1px solid var(--line)",
      borderRadius: 10,
      padding: "10px 6px",
      fontSize: 13,
      fontWeight: 800,
      cursor: "pointer",
      background: gTab === k ? "var(--primary)" : "#fff",
      color: gTab === k ? "#fff" : "var(--text)"
    }
  }, l))), gTab === "souba" ? window.SoubaTab ? React.createElement(window.SoubaTab, {
    onCreatePop
  }) : /*#__PURE__*/React.createElement("div", {
    style: {
      textAlign: "center",
      color: "var(--faint)",
      padding: "40px 0",
      fontSize: 13
    }
  }, "読み込み中…") : /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 13,
      color: "var(--sub)",
      marginBottom: 16
    }
  }, "柄テンプレに文字を焼いて PNG 出力。単品ライブ編集と Excel 一括（ZIP）に対応。"), /*#__PURE__*/React.createElement("div", {
    className: "gne-grid",
    style: {
      display: "grid",
      gridTemplateColumns: "minmax(0, 1fr)",
      gap: 14
    }
  }, /*#__PURE__*/React.createElement("div", {
    className: "gne-preview"
  }, /*#__PURE__*/React.createElement("div", {
    style: card
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      alignItems: "center",
      gap: 8,
      marginBottom: 8
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 12,
      color: "var(--sub)"
    }
  }, "プレビュー ", fontNote), /*#__PURE__*/React.createElement("div", {
    style: {
      marginLeft: "auto",
      display: "flex",
      gap: 2,
      background: "rgba(120,120,128,0.12)",
      borderRadius: 8,
      padding: 2
    }
  }, [[false, "たて"], [true, "よこ"]].map(([v, l]) => /*#__PURE__*/React.createElement("button", {
    key: l,
    onClick: () => setLandSave(v),
    "aria-pressed": land === v,
    style: {
      border: "none",
      background: land === v ? "#fff" : "transparent",
      color: land === v ? "var(--ink)" : "var(--sub)",
      borderRadius: 6,
      padding: "4px 12px",
      fontSize: 11.5,
      fontWeight: 800,
      cursor: "pointer",
      boxShadow: land === v ? "0 1px 2px rgba(0,0,0,0.1)" : "none"
    }
  }, l)))), /*#__PURE__*/React.createElement("canvas", {
    ref: previewRef,
    width: CW,
    height: CH,
    style: {
      width: "100%",
      maxWidth: "100%",
      height: "auto",
      borderRadius: 10,
      border: "1px solid var(--line)",
      display: "block"
    }
  }))), /*#__PURE__*/React.createElement("div", {
    className: "gne-settings",
    style: {
      display: "grid",
      gap: 14,
      minWidth: 0
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: card
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 14,
      fontWeight: 800,
      color: "var(--ink)",
      marginBottom: 8
    }
  }, "テンプレ画像（文字なし・1200×1697推奨）"), /*#__PURE__*/React.createElement("button", {
    ...dzTpl.props,
    onClick: () => tplInput.current && tplInput.current.click(),
    style: {
      border: "1px dashed #ccc",
      background: "var(--bg)",
      borderRadius: 10,
      padding: "10px 14px",
      fontSize: 14,
      fontWeight: 700,
      color: "var(--text)",
      cursor: "pointer",
      ...dzTpl.style
    }
  }, dzTpl.over ? "ここに離す" : "画像を選択（ドラッグでもOK）"), tpl && /*#__PURE__*/React.createElement("span", {
    style: {
      marginLeft: 10,
      fontSize: 12,
      color: "#2f6fb0",
      fontWeight: 700
    }
  }, "読込済み"), /*#__PURE__*/React.createElement("input", {
    ref: tplInput,
    type: "file",
    accept: "image/*",
    onChange: e => onTpl(e.target.files[0]),
    style: {
      display: "none"
    }
  })), /*#__PURE__*/React.createElement("div", {
    style: card
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 14,
      fontWeight: 800,
      color: "var(--ink)",
      marginBottom: 4
    }
  }, "文字の位置・サイズ"), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 11.5,
      color: "var(--sub)",
      marginBottom: 12
    }
  }, "文字ブロック全体の位置と大きさを変えられます。ボタンでざっくり→スライダーで微調整"), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      gap: 14,
      alignItems: "flex-start"
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: "grid",
      gridTemplateColumns: "repeat(3, 44px)",
      gap: 5,
      flexShrink: 0
    }
  }, [[-90, -300, "↖"], [0, -300, "↑"], [90, -300, "↗"], [-90, -150, "←"], [0, -150, "・"], [90, -150, "→"], [-90, 0, "↙"], [0, 0, "↓"], [90, 0, "↘"]].map(([px, py, lbl], i) => {
    const on = gx === px && gy === py;
    return /*#__PURE__*/React.createElement("button", {
      key: i,
      onClick: () => {
        setGx(px);
        setGy(py);
      },
      style: {
        width: 44,
        height: 44,
        border: on ? "2px solid var(--primary)" : "1px solid var(--line)",
        background: on ? "var(--soft)" : "#fff",
        color: on ? "var(--primary)" : "var(--text)",
        borderRadius: 10,
        fontSize: 16,
        fontWeight: 900,
        cursor: "pointer"
      }
    }, lbl);
  })), /*#__PURE__*/React.createElement("div", {
    style: {
      flex: 1,
      minWidth: 0
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 11.5,
      fontWeight: 800,
      color: "var(--text)",
      marginBottom: 2
    }
  }, "横（左 ⇄ 右）：", gx > 0 ? `+${gx}` : gx), /*#__PURE__*/React.createElement("input", {
    type: "range",
    min: -120,
    max: 120,
    step: 5,
    value: gx,
    onChange: e => setGx(+e.target.value),
    style: {
      width: "100%"
    }
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 11.5,
      fontWeight: 800,
      color: "var(--text)",
      margin: "10px 0 2px"
    }
  }, "縦（上 ⇄ 下）：", gy > 0 ? `+${gy}` : gy), /*#__PURE__*/React.createElement("input", {
    type: "range",
    min: -320,
    max: 40,
    step: 5,
    value: gy,
    onChange: e => setGy(+e.target.value),
    style: {
      width: "100%"
    }
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 11.5,
      fontWeight: 800,
      color: "var(--text)",
      margin: "10px 0 2px"
    }
  }, "文字サイズ（全体）：", gScale, "%"), /*#__PURE__*/React.createElement("input", {
    type: "range",
    min: 70,
    max: 130,
    step: 5,
    value: gScale,
    onChange: e => setGScale(+e.target.value),
    style: {
      width: "100%"
    }
  }))), /*#__PURE__*/React.createElement("div", {
    style: {
      height: 1,
      background: "var(--line)",
      margin: "14px 0 12px"
    }
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 12.5,
      fontWeight: 900,
      color: "var(--ink)",
      marginBottom: 8
    }
  }, "フィールド別サイズ"), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "grid",
      gridTemplateColumns: "1fr 1fr",
      gap: "8px 14px"
    }
  }, [["origin", "産地"], ["name", "商品名"], ["count", "個数"], ["price", "価格"], ["tax", "税込表示"]].map(([k, lbl]) => /*#__PURE__*/React.createElement("div", {
    key: k,
    style: {
      display: "flex",
      alignItems: "center",
      gap: 6
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 12,
      fontWeight: 800,
      color: "var(--text)",
      width: 56,
      flexShrink: 0
    }
  }, lbl), /*#__PURE__*/React.createElement("button", {
    onClick: () => setFScale(v => ({
      ...v,
      [k]: Math.max(60, v[k] - 10)
    })),
    style: {
      width: 30,
      height: 30,
      border: "1px solid var(--line)",
      background: "#fff",
      borderRadius: 8,
      fontSize: 15,
      fontWeight: 900,
      color: "var(--text)",
      cursor: "pointer",
      lineHeight: 1
    }
  }, "−"), /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 12,
      fontWeight: 900,
      color: fScale[k] !== 100 ? "var(--primary)" : "var(--sub)",
      width: 40,
      textAlign: "center"
    }
  }, fScale[k], "%"), /*#__PURE__*/React.createElement("button", {
    onClick: () => setFScale(v => ({
      ...v,
      [k]: Math.min(160, v[k] + 10)
    })),
    style: {
      width: 30,
      height: 30,
      border: "1px solid var(--line)",
      background: "#fff",
      borderRadius: 8,
      fontSize: 15,
      fontWeight: 900,
      color: "var(--text)",
      cursor: "pointer",
      lineHeight: 1
    }
  }, "＋")))), /*#__PURE__*/React.createElement("div", {
    style: {
      height: 1,
      background: "var(--line)",
      margin: "14px 0 12px"
    }
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 12.5,
      fontWeight: 900,
      color: "var(--primary)",
      marginBottom: 3
    }
  }, "▼ 1つずつ動かす（選んだ項目だけ）"), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 11,
      color: "var(--sub)",
      marginBottom: 8,
      lineHeight: 1.5
    }
  }, "上の「位置」は全部まとめて動きます。ここは選んだ項目だけが動きます。"), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      gap: 5,
      flexWrap: "wrap",
      marginBottom: 10,
      padding: "9px",
      background: "var(--soft)",
      borderRadius: 10
    }
  }, [["origin", "産地"], ["name", "商品名"], ["count", "個数"], ["price", "価格"], ["tax", "税込表示"]].map(([k, lbl]) => {
    const moved = (fPos[k + "_x"] || 0) !== 0 || (fPos[k + "_y"] || 0) !== 0;
    return /*#__PURE__*/React.createElement("button", {
      key: k,
      onClick: () => setPosTarget(k),
      style: {
        border: posTarget === k ? "2px solid var(--primary-soft)" : "1px solid var(--line)",
        background: posTarget === k ? "var(--soft)" : "#fff",
        color: posTarget === k ? "var(--primary)" : "var(--sub)",
        borderRadius: 999,
        padding: "5px 12px",
        fontSize: 12,
        fontWeight: 800,
        cursor: "pointer"
      }
    }, lbl, moved ? " ●" : "");
  })), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      gap: 6,
      marginBottom: 8
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: "grid",
      gridTemplateColumns: "repeat(3, 40px)",
      gridTemplateRows: "repeat(3, 36px)",
      gap: 4,
      alignItems: "center",
      justifyItems: "center"
    }
  }, /*#__PURE__*/React.createElement("span", null), /*#__PURE__*/React.createElement("button", {
    onClick: () => nudge(posTarget, "y", -10),
    style: {
      width: 40,
      height: 36,
      border: "none",
      background: "var(--primary-soft)",
      color: "#fff",
      borderRadius: 8,
      fontSize: 15,
      fontWeight: 900,
      cursor: "pointer"
    }
  }, "↑"), /*#__PURE__*/React.createElement("span", null), /*#__PURE__*/React.createElement("button", {
    onClick: () => nudge(posTarget, "x", -10),
    style: {
      width: 40,
      height: 36,
      border: "none",
      background: "var(--primary-soft)",
      color: "#fff",
      borderRadius: 8,
      fontSize: 15,
      fontWeight: 900,
      cursor: "pointer"
    }
  }, "←"), /*#__PURE__*/React.createElement("button", {
    onClick: () => resetOne(posTarget),
    style: {
      width: 40,
      height: 36,
      border: "1px solid var(--line)",
      background: "var(--bg)",
      borderRadius: 8,
      fontSize: 10,
      fontWeight: 800,
      color: "var(--sub)",
      cursor: "pointer"
    }
  }, "戻す"), /*#__PURE__*/React.createElement("button", {
    onClick: () => nudge(posTarget, "x", 10),
    style: {
      width: 40,
      height: 36,
      border: "none",
      background: "var(--primary-soft)",
      color: "#fff",
      borderRadius: 8,
      fontSize: 15,
      fontWeight: 900,
      cursor: "pointer"
    }
  }, "→"), /*#__PURE__*/React.createElement("span", null), /*#__PURE__*/React.createElement("button", {
    onClick: () => nudge(posTarget, "y", 10),
    style: {
      width: 40,
      height: 36,
      border: "none",
      background: "var(--primary-soft)",
      color: "#fff",
      borderRadius: 8,
      fontSize: 15,
      fontWeight: 900,
      cursor: "pointer"
    }
  }, "↓"), /*#__PURE__*/React.createElement("span", null)), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 11.5,
      color: "var(--sub)",
      fontWeight: 800,
      lineHeight: 1.7,
      minWidth: 96
    }
  }, "選択中：", /*#__PURE__*/React.createElement("span", {
    style: {
      color: "var(--primary)"
    }
  }, {
    origin: "産地",
    name: "商品名",
    count: "個数",
    price: "価格",
    tax: "税込表示"
  }[posTarget]), /*#__PURE__*/React.createElement("br", null), "よこ ", posOf(posTarget).x > 0 ? "+" : "", posOf(posTarget).x, /*#__PURE__*/React.createElement("br", null), "たて ", posOf(posTarget).y > 0 ? "+" : "", posOf(posTarget).y)), /*#__PURE__*/React.createElement("div", {
    style: {
      height: 1,
      background: "var(--line)",
      margin: "14px 0 12px"
    }
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 12.5,
      fontWeight: 900,
      color: "var(--ink)",
      marginBottom: 3
    }
  }, "💾 設定を保存する"), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 11,
      color: "var(--sub)",
      marginBottom: 8,
      lineHeight: 1.5
    }
  }, "いまの文字の位置・サイズ・税の設定をまとめて保存します。次回そのまま呼び出せます。"), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      gap: 6,
      marginBottom: 8,
      flexWrap: "wrap"
    }
  }, /*#__PURE__*/React.createElement("input", {
    value: pName,
    onChange: e => setPName(e.target.value),
    placeholder: "名前（例：うなぎ用）",
    style: {
      flex: "1 1 140px",
      minWidth: 0,
      border: "1px solid var(--line)",
      borderRadius: 9,
      padding: "8px 10px",
      fontSize: 12.5,
      outline: "none"
    }
  }), /*#__PURE__*/React.createElement("button", {
    onClick: saveLocal,
    style: {
      border: "1px solid var(--line)",
      background: "#fff",
      color: "var(--primary)",
      borderRadius: 9,
      padding: "8px 13px",
      fontSize: 12,
      fontWeight: 800,
      cursor: "pointer",
      whiteSpace: "nowrap"
    }
  }, "この端末に保存"), /*#__PURE__*/React.createElement("button", {
    onClick: saveShared,
    disabled: pBusy,
    style: {
      border: "none",
      background: "var(--primary-soft)",
      color: "#fff",
      borderRadius: 9,
      padding: "8px 13px",
      fontSize: 12,
      fontWeight: 800,
      cursor: "pointer",
      whiteSpace: "nowrap"
    }
  }, "みんなと共有")), pMsg && /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 11.5,
      color: "var(--primary)",
      fontWeight: 800,
      marginBottom: 8
    }
  }, pMsg), presets.length > 0 && /*#__PURE__*/React.createElement("div", {
    style: {
      marginBottom: 8
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 11,
      fontWeight: 800,
      color: "var(--sub)",
      marginBottom: 5
    }
  }, "この端末の保存"), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      gap: 5,
      flexWrap: "wrap"
    }
  }, presets.map(x => /*#__PURE__*/React.createElement("span", {
    key: x.id,
    style: {
      display: "flex",
      alignItems: "center",
      gap: 4,
      border: "1px solid var(--line)",
      borderRadius: 999,
      padding: "3px 4px 3px 11px",
      background: "#fff"
    }
  }, /*#__PURE__*/React.createElement("button", {
    onClick: () => applySettings(x.settings),
    style: {
      border: "none",
      background: "transparent",
      color: "var(--ink)",
      fontSize: 11.5,
      fontWeight: 800,
      cursor: "pointer",
      padding: 0
    }
  }, x.name), /*#__PURE__*/React.createElement("button", {
    onClick: () => delLocal(x.id),
    title: "削除",
    style: {
      border: "none",
      background: "transparent",
      color: "var(--faint)",
      fontSize: 13,
      fontWeight: 900,
      cursor: "pointer",
      padding: "0 4px",
      lineHeight: 1
    }
  }, "×"))))), shared.length > 0 && /*#__PURE__*/React.createElement("div", {
    style: {
      marginBottom: 10
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 11,
      fontWeight: 800,
      color: "var(--sub)",
      marginBottom: 5
    }
  }, "みんなの共有"), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      gap: 5,
      flexWrap: "wrap"
    }
  }, shared.map(x => /*#__PURE__*/React.createElement("span", {
    key: x.id,
    style: {
      display: "flex",
      alignItems: "center",
      gap: 4,
      border: "1px solid #cfe2f3",
      borderRadius: 999,
      padding: "3px 4px 3px 11px",
      background: "var(--soft)"
    }
  }, /*#__PURE__*/React.createElement("button", {
    onClick: () => applySettings(x.settings),
    style: {
      border: "none",
      background: "transparent",
      color: "var(--primary)",
      fontSize: 11.5,
      fontWeight: 800,
      cursor: "pointer",
      padding: 0
    }
  }, x.name), /*#__PURE__*/React.createElement("button", {
    onClick: () => delShared(x.id),
    title: "削除",
    style: {
      border: "none",
      background: "transparent",
      color: "var(--faint)",
      fontSize: 13,
      fontWeight: 900,
      cursor: "pointer",
      padding: "0 4px",
      lineHeight: 1
    }
  }, "×"))))), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex"
    }
  }, (gx !== 0 || gy !== 0 || gScale !== 100 || Object.values(fScale).some(v => v !== 100) || Object.values(fPos).some(v => v !== 0)) && /*#__PURE__*/React.createElement("button", {
    onClick: () => {
      setGx(0);
      setGy(0);
      setGScale(100);
      setFScale({
        origin: 100,
        name: 100,
        count: 100,
        price: 100,
        tax: 100
      });
      setFPos(ZERO_POS);
    },
    style: {
      marginTop: 12,
      border: "1px solid var(--line)",
      background: "#fff",
      color: "var(--text)",
      borderRadius: 9,
      padding: "7px 14px",
      fontSize: 12,
      fontWeight: 800,
      cursor: "pointer"
    }
  }, "標準に戻す")), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 11,
      color: "var(--faint)",
      marginTop: 10
    }
  }, "※ Excelからの一括生成にも同じ位置・サイズが適用されます")), /*#__PURE__*/React.createElement("div", {
    style: card
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 14,
      fontWeight: 800,
      color: "var(--ink)",
      marginBottom: 10
    }
  }, "フォント"), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      gap: 8,
      overflowX: "auto",
      paddingBottom: 4
    }
  }, GNE_FONTS.map(o => {
    const on = o.id === fontId;
    return /*#__PURE__*/React.createElement("button", {
      key: o.id,
      onClick: () => setFontId(o.id),
      style: {
        flexShrink: 0,
        border: `2px solid ${on ? ACC : "#e6e0f5"}`,
        background: on ? ACC : "#faf8ff",
        color: on ? "#fff" : "#6b4bb0",
        borderRadius: 12,
        padding: "9px 14px",
        fontSize: 14,
        fontWeight: 800,
        cursor: "pointer",
        whiteSpace: "nowrap"
      }
    }, o.label);
  }))), /*#__PURE__*/React.createElement("div", {
    style: {
      ...card,
      display: "flex",
      flexDirection: "column",
      gap: 10
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 14,
      fontWeight: 800,
      color: "var(--ink)"
    }
  }, "単品入力（ライブプレビュー）"), [["産地", "origin"], ["補足（養殖・解凍 など）", "origin2"], ["商品名", "name"], ["個数", "count"], ["本体価格", "price"]].map(([label, key]) => /*#__PURE__*/React.createElement("div", {
    key: key
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 12,
      color: "var(--sub)",
      marginBottom: 4
    }
  }, label), /*#__PURE__*/React.createElement("input", {
    value: f[key] || "",
    onChange: set(key),
    inputMode: key === "price" ? "numeric" : "text",
    style: {
      width: "100%",
      border: "1px solid var(--line)",
      borderRadius: 10,
      padding: "10px 12px",
      fontSize: 15
    }
  }))), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      flexDirection: "column",
      gap: 10
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      alignItems: "center",
      gap: 10,
      flexWrap: "wrap"
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 12,
      color: "var(--sub)"
    }
  }, "税込丸め"), /*#__PURE__*/React.createElement("select", {
    value: taxMode,
    onChange: e => setTaxMode(e.target.value),
    style: {
      border: "1px solid var(--line)",
      borderRadius: 8,
      padding: "6px 8px",
      fontSize: 14
    }
  }, /*#__PURE__*/React.createElement("option", {
    value: "ceil"
  }, "切り上げ"), /*#__PURE__*/React.createElement("option", {
    value: "round"
  }, "四捨五入"), /*#__PURE__*/React.createElement("option", {
    value: "floor"
  }, "切り捨て")), /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 12,
      color: "var(--sub)"
    }
  }, "税込（", taxRate, "%）：", /*#__PURE__*/React.createElement("b", {
    style: {
      color: "var(--ink)"
    }
  }, taxPreview))), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      alignItems: "center",
      gap: 6,
      flexWrap: "wrap"
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 12,
      color: "var(--sub)",
      marginRight: 2
    }
  }, "税率"), [1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(r => /*#__PURE__*/React.createElement("button", {
    key: r,
    onClick: () => setTaxRate(r),
    style: {
      minWidth: 36,
      padding: "6px 0",
      borderRadius: 8,
      fontSize: 13,
      fontWeight: 800,
      cursor: "pointer",
      border: taxRate === r ? `2px solid ${ACC}` : "1px solid var(--line)",
      background: taxRate === r ? ACC : "#fff",
      color: taxRate === r ? "#fff" : "#555"
    }
  }, r, "%")))), /*#__PURE__*/React.createElement("button", {
    onClick: downloadOne,
    style: {
      width: "100%",
      border: "none",
      background: ACC,
      color: "#fff",
      borderRadius: 10,
      padding: "12px",
      fontSize: 15,
      fontWeight: 800,
      cursor: "pointer"
    }
  }, "この1枚を PNG ダウンロード")), /*#__PURE__*/React.createElement("div", {
    style: {
      ...card,
      display: "flex",
      flexDirection: "column",
      gap: 10
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 14,
      fontWeight: 800,
      color: "var(--ink)"
    }
  }, "Excel 一括（products.xlsx）"), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 12,
      color: "var(--sub)",
      lineHeight: 1.6
    }
  }, "1行目に見出し、2行目から商品を書きます。列名は「", /*#__PURE__*/React.createElement("b", null, "産地／補足／商品名／個数／本体価格"), "」のとおりに（順番は自由・補足は空でもOK）。商品名が空の行は飛ばされます。"), /*#__PURE__*/React.createElement("button", {
    onClick: downloadTemplate,
    style: {
      display: "flex",
      alignItems: "center",
      gap: 7,
      border: "none",
      background: "var(--soft)",
      color: "var(--primary)",
      borderRadius: 10,
      padding: "10px 15px",
      fontSize: 13.5,
      fontWeight: 800,
      cursor: "pointer",
      width: "fit-content"
    }
  }, /*#__PURE__*/React.createElement("svg", {
    width: "16",
    height: "16",
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: "2.2",
    strokeLinecap: "round",
    strokeLinejoin: "round"
  }, /*#__PURE__*/React.createElement("path", {
    d: "M12 3.5v11m0 0l-4-4m4 4l4-4"
  }), /*#__PURE__*/React.createElement("path", {
    d: "M4 16.5v2a2 2 0 002 2h12a2 2 0 002-2v-2"
  })), "見本ファイルをダウンロード"), /*#__PURE__*/React.createElement("button", {
    ...dzXlsx.props,
    onClick: () => xlsxInput.current && xlsxInput.current.click(),
    style: {
      border: "1px dashed #ccc",
      background: "var(--bg)",
      borderRadius: 10,
      padding: "10px 14px",
      fontSize: 14,
      fontWeight: 700,
      color: "var(--text)",
      cursor: "pointer",
      width: "fit-content",
      ...dzXlsx.style
    }
  }, dzXlsx.over ? "ここに離す" : ".xlsx を選択（ドラッグでもOK）"), /*#__PURE__*/React.createElement("input", {
    ref: xlsxInput,
    type: "file",
    accept: ".xlsx,.xls",
    onChange: e => onExcel(e.target.files[0]),
    style: {
      display: "none"
    }
  }), /*#__PURE__*/React.createElement("button", {
    onClick: generateZip,
    disabled: !rows.length || busy,
    style: {
      width: "100%",
      border: "none",
      background: !rows.length || busy ? "#cbb8ef" : "#2f6fb0",
      color: "#fff",
      borderRadius: 10,
      padding: "12px",
      fontSize: 15,
      fontWeight: 800,
      cursor: !rows.length || busy ? "default" : "pointer"
    }
  }, busy ? "生成中…" : rows.length ? `${rows.length} 件を ZIP 出力` : "ファイル未読込"), status && /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 12,
      color: "var(--sub)"
    }
  }, status))))));
}

// ===== 相場タブ：先週比の「相場安」計算＋売価計算（プロトタイプ） =====

// ===== POP診断：画像をブラウザ内で解析（外部送信なし） =====

;
Object.assign(window, {
  GNE_FIXED,
  GNE_FONT_STACK,
  GNE_LAYOUT,
  GNE_W,
  GeneratorTab,
  gneCalcTax,
  gneDrawField,
  gneRender,
  gneSanitize
});