<template>
  <div v-if="!props.source || props.source.trim() === ''" class="loading">
    <span></span><span></span><span></span>
  </div>
  <div v-else v-html="html"></div>
</template>

<script setup lang="ts">
import { computed } from "vue";
import MarkdownIt from "markdown-it";
import hljs from "highlight.js";
import "highlight.js/styles/github-dark.css";
import katex from "katex";
import "katex/dist/katex.min.css";

const props = defineProps<{ source: string }>();

const md = MarkdownIt({
  highlight(str, lang) {
    if (lang && hljs.getLanguage(lang)) {
      return `<pre class="hljs"><code>${
        hljs.highlight(str, { language: lang }).value
      }</code></pre>`;
    }
    return `<pre class="hljs"><code>${md.utils.escapeHtml(str)}</code></pre>`;
  },
});
md.use((md: any) => {
  const defaultRender = md.renderer.rules.code_inline!;
  md.renderer.rules.code_inline = (...args: any) => {
    const [tokens, idx] = args;
    const content = tokens[idx].content;
    if (content.startsWith("$$") && content.endsWith("$$"))
      return katex.renderToString(content.slice(2, -2), { displayMode: false });
    return defaultRender(...args);
  };
});

const html = computed(() => md.render(props.source));
</script>

<style>
.markdown-body pre.hljs {
  margin: 8px 0;
  padding: 12px;
  border-radius: 6px;
}
.markdown-body code {
  font-family: "Consolas", monospace;
}
.loading {
  display: inline-flex;
  justify-content: center;
  align-items: center;
  gap: 4px;
  font-size: 32px;
  color: #888;
  user-select: none;
  height: 1em;
}

.loading span {
  display: inline-block;
  width: 0.25em;
  height: 0.25em;
  background-color: currentColor;
  border-radius: 50%;
  opacity: 0.3;
  animation: blink 1.4s infinite ease-in-out both;
}

.loading span:nth-child(1) {
  animation-delay: 0s;
}
.loading span:nth-child(2) {
  animation-delay: 0.2s;
}
.loading span:nth-child(3) {
  animation-delay: 0.4s;
}

@keyframes blink {
  0%,
  80%,
  100% {
    opacity: 0.3;
  }
  40% {
    opacity: 1;
  }
}
</style>
