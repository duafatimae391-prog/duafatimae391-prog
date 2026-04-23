"use client";
import { useState, useEffect, useRef } from "react";
import Background from "@/components/Background";
import PhoneFrame from "@/components/PhoneFrame";
import HeaderBar from "@/components/HeaderBar";
import BuddyRobot from "@/components/BuddyRobot";
import MomoRobot from "@/components/MomoRobot";
import ThoughtBubble from "@/components/ThoughtBubble";
import TypingDots from "@/components/TypingDots";
import ChatComposer from "@/components/ChatComposer";
import { getMessages, saveMessages, getSettings } from "@/lib/storage";
import { genId } from "@/lib/ids";
import type { ChatMessage } from "@/lib/types";

export default function ChatPage() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [buddyActive, setBuddyActive] = useState(false);
  const [momoActive, setMomoActive] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  const settings = typeof window !== "undefined" ? getSettings() : { language: "both" as const, emojis: true, glowIntensity: "med" as const };

  // Restore chat from localStorage
  useEffect(() => {
    setMessages(getMessages());
  }, []);

  // Persist messages
  useEffect(() => {
    if (messages.length > 0) saveMessages(messages);
  }, [messages]);

  // Auto-scroll to bottom
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isLoading]);

  const placeholderMap: Record<"urdu" | "english" | "both", string> = {
    urdu: "پیغام لکھیں…",
    english: "Message…",
    both: "Message / پیغام…",
  };

  const handleSend = async () => {
    const text = input.trim();
    if (!text || isLoading) return;

    const buddyMsg: ChatMessage = { id: genId(), role: "buddy", content: text, createdAt: Date.now() };
    const nextMsgs = [...messages, buddyMsg];
    setMessages(nextMsgs);
    setInput("");
    setBuddyActive(true);
    setTimeout(() => setBuddyActive(false), 400);

    setIsLoading(true);
    setMomoActive(true);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: nextMsgs.map((m) => ({
            role: m.role === "buddy" ? "user" : "assistant",
            content: m.content,
          })),
          emojis: settings.emojis,
          language: settings.language,
        }),
      });

      const data = await res.json();
      const aiMsg: ChatMessage = {
        id: genId(),
        role: "ai",
        content: data.message || "Oops! My brain froze 🥶",
        createdAt: Date.now(),
      };
      setMessages((prev) => [...prev, aiMsg]);
    } catch {
      const errMsg: ChatMessage = {
        id: genId(),
        role: "ai",
        content: "Oops! My brain froze 🥶",
        createdAt: Date.now(),
      };
      setMessages((prev) => [...prev, errMsg]);
    } finally {
      setIsLoading(false);
      setMomoActive(false);
    }
  };

  // Split messages: last buddy msg, last ai msg for display
  const lastBuddy = [...messages].reverse().find((m) => m.role === "buddy");
  const lastAi = [...messages].reverse().find((m) => m.role === "ai");

  return (
    <div className="relative min-h-screen" style={{ color: "#E5E7EB" }}>
      <Background glow={settings.glowIntensity} />
      <PhoneFrame>
        <HeaderBar />

        {/* Robot scene + current thought bubbles */}
        <div className="relative flex items-end justify-between px-4 pt-4 shrink-0" style={{ height: "42%" }}>
          {/* Buddy left */}
          <div className="flex flex-col items-center gap-2" style={{ flex: "0 0 auto" }}>
            {lastBuddy && (
              <ThoughtBubble side="left">
                <span style={{ fontSize: 13 }}>{lastBuddy.content}</span>
              </ThoughtBubble>
            )}
            <BuddyRobot active={buddyActive} />
            <span className="text-xs text-gray-400 font-semibold">My Buddy</span>
          </div>

          {/* Momo right */}
          <div className="flex flex-col items-center gap-2" style={{ flex: "0 0 auto" }}>
            {isLoading ? (
              <ThoughtBubble side="right">
                <TypingDots />
              </ThoughtBubble>
            ) : lastAi ? (
              <ThoughtBubble side="right">
                <span style={{ fontSize: 13 }}>{lastAi.content}</span>
              </ThoughtBubble>
            ) : null}
            <MomoRobot active={momoActive} />
            <span className="text-xs text-gray-400 font-semibold">Momo AI</span>
          </div>
        </div>

        {/* Message history scroll area */}
        <div
          className="chat-scroll flex-1 overflow-y-auto px-4 py-3 flex flex-col gap-6"
          style={{ minHeight: 0 }}
        >
          {messages.length === 0 && !isLoading && (
            <div className="flex-1 flex items-center justify-center">
              <p className="text-gray-500 text-sm text-center">
                Say hi to start chatting! 👋
              </p>
            </div>
          )}
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex ${msg.role === "buddy" ? "justify-start" : "justify-end"}`}
            >
              <div className={`flex flex-col ${msg.role === "buddy" ? "items-start" : "items-end"} gap-1 max-w-[75%]`}>
                <span className="text-xs text-gray-500 px-1">
                  {msg.role === "buddy" ? "My Buddy" : "Momo AI"}
                </span>
                <ThoughtBubble side={msg.role === "buddy" ? "left" : "right"}>
                  <span style={{ fontSize: 13 }}>{msg.content}</span>
                </ThoughtBubble>
              </div>
            </div>
          ))}
          {isLoading && (
            <div className="flex justify-end">
              <div className="flex flex-col items-end gap-1">
                <span className="text-xs text-gray-500 px-1">Momo AI</span>
                <ThoughtBubble side="right">
                  <TypingDots />
                </ThoughtBubble>
              </div>
            </div>
          )}
          <div ref={bottomRef} />
        </div>

        <ChatComposer
          value={input}
          onChange={setInput}
          onSend={handleSend}
          disabled={isLoading}
          placeholder={placeholderMap[settings.language]}
        />
      </PhoneFrame>
    </div>
  );
}
