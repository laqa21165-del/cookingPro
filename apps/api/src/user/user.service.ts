import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../common/prisma.service';

@Injectable()
export class UserService {
  constructor(private readonly prismaService: PrismaService) {}

  async getMe(userId: string) {
    const user = await this.prismaService.user.findUnique({
      where: { id: userId },
      include: {
        customerLinks: {
          include: {
            chef: true,
          },
        },
        chefLinks: {
          include: {
            customer: true,
          },
        },
        subscriptions: true,
      },
    });

    if (!user) {
      throw new NotFoundException('用户不存在');
    }

    return {
      id: user.id,
      openId: user.openId,
      nickname: user.nickname,
      avatarUrl: user.avatarUrl,
      bindings: {
        asCustomer: user.customerLinks.map((binding) => ({
          id: binding.id,
          chefId: binding.chefId,
          chefName: binding.chef.nickname,
          chefAvatarUrl: binding.chef.avatarUrl,
        })),
        asChef: user.chefLinks.map((binding) => ({
          id: binding.id,
          customerId: binding.customerId,
          customerName: binding.customer.nickname,
          customerAvatarUrl: binding.customer.avatarUrl,
        })),
      },
      subscriptions: user.subscriptions,
    };
  }
}
