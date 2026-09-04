import fs from "fs";
import path from "path";
import { execSync } from "child_process";

const OUTPUT_DIR = path.resolve("assets/images");
const TMP_DIR = "/tmp/literacy_storybook_p1";

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

const STORIES = [
  // ==========================================
  // 1. story_share_honey_p1: 小熊抱蜜罐，你好小兔请你吃
  // ==========================================
  {
    id: "story_share_honey_p1",
    title: "小熊学会了分享 - 第1页",
    defs: `
      <linearGradient id="sky_sh1" x1="0%" y1="0%" x2="0%" y2="100%">
        <stop offset="0%" stop-color="#bae6fd"/>
        <stop offset="60%" stop-color="#fef08a"/>
        <stop offset="100%" stop-color="#bbf7d0"/>
      </linearGradient>
      <linearGradient id="honey_jar" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="#fbbf24"/>
        <stop offset="60%" stop-color="#d97706"/>
        <stop offset="100%" stop-color="#92400e"/>
      </linearGradient>
    `,
    content: `
      <!-- Sunny Chinese Countryside & Bamboo Forest -->
      <rect width="1376" height="768" fill="url(#sky_sh1)"/>
      <circle cx="1180" cy="140" r="65" fill="#fde047" filter="url(#softGlow)"/>

      <!-- Distant Hills & Bamboo Grove (远山翠竹) -->
      <path d="M0,450 Q300,320 650,420 T1376,380 L1376,768 L0,768 Z" fill="#86efac" opacity="0.7"/>
      <path d="M0,520 Q420,410 880,510 T1376,460 L1376,768 L0,768 Z" fill="#4ade80"/>

      <!-- Chinese Bamboo Grove on Left (青翠竹林) -->
      <g stroke="#15803d" stroke-width="12" stroke-linecap="round">
        <line x1="120" y1="180" x2="120" y2="600"/>
        <line x1="180" y1="220" x2="180" y2="620"/>
        <line x1="240" y1="160" x2="240" y2="600"/>
      </g>
      <!-- Bamboo Joints & Leaves -->
      <path d="M120,280 Q70,260 50,300 M120,380 Q170,360 210,390 M180,320 Q230,290 260,330" stroke="#16a34a" stroke-width="6" fill="none"/>

      <!-- Grassy Ground with Wildflowers (如茵绿草与山花) -->
      <rect x="0" y="580" width="1376" height="188" fill="#22c55e"/>
      <circle cx="380" cy="660" r="12" fill="#f43f5e"/>
      <circle cx="410" cy="680" r="10" fill="#fbbf24"/>
      <circle cx="850" cy="650" r="14" fill="#ec4899"/>
      <circle cx="1100" cy="670" r="12" fill="#38bdf8"/>

      <!-- Cute Bear Hugging Honey Jar in Chinese Vest (穿中式斜襟马甲的憨厚小熊) -->
      <g transform="translate(420, 280)" filter="url(#dropShadow)">
        <!-- Bear Body -->
        <ellipse cx="160" cy="260" rx="90" ry="110" fill="#92400e"/>
        <!-- Chinese Tangzhuang Vest (中式红色盘扣小马甲) -->
        <path d="M80,210 L240,210 L250,340 L70,340 Z" fill="#dc2626"/>
        <path d="M80,210 L160,280 L180,210" stroke="#fef08a" stroke-width="8" fill="none"/>
        <circle cx="160" cy="290" r="6" fill="#facc15"/>
        <circle cx="160" cy="320" r="6" fill="#facc15"/>

        <!-- Bear Head & Round Ears -->
        <circle cx="90" cy="80" r="32" fill="#92400e"/>
        <circle cx="90" cy="80" r="18" fill="#fed7aa"/>
        <circle cx="230" cy="80" r="32" fill="#92400e"/>
        <circle cx="230" cy="80" r="18" fill="#fed7aa"/>
        <circle cx="160" cy="130" r="70" fill="#92400e"/>
        <!-- Snout -->
        <ellipse cx="160" cy="148" rx="34" ry="24" fill="#fed7aa"/>
        <ellipse cx="160" cy="138" rx="14" ry="10" fill="#451a03"/>
        <path d="M160,148 L160,158 M150,158 Q160,166 170,158" stroke="#451a03" stroke-width="4" stroke-linecap="round" fill="none"/>
        <!-- Eyes & Cheeks -->
        <circle cx="130" cy="120" r="7" fill="#0f172a"/>
        <circle cx="132" cy="118" r="2.5" fill="#ffffff"/>
        <circle cx="190" cy="120" r="7" fill="#0f172a"/>
        <circle cx="192" cy="118" r="2.5" fill="#ffffff"/>
        <circle cx="115" cy="138" r="10" fill="#f87171" opacity="0.6"/>
        <circle cx="205" cy="138" r="10" fill="#f87171" opacity="0.6"/>

        <!-- Clay Honey Jar (大陶罐，写有中文“蜜”) -->
        <g transform="translate(110, 240)">
          <ellipse cx="50" cy="65" rx="55" ry="60" fill="url(#honey_jar)" stroke="#78350f" stroke-width="4"/>
          <!-- Jar Rim & Lid with Red Cloth -->
          <ellipse cx="50" cy="10" rx="38" ry="12" fill="#b45309"/>
          <path d="M20,10 L80,10 L88,-5 L12,-5 Z" fill="#ef4444"/>
          <!-- Golden Flowing Honey (流淌的纯香金蜜) -->
          <path d="M35,10 Q50,45 65,10 Z" fill="#fef08a"/>
          <!-- Chinese character 蜜 on jar belly -->
          <circle cx="50" cy="68" r="22" fill="#fef2f2"/>
          <g stroke="#dc2626" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" fill="none">
            <!-- 宀 -->
            <line x1="50" y1="52" x2="50" y2="55"/>
            <line x1="38" y1="56" x2="62" y2="56"/>
            <!-- 必 -->
            <line x1="42" y1="62" x2="58" y2="62"/>
            <!-- 虫 -->
            <rect x="42" y="68" width="16" height="8"/>
            <line x1="50" y1="65" x2="50" y2="80"/>
            <line x1="42" y1="80" x2="58" y2="80"/>
          </g>
        </g>
        <!-- Bear Paws Hugging Jar -->
        <circle cx="85" cy="300" r="24" fill="#92400e"/>
        <circle cx="235" cy="300" r="24" fill="#92400e"/>
      </g>

      <!-- Cute White Bunny with Chinese Floral Scarf (佩戴小碎花围巾的乖巧小白兔) -->
      <g transform="translate(860, 360)" filter="url(#dropShadow)">
        <!-- Long Ears with Pink Inners -->
        <ellipse cx="65" cy="40" rx="14" ry="46" fill="#ffffff" transform="rotate(-15, 65, 40)"/>
        <ellipse cx="65" cy="40" rx="8" ry="34" fill="#fbcfe8" transform="rotate(-15, 65, 40)"/>
        <ellipse cx="105" cy="40" rx="14" ry="46" fill="#ffffff" transform="rotate(15, 105, 40)"/>
        <ellipse cx="105" cy="40" rx="8" ry="34" fill="#fbcfe8" transform="rotate(15, 105, 40)"/>

        <!-- Bunny Head -->
        <circle cx="85" cy="115" r="45" fill="#ffffff"/>
        <ellipse cx="85" cy="124" rx="8" ry="6" fill="#f43f5e"/>
        <!-- Eyes & Rosy Cheeks -->
        <circle cx="70" cy="108" r="5" fill="#0f172a"/>
        <circle cx="100" cy="108" r="5" fill="#0f172a"/>
        <circle cx="58" cy="124" r="8" fill="#fca5a5" opacity="0.6"/>
        <circle cx="112" cy="124" r="8" fill="#fca5a5" opacity="0.6"/>

        <!-- Red Silk Scarf (中国红围巾) -->
        <path d="M55,150 Q85,165 115,150 L110,185 Q85,175 60,185 Z" fill="#ef4444"/>

        <!-- Bunny Body -->
        <ellipse cx="85" cy="220" rx="50" ry="60" fill="#ffffff"/>
        <!-- Front Paws holding out in gratitude -->
        <ellipse cx="65" cy="190" rx="14" ry="10" fill="#ffffff"/>
        <ellipse cx="105" cy="190" rx="14" ry="10" fill="#ffffff"/>
      </g>

      <!-- Red Chinese Seal (享 - 分享之乐) with Vector Path -->
      <g transform="translate(1220, 80)" filter="url(#dropShadow)">
        <rect x="0" y="0" width="55" height="55" rx="8" fill="#dc2626"/>
        <g stroke="#ffffff" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" fill="none">
          <!-- 享 -->
          <line x1="28" y1="12" x2="28" y2="17"/>
          <line x1="16" y1="17" x2="40" y2="17"/>
          <rect x="20" y="21" width="16" height="8"/>
          <!-- 子 -->
          <line x1="18" y1="33" x2="38" y2="33"/>
          <path d="M36,33 L26,40 L38,40 Q38,44 32,44"/>
          <line x1="14" y1="38" x2="42" y2="38"/>
        </g>
      </g>
    `
  },

  // ==========================================
  // 2. story_share_honey_p2: 小兔和小鸟都来了，盛在青瓷碗
  // ==========================================
  {
    id: "story_share_honey_p2",
    title: "小熊学会了分享 - 第2页",
    defs: `
      <linearGradient id="sky_sh2" x1="0%" y1="0%" x2="0%" y2="100%">
        <stop offset="0%" stop-color="#bae6fd"/>
        <stop offset="60%" stop-color="#fed7aa"/>
        <stop offset="100%" stop-color="#dcfce7"/>
      </linearGradient>
      <linearGradient id="celadon_bowl" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="#a7f3d0"/>
        <stop offset="60%" stop-color="#34d399"/>
        <stop offset="100%" stop-color="#059669"/>
      </linearGradient>
    `,
    content: `
      <!-- Chinese Garden Courtyard Background -->
      <rect width="1376" height="768" fill="url(#sky_sh2)"/>

      <!-- Moon Gate & Wall (中式园林月亮门与白墙黛瓦) -->
      <g filter="url(#dropShadow)">
        <rect x="0" y="260" width="1376" height="508" fill="#f8fafc"/>
        <path d="M0,260 L1376,260 L1376,285 L0,285 Z" fill="#64748b"/>
        <!-- Eaves with Chinese roof tiles -->
        <path d="M40,260 L1336,260 L1376,230 L0,230 Z" fill="#334155"/>
        <!-- Moon Gate Arch (古典月亮门) -->
        <path d="M480,768 L480,500 A208,208 0 0,1 896,500 L896,768 Z" fill="#e2e8f0"/>
        <!-- Distant Garden Bamboo through Moon Gate -->
        <circle cx="688" cy="460" r="180" fill="#bbf7d0" opacity="0.6"/>
        <line x1="640" y1="360" x2="640" y2="600" stroke="#15803d" stroke-width="8"/>
        <line x1="720" y1="380" x2="720" y2="620" stroke="#15803d" stroke-width="8"/>
      </g>

      <!-- Classical Chinese Stone Table & Stools (中式石桌石凳) -->
      <g transform="translate(488, 480)" filter="url(#dropShadow)">
        <ellipse cx="200" cy="140" rx="220" ry="60" fill="#94a3b8"/>
        <ellipse cx="200" cy="130" rx="210" ry="50" fill="#cbd5e1"/>
        <rect x="175" y="140" width="50" height="120" fill="#64748b"/>

        <!-- Celadon Porcelain Bowls filled with Golden Honey (青瓷小碗盛满金黄蜜糖) -->
        <!-- Left Bowl for Bunny -->
        <g transform="translate(60, 90)">
          <ellipse cx="40" cy="30" rx="30" ry="18" fill="url(#celadon_bowl)"/>
          <ellipse cx="40" cy="24" rx="24" ry="12" fill="#fef08a"/>
        </g>
        <!-- Center Bowl for Little Bear -->
        <g transform="translate(160, 80)">
          <ellipse cx="40" cy="36" rx="36" ry="22" fill="url(#celadon_bowl)"/>
          <ellipse cx="40" cy="28" rx="28" ry="15" fill="#fef08a"/>
        </g>
        <!-- Right Bowl for Bird -->
        <g transform="translate(260, 90)">
          <ellipse cx="40" cy="30" rx="30" ry="18" fill="url(#celadon_bowl)"/>
          <ellipse cx="40" cy="24" rx="24" ry="12" fill="#fef08a"/>
        </g>
      </g>

      <!-- Happy Little Bear Pouring Honey with Wooden Spoon (小熊拿木勺添蜜) -->
      <g transform="translate(240, 360)" filter="url(#dropShadow)">
        <ellipse cx="120" cy="200" rx="80" ry="100" fill="#92400e"/>
        <!-- Vest -->
        <path d="M50,150 L190,150 L200,280 L40,280 Z" fill="#dc2626"/>
        <circle cx="120" cy="90" r="55" fill="#92400e"/>
        <circle cx="68" cy="55" r="24" fill="#92400e"/>
        <circle cx="172" cy="55" r="24" fill="#92400e"/>
        <ellipse cx="120" cy="105" rx="26" ry="18" fill="#fed7aa"/>
        <ellipse cx="120" cy="98" rx="10" ry="7" fill="#451a03"/>
        <path d="M112,108 Q120,116 128,108" stroke="#451a03" stroke-width="3" fill="none"/>
        <circle cx="98" cy="85" r="6" fill="#0f172a"/>
        <circle cx="142" cy="85" r="6" fill="#0f172a"/>
        <!-- Wooden Spoon in Hand -->
        <line x1="160" y1="180" x2="270" y2="190" stroke="#78350f" stroke-width="8" stroke-linecap="round"/>
        <ellipse cx="275" cy="190" rx="16" ry="12" fill="#fef08a" stroke="#78350f" stroke-width="3"/>
      </g>

      <!-- White Bunny Sitting & Smiling (乖巧小白兔) -->
      <g transform="translate(860, 420)" filter="url(#dropShadow)">
        <ellipse cx="70" cy="160" rx="45" ry="55" fill="#ffffff"/>
        <circle cx="70" cy="90" r="40" fill="#ffffff"/>
        <ellipse cx="55" cy="25" rx="12" ry="38" fill="#ffffff"/>
        <ellipse cx="55" cy="25" rx="6" ry="28" fill="#fbcfe8"/>
        <ellipse cx="85" cy="25" rx="12" ry="38" fill="#ffffff"/>
        <ellipse cx="85" cy="25" rx="6" ry="28" fill="#fbcfe8"/>
        <circle cx="58" cy="85" r="5" fill="#0f172a"/>
        <circle cx="82" cy="85" r="5" fill="#0f172a"/>
        <path d="M64,100 Q70,106 76,100" stroke="#f43f5e" stroke-width="3" fill="none"/>
      </g>

      <!-- Cute Colorful Magpie Bird on Stone Table (落在石桌上的吉祥喜鹊) -->
      <g transform="translate(740, 450)" filter="url(#dropShadow)">
        <!-- Bird Body -->
        <ellipse cx="40" cy="40" rx="22" ry="16" fill="#0284c7"/>
        <circle cx="56" cy="30" r="14" fill="#0284c7"/>
        <circle cx="58" cy="28" r="3" fill="#ffffff"/>
        <!-- Orange Beak -->
        <polygon points="68,28 78,32 68,36" fill="#f97316"/>
        <!-- Tail -->
        <polygon points="20,40 0,32 5,48" fill="#0369a1"/>
        <ellipse cx="36" cy="44" rx="14" ry="10" fill="#ffffff"/>
      </g>

      <!-- Red Chinese Seal (友 - 友爱互助) with Vector Path -->
      <g transform="translate(1220, 80)" filter="url(#dropShadow)">
        <rect x="0" y="0" width="55" height="55" rx="8" fill="#dc2626"/>
        <g stroke="#ffffff" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" fill="none">
          <!-- 友 -->
          <line x1="16" y1="18" x2="38" y2="18"/>
          <path d="M26,18 L16,42"/>
          <!-- 又 -->
          <path d="M22,28 L38,28 L28,36 L40,44"/>
          <path d="M38,28 L24,42"/>
        </g>
      </g>
    `
  },

  // ==========================================
  // 3. story_share_honey_p3: 懂得分享真正好，我们一起哈哈笑
  // ==========================================
  {
    id: "story_share_honey_p3",
    title: "小熊学会了分享 - 第3页",
    defs: `
      <linearGradient id="sky_sh3" x1="0%" y1="0%" x2="0%" y2="100%">
        <stop offset="0%" stop-color="#fef08a"/>
        <stop offset="50%" stop-color="#fed7aa"/>
        <stop offset="100%" stop-color="#fbcfe8"/>
      </linearGradient>
    `,
    content: `
      <!-- Blooming Peach Blossom Courtyard (春日暖阳桃花盛开大合照) -->
      <rect width="1376" height="768" fill="url(#sky_sh3)"/>
      <circle cx="688" cy="220" r="140" fill="#fde047" opacity="0.3" filter="url(#softGlow)"/>

      <!-- Festive Red Chinese Lanterns (大红灯笼高高挂) -->
      <g filter="url(#dropShadow)">
        <!-- Left Lantern -->
        <g transform="translate(180, 40)">
          <line x1="60" y1="0" x2="60" y2="40" stroke="#b91c1c" stroke-width="4"/>
          <ellipse cx="60" cy="90" rx="42" ry="50" fill="#dc2626"/>
          <ellipse cx="60" cy="90" rx="24" ry="50" fill="#ef4444"/>
          <rect x="42" y="38" width="36" height="8" fill="#facc15"/>
          <rect x="42" y="134" width="36" height="8" fill="#facc15"/>
          <line x1="60" y1="142" x2="60" y2="190" stroke="#facc15" stroke-width="4"/>
        </g>
        <!-- Right Lantern -->
        <g transform="translate(1080, 40)">
          <line x1="60" y1="0" x2="60" y2="40" stroke="#b91c1c" stroke-width="4"/>
          <ellipse cx="60" cy="90" rx="42" ry="50" fill="#dc2626"/>
          <ellipse cx="60" cy="90" rx="24" ry="50" fill="#ef4444"/>
          <rect x="42" y="38" width="36" height="8" fill="#facc15"/>
          <rect x="42" y="134" width="36" height="8" fill="#facc15"/>
          <line x1="60" y1="142" x2="60" y2="190" stroke="#facc15" stroke-width="4"/>
        </g>
      </g>

      <!-- Peach Blossom Branches Framing Top (桃花枝桠) -->
      <path d="M0,100 Q300,80 500,160 M1376,100 Q1000,60 850,150" stroke="#78350f" stroke-width="8" fill="none"/>
      <!-- Pink Flowers -->
      <circle cx="280" cy="100" r="14" fill="#f472b6"/>
      <circle cx="380" cy="130" r="16" fill="#f472b6"/>
      <circle cx="480" cy="155" r="14" fill="#f472b6"/>
      <circle cx="950" cy="110" r="15" fill="#f472b6"/>
      <circle cx="1060" cy="90" r="16" fill="#f472b6"/>
      <circle cx="1160" cy="120" r="14" fill="#f472b6"/>

      <!-- Grassy Lawn -->
      <path d="M0,540 Q688,480 1376,540 L1376,768 L0,768 Z" fill="#86efac"/>

      <!-- Three Friends Laughing Together in Center (小熊、小兔、喜鹊欢聚开怀大笑) -->
      <!-- Center Bear Raising Hands in Delight -->
      <g transform="translate(540, 260)" filter="url(#dropShadow)">
        <ellipse cx="140" cy="240" rx="90" ry="110" fill="#92400e"/>
        <path d="M60,190 L220,190 L230,320 L50,320 Z" fill="#dc2626"/>
        <circle cx="140" cy="110" r="65" fill="#92400e"/>
        <circle cx="80" cy="70" r="26" fill="#92400e"/>
        <circle cx="200" cy="70" r="26" fill="#92400e"/>
        <ellipse cx="140" cy="130" rx="30" ry="22" fill="#fed7aa"/>
        <ellipse cx="140" cy="120" rx="12" ry="8" fill="#451a03"/>
        <!-- Big Happy Open Laughing Mouth -->
        <path d="M125,128 Q140,155 155,128 Z" fill="#dc2626"/>
        <circle cx="115" cy="105" r="6" fill="#0f172a"/>
        <circle cx="165" cy="105" r="6" fill="#0f172a"/>
        <circle cx="100" cy="120" r="10" fill="#f87171" opacity="0.6"/>
        <circle cx="180" cy="120" r="10" fill="#f87171" opacity="0.6"/>
        <!-- Arms Up Joyfully -->
        <path d="M70,200 L0,150" stroke="#92400e" stroke-width="26" stroke-linecap="round"/>
        <path d="M210,200 L280,150" stroke="#92400e" stroke-width="26" stroke-linecap="round"/>
      </g>

      <!-- Left Bunny Cheering with Carrot/Flower -->
      <g transform="translate(320, 340)" filter="url(#dropShadow)">
        <ellipse cx="80" cy="180" rx="46" ry="60" fill="#ffffff"/>
        <circle cx="80" cy="100" r="42" fill="#ffffff"/>
        <ellipse cx="65" cy="35" rx="12" ry="40" fill="#ffffff"/>
        <ellipse cx="65" cy="35" rx="6" ry="30" fill="#fbcfe8"/>
        <ellipse cx="95" cy="35" rx="12" ry="40" fill="#ffffff"/>
        <ellipse cx="95" cy="35" rx="6" ry="30" fill="#fbcfe8"/>
        <!-- Big Smile -->
        <path d="M70,110 Q80,122 90,110" stroke="#ef4444" stroke-width="4" fill="none"/>
        <circle cx="68" cy="95" r="5" fill="#0f172a"/>
        <circle cx="92" cy="95" r="5" fill="#0f172a"/>
        <!-- Cheering Paws -->
        <circle cx="45" cy="140" r="12" fill="#ffffff"/>
        <circle cx="115" cy="140" r="12" fill="#ffffff"/>
      </g>

      <!-- Right Chinese Child in Hanfu Applauding (欢快鼓掌的中国萌娃) -->
      <g transform="translate(860, 310)" filter="url(#dropShadow)">
        <ellipse cx="90" cy="220" rx="55" ry="80" fill="#0284c7"/>
        <circle cx="90" cy="110" r="46" fill="#fed7aa"/>
        <!-- Double Bun Hair with Red Flowers -->
        <circle cx="55" cy="65" r="18" fill="#1e293b"/>
        <circle cx="125" cy="65" r="18" fill="#1e293b"/>
        <circle cx="55" cy="65" r="6" fill="#ef4444"/>
        <circle cx="125" cy="65" r="6" fill="#ef4444"/>
        <path d="M55,100 Q90,75 125,100" fill="#1e293b"/>
        <!-- Smiling Eyes & Dimples -->
        <path d="M72,112 Q80,105 88,112" stroke="#0f172a" stroke-width="3" fill="none"/>
        <path d="M96,112 Q104,105 112,112" stroke="#0f172a" stroke-width="3" fill="none"/>
        <path d="M82,126 Q92,136 102,126" stroke="#ef4444" stroke-width="3" fill="none"/>
        <circle cx="68" cy="120" r="8" fill="#fca5a5" opacity="0.6"/>
        <circle cx="116" cy="120" r="8" fill="#fca5a5" opacity="0.6"/>
        <!-- Clapping hands -->
        <circle cx="85" cy="180" r="14" fill="#fed7aa"/>
        <circle cx="98" cy="180" r="14" fill="#fed7aa"/>
      </g>

      <!-- Red Chinese Seal (欢 - 欢声笑语) with Vector Path -->
      <g transform="translate(1220, 80)" filter="url(#dropShadow)">
        <rect x="0" y="0" width="55" height="55" rx="8" fill="#dc2626"/>
        <g stroke="#ffffff" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" fill="none">
          <!-- 又 on left -->
          <line x1="15" y1="20" x2="26" y2="20"/>
          <path d="M24,20 L16,34 L28,42"/>
          <path d="M26,26 L15,40"/>
          <!-- 欠 on right -->
          <path d="M34,16 L31,24"/>
          <line x1="30" y1="24" x2="42" y2="24"/>
          <path d="M36,24 L30,42"/>
          <path d="M34,32 L44,42"/>
        </g>
      </g>
    `
  },

  // ==========================================
  // 4. story_sleep_alone_p1: 夜深了月光照，小熊躺在小床上
  // ==========================================
  {
    id: "story_sleep_alone_p1",
    title: "自己睡觉我不怕 - 第1页",
    defs: `
      <linearGradient id="night_sky1" x1="0%" y1="0%" x2="0%" y2="100%">
        <stop offset="0%" stop-color="#0f172a"/>
        <stop offset="50%" stop-color="#1e1b4b"/>
        <stop offset="100%" stop-color="#312e81"/>
      </linearGradient>
      <linearGradient id="warm_lamp" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="#fef08a"/>
        <stop offset="80%" stop-color="#f59e0b"/>
        <stop offset="100%" stop-color="#b45309"/>
      </linearGradient>
    `,
    content: `
      <!-- Cozy Night Room & Window (温馨宁静中式卧室夜景) -->
      <rect width="1376" height="768" fill="url(#night_sky1)"/>

      <!-- Traditional Chinese Wooden Lattice Window (中式雕花木窗) -->
      <g transform="translate(120, 80)" filter="url(#dropShadow)">
        <rect x="0" y="0" width="340" height="420" rx="12" fill="#1e293b" stroke="#78350f" stroke-width="12"/>
        <!-- Crescent Moon & Golden Twinkling Stars Outside Window (窗外皎洁月牙与繁星) -->
        <path d="M120,110 A60,60 0 0,0 200,60 A70,70 0 1,1 120,110 Z" fill="#fde047" filter="url(#softGlow)"/>
        <polygon points="70,90 74,98 84,100 76,108 78,118 70,112 62,118 64,108 56,100 66,98" fill="#ffffff"/>
        <polygon points="240,160 244,168 254,170 246,178 248,188 240,182 232,188 234,178 226,170 236,168" fill="#ffffff"/>
        <!-- Window Mullions (木质窗格) -->
        <line x1="170" y1="0" x2="170" y2="420" stroke="#78350f" stroke-width="6"/>
        <line x1="0" y1="210" x2="340" y2="210" stroke="#78350f" stroke-width="6"/>
      </g>

      <!-- Warm Bedside Table with Chinese Ceramic Night Lamp (中式床头青花瓷夜读小灯) -->
      <g transform="translate(1000, 360)" filter="url(#dropShadow)">
        <rect x="30" y="160" width="140" height="180" fill="#78350f"/>
        <!-- Ceramic Lamp Body -->
        <ellipse cx="100" cy="120" rx="30" ry="40" fill="#f8fafc" stroke="#0284c7" stroke-width="4"/>
        <path d="M90,110 Q100,100 110,110" stroke="#0284c7" stroke-width="3" fill="none"/>
        <!-- Lamp Shade Glowing Warm Yellow (温暖柔和的明黄灯罩与光晕) -->
        <polygon points="50,90 150,90 135,20 65,20" fill="url(#warm_lamp)"/>
        <circle cx="100" cy="55" r="90" fill="#fef08a" opacity="0.25" filter="url(#softGlow)"/>
      </g>

      <!-- Cozy Child Bed with Traditional Cloud-pattern Quilt (铺着如意祥云锦被的小木床) -->
      <g transform="translate(380, 320)" filter="url(#dropShadow)">
        <!-- Bed Headboard & Frame (红木雕花床架) -->
        <rect x="0" y="60" width="40" height="340" fill="#78350f"/>
        <rect x="660" y="180" width="40" height="220" fill="#78350f"/>
        <rect x="0" y="320" width="680" height="60" fill="#92400e"/>

        <!-- Soft White Pillow (松软云朵白枕头) -->
        <rect x="50" y="160" width="160" height="80" rx="20" fill="#ffffff"/>

        <!-- Little Child & Little Bear Tucked in Bed (乖巧小萌娃拥着小熊玩偶安然躺卧) -->
        <!-- Child Head -->
        <circle cx="130" cy="180" r="42" fill="#fed7aa"/>
        <!-- Cute bangs -->
        <path d="M92,170 Q130,145 168,170" fill="#1e293b"/>
        <!-- Sleepy calm eyes (长睫毛微合) -->
        <path d="M110,182 Q118,188 126,182" stroke="#0f172a" stroke-width="3" fill="none"/>
        <path d="M136,182 Q144,188 152,182" stroke="#0f172a" stroke-width="3" fill="none"/>
        <path d="M125,195 Q131,200 137,195" stroke="#ef4444" stroke-width="2.5" fill="none"/>
        <!-- Rosy Cheek -->
        <circle cx="110" cy="190" r="8" fill="#fca5a5" opacity="0.6"/>

        <!-- Little Plush Bear beside child -->
        <circle cx="190" cy="200" r="26" fill="#b45309"/>
        <circle cx="172" cy="180" r="10" fill="#b45309"/>
        <circle cx="208" cy="180" r="10" fill="#b45309"/>
        <ellipse cx="190" cy="208" rx="12" ry="8" fill="#fed7aa"/>

        <!-- Quilt with Ruyi Cloud Pattern (粉蓝如意祥云锦被) -->
        <rect x="90" y="220" width="580" height="150" rx="16" fill="#38bdf8"/>
        <!-- Cloud Patterns on Quilt -->
        <path d="M160,260 Q180,245 200,260 Q210,250 220,260" stroke="#ffffff" stroke-width="4" fill="none"/>
        <path d="M340,280 Q360,265 380,280 Q390,270 400,280" stroke="#ffffff" stroke-width="4" fill="none"/>
        <path d="M500,260 Q520,245 540,260 Q550,250 560,260" stroke="#ffffff" stroke-width="4" fill="none"/>
      </g>

      <!-- Red Chinese Seal (静 - 宁静致远) with Vector Path -->
      <g transform="translate(1220, 80)" filter="url(#dropShadow)">
        <rect x="0" y="0" width="55" height="55" rx="8" fill="#dc2626"/>
        <g stroke="#ffffff" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" fill="none">
          <!-- 青 on left -->
          <line x1="14" y1="16" x2="26" y2="16"/>
          <line x1="14" y1="21" x2="26" y2="21"/>
          <line x1="20" y1="12" x2="20" y2="26"/>
          <line x1="12" y1="26" x2="28" y2="26"/>
          <rect x="14" y="29" width="12" height="14"/>
          <!-- 争 on right -->
          <line x1="33" y1="14" x2="43" y2="14"/>
          <rect x="33" y="19" width="10" height="8"/>
          <line x1="30" y1="30" x2="44" y2="30"/>
          <line x1="38" y1="14" x2="38" y2="43"/>
        </g>
      </g>
    `
  },

  // ==========================================
  // 5. story_sleep_alone_p2: 窗外星星眨眼睛，晚风送来平安夜
  // ==========================================
  {
    id: "story_sleep_alone_p2",
    title: "自己睡觉我不怕 - 第2页",
    defs: `
      <linearGradient id="night_breeze" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="#1e1b4b"/>
        <stop offset="40%" stop-color="#312e81"/>
        <stop offset="100%" stop-color="#4338ca"/>
      </linearGradient>
    `,
    content: `
      <!-- Panoramic Starlit Night Sky View from Window (繁星满天微风轻拂平安夜) -->
      <rect width="1376" height="768" fill="url(#night_breeze)"/>

      <!-- Silhouetted Ancient Pagoda & Willow Branches in Distance (远方古塔与垂柳倒影) -->
      <g opacity="0.7">
        <polygon points="260,380 280,380 270,300" fill="#0f172a"/>
        <polygon points="255,340 285,340 270,300" fill="#0f172a"/>
        <polygon points="250,370 290,370 270,340" fill="#0f172a"/>
        <rect x="260" y="380" width="20" height="60" fill="#0f172a"/>
      </g>

      <!-- Soft Gently Swaying Silk Curtains Framing Window (轻柔飘逸的印花窗帘) -->
      <path d="M0,0 Q180,300 120,768 L0,768 Z" fill="#6366f1" opacity="0.5"/>
      <path d="M1376,0 Q1196,300 1256,768 L1376,768 Z" fill="#6366f1" opacity="0.5"/>

      <!-- Smiling Golden Crescent Moon (会心微笑的温柔月亮婆婆) -->
      <g transform="translate(620, 110)" filter="url(#dropShadow)">
        <circle cx="80" cy="80" r="100" fill="#fef08a" opacity="0.2" filter="url(#softGlow)"/>
        <path d="M40,150 A90,90 0 0,0 150,70 A105,105 0 1,1 40,150 Z" fill="#fde047"/>
        <!-- Moon Sleeping Face -->
        <path d="M85,90 Q95,98 105,90" stroke="#854d0e" stroke-width="4" stroke-linecap="round" fill="none"/>
        <circle cx="80" cy="105" r="8" fill="#fca5a5" opacity="0.7"/>
      </g>

      <!-- Constellations & Golden Twinkling Stars (眨着眼睛的小星星) -->
      <g fill="#ffffff">
        <circle cx="280" cy="180" r="6" filter="url(#softGlow)"/>
        <circle cx="340" cy="140" r="8" filter="url(#softGlow)"/>
        <circle cx="420" cy="200" r="5" filter="url(#softGlow)"/>
        <circle cx="480" cy="150" r="7" filter="url(#softGlow)"/>
        <line x1="280" y1="180" x2="340" y2="140" stroke="#ffffff" stroke-width="1.5" stroke-dasharray="4,4" opacity="0.6"/>
        <line x1="340" y1="140" x2="420" y2="200" stroke="#ffffff" stroke-width="1.5" stroke-dasharray="4,4" opacity="0.6"/>
        <line x1="420" y1="200" x2="480" y2="150" stroke="#ffffff" stroke-width="1.5" stroke-dasharray="4,4" opacity="0.6"/>

        <!-- Right Side Stars -->
        <circle cx="980" cy="160" r="8" filter="url(#softGlow)"/>
        <circle cx="1060" cy="220" r="6" filter="url(#softGlow)"/>
        <circle cx="1140" cy="170" r="7" filter="url(#softGlow)"/>
        <line x1="980" y1="160" x2="1060" y2="220" stroke="#ffffff" stroke-width="1.5" stroke-dasharray="4,4" opacity="0.6"/>
        <line x1="1060" y1="220" x2="1140" y2="170" stroke="#ffffff" stroke-width="1.5" stroke-dasharray="4,4" opacity="0.6"/>
      </g>

      <!-- Night Breeze Swirls Carrying Peach Petals (吹送安康的晚风游弋花瓣) -->
      <path d="M100,500 Q400,420 800,480 T1300,440" stroke="#a5b4fc" stroke-width="3" stroke-linecap="round" fill="none" opacity="0.6"/>
      <path d="M150,540 Q450,460 850,520 T1350,480" stroke="#a5b4fc" stroke-width="2" stroke-linecap="round" fill="none" opacity="0.4"/>
      <!-- Floating Petals -->
      <ellipse cx="450" cy="460" rx="8" ry="5" fill="#f472b6" transform="rotate(25, 450, 460)"/>
      <ellipse cx="780" cy="490" rx="9" ry="5" fill="#f472b6" transform="rotate(-30, 780, 490)"/>
      <ellipse cx="1080" cy="460" rx="8" ry="4" fill="#f472b6" transform="rotate(40, 1080, 460)"/>

      <!-- Red Chinese Seal (安 - 平安吉祥) with Vector Path -->
      <g transform="translate(1220, 80)" filter="url(#dropShadow)">
        <rect x="0" y="0" width="55" height="55" rx="8" fill="#dc2626"/>
        <g stroke="#ffffff" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" fill="none">
          <!-- 宀 -->
          <line x1="28" y1="12" x2="28" y2="16"/>
          <line x1="15" y1="17" x2="41" y2="17"/>
          <path d="M17,17 L17,23"/>
          <path d="M39,17 L39,23"/>
          <!-- 女 -->
          <path d="M28,21 L22,34 L38,34"/>
          <path d="M22,34 Q34,44 36,44"/>
          <line x1="14" y1="31" x2="42" y2="31"/>
        </g>
      </g>
    `
  },

  // ==========================================
  // 6. story_sleep_alone_p3: 闭上眼睛做好梦，勇敢孩子睡得香
  // ==========================================
  {
    id: "story_sleep_alone_p3",
    title: "自己睡觉我不怕 - 第3页",
    defs: `
      <linearGradient id="dream_bg" x1="0%" y1="0%" x2="0%" y2="100%">
        <stop offset="0%" stop-color="#312e81"/>
        <stop offset="50%" stop-color="#4f46e5"/>
        <stop offset="100%" stop-color="#c084fc"/>
      </linearGradient>
      <linearGradient id="rainbow" x1="0%" y1="0%" x2="100%" y2="0%">
        <stop offset="0%" stop-color="#ef4444"/>
        <stop offset="20%" stop-color="#f97316"/>
        <stop offset="40%" stop-color="#eab308"/>
        <stop offset="60%" stop-color="#22c55e"/>
        <stop offset="80%" stop-color="#3b82f6"/>
        <stop offset="100%" stop-color="#a855f7"/>
      </linearGradient>
    `,
    content: `
      <!-- Sweet Dream Wonderland Background (甜蜜美梦七彩仙境) -->
      <rect width="1376" height="768" fill="url(#dream_bg)"/>

      <!-- Gorgeous Rainbow Arch Across Dream Sky (绚丽七色彩虹桥) -->
      <path d="M180,550 A540,360 0 0,1 1200,550" stroke="url(#rainbow)" stroke-width="26" fill="none" opacity="0.85" filter="url(#softGlow)"/>

      <!-- Fluffy White Dream Clouds (白云朵朵) -->
      <g fill="#ffffff" opacity="0.9" filter="url(#softGlow)">
        <ellipse cx="320" cy="460" rx="90" ry="45"/>
        <circle cx="280" cy="430" r="50"/>
        <circle cx="360" cy="430" r="55"/>

        <ellipse cx="1060" cy="440" rx="90" ry="45"/>
        <circle cx="1020" cy="410" r="50"/>
        <circle cx="1100" cy="410" r="55"/>
      </g>

      <!-- Little Chinese Child Running Happily on the Rainbow Cloud (在彩虹云朵上欢快飞翔的勇敢萌童) -->
      <g transform="translate(560, 180)" filter="url(#dropShadow)">
        <!-- Floating Cloud Pillow (云朵飞毯) -->
        <ellipse cx="140" cy="280" rx="160" ry="50" fill="#ffffff" filter="url(#softGlow)"/>
        <circle cx="80" cy="250" r="45" fill="#ffffff"/>
        <circle cx="200" cy="250" r="45" fill="#ffffff"/>

        <!-- Little Child in Chinese Pajamas Sleeping Happily (安睡微笑的中国萌娃) -->
        <ellipse cx="140" cy="210" rx="55" ry="40" fill="#38bdf8"/>
        <!-- Head -->
        <circle cx="90" cy="180" r="38" fill="#fed7aa"/>
        <!-- Double Bun hair with Red Bows (红丝带双丫髻) -->
        <circle cx="65" cy="150" r="14" fill="#1e293b"/>
        <circle cx="105" cy="150" r="14" fill="#1e293b"/>
        <circle cx="65" cy="150" r="5" fill="#ef4444"/>
        <circle cx="105" cy="150" r="5" fill="#ef4444"/>
        <!-- Sweet Smiling Sleep Face -->
        <path d="M78,185 Q85,190 92,185" stroke="#0f172a" stroke-width="2.5" fill="none"/>
        <path d="M82,196 Q88,202 94,196" stroke="#ef4444" stroke-width="2" fill="none"/>
        <circle cx="75" cy="192" r="6" fill="#fca5a5" opacity="0.7"/>

        <!-- Little Teddy Bear sleeping together -->
        <circle cx="160" cy="210" r="22" fill="#b45309"/>
        <circle cx="146" cy="195" r="8" fill="#b45309"/>
        <circle cx="174" cy="195" r="8" fill="#b45309"/>
      </g>

      <!-- Golden Stars & Sparkles Everywhere (漫天金光与美梦微芒) -->
      <g fill="#fde047" filter="url(#softGlow)">
        <polygon points="220,180 224,190 236,192 226,202 228,214 220,206 212,214 214,202 204,192 216,190"/>
        <polygon points="1150,220 1154,230 1166,232 1156,242 1158,254 1150,246 1142,254 1144,242 1134,232 1146,230"/>
        <polygon points="688,80 692,90 704,92 694,102 696,114 688,106 680,114 682,102 672,92 684,90"/>
      </g>

      <!-- Red Chinese Seal (梦 - 美梦成真) with Vector Path -->
      <g transform="translate(1220, 80)" filter="url(#dropShadow)">
        <rect x="0" y="0" width="55" height="55" rx="8" fill="#dc2626"/>
        <g stroke="#ffffff" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" fill="none">
          <!-- 木 x 2 on top -->
          <line x1="14" y1="18" x2="26" y2="18"/>
          <line x1="20" y1="12" x2="20" y2="25"/>
          <line x1="30" y1="18" x2="42" y2="18"/>
          <line x1="36" y1="12" x2="36" y2="25"/>
          <!-- 夕 below -->
          <path d="M28,27 L20,38 L36,38 Q36,44 26,44"/>
          <line x1="26" y1="33" x2="31" y2="35"/>
        </g>
      </g>
    `
  },

  // ==========================================
  // 7. story_water_drop_p1: 雨水落在大地泥土上，小水滴醒来了
  // ==========================================
  {
    id: "story_water_drop_p1",
    title: "小水滴的大海梦 - 第1页",
    defs: `
      <linearGradient id="rain_sky" x1="0%" y1="0%" x2="0%" y2="100%">
        <stop offset="0%" stop-color="#64748b"/>
        <stop offset="50%" stop-color="#94a3b8"/>
        <stop offset="100%" stop-color="#cbd5e1"/>
      </linearGradient>
      <linearGradient id="lotus_leaf" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="#4ade80"/>
        <stop offset="60%" stop-color="#16a34a"/>
        <stop offset="100%" stop-color="#14532d"/>
      </linearGradient>
      <linearGradient id="crystal_drop" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="#ffffff"/>
        <stop offset="40%" stop-color="#7dd3fc"/>
        <stop offset="100%" stop-color="#0284c7"/>
      </linearGradient>
    `,
    content: `
      <!-- Gentle Spring Rain in Jiangnan Water Town (江南春雨蒙蒙，草木初醒) -->
      <rect width="1376" height="768" fill="url(#rain_sky)"/>

      <!-- Slanted Rain Droplets (细雨绵绵) -->
      <g stroke="#ffffff" stroke-width="2" opacity="0.6" stroke-linecap="round">
        <line x1="200" y1="40" x2="160" y2="140"/>
        <line x1="450" y1="80" x2="410" y2="180"/>
        <line x1="720" y1="20" x2="680" y2="120"/>
        <line x1="980" y1="90" x2="940" y2="190"/>
        <line x1="1200" y1="50" x2="1160" y2="150"/>
        <line x1="300" y1="260" x2="260" y2="360"/>
        <line x1="850" y1="240" x2="810" y2="340"/>
      </g>

      <!-- Giant Emerald Green Lotus Leaf in Pond (青翠欲滴的江南巨型荷叶) -->
      <g transform="translate(280, 260)" filter="url(#dropShadow)">
        <ellipse cx="400" cy="300" rx="360" ry="180" fill="url(#lotus_leaf)"/>
        <!-- Veins of the Lotus Leaf (荷叶舒展脉络) -->
        <path d="M400,300 Q300,220 120,240 M400,300 Q500,220 680,240 M400,300 Q320,380 180,440 M400,300 Q480,380 620,440 M400,300 L400,140" stroke="#86efac" stroke-width="5" fill="none" opacity="0.7"/>

        <!-- Main Character: Cute Awakening Crystal Water Drop (苏醒的晶莹小水滴) -->
        <g transform="translate(350, 160)" filter="url(#softGlow)">
          <path d="M50,0 C20,50 0,80 0,110 C0,150 30,170 50,170 C70,170 100,150 100,110 C100,80 80,50 50,0 Z" fill="url(#crystal_drop)"/>
          <!-- Bright highlights -->
          <ellipse cx="35" cy="75" rx="10" ry="20" fill="#ffffff" opacity="0.8" transform="rotate(-25, 35, 75)"/>
          <circle cx="45" cy="135" r="6" fill="#ffffff" opacity="0.6"/>

          <!-- Cute Inquisitive Face on Water Drop (灵动好奇的眼睛与微笑) -->
          <circle cx="36" cy="105" r="5" fill="#0f172a"/>
          <circle cx="64" cy="105" r="5" fill="#0f172a"/>
          <circle cx="38" cy="103" r="1.5" fill="#ffffff"/>
          <circle cx="66" cy="103" r="1.5" fill="#ffffff"/>
          <path d="M44,118 Q50,126 56,118" stroke="#0284c7" stroke-width="3" stroke-linecap="round" fill="none"/>
          <circle cx="28" cy="115" r="6" fill="#fda4af" opacity="0.8"/>
          <circle cx="72" cy="115" r="6" fill="#fda4af" opacity="0.8"/>
        </g>
      </g>

      <!-- Moist Fertile Soil & Sprouting Green Shoots (滋润泥土与初萌春草) -->
      <path d="M0,640 Q688,580 1376,640 L1376,768 L0,768 Z" fill="#78350f"/>
      <g fill="#22c55e">
        <path d="M120,640 Q130,580 160,590 Q140,620 130,640 Z"/>
        <path d="M180,650 Q200,600 230,610 Q205,630 190,650 Z"/>
        <path d="M1150,630 Q1170,570 1200,580 Q1180,610 1160,630 Z"/>
      </g>

      <!-- Red Chinese Seal (源 - 万物水源) with Vector Path -->
      <g transform="translate(1220, 80)" filter="url(#dropShadow)">
        <rect x="0" y="0" width="55" height="55" rx="8" fill="#dc2626"/>
        <g stroke="#ffffff" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" fill="none">
          <!-- 氵 on left -->
          <circle cx="16" cy="18" r="1" fill="#ffffff"/>
          <circle cx="14" cy="28" r="1" fill="#ffffff"/>
          <path d="M15,40 L20,34"/>
          <!-- 原 on right -->
          <line x1="24" y1="17" x2="42" y2="17"/>
          <line x1="27" y1="17" x2="27" y2="42"/>
          <circle cx="34" cy="27" r="5"/>
          <line x1="28" y1="36" x2="42" y2="36"/>
          <line x1="34" y1="36" x2="34" y2="44"/>
        </g>
      </g>
    `
  },

  // ==========================================
  // 8. story_water_drop_p2: 红日高照温暖如火，小水滴欢快奔向大海
  // ==========================================
  {
    id: "story_water_drop_p2",
    title: "小水滴的大海梦 - 第2页",
    defs: `
      <linearGradient id="sea_sky" x1="0%" y1="0%" x2="0%" y2="100%">
        <stop offset="0%" stop-color="#38bdf8"/>
        <stop offset="50%" stop-color="#fed7aa"/>
        <stop offset="100%" stop-color="#fef08a"/>
      </linearGradient>
      <linearGradient id="crystal_drop" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="#ffffff"/>
        <stop offset="40%" stop-color="#7dd3fc"/>
        <stop offset="100%" stop-color="#0284c7"/>
      </linearGradient>
      <linearGradient id="ocean_waves" x1="0%" y1="0%" x2="0%" y2="100%">
        <stop offset="0%" stop-color="#0284c7"/>
        <stop offset="60%" stop-color="#0369a1"/>
        <stop offset="100%" stop-color="#075985"/>
      </linearGradient>
    `,
    content: `
      <!-- Grand Chinese Seacoast with Rising Sun (红日东升，碧海连天) -->
      <rect width="1376" height="768" fill="url(#sea_sky)"/>

      <!-- Radiant Morning Red Sun (一轮喷薄而出的温暖红日) -->
      <circle cx="688" cy="240" r="90" fill="#ef4444" filter="url(#softGlow)"/>
      <circle cx="688" cy="240" r="140" fill="#f87171" opacity="0.3" filter="url(#softGlow)"/>

      <!-- Flying White Seagulls (天高海阔，海鸥翱翔) -->
      <path d="M380,180 Q400,160 420,180 Q440,160 460,180" stroke="#ffffff" stroke-width="4" stroke-linecap="round" fill="none"/>
      <path d="M920,160 Q935,145 950,160 Q965,145 980,160" stroke="#ffffff" stroke-width="3" stroke-linecap="round" fill="none"/>

      <!-- Ancient Stone Arch Bridge on River Shore (古朴单孔石拱桥连通江海) -->
      <g transform="translate(60, 360)" filter="url(#dropShadow)">
        <path d="M0,180 Q160,80 320,180 L320,240 L0,240 Z" fill="#94a3b8"/>
        <path d="M80,240 A80,80 0 0,1 240,240 Z" fill="#0284c7"/>
        <line x1="0" y1="180" x2="320" y2="180" stroke="#64748b" stroke-width="4"/>
      </g>

      <!-- Vast Rolling Ocean Waves (波澜壮阔的大海碧波) -->
      <path d="M0,480 Q240,420 480,480 T960,480 T1376,480 L1376,768 L0,768 Z" fill="url(#ocean_waves)"/>
      <path d="M0,560 Q300,500 600,560 T1200,560 T1376,560 L1376,768 L0,768 Z" fill="#0369a1"/>
      <path d="M0,640 Q340,590 680,640 T1360,640 L1376,768 L0,768 Z" fill="#075985"/>

      <!-- White Frothy Wave Crests (白浪翻滚) -->
      <path d="M220,530 Q260,500 300,530 M680,520 Q720,490 760,520 M1040,540 Q1080,510 1120,540" stroke="#ffffff" stroke-width="6" stroke-linecap="round" fill="none"/>

      <!-- Cheerful Water Drop Leaping in the Waves (欢快跃入大海怀抱的小水滴) -->
      <g transform="translate(620, 390)" filter="url(#dropShadow)">
        <path d="M70,0 C30,70 0,110 0,150 C0,205 40,230 70,230 C100,230 140,205 140,150 C140,110 110,70 70,0 Z" fill="url(#crystal_drop)" filter="url(#softGlow)"/>
        <ellipse cx="50" cy="100" rx="14" ry="28" fill="#ffffff" opacity="0.8" transform="rotate(-25, 50, 100)"/>

        <!-- Big Joyous Smile (终于融入大海的开怀大笑) -->
        <circle cx="50" cy="140" r="7" fill="#0f172a"/>
        <circle cx="90" cy="140" r="7" fill="#0f172a"/>
        <path d="M60,160 Q70,180 80,160 Z" fill="#dc2626"/>
        <circle cx="40" cy="155" r="8" fill="#fda4af"/>
        <circle cx="100" cy="155" r="8" fill="#fda4af"/>

        <!-- Splash of water droplets (溅起的欢快水花) -->
        <circle cx="-10" cy="80" r="10" fill="#7dd3fc"/>
        <circle cx="150" cy="70" r="12" fill="#7dd3fc"/>
        <circle cx="160" cy="120" r="8" fill="#7dd3fc"/>
      </g>

      <!-- Red Chinese Seal (海 - 海纳百川) with Vector Path -->
      <g transform="translate(1220, 80)" filter="url(#dropShadow)">
        <rect x="0" y="0" width="55" height="55" rx="8" fill="#dc2626"/>
        <g stroke="#ffffff" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" fill="none">
          <!-- 氵 on left -->
          <circle cx="16" cy="18" r="1" fill="#ffffff"/>
          <circle cx="14" cy="28" r="1" fill="#ffffff"/>
          <path d="M15,40 L20,34"/>
          <!-- 每 on right -->
          <line x1="28" y1="16" x2="38" y2="16"/>
          <line x1="33" y1="12" x2="33" y2="18"/>
          <path d="M26,24 L42,24 L38,42 L24,42 Z"/>
          <line x1="24" y1="33" x2="40" y2="33"/>
          <circle cx="33" cy="28" r="1" fill="#ffffff"/>
          <circle cx="33" cy="38" r="1" fill="#ffffff"/>
        </g>
      </g>
    `
  },

  // ==========================================
  // 9. story_forest_squirrel_p1: 大山里有高高的木头大树，结满了果子
  // ==========================================
  {
    id: "story_forest_squirrel_p1",
    title: "森林里的树木与小松鼠 - 第1页",
    defs: `
      <linearGradient id="forest_sky1" x1="0%" y1="0%" x2="0%" y2="100%">
        <stop offset="0%" stop-color="#38bdf8"/>
        <stop offset="60%" stop-color="#bae6fd"/>
        <stop offset="100%" stop-color="#d9f99d"/>
      </linearGradient>
      <linearGradient id="pine_tree" x1="0%" y1="0%" x2="0%" y2="100%">
        <stop offset="0%" stop-color="#16a34a"/>
        <stop offset="100%" stop-color="#065f46"/>
      </linearGradient>
    `,
    content: `
      <!-- Lofty Mountain Forest with Ancient Chinese Pine Trees (苍翠群山，千年古木) -->
      <rect width="1376" height="768" fill="url(#forest_sky1)"/>
      <circle cx="1180" cy="130" r="65" fill="#fde047" filter="url(#softGlow)"/>

      <!-- Distant Majestic Blue-Green Peaks (青绿千仞远山) -->
      <polygon points="0,520 280,240 560,520" fill="#0d9488" opacity="0.4"/>
      <polygon points="380,520 720,180 1060,520" fill="#0f766e" opacity="0.5"/>
      <polygon points="850,520 1150,260 1376,520" fill="#115e59" opacity="0.4"/>

      <!-- Giant Ancient Pine Tree (郁郁葱葱的参天古松，结满松果与红野果) -->
      <g filter="url(#dropShadow)">
        <!-- Trunk with Bark Texture (沧桑古松树干) -->
        <path d="M420,768 L480,380 L520,380 L580,768 Z" fill="#78350f"/>
        <path d="M480,480 Q320,440 220,460" stroke="#78350f" stroke-width="24" stroke-linecap="round" fill="none"/>
        <path d="M520,420 Q680,380 820,410" stroke="#78350f" stroke-width="20" stroke-linecap="round" fill="none"/>

        <!-- Pine Canopy (层层叠叠苍翠树冠) -->
        <ellipse cx="500" cy="300" rx="180" ry="90" fill="url(#pine_tree)"/>
        <ellipse cx="260" cy="420" rx="140" ry="70" fill="url(#pine_tree)"/>
        <ellipse cx="780" cy="380" rx="150" ry="75" fill="url(#pine_tree)"/>
        <ellipse cx="500" cy="220" rx="130" ry="65" fill="#22c55e"/>

        <!-- Abundant Red Berries & Pine Cones (枝头丰硕甜美的红色野果与金黄松果) -->
        <circle cx="220" cy="400" r="14" fill="#ef4444" filter="url(#softGlow)"/>
        <circle cx="240" cy="415" r="12" fill="#ef4444"/>
        <circle cx="310" cy="440" r="14" fill="#ef4444"/>
        <circle cx="480" cy="260" r="14" fill="#ef4444"/>
        <circle cx="530" cy="280" r="12" fill="#ef4444"/>
        <circle cx="750" cy="360" r="14" fill="#ef4444"/>
        <circle cx="820" cy="390" r="14" fill="#ef4444"/>
        <!-- Golden Pinecone -->
        <ellipse cx="440" cy="340" rx="12" ry="18" fill="#d97706"/>
        <ellipse cx="680" cy="380" rx="12" ry="18" fill="#d97706"/>
      </g>

      <!-- Forest Mossy Ground (林间青苔石阶) -->
      <rect x="0" y="660" width="1376" height="108" fill="#15803d"/>
      <ellipse cx="320" cy="690" rx="60" ry="25" fill="#64748b"/>
      <ellipse cx="880" cy="700" rx="80" ry="30" fill="#64748b"/>

      <!-- Red Chinese Seal (翠 - 苍翠挺拔) with Vector Path -->
      <g transform="translate(1220, 80)" filter="url(#dropShadow)">
        <rect x="0" y="0" width="55" height="55" rx="8" fill="#dc2626"/>
        <g stroke="#ffffff" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" fill="none">
          <!-- 羽 on top -->
          <path d="M14,15 L25,15 L25,24"/>
          <line x1="20" y1="18" x2="16" y2="22"/>
          <line x1="20" y1="22" x2="17" y2="25"/>
          <path d="M30,15 L41,15 L41,24"/>
          <line x1="36" y1="18" x2="32" y2="22"/>
          <line x1="36" y1="22" x2="33" y2="25"/>
          <!-- 卒 below -->
          <line x1="20" y1="28" x2="35" y2="28"/>
          <line x1="16" y1="35" x2="39" y2="35"/>
          <line x1="28" y1="28" x2="28" y2="44"/>
          <line x1="15" y1="44" x2="41" y2="44"/>
        </g>
      </g>
    `
  },

  // ==========================================
  // 10. story_forest_squirrel_p2: 松鼠张口吃果子，好心人走过来给它拍照
  // ==========================================
  {
    id: "story_forest_squirrel_p2",
    title: "森林里的树木与小松鼠 - 第2页",
    defs: `
      <linearGradient id="forest_sky2" x1="0%" y1="0%" x2="0%" y2="100%">
        <stop offset="0%" stop-color="#bae6fd"/>
        <stop offset="60%" stop-color="#fef08a"/>
        <stop offset="100%" stop-color="#bbf7d0"/>
      </linearGradient>
    `,
    content: `
      <!-- Sunny Forest Clearing Background (阳光斑驳的林间空地) -->
      <rect width="1376" height="768" fill="url(#forest_sky2)"/>
      <circle cx="688" cy="180" r="120" fill="#fde047" opacity="0.3" filter="url(#softGlow)"/>

      <!-- Large Tree Branch with Cute Squirrel on Left (左侧大树枝上吃松果的萌松鼠) -->
      <g transform="translate(180, 240)" filter="url(#dropShadow)">
        <!-- Branch -->
        <path d="M-180,300 Q100,260 380,290" stroke="#78350f" stroke-width="32" stroke-linecap="round" fill="none"/>
        <ellipse cx="260" cy="270" rx="80" ry="35" fill="#16a34a"/>

        <!-- Little Squirrel (蓬松大尾巴红棕色小松鼠) -->
        <g transform="translate(140, 60)">
          <!-- Fluffy Bushy Tail curling up (蓬松如云彩的大尾巴) -->
          <path d="M-20,160 Q-90,100 -80,20 Q-70,-40 -10,-10 Q30,15 0,80 Z" fill="#ea580c" filter="url(#softGlow)"/>
          <path d="M-15,140 Q-60,90 -50,30 Q-40,-10 0,10" stroke="#fed7aa" stroke-width="8" stroke-linecap="round" fill="none"/>

          <!-- Squirrel Body -->
          <ellipse cx="40" cy="150" rx="42" ry="55" fill="#ea580c"/>
          <ellipse cx="40" cy="155" rx="26" ry="38" fill="#ffedd5"/>

          <!-- Squirrel Head & Pointy Ears with Tufts -->
          <circle cx="55" cy="80" r="32" fill="#ea580c"/>
          <polygon points="40,55 50,25 60,55" fill="#ea580c"/>
          <polygon points="65,55 75,25 85,55" fill="#ea580c"/>
          <circle cx="50" cy="25" r="4" fill="#ffffff"/>
          <circle cx="75" cy="25" r="4" fill="#ffffff"/>

          <!-- Happy Chewing Face -->
          <circle cx="62" cy="74" r="5" fill="#0f172a"/>
          <circle cx="64" cy="72" r="1.5" fill="#ffffff"/>
          <circle cx="48" cy="84" r="6" fill="#fca5a5"/>
          <!-- Holding Sweet Acorn/Berry with two paws -->
          <ellipse cx="85" cy="95" rx="14" ry="18" fill="#d97706"/>
          <rect x="75" y="80" width="20" height="8" rx="4" fill="#78350f"/>
          <!-- Paws -->
          <circle cx="72" cy="98" r="8" fill="#ea580c"/>
          <circle cx="88" cy="105" r="8" fill="#ea580c"/>
        </g>
      </g>

      <!-- Chinese Children Taking Photos with Camera (拿相机拍照的中国萌娃，汉服短衫) -->
      <g transform="translate(840, 310)" filter="url(#dropShadow)">
        <!-- Chinese Boy Holding Camera -->
        <g transform="translate(120, 0)">
          <path d="M50,180 L170,180 L190,400 L30,400 Z" fill="#0284c7"/>
          <circle cx="110" cy="100" r="46" fill="#fed7aa"/>
          <!-- Boy short black hair -->
          <path d="M68,90 Q110,60 152,90 L156,80 Q110,40 64,80 Z" fill="#1e293b"/>
          <!-- Excited smiling eyes -->
          <circle cx="95" cy="95" r="5" fill="#0f172a"/>
          <circle cx="125" cy="95" r="5" fill="#0f172a"/>
          <path d="M100,115 Q110,126 120,115" stroke="#ef4444" stroke-width="3" fill="none"/>
          <circle cx="88" cy="108" r="8" fill="#fca5a5" opacity="0.6"/>
          <circle cx="132" cy="108" r="8" fill="#fca5a5" opacity="0.6"/>

          <!-- Cute Camera Held in Hands (双手举着的小相机) -->
          <g transform="translate(45, 130)">
            <rect x="0" y="15" width="85" height="55" rx="8" fill="#475569"/>
            <rect x="30" y="5" width="25" height="12" rx="3" fill="#64748b"/>
            <!-- Camera Lens -->
            <circle cx="42" cy="42" r="20" fill="#0f172a" stroke="#94a3b8" stroke-width="4"/>
            <circle cx="42" cy="42" r="10" fill="#38bdf8"/>
            <circle cx="38" cy="38" r="3" fill="#ffffff"/>
            <!-- Flash Sparkle -->
            <polygon points="80,10 84,18 92,20 84,22 80,30 76,22 68,20 76,18" fill="#fde047" filter="url(#softGlow)"/>
          </g>
        </g>

        <!-- Chinese Girl beside him pointing and smiling (旁边欢快指引的中国小女孩) -->
        <g transform="translate(0, 30)">
          <path d="M40,160 L140,160 L155,370 L25,370 Z" fill="#ec4899"/>
          <circle cx="90" cy="95" r="42" fill="#fed7aa"/>
          <!-- Double Buns with Red Ribbons -->
          <circle cx="58" cy="55" r="16" fill="#1e293b"/>
          <circle cx="122" cy="55" r="16" fill="#1e293b"/>
          <circle cx="58" cy="55" r="5" fill="#ef4444"/>
          <circle cx="122" cy="55" r="5" fill="#ef4444"/>
          <circle cx="78" cy="92" r="4.5" fill="#0f172a"/>
          <circle cx="102" cy="92" r="4.5" fill="#0f172a"/>
          <path d="M84,110 Q90,118 96,110" stroke="#ef4444" stroke-width="3" fill="none"/>
          <!-- Pointing Arm toward squirrel -->
          <path d="M50,180 L-40,140" stroke="#ec4899" stroke-width="20" stroke-linecap="round"/>
          <circle cx="-45" cy="140" r="10" fill="#fed7aa"/>
        </g>
      </g>

      <!-- Red Chinese Seal (和 - 人与自然和谐相处) with Vector Path -->
      <g transform="translate(1220, 80)" filter="url(#dropShadow)">
        <rect x="0" y="0" width="55" height="55" rx="8" fill="#dc2626"/>
        <g stroke="#ffffff" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" fill="none">
          <!-- 禾 on left -->
          <path d="M22,12 L16,18"/>
          <line x1="12" y1="21" x2="26" y2="21"/>
          <line x1="20" y1="18" x2="20" y2="42"/>
          <path d="M20,26 L14,35"/>
          <path d="M20,26 L26,35"/>
          <!-- 口 on right -->
          <rect x="29" y="24" width="14" height="15"/>
        </g>
      </g>
    `
  }
];

console.log(`Rendering ${STORIES.length} storybook page illustrations...`);

for (const item of STORIES) {
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

console.log("\nAll 10 storybook page illustrations generated successfully!");
