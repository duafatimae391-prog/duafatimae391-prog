"use client";
import { motion } from "framer-motion";

/** Blue robot – "My Buddy" */
export default function BuddyRobot({ active = false }: { active?: boolean }) {
  return (
    <motion.div
      className="flex flex-col items-center select-none"
      animate={{ y: [-8, 8, -8] }}
      transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
    >
      {/* Antenna */}
      <div className="flex flex-col items-center mb-1">
        <div
          className="w-2 h-2 rounded-full"
          style={{
            background: "#A777E3",
            boxShadow: "0 0 8px #A777E3",
          }}
        />
        <div className="w-0.5 h-4 bg-gray-400 opacity-60" />
      </div>

      {/* Head */}
      <motion.div
        className="relative flex flex-col items-center justify-center"
        style={{
          width: 72,
          height: 72,
          borderRadius: "45%",
          background: "linear-gradient(180deg, #8A9CFF 0%, #6E8EFB 50%, #A777E3 100%)",
          filter: "brightness(1.1)",
        }}
        animate={{
          filter: [
            "brightness(1.1) drop-shadow(0 0 20px #A777E3)",
            "brightness(1.15) drop-shadow(0 0 35px #A777E3)",
            "brightness(1.1) drop-shadow(0 0 20px #A777E3)",
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
              style={{ boxShadow: "0 0 15px #FFFFFF" }}
            />
          ))}
        </div>
        {/* Smile */}
        <div
          style={{
            width: 24,
            height: 8,
            borderBottom: "2.5px solid rgba(255,255,255,0.8)",
            borderRadius: "0 0 12px 12px",
          }}
        />
        {/* Chest emblem */}
        <div
          className="absolute bottom-1 left-1/2 -translate-x-1/2 rounded-full border-2"
          style={{
            width: 14,
            height: 14,
            borderColor: "rgba(255,255,255,0.7)",
            boxShadow: "0 0 6px rgba(255,255,255,0.5)",
          }}
        >
          <div
            className="absolute inset-1 rounded-full"
            style={{ background: "rgba(255,255,255,0.5)" }}
          />
        </div>
      </motion.div>

      {/* Body */}
      <div
        className="mt-1"
        style={{
          width: 52,
          height: 38,
          borderRadius: "40%",
          background: "linear-gradient(180deg, #6E8EFB 0%, #A777E3 100%)",
          filter: "brightness(0.95)",
        }}
      />

      {/* Cloud base */}
      <CloudBase color="#d8d8f0" />

      {/* Bounce on active */}
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
    <div className="relative flex items-end justify-center mt-1" style={{ width: 80, height: 22 }}>
      {[
        { w: 32, h: 22, l: 0 },
        { w: 40, h: 26, l: 18 },
        { w: 30, h: 20, l: 46 },
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
