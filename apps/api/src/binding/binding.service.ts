import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { randomBytes } from 'node:crypto';
import { PrismaService } from '../common/prisma.service';

@Injectable()
export class BindingService {
  constructor(private readonly prismaService: PrismaService) {}

  async listForUser(userId: string) {
    const [asCustomer, asChef, shareLinks] = await Promise.all([
      this.prismaService.binding.findMany({
        where: { customerId: userId },
        include: { chef: true },
        orderBy: { createdAt: 'desc' },
      }),
      this.prismaService.binding.findMany({
        where: { chefId: userId },
        include: { customer: true },
        orderBy: { createdAt: 'desc' },
      }),
      this.prismaService.bindingShareLink.findMany({
        where: { chefId: userId, isActive: true },
        orderBy: { createdAt: 'desc' },
      }),
    ]);

    return {
      asCustomer,
      asChef,
      shareLinks: shareLinks.map((link) => ({
        ...link,
        miniProgramPath: `/pages/bind-confirm/index?token=${link.token}`,
      })),
    };
  }

  async createShareLink(chefId: string) {
    const token = await this.generateShortToken();
    const link = await this.prismaService.bindingShareLink.create({
      data: {
        chefId,
        token,
      },
    });

    return {
      ...link,
      miniProgramPath: `/pages/bind-confirm/index?token=${token}`,
      shareTitle: '邀请你绑定我的菜单，之后就能直接点单',
      shareDescription: '打开小程序确认绑定后，就能开始点单。',
      mockShareMessage: '把这张绑定卡片发给顾客，确认后就能建立关系。',
    };
  }

  async confirmShareLink(customerId: string, token: string) {
    const shareLink = await this.prismaService.bindingShareLink.findUnique({
      where: { token },
    });

    if (!shareLink || !shareLink.isActive) {
      throw new NotFoundException('绑定链接不存在或已失效');
    }

    if (shareLink.chefId === customerId) {
      throw new BadRequestException('不能绑定自己');
    }

    const binding = await this.prismaService.binding.upsert({
      where: {
        customerId_chefId: {
          customerId,
          chefId: shareLink.chefId,
        },
      },
      update: {},
      create: {
        customerId,
        chefId: shareLink.chefId,
      },
      include: {
        chef: true,
      },
    });

    return {
      binding,
      message: `已绑定厨师 ${binding.chef.nickname ?? '未命名厨师'}`,
    };
  }

  async removeBinding(userId: string, relatedUserId: string) {
    const result = await this.prismaService.binding.deleteMany({
      where: {
        OR: [
          {
            customerId: userId,
            chefId: relatedUserId,
          },
          {
            customerId: relatedUserId,
            chefId: userId,
          },
        ],
      },
    });

    return {
      deleted: result.count > 0,
    };
  }

  private async generateShortToken() {
    for (let index = 0; index < 8; index += 1) {
      const token = randomBytes(4)
        .toString('base64url')
        .replace(/[^a-zA-Z0-9]/g, '')
        .slice(0, 6)
        .toUpperCase();

      if (token.length < 6) {
        continue;
      }

      const existed = await this.prismaService.bindingShareLink.findUnique({
        where: { token },
      });

      if (!existed) {
        return token;
      }
    }

    throw new BadRequestException('生成分享口令失败，请稍后重试');
  }
}