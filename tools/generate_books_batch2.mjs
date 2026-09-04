import fs from "fs";
import path from "path";
import { execSync } from "child_process";

const OUTPUT_DIR = path.resolve("assets/images");
const TMP_DIR = "/tmp/literacy_books_batch2";

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
  // Book 4: 《清明踏青放纸鸢》
  // ==========================================
  // Cover: cover_qingming_kite
  {
    id: "cover_qingming_kite",
    title: "清明踏青放纸鸢 - 封面",
    defs: `
      <linearGradient id="qingming_cover_sky" x1="0%" y1="0%" x2="0%" y2="100%">
        <stop offset="0%" stop-color="#38bdf8"/>
        <stop offset="50%" stop-color="#bae6fd"/>
        <stop offset="100%" stop-color="#dcfce7"/>
      </linearGradient>
    `,
    content: `
      <rect width="1376" height="768" fill="url(#qingming_cover_sky)"/>
      <!-- Spring Meadows and River (春水初生草长莺飞) -->
      <path d="M0,520 Q400,420 800,500 T1376,460 L1376,768 L0,768 Z" fill="#86efac"/>
      <path d="M0,580 Q500,500 1000,580 T1376,540 L1376,768 L0,768 Z" fill="#22c55e"/>
      <!-- Giant Colorful Swallow Kite Flying High (非遗彩绘沙燕大纸鸢) -->
      <g transform="translate(688, 220)" filter="url(#dropShadow)">
        <polygon points="0,-40 120,-80 80,0" fill="#dc2626"/>
        <polygon points="0,-40 -120,-80 -80,0" fill="#dc2626"/>
        <ellipse cx="0" cy="0" rx="30" ry="45" fill="#facc15" stroke="#b45309" stroke-width="3"/>
        <circle cx="0" cy="-35" r="16" fill="#1e293b"/>
        <!-- Forked Tail Feathers -->
        <polygon points="-15,30 -50,110 -5,60" fill="#1e293b"/>
        <polygon points="15,30 50,110 5,60" fill="#1e293b"/>
        <line x1="0" y1="10" x2="-200" y2="340" stroke="#ffffff" stroke-width="2" opacity="0.8"/>
      </g>
      <!-- Weeping Willows in Foreground -->
      <path d="M100,0 Q160,180 80,400" stroke="#65a30d" stroke-width="8" fill="none"/>
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
  // Page 1: story_qingming_kite_p1: 清明春雨润大地，杨柳青青小草绿
  {
    id: "story_qingming_kite_p1",
    title: "清明踏青放纸鸢 - 第1页",
    defs: `
      <linearGradient id="spring_rain_sky" x1="0%" y1="0%" x2="0%" y2="100%">
        <stop offset="0%" stop-color="#94a3b8"/>
        <stop offset="40%" stop-color="#cbd5e1"/>
        <stop offset="100%" stop-color="#bbf7d0"/>
      </linearGradient>
    `,
    content: `
      <rect width="1376" height="768" fill="url(#spring_rain_sky)"/>
      <!-- Gentle Spring Drizzle (霏霏细雨沾衣欲湿) -->
      <g stroke="#ffffff" stroke-width="2" stroke-dasharray="8 20" opacity="0.7">
        <line x1="100" y1="100" x2="60" y2="220"/>
        <line x1="300" y1="80" x2="260" y2="200"/>
        <line x1="500" y1="120" x2="460" y2="240"/>
        <line x1="700" y1="60" x2="660" y2="180"/>
        <line x1="900" y1="100" x2="860" y2="220"/>
        <line x1="1100" y1="80" x2="1060" y2="200"/>
      </g>
      <!-- Green Grass Bank & Stream (碧水绿草) -->
      <rect x="0" y="520" width="1376" height="248" fill="#22c55e"/>
      <path d="M0,580 Q400,520 800,600 T1376,560 L1376,768 L0,768 Z" fill="#0284c7"/>
      <!-- Red Seal (青) -->
      <g transform="translate(1220, 80)" filter="url(#dropShadow)">
        <rect x="0" y="0" width="55" height="55" rx="8" fill="#dc2626"/>
        <g stroke="#ffffff" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" fill="none">
          <line x1="14" y1="16" x2="42" y2="16"/>
          <line x1="28" y1="12" x2="28" y2="28"/>
          <line x1="18" y1="22" x2="38" y2="22"/>
          <line x1="14" y1="28" x2="42" y2="28"/>
          <rect x="18" y="32" width="20" height="14" rx="2"/>
          <line x1="18" y1="39" x2="38" y2="39"/>
        </g>
      </g>
    `
  },
  // Page 2: story_qingming_kite_p2: 欢快奔跑在草地上，沙燕风筝乘风高高飞
  {
    id: "story_qingming_kite_p2",
    title: "清明踏青放纸鸢 - 第2页",
    defs: `
      <linearGradient id="kite_sky2" x1="0%" y1="0%" x2="0%" y2="100%">
        <stop offset="0%" stop-color="#0284c7"/>
        <stop offset="60%" stop-color="#38bdf8"/>
        <stop offset="100%" stop-color="#fef08a"/>
      </linearGradient>
    `,
    content: `
      <rect width="1376" height="768" fill="url(#kite_sky2)"/>
      <rect x="0" y="520" width="1376" height="248" fill="#86efac"/>
      <!-- Running Child Flying Kite (欢快牵线奔跑的小朋友) -->
      <g transform="translate(420, 360)" filter="url(#dropShadow)">
        <rect x="40" y="60" width="40" height="90" rx="10" fill="#dc2626"/>
        <circle cx="60" cy="40" r="18" fill="#fed7aa"/>
        <circle cx="60" cy="18" r="8" fill="#1e293b"/>
        <!-- Arm Holding Kite String High (高高举起风筝线轮) -->
        <line x1="75" y1="70" x2="120" y2="20" stroke="#dc2626" stroke-width="12" stroke-linecap="round"/>
        <circle cx="120" cy="20" r="8" fill="#facc15"/>
        <line x1="120" y1="20" x2="380" y2="-180" stroke="#ffffff" stroke-width="2"/>
      </g>
      <!-- Red Swallow Kite in Sky (高飞的红色沙燕风筝) -->
      <g transform="translate(800, 180)" filter="url(#dropShadow)">
        <polygon points="0,-25 75,-50 50,0" fill="#dc2626"/>
        <polygon points="0,-25 -75,-50 -50,0" fill="#dc2626"/>
        <circle cx="0" cy="0" r="18" fill="#facc15"/>
      </g>
      <!-- Red Seal (鸢) -->
      <g transform="translate(1220, 80)" filter="url(#dropShadow)">
        <rect x="0" y="0" width="55" height="55" rx="8" fill="#dc2626"/>
        <g stroke="#ffffff" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" fill="none">
          <path d="M16,14 L30,14 L30,22 L16,22"/>
          <line x1="20" y1="14" x2="20" y2="28"/>
          <path d="M34,14 L42,14 L42,42"/>
          <line x1="16" y1="32" x2="34" y2="32"/>
          <line x1="16" y1="42" x2="34" y2="42"/>
        </g>
      </g>
    `
  },
  // Page 3: story_qingming_kite_p3: 溪边歇息尝一尝，软糯香甜青团甜心头
  {
    id: "story_qingming_kite_p3",
    title: "清明踏青放纸鸢 - 第3页",
    defs: `
      <linearGradient id="picnic_sky" x1="0%" y1="0%" x2="0%" y2="100%">
        <stop offset="0%" stop-color="#bae6fd"/>
        <stop offset="60%" stop-color="#e0f2fe"/>
        <stop offset="100%" stop-color="#bbf7d0"/>
      </linearGradient>
    `,
    content: `
      <rect width="1376" height="768" fill="url(#picnic_sky)"/>
      <rect x="0" y="520" width="1376" height="248" fill="#22c55e"/>
      <!-- Picnic Cloth with Plate of Delicious Green Qingtuan (青花瓷盘盛软糯甜青团) -->
      <g transform="translate(560, 420)" filter="url(#dropShadow)">
        <ellipse cx="140" cy="100" rx="140" ry="60" fill="#ffffff" stroke="#0284c7" stroke-width="6"/>
        <!-- Emerald Green Sweet Rice Balls (碧绿软糯的艾草青团) -->
        <circle cx="90" cy="90" r="24" fill="#15803d" stroke="#16a34a" stroke-width="3"/>
        <circle cx="140" cy="80" r="26" fill="#15803d" stroke="#16a34a" stroke-width="3"/>
        <circle cx="190" cy="90" r="24" fill="#15803d" stroke="#16a34a" stroke-width="3"/>
      </g>
      <!-- Red Seal (和) -->
      <g transform="translate(1220, 80)" filter="url(#dropShadow)">
        <rect x="0" y="0" width="55" height="55" rx="8" fill="#dc2626"/>
        <g stroke="#ffffff" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" fill="none">
          <path d="M22,14 L14,20"/>
          <line x1="12" y1="24" x2="28" y2="24"/>
          <line x1="20" y1="18" x2="20" y2="44"/>
          <path d="M20,24 L14,36"/>
          <path d="M20,24 L26,34"/>
          <rect x="30" y="22" width="14" height="16" rx="2"/>
        </g>
      </g>
    `
  },

  // ==========================================
  // Book 5: 《冬至到吃水饺》
  // ==========================================
  // Cover: cover_dongzhi
  {
    id: "cover_dongzhi",
    title: "冬至到吃水饺 - 封面",
    defs: `
      <linearGradient id="dongzhi_cover_bg" x1="0%" y1="0%" x2="0%" y2="100%">
        <stop offset="0%" stop-color="#1e293b"/>
        <stop offset="60%" stop-color="#334155"/>
        <stop offset="100%" stop-color="#991b1b"/>
      </linearGradient>
    `,
    content: `
      <rect width="1376" height="768" fill="url(#dongzhi_cover_bg)"/>
      <!-- Snow Covered Roof Eaves & Glowing Window (雪落飞檐暖阁红窗) -->
      <polygon points="200,160 1176,160 1100,60 276,60" fill="#ffffff" filter="url(#dropShadow)"/>
      <!-- Steaming Hot Dumpling Plate in Center (热气腾腾大水饺) -->
      <g transform="translate(688, 440)" filter="url(#dropShadow)">
        <ellipse cx="0" cy="0" rx="220" ry="100" fill="#fef3c7" stroke="#b45309" stroke-width="8"/>
        <circle cx="-60" cy="-10" r="28" fill="#ffffff" stroke="#cbd5e1" stroke-width="3"/>
        <circle cx="0" cy="-20" r="30" fill="#ffffff" stroke="#cbd5e1" stroke-width="3"/>
        <circle cx="60" cy="-10" r="28" fill="#ffffff" stroke="#cbd5e1" stroke-width="3"/>
        <!-- Rising Steam -->
        <path d="M-20,-70 Q0,-140 -20,-200" stroke="#ffffff" stroke-width="14" fill="none" opacity="0.8" filter="url(#softGlow)"/>
        <path d="M20,-70 Q40,-140 20,-200" stroke="#ffffff" stroke-width="14" fill="none" opacity="0.8" filter="url(#softGlow)"/>
      </g>
      <!-- Red Seal (冬) -->
      <g transform="translate(1220, 80)" filter="url(#dropShadow)">
        <rect x="0" y="0" width="55" height="55" rx="8" fill="#dc2626"/>
        <g stroke="#ffffff" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" fill="none">
          <path d="M18,16 L38,16 L28,26 L36,32"/>
          <path d="M28,26 L16,36"/>
          <circle cx="28" cy="38" r="2" fill="#ffffff"/>
          <circle cx="34" cy="44" r="2" fill="#ffffff"/>
        </g>
      </g>
    `
  },
  // Page 1: story_dongzhi_p1: 白雪飘飘落屋檐，屋里火炉暖融融
  {
    id: "story_dongzhi_p1",
    title: "冬至到吃水饺 - 第1页",
    defs: `
      <linearGradient id="snow_window" x1="0%" y1="0%" x2="0%" y2="100%">
        <stop offset="0%" stop-color="#0f172a"/>
        <stop offset="100%" stop-color="#1e1b4b"/>
      </linearGradient>
    `,
    content: `
      <rect width="1376" height="768" fill="url(#snow_window)"/>
      <!-- Falling Snowflakes (白雪飘飘) -->
      <g fill="#ffffff" opacity="0.8" filter="url(#softGlow)">
        <circle cx="200" cy="140" r="8"/>
        <circle cx="400" cy="80" r="10"/>
        <circle cx="700" cy="180" r="9"/>
        <circle cx="1000" cy="120" r="12"/>
        <circle cx="1200" cy="220" r="8"/>
      </g>
      <!-- Warm Stove in Room (屋里暖和的红泥小火炉) -->
      <g transform="translate(620, 360)" filter="url(#dropShadow)">
        <rect x="0" y="60" width="140" height="180" rx="16" fill="#78350f"/>
        <circle cx="70" cy="120" r="35" fill="#f97316" filter="url(#softGlow)"/>
        <polygon points="70,90 55,140 85,140" fill="#facc15"/>
      </g>
      <!-- Red Seal (冬) -->
      <g transform="translate(1220, 80)" filter="url(#dropShadow)">
        <rect x="0" y="0" width="55" height="55" rx="8" fill="#dc2626"/>
        <g stroke="#ffffff" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" fill="none">
          <path d="M18,16 L38,16 L28,26 L36,32"/>
          <path d="M28,26 L16,36"/>
          <circle cx="28" cy="38" r="2" fill="#ffffff"/>
          <circle cx="34" cy="44" r="2" fill="#ffffff"/>
        </g>
      </g>
    `
  },
  // Page 2: story_dongzhi_p2: 小手拿起小擀杖，帮着妈妈包出小元宝饺子
  {
    id: "story_dongzhi_p2",
    title: "冬至到吃水饺 - 第2页",
    defs: `
      <linearGradient id="kitchen_warm" x1="0%" y1="0%" x2="0%" y2="100%">
        <stop offset="0%" stop-color="#fef3c7"/>
        <stop offset="100%" stop-color="#fed7aa"/>
      </linearGradient>
    `,
    content: `
      <rect width="1376" height="768" fill="url(#kitchen_warm)"/>
      <rect x="0" y="520" width="1376" height="248" fill="#d97706"/>
      <!-- Wooden Board with Rolling Pin & Flour (面粉大案板与小擀面杖) -->
      <g transform="translate(420, 380)" filter="url(#dropShadow)">
        <rect x="0" y="60" width="540" height="160" rx="12" fill="#fef08a" stroke="#ca8a04" stroke-width="4"/>
        <!-- Cute White Dumplings (一个个小耳朵元宝水饺) -->
        <ellipse cx="140" cy="110" rx="26" ry="16" fill="#ffffff" stroke="#cbd5e1" stroke-width="2"/>
        <ellipse cx="220" cy="100" rx="28" ry="18" fill="#ffffff" stroke="#cbd5e1" stroke-width="2"/>
        <ellipse cx="300" cy="110" rx="26" ry="16" fill="#ffffff" stroke="#cbd5e1" stroke-width="2"/>
        <!-- Rolling Pin (小擀面杖) -->
        <line x1="360" y1="130" x2="480" y2="80" stroke="#78350f" stroke-width="12" stroke-linecap="round"/>
      </g>
      <!-- Child Rolling Dough Happily (巧手小萌娃擀皮包饺子) -->
      <g transform="translate(240, 240)" filter="url(#dropShadow)">
        <rect x="40" y="80" width="55" height="110" rx="14" fill="#dc2626"/>
        <circle cx="68" cy="50" r="24" fill="#fed7aa"/>
        <circle cx="68" cy="25" r="12" fill="#1e293b"/>
      </g>
      <!-- Red Seal (包) -->
      <g transform="translate(1220, 80)" filter="url(#dropShadow)">
        <rect x="0" y="0" width="55" height="55" rx="8" fill="#dc2626"/>
        <g stroke="#ffffff" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" fill="none">
          <path d="M18,14 L38,14 L38,26 L14,26"/>
          <path d="M14,26 L14,44 L38,44"/>
          <rect x="20" y="30" width="14" height="10" rx="2"/>
        </g>
      </g>
    `
  },
  // Page 3: story_dongzhi_p3: 大盘水饺冒热气，吃完全身暖洋洋不怕冷
  {
    id: "story_dongzhi_p3",
    title: "冬至到吃水饺 - 第3页",
    defs: `
      <linearGradient id="warm_eat" x1="0%" y1="0%" x2="0%" y2="100%">
        <stop offset="0%" stop-color="#fee2e2"/>
        <stop offset="100%" stop-color="#fef08a"/>
      </linearGradient>
    `,
    content: `
      <rect width="1376" height="768" fill="url(#warm_eat)"/>
      <rect x="0" y="520" width="1376" height="248" fill="#fed7aa"/>
      <!-- Big Feast of Dumplings on Table (热气腾腾大丰收) -->
      <g transform="translate(480, 360)" filter="url(#dropShadow)">
        <ellipse cx="200" cy="160" rx="180" ry="80" fill="#ffffff" stroke="#dc2626" stroke-width="6"/>
        <circle cx="160" cy="145" r="22" fill="#fef08a"/>
        <circle cx="200" cy="140" r="24" fill="#fef08a"/>
        <circle cx="240" cy="145" r="22" fill="#fef08a"/>
        <!-- Rising Steam -->
        <path d="M190,100 Q210,40 190,-10" stroke="#ffffff" stroke-width="12" fill="none" opacity="0.8" filter="url(#softGlow)"/>
      </g>
      <!-- Child Smiling with Chopsticks (吃得小肚圆圆、暖洋洋笑开怀) -->
      <g transform="translate(240, 240)" filter="url(#dropShadow)">
        <rect x="40" y="80" width="60" height="120" rx="14" fill="#f59e0b"/>
        <circle cx="70" cy="50" r="24" fill="#fed7aa"/>
        <!-- Bamboo Chopsticks -->
        <line x1="85" y1="70" x2="140" y2="90" stroke="#78350f" stroke-width="6" stroke-linecap="round"/>
      </g>
      <!-- Red Seal (暖) -->
      <g transform="translate(1220, 80)" filter="url(#dropShadow)">
        <rect x="0" y="0" width="55" height="55" rx="8" fill="#dc2626"/>
        <g stroke="#ffffff" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" fill="none">
          <rect x="14" y="16" width="10" height="24" rx="1"/>
          <line x1="14" y1="28" x2="24" y2="28"/>
          <line x1="28" y1="16" x2="42" y2="16"/>
          <path d="M28,26 L42,26 L36,36 L44,42"/>
        </g>
      </g>
    `
  },

  // ==========================================
  // Book 6: 《神笔马良》
  // ==========================================
  // Cover: cover_maliang
  {
    id: "cover_maliang",
    title: "神笔马良 - 封面",
    defs: `
      <linearGradient id="magic_brush_bg" x1="0%" y1="0%" x2="0%" y2="100%">
        <stop offset="0%" stop-color="#1e1b4b"/>
        <stop offset="50%" stop-color="#4338ca"/>
        <stop offset="100%" stop-color="#f59e0b"/>
      </linearGradient>
    `,
    content: `
      <rect width="1376" height="768" fill="url(#magic_brush_bg)"/>
      <!-- Giant Golden Magic Brush (闪闪发光的金色神毛笔) -->
      <g transform="translate(688, 384)" filter="url(#dropShadow)">
        <!-- Brush Handle (红木金纹笔杆) -->
        <line x1="-180" y1="180" x2="100" y2="-100" stroke="#78350f" stroke-width="26" stroke-linecap="round"/>
        <line x1="-180" y1="180" x2="-220" y2="220" stroke="#f59e0b" stroke-width="28" stroke-linecap="round"/>
        <!-- Glowing Brush Tip (生花神笔笔尖) -->
        <polygon points="100,-100 130,-140 150,-120" fill="#ffffff" filter="url(#softGlow)"/>
        <!-- Golden Bird Flying from Tip (从神笔尖端飞出的神奇金鸟) -->
        <g transform="translate(180, -180)" filter="url(#softGlow)">
          <ellipse cx="0" cy="0" rx="40" ry="20" fill="#facc15"/>
          <polygon points="0,0 40,-40 20,0" fill="#facc15"/>
          <polygon points="0,0 -40,40 -20,0" fill="#facc15"/>
        </g>
      </g>
      <!-- Red Seal (良) -->
      <g transform="translate(1220, 80)" filter="url(#dropShadow)">
        <rect x="0" y="0" width="55" height="55" rx="8" fill="#dc2626"/>
        <g stroke="#ffffff" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" fill="none">
          <circle cx="28" cy="14" r="2" fill="#ffffff"/>
          <line x1="16" y1="20" x2="40" y2="20"/>
          <rect x="18" y="24" width="20" height="14" rx="2"/>
          <line x1="18" y1="31" x2="38" y2="31"/>
          <path d="M22,38 L16,44"/>
          <path d="M34,38 L40,44"/>
        </g>
      </g>
    `
  },
  // Page 1: story_maliang_p1: 勤奋的小马良在沙地上用树枝苦练画画
  {
    id: "story_maliang_p1",
    title: "神笔马良 - 第1页",
    defs: `
      <linearGradient id="beach_draw" x1="0%" y1="0%" x2="0%" y2="100%">
        <stop offset="0%" stop-color="#38bdf8"/>
        <stop offset="50%" stop-color="#bae6fd"/>
        <stop offset="100%" stop-color="#fed7aa"/>
      </linearGradient>
    `,
    content: `
      <rect width="1376" height="768" fill="url(#beach_draw)"/>
      <rect x="0" y="480" width="1376" height="288" fill="#d97706"/>
      <!-- Sandy Ground with Drawn Flying Bird (沙地上用树枝画出的生动小鸟) -->
      <g transform="translate(320, 520)" stroke="#ffffff" stroke-width="8" fill="none" opacity="0.9">
        <ellipse cx="140" cy="80" rx="60" ry="30"/>
        <path d="M120,70 Q140,20 180,10"/>
        <path d="M120,90 Q140,140 180,150"/>
      </g>
      <!-- Little Ma Liang in Simple Blue Tunic Kneeling to Draw (小马良执树枝专注刻苦画画) -->
      <g transform="translate(680, 320)" filter="url(#dropShadow)">
        <rect x="40" y="80" width="60" height="130" rx="14" fill="#0284c7"/>
        <circle cx="70" cy="50" r="26" fill="#fed7aa"/>
        <circle cx="70" cy="25" r="12" fill="#1e293b"/>
        <!-- Branch in Hand Drawing (手拿长树枝) -->
        <line x1="85" y1="120" x2="-80" y2="240" stroke="#78350f" stroke-width="12" stroke-linecap="round"/>
      </g>
      <!-- Red Seal (勤) -->
      <g transform="translate(1220, 80)" filter="url(#dropShadow)">
        <rect x="0" y="0" width="55" height="55" rx="8" fill="#dc2626"/>
        <g stroke="#ffffff" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" fill="none">
          <line x1="14" y1="16" x2="28" y2="16"/>
          <line x1="20" y1="12" x2="20" y2="26"/>
          <line x1="14" y1="26" x2="28" y2="26"/>
          <rect x="14" y="30" width="14" height="12" rx="1"/>
          <path d="M34,14 L34,42"/>
          <path d="M34,14 L42,14 L40,28 L34,28"/>
        </g>
      </g>
    `
  },
  // Page 2: story_maliang_p2: 白胡子老神仙赠送神金笔，神笔一点金鸟展翅飞出画纸
  {
    id: "story_maliang_p2",
    title: "神笔马良 - 第2页",
    defs: `
      <linearGradient id="god_dream" x1="0%" y1="0%" x2="0%" y2="100%">
        <stop offset="0%" stop-color="#312e81"/>
        <stop offset="60%" stop-color="#4f46e5"/>
        <stop offset="100%" stop-color="#fef08a"/>
      </linearGradient>
    `,
    content: `
      <rect width="1376" height="768" fill="url(#god_dream)"/>
      <!-- Wise Old Immortal with Long White Beard Handing Magic Golden Brush (白发白须老神仙赠神笔) -->
      <g transform="translate(360, 220)" filter="url(#dropShadow)">
        <rect x="60" y="100" width="80" height="240" rx="18" fill="#ffffff"/>
        <circle cx="100" cy="65" r="32" fill="#fed7aa"/>
        <!-- Long White Beard Flowing (飘逸长白胡须) -->
        <path d="M80,85 Q100,160 100,220 Q120,160 120,85 Z" fill="#ffffff" filter="url(#softGlow)"/>
        <!-- Golden Magic Brush Held in Hands (金光闪烁的神笔) -->
        <line x1="130" y1="160" x2="260" y2="140" stroke="#facc15" stroke-width="14" stroke-linecap="round" filter="url(#softGlow)"/>
      </g>
      <!-- Astonished Little Ma Liang Receiving Brush (小马良双手敬迎神笔) -->
      <g transform="translate(780, 260)" filter="url(#dropShadow)">
        <rect x="40" y="90" width="60" height="160" rx="16" fill="#0284c7"/>
        <circle cx="70" cy="55" r="26" fill="#fed7aa"/>
        <circle cx="70" cy="30" r="12" fill="#1e293b"/>
        <!-- Extended Arms (双手捧接) -->
        <line x1="50" y1="120" x2="-40" y2="110" stroke="#0284c7" stroke-width="16" stroke-linecap="round"/>
      </g>
      <!-- Red Seal (神) -->
      <g transform="translate(1220, 80)" filter="url(#dropShadow)">
        <rect x="0" y="0" width="55" height="55" rx="8" fill="#dc2626"/>
        <g stroke="#ffffff" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" fill="none">
          <line x1="16" y1="16" x2="24" y2="16"/>
          <line x1="20" y1="16" x2="20" y2="44"/>
          <rect x="28" y="16" width="14" height="18" rx="2"/>
          <line x1="28" y1="25" x2="42" y2="25"/>
          <line x1="35" y1="12" x2="35" y2="44"/>
        </g>
      </g>
    `
  },
  // Page 3: story_maliang_p3: 马良为老百姓画出健壮耕牛与清流水车，大地丰收人人笑
  {
    id: "story_maliang_p3",
    title: "神笔马良 - 第3页",
    defs: `
      <linearGradient id="harvest_field" x1="0%" y1="0%" x2="0%" y2="100%">
        <stop offset="0%" stop-color="#38bdf8"/>
        <stop offset="50%" stop-color="#fed7aa"/>
        <stop offset="100%" stop-color="#fef08a"/>
      </linearGradient>
    `,
    content: `
      <rect width="1376" height="768" fill="url(#harvest_field)"/>
      <rect x="0" y="520" width="1376" height="248" fill="#ca8a04"/>
      <!-- Golden Waterwheel by River (清流木制大水车欢快旋转灌溉良田) -->
      <g transform="translate(260, 360)" filter="url(#dropShadow)">
        <circle cx="100" cy="100" r="90" fill="none" stroke="#78350f" stroke-width="14"/>
        <line x1="100" y1="10" x2="100" y2="190" stroke="#78350f" stroke-width="10"/>
        <line x1="10" y1="100" x2="190" y2="100" stroke="#78350f" stroke-width="10"/>
      </g>
      <!-- Healthy Strong Ox Plowing Field (马良画出的神健大耕牛) -->
      <g transform="translate(640, 340)" filter="url(#dropShadow)">
        <ellipse cx="140" cy="140" rx="100" ry="60" fill="#713f12"/>
        <circle cx="60" cy="110" r="35" fill="#713f12"/>
        <polygon points="40,85 20,55 55,75" fill="#451a03"/>
      </g>
      <!-- Happy Villagers Cheering (欢呼庆丰收的老百姓与马良) -->
      <g transform="translate(1040, 360)" filter="url(#dropShadow)">
        <rect x="40" y="80" width="50" height="120" rx="12" fill="#0284c7"/>
        <circle cx="65" cy="50" r="22" fill="#fed7aa"/>
      </g>
      <!-- Red Seal (善) -->
      <g transform="translate(1220, 80)" filter="url(#dropShadow)">
        <rect x="0" y="0" width="55" height="55" rx="8" fill="#dc2626"/>
        <g stroke="#ffffff" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" fill="none">
          <circle cx="20" cy="14" r="1.5" fill="#ffffff"/>
          <line x1="14" y1="18" x2="42" y2="18"/>
          <line x1="18" y1="24" x2="38" y2="24"/>
          <line x1="14" y1="30" x2="42" y2="30"/>
          <rect x="20" y="34" width="16" height="10" rx="1"/>
        </g>
      </g>
    `
  }
];

console.log(`Generating ${ITEMS.length} illustrations for Books 4-6...`);

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

console.log("\nAll 12 illustrations for Books 4-6 generated successfully!");
