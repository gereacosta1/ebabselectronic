// netlify/functions/ping.js
export const handler = async (event) => {
  if (event.httpMethod === "OPTIONS") return { statusCode: 200, body: "" };
  if (event.httpMethod === "GET") {
    return {
      statusCode: 200,
      headers: { "Content-Type": "application/json", "Cache-Control": "no-store" },
      body: JSON.stringify({ ok: true, ts: Date.now() }),
    };
  }
  return { statusCode: 405, body: "Method Not Allowed" };
};
