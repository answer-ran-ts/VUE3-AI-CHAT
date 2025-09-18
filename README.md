# Vue 3 + TypeScript + Vite

This template should help get you started developing with Vue 3 and TypeScript in Vite. The template uses Vue 3 `<script setup>` SFCs, check out the [script setup docs](https://v3.vuejs.org/api/sfc-script-setup.html#sfc-script-setup) to learn more.

Learn more about the recommended Project Setup and IDE Support in the [Vue Docs TypeScript Guide](https://vuejs.org/guide/typescript/overview.html#project-setup).

## Development

```bash
# Frontend only
npm run dev

# Start proxy server (OpenAI) + frontend together
npm run dev:full
```

## Environment variables

Create a `.env` file in the project root:

```
OPENAI_API_KEY=sk-...
OPENAI_BASE_URL=https://api.openai.com/v1
OPENAI_MODEL=gpt-4o-mini
PORT=8787
```

The frontend can still specify `VITE_OPENAI_MODEL` if desired, but by default it uses the server's `OPENAI_MODEL`.
