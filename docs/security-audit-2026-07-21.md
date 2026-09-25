# 项目安全审计与 Git 上传检查报告

> 审计日期：2026-07-21
> 审计范围：安全隐患、多余文件、Git 上传注意事项

---

## 一、安全隐患

### 🔴 严重（必须在推送前处理）

#### 1. `docker-compose.yml` 包含真实微信凭据

文件 `apps/api/docker-compose.yml`（当前为未跟踪新文件，准备提交）中硬编码了：

```yaml
WECHAT_APP_ID: wxf8d5b7b3a9ebcc5f              # 真实 AppID
WECHAT_MESSAGE_TEMPLATE_ID: sqBeT8zgAX9z...     # 真实模板 ID
```

虽然 `WECHAT_APP_SECRET` 已用占位符，但 AppID 和模板 ID 也属于应保护信息。

**建议**：改为占位符 `<请替换:真实AppID>` / `<请替换:模板ID>`。

#### 2. `apps/api/.env` 包含真实微信 AppSecret

```
WECHAT_APP_SECRET=5a8484030744b9e5d759f8946fc844c3
WECHAT_APP_ID=wxf8d5b7b3a9ebcc5f
```

✅ **好消息**：该文件已被 `.gitignore` 忽略，且 git 历史中从未提交过。
⚠️ **注意**：`APP_URL` 和 `MINIO_PUBLIC_BASE_URL` 指向 cpolar 内网穿透隧道地址，属于临时地址，不应长期使用。

### 🟡 中等

#### 3. `project.private.config.json` 被 git 跟踪

微信开发者工具的私有配置文件，已在初始提交时入库。虽然当前内容无高度敏感信息，但该文件按惯例应被 `.gitignore` 忽略（文件名含 `private`）。

**建议**：从 git 中移除跟踪，加入 `.gitignore`。

#### 4. 小程序中硬编码内网 IP

`apps/miniprogram/app.ts` 和 `utils/request.ts` 中：
```ts
apiBaseUrl: 'http://192.168.0.8:3000/api/v1'
```

这是开发环境内网地址，不影响安全但不规范，且换网络环境后会失效。

### 🟢 低风险

| 项目 | 说明 |
|------|------|
| `JWT_SECRET=dev_secret_change_me` | 弱密钥，但仅存在于 `.env`（不入库），生产环境必须替换 |
| 数据库默认密码 `postgres:postgres` | 开发环境默认值，`.env.example` 中同样，生产必须替换 |
| MinIO 默认凭据 `minioadmin` | 同上 |

---

## 二、多余文件

### 应从 Git 中移除的文件

| 文件/目录 | 说明 | 操作 |
|-----------|------|------|
| `codex_homepage_encoding_fix/` | 临时补丁目录（3个文件） | `git rm -r` + 加入 `.gitignore` |
| `codex_homepage_patch/` | 临时补丁目录（3个文件） | `git rm -r` + 加入 `.gitignore` |
| `apps/miniprogram/project.private.config.json` | 微信私有配置 | `git rm --cached` + 加入 `.gitignore` |

### 重复文件（完全相同）

| 文件 A | 文件 B | 大小 | 操作 |
|--------|--------|------|------|
| `images/peeking-puppy.svg` | `images/puppy.svg` | 130 KB | 删除其中一个 |
| `images/peeking-puppy.png` | `images/puppy.png` | 97 KB | 删除其中一个 |

> 经 `diff` 验证，两组文件内容完全一致。建议保留 `puppy.svg` / `puppy.png`（命名更简洁），删除 `peeking-*` 副本——前提是代码中未引用 `peeking-*` 名称。

### 未跟踪的临时文件

| 文件 | 说明 |
|------|------|
| `images/A_cute_round_faced_puppy_dog___2026-07-10T03-20-03.png` | AI 生成图片，文件名为时间戳格式，明显是临时产物 |

**建议**：重命名为有意义的名称（如 `puppy-portrait.png`）或删除。

### 可能多余的项目（需你判断）

| 文件/目录 | 说明 |
|-----------|------|
| `src/`（App.jsx, main.jsx, styles.css） | Vite + React 原型代码，若小程序已独立开发则原型可废弃 |
| 根目录 `index.html` + `vite.config.js` | Vite 原型配置，同上 |
| `.agents/` | 空目录，无实际内容 |

---

## 三、`.gitignore` 需补充的规则

当前 `.gitignore` 内容已覆盖核心项（node_modules、dist、.env、.workbuddy），但缺少以下规则：

```gitignore
# 微信开发者工具私有配置
apps/miniprogram/project.private.config.json

# 临时补丁目录
codex_homepage_*/

# 系统文件
.DS_Store
Thumbs.db
desktop.ini

# 日志
*.log
npm-debug.log*

# 本地环境覆盖
*.local

# AI 生成临时图片（按需）
apps/miniprogram/images/A_*
```

---

## 四、Git 上传注意事项清单

### 推送前必做

- [ ] **确认 `.env` 不在暂存区**：运行 `git status` 确认 `apps/api/.env` 不在列表中
- [ ] **修改 `docker-compose.yml`**：将真实 `WECHAT_APP_ID` 和 `WECHAT_MESSAGE_TEMPLATE_ID` 改为占位符
- [ ] **移除 `codex_homepage_*` 目录的 git 跟踪**：`git rm -r --cached codex_homepage_encoding_fix codex_homepage_patch`
- [ ] **移除 `project.private.config.json` 的 git 跟踪**：`git rm --cached apps/miniprogram/project.private.config.json`
- [ ] **更新 `.gitignore`**：添加上述缺失规则
- [ ] **处理重复图片**：删除 `peeking-puppy.*` 副本（确认代码无引用后）
- [ ] **处理 AI 临时图片**：重命名或删除 `A_cute_round_faced_puppy_dog___*.png`

### 推送后检查

- [ ] 在 GitHub/Gitee 仓库页面搜索 `AppSecret`、`JWT_SECRET`、`minioadmin` 等关键词，确认无泄露
- [ ] 确认 `.env` 文件不在远程仓库中
- [ ] 确认 `codex_*` 目录不在远程仓库中

### 如果曾经误推过敏感信息

即使删除文件，git 历史仍保留记录。需要：
1. 使用 `git filter-repo` 或 BFG Repo-Cleaner 彻底清除历史
2. **立即轮换微信 AppSecret**（微信公众平台 → 开发 → 基本配置 → 重置）
3. 通知所有 clone 过该仓库的人重新 clone

### 通用建议

- **生产环境密钥永远不入库**：使用环境变量或密钥管理服务
- **`.env.example` 只放占位符**：当前 `.env.example` 做法正确（AppID/Secret 为空），保持
- **定期检查 `git log -p`**：推送前 review diff，避免误提交敏感文件
- **考虑使用 pre-commit hook**：可配置 `git-secrets` 或 `truffleHog` 自动扫描敏感信息

---

## 五、总结

| 类别 | 数量 | 严重程度 |
|------|------|----------|
| 安全隐患 | 6 项 | 2 严重 / 2 中等 / 2 低 |
| 多余文件 | 3 个目录 + 2 组重复 + 1 个临时文件 | - |
| .gitignore 缺失规则 | 6 类 | - |

**最关键的三件事**：
1. `docker-compose.yml` 中的真实微信 AppID/模板ID → 改占位符
2. `codex_homepage_*` + `project.private.config.json` → 从 git 移除
3. 补全 `.gitignore` → 防止未来误提交
