import React, { useEffect, useState, useRef } from "react";

export const CustomCursor: React.FC = () => {
  const cursorDotRef = useRef<HTMLDivElement | null>(null);
  const cursorRingRef = useRef<HTMLDivElement | null>(null);
  const [cursorText, setCursorText] = useState<string>("");
  const [isHovered, setIsHovered] = useState<boolean>(false);
  const [isPointer, setIsPointer] = useState<boolean>(false);
  const [isVisible, setIsVisible] = useState<boolean>(false);

  useEffect(() => {
    // Disable on touch devices
    if (window.matchMedia("(pointer: coarse)").matches) {
      return;
    }

    let mouseX = -100;
    let mouseY = -100;
    let ringX = -100;
    let ringY = -100;
    let animId: number;

    const onMouseMove = (e: MouseEvent) => {
      mouseX = e.clientX;
      mouseY = e.clientY;
      if (!isVisible) setIsVisible(true);

      // Check what element is being hovered
      const target = e.target as HTMLElement | null;
      if (target) {
        const interactiveEl = target.closest("button, a, input, [data-cursor]");
        if (interactiveEl) {
          setIsPointer(true);
          const customText = interactiveEl.getAttribute("data-cursor");
          if (customText) {
            setCursorText(customText);
            setIsHovered(true);
          } else {
            setCursorText("");
            setIsHovered(false);
          }
        } else {
          setIsPointer(false);
          setCursorText("");
          setIsHovered(false);
        }
      }
    };

    const onMouseLeave = () => {
      setIsVisible(false);
    };

    window.addEventListener("mousemove", onMouseMove);
    document.addEventListener("mouseleave", onMouseLeave);

    // Smooth lerp loop for the trailing ring
    const renderLoop = () => {
      // Lerp ring towards mouse position (0.18 factor for snappy silky fluidity)
      ringX += (mouseX - ringX) * 0.18;
      ringY += (mouseY - ringY) * 0.18;

      if (cursorDotRef.current) {
        cursorDotRef.current.style.transform = `translate3d(${mouseX}px, ${mouseY}px, 0)`;
      }

      if (cursorRingRef.current) {
        cursorRingRef.current.style.transform = `translate3d(${ringX}px, ${ringY}px, 0)`;
      }

      animId = requestAnimationFrame(renderLoop);
    };

    animId = requestAnimationFrame(renderLoop);

    return () => {
      window.removeEventListener("mousemove", onMouseMove);
      document.removeEventListener("mouseleave", onMouseLeave);
      cancelAnimationFrame(animId);
    };
  }, [isVisible]);

  if (!isVisible) return null;

  return (
    <>
      {/* Central pinpoint dot */}
      <div
        ref={cursorDotRef}
        className="fixed top-0 left-0 -ml-1 -mt-1 w-2 h-2 rounded-full bg-amber-400 pointer-events-none z-[9999] transition-opacity duration-150"
        style={{
          opacity: isHovered ? 0 : 0.9,
          willChange: "transform",
        }}
      />

      {/* Outer fluid trailing ring with Butterflow glow */}
      <div
        ref={cursorRingRef}
        className={`fixed top-0 left-0 pointer-events-none z-[9998] rounded-full flex items-center justify-center font-mono text-[9px] font-bold uppercase tracking-widest text-[#07080a] transition-[width,height,background-color,border-color] duration-200 ease-out ${
          isHovered
            ? "-ml-9 -mt-9 w-18 h-18 bg-gradient-to-tr from-amber-400 to-amber-200 text-[#07080a] shadow-xl shadow-amber-400/30 scale-100 backdrop-blur-md"
            : isPointer
            ? "-ml-5 -mt-5 w-10 h-10 border border-amber-400/70 bg-amber-400/10 scale-110"
            : "-ml-3.5 -mt-3.5 w-7 h-7 border border-white/30 bg-white/5"
        }`}
        style={{
          willChange: "transform",
        }}
      >
        {cursorText && (
          <span className="animate-in fade-in zoom-in-75 duration-150 select-none">
            {cursorText}
          </span>
        )}
      </div>
    </>
  );
};
