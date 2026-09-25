# 服务号通道实现消息推送 — 执行方案（含政策纠偏）

> 适用场景：用户想"厨师授权一次后，顾客每单下单都从微信收到新订单提醒"。
> 本文档为**方案与对接清单**，不改任何代码。落地时再逐条实现。

---

## 0. ⚠️ 必须先纠偏：服务号模板消息 ≠ 长期每单推送

此前给出的"方案 A（服务号 + 开放平台 + 模板消息永久推送）"在 2024 年后的微信政策下**已不成立**。依据微信官方社区 2025-06 最新答疑与政策公告：

| 通道 | 是否"授权一次长期每单推" | 现状 |
|------|------------------------|------|
| 小程序订阅消息 | ❌ 一次性（授权 1 次发 1 条） | 现状不变 |
| 服务号订阅通知 | ❌ 一次性（同上） | 现状不变 |
| **服务号模板消息** | ❌ 仍是"用户交互触发、一次一发"的服务凭证 | **历史模板库已下线**；新模板走"类目模板库"，审核极严，**"提醒/催办/到期"类一律不准入**；日调用上限 10 万次，但定位是服务凭证不是营销 |
| 企业微信客户联系 | ✅ 相对长期（频控可配"每日 1 条"等） | **唯一能长期触达的正路**，需企业微信主体 |

**结论**：微信生态内**没有任何通道**能做"授权一次、每单都主动弹窗推送"。所有通道都是"用户交互触发、一次一发"的服务通知模式。

---

## 1. 现实可行的三条路径

### 路径① 服务号模板消息（低成本、最接近需求，但受审核/政策约束）⭐ 推荐先评估
- **能做的部分**：厨师**关注服务号** + 模板审核通过后，后端**每次下单调一次 `message/template/send` 即可给厨师下发一条**，无需厨师每次授权（这比小程序一次性订阅体验好）。
- **代价/风险**：
  1. 需注册**认证服务号**（企业/组织/个体户主体，**个人不能注册**，300 元/年认证）。
  2. 公众平台申请的模板必须是"服务凭证"类（如"下单成功通知"），纯"提醒/催办"类**审核会驳回**。
  3. 厨师必须**关注服务号**才能收到（需引导关注，有摩擦）。
  4. 政策持续收紧，长期稳定性存疑（第三方解读称存量接口 2025 年中起停用，官方社区 2025-06 仍在答疑，以官方为准）。

### 路径② 企业微信客户联系（最稳的长期触达，代价最高）
- 注册**企业微信**（企业/个体户），开通"客户联系"。
- 厨师作为企微成员，顾客**添加厨师企微为好友**（或加群）。
- 后端下单调企微 API（`externalcontact` 系列）给厨师/顾客推消息，频控可在管理后台配"每日 1 条"。
- 优点：真正长期、合规、可批量。
- 缺点：顾客需加好友（使用摩擦）；企业主体；接入成本最高。

### 路径③ 站内提醒（零成本，100% 每单都到，但不是微信弹窗）
- 厨师端"订单" tab 加红点/未读角标、消息中心列表。
- 每单下单标记未读，厨师**打开小程序即见**。
- 这是目前最务实的落地方案，建议作为主力。

**建议组合**：路径③（站内提醒，主力） + 小程序一次性订阅（用户点"开启"后的那 1 单即时弹窗）。要"微信主动弹窗 + 每单都到"则评估路径①，要绝对稳定走路径②。

---

## 2. 若选路径①：服务号通道接入步骤

### 2.1 资质与账号打通（前置）
1. 注册认证**服务号**，拿到服务号的 `AppID` / `AppSecret`。
2. 把**小程序**和**服务号**都绑定到**同一个微信开放平台**账号。绑定后，同一用户在小程序和服务号下的 `openid` 不同，但 `unionid` 相同——这是关联厨师账号的桥梁。
3. 公众平台 → 服务号模板消息 → 申请"新订单通知"类模板（注意审核口径，包装成"下单成功通知"等服务凭证）。拿到**服务号模板 ID**。

### 2.2 后端对接点（现有代码已读，按此改造）
当前代码位置（`apps/api/src/notification/`）：
- `wechat-notification.provider.ts`：调 `cgi-bin/message/subscribe/send`（小程序订阅接口）
- `notification.module.ts`：注册 provider
- `notification.service.ts`：`notifyOrderCreated` 查 `NotificationSubscription` 表，有订阅才发
- `auth.service.ts`：`exchangeWechatOpenId` 调 `code2Session`，**目前丢弃了返回的 `unionid`**

需改：

**(a) 数据模型** `prisma/schema.prisma` 的 `User`：
```prisma
model User {
  // ...现有字段
  unionId        String?  @unique   // 小程序+服务号绑开放平台后可用于关联
  officialOpenId String?             // 厨师在服务号的 openid（推送目标）
}
```
`prisma migrate dev` / `prisma db push` 同步。

**(b) 登录存 unionid** `auth.service.ts`：
- `exchangeWechatOpenId` 现 `return data.openid`（第 95 行）丢弃 `unionid`。
- 改为返回 `{ openid, unionid }`，`upsert` 时一并写入 `unionId`。
- 注意：`code2Session` 只有在小程序+服务号/移动应用绑同一开放平台时才返回 `unionid`。

**(c) 厨师获取服务号 openid**：
- 在小程序内加"关注服务号"引导页（web-view 或公众号菜单二维码），厨师点进去走**服务号网页授权 OAuth2**（`snsapi_base` 静默拿服务号 openid）+ 后端用 `unionid` 匹配回 `User`，写 `officialOpenId`。
- 或：服务号配服务器回调地址，监听"关注事件"拿到 openid（需公网回调地址，较复杂）。
- 这一步是"厨师关注一次 → 后端记住 openid → 之后每单可推"的关键。

**(d) 新增服务号 provider** `notification/official-account.provider.ts`：
- 调 `https://api.weixin.qq.com/cgi-bin/message/template/send?access_token=TOKEN`（**注意是 template，不是 subscribe**）。
- access_token 用**服务号**的 `AppID/AppSecret` 单独获取并缓存（与小程序 access_token 是两套，必须分开）。
- `data` 字段同小程序订阅（订单编号/详情/申请人/状态/温馨提示），字段类型按服务号模板详情页实际键名对齐。

**(e) 注册** `notification.module.ts`：加入新 provider。

**(f) 切换发送逻辑** `notification.service.ts` `notifyOrderCreated`：
```ts
// 优先服务号（厨师关注后长期可推）
if (order.chef.officialOpenId) {
  return this.officialProvider.sendOrderCreated({ ..., chefOpenId: order.chef.officialOpenId });
}
// 否则回退小程序一次性订阅 / 站内提醒
const subscription = ...;
```

**(g) 环境变量** `.env` 新增（区别于小程序）：
```
OA_APP_ID=服务号AppID
OA_APP_SECRET=服务号AppSecret
OA_TEMPLATE_ID=服务号模板ID
```

### 2.3 前端对接点
- `pages/me/index.*`：加"关注服务号接收提醒"引导（二维码/跳转），仅厨师身份可见。
- `services/notification.*`：保留小程序订阅逻辑作为 fallback；服务号通道无需前端授权（厨师关注即绑定）。

---

## 3. 若选路径②（企业微信）概要
1. 注册企业微信，创建应用/使用"客户联系"。
2. 后端用企业微信 `access_token` + `externalcontact/add_msg_template` 或 `message/send` 给添加的客户推消息。
3. 顾客需添加厨师企业微信为好友（扫码或搜索）。
4. 频控在企微管理后台配"每日 1 条"，基本满足每单提醒。

---

## 4. 推荐落地顺序
1. **立即做**：路径③站内提醒（红点/未读），零成本覆盖每单可见。
2. **同时保留**：现有小程序一次性订阅（用户点"开启"后的那 1 单弹窗）。
3. **评估**：若坚持微信主动弹窗，先走路径①但接受审核/政策风险；要长期稳定则路径②企业微信。

> 不论选哪条，现有 `WechatNotificationProvider` 的小程序订阅实现都保留为 fallback，不删除。
