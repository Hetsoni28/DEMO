"use client";

import { motion, useReducedMotion } from "framer-motion";

/** Palette for the illustration on a cream background (artwork, not UI chrome). */
const C = {
  uniform: "#282B4A", // brand indigo shirt + sleeves
  uniformLine: "#4A4E7A",
  badge: "#EEEBDA",
  badgeMark: "#282B4A",
  cap: "#282B4A",
  capBrim: "#4A4E7A",
  trousers: "#5A5F8E",
  shoes: "#1C1D2E",
  skin: "#C58A5E",
  skinShade: "#B07A50",
  hair: "#1C1D2E",
  belt: "#C89B5F",
  beltDark: "#A97F49",
  shadow: "#282B4A",
  light: "#F6F3E6",
};

/**
 * HomeCrew crew member who pops up and waves hello on sign-in.
 * Pure SVG + framer-motion: crisp at any size, no image downloads.
 */
export function CrewWave({ className }: { className?: string }) {
  const reduce = useReducedMotion();

  return (
    <motion.svg
      viewBox="0 0 220 250"
      className={className}
      role="img"
      aria-label="A HomeCrew professional waving hello"
      initial={reduce ? false : { y: 70, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ type: "spring", stiffness: 210, damping: 16, delay: 0.15 }}
    >
      {/* ground shadow */}
      <motion.ellipse cx="110" cy="240" rx="58" ry="7" fill={C.shadow} opacity={0.12} initial={reduce ? false : { scaleX: 0.4 }} animate={{ scaleX: 1 }} transition={{ delay: 0.25, duration: 0.5 }} style={{ transformOrigin: "110px 240px" }} />

      {/* gentle idle bob for the whole body */}
      <motion.g animate={reduce ? undefined : { y: [0, -3, 0] }} transition={{ duration: 1.6, repeat: Infinity, ease: "easeInOut", delay: 0.9 }}>
        {/* legs */}
        <rect x="84" y="196" width="20" height="40" rx="8" fill={C.trousers} />
        <rect x="116" y="196" width="20" height="40" rx="8" fill={C.trousers} />
        <rect x="80" y="228" width="28" height="10" rx="5" fill={C.shoes} />
        <rect x="112" y="228" width="28" height="10" rx="5" fill={C.shoes} />

        {/* left arm (resting) */}
        <path d="M68 122 C56 140 54 160 60 178" stroke={C.uniform} strokeWidth="17" strokeLinecap="round" fill="none" />
        <circle cx="61" cy="182" r="9" fill={C.skin} />

        {/* torso: work shirt */}
        <path d="M66 118 Q110 98 154 118 L150 200 Q110 210 70 200 Z" fill={C.uniform} />
        {/* collar */}
        <path d="M94 108 L110 124 L126 108" fill="none" stroke={C.uniformLine} strokeWidth="5" strokeLinejoin="round" />
        <path d="M110 124 L110 196" stroke={C.light} strokeOpacity="0.14" strokeWidth="2" />
        {/* chest badge: HomeCrew house mark */}
        <rect x="80" y="134" width="22" height="22" rx="6" fill={C.badge} />
        <path d="M84.5 146.5 91 141l6.5 5.5" fill="none" stroke={C.badgeMark} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M86.5 145.5v6.5h3v-3.5h3v3.5h3v-6.5" fill="none" stroke={C.badgeMark} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
        {/* pocket + pen */}
        <rect x="120" y="136" width="18" height="16" rx="3" fill="none" stroke={C.light} strokeOpacity="0.28" strokeWidth="2" />
        <rect x="125" y="132" width="3" height="8" rx="1.5" fill={C.belt} />

        {/* tool belt */}
        <rect x="70" y="180" width="80" height="11" rx="3" fill={C.belt} />
        <rect x="104" y="180" width="12" height="11" rx="2" fill={C.beltDark} />
        <rect x="76" y="186" width="16" height="16" rx="3" fill={C.beltDark} />
        <rect x="129" y="186" width="14" height="18" rx="3" fill={C.beltDark} />
        <rect x="133" y="178" width="5" height="12" rx="2" fill="#9AA0C4" />

        {/* waving arm — swings from the shoulder */}
        <motion.g
          style={{ transformOrigin: "150px 122px" }}
          initial={reduce ? false : { rotate: 30 }}
          animate={reduce ? { rotate: 0 } : { rotate: [30, -6, 14, -6, 14, -6, 4] }}
          transition={{ duration: 1.7, delay: 0.55, ease: "easeInOut", times: [0, 0.2, 0.36, 0.52, 0.68, 0.84, 1] }}
        >
          <path d="M150 122 C166 108 176 90 180 70" stroke={C.uniform} strokeWidth="17" strokeLinecap="round" fill="none" />
          <circle cx="181" cy="62" r="10" fill={C.skin} />
          <rect x="173" y="44" width="5" height="12" rx="2.5" fill={C.skin} transform="rotate(-14 175 50)" />
          <rect x="179" y="41" width="5" height="13" rx="2.5" fill={C.skin} />
          <rect x="185" y="43" width="5" height="12" rx="2.5" fill={C.skin} transform="rotate(14 187 49)" />
          <rect x="189" y="53" width="5" height="10" rx="2.5" fill={C.skin} transform="rotate(48 191 58)" />
        </motion.g>

        {/* neck */}
        <rect x="101" y="94" width="18" height="16" rx="6" fill={C.skinShade} />

        {/* head */}
        <circle cx="110" cy="72" r="30" fill={C.skin} />
        <circle cx="80" cy="76" r="6" fill={C.skinShade} />
        <circle cx="140" cy="76" r="6" fill={C.skinShade} />
        <path d="M82 66 Q84 46 110 44 Q136 46 138 66 Q124 56 110 57 Q96 56 82 66 Z" fill={C.hair} />

        {/* cap */}
        <path d="M80 60 Q82 32 110 30 Q138 32 140 60 Z" fill={C.cap} />
        <path d="M110 30 Q113 45 112 60" stroke={C.light} strokeOpacity="0.16" strokeWidth="2" fill="none" />
        <path d="M78 60 Q110 52 150 62 Q152 68 146 69 Q112 62 80 66 Z" fill={C.capBrim} />
        <circle cx="110" cy="30" r="3" fill={C.belt} />

        {/* eyes — blink now and then */}
        <motion.g
          style={{ transformOrigin: "110px 76px" }}
          animate={reduce ? undefined : { scaleY: [1, 1, 0.1, 1, 1] }}
          transition={{ duration: 3.2, repeat: Infinity, times: [0, 0.6, 0.64, 0.68, 1], delay: 1.1 }}
        >
          <ellipse cx="99" cy="76" rx="3.4" ry="4.2" fill={C.hair} />
          <ellipse cx="121" cy="76" rx="3.4" ry="4.2" fill={C.hair} />
          <circle cx="100.2" cy="74.6" r="1.1" fill={C.light} />
          <circle cx="122.2" cy="74.6" r="1.1" fill={C.light} />
        </motion.g>
        <path d="M93 68 Q99 65 104 68" stroke={C.hair} strokeWidth="2.4" strokeLinecap="round" fill="none" />
        <path d="M116 68 Q121 65 127 68" stroke={C.hair} strokeWidth="2.4" strokeLinecap="round" fill="none" />
        <circle cx="92" cy="86" r="5" fill="#E07A6B" opacity="0.28" />
        <circle cx="128" cy="86" r="5" fill="#E07A6B" opacity="0.28" />
        <path d="M99 87 Q110 99 121 87 Q110 92 99 87 Z" fill={C.hair} />
        <path d="M103 91 Q110 95 117 91" stroke="#E07A6B" strokeWidth="2.4" strokeLinecap="round" fill="none" />
      </motion.g>
    </motion.svg>
  );
}
