import fs from "fs";
import path from "path";
import { execSync } from "child_process";

const OUTPUT_DIR = path.resolve("assets/images");
const TMP_DIR = "/tmp/literacy_idioms_part2";

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

const IDIOMS_PART2 = [
  // ==========================================
  // 1. 掩耳盗铃 (idiom_yanerdailing)
  // ==========================================
  {
    id: "idiom_yanerdailing",
    title: "掩耳盗铃",
    defs: `
      <linearGradient id="sky_yd" x1="0%" y1="0%" x2="0%" y2="100%">
        <stop offset="0%" stop-color="#38bdf8"/>
        <stop offset="60%" stop-color="#bae6fd"/>
        <stop offset="100%" stop-color="#fef08a"/>
      </linearGradient>
      <linearGradient id="bronze_bell" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="#059669"/>
        <stop offset="50%" stop-color="#047857"/>
        <stop offset="100%" stop-color="#065f46"/>
      </linearGradient>
    `,
    content: `
      <!-- Sunny Courtyard Sky -->
      <rect width="1376" height="768" fill="url(#sky_yd)"/>
      <circle cx="1180" cy="140" r="70" fill="#fde047" filter="url(#softGlow)"/>

      <!-- Ancient Chinese Wall & Flying Eaves -->
      <g filter="url(#dropShadow)">
        <rect x="0" y="340" width="1376" height="428" fill="#e2e8f0"/>
        <path d="M0,340 L1376,340 L1376,360 L0,360 Z" fill="#94a3b8"/>
        <!-- Tiled Eaves -->
        <path d="M120,340 L1260,340 L1320,310 L60,310 Z" fill="#334155"/>
      </g>

      <!-- Grand Ancient Bronze Bell (古朴典雅的青铜大钟) hanging from Wooden Stand -->
      <g transform="translate(680, 200)" filter="url(#dropShadow)">
        <!-- Wooden Frame -->
        <rect x="20" y="0" width="30" height="480" fill="#78350f"/>
        <rect x="330" y="0" width="30" height="480" fill="#78350f"/>
        <rect x="0" y="20" width="380" height="36" rx="6" fill="#92400e"/>
        <!-- Bronze Bell Body -->
        <path d="M90,70 L290,70 L310,340 Q190,370 70,340 Z" fill="url(#bronze_bell)" stroke="#10b981" stroke-width="6"/>
        <ellipse cx="190" cy="70" rx="100" ry="24" fill="#047857"/>
        <!-- Ancient Cloud & Dragon Patterns on Bell -->
        <ellipse cx="190" cy="200" rx="80" ry="20" fill="none" stroke="#fde047" stroke-width="4"/>
        <ellipse cx="190" cy="280" rx="90" ry="22" fill="none" stroke="#fde047" stroke-width="4"/>
        <!-- Ringing Golden Sparkles and Soundwaves (当——余音缭绕) -->
        <g stroke="#facc15" stroke-width="4" fill="none" filter="url(#softGlow)">
          <path d="M330,220 Q370,240 380,280"/>
          <path d="M350,190 Q400,230 420,290"/>
          <path d="M50,220 Q10,240 0,280"/>
        </g>
      </g>

      <!-- Foolish Thief Clamping His Ears (掩住耳朵的小偷) -->
      <g transform="translate(360, 320)" filter="url(#dropShadow)">
        <!-- Body in Thief Robes -->
        <ellipse cx="90" cy="220" rx="55" ry="65" fill="#475569"/>
        <rect x="75" y="160" width="30" height="120" rx="6" fill="#0284c7"/>

        <!-- Funny Tiptoe Stance -->
        <path d="M65,280 L45,380 M115,280 L135,380" stroke="#1e293b" stroke-width="22" stroke-linecap="round"/>

        <!-- Comical Round Face with Big Smile (自以为听不见的得意表情) -->
        <circle cx="90" cy="110" r="46" fill="#fed7aa"/>
        <!-- Cloth Headwrap -->
        <ellipse cx="90" cy="75" rx="42" ry="20" fill="#334155"/>
        <circle cx="90" cy="60" r="14" fill="#334155"/>

        <!-- Both Hands Clamping Ears Tightly (紧紧捂住两只耳朵) -->
        <ellipse cx="40" cy="110" rx="16" ry="22" fill="#fed7aa"/>
        <ellipse cx="140" cy="110" rx="16" ry="22" fill="#fed7aa"/>
        <path d="M55,190 Q30,150 40,110" stroke="#fed7aa" stroke-width="16" stroke-linecap="round"/>
        <path d="M125,190 Q150,150 140,110" stroke="#fed7aa" stroke-width="16" stroke-linecap="round"/>

        <!-- Squinting Pleased Eyes & Big Smile -->
        <path d="M72,108 Q80,102 88,108" fill="none" stroke="#1e293b" stroke-width="4" stroke-linecap="round"/>
        <path d="M92,108 Q100,102 108,108" fill="none" stroke="#1e293b" stroke-width="4" stroke-linecap="round"/>
        <path d="M78,128 Q90,140 102,128" fill="none" stroke="#dc2626" stroke-width="4" stroke-linecap="round"/>
        <!-- Rosy Cheeks -->
        <circle cx="68" cy="120" r="8" fill="#fda4af" opacity="0.6"/>
        <circle cx="112" cy="120" r="8" fill="#fda4af" opacity="0.6"/>

        <!-- Big Wooden Mallet on Ground that Struck the Bell -->
        <line x1="160" y1="360" x2="240" y2="330" stroke="#78350f" stroke-width="10" stroke-linecap="round"/>
        <rect x="230" y="315" width="40" height="30" rx="6" fill="#92400e"/>
      </g>

      <!-- Red Chinese Seal (铃) with Vector Path -->
      <g transform="translate(1220, 80)" filter="url(#dropShadow)">
        <rect x="0" y="0" width="55" height="55" rx="8" fill="#dc2626"/>
        <g stroke="#ffffff" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" fill="none">
          <!-- 钅 radical -->
          <line x1="20" y1="14" x2="16" y2="20"/>
          <line x1="14" y1="20" x2="26" y2="20"/>
          <line x1="14" y1="26" x2="25" y2="26"/>
          <line x1="20" y1="20" x2="20" y2="42"/>
          <line x1="13" y1="42" x2="27" y2="38"/>
          <!-- 令 radical -->
          <path d="M34,14 L28,24"/>
          <path d="M34,14 L42,24"/>
          <line x1="30" y1="26" x2="40" y2="26"/>
          <path d="M36,28 L30,42 L42,42"/>
        </g>
      </g>
    `
  },

  // ==========================================
  // 2. 刻舟求剑 (idiom_kezhouqiujian)
  // ==========================================
  {
    id: "idiom_kezhouqiujian",
    title: "刻舟求剑",
    defs: `
      <linearGradient id="river_sky" x1="0%" y1="0%" x2="0%" y2="100%">
        <stop offset="0%" stop-color="#38bdf8"/>
        <stop offset="60%" stop-color="#bae6fd"/>
        <stop offset="100%" stop-color="#fed7aa"/>
      </linearGradient>
      <linearGradient id="river_water" x1="0%" y1="0%" x2="0%" y2="100%">
        <stop offset="0%" stop-color="#06b6d4"/>
        <stop offset="50%" stop-color="#0284c7"/>
        <stop offset="100%" stop-color="#0369a1"/>
      </linearGradient>
    `,
    content: `
      <!-- Broad River & Distant Misty Peaks (大江浩荡) -->
      <rect width="1376" height="768" fill="url(#river_sky)"/>
      <path d="M0,380 Q320,260 700,340 T1376,300 L1376,768 L0,768 Z" fill="#64748b" opacity="0.4"/>

      <!-- Wide Blue-Green River Water -->
      <rect y="420" width="1376" height="348" fill="url(#river_water)"/>
      <!-- Soft River Waves -->
      <g stroke="#ffffff" stroke-width="2.5" opacity="0.7" fill="none">
        <path d="M80,480 Q180,460 280,480 T480,480"/>
        <path d="M600,520 Q700,500 800,520 T1000,520"/>
        <path d="M1100,470 Q1200,450 1300,470"/>
      </g>

      <!-- Ancient Wooden Boat Sailing Forward (前行的木舟) -->
      <g transform="translate(420, 320)" filter="url(#dropShadow)">
        <!-- Hull of the Boat -->
        <path d="M0,180 Q180,240 540,220 L620,120 L40,120 Z" fill="#92400e"/>
        <path d="M40,120 L620,120 L600,150 L20,150 Z" fill="#b45309"/>
        <!-- Deck Railing -->
        <line x1="60" y1="110" x2="580" y2="110" stroke="#78350f" stroke-width="8"/>

        <!-- The Deep Notched Mark Carved on Boat Side (船舷上刻下的记号) -->
        <g transform="translate(340, 140)">
          <line x1="0" y1="0" x2="25" y2="25" stroke="#facc15" stroke-width="6" stroke-linecap="round"/>
          <line x1="25" y1="0" x2="0" y2="25" stroke="#facc15" stroke-width="6" stroke-linecap="round"/>
        </g>

        <!-- Chu Man Leaning Over Side Carving Notch (楚国男子专注刻舟) -->
        <g transform="translate(240, -10)">
          <!-- Body in Hanfu -->
          <ellipse cx="60" cy="110" rx="42" ry="50" fill="#0284c7"/>
          <!-- Leaning Forward Head -->
          <circle cx="85" cy="45" r="32" fill="#fed7aa"/>
          <ellipse cx="85" cy="25" rx="28" ry="14" fill="#1e293b"/>
          <rect x="80" y="5" width="12" height="22" fill="#1e293b"/>
          <!-- Confident Smile (以为这样就能找回宝剑) -->
          <circle cx="95" cy="42" r="3.5" fill="#1e293b"/>
          <path d="M90,58 Q98,64 104,58" fill="none" stroke="#dc2626" stroke-width="3" stroke-linecap="round"/>
          <!-- Arm Holding Carving Knife -->
          <path d="M50,90 Q85,95 100,125" stroke="#fed7aa" stroke-width="14" stroke-linecap="round"/>
          <line x1="95" y1="125" x2="105" y2="145" stroke="#64748b" stroke-width="5" stroke-linecap="round"/>
        </g>
      </g>

      <!-- The Dropped Sword Resting on Deep Riverbed far behind (掉在江底的原地宝剑) -->
      <g transform="translate(180, 620)" filter="url(#dropShadow)" opacity="0.85">
        <line x1="0" y1="40" x2="140" y2="0" stroke="#fde047" stroke-width="8" stroke-linecap="round" filter="url(#softGlow)"/>
        <!-- Sword Guard & Hilt -->
        <rect x="0" y="32" width="20" height="16" rx="4" fill="#d97706"/>
        <line x1="-15" y1="45" x2="5" y2="40" stroke="#78350f" stroke-width="6"/>
        <!-- Bubbles Floating from Sword -->
        <circle cx="60" cy="10" r="6" fill="#e0f2fe" opacity="0.7"/>
        <circle cx="80" cy="-20" r="4" fill="#e0f2fe" opacity="0.7"/>
      </g>

      <!-- Red Chinese Seal (舟) with Vector Path -->
      <g transform="translate(1220, 80)" filter="url(#dropShadow)">
        <rect x="0" y="0" width="55" height="55" rx="8" fill="#dc2626"/>
        <g stroke="#ffffff" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" fill="none">
          <line x1="26" y1="12" x2="22" y2="18"/>
          <line x1="18" y1="18" x2="18" y2="42"/>
          <path d="M18,18 L36,18 L36,42 Q36,45 32,45"/>
          <line x1="18" y1="28" x2="36" y2="28"/>
          <line x1="24" y1="28" x2="24" y2="38"/>
          <line x1="30" y1="28" x2="30" y2="38"/>
        </g>
      </g>
    `
  },

  // ==========================================
  // 3. 画蛇添足 (idiom_huashetianzu)
  // ==========================================
  {
    id: "idiom_huashetianzu",
    title: "画蛇添足",
    defs: `
      <linearGradient id="courtyard_bg" x1="0%" y1="0%" x2="0%" y2="100%">
        <stop offset="0%" stop-color="#fdba74"/>
        <stop offset="60%" stop-color="#fed7aa"/>
        <stop offset="100%" stop-color="#fef08a"/>
      </linearGradient>
    `,
    content: `
      <!-- Ancient Courtyard Banquet Setting -->
      <rect width="1376" height="768" fill="url(#courtyard_bg)"/>
      <path d="M0,480 L1376,480 L1376,768 L0,768 Z" fill="#cbd5e1"/>

      <!-- Big Bronze Wine Vessel on Table in Center (美酒佳酿为奖) -->
      <g transform="translate(620, 360)" filter="url(#dropShadow)">
        <rect x="20" y="80" width="100" height="60" rx="8" fill="#d97706"/>
        <ellipse cx="70" cy="80" rx="50" ry="18" fill="#f59e0b"/>
        <ellipse cx="70" cy="65" rx="35" ry="12" fill="#ef4444"/>
        <line x1="70" y1="40" x2="70" y2="65" stroke="#f59e0b" stroke-width="5"/>
      </g>

      <!-- The Drawing of Snake on the Ground with Silly Little Feet (画好的长蛇被添上四只脚) -->
      <g transform="translate(380, 520)" filter="url(#dropShadow)">
        <!-- Long Winding Green Snake -->
        <path d="M20,120 Q120,60 240,110 T460,80 T560,110" fill="none" stroke="#16a34a" stroke-width="24" stroke-linecap="round"/>
        <!-- Snake Head & Tongue -->
        <circle cx="560" cy="110" r="16" fill="#15803d"/>
        <circle cx="566" cy="106" r="3" fill="#ffffff"/>
        <path d="M576,110 L596,110 M596,110 L604,104 M596,110 L604,116" stroke="#ef4444" stroke-width="3"/>
        <!-- The Ridiculous Added Feet (多此一举添上的小脚) -->
        <g stroke="#ca8a04" stroke-width="6" stroke-linecap="round">
          <line x1="120" y1="90" x2="110" y2="135"/>
          <line x1="110" y1="135" x2="125" y2="140"/>
          <line x1="220" y1="110" x2="210" y2="155"/>
          <line x1="210" y1="155" x2="225" y2="160"/>
          <line x1="380" y1="85" x2="370" y2="130"/>
          <line x1="370" y1="130" x2="385" y2="135"/>
          <line x1="480" y1="100" x2="470" y2="145"/>
          <line x1="470" y1="145" x2="485" y2="150"/>
        </g>
      </g>

      <!-- Smug Scholar on Left Adding Feet (得意洋洋添画脚的舍人) -->
      <g transform="translate(260, 310)" filter="url(#dropShadow)">
        <!-- Crouching Body in Purple Hanfu -->
        <ellipse cx="80" cy="140" rx="45" ry="55" fill="#7c3aed"/>
        <circle cx="80" cy="70" r="36" fill="#fed7aa"/>
        <ellipse cx="80" cy="45" rx="30" ry="15" fill="#1e293b"/>
        <!-- Smug Grin (自鸣得意) -->
        <circle cx="92" cy="68" r="4" fill="#1e293b"/>
        <path d="M86,85 Q94,92 102,85" fill="none" stroke="#dc2626" stroke-width="3" stroke-linecap="round"/>
        <!-- Right Arm Holding Brush Drawing Feet -->
        <path d="M80,120 Q120,150 140,200" stroke="#fed7aa" stroke-width="14" stroke-linecap="round"/>
        <line x1="135" y1="195" x2="165" y2="240" stroke="#78350f" stroke-width="5" stroke-linecap="round"/>
      </g>

      <!-- Quick-witted Scholar on Right Snatching the Wine (夺酒之士) -->
      <g transform="translate(860, 280)" filter="url(#dropShadow)">
        <!-- Body in Emerald Hanfu -->
        <ellipse cx="80" cy="160" rx="48" ry="65" fill="#047857"/>
        <circle cx="80" cy="85" r="38" fill="#fed7aa"/>
        <ellipse cx="80" cy="55" rx="32" ry="16" fill="#1e293b"/>
        <circle cx="68" cy="85" r="4" fill="#1e293b"/>
        <!-- Arm Reaching over to Grasp Wine Vessel: "蛇本来就没有脚，你怎么能给它添脚呢！" -->
        <path d="M60,140 Q-30,120 -80,110" stroke="#fed7aa" stroke-width="16" stroke-linecap="round"/>
        <!-- Jade Goblet in Hand -->
        <path d="M-90,95 L-70,95 L-75,130 L-85,130 Z" fill="#fde047"/>
      </g>

      <!-- Red Chinese Seal (足) with Vector Path -->
      <g transform="translate(1220, 80)" filter="url(#dropShadow)">
        <rect x="0" y="0" width="55" height="55" rx="8" fill="#dc2626"/>
        <g stroke="#ffffff" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" fill="none">
          <!-- 口 radical -->
          <rect x="18" y="14" width="20" height="15"/>
          <!-- 下部止 -->
          <line x1="28" y1="29" x2="28" y2="44"/>
          <line x1="28" y1="36" x2="38" y2="36"/>
          <line x1="18" y1="44" x2="39" y2="44"/>
        </g>
      </g>
    `
  },

  // ==========================================
  // 4. 叶公好龙 (idiom_yegonghaolong)
  // ==========================================
  {
    id: "idiom_yegonghaolong",
    title: "叶公好龙",
    defs: `
      <linearGradient id="palace_sky" x1="0%" y1="0%" x2="0%" y2="100%">
        <stop offset="0%" stop-color="#60a5fa"/>
        <stop offset="60%" stop-color="#bfdbfe"/>
        <stop offset="100%" stop-color="#fed7aa"/>
      </linearGradient>
    `,
    content: `
      <!-- Palace Interior with Grand Windows -->
      <rect width="1376" height="768" fill="url(#palace_sky)"/>

      <!-- Carved Dragon Wall Panels & Vermilion Pillars (到处雕刻着龙纹) -->
      <g filter="url(#dropShadow)">
        <rect x="100" y="0" width="45" height="768" fill="#991b1b"/>
        <rect x="1220" y="0" width="45" height="768" fill="#991b1b"/>
        <rect x="145" y="440" width="1075" height="328" fill="#78350f"/>
        <!-- Window Frame -->
        <rect x="520" y="80" width="480" height="360" rx="12" fill="none" stroke="#b45309" stroke-width="14"/>
      </g>

      <!-- Real Golden Divine Dragon Peering In through Window (真龙下凡探视) -->
      <g transform="translate(680, 100)" filter="url(#dropShadow)">
        <!-- Swirling Auspicious Clouds -->
        <g fill="#ffffff" opacity="0.85" filter="url(#softGlow)">
          <ellipse cx="200" cy="180" rx="140" ry="50"/>
          <ellipse cx="100" cy="240" rx="110" ry="40"/>
        </g>
        <!-- Golden Dragon Head with Kind Wide Eyes -->
        <ellipse cx="140" cy="120" rx="80" ry="55" fill="#f59e0b"/>
        <!-- Golden Antlers & Flowing Mane -->
        <path d="M110,70 Q80,10 60,30 Q100,45 110,70" fill="#facc15"/>
        <path d="M160,65 Q140,5 170,20 Q165,45 160,65" fill="#facc15"/>
        <path d="M220,100 Q280,80 320,120" stroke="#fde047" stroke-width="8" fill="none"/>
        <path d="M220,120 Q280,140 330,180" stroke="#fde047" stroke-width="8" fill="none"/>
        <!-- Glowing Benevolent Dragon Eye -->
        <circle cx="110" cy="110" r="14" fill="#ffffff" filter="url(#softGlow)"/>
        <circle cx="110" cy="110" r="8" fill="#0284c7"/>
        <circle cx="112" cy="108" r="2.5" fill="#ffffff"/>
      </g>

      <!-- Lord Ye (叶公) Startled in Fear & Awe (吓得失魂落魄的叶公) -->
      <g transform="translate(320, 320)" filter="url(#dropShadow)">
        <!-- Luxurious Robes Stumbling Backwards -->
        <ellipse cx="90" cy="200" rx="55" ry="65" fill="#ca8a04"/>
        <path d="M50,140 Q90,120 130,140 L140,260 L40,260 Z" fill="#eab308"/>

        <!-- Wide-eyed Astonished Face -->
        <circle cx="90" cy="90" r="42" fill="#fed7aa"/>
        <!-- High Noble Cap (高冠) -->
        <polygon points="70,60 90,15 110,60" fill="#1e293b"/>
        <!-- Trembling Eyes & Open Mouth -->
        <circle cx="78" cy="85" r="7" fill="#ffffff"/>
        <circle cx="78" cy="85" r="3.5" fill="#1e293b"/>
        <circle cx="102" cy="85" r="7" fill="#ffffff"/>
        <circle cx="102" cy="85" r="3.5" fill="#1e293b"/>
        <ellipse cx="90" cy="105" rx="8" ry="12" fill="#991b1b"/>

        <!-- Hands Raised in Shock, Dropping Jade Cup -->
        <path d="M50,160 Q20,130 10,100" stroke="#fed7aa" stroke-width="16" stroke-linecap="round"/>
        <path d="M130,160 Q160,130 180,110" stroke="#fed7aa" stroke-width="16" stroke-linecap="round"/>
        <!-- Falling Jade Cup -->
        <polygon points="190,130 205,120 215,145 200,150" fill="#10b981" filter="url(#softGlow)"/>
      </g>

      <!-- Red Chinese Seal (龙) with Vector Path -->
      <g transform="translate(1220, 80)" filter="url(#dropShadow)">
        <rect x="0" y="0" width="55" height="55" rx="8" fill="#dc2626"/>
        <g stroke="#ffffff" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" fill="none">
          <line x1="16" y1="16" x2="28" y2="16"/>
          <line x1="22" y1="16" x2="22" y2="40"/>
          <line x1="15" y1="28" x2="28" y2="28"/>
          <path d="M28,16 L38,16 L38,32 L42,32"/>
          <path d="M28,34 C34,44 42,44 44,38"/>
        </g>
      </g>
    `
  },

  // ==========================================
  // 5. 杯弓蛇影 (idiom_beigongsheying)
  // ==========================================
  {
    id: "idiom_beigongsheying",
    title: "杯弓蛇影",
    defs: `
      <linearGradient id="hall_wine" x1="0%" y1="0%" x2="0%" y2="100%">
        <stop offset="0%" stop-color="#fed7aa"/>
        <stop offset="60%" stop-color="#fde047"/>
        <stop offset="100%" stop-color="#d97706"/>
      </linearGradient>
    `,
    content: `
      <!-- Banquet Room Background -->
      <rect width="1376" height="768" fill="url(#hall_wine)"/>

      <!-- Wall with Hanging Painted Bow (墙上悬挂的红色漆弓) -->
      <g transform="translate(560, 60)" filter="url(#dropShadow)">
        <rect x="0" y="0" width="280" height="20" rx="4" fill="#78350f"/>
        <!-- Painted Archery Bow (漆红雕弓) -->
        <path d="M20,20 Q140,90 260,20" fill="none" stroke="#dc2626" stroke-width="14" stroke-linecap="round"/>
        <!-- Bowstring -->
        <line x1="20" y1="20" x2="260" y2="20" stroke="#fef08a" stroke-width="3"/>
      </g>

      <!-- Elegant Banquet Table in Foreground -->
      <g filter="url(#dropShadow)">
        <rect x="220" y="440" width="936" height="328" rx="16" fill="#92400e"/>
        <rect x="200" y="420" width="976" height="40" rx="8" fill="#78350f"/>
      </g>

      <!-- The Grand Celadon Wine Cup with Snake Reflection in Wine (酒杯中的青蛇倒影) -->
      <g transform="translate(600, 360)" filter="url(#dropShadow)">
        <!-- Cup Base & Stem -->
        <ellipse cx="90" cy="180" rx="55" ry="18" fill="#047857"/>
        <rect x="80" y="110" width="20" height="70" fill="#059669"/>
        <!-- Wide Celadon Bowl -->
        <path d="M20,30 Q90,140 160,30 Z" fill="#10b981" stroke="#047857" stroke-width="6"/>
        <ellipse cx="90" cy="30" rx="70" ry="24" fill="#a7f3d0"/>
        <!-- Clear Golden Wine Surface -->
        <ellipse cx="90" cy="32" rx="60" ry="18" fill="#fef08a"/>

        <!-- The Wiggling Snake Reflection inside Wine (杯中映出的似蛇倒影) -->
        <path d="M55,32 Q70,26 85,34 T115,30 T130,32" fill="none" stroke="#15803d" stroke-width="5" stroke-linecap="round" filter="url(#softGlow)"/>
        <circle cx="132" cy="32" r="3" fill="#16a34a"/>
      </g>

      <!-- Frightened Guest on Left Staring at Cup (疑神疑鬼的宾客) -->
      <g transform="translate(280, 260)" filter="url(#dropShadow)">
        <ellipse cx="80" cy="170" rx="50" ry="60" fill="#0284c7"/>
        <circle cx="80" cy="95" r="38" fill="#fed7aa"/>
        <ellipse cx="80" cy="70" rx="32" ry="16" fill="#1e293b"/>
        <!-- Sweating Panic Expression -->
        <circle cx="92" cy="92" r="5" fill="#1e293b"/>
        <circle cx="112" cy="92" r="5" fill="#1e293b"/>
        <ellipse cx="102" cy="112" rx="8" ry="10" fill="#991b1b"/>
        <!-- Blue Sweat Drops -->
        <circle cx="70" cy="85" r="4" fill="#38bdf8"/>
      </g>

      <!-- Smiling Host on Right Pointing Up to the Bow (微笑着解开谜底的主人) -->
      <g transform="translate(940, 240)" filter="url(#dropShadow)">
        <ellipse cx="80" cy="180" rx="52" ry="65" fill="#d97706"/>
        <circle cx="80" cy="100" r="40" fill="#fed7aa"/>
        <ellipse cx="80" cy="72" rx="34" ry="18" fill="#1e293b"/>
        <!-- Kindly Smiling Face -->
        <path d="M68,98 Q76,92 84,98" stroke="#1e293b" stroke-width="3" stroke-linecap="round" fill="none"/>
        <path d="M92,98 Q100,92 108,98" stroke="#1e293b" stroke-width="3" stroke-linecap="round" fill="none"/>
        <path d="M78,118 Q88,128 98,118" stroke="#dc2626" stroke-width="4" stroke-linecap="round" fill="none"/>
        <!-- Arm Pointing Upwards to the Hanging Bow on Wall (原来是墙上的弓呀！) -->
        <path d="M60,160 Q-10,120 -50,60" stroke="#fed7aa" stroke-width="16" stroke-linecap="round"/>
        <line x1="-50" y1="60" x2="-80" y2="10" stroke="#fed7aa" stroke-width="12" stroke-linecap="round"/>
      </g>

      <!-- Red Chinese Seal (影) with Vector Path -->
      <g transform="translate(1220, 80)" filter="url(#dropShadow)">
        <rect x="0" y="0" width="55" height="55" rx="8" fill="#dc2626"/>
        <g stroke="#ffffff" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" fill="none">
          <!-- 日 radical -->
          <rect x="15" y="14" width="12" height="12"/>
          <line x1="15" y1="20" x2="27" y2="20"/>
          <!-- 京部 -->
          <line x1="14" y1="30" x2="28" y2="30"/>
          <rect x="16" y="34" width="10" height="9"/>
          <!-- 彡 radical on right -->
          <line x1="33" y1="18" x2="43" y2="24"/>
          <line x1="32" y1="28" x2="42" y2="34"/>
          <line x1="31" y1="38" x2="41" y2="44"/>
        </g>
      </g>
    `
  },

  // ==========================================
  // 6. 买椟还珠 (idiom_maidaihuanzhu)
  // ==========================================
  {
    id: "idiom_maidaihuanzhu",
    title: "买椟还珠",
    defs: `
      <linearGradient id="market_sky" x1="0%" y1="0%" x2="0%" y2="100%">
        <stop offset="0%" stop-color="#38bdf8"/>
        <stop offset="60%" stop-color="#fef08a"/>
        <stop offset="100%" stop-color="#fed7aa"/>
      </linearGradient>
    `,
    content: `
      <!-- Ancient Market Street Atmosphere -->
      <rect width="1376" height="768" fill="url(#market_sky)"/>
      <path d="M0,480 L1376,480 L1376,768 L0,768 Z" fill="#cbd5e1"/>

      <!-- Market Canopy Tent (集市商铺布幔) -->
      <path d="M380,180 L1020,180 L1100,260 L300,260 Z" fill="#dc2626"/>
      <path d="M300,260 Q340,290 380,260 Q420,290 460,260 Q500,290 540,260 Q580,290 620,260 Q660,290 700,260 Q740,290 780,260 Q820,290 860,260 Q900,290 940,260 Q980,290 1020,260 Q1060,290 1100,260" fill="#facc15"/>

      <!-- Gorgeous Carved Wood Box (木兰之椟，熏以桂椒，缀以珠玉) -->
      <g transform="translate(600, 360)" filter="url(#dropShadow)">
        <!-- Open Box Bottom -->
        <rect x="0" y="60" width="180" height="120" rx="10" fill="#78350f" stroke="#b45309" stroke-width="6"/>
        <!-- Golden Filigree Patterns (金丝雕纹) -->
        <rect x="15" y="75" width="150" height="90" fill="none" stroke="#f59e0b" stroke-width="4"/>
        <circle cx="90" cy="120" r="22" fill="none" stroke="#f59e0b" stroke-width="4"/>
        <!-- Inlaid Green Jade Gems -->
        <circle cx="30" cy="90" r="8" fill="#10b981"/>
        <circle cx="150" cy="90" r="8" fill="#10b981"/>
        <!-- Open Box Lid angled -->
        <polygon points="0,60 40,-20 220,-20 180,60" fill="#92400e" stroke="#b45309" stroke-width="4"/>
      </g>

      <!-- Radiant Glowing Pearl being Handed Back (还给商人的绝世夜明珠) -->
      <g transform="translate(560, 320)" filter="url(#dropShadow)">
        <!-- Radiant Halo -->
        <circle cx="40" cy="40" r="36" fill="#ffffff" filter="url(#softGlow)"/>
        <circle cx="40" cy="40" r="24" fill="#e0f2fe"/>
        <circle cx="40" cy="40" r="16" fill="#ffffff"/>
        <!-- Star Spangles -->
        <g stroke="#facc15" stroke-width="3">
          <line x1="40" y1="10" x2="40" y2="70"/>
          <line x1="10" y1="40" x2="70" y2="40"/>
        </g>
      </g>

      <!-- Zheng Customer Hugging Empty Box Happily (喜滋滋抱走空木盒的郑国人) -->
      <g transform="translate(280, 280)" filter="url(#dropShadow)">
        <ellipse cx="80" cy="170" rx="48" ry="65" fill="#2563eb"/>
        <circle cx="80" cy="90" r="38" fill="#fed7aa"/>
        <ellipse cx="80" cy="65" rx="32" ry="16" fill="#1e293b"/>
        <!-- Broad Happy Grin (只爱华丽盒子的买主) -->
        <circle cx="92" cy="88" r="4" fill="#1e293b"/>
        <path d="M86,105 Q96,115 106,105" stroke="#dc2626" stroke-width="4" stroke-linecap="round" fill="none"/>
        <!-- Arms Hugging Box -->
        <path d="M60,150 Q100,160 140,150" stroke="#fed7aa" stroke-width="16" stroke-linecap="round"/>
      </g>

      <!-- Astonished Chu Jeweler Holding Returned Pearl (目瞪口呆的楚国珠宝商) -->
      <g transform="translate(880, 260)" filter="url(#dropShadow)">
        <ellipse cx="80" cy="180" rx="52" ry="65" fill="#ca8a04"/>
        <circle cx="80" cy="100" r="40" fill="#fed7aa"/>
        <ellipse cx="80" cy="72" rx="34" ry="18" fill="#1e293b"/>
        <!-- Dumbfounded Stare at the Returned Pearl -->
        <circle cx="68" cy="98" r="6" fill="#1e293b"/>
        <circle cx="68" cy="96" r="2" fill="#ffffff"/>
        <ellipse cx="78" cy="120" rx="8" ry="12" fill="#991b1b"/>
        <!-- Open Hand Receiving Pearl -->
        <path d="M60,160 Q-20,150 -50,130" stroke="#fed7aa" stroke-width="16" stroke-linecap="round"/>
        <ellipse cx="-50" cy="130" rx="14" ry="10" fill="#fed7aa"/>
      </g>

      <!-- Red Chinese Seal (珠) with Vector Path -->
      <g transform="translate(1220, 80)" filter="url(#dropShadow)">
        <rect x="0" y="0" width="55" height="55" rx="8" fill="#dc2626"/>
        <g stroke="#ffffff" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" fill="none">
          <!-- 王 radical -->
          <line x1="14" y1="16" x2="25" y2="16"/>
          <line x1="15" y1="26" x2="25" y2="26"/>
          <line x1="13" y1="38" x2="26" y2="35"/>
          <line x1="20" y1="16" x2="20" y2="36"/>
          <!-- 朱 radical on right -->
          <line x1="28" y1="20" x2="42" y2="20"/>
          <line x1="26" y1="28" x2="44" y2="28"/>
          <line x1="35" y1="14" x2="35" y2="42"/>
          <line x1="35" y1="28" x2="28" y2="42"/>
          <line x1="35" y1="28" x2="42" y2="42"/>
        </g>
      </g>
    `
  },

  // ==========================================
  // 7. 愚公移山 (idiom_yugongyishan)
  // ==========================================
  {
    id: "idiom_yugongyishan",
    title: "愚公移山",
    defs: `
      <linearGradient id="mount_sky" x1="0%" y1="0%" x2="0%" y2="100%">
        <stop offset="0%" stop-color="#38bdf8"/>
        <stop offset="50%" stop-color="#bae6fd"/>
        <stop offset="100%" stop-color="#fef08a"/>
      </linearGradient>
    `,
    content: `
      <!-- Vast Sunny Sky over Taihang Mountains -->
      <rect width="1376" height="768" fill="url(#mount_sky)"/>

      <!-- Towering Peaks of Taihang and Wangwu (巍峨太行与王屋两座大山) -->
      <g filter="url(#dropShadow)">
        <polygon points="100,560 380,180 660,560" fill="#475569"/>
        <polygon points="520,560 840,120 1180,560" fill="#334155"/>
        <!-- Mountain Ridges & Shading -->
        <polygon points="380,180 440,280 410,420 380,560" fill="#64748b"/>
        <polygon points="840,120 920,260 880,440 840,560" fill="#475569"/>
      </g>

      <!-- Ground & Path -->
      <path d="M0,540 Q688,480 1376,540 L1376,768 L0,768 Z" fill="#84cc16"/>

      <!-- Spirited Old Yu (愚公) Holding Pickaxe (九十高龄豪气冲天的愚公) -->
      <g transform="translate(360, 360)" filter="url(#dropShadow)">
        <!-- Body in Coarse Hemp Robe -->
        <path d="M60,160 Q100,240 140,160 L150,340 L40,340 Z" fill="#0369a1"/>
        <!-- Dignified Face with Flowing Long White Beard -->
        <circle cx="100" cy="100" r="38" fill="#fed7aa"/>
        <ellipse cx="100" cy="75" rx="32" ry="16" fill="#475569"/>
        <!-- Firm Heroic Eyes (子子孙孙无穷匮也) -->
        <circle cx="112" cy="98" r="4.5" fill="#1e293b"/>
        <!-- Flowing White Beard -->
        <path d="M85,115 Q105,210 110,230 Q115,210 125,115 Z" fill="#ffffff"/>
        <!-- Arms Lifting Iron Pickaxe High -->
        <path d="M80,150 L140,90" stroke="#fed7aa" stroke-width="16" stroke-linecap="round"/>
        <!-- Iron Pickaxe (开山铁镐) -->
        <line x1="120" y1="120" x2="210" y2="40" stroke="#78350f" stroke-width="10" stroke-linecap="round"/>
        <path d="M190,20 Q215,40 240,65" stroke="#94a3b8" stroke-width="14" stroke-linecap="round" fill="none"/>
      </g>

      <!-- Diligent Children & Grandchildren Carrying Earth Baskets (子孙挑箕畚) -->
      <g transform="translate(720, 420)" filter="url(#dropShadow)">
        <!-- Boy in Yellow Tunic with Carrying Pole -->
        <circle cx="80" cy="80" r="28" fill="#fed7aa"/>
        <circle cx="80" cy="60" r="14" fill="#1e293b"/>
        <ellipse cx="80" cy="140" rx="35" ry="45" fill="#eab308"/>
        <path d="M65,180 L50,260 M95,180 L110,260" stroke="#ca8a04" stroke-width="14" stroke-linecap="round"/>
        <!-- Bamboo Carrying Pole & Earth Baskets (挑土石的竹扁担与箕畚) -->
        <line x1="-30" y1="120" x2="190" y2="100" stroke="#78350f" stroke-width="8" stroke-linecap="round"/>
        <!-- Left Basket -->
        <polygon points="-50,160 -10,160 -20,200 -40,200" fill="#b45309"/>
        <line x1="-30" y1="120" x2="-30" y2="160" stroke="#a16207" stroke-width="3"/>
        <!-- Right Basket -->
        <polygon points="170,140 210,140 200,180 180,180" fill="#b45309"/>
        <line x1="190" y1="100" x2="190" y2="140" stroke="#a16207" stroke-width="3"/>
      </g>

      <!-- Red Chinese Seal (山) with Vector Path -->
      <g transform="translate(1220, 80)" filter="url(#dropShadow)">
        <rect x="0" y="0" width="55" height="55" rx="8" fill="#dc2626"/>
        <g stroke="#ffffff" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" fill="none">
          <line x1="27" y1="14" x2="27" y2="42"/>
          <line x1="16" y1="24" x2="16" y2="42"/>
          <line x1="38" y1="24" x2="38" y2="42"/>
          <line x1="16" y1="42" x2="38" y2="42"/>
        </g>
      </g>
    `
  },

  // ==========================================
  // 8. 程门立雪 (idiom_chengmenlixue)
  // ==========================================
  {
    id: "idiom_chengmenlixue",
    title: "程门立雪",
    defs: `
      <linearGradient id="snow_sky" x1="0%" y1="0%" x2="0%" y2="100%">
        <stop offset="0%" stop-color="#64748b"/>
        <stop offset="60%" stop-color="#94a3b8"/>
        <stop offset="100%" stop-color="#e2e8f0"/>
      </linearGradient>
    `,
    content: `
      <!-- Pure Snow Sky & Gently Falling Snowflakes -->
      <rect width="1376" height="768" fill="url(#snow_sky)"/>
      <g fill="#ffffff" filter="url(#softGlow)">
        <circle cx="200" cy="140" r="5"/><circle cx="480" cy="90" r="4"/><circle cx="820" cy="160" r="6"/>
        <circle cx="1100" cy="110" r="5"/><circle cx="340" cy="280" r="4"/><circle cx="950" cy="260" r="5"/>
      </g>

      <!-- Teacher's Courtyard Gate with Snow on Eaves (程颐先生的书斋院门) -->
      <g filter="url(#dropShadow)">
        <!-- Wall Covered in Snow -->
        <rect x="0" y="280" width="1376" height="488" fill="#cbd5e1"/>
        <rect x="740" y="240" width="420" height="420" fill="#7f1d1d" stroke="#991b1b" stroke-width="12"/>
        <!-- Closed Red Door Panels (程门闭户休息) -->
        <rect x="760" y="260" width="180" height="380" fill="#991b1b"/>
        <rect x="960" y="260" width="180" height="380" fill="#991b1b"/>
        <!-- Tiled Eaves with Heavy Snow Pad (积雪深重) -->
        <path d="M680,240 Q950,140 1220,240 L1260,240 Q950,90 640,240 Z" fill="#334155"/>
        <path d="M670,230 Q950,130 1230,230 Q950,110 670,230 Z" fill="#ffffff"/>
      </g>

      <!-- Thick Snow on Ground (门外积雪深达一尺) -->
      <path d="M0,600 L1376,600 L1376,768 L0,768 Z" fill="#f8fafc"/>

      <!-- Two Respectful Scholars Standing in the Snow (杨时与游酢恭立雪中) -->
      <!-- Scholar 1 (杨时) on Left -->
      <g transform="translate(380, 320)" filter="url(#dropShadow)">
        <!-- Winter Scholar Cloak Covered with Snow on Shoulders -->
        <path d="M60,180 Q100,260 140,180 L150,380 L50,380 Z" fill="#0284c7"/>
        <path d="M55,180 Q100,165 145,180 L140,205 Q100,195 60,205 Z" fill="#ffffff"/>
        <!-- Hands Folded in Respectful Greeting (拱手肃立) -->
        <ellipse cx="100" cy="220" rx="22" ry="14" fill="#0369a1"/>
        <!-- Respectful Calm Face -->
        <circle cx="100" cy="120" r="38" fill="#fed7aa"/>
        <ellipse cx="100" cy="90" rx="32" ry="16" fill="#1e293b"/>
        <!-- Eyes Closed in Patient Reverence (尊师重道) -->
        <path d="M88,118 Q96,124 104,118" stroke="#1e293b" stroke-width="3" stroke-linecap="round" fill="none"/>
        <path d="M108,118 Q116,124 124,118" stroke="#1e293b" stroke-width="3" stroke-linecap="round" fill="none"/>
      </g>

      <!-- Scholar 2 (游酢) on Right -->
      <g transform="translate(540, 340)" filter="url(#dropShadow)">
        <path d="M60,180 Q100,260 140,180 L150,360 L50,360 Z" fill="#059669"/>
        <path d="M55,180 Q100,165 145,180 L140,205 Q100,195 60,205 Z" fill="#ffffff"/>
        <ellipse cx="100" cy="220" rx="22" ry="14" fill="#047857"/>
        <circle cx="100" cy="120" r="38" fill="#fed7aa"/>
        <ellipse cx="100" cy="90" rx="32" ry="16" fill="#1e293b"/>
        <path d="M88,118 Q96,124 104,118" stroke="#1e293b" stroke-width="3" stroke-linecap="round" fill="none"/>
        <path d="M108,118 Q116,124 124,118" stroke="#1e293b" stroke-width="3" stroke-linecap="round" fill="none"/>
      </g>

      <!-- Red Chinese Seal (雪) with Vector Path -->
      <g transform="translate(1220, 80)" filter="url(#dropShadow)">
        <rect x="0" y="0" width="55" height="55" rx="8" fill="#dc2626"/>
        <g stroke="#ffffff" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" fill="none">
          <!-- 雨 radical -->
          <line x1="15" y1="16" x2="39" y2="16"/>
          <line x1="27" y1="16" x2="27" y2="30"/>
          <line x1="16" y1="24" x2="38" y2="24"/>
          <line x1="16" y1="24" x2="16" y2="30"/>
          <line x1="38" y1="24" x2="38" y2="30"/>
          <circle cx="21" cy="27" r="1" fill="#ffffff"/>
          <circle cx="33" cy="27" r="1" fill="#ffffff"/>
          <!-- 山/彐 radical -->
          <line x1="18" y1="34" x2="36" y2="34"/>
          <line x1="18" y1="39" x2="36" y2="39"/>
          <line x1="18" y1="44" x2="36" y2="44"/>
          <line x1="18" y1="34" x2="18" y2="44"/>
        </g>
      </g>
    `
  },

  // ==========================================
  // 9. 手不释卷 (idiom_shouboushijuan)
  // ==========================================
  {
    id: "idiom_shouboushijuan",
    title: "手不释卷",
    defs: `
      <linearGradient id="tent_light" x1="0%" y1="0%" x2="0%" y2="100%">
        <stop offset="0%" stop-color="#1e1b4b"/>
        <stop offset="60%" stop-color="#312e81"/>
        <stop offset="100%" stop-color="#475569"/>
      </linearGradient>
    `,
    content: `
      <!-- Military Camp Pavilion Interior (军旅营帐夜读) -->
      <rect width="1376" height="768" fill="url(#tent_light)"/>

      <!-- Military Tent Canopy & Hanging Armor (帅帐布幔与宝剑) -->
      <g filter="url(#dropShadow)">
        <polygon points="0,0 688,140 1376,0 1376,180 688,240 0,180" fill="#991b1b"/>
        <!-- Hanging Straight Sword on Tent Pole -->
        <line x1="180" y1="160" x2="180" y2="440" stroke="#78350f" stroke-width="16"/>
        <line x1="180" y1="240" x2="180" y2="460" stroke="#cbd5e1" stroke-width="10"/>
      </g>

      <!-- Carved Wooden Desk with Glowing Oil Lamp -->
      <g transform="translate(420, 480)" filter="url(#dropShadow)">
        <rect x="0" y="40" width="560" height="240" rx="12" fill="#78350f"/>
        <rect x="-20" y="20" width="600" height="30" rx="6" fill="#92400e"/>
        <!-- Bronze Oil Lamp Glow -->
        <ellipse cx="100" cy="15" rx="30" ry="10" fill="#f59e0b"/>
        <path d="M100,15 C95,5 96,-10 100,-25 C104,-10 105,5 100,15 Z" fill="#ef4444" filter="url(#softGlow)"/>
        <circle cx="100" cy="-5" r="8" fill="#fef08a"/>
      </g>

      <!-- General Lu Meng (吕蒙) Reading Bamboo Scroll with Delight (大将吕蒙手握书卷入神精读) -->
      <g transform="translate(560, 240)" filter="url(#dropShadow)">
        <!-- Military Armor under Scholar Robes -->
        <path d="M60,180 Q100,260 140,180 L160,360 L40,360 Z" fill="#b45309"/>
        <!-- Golden Armor Plating (金甲映书) -->
        <rect x="70" y="200" width="60" height="80" rx="8" fill="#eab308" stroke="#ca8a04" stroke-width="4"/>

        <!-- Heroic Face Concentrated on Reading -->
        <circle cx="100" cy="110" r="40" fill="#fed7aa"/>
        <!-- General Helmet / Headpiece (将军束发金冠) -->
        <polygon points="80,75 100,25 120,75" fill="#f59e0b"/>
        <circle cx="100" cy="25" r="8" fill="#ef4444"/>

        <!-- Focused Intelligent Eyes (开卷有益、日进千里) -->
        <circle cx="112" cy="110" r="4.5" fill="#1e293b"/>
        <path d="M104,130 Q112,136 120,130" stroke="#b91c1c" stroke-width="3" stroke-linecap="round" fill="none"/>

        <!-- Both Hands Unfolding Ancient Bamboo Slips (展开的竹简古籍) -->
        <g transform="translate(110, 180)">
          <!-- Bamboo Slips Array (一片片串联的竹简) -->
          <g fill="#ca8a04" stroke="#713f12" stroke-width="2">
            <rect x="0" y="0" width="14" height="110" rx="2"/>
            <rect x="16" y="0" width="14" height="110" rx="2"/>
            <rect x="32" y="0" width="14" height="110" rx="2"/>
            <rect x="48" y="0" width="14" height="110" rx="2"/>
            <rect x="64" y="0" width="14" height="110" rx="2"/>
            <rect x="80" y="0" width="14" height="110" rx="2"/>
            <rect x="96" y="0" width="14" height="110" rx="2"/>
          </g>
          <!-- Linking Red Silk Cords (韦编三绝红丝线) -->
          <line x1="-5" y1="25" x2="115" y2="25" stroke="#ef4444" stroke-width="4"/>
          <line x1="-5" y1="85" x2="115" y2="85" stroke="#ef4444" stroke-width="4"/>
        </g>
        <!-- Hands Holding Slips -->
        <ellipse cx="105" cy="235" rx="14" ry="10" fill="#fed7aa"/>
        <ellipse cx="225" cy="235" rx="14" ry="10" fill="#fed7aa"/>
      </g>

      <!-- Red Chinese Seal (书) with Vector Path -->
      <g transform="translate(1220, 80)" filter="url(#dropShadow)">
        <rect x="0" y="0" width="55" height="55" rx="8" fill="#dc2626"/>
        <g stroke="#ffffff" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" fill="none">
          <line x1="16" y1="14" x2="38" y2="14"/>
          <path d="M16,14 L16,28 L38,28"/>
          <line x1="16" y1="21" x2="38" y2="21"/>
          <line x1="16" y1="34" x2="38" y2="34"/>
          <line x1="27" y1="14" x2="27" y2="44"/>
          <line x1="14" y1="44" x2="40" y2="44"/>
        </g>
      </g>
    `
  },

  // ==========================================
  // 10. 悬梁刺股 (idiom_xuanliangcigu)
  // ==========================================
  {
    id: "idiom_xuanliangcigu",
    title: "悬梁刺股",
    defs: `
      <linearGradient id="night_study" x1="0%" y1="0%" x2="0%" y2="100%">
        <stop offset="0%" stop-color="#1e1b4b"/>
        <stop offset="60%" stop-color="#312e81"/>
        <stop offset="100%" stop-color="#1e293b"/>
      </linearGradient>
    `,
    content: `
      <!-- Deep Night Study Interior -->
      <rect width="1376" height="768" fill="url(#night_study)"/>

      <!-- Sturdy Overhead Wooden Ceiling Beam (古宅屋梁) -->
      <g filter="url(#dropShadow)">
        <rect x="0" y="60" width="1376" height="45" fill="#78350f"/>
        <rect x="0" y="95" width="1376" height="15" fill="#5c280b"/>
      </g>

      <!-- Cord Tied from Ceiling Beam to Topknot (悬梁之绳) -->
      <g filter="url(#dropShadow)">
        <line x1="688" y1="95" x2="688" y2="260" stroke="#fef08a" stroke-width="5" stroke-dasharray="8,4"/>
        <!-- Bowknot on Beam -->
        <circle cx="688" cy="100" r="10" fill="#f59e0b"/>
      </g>

      <!-- Ancient Low Desk with Books and Lantern -->
      <g transform="translate(488, 520)" filter="url(#dropShadow)">
        <rect x="0" y="30" width="400" height="210" rx="10" fill="#92400e"/>
        <rect x="-15" y="15" width="430" height="22" rx="4" fill="#78350f"/>
        <!-- Stacks of Classic Scrolls -->
        <rect x="40" y="-15" width="90" height="30" rx="4" fill="#ca8a04"/>
        <rect x="45" y="-35" width="80" height="20" rx="3" fill="#eab308"/>
        <!-- Bright Oil Lamp (通宵明灯) -->
        <ellipse cx="320" cy="10" rx="35" ry="12" fill="#d97706"/>
        <path d="M320,10 C315,0 316,-15 320,-30 C324,-15 325,0 320,10 Z" fill="#ef4444" filter="url(#softGlow)"/>
        <circle cx="320" cy="-10" r="10" fill="#fef08a"/>
      </g>

      <!-- Diligent Scholar (苏秦/孙敬) Studying Night and Day (头悬梁、锥刺股、发愤苦读) -->
      <g transform="translate(588, 220)" filter="url(#dropShadow)">
        <!-- Scholar Sitting Cross-legged in Hanfu -->
        <ellipse cx="100" cy="240" rx="70" ry="80" fill="#047857"/>
        <path d="M60,180 Q100,260 140,180 L160,340 L40,340 Z" fill="#10b981"/>

        <!-- Head Tied to Overhead Rope by Hair Ribbon (发带悬于梁上) -->
        <circle cx="100" cy="110" r="42" fill="#fed7aa"/>
        <circle cx="100" cy="65" r="26" fill="#1e293b"/>
        <!-- Red Hair Ribbon tied to the Rope -->
        <circle cx="100" cy="50" r="8" fill="#ef4444"/>

        <!-- Wide Awakened Inspiring Eyes (目光炯炯、志存高远) -->
        <circle cx="88" cy="110" r="5" fill="#1e293b"/>
        <circle cx="90" cy="108" r="1.5" fill="#ffffff"/>
        <circle cx="112" cy="110" r="5" fill="#1e293b"/>
        <circle cx="114" cy="108" r="1.5" fill="#ffffff"/>
        <path d="M94,130 Q100,136 106,130" stroke="#b91c1c" stroke-width="3" stroke-linecap="round" fill="none"/>

        <!-- Hand Holding Bamboo Book Scroll in Front -->
        <rect x="70" y="190" width="80" height="60" rx="4" fill="#ca8a04"/>
        <line x1="70" y1="210" x2="150" y2="210" stroke="#713f12" stroke-width="2"/>
        <ellipse cx="65" cy="220" rx="14" ry="10" fill="#fed7aa"/>
        <ellipse cx="155" cy="220" rx="14" ry="10" fill="#fed7aa"/>

        <!-- Iron Awl (刺股之铁锥) on Desk side -->
        <polygon points="175,280 205,270 200,265" fill="#94a3b8"/>
        <line x1="205" y1="270" x2="230" y2="280" stroke="#78350f" stroke-width="6" stroke-linecap="round"/>
      </g>

      <!-- Red Chinese Seal (勤) with Vector Path -->
      <g transform="translate(1220, 80)" filter="url(#dropShadow)">
        <rect x="0" y="0" width="55" height="55" rx="8" fill="#dc2626"/>
        <g stroke="#ffffff" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" fill="none">
          <!-- 堇 radical on left -->
          <line x1="14" y1="16" x2="27" y2="16"/>
          <line x1="20" y1="12" x2="20" y2="20"/>
          <rect x="15" y="20" width="10" height="8"/>
          <line x1="14" y1="32" x2="27" y2="32"/>
          <line x1="20" y1="28" x2="20" y2="44"/>
          <line x1="13" y1="44" x2="28" y2="44"/>
          <!-- 力 radical on right -->
          <path d="M33,18 L43,18 L43,30 Q43,34 38,34"/>
          <path d="M39,14 L30,44"/>
        </g>
      </g>
    `
  }
];

console.log(`Rendering ${IDIOMS_PART2.length} remaining classic idiom illustrations...`);

for (const item of IDIOMS_PART2) {
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

console.log("\nAll 10 remaining idiom illustrations generated successfully!");
