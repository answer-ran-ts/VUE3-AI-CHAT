import { defineStore } from "pinia";
import { uuid } from "@/utils/uuid";
import type { Session, Message, ChatMessage } from "@/types/chat";
import { chatStream } from "@/api/openai";
import { ref, computed } from "vue";
function load(): Session[] {
  try {
    const raw = localStorage.getItem("ai-chat");
    if (raw) return JSON.parse(raw);
  } catch {}
  return [];
}
function save(list: Session[]) {
  localStorage.setItem("ai-chat", JSON.stringify(list));
}

export const useChat = defineStore("chat", () => {
  const sessions = ref<Session[]>(load());
  const currentId = ref<string>(
    sessions.value[0]?.id ?? createEmptySession().id
  );

  const current = computed(
    () => sessions.value.find((s) => s.id === currentId.value)!
  );

  function createEmptySession(): Session {
    const s: Session = {
      id: uuid(),
      title: "新会话",
      messages: [],
      model: import.meta.env.VITE_OPENAI_MODEL || "gpt-3.5-turbo",
      createdAt: Date.now(),
    };
    sessions.value.unshift(s);
    save(sessions.value);
    return s;
  }

  async function send(content: string) {
    if (!content.trim()) return;
    const userMsg: Message = {
      id: uuid(),
      role: "user",
      content,
      ts: Date.now(),
    };
    current.value.messages.push(userMsg);

    const assistantMsg: Message = {
      id: uuid(),
      role: "assistant",
      content: "",
      ts: Date.now(),
    };
    current.value.messages.push(assistantMsg);

    const ctrl = new AbortController();
    try {
      await chatStream(
        current.value.messages.map((m) => ({
          role: m.role,
          content: m.content,
        })),
        (delta) => {
          assistantMsg.content += delta;
          if (assistantMsg.content.length < 50)
            current.value.title = assistantMsg.content.slice(0, 20);
        },
        ctrl.signal
      );
    } catch (e: any) {
      assistantMsg.content = `❌ ${e.message}`;
    }
    save(sessions.value);
  }

  function clear() {
    current.value.messages = [];
    save(sessions.value);
  }

  function removeSession(id: string) {
    const idx = sessions.value.findIndex((s) => s.id === id);
    if (idx === -1) return;
    sessions.value.splice(idx, 1);
    if (currentId.value === id)
      currentId.value = sessions.value[0]?.id ?? createEmptySession().id;
    save(sessions.value);
  }

  return {
    sessions,
    currentId,
    current,
    send,
    clear,
    removeSession,
    createEmptySession,
  };
});
