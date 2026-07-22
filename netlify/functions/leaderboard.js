import { getStore } from "@netlify/blobs";

export default async (req, context) => {
  const store = getStore("leaderboard");

  if (req.method === "GET") {
    const data = await store.get("scores", { type: "json" }) || [];
    return new Response(JSON.stringify(data), {
      headers: { "Content-Type": "application/json" }
    });
  }

  if (req.method === "POST") {
    const { name, score, total, pct } = await req.json();
    const data = await store.get("scores", { type: "json" }) || [];
    data.push({ name: name || "Anonymous", score, total, pct, date: new Date().toISOString() });
    data.sort((a, b) => b.pct - a.pct || b.score - a.score);
    await store.setJSON("scores", data.slice(0, 50)); // keep top 50
    return new Response(JSON.stringify({ ok: true }));
  }

  return new Response("Method not allowed", { status: 405 });
};

export const config = { path: "/api/leaderboard" };
