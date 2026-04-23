"use client";
import Link from "next/link";
import { Settings } from "lucide-react";

interface Props {
  title?: string;
  showSettings?: boolean;
}

export default function HeaderBar({ title = "RoboChat", showSettings = true }: Props) {
  return (
    <header
      className="flex items-center justify-between px-4 py-3 shrink-0"
      style={{ background: "#252525", borderBottom: "1px solid #2A2A2A" }}
    >
      {/* Left: avatar + title + status */}
      <div className="flex items-center gap-3">
        <div
          className="w-9 h-9 rounded-full shrink-0"
          style={{
            background: "linear-gradient(135deg, #6E8EFB, #A777E3)",
            boxShadow: "0 0 12px rgba(110,142,251,0.7)",
          }}
        />
        <div>
          <p className="text-white font-bold text-base leading-none">{title}</p>
          <div className="flex items-center gap-1 mt-0.5">
            <span className="w-2 h-2 rounded-full bg-green-400 inline-block" />
            <span className="text-green-400 text-xs">Online</span>
          </div>
        </div>
      </div>

      {/* Right: settings icon */}
      {showSettings && (
        <Link href="/settings" className="text-gray-400 hover:text-white transition-colors p-1">
          <Settings size={22} />
        </Link>
      )}
    </header>
  );
}
