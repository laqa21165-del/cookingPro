export interface SendOrderNotificationPayload {
  orderId: string;
  chefOpenId: string;
  customerNickname: string | null;
  summary: string;
  orderShortId?: string; // 订单编号（取 id 后 4 位，与前端 shortId 约定一致）
  status?: string; // 订单状态原值（pending/completed...），provider 内转中文
}

export interface NotificationProvider {
  sendOrderCreated(payload: SendOrderNotificationPayload): Promise<'sent' | 'fallback' | 'failed'>;
}
