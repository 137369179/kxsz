import fs from "fs";
import path from "path";
import { execSync } from "child_process";

const OUTPUT_DIR = path.resolve("assets/images");
const TMP_DIR = "/tmp/literacy_poems_idioms";

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

const ITEMS = [
  // ==========================================
  // 1. POEM: 游子吟 (孟郊) - 慈母手中线，游子身上衣
  // ==========================================
  {
    id: "poem_youziyin",
    title: "游子吟",
    defs: `
      <linearGradient id="sky_yzy" x1="0%" y1="0%" x2="0%" y2="100%">
        <stop offset="0%" stop-color="#1e1b4b"/>
        <stop offset="60%" stop-color="#312e81"/>
        <stop offset="100%" stop-color="#4338ca"/>
      </linearGradient>
      <linearGradient id="warm_room" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="#fef3c7"/>
        <stop offset="50%" stop-color="#fed7aa"/>
        <stop offset="100%" stop-color="#fbcfe8"/>
      </linearGradient>
      <radialGradient id="lamp_light" cx="50%" cy="50%" r="50%">
        <stop offset="0%" stop-color="#fef08a" stop-opacity="0.9"/>
        <stop offset="50%" stop-color="#fde047" stop-opacity="0.4"/>
        <stop offset="100%" stop-color="#f59e0b" stop-opacity="0"/>
      </radialGradient>
    `,
    content: `
      <!-- Deep Blue Night Sky through Window -->
      <rect width="1376" height="768" fill="url(#sky_yzy)"/>

      <!-- Night Stars -->
      <g fill="#ffffff" opacity="0.8">
        <circle cx="200" cy="120" r="3"/>
        <circle cx="380" cy="80" r="2.5"/>
        <circle cx="620" cy="140" r="3"/>
        <circle cx="850" cy="90" r="2"/>
        <circle cx="1100" cy="130" r="2.5"/>
      </g>

      <!-- Full Moon Outside Window -->
      <circle cx="340" cy="220" r="85" fill="#fef08a" filter="url(#softGlow)"/>

      <!-- Traditional Chinese Carved Wooden Window Frame -->
      <g filter="url(#dropShadow)">
        <path d="M0,0 L1376,0 L1376,768 L0,768 Z M160,80 L520,80 L520,540 L160,540 Z" fill="#78350f" fill-rule="evenodd"/>
        <!-- Window Lattice Patterns (冰裂纹花格) -->
        <rect x="170" y="90" width="340" height="440" fill="none" stroke="#92400e" stroke-width="8"/>
        <line x1="340" y1="90" x2="340" y2="530" stroke="#92400e" stroke-width="6"/>
        <line x1="170" y1="310" x2="510" y2="310" stroke="#92400e" stroke-width="6"/>
        <circle cx="340" cy="310" r="60" fill="none" stroke="#92400e" stroke-width="5"/>
      </g>

      <!-- Warm Interior Room Light Glow -->
      <circle cx="820" cy="460" r="380" fill="url(#lamp_light)"/>

      <!-- Sleeping Child in Bed on Right Background -->
      <g transform="translate(980, 360)" filter="url(#dropShadow)">
        <!-- Bed frame and warm quilt -->
        <rect x="0" y="60" width="340" height="240" rx="16" fill="#831843"/>
        <path d="M20,100 Q180,60 320,100 L320,280 L20,280 Z" fill="#f43f5e"/>
        <!-- Quilt Patterns -->
        <circle cx="120" cy="180" r="16" fill="#fb7185"/>
        <circle cx="220" cy="160" r="16" fill="#fb7185"/>
        <!-- Peaceful Sleeping Face with Double Buns -->
        <circle cx="80" cy="80" r="35" fill="#fed7aa"/>
        <ellipse cx="65" cy="55" rx="14" ry="14" fill="#1e293b"/>
        <ellipse cx="95" cy="55" rx="14" ry="14" fill="#1e293b"/>
        <!-- Closed Eyes Smiling -->
        <path d="M72,82 Q80,88 88,82" fill="none" stroke="#475569" stroke-width="3" stroke-linecap="round"/>
        <!-- Red Quilt border -->
        <rect x="10" y="90" width="320" height="25" rx="6" fill="#fef08a"/>
      </g>

      <!-- Desk with Traditional Ceramic Oil Lamp -->
      <g transform="translate(680, 480)" filter="url(#dropShadow)">
        <rect x="0" y="80" width="180" height="200" rx="8" fill="#92400e"/>
        <rect x="-10" y="70" width="200" height="20" rx="4" fill="#78350f"/>
        <!-- Bronze / Ceramic Oil Lamp Base -->
        <ellipse cx="90" cy="65" rx="40" ry="12" fill="#d97706"/>
        <path d="M80,65 L85,25 L95,25 L100,65 Z" fill="#b45309"/>
        <ellipse cx="90" cy="25" rx="20" ry="8" fill="#f59e0b"/>
        <!-- Flame -->
        <path d="M90,25 C82,15 84,-5 90,-20 C96,-5 98,15 90,25 Z" fill="#ef4444" filter="url(#softGlow)"/>
        <path d="M90,25 C85,18 87,0 90,-10 C93,0 95,18 90,25 Z" fill="#fef08a"/>
      </g>

      <!-- Gentle Loving Mother (慈母) Sitting Sewing by the Lamp -->
      <g transform="translate(540, 240)" filter="url(#dropShadow)">
        <!-- Elegant Hanfu Body -->
        <path d="M120,240 Q150,300 180,480 L0,480 Q40,320 80,240 Z" fill="#047857"/>
        <path d="M100,240 Q130,300 150,480 L50,480 Q70,320 90,240 Z" fill="#10b981"/>
        <!-- Soft Peach-Pink Shawl & Crossed Collar (交领汉服) -->
        <path d="M60,180 Q100,260 140,180 L160,250 Q100,290 40,250 Z" fill="#f472b6"/>
        <path d="M65,185 L100,240 L135,185" fill="none" stroke="#fbcfe8" stroke-width="12" stroke-linecap="round"/>

        <!-- Mother's Gentle Face -->
        <ellipse cx="100" cy="140" rx="38" ry="46" fill="#fed7aa"/>
        <!-- High Classical Topknot Hair (高髻) -->
        <ellipse cx="100" cy="100" rx="48" ry="38" fill="#1e293b"/>
        <ellipse cx="100" cy="65" rx="30" ry="32" fill="#1e293b"/>
        <!-- Gold & Jade Hairpin (金步摇) -->
        <line x1="60" y1="65" x2="140" y2="60" stroke="#f59e0b" stroke-width="6" stroke-linecap="round"/>
        <circle cx="56" cy="66" r="8" fill="#ef4444"/>
        <circle cx="50" cy="78" r="5" fill="#34d399"/>

        <!-- Eyes Looking Down with Maternal Love -->
        <path d="M82,138 Q90,144 98,138" fill="none" stroke="#334155" stroke-width="3" stroke-linecap="round"/>
        <path d="M108,138 Q116,144 124,138" fill="none" stroke="#334155" stroke-width="3" stroke-linecap="round"/>
        <!-- Soft Smile -->
        <path d="M96,162 Q103,168 110,162" fill="none" stroke="#e11d48" stroke-width="3" stroke-linecap="round"/>
        <!-- Blush -->
        <circle cx="82" cy="150" r="9" fill="#fda4af" opacity="0.6"/>
        <circle cx="124" cy="150" r="9" fill="#fda4af" opacity="0.6"/>

        <!-- Mother's Hands Sewing the Traveling Coat (游子身上衣) -->
        <!-- Deep Blue Robe in Hands -->
        <path d="M60,270 Q140,240 220,290 Q200,380 90,360 Z" fill="#1d4ed8"/>
        <!-- Golden Needle and Silver Thread (慈母手中线) -->
        <line x1="160" y1="240" x2="185" y2="215" stroke="#fbbf24" stroke-width="3"/>
        <path d="M185,215 Q210,195 240,230 T270,270" fill="none" stroke="#ffffff" stroke-width="2.5" stroke-dasharray="6,4"/>
        <!-- Graceful Hands -->
        <ellipse cx="155" cy="245" rx="14" ry="10" fill="#fed7aa" transform="rotate(-20 155 245)"/>
        <ellipse cx="180" cy="225" rx="12" ry="8" fill="#fed7aa" transform="rotate(-30 180 225)"/>
      </g>

      <!-- Red Chinese Seal (慈) with Pure Vector Strokes -->
      <g transform="translate(1220, 80)" filter="url(#dropShadow)">
        <rect x="0" y="0" width="55" height="55" rx="8" fill="#dc2626"/>
        <g stroke="#ffffff" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" fill="none">
          <!-- 慈: Top (兹) -->
          <line x1="16" y1="14" x2="22" y2="18"/>
          <line x1="38" y1="14" x2="32" y2="18"/>
          <line x1="15" y1="22" x2="39" y2="22"/>
          <line x1="20" y1="18" x2="20" y2="30"/>
          <line x1="34" y1="18" x2="34" y2="30"/>
          <!-- Bottom (心) -->
          <line x1="16" y1="36" x2="18" y2="42"/>
          <path d="M22,36 C22,46 32,46 38,40"/>
          <line x1="28" y1="34" x2="30" y2="38"/>
          <line x1="38" y1="34" x2="41" y2="38"/>
        </g>
      </g>
    `
  },

  // ==========================================
  // 2. POEM: 元日 (王安石) - 爆竹声中一岁除，总把新桃换旧符
  // ==========================================
  {
    id: "poem_yuanri",
    title: "元日",
    defs: `
      <linearGradient id="sky_yr" x1="0%" y1="0%" x2="0%" y2="100%">
        <stop offset="0%" stop-color="#38bdf8"/>
        <stop offset="60%" stop-color="#bae6fd"/>
        <stop offset="100%" stop-color="#fef08a"/>
      </linearGradient>
      <linearGradient id="roof_snow" x1="0%" y1="0%" x2="0%" y2="100%">
        <stop offset="0%" stop-color="#ffffff"/>
        <stop offset="100%" stop-color="#cbd5e1"/>
      </linearGradient>
    `,
    content: `
      <!-- Festive Bright Morning Sky (千门万户曈曈日) -->
      <rect width="1376" height="768" fill="url(#sky_yr)"/>
      <circle cx="1180" cy="140" r="75" fill="#f87171" filter="url(#softGlow)"/>

      <!-- Traditional Courtyard Walls and Gate with Flying Eaves -->
      <g filter="url(#dropShadow)">
        <!-- Wall Base -->
        <rect x="0" y="320" width="1376" height="448" fill="#e2e8f0"/>
        <path d="M0,320 L1376,320 L1376,340 L0,340 Z" fill="#94a3b8"/>

        <!-- Grand Red Gate (千门万户) -->
        <rect x="480" y="240" width="416" height="420" fill="#991b1b" stroke="#7f1d1d" stroke-width="12"/>
        <rect x="500" y="260" width="180" height="380" fill="#b91c1c"/>
        <rect x="700" y="260" width="180" height="380" fill="#b91c1c"/>
        <!-- Golden Door Studs (门钉) -->
        <g fill="#fde047">
          <circle cx="560" cy="340" r="10"/><circle cx="620" cy="340" r="10"/>
          <circle cx="560" cy="420" r="10"/><circle cx="620" cy="420" r="10"/>
          <circle cx="560" cy="500" r="10"/><circle cx="620" cy="500" r="10"/>
          <circle cx="760" cy="340" r="10"/><circle cx="820" cy="340" r="10"/>
          <circle cx="760" cy="420" r="10"/><circle cx="820" cy="420" r="10"/>
          <circle cx="760" cy="500" r="10"/><circle cx="820" cy="500" r="10"/>
        </g>
        <!-- Golden Ring Door Knockers (辅首衔环) -->
        <circle cx="640" cy="420" r="26" fill="none" stroke="#f59e0b" stroke-width="8"/>
        <circle cx="740" cy="420" r="26" fill="none" stroke="#f59e0b" stroke-width="8"/>

        <!-- Red Spring Couplets & Peach Wood Charms (新桃换旧符) -->
        <rect x="420" y="260" width="45" height="260" rx="6" fill="#dc2626" stroke="#fbbf24" stroke-width="3"/>
        <rect x="910" y="260" width="45" height="260" rx="6" fill="#dc2626" stroke="#fbbf24" stroke-width="3"/>
        <!-- Vector Calligraphy on Couplets: 吉 & 祥 -->
        <g stroke="#fef08a" stroke-width="3.5" stroke-linecap="round" fill="none">
          <!-- 吉 on left -->
          <line x1="432" y1="290" x2="454" y2="290"/>
          <line x1="443" y1="280" x2="443" y2="305"/>
          <line x1="435" y1="305" x2="451" y2="305"/>
          <rect x="434" y="315" width="18" height="18"/>
          <!-- 祥 on right -->
          <line x1="922" y1="285" x2="930" y2="295"/>
          <line x1="924" y1="280" x2="924" y2="330"/>
          <line x1="935" y1="285" x2="948" y2="285"/>
          <line x1="933" y1="295" x2="949" y2="295"/>
          <line x1="931" y1="305" x2="951" y2="305"/>
          <line x1="941" y1="285" x2="941" y2="330"/>
        </g>

        <!-- Chinese Tiled Roof with Flying Eaves and Snow Traces -->
        <path d="M420,240 Q688,140 960,240 L1020,240 Q688,90 360,240 Z" fill="#334155"/>
        <path d="M410,230 Q688,130 970,230 Q688,110 410,230 Z" fill="url(#roof_snow)"/>
      </g>

      <!-- Cheerful Red Lanterns with Gold Tassels (红灯笼) -->
      <g transform="translate(340, 180)" filter="url(#dropShadow)">
        <ellipse cx="60" cy="80" rx="55" ry="45" fill="#dc2626"/>
        <ellipse cx="60" cy="80" rx="35" ry="45" fill="#ef4444"/>
        <rect x="40" y="30" width="40" height="12" rx="3" fill="#f59e0b"/>
        <rect x="40" y="120" width="40" height="12" rx="3" fill="#f59e0b"/>
        <!-- Golden Tassels -->
        <line x1="60" y1="132" x2="60" y2="190" stroke="#f59e0b" stroke-width="6"/>
      </g>
      <g transform="translate(920, 180)" filter="url(#dropShadow)">
        <ellipse cx="60" cy="80" rx="55" ry="45" fill="#dc2626"/>
        <ellipse cx="60" cy="80" rx="35" ry="45" fill="#ef4444"/>
        <rect x="40" y="30" width="40" height="12" rx="3" fill="#f59e0b"/>
        <rect x="40" y="120" width="40" height="12" rx="3" fill="#f59e0b"/>
        <line x1="60" y1="132" x2="60" y2="190" stroke="#f59e0b" stroke-width="6"/>
      </g>

      <!-- Bursting Firecrackers (爆竹声中一岁除) -->
      <g transform="translate(240, 480)" filter="url(#dropShadow)">
        <!-- Bamboo pole hanging red firecracker string -->
        <line x1="0" y1="200" x2="80" y2="40" stroke="#15803d" stroke-width="10" stroke-linecap="round"/>
        <line x1="75" y1="50" x2="70" y2="180" stroke="#78350f" stroke-width="4"/>
        <!-- Red Firecracker Rolls -->
        <rect x="50" y="70" width="22" height="10" rx="2" fill="#ef4444"/>
        <rect x="70" y="90" width="22" height="10" rx="2" fill="#ef4444"/>
        <rect x="50" y="110" width="22" height="10" rx="2" fill="#ef4444"/>
        <rect x="70" y="130" width="22" height="10" rx="2" fill="#ef4444"/>
        <rect x="55" y="150" width="22" height="10" rx="2" fill="#ef4444"/>
        <!-- Golden Sparkles -->
        <g fill="#fde047" filter="url(#softGlow)">
          <polygon points="70,170 75,155 80,170 95,175 80,180 75,195 70,180 55,175"/>
          <circle cx="100" cy="150" r="5"/>
          <circle cx="50" cy="190" r="4"/>
          <circle cx="110" cy="190" r="6"/>
        </g>
      </g>

      <!-- Two Happy Chinese Children in Red New Year Padded Coats & Tiger Hats -->
      <!-- Child 1 on Left -->
      <g transform="translate(260, 440)" filter="url(#dropShadow)">
        <!-- Chubby Red Coat -->
        <ellipse cx="90" cy="180" rx="55" ry="60" fill="#dc2626"/>
        <rect x="75" y="130" width="30" height="110" fill="#fef08a" rx="4"/>
        <!-- Cute Smiling Round Face -->
        <circle cx="90" cy="100" r="45" fill="#fed7aa"/>
        <!-- Tiger Hat (虎头帽) -->
        <path d="M45,90 C45,45 135,45 135,90 Z" fill="#f59e0b"/>
        <!-- Tiger Ears -->
        <circle cx="55" cy="45" r="14" fill="#d97706"/>
        <circle cx="125" cy="45" r="14" fill="#d97706"/>
        <!-- Chinese Character 王 on Tiger Hat -->
        <g stroke="#ffffff" stroke-width="2.5" stroke-linecap="round" fill="none">
          <line x1="82" y1="55" x2="98" y2="55"/>
          <line x1="84" y1="62" x2="96" y2="62"/>
          <line x1="80" y1="70" x2="100" y2="70"/>
          <line x1="90" y1="55" x2="90" y2="70"/>
        </g>
        <!-- Big Round Eyes & Cheerful Smile -->
        <circle cx="75" cy="100" r="5" fill="#1e293b"/>
        <circle cx="105" cy="100" r="5" fill="#1e293b"/>
        <path d="M82,118 Q90,128 98,118" fill="none" stroke="#e11d48" stroke-width="4" stroke-linecap="round"/>
        <circle cx="68" cy="112" r="8" fill="#f43f5e" opacity="0.6"/>
        <circle cx="112" cy="112" r="8" fill="#f43f5e" opacity="0.6"/>
        <!-- Holding Joyful Sparkler -->
        <line x1="125" y1="160" x2="170" y2="110" stroke="#78350f" stroke-width="4"/>
        <circle cx="170" cy="110" r="12" fill="#fef08a" filter="url(#softGlow)"/>
      </g>

      <!-- Child 2 on Right with Double Buns & Red Ribbons -->
      <g transform="translate(1000, 450)" filter="url(#dropShadow)">
        <ellipse cx="80" cy="170" rx="50" ry="55" fill="#e11d48"/>
        <!-- White Fur Trim -->
        <rect x="40" y="210" width="80" height="20" rx="10" fill="#ffffff"/>
        <!-- Cute Face -->
        <circle cx="80" cy="95" r="42" fill="#fed7aa"/>
        <!-- Double Buns (双丸子头) with Red Tassels -->
        <circle cx="45" cy="55" r="18" fill="#1e293b"/>
        <circle cx="115" cy="55" r="18" fill="#1e293b"/>
        <ellipse cx="45" cy="68" rx="8" ry="5" fill="#ef4444"/>
        <ellipse cx="115" cy="68" rx="8" ry="5" fill="#ef4444"/>
        <!-- Eyes & Smile -->
        <circle cx="68" cy="95" r="5" fill="#1e293b"/>
        <circle cx="92" cy="95" r="5" fill="#1e293b"/>
        <path d="M74,112 Q80,122 86,112" fill="none" stroke="#e11d48" stroke-width="4" stroke-linecap="round"/>
        <!-- Holding Golden Ingot (金元宝) -->
        <path d="M60,150 Q80,135 100,150 Q110,170 50,170 Z" fill="#f59e0b"/>
        <ellipse cx="80" cy="150" rx="16" ry="7" fill="#fef08a"/>
      </g>

      <!-- Red Chinese Seal (春) with Vector Path -->
      <g transform="translate(1220, 80)" filter="url(#dropShadow)">
        <rect x="0" y="0" width="55" height="55" rx="8" fill="#dc2626"/>
        <g stroke="#ffffff" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" fill="none">
          <line x1="16" y1="16" x2="38" y2="16"/>
          <line x1="18" y1="23" x2="36" y2="23"/>
          <line x1="13" y1="30" x2="41" y2="30"/>
          <line x1="27" y1="12" x2="14" y2="44"/>
          <line x1="27" y1="30" x2="40" y2="44"/>
          <rect x="22" y="34" width="12" height="12"/>
        </g>
      </g>
    `
  },

  // ==========================================
  // 3. IDIOM: 守株待兔 (农夫、树桩、小白兔)
  // ==========================================
  {
    id: "idiom_shouzhudaitu",
    title: "守株待兔",
    defs: `
      <linearGradient id="sky_sz" x1="0%" y1="0%" x2="0%" y2="100%">
        <stop offset="0%" stop-color="#7dd3fc"/>
        <stop offset="60%" stop-color="#e0f2fe"/>
        <stop offset="100%" stop-color="#fef08a"/>
      </linearGradient>
      <linearGradient id="field_sz" x1="0%" y1="0%" x2="0%" y2="100%">
        <stop offset="0%" stop-color="#86efac"/>
        <stop offset="100%" stop-color="#22c55e"/>
      </linearGradient>
    `,
    content: `
      <!-- Sky & Soft Clouds -->
      <rect width="1376" height="768" fill="url(#sky_sz)"/>
      <g fill="#ffffff" opacity="0.8" filter="url(#softGlow)">
        <ellipse cx="320" cy="140" rx="140" ry="40"/>
        <ellipse cx="960" cy="110" rx="180" ry="45"/>
      </g>

      <!-- Distant Hills & Farmland -->
      <path d="M0,380 Q340,240 700,320 T1376,280 L1376,768 L0,768 Z" fill="#4ade80" opacity="0.6"/>
      <path d="M0,450 Q480,360 900,430 T1376,380 L1376,768 L0,768 Z" fill="url(#field_sz)"/>

      <!-- Ancient Willow Tree on Right -->
      <g filter="url(#dropShadow)">
        <path d="M1180,768 C1160,540 1220,380 1140,240" fill="none" stroke="#78350f" stroke-width="50" stroke-linecap="round"/>
        <path d="M1160,360 Q1060,300 960,340" fill="none" stroke="#78350f" stroke-width="26" stroke-linecap="round"/>
        <!-- Willow Streamers -->
        <path d="M980,340 Q950,460 920,560" fill="none" stroke="#16a34a" stroke-width="5"/>
        <path d="M1050,330 Q1020,480 1000,580" fill="none" stroke="#16a34a" stroke-width="5"/>
        <path d="M1120,300 Q1080,440 1060,550" fill="none" stroke="#16a34a" stroke-width="5"/>
      </g>

      <!-- Big Ancient Tree Stump in Center (株) -->
      <g transform="translate(560, 420)" filter="url(#dropShadow)">
        <!-- Stump Body -->
        <path d="M40,120 L30,280 L230,280 L210,120 Z" fill="#854d0e"/>
        <!-- Bark Texture -->
        <path d="M80,140 L70,270" stroke="#713f12" stroke-width="6"/>
        <path d="M140,135 L145,275" stroke="#713f12" stroke-width="6"/>
        <path d="M180,145 L175,270" stroke="#713f12" stroke-width="6"/>
        <!-- Annual Rings Top Oval -->
        <ellipse cx="125" cy="120" rx="90" ry="36" fill="#ca8a04"/>
        <ellipse cx="125" cy="120" rx="65" ry="24" fill="none" stroke="#a16207" stroke-width="4"/>
        <ellipse cx="125" cy="120" rx="38" ry="14" fill="none" stroke="#a16207" stroke-width="3"/>
        <circle cx="125" cy="120" r="6" fill="#713f12"/>
        <!-- Sprouts on Stump -->
        <path d="M205,115 Q235,90 225,80 Q215,95 205,115 Z" fill="#22c55e"/>
      </g>

      <!-- Cute Chubby White Bunny (奔跑的小野兔) near Stump -->
      <g transform="translate(340, 490)" filter="url(#dropShadow)">
        <!-- Bunny Body -->
        <ellipse cx="90" cy="110" rx="55" ry="40" fill="#ffffff"/>
        <!-- Fluffy Round Tail -->
        <circle cx="30" cy="105" r="16" fill="#f8fafc"/>
        <!-- Bunny Head -->
        <circle cx="135" cy="80" r="32" fill="#ffffff"/>
        <!-- Long Ears with Pink Inside -->
        <ellipse cx="120" cy="30" rx="12" ry="36" fill="#ffffff" transform="rotate(-15 120 30)"/>
        <ellipse cx="120" cy="30" rx="6" ry="26" fill="#fda4af" transform="rotate(-15 120 30)"/>
        <ellipse cx="145" cy="35" rx="12" ry="34" fill="#ffffff" transform="rotate(10 145 35)"/>
        <ellipse cx="145" cy="35" rx="6" ry="24" fill="#fda4af" transform="rotate(10 145 35)"/>
        <!-- Shiny Eye & Pink Nose -->
        <circle cx="150" cy="75" r="5" fill="#be123c"/>
        <circle cx="152" cy="73" r="1.5" fill="#ffffff"/>
        <circle cx="165" cy="85" r="4" fill="#fb7185"/>
        <!-- Front Paws running -->
        <ellipse cx="140" cy="140" rx="14" ry="8" fill="#f1f5f9"/>
        <ellipse cx="80" cy="145" rx="16" ry="9" fill="#f1f5f9"/>
      </g>

      <!-- Lazy Farmer Snoozing Under Tree on Right (不劳而获的农夫) -->
      <g transform="translate(940, 460)" filter="url(#dropShadow)">
        <!-- Body Leaning on Tree -->
        <ellipse cx="90" cy="140" rx="65" ry="55" fill="#0284c7"/>
        <rect x="70" y="80" width="70" height="90" rx="10" fill="#38bdf8"/>
        <!-- Face Sleeping Peacefully -->
        <circle cx="110" cy="70" r="38" fill="#fed7aa"/>
        <!-- Headwrap (头巾) -->
        <ellipse cx="110" cy="45" rx="36" ry="18" fill="#0369a1"/>
        <!-- Closed Eyes & Nose Snoozing "Zzz" -->
        <path d="M102,70 Q110,75 118,70" fill="none" stroke="#475569" stroke-width="3" stroke-linecap="round"/>
        <circle cx="128" cy="72" r="10" fill="#60a5fa" opacity="0.6"/>
        <!-- Idle Hoe Lying in Grass (丢在一旁的锄头) -->
        <line x1="-80" y1="210" x2="30" y2="150" stroke="#78350f" stroke-width="8" stroke-linecap="round"/>
        <polygon points="30,150 45,140 55,160 38,168" fill="#64748b"/>
      </g>

      <!-- Red Chinese Seal (守) with Vector Strokes -->
      <g transform="translate(1220, 80)" filter="url(#dropShadow)">
        <rect x="0" y="0" width="55" height="55" rx="8" fill="#dc2626"/>
        <g stroke="#ffffff" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" fill="none">
          <!-- Roof radical (宀) -->
          <line x1="27" y1="12" x2="27" y2="16"/>
          <line x1="16" y1="18" x2="16" y2="23"/>
          <path d="M16,19 L38,19 L38,23"/>
          <!-- 寸 radical -->
          <line x1="14" y1="28" x2="41" y2="28"/>
          <path d="M30,23 L30,42 Q30,46 25,45"/>
          <circle cx="22" cy="35" r="1.5" fill="#ffffff"/>
        </g>
      </g>
    `
  },

  // ==========================================
  // 4. IDIOM: 拔苗助长 (农夫拔禾苗、着急流汗)
  // ==========================================
  {
    id: "idiom_bamiaozhuzhang",
    title: "拔苗助长",
    defs: `
      <linearGradient id="sky_bm" x1="0%" y1="0%" x2="0%" y2="100%">
        <stop offset="0%" stop-color="#38bdf8"/>
        <stop offset="60%" stop-color="#bae6fd"/>
        <stop offset="100%" stop-color="#fef08a"/>
      </linearGradient>
      <linearGradient id="paddy" x1="0%" y1="0%" x2="0%" y2="100%">
        <stop offset="0%" stop-color="#86efac"/>
        <stop offset="100%" stop-color="#16a34a"/>
      </linearGradient>
    `,
    content: `
      <!-- Sunny Sky & Scorching Sun -->
      <rect width="1376" height="768" fill="url(#sky_bm)"/>
      <circle cx="1160" cy="140" r="70" fill="#facc15" filter="url(#softGlow)"/>

      <!-- Lush Mountain Ridges in Distance -->
      <path d="M0,380 Q320,260 700,340 T1376,300 L1376,768 L0,768 Z" fill="#6ee7b7" opacity="0.6"/>
      <path d="M0,460 Q450,380 950,440 T1376,410 L1376,768 L0,768 Z" fill="url(#paddy)"/>

      <!-- Rows of Rice Seedlings in the Field -->
      <g fill="#15803d">
        <!-- Normal Natural Seedlings on Left -->
        <path d="M180,560 Q170,500 150,470 Q175,500 180,560" stroke="#15803d" stroke-width="4"/>
        <path d="M180,560 Q190,490 210,465 Q185,500 180,560" stroke="#15803d" stroke-width="4"/>
        <path d="M320,580 Q310,510 290,480 Q315,510 320,580" stroke="#15803d" stroke-width="4"/>
        <path d="M320,580 Q330,500 350,475 Q325,510 320,580" stroke="#15803d" stroke-width="4"/>

        <!-- Wilted/Pulled Tall Seedlings on Right (拔起变高却枯萎) -->
        <path d="M880,580 Q870,470 830,440" stroke="#ca8a04" stroke-width="6"/>
        <path d="M880,580 Q910,460 940,430" stroke="#ca8a04" stroke-width="6"/>
        <path d="M1060,590 Q1040,480 1010,440" stroke="#ca8a04" stroke-width="6"/>
        <path d="M1060,590 Q1090,470 1120,440" stroke="#ca8a04" stroke-width="6"/>
      </g>

      <!-- Impatient Farmer Pulling Seedling in Center (焦急拔苗的宋国人) -->
      <g transform="translate(560, 310)" filter="url(#dropShadow)">
        <!-- Trousers & Legs in Mud -->
        <ellipse cx="100" cy="340" rx="35" ry="18" fill="#713f12"/>
        <path d="M70,250 L85,340 M130,250 L115,340" stroke="#b45309" stroke-width="26" stroke-linecap="round"/>
        <!-- Coarse Hemp Tunic -->
        <path d="M60,160 Q100,240 140,160 L150,260 L50,260 Z" fill="#d97706"/>

        <!-- Bent Over Arms Pulling Seedling Up -->
        <path d="M60,180 Q80,260 90,300" stroke="#fed7aa" stroke-width="18" stroke-linecap="round"/>
        <path d="M140,180 Q120,260 110,300" stroke="#fed7aa" stroke-width="18" stroke-linecap="round"/>

        <!-- The Pulled Seedling in Hands -->
        <path d="M100,320 L100,260 Q80,210 60,190" stroke="#84cc16" stroke-width="8" stroke-linecap="round"/>
        <path d="M100,260 Q120,210 140,190" stroke="#84cc16" stroke-width="8" stroke-linecap="round"/>
        <!-- Roots Exposed (根部离土) -->
        <g stroke="#a16207" stroke-width="3">
          <line x1="100" y1="315" x2="90" y2="335"/>
          <line x1="100" y1="315" x2="110" y2="335"/>
        </g>

        <!-- Anxious/Sweating Head -->
        <circle cx="100" cy="110" r="42" fill="#fed7aa"/>
        <!-- Peasant Straw Hat (草帽) -->
        <ellipse cx="100" cy="80" rx="60" ry="18" fill="#ca8a04"/>
        <path d="M70,80 Q100,45 130,80 Z" fill="#eab308"/>
        <!-- Anxious Eyes & Open Panting Mouth -->
        <circle cx="88" cy="110" r="5" fill="#1e293b"/>
        <circle cx="112" cy="110" r="5" fill="#1e293b"/>
        <ellipse cx="100" cy="128" rx="8" ry="12" fill="#991b1b"/>
        <!-- Big Sweat Drops Flying (满头大汗) -->
        <g fill="#38bdf8" filter="url(#softGlow)">
          <path d="M65,95 Q60,110 65,115 Q70,110 65,95 Z"/>
          <path d="M135,100 Q140,115 135,120 Q130,115 135,100 Z"/>
          <path d="M125,75 Q130,90 125,95 Q120,90 125,75 Z"/>
        </g>
      </g>

      <!-- Red Chinese Seal (苗) with Vector Path -->
      <g transform="translate(1220, 80)" filter="url(#dropShadow)">
        <rect x="0" y="0" width="55" height="55" rx="8" fill="#dc2626"/>
        <g stroke="#ffffff" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" fill="none">
          <!-- 艹 radical -->
          <line x1="14" y1="18" x2="41" y2="18"/>
          <line x1="22" y1="13" x2="22" y2="23"/>
          <line x1="33" y1="13" x2="33" y2="23"/>
          <!-- 田 radical -->
          <rect x="18" y="26" width="20" height="18"/>
          <line x1="28" y1="26" x2="28" y2="44"/>
          <line x1="18" y1="35" x2="38" y2="35"/>
        </g>
      </g>
    `
  },

  // ==========================================
  // 5. IDIOM: 亡羊补牢 (羊圈破洞、修补栅栏、可爱白羊)
  // ==========================================
  {
    id: "idiom_wangyangbulao",
    title: "亡羊补牢",
    defs: `
      <linearGradient id="sky_wy" x1="0%" y1="0%" x2="0%" y2="100%">
        <stop offset="0%" stop-color="#60a5fa"/>
        <stop offset="60%" stop-color="#bfdbfe"/>
        <stop offset="100%" stop-color="#fef08a"/>
      </linearGradient>
    `,
    content: `
      <!-- Mountain Pasture Sky -->
      <rect width="1376" height="768" fill="url(#sky_wy)"/>
      <circle cx="1180" cy="140" r="60" fill="#fde047" filter="url(#softGlow)"/>

      <!-- Rolling Green Pasture Hills -->
      <path d="M0,360 Q380,240 760,320 T1376,280 L1376,768 L0,768 Z" fill="#86efac"/>
      <path d="M0,440 Q460,360 920,430 T1376,380 L1376,768 L0,768 Z" fill="#22c55e"/>

      <!-- Wooden Sheepfold / Pen (羊圈) -->
      <g transform="translate(180, 360)" filter="url(#dropShadow)">
        <!-- Horizontal Rails -->
        <rect x="0" y="80" width="780" height="18" rx="4" fill="#92400e"/>
        <rect x="0" y="160" width="780" height="18" rx="4" fill="#92400e"/>
        <!-- Vertical Pickets -->
        <g fill="#b45309">
          <rect x="40" y="40" width="22" height="190" rx="5"/>
          <rect x="120" y="40" width="22" height="190" rx="5"/>
          <rect x="200" y="40" width="22" height="190" rx="5"/>
          <rect x="280" y="40" width="22" height="190" rx="5"/>
          <rect x="360" y="40" width="22" height="190" rx="5"/>
          <rect x="440" y="40" width="22" height="190" rx="5"/>
          <rect x="520" y="40" width="22" height="190" rx="5"/>
          <!-- Repaired Fence Hole with Fresh Golden Planks (严严实实补好的窟窿) -->
          <rect x="600" y="30" width="24" height="205" rx="5" fill="#f59e0b" stroke="#d97706" stroke-width="3"/>
          <rect x="635" y="30" width="24" height="205" rx="5" fill="#f59e0b" stroke="#d97706" stroke-width="3"/>
          <rect x="670" y="30" width="24" height="205" rx="5" fill="#f59e0b" stroke="#d97706" stroke-width="3"/>
        </g>
      </g>

      <!-- Cute Fluffy Sheep Inside Pen -->
      <g transform="translate(260, 410)" filter="url(#dropShadow)">
        <!-- Sheep 1 -->
        <ellipse cx="120" cy="110" rx="60" ry="45" fill="#ffffff"/>
        <!-- Fluffy Wool Bumps -->
        <circle cx="80" cy="85" r="22" fill="#ffffff"/><circle cx="120" cy="75" r="24" fill="#ffffff"/>
        <circle cx="160" cy="85" r="22" fill="#ffffff"/><circle cx="170" cy="120" r="20" fill="#ffffff"/>
        <!-- Head & Curly Horns -->
        <circle cx="65" cy="110" r="28" fill="#fed7aa"/>
        <path d="M50,90 Q40,75 55,70 Q70,75 60,95" fill="none" stroke="#d97706" stroke-width="6" stroke-linecap="round"/>
        <circle cx="58" cy="108" r="4" fill="#1e293b"/>
        <circle cx="50" cy="120" r="3" fill="#fb7185"/>

        <!-- Sheep 2 (Chewing Grass) -->
        <g transform="translate(180, 40)">
          <ellipse cx="110" cy="100" rx="50" ry="38" fill="#ffffff"/>
          <circle cx="70" cy="75" r="18" fill="#ffffff"/><circle cx="110" cy="65" r="20" fill="#ffffff"/>
          <circle cx="60" cy="95" r="24" fill="#fed7aa"/>
          <circle cx="52" cy="92" r="3.5" fill="#1e293b"/>
          <path d="M45,102 Q35,100 30,105" stroke="#22c55e" stroke-width="4"/>
        </g>
      </g>

      <!-- Diligent Shepherd Repairing Fence (认真补羊圈的牧羊人) -->
      <g transform="translate(860, 360)" filter="url(#dropShadow)">
        <!-- Body & Sheepskin Vest -->
        <ellipse cx="90" cy="200" rx="50" ry="60" fill="#0284c7"/>
        <path d="M55,140 Q90,130 125,140 L130,240 L50,240 Z" fill="#ca8a04"/>
        <!-- Happy Confident Face -->
        <circle cx="90" cy="95" r="40" fill="#fed7aa"/>
        <!-- Fur Cap / Headband -->
        <ellipse cx="90" cy="65" rx="36" ry="16" fill="#92400e"/>
        <!-- Eyes & Smile (及时补救，信心满满) -->
        <circle cx="78" cy="95" r="5" fill="#1e293b"/>
        <circle cx="102" cy="95" r="5" fill="#1e293b"/>
        <path d="M84,115 Q90,122 96,115" fill="none" stroke="#e11d48" stroke-width="3" stroke-linecap="round"/>
        <!-- Arm Holding Wooden Mallet / Hammer (木锤打桩) -->
        <path d="M50,170 Q30,130 10,110" stroke="#fed7aa" stroke-width="16" stroke-linecap="round"/>
        <!-- Wooden Mallet -->
        <line x1="20" y1="130" x2="-20" y2="80" stroke="#78350f" stroke-width="10" stroke-linecap="round"/>
        <rect x="-35" y="70" width="30" height="30" rx="5" fill="#92400e" transform="rotate(30 -20 85)"/>
      </g>

      <!-- Red Chinese Seal (牢) with Vector Path -->
      <g transform="translate(1220, 80)" filter="url(#dropShadow)">
        <rect x="0" y="0" width="55" height="55" rx="8" fill="#dc2626"/>
        <g stroke="#ffffff" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" fill="none">
          <!-- 宀 radical -->
          <line x1="27" y1="12" x2="27" y2="16"/>
          <line x1="16" y1="18" x2="16" y2="23"/>
          <path d="M16,19 L38,19 L38,23"/>
          <!-- 牛 radical -->
          <line x1="20" y1="26" x2="27" y2="28"/>
          <line x1="15" y1="33" x2="39" y2="33"/>
          <line x1="27" y1="24" x2="27" y2="45"/>
        </g>
      </g>
    `
  },

  // ==========================================
  // 6. IDIOM: 画龙点睛 (神龙飞腾、点亮龙眼)
  // ==========================================
  {
    id: "idiom_hualongdianjing",
    title: "画龙点睛",
    defs: `
      <linearGradient id="hall_bg" x1="0%" y1="0%" x2="0%" y2="100%">
        <stop offset="0%" stop-color="#1e1b4b"/>
        <stop offset="60%" stop-color="#312e81"/>
        <stop offset="100%" stop-color="#475569"/>
      </linearGradient>
      <linearGradient id="dragon_gold" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="#fef08a"/>
        <stop offset="50%" stop-color="#eab308"/>
        <stop offset="100%" stop-color="#0284c7"/>
      </linearGradient>
    `,
    content: `
      <!-- Grand Ancient Temple Hall Background (金陵安乐寺) -->
      <rect width="1376" height="768" fill="url(#hall_bg)"/>

      <!-- Vermilion Pillars & Flying Clouds on Mural Wall -->
      <g filter="url(#dropShadow)">
        <rect x="80" y="0" width="50" height="768" fill="#991b1b"/>
        <rect x="1240" y="0" width="50" height="768" fill="#991b1b"/>
        <ellipse cx="688" cy="80" rx="580" ry="25" fill="#7f1d1d"/>
      </g>

      <!-- Mural Wall Cloud Swirls -->
      <g fill="#ffffff" opacity="0.3" filter="url(#softGlow)">
        <ellipse cx="400" cy="240" rx="200" ry="60"/>
        <ellipse cx="850" cy="320" rx="260" ry="70"/>
        <ellipse cx="600" cy="460" rx="220" ry="65"/>
      </g>

      <!-- Majestic Chinese Soaring Dragon (腾空而起的神龙) -->
      <g filter="url(#dropShadow)">
        <!-- Undulating Dragon Body -->
        <path d="M260,520 C380,320 520,620 740,360 C900,180 1100,280 1180,180" fill="none" stroke="url(#dragon_gold)" stroke-width="70" stroke-linecap="round"/>
        <!-- Spine Dorsal Fins (金色背鳍) -->
        <path d="M260,520 C380,320 520,620 740,360 C900,180 1100,280 1180,180" fill="none" stroke="#fde047" stroke-width="20" stroke-dasharray="25,18"/>

        <!-- Dragon Head (威猛灵动的龙头) -->
        <g transform="translate(1120, 110)">
          <!-- Main Head -->
          <ellipse cx="60" cy="60" rx="65" ry="45" fill="#0284c7"/>
          <!-- Antlers / Horns (玉龙角) -->
          <path d="M40,25 Q15,-30 0,-15 Q30,-5 40,25" fill="#facc15"/>
          <path d="M70,20 Q60,-35 80,-25 Q75,-5 70,20" fill="#facc15"/>
          <!-- Whiskers (龙须) -->
          <path d="M90,75 Q160,60 200,90" fill="none" stroke="#fde047" stroke-width="6" stroke-linecap="round"/>
          <path d="M90,85 Q150,110 180,140" fill="none" stroke="#fde047" stroke-width="6" stroke-linecap="round"/>
          <!-- Mane Flowing (龙鬃) -->
          <path d="M10,40 Q-40,20 -70,50 Q-20,60 10,70" fill="#38bdf8"/>
          <path d="M10,65 Q-50,60 -80,90 Q-20,90 10,95" fill="#38bdf8"/>

          <!-- Glowing Dotted Dragon Eye (画龙点睛之笔) -->
          <circle cx="82" cy="50" r="16" fill="#ffffff" filter="url(#softGlow)"/>
          <circle cx="82" cy="50" r="10" fill="#f59e0b"/>
          <circle cx="82" cy="50" r="6" fill="#1e293b"/>
          <circle cx="84" cy="48" r="2.5" fill="#ffffff"/>
          <!-- Radiant Burst from the Eye (神采飞扬的光芒) -->
          <g stroke="#fef08a" stroke-width="3" opacity="0.9" filter="url(#softGlow)">
            <line x1="82" y1="20" x2="82" y2="30"/>
            <line x1="82" y1="70" x2="82" y2="80"/>
            <line x1="52" y1="50" x2="62" y2="50"/>
            <line x1="102" y1="50" x2="112" y2="50"/>
          </g>
        </g>

        <!-- Dragon Claws (四趾金爪) -->
        <g transform="translate(680, 360)">
          <path d="M0,0 Q-30,40 -60,60 M0,0 Q0,50 -20,80 M0,0 Q30,50 20,80" stroke="#f59e0b" stroke-width="12" stroke-linecap="round"/>
        </g>
      </g>

      <!-- Master Painter Zhang Sengyou (画师张僧繇) Standing in Admiration -->
      <g transform="translate(320, 360)" filter="url(#dropShadow)">
        <!-- Flowing White Scholar Robes -->
        <path d="M60,180 Q100,260 140,180 L160,360 L40,360 Z" fill="#f8fafc"/>
        <path d="M80,180 L100,240 L120,180" fill="none" stroke="#0284c7" stroke-width="8"/>
        <!-- Dignified Face with Beard Looking Up at Soaring Dragon -->
        <circle cx="100" cy="120" r="38" fill="#fed7aa"/>
        <!-- Scholar Hat (文人软巾) -->
        <ellipse cx="100" cy="90" rx="32" ry="18" fill="#1e293b"/>
        <rect x="90" y="65" width="20" height="28" rx="4" fill="#1e293b"/>
        <!-- Wise Eyes & Long Beard -->
        <circle cx="112" cy="118" r="4.5" fill="#1e293b"/>
        <path d="M90,140 Q105,190 110,210 Q115,190 120,140 Z" fill="#334155"/>
        <!-- Raised Hand Holding Ink Brush (神来之笔) -->
        <line x1="130" y1="190" x2="180" y2="120" stroke="#fed7aa" stroke-width="14" stroke-linecap="round"/>
        <line x1="175" y1="125" x2="225" y2="60" stroke="#78350f" stroke-width="6" stroke-linecap="round"/>
        <!-- Brush Tip with Glowing Cinnabar Ink (朱砂笔尖) -->
        <polygon points="225,60 235,46 242,55" fill="#ef4444" filter="url(#softGlow)"/>
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
          <circle cx="34" cy="22" r="1.5" fill="#ffffff"/>
        </g>
      </g>
    `
  },

  // ==========================================
  // 7. IDIOM: 狐假虎威 (机灵狐狸走在前，威猛大老虎跟在后)
  // ==========================================
  {
    id: "idiom_hujiahuwei",
    title: "狐假虎威",
    defs: `
      <linearGradient id="bamboo_bg" x1="0%" y1="0%" x2="0%" y2="100%">
        <stop offset="0%" stop-color="#bae6fd"/>
        <stop offset="60%" stop-color="#dcfce7"/>
        <stop offset="100%" stop-color="#86efac"/>
      </linearGradient>
    `,
    content: `
      <!-- Bamboo Forest & Soft Dappled Sunlight -->
      <rect width="1376" height="768" fill="url(#bamboo_bg)"/>

      <!-- Verdant Bamboo Grove (翠绿竹林) -->
      <g filter="url(#dropShadow)">
        <!-- Bamboo Culms -->
        <g stroke="#15803d" stroke-width="20" stroke-linecap="round">
          <line x1="140" y1="0" x2="140" y2="768"/>
          <line x1="280" y1="0" x2="280" y2="768"/>
          <line x1="420" y1="0" x2="420" y2="768"/>
          <line x1="1050" y1="0" x2="1050" y2="768"/>
          <line x1="1220" y1="0" x2="1220" y2="768"/>
        </g>
        <!-- Bamboo Joints (竹节) -->
        <g stroke="#14532d" stroke-width="6">
          <line x1="125" y1="200" x2="155" y2="200"/>
          <line x1="125" y1="420" x2="155" y2="420"/>
          <line x1="265" y1="260" x2="295" y2="260"/>
          <line x1="405" y1="340" x2="435" y2="340"/>
          <line x1="1035" y1="280" x2="1065" y2="280"/>
        </g>
        <!-- Bamboo Leaves Clusters -->
        <g fill="#16a34a">
          <path d="M140,200 Q200,210 240,230 Q190,225 140,200 Z"/>
          <path d="M280,260 Q340,270 380,290 Q330,285 280,260 Z"/>
          <path d="M1050,280 Q980,290 940,310 Q990,305 1050,280 Z"/>
        </g>
      </g>

      <!-- Forest Path (幽静林间小道) -->
      <path d="M0,580 Q688,480 1376,580 L1376,768 L0,768 Z" fill="#bbf7d0"/>

      <!-- Smug Orange Fox Strutting in Front (大摇大摆的神气狐狸) -->
      <g transform="translate(360, 390)" filter="url(#dropShadow)">
        <!-- Fluffy Bushy Orange Tail Up in Air -->
        <path d="M40,140 Q-20,90 -20,20 Q30,60 50,110 Z" fill="#ea580c"/>
        <polygon points="-20,20 -10,35 -5,15" fill="#ffffff"/>
        <!-- Fox Body with Chest Out -->
        <ellipse cx="110" cy="150" rx="65" ry="48" fill="#ea580c"/>
        <path d="M90,130 Q140,120 160,165 L100,180 Z" fill="#ffffff"/>
        <!-- Fox Head with Proud Expression -->
        <polygon points="120,90 210,120 150,160" fill="#ea580c"/>
        <polygon points="150,120 210,120 160,150" fill="#ffffff"/>
        <!-- Pointed Fox Ears -->
        <polygon points="125,90 135,40 155,85" fill="#ea580c"/>
        <polygon points="135,85 140,55 150,85" fill="#fed7aa"/>
        <!-- Squinting Sly Eyes & Black Nose -->
        <circle cx="210" cy="120" r="5" fill="#1e293b"/>
        <path d="M150,112 Q162,108 172,112" stroke="#1e293b" stroke-width="3" stroke-linecap="round"/>
        <!-- Strutting Front Leg -->
        <path d="M130,190 L160,260" stroke="#c2410c" stroke-width="14" stroke-linecap="round"/>
        <path d="M90,190 L75,260" stroke="#c2410c" stroke-width="14" stroke-linecap="round"/>
      </g>

      <!-- Giant Majestic Tiger Following Behind (纳闷好奇的大老虎) -->
      <g transform="translate(720, 260)" filter="url(#dropShadow)">
        <!-- Giant Powerful Body -->
        <ellipse cx="200" cy="240" rx="140" ry="110" fill="#f97316"/>
        <!-- Black Tiger Stripes -->
        <g fill="#1e293b">
          <path d="M140,160 L160,190 L135,210 Z"/>
          <path d="M200,150 L215,185 L195,200 Z"/>
          <path d="M260,165 L275,195 L255,215 Z"/>
        </g>
        <!-- Powerful Legs -->
        <rect x="110" y="310" width="45" height="120" rx="16" fill="#ea580c"/>
        <rect x="250" y="310" width="45" height="120" rx="16" fill="#ea580c"/>

        <!-- Massive Tiger Head Looking Confused at Woodland Animals Fleeing -->
        <circle cx="80" cy="160" r="75" fill="#f97316"/>
        <!-- White Muzzle -->
        <ellipse cx="60" cy="190" rx="45" ry="32" fill="#ffffff"/>
        <!-- Rounded Ears -->
        <circle cx="30" cy="100" r="24" fill="#f97316"/>
        <circle cx="30" cy="100" r="14" fill="#ffffff"/>
        <circle cx="125" cy="100" r="24" fill="#f97316"/>
        <circle cx="125" cy="100" r="14" fill="#ffffff"/>
        <!-- Chinese Character 王 on Tiger Forehead -->
        <g stroke="#1e293b" stroke-width="5" stroke-linecap="round" fill="none">
          <line x1="60" y1="120" x2="95" y2="120"/>
          <line x1="65" y1="132" x2="90" y2="132"/>
          <line x1="58" y1="145" x2="98" y2="145"/>
          <line x1="78" y1="120" x2="78" y2="145"/>
        </g>
        <!-- Wide Curious Eyes (好奇纳闷的眼神) -->
        <circle cx="50" cy="165" r="12" fill="#fef08a"/>
        <circle cx="50" cy="165" r="6" fill="#1e293b"/>
        <circle cx="95" cy="165" r="12" fill="#fef08a"/>
        <circle cx="95" cy="165" r="6" fill="#1e293b"/>
        <polygon points="50,195 70,195 60,205" fill="#ef4444"/>
      </g>

      <!-- Frightened Little Animals in Forest Edge (被吓跑的小鹿与小兔) -->
      <g transform="translate(180, 520)" filter="url(#dropShadow)">
        <ellipse cx="40" cy="50" rx="25" ry="18" fill="#ffffff"/>
        <circle cx="55" cy="35" r="12" fill="#ffffff"/>
        <ellipse cx="50" cy="15" rx="4" ry="14" fill="#fda4af"/>
        <circle cx="60" cy="32" r="2.5" fill="#be123c"/>
      </g>

      <!-- Red Chinese Seal (威) with Vector Path -->
      <g transform="translate(1220, 80)" filter="url(#dropShadow)">
        <rect x="0" y="0" width="55" height="55" rx="8" fill="#dc2626"/>
        <g stroke="#ffffff" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" fill="none">
          <line x1="14" y1="18" x2="38" y2="18"/>
          <path d="M22,18 L18,44"/>
          <path d="M22,26 L38,26 L38,36 L24,36"/>
          <line x1="28" y1="14" x2="38" y2="44"/>
          <circle cx="36" cy="14" r="1.5" fill="#ffffff"/>
        </g>
      </g>
    `
  },

  // ==========================================
  // 8. IDIOM: 井底之蛙 (石井底、仰望圆天、小青蛙)
  // ==========================================
  {
    id: "idiom_jingdizhiwa",
    title: "井底之蛙",
    defs: `
      <radialGradient id="well_opening" cx="50%" cy="50%" r="50%">
        <stop offset="0%" stop-color="#38bdf8"/>
        <stop offset="70%" stop-color="#0284c7"/>
        <stop offset="100%" stop-color="#0f172a"/>
      </radialGradient>
      <linearGradient id="stone_brick" x1="0%" y1="0%" x2="0%" y2="100%">
        <stop offset="0%" stop-color="#475569"/>
        <stop offset="100%" stop-color="#1e293b"/>
      </linearGradient>
    `,
    content: `
      <!-- Looking up from Bottom of Well (井内石壁透视构图) -->
      <rect width="1376" height="768" fill="#0f172a"/>

      <!-- Circular Opening of Well Looking Up at Blue Sky (一弯圆圆的天空) -->
      <circle cx="688" cy="280" r="220" fill="url(#well_opening)" filter="url(#softGlow)"/>
      <!-- Drifting White Cloud in Well Sky -->
      <g fill="#ffffff" opacity="0.9">
        <ellipse cx="660" cy="260" rx="70" ry="24"/>
        <ellipse cx="700" cy="245" rx="55" ry="28"/>
      </g>
      <!-- A Little Flying Swallow across Well Opening -->
      <path d="M620,220 Q635,215 650,225 Q640,230 635,225 Z" fill="#0f172a"/>

      <!-- Ring of Ancient Well Stones & Lush Moss Around Opening -->
      <path d="M688,280 M420,280 A268,268 0 1 0 956,280 A268,268 0 1 0 420,280 Z M688,280 M468,280 A220,220 0 1 1 908,280 A220,220 0 1 1 468,280 Z" fill="#334155" fill-rule="evenodd"/>
      <!-- Stone Brick Grooves -->
      <circle cx="688" cy="280" r="250" fill="none" stroke="#1e293b" stroke-width="12" stroke-dasharray="80,20"/>
      <!-- Drooping Green Ferns & Moss at Well Top -->
      <g fill="#16a34a" opacity="0.85">
        <path d="M520,120 Q540,180 530,220 Q515,170 520,120 Z"/>
        <path d="M840,140 Q830,190 845,230 Q855,180 840,140 Z"/>
      </g>

      <!-- Bottom of Well with Clear Puddle & Flat River Pebble -->
      <ellipse cx="688" cy="620" rx="540" ry="140" fill="#0369a1" opacity="0.6"/>
      <ellipse cx="688" cy="630" rx="280" ry="70" fill="#64748b" stroke="#475569" stroke-width="8"/>

      <!-- Happy Chubby Green Frog Sitting on Rock (怡然自乐的井底青蛙) -->
      <g transform="translate(618, 480)" filter="url(#dropShadow)">
        <!-- Frog Body -->
        <ellipse cx="70" cy="95" rx="65" ry="52" fill="#22c55e"/>
        <!-- Soft Yellow Belly -->
        <ellipse cx="70" cy="105" rx="42" ry="35" fill="#fef08a"/>
        <!-- Big Round Eyes Gazing Upwards -->
        <circle cx="40" cy="50" r="22" fill="#22c55e"/>
        <circle cx="100" cy="50" r="22" fill="#22c55e"/>
        <circle cx="40" cy="48" r="15" fill="#ffffff"/>
        <circle cx="100" cy="48" r="15" fill="#ffffff"/>
        <circle cx="42" cy="42" r="8" fill="#1e293b"/>
        <circle cx="98" cy="42" r="8" fill="#1e293b"/>
        <circle cx="44" cy="40" r="2.5" fill="#ffffff"/>
        <circle cx="100" cy="40" r="2.5" fill="#ffffff"/>
        <!-- Big Contented Smile (心满意足的大嘴巴) -->
        <path d="M35,90 Q70,120 105,90" fill="none" stroke="#15803d" stroke-width="5" stroke-linecap="round"/>
        <!-- Rosy Cheeks -->
        <circle cx="32" cy="85" r="9" fill="#fda4af" opacity="0.7"/>
        <circle cx="108" cy="85" r="9" fill="#fda4af" opacity="0.7"/>
        <!-- Cute Webbed Paws -->
        <ellipse cx="20" cy="130" rx="18" ry="8" fill="#16a34a"/>
        <ellipse cx="120" cy="130" rx="18" ry="8" fill="#16a34a"/>
      </g>

      <!-- Water Droplets Falling into Well Ripple -->
      <g filter="url(#softGlow)">
        <circle cx="460" cy="580" r="5" fill="#38bdf8"/>
        <ellipse cx="460" cy="610" rx="30" ry="10" fill="none" stroke="#38bdf8" stroke-width="2"/>
      </g>

      <!-- Red Chinese Seal (井) with Vector Path -->
      <g transform="translate(1220, 80)" filter="url(#dropShadow)">
        <rect x="0" y="0" width="55" height="55" rx="8" fill="#dc2626"/>
        <g stroke="#ffffff" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" fill="none">
          <line x1="15" y1="22" x2="40" y2="22"/>
          <line x1="14" y1="33" x2="41" y2="33"/>
          <line x1="22" y1="14" x2="22" y2="42"/>
          <line x1="33" y1="14" x2="33" y2="42"/>
        </g>
      </g>
    `
  },

  // ==========================================
  // 9. IDIOM: 盲人摸象 (温顺大象、四位古代智者抚摸各个部位)
  // ==========================================
  {
    id: "idiom_mangrenmoxiang",
    title: "盲人摸象",
    defs: `
      <linearGradient id="sky_mx" x1="0%" y1="0%" x2="0%" y2="100%">
        <stop offset="0%" stop-color="#fef08a"/>
        <stop offset="50%" stop-color="#fed7aa"/>
        <stop offset="100%" stop-color="#e0f2fe"/>
      </linearGradient>
    `,
    content: `
      <!-- Ancient City Square Setting -->
      <rect width="1376" height="768" fill="url(#sky_mx)"/>
      <path d="M0,480 L1376,480 L1376,768 L0,768 Z" fill="#cbd5e1"/>

      <!-- Gentle Enormous Elephant in Center (温顺巨大的大象) -->
      <g transform="translate(380, 220)" filter="url(#dropShadow)">
        <!-- Massive Body -->
        <ellipse cx="320" cy="220" rx="220" ry="160" fill="#94a3b8"/>
        <!-- Broad Ear (大如蒲扇的耳朵) -->
        <path d="M160,140 Q80,180 120,300 Q180,310 190,220 Z" fill="#64748b"/>
        <!-- Elephant Head & Trunk (长长的象鼻) -->
        <circle cx="160" cy="180" r="90" fill="#94a3b8"/>
        <path d="M120,220 Q60,340 40,420 Q70,430 90,360 Q110,300 130,240 Z" fill="#64748b"/>
        <!-- Curved White Tusk (如萝卜般光滑的白象牙) -->
        <path d="M140,250 Q120,320 60,340 Q110,310 150,265 Z" fill="#ffffff" stroke="#e2e8f0" stroke-width="2"/>
        <!-- Four Sturdy Pillar Legs (粗如大柱的四条腿) -->
        <rect x="180" y="320" width="60" height="180" rx="20" fill="#64748b"/>
        <rect x="270" y="320" width="55" height="170" rx="20" fill="#475569"/>
        <rect x="420" y="320" width="60" height="180" rx="20" fill="#64748b"/>
        <rect x="495" y="320" width="55" height="170" rx="20" fill="#475569"/>
        <!-- Tufted Tail (如绳子般的象尾) -->
        <path d="M530,220 Q560,320 550,380" stroke="#64748b" stroke-width="12" fill="none"/>
        <ellipse cx="550" cy="390" rx="10" ry="16" fill="#334155"/>
        <!-- Festive Red Saddle Cloth (红绸锦缎) -->
        <rect x="250" y="140" width="160" height="100" rx="10" fill="#dc2626"/>
        <rect x="260" y="150" width="140" height="80" rx="6" fill="#f59e0b"/>
      </g>

      <!-- Four Hanfu Scholars Touching Different Parts -->
      <!-- Scholar 1 Touching Tusk on Left: "像萝卜！" -->
      <g transform="translate(300, 420)" filter="url(#dropShadow)">
        <ellipse cx="50" cy="160" rx="35" ry="60" fill="#0284c7"/>
        <circle cx="50" cy="70" r="32" fill="#fed7aa"/>
        <ellipse cx="50" cy="45" rx="26" ry="14" fill="#1e293b"/>
        <!-- Hands Feeling the Tusk -->
        <path d="M50,120 Q80,100 120,95" stroke="#fed7aa" stroke-width="14" stroke-linecap="round"/>
        <!-- Closed Eyes Smiling in Wonder -->
        <path d="M42,68 Q50,74 58,68" stroke="#334155" stroke-width="3" stroke-linecap="round" fill="none"/>
      </g>

      <!-- Scholar 2 Touching Leg: "像大柱子！" -->
      <g transform="translate(600, 440)" filter="url(#dropShadow)">
        <ellipse cx="50" cy="160" rx="35" ry="60" fill="#16a34a"/>
        <circle cx="50" cy="70" r="32" fill="#fed7aa"/>
        <ellipse cx="50" cy="45" rx="26" ry="14" fill="#1e293b"/>
        <!-- Arms Hugging the Leg -->
        <path d="M30,120 Q-10,110 -30,100" stroke="#fed7aa" stroke-width="14" stroke-linecap="round"/>
        <path d="M42,68 Q50,74 58,68" stroke="#334155" stroke-width="3" stroke-linecap="round" fill="none"/>
      </g>

      <!-- Scholar 3 Holding Tail on Right: "像草绳！" -->
      <g transform="translate(970, 430)" filter="url(#dropShadow)">
        <ellipse cx="50" cy="160" rx="35" ry="60" fill="#ea580c"/>
        <circle cx="50" cy="70" r="32" fill="#fed7aa"/>
        <ellipse cx="50" cy="45" rx="26" ry="14" fill="#1e293b"/>
        <!-- Arm Holding Tail -->
        <path d="M40,120 Q-10,130 -40,150" stroke="#fed7aa" stroke-width="14" stroke-linecap="round"/>
        <path d="M42,68 Q50,74 58,68" stroke="#334155" stroke-width="3" stroke-linecap="round" fill="none"/>
      </g>

      <!-- Red Chinese Seal (象) with Vector Path -->
      <g transform="translate(1220, 80)" filter="url(#dropShadow)">
        <rect x="0" y="0" width="55" height="55" rx="8" fill="#dc2626"/>
        <g stroke="#ffffff" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" fill="none">
          <line x1="22" y1="14" x2="33" y2="14"/>
          <line x1="16" y1="20" x2="39" y2="20"/>
          <path d="M22,20 L16,36"/>
          <path d="M22,26 L36,26 L36,34 L22,34"/>
          <path d="M28,26 L24,44"/>
          <path d="M34,34 L38,44"/>
        </g>
      </g>
    `
  },

  // ==========================================
  // 10. IDIOM: 塞翁失马 (边塞烽火台、长者微笑着迎回骏马)
  // ==========================================
  {
    id: "idiom_saiwengshima",
    title: "塞翁失马",
    defs: `
      <linearGradient id="sky_sw" x1="0%" y1="0%" x2="0%" y2="100%">
        <stop offset="0%" stop-color="#38bdf8"/>
        <stop offset="60%" stop-color="#fed7aa"/>
        <stop offset="100%" stop-color="#fef08a"/>
      </linearGradient>
    `,
    content: `
      <!-- Vast Northern Frontier Sky (塞北长空) -->
      <rect width="1376" height="768" fill="url(#sky_sw)"/>
      <circle cx="240" cy="180" r="70" fill="#fde047" filter="url(#softGlow)"/>

      <!-- Ancient Great Wall Beacon Tower in Distance (塞上烽火台) -->
      <g filter="url(#dropShadow)">
        <path d="M0,420 Q360,340 700,390 T1376,340 L1376,768 L0,768 Z" fill="#ca8a04" opacity="0.6"/>
        <!-- Great Wall Silhouette on Ridge -->
        <path d="M960,340 L1280,300 L1280,340 L960,380 Z" fill="#78350f"/>
        <rect x="1100" y="270" width="60" height="50" fill="#78350f"/>
        <rect x="1115" y="255" width="30" height="15" fill="#78350f"/>
      </g>

      <!-- Broad Grassland Foreground -->
      <path d="M0,520 Q480,440 960,500 T1376,460 L1376,768 L0,768 Z" fill="#84cc16"/>

      <!-- Two Splendid Galloping Horses Returning (不仅回来了，还带回一匹胡人骏马) -->
      <!-- White Steed (白马) -->
      <g transform="translate(680, 360)" filter="url(#dropShadow)">
        <!-- Horse Body -->
        <ellipse cx="140" cy="120" rx="90" ry="55" fill="#ffffff"/>
        <!-- Galloping Legs -->
        <path d="M80,150 L50,260 M100,150 L120,250" stroke="#f1f5f9" stroke-width="16" stroke-linecap="round"/>
        <path d="M190,150 L220,250 M170,150 L150,260" stroke="#f1f5f9" stroke-width="16" stroke-linecap="round"/>
        <!-- Graceful Arching Neck & Head -->
        <path d="M190,110 Q240,60 250,20 Q230,10 200,60 Z" fill="#ffffff"/>
        <circle cx="240" cy="30" r="18" fill="#ffffff"/>
        <!-- Mane & Tail -->
        <path d="M220,30 Q180,50 170,100" fill="none" stroke="#e2e8f0" stroke-width="14"/>
        <path d="M60,110 Q20,130 10,180" fill="none" stroke="#e2e8f0" stroke-width="16"/>
        <!-- Red Festive Bridle (喜气洋洋的红缰绳) -->
        <circle cx="245" cy="30" r="3.5" fill="#1e293b"/>
        <line x1="235" y1="35" x2="250" y2="40" stroke="#ef4444" stroke-width="3"/>
      </g>

      <!-- Chestnut Steed (赤兔红鬃骏马) galloping alongside -->
      <g transform="translate(860, 390)" filter="url(#dropShadow)">
        <ellipse cx="130" cy="110" rx="80" ry="48" fill="#b45309"/>
        <path d="M70,140 L45,230 M90,140 L110,230" stroke="#9a3412" stroke-width="14" stroke-linecap="round"/>
        <path d="M180,140 L200,230 M160,140 L140,235" stroke="#9a3412" stroke-width="14" stroke-linecap="round"/>
        <path d="M180,100 Q220,50 230,20 Q210,10 180,50 Z" fill="#b45309"/>
        <circle cx="225" cy="25" r="16" fill="#b45309"/>
        <path d="M200,25 Q170,45 160,90" fill="none" stroke="#78350f" stroke-width="12"/>
      </g>

      <!-- Wise Old Border Elder (塞翁) Smiling Calmly (安之若素、智慧豁达) -->
      <g transform="translate(320, 360)" filter="url(#dropShadow)">
        <!-- Coarse Warm Winter Robes -->
        <path d="M60,170 Q100,240 140,170 L150,360 L40,360 Z" fill="#0369a1"/>
        <!-- Kind Face with Long Snow-White Beard -->
        <circle cx="100" cy="110" r="38" fill="#fed7aa"/>
        <!-- Headwrap -->
        <ellipse cx="100" cy="85" rx="34" ry="16" fill="#334155"/>
        <!-- Smiling Eyes (笑看风云) -->
        <path d="M85,108 Q92,114 100,108" stroke="#334155" stroke-width="3" stroke-linecap="round" fill="none"/>
        <path d="M108,108 Q115,114 122,108" stroke="#334155" stroke-width="3" stroke-linecap="round" fill="none"/>
        <!-- Long White Flowing Beard -->
        <path d="M85,130 Q105,220 110,240 Q115,220 125,130 Z" fill="#f8fafc"/>
        <!-- Leaning Gracefully on Bamboo Walking Staff (竹杖) -->
        <line x1="160" y1="130" x2="160" y2="360" stroke="#78350f" stroke-width="10" stroke-linecap="round"/>
        <circle cx="160" cy="130" r="12" fill="#92400e"/>
      </g>

      <!-- Red Chinese Seal (马) with Vector Path -->
      <g transform="translate(1220, 80)" filter="url(#dropShadow)">
        <rect x="0" y="0" width="55" height="55" rx="8" fill="#dc2626"/>
        <g stroke="#ffffff" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" fill="none">
          <line x1="16" y1="16" x2="36" y2="16"/>
          <line x1="26" y1="16" x2="26" y2="28"/>
          <line x1="18" y1="22" x2="36" y2="22"/>
          <line x1="18" y1="28" x2="36" y2="28"/>
          <path d="M18,34 L38,34 L38,42 L34,42"/>
          <circle cx="20" cy="42" r="1.5" fill="#ffffff"/>
          <circle cx="26" cy="42" r="1.5" fill="#ffffff"/>
        </g>
      </g>
    `
  },

  // ==========================================
  // 11. IDIOM: 闻鸡起舞 (破晓晨曦、雄鸡报晓、少年舞剑)
  // ==========================================
  {
    id: "idiom_wenjiciwu",
    title: "闻鸡起舞",
    defs: `
      <linearGradient id="sky_wj" x1="0%" y1="0%" x2="0%" y2="100%">
        <stop offset="0%" stop-color="#4338ca"/>
        <stop offset="50%" stop-color="#f43f5e"/>
        <stop offset="100%" stop-color="#fef08a"/>
      </linearGradient>
    `,
    content: `
      <!-- Magnificent Dawn Breaking Sky (破晓拂晓晨光) -->
      <rect width="1376" height="768" fill="url(#sky_wj)"/>

      <!-- Morning Star Still Glowing (晨星闪耀) -->
      <g fill="#ffffff" filter="url(#softGlow)">
        <circle cx="280" cy="140" r="6"/>
        <line x1="280" y1="120" x2="280" y2="160" stroke="#ffffff" stroke-width="2"/>
        <line x1="260" y1="140" x2="300" y2="140" stroke="#ffffff" stroke-width="2"/>
      </g>

      <!-- Ancient Pine & Thatched Roof on Left (农家屋脊) -->
      <g filter="url(#dropShadow)">
        <polygon points="120,440 280,340 440,440" fill="#78350f"/>
        <path d="M100,440 L280,330 L460,440" stroke="#ca8a04" stroke-width="20" stroke-linecap="round"/>

        <!-- Proud Golden Rooster Standing on Roof Crowing (雄鸡高唱报晓) -->
        <g transform="translate(240, 210)">
          <!-- Rooster Body -->
          <ellipse cx="60" cy="70" rx="35" ry="26" fill="#ea580c"/>
          <!-- Fiery Crest / Comb (大红鸡冠) -->
          <path d="M70,30 C70,15 85,15 85,30 C85,15 100,15 100,35 Z" fill="#ef4444"/>
          <!-- Head & Beak Crowing Upwards -->
          <circle cx="85" cy="45" r="18" fill="#f59e0b"/>
          <polygon points="98,40 120,45 98,52" fill="#fde047"/>
          <circle cx="85" cy="42" r="3" fill="#1e293b"/>
          <!-- Magnificent Emerald-Black Tail Feathers (翠羽锦尾) -->
          <path d="M40,65 Q0,40 -20,10 Q20,35 40,55" fill="none" stroke="#047857" stroke-width="12" stroke-linecap="round"/>
          <path d="M40,70 Q-10,60 -30,40 Q10,55 40,65" fill="none" stroke="#0284c7" stroke-width="10" stroke-linecap="round"/>
          <!-- Golden Legs -->
          <line x1="55" y1="95" x2="55" y2="120" stroke="#f59e0b" stroke-width="6"/>
          <line x1="70" y1="95" x2="70" y2="120" stroke="#f59e0b" stroke-width="6"/>
        </g>
      </g>

      <!-- Courtyard Ground & Plum Blossom Tree -->
      <path d="M0,540 Q688,480 1376,540 L1376,768 L0,768 Z" fill="#334155"/>
      <!-- Pink Plum Blossoms on Right Branch -->
      <g filter="url(#dropShadow)">
        <path d="M1376,320 Q1180,360 1080,480" fill="none" stroke="#78350f" stroke-width="16" stroke-linecap="round"/>
        <circle cx="1140" cy="410" r="12" fill="#f43f5e"/><circle cx="1220" cy="360" r="14" fill="#f43f5e"/>
        <circle cx="1090" cy="470" r="10" fill="#f43f5e"/>
      </g>

      <!-- Diligent Chinese Youth (祖逖) Practicing Sword Dance with Vigour (少年豪气剑舞) -->
      <g transform="translate(680, 320)" filter="url(#dropShadow)">
        <!-- Dynamic Martial Arts Stance (弓步跃动) -->
        <path d="M80,240 L30,340 M140,240 L210,330" stroke="#1e3a8a" stroke-width="26" stroke-linecap="round"/>
        <!-- Snug Martial Tunic (武术劲装) with Red Sash -->
        <path d="M70,130 Q110,110 150,130 L160,250 L60,250 Z" fill="#2563eb"/>
        <rect x="65" y="210" width="90" height="22" rx="4" fill="#dc2626"/>
        <!-- Dynamic Flowing Red Sash Tassel -->
        <path d="M70,225 Q40,260 20,300" stroke="#dc2626" stroke-width="10" fill="none"/>

        <!-- Handsome Concentrated Face -->
        <circle cx="110" cy="85" r="36" fill="#fed7aa"/>
        <!-- High Ponytail Hair Knot (利落发髻与红色发带) -->
        <circle cx="110" cy="55" r="24" fill="#1e293b"/>
        <path d="M125,55 Q160,40 180,65" stroke="#1e293b" stroke-width="14" fill="none"/>
        <circle cx="125" cy="55" r="7" fill="#ef4444"/>

        <!-- Sharp Focused Heroic Eyes (神采奕奕的眼神) -->
        <circle cx="120" cy="85" r="4.5" fill="#1e293b"/>
        <circle cx="122" cy="83" r="1.5" fill="#ffffff"/>
        <!-- Confident Firm Mouth -->
        <line x1="112" y1="105" x2="124" y2="105" stroke="#b91c1c" stroke-width="3"/>

        <!-- Right Arm Wielding Gleaming Ancient Chinese Straight Sword (宝剑生辉) -->
        <path d="M140,150 L220,110" stroke="#fed7aa" stroke-width="16" stroke-linecap="round"/>
        <!-- Sword Blade & Hilt -->
        <rect x="210" y="100" width="25" height="12" rx="3" fill="#f59e0b"/>
        <line x1="225" y1="105" x2="380" y2="50" stroke="#ffffff" stroke-width="8" stroke-linecap="round" filter="url(#softGlow)"/>
        <!-- Sword Tassel Swirling (青色剑穗) -->
        <path d="M210,110 Q190,140 180,180" stroke="#06b6d4" stroke-width="6" fill="none"/>
      </g>

      <!-- Red Chinese Seal (舞) with Vector Path -->
      <g transform="translate(1220, 80)" filter="url(#dropShadow)">
        <rect x="0" y="0" width="55" height="55" rx="8" fill="#dc2626"/>
        <g stroke="#ffffff" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" fill="none">
          <line x1="16" y1="16" x2="38" y2="16"/>
          <line x1="18" y1="23" x2="36" y2="23"/>
          <line x1="22" y1="16" x2="22" y2="30"/>
          <line x1="32" y1="16" x2="32" y2="30"/>
          <line x1="14" y1="30" x2="41" y2="30"/>
          <path d="M24,30 L18,44"/>
          <path d="M28,30 L38,44"/>
        </g>
      </g>
    `
  },

  // ==========================================
  // 12. IDIOM: 水滴石穿 (山泉清幽、青石滴水成窝)
  // ==========================================
  {
    id: "idiom_shuidishichuan",
    title: "水滴石穿",
    defs: `
      <linearGradient id="cave_bg" x1="0%" y1="0%" x2="0%" y2="100%">
        <stop offset="0%" stop-color="#0f172a"/>
        <stop offset="60%" stop-color="#1e293b"/>
        <stop offset="100%" stop-color="#334155"/>
      </linearGradient>
      <linearGradient id="spring_water" x1="0%" y1="0%" x2="0%" y2="100%">
        <stop offset="0%" stop-color="#38bdf8"/>
        <stop offset="100%" stop-color="#0284c7"/>
      </linearGradient>
    `,
    content: `
      <!-- Serene Mountain Spring Cave (幽静清澈的山洞清泉) -->
      <rect width="1376" height="768" fill="url(#cave_bg)"/>

      <!-- Distant Waterfall Silvery Cascade -->
      <g filter="url(#softGlow)" opacity="0.3">
        <path d="M980,120 L990,480 L940,480 L950,120 Z" fill="#e0f2fe"/>
      </g>

      <!-- Cave Ceiling Rocks & Bamboo Water Spout (翠竹引泉水) -->
      <g filter="url(#dropShadow)">
        <path d="M0,0 L1376,0 L1376,160 Q1000,100 688,140 Q300,110 0,180 Z" fill="#1e293b"/>
        <!-- Natural Bamboo Conduit -->
        <path d="M180,80 Q420,130 680,180" stroke="#16a34a" stroke-width="24" stroke-linecap="round" fill="none"/>
        <g stroke="#14532d" stroke-width="4">
          <line x1="320" y1="95" x2="320" y2="125"/>
          <line x1="480" y1="125" x2="480" y2="155"/>
        </g>
      </g>

      <!-- Pure Mountain Water Basin (池潭清泉) -->
      <ellipse cx="688" cy="620" rx="580" ry="120" fill="url(#spring_water)" opacity="0.8"/>
      <!-- Soft Water Ripples Around Rock -->
      <ellipse cx="688" cy="560" rx="260" ry="45" fill="none" stroke="#e0f2fe" stroke-width="4" filter="url(#softGlow)"/>
      <ellipse cx="688" cy="560" rx="340" ry="60" fill="none" stroke="#bae6fd" stroke-width="2"/>

      <!-- The Grand Smooth River Boulder with Worn Hollow (坚固坚硬的青石与岁月穿孔) -->
      <g transform="translate(488, 380)" filter="url(#dropShadow)">
        <!-- Giant Boulder -->
        <path d="M40,160 Q80,40 200,40 Q320,40 360,160 Q340,240 200,250 Q60,240 40,160 Z" fill="#64748b"/>
        <!-- Smooth Shading Highlight -->
        <ellipse cx="200" cy="120" rx="140" ry="70" fill="#475569"/>
        <!-- The Water Hollow Center (水滴石穿的光滑水窝) -->
        <ellipse cx="200" cy="110" rx="45" ry="24" fill="#0284c7" stroke="#38bdf8" stroke-width="4"/>
        <ellipse cx="200" cy="110" rx="25" ry="12" fill="#0369a1"/>

        <!-- Velvet Green Moss Around Rock -->
        <g fill="#22c55e">
          <ellipse cx="70" cy="170" rx="30" ry="14"/>
          <ellipse cx="320" cy="180" rx="35" ry="16"/>
        </g>
      </g>

      <!-- Falling Crystal Droplets One by One (持之以恒的水滴) -->
      <g filter="url(#softGlow)">
        <!-- Droplet 1 just leaving bamboo tip -->
        <path d="M688,190 Q682,210 688,220 Q694,210 688,190 Z" fill="#38bdf8"/>
        <!-- Droplet 2 in mid air -->
        <path d="M688,290 Q680,315 688,328 Q696,315 688,290 Z" fill="#67e8f9"/>
        <!-- Droplet 3 about to hit the stone hole with sparkles -->
        <path d="M688,430 Q678,460 688,475 Q698,460 688,430 Z" fill="#ffffff"/>

        <!-- Splash / Crown Water Droplets at the Hollow (水花欢跃) -->
        <g fill="#ffffff">
          <circle cx="670" cy="485" r="4"/>
          <circle cx="706" cy="485" r="4"/>
          <circle cx="688" cy="478" r="5"/>
        </g>
      </g>

      <!-- Blooming Wild Mountain Orchids near Spring (幽谷幽兰) -->
      <g transform="translate(180, 520)" filter="url(#dropShadow)">
        <path d="M0,60 Q40,10 80,40" stroke="#16a34a" stroke-width="8" fill="none"/>
        <circle cx="80" cy="40" r="10" fill="#d8b4fe"/>
        <circle cx="70" cy="35" r="10" fill="#c084fc"/>
        <circle cx="85" cy="30" r="10" fill="#a855f7"/>
        <circle cx="78" cy="35" r="4" fill="#fef08a"/>
      </g>

      <!-- Red Chinese Seal (恒) with Vector Path -->
      <g transform="translate(1220, 80)" filter="url(#dropShadow)">
        <rect x="0" y="0" width="55" height="55" rx="8" fill="#dc2626"/>
        <g stroke="#ffffff" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" fill="none">
          <!-- 忄 radical -->
          <line x1="18" y1="14" x2="18" y2="42"/>
          <circle cx="13" cy="24" r="1.5" fill="#ffffff"/>
          <line x1="22" y1="22" x2="20" y2="28"/>
          <!-- 亘 radical -->
          <line x1="25" y1="18" x2="41" y2="18"/>
          <rect x="27" y="24" width="13" height="12"/>
          <line x1="27" y1="30" x2="40" y2="30"/>
          <line x1="24" y1="41" x2="42" y2="41"/>
        </g>
      </g>
    `
  }
];

console.log(`Generating ${ITEMS.length} illustrations (2 poems + 10 classic idioms)...`);

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

console.log("\nAll 12 illustrations generated successfully!");
