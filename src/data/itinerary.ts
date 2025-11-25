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
export const itineraryData: DayPlan[] = [
    // --- San Francisco ---
    {
        id: 'day1',
        date: '2026/05/20 (三)',
        city: 'SF',
        cityLabel: '舊金山',
        title: '啟程與抵達',
        summary: '搭乘星宇航空抵達舊金山，調適時差。',
        activities: [
            {
                time: '14:00 (TPE)',
                title: '桃園機場報到',
                description: '前往桃園機場第二航廈，星宇航空櫃檯辦理登機。',
                type: 'flight',
                iconName: 'Plane',
                coordinates: { lat: 25.0797, lng: 121.2342 }
            },
            {
                time: '16:30 (TPE)',
                title: '起飛前往舊金山',
                description: '預計搭乘 JX012 航班 (時間依季班表為準)。',
                type: 'flight',
                iconName: 'Plane',
            },
            {
                time: '12:30 (SFO)',
                title: '抵達 SFO 機場',
                description: '辦理入境手續、領取行李。',
                type: 'transport',
                iconName: 'MapPin',
                tips: '美西入境排隊時間較長，預留 1.5-2 小時。',
                coordinates: { lat: 37.6213, lng: -122.3790 }
            },
            {
                time: '14:30',
                title: '前往市區飯店',
                description: '搭乘 BART (捷運) 黃線至 Powell St. 站或搭乘 Uber/Lyft。',
                type: 'transport',
                iconName: 'Train',
                tips: '若住 Union Square，BART 是最經濟快速的選擇。'
            },
            {
                time: '16:00',
                title: '飯店 Check-in & 休息',
                description: '入住飯店，簡單整理。',
                type: 'hotel',
                iconName: 'Moon'
            },
            {
                time: '18:00',
                title: '渡輪大廈晚餐',
                description: '前往 Ferry Building Marketplace 覓食，欣賞海灣大橋夜景。',
                type: 'food',
                iconName: 'Utensils',
                location: '1 Ferry Building, San Francisco',
                coordinates: { lat: 37.7955, lng: -122.3937 }
            }
        ]
    },
    {
        id: 'day2',
        date: '2026/05/21 (四)',
        city: 'SF',
        cityLabel: '舊金山/矽谷',
        title: '科技朝聖日：Apple Park',
        summary: '租車南下，造訪 Apple Park、Google 與史丹佛大學。',
        activities: [
            {
                time: '08:30',
                title: '取車出發',
                description: '建議租車一天 (Turo 或 Hertz)，前往 Cupertino。',
                type: 'transport',
                iconName: 'Car',
                tips: '車程約 50 分鐘，避開通勤高峰早點出發。'
            },
            {
                time: '10:00',
                title: 'Apple Park Visitor Center',
                description: '參觀遊客中心、AR 體驗總部模型、頂樓露台喝咖啡。',
                type: 'sightseeing',
                iconName: 'MapPin',
                location: '10600 N Tantau Ave, Cupertino',
                tips: '必買獨家 T-shirt。頂樓露台是唯一能清楚看到圓環建築的地方。',
                coordinates: { lat: 37.3349, lng: -122.0090 }
            },
            {
                time: '12:30',
                title: '午餐時間',
                description: '建議在 Main Street Cupertino 附近用餐。',
                type: 'food',
                iconName: 'Utensils'
            },
            {
                time: '14:00',
                title: 'Googleplex & Android Statues',
                description: '前往 Mountain View 參觀 Google 園區外部與訪客中心。',
                type: 'sightseeing',
                iconName: 'Camera',
                location: '1600 Amphitheatre Pkwy, Mountain View',
                coordinates: { lat: 37.4220, lng: -122.0841 }
            },
            {
                time: '16:00',
                title: '史丹佛大學',
                description: '參觀 Main Quad、Hoover Tower 與紀念教堂。',
                type: 'sightseeing',
                iconName: 'Briefcase',
                tips: '校園很大，建議將車停在 Tresidder Parking Lot。',
                coordinates: { lat: 37.4275, lng: -122.1697 }
            },
            {
                time: '19:00',
                title: '返回舊金山',
                description: '晚餐可於 Palo Alto 大學路解決，或回舊金山吃。',
                type: 'transport',
                iconName: 'Car'
            }
        ]
    },
    {
        id: 'day3',
        date: '2026/05/22 (五)',
        city: 'SF',
        cityLabel: '舊金山',
        title: '迷霧之城經典巡禮',
        summary: '金門大橋、藝術宮與九曲花街。',
        activities: [
            {
                time: '09:00',
                title: '金門大橋 (Golden Gate Bridge)',
                description: '前往 Welcome Center，或租腳踏車騎行一段。',
                type: 'sightseeing',
                iconName: 'Camera',
                tips: '若想拍明信片角度，建議搭 Uber 到對岸的 Battery Spencer。',
                coordinates: { lat: 37.8199, lng: -122.4783 }
            },
            {
                time: '11:30',
                title: '藝術宮 (Palace of Fine Arts)',
                description: '欣賞羅馬式建築與湖畔美景。',
                type: 'sightseeing',
                iconName: 'Camera',
                coordinates: { lat: 37.8029, lng: -122.4484 }
            },
            {
                time: '14:00',
                title: '九曲花街 (Lombard Street)',
                description: '觀賞繡球花盛開的彎曲街道。',
                type: 'sightseeing',
                iconName: 'MapPin',
                tips: '建議搭 Uber 到頂端 (Hyde St)，往下走比較輕鬆。',
                coordinates: { lat: 37.8021, lng: -122.4187 }
            },
            {
                time: '16:00',
                title: '聯合廣場逛街',
                description: '逛逛 Westfield 或周邊品牌店。',
                type: 'other',
                iconName: 'Coffee'
            }
        ]
    },
    {
        id: 'day4',
        date: '2026/05/23 (六)',
        city: 'SF',
        cityLabel: '舊金山',
        title: '惡魔島與碼頭',
        summary: '深入惡魔島監獄，品嚐酸種麵包濃湯。',
        activities: [
            {
                time: '09:30',
                title: '惡魔島 (Alcatraz) 登島',
                description: '從 33 號碼頭搭船。需聽語音導覽。',
                type: 'sightseeing',
                iconName: 'MapPin',
                tips: '【極重要】必須在 90 天前官網搶票，現場買不到票。',
                coordinates: { lat: 37.8270, lng: -122.4230 }
            },
            {
                time: '13:00',
                title: '39 號碼頭 (Pier 39)',
                description: '午餐吃 Boudin 酸種麵包湯，看懶洋洋的海獅。',
                type: 'food',
                iconName: 'Utensils',
                coordinates: { lat: 37.8087, lng: -122.4098 }
            },
            {
                time: '15:00',
                title: '漁人碼頭漫步',
                description: '參觀 Musee Mecanique (復古遊戲機博物館)。',
                type: 'sightseeing',
                iconName: 'Camera'
            }
        ]
    },
    {
        id: 'day5',
        date: '2026/05/24 (日)',
        city: 'SF',
        cityLabel: '舊金山',
        title: '索薩利托與叮叮車',
        summary: '搭渡輪前往對岸小鎮，體驗最後的舊金山風情。',
        activities: [
            {
                time: '10:00',
                title: '搭渡輪往 Sausalito',
                description: '從 Ferry Building 搭乘 Golden Gate Ferry。',
                type: 'transport',
                iconName: 'Plane'
            },
            {
                time: '10:30',
                title: 'Sausalito 小鎮時光',
                description: '逛畫廊、吃冰淇淋，眺望舊金山天際線。',
                type: 'sightseeing',
                iconName: 'Sun',
                coordinates: { lat: 37.8591, lng: -122.4853 }
            },
            {
                time: '14:00',
                title: '返回並搭乘叮叮車',
                description: '體驗 Powell-Hyde 線。',
                type: 'sightseeing',
                iconName: 'Train',
                tips: '排隊人潮眾多，建議從中途站上車或直接排總站。'
            }
        ]
    },
    // --- Salt Lake City ---
    {
        id: 'day6',
        date: '2026/05/25 (一)',
        city: 'SLC',
        cityLabel: '鹽湖城',
        title: '移動日：飛往猶他州',
        summary: '前往 ACSM 年會舉辦地鹽湖城。',
        activities: [
            {
                time: '09:00',
                title: '前往 SFO 機場',
                description: 'Check-out，搭乘 Uber/BART 前往機場。',
                type: 'transport',
                iconName: 'Plane'
            },
            {
                time: '12:00',
                title: '飛往鹽湖城 (SLC)',
                description: '搭乘國內線 (Delta/United/Southwest)，航程約 2 小時。',
                type: 'flight',
                iconName: 'Plane'
            },
            {
                time: '15:30',
                title: '抵達 SLC & 交通',
                description: '搭乘 TRAX 輕軌 (綠線) 直接從機場到市中心。',
                type: 'transport',
                iconName: 'Train',
                tips: '鹽湖城機場離市區很近，輕軌非常方便且便宜。',
                coordinates: { lat: 40.7899, lng: -111.9791 }
            },
            {
                time: '17:00',
                title: '飯店 Check-in',
                description: '入住 Salt Palace Convention Center 附近飯店。',
                type: 'hotel',
                iconName: 'Moon'
            }
        ]
    },
    {
        id: 'day7',
        date: '2026/05/26 (二)',
        city: 'SLC',
        cityLabel: '鹽湖城',
        title: 'ACSM 年會 Day 1',
        summary: '會議註冊、開幕式與講座。',
        activities: [
            {
                time: '08:00',
                title: '會議報到',
                description: '前往 Salt Palace Convention Center 領取識別證。',
                type: 'conference',
                iconName: 'Briefcase',
                coordinates: { lat: 40.7670, lng: -111.8965 }
            },
            {
                time: '09:00',
                title: '專題演講 & 議程',
                description: '參加感興趣的學術場次。',
                type: 'conference',
                iconName: 'Briefcase'
            },
            {
                time: '17:00',
                title: '聖殿廣場 (Temple Square)',
                description: '會後步行參觀摩門教總部建築群。',
                type: 'sightseeing',
                iconName: 'Camera'
            },
            {
                time: '19:00',
                title: 'City Creek Center 晚餐',
                description: '會場正對面的購物中心，有美食街與餐廳。',
                type: 'food',
                iconName: 'Utensils'
            }
        ]
    },
    {
        id: 'day8',
        date: '2026/05/27 (三)',
        city: 'SLC',
        cityLabel: '鹽湖城',
        title: 'ACSM 年會 Day 2',
        summary: '全天會議行程。',
        activities: [
            {
                time: '08:30',
                title: '學術會議',
                description: '海報發表 (Poster Session) 或專題研討。',
                type: 'conference',
                iconName: 'Briefcase'
            },
            {
                time: '12:00',
                title: '交流午餐',
                description: '與同行學者交流。',
                type: 'food',
                iconName: 'Coffee'
            },
            {
                time: '18:00',
                title: '猶他州議會大廈',
                description: '搭 Uber 前往 Utah State Capitol 看夕陽與市景。',
                type: 'sightseeing',
                iconName: 'Camera',
                tips: '議會大廈位於山坡上，俯瞰鹽湖城視野極佳。',
                coordinates: { lat: 40.7774, lng: -111.8882 }
            }
        ]
    },
    {
        id: 'day9',
        date: '2026/05/28 (四)',
        city: 'SLC',
        cityLabel: '鹽湖城',
        title: 'ACSM 年會 Day 3',
        summary: '全天會議行程。',
        activities: [
            {
                time: '09:00',
                title: '學術會議',
                description: '持續參與議程。',
                type: 'conference',
                iconName: 'Briefcase'
            },
            {
                time: '19:00',
                title: '社交晚宴 (Gala) 或自由活動',
                description: '若有官方晚宴則參加，否則可去 Red Iguana 吃著名的墨西哥菜。',
                type: 'food',
                iconName: 'Utensils',
                tips: 'Red Iguana 生意極好，建議提早訂位或避開尖峰。'
            }
        ]
    },
    {
        id: 'day10',
        date: '2026/05/29 (五)',
        city: 'SLC',
        cityLabel: '鹽湖城',
        title: '年會閉幕',
        summary: '最後半天會議，準備前往下一站。',
        activities: [
            {
                time: '09:00',
                title: '最後議程',
                description: '把握最後的發表會與展覽攤位 (Expo)。',
                type: 'conference',
                iconName: 'Briefcase'
            },
            {
                time: '14:00',
                title: '市區漫遊',
                description: '參觀 The Leonardo 博物館或公共圖書館。',
                type: 'sightseeing',
                iconName: 'Camera'
            },
            {
                time: '18:00',
                title: '整理行李',
                description: '準備明天飛往海邊。',
                type: 'hotel',
                iconName: 'CheckSquare'
            }
        ]
    },
    // --- San Diego ---
    {
        id: 'day11',
        date: '2026/05/30 (六)',
        city: 'SAN',
        cityLabel: '聖地亞哥',
        title: '飛往陽光海岸',
        summary: '抵達聖地亞哥，感受瓦斯燈街區夜生活。',
        activities: [
            {
                time: '09:00',
                title: '前往 SLC 機場',
                description: '搭乘 TRAX 綠線前往機場。',
                type: 'transport',
                iconName: 'Train'
            },
            {
                time: '11:00',
                title: '飛往聖地亞哥 (SAN)',
                description: '搭乘 Delta/Southwest，航程約 2 小時。',
                type: 'flight',
                iconName: 'Plane'
            },
            {
                time: '13:00',
                title: '抵達 SAN',
                description: '機場就在市區旁。搭乘 Uber 或 992 公車前往飯店。',
                type: 'transport',
                iconName: 'MapPin',
                tips: '建議住 Downtown 或 Little Italy 區域，交通方便。',
                coordinates: { lat: 32.7338, lng: -117.1933 }
            },
            {
                time: '18:00',
                title: 'Gaslamp Quarter',
                description: '瓦斯燈街區晚餐與散步，感受復古建築與熱鬧酒吧。',
                type: 'food',
                iconName: 'Utensils',
                coordinates: { lat: 32.7114, lng: -117.1599 }
            },
        ]
    },
    {
        id: 'day12',
        date: '2026/05/31 (日)',
        city: 'SAN',
        cityLabel: '聖地亞哥',
        title: '巴爾波亞與動物園',
        summary: '探索全美最大的城市文化公園與世界級動物園。',
        activities: [
            {
                time: '09:00',
                title: '聖地亞哥動物園 (San Diego Zoo)',
                description: '世界知名動物園，必搭空中纜車 (Skyfari)。',
                type: 'sightseeing',
                iconName: 'Camera',
                location: '2920 Zoo Dr, San Diego',
                tips: '園區有坡度，建議穿好走的鞋。',
                coordinates: { lat: 32.7353, lng: -117.1490 }
            },
            {
                time: '14:00',
                title: '巴爾波亞公園 (Balboa Park)',
                description: '參觀西班牙風格建築、植物園與博物館群。',
                type: 'sightseeing',
                iconName: 'Sun'
            },
            {
                time: '18:00',
                title: 'Little Italy 晚餐',
                description: '前往小義大利區享用道地義式料理。',
                type: 'food',
                iconName: 'Utensils'
            }
        ]
    },
    {
        id: 'day13',
        date: '2026/06/01 (一)',
        city: 'SAN',
        cityLabel: '聖地亞哥',
        title: '航母與勝利之吻',
        summary: '軍事迷朝聖中途島號，海港村散步。',
        activities: [
            {
                time: '10:00',
                title: '中途島號博物館 (USS Midway)',
                description: '參觀退役航空母艦、戰機與甲板。',
                type: 'sightseeing',
                iconName: 'Briefcase',
                tips: '門票包含語音導覽，記得領取。',
                coordinates: { lat: 32.7137, lng: -117.1751 }
            },
            {
                time: '13:00',
                title: '勝利之吻雕像',
                description: '就在航母旁邊的公園，必拍打卡點。',
                type: 'sightseeing',
                iconName: 'Camera'
            },
            {
                time: '14:00',
                title: 'Seaport Village',
                description: '沿著海灣散步，逛特色小店，看海景。',
                type: 'sightseeing',
                iconName: 'Sun'
            }
        ]
    },
    {
        id: 'day14',
        date: '2026/06/02 (二)',
        city: 'SAN',
        cityLabel: '聖地亞哥',
        title: '拉荷亞海豹與夕陽',
        summary: '前往高級海濱區 La Jolla 看野生海豹。',
        activities: [
            {
                time: '14:00',
                title: '前往 La Jolla',
                description: '搭乘 Uber/Lyft 前往 (約 20-30 分鐘)。',
                type: 'transport',
                iconName: 'Car'
            },
            {
                time: '15:00',
                title: 'La Jolla Cove',
                description: '觀賞躺在沙灘上的海豹與海獅 (請保持距離)。',
                type: 'sightseeing',
                iconName: 'Camera'
            },
            {
                time: '18:30',
                title: '欣賞太平洋夕陽',
                description: '南加州最美的夕陽景點之一。',
                type: 'sightseeing',
                iconName: 'Sun'
            }
        ]
    },
    {
        id: 'day15',
        date: '2026/06/03 (三)',
        city: 'SAN',
        cityLabel: '聖地亞哥',
        title: '科羅納多與老城',
        summary: '跨海大橋與墨西哥風情老城。',
        activities: [
            {
                time: '10:00',
                title: '科羅納多島 (Coronado)',
                description: '搭渡輪或過橋。參觀 Hotel del Coronado。',
                type: 'sightseeing',
                iconName: 'Sun',
                tips: '飯店沙灘非常美，電影《有些喜歡熱》拍攝地。',
                coordinates: { lat: 32.6859, lng: -117.1831 }
            },
            {
                time: '14:00',
                title: 'Old Town San Diego',
                description: '加州發源地，充滿墨西哥風情的歷史公園。',
                type: 'sightseeing',
                iconName: 'MapPin',
                coordinates: { lat: 32.7549, lng: -117.1978 }
            },
            {
                time: '18:00',
                title: '最後晚餐：墨西哥菜',
                description: '在 Old Town 享用 Taco 與 Margarita。',
                type: 'food',
                iconName: 'Utensils'
            }
        ]
    },
    // --- Return ---
    {
        id: 'day16',
        date: '2026/06/04 (四)',
        city: 'LA',
        cityLabel: '洛杉磯返程',
        title: '移動至 LAX 返台',
        summary: '前往洛杉磯國際機場，搭乘星宇航空返家。',
        activities: [
            {
                time: '10:00',
                title: '退房 & 早餐',
                description: '享受最後的加州陽光。',
                type: 'hotel',
                iconName: 'Coffee'
            },
            {
                time: '13:00',
                title: '移動至洛杉磯 (LAX)',
                description: '推薦：租車單程還車 (One-way rental) 開往 LAX。',
                type: 'transport',
                iconName: 'Car',
                tips: '車程約 2.5-3 小時，但洛杉磯交通極易堵塞，務必預留 5 小時以上緩衝。'
            },
            {
                time: '20:30',
                title: '抵達 LAX 機場',
                description: '前往 Tom Bradley 國際航廈 (TBIT) 星宇櫃檯。',
                type: 'flight',
                iconName: 'Plane',
                tips: '還車後需搭接駁車至航廈，時間要抓寬鬆。',
                coordinates: { lat: 33.9416, lng: -118.4085 }
            },
            {
                time: '23:50',
                title: '搭機返台',
                description: '星宇航空 JX001/JX005 (預計)。',
                type: 'flight',
                iconName: 'Plane'
            }
        ]
    }
];

export const checklistItems = [
    "ESTA 美國電子簽證 (出發前 72 小時申請)",
    "ACSM 年會註冊確認信",
    "Apple Park Visitor Center 營業時間確認",
    "惡魔島船票 (90天前預訂)",
    "星宇航空選位",
    "漫遊網卡或 eSIM",
    "美規插座轉接頭 (電壓 110V 相同，插孔相同)",
    "保險 (醫療險額度建議足夠)",
    "個人常備藥品"
];
