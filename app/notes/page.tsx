"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, Plus, Trash2, Copy } from "lucide-react";
import Background from "@/components/Background";
import { getNotes, saveNotes } from "@/lib/storage";
import { genId } from "@/lib/ids";
import type { Note } from "@/lib/types";

export default function NotesPage() {
  const [notes, setNotes] = useState<Note[]>([]);
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    setNotes(getNotes());
  }, []);

  const addNote = () => {
    if (!body.trim()) return;
    const note: Note = { id: genId(), title: title.trim(), body: body.trim(), createdAt: Date.now() };
    const updated = [note, ...notes];
    setNotes(updated);
    saveNotes(updated);
    setTitle("");
    setBody("");
  };

  const deleteNote = (id: string) => {
    const updated = notes.filter((n) => n.id !== id);
    setNotes(updated);
    saveNotes(updated);
  };

  const copyAll = async () => {
    const text = notes.map((n) => `${n.title ? n.title + "\n" : ""}${n.body}`).join("\n\n---\n\n");
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="relative min-h-screen" style={{ color: "#E5E7EB" }}>
      <Background />
      <div className="relative z-10 flex flex-col min-h-screen max-w-[430px] mx-auto">
        {/* Header */}
        <div className="flex items-center gap-3 px-4 py-3" style={{ background: "#252525", borderBottom: "1px solid #2A2A2A" }}>
          <Link href="/" className="text-gray-400 hover:text-white">
            <ArrowLeft size={22} />
          </Link>
          <h1 className="text-lg font-bold text-white">Notes</h1>
          {notes.length > 0 && (
            <button onClick={copyAll} className="ml-auto flex items-center gap-1 text-xs text-gray-400 hover:text-white transition-colors">
              <Copy size={14} />
              {copied ? "Copied!" : "Copy all"}
            </button>
          )}
        </div>

        {/* Add note form */}
        <div className="px-4 py-4 space-y-2" style={{ background: "#1a1a1a" }}>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Title (optional)"
            className="w-full px-3 py-2 rounded-xl text-sm text-white placeholder-gray-500 outline-none"
            style={{ background: "#333" }}
          />
          <textarea
            value={body}
            onChange={(e) => setBody(e.target.value)}
            placeholder="Write your note…"
            rows={3}
            className="w-full px-3 py-2 rounded-xl text-sm text-white placeholder-gray-500 outline-none resize-none"
            style={{ background: "#333" }}
          />
          <button
            onClick={addNote}
            disabled={!body.trim()}
            className="flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold transition-opacity"
            style={{ background: "#6E8EFB", color: "white", opacity: body.trim() ? 1 : 0.5 }}
          >
            <Plus size={16} /> Add Note
          </button>
        </div>

        {/* Notes list */}
        <div className="flex-1 overflow-y-auto px-4 py-3 space-y-3">
          <AnimatePresence>
            {notes.map((note) => (
              <motion.div
                key={note.id}
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="rounded-2xl p-4 relative"
                style={{ background: "#252525", border: "1px solid #2A2A2A" }}
              >
                {note.title && <p className="font-semibold text-white mb-1 text-sm">{note.title}</p>}
                <p className="text-gray-300 text-sm whitespace-pre-wrap">{note.body}</p>
                <button
                  onClick={() => deleteNote(note.id)}
                  className="absolute top-3 right-3 text-gray-500 hover:text-red-400 transition-colors"
                >
                  <Trash2 size={15} />
                </button>
              </motion.div>
            ))}
          </AnimatePresence>
          {notes.length === 0 && (
            <p className="text-gray-500 text-sm text-center pt-10">No notes yet. Start writing! 📝</p>
          )}
        </div>
      </div>
    </div>
  );
}
