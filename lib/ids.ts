/** Generate a simple unique ID */
export function genId(): string {
  return Math.random().toString(36).slice(2) + Date.now().toString(36);
}
