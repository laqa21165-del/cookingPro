# 文字点单 · 上线执行清单（照着勾）

> 前提：ICP 备案已通过、服务器已装 Docker、有正式 AppID `wxf8d5b7b3a9ebcc5f`。
> 约定：把下面所有 `你的域名` 替换成你的真实域名，例如 `example.com`，
> 则两个子域名为 `api.example.com`（后端）和 `oss.example.com`（图片）。
> ⚠️ 所有密钥/密码只在服务器或公众平台填，**不要写进 git**。

---

## 阶段 A · 本地：把代码推到 GitHub（服务器要 clone）

1. 打开项目根目录 `E:\JAVA\26Learn\project\mylove`
2. 用 Git 工具（或命令行）执行：
   ```bash
   git add -A
   git commit -m "chore: 安全清理 + 上线配置占位符"
   git push
   ```
3. 确认 GitHub 上能看到 `apps/api/docker-compose.yml`、`Caddyfile`、`Dockerfile` 已上传，
   但 `.env` / `project.private.config.json` 不在仓库里（已被 .gitignore 排除）。

---

## 阶段 B · 服务器：拉代码 + 装 Caddy

1. SSH 登录服务器。
2. （若 Caddy 还没装）一次性安装：
   ```bash
   sudo apt update
   sudo apt install -y debian-keyring debian-archive-keyring apt-transport-https
   curl -1sLf 'https://dl.cloudsmith.io/public/caddy/stable/gpg.key' | sudo gpg --dearmor -o /usr/share/keyrings/caddy-stable-archive-keyring.gpg
   curl -1sLf 'https://dl.cloudsmith.io/public/caddy/stable/debian.deb.txt' | sudo tee /etc/apt/sources.list.d/caddy-stable.list
   sudo apt update && sudo apt install -y caddy
   ```
3. 克隆仓库：
   ```bash
   git clone <你的GitHub仓库地址> mylove
   cd mylove/apps/api
   ```

---

## 阶段 C · 服务器：编辑 docker-compose.yml（核心）

文件位置：`mylove/apps/api/docker-compose.yml`
用 `nano docker-compose.yml` 或 `vim` 打开，按下面表格逐行替换。

| 行号 | 占位符原文 | 改成什么 | 去哪找 |
|---|---|---|---|
| 19 | `<请替换:强密码>` (POSTGRES_PASSWORD) | 自定强密码，记牢 | 自己设 |
| 51 | `DATABASE_URL` 里的 `<请替换:强密码>` | **与行19完全相同** | — |
| 38 | `<请替换:minio账号>` (MINIO_ROOT_USER) | 自定账号，如 `minioadmin` 改名 | 自己设 |
| 39 | `<请替换:强密码>` (MINIO_ROOT_PASSWORD) | 自定强密码 | 自己设 |
| 56 | `<请替换:minio账号>` (MINIO_ACCESS_KEY) | **与行38完全相同** | — |
| 57 | `<请替换:强密码>` (MINIO_SECRET_KEY) | **与行39完全相同** | — |
| 59 | `https://oss.<你的域名>` (MINIO_PUBLIC_BASE_URL) | `https://oss.你的真实域名` | 用你的域名 |
| 60 | `https://api.<你的域名>` (APP_URL) | `https://api.你的真实域名` | 用你的域名 |
| 61 | `<请替换:真实AppID>` (WECHAT_APP_ID) | `wxf8d5b7b3a9ebcc5f` | 已固定，直接填 |
| 62 | `<请替换:真实AppSecret>` (WECHAT_APP_SECRET) | 真实 AppSecret | 公众平台 mp.weixin.qq.com → 开发 → 开发管理 → 开发设置 → AppSecret（查看/重置）；或本地 `apps/api/.env` |
| 63 | `<请替换:模板ID>` (WECHAT_MESSAGE_TEMPLATE_ID) | 订阅消息模板 ID | 本地 `.env` 或公众平台「订阅消息」后台 |
| 65 | `<请替换:openssl rand...>` (JWT_SECRET) | 终端执行 `openssl rand -base64 32` 得到的串 | 服务器终端当场生成 |

> 不用动的行（已正确）：行64 `AUTH_ALLOW_MOCK_WECHAT: "false"`、行67 `ENABLE_SWAGGER_UI: "false"`、行50 `NODE_ENV: production`。

保存退出。

---

## 阶段 D · 服务器：起服务

仍在 `mylove/apps/api` 目录：
```bash
docker compose up -d --build
```
等待 1–2 分钟构建。验证后端在跑（返回 401 = 正常，说明服务已起且鉴权生效）：
```bash
curl -i https://api.你的真实域名/api/v1/me
```
看到 `HTTP/2 401` 即通过。

---

## 阶段 E · 服务器：Caddy 反向代理 + 自动 HTTPS

1. 先去你的**域名 DNS 后台**，加两条 A 记录：
   - `api.你的域名` → 服务器公网 IP
   - `oss.你的域名` → 服务器公网 IP
   （等 5–10 分钟生效，可用 `ping api.你的域名` 验证）
2. 编辑 Caddyfile：
   ```bash
   nano /root/mylove/apps/api/Caddyfile   # 或你实际存放路径
   ```
   把两处 `<你的域名>` 换成真实域名（第 7 行 `api.`、第 12 行 `oss.`）。
3. 让 Caddy 加载（备案已通过，证书会自动申请）：
   ```bash
   caddy reload --config /root/mylove/apps/api/Caddyfile
   ```
4. 验证 HTTPS：
   ```bash
   curl -i https://api.你的真实域名/api/v1/me   # 期望 401 且为 https
   curl -i https://oss.你的真实域名/            # MinIO 控制台或 200
   ```

---

## 阶段 F · 小程序前端：改生产域名（在微信开发者工具里做）

⚠️ 这是**前端文件**，不在服务器上，要在微信开发者工具改后「上传」。
文件：`apps/miniprogram/utils/request.ts` 和 `request.js` **两处都要改、保持一致**。

- `request.ts` 第 4 行：
  ```ts
  const PROD_BASE_URL = 'https://api.你的真实域名/api/v1';
  ```
- `request.js` 第 8 行：
  ```js
  var PROD_BASE_URL = 'https://api.你的真实域名/api/v1';
  ```
（开发版/真机调试仍走内网，不用改；只有体验版/正式版走这行。）

---

## 阶段 G · 微信公众平台配置（mp.weixin.qq.com）

1. **服务器域名**（开发 → 开发管理 → 开发设置 → 服务器域名）：
   - request 合法域名：`https://api.你的真实域名`
   - uploadFile 合法域名：`https://api.你的真实域名`
   - downloadFile 合法域名：`https://oss.你的真实域名`
2. **用户隐私保护指引**（开发 → 用户隐私保护）：填写并发布（收集 openId/昵称需声明，不填审核会被拒）。
3. **服务类目**（设置 → 基本设置 → 服务类目）：选合适类目（如「工具 > 效率」）。

---

## 阶段 H · 上传 + 提审

1. 微信开发者工具 → 右上「上传」→ 填版本号 `1.0.0` 与备注 → 上传。
2. 公众平台 → 管理 → 版本管理 → **提交审核**。
   - 功能页面填首页 `/pages/home/index`、下单页 `/pages/order/index` 截图说明。
   - 测试账号：准备一个顾客微信 + 一个厨师微信供审核员登录。
3. 审核 1–7 天，通过后「发布」。建议先发体验版给两人小范围走通全链路。

---

## 阶段 I · 上线后验收（勾选）

- [ ] 两个微信号分别登录，资料隔离
- [ ] 厨师发图：图片能上传、列表/详情不裂图
- [ ] 顾客下单 → 厨师接单 → 评价 全链路通
- [ ] 底部订单角标 = 厨师待处理数，完成后 -1
- [ ] 7 天/2h token 过期重登录顺畅
- [ ] Swagger 已关闭（ENABLE_SWAGGER_UI=false）

---

## 常见坑

- **图片裂图**：`MINIO_PUBLIC_BASE_URL` 还是 localhost/cpolar，或 `oss.域名` 没解析/没备案。
- **域名填不进小程序后台**：必须用自己 ICP 备案域名。
- **JWT_SECRET 还是占位符**：必须换成 `openssl rand -base64 32` 生成的随机串，否则令牌可伪造。
- **线上连不上数据库**：容器网络用服务名 `postgres:5432`，不是 localhost。
- **前端还连内网**：确认 `request.ts/.js` 的 `PROD_BASE_URL` 已改生产域名。
