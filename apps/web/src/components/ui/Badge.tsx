import React from "react";
import { BADGE_TYPES, BadgeType, BADGE_METADATA } from "@platform/config";
import { BlueProjectIcon, TealBusinessSeal, GoldPremiumCrown } from "./VerificationBadge";

interface BadgeProps {
  type: BadgeType;
  showLabel?: boolean;
  className?: string;
  size?: "sm" | "md" | "lg";
}

export const Badge: React.FC<BadgeProps> = ({
  type,
  showLabel = true,
  className = "",
  size = "md",
}) => {
  const meta = BADGE_METADATA[type];
  const pixelSize = size === "sm" ? 16 : size === "lg" ? 24 : 20;

  if (type === BADGE_TYPES.VERIFIED_PROJECT) {
    return (
      <span
        title={meta.description}
        className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-500/10 text-blue-400 border border-blue-500/30 ${className}`}
      >
        <BlueProjectIcon size={pixelSize} />
        {showLabel && <span>{meta.label}</span>}
      </span>
    );
  }

  if (type === BADGE_TYPES.VERIFIED_BUSINESS) {
    return (
      <span
        title={meta.description}
        className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-teal-500/10 text-teal-300 border border-teal-500/30 ${className}`}
      >
        <TealBusinessSeal size={pixelSize} />
        {showLabel && <span>{meta.label}</span>}
      </span>
    );
  }

  // Premium Member (Gold replacing Purple everywhere)
  return (
    <span
      title={meta.description}
      className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-500/15 text-amber-300 border border-amber-500/40 shadow-sm shadow-amber-900/30 ${className}`}
    >
      <GoldPremiumCrown size={pixelSize} />
      {showLabel && <span>Gold Premium</span>}
    </span>
  );
};
