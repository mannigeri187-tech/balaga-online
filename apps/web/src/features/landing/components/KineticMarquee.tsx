import React from "react";

interface KineticMarqueeProps {
  items: string[];
  direction?: "left" | "right";
  speed?: "slow" | "normal" | "fast";
  variant?: "amber" | "violet" | "emerald" | "subtle";
}

export const KineticMarquee: React.FC<KineticMarqueeProps> = ({
  items,
  direction = "left",
  speed = "normal",
  variant = "subtle",
}) => {
  const speedClass =
    speed === "slow"
      ? "duration-[45s]"
      : speed === "fast"
      ? "duration-[20s]"
      : "duration-[30s]";

  const variantStyles = {
    amber: "border-[#e5a855]/20 text-[#e5a855] bg-[#1a160f]/60",
    violet: "border-violet-500/20 text-violet-300 bg-violet-950/20",
    emerald: "border-emerald-500/20 text-emerald-300 bg-emerald-950/20",
    subtle: "border-white/10 text-[#d8d3c7] bg-[#0c0d10]/80",
  }[variant];

  return (
    <div
      className={`relative w-full overflow-hidden border-y py-3.5 backdrop-blur-md select-none font-mono text-xs uppercase tracking-widest ${variantStyles}`}
    >
      <div
        className={`flex w-max items-center gap-8 ${
          direction === "left" ? "animate-marquee-left" : "animate-marquee-right"
        } ${speedClass} hover:[animation-play-state:paused]`}
      >
        {/* Double array for seamless loop */}
        {[...items, ...items, ...items, ...items].map((text, idx) => (
          <div key={idx} className="flex items-center gap-6 whitespace-nowrap">
            <span className="font-semibold">{text}</span>
            <span className="w-1.5 h-1.5 rounded-full bg-current opacity-40" />
          </div>
        ))}
      </div>
    </div>
  );
};
