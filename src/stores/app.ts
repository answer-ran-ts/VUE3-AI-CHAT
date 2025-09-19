import { defineStore } from "pinia";
import { uuid } from "../utils/uuid";
import type { Session, Message } from "../types/chat";
import { chatStream } from "../api/openai";
import { ref, computed } from "vue";

/* 持久化读写 */
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
  const loading = ref(false); // 新增 loading
  /* 1.  统一兜底：若本地没有会话，先建一个 */
  const currentId = ref<string>("");
  if (!sessions.value.length) {
    currentId.value = createEmptySession().id;
  } else {
    currentId.value = sessions.value[0].id;
  }

  const current = computed(
    () => sessions.value.find((s) => s.id === currentId.value)!
  );

  /* 2. 新建空会话并立即激活 */
  function createEmptySession(): Session {
    const s: Session = {
      id: uuid(),
      title: "新会话",
      messages: [],
      model: import.meta.env.VITE_OPENAI_MODEL || "gpt-3.5-turbo",
      createdAt: Date.now(),
      isPristine: true,
    };
    sessions.value.unshift(s); // 放在最前
    currentId.value = s.id; // 立即锁定到新会话
    save(sessions.value);
    return s;
  }

  /* 3. 发消息 */
  async function send(content: string) {
    if (!content.trim()) return;
    loading.value = true;
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
    const reactiveAssistantMsg =
      current.value.messages[current.value.messages.length - 1];

    /* 第一条消息后就不再是“ pristine ” */
    current.value.isPristine = false;

    const ctrl = new AbortController();
    try {
      await chatStream(
        current.value.messages.map((m) => ({
          role: m.role,
          content: m.content,
        })),
        (delta) => {
          reactiveAssistantMsg.content += delta;
          if (reactiveAssistantMsg.content.length < 50) {
            current.value.title = reactiveAssistantMsg.content.slice(0, 20);
          }
        },
        ctrl.signal
      );
    } catch (e: any) {
      reactiveAssistantMsg.content = `❌ ${e.message}`;
    } finally {
      loading.value = false;
    }
    save(sessions.value);
  }

  /* 4. 清空当前会话 */
  function clear() {
    current.value.messages = [];
    current.value.isPristine = true; // 重新变回空状态
    save(sessions.value);
  }

  /* 5. 删除会话 */
  function removeSession(id: string) {
    const idx = sessions.value.findIndex((s) => s.id === id);
    if (idx === -1) return;
    sessions.value.splice(idx, 1);
    /* 如果删的是当前会话，则自动切到最新一条（顶部） */
    if (currentId.value === id) {
      currentId.value = sessions.value[0]?.id ?? createEmptySession().id;
    }
    save(sessions.value);
  }

  return {
    sessions,
    currentId,
    current,
    loading,
    send,
    clear,
    removeSession,
    createEmptySession,
  };
});
