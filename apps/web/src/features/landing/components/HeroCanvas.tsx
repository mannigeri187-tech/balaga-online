import React, { useEffect, useRef } from "react";

export const HeroCanvas: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animationFrameId: number;
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const mouse = { x: -1000, y: -1000 };

    const onMouseMove = (e: MouseEvent) => {
      mouse.x = e.clientX;
      mouse.y = e.clientY;
    };

    window.addEventListener("mousemove", onMouseMove);

    // Particle nodes for subtle floating mesh
    const nodeCount = Math.min(45, Math.floor(width / 32));
    const nodes: Array<{
      x: number;
      y: number;
      ox: number;
      oy: number;
      vx: number;
      vy: number;
      radius: number;
      color: string;
    }> = [];

    const colors = [
      "rgba(229, 168, 85, 0.45)",  // Warm Butter Amber
      "rgba(139, 92, 246, 0.4)",   // Social Violet
      "rgba(16, 185, 129, 0.4)",   // Founders Emerald
      "rgba(244, 235, 225, 0.3)",  // Warm Silk Pearl
    ];

    for (let i = 0; i < nodeCount; i++) {
      const rx = Math.random() * width;
      const ry = Math.random() * height;
      nodes.push({
        x: rx,
        y: ry,
        ox: rx,
        oy: ry,
        vx: (Math.random() - 0.5) * 0.5,
        vy: (Math.random() - 0.5) * 0.5,
        radius: Math.random() * 2 + 1,
        color: colors[i % colors.length],
      });
    }

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };

    window.addEventListener("resize", handleResize);

    const prefersReducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;

    let time = 0;

    const render = () => {
      ctx.clearRect(0, 0, width, height);
      time += 0.005;

      // Draw subtle undulating wave gradients
      const grad1 = ctx.createRadialGradient(
        width * 0.25 + Math.sin(time) * 40,
        height * 0.35 + Math.cos(time) * 30,
        10,
        width * 0.25,
        height * 0.35,
        width * 0.5
      );
      grad1.addColorStop(0, "rgba(139, 92, 246, 0.08)");
      grad1.addColorStop(1, "rgba(7, 8, 10, 0)");

      ctx.fillStyle = grad1;
      ctx.fillRect(0, 0, width, height);

      const grad2 = ctx.createRadialGradient(
        width * 0.75 + Math.cos(time * 0.8) * 40,
        height * 0.6 + Math.sin(time * 0.8) * 30,
        10,
        width * 0.75,
        height * 0.6,
        width * 0.5
      );
      grad2.addColorStop(0, "rgba(16, 185, 129, 0.07)");
      grad2.addColorStop(1, "rgba(7, 8, 10, 0)");

      ctx.fillStyle = grad2;
      ctx.fillRect(0, 0, width, height);

      // Warm central buttery focus
      const grad3 = ctx.createRadialGradient(
        width * 0.5,
        height * 0.4,
        5,
        width * 0.5,
        height * 0.4,
        width * 0.35
      );
      grad3.addColorStop(0, "rgba(229, 168, 85, 0.06)");
      grad3.addColorStop(1, "rgba(7, 8, 10, 0)");

      ctx.fillStyle = grad3;
      ctx.fillRect(0, 0, width, height);

      if (!prefersReducedMotion) {
        for (let i = 0; i < nodes.length; i++) {
          const n1 = nodes[i];
          n1.x += n1.vx;
          n1.y += n1.vy;

          // Wrap edges
          if (n1.x < 0) n1.x = width;
          if (n1.x > width) n1.x = 0;
          if (n1.y < 0) n1.y = height;
          if (n1.y > height) n1.y = 0;

          // Interactive mouse reaction: gentle fluid displacement
          const mdx = n1.x - mouse.x;
          const mdy = n1.y - mouse.y;
          const mdist = Math.sqrt(mdx * mdx + mdy * mdy);
          if (mdist < 180) {
            const force = (180 - mdist) / 180;
            n1.x += (mdx / mdist) * force * 2.5;
            n1.y += (mdy / mdist) * force * 2.5;

            // Draw interactive filament to cursor
            ctx.beginPath();
            ctx.moveTo(n1.x, n1.y);
            ctx.lineTo(mouse.x, mouse.y);
            ctx.strokeStyle = `rgba(229, 168, 85, ${0.12 * (1 - mdist / 180)})`;
            ctx.lineWidth = 0.8;
            ctx.stroke();
          }

          ctx.beginPath();
          ctx.arc(n1.x, n1.y, n1.radius, 0, Math.PI * 2);
          ctx.fillStyle = n1.color;
          ctx.fill();

          // Connect nearby nodes
          for (let j = i + 1; j < nodes.length; j++) {
            const n2 = nodes[j];
            const dx = n1.x - n2.x;
            const dy = n1.y - n2.y;
            const dist = Math.sqrt(dx * dx + dy * dy);

            if (dist < 150) {
              ctx.beginPath();
              ctx.moveTo(n1.x, n1.y);
              ctx.lineTo(n2.x, n2.y);
              ctx.strokeStyle = `rgba(229, 168, 85, ${0.08 * (1 - dist / 150)})`;
              ctx.lineWidth = 0.6;
              ctx.stroke();
            }
          }
        }
        animationFrameId = requestAnimationFrame(render);
      }
    };

    render();

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener("resize", handleResize);
      window.removeEventListener("mousemove", onMouseMove);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 pointer-events-none z-0 w-full h-full opacity-90"
      aria-hidden="true"
    />
  );
};
