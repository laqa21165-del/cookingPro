import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from './prisma.service';

@Injectable()
export class DomainEventService {
  constructor(private readonly prismaService: PrismaService) {}

  async publish(topic: string, payload: Record<string, unknown>) {
    return this.prismaService.outboxEvent.create({
      data: {
        topic,
        payload: payload as Prisma.InputJsonValue,
      },
    });
  }
}
