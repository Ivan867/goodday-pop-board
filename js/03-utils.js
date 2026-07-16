/* GoodDay 鮮魚共有 — 03-utils （自動分割・window共有） */
var {
  useState,
  useEffect,
  useCallback,
  useRef
} = React;

// ═══════════ UTILS：共有ユーティリティ（日付・行事・文字列） ═══════════

// 日本の祝日（2026〜2028）。行事カレンダーの表示用。
const JP_HOLIDAYS = {
  2026: {
    "1-1": "元日",
    "1-12": "成人の日",
    "2-11": "建国記念の日",
    "2-23": "天皇誕生日",
    "3-20": "春分の日",
    "4-29": "昭和の日",
    "5-3": "憲法記念日",
    "5-4": "みどりの日",
    "5-5": "こどもの日",
    "5-6": "振替休日",
    "7-20": "海の日",
    "8-11": "山の日",
    "9-21": "敬老の日",
    "9-22": "国民の休日",
    "9-23": "秋分の日",
    "10-12": "スポーツの日",
    "11-3": "文化の日",
    "11-23": "勤労感謝の日"
  },
  2027: {
    "1-1": "元日",
    "1-11": "成人の日",
    "2-11": "建国記念の日",
    "2-23": "天皇誕生日",
    "3-21": "春分の日",
    "3-22": "振替休日",
    "4-29": "昭和の日",
    "5-3": "憲法記念日",
    "5-4": "みどりの日",
    "5-5": "こどもの日",
    "7-19": "海の日",
    "8-11": "山の日",
    "9-20": "敬老の日",
    "9-23": "秋分の日",
    "10-11": "スポーツの日",
    "11-3": "文化の日",
    "11-23": "勤労感謝の日"
  },
  2028: {
    "1-1": "元日",
    "1-10": "成人の日",
    "2-11": "建国記念の日",
    "2-23": "天皇誕生日",
    "3-20": "春分の日",
    "4-29": "昭和の日",
    "5-3": "憲法記念日",
    "5-4": "みどりの日",
    "5-5": "こどもの日",
    "7-17": "海の日",
    "8-11": "山の日",
    "9-18": "敬老の日",
    "9-22": "秋分の日",
    "10-9": "スポーツの日",
    "11-3": "文化の日",
    "11-23": "勤労感謝の日"
  }
};
// 指定日の祝日名を返す（なければ null）
function holidayName(year, month, day) {
  const t = JP_HOLIDAYS[year];
  return t ? t[`${month}-${day}`] || null : null;
}

// 行事（ハレの日）データ：TodayInfoCard と 行事カレンダー の共通ソース
function seasonalEventsFor(year) {
  const mk = (y, m, d, name, food) => ({
    date: new Date(y, m - 1, d),
    name,
    food
  });
  const nthSunday = (y, m, n) => {
    const first = new Date(y, m - 1, 1);
    const off = (7 - first.getDay()) % 7;
    return new Date(y, m - 1, 1 + off + (n - 1) * 7);
  };
  const USHI = {
    2026: [[7, 26, "土用の丑"]],
    2027: [[7, 21, "土用の丑"], [8, 2, "土用の二の丑"]],
    2028: [[7, 27, "土用の丑"]]
  };
  const HIGAN = {
    2026: [[3, 17], [9, 20]],
    2027: [[3, 18], [9, 20]],
    2028: [[3, 17], [9, 19]]
  };
  const list = [mk(year, 1, 1, "お正月", "刺身・おせち"), mk(year, 2, 3, "節分", "恵方巻"), mk(year, 3, 3, "ひな祭り", "ちらし寿司・はまぐり"), mk(year, 5, 5, "こどもの日", "お祝い・ちらし"), mk(year, 7, 2, "半夏生", "タコ"), mk(year, 7, 7, "七夕", "ちらし・そうめん"), mk(year, 8, 13, "お盆入り", "刺身・お供え"), mk(year, 10, 31, "ハロウィン", null), mk(year, 12, 22, "冬至", null), mk(year, 12, 24, "クリスマス", "オードブル・寿司"), mk(year, 12, 31, "大晦日", "刺身・寿司")];
  list.push({
    date: nthSunday(year, 5, 2),
    name: "母の日",
    food: "ごちそう・お祝い"
  });
  list.push({
    date: nthSunday(year, 6, 3),
    name: "父の日",
    food: "ごちそう・晩酌のあて"
  });
  (USHI[year] || []).forEach(([m, d, nm]) => list.push(mk(year, m, d, nm, "うなぎ・スタミナ")));
  (HIGAN[year] || []).forEach(([m, d]) => list.push(mk(year, m, d, (m < 6 ? "春" : "秋") + "彼岸入り", "お供え・お寿司")));
  list.forEach(e => e.date.setHours(0, 0, 0, 0));
  return list;
}

// 固定シェルの内側スクロール容器（旧: window スクロール）
const scroller = () => document.getElementById("app-scroll");
const scrollerY = () => {
  const el = scroller();
  return el ? el.scrollTop : 0;
};
const scrollerTop = smooth => {
  const el = scroller();
  if (el) el.scrollTo({
    top: 0,
    behavior: smooth ? "smooth" : "auto"
  });
};
function timeAgo(d) {
  const s = (Date.now() - new Date(d)) / 1000;
  if (s < 60) return "たった今";
  if (s < 3600) return `${Math.floor(s / 60)}分前`;
  if (s < 86400) return `${Math.floor(s / 3600)}時間前`;
  return `${Math.floor(s / 86400)}日前`;
}
// 右下角を起点に、真上(90°)〜真左(178°)へ扇状に並べる座標を計算する（放射状フィルター用）
function arcPositions(n, radius, fromDeg, toDeg) {
  const arr = [];
  for (let i = 0; i < n; i++) {
    const t = n === 1 ? 0.5 : i / (n - 1);
    const deg = fromDeg + (toDeg - fromDeg) * t;
    const rad = deg * Math.PI / 180;
    arr.push({
      tx: Math.cos(rad) * radius,
      ty: -Math.sin(rad) * radius
    });
  }
  return arr;
}
function formatDate(d) {
  const dt = new Date(d);
  return `${dt.getFullYear()}/${String(dt.getMonth() + 1).padStart(2, '0')}/${String(dt.getDate()).padStart(2, '0')}`;
}

// ── Upload Modal ──

;
Object.assign(window, {
  JP_HOLIDAYS,
  holidayName,
  arcPositions,
  formatDate,
  scroller,
  scrollerTop,
  scrollerY,
  seasonalEventsFor,
  timeAgo
});