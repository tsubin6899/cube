"use client";

import { useEffect, useMemo, useRef, useState } from "react";

type Level = 1 | 2 | 3;
type Eligibility = "birthday" | "family";

type MerchantGroup = {
  planId: string;
  plan: string;
  category: string;
  merchants: string[];
  aliases?: string[];
  rate?: number;
  levelRate?: true;
  eligibility?: Eligibility;
  note: string;
  priority?: number;
};

type SearchResult = {
  group: MerchantGroup;
  matched: string;
  score: number;
  rate: number;
  eligible: boolean;
};

const OFFICIAL_URL =
  "https://www.cathay-cube.com.tw/cathaybk/personal/product/credit-card/cards/cube-list";

const levelRates: Record<Level, number> = { 1: 2, 2: 3, 3: 3.3 };

const levels: Array<{ id: Level; title: string; detail: string }> = [
  { id: 1, title: "Level 1", detail: "新卡基本" },
  { id: 2, title: "Level 2", detail: "繳卡費升級" },
  { id: 3, title: "Level 3", detail: "財管貴賓" },
];

const merchantGroups: MerchantGroup[] = [
  {
    planId: "formosa",
    plan: "台塑家",
    category: "指定加油站",
    merchants: ["台塑石油", "台亞加油站", "福懋加油站", "統一速邁樂加油站"],
    aliases: ["台塑加油", "台亞", "福懋", "速邁樂"],
    rate: 2,
    note: "請用實體 CUBE 卡或 Apple Pay／Google Pay／Samsung Pay；第三方掃碼支付不適用。",
    priority: 2,
  },
  {
    planId: "formosa",
    plan: "台塑家",
    category: "台塑健康生活",
    merchants: ["台塑生醫", "長庚生技", "台塑蔬菜", "台塑購物網"],
    rate: 2,
    note: "實體門市或指定官網適用，最終依刷卡簽單特店名稱認定。",
  },
  {
    planId: "formosa",
    plan: "台塑家",
    category: "指定超商",
    merchants: ["7-ELEVEN", "全家便利商店", "萊爾富"],
    aliases: ["7-11", "7 eleven", "全家", "Hi-Life"],
    rate: 2,
    note: "限實體門市；菸酒、代收代售、禮券等通常不列入。",
  },
  {
    planId: "allpay",
    plan: "全支付",
    category: "全支付消費",
    merchants: ["全聯福利中心", "大全聯", "全支付國內合作通路"],
    aliases: ["全聯", "PX Mart", "PXPay Plus", "大潤發", "RT-Mart", "全支付"],
    rate: 2,
    note: "必須切換全支付方案，並以全支付綁定 CUBE 卡付款；儲值、繳費、跨境支付等排除。",
    priority: 1,
  },
  {
    planId: "digital",
    plan: "玩數位",
    category: "AI 工具",
    merchants: [
      "ChatGPT",
      "Canva",
      "Claude",
      "Cursor",
      "Duolingo",
      "Gamma",
      "Gemini",
      "Notion",
      "Perplexity",
      "Speak",
    ],
    aliases: ["OpenAI", "Anthropic", "Google Gemini", "多鄰國"],
    levelRate: true,
    note: "限指定平台直接刷 CUBE 卡；若經第三方支付，可能只剩一般消費 0.3%。",
    priority: 3,
  },
  {
    planId: "digital",
    plan: "玩數位",
    category: "數位／串流平台",
    merchants: [
      "Apple 媒體服務",
      "Google Play",
      "Disney+",
      "Netflix",
      "Spotify",
      "YouTube Premium",
      "Max",
    ],
    aliases: ["Apple Music", "App Store", "YouTube", "HBO Max"],
    levelRate: true,
    note: "訂閱扣款日當天要維持玩數位；直接綁 CUBE 卡最穩妥。",
    priority: 3,
  },
  {
    planId: "digital",
    plan: "玩數位",
    category: "網購平台",
    merchants: ["蝦皮購物", "momo購物網", "PChome 24h購物", "小樹購"],
    aliases: ["蝦皮", "Shopee", "momo", "PChome", "24h"],
    levelRate: true,
    note: "PChome 與小樹購的儲值、電子票券等排除；分期只回饋一般消費 0.3%。",
    priority: 3,
  },
  {
    planId: "digital",
    plan: "玩數位",
    category: "國際電商",
    merchants: ["Coupang 酷澎", "淘寶", "天貓"],
    aliases: ["酷澎", "Coupang", "Taobao", "Tmall"],
    levelRate: true,
    note: "限官方指定平台；跨境交易仍可能另收國外交易手續費。",
  },
  {
    planId: "dining",
    plan: "樂饗購",
    category: "國內指定百貨",
    merchants: [
      "遠東SOGO百貨",
      "遠東Garden City",
      "新光三越",
      "遠東百貨",
      "台北101",
      "BELLAVITA",
      "微風廣場",
      "統一時代台北店",
      "誠品生活",
      "ATT 4 FUN",
      "京站",
      "美麗華",
      "NOKE忠泰樂生活",
      "大葉高島屋",
      "LaLaport",
      "宏匯廣場",
      "台茂購物中心",
      "大江國際購物中心",
      "遠東巨城",
      "中友百貨",
      "廣三SOGO",
      "南紡購物中心",
      "耐斯廣場",
      "夢時代",
      "漢神百貨",
      "漢神巨蛋",
      "新月廣場",
      "CITYLINK",
      "秀泰生活",
      "環球購物中心",
      "太平洋百貨",
      "華泰名品城",
      "SKM Park",
      "MITSUI OUTLET PARK",
    ],
    aliases: ["SOGO", "三越", "百貨", "百貨公司", "巨城", "三井Outlet", "三井LaLaport"],
    levelRate: true,
    note: "店中櫃不一定算百貨消費，請以刷卡簽單特店名稱為準。",
    priority: 2,
  },
  {
    planId: "dining",
    plan: "樂饗購",
    category: "國內餐飲",
    merchants: [
      "國內餐廳",
      "麥當勞",
      "SUBWAY",
      "50嵐",
      "麻古茶坊",
      "八方雲集",
      "拉亞漢堡",
      "% Arabica",
      "黑沃咖啡",
      "六扇門",
    ],
    aliases: ["餐廳", "餐飲", "咖啡", "手搖飲", "早餐店", "速食", "美食"],
    levelRate: true,
    note: "國內餐飲原則適用，但餐券、部分商場店中櫃或特店分類不符時可能不算。",
    priority: 2,
  },
  {
    planId: "dining",
    plan: "樂饗購",
    category: "外送平台",
    merchants: ["Uber Eats", "foodpanda"],
    aliases: ["UberEats", "熊貓外送", "外送"],
    levelRate: true,
    note: "請直接在指定外送平台綁定 CUBE 卡付款。",
    priority: 3,
  },
  {
    planId: "dining",
    plan: "樂饗購",
    category: "國內藥妝",
    merchants: ["康是美", "屈臣氏"],
    aliases: ["COSMED", "Watsons", "藥妝"],
    levelRate: true,
    note: "限國內指定藥妝；分期交易僅有一般消費 0.3%。",
  },
  {
    planId: "travel",
    plan: "趣旅行",
    category: "海外實體消費",
    merchants: ["海外實體商店", "海外餐廳", "海外飯店到店付款"],
    aliases: ["國外刷卡", "海外消費", "國外餐廳", "國外飯店"],
    levelRate: true,
    note: "適用海外實體交易；國外交易手續費仍依信用卡條款計收。",
    priority: 2,
  },
  {
    planId: "travel",
    plan: "趣旅行",
    category: "日本指定遊樂園",
    merchants: ["東京迪士尼樂園", "東京華納兄弟哈利波特影城", "大阪環球影城"],
    aliases: ["東京迪士尼", "Disneyland", "哈利波特影城", "USJ", "環球影城"],
    levelRate: true,
    note: "限指定遊樂園的符合交易；若透過旅行社購票，依實際請款特店判定。",
  },
  {
    planId: "travel",
    plan: "趣旅行",
    category: "國內外交通",
    merchants: [
      "Apple錢包交通卡",
      "SUICA",
      "PASMO",
      "ICOCA",
      "Uber",
      "Grab",
      "台灣高鐵",
      "yoxi",
      "台灣大車隊",
      "iRent",
      "和運租車",
      "格上租車",
    ],
    aliases: ["西瓜卡", "高鐵", "叫車", "交通", "租車"],
    levelRate: true,
    note: "叫車限短程服務；機場接送、代駕、長租與訂閱租賃等排除。",
    priority: 3,
  },
  {
    planId: "travel",
    plan: "趣旅行",
    category: "指定航空公司",
    merchants: [
      "中華航空",
      "長榮航空",
      "星宇航空",
      "台灣虎航",
      "國泰航空",
      "樂桃航空",
      "阿聯酋航空",
      "酷航",
      "捷星航空",
      "日本航空",
      "ANA全日空",
      "亞洲航空",
      "聯合航空",
      "新加坡航空",
      "越捷航空",
      "大韓航空",
      "達美航空",
      "土耳其航空",
      "卡達航空",
      "法國航空",
    ],
    aliases: ["華航", "長榮", "星宇", "虎航", "機票", "航空公司", "JAL", "ANA"],
    levelRate: true,
    note: "限航空公司官網、App 或臨櫃購票；旅行社、機上商品、里程附加費等不算。",
    priority: 2,
  },
  {
    planId: "travel",
    plan: "趣旅行",
    category: "指定飯店住宿",
    merchants: ["星野集團", "全球迪士尼飯店", "東橫INN", "國內飯店住宿"],
    aliases: ["Hoshino", "Disney Hotel", "Toyoko Inn", "飯店官網", "住宿"],
    levelRate: true,
    note: "限飯店臨櫃或官網直接刷卡，且需符合住宿特店分類；旅行社代訂不算此類。",
  },
  {
    planId: "travel",
    plan: "趣旅行",
    category: "旅遊／訂房平台",
    merchants: ["KKday", "Klook", "Agoda", "Airbnb", "Booking.com", "Trip.com", "ezTravel易遊網"],
    aliases: ["易遊網", "Booking", "訂房網", "訂房平台"],
    levelRate: true,
    note: "部分平台會延遲授權或扣款，建議在預計扣款日前後都維持趣旅行。",
    priority: 3,
  },
  {
    planId: "travel",
    plan: "趣旅行",
    category: "指定旅行社",
    merchants: [
      "雄獅旅遊",
      "可樂旅遊",
      "東南旅遊",
      "五福旅遊",
      "燦星旅遊",
      "山富旅遊",
      "長汎假期",
      "鳳凰旅行社",
      "Ezfly易飛網",
      "理想旅遊",
      "永利旅行社",
      "三賀旅行社",
    ],
    aliases: ["旅行社", "雄獅", "可樂", "東南", "五福", "山富", "易飛網"],
    levelRate: true,
    note: "限指定旅行社直營通路；加盟店與旗下子公司可能不適用。",
  },
  {
    planId: "select",
    plan: "集精選",
    category: "充電站",
    merchants: ["U-POWER", "EVOASIS", "EVALUE", "TAIL", "iCharging"],
    aliases: ["電動車充電", "充電樁", "充電站"],
    rate: 2,
    note: "指定充電站適用，包含部分經綠界或藍新支付的交易。",
  },
  {
    planId: "select",
    plan: "集精選",
    category: "停車費",
    merchants: ["車麻吉", "uTagGo"],
    aliases: ["停車", "停車費"],
    rate: 2,
    note: "車麻吉排除加油、充電；uTagGo 排除月租停車。",
  },
  {
    planId: "select",
    plan: "集精選",
    category: "量販超市",
    merchants: ["家樂福", "LOPIA台灣", "全聯福利中心"],
    aliases: ["Carrefour", "LOPIA", "全聯", "PX Mart", "超市", "量販"],
    rate: 2,
    note: "全聯限實體門市且不含大全聯；PX Pay 店內消費可適用，排除菸酒、代收、禮券。",
    priority: 2,
  },
  {
    planId: "select",
    plan: "集精選",
    category: "指定加油",
    merchants: ["台灣中油直營站"],
    aliases: ["中油直營", "中油", "CPC", "加油"],
    rate: 2,
    note: "只限台灣中油直營站；加盟站不保證符合。",
    priority: 2,
  },
  {
    planId: "select",
    plan: "集精選",
    category: "指定超商",
    merchants: ["7-ELEVEN", "全家便利商店"],
    aliases: ["7-11", "7 eleven", "全家", "超商", "便利商店"],
    rate: 2,
    note: "實體門市適用；OPEN 錢包、My FamiPay 店內消費可算，排除菸酒、代收與禮券。",
    priority: 2,
  },
  {
    planId: "select",
    plan: "集精選",
    category: "生活家居",
    merchants: ["IKEA宜家家居"],
    aliases: ["IKEA", "宜家"],
    rate: 2,
    note: "以指定 IKEA 特店直接付款為準；分期僅回饋一般消費 0.3%。",
  },
  {
    planId: "birthday",
    plan: "慶生月",
    category: "生日精選餐廳 10%",
    merchants: [
      "火火燒肉販賣所",
      "澄居烤物燒肉",
      "鳥苑",
      "豐生茶館",
      "做茶菜",
      "稻鎮經典台灣菜",
      "所 SUO",
      "嵩 sung",
      "JAI 宅",
      "Another Eatery",
      "The other Eatery",
      "輝室",
      "鯡魚工作室",
      "三點三",
      "KOMBOI",
      "好嶼 HOSU",
      "肉料理福",
      "澀 Sur-",
      "UNCLE SHAWN",
      "竣師父牛肉麵",
      "UNCLE RAY",
      "陳阿姨火鍋灶咖",
      "蜀叔麻辣鍋",
      "Pastaio",
      "二本松涮涮屋",
      "春囍打邊爐",
      "有你真好湘菜沙龍",
      "髙 GAO Taipei",
      "法國的秘密甜點",
      "creammm.t",
      "Fake Sober",
    ],
    rate: 10,
    eligibility: "birthday",
    note: "限生日當月、指定門市與付款方式；百貨／飯店／商場內門市通常排除。",
    priority: 4,
  },
  {
    planId: "birthday",
    plan: "慶生月",
    category: "娛樂 10%",
    merchants: [
      "東京迪士尼樂園",
      "大阪環球影城",
      "PlayStation",
      "Nintendo",
      "巴哈姆特動畫瘋",
      "錢櫃KTV",
      "好樂迪KTV",
      "星聚點KTV",
      "享溫馨KTV",
    ],
    aliases: ["USJ", "Switch", "PS5", "動畫瘋", "錢櫃", "好樂迪", "KTV"],
    rate: 10,
    eligibility: "birthday",
    note: "僅生日當月可切換慶生月方案；各指定通路仍有門市與交易限制。",
    priority: 4,
  },
  {
    planId: "birthday",
    plan: "慶生月",
    category: "生日購物／旅遊 3.5%",
    merchants: ["新光三越", "Uber Eats", "Klook", "FunNow"],
    rate: 3.5,
    eligibility: "birthday",
    note: "限符合資格的生日當月；新光三越不含 SKM Park Outlets 高雄草衙。",
    priority: 4,
  },
  {
    planId: "family",
    plan: "童樂匯",
    category: "保費 1%",
    merchants: ["國內壽險保費", "國內產險保費"],
    aliases: ["保險", "保費", "壽險", "產險"],
    rate: 1,
    eligibility: "family",
    note: "需先解鎖童樂匯；0 利率分期、第三方支付與部分國泰人壽保費排除。",
  },
  {
    planId: "family",
    plan: "童樂匯",
    category: "指定私校學費 1%",
    merchants: [
      "台北美國學校",
      "台北歐洲學校",
      "道明外僑學校",
      "馬禮遜學校",
      "康乃薾美國學校",
      "立人國際國小",
      "康橋國際學校",
      "華盛頓小學",
      "復興實驗高中",
      "維多利亞雙語中小學",
      "高雄美國學校",
    ],
    aliases: ["私校學費", "學費", "i繳費"],
    rate: 1,
    eligibility: "family",
    note: "限指定學校並透過 i繳費平台完成付款。",
  },
  {
    planId: "family",
    plan: "童樂匯",
    category: "親子餐廳 5%",
    merchants: [
      "台灣壽司郎",
      "雞湯大叔",
      "陶板屋",
      "YAYOI彌生軒",
      "大戶屋",
      "甲蟲秘境",
      "大樹先生的家",
      "Money Jump",
      "媽妳講親子餐廳",
      "小島3.5度親子餐廳",
    ],
    aliases: ["壽司郎", "彌生軒", "親子餐廳"],
    rate: 5,
    eligibility: "family",
    note: "需先解鎖童樂匯；部分品牌限街邊店或指定結帳方式，商場店通常排除。",
    priority: 4,
  },
  {
    planId: "family",
    plan: "童樂匯",
    category: "親子育樂 5%",
    merchants: [
      "Klook",
      "東京迪士尼樂園",
      "大阪環球影城",
      "麗寶樂園",
      "六福村主題樂園",
      "九族文化村",
      "劍湖山世界",
      "義大遊樂世界",
      "小叮噹科學園區",
      "Xpark",
      "巧虎夢想樂園",
    ],
    aliases: ["USJ", "遊樂園", "六福村", "九族", "劍湖山", "Xpark"],
    rate: 5,
    eligibility: "family",
    note: "多數遊樂園限現場或官網購票；Xpark 限館內人工櫃台。",
    priority: 4,
  },
  {
    planId: "family",
    plan: "童樂匯",
    category: "親子飯店 5%",
    merchants: [
      "台北喜來登大飯店",
      "蘭城晶英酒店",
      "台南晶英酒店",
      "礁溪寒沐酒店",
      "大溪笠復威斯汀",
      "煙波大飯店新竹湖濱館",
      "麗寶福容大飯店",
      "雲品溫泉酒店",
      "和逸飯店",
      "義大皇家酒店",
      "高雄萬豪酒店",
      "墾丁凱撒大飯店",
      "花蓮遠雄悅來大飯店",
      "瑞穗天合國際觀光酒店",
      "六福莊",
      "礁溪鳳凰酒店",
      "名人堂花園大飯店",
    ],
    aliases: ["親子飯店"],
    rate: 5,
    eligibility: "family",
    note: "限飯店官網直接訂房；旅行社與訂房平台、婚宴、館內餐廳等排除。",
  },
  {
    planId: "family",
    plan: "童樂匯",
    category: "母嬰用品店 5%",
    merchants: [
      "卡多摩嬰童館",
      "媽咪愛",
      "樂兒屋",
      "寶齡婦幼館",
      "步步樂BuBuLuv",
      "安琪兒婦嬰百貨",
      "宜兒樂",
      "麗兒采家",
      "Taobaby濤寶日記",
      "俏媽咪",
      "媽媽好",
    ],
    aliases: ["母嬰", "婦嬰", "嬰兒用品"],
    rate: 5,
    eligibility: "family",
    note: "一歲以下嬰幼兒奶粉與藥品排除；百貨、商場內門市通常不適用。",
  },
  {
    planId: "family",
    plan: "童樂匯",
    category: "五感體驗課 10%",
    merchants: [
      "朱宗慶打擊樂教學系統",
      "雲門舞集舞蹈教室",
      "Yamaha音樂教室",
      "TutorABC Junior",
      "Etalking Kids",
      "iSKI滑雪俱樂部",
      "汐游寶寶",
      "風城游汐谷",
    ],
    aliases: ["朱宗慶", "雲門", "Yamaha", "兒童課程", "親子課程"],
    rate: 10,
    eligibility: "family",
    note: "限教學課程；展演門票、教材、教具與場地租借等排除，部分教室不適用。",
    priority: 4,
  },
  {
    planId: "family",
    plan: "童樂匯",
    category: "嬰幼童品牌官網 10%",
    merchants: ["10mois", "Mamas&Papas", "古北町", "Little Wonders", "Seahorse Originals"],
    aliases: ["嬰幼童品牌", "童裝", "嬰兒品牌"],
    rate: 10,
    eligibility: "family",
    note: "僅限台灣官網消費，不含百貨、商場或其他平台。",
    priority: 4,
  },
];

const planSummaries = [
  { id: "digital", name: "玩數位", scope: "AI、串流、網購、國際電商", levelRate: true, period: "2026/1/1–12/31" },
  { id: "dining", name: "樂饗購", scope: "國內餐飲、百貨、外送、藥妝", levelRate: true, period: "2026/1/1–12/31" },
  { id: "travel", name: "趣旅行", scope: "海外、交通、航空、訂房、旅行社", levelRate: true, period: "2026/1/1–12/31" },
  { id: "select", name: "集精選", scope: "超市、超商、中油、停車、充電、IKEA", rate: 2, period: "2026/1/1–12/31" },
  { id: "allpay", name: "全支付", scope: "以全支付綁 CUBE 卡付款", rate: 2, period: "2026/4/22–12/31" },
  { id: "formosa", name: "台塑家", scope: "台塑加油、健康生活、指定超商", rate: 2, period: "2026/6/1–12/31" },
  { id: "birthday", name: "慶生月", scope: "當季壽星指定餐飲、娛樂與購物", rateLabel: "3.5–10%", period: "2026/7/1–9/30" },
  { id: "family", name: "童樂匯", scope: "保費、學費、親子餐旅、課程與母嬰", rateLabel: "1–10%", period: "2026/7/1–12/31" },
];

const popularSearches = ["全聯", "Netflix", "Uber", "7-11"];
const categorySearches = ["國內餐廳", "百貨", "網購", "交通", "超商", "加油"];

function normalize(value: string) {
  return value
    .toLocaleLowerCase("zh-Hant")
    .replace(/[\s\-_.()（）/／·・]/g, "");
}

function getRate(group: MerchantGroup, level: Level) {
  return group.levelRate ? levelRates[level] : group.rate ?? 0.3;
}

function findBestMatch(group: MerchantGroup, query: string) {
  const normalizedQuery = normalize(query);
  const candidates = [...group.merchants, ...(group.aliases ?? []), group.category, group.plan];
  let best = { score: 0, matched: group.merchants[0] };

  for (const candidate of candidates) {
    const normalizedCandidate = normalize(candidate);
    let score = 0;
    if (normalizedCandidate === normalizedQuery) score = 120;
    else if (normalizedCandidate.startsWith(normalizedQuery)) score = 92;
    else if (normalizedCandidate.includes(normalizedQuery)) score = 78;
    else if (normalizedQuery.includes(normalizedCandidate) && normalizedCandidate.length > 1) score = 64;
    if (score > best.score) best = { score, matched: candidate };
  }

  return best;
}

function eligibilityLabel(kind?: Eligibility) {
  if (kind === "birthday") return "需為生日當月";
  if (kind === "family") return "需已解鎖童樂匯";
  return "一般卡友可用";
}

export default function Home() {
  const [query, setQuery] = useState("");
  const [level, setLevel] = useState<Level>(1);
  const [birthday, setBirthday] = useState(false);
  const [family, setFamily] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [expandedPlan, setExpandedPlan] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const savedLevel = Number(window.localStorage.getItem("cube-level"));
    if (savedLevel === 1 || savedLevel === 2 || savedLevel === 3) setLevel(savedLevel);
    setBirthday(window.localStorage.getItem("cube-birthday") === "true");
    setFamily(window.localStorage.getItem("cube-family") === "true");
  }, []);

  useEffect(() => {
    window.localStorage.setItem("cube-level", String(level));
    window.localStorage.setItem("cube-birthday", String(birthday));
    window.localStorage.setItem("cube-family", String(family));
  }, [birthday, family, level]);

  const results = useMemo<SearchResult[]>(() => {
    if (!query.trim()) return [];
    return merchantGroups
      .map((group) => {
        const match = findBestMatch(group, query);
        const eligible =
          group.eligibility === "birthday"
            ? birthday
            : group.eligibility === "family"
              ? family
              : true;
        return {
          group,
          matched: match.matched,
          score: match.score,
          rate: getRate(group, level),
          eligible,
        };
      })
      .filter((result) => result.score > 0)
      .sort((a, b) => {
        if (a.eligible !== b.eligible) return a.eligible ? -1 : 1;
        if (a.rate !== b.rate) return b.rate - a.rate;
        if (a.score !== b.score) return b.score - a.score;
        return (b.group.priority ?? 0) - (a.group.priority ?? 0);
      })
      .slice(0, 10);
  }, [birthday, family, level, query]);

  const eligibleResults = results.filter((result) => result.eligible);
  const bestRate = eligibleResults[0]?.rate;
  const bestResults = eligibleResults.filter((result) => result.rate === bestRate);
  const topResult = bestResults[0];

  function chooseSearch(value: string) {
    setQuery(value);
    window.setTimeout(() => inputRef.current?.focus(), 0);
  }

  return (
    <main>
      <section className="hero-shell" aria-labelledby="page-title">
        <div className="hero-glow hero-glow--one" aria-hidden="true" />
        <div className="hero-glow hero-glow--two" aria-hidden="true" />
        <div className="container hero-content">
          <header className="topbar">
            <a className="brand" href="#top" aria-label="CUBE 刷卡查首頁">
              <span className="brand-mark" aria-hidden="true">C</span>
              <span>CUBE 刷卡查</span>
            </a>
            <span className="freshness"><span aria-hidden="true" />2026 最新</span>
          </header>

          <div id="top" className="hero-copy">
            <p className="eyebrow">刷卡前，先查一下</p>
            <h1 id="page-title">現在該切哪個方案？</h1>
            <p className="hero-lead">輸入店家或平台，立即看最有利的 CUBE 回饋方案與付款提醒。</p>
          </div>

          <form className="search" role="search" onSubmit={(event) => event.preventDefault()}>
            <label className="sr-only" htmlFor="merchant-search">搜尋店家或平台</label>
            <span className="search-symbol" aria-hidden="true" />
            <input
              ref={inputRef}
              id="merchant-search"
              type="search"
              inputMode="search"
              autoComplete="off"
              enterKeyHint="search"
              placeholder="輸入店家，例如：全聯、Netflix、Uber"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
            />
            {query && (
              <button className="clear-button" type="button" onClick={() => setQuery("")} aria-label="清除搜尋">
                清除
              </button>
            )}
          </form>

          <div className="popular-row" aria-label="熱門搜尋">
            <span>熱門</span>
            <div className="chip-row">
              {popularSearches.map((item) => (
                <button
                  className="chip"
                  type="button"
                  key={item}
                  aria-pressed={query === item}
                  onClick={() => chooseSearch(item)}
                >
                  {item}
                </button>
              ))}
            </div>
          </div>

          <div className="profile-bar">
            <div>
              <span className="profile-label">目前試算</span>
              <strong>Level {level}</strong>
              {(birthday || family) && (
                <span className="special-count">＋{Number(birthday) + Number(family)} 項特殊資格</span>
              )}
            </div>
            <button type="button" className="profile-button" onClick={() => setShowSettings((value) => !value)}>
              {showSettings ? "收起設定" : "調整資格"}
            </button>
          </div>

          {showSettings && (
            <div className="settings-panel">
              <fieldset>
                <legend>你的 CUBE 權益等級</legend>
                <div className="level-grid">
                  {levels.map((item) => (
                    <label className="level-option" key={item.id}>
                      <input
                        type="radio"
                        name="level"
                        value={item.id}
                        checked={level === item.id}
                        onChange={() => setLevel(item.id)}
                      />
                      <span><strong>{item.title}</strong><small>{item.detail}</small></span>
                    </label>
                  ))}
                </div>
              </fieldset>
              <fieldset>
                <legend>特殊方案資格</legend>
                <div className="toggle-grid">
                  <label className="toggle-option">
                    <input type="checkbox" checked={birthday} onChange={(event) => setBirthday(event.target.checked)} />
                    <span><strong>本月壽星</strong><small>可切慶生月</small></span>
                  </label>
                  <label className="toggle-option">
                    <input type="checkbox" checked={family} onChange={(event) => setFamily(event.target.checked)} />
                    <span><strong>童樂匯</strong><small>已完成解鎖</small></span>
                  </label>
                </div>
              </fieldset>
              <p className="settings-note">設定只保存在這支手機，之後回來會自動沿用。</p>
            </div>
          )}
        </div>
      </section>

      <div className="container content-shell">
        <section className="result-section" aria-live="polite" aria-atomic="false">
          {!query.trim() ? (
            <div className="empty-result">
              <div className="empty-orbit" aria-hidden="true"><span /></div>
              <div>
                <p className="eyebrow">準備好了</p>
                <h2>搜尋一間店，答案馬上出現</h2>
                <p>也可以直接選常見消費類型：</p>
                <div className="category-row">
                  {categorySearches.map((item) => (
                    <button type="button" key={item} onClick={() => chooseSearch(item)}>{item}</button>
                  ))}
                </div>
              </div>
            </div>
          ) : results.length === 0 ? (
            <div className="no-result">
              <p className="eyebrow">還沒有直接對應</p>
              <h2>找不到「{query}」的指定通路</h2>
              <p>若它是一般國內餐廳，可先查「國內餐廳」；若仍不確定，通常只會有一般消費 0.3%。最終以特店名稱與分類為準。</p>
              <div className="category-row">
                {categorySearches.map((item) => (
                  <button type="button" key={item} onClick={() => chooseSearch(item)}>{item}</button>
                ))}
              </div>
            </div>
          ) : (
            <>
              <div className="answer-card">
                <div className={`answer-accent plan-${topResult?.group.planId ?? "select"}`} aria-hidden="true" />
                <div className="answer-body">
                  <div className="answer-topline">
                    <span>建議切換</span>
                    <span className="answer-query">{query}</span>
                  </div>
                  <div className="answer-main">
                    <div>
                      <p className="answer-caption">最有利方案</p>
                      <h2>{topResult?.group.plan}</h2>
                      <p className="answer-match">符合：{topResult?.matched} · {topResult?.group.category}</p>
                    </div>
                    <div className="rate-box">
                      <span>{topResult?.group.levelRate ? `Level ${level}` : "指定回饋"}</span>
                      <strong>{topResult?.rate}%</strong>
                    </div>
                  </div>
                  {bestResults.length > 1 && (
                    <div className="tie-note">
                      <strong>有 {bestResults.length} 個同為 {bestRate}% 的選擇</strong>
                      <span>可依今天其他消費一起決定；完整比較在下方。</span>
                    </div>
                  )}
                  <div className="payment-note">
                    <span className="checkmark" aria-hidden="true">✓</span>
                    <div>
                      <strong>刷前提醒</strong>
                      <p>{topResult?.group.note}</p>
                    </div>
                  </div>
                  <div className="switch-path">
                    <span>切換路徑</span>
                    <strong>CUBE App → CUBE 權益方案 → {topResult?.group.plan}</strong>
                  </div>
                </div>
              </div>

              <div className="comparison-head">
                <div>
                  <p className="eyebrow">完整比較</p>
                  <h2>所有符合方案</h2>
                </div>
                <span>{results.length} 筆結果</span>
              </div>

              <div className="result-list">
                {results.map((result, index) => (
                  <article
                    className={`result-item ${!result.eligible ? "is-locked" : ""}`}
                    key={`${result.group.planId}-${result.group.category}-${index}`}
                  >
                    <div className="result-plan-row">
                      <span className={`plan-dot plan-${result.group.planId}`} aria-hidden="true" />
                      <div>
                        <strong>{result.group.plan}</strong>
                        <span>{result.group.category}</span>
                      </div>
                      <div className="mini-rate">
                        <strong>{result.rate}%</strong>
                        <span>{result.group.levelRate ? `L${level}` : "指定"}</span>
                      </div>
                    </div>
                    <p className="match-line">符合「{result.matched}」</p>
                    <p className="result-note">{result.group.note}</p>
                    <span className={`eligibility ${result.eligible ? "is-ready" : "is-missing"}`}>
                      {result.eligible ? "可用" : "尚未啟用"} · {eligibilityLabel(result.group.eligibility)}
                    </span>
                  </article>
                ))}
              </div>
            </>
          )}
        </section>

        <section className="plan-section" aria-labelledby="plan-heading">
          <div className="section-heading">
            <div>
              <p className="eyebrow">2026 方案總覽</p>
              <h2 id="plan-heading">八種方案，一次看懂</h2>
            </div>
            <span>一般消費皆為 0.3%</span>
          </div>

          <div className="plan-grid">
            {planSummaries.map((plan) => {
              const open = expandedPlan === plan.id;
              const rateLabel = plan.levelRate
                ? `${levelRates[level]}%`
                : plan.rateLabel ?? `${plan.rate}%`;
              return (
                <article className={`plan-card plan-card--${plan.id}`} key={plan.id}>
                  <button
                    type="button"
                    className="plan-card-button"
                    aria-expanded={open}
                    onClick={() => setExpandedPlan(open ? null : plan.id)}
                  >
                    <span className="plan-index">{String(planSummaries.indexOf(plan) + 1).padStart(2, "0")}</span>
                    <span className="plan-title"><strong>{plan.name}</strong><small>{plan.scope}</small></span>
                    <span className="plan-rate"><strong>{rateLabel}</strong><small>{plan.levelRate ? `Level ${level}` : "指定"}</small></span>
                  </button>
                  {open && (
                    <div className="plan-detail">
                      <span>適用期間 {plan.period}</span>
                      <button type="button" onClick={() => chooseSearch(plan.name)}>查看此方案店家</button>
                    </div>
                  )}
                </article>
              );
            })}
          </div>
        </section>

        <section className="rules-section" aria-labelledby="rules-heading">
          <div className="section-heading compact">
            <div>
              <p className="eyebrow">刷前 10 秒檢查</p>
              <h2 id="rules-heading">三個最常踩雷的地方</h2>
            </div>
          </div>
          <div className="rule-grid">
            <article><span>01</span><strong>看授權日</strong><p>回饋依刷卡授權日的方案判定；延遲扣款平台要多留幾天。</p></article>
            <article><span>02</span><strong>避開分期</strong><p>指定特店分期交易通常只剩一般消費 0.3%。</p></article>
            <article><span>03</span><strong>確認付款方式</strong><p>多數指定回饋排除 LINE Pay、街口等第三方支付，例外以方案說明為準。</p></article>
          </div>
        </section>

        <footer className="footer">
          <div>
            <strong>CUBE 刷卡查</strong>
            <p>資料整理日：2026/7/15。此工具為快速查詢整理，實際回饋仍以國泰世華 CUBE App、刷卡授權資訊與官方公告為準。</p>
          </div>
          <a href={OFFICIAL_URL} target="_blank" rel="noreferrer">查看官方完整權益</a>
        </footer>
      </div>
    </main>
  );
}
