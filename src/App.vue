<template>
  <n-config-provider :theme="currentTheme">
    <n-message-provider>
      <n-layout style="height: 100vh; display: flex; flex-direction: column">
        <n-layout-header
          style="
            display: flex;
            align-items: center;
            justify-content: space-between;
            height: 40px;
            padding: 0 12px;
            background-color: var(--bg-primary);
            border-bottom: 1px solid var(--border);
          "
        >
          <div style="font-weight: bold; color: var(--text-primary)">
            RAN的私人AI助手
          </div>
          <n-space>
            <n-dropdown
              :options="themeOptions"
              @select="changeTheme"
              :icon-size="16"
            >
              <n-button text>
                <n-icon size="20" style="position: relative; top: 3px">
                  <Moon v-if="currentThemeName === 'light'" />
                  <Sunny v-else-if="currentThemeName === 'dark'" />
                  <ColorPalette v-else />
                </n-icon>
              </n-button>
            </n-dropdown>
            <n-button text @click="chat.clear()">清空</n-button>
          </n-space>
        </n-layout-header>

        <n-layout has-sider style="height: calc(100% - 40px)">
          <n-layout-sider
            bordered
            width="220"
            style="background-color: var(--sidebar-bg)"
          >
            <div style="padding: 12px">
              <n-button dashed block @click="chat.createEmptySession()"
                >新建会话</n-button
              >
            </div>
            <n-scrollbar>
              <n-list>
                <n-list-item
                  v-for="s in chat.sessions"
                  :key="s.id"
                  clickable
                  :class="{ active: s.id === chat.currentId, listItem: true }"
                  @click="chat.currentId = s.id"
                >
                  <n-ellipsis style="max-width: 140px">{{
                    s.title
                  }}</n-ellipsis>
                  <template #suffix>
                    <n-button text @click.stop="chat.removeSession(s.id)">
                      <n-icon><TrashOutline /></n-icon>
                    </n-button>
                  </template>
                </n-list-item>
              </n-list>
            </n-scrollbar>
          </n-layout-sider>

          <n-layout-content
            content-style="display: flex; flex-direction: column; height: 100%"
          >
            <n-scrollbar style="flex: 1" ref="scrollRef">
              <div
                style="
                  max-width: calc(100vw - 280px);
                  margin: 0 auto;
                  padding: 16px;
                  height: 100%;
                "
              >
                <MessageRow
                  v-for="(m, idx) in chat.current.messages"
                  :key="m.id"
                  :msg="m"
                  @retry="retryOne(idx)"
                  @delete="deleteOne(idx)"
                />
              </div>
            </n-scrollbar>
            <ChatInput />
          </n-layout-content>
        </n-layout>
      </n-layout>
    </n-message-provider>
  </n-config-provider>
</template>

<script setup lang="ts">
import { darkTheme } from "naive-ui";
import { Moon, Sunny, TrashOutline, ColorPalette } from "@vicons/ionicons5";
import MessageRow from "@/components/MessageRow.vue";
import ChatInput from "@/components/ChatInput.vue";
import { useChat } from "@/stores/app";
import { ref, computed, onMounted, h, watch, nextTick } from "vue";

const chat = useChat();

// 主题管理
const currentThemeName = ref("");

const themeOptions = [
  {
    label: "明亮主题",
    key: "light",
    icon: () => h(Sunny, { width: 18, height: 18 }),
  },
  {
    label: "暗色主题",
    key: "dark",
    icon: () => h(Moon, { width: 18, height: 18 }),
  },
  {
    label: "蓝色主题",
    key: "blue",
    icon: () => h(ColorPalette, { width: 18, height: 18 }),
  },
  {
    label: "紫色主题",
    key: "purple",
    icon: () => h(ColorPalette, { width: 18, height: 18 }),
  },
];

const currentTheme = computed(() => {
  return currentThemeName.value === "dark" ? darkTheme : null;
});

function changeTheme(themeName: string) {
  currentThemeName.value = themeName;
  document.documentElement.setAttribute("data-theme", themeName);
  localStorage.setItem("theme", themeName);
}

// 初始化主题
onMounted(() => {
  const savedTheme = localStorage.getItem("theme") || "dark";
  changeTheme(savedTheme);
});

// ========== 消息区：滚动到底部（带节流） ==========
const scrollRef = ref<any>(null);

function throttle<T extends (...args: any[]) => void>(fn: T, wait = 250) {
  let last = 0;
  let timer: number | null = null;
  let pendingArgs: any[] | null = null;
  return (...args: any[]) => {
    const now = Date.now();
    const remaining = wait - (now - last);
    pendingArgs = args;
    const run = () => {
      last = Date.now();
      timer = null;
      if (pendingArgs) fn(...pendingArgs);
      pendingArgs = null;
    };
    if (remaining <= 0) {
      if (timer) {
        clearTimeout(timer);
        timer = null;
      }
      run();
    } else if (!timer) {
      timer = window.setTimeout(run, remaining);
    }
  };
}

function scrollToBottom() {
  nextTick(() => {
    const inst = scrollRef.value as any;
    if (!inst) return;
    if (typeof inst.scrollTo === "function") {
      inst.scrollTo({ top: Number.MAX_SAFE_INTEGER, behavior: "auto" });
    } else if (inst?.containerRef) {
      inst.containerRef.scrollTop = inst.containerRef.scrollHeight;
    }
  });
}

const throttledScrollToBottom = throttle(scrollToBottom, 250);

// 首次进入滚动到底部
onMounted(() => {
  throttledScrollToBottom();
});

// 新增消息时滚动（长度变化）
watch(
  () => chat.current.messages.length,
  () => throttledScrollToBottom()
);

// 流式更新时滚动（最后一条内容变化）
watch(
  () => chat.current.messages[chat.current.messages.length - 1]?.content,
  () => throttledScrollToBottom()
);

/* 重试：删除助手最后一条 + 重新发送用户上一条 */
function retryOne(idx: number) {
  const msgs = chat.current.messages;
  console.log(msgs[idx], 94);

  // 确保当前是助手消息
  if (msgs[idx].role !== "assistant") return;
  // 删掉助手这条
  msgs.splice(idx, 1);
  // 再发一次用户上一条（它前面一条必为用户）
  const userMsg = msgs[idx - 1];
  chat.send(userMsg.content);
}

/* 删除单条：同时删掉用户+助手成对消息 */
function deleteOne(idx: number) {
  const msgs = chat.current.messages;
  // 如果删的是助手，同时把前面用户也干掉
  if (msgs[idx].role === "assistant" && idx > 0) {
    msgs.splice(idx - 1, 2);
  } else if (msgs[idx].role === "user") {
    // 删用户时，把后面紧邻的助手也干掉
    msgs.splice(idx, msgs[idx + 1]?.role === "assistant" ? 2 : 1);
  }
}
</script>
<style scoped>
/* ========= 头部 ========= */
:deep(.n-layout-header) {
  font-size: 15px;
  letter-spacing: 0.5px;
}

/* ========= 侧边栏 ========= */
:deep(.n-layout-sider) {
}
.listItem {
  padding: 12px 14px;
  border-radius: 8px;
  margin: 0 8px 4px;
  transition: background 0.2s, color 0.2s;
  cursor: pointer;
  color: var(--text-primary);
}
.listItem:hover {
  background: var(--sidebar-item-hover);
}
.listItem.active {
  background: var(--sidebar-item-active);
  color: var(--sidebar-item-active-text);
}

/* 新建会话按钮 */
:deep(.n-button--dashed) {
  border-radius: 8px;
  height: 40px;
}

/* ========= 消息区 ========= */
:deep(.n-layout-content) {
}
:deep(.n-scrollbar-content) {
  padding-bottom: 24px;
}

/* ========= 滚动条美化 ========= */
:deep(.n-scrollbar > .n-scrollbar-rail) {
  right: 4px;
}
:deep(.n-scrollbar-rail .n-scrollbar-rail__bar) {
  width: 6px;
  border-radius: 3px;
  background: var(--scrollbar-bg);
  transition: background 0.2s;
}
:deep(.n-scrollbar-rail:hover .n-scrollbar-rail__bar) {
  background: var(--scrollbar-hover);
}

/* ========= 输入区圆角 ========= */
:deep(.chat-input) {
  padding: 12px 16px;
  border-radius: 0 0 12px 12px;
}
</style>
