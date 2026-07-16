/* GoodDay 鮮魚共有 — 15-tab-fish （魚図鑑・遅延読み込み） */
var {
  useState,
  useEffect,
  useCallback,
  useRef
} = React;
const FISH_DB = [{
  name: "真あじ",
  kana: "まあじ",
  months: [5, 6, 7, 8],
  point: "初夏〜夏が旬の定番魚。脂と旨みのバランスが良く、山陰沖の地物は鮮度が売り。刺身・たたき・なめろうと生食提案がしやすい。",
  cook: "刺身／たたき／塩焼き／フライ／南蛮漬け",
  pop: "「山陰沖どれ 朝どれあじ」「今日はたたきで一杯」",
  local: "島根の定番地魚。浜田のどんちっちあじは脂の乗りで有名。"
}, {
  name: "鯖",
  kana: "さば",
  months: [10, 11, 12, 1, 2],
  point: "秋〜冬に脂が乗る。ノルウェー産は年間安定、国産秋さばは季節の目玉。しめ鯖・塩焼き・味噌煮と用途が広い。",
  cook: "塩焼き／味噌煮／しめ鯖／竜田揚げ",
  pop: "「脂のり抜群 秋さば入荷」「ごはんがすすむ味噌煮に」",
  local: "アニサキス対策の下処理説明があると生食系の安心感UP。"
}, {
  name: "ブリ",
  kana: "ぶり",
  months: [12, 1, 2],
  point: "冬の主役。寒ブリは脂の甘みが最大の訴求。切身・刺身・ぶりしゃぶ・照り焼きまで展開幅が広く、年末年始の柱。",
  cook: "刺身／ぶりしゃぶ／照り焼き／ぶり大根",
  pop: "「寒ブリ入荷！」「今夜はぶりしゃぶで温まる」",
  local: "山陰の冬の看板。境港の天然寒ブリは全国区の知名度。"
}, {
  name: "真鯛",
  kana: "まだい",
  months: [3, 4, 5, 11, 12],
  point: "春の桜鯛・秋の紅葉鯛。祝い事・ハレの日の魚として強く、姿売り・刺身・切身と全対応。養殖は年間安定。",
  cook: "刺身／塩焼き／鯛めし／カルパッチョ／あら炊き",
  pop: "「お祝いに姿鯛」「春の桜鯛、入荷しました」",
  local: "入学・卒業・節句シーズンは姿売り予約の案内が効く。"
}, {
  name: "マグロ",
  kana: "まぐろ",
  months: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12],
  point: "刺身売場の主役で年間需要。赤身の低脂質・高たんぱく訴求は健康志向にも合う。中トロ・ネギトロで単価と間口の両取り。",
  cook: "刺身／漬け丼／ネギトロ／山かけ",
  pop: "「本マグロ中トロ 今日だけ」「赤身は高たんぱくでヘルシー」",
  local: "境港は生本マグロの水揚げで有名（夏）。地元産訴求のチャンス。"
}, {
  name: "サーモン",
  kana: "さーもん",
  months: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12],
  point: "子どもから大人まで人気No.1級。年間安定供給で計画が立てやすい。刺身・寿司・ムニエルと洋風提案も可能。",
  cook: "刺身／カルパッチョ／ムニエル／ホイル焼き",
  pop: "「お子さまに大人気」「サーモン好き集合！」",
  local: "生食用アトランティックと焼き用秋鮭・銀鮭の使い分け表示が親切。"
}, {
  name: "白いか",
  kana: "しろいか",
  months: [6, 7, 8, 9],
  point: "夏の山陰の看板イカ（ケンサキイカ）。上品な甘みとねっとり食感で、刺身の単価が取れる地物。",
  cook: "刺身／いかそうめん／天ぷら／一夜干し",
  pop: "「山陰の夏の味 白いか入荷」「甘み抜群、まずは刺身で」",
  local: "山陰では夏の最重要地物のひとつ。漁火漁の話題性も◎。"
}, {
  name: "タコ",
  kana: "たこ",
  months: [6, 7, 8],
  point: "半夏生（7/2頃）とセットで売れる夏商材。酢の物・たこ焼き・カルパッチョと用途提案がしやすい。",
  cook: "刺身／酢の物／たこ焼き／唐揚げ",
  pop: "「半夏生にはタコ」「夏バテ予防にタウリン」",
  local: "半夏生の由来POP（豊作祈願）を添えると売場に物語が出る。"
}, {
  name: "甘えび",
  kana: "あまえび",
  months: [9, 10, 11, 12, 1, 2, 3],
  point: "とろける甘さで刺身盛りの華。子どもにも人気で、寿司・海鮮丼の具としても強い。",
  cook: "刺身／寿司／唐揚げ（頭）／味噌汁",
  pop: "「とろける甘さ 甘えび」「頭は唐揚げ・味噌汁でどうぞ」",
  local: "日本海の秋冬の定番。頭の出汁活用まで案内するとロス削減にも。"
}, {
  name: "ノドグロ",
  kana: "のどぐろ",
  months: [9, 10, 11, 12, 1],
  point: "山陰の高級魚（アカムツ）。「白身のトロ」の一言で価値が伝わる。贈答・ハレの日・ちょっと贅沢需要に。",
  cook: "塩焼き／煮付け／炙り刺身／一夜干し",
  pop: "「白身のトロ ノドグロ」「特別な日の一尾に」",
  local: "山陰の看板高級魚。観光客・帰省客への訴求も強い。"
}, {
  name: "カレイ",
  kana: "かれい",
  months: [10, 11, 12, 1, 2, 3],
  point: "煮付けの王道で年配客の支持が厚い。エテガレイ（笹がれい）の一夜干しは山陰土産の定番。",
  cook: "煮付け／唐揚げ／一夜干し／ムニエル",
  pop: "「今夜は煮付けでほっこり」「山陰名物 えてがれい干物」",
  local: "子持ちガレイの季節（冬〜春）は煮付け需要のピーク。"
}, {
  name: "宍道湖しじみ",
  kana: "しじみ",
  months: [1, 2, 6, 7],
  point: "島根が誇る全国ブランド。土用しじみ（夏）と寒しじみ（冬）の年2回の旬。肝臓に優しいオルニチン訴求が定番。",
  cook: "味噌汁／酒蒸し／しぐれ煮",
  pop: "「宍道湖産 寒しじみ」「飲んだ翌朝に、しじみ汁」",
  local: "地元最強の名産。砂抜き方法・冷凍で旨み増の豆知識POPが効く。"
}, {
  name: "松葉ガニ",
  kana: "まつばがに",
  months: [11, 12, 1, 2, 3],
  point: "山陰の冬の王様（ズワイガニ雄）。解禁日（11月上旬）は年間最大級の売場イベント。雌のセコガニは地元通向け。",
  cook: "茹で／焼きガニ／カニ鍋／カニ刺し",
  pop: "「松葉ガニ解禁！」「冬の王様、入荷しました」",
  local: "解禁日カウントダウンPOPで期待感づくり。タグ付きは産地証明。"
}, {
  name: "岩がき",
  kana: "いわがき",
  months: [6, 7, 8],
  point: "夏が旬の「夏がき」。冬の真がきとの違い（大ぶり・クリーミー・生食）を伝えると価値が上がる。",
  cook: "生食／蒸しがき／フライ",
  pop: "「海のミルク 夏の岩がき」「隠岐の岩がき、入荷」",
  local: "隠岐・島根沿岸は岩がきの好産地。海洋深層水浄化などの安心訴求も。"
}, {
  name: "うなぎ",
  kana: "うなぎ",
  months: [7, 8],
  point: "土用の丑が年間最大の山。予約・当日・翌日以降の3段構えで売り切る。国産・産地表示が単価の決め手。",
  cook: "蒲焼き／うな丼／ひつまぶし／う巻き",
  pop: "「土用の丑はうなぎで精をつける」「国産うなぎ 予約承り中」",
  local: "丑の日前後は保冷・温めなおし方法のPOPが親切。"
}, {
  name: "さわら",
  kana: "さわら",
  months: [12, 1, 2, 3, 4, 5],
  point: "字は「春の魚」だが、山陰・関西で本当に旨いのは脂ののった冬の寒鰆。柔らかい身は焼き物向きで、西京焼き・炙り刺身は単価が取れる。",
  cook: "西京焼き／塩焼き／炙り刺身／竜田揚げ",
  pop: "「脂のり最高 寒鰆入荷」「今夜は西京焼きでごちそうに」",
  local: "日本海の寒鰆は冬のごちそう枠。切身の厚さで価値が伝わる。"
}, {
  name: "いさき",
  kana: "いさき",
  months: [5, 6, 7],
  point: "初夏〜梅雨が旬の「梅雨いさき」。産卵前の脂がのり、白身なのにコクがある。刺身・塩焼きどちらも強い初夏の主役。",
  cook: "刺身／塩焼き／なめろう／カルパッチョ",
  pop: "「梅雨いさき、今だけの脂」「初夏の白身の王様」",
  local: "初夏の山陰の定番。皮目を炙ると香りが立つと一言添えて。"
}, {
  name: "かます",
  kana: "かます",
  months: [9, 10, 11],
  point: "秋が旬。「カマスの焼き食い一升飯」と言われる焼き物の名手。水分が多い魚なので一夜干しにすると旨みが凝縮。",
  cook: "塩焼き／一夜干し／フライ／炙り刺身",
  pop: "「焼き食い一升飯 秋かます」「干物でうまみ凝縮」",
  local: "秋の焼き魚提案の柱。干物加工で日持ちとロス対策も。"
}, {
  name: "スルメイカ",
  kana: "するめいか",
  months: [6, 7, 8, 9],
  point: "夏〜秋の大衆イカの代表。丸ごと1杯の値頃感が武器で、刺身から煮付け・イカ飯まで捨てるところなし。",
  cook: "刺身／煮付け／イカ飯／沖漬け／塩辛",
  pop: "「まるごと1杯お値打ち」「ワタまで美味しいスルメイカ」",
  local: "白いか（高級）との使い分けで売場に幅が出る。"
}, {
  name: "飛魚（あご）",
  kana: "とびうお あご",
  months: [6, 7, 8],
  point: "島根県の「県の魚」。夏が旬で、刺身・すり身・焼きと万能。あご野焼き・あごだしは島根の食文化そのもの。",
  cook: "刺身／たたき／すり身汁／塩焼き",
  pop: "「島根県の魚 あご入荷」「あごだしの旨さは飛魚から」",
  local: "あご野焼きは島根名物。県の魚であることをPOPで誇っていい。"
}, {
  name: "白カレイ",
  kana: "しろがれい",
  months: [11, 12, 1, 2],
  point: "山陰の冬の食卓を支える上品な白身ガレイ。煮付け・干物の定番で、年配のお客様の指名買いが多い。",
  cook: "煮付け／一夜干し／唐揚げ／塩焼き",
  pop: "「山陰の冬の味 白がれい」「ふっくら煮付けで」",
  local: "山陰では干物・煮付け文化の中心。地物表記が効く。"
}, {
  name: "赤カレイ",
  kana: "あかがれい",
  months: [11, 12, 1, 2, 3],
  point: "冬の子持ち赤がれいの煮付けは日本海側の冬のごちそう。卵の食べ応えで満足感が高く、単価も取りやすい。",
  cook: "煮付け（子持ち）／唐揚げ／塩焼き",
  pop: "「子持ち赤がれい入荷」「冬の煮付けはこれで決まり」",
  local: "子持ちシーズンは売場の顔。卵の入り具合が価値。"
}, {
  name: "カラスガレイ",
  kana: "からすがれい",
  months: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12],
  point: "輸入の脂がのった切身カレイで通年安定。骨離れが良く柔らかいので、煮付け・西京漬けの加工向き。価格も安定。",
  cook: "煮付け／西京漬け／ムニエル／照り焼き",
  pop: "「とろける脂 カラスガレイ」「骨離れ良く食べやすい」",
  local: "地物ガレイと輸入切身の2本立てで価格帯をカバー。"
}, {
  name: "カツオ",
  kana: "かつお",
  months: [4, 5, 9, 10],
  point: "春の初鰹はさっぱり、秋の戻り鰹は脂しっかりの2度旬。たたき＋にんにく・薬味のセット販売が鉄板。",
  cook: "たたき／刺身／漬け丼／竜田揚げ",
  pop: "「目には青葉 初鰹」「脂のり抜群 戻り鰹」",
  local: "薬味（にんにく・生姜・ねぎ）の関連陳列で客単価UP。"
}, {
  name: "ヒラメ",
  kana: "ひらめ",
  months: [11, 12, 1, 2],
  point: "冬の寒平目は白身の最高峰クラス。刺身・昆布締めの上品な旨みと、えんがわの希少価値で特別感を演出できる。",
  cook: "刺身／昆布締め／えんがわ／ムニエル",
  pop: "「寒平目、旨みの頂点」「えんがわ入り刺身盛り」",
  local: "年末年始の刺身盛りの格上げ役。天然表記は強い。"
}, {
  name: "石鯛",
  kana: "いしだい",
  months: [6, 7, 8],
  point: "磯の王者と呼ばれる夏の高級魚。歯ごたえある甘い白身で、刺身の食べ比べ提案に向く。入荷したら目玉に。",
  cook: "刺身／薄造り／塩焼き／あら汁",
  pop: "「磯の王者 石鯛入荷」「コリコリ甘い夏の白身」",
  local: "数が出る魚ではないので「本日限り」の希少訴求で。"
}, {
  name: "メバル",
  kana: "めばる",
  months: [3, 4, 5],
  point: "春告魚（はるつげうお）。煮付けにして旨い魚の代表格で、春の売場の空気を作る。ふっくらした身離れの良さが持ち味。",
  cook: "煮付け／塩焼き／唐揚げ／アクアパッツァ",
  pop: "「春告魚 めばる入荷」「今夜はふっくら煮付けで」",
  local: "「春を告げる魚」の一言で季節感が一気に出る。"
}, {
  name: "キカナ（アオハタ）",
  kana: "きかな あおはた",
  months: [6, 7, 8, 9],
  point: "島根県東部・鳥取県西部での呼び名。ハタ類らしい上品で甘い白身は鍋・煮付け・刺身と万能。地物の顔になる魚。",
  cook: "煮付け／鍋／刺身／塩焼き",
  pop: "「地物キカナ（アオハタ）入荷」「ハタの旨みをお値打ちに」",
  local: "「キカナ」の呼び名自体が地元の言葉。呼び名POPで会話が生まれる。"
}, {
  name: "連子鯛",
  kana: "れんこだい",
  months: [9, 10, 11, 12],
  point: "標準和名キダイ。小ぶりで手頃な「もうひとつの鯛」。塩焼き・姿焼きで祝い需要にも応えられるコスパの良さが武器。",
  cook: "塩焼き／姿焼き／煮付け／鯛めし",
  pop: "「お手頃サイズの祝い鯛」「連子鯛の塩焼きで晩酌」",
  local: "日本海側で水揚げが多い。真鯛より気軽な鯛として提案。"
}, {
  name: "チヌ（クロダイ）",
  kana: "ちぬ くろだい",
  months: [4, 5, 6],
  point: "春の乗っ込みシーズンが食べどき。真鯛に劣らぬ白身で価格は手頃。下処理（血抜き・皮目）をきちんと伝えると評価が上がる。",
  cook: "刺身／洗い／塩焼き／煮付け",
  pop: "「春のちぬ、お値打ち白身」「洗いでさっぱりと」",
  local: "釣り人に馴染み深い魚。地物・天然表記との相性が良い。"
}, {
  name: "シイラ",
  kana: "しいら",
  months: [7, 8, 9],
  point: "夏の魚。ハワイでは高級魚「マヒマヒ」。クセのない身はムニエル・フライで化ける。鮮度落ちが早いので回転勝負。",
  cook: "ムニエル／フライ／竜田揚げ／照り焼き",
  pop: "「ハワイの高級魚マヒマヒ」「フライでふわふわ」",
  local: "洋風提案が刺さる若い層向け。切身加工で買いやすく。"
}, {
  name: "アトランティックサーモン",
  kana: "あとらんてぃっくさーもん",
  months: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12],
  point: "ノルウェー等の海面養殖で、生食用サーモンの主力。脂のりと品質が年間ブレないので刺身・寿司の計画が立てやすい。",
  cook: "刺身／寿司／カルパッチョ／ポキ丼",
  pop: "「とろけるノルウェーサーモン」「サーモン祭り開催」",
  local: "「生食用・養殖・ノルウェー産」の3点表示で安心感。"
}, {
  name: "トラウトサーモン",
  kana: "とらうとさーもん",
  months: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12],
  point: "チリ等で海面養殖されるニジマス。鮮やかな色と手頃な価格が武器で、アトランティックとの価格2段構えが組める。",
  cook: "刺身／寿司／漬け丼／ホイル焼き",
  pop: "「色鮮やか トラウトサーモン」「お値打ちサーモンはこちら」",
  local: "名前の違いを聞かれたら「養殖ニジマス」と答えられるように。"
}, {
  name: "エイ",
  kana: "えい",
  months: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12],
  point: "煮付け・煮こごりで愛される通好みの魚。コリコリした軟骨ごと食べられ、冷めると煮こごりになるのが持ち味。",
  cook: "煮付け／煮こごり／唐揚げ／味噌煮",
  pop: "「昔ながらのエイの煮付け」「煮こごりまで美味しい」",
  local: "年配のお客様の指名買いが根強い。切身で買いやすく。"
}, {
  name: "パンガシウス",
  kana: "ぱんがしうす",
  months: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12],
  point: "東南アジア養殖の白身魚。骨なし・皮なしでクセがなく、フライ・ムニエルで子どもに食べさせやすい。低価格で通年安定。",
  cook: "フライ／ムニエル／ソテー／天ぷら",
  pop: "「骨なし白身でお子さまも安心」「フライにぴったり」",
  local: "「魚は骨が…」という声への答え。時短・簡便needsに。"
}, {
  name: "ホタルイカ",
  kana: "ほたるいか",
  months: [3, 4, 5],
  point: "春の風物詩。ボイルの酢味噌和えが定番で、沖漬け・炊き込みご飯など提案の幅も広い。春の売場の彩り役。",
  cook: "ボイル酢味噌／沖漬け／炊き込みご飯／パスタ",
  pop: "「春の便り ホタルイカ」「酢味噌でキュッと一杯」",
  local: "季節の入れ替わりを告げる商材。菜の花と関連陳列も春らしい。"
}, {
  name: "ハマグリ",
  kana: "はまぐり",
  months: [2, 3, 4],
  point: "ひな祭りの必需品。「貝殻がぴったり合うのは一対だけ＝良縁」の縁起で、お吸い物需要が集中する。焼きはまぐりも強い。",
  cook: "お吸い物／酒蒸し／焼きはまぐり／パスタ",
  pop: "「ひな祭りにははまぐりのお吸い物」「良縁を願う縁起物」",
  local: "3月3日前の1週間が勝負。縁起の由来POPが効く。"
}, {
  name: "ホンビノス貝",
  kana: "ほんびのすがい",
  months: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12],
  point: "出汁の濃さとお値打ち感で急成長中の貝。ハマグリより安く、酒蒸し・クラムチャウダー・BBQと洋和どちらもいける。",
  cook: "酒蒸し／クラムチャウダー／焼き貝／パスタ",
  pop: "「濃厚だしのホンビノス貝」「BBQの主役にどうぞ」",
  local: "「白ハマグリ」とも。ハマグリとの価格比較で値頃感が際立つ。"
}, {
  name: "牡蠣（真がき）",
  kana: "かき まがき",
  months: [11, 12, 1, 2, 3],
  point: "冬の主役。鍋・カキフライ・生食と用途が広く、加熱用と生食用の表示区分をはっきり見せるのが信頼の基本。",
  cook: "カキフライ／土手鍋／生食／蒸し牡蠣",
  pop: "「海のミルク 真がき入荷」「今夜はカキフライで決まり」",
  local: "夏の岩がきと冬の真がきで年間の牡蠣売場が完成する。"
}, {
  name: "鱈",
  kana: "たら",
  months: [12, 1, 2],
  point: "冬の鍋の王道白身。切身は鍋・ムニエル・ホイル焼きと万能で、白子は冬だけの宝物として別格の単価が取れる。",
  cook: "鍋／ムニエル／ホイル焼き／白子ポン酢",
  pop: "「鍋の王様 真だら」「冬だけのごちそう 白子入荷」",
  local: "白子は入荷したら必ず目立たせる。鍋つゆの関連陳列も。"
}, {
  name: "クエ",
  kana: "くえ",
  months: [11, 12, 1, 2],
  point: "「幻の高級魚」。上品な脂とゼラチン質の旨みで鍋の最高峰。入荷自体がニュースなので、予約や特別な日需要と組み合わせる。",
  cook: "クエ鍋／刺身／湯引き／あら炊き",
  pop: "「幻の高級魚クエ、入荷しました」「一年に一度の贅沢鍋」",
  local: "「本日入荷」の速報性が最大の武器。SNS映えする売場に。"
}, {
  name: "ヒラマサ",
  kana: "ひらまさ",
  months: [5, 6, 7, 8],
  point: "ブリ御三家（ブリ・カンパチ・ヒラマサ）の夏担当。ブリより上品な脂と強い歯ごたえで、夏に刺身が売れる青物。",
  cook: "刺身／カルパッチョ／照り焼き／漬け丼",
  pop: "「夏のブリ格 ヒラマサ」「歯ごたえ自慢の夏刺身」",
  local: "「夏はブリじゃなくヒラマサ」の一言で違いが伝わる。"
}, {
  name: "しらす",
  kana: "しらす",
  months: [4, 5, 9, 10],
  point: "春と秋の2度旬。釜揚げのふんわり感と手軽さで、丼・冷奴・パスタと毎日の食卓に入り込める。カルシウム訴求も鉄板。",
  cook: "しらす丼／冷奴／卵とじ／ペペロンチーノ",
  pop: "「ふんわり釜揚げしらす」「カルシウムたっぷり」",
  local: "ごはん・豆腐売場との関連販売で買い忘れを防ぐ。"
}, {
  name: "ばとう鯛（マトウダイ）",
  kana: "ばとうだい まとうだい",
  months: [11, 12, 1, 2],
  point: "島根で「バトウ」と呼ばれる冬の白身。フランスでは高級魚（サンピエール）でムニエルの定番。肝も美味しい通の魚。",
  cook: "刺身／ムニエル／煮付け／肝ポン酢",
  pop: "「山陰の冬の白身 バトウ」「フランスでは高級魚サンピエール」",
  local: "的のような模様が名の由来。島根の冬の隠れた名物。"
}];
function FishTab() {
  const [q, setQ] = useState("");
  const [openIdx, setOpenIdx] = useState(null);
  const nowM = new Date().getMonth() + 1;
  const inSeason = f => f.months.includes(nowM);
  const seasonAll = f => f.months.length >= 12;
  const nq = normJa(q);
  const list = FISH_DB.filter(f => !nq || normJa(f.name).includes(nq) || normJa(f.kana).includes(nq) || normJa(f.point).includes(nq)).sort((a, b) => (inSeason(b) && !seasonAll(b) ? 1 : 0) - (inSeason(a) && !seasonAll(a) ? 1 : 0));
  const mLabel = f => seasonAll(f) ? "通年" : f.months.join("・") + "月";
  return /*#__PURE__*/React.createElement("div", {
    className: "min-vh",
    style: {
      background: "var(--bg)"
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      background: "linear-gradient(180deg,#e7f1fa,#d3e5f4)",
      padding: "calc(env(safe-area-inset-top) + 20px) 16px 22px"
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      maxWidth: 600,
      margin: "0 auto"
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      color: "#1d3a57",
      fontSize: 18,
      fontWeight: 900
    }
  }, "魚図鑑"), /*#__PURE__*/React.createElement("div", {
    style: {
      color: "rgba(29,58,87,0.72)",
      fontSize: 12,
      marginTop: 2
    }
  }, "旬・売りポイント・調理・POPフレーズをまとめた鮮魚データベース"))), /*#__PURE__*/React.createElement("div", {
    style: {
      maxWidth: 600,
      margin: "0 auto",
      padding: "14px 16px 120px"
    }
  }, /*#__PURE__*/React.createElement("input", {
    value: q,
    onChange: e => setQ(e.target.value),
    placeholder: "魚の名前やキーワードで検索…",
    style: {
      width: "100%",
      boxSizing: "border-box",
      border: "1.5px solid var(--line)",
      borderRadius: 12,
      padding: "11px 14px",
      fontSize: 14,
      marginBottom: 12,
      background: "#fff"
    }
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "grid",
      gridTemplateColumns: "repeat(2, 1fr)",
      gap: 9
    }
  }, list.map(f => {
    const idx = FISH_DB.indexOf(f);
    const now = inSeason(f) && !seasonAll(f);
    return /*#__PURE__*/React.createElement("div", {
      key: f.name,
      onClick: () => setOpenIdx(idx),
      style: {
        background: "#fff",
        border: now ? "1.5px solid var(--primary)" : "1px solid var(--line)",
        borderRadius: 13,
        padding: "13px 12px",
        cursor: "pointer",
        position: "relative",
        minHeight: 92,
        display: "flex",
        flexDirection: "column"
      }
    }, now && /*#__PURE__*/React.createElement("span", {
      style: {
        position: "absolute",
        top: 8,
        right: 8,
        fontSize: 9,
        fontWeight: 900,
        color: "#fff",
        background: "var(--primary)",
        borderRadius: 6,
        padding: "2px 6px"
      }
    }, "今が旬"), /*#__PURE__*/React.createElement("div", {
      style: {
        fontSize: 15.5,
        fontWeight: 900,
        color: "var(--ink)",
        lineHeight: 1.3,
        marginBottom: 4
      }
    }, f.name), /*#__PURE__*/React.createElement("span", {
      style: {
        fontSize: 10,
        fontWeight: 800,
        color: "var(--sub)",
        background: "var(--chip)",
        borderRadius: 6,
        padding: "1px 7px",
        alignSelf: "flex-start",
        marginBottom: 6
      }
    }, mLabel(f)), /*#__PURE__*/React.createElement("div", {
      style: {
        fontSize: 11,
        color: "var(--sub)",
        lineHeight: 1.55,
        display: "-webkit-box",
        WebkitLineClamp: 2,
        WebkitBoxOrient: "vertical",
        overflow: "hidden"
      }
    }, f.point));
  })), list.length === 0 && /*#__PURE__*/React.createElement("div", {
    style: {
      textAlign: "center",
      color: "var(--faint)",
      padding: "30px 0",
      fontSize: 13
    }
  }, "見つかりませんでした"), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 11,
      color: "var(--faint)",
      textAlign: "center",
      marginTop: 12,
      lineHeight: 1.7
    }
  }, "内容はAIが知識から書き下ろした参考情報です。", /*#__PURE__*/React.createElement("br", null), "追加したい魚や直したい内容があれば管理者へ。")), openIdx != null && FISH_DB[openIdx] && (() => {
    const f = FISH_DB[openIdx];
    const now = inSeason(f) && !seasonAll(f);
    return /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("div", {
      onClick: () => setOpenIdx(null),
      style: {
        position: "fixed",
        inset: 0,
        zIndex: 301,
        background: "rgba(0,0,0,0.4)"
      }
    }), /*#__PURE__*/React.createElement("div", {
      style: {
        position: "fixed",
        left: 0,
        right: 0,
        bottom: 0,
        zIndex: 302,
        background: "#fff",
        borderRadius: "22px 22px 0 0",
        boxShadow: "0 -8px 30px rgba(0,0,0,0.2)",
        animation: "sheetUp .28s cubic-bezier(.32,.72,.28,1)",
        padding: "10px 18px calc(24px + env(safe-area-inset-bottom))",
        maxHeight: "82vh",
        overflowY: "auto"
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        width: 40,
        height: 4.5,
        background: "var(--line)",
        borderRadius: 3,
        margin: "0 auto 14px"
      }
    }), /*#__PURE__*/React.createElement("div", {
      style: {
        display: "flex",
        alignItems: "center",
        gap: 9,
        marginBottom: 12
      }
    }, /*#__PURE__*/React.createElement("span", {
      style: {
        fontSize: 20,
        fontWeight: 900,
        color: "var(--ink)"
      }
    }, f.name), now && /*#__PURE__*/React.createElement("span", {
      style: {
        fontSize: 10.5,
        fontWeight: 900,
        color: "#fff",
        background: "var(--primary)",
        borderRadius: 7,
        padding: "2px 8px"
      }
    }, "今が旬"), /*#__PURE__*/React.createElement("span", {
      style: {
        fontSize: 11,
        fontWeight: 800,
        color: "var(--sub)",
        background: "var(--chip)",
        borderRadius: 6,
        padding: "2px 8px"
      }
    }, mLabel(f)), /*#__PURE__*/React.createElement("button", {
      onClick: () => setOpenIdx(null),
      style: {
        marginLeft: "auto",
        border: "none",
        background: "var(--chip)",
        color: "var(--text)",
        width: 32,
        height: 32,
        borderRadius: "50%",
        fontSize: 16,
        fontWeight: 800,
        cursor: "pointer"
      }
    }, "✕")), /*#__PURE__*/React.createElement("div", {
      style: {
        fontSize: 13,
        color: "var(--text)",
        lineHeight: 1.85
      }
    }, /*#__PURE__*/React.createElement("div", null, f.point), /*#__PURE__*/React.createElement("div", {
      style: {
        height: 1,
        background: "var(--line)",
        margin: "12px 0"
      }
    }), /*#__PURE__*/React.createElement("div", {
      style: {
        marginBottom: 8
      }
    }, /*#__PURE__*/React.createElement("b", {
      style: {
        color: "var(--ink)"
      }
    }, "🍳 調理・食べ方"), /*#__PURE__*/React.createElement("br", null), f.cook), /*#__PURE__*/React.createElement("div", {
      style: {
        marginBottom: 8
      }
    }, /*#__PURE__*/React.createElement("b", {
      style: {
        color: "var(--ink)"
      }
    }, "📝 POPフレーズ例"), /*#__PURE__*/React.createElement("br", null), /*#__PURE__*/React.createElement("span", {
      style: {
        color: "var(--soft-text)"
      }
    }, f.pop)), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("b", {
      style: {
        color: "var(--ink)"
      }
    }, "📍 山陰メモ"), /*#__PURE__*/React.createElement("br", null), f.local))));
  })());
}
;
Object.assign(window, {
  FISH_DB,
  FishTab
});