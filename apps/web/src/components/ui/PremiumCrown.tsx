import React from "react";
import { GoldPremiumCrown } from "./VerificationBadge";

interface PremiumCrownProps {
  size?: "sm" | "md" | "lg";
  className?: string;
  showTooltip?: boolean;
}

export const PremiumCrown: React.FC<PremiumCrownProps> = ({
  size = "md",
  className = "",
  showTooltip = true,
}) => {
  const pixelSize = size === "sm" ? 16 : size === "lg" ? 24 : 20;

  return (
    <span
      title={showTooltip ? "Gold Premium Member" : undefined}
      className={`inline-flex items-center align-middle ${className}`}
    >
      <GoldPremiumCrown size={pixelSize} />
    </span>
  );
};
