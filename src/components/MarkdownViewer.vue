<template>
  <div class="markdown-body" v-html="html"></div>
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
md.use((md) => {
  const defaultRender = md.renderer.rules.code_inline!;
  md.renderer.rules.code_inline = (...args) => {
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
</style>
