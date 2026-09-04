import fs from "fs";
import path from "path";
import { execSync } from "child_process";

const OUTPUT_DIR = path.resolve("assets/images");
const TMP_DIR = "/tmp/literacy_books_batch1";

if (!fs.existsSync(TMP_DIR)) {
  fs.mkdirSync(TMP_DIR, { recursive: true });
}

function wrapSvg(content, customDefs = "") {
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1376 768" width="1376" height="768">
  <defs>
    <filter id="softGlow" x="-30%" y="-30%" width="160%" height="160%">
      <feGaussianBlur stdDeviation="12" result="blur"/>
    </filter>
    <filter id="dropShadow" x="-20%" y="-20%" width="140%" height="140%">
      <feDropShadow dx="3" dy="6" stdDeviation="6" flood-opacity="0.2"/>
    </filter>
    ${customDefs}
  </defs>
  ${content}
</svg>`;
}

const ITEMS = [
  // ==========================================
  // Book 1: 《十二生肖歌》
  // ==========================================
  // Cover: cover_zodiac
  {
    id: "cover_zodiac",
    title: "十二生肖歌 - 封面",
    defs: `
      <linearGradient id="zodiac_gold" x1="0%" y1="0%" x2="0%" y2="100%">
        <stop offset="0%" stop-color="#991b1b"/>
        <stop offset="60%" stop-color="#b91c1c"/>
        <stop offset="100%" stop-color="#7f1d1d"/>
      </linearGradient>
    `,
    content: `
      <rect width="1376" height="768" fill="url(#zodiac_gold)"/>
      <circle cx="688" cy="384" r="280" fill="#fef08a" opacity="0.15" filter="url(#softGlow)"/>
      <!-- Giant Chinese Traditional Zodiac Disc (十二生肖太极祥云金盘) -->
      <g transform="translate(688, 384)" filter="url(#dropShadow)">
        <circle cx="0" cy="0" r="240" fill="#facc15" stroke="#f59e0b" stroke-width="12"/>
        <circle cx="0" cy="0" r="200" fill="#991b1b" stroke="#fef08a" stroke-width="6"/>
        <!-- Auspicious Clouds & Gold Stars -->
        <circle cx="-120" cy="-60" r="20" fill="#fde047"/>
        <circle cx="120" cy="-60" r="20" fill="#fde047"/>
        <circle cx="0" cy="130" r="24" fill="#fde047"/>
        <polygon points="0,-160 30,-120 -30,-120" fill="#fde047"/>
        <circle cx="0" cy="0" r="60" fill="#facc15"/>
      </g>
      <!-- Red Seal (肖) -->
      <g transform="translate(1220, 80)" filter="url(#dropShadow)">
        <rect x="0" y="0" width="55" height="55" rx="8" fill="#dc2626"/>
        <g stroke="#ffffff" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" fill="none">
          <line x1="28" y1="12" x2="28" y2="24"/>
          <path d="M18,18 L14,24"/>
          <path d="M38,18 L42,24"/>
          <rect x="18" y="28" width="20" height="18" rx="2"/>
          <line x1="18" y1="36" x2="38" y2="36"/>
        </g>
      </g>
    `
  },
  // Page 1: story_zodiac_p1: 子鼠丑牛迎新春，寅虎卯兔跳得高
  {
    id: "story_zodiac_p1",
    title: "十二生肖歌 - 第1页",
    defs: `
      <linearGradient id="spring_bg1" x1="0%" y1="0%" x2="0%" y2="100%">
        <stop offset="0%" stop-color="#fee2e2"/>
        <stop offset="100%" stop-color="#fed7aa"/>
      </linearGradient>
    `,
    content: `
      <rect width="1376" height="768" fill="url(#spring_bg1)"/>
      <rect x="0" y="520" width="1376" height="248" fill="#86efac"/>
      <!-- Clever Rat & Strong Ox (机灵小松鼠/小金鼠与踏实大黄牛) -->
      <g transform="translate(240, 280)" filter="url(#dropShadow)">
        <!-- Strong Ox (大黄牛) -->
        <ellipse cx="200" cy="200" rx="130" ry="80" fill="#b45309"/>
        <circle cx="90" cy="160" r="45" fill="#b45309"/>
        <polygon points="60,130 30,90 80,120" fill="#78350f"/>
        <polygon points="120,130 150,90 100,120" fill="#78350f"/>
        <!-- Golden Rat on Ox Horn (牛角上的金鼠) -->
        <circle cx="35" cy="75" r="16" fill="#facc15"/>
        <circle cx="25" cy="65" r="6" fill="#facc15"/>
        <circle cx="45" cy="65" r="6" fill="#facc15"/>
      </g>
      <!-- Brave Tiger & Jumping White Rabbit (威武小金虎与蹦跳小白兔) -->
      <g transform="translate(820, 260)" filter="url(#dropShadow)">
        <!-- Little Tiger in Red Vest (穿红马甲的可爱小老虎) -->
        <ellipse cx="100" cy="200" rx="60" ry="50" fill="#f97316"/>
        <circle cx="100" cy="130" r="35" fill="#f97316"/>
        <!-- Stripes & 王 character on forehead -->
        <line x1="85" y1="110" x2="115" y2="110" stroke="#1e293b" stroke-width="4"/>
        <line x1="100" y1="100" x2="100" y2="120" stroke="#1e293b" stroke-width="4"/>
        <!-- Cute White Rabbit Jumping (蹦跳小白兔) -->
        <g transform="translate(220, 100)">
          <ellipse cx="40" cy="80" rx="30" ry="24" fill="#ffffff"/>
          <circle cx="60" cy="60" r="18" fill="#ffffff"/>
          <ellipse cx="55" cy="30" rx="6" ry="18" fill="#ffffff"/>
          <ellipse cx="68" cy="30" rx="6" ry="18" fill="#ffffff"/>
          <circle cx="65" cy="58" r="3" fill="#f43f5e"/>
        </g>
      </g>
      <!-- Red Seal (生) -->
      <g transform="translate(1220, 80)" filter="url(#dropShadow)">
        <rect x="0" y="0" width="55" height="55" rx="8" fill="#dc2626"/>
        <g stroke="#ffffff" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" fill="none">
          <line x1="16" y1="18" x2="26" y2="18"/>
          <line x1="28" y1="12" x2="28" y2="44"/>
          <line x1="16" y1="28" x2="40" y2="28"/>
          <line x1="12" y1="44" x2="44" y2="44"/>
        </g>
      </g>
    `
  },
  // Page 2: story_zodiac_p2: 辰龙翻云巳蛇游，午马奔腾未羊叫
  {
    id: "story_zodiac_p2",
    title: "十二生肖歌 - 第2页",
    defs: `
      <linearGradient id="cloud_sky_zodiac" x1="0%" y1="0%" x2="0%" y2="100%">
        <stop offset="0%" stop-color="#38bdf8"/>
        <stop offset="50%" stop-color="#bae6fd"/>
        <stop offset="100%" stop-color="#dcfce7"/>
      </linearGradient>
    `,
    content: `
      <rect width="1376" height="768" fill="url(#cloud_sky_zodiac)"/>
      <rect x="0" y="520" width="1376" height="248" fill="#22c55e"/>
      <!-- Golden Dragon Soaring in Clouds (金鳞神龙翻云海) -->
      <g transform="translate(200, 100)" filter="url(#dropShadow)">
        <path d="M40,240 Q140,120 280,180 Q380,240 480,140" stroke="#f59e0b" stroke-width="32" stroke-linecap="round" fill="none"/>
        <circle cx="480" cy="140" r="35" fill="#f59e0b"/>
        <polygon points="460,110 440,70 480,100" fill="#dc2626"/>
        <circle cx="495" cy="135" r="5" fill="#1e293b"/>
      </g>
      <!-- Galloping Horse & Gentle Sheep (骏马飞驰与温顺小绵羊) -->
      <g transform="translate(760, 300)" filter="url(#dropShadow)">
        <!-- Horse (飞奔骏马) -->
        <ellipse cx="140" cy="160" rx="80" ry="45" fill="#78350f"/>
        <path d="M190,140 Q230,100 250,70" stroke="#78350f" stroke-width="24" stroke-linecap="round" fill="none"/>
        <!-- Fluffy White Sheep (雪白喜羊羊) -->
        <g transform="translate(280, 80)">
          <ellipse cx="60" cy="80" rx="45" ry="35" fill="#ffffff"/>
          <circle cx="30" cy="70" r="16" fill="#fed7aa"/>
          <path d="M22,60 Q10,50 18,70" stroke="#d97706" stroke-width="4" fill="none"/>
          <circle cx="26" cy="68" r="2.5" fill="#1e293b"/>
        </g>
      </g>
      <!-- Red Seal (肖) -->
      <g transform="translate(1220, 80)" filter="url(#dropShadow)">
        <rect x="0" y="0" width="55" height="55" rx="8" fill="#dc2626"/>
        <g stroke="#ffffff" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" fill="none">
          <line x1="28" y1="12" x2="28" y2="24"/>
          <path d="M18,18 L14,24"/>
          <path d="M38,18 L42,24"/>
          <rect x="18" y="28" width="20" height="18" rx="2"/>
          <line x1="18" y1="36" x2="38" y2="36"/>
        </g>
      </g>
    `
  },
  // Page 3: story_zodiac_p3: 申猴酉鸡戌狗亥猪，十二生肖大家族乐陶陶
  {
    id: "story_zodiac_p3",
    title: "十二生肖歌 - 第3页",
    defs: `
      <linearGradient id="sunset_zodiac" x1="0%" y1="0%" x2="0%" y2="100%">
        <stop offset="0%" stop-color="#fbcfe8"/>
        <stop offset="50%" stop-color="#fed7aa"/>
        <stop offset="100%" stop-color="#fef08a"/>
      </linearGradient>
    `,
    content: `
      <rect width="1376" height="768" fill="url(#sunset_zodiac)"/>
      <rect x="0" y="520" width="1376" height="248" fill="#86efac"/>
      <!-- Monkey, Rooster, Dog, Pig Dancing Happily (猴鸡狗猪齐欢聚) -->
      <!-- Clever Monkey Holding Peach (灵猴献寿捧大桃) -->
      <g transform="translate(180, 320)" filter="url(#dropShadow)">
        <ellipse cx="60" cy="140" rx="35" ry="45" fill="#b45309"/>
        <circle cx="60" cy="80" r="26" fill="#fed7aa"/>
        <circle cx="60" cy="70" r="30" fill="#b45309" opacity="0.5"/>
        <!-- Big Pink Peach -->
        <circle cx="100" cy="120" r="20" fill="#f43f5e"/>
      </g>
      <!-- Proud Rooster Crowing (金鸡破晓大红冠) -->
      <g transform="translate(460, 300)" filter="url(#dropShadow)">
        <ellipse cx="60" cy="140" rx="40" ry="30" fill="#f59e0b"/>
        <circle cx="85" cy="110" r="18" fill="#f59e0b"/>
        <polygon points="85,90 80,70 95,85" fill="#dc2626"/>
      </g>
      <!-- Loyal Cute Dog Wagging Tail (忠诚乖巧金毛犬) -->
      <g transform="translate(740, 340)" filter="url(#dropShadow)">
        <ellipse cx="60" cy="120" rx="45" ry="30" fill="#d97706"/>
        <circle cx="95" cy="95" r="22" fill="#d97706"/>
        <ellipse cx="110" cy="100" rx="6" ry="16" fill="#92400e"/>
      </g>
      <!-- Chubby Smiling Piggy (白白胖胖开心金猪) -->
      <g transform="translate(1020, 320)" filter="url(#dropShadow)">
        <circle cx="70" cy="120" r="50" fill="#fbcfe8"/>
        <ellipse cx="70" cy="125" rx="16" ry="12" fill="#f472b6"/>
        <circle cx="65" cy="125" r="2.5" fill="#831843"/>
        <circle cx="75" cy="125" r="2.5" fill="#831843"/>
      </g>
      <!-- Red Seal (福) -->
      <g transform="translate(1220, 80)" filter="url(#dropShadow)">
        <rect x="0" y="0" width="55" height="55" rx="8" fill="#dc2626"/>
        <g stroke="#ffffff" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" fill="none">
          <line x1="16" y1="16" x2="24" y2="16"/>
          <line x1="20" y1="16" x2="20" y2="44"/>
          <line x1="14" y1="28" x2="24" y2="28"/>
          <line x1="28" y1="16" x2="42" y2="16"/>
          <rect x="30" y="20" width="12" height="10" rx="1"/>
          <rect x="28" y="32" width="14" height="12" rx="1"/>
          <line x1="35" y1="32" x2="35" y2="44"/>
        </g>
      </g>
    `
  },

  // ==========================================
  // Book 2: 《过大年贴春联》
  // ==========================================
  // Cover: cover_spring_festival
  {
    id: "cover_spring_festival",
    title: "过大年贴春联 - 封面",
    defs: `
      <linearGradient id="festive_red" x1="0%" y1="0%" x2="0%" y2="100%">
        <stop offset="0%" stop-color="#b91c1c"/>
        <stop offset="50%" stop-color="#991b1b"/>
        <stop offset="100%" stop-color="#7f1d1d"/>
      </linearGradient>
    `,
    content: `
      <rect width="1376" height="768" fill="url(#festive_red)"/>
      <!-- Grand Courtyard Gate with Red Couplets (四合院朱门大红春联) -->
      <g transform="translate(388, 120)" filter="url(#dropShadow)">
        <rect x="0" y="80" width="600" height="520" fill="#7f1d1d" stroke="#f59e0b" stroke-width="8"/>
        <!-- Door Panels Left & Right -->
        <rect x="30" y="110" width="250" height="460" fill="#991b1b"/>
        <rect x="320" y="110" width="250" height="460" fill="#991b1b"/>
        <!-- Red Couplets (大红春联) -->
        <rect x="50" y="140" width="60" height="380" fill="#dc2626" stroke="#fef08a" stroke-width="3"/>
        <rect x="490" y="140" width="60" height="380" fill="#dc2626" stroke="#fef08a" stroke-width="3"/>
        <!-- Diamond "福" Plaque in Center (倒贴福字迎春晖) -->
        <rect x="270" y="310" width="60" height="60" fill="#facc15" transform="rotate(45 300 340)" stroke="#dc2626" stroke-width="4"/>
      </g>
      <!-- Hanging Big Red Lanterns (高悬喜庆宫灯) -->
      <g transform="translate(180, 80)" filter="url(#softGlow)">
        <ellipse cx="60" cy="90" rx="55" ry="75" fill="#dc2626"/>
      </g>
      <g transform="translate(1080, 80)" filter="url(#softGlow)">
        <ellipse cx="60" cy="90" rx="55" ry="75" fill="#dc2626"/>
      </g>
      <!-- Red Seal (年) -->
      <g transform="translate(1220, 80)" filter="url(#dropShadow)">
        <rect x="0" y="0" width="55" height="55" rx="8" fill="#dc2626"/>
        <g stroke="#ffffff" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" fill="none">
          <line x1="16" y1="20" x2="38" y2="20"/>
          <line x1="22" y1="14" x2="22" y2="28"/>
          <line x1="14" y1="28" x2="42" y2="28"/>
          <line x1="28" y1="12" x2="28" y2="44"/>
          <line x1="12" y1="44" x2="44" y2="44"/>
        </g>
      </g>
    `
  },
  // Page 1: story_spring_festival_p1: 大红春联贴门上，福字倒贴福来到
  {
    id: "story_spring_festival_p1",
    title: "过大年贴春联 - 第1页",
    defs: `
      <linearGradient id="festive_bg1" x1="0%" y1="0%" x2="0%" y2="100%">
        <stop offset="0%" stop-color="#fee2e2"/>
        <stop offset="100%" stop-color="#fed7aa"/>
      </linearGradient>
    `,
    content: `
      <rect width="1376" height="768" fill="url(#festive_bg1)"/>
      <rect x="0" y="520" width="1376" height="248" fill="#94a3b8"/>
      <!-- Grand Vermilion Gate & Chinese Flying Eaves (朱漆大门飞檐黛瓦) -->
      <g transform="translate(200, 100)" filter="url(#dropShadow)">
        <polygon points="40,80 500,80 460,0 80,0" fill="#334155"/>
        <rect x="60" y="80" width="420" height="440" fill="#991b1b"/>
        <!-- Golden Diamond "福" Plaque (倒贴金福) -->
        <rect x="240" y="240" width="70" height="70" fill="#facc15" transform="rotate(45 275 275)"/>
      </g>
      <!-- Grandfather and Child Pasting Couplets (爷爷带孙子欢天喜地贴春联) -->
      <g transform="translate(740, 220)" filter="url(#dropShadow)">
        <!-- Grandfather in Traditional Red Tangzhuang (慈祥爷爷穿红唐装) -->
        <rect x="40" y="140" width="80" height="240" rx="18" fill="#dc2626"/>
        <circle cx="80" cy="90" r="32" fill="#fed7aa"/>
        <circle cx="80" cy="55" r="16" fill="#e2e8f0"/>
        <!-- Smiling Eyes & Beard -->
        <path d="M70,105 Q80,115 90,105" stroke="#78350f" stroke-width="3" fill="none"/>
        <!-- Child in Red Padded Vest Holding Paste Brush (萌宝捧小面糊刷刷贴春联) -->
        <g transform="translate(150, 140)">
          <rect x="20" y="90" width="55" height="110" rx="14" fill="#facc15"/>
          <circle cx="48" cy="60" r="24" fill="#fed7aa"/>
          <circle cx="48" cy="35" r="12" fill="#1e293b"/>
          <line x1="50" y1="110" x2="90" y2="70" stroke="#78350f" stroke-width="8" stroke-linecap="round"/>
        </g>
      </g>
      <!-- Red Seal (春) -->
      <g transform="translate(1220, 80)" filter="url(#dropShadow)">
        <rect x="0" y="0" width="55" height="55" rx="8" fill="#dc2626"/>
        <g stroke="#ffffff" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" fill="none">
          <line x1="16" y1="18" x2="38" y2="18"/>
          <line x1="18" y1="24" x2="36" y2="24"/>
          <line x1="12" y1="30" x2="42" y2="30"/>
          <path d="M28,14 L16,42"/>
          <path d="M28,24 L40,42"/>
          <rect x="22" y="32" width="12" height="12" rx="1"/>
        </g>
      </g>
    `
  },
  // Page 2: story_spring_festival_p2: 一家人围坐圆桌包饺子，热气腾腾笑哈哈
  {
    id: "story_spring_festival_p2",
    title: "过大年贴春联 - 第2页",
    defs: `
      <linearGradient id="warm_room_spring" x1="0%" y1="0%" x2="0%" y2="100%">
        <stop offset="0%" stop-color="#fef3c7"/>
        <stop offset="100%" stop-color="#fed7aa"/>
      </linearGradient>
    `,
    content: `
      <rect width="1376" height="768" fill="url(#warm_room_spring)"/>
      <!-- Cozy Living Room with Round Dining Table (全家团聚大圆桌) -->
      <g transform="translate(420, 360)" filter="url(#dropShadow)">
        <ellipse cx="260" cy="180" rx="260" ry="110" fill="#b45309" stroke="#78350f" stroke-width="8"/>
        <!-- Big Steaming Plates of Dumplings (白胖可口的元宝水饺) -->
        <ellipse cx="260" cy="160" rx="90" ry="50" fill="#ffffff" stroke="#cbd5e1" stroke-width="4"/>
        <circle cx="230" cy="155" r="16" fill="#fef08a"/>
        <circle cx="260" cy="150" r="16" fill="#fef08a"/>
        <circle cx="290" cy="155" r="16" fill="#fef08a"/>
        <!-- Rising Delicious Steam -->
        <path d="M250,110 Q260,60 250,20" stroke="#ffffff" stroke-width="12" fill="none" opacity="0.7" filter="url(#softGlow)"/>
      </g>
      <!-- Happy Family Surrounding Table (其乐融融的一家人) -->
      <g transform="translate(240, 200)" filter="url(#dropShadow)">
        <!-- Mother in Red -->
        <rect x="40" y="100" width="70" height="180" rx="16" fill="#dc2626"/>
        <circle cx="75" cy="65" r="28" fill="#fed7aa"/>
      </g>
      <g transform="translate(940, 200)" filter="url(#dropShadow)">
        <!-- Father in Blue -->
        <rect x="40" y="100" width="70" height="180" rx="16" fill="#1e40af"/>
        <circle cx="75" cy="65" r="28" fill="#fed7aa"/>
      </g>
      <!-- Red Seal (圆) -->
      <g transform="translate(1220, 80)" filter="url(#dropShadow)">
        <rect x="0" y="0" width="55" height="55" rx="8" fill="#dc2626"/>
        <g stroke="#ffffff" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" fill="none">
          <rect x="14" y="14" width="28" height="28" rx="2"/>
          <line x1="22" y1="20" x2="34" y2="20"/>
          <rect x="22" y="24" width="12" height="12" rx="1"/>
        </g>
      </g>
    `
  },
  // Page 3: story_spring_festival_p3: 穿上红色新棉袄放烟花，拜年互道吉祥话
  {
    id: "story_spring_festival_p3",
    title: "过大年贴春联 - 第3页",
    defs: `
      <linearGradient id="night_firework" x1="0%" y1="0%" x2="0%" y2="100%">
        <stop offset="0%" stop-color="#1e1b4b"/>
        <stop offset="50%" stop-color="#312e81"/>
        <stop offset="100%" stop-color="#831843"/>
      </linearGradient>
    `,
    content: `
      <rect width="1376" height="768" fill="url(#night_firework)"/>
      <!-- Sparkling Fireworks in Night Sky (夜空绽放绚丽七彩烟花) -->
      <g transform="translate(360, 160)" filter="url(#softGlow)">
        <circle cx="0" cy="0" r="12" fill="#fde047"/>
        <line x1="-50" y1="0" x2="50" y2="0" stroke="#f43f5e" stroke-width="6"/>
        <line x1="0" y1="-50" x2="0" y2="50" stroke="#f43f5e" stroke-width="6"/>
        <line x1="-35" y1="-35" x2="35" y2="35" stroke="#facc15" stroke-width="6"/>
        <line x1="-35" y1="35" x2="35" y2="-35" stroke="#facc15" stroke-width="6"/>
      </g>
      <g transform="translate(1000, 180)" filter="url(#softGlow)">
        <circle cx="0" cy="0" r="12" fill="#a7f3d0"/>
        <line x1="-60" y1="0" x2="60" y2="0" stroke="#38bdf8" stroke-width="6"/>
        <line x1="0" y1="-60" x2="0" y2="60" stroke="#38bdf8" stroke-width="6"/>
      </g>
      <!-- Children in Red Padded Clothes Playing Happily (身穿红色小棉袄、手拿小风车拜大年) -->
      <g transform="translate(600, 360)" filter="url(#dropShadow)">
        <rect x="40" y="100" width="70" height="140" rx="16" fill="#dc2626"/>
        <circle cx="75" cy="65" r="28" fill="#fed7aa"/>
        <!-- Topknot Buns with Red Ribbons -->
        <circle cx="55" cy="40" r="10" fill="#1e293b"/>
        <circle cx="95" cy="40" r="10" fill="#1e293b"/>
        <!-- Smiling Faces & Hands Bowing -->
        <path d="M68,75 Q75,82 82,75" stroke="#991b1b" stroke-width="3" fill="none"/>
        <circle cx="75" cy="140" r="12" fill="#fed7aa"/>
      </g>
      <!-- Red Seal (祥) -->
      <g transform="translate(1220, 80)" filter="url(#dropShadow)">
        <rect x="0" y="0" width="55" height="55" rx="8" fill="#dc2626"/>
        <g stroke="#ffffff" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" fill="none">
          <line x1="16" y1="16" x2="24" y2="16"/>
          <line x1="20" y1="16" x2="20" y2="44"/>
          <line x1="28" y1="16" x2="42" y2="16"/>
          <line x1="35" y1="16" x2="35" y2="44"/>
          <line x1="28" y1="26" x2="42" y2="26"/>
          <line x1="26" y1="36" x2="44" y2="36"/>
        </g>
      </g>
    `
  },

  // ==========================================
  // Book 3: 《重阳登高赏秋菊》
  // ==========================================
  // Cover: cover_chongyang
  {
    id: "cover_chongyang",
    title: "重阳登高赏秋菊 - 封面",
    defs: `
      <linearGradient id="chongyang_sky" x1="0%" y1="0%" x2="0%" y2="100%">
        <stop offset="0%" stop-color="#0284c7"/>
        <stop offset="50%" stop-color="#38bdf8"/>
        <stop offset="100%" stop-color="#fed7aa"/>
      </linearGradient>
    `,
    content: `
      <rect width="1376" height="768" fill="url(#chongyang_sky)"/>
      <!-- Red Maple Mountain with Golden Chrysanthemums (金秋枫红与漫山金菊) -->
      <polygon points="688,140 200,768 1176,768" fill="#b45309" filter="url(#dropShadow)"/>
      <polygon points="340,320 0,768 700,768" fill="#d97706" opacity="0.8"/>
      <!-- Big Golden Chrysanthemum Blossoms (盛开的金丝皇菊) -->
      <g transform="translate(688, 540)" filter="url(#softGlow)">
        <circle cx="0" cy="0" r="60" fill="#facc15"/>
        <circle cx="0" cy="0" r="40" fill="#f59e0b"/>
        <circle cx="0" cy="0" r="20" fill="#dc2626"/>
      </g>
      <!-- Red Seal (重) -->
      <g transform="translate(1220, 80)" filter="url(#dropShadow)">
        <rect x="0" y="0" width="55" height="55" rx="8" fill="#dc2626"/>
        <g stroke="#ffffff" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" fill="none">
          <line x1="16" y1="16" x2="38" y2="16"/>
          <line x1="28" y1="12" x2="28" y2="44"/>
          <rect x="18" y="22" width="20" height="14" rx="2"/>
          <line x1="18" y1="29" x2="38" y2="29"/>
          <line x1="12" y1="44" x2="44" y2="44"/>
        </g>
      </g>
    `
  },
  // Page 1: story_chongyang_p1: 九月九日重阳到，满山遍野金菊香
  {
    id: "story_chongyang_p1",
    title: "重阳登高赏秋菊 - 第1页",
    defs: `
      <linearGradient id="autumn_hill" x1="0%" y1="0%" x2="0%" y2="100%">
        <stop offset="0%" stop-color="#38bdf8"/>
        <stop offset="60%" stop-color="#fed7aa"/>
        <stop offset="100%" stop-color="#fef08a"/>
      </linearGradient>
    `,
    content: `
      <rect width="1376" height="768" fill="url(#autumn_hill)"/>
      <rect x="0" y="520" width="1376" height="248" fill="#b45309"/>
      <!-- Fields of Yellow & Red Autumn Flowers (重阳佳节金菊怒放) -->
      <g transform="translate(260, 440)" filter="url(#dropShadow)">
        <circle cx="60" cy="60" r="40" fill="#facc15"/>
        <circle cx="160" cy="40" r="35" fill="#f59e0b"/>
        <circle cx="280" cy="70" r="45" fill="#e11d48"/>
        <circle cx="860" cy="50" r="40" fill="#facc15"/>
      </g>
      <!-- Mountain Peak Stone Steps (蜿蜒青石登山径) -->
      <path d="M100,560 Q400,420 800,460 T1376,380" stroke="#e2e8f0" stroke-width="24" fill="none"/>
      <!-- Red Seal (菊) -->
      <g transform="translate(1220, 80)" filter="url(#dropShadow)">
        <rect x="0" y="0" width="55" height="55" rx="8" fill="#dc2626"/>
        <g stroke="#ffffff" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" fill="none">
          <line x1="14" y1="16" x2="42" y2="16"/>
          <line x1="22" y1="12" x2="22" y2="20"/>
          <line x1="34" y1="12" x2="34" y2="20"/>
          <path d="M18,22 L38,22 L38,32 L18,32 Z"/>
          <line x1="28" y1="32" x2="28" y2="44"/>
          <path d="M18,38 L14,44"/>
          <path d="M38,38 L42,44"/>
        </g>
      </g>
    `
  },
  // Page 2: story_chongyang_p2: 小朋友挽着爷爷奶奶，品尝香甜菊花茶
  {
    id: "story_chongyang_p2",
    title: "重阳登高赏秋菊 - 第2页",
    defs: `
      <linearGradient id="tea_sky" x1="0%" y1="0%" x2="0%" y2="100%">
        <stop offset="0%" stop-color="#fef3c7"/>
        <stop offset="100%" stop-color="#fed7aa"/>
      </linearGradient>
    `,
    content: `
      <rect width="1376" height="768" fill="url(#tea_sky)"/>
      <rect x="0" y="520" width="1376" height="248" fill="#d97706"/>
      <!-- Mountain Pavilion Resting Stop (山顶凉亭奉清茶) -->
      <g transform="translate(380, 200)" filter="url(#dropShadow)">
        <!-- Stone Table with Chrysanthemum Tea (石桌热气腾腾菊花茶) -->
        <ellipse cx="300" cy="300" rx="180" ry="70" fill="#e2e8f0"/>
        <circle cx="300" cy="285" r="22" fill="#0284c7"/>
        <circle cx="300" cy="285" r="16" fill="#fef08a"/>
      </g>
      <!-- Grandparents and Child Respectfully Serving Tea (敬老爱亲乐融融) -->
      <g transform="translate(420, 240)" filter="url(#dropShadow)">
        <!-- Kind Grandfather -->
        <rect x="60" y="100" width="70" height="180" rx="16" fill="#065f46"/>
        <circle cx="95" cy="65" r="28" fill="#fed7aa"/>
        <circle cx="95" cy="35" r="14" fill="#e2e8f0"/>
        <!-- Child in Red Serving Teacup (双手端茶孝敬长辈) -->
        <g transform="translate(200, 80)">
          <rect x="20" y="80" width="55" height="110" rx="14" fill="#dc2626"/>
          <circle cx="48" cy="50" r="24" fill="#fed7aa"/>
          <circle cx="48" cy="25" r="12" fill="#1e293b"/>
        </g>
      </g>
      <!-- Red Seal (孝) -->
      <g transform="translate(1220, 80)" filter="url(#dropShadow)">
        <rect x="0" y="0" width="55" height="55" rx="8" fill="#dc2626"/>
        <g stroke="#ffffff" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" fill="none">
          <line x1="16" y1="16" x2="38" y2="16"/>
          <path d="M28,12 L18,28"/>
          <line x1="12" y1="26" x2="42" y2="26"/>
          <rect x="22" y="30" width="14" height="14" rx="2"/>
        </g>
      </g>
    `
  },
  // Page 3: story_chongyang_p3: 登上高山极目远望，蓝天万里秋色爽
  {
    id: "story_chongyang_p3",
    title: "重阳登高赏秋菊 - 第3页",
    defs: `
      <linearGradient id="view_sky" x1="0%" y1="0%" x2="0%" y2="100%">
        <stop offset="0%" stop-color="#0284c7"/>
        <stop offset="60%" stop-color="#38bdf8"/>
        <stop offset="100%" stop-color="#bae6fd"/>
      </linearGradient>
    `,
    content: `
      <rect width="1376" height="768" fill="url(#view_sky)"/>
      <!-- Distant Autumn Rolling Rivers & Forests (登高望远江山万里秋) -->
      <path d="M0,520 Q400,380 800,480 T1376,420 L1376,768 L0,768 Z" fill="#b45309"/>
      <path d="M0,580 Q500,460 1000,540 T1376,500 L1376,768 L0,768 Z" fill="#d97706"/>
      <!-- Family on High Cliff Gazing into Distance (立于峰顶指点江山) -->
      <g transform="translate(340, 360)" filter="url(#dropShadow)">
        <!-- Boy Pointing Hand Ahead -->
        <rect x="40" y="60" width="40" height="90" rx="10" fill="#0284c7"/>
        <circle cx="60" cy="40" r="18" fill="#fed7aa"/>
        <line x1="75" y1="70" x2="130" y2="40" stroke="#0284c7" stroke-width="12" stroke-linecap="round"/>
        <!-- Grandfather Smiling Beside Him -->
        <rect x="110" y="40" width="55" height="120" rx="12" fill="#78350f"/>
        <circle cx="138" cy="20" r="20" fill="#fed7aa"/>
        <circle cx="138" cy="0" r="10" fill="#e2e8f0"/>
      </g>
      <!-- Red Seal (秋) -->
      <g transform="translate(1220, 80)" filter="url(#dropShadow)">
        <rect x="0" y="0" width="55" height="55" rx="8" fill="#dc2626"/>
        <g stroke="#ffffff" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" fill="none">
          <path d="M22,14 L14,20"/>
          <line x1="12" y1="24" x2="28" y2="24"/>
          <line x1="20" y1="18" x2="20" y2="44"/>
          <line x1="36" y1="14" x2="36" y2="44"/>
          <path d="M30,26 L36,32"/>
          <path d="M42,26 L36,32"/>
        </g>
      </g>
    `
  }
];

console.log(`Generating ${ITEMS.length} illustrations for Books 1-3...`);

for (const item of ITEMS) {
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

console.log("\nAll 12 illustrations for Books 1-3 generated successfully!");
