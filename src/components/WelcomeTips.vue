<template>
  <div class="welcome-panel">
    <n-space align="center" :size="12">
      <n-icon size="48" color="#2080f0">
        <Sparkles />
      </n-icon>
      <div>
        <div class="title">有什么可以帮你的？</div>
        <div class="sub-title">
          点击下方快捷问题，或直接输入任意内容开始对话。
        </div>
      </div>
    </n-space>

    <n-grid :cols="2" :x-gap="12" :y-gap="8" style="margin-top: 24px">
      <n-gi v-for="q in quickAsks" :key="q.key">
        <n-card
          hoverable
          size="small"
          :bordered="false"
          @click="$emit('pick', q.text)"
          style="cursor: pointer;"
        >
          <n-space align="center" :size="6">
            <n-icon size="18" :color="q.color"
              ><component :is="q.icon"
            /></n-icon>
            <span>{{ q.text }}</span>
          </n-space>
        </n-card>
      </n-gi>
    </n-grid>

    <n-divider />

    <n-space :size="8" align="center">
      <n-icon size="20" color="#63e2b7"><Accessibility /></n-icon>
      <span class="tip-text">小贴士：使用 Ctrl + K 可快速清空当前会话。</span>
    </n-space>
  </div>
</template>

<script setup lang="ts">
import {
  Sparkles,
  Accessibility,
  Code,
  Book,
  Calculator,
  Planet,
} from "@vicons/ionicons5";
defineEmits<{ pick: [text: string] }>();

const quickAsks = [
  { key: 1, text: "用 Python 写一个快速排序", icon: Code, color: "#70c0e8" },
  { key: 2, text: "推荐几本 AI 入门书籍", icon: Book, color: "#f2c97d" },
  { key: 3, text: "计算 1 到 100 的和", icon: Calculator, color: "#e88080" },
  { key: 4, text: "太阳系有哪些行星？", icon: Planet, color: "#63e2b7" },
];
</script>

<style scoped>
.welcome-panel {
  background: var(--bg-card);
  border-radius: 12px;
  max-width: calc(50vw - 200px);
  margin: 100px auto;
}
.title {
  font-size: 22px;
  font-weight: 600;
  color: var(--text-primary);
}
.sub-title {
  font-size: 14px;
  color: var(--text-secondary);
  margin-top: 4px;
}
.tip-text {
  font-size: 13px;
  color: var(--text-secondary);
}
</style>
