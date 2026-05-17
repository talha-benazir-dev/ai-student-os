"use client";

import { useRef, useState, type CSSProperties, type ReactNode } from "react";

export function Tilt({
  children,
  className = "",
  max = 10,
  scale = 1.02,
  glare = true,
  rest = "perspective(1400px) rotateY(-6deg) rotateX(4deg)",
}: {
  children: ReactNode;
  className?: string;
  max?: number;
  scale?: number;
  glare?: boolean;
  rest?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [style, setStyle] = useState<CSSProperties>({
    transform: rest,
    transition: "transform 600ms cubic-bezier(.22,1,.36,1)",
  });
  const [glow, setGlow] = useState({ x: 50, y: 50, o: 0 });

  const onMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const el = ref.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    const px = (e.clientX - r.left) / r.width;
    const py = (e.clientY - r.top) / r.height;
    const ry = (px - 0.5) * (max * 2);
    const rx = (0.5 - py) * (max * 2);
    setStyle({
      transform: `perspective(1400px) rotateY(${ry}deg) rotateX(${rx}deg) scale(${scale})`,
      transition: "transform 120ms ease-out",
    });
    setGlow({ x: px * 100, y: py * 100, o: 1 });
  };

  const onLeave = () => {
    setStyle({
      transform: rest,
      transition: "transform 700ms cubic-bezier(.22,1,.36,1)",
    });
    setGlow((g) => ({ ...g, o: 0 }));
  };

  return (
    <div
      ref={ref}
      onMouseMove={onMove}
      onMouseLeave={onLeave}
      className={`relative will-change-transform ${className}`}
      style={{ ...style, transformStyle: "preserve-3d" }}
    >
      {children}
      {glare && (
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 rounded-2xl mix-blend-overlay transition-opacity duration-300"
          style={{
            opacity: glow.o * 0.7,
            background: `radial-gradient(420px circle at ${glow.x}% ${glow.y}%, rgba(255,255,255,0.18), transparent 45%)`,
          }}
        />
      )}
    </div>
  );
}
