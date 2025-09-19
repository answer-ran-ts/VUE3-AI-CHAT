export function chatStream(
  messages: ChatMessage[],
  onChunk: (d: string) => void,
  signal?: AbortSignal
) {
  return fetch("/api/chat", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: import.meta.env.VITE_OPENAI_MODEL,
      messages,
      stream: true,
      temperature: 0.7,
    }),
    signal,
  }).then(async (res) => {
    if (!res.ok) throw new Error(await res.text());

    const reader = res.body!.getReader();
    const decoder = new TextDecoder();
    let buf = "";

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      buf += decoder.decode(value, { stream: true });
      const lines = buf.split("\n");
      buf = lines.pop()!; // 最后一行可能不完整，留到下次

      for (const l of lines) {
        if (l.startsWith("data: ")) {
          const payload = l.slice(6);
          if (payload === "[DONE]") return; // 结束标记
          try {
            const { content } = JSON.parse(payload);
            content && onChunk(content);
          } catch {
            // 忽略解析失败的意外行
          }
        }
      }
    }
  });
}
