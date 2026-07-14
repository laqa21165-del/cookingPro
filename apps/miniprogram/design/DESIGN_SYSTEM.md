# 「文字点单」手绘风设计系统 · Hand-drawn Design System

> 单一事实来源（Single Source of Truth）。本文件与同目录 `tokens.json` 配套，
> 用于让任何 AI 工具 / 设计师在**不依赖既有代码**的情况下，直接还原整套「轻松愉快线条手绘风」界面。
> 适用平台：微信小程序（rpx 单位，750rpx = 屏幕宽 = 设计宽 375px）。
> 跨平台复用时，rpx ÷ 2 = px（见各令牌表的 px / rpx 双值）。

---

## 0. 给其他 AI 工具的使用说明

1. **先读令牌，再画组件**：颜色 / 字号 / 圆角 / 描边一律引用第 2 章的令牌值，禁止凭感觉取色。
2. **组件是积木**：第 3 章每个组件都给了「背景 / 描边 / 圆角 / 字号 / 内距」的精确值，按结构拼装即可。
3. **页面是组合**：第 4 章给出 9 个页面分别用哪些组件，照表套用，风格自然统一。
4. **实现坑在第 6 章**：小程序 WXSS 不支持本地背景图、字体需手动加载、tabBar 图标必须是 PNG —— 落地前必读。
5. **数值对齐 `tokens.json`**：本文件里的所有色值 / 字号 / 间距都可在 `tokens.json` 中机器读取，二者出现分歧以 `tokens.json` 为准。

---

## 1. 设计理念（Design Philosophy）

**Soft Organic & Healing · 有机自然 / 柔和治愈**

- 像一杯刚煮好的燕麦拿铁：圆润、温润、有人情味，但结构清晰、操作不费力。
- **手绘感来源**：所有卡片用 2px（4rpx）棕色描边 `#C9A99A` 代替投影，几乎无阴影（扁平化）。
- **品牌记忆点**：会说话的小狗吉祥物「汪」，作为用户与厨师之间的心意信使，贯穿全站（英雄区探头 + 空状态陪伴 + puppy-card 台词）。
- **品牌色资产**：暖奶油底 + 陶土红主色 + 棕墨文字，三者不可丢弃。
- **情感价值**：「用文字付款」，每一次点单都被认真阅读、好好回应。

---

## 2. 设计令牌（Design Tokens）

### 2.1 色彩系统

| Token | HEX | 语义角色 | 用途 | 对比度(WCAG AA) |
|-------|-----|----------|------|----------------|
| `--cream-50` | `#FFF7F2` | 页面背景 | 全局底色，纯色无渐变 | — |
| `--cream-100` | `#FDEFE7` | 辅助填充 | 区块分隔、次级底 | — |
| `--stage` | `#F9F1E8` | 纸面舞台 | 首页外框暖纸背景 | — |
| `--surface` | `#FFFDFB` | 卡片表面 | 默认卡片 | 文字 ≥ 4.5:1 ✅ |
| `--surface-warm` | `#FFF8F1` | 暖卡表面 | 英雄卡 / 高亮卡 | — |
| `--ink` | `#3B251F` | 主文字 | 主标题 / 正文 / 强调 | 对 cream 7.1:1 ✅ |
| `--ink-soft` | `#5E463D` | 次级文字 | 次级标题 | 5.3:1 ✅ |
| `--muted` | `#8E6F67` | 辅助文字 | 说明、时间、提示 | 对 surface 4.6:1 ✅ |
| `--muted-soft` | `#96786B` | 更弱文字 | 次级说明 | — |
| `--primary` | `#C2674E` | 主色 | 主按钮 / 关键强调 / 小狗台词 | 白字 4.6:1 ✅ |
| `--primary-600` | `#A8533D` | 主色按压 | 主按钮描边 / 深强调 | 白字 6.2:1 ✅ |
| `--primary-700` | `#8A3F2C` | 主色深 | 极深强调 | — |
| `--primary-100` | `#F6E0D7` | 主色浅 | 头像底、浅强调面 | — |
| `--primary-tint` | `#F6E2DA` | 主色浅2 | chip-邀请底 / 头像底 | — |
| `--line` | `#C9A99A` | **手绘描边** | 卡片边框、输入描边（核心手绘感） | — |
| `--line-soft` | `#E0BCAA` | 浅描边 | 分隔线、tabBar 顶边 | — |
| `--line-dashed` | `#D9AE98` | 虚线描边 | 空状态虚线卡 | — |
| `--sage` | `#5F8B5B` | 成功色 | 绑定确认 / 成功态 | 白字 4.5:1 ✅ |
| `--sage-100` | `#EBF4E7` | 成功浅 | 成功提示背景 | — |
| `--sage-tint` | `#E4F1E4` | 成功浅2 | chip-绑定底 | — |
| `--on-primary` | `#FFF9F5` | 主色上文字 | 主按钮白字 | — |
| `--tabbar-bg` | `rgba(252,245,238,.96)` | 标签栏底 | 底部导航背景 | — |
| `--tabbar-inactive` | `#9B8073` | 标签栏灰 | 未选中项 | — |

> ⚠️ **现状差异说明**：现已上线的首页 `home/index.wxss` 中部分值有 ±2 的漂移
> （如主按钮用 `#c76f4d`、chip 文字用 `#c56b4a`、边框用 `#d9ae98`）。本系统已统一收敛到上表，
> **新页面请以本表为准**，旧页面可逐步对齐，不影响整体观感。

### 2.2 字体系统

- **主字体（正文/通用）**：`--font-sans: -apple-system, 'PingFang SC', 'Microsoft YaHei', sans-serif`
- **手写展示字体（可选，强化手绘感）**：`--font-hand: 'Sarasa Gothic SC', 'PingFang SC', sans-serif`
  - 小程序需通过 `wx.loadFontFace` 手动加载 CDN（见第 6 章），未加载时回退 PingFang SC。

**字号阶梯（Type Scale）** —— 基于 4px（8rpx）基准，移动端以 375px 设计宽为基准：

| Token | px | rpx | 字重 | 行高 | 字距 | 角色 / 示例 |
|-------|----|-----|------|------|------|-------------|
| `--text-display` | 26 | 52 | 700 | 1.18 | -0.03em | 英雄标题「今天想吃什么？」 |
| `--text-title` | 20 | 40 | 700 | 1.24 | — | 区块标题（section-title） |
| `--text-subtitle` | 18 | 36 | 700 | 1.3 | — | 次区块标题（recent-title） |
| `--text-card` | 15 | 30 | 700 | 1.3 | — | 卡片标题（厨师名 / 菜名） |
| `--text-body` | 14 | 28 | 400 | 1.6 | — | 正文说明 |
| `--text-body-strong` | 14 | 28 | 600 | 1.5 | — | 强调正文 / 小狗台词 |
| `--text-sm` | 12 | 24 | 400 | 1.5 | — | 辅助说明（muted） |
| `--text-eyebrow` | 11 | 22 | 600 | 1.4 | 0.12em | 字标（eyebrow） |
| `--text-tiny` | 10 | 20 | 600 | 1 | — | 标签栏文字 |

### 2.3 间距（Spacing）

基准单位 **8rpx（=4px）**，常用节奏：`8 / 12 / 16 / 20 / 24 / 28 / 32 / 40`。

| Token | rpx | px | 用途 |
|-------|-----|----|------|
| `--space-xs` | 8 | 4 | 元素内最小间隙 |
| `--space-sm` | 12 | 6 | 标签/图标间隙 |
| `--space-md` | 16 | 8 | 卡片内分组 |
| `--space-lg` | 20 | 10 | 卡片内主间隙 |
| `--space-xl` | 24 | 12 | 区块内距 |
| `--space-2xl` | 28 | 14 | 页面左右内距 |
| `--space-3xl` | 32 | 16 | 卡片内距 |
| `--space-4xl` | 40 | 20 | 大区块 |
| `--section-gap` | 34 | 17 | 区块之间（如最近厨师区顶部） |
| `--page-pad-bottom` | 164 | 82 | 底部标签栏安全区 |

### 2.4 圆角（Radius）

| Token | rpx | px | 用途 |
|-------|-----|----|------|
| `--radius-card` | 24 | 12 | 默认内卡（厨师卡 / 订单卡） |
| `--radius-card-lg` | 48 | 24 | 大卡 / 面板 |
| `--radius-btn` | 20 | 10 | 按钮 |
| `--radius-input` | 36 | 18 | 输入框 / 文本域（偏圆润） |
| `--radius-pill` | 999 | — | chip / 标签 / 头像 / 胶囊 |
| `--radius-avatar` | 16 | 8 | 方形头像 |
| `--radius-avatar-lg` | 28 | 14 | 英雄插画块 |

### 2.5 描边与分隔（Stroke & Divider）

- **手绘描边（招牌）**：`border: 4rpx solid var(--line)` —— 所有卡片、输入框、次要按钮统一使用。
- **细描边**：`2rpx solid var(--line-soft)` 用于 tabBar 顶边、暖卡边框。
- **虚线卡**：`2rpx dashed var(--line-dashed)` 仅用于空状态。

### 2.6 阴影（Shadow）

手绘风**默认无阴影**（描边即层次）。仅保留一处：

- `--shadow-cta: 0 16rpx 28rpx rgba(199,111,77,.20)` —— 仅主行动按钮（开始点菜）的轻微抬升感。
- 其余一律 `box-shadow: none`。

### 2.7 动效（Motion）

- 时长 `220ms`，缓动 `cubic-bezier(0.22, 1, 0.36, 1)`（ease-out）。
- 只过渡 `transform` / `opacity` / `box-shadow`，不动 layout 属性。
- 按压反馈：主按钮 `translateY(1px)` + 背景转 `--primary-600`。
- 尊重系统「减少动态效果」偏好，关闭位移与缩放。

---

## 3. 组件库（Component Library）

每个组件给出：用途 + 结构 + 精确样式值 + 状态。直接照抄即可还原。

### 3.1 页面容器 Page Container
```
.container {
  min-height: 100vh;
  padding: 28rpx 24rpx 164rpx;   /* 底部给 tabBar 留安全区 */
  background: var(--cream-50);
  box-sizing: border-box;
}
```
首页额外有一层「纸面舞台」：`.home-stage` 用 `--stage` 底 + `2rpx solid --line-soft` 圆角 44rpx，模拟手绘外框。

### 3.2 卡片 Card（三种变体）
| 变体 | 背景 | 圆角 | 描边 | 阴影 | 内距 |
|------|------|------|------|------|------|
| 默认卡 `.card` | `--surface` | 48rpx | `4rpx solid --line` | none | 32rpx |
| 暖卡 `.warm-card` | `--surface-warm` | 34rpx | `2rpx solid --line-soft` | none | 30rpx |
| 虚线空卡 `.dashed-card` | `--surface-warm` | 24rpx | `2rpx dashed --line-dashed` | none | 24rpx |

> 标题组（任何卡内通用）：`.section-title` = `--text-title`/`--ink`/`700` + `margin-bottom:16rpx`；
> `.eyebrow` = `--text-eyebrow`/`--muted`/`600` + `letter-spacing:.12em`；
> `.muted` = `--text-sm`/`--muted`/`1.6`。

### 3.3 按钮 Buttons
| 类型 | 背景 | 文字 | 描边 | 圆角 | 最小高 | 字号 |
|------|------|------|------|------|--------|------|
| 主按钮 `.primary-btn` | `--primary` | `--on-primary` | `4rpx solid --primary-600` | `--radius-btn` | 84rpx | 27rpx/600 |
| 次按钮 `.secondary-btn` | `--surface` | `--ink` | `4rpx solid --line` | `--radius-btn` | 84rpx | 27rpx/600 |
| 幽灵 `.ghost-btn` | `rgba(255,255,255,.62)` | `--muted` | none | `--radius-btn` | 84rpx | 27rpx/600 |

- `.full-btn` → `width:100%`；`.tiny-btn` → 高度 ~60rpx、字号 22rpx（用于行内操作）。
- 状态：按压 `.primary-btn:active` → 背景 `--primary-600` + `translateY(1px)`。

### 3.4 胶囊 Chip
```
.chip { height:76rpx; border-radius:999rpx; display:flex; align-items:center; justify-content:center;
        gap:10rpx; font:24rpx/600; }
.chip-invite { background:var(--primary-tint); color:var(--primary); }   /* 邀请顾客绑定 */
.chip-bind   { background:var(--sage-tint);   color:var(--sage); }        /* 绑定专属厨师 */
```
首页以两列网格（gap 16rpx）排布两个 chip。

### 3.5 输入框 Input / 文本域 Textarea
```
.input, .textarea {
  width:100%; background:var(--surface); border:4rpx solid var(--line);
  border-radius:36rpx; color:var(--ink); font-size:28rpx; line-height:1.5;
  padding:20rpx 24rpx; min-height:84rpx; box-sizing:border-box;
}
.textarea { min-height:216rpx; }
```
placeholder 颜色 `--muted`。

### 3.6 标签与徽标 Tag / Badge
- **状态标签** `.status-tag`：胶囊，`--text-sm`/`600`，按状态着色（待接 = 主色浅底，已接 = 成功浅底，已完成 = 墨色，已取消 = 灰）。
- **新订单徽标** `.new-badge`：陶土浅底 `--primary-tint` + 文字 `--primary` 的胶囊。

### 3.7 头像 Avatar
```
.avatar { width:56rpx; height:56rpx; border-radius:16rpx;
          background:var(--primary-tint); color:var(--primary-600);
          display:flex; align-items:center; justify-content:center; font:28rpx/700; }
```
- 用户头像（我的页）为圆形、略大（72rpx），显示姓氏首字。
- 厨师头像为方形圆角（半径 16rpx），显示姓氏首字。

### 3.8 列表行 List Rows（按需选用）
| 行组件 | 结构要点 |
|--------|----------|
| 订单卡 `.order-card` | 头部（订单号 + 状态组[新徽标?+状态]）→ 菜品摘要行 → 元信息（时间 + 通知状态） |
| 菜单行 `.menu-row` | 左图(方角圆润) + 右内容(菜名 + 状态标签 + 描述 + 字数价 + 行内操作 tiny-btn×2) |
| 点单菜单卡 `.menu-card` | 左图 + 右主区(头部:菜名/描述+字数价；底部:标签 + 步进器) |
| 绑定行 `.binding-row` | 左(姓名 + 视角说明 muted) + 右 tiny-btn「删除绑定」 |
| 快照行 `.snapshot-row` | 菜名×数量 + 右侧 muted 字数价 |
| 评价项 `.review-item` | 角色标签 + 正文 + 可选评价图 |

### 3.9 步进器 Stepper
```
.stepper { display:flex; align-items:center; gap:12rpx; }
.step-btn { width:48rpx; height:48rpx; border-radius:14rpx; border:2rpx solid var(--line);
            background:var(--surface); display:flex; align-items:center; justify-content:center;
            font-size:30rpx; color:var(--ink); }
.step-btn.is-disabled { opacity:.4; }
.step-count { min-width:32rpx; text-align:center; font:28rpx/600; }
```

### 3.10 英雄卡 Hero Card
```
.hero-card { display:grid; grid-template-columns:minmax(0,1fr) 188rpx; gap:20rpx;
             background:var(--surface-warm); border:2rpx solid var(--line-soft);
             border-radius:34rpx; padding:30rpx 28rpx 26rpx; }
.hero-title { font:52rpx/700; color:#33211a; line-height:1.18; letter-spacing:-0.03em; }
.hero-desc  { margin-top:18rpx; color:var(--muted-soft); font:28rpx/1.55; }
.hero-note  { margin-top:26rpx; color:var(--primary); font:25rpx/600; }
.hero-art   { width:188rpx; height:188rpx; border-radius:28rpx; overflow:hidden; background:#FFEFCA; }
```
右侧放小狗「汪」插画。

### 3.11 问候卡 Greeting Card
```
.greeting-card { display:flex; align-items:center; justify-content:space-between; gap:20rpx;
                 padding:30rpx 26rpx; border:2rpx solid var(--line-soft); border-radius:34rpx;
                 background:rgba(255,250,245,.72); }
```
左侧时段问候 + 一句心意；右侧圆形头像入口（72rpx）。

### 3.12 小狗卡 Puppy Card
```
.puppy-card { display:flex; gap:18rpx; align-items:center; padding:16rpx 18rpx;
              border-radius:24rpx; background:var(--surface); border:4rpx solid var(--line); }
.puppy-img  { width:112rpx; height:112rpx; flex:none; }
.puppy-note { flex:1; color:var(--primary); font:24rpx/600; line-height:1.5; }  /* 小狗台词 */
```

### 3.13 提示条 Inline Notice
```
.inline-notice { margin-top:18rpx; padding:22rpx 24rpx; border-radius:24rpx;
                 border:2rpx solid var(--line-soft); background:var(--surface-warm); }
.inline-notice.success { background:var(--sage-100); }
.inline-notice.share   { background:#FFF7F0; }
```
含标题（`--text-title`/`--ink`/`700`）+ 说明（`--text-sm`/`--muted`）+ 可选按钮组。

### 3.14 底部标签栏 TabBar
```
.custom-tabbar { position:absolute; left:0; right:0; bottom:0; height:112rpx;
                 display:grid; grid-template-columns:repeat(4,1fr); padding-top:12rpx;
                 background:var(--tabbar-bg); border-top:2rpx solid var(--line-soft); }
.tab-item { display:flex; flex-direction:column; align-items:center; gap:8rpx;
            color:var(--tabbar-inactive); font:20rpx/1; }
.tab-item.active { color:var(--primary); font-weight:700; }
.tab-icon { width:32rpx; height:32rpx; }
```
4 项：首页 / 订单 / 菜单 / 我的。选中态陶土色（原生 tabBar 需补 PNG 图标，见第 6 章）。

### 3.15 悬浮购物车 Floating Cart（点单页）
底部圆角胶囊条：左侧「N 份菜品已加入购物车 + 至少写 X 字」文案，右侧动作文字；点击展开 cart-panel。

### 3.16 Token 框（绑定确认）
- 只读态 `.token-box`：等宽感浅底块展示分享 token。
- 输入态 `.token-input`：复用 `.input` 样式。

### 3.17 插画与涂鸦 Mascot & Doodles
- **吉祥物**：小狗「汪」，圆脸、暖色调，用于英雄卡插画块（188rpx）、空状态居中、puppy-card。
- **手绘涂鸦**（散点装饰，绝对定位、低 z-index、pointer-events:none）：
  `star` / `heart` / `spark` / `flower` / `wave` / `squiggle`，每颗约 26–42rpx，
  颜色取 `--primary` / `--sage` / `--line` 系，散布在卡片空隙增加手绘灵动感。

---

## 4. 页面 × 组件 应用矩阵

| 页面 | 关键组件 |
|------|----------|
| **home 首页** | 问候卡 · 英雄卡(小狗) · 主CTA「开始点菜」· chip×2(邀请/绑定) · 提示条(成功/分享) · 最近厨师区(标题+网格厨师卡/空卡) · 底部标签栏 · 涂鸦 |
| **orders 订单列表** | 卡片(筛选说明) · mode-tabs(双按钮切换身份) · 订单卡(状态组/新徽标) · 空状态卡 · 次按钮 |
| **menu 菜单** | 主按钮(添加菜品) · 菜单行(图+状态标签+行内操作) · 空卡 |
| **menu-create 新增菜品** | 表单卡 · 输入框×2 · 文本域 · 次按钮(传图) · 预览图 · 主按钮(保存) |
| **me 我的** | 用户头部卡(头像+身份+统计) · 个人设置卡 · puppy-card · 演示身份按钮组 · 绑定关系组(绑定行+tiny-btn) |
| **order-detail 订单详情** | 多卡堆叠(状态/菜品快照/支付文字/完成/回复/双方评价) · 文本域(厨师回复) · 评价项+图 · 次/主按钮 |
| **review 评价** | 评价卡 · eyebrow+标题 · 文本域 · 次按钮(传图) · 预览图 · 主按钮(提交) |
| **bind-confirm 绑定确认** | eyebrow+标题 · puppy-card · token 框/输入 · 主按钮(确认) · 结果文字 |
| **order 点单对话框(文字支付)** | 选厨师卡(横向 pill 滚动/空卡) · 搜索卡(eyebrow+标题+输入) · 点单菜单卡(图+步进器) · 购物车面板(快照+文字支付文本域+字数计数+提交) · 悬浮购物车 |

> 9 个页面共用同套令牌与组件，仅组合方式不同 → 天然风格统一。

---

## 5. 页面布局规范（简化骨架）

- **纵向流**：所有页面均为单列纵向滚动，内容包在 `.container` 内，区块之间用 `--section-gap`。
- **卡片即区块**：每个功能块 = 一张卡（默认/暖/虚线三选一），卡内用 section-title + muted 组织。
- **主操作唯一**：每页最高权重动作只有一个主按钮（如「开始点菜」「确认绑定」「保存菜品」），其余降为次按钮 / tiny-btn / chip。
- **空状态必有小狗**：无数据时用小狗居中 + 一句引导 + 主按钮，杜绝冷冰冰占位。
- **手绘不靠阴影**：层次完全由 2px 棕色描边与暖底色差表达。

---

## 6. 实现指南（微信小程序落地必读）

### 6.1 令牌注入
在 `app.wxss` 的 `page{}` 上声明 CSS 变量（小程序支持 page 级变量）：
```css
page {
  --cream-50:#FFF7F2; --surface:#FFFDFB; --ink:#3B251F; --muted:#8E6F67;
  --primary:#C2674E; --primary-600:#A8533D; --primary-tint:#F6E2DA;
  --line:#C9A99A; --line-soft:#E0BCAA; --sage:#5F8B5B; --sage-tint:#E4F1E4;
  --on-primary:#FFF9F5; --tabbar-bg:rgba(252,245,238,.96); --tabbar-inactive:#9B8073;
  background:var(--cream-50); color:var(--ink);
  font-family:-apple-system,'PingFang SC','Microsoft YaHei',sans-serif;
}
```

### 6.2 ⚠️ WXSS 背景图限制
**小程序 `background-image` 不支持本地文件路径**（如 `/images/foo.png` 不会显示）。解决方案二选一：
1. 内联 base64：`background-image:url("data:image/png;base64,....")`；
2. 用 `<image>` 组件替代背景图（推荐用于小狗插画、菜品图）。

### 6.3 字体加载（手写体可选）
`Sarasa Gothic SC` 不在系统字体内，需手动加载：
```js
wx.loadFontFace({
  family: 'Sarasa Gothic SC',
  source: 'url("https://你的CDN/SarasaGothicSC.ttf")',
  success() {}, fail() {}
});
```
未加载时回退 `--font-sans`，不影响布局。

### 6.4 tabBar 图标
原生 `app.json` 的 `tabBar.iconPath` **只接受 PNG**（不支持 SVG）。
需把线性图标（首页/订单/菜单/我的）导出为 ≤81×81px 的 PNG，并准备选中/未选中两套。
若沿用自定义 tabBar（`.custom-tabbar` + 图标 SVG），则不受此限，但需自行管理选中态。

### 6.5 rpx 与跨平台
- 设计宽 375px = 750rpx，故 `px × 2 = rpx`。第 2 章表格已给双值。
- 输出到 Web / Figma 时，直接用 px 列即可。

### 6.6 暗色模式（预留）
暖棕底 `#2A1C17`、表面 `#3A2A22`、主色提亮 `#E08A6E`；保持暖调发光，避免冷色霓虹。后续页面可扩展。

---

## 7. 给「其他 AI 工具」的复刻 Prompt 模板

> 你正在实现「文字点单」小程序的一个页面，风格为**手绘线条治愈风**。
> 请严格遵循 `design/tokens.json` 与 `design/DESIGN_SYSTEM.md`：
> 1. 颜色只允许使用令牌表中的色值；
> 2. 字号取自 Type Scale（display/title/subtitle/card/body/sm/eyebrow/tiny）；
> 3. 所有卡片用 `4rpx solid #C9A99A` 描边、无阴影；
> 4. 圆角按令牌（卡 24rpx / 按钮 20rpx / 输入 36rpx / chip 999rpx）；
> 5. 复用第 3 章对应组件的结构与样式；
> 6. 空状态必须出现小狗「汪」插画与一句引导文案；
> 7. 小程序 WXSS 背景图用 base64 或 <image>，字体用 wx.loadFontFace。
> 先输出结构（WXML），再输出样式（WXSS），最后说明需人工配置的资产。

---

*设计系统 v1.0 · 2026-07-10 · 与 Ardot 设计稿 702073359796820 / 702082969764098 / 702333306878388 对齐*
