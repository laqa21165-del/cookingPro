import { Module } from '@nestjs/common';
import { NotificationController } from './notification.controller';
import { NotificationService } from './notification.service';
import { WechatNotificationProvider } from './wechat-notification.provider';

@Module({
  controllers: [NotificationController],
  providers: [NotificationService, WechatNotificationProvider],
  exports: [NotificationService],
})
export class NotificationModule {}
