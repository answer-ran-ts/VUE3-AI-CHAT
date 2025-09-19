<template>
  <div class="chat-input">
    <n-input
      v-model:value="text"
      type="textarea"
      :placeholder="loading ? 'AI 正在思考…' : 'Shift+Enter 换行，Enter 发送'"
      :disabled="loading"
      :autosize="{ minRows: 1, maxRows: 6 }"
      @keydown="handleKey"
      @compositionstart="onCompositionStart"
      @compositionend="onCompositionEnd"
    />
    <n-button type="primary" :disabled="loading" @click="submit">发送</n-button>
  </div>
</template>

<script setup lang="ts">
import { useChat } from "@/stores/app";
import { ref } from "vue";
import { storeToRefs } from "pinia";
const chat = useChat();
const { loading } = storeToRefs(chat);
const { send } = chat;
const text = ref("");
// 标记是否正在中文输入
const isComposing = ref(false);

function onCompositionStart() {
  isComposing.value = true;
}

function onCompositionEnd() {
  isComposing.value = false;
}

function handleKey(e: KeyboardEvent) {
  if (e.key === "Enter" && !e.shiftKey) {
    if (isComposing.value) {
      // 正在中文输入，按回车确认拼音，放行不要阻止
      return;
    }
    e.preventDefault();
    submit();
  }
}

function submit() {
  if (!text.value.trim()) return;
  send(text.value.trim());
  text.value = "";
}
</script>

<style scoped>
.chat-input {
  display: flex;
  gap: 8px;
  padding: 12px;
  border-top: 1px solid var(--border);
}
</style>
