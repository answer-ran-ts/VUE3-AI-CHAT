<template>
  <div class="message-row" :class="msg.role">
    <!-- 头像 -->
    <n-avatar
      :size="36"
      :class="msg.role"
      v-if="msg.role === 'user'"
      src="https://p6-passport.byteacctimg.com/img/user-avatar/f4fd4405fe6ff84a3b216ad3cd6e9bed~180x180.awebp"
    />
    <!-- 助手头像 -->
    <div v-else class="avatar-wrap">
      <n-avatar
        :size="40"
        round
        class="avatar assistant"
        :style="{ background: botGradient }"
      >
        <n-icon :component="SparklesOutline" />
      </n-avatar>
      <!-- 小绿点：正在流式时闪烁 -->
      <div v-if="isStreaming" class="pulse-dot" />
    </div>
    <!-- 内容区 -->
    <div class="content">
      <!-- 用户纯文本 -->
      <div v-if="msg.role === 'user'" class="user-txt">{{ msg.content }}</div>

      <!-- 助手 Markdown -->
      <MarkdownViewer
        v-else
        :key="msg.id + ':' + msg.content.length"
        :source="msg.content"
      />

      <!-- 操作栏 -->
      <div class="actions">
        <n-button
          v-if="msg.role === 'assistant'"
          text
          type="primary"
          size="tiny"
          @click="emit('retry')"
        >
          重试
        </n-button>
        <n-button text type="error" size="tiny" @click="emit('delete')">
          删除
        </n-button>
        <n-button v-if="codeBlocks.length" text size="tiny" @click="copyCode">
          复制代码
        </n-button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from "vue";
import { NAvatar, NButton, NIcon, useMessage } from "naive-ui";
import { SparklesOutline } from "@vicons/ionicons5";
import MarkdownViewer from "./MarkdownViewer.vue";
import type { Message } from "../types/chat";
/* 随机机器人渐变 */
const gradients = [
  "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
  "linear-gradient(135deg, #f093fb 0%, #f5576c 100%)",
  "linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)",
  "linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)",
];
const botGradient = computed(() => gradients[props.msg.id.charCodeAt(0) % 4]);

/* 流式状态：父级把最后一条 assistant 且 content 末尾是 ▌ 就认为在流式 */
const isStreaming = computed(
  () => props.msg.role === "assistant" && props.msg.content.endsWith("▌")
);
/* props & emit */
const props = defineProps<{ msg: Message }>();
const emit = defineEmits<{ retry: []; delete: [] }>();

/* 复制代码 */
const message = useMessage();
const codeBlocks = computed(() =>
  (props.msg.role === "assistant"
    ? [...props.msg.content.matchAll(/```([\s\S]*?)```/g)]
    : []
  ).map((m) => m[1])
);
function copyCode() {
  const codes = codeBlocks.value.join("\n\n");
  navigator.clipboard.writeText(codes);
  message.success("已复制代码");
}
</script>

<style scoped>
.message-row {
  display: flex;
  gap: 12px;
  padding: 12px 0;
  align-items: flex-start;
}
.message-row.user {
  flex-direction: row-reverse;
}

/* 头像颜色 */
.avatar.user {
  /* background: var(--avatar-user-bg); */
}
.avatar.assistant {
  background: var(--avatar-assistant-bg);
}

/* 内容气泡 */
.content {
  max-width: 70%;
  padding: 10px 14px;
  border-radius: 10px;
  background: var(--msg-assistant-bg);
  color: var(--text-assistant);
  word-break: break-word;
}
.message-row.user .content {
  background: var(--msg-user-bg);
  color: var(--text-user);
}
.pulse-dot {
  position: absolute;
  bottom: 2px;
  right: 2px;
  width: 10px;
  height: 10px;
  border-radius: 50%;
  background: #18a058;
  animation: pulse 1.2s infinite;
}
@keyframes pulse {
  0% {
    transform: scale(0.95);
    box-shadow: 0 0 0 0 rgba(24, 160, 88, 0.6);
  }
  70% {
    transform: scale(1);
    box-shadow: 0 0 0 8px rgba(24, 160, 88, 0);
  }
  100% {
    transform: scale(0.95);
    box-shadow: 0 0 0 0 rgba(24, 160, 88, 0);
  }
}
/* 操作栏 */
.actions {
  margin-top: 6px;
  display: flex;
  gap: 8px;
  opacity: 0;
  transition: opacity 0.2s;
}
.content:hover .actions {
  opacity: 1;
}

/* 用户纯文本 */
.user-txt {
  white-space: pre-wrap;
}
</style>
