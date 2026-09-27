/* GoodDay 鮮魚共有 — 18-tab-popgen （POPプロンプト作成） */
var {
  useState,
  useEffect,
  useMemo,
  useRef
} = React;

// 魚ごとの下地データ。
//   look  … 見た目（写真描写に使う。取り違えやすい魚は見分けの決め手を入れる）
//   lead  … リード文3行（身質 → 味 → 食卓への誘い）／各行10〜12文字以内
//   dishes… 料理3つ。調理法が重ならないように選ぶ。form は実際にその料理で出す形。
//           d は説明2行／各行16文字以内。
const PG_DB = [{
  w: "マアジ",
  n: ["真あじ", "あじ", "アジ", "まあじ"],
  look: "背は青緑、腹は銀白。尾の手前の側線にトゲ状のゼイゴが並ぶ。目が大きく体は側扁",
  lead: ["身がしまった", "ほどよい旨み", "毎日の食卓に"],
  d: [{
    n: "刺身",
    f: "三枚おろしの身",
    d: ["かめばかむほど", "旨みが広がります"]
  }, {
    n: "塩焼き",
    f: "丸ごと",
    d: ["皮目は香ばしく", "身はふっくらと"]
  }, {
    n: "南蛮漬け",
    f: "小ぶりを丸ごと",
    d: ["揚げて漬けるだけ", "冷やしてどうぞ"]
  }]
}, {
  w: "マサバ",
  n: ["鯖", "さば", "サバ", "まさば"],
  look: "背に濃い青の波状のしま模様、腹は銀白。体は太めの紡錘形",
  lead: ["脂がのる身", "まろやかな味", "ごはんがすすむ"],
  d: [{
    n: "塩焼き",
    f: "切り身",
    d: ["皮はパリッと", "身はジューシー"]
  }, {
    n: "味噌煮",
    f: "切り身",
    d: ["味噌がよくからむ", "やわらかな煮上がり"]
  }, {
    n: "竜田揚げ",
    f: "ひと口大",
    d: ["外はサクッと", "中はふんわり"]
  }]
}, {
  w: "ブリ",
  n: ["ブリ", "ぶり", "鰤", "寒ブリ", "はまち", "ハマチ"],
  look: "背は青みのある銀、腹は白。口の先から尾にかけて黄色い帯が走る。太く丸みのある体",
  lead: ["厚みのある身", "脂の甘み", "冬のごちそう"],
  d: [{
    n: "刺身",
    f: "さくから引いた身",
    d: ["とろりとした舌触り", "甘みが広がります"]
  }, {
    n: "照り焼き",
    f: "切り身",
    d: ["たれがよくからむ", "ごはんによく合う"]
  }, {
    n: "ぶり大根",
    f: "あらと切り身",
    d: ["煮汁がしみ込む", "寒い日にうれしい"]
  }]
}, {
  w: "マダイ",
  n: ["真鯛", "鯛", "たい", "まだい"],
  look: "淡い桜色の体に青い小さな斑点が散る。目の上が青みがかる。尾びれの縁が黒い",
  lead: ["締まった白身", "上品な甘み", "お祝いの日に"],
  d: [{
    n: "刺身",
    f: "そぎ切りの身",
    d: ["こりっとした歯ざわり", "後から甘みが来ます"]
  }, {
    n: "鯛めし",
    f: "丸ごと",
    d: ["だしがごはんにしみる", "香りまでごちそう"]
  }, {
    n: "あら炊き",
    f: "頭と中骨",
    d: ["骨まわりが旨い", "甘辛く煮含めて"]
  }]
}, {
  w: "アカムツ",
  n: ["のどぐろ", "ノドグロ", "赤むつ", "あかむつ"],
  look: "全身が鮮やかな赤。口の中と喉が黒い。目が大きく、体高のある楕円形",
  lead: ["脂ののる白身", "とろける口当たり", "特別な日の一尾"],
  d: [{
    n: "塩焼き",
    f: "丸ごと",
    d: ["皮目から脂がにじむ", "香りが立ちます"]
  }, {
    n: "煮付け",
    f: "丸ごと",
    d: ["身離れがよく", "上品な味わい"]
  }, {
    n: "炙り刺身",
    f: "皮つきのさく",
    d: ["皮の香ばしさと", "脂の甘みを一度に"]
  }]
}, {
  w: "ニギス",
  n: ["沖ぎす", "おきぎす", "ニギス", "にぎす"],
  look: "細長い銀白色の体、大きな目、口先がとがる。うろこがはがれやすく薄い青銀に光る",
  lead: ["やわらかな白身", "くせのない味", "毎日の一品に"],
  d: [{
    n: "天ぷら",
    f: "開き",
    d: ["さっくり軽い衣", "ふんわりした身"]
  }, {
    n: "塩焼き",
    f: "丸ごと",
    d: ["淡白で食べやすい", "朝ごはんにも"]
  }, {
    n: "つみれ汁",
    f: "すり身の団子",
    d: ["だしがよく出ます", "体が温まります"]
  }]
}, {
  w: "ハタハタ",
  n: ["ハタハタ", "はたはた", "鰰"],
  look: "うろこがなくなめらかな肌。背に黄褐色のまだら模様、腹は白。大きめの胸びれ",
  lead: ["やわらかい身", "淡白であっさり", "冬の常備菜に"],
  d: [{
    n: "塩焼き",
    f: "丸ごと",
    d: ["骨からすっと外れる", "身がほろりと"]
  }, {
    n: "唐揚げ",
    f: "丸ごと",
    d: ["頭ごと食べられる", "香ばしい一品"]
  }, {
    n: "煮付け",
    f: "丸ごと",
    d: ["卵も一緒に煮て", "甘辛く仕上げて"]
  }]
}, {
  w: "サワラ",
  n: ["さわら", "サワラ", "鰆"],
  look: "細長い体に銀色の地、背側に黒い斑点が縦に並ぶ。口が大きく歯が鋭い",
  lead: ["やわらかな身", "ほんのり甘い", "焼いても煮ても"],
  d: [{
    n: "西京焼き",
    f: "切り身",
    d: ["味噌の香りと", "ふっくらした身"]
  }, {
    n: "塩焼き",
    f: "切り身",
    d: ["素材の味が生きる", "シンプルが一番"]
  }, {
    n: "竜田揚げ",
    f: "ひと口大",
    d: ["外は香ばしく", "中はしっとり"]
  }]
}, {
  w: "カレイ",
  n: ["カレイ", "かれい", "鰈", "子持ちがれい", "えてがれい"],
  look: "平たい体で両目が右側に寄る。上面は茶褐色、裏は白。ひれのふちが細かく波打つ",
  lead: ["ふっくらした身", "やさしい味", "ほっとする一皿"],
  d: [{
    n: "煮付け",
    f: "丸ごと",
    d: ["甘辛い煮汁がしみる", "ごはんに合います"]
  }, {
    n: "唐揚げ",
    f: "丸ごと",
    d: ["えんがわまで", "香ばしく揚げて"]
  }, {
    n: "ムニエル",
    f: "切り身",
    d: ["バターの香りと", "やわらかな白身"]
  }]
}, {
  w: "シロサケ",
  n: ["鮭", "さけ", "サケ", "紅鮭", "秋鮭", "銀鮭"],
  look: "オレンジがかったサーモンピンクの身に白い脂の筋。皮は銀色",
  lead: ["ほぐれる身", "やさしい甘み", "朝にも夜にも"],
  d: [{
    n: "塩焼き",
    f: "切り身",
    d: ["皮まで香ばしく", "ごはんの友に"]
  }, {
    n: "ホイル焼き",
    f: "切り身",
    d: ["野菜と一緒に蒸し焼き", "うまみを閉じ込めて"]
  }, {
    n: "ムニエル",
    f: "切り身",
    d: ["バターで香ばしく", "洋風の食卓に"]
  }]
}, {
  w: "タイセイヨウサケ",
  n: ["サーモン", "さーもん", "トラウトサーモン", "アトランティックサーモン"],
  look: "鮮やかな橙色の身に白い脂の霜降りが細かく入る。切り口につやがある",
  lead: ["とろける身", "まろやかな甘み", "みんなが好きな味"],
  d: [{
    n: "刺身",
    f: "さくから引いた身",
    d: ["口の中でとろける", "脂の甘みが広がる"]
  }, {
    n: "カルパッチョ",
    f: "薄切り",
    d: ["オリーブ油と塩で", "彩りのよい一皿"]
  }, {
    n: "ムニエル",
    f: "切り身",
    d: ["こんがり焼いて", "お子さまにも"]
  }]
}, {
  w: "クロマグロ",
  n: ["マグロ", "まぐろ", "鮪", "本マグロ", "中トロ", "赤身"],
  look: "赤身は深い紅色、中トロは桃色に白い脂の筋が入る。切り口がなめらかでつやがある",
  lead: ["きめ細かい身", "濃い旨み", "食卓の主役に"],
  d: [{
    n: "刺身",
    f: "さくから引いた身",
    d: ["濃い旨みが", "口に広がります"]
  }, {
    n: "漬け丼",
    f: "そぎ切り",
    d: ["たれをまとわせて", "熱いごはんの上に"]
  }, {
    n: "山かけ",
    f: "角切り",
    d: ["とろろと一緒に", "するりと食べられる"]
  }]
}, {
  w: "ケンサキイカ",
  n: ["白いか", "しろいか", "剣先いか", "ケンサキイカ"],
  look: "透き通る乳白色の胴、細長い三角形のひれが胴の半分以上を占める。生きた個体には褐色の斑点が走る",
  lead: ["透き通る身", "上品な甘み", "夏の楽しみに"],
  d: [{
    n: "刺身",
    f: "細づくり",
    d: ["ねっとりとした食感", "かむほどに甘い"]
  }, {
    n: "天ぷら",
    f: "輪切り",
    d: ["さくっと軽く", "やわらかな身"]
  }, {
    n: "一夜干し",
    f: "開き",
    d: ["旨みが濃くなる", "あぶってどうぞ"]
  }]
}, {
  w: "スルメイカ",
  n: ["するめいか", "スルメイカ", "いか", "イカ"],
  look: "赤褐色から白へ変わる胴、ひれは胴の先に三角形。胴が太めで肉厚",
  lead: ["歯ごたえのある身", "かむほど旨い", "ふだんの食卓に"],
  d: [{
    n: "刺身",
    f: "細づくり",
    d: ["こりこりした歯ざわり", "わたも味わい深い"]
  }, {
    n: "煮付け",
    f: "輪切りと足",
    d: ["甘辛くさっと煮て", "やわらかいうちに"]
  }, {
    n: "焼きいか",
    f: "丸ごと",
    d: ["香ばしい磯の香り", "しょうゆをひと垂らし"]
  }]
}, {
  w: "マダコ",
  n: ["タコ", "たこ", "蛸", "まだこ"],
  look: "茹でると表面は濃い赤紫、吸盤の並ぶ面は白。太くしっかりした足",
  lead: ["弾力のある身", "かむほど甘い", "ひと皿の彩りに"],
  d: [{
    n: "刺身",
    f: "そぎ切りの足",
    d: ["こりっとした歯ざわり", "わさび醤油で"]
  }, {
    n: "酢の物",
    f: "薄切り",
    d: ["さっぱりと", "箸休めにどうぞ"]
  }, {
    n: "唐揚げ",
    f: "ひと口大",
    d: ["外は香ばしく", "中はやわらかい"]
  }]
}, {
  w: "ホッコクアカエビ",
  n: ["甘えび", "あまえび", "アマエビ"],
  look: "透明感のある橙赤色の身、頭と殻は鮮やかな赤。長いひげ",
  lead: ["とろりとした身", "強い甘み", "お造りの華に"],
  d: [{
    n: "刺身",
    f: "殻をむいた身",
    d: ["とろける舌触り", "名前どおりの甘さ"]
  }, {
    n: "味噌汁",
    f: "頭",
    d: ["よいだしが出ます", "最後の一滴まで"]
  }, {
    n: "唐揚げ",
    f: "頭",
    d: ["殻ごと香ばしく", "おつまみにも"]
  }]
}, {
  w: "ホタテガイ",
  n: ["ホタテ", "ほたて", "帆立", "ほたて貝柱"],
  look: "円い貝柱は乳白色で繊維が縦に走る。殻は扇形で放射状のすじ",
  lead: ["太い貝柱", "しっかり甘い", "焼いても生でも"],
  d: [{
    n: "刺身",
    f: "貝柱",
    d: ["とろりと甘く", "歯切れがよい"]
  }, {
    n: "バター焼き",
    f: "貝柱",
    d: ["香ばしい焼き目と", "バターの香り"]
  }, {
    n: "フライ",
    f: "貝柱",
    d: ["さくっと衣の中に", "甘い身が入る"]
  }]
}, {
  w: "マガキ",
  n: ["かき", "牡蠣", "カキ", "真がき"],
  look: "乳白色のふっくらしたむき身、縁は黒っぽい。表面に光沢がある",
  lead: ["ふっくらした身", "濃い旨み", "冬のごちそうに"],
  d: [{
    n: "鍋",
    f: "むき身",
    d: ["だしに旨みが出る", "体が温まります"]
  }, {
    n: "フライ",
    f: "むき身",
    d: ["衣はさくっと", "中はジューシー"]
  }, {
    n: "酒蒸し",
    f: "むき身",
    d: ["ふっくら火を通し", "そのままどうぞ"]
  }]
}, {
  w: "イワガキ",
  n: ["岩がき", "いわがき", "岩牡蠣"],
  look: "大ぶりで厚みのあるむき身、乳白色でクリーム色を帯びる。殻はごつごつと厚い",
  lead: ["大ぶりな身", "クリーミーな味", "夏のぜいたくに"],
  d: [{
    n: "生食",
    f: "殻つきのむき身",
    d: ["レモンをしぼって", "海の香りごと"]
  }, {
    n: "蒸しがき",
    f: "殻つき",
    d: ["ふっくら仕上がる", "旨みが凝縮"]
  }, {
    n: "フライ",
    f: "むき身",
    d: ["大きな身を", "さくっと揚げて"]
  }]
}, {
  w: "ズワイガニ",
  n: ["松葉ガニ", "まつばがに", "ズワイガニ", "ずわいがに", "せこがに", "紅ズワイ"],
  look: "茹でると甲羅は鮮やかな朱色、脚の内側は白。細長い脚と小さな甲羅",
  lead: ["ぎっしりの身", "濃厚な甘み", "冬の主役に"],
  d: [{
    n: "茹でガニ",
    f: "姿",
    d: ["そのままが一番", "甘みが際立つ"]
  }, {
    n: "焼きガニ",
    f: "脚",
    d: ["香ばしく焼いて", "身がほぐれます"]
  }, {
    n: "カニ鍋",
    f: "脚と甲羅",
    d: ["だしが濃く出る", "締めの雑炊まで"]
  }]
}, {
  w: "ヤマトシジミ",
  n: ["しじみ", "シジミ", "宍道湖しじみ", "蜆"],
  look: "黒褐色の小さな二枚貝、殻に細かい成長線。身は淡い橙色",
  lead: ["小さな身", "濃いだし", "一日のはじめに"],
  d: [{
    n: "味噌汁",
    f: "殻つき",
    d: ["だしがよく出る", "朝の一杯に"]
  }, {
    n: "酒蒸し",
    f: "殻つき",
    d: ["酒と一緒にさっと", "香りが立ちます"]
  }, {
    n: "しぐれ煮",
    f: "むき身",
    d: ["甘辛く煮詰めて", "ごはんのお供に"]
  }]
}, {
  w: "サンマ",
  n: ["秋刀魚", "さんま", "サンマ"],
  look: "細長く刀のような体、背は青光りし腹は銀白。口の先が黄色みを帯びる",
  lead: ["脂ののる身", "香ばしい味", "秋の便りに"],
  d: [{
    n: "塩焼き",
    f: "丸ごと",
    d: ["皮は香ばしく", "大根おろしと"]
  }, {
    n: "煮付け",
    f: "筒切り",
    d: ["甘辛く骨までやわらか", "常備菜にも"]
  }, {
    n: "蒲焼き",
    f: "開き",
    d: ["たれをからめて", "丼にしても"]
  }]
}, {
  w: "ヒラマサ",
  n: ["ヒラマサ", "ひらまさ", "平政"],
  look: "ブリに似るが体はやや平たく、黄色い縦帯がブリより鮮やか。胸びれが短い",
  lead: ["締まった身", "さっぱりした甘み", "おもてなしにも"],
  d: [{
    n: "刺身",
    f: "そぎ切りの身",
    d: ["こりっとした歯ざわり", "上品な後味"]
  }, {
    n: "カルパッチョ",
    f: "薄切り",
    d: ["オリーブ油と合う", "彩りよく盛って"]
  }, {
    n: "照り焼き",
    f: "切り身",
    d: ["身がしっかり", "たれによく合う"]
  }]
}, {
  w: "イサキ",
  n: ["イサキ", "いさき", "伊佐木"],
  look: "背は灰褐色から青みを帯び、腹は銀白。若魚には縦のしま模様。やや体高がある",
  lead: ["ほどよい脂", "やわらかな甘み", "初夏の楽しみに"],
  d: [{
    n: "塩焼き",
    f: "丸ごと",
    d: ["皮目が香ばしい", "身はふっくら"]
  }, {
    n: "刺身",
    f: "そぎ切りの身",
    d: ["脂と甘みが", "ほどよく調和"]
  }, {
    n: "煮付け",
    f: "丸ごと",
    d: ["淡白な身に", "味がよくしみる"]
  }]
}];

// 呼び名 → データ（normJa で照合）
function pgFind(q) {
  const t = normJa(String(q || "").trim());
  if (!t) return null;
  for (const f of PG_DB) {
    if (normJa(f.w) === t) return f;
    if (f.n.some(x => normJa(x) === t)) return f;
  }
  for (const f of PG_DB) {
    // 部分一致（「のどぐろの開き」など）
    if (f.n.some(x => normJa(x).length >= 2 && t.includes(normJa(x)))) return f;
  }
  return null;
}

// 販売形態 → 右の大きな写真での並べ方
const PG_FORMS = {
  "丸": "一尾丸ごとの姿のまま",
  "切り身": "切り身にして皮目を上に",
  "刺身": "そぎ切りにした刺身を扇状に",
  "開き": "開いて身を上にして",
  "干物": "干物にして身を上にして"
};
function PopGenTab({
  embedded
}) {
  const [name, setName] = useState("");
  const [org, setOrg] = useState("");
  const [form, setForm] = useState("丸");
  const [season, setSeason] = useState("");
  const [out, setOut] = useState(null);
  const [copied, setCopied] = useState(false);
  const taRef = useRef(null);
  const hit = useMemo(() => pgFind(name), [name]);
  const build = () => {
    const disp = name.trim();
    if (!disp) return;
    const f = pgFind(disp);
    const head = org.trim() ? org.trim() : "旬の";
    const shape = PG_FORMS[form] || PG_FORMS["丸"];
    const look = f ? f.look : `${disp}の姿。体色・つや・目の大きさ・体形が実物どおりに見えること`;
    const lead = f ? f.lead : ["鮮度のよい身", "素材の持ち味", "今日の食卓に"];
    const dishes = f ? f.d : [{
      n: "塩焼き",
      f: "丸ごと",
      d: ["素材の味が生きる", "シンプルに焼いて"]
    }, {
      n: "煮付け",
      f: "丸ごと",
      d: ["味がよくしみる", "ごはんに合います"]
    }, {
      n: "唐揚げ",
      f: "ひと口大",
      d: ["外は香ばしく", "中はやわらかい"]
    }];
    const seasonLine = season.trim() ? `\n・季節・行事の雰囲気：${season.trim()}を感じさせる小物や色づかいをさりげなく添える。` : "";
    const p = `横長A4（比率1.41:1）の販促ポスターを1枚作る。白ベースに藍色と深緑をアクセントにし、上下の端に濃い青の細い帯を入れる。

【左上】深緑の横長バナー（右端が斜めカット）。白文字で1行目「おいしい毎日を、産地から」を小さめの明朝体、その下に細い区切り線、2行目「鮮度のよろこび GoodDay」を太字で置き、GoodDay は大きな英字セリフ体にする。

【左】黒の太い筆文字で「${head}」、その下に非常に大きな力強い黒の筆書きで「${disp}」。背後に青いかすれ筆ストローク、左端に青海波風の波しぶきを配置する。

【左中段】黒の太ゴシック体で3行のリード文：
${lead.map(l => `「${l}」`).join("\n")}

【右】竹ざる、笹の葉、砕いた氷の上に、${disp}を${shape}斜めに並べたリアルな写真。${disp}の見た目は次のとおりに描く：${look}。明るく柔らかい自然光、背景は白く飛ばし気味、鮮度の伝わるつやを出す。

【右下】青い筆ストロークの帯に白抜きの太字で、やや右上がりに2行「いろいろな／料理で楽しめます！」

【下段】角丸の写真パネル3枚を横並びにする。各パネルの左下に白文字の見出しと2行の説明を置き、写真の下部は文字が読めるよう暗めのグラデーションをかける。
${dishes.map((d, i) => `${i + 1}枚目：${d.n}の写真（${disp}を${d.f}の状態で調理したもの）。見出し「${d.n}に」、説明1行目「${d.d[0]}」、説明2行目「${d.d[1]}」`).join("\n")}${seasonLine}

文字はすべて正確に誤字なく描画する。過度な高級感、不要な英語、ロゴ、透かしは入れない。`;
    setOut({
      prompt: p,
      wamei: f ? f.w : "（データ未登録・要確認）",
      head: org.trim() ? "産地" : "旬の",
      dishes: dishes.map(d => d.n),
      known: !!f
    });
    setCopied(false);
    setTimeout(() => {
      try {
        taRef.current && taRef.current.scrollIntoView({
          behavior: "smooth",
          block: "start"
        });
      } catch (e) {}
    }, 60);
  };
  const copy = async () => {
    if (!out) return;
    try {
      await navigator.clipboard.writeText(out.prompt);
    } catch (e) {
      if (taRef.current) {
        taRef.current.select();
        document.execCommand("copy");
      }
    }
    setCopied(true);
    setTimeout(() => setCopied(false), 1800);
  };
  const L = {
    fontSize: 12.5,
    fontWeight: 800,
    color: "var(--sub)",
    display: "block",
    marginBottom: 6
  };
  const I = {
    width: "100%",
    border: "1px solid var(--line)",
    background: "var(--card, #fff)",
    color: "var(--ink)",
    borderRadius: 11,
    padding: "11px 12px",
    fontSize: 15,
    outline: "none"
  };
  return /*#__PURE__*/React.createElement("div", {
    style: {
      maxWidth: 720,
      margin: "0 auto",
      padding: embedded ? "0 0 40px" : "6px 16px 120px"
    }
  }, !embedded && /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 12.5,
      color: "var(--sub)",
      lineHeight: 1.75,
      marginBottom: 14
    }
  }, "\u9B5A\u306E\u540D\u524D\u3092\u5165\u308C\u308B\u3068\u3001\u753B\u50CF\u751F\u6210AI\u306B\u305D\u306E\u307E\u307E\u8CBC\u308C\u308B\u65E5\u672C\u8A9E\u306E\u30D7\u30ED\u30F3\u30D7\u30C8\u3092\u4F5C\u308A\u307E\u3059\u3002 \u6A2A\u9577A4\u30FBGoodDay\u306E\u30D0\u30CA\u30FC\u5165\u308A\u30FB\u4E0B\u6BB5\u306B\u6599\u7406\u5199\u771F3\u679A\u306E\u6C7A\u307E\u3063\u305F\u5F62\u3067\u51FA\u3057\u307E\u3059\u3002"), /*#__PURE__*/React.createElement("div", {
    style: {
      background: "var(--card, #fff)",
      border: "1px solid var(--line)",
      borderRadius: 14,
      padding: 14,
      marginBottom: 14
    }
  }, /*#__PURE__*/React.createElement("label", {
    style: L
  }, "\u9B5A\u306E\u540D\u524D\uFF08\u5FC5\u9808\uFF09"), /*#__PURE__*/React.createElement("input", {
    value: name,
    onChange: e => setName(e.target.value),
    placeholder: "\u4F8B\uFF1A\u306E\u3069\u3050\u308D\u3001\u6C96\u304E\u3059\u3001\u30CF\u30BF\u30CF\u30BF",
    style: I,
    onKeyDown: e => {
      if (e.key === "Enter") build();
    }
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      flexWrap: "wrap",
      gap: 6,
      marginTop: 9
    }
  }, ["真あじ", "鯖", "ブリ", "真鯛", "のどぐろ", "カレイ", "サーモン", "白いか", "甘えび", "ハタハタ", "沖ぎす", "秋刀魚"].map(t => /*#__PURE__*/React.createElement("button", {
    key: t,
    onClick: () => setName(t),
    style: {
      border: "1px solid " + (name === t ? "var(--primary-soft)" : "var(--line)"),
      background: name === t ? "var(--soft)" : "var(--card, #fff)",
      color: name === t ? "var(--soft-text)" : "var(--sub)",
      borderRadius: 999,
      padding: "6px 12px",
      fontSize: 12.5,
      fontWeight: 800,
      cursor: "pointer"
    }
  }, t))), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 11.5,
      marginTop: 9,
      color: hit ? "var(--soft-text)" : "var(--faint)"
    }
  }, name.trim() === "" ? "　" : hit ? `登録あり（標準和名：${hit.w}）— 見た目・料理・コピーを自動で入れます` : "この呼び名は未登録です。無難な内容で作り、確認欄に印をつけます"), /*#__PURE__*/React.createElement("div", {
    style: {
      height: 1,
      background: "var(--line)",
      margin: "14px 0"
    }
  }), /*#__PURE__*/React.createElement("label", {
    style: L
  }, "\u7523\u5730\uFF08\u4EFB\u610F\u30FB\u5165\u308C\u306A\u3044\u3068\u304D\u306F\u300C\u65EC\u306E\u300D\u306B\u306A\u308A\u307E\u3059\uFF09"), /*#__PURE__*/React.createElement("input", {
    value: org,
    onChange: e => setOrg(e.target.value),
    placeholder: "\u4F8B\uFF1A\u5C71\u9670\u6C96\u7523\u3001\u5883\u6E2F\u7523",
    style: I
  }), /*#__PURE__*/React.createElement("label", {
    style: {
      ...L,
      marginTop: 12
    }
  }, "\u58F2\u308A\u65B9"), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      flexWrap: "wrap",
      gap: 6
    }
  }, Object.keys(PG_FORMS).map(k => /*#__PURE__*/React.createElement("button", {
    key: k,
    onClick: () => setForm(k),
    style: {
      border: "1px solid " + (form === k ? "var(--primary-soft)" : "var(--line)"),
      background: form === k ? "var(--soft)" : "var(--card, #fff)",
      color: form === k ? "var(--soft-text)" : "var(--sub)",
      borderRadius: 999,
      padding: "7px 14px",
      fontSize: 13,
      fontWeight: 800,
      cursor: "pointer"
    }
  }, k))), /*#__PURE__*/React.createElement("label", {
    style: {
      ...L,
      marginTop: 12
    }
  }, "\u5B63\u7BC0\u30FB\u884C\u4E8B\uFF08\u4EFB\u610F\uFF09"), /*#__PURE__*/React.createElement("input", {
    value: season,
    onChange: e => setSeason(e.target.value),
    placeholder: "\u4F8B\uFF1A\u304A\u6B63\u6708\u3001\u7BC0\u5206\u3001\u6BCD\u306E\u65E5",
    style: I
  }), /*#__PURE__*/React.createElement("button", {
    onClick: build,
    disabled: !name.trim(),
    style: {
      width: "100%",
      marginTop: 14,
      border: "none",
      borderRadius: 12,
      padding: "14px 10px",
      background: name.trim() ? "var(--primary-soft)" : "var(--chip)",
      color: name.trim() ? "#fff" : "var(--faint)",
      fontSize: 15.5,
      fontWeight: 900,
      cursor: name.trim() ? "pointer" : "default"
    }
  }, "\u30D7\u30ED\u30F3\u30D7\u30C8\u3092\u4F5C\u308B")), out && /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      alignItems: "center",
      marginBottom: 8
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 13,
      fontWeight: 900,
      color: "var(--ink)"
    }
  }, "\u753B\u50CF\u751F\u6210\u30D7\u30ED\u30F3\u30D7\u30C8"), /*#__PURE__*/React.createElement("button", {
    onClick: copy,
    style: {
      marginLeft: "auto",
      border: "none",
      borderRadius: 10,
      padding: "9px 18px",
      background: copied ? "#2f8f5f" : "var(--primary)",
      color: "#fff",
      fontSize: 13.5,
      fontWeight: 800,
      cursor: "pointer"
    }
  }, copied ? "コピーしました" : "コピー")), /*#__PURE__*/React.createElement("textarea", {
    ref: taRef,
    value: out.prompt,
    readOnly: true,
    rows: 16,
    style: {
      width: "100%",
      border: "1px solid var(--line)",
      background: "var(--card, #fff)",
      color: "var(--text)",
      borderRadius: 12,
      padding: 12,
      fontSize: 12.5,
      lineHeight: 1.8,
      resize: "vertical"
    }
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      background: "var(--card, #fff)",
      border: "1px solid var(--line)",
      borderRadius: 14,
      padding: 13,
      marginTop: 12
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 13,
      fontWeight: 900,
      color: "var(--ink)",
      marginBottom: 8
    }
  }, "\u78BA\u8A8D\u6B04"), [["標準和名", out.wamei], ["見出しの上段", out.head === "産地" ? `産地（${org.trim()}）` : "旬の（産地の入力なし）"], ["選んだ料理", out.dishes.join("／")]].map(([k, v]) => /*#__PURE__*/React.createElement("div", {
    key: k,
    style: {
      display: "flex",
      gap: 10,
      fontSize: 12.5,
      lineHeight: 1.9
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      flex: "0 0 88px",
      color: "var(--sub)",
      fontWeight: 800
    }
  }, k), /*#__PURE__*/React.createElement("span", {
    style: {
      color: "var(--text)"
    }
  }, v))), !out.known && /*#__PURE__*/React.createElement("div", {
    style: {
      marginTop: 9,
      background: "var(--soft)",
      color: "var(--soft-text)",
      borderRadius: 9,
      padding: "9px 11px",
      fontSize: 12,
      lineHeight: 1.7,
      fontWeight: 700
    }
  }, "\u8981\u78BA\u8A8D\uFF1A\u3053\u306E\u547C\u3073\u540D\u306F\u767B\u9332\u3055\u308C\u3066\u3044\u307E\u305B\u3093\u3002\u6A19\u6E96\u548C\u540D\u3068\u3001\u4E0B\u6BB5\u306E\u6599\u74063\u3064\u304C\u5B9F\u969B\u306B\u3053\u306E\u9B5A\u3067\u98DF\u3079\u3089\u308C\u308B\u3082\u306E\u304B\u3001 \u8CBC\u308A\u4ED8\u3051\u308B\u524D\u306B\u898B\u3066\u304F\u3060\u3055\u3044\u3002"))));
}
;
Object.assign(window, {
  PopGenTab,
  PG_DB
});