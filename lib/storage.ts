import type { ChatMessage, Note, TodoItem, Settings } from "./types";

const KEYS = {
  messages: "robochat.messages.v1",
  notes: "robochat.notes.v1",
  todo: "robochat.todo.v1",
  settings: "robochat.settings.v1",
};

function safeGet<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") return fallback;
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

function safeSet(key: string, value: unknown): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // quota exceeded – silently ignore
  }
}

// ── Messages ─────────────────────────────────────────────────────────────────
export const getMessages = (): ChatMessage[] =>
  safeGet<ChatMessage[]>(KEYS.messages, []);

export const saveMessages = (msgs: ChatMessage[]): void =>
  safeSet(KEYS.messages, msgs);

// ── Notes ────────────────────────────────────────────────────────────────────
export const getNotes = (): Note[] => safeGet<Note[]>(KEYS.notes, []);

export const saveNotes = (notes: Note[]): void => safeSet(KEYS.notes, notes);

// ── Todo ─────────────────────────────────────────────────────────────────────
export const getTodo = (): TodoItem[] => safeGet<TodoItem[]>(KEYS.todo, []);

export const saveTodo = (items: TodoItem[]): void => safeSet(KEYS.todo, items);

// ── Settings ─────────────────────────────────────────────────────────────────
const defaultSettings: Settings = {
  language: "both",
  emojis: true,
  glowIntensity: "med",
};

export const getSettings = (): Settings =>
  safeGet<Settings>(KEYS.settings, defaultSettings);

export const saveSettings = (s: Settings): void => safeSet(KEYS.settings, s);

// ── Clear All ─────────────────────────────────────────────────────────────────
export const clearAll = (): void => {
  if (typeof window === "undefined") return;
  Object.values(KEYS).forEach((k) => localStorage.removeItem(k));
};
