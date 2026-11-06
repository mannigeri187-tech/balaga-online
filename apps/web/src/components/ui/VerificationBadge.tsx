import React from "react";
import { BADGE_TYPES, BadgeType, BADGE_METADATA } from "@platform/config";

interface VerificationBadgeProps {
  type: BadgeType | "blue" | "teal" | "gold";
  size?: "sm" | "md" | "lg";
  showLabel?: boolean;
  className?: string;
}

// 1. Blue — Verified Project / Startup (blue circular check inside a white rounded-square tile)
export const BlueProjectIcon: React.FC<{ size?: number; className?: string }> = ({
  size = 20,
  className = "",
}) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={`inline-block flex-shrink-0 drop-shadow-sm ${className}`}
  >
    <title>Verified Project / Startup</title>
    {/* White rounded-square tile */}
    <rect x="1.5" y="1.5" width="21" height="21" rx="5.5" fill="#FFFFFF" stroke="#DBEAFE" strokeWidth="1.5" />
    {/* Blue circular check */}
    <circle cx="12" cy="12" r="8" fill="#2563EB" />
    <path
      d="M8.8 12.2L11 14.4L15.4 9.8"
      stroke="#FFFFFF"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

// 2. Teal — Verified Registered Business (teal scalloped verification seal with a white checkmark)
export const TealBusinessSeal: React.FC<{ size?: number; className?: string }> = ({
  size = 20,
  className = "",
}) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={`inline-block flex-shrink-0 drop-shadow-sm ${className}`}
  >
    <title>Verified Registered Business</title>
    {/* Scalloped verification seal rosette */}
    <path
      d="M12 2.2L13.8 4.2L16.4 3.9L17.5 6.3L20 7.1L20.2 9.7L22.2 11.4L21.3 13.9L22.4 16.3L20.1 17.6L19.4 20.2L16.8 20.6L15.3 22.8L12.7 22.2L10.7 23.8L8.7 22.2L6.1 22.8L4.6 20.6L2 20.2L1.3 17.6L-1 16.3L0.1 13.9L-0.8 11.4L1.2 9.7L1.4 7.1L3.9 6.3L5 3.9L7.6 4.2L9.4 2.2L12 2.2Z"
      transform="translate(1.3, 0.4) scale(0.92)"
      fill="#0D9488"
      stroke="#14B8A6"
      strokeWidth="0.8"
      strokeLinejoin="round"
    />
    {/* Center white checkmark */}
    <path
      d="M8.2 12.2L10.8 14.8L16.2 9.4"
      stroke="#FFFFFF"
      strokeWidth="2.2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

// 3. Gold — Premium Member (gold crown inside a white rounded-square tile)
export const GoldPremiumCrown: React.FC<{ size?: number; className?: string }> = ({
  size = 20,
  className = "",
}) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={`inline-block flex-shrink-0 drop-shadow-sm ${className}`}
  >
    <title>Gold Premium Member</title>
    <defs>
      <linearGradient id="goldGradient" x1="4" y1="6" x2="20" y2="18" gradientUnits="userSpaceOnUse">
        <stop stopColor="#F59E0B" />
        <stop offset="0.5" stopColor="#EAB308" />
        <stop offset="1" stopColor="#D97706" />
      </linearGradient>
    </defs>
    {/* White rounded-square tile */}
    <rect x="1.5" y="1.5" width="21" height="21" rx="5.5" fill="#FFFFFF" stroke="#FEF08A" strokeWidth="1.5" />
    {/* Crown shape matching Premium icon reference */}
    <path
      d="M5 16.5H19L18 9.5L14.5 12.5L12 6.5L9.5 12.5L6 9.5L5 16.5Z"
      fill="url(#goldGradient)"
      stroke="#B45309"
      strokeWidth="1"
      strokeLinejoin="round"
    />
    {/* Crown jewel dots */}
    <circle cx="6" cy="9" r="1" fill="#FEF08A" />
    <circle cx="12" cy="6" r="1.1" fill="#FEF08A" />
    <circle cx="18" cy="9" r="1" fill="#FEF08A" />
  </svg>
);

export const VerificationBadge: React.FC<VerificationBadgeProps> = ({
  type,
  size = "md",
  showLabel = false,
  className = "",
}) => {
  const pixelSize = size === "sm" ? 16 : size === "lg" ? 24 : 20;

  let iconNode: React.ReactNode = null;
  let labelText = "";
  let containerBg = "";

  if (type === BADGE_TYPES.VERIFIED_PROJECT || type === "blue") {
    iconNode = <BlueProjectIcon size={pixelSize} />;
    labelText = BADGE_METADATA[BADGE_TYPES.VERIFIED_PROJECT]?.label || "Verified Project";
    containerBg = "bg-blue-500/10 text-blue-400 border border-blue-500/20";
  } else if (type === BADGE_TYPES.VERIFIED_BUSINESS || type === "teal") {
    iconNode = <TealBusinessSeal size={pixelSize} />;
    labelText = BADGE_METADATA[BADGE_TYPES.VERIFIED_BUSINESS]?.label || "Verified Business";
    containerBg = "bg-teal-500/10 text-teal-300 border border-teal-500/20";
  } else {
    // Gold Premium
    iconNode = <GoldPremiumCrown size={pixelSize} />;
    labelText = "Gold Premium";
    containerBg = "bg-amber-500/10 text-amber-300 border border-amber-500/30";
  }

  if (!showLabel) {
    return <span className={`inline-flex items-center ${className}`}>{iconNode}</span>;
  }

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold ${containerBg} ${className}`}
    >
      {iconNode}
      <span>{labelText}</span>
    </span>
  );
};
