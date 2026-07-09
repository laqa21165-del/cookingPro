import { Module } from '@nestjs/common';
import { NotificationModule } from '../notification/notification.module';
import { JournalModule } from '../journal/journal.module';
import { OrderController } from './order.controller';
import { OrderService } from './order.service';

@Module({
  imports: [NotificationModule, JournalModule],
  controllers: [OrderController],
  providers: [OrderService],
  exports: [OrderService],
})
export class OrderModule {}
