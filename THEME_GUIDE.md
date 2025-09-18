# Naive UI 主题颜色配置指南

## 概述

本项目已经配置了完整的主题颜色系统，支持多种主题切换，包括明亮主题、暗色主题、蓝色主题和紫色主题。

## 文件结构

```
src/style/
├── themes.css      # 主题颜色配置文件
└── common.css      # 通用样式文件
```

## 主题配置

### 1. 主题颜色变量

在 `themes.css` 中定义了以下颜色变量：

- **消息气泡颜色**：
  - `--msg-bg`: 助手消息背景色
  - `--msg-user-bg`: 用户消息背景色
  - `--msg-assistant-bg`: 助手消息背景色

- **头像颜色**：
  - `--avatar-user-bg`: 用户头像背景色
  - `--avatar-assistant-bg`: 助手头像背景色

- **文本颜色**：
  - `--text-primary`: 主要文本颜色
  - `--text-secondary`: 次要文本颜色
  - `--text-user`: 用户消息文本颜色
  - `--text-assistant`: 助手消息文本颜色

- **背景颜色**：
  - `--bg-primary`: 主要背景色
  - `--bg-secondary`: 次要背景色
  - `--bg-hover`: 悬停背景色
  - `--bg-active`: 激活背景色

- **边框颜色**：
  - `--border`: 边框颜色
  - `--border-light`: 浅色边框

- **侧边栏颜色**：
  - `--sidebar-bg`: 侧边栏背景色
  - `--sidebar-item-hover`: 侧边栏项目悬停色
  - `--sidebar-item-active`: 侧边栏项目激活色
  - `--sidebar-item-active-text`: 侧边栏项目激活文本色

- **滚动条颜色**：
  - `--scrollbar-bg`: 滚动条背景色
  - `--scrollbar-hover`: 滚动条悬停色

### 2. 主题切换

在 `App.vue` 中实现了主题切换功能：

```typescript
// 主题选项
const themeOptions = [
  { label: '明亮主题', key: 'light', icon: () => h(Sunny) },
  { label: '暗色主题', key: 'dark', icon: () => h(Moon) },
  { label: '蓝色主题', key: 'blue', icon: () => h(ColorPalette) },
  { label: '紫色主题', key: 'purple', icon: () => h(ColorPalette) }
];

// 切换主题
function changeTheme(themeName: string) {
  currentThemeName.value = themeName;
  document.documentElement.setAttribute('data-theme', themeName);
  localStorage.setItem('theme', themeName);
}
```

## 如何添加新主题

### 1. 在 themes.css 中添加新主题

```css
[data-theme="your-theme-name"] {
  /* 消息气泡颜色 */
  --msg-bg: #your-color;
  --msg-user-bg: #your-color;
  --msg-assistant-bg: #your-color;
  
  /* 头像颜色 */
  --avatar-user-bg: #your-color;
  --avatar-assistant-bg: #your-color;
  
  /* 文本颜色 */
  --text-primary: #your-color;
  --text-secondary: #your-color;
  --text-user: #your-color;
  --text-assistant: #your-color;
  
  /* 背景颜色 */
  --bg-primary: #your-color;
  --bg-secondary: #your-color;
  --bg-hover: #your-color;
  --bg-active: #your-color;
  
  /* 边框颜色 */
  --border: #your-color;
  --border-light: #your-color;
  
  /* 侧边栏颜色 */
  --sidebar-bg: #your-color;
  --sidebar-item-hover: #your-color;
  --sidebar-item-active: #your-color;
  --sidebar-item-active-text: #your-color;
  
  /* 滚动条颜色 */
  --scrollbar-bg: rgba(your-rgba-values);
  --scrollbar-hover: rgba(your-rgba-values);
}
```

### 2. 在 App.vue 中添加主题选项

```typescript
const themeOptions = [
  // ... 现有主题
  { label: '你的主题', key: 'your-theme-name', icon: () => h(YourIcon) }
];
```

## 使用方法

### 1. 在组件中使用主题颜色

```vue
<style scoped>
.my-component {
  background-color: var(--bg-primary);
  color: var(--text-primary);
  border: 1px solid var(--border);
}

.my-component:hover {
  background-color: var(--bg-hover);
}
</style>
```

### 2. 动态切换主题

```typescript
// 切换主题
changeTheme('light');   // 切换到明亮主题
changeTheme('dark');    // 切换到暗色主题
changeTheme('blue');    // 切换到蓝色主题
changeTheme('purple');  // 切换到紫色主题
```

## 注意事项

1. **CSS 变量优先级**：确保在 `:root` 中定义默认值，在 `[data-theme="xxx"]` 中定义主题特定值
2. **颜色对比度**：确保文本颜色与背景颜色有足够的对比度，保证可读性
3. **一致性**：保持同一主题下所有颜色的一致性
4. **响应式**：考虑不同屏幕尺寸下的颜色表现

## 扩展功能

### 1. 自动主题检测

可以根据系统主题自动切换：

```typescript
// 检测系统主题
const prefersDark = window.matchMedia('(prefers-color-scheme: dark)');
if (prefersDark.matches) {
  changeTheme('dark');
} else {
  changeTheme('light');
}
```

### 2. 主题预览

可以添加主题预览功能，让用户在切换前看到效果。

### 3. 自定义主题

允许用户自定义主题颜色，保存到 localStorage 中。
