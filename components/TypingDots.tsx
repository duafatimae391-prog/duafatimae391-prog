"use client";
import { motion } from "framer-motion";

/** Animated typing indicator – 3 pulsing dots */
export default function TypingDots() {
  return (
    <div className="flex gap-1.5 items-center px-2 py-1">
      {[0, 1, 2].map((i) => (
        <motion.div
          key={i}
          className="w-2 h-2 rounded-full"
          style={{ background: "#2D2D4A" }}
          animate={{ opacity: [0.3, 1, 0.3] }}
          transition={{
            duration: 1.2,
            repeat: Infinity,
            ease: "easeInOut",
            delay: i * 0.2,
          }}
        />
      ))}
    </div>
  );
}
