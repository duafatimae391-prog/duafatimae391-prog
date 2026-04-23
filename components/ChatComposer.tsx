"use client";
import { FormEvent, KeyboardEvent, useRef } from "react";
import { motion } from "framer-motion";
import { SendHorizonal } from "lucide-react";

interface Props {
  value: string;
  onChange: (v: string) => void;
  onSend: () => void;
  disabled?: boolean;
  placeholder?: string;
}

export default function ChatComposer({ value, onChange, onSend, disabled, placeholder = "Message…" }: Props) {
  const inputRef = useRef<HTMLInputElement>(null);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (value.trim() && !disabled) {
      onSend();
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  };

  const handleKey = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      if (value.trim() && !disabled) {
        onSend();
        setTimeout(() => inputRef.current?.focus(), 50);
      }
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="flex items-center gap-2 px-3 py-3 shrink-0"
      style={{ background: "#252525", borderTop: "1px solid #2A2A2A" }}
    >
      <input
        ref={inputRef}
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={handleKey}
        placeholder={placeholder}
        disabled={disabled}
        className="flex-1 rounded-full px-4 py-2 text-sm text-white placeholder-gray-500 outline-none"
        style={{ background: "#333", border: "none" }}
        autoComplete="off"
      />
      <motion.button
        type="submit"
        disabled={disabled || !value.trim()}
        whileTap={{ scale: 0.9 }}
        className="w-10 h-10 rounded-full flex items-center justify-center shrink-0 transition-opacity"
        style={{
          background: "#0084ff",
          opacity: disabled || !value.trim() ? 0.5 : 1,
        }}
      >
        <SendHorizonal size={18} color="white" />
      </motion.button>
    </form>
  );
}
