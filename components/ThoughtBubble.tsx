"use client";
import { motion } from "framer-motion";
import { ReactNode } from "react";

interface Props {
  side: "left" | "right";
  children: ReactNode;
}

/** Comic thought bubble with cloud + 2 tail circles */
export default function ThoughtBubble({ side, children }: Props) {
  const isLeft = side === "left";

  return (
    <motion.div
      className="relative inline-block max-w-[200px]"
      initial={{ scale: 0.9, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ type: "spring", stiffness: 300, damping: 20 }}
    >
      {/* Main bubble */}
      <div
        className="thought-bubble px-4 py-3 text-sm font-bold leading-snug"
        style={{
          background: "white",
          color: "#2D2D4A",
          borderRadius: 32,
          boxShadow: "0 0 30px rgba(255,255,255,0.35)",
          position: "relative",
          minWidth: 60,
          textAlign: "center",
        }}
      >
        {children}
      </div>

      {/* Tail circles */}
      <div
        className="absolute"
        style={{
          bottom: -14,
          [isLeft ? "left" : "right"]: 28,
          width: 16,
          height: 16,
          background: "white",
          borderRadius: "50%",
        }}
      />
      <div
        className="absolute"
        style={{
          bottom: -24,
          [isLeft ? "left" : "right"]: 22,
          width: 10,
          height: 10,
          background: "white",
          borderRadius: "50%",
        }}
      />
      <div
        className="absolute"
        style={{
          bottom: -32,
          [isLeft ? "left" : "right"]: 18,
          width: 6,
          height: 6,
          background: "white",
          borderRadius: "50%",
        }}
      />
    </motion.div>
  );
}
