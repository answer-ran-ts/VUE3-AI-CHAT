// src/stores/chat.ts
import { defineStore } from "pinia";
import { ref, computed, nextTick } from "vue";
import { uuid } from "@/utils/uuid";
import { chatStream } from "@/api/openai";
import type { Session, Message } from "@/types/chat";

/* ---------- 本地持久化 ---------- */
const LS_KEY = "ai-chat-v1";
function load(): Session[] {
  try {
    const raw = localStorage.getItem(LS_KEY);
    if (raw) return JSON.parse(raw);
  } catch {}
  return [];
}
function save(list: Session[]) {
  localStorage.setItem(LS_KEY, JSON.stringify(list));
}

/* ---------- 核心 Store ---------- */
export const useChat = defineStore("chat", () => {
  /* ====== 状态 ====== */
  const sessions = ref<Session[]>(load()); // 所有会话
  const currentId = ref<string>(
    sessions.value[0]?.id ?? createEmptySession().id
  );
  const loading = ref(false); // 是否正在流式接收
  const ctrl = ref<AbortController | null>(null); // 用来中断流

  /* ====== 计算属性 ====== */
  const current = computed(
    () => sessions.value.find((s) => s.id === currentId.value)!
  );

  /* ====== 内部方法 ====== */
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

  /* ====== 业务动作 ====== */
  /** 发送一条用户消息并流式接收助手回复 */
  async function send(content: string) {
    if (loading.value || !content.trim()) return;
    loading.value = true;
    ctrl.value = new AbortController();

    // 1. 用户消息
    const userMsg: Message = {
      id: uuid(),
      role: "user",
      content,
      ts: Date.now(),
    };
    current.value.messages.push(userMsg);

    // 2. 空助手消息（先占位）
    const assistantMsg: Message = {
      id: uuid(),
      role: "assistant",
      content: "",
      ts: Date.now(),
    };
    current.value.messages.push(assistantMsg);

    // 3. 流式填充
    try {
      await chatStream(
        current.value.messages.map(({ role, content }) => ({ role, content })),
        (delta) => {
          assistantMsg.content += delta;
          // 动态标题：前 20 个字符
          if (assistantMsg.content.length < 50)
            current.value.title = assistantMsg.content.slice(0, 20);
          nextTick(() => scrollToBottom()); // 滚动到底部
        },
        ctrl.value.signal
      );
    } catch (e: any) {
      assistantMsg.content = `\`❌ ${e.message || "网络错误"}\``;
    } finally {
      loading.value = false;
      save(sessions.value);
    }
  }

  /** 中止当前流 */
  function abort() {
    ctrl.value?.abort();
    loading.value = false;
  }

  /** 清空当前会话 */
  function clear() {
    current.value.messages = [];
    save(sessions.value);
  }

  /** 删除指定会话 */
  function removeSession(id: string) {
    const idx = sessions.value.findIndex((s) => s.id === id);
    if (idx === -1) return;
    sessions.value.splice(idx, 1);
    // 如果删的是当前会话，自动切到第一个或新建
    if (currentId.value === id)
      currentId.value = sessions.value[0]?.id ?? createEmptySession().id;
    save(sessions.value);
  }

  /** 切换会话 */
  function switchSession(id: string) {
    currentId.value = id;
  }

  return {
    sessions,
    currentId,
    current,
    loading,
    send,
    abort,
    clear,
    removeSession,
    switchSession,
    createEmptySession,
  };
});
