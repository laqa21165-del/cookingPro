import { Global, Module } from '@nestjs/common';
import { DomainEventService } from './domain-event.service';
import { PrismaService } from './prisma.service';

@Global()
@Module({
  providers: [PrismaService, DomainEventService],
  exports: [PrismaService, DomainEventService],
})
export class PrismaModule {}
