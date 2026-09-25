# ---- 构建阶段 ----
# 说明：本项目是 npm workspaces monorepo，锁文件在仓库根目录，
# apps/api 子目录没有独立锁文件，所以这里用 npm install（不是 npm ci）。
FROM node:20-alpine AS build
WORKDIR /app

# 国内网络优化：npm 走镜像源，Prisma 引擎二进制走国内镜像
RUN npm config set registry https://registry.npmmirror.com
ENV PRISMA_ENGINES_MIRROR=https://registry.npmmirror.com/-/binary/prisma

COPY package*.json ./
RUN npm install

# 复制源码并构建（prisma client 在此阶段生成，运行阶段直接复用）
COPY . .
RUN npx prisma generate
RUN npm run build

# ---- 运行阶段 ----
FROM node:20-alpine
WORKDIR /app
ENV NODE_ENV=production

# 直接复用构建阶段的 node_modules（含已生成的 prisma client，依赖版本绝对一致）
COPY --from=build /app/node_modules ./node_modules
COPY --from=build /app/dist ./dist
COPY --from=build /app/prisma ./prisma

EXPOSE 3000
CMD ["node", "dist/src/main.js"]
