import React from 'react';

interface HashTagLogoProps {
  className?: string;
  height?: number;
}

/**
 * Hash-Tag Logo
 * Recreates the exact user-provided logo artwork:
 * - Green (#00a651) stylized hashtag geometric grid with intersecting vertical/horizontal arms
 * - 'hash' in green lettering (#00a651) nestled directly inside the lower horizontal beam
 * - 'tag' in vibrant red lettering (#ed1c24) with bold stylish lowercase curves
 * - 'হ্যাশ ট্যাগ' in Bangla beneath 'tag' in emerald green (#00a651)
 */
export const HashTagLogo: React.FC<HashTagLogoProps> = ({
  className = '',
  height = 46,
}) => {
  return (
    <svg
      height={height}
      viewBox="0 0 320 160"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`inline-block select-none overflow-visible ${className}`}
      aria-label="Hash-Tag Logo (হ্যাশ ট্যাগ)"
    >
      {/* ============================================================== */}
      {/* 1. GREEN GEOMETRIC STYLIZED HASHTAG SYMBOL (#)                 */}
      {/* ============================================================== */}
      <g fill="#00a651">
        {/* Left vertical tall bar */}
        <rect x="38" y="16" width="12" height="106" />

        {/* Right vertical thinner offset bar */}
        <rect x="63" y="30" width="8" height="106" />

        {/* Upper horizontal crossing bar extending to the left */}
        <rect x="0" y="44" width="104" height="16" />

        {/* Lower horizontal thick block wrapping the word 'hash' */}
        <path d="M25 70 H136 V96 H25 Z" />
      </g>

      {/* ============================================================== */}
      {/* 2. 'hash' INSIDE THE LOWER GREEN BEAM                          */}
      {/* ============================================================== */}
      {/* Rendered in crisp white gothic/serif letters inside the green bar,
          matching how it is cut out / seated cleanly in the logo graphic */}
      <text
        x="85"
        y="90"
        fill="#ffffff"
        textAnchor="middle"
        fontFamily="'UnifrakturMaguntia', 'Cinzel Decorative', Georgia, 'Times New Roman', serif"
        fontWeight="800"
        fontSize="24px"
        letterSpacing="-0.5px"
      >
        hash
      </text>

      {/* ============================================================== */}
      {/* 3. 'tag' IN BOLD RED DIRECTLY NEXT TO 'hash'                   */}
      {/* ============================================================== */}
      <text
        x="137"
        y="94"
        fill="#ed1c24"
        fontFamily="'Impact', 'Arial Black', -apple-system, sans-serif"
        fontWeight="900"
        fontSize="36px"
        letterSpacing="-1px"
      >
        tag
      </text>

      {/* ============================================================== */}
      {/* 4. BANGLA 'হ্যাশ ট্যাগ' SUBTITLE IN GREEN                      */}
      {/* ============================================================== */}
      <text
        x="136"
        y="112"
        fill="#00a651"
        fontFamily="'Kalpurush', 'SolaimanLipi', 'Noto Sans Bengali', system-ui, sans-serif"
        fontWeight="800"
        fontSize="17px"
        letterSpacing="0px"
      >
        হ্যাশ ট্যাগ
      </text>
    </svg>
  );
};

export default HashTagLogo;
