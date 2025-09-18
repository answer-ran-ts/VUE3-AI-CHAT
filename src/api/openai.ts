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
      buf = lines.pop()!;
      for (const l of lines) {
        if (l.startsWith("data: ")) {
          const json = l.slice(6);
          if (json === "[DONE]") return;
          const delta = JSON.parse(json).choices?.[0]?.delta?.content;
          delta && onChunk(delta);
        }
      }
    }
  });
}
