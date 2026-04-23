"use client";
import { useEffect, useState } from "react";

/** Dreamy bokeh + star background */
export default function Background({ glow = "med" }: { glow?: "low" | "med" | "high" }) {
  const opacityMap = { low: 0.25, med: 0.45, high: 0.65 };
  const op = opacityMap[glow];

  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  const blobs = [
    { w: 320, h: 320, x: -80, y: -80, color: "#6E8EFB" },
    { w: 280, h: 280, x: "60%", y: "10%", color: "#A777E3" },
    { w: 250, h: 250, x: "20%", y: "55%", color: "#FFB347" },
    { w: 200, h: 200, x: "-10%", y: "70%", color: "#6E8EFB" },
    { w: 180, h: 180, x: "75%", y: "65%", color: "#A777E3" },
    { w: 150, h: 150, x: "45%", y: "35%", color: "#FF8C42" },
  ];

  const stars = mounted
    ? Array.from({ length: 40 }, (_, i) => ({
        id: i,
        x: (i * 73 + 17) % 100,
        y: (i * 47 + 31) % 100,
        delay: (i * 0.37) % 3,
        size: i % 3 === 0 ? 2 : 1,
      }))
    : [];

  return (
    <div className="fixed inset-0 overflow-hidden pointer-events-none" style={{ zIndex: 0 }}>
      {/* base */}
      <div className="absolute inset-0" style={{ background: "#0A0A0F" }} />

      {/* bokeh blobs */}
      {blobs.map((b, i) => (
        <div
          key={i}
          className="absolute rounded-full"
          style={{
            width: b.w,
            height: b.h,
            left: b.x,
            top: b.y,
            background: b.color,
            opacity: op,
            filter: "blur(80px)",
            animation: `floatBlob ${4 + i * 0.7}s ease-in-out infinite alternate`,
            animationDelay: `${i * 0.5}s`,
          }}
        />
      ))}

      {/* stars */}
      {stars.map((s) => (
        <div
          key={s.id}
          className="absolute rounded-full bg-white"
          style={{
            left: `${s.x}%`,
            top: `${s.y}%`,
            width: s.size,
            height: s.size,
            opacity: 0.6,
            animation: `twinkle ${2 + s.delay}s ease-in-out infinite`,
            animationDelay: `${s.delay}s`,
          }}
        />
      ))}
    </div>
  );
}
