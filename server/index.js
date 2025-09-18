import express from "express";
import cors from "cors";
import dotenv from "dotenv";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json({ limit: "1mb" }));

const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
const OPENAI_BASE_URL =
  process.env.OPENAI_BASE_URL || "https://api.openai.com/v1";
const DEFAULT_MODEL = process.env.OPENAI_MODEL || "gpt-4o-mini";

if (!OPENAI_API_KEY) {
  // eslint-disable-next-line no-console
  console.error("Missing OPENAI_API_KEY in environment.");
}

app.post("/api/chat", async (req, res) => {
  try {
    const {
      messages,
      model,
      temperature = 0.7,
      stream = true,
    } = req.body || {};
    if (!Array.isArray(messages)) {
      res.status(400).json({ error: "messages must be an array" });
      return;
    }

    const upstream = await fetch(`${OPENAI_BASE_URL}/chat/completions`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: model || DEFAULT_MODEL,
        messages,
        temperature,
        stream,
      }),
    });

    if (!upstream.ok || !upstream.body) {
      const text = await upstream.text();
      res.status(upstream.status).send(text);
      return;
    }

    res.setHeader("Content-Type", "text/event-stream; charset=utf-8");
    res.setHeader("Cache-Control", "no-cache, no-transform");
    res.setHeader("X-Accel-Buffering", "no");

    upstream.body.on("data", (chunk) => {
      res.write(chunk);
    });
    upstream.body.on("end", () => res.end());
    upstream.body.on("error", (err) => {
      res.end();
      // eslint-disable-next-line no-console
      console.error("Stream error:", err);
    });
  } catch (e) {
    res.status(500).json({ error: String(e) });
  }
});

app.post("/api/test", (req, res) => {
  res.json({ code: 0, msg: "pong", ts: Date.now() });
});

const port = Number(process.env.PORT || 8787);
app.listen(port, () => {
  // eslint-disable-next-line no-console
  console.log(`Server listening on http://localhost:${port}`);
});
