# 安全审计报告 · 文字点单小程序

> 审计范围：NestJS 后端（`apps/api/src`）+ 小程序前端（`apps/miniprogram`）+ 运行配置（`.env`）。
> 审计日期：2026-07-17。结论基于当前源码快照。

## 总体结论

业务接口的**授权（ownership）做得不错**，但**认证层与运行配置存在可被直接利用的高危隐患**，集中在「mock 登录绕权」和「弱 JWT 密钥」两条。上线前必须把 P0 两项处理掉，否则任何能拿到他人 openId 的人都能冒充对方。

---

## 🔴 P0 严重（上线前必须修）

### 1. mock 登录可无条件冒充任意用户
- **位置**：`apps/api/src/auth/auth.service.ts` 第 33 行
- **问题**：`if (!openId && dto.mockOpenId) { openId = dto.mockOpenId; }` 这一分支**不依赖** `AUTH_ALLOW_MOCK_WECHAT`，即使生产把 mock 关掉，任何客户端（含 curl）仍可直接：
  ```
  POST /api/v1/auth/login  { "mockOpenId": "<目标 openId>" }
  ```
  拿到该用户的合法 JWT，完全绕过微信登录。
- **风险**：认证绕过 / 越权冒充。前端并不会发 `mockOpenId`，这只是后端暴露的攻击面。
- **修复**：把 `mockOpenId` 与 `mock_${code}` 两个分支整体收进 `allowMockWechat === true` 判断内；生产环境 `AUTH_ALLOW_MOCK_WECHAT=false`。

### 2. JWT 使用公开的弱密钥
- **位置**：`apps/api/.env` 的 `JWT_SECRET`，且 `app.module.ts` 第 29 行兜底默认值同为 `dev_secret_change_me`
- **问题**：JWT 的 `sub` 就是用户 id，知道密钥即可自行签发任意用户令牌，无需任何登录。该值是公开默认字符串，等于「没有密钥」。
- **风险**：最高危、可直接利用——可伪造任意身份访问所有需登录接口。
- **修复**：生产改为 ≥32 位随机密钥（`openssl rand -base64 32`）；移除 `app.module.ts` 的 `dev_secret_change_me` 兜底默认值，让缺失密钥时启动直接失败而不是回退到已知值。

---

## 🟠 P1 高（强烈建议上线前修）

### 3. 订单接口泄露对方 openId
- **位置**：`order.service.ts` 的 `detail()` / `list()` 用 `include: { customer: true, chef: true }`
- **问题**：会把**对方用户的全部字段（含 `openId`）**一并返回。任一用户可通过订单拿到对方 openId，再走 P0 的 `mockOpenId` 完成冒充——形成「泄露 → 冒充」完整链路。`nickname`/`avatarUrl` 展示需要，但 `openId` 不应下发前端。
- **修复**：改用 `select` 仅返回必要字段（id / nickname / avatarUrl），剔除 `openId`；或在响应映射时剥除。

### 4. MinIO 使用默认凭据
- **位置**：`apps/api/.env` 的 `MINIO_ACCESS_KEY` / `MINIO_SECRET_KEY`（均为 `minioadmin`）
- **问题**：`MINIO_PUBLIC_BASE_URL` 当前指向公网隧道域名。若 MinIO 暴露公网且用默认账号，任何人可读写全部上传图片（订单/评价图片）。
- **修复**：改为强随机凭据；MinIO 仅限内网或经网关鉴权；bucket 设为私有 + 预签名读。

### 5. NODE_ENV=development
- **问题**：生产应设 `production`，否则异常会吐堆栈、日志更详细，部分库行为不同。
- **修复**：生产环境改为 `production`。

---

## 🟡 P2 加固项

### 6. 文件上传未校验真实文件类型
- **位置**：`file.service.ts` 仅取客户端文件名后缀与 mimetype，未校验文件头（magic bytes）
- **风险**：攻击者可传 `.html` / `.svg` 等，借公开 bucket 触发存储型 XSS / 内容注入。
- **修复**：按 magic bytes 白名单校验（png/jpeg/webp/gif），拒绝其它；尤其禁用 svg。

### 7. 登录接口无限流
- **风险**：无速率限制，可被刷 / token 农场（配合 mock 更危险）。
- **修复**：加 `@nestjs/throttler` 全局限流（如 10 次/分钟/IP）。

### 8. JWT 过期时间偏长
- `JWT_EXPIRES_IN=7d`。建议降到 2h 并配合刷新令牌机制。

### 9. CORS（当前安全，需注意）
- `main.ts` 未配置 CORS，默认拒绝跨域——当前是安全的（小程序走微信网络、不经浏览器 CORS）。若日后有网页调用，须显式限定来源，勿开 `*`。

---

## ✅ 已做好的安全点（保留）

- 订单/评价接口授权完善：`detail` / `complete` / `review` 均校验 `customerId` / `chefId`，评价限定下单双方且每角色限评一次。
- 全局 `ValidationPipe` 开启 `whitelist` + `forbidNonWhitelisted`。
- `.env` 与 `.env.*` 已被 `.gitignore` 忽略；`.env.example` 使用占位符、未泄露真实密钥。
- `ENABLE_SWAGGER_UI=false`，Swagger 文档未公开。
- 上传文件以 `ownerId/randomUUID` 命名，无路径遍历风险，且限制 10MB。
- 小程序前端仅发送 `{ code }` 登录，不会误触发 mock 路径；token 经 `Authorization: Bearer` 携带。

---

## 🚀 上线前配置清单（需你操作）

| 配置项 | 当前（开发） | 生产应设为 |
|---|---|---|
| `JWT_SECRET` | 弱默认 | 随机 ≥32 位强密钥 |
| `AUTH_ALLOW_MOCK_WECHAT` | `true` | `false` |
| `NODE_ENV` | `development` | `production` |
| `MINIO_ACCESS_KEY` / `MINIO_SECRET_KEY` | `minioadmin` | 强随机凭据 |
| `MINIO_PUBLIC_BASE_URL` / `APP_URL` | cpolar 公网隧道 | 已备案 HTTPS 域名 |
| `WECHAT_APP_ID` / `WECHAT_APP_SECRET` | 已填真实值 | 正式小程序凭证 |
| `ENABLE_SWAGGER_UI` | `false` | `false` |

---

## 🛠 可代码层直接修复（低风险、保留 dev 行为）

1. `auth.service.ts`：把 `mockOpenId` / `mock_${code}` 分支整体收进 `allowMockWechat` 判断。
2. `order.service.ts`：订单返回剔除对方 `openId`（用 `select`）。
3. `file.service.ts`：上传加文件头白名单校验。
4. `app.module.ts`：去掉 `JWT_SECRET` 的 `dev_secret_change_me` 兜底默认值。
