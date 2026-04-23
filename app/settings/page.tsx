"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import Background from "@/components/Background";
import { getSettings, saveSettings, clearAll, saveMessages } from "@/lib/storage";
import type { Settings } from "@/lib/types";

type GlowOpt = "low" | "med" | "high";
type LangOpt = "urdu" | "english" | "both";

export default function SettingsPage() {
  const [settings, setSettings] = useState<Settings>({
    language: "both",
    emojis: true,
    glowIntensity: "med",
  });
  const [cleared, setCleared] = useState(false);

  useEffect(() => {
    setSettings(getSettings());
  }, []);

  const update = <K extends keyof Settings>(key: K, val: Settings[K]) => {
    const next = { ...settings, [key]: val };
    setSettings(next);
    saveSettings(next);
  };

  const clearChat = () => {
    saveMessages([]);
    setCleared(true);
    setTimeout(() => setCleared(false), 2000);
  };

  const clearEverything = () => {
    clearAll();
    setCleared(true);
    setTimeout(() => setCleared(false), 2000);
  };

  const OptionBtn = ({
    active,
    onClick,
    children,
  }: {
    active: boolean;
    onClick: () => void;
    children: React.ReactNode;
  }) => (
    <button
      onClick={onClick}
      className="px-4 py-1.5 rounded-full text-sm font-semibold transition-all"
      style={{
        background: active ? "#6E8EFB" : "#333",
        color: active ? "white" : "#aaa",
        boxShadow: active ? "0 0 10px #6E8EFB66" : "none",
      }}
    >
      {children}
    </button>
  );

  return (
    <div className="relative min-h-screen" style={{ color: "#E5E7EB" }}>
      <Background />
      <div className="relative z-10 flex flex-col min-h-screen max-w-[430px] mx-auto">
        {/* Header */}
        <div className="flex items-center gap-3 px-4 py-3" style={{ background: "#252525", borderBottom: "1px solid #2A2A2A" }}>
          <Link href="/" className="text-gray-400 hover:text-white">
            <ArrowLeft size={22} />
          </Link>
          <h1 className="text-lg font-bold text-white">Settings</h1>
        </div>

        <div className="flex-1 overflow-y-auto px-4 py-6 space-y-6">
          {/* Language */}
          <Section title="Language Mode">
            <div className="flex gap-2 flex-wrap">
              {(["english", "urdu", "both"] as LangOpt[]).map((l) => (
                <OptionBtn key={l} active={settings.language === l} onClick={() => update("language", l)}>
                  {l === "both" ? "Both" : l === "urdu" ? "Urdu" : "English"}
                </OptionBtn>
              ))}
            </div>
          </Section>

          {/* Emojis */}
          <Section title="Emoji Replies">
            <div className="flex gap-2">
              <OptionBtn active={settings.emojis} onClick={() => update("emojis", true)}>
                On 😊
              </OptionBtn>
              <OptionBtn active={!settings.emojis} onClick={() => update("emojis", false)}>
                Off
              </OptionBtn>
            </div>
          </Section>

          {/* Glow */}
          <Section title="Glow Intensity">
            <div className="flex gap-2">
              {(["low", "med", "high"] as GlowOpt[]).map((g) => (
                <OptionBtn key={g} active={settings.glowIntensity === g} onClick={() => update("glowIntensity", g)}>
                  {g === "low" ? "Low" : g === "med" ? "Medium" : "High"}
                </OptionBtn>
              ))}
            </div>
          </Section>

          {/* Danger zone */}
          <Section title="Data">
            <div className="space-y-3">
              <DangerBtn onClick={clearChat} label="Clear Chat History" />
              <DangerBtn onClick={clearEverything} label="Clear All Data (notes + todo + chat)" />
            </div>
            {cleared && <p className="text-green-400 text-xs mt-2">✓ Cleared successfully!</p>}
          </Section>
        </div>
      </div>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-2xl p-4 space-y-3" style={{ background: "#252525", border: "1px solid #2A2A2A" }}>
      <h2 className="text-sm font-bold text-gray-300 uppercase tracking-wider">{title}</h2>
      {children}
    </div>
  );
}

function DangerBtn({ onClick, label }: { onClick: () => void; label: string }) {
  return (
    <button
      onClick={onClick}
      className="w-full py-2 px-4 rounded-full text-sm font-semibold text-red-400 transition-colors hover:bg-red-900/20"
      style={{ border: "1px solid #ff444422" }}
    >
      {label}
    </button>
  );
}
