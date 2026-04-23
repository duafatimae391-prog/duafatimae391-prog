"use client";
import { motion } from "framer-motion";

/** Orange robot – "Momo AI" */
export default function MomoRobot({ active = false }: { active?: boolean }) {
  return (
    <motion.div
      className="flex flex-col items-center select-none"
      animate={{ y: [8, -8, 8] }}
      transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
    >
      {/* Hair tuft */}
      <div className="flex gap-1 mb-0.5">
        {[0, 1, 2].map((i) => (
          <div
            key={i}
            className="rounded-full"
            style={{
              width: 6,
              height: 10 + i * 2,
              background: "#FF8C42",
              borderRadius: "999px",
              transform: i === 1 ? "translateY(-3px)" : "none",
            }}
          />
        ))}
      </div>

      {/* Head (blob round) */}
      <motion.div
        className="relative flex flex-col items-center justify-center"
        style={{
          width: 76,
          height: 76,
          borderRadius: "50%",
          background: "linear-gradient(180deg, #FFDDAA 0%, #FFB347 60%, #FF8C42 100%)",
        }}
        animate={{
          filter: [
            "drop-shadow(0 0 20px #FFB347)",
            "drop-shadow(0 0 35px #FFB347)",
            "drop-shadow(0 0 20px #FFB347)",
          ],
        }}
        transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
      >
        {/* Eyes */}
        <div className="flex gap-3 mb-1">
          {[0, 1].map((i) => (
            <div
              key={i}
              className="w-5 h-5 rounded-full bg-white"
              style={{ boxShadow: "0 0 12px #FFFFFF" }}
            />
          ))}
        </div>

        {/* Blush cheeks */}
        <div className="absolute flex gap-10" style={{ bottom: 16 }}>
          {[0, 1].map((i) => (
            <div
              key={i}
              className="relative"
              style={{ width: 16, height: 10, background: "#FFB1B1", borderRadius: "999px", opacity: 0.75 }}
            >
              {/* 3 tiny dots */}
              <div className="absolute -top-2 left-0 flex gap-0.5">
                {[0, 1, 2].map((d) => (
                  <div key={d} className="w-0.5 h-0.5 rounded-full bg-pink-400" />
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Smile */}
        <div
          style={{
            width: 22,
            height: 7,
            borderBottom: "2.5px solid rgba(255,255,255,0.8)",
            borderRadius: "0 0 11px 11px",
            marginTop: 2,
          }}
        />
      </motion.div>

      {/* Body merged */}
      <div
        style={{
          width: 56,
          height: 36,
          borderRadius: "40%",
          background: "linear-gradient(180deg, #FFB347 0%, #FF8C42 100%)",
          marginTop: 2,
          filter: "brightness(0.95)",
        }}
      />

      {/* Cloud base */}
      <CloudBase color="#ffe8c0" />

      {active && (
        <motion.div
          className="absolute inset-0"
          animate={{ scale: [1, 1.03, 1] }}
          transition={{ duration: 0.3 }}
        />
      )}
    </motion.div>
  );
}

function CloudBase({ color }: { color: string }) {
  return (
    <div className="relative flex items-end justify-center mt-1" style={{ width: 84, height: 22 }}>
      {[
        { w: 32, h: 22, l: 0 },
        { w: 42, h: 26, l: 20 },
        { w: 30, h: 20, l: 50 },
      ].map((c, i) => (
        <div
          key={i}
          className="absolute bottom-0 rounded-full"
          style={{ width: c.w, height: c.h, left: c.l, background: color, opacity: 0.85 }}
        />
      ))}
    </div>
  );
}
