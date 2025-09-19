<template>
  <div class="chat-input">
    <n-input
      v-model:value="text"
      type="textarea"
      :placeholder="loading ? 'AI 正在思考…' : 'Shift+Enter 换行，Enter 发送'"
      :disabled="loading"
      :autosize="{ minRows: 1, maxRows: 6 }"
      @keydown="handleKey"
    />
    <n-button type="primary" :loading="loading" @click="submit">发送</n-button>
  </div>
</template>

<script setup lang="ts">
import { useChat } from "@/stores/app";
import { ref } from "vue";
const { loading, send } = useChat();
const text = ref("");
function handleKey(e: KeyboardEvent) {
  if (e.key === "Enter" && !e.shiftKey) {
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
