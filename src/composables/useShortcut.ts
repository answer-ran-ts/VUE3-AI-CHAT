import { onMounted, onUnmounted } from "vue";

export function useShortcut(keyCombo: string, callback: () => void) {
  const downKeys = new Set<string>();

  const keyMap: Record<string, string> = {
    ctrl: "Control",
    shift: "Shift",
    alt: "Alt",
    k: "k",
  };

  const targetKeys = keyCombo
    .toLowerCase()
    .split("+")
    .map((k) => keyMap[k] || k);

  const onKeyDown = (e: KeyboardEvent) => {
    downKeys.add(e.key);
    const allMatch = targetKeys.every((k) => downKeys.has(k));
    if (allMatch) {
      e.preventDefault();
      callback();
    }
  };

  const onKeyUp = (e: KeyboardEvent) => {
    downKeys.delete(e.key);
  };

  onMounted(() => {
    window.addEventListener("keydown", onKeyDown);
    window.addEventListener("keyup", onKeyUp);
  });

  onUnmounted(() => {
    window.removeEventListener("keydown", onKeyDown);
    window.removeEventListener("keyup", onKeyUp);
  });
}
