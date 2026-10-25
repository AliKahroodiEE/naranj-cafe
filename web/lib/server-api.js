// Server-side data access: Server Components call the Express API directly.
const API_URL = process.env.API_URL || "http://localhost:4000";

export async function getMenu() {
  const res = await fetch(`${API_URL}/api/menu`, { cache: "no-store" });
  if (!res.ok) throw new Error(`Menu request failed: ${res.status}`);
  return res.json();
}
