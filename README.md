# 文字支付点单项目

当前仓库现在包含两条并行线：

- 仓库根目录的 `prototype web`：现有的 `React + Vite` H5 点击原型
- `apps/` 下的 `formal app`：正式工程骨架，包含微信小程序、NestJS API、PostgreSQL、Redis、MinIO

## 目录结构

- `apps/api`：NestJS API，包含 Prisma 数据模型和核心业务模块
- `apps/miniprogram`：原生微信小程序 TypeScript 工程
- `packages/shared-types`：共享类型包预留位
- `infra/docker/docker-compose.dev.yml`：本地 PostgreSQL / Redis / MinIO 编排文件
- `infra/nginx/default.conf`：云服务器反向代理示例配置

## 本轮已实现内容

- 小程序页面骨架：`首页`、`绑定确认`、`点单`、`订单列表`、`菜单管理`、`添加菜品`、`我的`、`订单详情`、`评价`
- API 模块：`auth`、`user`、`binding`、`menu`、`order`、`review`、`file`、`notification`、`journal`
- Prisma 数据模型：用户、绑定、分享链接、菜单项、订单、订单快照、评价、文件资产、订阅记录、手账快照、Outbox 事件
- 本地 mock 微信登录能力
- 下单时的文字数量校验
- 厨师完成订单流程
- 每个角色仅可评价一次的限制
- 基于 MinIO 的文件上传接口
- 通知 Provider 接口和当前 mock 微信发送实现
- 为后续“订单转手账”预留的快照和服务钩子

## 当前仍是 Mock 的部分

- 真实微信订阅消息发送还没有接入。
  现在已经预留好了 Provider 接口，但当前实现仍是本地开发用的 mock 发送器。
- “订单转手账”还没有真正生成手账内容。
  目前已经完成快照结构和 `journal` 服务入口预留。

## 本地运行步骤

1. 安装依赖

```powershell
npm install
```

2. 启动本地基础设施

```powershell
npm run dev:infra
```

说明：
- 该命令会使用独立的 compose 项目名 `mylove`
- 当前项目默认使用独立端口，避免和你现有的 `pai_smart` 容器冲突
- PostgreSQL：`5433`
- Redis：`6380`
- MinIO API：`9002`
- MinIO Console：`9003`

如果提示 Docker daemon 未启动，请先打开 Docker Desktop。

3. 初始化数据库

```powershell
npm run prisma:generate
npm run prisma:migrate
npm run prisma:seed --workspace @mylove/api
```

4. 启动 API

```powershell
npm run dev:api
```

5. 打开微信开发者工具

- 打开目录：`E:\JAVA\26Learn\project\mylove\apps\miniprogram`
- 本地调试时关闭“请求域名校验”
- 当前 API 基础地址为：`http://127.0.0.1:3000/api/v1`

## 已验证命令

```powershell
npm run prisma:generate
npm run build:api
npm run typecheck:mini
npm run build
```

## 本轮未完全验证的部分

- `docker compose` 配置语法已校验通过
- 由于当前机器上的 Docker daemon 没有启动，容器本轮没有真正拉起
- 因此本轮还没有实际执行完整的 `Prisma migrate / seed` 和 API 端到端联调

## 如果仍然出现镜像拉取错误

如果你后续仍然遇到：

- `application/vnd.in-toto+json`
- `from remote: not found`

这通常是镜像代理或仓库兼容性问题，不是 `pai_smart` 容器导致的。
这时优先检查：

- Docker Desktop 的镜像加速器配置
- 当前网络是否走了不兼容 attestation 的代理仓库
- 是否能直接从官方仓库拉取镜像