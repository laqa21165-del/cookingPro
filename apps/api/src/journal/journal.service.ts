import { Injectable } from '@nestjs/common';
import { PrismaService } from '../common/prisma.service';

@Injectable()
export class JournalService {
  constructor(private readonly prismaService: PrismaService) {}

  async markOrderCompleted(orderId: string, chefReply?: string) {
    const snapshot = await this.prismaService.journalSnapshot.findUnique({
      where: { orderId },
    });

    if (!snapshot) {
      return null;
    }

    const current = snapshot.structuredData as Record<string, unknown>;
    return this.prismaService.journalSnapshot.update({
      where: { orderId },
      data: {
        status: 'generated',
        structuredData: {
          ...current,
          completedAt: new Date().toISOString(),
          chefReply: chefReply ?? null,
        },
      },
    });
  }
}
