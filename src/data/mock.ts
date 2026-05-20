export type AnnouncementCategory =
  | "行政公告"
  | "班級通知"
  | "活動通知"
  | "午餐健康"
  | "榮譽榜"
  | "緊急通知";

export interface Announcement {
  id: string;
  title: string;
  category: AnnouncementCategory;
  date: string;
  summary: string;
  content: string;
  important?: boolean;
  attachmentUrl?: string;
  externalUrl?: string;
}

export interface SchoolEvent {
  id: string;
  title: string;
  date: string; // YYYY-MM-DD
  weekday: string;
  time: string;
  location: string;
  audience: string;
  category: "全校" | "班級" | "活動" | "放假" | "評量" | "社團";
  note?: string;
}

export interface Album {
  id: string;
  title: string;
  date: string;
  category: string;
  photoCount: number;
  coverImage: string;
  description: string;
  photos: string[];
}

export const announcements: Announcement[] = [
  {
    id: "a1",
    title: "畢業典禮彩排通知",
    category: "活動通知",
    date: "2026-05-18",
    summary: "六年級全體學生請於本週三上午8:00至活動中心進行彩排，請穿著運動服。",
    content:
      "親愛的家長您好：\n\n本校六年級畢業典禮將於下週五舉行。為使典禮順利進行，將於本週三（5/20）上午 8:00 於活動中心進行彩排，敬請六年級全體學生穿著乾淨運動服參加，並攜帶水壺。\n\n如有疑問，請洽教務處。",
    important: true,
    attachmentUrl: "#",
  },
  {
    id: "a2",
    title: "本週午餐菜單異動",
    category: "午餐健康",
    date: "2026-05-18",
    summary: "因食材調度，週四午餐將由咖哩雞調整為番茄義大利麵。",
    content: "因食材供應商調度，本週四（5/21）午餐主菜由咖哩雞飯調整為番茄肉醬義大利麵，配菜不變。造成不便敬請見諒。",
    important: false,
  },
  {
    id: "a3",
    title: "恭賀本校足球隊榮獲縣賽冠軍",
    category: "榮譽榜",
    date: "2026-05-16",
    summary: "本校足球隊於花蓮縣國小聯賽中榮獲冠軍，感謝師長與家長支持。",
    content: "本校足球隊於 2026 花蓮縣國小足球聯賽中,以全勝戰績榮獲冠軍!感謝教練團、家長後援會的支持。",
    important: false,
    externalUrl: "#",
  },
  {
    id: "a4",
    title: "颱風來襲停課應變通知",
    category: "緊急通知",
    date: "2026-05-15",
    summary: "若縣府宣布停課，學校將透過本 App 與班級群組同步通知。",
    content: "颱風季節將至,請家長留意縣府公告。若宣布停課,本校將於第一時間透過行動校園 App 及各班 Line 群組通知。",
    important: true,
  },
  {
    id: "a5",
    title: "五月份親職教育講座報名",
    category: "行政公告",
    date: "2026-05-12",
    summary: "主題:陪伴孩子走過青春期。歡迎家長報名參加。",
    content: "本校將於 5/28 (六) 上午 9:00 舉辦親職教育講座,主題「陪伴孩子走過青春期」,邀請王心怡心理師主講。",
    attachmentUrl: "#",
  },
  {
    id: "a6",
    title: "三年甲班校外教學行前說明",
    category: "班級通知",
    date: "2026-05-10",
    summary: "下週二將前往太魯閣國家公園,請攜帶水壺、雨具與便當。",
    content: "三年甲班將於下週二進行校外教學,請學生於 7:30 前到校。攜帶物品:水壺、雨具、便當、健保卡、零用金 200 元以內。",
  },
];

export const events: SchoolEvent[] = [
  { id: "e1", title: "全校晨會", date: "2026-05-18", weekday: "週一", time: "07:50-08:20", location: "操場", audience: "全校", category: "全校" },
  { id: "e2", title: "二年級健康檢查", date: "2026-05-19", weekday: "週二", time: "09:00-11:00", location: "健康中心", audience: "二年級", category: "全校" },
  { id: "e3", title: "畢業典禮彩排", date: "2026-05-20", weekday: "週三", time: "08:00-10:00", location: "活動中心", audience: "六年級", category: "活動", note: "請穿運動服" },
  { id: "e4", title: "英語朗讀比賽", date: "2026-05-21", weekday: "週四", time: "13:30-15:30", location: "視聽教室", audience: "三~六年級", category: "活動" },
  { id: "e5", title: "社團成果發表", date: "2026-05-22", weekday: "週五", time: "14:00-16:00", location: "活動中心", audience: "全校", category: "社團" },
  { id: "e6", title: "母親節感恩活動", date: "2026-05-08", weekday: "週五", time: "10:00-11:30", location: "穿堂", audience: "全校", category: "活動" },
  { id: "e7", title: "期末評量週", date: "2026-06-15", weekday: "週一", time: "全天", location: "各班教室", audience: "全校", category: "評量" },
  { id: "e8", title: "畢業典禮", date: "2026-06-19", weekday: "週五", time: "09:00-11:30", location: "活動中心", audience: "全校", category: "全校" },
  { id: "e9", title: "暑假開始", date: "2026-07-01", weekday: "週三", time: "全天", location: "—", audience: "全校", category: "放假" },
];

export const albums: Album[] = [
  {
    id: "al1",
    title: "114 學年度運動會",
    date: "2026-04-18",
    category: "運動會",
    photoCount: 48,
    coverImage: "/placeholder.svg",
    description: "全校師生齊聚操場,在山林間揮灑汗水,展現運動家精神。",
    photos: Array.from({ length: 12 }, () => "/placeholder.svg"),
  },
  {
    id: "al2",
    title: "太魯閣校外教學",
    date: "2026-04-10",
    category: "校外教學",
    photoCount: 32,
    coverImage: "/placeholder.svg",
    description: "三、四年級前往太魯閣國家公園,認識家鄉的山與河。",
    photos: Array.from({ length: 9 }, () => "/placeholder.svg"),
  },
  {
    id: "al3",
    title: "原住民族文化週",
    date: "2026-03-22",
    category: "民族教育",
    photoCount: 56,
    coverImage: "/placeholder.svg",
    description: "傳唱古調、編織體驗,孩子們在文化中找到自信與根。",
    photos: Array.from({ length: 12 }, () => "/placeholder.svg"),
  },
  {
    id: "al4",
    title: "足球社訓練紀實",
    date: "2026-03-15",
    category: "社團活動",
    photoCount: 24,
    coverImage: "/placeholder.svg",
    description: "風雨無阻的訓練,凝聚成縣賽冠軍的榮耀。",
    photos: Array.from({ length: 8 }, () => "/placeholder.svg"),
  },
  {
    id: "al5",
    title: "閱讀闖關活動",
    date: "2026-03-05",
    category: "班級活動",
    photoCount: 20,
    coverImage: "/placeholder.svg",
    description: "閱讀打開世界的窗,孩子們的眼睛閃閃發亮。",
    photos: Array.from({ length: 8 }, () => "/placeholder.svg"),
  },
  {
    id: "al6",
    title: "校園生活點滴",
    date: "2026-02-20",
    category: "校園生活",
    photoCount: 36,
    coverImage: "/placeholder.svg",
    description: "在山與海之間,記錄每一個專注、快樂、成長的瞬間。",
    photos: Array.from({ length: 9 }, () => "/placeholder.svg"),
  },
];

export const albumCategories = [
  "最新活動",
  "畢業典禮",
  "校外教學",
  "運動會",
  "社團活動",
  "民族教育",
  "班級活動",
  "校園生活",
];

export const todayInfo = {
  date: "2026年5月20日",
  weekday: "星期三",
  reminder: "請記得攜帶水壺與聯絡簿",
};

export const todayLunch = {
  main: "白飯",
  mainDish: "香滷雞腿",
  sideDishes: ["炒青菜", "玉米炒蛋"],
  soup: "海帶芽湯",
  fruit: "香蕉",
};

export const todayHighlights = {
  event: {
    title: "畢業典禮彩排",
    time: "08:00 活動中心",
    audience: "六年級全體",
  },
};

export const schoolFeatures = [
  { id: "f1", title: "民族教育", desc: "傳承太魯閣族文化與語言", icon: "Feather", tint: "accent" as const },
  { id: "f2", title: "山林教育", desc: "走入山林,認識家鄉土地", icon: "Mountain", tint: "primary" as const },
  { id: "f3", title: "足球社團", desc: "縣賽冠軍的小小選手", icon: "CircleDot", tint: "secondary" as const },
  { id: "f4", title: "閱讀教育", desc: "晨讀十分鐘,陪伴孩子成長", icon: "BookOpen", tint: "primary" as const },
];

export interface MoreItem {
  id: string;
  title: string;
  subtitle: string;
  icon: string;
}
export interface MoreGroup {
  id: string;
  title: string;
  items: MoreItem[];
}

export const moreGroups: MoreGroup[] = [
  {
    id: "school",
    title: "學校資訊",
    items: [
      { id: "intro", title: "學校介紹", subtitle: "認識三棧國小的故事", icon: "School" },
      { id: "teachers", title: "校長與師長", subtitle: "認識陪伴孩子的人", icon: "Users" },
      { id: "location", title: "交通位置", subtitle: "地址、交通方式", icon: "MapPin" },
      { id: "map", title: "校園地圖", subtitle: "認識校園環境", icon: "Map" },
    ],
  },
  {
    id: "parents",
    title: "親師服務",
    items: [
      { id: "leave", title: "請假聯絡", subtitle: "線上請假與聯絡導師", icon: "ClipboardEdit" },
      { id: "contact", title: "親師聯絡", subtitle: "與導師即時溝通", icon: "MessagesSquare" },
      { id: "forms", title: "表單下載", subtitle: "各項申請表單", icon: "FileDown" },
    ],
  },
  {
    id: "learning",
    title: "學生學習",
    items: [
      { id: "resources", title: "學習資源", subtitle: "課程補充與線上資源", icon: "GraduationCap" },
      { id: "reading", title: "閱讀專區", subtitle: "好書推薦與閱讀記錄", icon: "BookOpen" },
      { id: "videos", title: "影片教材", subtitle: "精選教學影片", icon: "PlayCircle" },
    ],
  },
  {
    id: "life",
    title: "生活資訊",
    items: [
      { id: "menu", title: "午餐菜單", subtitle: "每週菜單一目了然", icon: "Utensils" },
      { id: "health", title: "健康中心", subtitle: "健康資訊與保健", icon: "HeartPulse" },
      { id: "emergency", title: "緊急聯絡", subtitle: "重要連絡電話", icon: "PhoneCall" },
    ],
  },
  {
    id: "system",
    title: "系統",
    items: [
      { id: "settings", title: "設定", subtitle: "通知、字級、偏好", icon: "Settings" },
      { id: "about", title: "關於本 App", subtitle: "版本 1.0.0", icon: "Info" },
    ],
  },
];

export const schoolInfo = {
  name: "三棧國民小學",
  phone: "03-8611025",
  phoneTel: "038611025",
  address: "花蓮縣秀林鄉三棧村",
  officeHours: "週一至週五 08:00-16:00",
  email: "school@example.edu.tw",
  mapText: "開啟地圖",
  mapUrl: "https://www.google.com/maps/search/?api=1&query=花蓮縣秀林鄉三棧村",
};

export interface WeeklyLunch {
  weekday: string;
  label: string;
  main: string;
  sides: string;
  soup: string;
  fruit: string;
  isToday?: boolean;
}

export const weeklyLunch: WeeklyLunch[] = [
  { weekday: "週一", label: "星期一", main: "香滷雞腿", sides: "炒青菜、玉米炒蛋", soup: "海帶芽湯", fruit: "香蕉" },
  { weekday: "週二", label: "星期二", main: "番茄肉醬義大利麵", sides: "燙花椰菜、滷豆干", soup: "玉米濃湯", fruit: "蘋果" },
  { weekday: "週三", label: "星期三", main: "香滷雞腿", sides: "炒青菜、玉米炒蛋", soup: "海帶芽湯", fruit: "香蕉", isToday: true },
  { weekday: "週四", label: "星期四", main: "咖哩雞飯", sides: "涼拌小黃瓜、炒高麗菜", soup: "味噌湯", fruit: "芭樂" },
  { weekday: "週五", label: "星期五", main: "鮭魚飯", sides: "清炒豆芽菜、蒸南瓜", soup: "紫菜蛋花湯", fruit: "西瓜" },
];

export const nutritionTip =
  "每餐請搭配蔬菜與湯品，幫助孩子均衡攝取營養。若有食物過敏，請提前告知導師與午餐秘書。";

export const leaveProcess = [
  "家長先通知導師",
  "說明學生姓名、班級、請假日期與原因",
  "如需病假，請保留相關證明",
  "回校後依學校規定完成請假程序",
];

export const leaveDocuments = [
  "學生姓名與班級",
  "請假日期與時段",
  "請假原因說明",
  "病假相關證明（如適用）",
];

export const contactTopics = [
  { title: "學生請假", desc: "請先聯絡導師，再依規定補辦手續" },
  { title: "課務與活動", desc: "洽教務處或活動承辦老師" },
  { title: "午餐與健康", desc: "洽總務處午餐秘書、護理師" },
  { title: "交通與接送", desc: "洽導師或總務處" },
];

export const schoolIntroSections = [
  {
    title: "學校簡介",
    content:
      "花蓮縣秀林鄉三棧國小，座落於山海之間的部落校園。我們陪伴孩子在安全、溫暖的環境中學習成長，也重視與家長的密切合作。",
  },
  {
    title: "校園特色",
    content:
      "結合閱讀、運動與藝文活動，讓孩子在多元體驗中發掘興趣。足球社、閱讀闖關與戶外探索，都是孩子最期待的校園時光。",
  },
  {
    title: "山林與部落文化",
    content:
      "我們帶孩子認識家鄉的山林與河流，也透過原住民族教育，傳承太魯閣族語言、歌謠與文化，讓孩子以自信擁抱自己的根。",
  },
  {
    title: "學校願景",
    content:
      "培育具文化認同、關懷土地、勇於探索的孩子。在山海與文化的懷抱中，成為懂得尊重、願意付出的小小公民。",
  },
];

export const locationInfo = {
  address: schoolInfo.address,
  transport: [
    "由花蓮市區沿台九線北上，經秀林鄉往三棧方向即可抵達。",
    "建議自行開車或搭乘學校交通車，山區道路請留意天候與行車安全。",
    `如需詳細路線，可點選下方「${schoolInfo.mapText}」查看。`,
  ],
  landmarks: [
    "鄰近三棧溪與太魯閣國家公園",
    "秀林鄉公所、部落社區附近",
    "校園周邊為山林與部落聚落風貌",
  ],
};

export interface FormItem {
  id: string;
  title: string;
  desc: string;
}

export const downloadForms: FormItem[] = [
  { id: "f1", title: "學生請假單", desc: "事假、病假、公假申請使用" },
  { id: "f2", title: "校外教學同意書", desc: "校外教學行前必備文件" },
  { id: "f3", title: "獎助學金申請表", desc: "經濟弱勢學生助學申請" },
  { id: "f4", title: "學生基本資料更新表", desc: "聯絡方式、緊急聯絡人異動" },
  { id: "f5", title: "家長志工報名表", desc: "歡迎家長參與校園活動協助" },
];

export const moreItemRoutes: Record<string, string> = {
  intro: "/school-intro",
  location: "/location",
  leave: "/contact",
  forms: "/forms",
  menu: "/lunch",
};
