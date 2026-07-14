# Sarasa Gothic SC 字体接入指南（微信小程序）

> 配套设计系统：`design/DESIGN_SYSTEM.md` / `design/tokens.json`
> 本文说明如何把「手绘圆体」Sarasa Gothic SC 真正加载到小程序里，让所有页面生效。

---

## 一、先理解 3 个硬限制（为什么不能简单「装字体」）

1. **WXSS 的 `@font-face` 不支持本地字体文件**（相对/绝对路径都不行）。
   小程序只能走 `wx.loadFontFace` 从 **https CDN** 加载网络字体。
2. **Sarasa（更纱黑体）全量字体每字重几十 MB**，直接丢进 `loadFontFace` 会超时、超限、失败。
   必须先**子集化**（只保留项目真正用到的汉字/标点），体积可压到 **几 KB ~ 几百 KB**。
3. **真机比模拟器更严格**：模拟器可能直接读本地，真机一定走网络。验证务必用真机/真机调试。

结论：**子集化 → 上传 CDN → `wx.loadFontFace` 全局加载 → `app.wxss` 设字体栈**，缺一不可。

---

## 二、获取子集字体文件（二选一）

### 路线 A：自己子集化（推荐，体积最小、最可控）

1. 下载 Sarasa Gothic SC 源字体（.ttf），例如官方仓库 `be5invis/Sarasa-Gothic` 的 Release，取 `sarasa-gothic-sc-regular.ttf`（或你要的其它字重）。
2. 安装子集化工具（项目已可加 devDependency）：
   ```bash
   npm i -D fontmin
   ```
3. 把源 `.ttf` 放到 `apps/miniprogram/scripts/` 下，运行脚本自动从 `pages/**` 提取文字并裁剪：
   ```bash
   node scripts/subset-font.js scripts/sarasa-gothic-sc-regular.ttf
   ```
   输出 `scripts/dist/sarasa-subset.ttf`。
4. 把 `sarasa-subset.ttf` 传到你的 https CDN / OSS（见第三节）。

### 路线 B：直接用现成 CDN（最快，但依赖第三方、体积可能偏大）

若已有托管好的 Sarasa 子集 `.ttf`（如团队内网字体服务、或字体平台导出的子集链接），**跳过子集化**，直接拿 https URL 用即可。注意必须是 `.ttf/.otf`，且为子集或很小。

---

## 三、上传到 CDN

把 `sarasa-subset.ttf` 传到任意 **https** 域名，例如：

- 腾讯云 COS / 阿里云 OSS / 七牛，开启公共读；
- 自己的服务器静态目录；
- jsDelivr 等（若走 npm 包发布）。

要求：

- 协议必须是 **https**（http 会被小程序拦截）；
- 文件建议 **< 1MB**（子集后通常远小于此）；
- 不需要特殊 CORS 头（`wx.loadFontFace` 不强制），但部分 CDN 跨区域可能会慢，选离用户近的节点。

拿到类似地址：`https://your-cdn.com/fonts/sarasa-subset.ttf`

---

## 四、代码接入（项目已备好封装，你只需填 URL + 挂一行）

### 1. 填 URL（唯一需要你手动改的地方）

打开 `apps/miniprogram/utils/font.js`，把顶部：

```js
const FONT_URL = 'https://YOUR_CDN_DOMAIN/fonts/sarasa-subset.ttf';
```

改成你的真实地址。

### 2. 在全局入口挂一次加载

在 `app.js` 的 `onLaunch` 里加一行（不阻塞首屏，异步加载）：

```js
const { loadSarasaFont } = require('./utils/font');

App({
  async onLaunch() {
    loadSarasaFont();          // ← 加这一行，全局只加载一次
    try {
      await ensureLogin();
    } catch (e) { /* ... */ }
  },
});
```

> 说明：`utils/font.js` 已写好 `loadSarasaFont()`，内部用 `wx.loadFontFace({ global: true })`，加载成功后全项目所有页面自动生效，无需逐页设置。

### 3. 字体栈（已帮你改好）

`app.wxss` 的 `page` 选择器字体栈已把 Sarasa 设为首选：

```css
font-family: 'Sarasa Gothic SC', 'PingFang SC', -apple-system, 'Microsoft YaHei', sans-serif;
```

加载成功前用系统圆体兜底，加载完成后自动切换，体验平滑。

---

## 五、验证（务必用真机）

1. 微信开发者工具 → 点「真机调试」或扫码在手机预览（**模拟器可能不加载网络字体，不可信**）。
2. 手机上打开首页，看标题/按钮文字是否变成圆润的手绘体（对比系统字体差异明显）。
3. 真机调试控制台过滤 `[font]`，应看到：
   - `Sarasa Gothic SC 加载成功` ✅
   - 若看到 `加载失败`，按下方排错。

---

## 六、常见问题排错

| 现象 | 原因 | 解决 |
|------|------|------|
| 真机完全没生效，控制台无日志 | `FONT_URL` 还是占位 `YOUR_CDN_DOMAIN` | 填上真实 https URL |
| 真机不生效但模拟器生效 | 真机必须走 https 网络字体 | 确认 URL 是 https、文件可公网访问 |
| 报 `fail ... loadFontFace` | 文件过大 / 格式不支持 / 网络慢 | 子集化到 <1MB；改用 `.ttf`；换更快 CDN |
| 安卓生效、iOS 不生效或反之 | 字体格式兼容差异 | 统一用 `.ttf`（iOS/Android 都稳） |
| 首屏字体闪一下（先系统后圆体） | 网络字体异步加载 | 正常现象；如需避免可在首页加轻 loading |

---

## 七、设计系统里的字体角色

- 标题（display / h1~h3）、按钮、品牌文字：首选 `Sarasa Gothic SC`，呈手绘圆润感。
- 正文长文本、表单输入：仍可用系统 `PingFang SC` 保证可读性（已在字体栈回落）。
- 如需更强的「手写感」，可用更细字重（如 Light）子集，但需重复第二节的子集化流程。
