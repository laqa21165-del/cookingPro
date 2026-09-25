# 小程序上线部署全程指南 · mylove 文字点单

> 目标：把"本地能跑"变成"微信审核通过、真机正式版可用"。
> 本文按**执行顺序**排列。代码层能自动化的部分（Docker 文件、前端环境自适应）已经帮你建好，带 ⚙️ 的是你必须在平台/服务器上手动做的事。
> 配套文件（已创建）：`apps/api/Dockerfile`、`apps/api/.dockerignore`、`apps/api/docker-compose.yml`、`apps/api/Caddyfile`。

---

## 阶段 0 · 上线前置条件（缺一不可，按耗时排序）

| 事项 | 谁做 | 耗时 | 说明 |
|---|---|---|---|
| ⚙️ **ICP 备案域名** | 你 + 服务商 | 1–2 周 | 准备两个三级域：`api.yourdomain.com`（API）、`oss.yourdomain.com`（图片）。**个人备案即可**，但转发分享功能另需微信认证（见下）。提前办，这是最长链路。 |
| ⚙️ **云服务器** | 你 | 当天 | 轻量应用服务器 2 核 4G 起步，Ubuntu 22.04，装好 Docker + Docker Compose + Caddy。 |
| ⚙️ **微信认证**（仅"发给厨师"转发需要） | 你 | 1–5 天 | 企业/个体户主体 ¥300/年。个人主体**无法认证**，则转发分享不可用（核心下单/接单/站内待办不受影响）。你的 appid `wxf8d5b7b3a9ebcc5f` 已是正式号，凭证已填。 |
| ✅ 正式小程序 appid + 凭证 | 已完成 | — | `project.config.json` 与 `.env` 已填 `wxf8d5b7b3a9ebcc5f`。 |

> ⚠️ 没备案域名 / 没认证，小程序**提审会被拒**。其余功能（登录、点单、接单、评价、待办角标）不依赖认证，可先上线；"发给厨师"转发等认证后再开。

---

## 阶段 1 · 安全收尾（上线前必改，已做代码层）

下面 4 处**代码**已修（见 `docs/security-audit.md`）：mock 登录收拢进 `AUTH_ALLOW_MOCK_WECHAT`、`order` 接口剔除对方 `openId`、上传按文件头校验、JWT 弱密钥兜底已移除。

你还需在**部署配置**里落实这些值（写在 `docker-compose.yml` 的 `api.environment`）：

| 配置项 | 当前（开发） | 生产应设为 |
|---|---|---|
| `NODE_ENV` | development | `production` |
| `AUTH_ALLOW_MOCK_WECHAT` | `true` | `"false"` |
| `JWT_SECRET` | dev_secret_change_me | 随机 ≥32 位（`openssl rand -base64 32`） |
| `MINIO_ACCESS_KEY` / `MINIO_SECRET_KEY` | minioadmin | 强随机凭据 |
| `MINIO_PUBLIC_BASE_URL` | cpolar 隧道 | `https://oss.yourdomain.com` |
| `APP_URL` | cpolar 隧道 | `https://api.yourdomain.com` |
| `WECHAT_APP_SECRET` | 已填真实值 | 保持 |
| `ENABLE_SWAGGER_UI` | false | `false` |

> 生产 secret 建议由你本地生成后填进 `docker-compose.yml`，**不要经他人手**。

---

## 阶段 2 · 部署后端（Docker 一把梭）

1. ⚙️ 服务器装依赖（一次性）：
   ```bash
   # Docker
   curl -fsSL https://get.docker.com | sh
   # Caddy
   sudo apt install -y debian-keyring debian-archive-keyring apt-transport-https
   curl -1sLf 'https://dl.cloudsmith.io/public/caddy/stable/gpg.key' | sudo gpg --dearmor -o /usr/share/keyrings/caddy-stable-archive-keyring.gpg
   curl -1sLf 'https://dl.cloudsmith.io/public/caddy/stable/debian.deb.txt' | sudo tee /etc/apt/sources.list.d/caddy-stable.list
   sudo apt update && sudo apt install -y caddy
   ```
2. 把 `apps/api/` 整个目录传到服务器（git 克隆或 `scp -r`）。
3. ⚙️ 编辑 `apps/api/docker-compose.yml`，把里面所有 `<请替换:...>` 和 `<你的域名>` 换成真实值。
4. 起服务：
   ```bash
   cd apps/api
   docker compose up -d --build
   ```
   `api` 服务启动命令已内置 `prisma db push`（本项目**无 migration 文件**，按 schema 直接建表，幂等安全），无需手动迁移。
5. 验活（返回 401 即代表服务在跑且鉴权生效）：
   ```bash
   curl -i https://api.yourdomain.com/api/v1/me
   # 期望 HTTP/2 401
   ```

---

## 阶段 3 · 反向代理 + 自动 HTTPS（Caddy）

1. ⚙️ 域名解析：在 DNS 后台把 `api.yourdomain.com` 和 `oss.yourdomain.com` 都 **A 记录**指向服务器 IP。
2. 编辑 `apps/api/Caddyfile`，把两处 `<你的域名>` 换成真实域名，然后：
   ```bash
   caddy reload --config /path/to/Caddyfile
   ```
   Caddy 自动申请并续期 Let's Encrypt 证书（**前提是域名已 ICP 备案**，否则证书申请失败）。
3. 验证 HTTPS：
   ```bash
   curl -i https://api.yourdomain.com/api/v1/me   # 401，且为 https
   curl -i https://oss.yourdomain.com/            # MinIO 控制台或 200
   ```

---

## 阶段 4 · 小程序前端上传与平台配置

### 4.1 前端域名（已做环境自适应，只需改一处）
`apps/miniprogram/utils/request.ts` / `.js` 已按运行环境自动切换：
- **开发版 / 真机调试** → 内网 `192.168.0.8:3000`（本地联调）
- **体验版 / 正式版** → 生产 `https://api.yourdomain.com`

你只需把文件顶部 `PROD_BASE_URL` 里的 `api.<你的域名>` 改成你的真实域名即可（改 `.ts` 和 `.js` 两处，保持一致）。

### 4.2 上传代码
微信开发者工具 → 右上「上传」→ 填版本号（如 `1.0.0`）与备注 → 上传。

### 4.3 ⚙️ 公众平台服务器域名（硬门槛）
mp.weixin.qq.com → 开发 → 开发管理 → 开发设置 → **服务器域名**：
- **request 合法域名**：`https://api.yourdomain.com`
- **uploadFile 合法域名**：`https://api.yourdomain.com`
- **downloadFile 合法域名**：`https://oss.yourdomain.com`
- socket 合法域名：不填

> 填不进去提示"未备案"→ 域名必须已完成 ICP 备案；cpolar/ngrok 免费域名不行。

### 4.4 ⚙️ 隐私协议与类目（审核必过项）
- **用户隐私保护指引**：在「开发 → Development → 用户隐私保护」填写并发布（本小程序收集微信 openId/昵称，需声明用途）。**不填审核会被拒**。
- **服务类目**：设置 → 基本设置 → 服务类目，选合适的（如"工具 > 效率"或"生活服务"）。类目若需特殊资质，按提示补齐。

### 4.5 关掉开发者工具"不校验合法域名"
真机正式验收时必须关闭：开发者工具 → 详情 → 本地设置 → 取消勾选「不校验合法域名、TLS 版本以及 HTTPS 证书」。

---

## 阶段 5 · 提审与发布

1. 开发者工具「上传」后，去公众平台 → 管理 → 版本管理 → **提交审核**。
2. 填写：
   - **功能页面**：填首页 `/pages/home/index` 与下单页 `/pages/order/index` 截图说明。
   - **测试账号**：给审核员一个**顾客**账号 + 一个**厨师**账号（两个微信），并说明登录即用微信扫码、无需注册。
3. 审核周期通常 1–7 天。
4. 通过后 → **发布**（全量或分阶段）。
5. 正式发布前，建议先发**体验版**给身边两人小范围走一遍全链路。

---

## 阶段 6 · 上线后验收清单（真机 + 真域名 + 关掉不校验）

- [ ] 两个微信号分别登录，openId 不同、资料隔离
- [ ] 厨师发图菜品：图片能上传、列表/详情能回显（不是裂图）
- [ ] 顾客绑定厨师 → 下单 → 厨师接单 → 评价全链路
- [ ] 底部【订单】角标 = 厨师待处理数，完成订单后即时 -1
- [ ] 完成订单后「发给厨师」转发（仅已认证账号可用；未认证则该按钮灰显属正常）
- [ ] 7 天/2h token 过期后重新登录顺畅
- [ ] 生产 Swagger 已关闭（`ENABLE_SWAGGER_UI=false`）

---

## 常见坑速查

1. **图片裂图**：99% 是 `MINIO_PUBLIC_BASE_URL` 还是 localhost/cpolar，或 `oss.yourdomain.com` 没解析/没备案。
2. **域名填不进小程序后台**：必须用自己 ICP 备案域名。
3. **线上连不上数据库**：容器网络用服务名（`postgres:5432`）而非 localhost。
4. **JWT_SECRET 还是 dev_secret**：生产必须换随机长串，否则令牌可伪造。
5. **AUTH_ALLOW_MOCK_WECHAT 仍是 true**：生产设 false，否则可被假 code 登录。
6. **前端还连内网**：确认 `request.ts/.js` 的 `PROD_BASE_URL` 已改生产域名；开发版联调不受影响（自动判 develop）。

---

## 附：本地仍可用内网联调

开发版（`envVersion==='develop'`）自动走 `192.168.0.8:3000`，所以你**本地测试完全不用改回**。只需保证：
- 后端本地 `AUTH_ALLOW_MOCK_WECHAT=true`（保持 dev 行为）
- 真机调试时同 WiFi，且开发者工具勾「不校验合法域名」
