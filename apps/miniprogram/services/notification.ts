import { request } from '../utils/request';

// ⚠️ 替换为公众平台「订阅消息」里申请的真实模板ID（需与后端 .env 的 WECHAT_MESSAGE_TEMPLATE_ID 保持一致）
export const WECHAT_TEMPLATE_ID = 'sqBeT8zgAX9z1W9pIqpWHfI3We68Ik4otVd0uwQhDaI';

export function subscribeNotification(templateId: string) {
  return request({ url: '/notifications/subscribe', method: 'POST', data: { templateId } });
}
