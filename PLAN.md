# 知雀单词 — 字母填空模式重构计划

## 目标
严格按照参考图片的模式重构字母填空模式，实现行内下划线风格的单词展示，并加入自动语音播报。

## 用户确认的设计方向
- **挖空样式**: 行内下划线 — 可见字母和挖空位在同一行流畅展示，整体像一个完整单词
- **布局**: 挖空单词在最上方，中文释义在下方
- **自动发音**: 每个新单词加载时自动播报一次，不打断练习节奏

---

## 改动范围

### 1. `src/components/WordCard.jsx` — 核心重构

#### 1.1 字母填空模式 (LetterMode) 重新设计
**当前问题**: 每个字母都是独立的 `<input>` 方块 (w-10 h-12)，像填字游戏，不像参考图的行内下划线风格。

**改造方案**:
- 可见字母用 `<span>` 展示，大号字体 (text-4xl~text-5xl)，字体用 monospace
- 挖空位置用行内 `<input>` 展示，宽度刚好容纳一个字母，底部有下划线
- 整体在一行内流畅排列，字母间距适中 (tracking-wider)
- input 样式: 透明背景、底部 border-bottom 为金色下划线、无圆角、居中对齐
- input 聚焦时下划线变亮（金色加粗）
- 答题后: 正确字母显示铜绿色，错误字母显示朱砂色并显示正确答案
- 自动跳转下一个空位

**视觉示例**:
```
    t w i ___ ___
    ↑  ↑  ↑  ↑   ↑
    span span span input input
```
- 已给出字母: 大号 monospace 文字，柔和白色
- 空白处: 行内 input，底部金色下划线，宽度约 1.5em

#### 1.2 卡片布局调整
**当前**: 释义在上方 → 分隔线 → 填空区
**改为**: 填空单词在上方 → 释义在下方

```
┌─────────────────────────────┐
│                             │
│      t w i _ _              │  ← 大号单词 + 行内下划线
│                             │
│      v. 扭曲，盘绕            │  ← 中文释义
│                             │
│      🔊 [US]                │  ← 发音按钮
│                             │
│      [提交答案]              │  ← 操作按钮
│                             │
└─────────────────────────────┘
```

#### 1.3 自动语音播报
**当前**: `autoSpeak` prop 传入但从未使用
**改造**:
- 在 WordCard 中直接使用 `useSpeech` hook（或通过 props 传入 speak 函数）
- 在 `useEffect` 中，当 `word` 变化时，如果 `autoSpeak` 为 true，自动调用 `speak(word)`
- 添加 300ms 延迟确保组件挂载完成后再播报
- 播报时显示一个短暂的声音波纹动画

#### 1.4 拼写填空模式 (SpellingMode) 同步调整
- 布局也改为单词在上、释义在下
- 保持输入框居中大号字体
- 自动播报同样生效

### 2. `src/hooks/useSpeech.js` — 小幅调整
- `speak` 函数添加一个 `auto` 参数，区分自动播报和手动点击
- 自动播报时 rate 稍慢 (0.75)，手动点击时正常 (0.85)
- 确保 voices 加载完成后才播报（处理首次加载问题）

### 3. `src/components/PronounceButton.jsx` — 视觉优化
- 播报时增加声波动画（3条竖线动态伸缩）
- 按钮位置移到单词下方居中

### 4. `src/index.css` — 新增样式
- `.letter-blank-input`: 行内下划线 input 样式
- `.letter-visible`: 可见字母样式
- `@keyframes soundWave`: 声波动画
- `.auto-speak-indicator`: 自动播报时的视觉提示

### 5. `src/pages/Practice.jsx` — 无需大改
- WordCard 的 props 不变
- 确保 `autoSpeak` 设置正确传递

---

## 不改动的部分
- 挖空算法 (`src/utils/blank.js`) — 逻辑不变
- 数据加载 (`src/hooks/useWordList.js`) — 不变
- 统计/错词本/每日单词 — 不受影响
- 颜色系统和设计令牌 — 保持现有 Impeccable 风格

---

## 执行步骤

1. **改造 WordCard.jsx** — 重写 LetterMode 和 SpellingMode 的布局，加入自动播报
2. **调整 useSpeech.js** — 添加 auto 参数和 voices 就绪检查
3. **优化 PronounceButton.jsx** — 声波动画
4. **更新 index.css** — 新增行内下划线和声波动画样式
5. **构建 + Playwright 测试** — 确保所有 38 项测试仍通过
6. **部署到 GitHub Pages**

## 预期效果
- 字母填空模式从"填字游戏方块"变为"行内下划线单词"，与参考图一致
- 每个新单词加载时自动播报发音
- 单词在上、释义在下的清晰布局
- 保持现有 Impeccable 设计系统的温暖暗色美学
