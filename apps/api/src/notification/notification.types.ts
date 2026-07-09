export interface SendOrderNotificationPayload {
  orderId: string;
  chefOpenId: string;
  customerNickname: string | null;
  summary: string;
}

export interface NotificationProvider {
  sendOrderCreated(payload: SendOrderNotificationPayload): Promise<'sent' | 'fallback' | 'failed'>;
}
