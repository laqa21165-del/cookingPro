# ---- 构建阶段 ----
FROM node:20-alpine AS build
WORKDIR /app

# 先装依赖（利用层缓存）
COPY package*.json ./
RUN npm ci

# 复制源码并构建
COPY . .
RUN npx prisma generate
RUN npm run build

# ---- 运行阶段 ----
FROM node:20-alpine
WORKDIR /app

# 仅安装运行时依赖 + prisma client
COPY package*.json ./
RUN npm ci --omit=dev && npx prisma generate

# 从构建阶段拷贝产物与 prisma 目录（schema 是 db push 必需）
COPY --from=build /app/dist ./dist
COPY --from=build /app/prisma ./prisma

EXPOSE 3000
CMD ["node", "dist/main.js"]
