/**
 *  (Cathy Literacy) -  3D  (Native Vector Game Icons)
 * ----------------------------------------------------------------------------------
 *  Emoji 
 *  3A  SVG 
 */

export const GAME_ICONS = {
  // 1. 3D  (Cathy Star Coin)
  coin: (cls = "w-6 h-6") => `
    <svg viewBox="0 0 100 100" class="${cls} drop-shadow-[0_4px_8px_rgba(255,160,0,0.5)] select-none">
      <defs>
        <radialGradient id="gic_coin_bg" cx="35%" cy="30%" r="70%">
          <stop offset="0%" stop-color="#FFF9C4" />
          <stop offset="40%" stop-color="#FFD54F" />
          <stop offset="85%" stop-color="#FF8F00" />
          <stop offset="100%" stop-color="#E65100" />
        </radialGradient>
        <linearGradient id="gic_coin_rim" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stop-color="#FFE082" />
          <stop offset="100%" stop-color="#BF360C" />
        </linearGradient>
      </defs>
      <!--  -->
      <circle cx="50" cy="50" r="46" fill="url(#gic_coin_rim)" />
      <!--  -->
      <circle cx="50" cy="50" r="41" fill="url(#gic_coin_bg)" stroke="#FFE082" stroke-width="2" />
      <!--  -->
      <circle cx="50" cy="50" r="33" fill="none" stroke="#FFB300" stroke-width="2" stroke-dasharray="8 4" opacity="0.8" />
      <!--  -->
      <polygon points="50,22 58,38 76,40 62,53 66,71 50,61 34,71 38,53 24,40 42,38" fill="#FFF9C4" stroke="#FF6F00" stroke-width="2" stroke-linejoin="round" />
      <polygon points="50,25 56,38 70,40 59,50 62,65 50,57 38,65 41,50 30,40 44,38" fill="#FFE082" opacity="0.6" />
      <!--  -->
      <path d="M 22 35 A 35 35 0 0 1 70 20" fill="none" stroke="#FFFFFF" stroke-width="4" stroke-linecap="round" opacity="0.7" />
    </svg>
  `,

  // 2. 3D  (Crystal Star)
  star: (cls = "w-6 h-6", filled = true) => `
    <svg viewBox="0 0 100 100" class="${cls} drop-shadow-[0_4px_10px_rgba(255,215,0,0.6)] select-none">
      <defs>
        <linearGradient id="gic_star_fill" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stop-color="#FFF59D" />
          <stop offset="50%" stop-color="#FFCA28" />
          <stop offset="100%" stop-color="#FF6F00" />
        </linearGradient>
      </defs>
      ${
        filled
          ? `
        <!--  -->
        <polygon points="50,6 63,35 95,38 71,60 78,92 50,75 22,92 29,60 5,38 37,35" fill="url(#gic_star_fill)" stroke="#E65100" stroke-width="3" stroke-linejoin="round" />
        <!--  -->
        <polygon points="50,6 63,35 50,50 37,35" fill="#FFFFFF" opacity="0.6" />
        <polygon points="95,38 71,60 50,50 63,35" fill="#FFE082" opacity="0.5" />
        <polygon points="50,50 71,60 78,92 50,75" fill="#FF8F00" opacity="0.4" />
        <polygon points="50,50 50,75 22,92 29,60" fill="#E65100" opacity="0.3" />
        <polygon points="5,38 37,35 50,50 29,60" fill="#FFF9C4" opacity="0.7" />
      `
          : `
        <!--  -->
        <polygon points="50,6 63,35 95,38 71,60 78,92 50,75 22,92 29,60 5,38 37,35" fill="rgba(255,255,255,0.15)" stroke="rgba(255,255,255,0.4)" stroke-width="3" stroke-linejoin="round" />
      `
      }
    </svg>
  `,

  // 3.  (Heraldic Shield Lock)
  shieldLock: (cls = "w-6 h-6") => `
    <svg viewBox="0 0 100 100" class="${cls} drop-shadow-[0_4px_10px_rgba(0,0,0,0.4)] select-none">
      <defs>
        <linearGradient id="gic_shield_grad" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stop-color="#FFA726" />
          <stop offset="50%" stop-color="#FB8C00" />
          <stop offset="100%" stop-color="#E65100" />
        </linearGradient>
      </defs>
      <!--  -->
      <path d="M 50 6 L 88 20 C 88 58 50 94 50 94 C 50 94 12 58 12 20 Z" fill="url(#gic_shield_grad)" stroke="#FFF3E0" stroke-width="4" stroke-linejoin="round" />
      <!--  -->
      <path d="M 50 14 L 80 26 C 80 54 50 84 50 84 C 50 84 20 54 20 26 Z" fill="#BF360C" opacity="0.85" />
      <!--  -->
      <path d="M 38 42 L 38 32 C 38 24 62 24 62 32 L 62 42" fill="none" stroke="#FFE082" stroke-width="6" stroke-linecap="round" />
      <!--  -->
      <rect x="32" y="42" width="36" height="28" rx="7" fill="#FFCA28" stroke="#E65100" stroke-width="3" />
      <!--  -->
      <circle cx="50" cy="52" r="4" fill="#3E2723" />
      <polygon points="48,54 52,54 54,63 46,63" fill="#3E2723" />
    </svg>
  `,

  // 4.  (Cozy Home)
  home: (cls = "w-6 h-6") => `
    <svg viewBox="0 0 100 100" class="${cls} drop-shadow-[0_4px_8px_rgba(0,0,0,0.3)] select-none">
      <defs>
        <linearGradient id="gic_roof_grad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stop-color="#FF7043" />
          <stop offset="100%" stop-color="#D84315" />
        </linearGradient>
        <linearGradient id="gic_wall_grad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stop-color="#FFF8E1" />
          <stop offset="100%" stop-color="#FFE082" />
        </linearGradient>
      </defs>
      <!--  -->
      <rect x="68" y="18" width="12" height="24" rx="2" fill="#8D6E63" stroke="#4E342E" stroke-width="2" />
      <ellipse cx="74" cy="18" rx="6" ry="2" fill="#D7CCC8" />
      <!--  -->
      <rect x="22" y="48" width="56" height="42" rx="6" fill="url(#gic_wall_grad)" stroke="#8D6E63" stroke-width="3" />
      <!--  -->
      <rect x="42" y="60" width="16" height="30" rx="3" fill="#6D4C41" stroke="#3E2723" stroke-width="2" />
      <circle cx="54" cy="76" r="2.5" fill="#FFD54F" />
      <!--  -->
      <polygon points="50,12 88,48 12,48" fill="url(#gic_roof_grad)" stroke="#BF360C" stroke-width="4" stroke-linejoin="round" />
      <!--  -->
      <circle cx="50" cy="34" r="7" fill="#81D4FA" stroke="#FFFFFF" stroke-width="2" />
    </svg>
  `,

  // 5.  (Magic Speaker)
  speaker: (cls = "w-6 h-6", muted = false) => `
    <svg viewBox="0 0 100 100" class="${cls} drop-shadow-[0_4px_8px_rgba(0,0,0,0.35)] select-none">
      <defs>
        <linearGradient id="gic_spk_grad" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stop-color="#FFE082" />
          <stop offset="60%" stop-color="#FFB300" />
          <stop offset="100%" stop-color="#FF6F00" />
        </linearGradient>
      </defs>
      <!--  -->
      <rect x="15" y="36" width="18" height="28" rx="4" fill="url(#gic_spk_grad)" stroke="#E65100" stroke-width="3" />
      <!--  -->
      <polygon points="33,36 68,16 68,84 33,64" fill="url(#gic_spk_grad)" stroke="#E65100" stroke-width="3" stroke-linejoin="round" />
      ${
        muted
          ? `
        <!--  -->
        <line x1="72" y1="35" x2="94" y2="65" stroke="#F44336" stroke-width="7" stroke-linecap="round" />
        <line x1="94" y1="35" x2="72" y2="65" stroke="#F44336" stroke-width="7" stroke-linecap="round" />
      `
          : `
        <!--  -->
        <path d="M 76 36 A 16 16 0 0 1 76 64" fill="none" stroke="#FFF9C4" stroke-width="5" stroke-linecap="round" />
        <path d="M 85 26 A 28 28 0 0 1 85 74" fill="none" stroke="#FFD54F" stroke-width="5" stroke-linecap="round" />
      `
      }
    </svg>
  `,

  // 6.  3D  (Royal Treasure Chest)
  chest: (cls = "w-10 h-10") => `
    <svg viewBox="0 0 100 100" class="${cls} drop-shadow-[0_8px_16px_rgba(255,160,0,0.55)] select-none">
      <defs>
        <linearGradient id="gic_chest_body" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stop-color="#A1602B" />
          <stop offset="100%" stop-color="#5E3110" />
        </linearGradient>
        <linearGradient id="gic_chest_gold" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stop-color="#FFF59D" />
          <stop offset="50%" stop-color="#FFCA28" />
          <stop offset="100%" stop-color="#E65100" />
        </linearGradient>
      </defs>
      <!--  -->
      <rect x="12" y="44" width="76" height="46" rx="8" fill="url(#gic_chest_body)" stroke="#3E1E07" stroke-width="3" />
      <!--  -->
      <path d="M 12 44 Q 50 14 88 44 Z" fill="url(#gic_chest_body)" stroke="#3E1E07" stroke-width="3" />
      <!--  -->
      <path d="M 12 44 Q 50 14 88 44" fill="none" stroke="url(#gic_chest_gold)" stroke-width="8" stroke-linecap="round" />
      <rect x="10" y="42" width="80" height="7" rx="3" fill="url(#gic_chest_gold)" stroke="#FF6F00" stroke-width="1.5" />
      <rect x="22" y="44" width="9" height="46" fill="url(#gic_chest_gold)" />
      <rect x="69" y="44" width="9" height="46" fill="url(#gic_chest_gold)" />
      <!--  -->
      <rect x="43" y="42" width="14" height="20" rx="3" fill="url(#gic_chest_gold)" stroke="#BF360C" stroke-width="2" />
      <circle cx="50" cy="52" r="4.5" fill="#E53935" stroke="#FFFFFF" stroke-width="1" />
    </svg>
  `,

  // 7.  (Royal Crown)
  crown: (cls = "w-6 h-6") => `
    <svg viewBox="0 0 100 100" class="${cls} drop-shadow-[0_4px_10px_rgba(255,215,0,0.6)] select-none">
      <defs>
        <linearGradient id="gic_crown_gold" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stop-color="#FFF9C4" />
          <stop offset="45%" stop-color="#FFD54F" />
          <stop offset="100%" stop-color="#FF8F00" />
        </linearGradient>
      </defs>
      <!--  -->
      <path d="M 10 74 L 18 28 L 36 48 L 50 16 L 64 48 L 82 28 L 90 74 Z" fill="url(#gic_crown_gold)" stroke="#E65100" stroke-width="3" stroke-linejoin="round" />
      <!--  -->
      <rect x="8" y="72" width="84" height="14" rx="5" fill="url(#gic_crown_gold)" stroke="#E65100" stroke-width="3" />
      <!--  -->
      <circle cx="18" cy="26" r="4.5" fill="#FFFFFF" stroke="#FF8F00" stroke-width="1.5" />
      <circle cx="50" cy="14" r="6" fill="#FFFFFF" stroke="#FF8F00" stroke-width="1.5" />
      <circle cx="82" cy="26" r="4.5" fill="#FFFFFF" stroke="#FF8F00" stroke-width="1.5" />
      <!--  -->
      <circle cx="30" cy="79" r="3.5" fill="#00E676" />
      <circle cx="50" cy="79" r="4.5" fill="#E53935" />
      <circle cx="70" cy="79" r="3.5" fill="#2979FF" />
    </svg>
  `,

  // 8.  (Storybook)
  book: (cls = "w-6 h-6") => `
    <svg viewBox="0 0 100 100" class="${cls} drop-shadow-[0_4px_8px_rgba(0,0,0,0.35)] select-none">
      <defs>
        <linearGradient id="gic_book_cover" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stop-color="#4CAF50" />
          <stop offset="100%" stop-color="#1B5E20" />
        </linearGradient>
      </defs>
      <!--  -->
      <path d="M 10 78 Q 50 88 90 78 L 90 28 Q 50 38 10 28 Z" fill="#FFFDE7" stroke="#8D6E63" stroke-width="2" />
      <!--  -->
      <path d="M 50 34 Q 28 24 10 28 L 10 78 Q 28 74 50 82 Z" fill="#FFFFFF" stroke="#D7CCC8" stroke-width="1.5" />
      <!--  -->
      <path d="M 50 34 Q 72 24 90 28 L 90 78 Q 72 74 50 82 Z" fill="#FFF9C4" stroke="#D7CCC8" stroke-width="1.5" />
      <!--  -->
      <line x1="50" y1="30" x2="50" y2="86" stroke="#4E342E" stroke-width="3.5" />
      <path d="M 50 34 L 58 48 L 50 44 L 42 48 Z" fill="#E53935" />
      <!--  -->
      <line x1="18" y1="44" x2="42" y2="40" stroke="#B0BEC5" stroke-width="2" stroke-linecap="round" />
      <line x1="18" y1="54" x2="38" y2="50" stroke="#B0BEC5" stroke-width="2" stroke-linecap="round" />
      <line x1="58" y1="40" x2="82" y2="44" stroke="#B0BEC5" stroke-width="2" stroke-linecap="round" />
      <line x1="62" y1="50" x2="82" y2="54" stroke="#B0BEC5" stroke-width="2" stroke-linecap="round" />
    </svg>
  `,

  // 9. 3D  (Flashcard)
  cards: (cls = "w-6 h-6") => `
    <svg viewBox="0 0 100 100" class="${cls} drop-shadow-[0_4px_8px_rgba(0,0,0,0.35)] select-none">
      <defs>
        <linearGradient id="gic_card_back" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stop-color="#42A5F5" />
          <stop offset="100%" stop-color="#1565C0" />
        </linearGradient>
        <linearGradient id="gic_card_front" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stop-color="#FFF9C4" />
          <stop offset="100%" stop-color="#FFD54F" />
        </linearGradient>
      </defs>
      <!--  -->
      <rect x="26" y="10" width="58" height="74" rx="8" transform="rotate(12 55 47)" fill="url(#gic_card_back)" stroke="#0D47A1" stroke-width="3" />
      <!--  -->
      <rect x="14" y="16" width="58" height="74" rx="8" fill="url(#gic_card_front)" stroke="#FF8F00" stroke-width="3.5" />
      <!--  -->
      <rect x="22" y="24" width="42" height="58" rx="5" fill="#FFFFFF" stroke="#FFE082" stroke-width="2" />
      <text x="43" y="62" font-family="'PingFang SC', sans-serif" font-weight="900" font-size="28" fill="#E65100" text-anchor="middle"></text>
    </svg>
  `,

  // 10.  (Arcade Ferris Wheel)
  arcade: (cls = "w-6 h-6") => `
    <svg viewBox="0 0 100 100" class="${cls} drop-shadow-[0_4px_8px_rgba(156,39,176,0.45)] select-none">
      <defs>
        <linearGradient id="gic_ferris_grad" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stop-color="#BA68C8" />
          <stop offset="100%" stop-color="#6A1B9A" />
        </linearGradient>
      </defs>
      <!--  -->
      <polygon points="50,44 26,92 74,92" fill="none" stroke="#AB47BC" stroke-width="5" stroke-linejoin="round" />
      <line x1="18" y1="92" x2="82" y2="92" stroke="#4A148C" stroke-width="5" stroke-linecap="round" />
      <!--  -->
      <circle cx="50" cy="44" r="32" fill="none" stroke="url(#gic_ferris_grad)" stroke-width="4" />
      <!--  -->
      <line x1="50" y1="12" x2="50" y2="76" stroke="#CE93D8" stroke-width="2.5" />
      <line x1="18" y1="44" x2="82" y2="44" stroke="#CE93D8" stroke-width="2.5" />
      <line x1="27" y1="21" x2="73" y2="67" stroke="#CE93D8" stroke-width="2.5" />
      <line x1="27" y1="67" x2="73" y2="21" stroke="#CE93D8" stroke-width="2.5" />
      <!--  (6) -->
      <circle cx="50" cy="12" r="5" fill="#FFCA28" stroke="#E65100" stroke-width="1.5" />
      <circle cx="82" cy="44" r="5" fill="#42A5F5" stroke="#0D47A1" stroke-width="1.5" />
      <circle cx="50" cy="76" r="5" fill="#66BB6A" stroke="#1B5E20" stroke-width="1.5" />
      <circle cx="18" cy="44" r="5" fill="#FF7043" stroke="#BF360C" stroke-width="1.5" />
      <!--  -->
      <circle cx="50" cy="44" r="8" fill="#FFD54F" stroke="#E65100" stroke-width="2" />
    </svg>
  `,

  // 11.  (Trophy Cup)
  trophy: (cls = "w-6 h-6") => `
    <svg viewBox="0 0 100 100" class="${cls} drop-shadow-[0_4px_10px_rgba(255,193,7,0.5)] select-none">
      <defs>
        <linearGradient id="gic_trophy_gold" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stop-color="#FFF9C4" />
          <stop offset="50%" stop-color="#FFCA28" />
          <stop offset="100%" stop-color="#FF8F00" />
        </linearGradient>
      </defs>
      <!--  -->
      <path d="M 22 24 C 6 24 6 52 28 54" fill="none" stroke="#FFA000" stroke-width="5" stroke-linecap="round" />
      <path d="M 78 24 C 94 24 94 52 72 54" fill="none" stroke="#FFA000" stroke-width="5" stroke-linecap="round" />
      <!--  -->
      <path d="M 24 16 L 76 16 L 70 54 C 66 66 34 66 30 54 Z" fill="url(#gic_trophy_gold)" stroke="#E65100" stroke-width="3" />
      <!--  -->
      <rect x="44" y="60" width="12" height="18" rx="2" fill="url(#gic_trophy_gold)" stroke="#E65100" stroke-width="2" />
      <!--  -->
      <rect x="28" y="78" width="44" height="14" rx="4" fill="#6D4C41" stroke="#3E2723" stroke-width="3" />
      <polygon points="50,26 53,35 62,35 55,41 58,50 50,44 42,50 45,41 38,35 47,35" fill="#FFFFFF" />
    </svg>
  `,

  // 12.  (Dual PK Swords)
  swords: (cls = "w-6 h-6") => `
    <svg viewBox="0 0 100 100" class="${cls} drop-shadow-[0_4px_8px_rgba(0,0,0,0.35)] select-none">
      <!--  () -->
      <g transform="rotate(45 50 50)">
        <polygon points="46,10 54,10 52,65 48,65" fill="#64B5F6" stroke="#1565C0" stroke-width="2" />
        <rect x="36" y="65" width="28" height="6" rx="2" fill="#FFD54F" stroke="#E65100" stroke-width="1.5" />
        <rect x="47" y="71" width="6" height="16" rx="2" fill="#D32F2F" />
        <circle cx="50" cy="89" r="4" fill="#FFD54F" />
      </g>
      <!--  () -->
      <g transform="rotate(-45 50 50)">
        <polygon points="46,10 54,10 52,65 48,65" fill="#EF5350" stroke="#C62828" stroke-width="2" />
        <rect x="36" y="65" width="28" height="6" rx="2" fill="#FFD54F" stroke="#E65100" stroke-width="1.5" />
        <rect x="47" y="71" width="6" height="16" rx="2" fill="#1976D2" />
        <circle cx="50" cy="89" r="4" fill="#FFD54F" />
      </g>
    </svg>
  `,

  // 13.  (Calligraphy Brush)
  brush: (cls = "w-6 h-6") => `
    <svg viewBox="0 0 100 100" class="${cls} drop-shadow-[0_4px_8px_rgba(0,0,0,0.3)] select-none">
      <defs>
        <linearGradient id="gic_brush_handle" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stop-color="#D7CCC8" />
          <stop offset="50%" stop-color="#8D6E63" />
          <stop offset="100%" stop-color="#4E342E" />
        </linearGradient>
      </defs>
      <!--  (45) -->
      <rect x="44" y="8" width="12" height="60" rx="4" transform="rotate(-35 50 50)" fill="url(#gic_brush_handle)" stroke="#3E2723" stroke-width="2" />
      <!--  -->
      <rect x="42" y="62" width="16" height="8" rx="2" transform="rotate(-35 50 50)" fill="#FFD54F" stroke="#E65100" stroke-width="1.5" />
      <!--  -->
      <path d="M 36 70 Q 20 84 14 96 Q 28 92 46 78 Z" fill="#212121" stroke="#000000" stroke-width="1.5" />
      <path d="M 14 96 Q 20 90 26 84" stroke="#FFFFFF" stroke-width="1.5" opacity="0.6" />
    </svg>
  `,

  // 14.  (Imperial Scroll)
  scroll: (cls = "w-6 h-6") => `
    <svg viewBox="0 0 100 100" class="${cls} drop-shadow-[0_4px_8px_rgba(0,0,0,0.35)] select-none">
      <defs>
        <linearGradient id="gic_scroll_silk" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stop-color="#FFF9C4" />
          <stop offset="100%" stop-color="#FFE082" />
        </linearGradient>
      </defs>
      <!--  -->
      <rect x="8" y="16" width="10" height="68" rx="3" fill="#8D6E63" stroke="#4E342E" stroke-width="2" />
      <rect x="82" y="16" width="10" height="68" rx="3" fill="#8D6E63" stroke="#4E342E" stroke-width="2" />
      <circle cx="13" cy="14" r="5" fill="#FFD54F" />
      <circle cx="13" cy="86" r="5" fill="#FFD54F" />
      <circle cx="87" cy="14" r="5" fill="#FFD54F" />
      <circle cx="87" cy="86" r="5" fill="#FFD54F" />
      <!--  -->
      <rect x="18" y="22" width="64" height="56" fill="url(#gic_scroll_silk)" stroke="#FFA000" stroke-width="2" />
      <!--  -->
      <line x1="28" y1="36" x2="72" y2="36" stroke="#D84315" stroke-width="3" stroke-linecap="round" />
      <line x1="28" y1="48" x2="72" y2="48" stroke="#D84315" stroke-width="3" stroke-linecap="round" />
      <line x1="28" y1="60" x2="56" y2="60" stroke="#D84315" stroke-width="3" stroke-linecap="round" />
    </svg>
  `,

  // 15.  (Boss Monster)
  monster: (cls = "w-6 h-6") => `
    <svg viewBox="0 0 100 100" class="${cls} drop-shadow-[0_4px_10px_rgba(244,67,54,0.45)] select-none">
      <defs>
        <linearGradient id="gic_monster_body" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stop-color="#BA68C8" />
          <stop offset="60%" stop-color="#8E24AA" />
          <stop offset="100%" stop-color="#4A148C" />
        </linearGradient>
      </defs>
      <!--  -->
      <polygon points="26,10 18,34 38,30" fill="#FFCA28" stroke="#E65100" stroke-width="2" />
      <polygon points="74,10 62,30 82,34" fill="#FFCA28" stroke="#E65100" stroke-width="2" />
      <!--  -->
      <circle cx="50" cy="54" r="38" fill="url(#gic_monster_body)" stroke="#310C5D" stroke-width="3.5" />
      <!--  -->
      <circle cx="36" cy="46" r="10" fill="#FFFFFF" />
      <circle cx="64" cy="46" r="10" fill="#FFFFFF" />
      <circle cx="38" cy="46" r="5" fill="#212121" />
      <circle cx="62" cy="46" r="5" fill="#212121" />
      <!--  -->
      <ellipse cx="24" cy="62" rx="6" ry="3" fill="#FF4081" opacity="0.7" />
      <ellipse cx="76" cy="62" rx="6" ry="3" fill="#FF4081" opacity="0.7" />
      <!--  -->
      <path d="M 36 66 Q 50 78 64 66 Z" fill="#D32F2F" stroke="#310C5D" stroke-width="2" />
      <polygon points="42,66 45,71 48,66" fill="#FFFFFF" />
      <polygon points="52,66 55,71 58,66" fill="#FFFFFF" />
    </svg>
  `,

  // 16. 3D  (Match Gem)
  gem: (cls = "w-6 h-6") => `
    <svg viewBox="0 0 100 100" class="${cls} drop-shadow-[0_4px_8px_rgba(0,188,212,0.45)] select-none">
      <defs>
        <linearGradient id="gic_gem_cyan" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stop-color="#84FFFF" />
          <stop offset="50%" stop-color="#00E5FF" />
          <stop offset="100%" stop-color="#0091EA" />
        </linearGradient>
      </defs>
      <!--  -->
      <polygon points="30,12 70,12 90,40 50,90 10,40" fill="url(#gic_gem_cyan)" stroke="#004D40" stroke-width="3" stroke-linejoin="round" />
      <!--  -->
      <polygon points="30,12 70,12 60,34 40,34" fill="#E0F7FA" opacity="0.7" />
      <!--  -->
      <polygon points="30,12 40,34 10,40" fill="#B2EBF2" opacity="0.6" />
      <polygon points="70,12 90,40 60,34" fill="#00B8D4" opacity="0.4" />
      <!--  -->
      <polygon points="40,34 60,34 50,90" fill="#FFFFFF" opacity="0.5" />
    </svg>
  `,

  // 17.  (Review Bell)
  reviewBell: (cls = "w-6 h-6") => `
    <svg viewBox="0 0 100 100" class="${cls} drop-shadow-[0_4px_8px_rgba(255,160,0,0.5)] select-none">
      <defs>
        <linearGradient id="gic_bell_gold" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stop-color="#FFF59D" />
          <stop offset="50%" stop-color="#FFCA28" />
          <stop offset="100%" stop-color="#FF6F00" />
        </linearGradient>
      </defs>
      <!--  -->
      <path d="M 44 20 A 10 10 0 1 1 56 20" fill="none" stroke="#E65100" stroke-width="4" />
      <!--  -->
      <path d="M 22 72 Q 26 30 50 24 Q 74 30 78 72 Z" fill="url(#gic_bell_gold)" stroke="#E65100" stroke-width="3.5" />
      <!--  -->
      <ellipse cx="50" cy="72" rx="34" ry="7" fill="url(#gic_bell_gold)" stroke="#E65100" stroke-width="3" />
      <!--  -->
      <circle cx="50" cy="80" r="7" fill="#BF360C" stroke="#FFE082" stroke-width="2" />
    </svg>
  `,

  // 18.  (Islands)
  islandForest: (cls = "w-6 h-6") => `
    <svg viewBox="0 0 100 100" class="${cls} select-none">
      <circle cx="50" cy="50" r="46" fill="#064E3B" stroke="#34D399" stroke-width="3" />
      <!--  -->
      <polygon points="50,14 68,36 32,36" fill="#10B981" />
      <polygon points="50,28 74,52 26,52" fill="#059669" />
      <polygon points="50,42 80,72 20,72" fill="#047857" />
      <rect x="45" y="72" width="10" height="16" fill="#78350F" rx="2" />
    </svg>
  `,

  islandTown: (cls = "w-6 h-6") => `
    <svg viewBox="0 0 100 100" class="${cls} select-none">
      <circle cx="50" cy="50" r="46" fill="#7C2D12" stroke="#FBBF24" stroke-width="3" />
      <!--  -->
      <rect x="22" y="44" width="28" height="34" rx="3" fill="#FEF3C7" />
      <polygon points="36,24 54,44 18,44" fill="#EA580C" />
      <rect x="52" y="38" width="30" height="40" rx="3" fill="#FDE68A" />
      <polygon points="67,16 86,38 48,38" fill="#DC2626" />
    </svg>
  `,

  islandSpace: (cls = "w-6 h-6") => `
    <svg viewBox="0 0 100 100" class="${cls} select-none">
      <circle cx="50" cy="50" r="46" fill="#1E1B4B" stroke="#22D3EE" stroke-width="3" />
      <!--  -->
      <polygon points="50,12 62,40 38,40" fill="#E11D48" />
      <rect x="38" y="40" width="24" height="32" rx="4" fill="#F8FAFC" />
      <circle cx="50" cy="52" r="5" fill="#0284C7" stroke="#38BDF8" stroke-width="1.5" />
      <!--  -->
      <polygon points="38,64 26,76 38,72" fill="#E11D48" />
      <polygon points="62,64 74,76 62,72" fill="#E11D48" />
      <polygon points="44,72 50,88 56,72" fill="#F59E0B" />
    </svg>
  `,

  // 19. A4  (Print Worksheet)
  print: (cls = "w-6 h-6") => `
    <svg viewBox="0 0 100 100" class="${cls} select-none">
      <rect x="24" y="14" width="52" height="26" rx="3" fill="#F1F5F9" stroke="#64748B" stroke-width="2" />
      <rect x="14" y="34" width="72" height="36" rx="6" fill="#334155" stroke="#0F172A" stroke-width="3" />
      <circle cx="76" cy="46" r="3" fill="#22C55E" />
      <rect x="24" y="56" width="52" height="34" rx="3" fill="#FFFFFF" stroke="#DC2626" stroke-width="2" />
      <!--  -->
      <rect x="36" y="62" width="28" height="22" fill="none" stroke="#DC2626" stroke-width="1.5" />
      <line x1="50" y1="62" x2="50" y2="84" stroke="#FCA5A5" stroke-dasharray="2 2" stroke-width="1" />
      <line x1="36" y1="73" x2="64" y2="73" stroke="#FCA5A5" stroke-dasharray="2 2" stroke-width="1" />
    </svg>
  `,

  // 20.  (Compass)
  compass: (cls = "w-6 h-6") => `
    <svg viewBox="0 0 100 100" class="${cls} drop-shadow-[0_4px_8px_rgba(0,0,0,0.3)] select-none">
      <circle cx="50" cy="50" r="44" fill="#451A03" stroke="#F59E0B" stroke-width="4" />
      <circle cx="50" cy="50" r="36" fill="#FEF3C7" stroke="#D97706" stroke-width="2" />
      <!--  -->
      <line x1="50" y1="18" x2="50" y2="24" stroke="#92400E" stroke-width="2" />
      <line x1="50" y1="76" x2="50" y2="82" stroke="#92400E" stroke-width="2" />
      <line x1="18" y1="50" x2="24" y2="50" stroke="#92400E" stroke-width="2" />
      <line x1="76" y1="50" x2="82" y2="50" stroke="#92400E" stroke-width="2" />
      <!--  -->
      <polygon points="50,22 56,50 50,44 44,50" fill="#DC2626" />
      <polygon points="50,78 56,50 50,56 44,50" fill="#1E40AF" />
      <circle cx="50" cy="50" r="4" fill="#F59E0B" stroke="#78350F" stroke-width="1.5" />
    </svg>
  `
};
