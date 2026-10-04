/* Nexus共有 — 23-kifuda （入力支援の中の「木札」：A4たてに4段の木札を作る） */
var {
  useState,
  useEffect,
  useCallback,
  useRef
} = React;

// ── 寸法（A4たて 1200×1697 を4段に切る。段のあいだは切りしろ） ──
const KF_W = 1200,
  KF_H = 1697,
  KF_ROWS = 4,
  KF_GAP = 10;
const KF_S = (KF_H - KF_GAP * (KF_ROWS - 1)) / KF_ROWS; // 1段の高さ ≒ 417

// 最初に開いたとき入っている例（いただいた木札そのまま）
const KF_SAMPLE = [{
  top: "山陰沖",
  origin: "多岐産",
  use: "刺身用",
  name: "真さば",
  unit: "1尾",
  price: "359"
}, {
  top: "山陰沖",
  origin: "大社港産",
  use: "焼物、刺身用",
  name: "いさき",
  unit: "1尾",
  price: "299"
}, {
  top: "山陰沖",
  origin: "大社港産",
  use: "焼物、煮付け、刺身用",
  name: "わかな",
  unit: "1尾",
  price: "799"
}, {
  top: "山陰沖",
  origin: "和江産",
  use: "焼物、刺身用",
  name: "真鯛",
  unit: "1尾",
  price: "459"
}];
const KF_EMPTY = {
  top: "",
  origin: "",
  use: "",
  name: "",
  unit: "",
  price: ""
};

// 押すだけで入る候補
const KF_TOPS = ["山陰沖", "島根県", "鳥取県", "隠岐"];
const KF_ORIGINS = ["大社港産", "多岐産", "和江産", "浜田港産", "境港産", "恵曇産"];
const KF_USES = ["刺身用", "焼物", "煮付け", "塩焼き", "唐揚げ", "フライ", "鍋物"];
const KF_UNITS = ["1尾", "1パック", "100g", "1切"];

// 選べる字（どれも魚へんの漢字・数字が入っていることを確認済み）。選んだときだけ読み込む
const KF_FONTS = [{
  id: "mochiy",
  label: "丸ポップ",
  family: "Mochiy Pop One",
  w: "400",
  pkg: "mochiy-pop-one"
}, {
  id: "potta",
  label: "筆ポップ",
  family: "Potta One",
  w: "400",
  pkg: "potta-one"
}, {
  id: "yusei",
  label: "マジック",
  family: "Yusei Magic",
  w: "400",
  pkg: "yusei-magic"
}, {
  id: "rock",
  label: "ロック",
  family: "RocknRoll One",
  w: "400",
  pkg: "rocknroll-one"
}, {
  id: "dela",
  label: "極太",
  family: "Dela Gothic One",
  w: "400",
  pkg: "dela-gothic-one"
}, {
  id: "mplus",
  label: "丸ゴシック",
  family: "M PLUS Rounded 1c",
  w: "900",
  pkg: "m-plus-rounded-1c"
}, {
  id: "zenmaru",
  label: "やわらか丸",
  family: "Zen Maru Gothic",
  w: "900",
  pkg: "zen-maru-gothic"
}, {
  id: "noto",
  label: "ゴシック",
  family: "Noto Sans JP",
  w: "900",
  pkg: "noto-sans-jp"
}, {
  id: "reggae",
  label: "レゲエ",
  family: "Reggae One",
  w: "400",
  pkg: "reggae-one"
}, {
  id: "yuji",
  label: "筆文字",
  family: "Yuji Syuku",
  w: "400",
  pkg: "yuji-syuku"
}, {
  id: "antique",
  label: "昔風",
  family: "Zen Antique Soft",
  w: "400",
  pkg: "zen-antique-soft"
}, {
  id: "kaisei",
  label: "明朝",
  family: "Kaisei Decol",
  w: "700",
  pkg: "kaisei-decol"
}, {
  id: "hachi",
  label: "手書き丸",
  family: "Hachi Maru Pop",
  w: "400",
  pkg: "hachi-maru-pop"
}];
const KF_PRICE_FONTS = ["dela", "rock", "mochiy", "potta", "mplus", "noto", "reggae"]; // 値段に向くもの
const kfFont = id => KF_FONTS.find(f => f.id === id) || KF_FONTS[0];
const kfFam = id => {
  const f = kfFont(id);
  return `${f.w} SIZEpx "${f.family}", "Hiragino Maru Gothic ProN", "Hiragino Sans", "Yu Gothic", sans-serif`;
};
const kfFontState = {}; // id → "ok" | "fail" | Promise
function kfLoadFont(id) {
  const f = kfFont(id);
  if (kfFontState[id] === "ok" || kfFontState[id] === "fail") return Promise.resolve(kfFontState[id]);
  if (kfFontState[id]) return kfFontState[id];
  if (!(document.fonts && window.FontFace)) return Promise.resolve("fail");
  const url = `https://cdn.jsdelivr.net/fontsource/fonts/${f.pkg}@latest/japanese-${f.w}-normal.woff2`;
  return kfFontState[id] = new FontFace(f.family, `url(${url})`, {
    weight: f.w
  }).load().then(lf => {
    document.fonts.add(lf);
    return kfFontState[id] = "ok";
  }).catch(() => kfFontState[id] = "fail");
}

// 背景の種類
const KF_BGS = [{
  id: "sugi",
  name: "木目",
  c: ["#f3d9a2", "#e8c483", "#dcb36c"],
  kind: "slat",
  line: "rgba(150,100,30,0.30)",
  hi: "rgba(255,248,225,0.45)",
  border: "#1b2a78"
}, {
  id: "shiraki",
  name: "白木",
  c: ["#fbf1dc", "#f4e3c0", "#ecd6aa"],
  kind: "grain",
  line: "rgba(170,120,60,0.22)",
  border: "#1b2a78"
}, {
  id: "koge",
  name: "焦げ茶",
  c: ["#8a5a32", "#6e4424", "#55331a"],
  kind: "slat",
  line: "rgba(30,15,5,0.40)",
  hi: "rgba(255,220,170,0.14)",
  border: "#e9c46a",
  dark: true
}, {
  id: "take",
  name: "すだれ",
  c: ["#d9e6a8", "#c3d68a", "#a9c06a"],
  kind: "bamboo",
  line: "rgba(60,90,20,0.35)",
  hi: "rgba(250,255,230,0.45)",
  border: "#2d5a1e"
}, {
  id: "washi",
  name: "和紙",
  c: ["#fbf8f0", "#f5efe2", "#ede4d0"],
  kind: "washi",
  border: "#b3261e"
}, {
  id: "ai",
  name: "藍染",
  c: ["#2c4a7c", "#1f3764", "#16284c"],
  kind: "slat",
  line: "rgba(0,0,20,0.30)",
  hi: "rgba(160,190,240,0.12)",
  border: "#e9c46a",
  dark: true
}, {
  id: "sumi",
  name: "墨",
  c: ["#3a3a3a", "#262626", "#151515"],
  kind: "plain",
  border: "#c9a24a",
  dark: true
}];
const kfBg = id => KF_BGS.find(b => b.id === id) || KF_BGS[0];
// いつも同じ模様になる乱数（再描画のたびに柄が変わらないように）
function kfRand(seed) {
  let x = seed >>> 0;
  return () => (x = x * 1664525 + 1013904223 >>> 0) / 4294967296;
}
const KF_LOOK0 = {
  bg: "sugi",
  fName: "mochiy",
  fPrice: "dela"
};
function kfTax(price, mode) {
  const raw = price * 1.08;
  if (mode === "floor") return Math.floor(raw);
  if (mode === "round") return Math.round(raw);
  return Math.ceil(raw);
}

/* 文字を1つ描く。はみ出すときは縮める。
   o: { x, y, size, maxW, align, font, fill, stroke, sw, glow, shadow, skew } */
function kfText(ctx, text, o) {
  if (text == null || String(text).trim() === "") return 0;
  text = String(text).trim();
  let size = o.size;
  const setF = () => {
    ctx.font = o.font.replace("SIZE", size);
  };
  setF();
  if (o.maxW) {
    while (ctx.measureText(text).width > o.maxW && size > 14) {
      size -= 3;
      setF();
    }
  }
  const w = ctx.measureText(text).width;
  ctx.save();
  ctx.translate(o.x, o.y);
  if (o.skew) ctx.transform(1, 0, o.skew, 1, 0, 0);
  ctx.textAlign = o.align || "left";
  ctx.textBaseline = "middle";
  ctx.lineJoin = "round";
  ctx.miterLimit = 2;
  const sw = Math.max(1, Math.round((o.sw || 0) * size));
  // ① 影（または光彩）
  if (o.shadow || o.glow) {
    ctx.save();
    if (o.glow) {
      ctx.shadowColor = o.glow;
      ctx.shadowBlur = size * 0.16;
      ctx.strokeStyle = o.glow;
    } else {
      ctx.shadowColor = o.shadow;
      ctx.shadowBlur = size * 0.06;
      ctx.shadowOffsetX = size * 0.04;
      ctx.shadowOffsetY = size * 0.05;
      ctx.strokeStyle = o.stroke || "#fff";
    }
    ctx.lineWidth = sw * 2;
    ctx.strokeText(text, 0, 0);
    ctx.restore();
  }
  // ② ふち
  if (o.stroke && sw) {
    ctx.strokeStyle = o.stroke;
    ctx.lineWidth = sw * 2;
    ctx.strokeText(text, 0, 0);
  }
  // ③ 中身
  ctx.fillStyle = o.fill;
  ctx.fillText(text, 0, 0);
  ctx.restore();
  return w;
}

// 背景（種類ごとに柄を変える）
function kfWood(ctx, y0, h, bg) {
  bg = bg || KF_BGS[0];
  const g = ctx.createLinearGradient(0, y0, 0, y0 + h);
  g.addColorStop(0, bg.c[0]);
  g.addColorStop(0.5, bg.c[1]);
  g.addColorStop(1, bg.c[2]);
  ctx.fillStyle = g;
  ctx.fillRect(0, y0, KF_W, h);
  ctx.save();
  ctx.beginPath();
  ctx.rect(0, y0, KF_W, h);
  ctx.clip();
  const rnd = kfRand(Math.round(y0) + 7);
  if (bg.kind === "slat" || bg.kind === "bamboo") {
    const step = bg.kind === "bamboo" ? 13 : 15;
    for (let y = y0 + 6; y < y0 + h; y += step) {
      ctx.fillStyle = bg.line;
      ctx.fillRect(0, y, KF_W, 2.2);
      ctx.fillStyle = bg.hi;
      ctx.fillRect(0, y + 2.2, KF_W, 1.4);
      if (bg.kind === "bamboo") {
        // 竹の節
        for (let k = 0; k < 2; k++) {
          ctx.fillStyle = bg.line;
          ctx.fillRect(rnd() * KF_W, y + 3, 5, step - 4);
        }
      }
    }
  } else if (bg.kind === "grain") {
    // ゆるい木目の線
    ctx.strokeStyle = bg.line;
    ctx.lineWidth = 1.6;
    for (let y = y0 - 20; y < y0 + h + 20; y += 11 + rnd() * 9) {
      const a = 3 + rnd() * 6,
        f = 0.004 + rnd() * 0.004,
        ph = rnd() * 6;
      ctx.beginPath();
      for (let x = 0; x <= KF_W; x += 20) {
        const yy = y + Math.sin(x * f + ph) * a;
        x ? ctx.lineTo(x, yy) : ctx.moveTo(x, yy);
      }
      ctx.stroke();
    }
  } else if (bg.kind === "washi") {
    // 和紙の繊維
    for (let k = 0; k < 520; k++) {
      const x = rnd() * KF_W,
        y = y0 + rnd() * h,
        l = 8 + rnd() * 26,
        t = rnd() * Math.PI;
      ctx.strokeStyle = rnd() < 0.5 ? "rgba(190,170,130,0.28)" : "rgba(255,255,255,0.7)";
      ctx.lineWidth = 0.8 + rnd();
      ctx.beginPath();
      ctx.moveTo(x, y);
      ctx.quadraticCurveTo(x + l * 0.5, y + (rnd() - 0.5) * 10, x + Math.cos(t) * l, y + Math.sin(t) * l);
      ctx.stroke();
    }
  }
  ctx.restore();
  // 左右の明るさむら
  const sh = ctx.createLinearGradient(0, 0, KF_W, 0);
  sh.addColorStop(0, "rgba(60,40,10,0.10)");
  sh.addColorStop(0.35, "rgba(255,255,255,0.06)");
  sh.addColorStop(0.7, "rgba(255,255,255,0)");
  sh.addColorStop(1, "rgba(60,40,10,0.12)");
  ctx.fillStyle = sh;
  ctx.fillRect(0, y0, KF_W, h);
}

// 青海波（価格の下に敷く波の柄）
function kfWave(ctx, x, y, w, h, base) {
  ctx.save();
  ctx.beginPath();
  ctx.rect(x, y, w, h);
  ctx.clip();
  const r = 24;
  const rings = ["#7fb4ad", "#f4ead2", "#7fb4ad", "#f4ead2"];
  for (let row = 0, yy = y + h + r; yy > y - r; row++, yy -= r / 2) {
    const off = row % 2 ? r : 0;
    for (let xx = x - r * 2 + off; xx < x + w + r * 2; xx += r * 2) {
      rings.forEach((c, i) => {
        ctx.beginPath();
        ctx.arc(xx, yy, r * (1 - i * 0.24), Math.PI, 0);
        ctx.closePath();
        ctx.fillStyle = c;
        ctx.globalAlpha = 0.55;
        ctx.fill();
      });
    }
  }
  ctx.globalAlpha = 1;
  // 左右をぼかして板になじませる
  const fade = ctx.createLinearGradient(x, 0, x + w, 0);
  const b = base || "#e8c483";
  fade.addColorStop(0, b);
  fade.addColorStop(0.12, b + "00");
  fade.addColorStop(0.88, b + "00");
  fade.addColorStop(1, b);
  ctx.fillStyle = fade;
  ctx.fillRect(x, y, w, h);
  ctx.restore();
}

// 1段ぶんを描く
function kfDrawRow(ctx, y0, r, taxMode, look) {
  look = look || KF_LOOK0;
  const bg = kfBg(look.bg);
  kfWood(ctx, y0, KF_S, bg);
  // 紺の枠
  ctx.strokeStyle = bg.border;
  ctx.lineWidth = 7;
  ctx.strokeRect(18, y0 + 16, KF_W - 36, KF_S - 32);
  const FN = kfFam(look.fName),
    FP = kfFam(look.fPrice);
  const 産地字 = bg.dark ? "#ffffff" : "#140a0e";
  const Y = v => y0 + v;

  // 左：産地と用途（少し傾ける）
  ctx.save();
  ctx.translate(215, Y(165));
  ctx.rotate(-0.2);
  kfText(ctx, r.top, {
    x: 0,
    y: -78,
    size: 96,
    maxW: 300,
    align: "center",
    font: FN,
    fill: 産地字,
    stroke: "#e8245f",
    sw: 0.045,
    glow: "rgba(255,30,100,0.55)"
  });
  kfText(ctx, r.origin, {
    x: 6,
    y: 2,
    size: 64,
    maxW: 330,
    align: "center",
    font: FN,
    fill: 産地字,
    stroke: "#e8245f",
    sw: 0.045,
    glow: "rgba(255,30,100,0.5)"
  });
  kfText(ctx, r.use, {
    x: -4,
    y: 86,
    size: 62,
    maxW: 380,
    align: "center",
    font: FN,
    fill: "#1565f0",
    stroke: "#ffffff",
    sw: 0.14,
    shadow: "rgba(0,0,0,0.25)"
  });
  ctx.restore();

  // 品名
  kfText(ctx, r.name, {
    x: 762,
    y: Y(146),
    size: 182,
    maxW: 620,
    align: "center",
    font: FN,
    fill: "#111",
    stroke: "#ffffff",
    sw: 0.11,
    shadow: "rgba(0,0,0,0.45)"
  });

  // 青い線
  ctx.strokeStyle = bg.dark ? bg.border : "#3f74c9";
  ctx.lineWidth = 2.5;
  ctx.beginPath();
  ctx.moveTo(440, Y(268));
  ctx.lineTo(1078, Y(268));
  ctx.stroke();
  const p = parseInt(String(r.price).replace(/[^\d]/g, ""), 10);
  const 価格あり = !isNaN(p);
  if (価格あり || r.unit) kfWave(ctx, 445, Y(318), 520, 84, bg.c[1]);
  kfText(ctx, "本体価格", {
    x: 470,
    y: Y(300),
    size: 40,
    align: "right",
    font: FP,
    fill: "#111",
    stroke: "#ffffff",
    sw: 0.08
  });
  kfText(ctx, r.unit, {
    x: 450,
    y: Y(366),
    size: 58,
    maxW: 250,
    align: "right",
    font: FP,
    fill: "#111",
    stroke: "#ffffff",
    sw: 0.08,
    shadow: "rgba(0,0,0,0.3)"
  });
  if (価格あり) {
    const w = kfText(ctx, String(p), {
      x: 486,
      y: Y(340),
      size: 150,
      maxW: 270,
      align: "left",
      font: FP,
      fill: "#f40a0a",
      stroke: "#ffffff",
      sw: 0.07,
      shadow: "rgba(0,0,0,0.75)",
      skew: -0.2
    });
    kfText(ctx, "円+税", {
      x: Math.max(752, 486 + w + 16),
      y: Y(382),
      size: 30,
      align: "left",
      font: FP,
      fill: "#f40a0a",
      stroke: "#ffffff",
      sw: 0.1
    });
    kfText(ctx, "税込価格", {
      x: 872,
      y: Y(300),
      size: 32,
      align: "left",
      font: FP,
      fill: "#111",
      stroke: "#ffffff",
      sw: 0.08
    });
    kfText(ctx, String(kfTax(p, taxMode)), {
      x: 1036,
      y: Y(362),
      size: 74,
      maxW: 170,
      align: "right",
      font: FP,
      fill: "#f40a0a",
      stroke: "#ffffff",
      sw: 0.08,
      shadow: "rgba(0,0,0,0.6)",
      skew: -0.2
    });
    kfText(ctx, "円", {
      x: 1052,
      y: Y(382),
      size: 30,
      align: "left",
      font: FP,
      fill: "#f40a0a",
      stroke: "#ffffff",
      sw: 0.1
    });
  }
}
function kfRender(ctx, rows, taxMode, look) {
  ctx.clearRect(0, 0, KF_W, KF_H);
  ctx.fillStyle = "#ffffff";
  ctx.fillRect(0, 0, KF_W, KF_H); // 段のあいだ＝切りしろ
  for (let i = 0; i < KF_ROWS; i++) kfDrawRow(ctx, i * (KF_S + KF_GAP), rows[i] || KF_EMPTY, taxMode, look);
}

// ── 保存（この端末だけ） ──
const KF_LS = "kifudaSheet",
  KF_LS_RECENT = "kifudaRecent";
// 呼び名を改めたもの（保存済みの内容も読み込み時に置きかえる）
const KF_RENAME = {
  "大社漁港産": "大社港産"
};
const kfRen = v => KF_RENAME[v] || v;
function kfLoad() {
  try {
    const v = JSON.parse(localStorage.getItem(KF_LS) || "null");
    if (v && Array.isArray(v.rows) && v.rows.length === KF_ROWS) {
      v.rows = v.rows.map(r => ({
        ...KF_EMPTY,
        ...r,
        origin: kfRen(r.origin || "")
      }));
      v.look = {
        ...KF_LOOK0,
        ...(v.look || {})
      };
      return v;
    }
  } catch (e) {}
  return {
    rows: KF_SAMPLE.map(r => ({
      ...r
    })),
    taxMode: "ceil",
    look: {
      ...KF_LOOK0
    }
  };
}
function kfRecent() {
  try {
    const v = JSON.parse(localStorage.getItem(KF_LS_RECENT) || "{}") || {};
    if (Array.isArray(v.origin)) v.origin = [...new Set(v.origin.map(kfRen))];
    return v;
  } catch (e) {
    return {};
  }
}
function KifudaTab() {
  const init = useRef(kfLoad()).current;
  const [rows, setRows] = useState(init.rows);
  const [taxMode, setTaxMode] = useState(init.taxMode || "ceil");
  const [look, setLook] = useState(init.look || KF_LOOK0);
  const setL = (k, v) => setLook(o => ({
    ...o,
    [k]: v
  }));
  const [字待ち, set字待ち] = useState(false);
  const [open, setOpen] = useState(0); // いま編集している段
  const [fontTick, setFontTick] = useState(0);
  const [msg, setMsg] = useState("");
  const [recent, setRecent] = useState(kfRecent);
  const cvRef = useRef(null);
  const stripRef = useRef(null);
  const cardRefs = useRef([]);

  // 字の形を読み込む：選んでいる2つだけ（読めたら描き直す。読めなくても端末の字で描ける）
  useEffect(() => {
    let alive = true;
    const ids = [...new Set([look.fName, look.fPrice])];
    if (ids.some(id => kfFontState[id] !== "ok" && kfFontState[id] !== "fail")) set字待ち(true);
    Promise.all(ids.map(kfLoadFont)).then(() => {
      if (alive) {
        set字待ち(false);
        setFontTick(t => t + 1);
      }
    });
    return () => {
      alive = false;
    };
  }, [look.fName, look.fPrice]);

  // 描く＋この端末に覚えておく
  useEffect(() => {
    const cv = cvRef.current;
    if (!cv) return;
    kfRender(cv.getContext("2d"), rows, taxMode, look);
    const s = stripRef.current;
    if (s) {
      const c = s.getContext("2d");
      c.clearRect(0, 0, s.width, s.height);
      c.drawImage(cv, 0, open * (KF_S + KF_GAP), KF_W, KF_S, 0, 0, s.width, s.height);
    }
    try {
      localStorage.setItem(KF_LS, JSON.stringify({
        rows,
        taxMode,
        look
      }));
    } catch (e) {}
  }, [rows, taxMode, look, fontTick, open]);
  const setRow = (i, k, v) => setRows(rs => rs.map((r, j) => j === i ? {
    ...r,
    [k]: v
  } : r));
  const toggleUse = (i, u) => setRows(rs => rs.map((r, j) => {
    if (j !== i) return r;
    const now = String(r.use || "").split(/[、,，\s]+/).filter(Boolean);
    const next = now.includes(u) ? now.filter(x => x !== u) : [...now, u];
    return {
      ...r,
      use: next.join("、")
    };
  }));
  const move = (i, d) => setRows(rs => {
    const j = i + d;
    if (j < 0 || j >= rs.length) return rs;
    const n = rs.slice();
    [n[i], n[j]] = [n[j], n[i]];
    setOpen(j);
    return n;
  });
  const clearRow = i => setRows(rs => rs.map((r, j) => j === i ? {
    ...KF_EMPTY
  } : r));
  const clearAll = () => {
    if (window.confirm("4段とも空にしますか？")) {
      setRows(Array.from({
        length: KF_ROWS
      }, () => ({
        ...KF_EMPTY
      })));
      setOpen(0);
    }
  };
  const sample = () => {
    setRows(KF_SAMPLE.map(r => ({
      ...r
    })));
    setOpen(0);
  };
  const pick = i => {
    setOpen(i);
    const el = cardRefs.current[i];
    if (el && window.innerWidth < 900) setTimeout(() => el.scrollIntoView({
      behavior: "smooth",
      block: "start"
    }), 30);
  };
  const onCanvasTap = e => {
    const r = e.currentTarget.getBoundingClientRect();
    const y = (e.clientY - r.top) / r.height * KF_H;
    pick(Math.min(KF_ROWS - 1, Math.max(0, Math.floor(y / (KF_S + KF_GAP)))));
  };

  // 出したときに使った値を候補として覚える
  const remember = () => {
    const add = (arr, vals) => [...new Set([...vals.filter(Boolean), ...(arr || [])])].slice(0, 8);
    const next = {
      top: add(recent.top, rows.map(r => r.top)),
      origin: add(recent.origin, rows.map(r => r.origin)),
      unit: add(recent.unit, rows.map(r => r.unit))
    };
    setRecent(next);
    try {
      localStorage.setItem(KF_LS_RECENT, JSON.stringify(next));
    } catch (e) {}
    try {
      api.logFeature && api.logFeature("木札");
    } catch (e) {}
  };
  const 名前 = () => "木札_" + (rows.map(r => r.name).filter(Boolean).join("・") || "空").replace(/[\\/:*?"<>|]/g, "_").slice(0, 40) + ".png";
  const blob = () => new Promise(res => cvRef.current.toBlob(res, "image/png"));
  const flash = t => {
    setMsg(t);
    setTimeout(() => setMsg(""), 2400);
  };
  const download = async () => {
    remember();
    const b = await blob();
    const a = document.createElement("a");
    a.href = URL.createObjectURL(b);
    a.download = 名前();
    document.body.appendChild(a);
    a.click();
    a.remove();
    setTimeout(() => URL.revokeObjectURL(a.href), 4000);
    flash("画像を保存しました");
  };
  const share = async () => {
    remember();
    try {
      const file = new File([await blob()], 名前(), {
        type: "image/png"
      });
      if (navigator.canShare && navigator.canShare({
        files: [file]
      })) {
        await navigator.share({
          files: [file],
          title: "木札"
        });
        return;
      }
    } catch (e) {
      if (e && e.name === "AbortError") return;
    }
    download();
  };
  const print = () => {
    remember();
    const url = cvRef.current.toDataURL("image/png");
    const w = window.open("", "_blank");
    if (!w) {
      flash("印刷の画面を開けませんでした（ポップアップを許可してください）");
      return;
    }
    w.document.write(`<!doctype html><meta charset="utf-8"><title>木札</title><style>@page{size:A4 portrait;margin:0}html,body{margin:0}img{width:210mm;height:297mm;display:block}</style><img src="${url}" onload="setTimeout(function(){print()},200)">`);
    w.document.close();
  };
  const card = {
    background: "var(--card)",
    borderRadius: 14,
    boxShadow: "var(--card-shadow)",
    padding: 14
  };
  const lab = {
    display: "block",
    fontSize: 12,
    fontWeight: 800,
    color: "var(--sub)",
    margin: "10px 0 4px"
  };
  const inp = {
    width: "100%",
    boxSizing: "border-box",
    border: "1px solid var(--line)",
    borderRadius: 10,
    padding: "10px 12px",
    fontSize: 16,
    background: "var(--bg)",
    color: "var(--text)"
  };
  const Chips = ({
    list,
    onPick,
    on
  }) => /*#__PURE__*/React.createElement("div", {
    className: "kf-chips"
  }, list.map(v => /*#__PURE__*/React.createElement("button", {
    key: v,
    type: "button",
    className: "kf-chip" + (on && on(v) ? " on" : ""),
    "aria-pressed": on ? !!on(v) : undefined,
    onClick: () => onPick(v)
  }, v)));
  const 候補 = (k, base) => [...new Set([...(recent[k] || []), ...base])].slice(0, 10);
  return /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 13,
      color: "var(--sub)",
      marginBottom: 12
    }
  }, "A4\u305F\u3066\u306B4\u6BB5\u306E\u6728\u672D\u3092\u4F5C\u308A\u307E\u3059\u3002\u4E0A\u306E\u672D\u3092\u62BC\u3059\u3068\u3001\u305D\u306E\u6BB5\u3092\u76F4\u305B\u307E\u3059\u3002\u5165\u308C\u305F\u5185\u5BB9\u306F\u3053\u306E\u7AEF\u672B\u306B\u6B8B\u308A\u307E\u3059\u3002"), /*#__PURE__*/React.createElement("div", {
    className: "kf-grid"
  }, /*#__PURE__*/React.createElement("div", {
    className: "kf-preview"
  }, /*#__PURE__*/React.createElement("div", {
    style: card
  }, /*#__PURE__*/React.createElement("canvas", {
    ref: cvRef,
    width: KF_W,
    height: KF_H,
    onClick: onCanvasTap,
    "aria-label": "\u6728\u672D\u306E\u3067\u304D\u3042\u304C\u308A\uFF08\u62BC\u3059\u3068\u305D\u306E\u6BB5\u3092\u76F4\u305B\u307E\u3059\uFF09",
    style: {
      width: "100%",
      height: "auto",
      display: "block",
      borderRadius: 8,
      border: "1px solid var(--line)",
      cursor: "pointer"
    }
  }), /*#__PURE__*/React.createElement("div", {
    className: "kf-out"
  }, /*#__PURE__*/React.createElement("button", {
    className: "kf-btn main",
    onClick: share
  }, "\u5199\u771F\u306B\u4FDD\u5B58\u30FB\u9001\u308B"), /*#__PURE__*/React.createElement("button", {
    className: "kf-btn",
    onClick: download
  }, "\u753B\u50CF\u3092\u4FDD\u5B58"), /*#__PURE__*/React.createElement("button", {
    className: "kf-btn",
    onClick: print
  }, "\u5370\u5237")), msg && /*#__PURE__*/React.createElement("div", {
    role: "status",
    style: {
      fontSize: 13,
      fontWeight: 800,
      color: "var(--primary)",
      marginTop: 8,
      textAlign: "center"
    }
  }, msg), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      gap: 8,
      alignItems: "center",
      flexWrap: "wrap",
      marginTop: 12,
      fontSize: 12.5,
      color: "var(--sub)"
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      fontWeight: 800
    }
  }, "\u7A0E\u8FBC\u306E\u7AEF\u6570"), [["ceil", "切り上げ"], ["round", "四捨五入"], ["floor", "切り捨て"]].map(([k, l]) => /*#__PURE__*/React.createElement("button", {
    key: k,
    type: "button",
    className: "kf-chip" + (taxMode === k ? " on" : ""),
    "aria-pressed": taxMode === k,
    onClick: () => setTaxMode(k)
  }, l)), /*#__PURE__*/React.createElement("span", {
    style: {
      marginLeft: "auto",
      display: "flex",
      gap: 6
    }
  }, /*#__PURE__*/React.createElement("button", {
    type: "button",
    className: "kf-link",
    onClick: sample
  }, "\u4F8B\u306B\u623B\u3059"), /*#__PURE__*/React.createElement("button", {
    type: "button",
    className: "kf-link",
    onClick: clearAll
  }, "\u5168\u90E8\u7A7A\u306B\u3059\u308B")))), /*#__PURE__*/React.createElement("div", {
    style: {
      ...card,
      marginTop: 12
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 14,
      fontWeight: 900,
      color: "var(--ink)"
    }
  }, "\u898B\u305F\u76EE ", 字待ち && /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 12,
      fontWeight: 700,
      color: "var(--sub)"
    }
  }, "\uFF08\u5B57\u3092\u8AAD\u307F\u8FBC\u307F\u4E2D\u2026\uFF09")), /*#__PURE__*/React.createElement("div", {
    style: lab
  }, "\u80CC\u666F"), /*#__PURE__*/React.createElement("div", {
    className: "kf-bgs"
  }, KF_BGS.map(b => /*#__PURE__*/React.createElement(KfBgThumb, {
    key: b.id,
    bg: b,
    on: look.bg === b.id,
    onPick: () => setL("bg", b.id)
  }))), /*#__PURE__*/React.createElement("div", {
    style: lab
  }, "\u54C1\u540D\u30FB\u7523\u5730\u306E\u5B57"), /*#__PURE__*/React.createElement("div", {
    className: "kf-chips"
  }, KF_FONTS.map(f => /*#__PURE__*/React.createElement("button", {
    key: f.id,
    type: "button",
    className: "kf-chip" + (look.fName === f.id ? " on" : ""),
    "aria-pressed": look.fName === f.id,
    onClick: () => setL("fName", f.id)
  }, f.label))), /*#__PURE__*/React.createElement("div", {
    style: lab
  }, "\u5024\u6BB5\u306E\u5B57"), /*#__PURE__*/React.createElement("div", {
    className: "kf-chips"
  }, KF_PRICE_FONTS.map(id => kfFont(id)).map(f => /*#__PURE__*/React.createElement("button", {
    key: f.id,
    type: "button",
    className: "kf-chip" + (look.fPrice === f.id ? " on" : ""),
    "aria-pressed": look.fPrice === f.id,
    onClick: () => setL("fPrice", f.id)
  }, f.label))), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      justifyContent: "flex-end",
      marginTop: 10
    }
  }, /*#__PURE__*/React.createElement("button", {
    type: "button",
    className: "kf-link",
    onClick: () => setLook({
      ...KF_LOOK0
    })
  }, "\u306F\u3058\u3081\u306E\u898B\u305F\u76EE\u306B\u623B\u3059")))), /*#__PURE__*/React.createElement("div", {
    className: "kf-edit"
  }, rows.map((r, i) => {
    const p = parseInt(String(r.price).replace(/[^\d]/g, ""), 10);
    const on = open === i;
    return /*#__PURE__*/React.createElement("div", {
      key: i,
      ref: el => cardRefs.current[i] = el,
      style: {
        ...card,
        marginBottom: 10,
        scrollMarginTop: 70,
        outline: on ? "2px solid var(--primary)" : "none"
      }
    }, /*#__PURE__*/React.createElement("button", {
      type: "button",
      className: "kf-head",
      onClick: () => setOpen(on ? -1 : i),
      "aria-expanded": on
    }, /*#__PURE__*/React.createElement("span", {
      className: "kf-no"
    }, i + 1, "\u6BB5\u76EE"), /*#__PURE__*/React.createElement("span", {
      className: "kf-sum"
    }, r.name || /*#__PURE__*/React.createElement("span", {
      style: {
        color: "var(--faint)"
      }
    }, "\uFF08\u7A7A\u304D\uFF09")), /*#__PURE__*/React.createElement("span", {
      className: "kf-sum-p"
    }, isNaN(p) ? "" : `${p}円（税込${kfTax(p, taxMode)}円）`), /*#__PURE__*/React.createElement("span", {
      "aria-hidden": "true",
      style: {
        color: "var(--sub)",
        fontSize: 16
      }
    }, on ? "▴" : "▾")), on && /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("canvas", {
      ref: stripRef,
      width: 600,
      height: Math.round(600 * KF_S / KF_W),
      className: "kf-strip",
      "aria-hidden": "true"
    }), /*#__PURE__*/React.createElement("label", {
      style: lab
    }, "\u54C1\u540D"), /*#__PURE__*/React.createElement("input", {
      style: {
        ...inp,
        fontSize: 20,
        fontWeight: 800
      },
      value: r.name,
      placeholder: "\u4F8B\uFF1A\u771F\u3055\u3070",
      onChange: e => setRow(i, "name", e.target.value)
    }), /*#__PURE__*/React.createElement("div", {
      className: "kf-two"
    }, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("label", {
      style: lab
    }, "\u672C\u4F53\u4FA1\u683C\uFF08\u5186\uFF09"), /*#__PURE__*/React.createElement("input", {
      style: {
        ...inp,
        fontSize: 20,
        fontWeight: 800
      },
      inputMode: "numeric",
      value: r.price,
      placeholder: "359",
      onChange: e => setRow(i, "price", e.target.value.replace(/[^\d]/g, ""))
    })), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("label", {
      style: lab
    }, "\u7A0E\u8FBC\uFF08\u81EA\u52D5\uFF09"), /*#__PURE__*/React.createElement("div", {
      style: {
        ...inp,
        fontSize: 20,
        fontWeight: 800,
        color: "var(--ink)",
        background: "transparent"
      }
    }, isNaN(p) ? "—" : kfTax(p, taxMode) + "円"))), /*#__PURE__*/React.createElement("label", {
      style: lab
    }, "\u5358\u4F4D"), /*#__PURE__*/React.createElement("input", {
      style: inp,
      value: r.unit,
      placeholder: "1\u5C3E",
      onChange: e => setRow(i, "unit", e.target.value)
    }), /*#__PURE__*/React.createElement(Chips, {
      list: 候補("unit", KF_UNITS),
      onPick: v => setRow(i, "unit", v),
      on: v => r.unit === v
    }), /*#__PURE__*/React.createElement("label", {
      style: lab
    }, "\u7523\u5730\uFF08\u4E0A\u306E\u5927\u304D\u3044\u5B57\uFF09"), /*#__PURE__*/React.createElement("input", {
      style: inp,
      value: r.top,
      placeholder: "\u5C71\u9670\u6C96",
      onChange: e => setRow(i, "top", e.target.value)
    }), /*#__PURE__*/React.createElement(Chips, {
      list: 候補("top", KF_TOPS),
      onPick: v => setRow(i, "top", v),
      on: v => r.top === v
    }), /*#__PURE__*/React.createElement("label", {
      style: lab
    }, "\u7523\u5730\uFF08\u4E0B\u306E\u5B57\uFF09"), /*#__PURE__*/React.createElement("input", {
      style: inp,
      value: r.origin,
      placeholder: "\u5927\u793E\u6E2F\u7523",
      onChange: e => setRow(i, "origin", e.target.value)
    }), /*#__PURE__*/React.createElement(Chips, {
      list: 候補("origin", KF_ORIGINS),
      onPick: v => setRow(i, "origin", v),
      on: v => r.origin === v
    }), /*#__PURE__*/React.createElement("label", {
      style: lab
    }, "\u304A\u3059\u3059\u3081\u306E\u98DF\u3079\u65B9\uFF08\u62BC\u3057\u305F\u9806\u306B\u4E26\u3073\u307E\u3059\uFF09"), /*#__PURE__*/React.createElement("input", {
      style: inp,
      value: r.use,
      placeholder: "\u713C\u7269\u3001\u523A\u8EAB\u7528",
      onChange: e => setRow(i, "use", e.target.value)
    }), /*#__PURE__*/React.createElement(Chips, {
      list: KF_USES,
      onPick: v => toggleUse(i, v),
      on: v => String(r.use).split(/[、,，\s]+/).includes(v)
    }), /*#__PURE__*/React.createElement("div", {
      style: {
        display: "flex",
        gap: 8,
        marginTop: 14
      }
    }, /*#__PURE__*/React.createElement("button", {
      type: "button",
      className: "kf-link",
      disabled: i === 0,
      onClick: () => move(i, -1)
    }, "\u25B2 \u4E0A\u3078"), /*#__PURE__*/React.createElement("button", {
      type: "button",
      className: "kf-link",
      disabled: i === KF_ROWS - 1,
      onClick: () => move(i, 1)
    }, "\u25BC \u4E0B\u3078"), /*#__PURE__*/React.createElement("button", {
      type: "button",
      className: "kf-link",
      style: {
        marginLeft: "auto"
      },
      onClick: () => clearRow(i)
    }, "\u3053\u306E\u6BB5\u3092\u7A7A\u306B\u3059\u308B"))));
  }))));
}
function KfBgThumb({
  bg,
  on,
  onPick
}) {
  const ref = useRef(null);
  useEffect(() => {
    const c = ref.current;
    if (!c) return;
    const x = c.getContext("2d");
    const k = c.width / KF_W;
    x.setTransform(k, 0, 0, k, 0, 0);
    kfWood(x, 0, KF_S, bg);
    x.strokeStyle = bg.border;
    x.lineWidth = 14;
    x.strokeRect(18, 16, KF_W - 36, KF_S - 32);
    kfWave(x, 445, 318, 520, 84, bg.c[1]);
  }, [bg.id]);
  return /*#__PURE__*/React.createElement("button", {
    type: "button",
    className: "kf-bg" + (on ? " on" : ""),
    "aria-pressed": on,
    onClick: onPick
  }, /*#__PURE__*/React.createElement("canvas", {
    ref: ref,
    width: 150,
    height: Math.round(150 * KF_S / KF_W),
    "aria-hidden": "true"
  }), /*#__PURE__*/React.createElement("span", null, bg.name));
}
;
Object.assign(window, {
  KifudaTab,
  kfRender,
  kfTax
});