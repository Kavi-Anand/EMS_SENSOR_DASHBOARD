export interface Reading {
  temperature: number;
  humidity: number;
  pressure: number;
  timestamp: number;
}

const API_BASE = import.meta.env.VITE_API_BASE_URL || "http://127.0.0.1:5000";

export async function getLatest(): Promise<{status: string; data: Reading | null}> {
  const response = await fetch(`${API_BASE}/api/latest`, { cache: "no-store" });
  if (!response.ok) throw new Error(`API returned ${response.status}`);
  return response.json();
}

export async function getHistory(): Promise<Reading[]> {
  const response = await fetch(`${API_BASE}/api/history`, { cache: "no-store" });
  if (!response.ok) throw new Error(`API returned ${response.status}`);
  return response.json();
}
