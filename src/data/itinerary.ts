// Imports removed as they are no longer used directly in the data object (we use string names now)


// --- Types ---
export type ActivityType = 'flight' | 'transport' | 'food' | 'sightseeing' | 'hotel' | 'conference' | 'other';

export interface Attachment {
    id: string;
    type: 'image' | 'link';
    url: string;
    label?: string;
}

export interface Activity {
    time: string;
    title: string;
    description: string;
    type: ActivityType;
    iconName?: string;
    tips?: string;
    location?: string;
    cost?: number;
    modifiedBy?: string;
    modifiedAt?: string;
    attachments?: Attachment[];
    walletItemId?: string;
    coordinates?: {
        lat: number;
        lng: number;
    };
}

export interface DayPlan {
    id: string;
    date: string;
    city: 'SF' | 'SLC' | 'SAN' | 'LA';
    cityLabel: string;
    title: string;
    summary: string;
    activities: Activity[];
}

// --- Data ---
// Version F-2
export const itineraryData: DayPlan[] = [
    // --- Day 1 ---
    {
        id: 'day1',
        date: '2026/05/21',
        city: 'SF',
        cityLabel: '舊金山',
        title: '抵達夜',
        summary: '搭乘星宇航空跨越換日線，抵達舊金山。\n\n🌤️ 天氣/穿搭：晚上偏涼，外套放隨身。',
        activities: [
            {
                time: '20:30',
                title: 'SFO 機場抵達',
                description: 'JX012 航班抵達。入境與領取行李。',
                type: 'flight',
                iconName: 'Plane',
                coordinates: { lat: 37.6213, lng: -122.3790 }
            },
            {
                time: '21:40',
                title: '前往市區 (BART)',
                description: '搭乘 BART 黃線從 SFO 到 Powell St 站 (約 30 分鐘)。',
                type: 'transport',
                iconName: 'Train',
                tips: '建議下載 Clipper Card 到手機 Wallet。'
            },
            {
                time: '22:45',
                title: 'Check-in & 休息',
                description: '入住 Union Square / Powell / Market St 附近飯店。',
                type: 'hotel',
                iconName: 'Moon',
                location: 'Union Square, San Francisco'
            }
        ]
    },
    // --- Day 2 ---
    {
        id: 'day2',
        date: '2026/05/22',
        city: 'SF',
        cityLabel: '舊金山',
        title: '單車攝影 & 經典地標',
        summary: '騎單車挑戰金門大橋，下午漫步九曲花街。\n\n🌤️ 天氣/穿搭：SF 風大偏涼/可能霧；防風外套＋長褲＋鏡頭擦拭布。',
        activities: [
            {
                time: '09:30',
                title: '租單車',
                description: '在 Marina / Crissy Field 附近租單車。',
                type: 'transport',
                iconName: 'Bike',
                tips: '【CAN BOOK LATER】現場租即可。'
            },
            {
                time: '10:00',
                title: 'Crissy Field',
                description: '拍攝金門大橋全景的最佳角度。',
                type: 'sightseeing',
                iconName: 'Camera',
                coordinates: { lat: 37.8040, lng: -122.4655 }
            },
            {
                time: '10:30',
                title: 'Warming Hut',
                description: '中途休息點，靠近橋下。',
                type: 'food',
                iconName: 'Coffee'
            },
            {
                time: '10:50',
                title: '騎上 Golden Gate Bridge',
                description: '騎行於橋上，拍攝紅色的橋塔線條。',
                type: 'sightseeing',
                iconName: 'Camera',
                coordinates: { lat: 37.8199, lng: -122.4783 }
            },
            {
                time: '11:20',
                title: 'Fort Point',
                description: '橋下的堡壘，拍攝壯觀的仰角。',
                type: 'sightseeing',
                iconName: 'Camera',
                coordinates: { lat: 37.8105, lng: -122.4770 }
            },
            {
                time: '12:15',
                title: 'Marina 午餐',
                description: '返回 Marina 區歸還單車並用餐。',
                type: 'food',
                iconName: 'Utensils'
            },
            {
                time: '14:00',
                title: '飯店休息',
                description: '回飯店備份照片、充電。',
                type: 'hotel',
                iconName: 'Moon'
            },
            {
                time: '16:30',
                title: 'Lombard St (九曲花街)',
                description: '拍攝彎曲街道與繡球花。',
                type: 'sightseeing',
                iconName: 'Camera',
                coordinates: { lat: 37.8021, lng: -122.4187 }
            },
            {
                time: '18:00',
                title: 'North Beach 晚餐',
                description: '在義大利區享用晚餐。',
                type: 'food',
                iconName: 'Utensils'
            }
        ]
    },
    // --- Day 3 ---
    {
        id: 'day3',
        date: '2026/05/23',
        city: 'SF',
        cityLabel: '舊金山/矽谷',
        title: '矽谷科技巡禮',
        summary: '南下造訪科技巨頭總部與史丹佛大學。\n\n🌤️ 天氣/穿搭：灣區白天舒服，仍建議短袖＋薄外套。',
        activities: [
            {
                time: '08:40',
                title: '前往矽谷 (Caltrain)',
                description: '搭乘 Caltrain 南下。',
                type: 'transport',
                iconName: 'Train'
            },
            {
                time: '09:40',
                title: 'Apple Park Visitor Center',
                description: '參觀遊客中心、AR 模型、買獨家 T-shirt。',
                type: 'sightseeing',
                iconName: 'ShoppingBag',
                location: 'Cupertino',
                coordinates: { lat: 37.3349, lng: -122.0090 }
            },
            {
                time: '11:20',
                title: 'Googleplex',
                description: '參觀 Android Statues 與訪客中心。',
                type: 'sightseeing',
                iconName: 'Camera',
                location: 'Mountain View',
                coordinates: { lat: 37.4220, lng: -122.0841 }
            },
            {
                time: '13:20',
                title: 'Stanford University',
                description: '漫步 Main Quad、迴廊與紀念教堂。',
                type: 'sightseeing',
                iconName: 'Briefcase',
                coordinates: { lat: 37.4275, lng: -122.1697 }
            },
            {
                time: '17:00',
                title: '返回舊金山',
                description: '搭乘 Caltrain 或 Uber 返回市區。',
                type: 'transport',
                iconName: 'Train'
            }
        ]
    },
    // --- Day 4 ---
    {
        id: 'day4',
        date: '2026/05/24',
        city: 'SF',
        cityLabel: '舊金山',
        title: '惡魔島與海灣',
        summary: '探訪傳奇監獄島，享受悠閒的海濱午後。\n\n🌤️ 天氣/穿搭：船上與島上更冷更風；外套必帶。',
        activities: [
            {
                time: '08:45',
                title: 'Pier 33 報到',
                description: '前往 33 號碼頭準備搭船。',
                type: 'transport',
                iconName: 'MapPin',
                tips: '【MUST BOOK EARLY】請務必攜帶護照換票。'
            },
            {
                time: '09:30',
                title: '惡魔島 (Alcatraz)',
                description: '登島參觀監獄，包含中文語音導覽。',
                type: 'sightseeing',
                iconName: 'Key',
                coordinates: { lat: 37.8270, lng: -122.4230 }
            },
            {
                time: '13:00',
                title: 'Ferry Building 午餐',
                description: '在渡輪大廈享用美食 (生蠔、漢堡、藍瓶咖啡)。',
                type: 'food',
                iconName: 'Utensils',
                coordinates: { lat: 37.7955, lng: -122.3937 }
            },
            {
                time: '15:00',
                title: '自由活動 / 休息',
                description: 'Embarcadero 散步或回飯店休息。',
                type: 'other',
                iconName: 'Coffee'
            }
        ]
    },
    // --- Day 5 ---
    {
        id: 'day5',
        date: '2026/05/25',
        city: 'SF',
        cityLabel: '舊金山',
        title: '二戰與棒球',
        summary: '參觀自由輪與體驗美國職棒大聯盟賽事。\n\n🌤️ 天氣/穿搭：海邊與球場偏涼；外套帶著。',
        activities: [
            {
                time: '10:00',
                title: 'SS Jeremiah O’Brien',
                description: '參觀二戰諾曼第登陸倖存的自由輪 (Pier 45/35)。',
                type: 'sightseeing',
                iconName: 'Ship',
                tips: '【CAN BOOK LATER】'
            },
            {
                time: '11:30',
                title: 'Embarcadero 午餐',
                description: '快速午餐，準備前往球場。',
                type: 'food',
                iconName: 'Utensils'
            },
            {
                time: '12:35',
                title: 'Oracle Park',
                description: '球場開門，提早入場拍攝美麗的海灣球場。',
                type: 'sightseeing',
                iconName: 'Camera',
                coordinates: { lat: 37.7786, lng: -122.3893 }
            },
            {
                time: '14:05',
                title: 'Giants 主場比賽',
                description: '觀賞舊金山巨人隊 MLB 賽事。',
                type: 'other',
                iconName: 'Trophy',
                tips: '【MUST BOOK EARLY】注意包包尺寸限制。'
            },
            {
                time: '18:30',
                title: '晚餐',
                description: 'Mission Bay 或返回 North Beach 用餐。',
                type: 'food',
                iconName: 'Utensils'
            }
        ]
    },
    // --- Day 6 ---
    {
        id: 'day6',
        date: '2026/05/26',
        city: 'SF',
        cityLabel: '舊金山',
        title: '對岸風情與經典夕陽',
        summary: 'Sausalito 小鎮漫遊、科學博物館與經典大橋拍攝。\n\n🌤️ 天氣/穿搭：黃昏風霧更明顯；防風保暖＋好走鞋＋擦拭布。',
        activities: [
            {
                time: '09:30',
                title: '前往 Ferry Building',
                description: '準備搭乘渡輪。',
                type: 'transport',
                iconName: 'MapPin'
            },
            {
                time: '10:30',
                title: 'Sausalito 小鎮',
                description: '搭渡輪抵達，享受悠閒的半日遊。',
                type: 'sightseeing',
                iconName: 'Sun',
                coordinates: { lat: 37.8591, lng: -122.4853 },
                tips: '【CAN BOOK LATER】可刷 Clipper Card。'
            },
            {
                time: '14:15',
                title: 'Exploratorium',
                description: '參觀探索館 (Pier 15)，體驗科學互動展品。',
                type: 'sightseeing',
                iconName: 'Lightbulb',
                tips: '【CAN BOOK LATER】'
            },
            {
                time: '17:00',
                title: '補給與晚餐',
                description: '簡單用餐，準備前往拍攝夕陽。',
                type: 'food',
                iconName: 'Utensils'
            },
            {
                time: '18:45',
                title: 'Marshall’s Beach 夕陽',
                description: '拍攝金門大橋夕陽的絕佳（但也較隱密）的地點。',
                type: 'sightseeing',
                iconName: 'Camera',
                coordinates: { lat: 37.8025, lng: -122.4800 },
                tips: '需步行一段沙灘與步道，注意潮汐與保暖。'
            },
            {
                time: '21:15',
                title: 'California St 夜拍',
                description: '拍攝經典的斜坡街道與纜車夜景。',
                type: 'sightseeing',
                iconName: 'Camera'
            }
        ]
    },
    // --- Day 7 ---
    {
        id: 'day7',
        date: '2026/05/27',
        city: 'SLC',
        cityLabel: '鹽湖城',
        title: '移動日：飛往猶他',
        summary: '告別舊金山，飛往鹽湖城準備參加年會。\n\n🌤️ 天氣/穿搭：SLC 白天偏暖、早晚涼；短袖＋薄外套；防曬。',
        activities: [
            {
                time: '07:30',
                title: 'Check-out',
                description: '辦理退房手續。',
                type: 'hotel',
                iconName: 'CheckSquare'
            },
            {
                time: '08:00',
                title: '前往 SFO 機場',
                description: '搭乘 BART 或 Uber 前往機場。',
                type: 'transport',
                iconName: 'Train'
            },
            {
                time: '10:00', // Approximate
                title: '飛往鹽湖城 (SLC)',
                description: '搭乘國內線航班前往 SLC (約 2 小時航程)。',
                type: 'flight',
                iconName: 'Plane',
                tips: '【MUST BOOK EARLY】建議選擇中午前後抵達的航班。'
            },
            {
                time: '15:30',
                title: '市區 Check-in',
                description: '抵達 SLC 市區，入住 Salt Palace 附近飯店。',
                type: 'hotel',
                iconName: 'MapPin',
                coordinates: { lat: 40.7670, lng: -111.8965 }
            },
            {
                time: '18:00',
                title: 'City Creek Center',
                description: '市區散步與晚餐，就在會場對面。',
                type: 'sightseeing',
                iconName: 'ShoppingBag'
            }
        ]
    },
    // --- Day 8 ---
    {
        id: 'day8',
        date: '2026/05/28',
        city: 'SLC',
        cityLabel: '鹽湖城',
        title: 'ACSM 年會 Day 1',
        summary: '全天學術會議。\n\n🌤️ 天氣/穿搭：室內為主，外出日照強，帶水防曬。',
        activities: [
            {
                time: '08:30',
                title: '前往 Salt Palace',
                description: '步行前往會議中心。',
                type: 'transport',
                iconName: 'MapPin'
            },
            {
                time: '09:00',
                title: 'ACSM 會議 / 報告',
                description: '參加專題演講、海報發表。',
                type: 'conference',
                iconName: 'Briefcase'
            },
            {
                time: '18:00',
                title: '聖殿廣場 / 晚餐',
                description: '會後參觀 Temple Square 或自由活動。',
                type: 'sightseeing',
                iconName: 'Camera',
                coordinates: { lat: 40.7704, lng: -111.8919 }
            }
        ]
    },
    // --- Day 9 ---
    {
        id: 'day9',
        date: '2026/05/29',
        city: 'SLC',
        cityLabel: '鹽湖城',
        title: 'ACSM 年會 Day 2',
        summary: '全天會議，晚上打包準備回程。\n\n🌤️ 天氣/穿搭：可能短暫陣雨；輕雨具備案。',
        activities: [
            {
                time: '09:00',
                title: 'ACSM 會議 / 報告',
                description: '持續參與議程與交流。',
                type: 'conference',
                iconName: 'Briefcase'
            },
            {
                time: '18:00',
                title: '晚餐 / 打包',
                description: '享受在鹽湖城的最後晚餐，整理行李準備明天早起。',
                type: 'hotel',
                iconName: 'Utensils'
            }
        ]
    },
    // --- Day 10 ---
    {
        id: 'day10',
        date: '2026/05/30',
        city: 'SLC', // Wait, flying back to SF
        cityLabel: '鹽湖城→舊金山',
        title: '超保守回程日',
        summary: '中午前飛回舊金山待命，避免任何意外影響國際段航班。\n\n🌤️ 天氣/穿搭：回到灣區體感變涼；外套留手邊。',
        activities: [
            {
                time: '06:30',
                title: '起床 & 退房',
                description: '早起準備前往機場。',
                type: 'hotel',
                iconName: 'Sun'
            },
            {
                time: '07:45',
                title: '前往 SLC 機場',
                description: '搭乘 Uber 或 TRAX 前往機場。',
                type: 'transport',
                iconName: 'Train'
            },
            {
                time: '09:30',
                title: '飛往舊金山 (SFO)',
                description: '建議搭乘 09:30-10:30 起飛的航班，務必中午抵達。',
                type: 'flight',
                iconName: 'Plane',
                tips: '【MUST BOOK EARLY】預留充足轉機/緩衝時間。'
            },
            {
                time: '12:00',
                title: '抵達 SFO / 休息',
                description: '抵達後不進市區，直接在機場休息或使用機場飯店設施。',
                type: 'other',
                iconName: 'Coffee'
            },
            {
                time: '21:30',
                title: '辦理登機手續',
                description: '星宇航空櫃檯報到 (TBIT 航廈)。',
                type: 'flight',
                iconName: 'Ticket'
            }
        ]
    },
    // --- Day 11 ---
    {
        id: 'day11',
        date: '2026/05/31',
        city: 'SF',
        cityLabel: '舊金山',
        title: '平安返航',
        summary: '搭乘星宇航空返台。\n\n🌤️ 天氣/穿搭：機場/機上偏冷，長袖舒適。',
        activities: [
            {
                time: '00:50',
                title: 'SFO 起飛',
                description: '搭乘 JX011 航班飛往台北 (TPE)。',
                type: 'flight',
                iconName: 'Plane',
                tips: 'Save Travels! ✈️'
            }
        ]
    }
];

export const checklistItems = [
    "預訂：惡魔島船票 (出發前 90 天)",
    "預訂：巨人隊球票 (MLB)",
    "預訂：國內線機票 (SFO ⇄ SLC)",
    "預訂：ACSM 年會註冊",
    "ESTA 美國電子簽證 (出發前 72 小時)",
    "網路：漫遊 SIM 卡或 eSIM",
    "攝影：相機、廣角鏡、長焦鏡、腳架",
    "衣物：防風外套 (SF)、短袖與薄外套 (SLC)",
    "其他：美規轉接頭 (同台灣)、個人藥品、保險"
];
