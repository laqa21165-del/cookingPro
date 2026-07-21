import { Injectable } from '@nestjs/common';
import { DomainEventService } from '../common/domain-event.service';
import { PrismaService } from '../common/prisma.service';
import { WechatNotificationProvider } from './wechat-notification.provider';

@Injectable()
export class NotificationService {
  constructor(
    private readonly prismaService: PrismaService,
    private readonly provider: WechatNotificationProvider,
    private readonly domainEventService: DomainEventService,
  ) {}

  async subscribe(userId: string, templateId: string) {
    return this.prismaService.notificationSubscription.upsert({
      where: {
        userId_templateId: {
          userId,
          templateId,
        },
      },
      update: {
        status: 'accepted',
      },
      create: {
        userId,
        templateId,
        status: 'accepted',
      },
    });
  }

  async notifyOrderCreated(orderId: string): Promise<'sent' | 'fallback' | 'failed'> {
    const order = await this.prismaService.order.findUnique({
      where: { id: orderId },
      include: {
        customer: true,
        chef: true,
        items: true,
      },
    });

    if (!order) {
      return 'failed';
    }

    const subscription = await this.prismaService.notificationSubscription.findFirst({
      where: {
        userId: order.chefId,
        status: 'accepted',
      },
    });

    if (!subscription) {
      await this.domainEventService.publish('notification.fallback', {
        orderId,
        reason: 'subscription_missing',
      });
      return 'fallback';
    }

    const summary = order.items.map((item) => `${item.name}x${item.quantity}`).join('、');
    const status = await this.provider.sendOrderCreated({
      orderId,
      chefOpenId: order.chef.openId,
      customerNickname: order.customer.nickname,
      summary,
      orderShortId: String(order.id).slice(-4).toUpperCase(),
      status: order.status,
    });

    await this.domainEventService.publish('notification.order_created', {
      orderId,
      status,
      templateId: subscription.templateId,
    });

    return status;
  }
}
