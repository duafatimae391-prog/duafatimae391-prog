export type Role = "buddy" | "ai";

export interface ChatMessage {
  id: string;
  role: Role;
  content: string;
  createdAt: number;
}

export interface Note {
  id: string;
  title: string;
  body: string;
  createdAt: number;
}

export interface TodoItem {
  id: string;
  text: string;
  done: boolean;
  createdAt: number;
}

export interface Settings {
  language: "urdu" | "english" | "both";
  emojis: boolean;
  glowIntensity: "low" | "med" | "high";
}
