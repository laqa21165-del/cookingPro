import { Injectable, Logger } from '@nestjs/common';
import { NotificationProvider, SendOrderNotificationPayload } from './notification.types';

@Injectable()
export class WechatNotificationProvider implements NotificationProvider {
  private readonly logger = new Logger(WechatNotificationProvider.name);

  async sendOrderCreated(payload: SendOrderNotificationPayload): Promise<'sent' | 'fallback' | 'failed'> {
    this.logger.log(`Mock send wechat notification for order ${payload.orderId} to ${payload.chefOpenId}`);
    return 'sent';
  }
}
