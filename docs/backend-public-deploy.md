# 后端公网化执行步骤（mylove 文字点单小程序）

> 目标：让本地 `127.0.0.1:3000` 的后端能被真机微信小程序访问，最终通过微信审核上线。
> 当前后端栈：NestJS 11 + Fastify 5 + Prisma 6 + PostgreSQL(:5433) + Redis(:6380) + MinIO(:9002，图片存储)。监听 `0.0.0.0:3000`，接口前缀 `/api/v1`。

## 先认清：要公网化的是「一整套」，不是只把 API 暴露出去

很多人以为把 3000 端口穿透出去就行了，结果真机上图片加载不出、或报错连不上数据库。因为后端还依赖另外三个本地服务：

| 组件 | 当前地址 | 公网化后必须变成 |
|------|----------|------------------|
| API 服务 | localhost:3000 | 公网 HTTPS 域名 |
| PostgreSQL | localhost:5433 | 服务器可访问的 PG（云库或同机容器） |
| Redis | localhost:6380 | 同机 / 云 Redis |
| MinIO | localhost:9002 | 公网可访问的对象存储（图片回显靠 `MINIO_PUBLIC_BASE_URL`） |
| 微信登录 | `WECHAT_APP_ID/SECRET` 为空 | 填真实 AppID / AppSecret |

**最容易被忽略的坑**：前端图片地址来自 `MINIO_PUBLIC_BASE_URL`。现在它是 `http://localhost:9002`，公网环境必须换成 `https://你的域名`，否则真机上图片全部裂图。

---

## 一、临时公网化（仅自测，约 30 分钟，不花钱）

目的：在**不买服务器、不备案**的前提下，用真机验证全链路（登录 / 点单 / 图片）。只能用于开发自测和体验版，不能正式上线。

适用前提：微信开发者工具里勾选「不校验合法域名」（开发版 / 体验版允许这么干）。

### 步骤
1. 下载安装 [cpolar](https://www.cpolar.com/)（国内访问快，免费版给 https 隧道）或 ngrok。
2. 起两条隧道（API + MinIO），各开一个终端：
   ```bash
   cpolar http 3000      # 得到 https://xxxx.cpolar.cn
   cpolar http 9002      # 得到 https://yyyy.cpolar.cn（图片）
   ```
3. 临时改 `apps/api/.env`（建议复制成 `.env.test` 避免污染）：
   ```ini
   APP_URL=https://xxxx.cpolar.cn
   MINIO_PUBLIC_BASE_URL=https://yyyy.cpolar.cn
   ```
   重启后端让配置生效。
4. 开发者工具 → 详情 → 本地设置 → 勾选「不校验合法域名、TLS 版本以及 HTTPS 证书」。
5. 小程序里把 `request` / `uploadFile` 的 baseURL 临时指向 `https://xxxx.cpolar.cn`（上线前改回生产域名）。
6. 点「预览」扫码，真机走一遍：登录 → 发图菜品 → 顾客绑定 → 下单 → 厨师接单。重点看图片能否上传、能否回显。

> ⚠️ cpolar 免费域名是随机三级域名、可能**未 ICP 备案**，只能配合「不校验合法域名」自测。一旦提交审核，必须用自己备案的域名。

---

## 二、正式公网化（上线）

### 2.1 准备资源
- 一台云服务器（推荐「轻量应用服务器」**2 核 2G 起步**，Ubuntu 22.04 及以上；4G 更省心）。2G 内存需按「2.3.1」做调优 + 开 swap，详见下文。装好 Docker + Docker Compose。
- 一个**已 ICP 备案**的域名（个人备案约 1–2 周，提前办）。例如 `api.yourdomain.com`（API）、`oss.yourdomain.com`（图片）。
- 小程序后台填入上述两个域名的 HTTPS 地址。

### 2.2 把后端打包成镜像（新增 Dockerfile）

当前项目没有 Dockerfile，在 `apps/api/` 下新建：

```dockerfile
# 构建阶段
FROM node:20-alpine AS build
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npx prisma generate
RUN npm run build

# 运行阶段
FROM node:20-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --omit=dev && npx prisma generate
COPY --from=build /app/dist ./dist
COPY --from=build /app/prisma ./prisma
EXPOSE 3000
CMD ["node", "dist/main.js"]
```

### 2.3 用 Docker Compose 起全部依赖（同机一把梭，最省钱）

`apps/api/docker-compose.yml`：

```yaml
services:
  postgres:
    image: postgres:16-alpine
    environment:
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: 强密码
      POSTGRES_DB: mylove
    volumes:
      - pgdata:/var/lib/postgresql/data
    restart: unless-stopped

  redis:
    image: redis:7-alpine
    restart: unless-stopped

  minio:
    image: minio/minio:latest
    command: server /data --console-address ":9001"
    environment:
      MINIO_ROOT_USER: minioadmin
      MINIO_ROOT_PASSWORD: 强密码
    volumes:
      - miniodata:/data
    restart: unless-stopped

  api:
    build: .
    environment:
      NODE_ENV: production
      PORT: 3000
      DATABASE_URL: postgresql://postgres:强密码@postgres:5432/mylove?schema=public
      REDIS_URL: redis://redis:6379
      MINIO_ENDPOINT: minio
      MINIO_PORT: 9000
      MINIO_USE_SSL: "false"
      MINIO_ACCESS_KEY: minioadmin
      MINIO_SECRET_KEY: 强密码
      MINIO_BUCKET: word-order
      MINIO_PUBLIC_BASE_URL: https://oss.yourdomain.com
      WECHAT_APP_ID: 真实AppID
      WECHAT_APP_SECRET: 真实AppSecret
      AUTH_ALLOW_MOCK_WECHAT: "false"
      JWT_SECRET: 随机长字符串
      ENABLE_SWAGGER_UI: "false"
    depends_on:
      - postgres
      - redis
      - minio
    restart: unless-stopped

volumes:
  pgdata:
  miniodata:
```

> 提醒：`MINIO_PUBLIC_BASE_URL` 必须填 Caddy 暴露给小程序的 https 域名，图片才会显示。

### 2.3.1 2G 内存服务器必做：开 swap + PG 已调优

若你的服务器是 **2GiB 内存**（如 2 核 2G 轻量套餐），必须做以下两步，否则高峰期易 OOM 杀进程：

**① PostgreSQL 调优（已内置，无需操作）**
`docker-compose.yml` 的 `postgres` 服务已带调优参数：`shared_buffers=256MB`、`max_connections=50`、内存上限 `1g`。这些是 2G 机器稳跑的关键。

**② 在宿主机开 2G swap 文件（防峰值 OOM）**
swap 是宿主机层面配置（不在 Docker 内）。登录服务器后执行：
```bash
sudo fallocate -l 2G /swapfile
sudo chmod 600 /swapfile
sudo mkswap /swapfile
sudo swapon /swapfile
echo '/swapfile none swap sw 0 0' | sudo tee -a /etc/fstab
free -h   # 验证 swap 已生效
```
> 4G 及以上内存也可跳过此步，但开着 swap 作为保险更稳。

### 2.4 反向代理 + 自动 HTTPS（Caddy，最省心）

服务器装 Caddy，新建 `/etc/caddy/Caddyfile`：

```caddyfile
api.yourdomain.com {
  reverse_proxy localhost:3000
}

oss.yourdomain.com {
  reverse_proxy localhost:9000
}
```

Caddy 自动申请并续期 Let's Encrypt 证书（前提：域名已解析到该服务器且已备案）。启动 `caddy reload` 即可。

> 不想用 Docker 起 MinIO，可改用云厂商对象存储（OSS / S3），本项目用 MinIO 兼容 S3 客户端，接 OSS 通常只需改 `MINIO_*` endpoint / key / `PUBLIC_BASE_URL`。

### 2.5 数据库初始化
> ⚠️ 本项目**没有 Prisma `migrations/` 目录**（只有 `schema.prisma`），所以不要用 `prisma migrate deploy`（会因无迁移文件报错）。改用按 schema 直接建表：
```bash
npx prisma db push
```
已创建的 `apps/api/docker-compose.yml` 里 `api` 服务启动命令已内置 `prisma db push --skip-generate`，容器起来即自动建表（幂等、可重复跑）。
**不要**跑 seed（生产不应塞演示数据）。

### 2.6 小程序后台配置（上线硬门槛）
登录 mp.weixin.qq.com → 开发 → 开发管理 → 开发设置：
- **服务器域名 → request 合法域名**：`https://api.yourdomain.com`
- **uploadFile 合法域名**：`https://api.yourdomain.com`（上传走同一后端）
- **downloadFile 合法域名**：`https://oss.yourdomain.com`（图片回显）
- 关掉开发者工具里「不校验合法域名」，用真域名验收。
- 填隐私协议、类目，准备提审。

---

## 三、上线前验收清单（真机 + 真域名，且关闭「不校验合法域名」）
- [ ] 微信登录：两个微信号分别登录，openId 不同
- [ ] 厨师发图菜品：图片能上传、列表 / 详情能回显（不是裂图）
- [ ] 顾客绑定厨师 → 下单 → 厨师接单 → 评价全链路
- [ ] 删除菜品 / 删除绑定不再 400
- [ ] token 7 天过期后重新登录顺畅
- [ ] 生产关掉 Swagger（`ENABLE_SWAGGER_UI=false`）

## 四、常见坑速查
1. **图片裂图**：99% 是 `MINIO_PUBLIC_BASE_URL` 还是 localhost，或没走 https。
2. **域名填不进小程序后台（提示未备案）**：必须用自己 ICP 备案域名，cpolar / ngrok 免费域名不行。
3. **本地能连、线上连不上数据库**：线上容器网络要用服务名（如 `postgres:5432`）而非 localhost。
4. **JWT_SECRET 还是 dev_secret**：生产必须换随机长串，否则 token 可被伪造。
5. **AUTH_ALLOW_MOCK_WECHAT 仍是 true**：生产设 false，防止假 code 登录。
