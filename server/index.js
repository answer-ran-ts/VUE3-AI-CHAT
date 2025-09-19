import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import OpenAI from "openai";
dotenv.config();

const app = express();
app.use(cors());
app.use(express.json({ limit: "1mb" }));

const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
const OPENAI_BASE_URL =
  process.env.OPENAI_BASE_URL || "https://api.openai.com/v1";
const DEFAULT_MODEL = process.env.OPENAI_MODEL || "gpt-4o-mini";

if (!OPENAI_API_KEY) {
  console.error("Missing OPENAI_API_KEY in environment.");
}

const openai = new OpenAI({ apiKey: OPENAI_API_KEY, baseURL: OPENAI_BASE_URL });

app.post("/api/chat", async (req, res) => {
  try {
    const { messages, model, temperature, maxTokens, topP } = req.body || {};
    if (!Array.isArray(messages))
      return res.status(400).json({ error: "messages must be an array" });

    // ---------- 1. 开启 SSE ----------
    res.setHeader("Content-Type", "text/event-stream; charset=utf-8");
    res.setHeader("Cache-Control", "no-cache, no-transform");
    res.setHeader("Connection", "keep-alive");
    res.setHeader("X-Accel-Buffering", "no"); // 关 Nginx 缓冲
    res.flushHeaders(); // 先刷一次头，让前端 200 立刻返回

    // ---------- 2. 调 OpenAI 流式接口 ----------
    const completion = await openai.chat.completions.create({
      messages,
      model: model || DEFAULT_MODEL,
      temperature,
      max_tokens: maxTokens,
      top_p: topP,
      stream: true, // 关键：开启流式
    });

    // ---------- 3. 一行一行转发给前端 ----------
    for await (const chunk of completion) {
      // 只把 delta 内容发出去，也可以直接裸转 chunk
      const delta = chunk.choices[0]?.delta?.content ?? "";
      if (delta) {
        res.write(`data: ${JSON.stringify({ content: delta })}\n\n`);
      }
    }

    // ---------- 4. 正常结束 ----------
    res.write("data: [DONE]\n\n");
    res.end();
  } catch (e) {
    // 出错时也要按 SSE 格式抛，前端 onerror 能拿到
    res.write(`data: ${JSON.stringify({ error: String(e) })}\n\n`);
    res.end();
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
