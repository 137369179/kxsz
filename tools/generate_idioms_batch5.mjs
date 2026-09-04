import fs from "fs";
import path from "path";
import { execSync } from "child_process";

const OUTPUT_DIR = path.resolve("assets/images");
const TMP_DIR = "/tmp/literacy_idioms_batch5";

if (!fs.existsSync(TMP_DIR)) {
  fs.mkdirSync(TMP_DIR, { recursive: true });
}

function wrapSvg(content, customDefs = "") {
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1376 768" width="1376" height="768">
  <defs>
    <filter id="softGlow" x="-30%" y="-30%" width="160%" height="160%">
      <feGaussianBlur stdDeviation="12" result="blur"/>
      <feComposite in="SourceGraphic" in2="blur" operator="over"/>
    </filter>
    <filter id="dropShadow" x="-20%" y="-20%" width="140%" height="140%">
      <feDropShadow dx="3" dy="6" stdDeviation="6" flood-opacity="0.2"/>
    </filter>
    ${customDefs}
  </defs>
  ${content}
</svg>`;
}

const IDIOMS_BATCH5 = [
  // ==========================================
  // 1. idiom_wangmeizhike: 望梅止渴
  // ==========================================
  {
    id: "idiom_wangmeizhike",
    title: "望梅止渴",
    defs: `
      <linearGradient id="sky_summer" x1="0%" y1="0%" x2="0%" y2="100%">
        <stop offset="0%" stop-color="#38bdf8"/>
        <stop offset="50%" stop-color="#bae6fd"/>
        <stop offset="100%" stop-color="#fef08a"/>
      </linearGradient>
      <linearGradient id="hill_green" x1="0%" y1="0%" x2="0%" y2="100%">
        <stop offset="0%" stop-color="#22c55e"/>
        <stop offset="100%" stop-color="#15803d"/>
      </linearGradient>
      <linearGradient id="plum_purple" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="#f43f5e"/>
        <stop offset="60%" stop-color="#9f1239"/>
        <stop offset="100%" stop-color="#4c0519"/>
      </linearGradient>
    `,
    content: `
      <!-- Sunny Mountain Landscape (夏日行军连绵青翠山岳) -->
      <rect width="1376" height="768" fill="url(#sky_summer)"/>
      <circle cx="1080" cy="180" r="100" fill="#fef08a" opacity="0.8" filter="url(#softGlow)"/>

      <!-- Distant Green Mountains (远山青葱) -->
      <path d="M0,480 Q280,260 580,420 T1100,320 T1376,460 L1376,768 L0,768 Z" fill="#86efac" opacity="0.6"/>
      <path d="M0,520 Q360,340 760,460 T1376,420 L1376,768 L0,768 Z" fill="url(#hill_green)" opacity="0.9"/>

      <!-- Verdant Plum Orchard in Foreground & Midground (茂密梅林满树硕果) -->
      <g transform="translate(140, 260)" filter="url(#dropShadow)">
        <path d="M120,400 Q150,280 180,180 Q220,120 180,60" stroke="#78350f" stroke-width="32" stroke-linecap="round" fill="none"/>
        <circle cx="180" cy="80" r="140" fill="#15803d"/>
        <circle cx="100" cy="130" r="100" fill="#16a34a"/>
        <circle cx="260" cy="120" r="110" fill="#166534"/>
        <!-- Plump Ripe Red Plums (晶莹酸甜杨梅果实) -->
        <circle cx="120" cy="80" r="22" fill="url(#plum_purple)"/>
        <circle cx="115" cy="75" r="5" fill="#ffffff" opacity="0.8"/>
        <circle cx="170" cy="50" r="24" fill="url(#plum_purple)"/>
        <circle cx="165" cy="45" r="6" fill="#ffffff" opacity="0.8"/>
        <circle cx="220" cy="90" r="25" fill="url(#plum_purple)"/>
        <circle cx="215" cy="85" r="6" fill="#ffffff" opacity="0.8"/>
        <circle cx="160" cy="140" r="22" fill="url(#plum_purple)"/>
        <circle cx="240" cy="150" r="23" fill="url(#plum_purple)"/>
        <circle cx="90" cy="160" r="20" fill="url(#plum_purple)"/>
      </g>

      <!-- Ancient General on Steed Pointing Ahead (曹操骑骏马扬鞭指梅林) -->
      <g transform="translate(680, 280)" filter="url(#dropShadow)">
        <!-- Horse Body & Legs -->
        <ellipse cx="260" cy="320" rx="140" ry="80" fill="#854d0e"/>
        <path d="M340,300 Q400,240 430,190 Q410,160 380,180 Q340,230 310,270 Z" fill="#854d0e"/>
        <!-- Horse Head & Mane -->
        <circle cx="430" cy="170" r="35" fill="#854d0e"/>
        <path d="M410,140 L450,130 L435,170 Z" fill="#713f12"/>
        <path d="M360,190 Q390,200 400,240" stroke="#fef08a" stroke-width="12" stroke-linecap="round" fill="none"/>
        <line x1="200" y1="360" x2="190" y2="460" stroke="#713f12" stroke-width="20" stroke-linecap="round"/>
        <line x1="240" y1="360" x2="250" y2="460" stroke="#713f12" stroke-width="18" stroke-linecap="round"/>
        <line x1="330" y1="360" x2="320" y2="460" stroke="#713f12" stroke-width="18" stroke-linecap="round"/>
        <line x1="370" y1="350" x2="390" y2="450" stroke="#713f12" stroke-width="20" stroke-linecap="round"/>
        <!-- Red Saddle & Bridle (朱红鞍鞯) -->
        <path d="M220,270 Q260,310 300,270 L300,310 L220,310 Z" fill="#dc2626"/>

        <!-- General Cao Cao in Red Robe & Silver Armor (曹操执马鞭指梅林) -->
        <rect x="230" y="160" width="70" height="110" rx="20" fill="#991b1b"/>
        <!-- Silver Armor Plate -->
        <rect x="238" y="170" width="54" height="65" rx="10" fill="#e2e8f0" stroke="#f59e0b" stroke-width="4"/>
        <!-- General Helmet with Red Tassel (红缨兜鍪) -->
        <circle cx="265" cy="120" r="30" fill="#fcd34d"/>
        <ellipse cx="265" cy="115" rx="32" ry="24" fill="#94a3b8"/>
        <path d="M265,90 L265,70" stroke="#f59e0b" stroke-width="6"/>
        <polygon points="265,65 255,80 275,80" fill="#dc2626"/>
        <!-- Pointing Arm Holding Whip (高扬马鞭指向梅林) -->
        <line x1="240" y1="180" x2="140" y2="120" stroke="#991b1b" stroke-width="18" stroke-linecap="round"/>
        <circle cx="135" cy="115" r="14" fill="#fcd34d"/>
        <line x1="135" y1="115" x2="70" y2="70" stroke="#f59e0b" stroke-width="6" stroke-linecap="round"/>
        <!-- Joyful Expression -->
        <circle cx="255" cy="122" r="4" fill="#1e293b"/>
        <path d="M250,135 Q265,145 280,135" stroke="#78350f" stroke-width="4" stroke-linecap="round" fill="none"/>
      </g>

      <!-- Cheering Marching Soldiers with Red Banners (重整旗鼓欢呼雀跃的士兵) -->
      <g transform="translate(1020, 420)" filter="url(#dropShadow)">
        <!-- Banner Pole (红底金字战旗) -->
        <line x1="40" y1="50" x2="40" y2="280" stroke="#78350f" stroke-width="8" stroke-linecap="round"/>
        <polygon points="44,50 180,90 44,140" fill="#dc2626"/>
        <!-- Soldier 1 -->
        <circle cx="80" cy="180" r="22" fill="#fcd34d"/>
        <rect x="65" y="200" width="30" height="70" rx="8" fill="#475569"/>
        <!-- Soldier 2 Smiling -->
        <circle cx="140" cy="190" r="22" fill="#fcd34d"/>
        <rect x="125" y="210" width="30" height="60" rx="8" fill="#475569"/>
      </g>

      <!-- Red Chinese Seal (梅 - 望梅止渴) with Vector Path -->
      <g transform="translate(1220, 80)" filter="url(#dropShadow)">
        <rect x="0" y="0" width="55" height="55" rx="8" fill="#dc2626"/>
        <g stroke="#ffffff" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" fill="none">
          <!-- 木 -->
          <line x1="12" y1="24" x2="28" y2="24"/>
          <line x1="20" y1="14" x2="20" y2="42"/>
          <path d="M20,24 L12,36"/>
          <path d="M20,24 L26,34"/>
          <!-- 每 -->
          <path d="M34,14 L30,22"/>
          <line x1="30" y1="22" x2="44" y2="22"/>
          <rect x="30" y="26" width="14" height="16" rx="2"/>
          <line x1="30" y1="34" x2="44" y2="34"/>
          <circle cx="37" cy="30" r="1" fill="#ffffff"/>
          <circle cx="37" cy="38" r="1" fill="#ffffff"/>
        </g>
      </g>
    `
  },

  // ==========================================
  // 2. idiom_wanbiguizhao: 完璧归赵
  // ==========================================
  {
    id: "idiom_wanbiguizhao",
    title: "完璧归赵",
    defs: `
      <linearGradient id="palace_bg" x1="0%" y1="0%" x2="0%" y2="100%">
        <stop offset="0%" stop-color="#450a0a"/>
        <stop offset="60%" stop-color="#7f1d1d"/>
        <stop offset="100%" stop-color="#1e1b4b"/>
      </linearGradient>
      <linearGradient id="jade_glow" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="#a7f3d0"/>
        <stop offset="40%" stop-color="#34d399"/>
        <stop offset="100%" stop-color="#059669"/>
      </linearGradient>
    `,
    content: `
      <!-- Grand Qin Palace Hall (威严巍峨的秦国咸阳宫大殿) -->
      <rect width="1376" height="768" fill="url(#palace_bg)"/>

      <!-- Palace Polished Stone Floor with Golden Reflection (大殿金砖地面) -->
      <polygon points="0,520 1376,520 1376,768 0,768" fill="#1e293b"/>
      <line x1="0" y1="520" x2="1376" y2="520" stroke="#f59e0b" stroke-width="4"/>

      <!-- Massive Carved Dragon Stone Pillar (殿内雕龙巨石盘龙柱) -->
      <g transform="translate(180, 0)" filter="url(#dropShadow)">
        <rect x="0" y="0" width="120" height="768" fill="#334155" stroke="#475569" stroke-width="4"/>
        <!-- Golden Cloud & Dragon Motifs -->
        <path d="M20,120 Q60,80 100,140 Q40,200 80,260 Q20,320 100,380" stroke="#f59e0b" stroke-width="8" fill="none" opacity="0.7"/>
        <path d="M40,420 Q90,480 30,540 Q100,600 50,660" stroke="#f59e0b" stroke-width="8" fill="none" opacity="0.7"/>
      </g>

      <!-- Lin Xiangru Holding He Shi Bi Jade Beside the Pillar (蔺相如背倚龙柱举宝璧) -->
      <g transform="translate(340, 220)" filter="url(#dropShadow)">
        <!-- Cyan & White Traditional Scholar Robes (青衫白裳峨冠博带) -->
        <path d="M70,180 L20,440 L160,440 L110,180 Z" fill="#047857"/>
        <polygon points="50,220 70,300 90,220" fill="#ffffff"/>
        <!-- Red Silk Sash (朱红博带) -->
        <rect x="40" y="240" width="100" height="16" fill="#dc2626"/>
        <line x1="90" y1="240" x2="90" y2="380" stroke="#dc2626" stroke-width="12"/>

        <!-- Head with Scholar Cap (峨冠博带、义正辞严) -->
        <circle cx="90" cy="120" r="32" fill="#fcd34d"/>
        <!-- Scholar Cap -->
        <rect x="68" y="70" width="44" height="30" rx="4" fill="#0f172a"/>
        <line x1="50" y1="100" x2="130" y2="100" stroke="#f59e0b" stroke-width="4"/>
        <!-- Righteous Eyes and Beard (目光如炬、威武不屈) -->
        <ellipse cx="80" cy="115" rx="5" ry="3" fill="#0f172a"/>
        <ellipse cx="100" cy="115" rx="5" ry="3" fill="#0f172a"/>
        <path d="M80,135 Q90,140 100,135" stroke="#78350f" stroke-width="4" fill="none"/>
        <path d="M85,145 L90,175 L95,145 Z" fill="#1e293b"/>

        <!-- Arms Raised High Holding Jade Disc (双手高托完璧欲击石柱) -->
        <path d="M50,190 L-10,110 L30,80" stroke="#047857" stroke-width="26" stroke-linecap="round" fill="none"/>
        <path d="M120,190 L60,100 L40,70" stroke="#047857" stroke-width="26" stroke-linecap="round" fill="none"/>
        <circle cx="15" cy="80" r="16" fill="#fcd34d"/>
        <circle cx="45" cy="70" r="16" fill="#fcd34d"/>

        <!-- Legendary He Shi Bi (和氏璧 - 碧绿通透、华彩流光) -->
        <g transform="translate(10, 0)" filter="url(#softGlow)">
          <circle cx="20" cy="30" r="50" fill="url(#jade_glow)" stroke="#ecfdf5" stroke-width="6"/>
          <circle cx="20" cy="30" r="16" fill="#7f1d1d"/>
          <!-- Ruyi Carvings on Jade -->
          <circle cx="20" cy="30" r="36" stroke="#ffffff" stroke-width="3" stroke-dasharray="8 6" fill="none" opacity="0.8"/>
        </g>
      </g>

      <!-- Qin King on Throne Astonished (秦昭王在龙椅上惶恐摆手) -->
      <g transform="translate(940, 260)" filter="url(#dropShadow)">
        <!-- Imperial Folding Screen Behind Throne (九龙金屏风) -->
        <rect x="0" y="40" width="280" height="240" rx="10" fill="#b45309" stroke="#f59e0b" stroke-width="6"/>
        <path d="M20,160 Q140,80 260,160" stroke="#fef08a" stroke-width="6" fill="none"/>
        <!-- Throne (龙椅) -->
        <rect x="40" y="200" width="200" height="180" rx="16" fill="#991b1b" stroke="#f59e0b" stroke-width="8"/>
        <!-- Qin King in Black Dragon Robes (秦王着黑冕龙袍) -->
        <rect x="90" y="160" width="100" height="160" rx="20" fill="#0f172a"/>
        <circle cx="140" cy="110" r="32" fill="#fcd34d"/>
        <!-- Imperial Crown with Jade Beads (冕旒冠) -->
        <rect x="100" y="65" width="80" height="15" fill="#0f172a"/>
        <line x1="110" y1="80" x2="110" y2="105" stroke="#f59e0b" stroke-width="3"/>
        <line x1="140" y1="80" x2="140" y2="105" stroke="#f59e0b" stroke-width="3"/>
        <line x1="170" y1="80" x2="170" y2="105" stroke="#f59e0b" stroke-width="3"/>
        <!-- Raising Hands to Concede (惊惶伸手劝阻) -->
        <line x1="100" y1="200" x2="30" y2="170" stroke="#0f172a" stroke-width="20" stroke-linecap="round"/>
        <circle cx="20" cy="170" r="14" fill="#fcd34d"/>
      </g>

      <!-- Red Chinese Seal (璧 - 完璧归赵) with Vector Path -->
      <g transform="translate(1220, 80)" filter="url(#dropShadow)">
        <rect x="0" y="0" width="55" height="55" rx="8" fill="#dc2626"/>
        <g stroke="#ffffff" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" fill="none">
          <!-- 辟 (上部) -->
          <path d="M14,14 L30,14 L30,22 L14,22"/>
          <line x1="18" y1="14" x2="18" y2="28"/>
          <path d="M34,14 L42,14 L40,28"/>
          <line x1="32" y1="22" x2="42" y2="22"/>
          <!-- 玉 (下部) -->
          <line x1="18" y1="32" x2="38" y2="32"/>
          <line x1="28" y1="32" x2="28" y2="46"/>
          <line x1="20" y1="39" x2="36" y2="39"/>
          <line x1="14" y1="46" x2="42" y2="46"/>
          <circle cx="34" cy="42" r="1.5" fill="#ffffff"/>
        </g>
      </g>
    `
  },

  // ==========================================
  // 3. idiom_fujingqingzui: 负荆请罪
  // ==========================================
  {
    id: "idiom_fujingqingzui",
    title: "负荆请罪",
    defs: `
      <linearGradient id="mansion_sky" x1="0%" y1="0%" x2="0%" y2="100%">
        <stop offset="0%" stop-color="#bfdbfe"/>
        <stop offset="50%" stop-color="#e0e7ff"/>
        <stop offset="100%" stop-color="#fed7aa"/>
      </linearGradient>
    `,
    content: `
      <!-- Mansion Courtyard with Green Bamboo & Stone Path (赵相府门前庭院) -->
      <rect width="1376" height="768" fill="url(#mansion_sky)"/>

      <!-- Mansion Gate with Chinese Flying Eaves (相府红门与飞檐黛瓦) -->
      <g transform="translate(100, 80)" filter="url(#dropShadow)">
        <polygon points="0,180 600,180 540,80 60,80" fill="#334155"/>
        <path d="M40,90 Q300,40 560,90" stroke="#1e293b" stroke-width="12" fill="none"/>
        <rect x="80" y="180" width="440" height="340" fill="#991b1b" stroke="#7f1d1d" stroke-width="8"/>
        <!-- Vermilion Gate Panels & Golden Knockers (朱漆大门与椒图金环) -->
        <line x1="300" y1="180" x2="300" y2="520" stroke="#f59e0b" stroke-width="8"/>
        <circle cx="240" cy="340" r="28" fill="#f59e0b"/>
        <circle cx="360" cy="340" r="28" fill="#f59e0b"/>
      </g>

      <!-- Courtyard Stone Steps & Bamboo (青石阶与翠竹林) -->
      <rect x="0" y="520" width="1376" height="248" fill="#94a3b8"/>
      <g transform="translate(1080, 240)">
        <rect x="40" y="0" width="16" height="380" fill="#15803d"/>
        <rect x="100" y="40" width="14" height="340" fill="#16a34a"/>
        <ellipse cx="60" cy="120" rx="50" ry="16" fill="#22c55e" transform="rotate(-20 60 120)"/>
        <ellipse cx="120" cy="160" rx="60" ry="18" fill="#4ade80" transform="rotate(15 120 160)"/>
      </g>

      <!-- General Lian Po Kneeling Bare-Chested with Thorns (廉颇肉袒负荆跪地请罪) -->
      <g transform="translate(420, 320)" filter="url(#dropShadow)">
        <!-- Kneeling Lower Body in General Armor Tunic (下身战袍与战靴) -->
        <ellipse cx="160" cy="320" rx="90" ry="45" fill="#475569"/>
        <polygon points="100,240 220,240 250,330 70,330" fill="#1e293b"/>
        <!-- Muscular Bare Torso (肉袒请罪之伟岸身材) -->
        <path d="M100,160 Q160,130 220,160 L200,250 L120,250 Z" fill="#fcd34d"/>
        <!-- Robust Head with White Beard (老将须发皆白、神色诚恳) -->
        <circle cx="160" cy="110" r="36" fill="#fcd34d"/>
        <path d="M130,120 Q160,160 190,120 Z" fill="#f1f5f9"/>
        <!-- Bundled Thorny Brambles Tied on Back with Red Cords (背负粗壮棘条，红绳紧系) -->
        <g stroke="#78350f" stroke-width="10" stroke-linecap="round">
          <line x1="60" y1="40" x2="160" y2="220"/>
          <line x1="75" y1="30" x2="180" y2="230"/>
          <line x1="90" y1="50" x2="195" y2="220"/>
          <!-- Little Thorns -->
          <line x1="80" y1="70" x2="70" y2="60" stroke-width="4"/>
          <line x1="95" y1="100" x2="85" y2="90" stroke-width="4"/>
          <line x1="120" y1="140" x2="110" y2="130" stroke-width="4"/>
        </g>
        <!-- Red Cords Binding Thorns (朱红束绳) -->
        <path d="M110,180 Q160,210 210,180" stroke="#dc2626" stroke-width="8" fill="none"/>
        <path d="M120,220 Q160,250 200,220" stroke="#dc2626" stroke-width="8" fill="none"/>
        <!-- Hands Clasped in Apology (双手抱拳行大礼) -->
        <circle cx="160" cy="220" r="16" fill="#fcd34d"/>
      </g>

      <!-- Lin Xiangru Stepping Down and Lifting Lian Po (蔺相如快步下阶亲手扶起) -->
      <g transform="translate(680, 240)" filter="url(#dropShadow)">
        <!-- Elegant Scholar Blue Hanfu Robe (文雅宽大青色深衣) -->
        <path d="M100,160 L40,420 L200,420 L160,160 Z" fill="#0284c7"/>
        <polygon points="80,180 110,260 140,180" fill="#ffffff"/>
        <!-- Scholar Cap & Gentle Expression (温润如玉、谦和尊贤) -->
        <circle cx="130" cy="110" r="32" fill="#fcd34d"/>
        <rect x="110" y="65" width="40" height="25" rx="3" fill="#0f172a"/>
        <line x1="90" y1="90" x2="170" y2="90" stroke="#f59e0b" stroke-width="4"/>
        <!-- Extended Arms Lifting Lian Po's Shoulders (双手迎上搀扶) -->
        <path d="M100,180 L20,230 L-30,240" stroke="#0284c7" stroke-width="26" stroke-linecap="round" fill="none"/>
        <circle cx="-35" cy="240" r="14" fill="#fcd34d"/>
      </g>

      <!-- Red Chinese Seal (和 - 负荆请罪/将相和) with Vector Path -->
      <g transform="translate(1220, 80)" filter="url(#dropShadow)">
        <rect x="0" y="0" width="55" height="55" rx="8" fill="#dc2626"/>
        <g stroke="#ffffff" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" fill="none">
          <!-- 禾 -->
          <path d="M22,14 L14,20"/>
          <line x1="12" y1="24" x2="28" y2="24"/>
          <line x1="20" y1="18" x2="20" y2="44"/>
          <path d="M20,24 L14,36"/>
          <path d="M20,24 L26,34"/>
          <!-- 口 -->
          <rect x="30" y="22" width="14" height="16" rx="2"/>
        </g>
      </g>
    `
  },

  // ==========================================
  // 4. idiom_zaobitouguang: 凿壁偷光
  // ==========================================
  {
    id: "idiom_zaobitouguang",
    title: "凿壁偷光",
    defs: `
      <linearGradient id="night_room" x1="0%" y1="0%" x2="0%" y2="100%">
        <stop offset="0%" stop-color="#090d16"/>
        <stop offset="60%" stop-color="#1e1b4b"/>
        <stop offset="100%" stop-color="#172554"/>
      </linearGradient>
      <linearGradient id="beam_glow" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="#ffffff"/>
        <stop offset="30%" stop-color="#fef08a"/>
        <stop offset="80%" stop-color="#facc15" stop-opacity="0.6"/>
        <stop offset="100%" stop-color="#ca8a04" stop-opacity="0"/>
      </linearGradient>
    `,
    content: `
      <!-- Humble Ancient Study Room at Night (古朴简素的夜晚寒舍书房) -->
      <rect width="1376" height="768" fill="url(#night_room)"/>

      <!-- Earthen Wall on Left (古朴夯土墙壁) -->
      <polygon points="0,0 360,0 360,768 0,768" fill="#78350f" stroke="#451a03" stroke-width="6"/>

      <!-- Chiseled Small Hole in Wall (土墙上凿出的微小圆孔) -->
      <circle cx="360" cy="280" r="14" fill="#ffffff" filter="url(#softGlow)"/>

      <!-- Radiant Golden Light Beam Piercing Room (从小孔透出照向书简的明亮光柱) -->
      <polygon points="360,280 840,420 720,540" fill="url(#beam_glow)" filter="url(#softGlow)"/>

      <!-- Young Scholar Kuang Heng Reading Bamboo Scroll (匡衡身着布衣捧简苦读) -->
      <g transform="translate(560, 240)" filter="url(#dropShadow)">
        <!-- Woven Straw Mat & Low Wooden Table (草席与低矮书案) -->
        <rect x="0" y="320" width="360" height="40" rx="10" fill="#d97706"/>
        <line x1="20" y1="360" x2="20" y2="440" stroke="#92400e" stroke-width="16"/>
        <line x1="340" y1="360" x2="340" y2="440" stroke="#92400e" stroke-width="16"/>

        <!-- Bamboo Scrolls on Table (案上陈列的竹简与笔架) -->
        <rect x="40" y="300" width="100" height="20" rx="4" fill="#fef08a" stroke="#b45309" stroke-width="2"/>
        <line x1="50" y1="300" x2="50" y2="320" stroke="#b45309" stroke-width="2"/>
        <line x1="70" y1="300" x2="70" y2="320" stroke="#b45309" stroke-width="2"/>
        <line x1="90" y1="300" x2="90" y2="320" stroke="#b45309" stroke-width="2"/>
        <line x1="110" y1="300" x2="110" y2="320" stroke="#b45309" stroke-width="2"/>

        <!-- Kuang Heng Kneeling (匡衡端坐、目光专注) -->
        <rect x="180" y="160" width="90" height="180" rx="20" fill="#0284c7"/>
        <circle cx="225" cy="110" r="32" fill="#fcd34d"/>
        <!-- Traditional Topknot (总角发髻) -->
        <circle cx="225" cy="70" r="16" fill="#1e293b"/>
        <line x1="210" y1="70" x2="240" y2="70" stroke="#dc2626" stroke-width="4"/>
        <!-- Focused Eyes Bathed in Light (凝视微光、专注求知) -->
        <circle cx="210" cy="112" r="4" fill="#1e293b"/>
        <!-- Open Bamboo Scroll in Hands Glowing (双手展开正在研读的竹简) -->
        <g transform="translate(100, 200)">
          <rect x="0" y="0" width="80" height="55" rx="6" fill="#fde047" stroke="#ca8a04" stroke-width="3" filter="url(#softGlow)"/>
          <line x1="16" y1="4" x2="16" y2="51" stroke="#92400e" stroke-width="2"/>
          <line x1="32" y1="4" x2="32" y2="51" stroke="#92400e" stroke-width="2"/>
          <line x1="48" y1="4" x2="48" y2="51" stroke="#92400e" stroke-width="2"/>
          <line x1="64" y1="4" x2="64" y2="51" stroke="#92400e" stroke-width="2"/>
        </g>
        <!-- Hands Holding Scroll -->
        <circle cx="100" cy="230" r="12" fill="#fcd34d"/>
        <circle cx="180" cy="230" r="12" fill="#fcd34d"/>
      </g>

      <!-- Red Chinese Seal (光 - 凿壁偷光) with Vector Path -->
      <g transform="translate(1220, 80)" filter="url(#dropShadow)">
        <rect x="0" y="0" width="55" height="55" rx="8" fill="#dc2626"/>
        <g stroke="#ffffff" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" fill="none">
          <!-- 光 -->
          <line x1="27" y1="14" x2="27" y2="24"/>
          <path d="M18,18 L14,24"/>
          <path d="M36,18 L40,24"/>
          <line x1="14" y1="28" x2="40" y2="28"/>
          <path d="M22,28 L14,44"/>
          <path d="M28,28 L32,40 Q34,44 40,44"/>
        </g>
      </g>
    `
  },

  // ==========================================
  // 5. idiom_tiechuchengzhen: 铁杵成针
  // ==========================================
  {
    id: "idiom_tiechuchengzhen",
    title: "铁杵成针",
    defs: `
      <linearGradient id="brook_sky" x1="0%" y1="0%" x2="0%" y2="100%">
        <stop offset="0%" stop-color="#bae6fd"/>
        <stop offset="50%" stop-color="#e0f2fe"/>
        <stop offset="100%" stop-color="#bbf7d0"/>
      </linearGradient>
      <linearGradient id="stream_water" x1="0%" y1="0%" x2="100%" y2="0%">
        <stop offset="0%" stop-color="#0284c7"/>
        <stop offset="50%" stop-color="#38bdf8"/>
        <stop offset="100%" stop-color="#0284c7"/>
      </linearGradient>
    `,
    content: `
      <!-- Clear Riverside with Weeping Willows (清澈溪畔与依依杨柳) -->
      <rect width="1376" height="768" fill="url(#brook_sky)"/>

      <!-- Flowing Brook (潺潺山溪) -->
      <path d="M0,560 Q400,500 800,580 T1376,540 L1376,768 L0,768 Z" fill="url(#stream_water)"/>
      <path d="M100,620 Q500,580 900,640 T1300,620" stroke="#ffffff" stroke-width="4" stroke-dasharray="16 20" fill="none" opacity="0.6"/>

      <!-- Weeping Willow Branches (垂柳依依) -->
      <g transform="translate(80, 0)">
        <path d="M0,0 Q120,180 80,340" stroke="#65a30d" stroke-width="6" fill="none"/>
        <path d="M40,0 Q180,160 140,320" stroke="#84cc16" stroke-width="6" fill="none"/>
        <path d="M80,0 Q240,140 200,280" stroke="#a3e635" stroke-width="6" fill="none"/>
      </g>

      <!-- Smooth River Grindstone (溪边巨大磨石) -->
      <ellipse cx="500" cy="540" rx="160" ry="70" fill="#64748b" stroke="#475569" stroke-width="6" filter="url(#dropShadow)"/>

      <!-- Elderly Grandmother Grinding Iron Pestle (慈祥老妇巨石上执杵磨针) -->
      <g transform="translate(380, 240)" filter="url(#dropShadow)">
        <!-- Traditional Brown Linen Robe (朴素褐衫长裙) -->
        <path d="M70,140 L20,320 L160,320 L120,140 Z" fill="#92400e"/>
        <!-- Kind Face with Silver Hair Bun (满头银发、慈祥沉稳) -->
        <circle cx="95" cy="90" r="30" fill="#fed7aa"/>
        <circle cx="95" cy="55" r="16" fill="#e2e8f0"/>
        <!-- Gentle Eyes and Smiling Mouth -->
        <path d="M85,90 Q90,95 95,90" stroke="#78350f" stroke-width="3" fill="none"/>
        <path d="M105,90 Q110,95 115,90" stroke="#78350f" stroke-width="3" fill="none"/>
        <path d="M92,105 Q100,112 108,105" stroke="#78350f" stroke-width="3" fill="none"/>

        <!-- Arms Gripping Heavy Iron Pestle (双手紧握粗大铁杵用力磨砺) -->
        <line x1="90" y1="140" x2="160" y2="240" stroke="#92400e" stroke-width="22" stroke-linecap="round"/>
        <!-- The Iron Rod / Pestle (粗壮厚重的铁杵，尖端已磨出银亮针芒) -->
        <polygon points="140,160 170,180 130,290 120,290" fill="#334155" stroke="#94a3b8" stroke-width="3"/>
        <circle cx="120" cy="290" r="6" fill="#f8fafc" filter="url(#softGlow)"/>
        <!-- Tiny Grinding Sparkles (火星微光) -->
        <circle cx="115" cy="295" r="3" fill="#facc15"/>
        <circle cx="128" cy="288" r="2" fill="#facc15"/>
      </g>

      <!-- Young Prodigy Li Bai Watching in Wonder (少年李白背着书卷驻足倾听，大受启发) -->
      <g transform="translate(840, 260)" filter="url(#dropShadow)">
        <!-- Child Hanfu in Cyan & Sky Blue (少年青衣短衫) -->
        <path d="M60,140 L10,320 L130,320 L90,140 Z" fill="#0284c7"/>
        <polygon points="50,150 75,210 100,150" fill="#ffffff"/>
        <!-- Child Topknot Buns with Red Ribbons (双丫总角红头绳) -->
        <circle cx="75" cy="85" r="28" fill="#fed7aa"/>
        <circle cx="55" cy="55" r="12" fill="#1e293b"/>
        <circle cx="95" cy="55" r="12" fill="#1e293b"/>
        <circle cx="55" cy="55" r="4" fill="#dc2626"/>
        <circle cx="95" cy="55" r="4" fill="#dc2626"/>
        <!-- Wide Astonished Curious Eyes (惊讶顿悟之神采) -->
        <circle cx="65" cy="85" r="4" fill="#1e293b"/>
        <circle cx="85" cy="85" r="4" fill="#1e293b"/>
        <ellipse cx="75" cy="100" rx="6" ry="8" fill="#dc2626"/>
        <!-- Book Scroll in Hand (手中握着未读完的书卷) -->
        <rect x="0" y="190" width="30" height="70" rx="6" fill="#fef08a" stroke="#ca8a04" stroke-width="2"/>
        <circle cx="25" cy="210" r="10" fill="#fed7aa"/>
      </g>

      <!-- Red Chinese Seal (恒 - 铁杵成针/持之以恒) with Vector Path -->
      <g transform="translate(1220, 80)" filter="url(#dropShadow)">
        <rect x="0" y="0" width="55" height="55" rx="8" fill="#dc2626"/>
        <g stroke="#ffffff" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" fill="none">
          <!-- 忄 -->
          <line x1="18" y1="14" x2="18" y2="44"/>
          <path d="M14,24 L18,28"/>
          <path d="M22,24 L18,28"/>
          <!-- 亘 -->
          <line x1="26" y1="16" x2="42" y2="16"/>
          <rect x="28" y="22" width="12" height="14" rx="2"/>
          <line x1="28" y1="29" x2="40" y2="29"/>
          <line x1="24" y1="42" x2="44" y2="42"/>
        </g>
      </g>
    `
  },

  // ==========================================
  // 6. idiom_jingweitianhai: 精卫填海
  // ==========================================
  {
    id: "idiom_jingweitianhai",
    title: "精卫填海",
    defs: `
      <linearGradient id="ocean_dawn" x1="0%" y1="0%" x2="0%" y2="100%">
        <stop offset="0%" stop-color="#fdba74"/>
        <stop offset="40%" stop-color="#f472b6"/>
        <stop offset="70%" stop-color="#38bdf8"/>
        <stop offset="100%" stop-color="#1e3a8a"/>
      </linearGradient>
      <linearGradient id="wave_grad" x1="0%" y1="0%" x2="0%" y2="100%">
        <stop offset="0%" stop-color="#0284c7"/>
        <stop offset="50%" stop-color="#0369a1"/>
        <stop offset="100%" stop-color="#0c4a6e"/>
      </linearGradient>
      <linearGradient id="bird_wing" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="#ef4444"/>
        <stop offset="50%" stop-color="#f59e0b"/>
        <stop offset="100%" stop-color="#10b981"/>
      </linearGradient>
    `,
    content: `
      <!-- Vast East Sea Ocean & Radiant Dawn (波澜壮阔之东海与东方朝晖) -->
      <rect width="1376" height="768" fill="url(#ocean_dawn)"/>
      <circle cx="1180" cy="220" r="110" fill="#fde047" opacity="0.8" filter="url(#softGlow)"/>

      <!-- Surging Foamy Ocean Waves (翻滚汹涌的千重海浪) -->
      <g fill="url(#wave_grad)">
        <path d="M0,460 Q160,400 320,460 T640,440 T960,470 T1280,430 T1376,460 L1376,768 L0,768 Z"/>
        <path d="M0,520 Q200,440 440,510 T880,480 T1376,520 L1376,768 L0,768 Z" opacity="0.9"/>
      </g>
      <!-- White Wave Crests (洁白翻滚浪花) -->
      <path d="M140,430 Q220,380 300,440" stroke="#ffffff" stroke-width="8" stroke-linecap="round" fill="none"/>
      <path d="M500,420 Q600,360 700,430" stroke="#ffffff" stroke-width="10" stroke-linecap="round" fill="none"/>
      <path d="M860,440 Q960,390 1060,450" stroke="#ffffff" stroke-width="8" stroke-linecap="round" fill="none"/>

      <!-- Mythical Jingwei Bird Soaring Across Ocean (神鸟精卫展五彩之翼翱翔海空) -->
      <g transform="translate(480, 140)" filter="url(#dropShadow)">
        <!-- Beautiful Tail Feathers (华丽修长的五彩凤尾) -->
        <path d="M-60,160 Q-160,220 -200,320 Q-140,240 -80,180 Z" fill="#3b82f6"/>
        <path d="M-50,170 Q-120,260 -150,350 Q-100,260 -60,190 Z" fill="#10b981"/>
        <path d="M-40,180 Q-80,270 -100,360 Q-60,270 -40,190 Z" fill="#f59e0b"/>

        <!-- Bird Plump Body (圆润矫健的赤色鸟身) -->
        <ellipse cx="60" cy="140" rx="90" ry="50" fill="#dc2626" transform="rotate(-15 60 140)"/>
        <!-- Gorgeous Multicolored Wings (张开翱翔的斑斓彩翼) -->
        <path d="M30,120 Q120,-40 220,-80 Q180,40 100,120 Z" fill="url(#bird_wing)" filter="url(#softGlow)"/>
        <path d="M60,130 Q160,-10 240,-40 Q200,60 130,130 Z" fill="#3b82f6" opacity="0.7"/>

        <!-- Bird Head with Fiery Crest (花纹如火的头顶红冠) -->
        <circle cx="150" cy="110" r="32" fill="#ef4444"/>
        <polygon points="150,80 140,50 160,65 175,45 170,75" fill="#f59e0b"/>
        <!-- Bright Determined Black Eye -->
        <circle cx="160" cy="105" r="6" fill="#ffffff"/>
        <circle cx="162" cy="105" r="3" fill="#0f172a"/>

        <!-- Golden Beak Clutching a Pebble & Twig (口衔西山木石，坚毅不绝) -->
        <polygon points="180,110 230,120 180,130" fill="#f59e0b"/>
        <!-- Twig (小树枝) -->
        <line x1="210" y1="100" x2="210" y2="150" stroke="#78350f" stroke-width="6" stroke-linecap="round"/>
        <!-- Small Stone Pebble Falling or Held (坚硬小石子) -->
        <ellipse cx="215" cy="155" rx="10" ry="8" fill="#64748b" stroke="#475569" stroke-width="2"/>
      </g>

      <!-- Falling Stones Rippling Into Waves (投入巨浪激起晶莹水花) -->
      <g transform="translate(680, 360)">
        <ellipse cx="60" cy="60" rx="12" ry="10" fill="#475569" filter="url(#dropShadow)"/>
        <ellipse cx="140" cy="120" rx="10" ry="8" fill="#64748b" filter="url(#dropShadow)"/>
        <!-- Splashing Water Droplets -->
        <circle cx="50" cy="35" r="4" fill="#ffffff"/>
        <circle cx="75" cy="40" r="5" fill="#ffffff"/>
        <circle cx="150" cy="95" r="4" fill="#ffffff"/>
      </g>

      <!-- Red Chinese Seal (坚 - 精卫填海/坚韧不拔) with Vector Path -->
      <g transform="translate(1220, 80)" filter="url(#dropShadow)">
        <rect x="0" y="0" width="55" height="55" rx="8" fill="#dc2626"/>
        <g stroke="#ffffff" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" fill="none">
          <!-- 坚 上半部 -->
          <line x1="14" y1="18" x2="28" y2="18"/>
          <line x1="20" y1="14" x2="20" y2="28"/>
          <line x1="16" y1="28" x2="28" y2="28"/>
          <path d="M32,14 L42,14 L40,28 L32,28 Z"/>
          <!-- 土 下半部 -->
          <line x1="18" y1="36" x2="38" y2="36"/>
          <line x1="28" y1="28" x2="28" y2="44"/>
          <line x1="12" y1="44" x2="44" y2="44"/>
        </g>
      </g>
    `
  },

  // ==========================================
  // 7. idiom_shunengshengqiao: 熟能生巧
  // ==========================================
  {
    id: "idiom_shunengshengqiao",
    title: "熟能生巧",
    defs: `
      <linearGradient id="yard_sky" x1="0%" y1="0%" x2="0%" y2="100%">
        <stop offset="0%" stop-color="#bae6fd"/>
        <stop offset="50%" stop-color="#fed7aa"/>
        <stop offset="100%" stop-color="#fef08a"/>
      </linearGradient>
      <linearGradient id="oil_stream" x1="0%" y1="0%" x2="0%" y2="100%">
        <stop offset="0%" stop-color="#ffffff"/>
        <stop offset="30%" stop-color="#facc15"/>
        <stop offset="100%" stop-color="#ca8a04"/>
      </linearGradient>
    `,
    content: `
      <!-- Ancient Archery Ground & Market Lawn (古代校场与市集杨柳) -->
      <rect width="1376" height="768" fill="url(#yard_sky)"/>
      <rect x="0" y="520" width="1376" height="248" fill="#86efac"/>

      <!-- Distant Archery Target on Stand (远处的箭靶与百步穿杨红心) -->
      <g transform="translate(180, 360)" filter="url(#dropShadow)">
        <polygon points="40,160 30,220 50,220" fill="#78350f"/>
        <polygon points="120,160 110,220 130,220" fill="#78350f"/>
        <circle cx="80" cy="100" r="60" fill="#fef08a" stroke="#d97706" stroke-width="8"/>
        <circle cx="80" cy="100" r="40" fill="#ffffff" stroke="#dc2626" stroke-width="6"/>
        <circle cx="80" cy="100" r="20" fill="#dc2626"/>
        <!-- Arrows Stuck in Bullseye (正中红心的箭矢) -->
        <line x1="80" y1="100" x2="30" y2="70" stroke="#1e293b" stroke-width="4"/>
        <polygon points="30,70 20,60 35,55" fill="#dc2626"/>
      </g>

      <!-- Old Oil Vendor with Gourd and Coin (卖油翁凝神沥油、绝技惊人) -->
      <g transform="translate(480, 140)" filter="url(#dropShadow)">
        <!-- Old Vendor in Grey Linen Robe (老翁布袍短衫) -->
        <path d="M120,200 L60,420 L200,420 L160,200 Z" fill="#64748b"/>
        <!-- Elderly Face with White Bun & Smile (须发皆白、从容微笑) -->
        <circle cx="140" cy="140" r="32" fill="#fed7aa"/>
        <circle cx="140" cy="105" r="16" fill="#f1f5f9"/>
        <path d="M130,140 Q135,145 140,140" stroke="#78350f" stroke-width="3" fill="none"/>
        <path d="M132,155 Q140,162 148,155" stroke="#78350f" stroke-width="3" fill="none"/>

        <!-- High-Lifted Wooden Oil Ladle (高高举起木油勺) -->
        <path d="M150,200 L240,60 L270,80" stroke="#64748b" stroke-width="22" stroke-linecap="round" fill="none"/>
        <ellipse cx="270" cy="70" rx="20" ry="14" fill="#92400e"/>

        <!-- Gourd Bottle on Ground (地面放置的大葫芦) -->
        <g transform="translate(240, 360)">
          <!-- Gourd Body -->
          <circle cx="30" cy="65" r="35" fill="#b45309" stroke="#78350f" stroke-width="3"/>
          <circle cx="30" cy="25" r="22" fill="#d97706" stroke="#78350f" stroke-width="3"/>
          <rect x="22" y="0" width="16" height="12" rx="2" fill="#78350f"/>
          <!-- Ancient Copper Coin with Square Hole on Top (葫芦口覆盖的有孔铜钱) -->
          <circle cx="30" cy="0" r="18" fill="#eab308" stroke="#a16207" stroke-width="2"/>
          <rect x="24" y="-6" width="12" height="12" fill="#78350f"/>
        </g>

        <!-- Golden Oil Arc Pouring Straight Through Coin Hole (金黄油线如丝笔直穿钱孔而入) -->
        <path d="M265,75 Q270,180 270,355" stroke="url(#oil_stream)" stroke-width="5" stroke-linecap="round" fill="none" filter="url(#softGlow)"/>
        <circle cx="270" cy="355" r="4" fill="#fef08a" filter="url(#softGlow)"/>
      </g>

      <!-- Archer Chen Yaozi Astonished with Bow (神射手陈尧咨执弓惊叹折服) -->
      <g transform="translate(900, 240)" filter="url(#dropShadow)">
        <!-- Crimson Hanfu & Archer's Leather Bracer (红袍劲装与射箭护臂) -->
        <path d="M70,160 L20,380 L160,380 L120,160 Z" fill="#991b1b"/>
        <rect x="60" y="180" width="80" height="20" fill="#f59e0b"/>
        <!-- Head with General/Officer Cap (武官冠帽) -->
        <circle cx="95" cy="110" r="32" fill="#fed7aa"/>
        <rect x="75" y="70" width="40" height="25" fill="#1e293b"/>
        <!-- Wide Eyes in Full Admiration (心服口服、连连赞叹) -->
        <circle cx="85" cy="110" r="5" fill="#1e293b"/>
        <circle cx="105" cy="110" r="5" fill="#1e293b"/>
        <ellipse cx="95" cy="125" rx="6" ry="8" fill="#dc2626"/>

        <!-- Holding Beautiful Recurve Bow (手握弯弓) -->
        <path d="M20,180 Q-20,280 20,380" stroke="#78350f" stroke-width="12" stroke-linecap="round" fill="none"/>
        <line x1="20" y1="180" x2="20" y2="380" stroke="#cbd5e1" stroke-width="3"/>
        <circle cx="18" cy="280" r="14" fill="#fed7aa"/>
      </g>

      <!-- Red Chinese Seal (巧 - 熟能生巧) with Vector Path -->
      <g transform="translate(1220, 80)" filter="url(#dropShadow)">
        <rect x="0" y="0" width="55" height="55" rx="8" fill="#dc2626"/>
        <g stroke="#ffffff" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" fill="none">
          <!-- 工 -->
          <line x1="12" y1="18" x2="26" y2="18"/>
          <line x1="19" y1="18" x2="19" y2="38"/>
          <line x1="12" y1="38" x2="26" y2="38"/>
          <!-- 丂 -->
          <line x1="30" y1="18" x2="44" y2="18"/>
          <line x1="37" y1="18" x2="37" y2="30"/>
          <path d="M37,30 Q42,36 34,42"/>
        </g>
      </g>
    `
  },

  // ==========================================
  // 8. idiom_qirenyoutian: 杞人忧天
  // ==========================================
  {
    id: "idiom_qirenyoutian",
    title: "杞人忧天",
    defs: `
      <linearGradient id="peace_sky" x1="0%" y1="0%" x2="0%" y2="100%">
        <stop offset="0%" stop-color="#0284c7"/>
        <stop offset="40%" stop-color="#38bdf8"/>
        <stop offset="80%" stop-color="#bae6fd"/>
        <stop offset="100%" stop-color="#fef08a"/>
      </linearGradient>
    `,
    content: `
      <!-- Vast Sunny Blue Sky with Auspicious Ruyi Clouds (辽阔安宁晴空与吉祥如意云) -->
      <rect width="1376" height="768" fill="url(#peace_sky)"/>
      <circle cx="688" cy="180" r="90" fill="#fde047" opacity="0.9" filter="url(#softGlow)"/>

      <!-- Radiant Sunbeams (万道金光普照大地) -->
      <line x1="688" y1="180" x2="488" y2="0" stroke="#ffffff" stroke-width="4" opacity="0.5"/>
      <line x1="688" y1="180" x2="888" y2="0" stroke="#ffffff" stroke-width="4" opacity="0.5"/>
      <line x1="688" y1="180" x2="388" y2="180" stroke="#ffffff" stroke-width="4" opacity="0.5"/>
      <line x1="688" y1="180" x2="988" y2="180" stroke="#ffffff" stroke-width="4" opacity="0.5"/>

      <!-- Fluffy White Clouds (平安祥和白云朵朵) -->
      <g fill="#ffffff" opacity="0.85" filter="url(#softGlow)">
        <ellipse cx="280" cy="160" rx="140" ry="50"/>
        <circle cx="220" cy="140" r="50"/>
        <circle cx="340" cy="140" r="55"/>
        <ellipse cx="1080" cy="160" rx="140" ry="50"/>
        <circle cx="1020" cy="140" r="50"/>
        <circle cx="1140" cy="140" r="55"/>
      </g>

      <!-- Solid Fertile Earth with Ancient Pine Tree (坚实厚重大地与挺拔青松) -->
      <rect x="0" y="520" width="1376" height="248" fill="#15803d"/>
      <g transform="translate(140, 220)" filter="url(#dropShadow)">
        <path d="M120,400 Q140,280 160,180" stroke="#78350f" stroke-width="28" fill="none"/>
        <ellipse cx="160" cy="140" rx="110" ry="45" fill="#166534"/>
        <ellipse cx="140" cy="100" rx="90" ry="40" fill="#15803d"/>
        <ellipse cx="180" cy="60" rx="70" ry="30" fill="#22c55e"/>
      </g>

      <!-- The Man from Qi Who is Relieved & Smiling (杞国人听后愁眉舒展、喜笑颜开) -->
      <g transform="translate(480, 260)" filter="url(#dropShadow)">
        <!-- Green Linen Robe (绿袍短衫) -->
        <path d="M60,160 L10,380 L150,380 L110,160 Z" fill="#059669"/>
        <!-- Relieved Smiling Face (恍然大悟、欣喜展颜) -->
        <circle cx="85" cy="110" r="32" fill="#fed7aa"/>
        <circle cx="85" cy="70" r="14" fill="#1e293b"/>
        <!-- Joyful Eyes and Big Grin -->
        <path d="M72,110 Q78,102 84,110" stroke="#1e293b" stroke-width="3" fill="none"/>
        <path d="M96,110 Q102,102 108,110" stroke="#1e293b" stroke-width="3" fill="none"/>
        <path d="M78,125 Q90,140 102,125" stroke="#dc2626" stroke-width="4" fill="none"/>
        <!-- Hands Spread in Relief (双手舒展、心头大石落地) -->
        <line x1="60" y1="180" x2="-10" y2="210" stroke="#059669" stroke-width="18" stroke-linecap="round"/>
        <circle cx="-15" cy="210" r="12" fill="#fed7aa"/>
      </g>

      <!-- Wise Friend in Purple Scholar Robe Explaining (智者朋友纶巾羽扇、微笑指天论理) -->
      <g transform="translate(740, 240)" filter="url(#dropShadow)">
        <!-- Purple Scholar Hanfu Robe (紫衣儒雅长袍) -->
        <path d="M80,180 L20,400 L180,400 L140,180 Z" fill="#6d28d9"/>
        <polygon points="60,200 90,270 120,200" fill="#ffffff"/>
        <!-- Scholar Cap (头戴纶巾) -->
        <circle cx="110" cy="120" r="32" fill="#fed7aa"/>
        <rect x="88" y="75" width="44" height="28" fill="#1e293b"/>
        <!-- Friendly Wise Expression (神态从容笃定) -->
        <circle cx="100" cy="120" r="4" fill="#1e293b"/>
        <circle cx="120" cy="120" r="4" fill="#1e293b"/>
        <path d="M102,135 Q110,142 118,135" stroke="#78350f" stroke-width="3" fill="none"/>

        <!-- Pointing Arm Towards Sky (一臂高抬从容指向浩瀚长空) -->
        <path d="M120,190 L180,100 L210,70" stroke="#6d28d9" stroke-width="22" stroke-linecap="round" fill="none"/>
        <circle cx="215" cy="65" r="14" fill="#fed7aa"/>
        <!-- Other Hand Patting Qi Man's Shoulder (另一手亲切搭在朋友肩头) -->
        <path d="M80,190 L0,200 L-40,205" stroke="#6d28d9" stroke-width="22" stroke-linecap="round" fill="none"/>
        <circle cx="-45" cy="205" r="14" fill="#fed7aa"/>
      </g>

      <!-- Red Chinese Seal (泰 - 杞人忧天/安如泰山) with Vector Path -->
      <g transform="translate(1220, 80)" filter="url(#dropShadow)">
        <rect x="0" y="0" width="55" height="55" rx="8" fill="#dc2626"/>
        <g stroke="#ffffff" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" fill="none">
          <!-- 泰 上半部 (大 + 禾简化) -->
          <line x1="14" y1="16" x2="42" y2="16"/>
          <path d="M28,12 L18,28"/>
          <path d="M28,16 L38,28"/>
          <line x1="14" y1="24" x2="22" y2="24"/>
          <line x1="34" y1="24" x2="42" y2="24"/>
          <!-- 氺 下半部 (水) -->
          <line x1="28" y1="28" x2="28" y2="44"/>
          <path d="M20,32 L28,36"/>
          <path d="M18,44 L28,38"/>
          <path d="M36,32 L28,36"/>
          <path d="M38,44 L28,38"/>
        </g>
      </g>
    `
  }
];

console.log(`Generating ${IDIOMS_BATCH5.length} new classical Chinese idiom illustrations...`);

for (const item of IDIOMS_BATCH5) {
  console.log(`\nRendering ${item.id} (${item.title})...`);
  const svgContent = wrapSvg(item.content, item.defs);
  const svgPath = path.join(TMP_DIR, `${item.id}.svg`);
  const jpgPath = path.join(OUTPUT_DIR, `${item.id}.jpg`);
  const webpPath = path.join(OUTPUT_DIR, `${item.id}.webp`);

  fs.writeFileSync(svgPath, svgContent);
  execSync(`/Applications/ServBay/bin/magick "${svgPath}" -density 150 -resize 1376x768! -quality 95 "${jpgPath}"`);
  execSync(`/Applications/ServBay/bin/cwebp -q 88 "${jpgPath}" -o "${webpPath}"`);

  const statJpg = fs.statSync(jpgPath);
  const statWebp = fs.statSync(webpPath);
  console.log(`✓ Success ${item.id}: JPG (${(statJpg.size/1024).toFixed(1)} KB), WebP (${(statWebp.size/1024).toFixed(1)} KB)`);
}

console.log("\nAll 8 classical Chinese idiom illustrations generated successfully!");
