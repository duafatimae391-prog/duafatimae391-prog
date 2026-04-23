"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, Plus, Trash2 } from "lucide-react";
import Background from "@/components/Background";
import { getTodo, saveTodo } from "@/lib/storage";
import { genId } from "@/lib/ids";
import type { TodoItem } from "@/lib/types";

export default function TodoPage() {
  const [items, setItems] = useState<TodoItem[]>([]);
  const [text, setText] = useState("");

  useEffect(() => {
    setItems(getTodo());
  }, []);

  const addItem = () => {
    if (!text.trim()) return;
    const item: TodoItem = { id: genId(), text: text.trim(), done: false, createdAt: Date.now() };
    const updated = [item, ...items];
    setItems(updated);
    saveTodo(updated);
    setText("");
  };

  const toggle = (id: string) => {
    const updated = items.map((i) => (i.id === id ? { ...i, done: !i.done } : i));
    setItems(updated);
    saveTodo(updated);
  };

  const deleteItem = (id: string) => {
    const updated = items.filter((i) => i.id !== id);
    setItems(updated);
    saveTodo(updated);
  };

  const pending = items.filter((i) => !i.done);
  const done = items.filter((i) => i.done);

  return (
    <div className="relative min-h-screen" style={{ color: "#E5E7EB" }}>
      <Background />
      <div className="relative z-10 flex flex-col min-h-screen max-w-[430px] mx-auto">
        {/* Header */}
        <div className="flex items-center gap-3 px-4 py-3" style={{ background: "#252525", borderBottom: "1px solid #2A2A2A" }}>
          <Link href="/" className="text-gray-400 hover:text-white">
            <ArrowLeft size={22} />
          </Link>
          <h1 className="text-lg font-bold text-white">To‑Do</h1>
          <span className="ml-auto text-xs text-gray-500">{pending.length} left</span>
        </div>

        {/* Add item */}
        <div className="px-4 py-4 flex gap-2" style={{ background: "#1a1a1a" }}>
          <input
            type="text"
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && addItem()}
            placeholder="Add a task…"
            className="flex-1 px-3 py-2 rounded-full text-sm text-white placeholder-gray-500 outline-none"
            style={{ background: "#333" }}
          />
          <button
            onClick={addItem}
            disabled={!text.trim()}
            className="w-10 h-10 rounded-full flex items-center justify-center shrink-0 transition-opacity"
            style={{ background: "#6E8EFB", opacity: text.trim() ? 1 : 0.5 }}
          >
            <Plus size={18} color="white" />
          </button>
        </div>

        {/* List */}
        <div className="flex-1 overflow-y-auto px-4 py-3 space-y-2">
          <AnimatePresence>
            {[...pending, ...done].map((item) => (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="flex items-center gap-3 rounded-2xl px-4 py-3"
                style={{ background: "#252525", border: "1px solid #2A2A2A" }}
              >
                {/* Checkbox */}
                <button
                  onClick={() => toggle(item.id)}
                  className="w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 transition-colors"
                  style={{
                    borderColor: item.done ? "#6E8EFB" : "#555",
                    background: item.done ? "#6E8EFB" : "transparent",
                  }}
                >
                  {item.done && <span className="text-white text-xs font-bold">✓</span>}
                </button>

                <span
                  className="flex-1 text-sm"
                  style={{
                    color: item.done ? "#555" : "#E5E7EB",
                    textDecoration: item.done ? "line-through" : "none",
                  }}
                >
                  {item.text}
                </span>

                <button
                  onClick={() => deleteItem(item.id)}
                  className="text-gray-600 hover:text-red-400 transition-colors shrink-0"
                >
                  <Trash2 size={14} />
                </button>
              </motion.div>
            ))}
          </AnimatePresence>
          {items.length === 0 && (
            <p className="text-gray-500 text-sm text-center pt-10">No tasks yet! Add one above ✅</p>
          )}
        </div>
      </div>
    </div>
  );
}
