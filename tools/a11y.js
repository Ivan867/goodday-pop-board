// 画面に出ている文字を全部たどり、背景との明暗差を測る。
// 4.5:1 未満（大きい字は 3:1 未満）を「読みにくい」として報告する。
const { chromium } = require('playwright');

const 測る = () => {
  const 数 = (c) => {
    const m = String(c).match(/[\d.]+/g) || [];
    return { r:+m[0]||0, g:+m[1]||0, b:+m[2]||0, a: m[3] === undefined ? 1 : +m[3] };
  };
  const L = ({r,g,b}) => {
    const f = v => { v/=255; return v <= .03928 ? v/12.92 : Math.pow((v+.055)/1.055, 2.4); };
    return .2126*f(r) + .7152*f(g) + .0722*f(b);
  };
  const 重ね = (上, 下) => ({
    r: 上.r*上.a + 下.r*(1-上.a), g: 上.g*上.a + 下.g*(1-上.a), b: 上.b*上.a + 下.b*(1-上.a), a:1
  });
  const 地色 = (el) => {
    let 下 = { r:255, g:255, b:255, a:1 }, 積 = [];
    for (let e = el; e; e = e.parentElement) {
      const c = 数(getComputedStyle(e).backgroundColor);
      if (c.a > 0) 積.push(c);
      if (c.a >= 0.999) break;
    }
    for (let i = 積.length - 1; i >= 0; i--) 下 = 重ね(積[i], 下);
    return 下;
  };
  const 比 = (a, b) => { const x=L(a), y=L(b); return (Math.max(x,y)+.05)/(Math.min(x,y)+.05); };
  const 道 = (el) => {
    const t = el.tagName.toLowerCase();
    const c = (el.className && typeof el.className === "string") ? "." + el.className.trim().split(/\s+/).slice(0,2).join(".") : "";
    return t + c;
  };
  const 出 = [];
  const w = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
  const 済 = new Set();
  for (let n = w.nextNode(); n; n = w.nextNode()) {
    const 文 = (n.nodeValue || "").trim();
    if (!文) continue;
    const el = n.parentElement;
    if (!el || 済.has(el)) continue;
    const r = el.getBoundingClientRect();
    if (r.width < 2 || r.height < 2) continue;
    const st = getComputedStyle(el);
    if (st.visibility === "hidden" || st.opacity === "0" || st.display === "none") continue;
    済.add(el);
    const 字 = 数(st.color);
    if (字.a < 0.05) continue;
    const 地 = 地色(el);
    const 前 = 字.a < 1 ? 重ね(字, 地) : 字;
    const px = parseFloat(st.fontSize) || 14;
    const 太 = (parseInt(st.fontWeight) || 400) >= 700;
    const 大 = px >= 24 || (px >= 18.66 && 太);
    const v = 比(前, 地);
    const 基準 = 大 ? 3 : 4.5;
    if (v < 基準) 出.push({ 文: 文.slice(0,24), 比: +v.toFixed(2), 基準, px: Math.round(px), 字: st.color, 地: `rgb(${Math.round(地.r)},${Math.round(地.g)},${Math.round(地.b)})`, 所: 道(el) });
  }
  return 出.sort((a,b) => a.比 - b.比);
};

(async () => {
  const b = await chromium.launch();
  const 画面 = process.argv.slice(2);
  for (const [dept, theme] of [["fish","light"],["fish","dark"],["produce","light"]]) {
    for (const tab of 画面) {
      const ctx = await b.newContext({viewport:{width:390,height:900}});
      const p = await ctx.newPage();
      await p.addInitScript(([d,t])=>{try{localStorage.setItem('dept',d);localStorage.setItem('theme',t);}catch(e){}}, [dept,theme]);
      await p.route('**://*.supabase.co/**', r=>r.fulfill({status:200,contentType:'application/json',body:'[]'}));
      await p.goto('file://' + process.cwd() + '/index.html');
      await p.waitForTimeout(2800);
      if (tab !== 'board') { await p.evaluate(t=>window.dispatchEvent(new CustomEvent('goTab',{detail:t})), tab); await p.waitForTimeout(2200); }
      const 悪い = await p.evaluate(`(${測る.toString()})()`);
      if (悪い.length) {
        console.log(`\n■ ${tab} / ${dept} / ${theme} — ${悪い.length}件`);
        for (const x of 悪い.slice(0,10)) console.log(`   ${String(x.比).padStart(5)} (基準${x.基準})  ${x.px}px  ${x.所}  「${x.文}」  字${x.字} 地${x.地}`);
      } else console.log(`○ ${tab} / ${dept} / ${theme} — 問題なし`);
      await ctx.close();
    }
  }
  await b.close();
})();
