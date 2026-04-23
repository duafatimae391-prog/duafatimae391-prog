import Link from "next/link";
import Background from "@/components/Background";
import { MessageCircle, FileText, CheckSquare, Settings } from "lucide-react";

const cards = [
  { href: "/chat", icon: MessageCircle, label: "Chat", color: "#6E8EFB", glow: "#6E8EFB" },
  { href: "/notes", icon: FileText, label: "Notes", color: "#A777E3", glow: "#A777E3" },
  { href: "/todo", icon: CheckSquare, label: "To‑Do", color: "#FFB347", glow: "#FFB347" },
  { href: "/settings", icon: Settings, label: "Settings", color: "#FF8C42", glow: "#FF8C42" },
];

export default function Home() {
  return (
    <div className="relative min-h-screen flex flex-col items-center justify-center px-6" style={{ color: "#E5E7EB" }}>
      <Background />
      <div className="relative z-10 w-full max-w-sm">
        {/* Logo area */}
        <div className="text-center mb-10">
          <div
            className="mx-auto mb-4 w-20 h-20 rounded-full flex items-center justify-center text-3xl"
            style={{
              background: "linear-gradient(135deg, #6E8EFB, #A777E3)",
              boxShadow: "0 0 30px rgba(110,142,251,0.6)",
            }}
          >
            🤖
          </div>
          <h1 className="text-3xl font-bold text-white">RoboChat</h1>
          <p className="text-gray-400 text-sm mt-1">Your magical AI buddy awaits ✨</p>
        </div>

        {/* Grid of cards */}
        <div className="grid grid-cols-2 gap-4">
          {cards.map(({ href, icon: Icon, label, color, glow }) => (
            <Link key={href} href={href}>
              <div
                className="rounded-2xl p-5 flex flex-col items-center gap-3 cursor-pointer transition-transform active:scale-95 hover:scale-105"
                style={{
                  background: "#252525",
                  border: "1px solid #2A2A2A",
                  boxShadow: `0 0 20px ${glow}22`,
                }}
              >
                <div
                  className="w-12 h-12 rounded-xl flex items-center justify-center"
                  style={{ background: `${color}22`, boxShadow: `0 0 12px ${color}44` }}
                >
                  <Icon size={24} color={color} />
                </div>
                <span className="text-white font-semibold text-sm">{label}</span>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
