import { BadRequestException, ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { DomainEventService } from '../common/domain-event.service';
import { PrismaService } from '../common/prisma.service';
import { countMeaningfulChars } from '../common/utils/text-counter';
import { JournalService } from '../journal/journal.service';
import { NotificationService } from '../notification/notification.service';
import { ListOrdersQueryDto } from './dto/list-orders-query.dto';
import { CompleteOrderDto, CreateOrderDto } from './dto/order.dto';

@Injectable()
export class OrderService {
  constructor(
    private readonly prismaService: PrismaService,
    private readonly notificationService: NotificationService,
    private readonly journalService: JournalService,
    private readonly domainEventService: DomainEventService,
  ) {}

  async create(customerId: string, dto: CreateOrderDto) {
    if (!dto.items.length) {
      throw new BadRequestException('购物车不能为空');
    }

    const binding = await this.prismaService.binding.findUnique({
      where: {
        customerId_chefId: {
          customerId,
          chefId: dto.chefId,
        },
      },
    });

    if (!binding) {
      throw new ForbiddenException('请先绑定厨师再下单');
    }

    const menuItems = await this.prismaService.menuItem.findMany({
      where: {
        chefId: dto.chefId,
        id: { in: dto.items.map((item) => item.menuItemId) },
        status: 'active',
      },
    });

    if (menuItems.length !== dto.items.length) {
      throw new BadRequestException('存在不可下单的菜品');
    }

    const snapshotInput = dto.items.map((item) => {
      const menuItem = menuItems.find((candidate) => candidate.id === item.menuItemId);
      if (!menuItem) {
        throw new BadRequestException('菜品不存在');
      }

      return {
        menuItemId: menuItem.id,
        name: menuItem.name,
        description: menuItem.description,
        imageUrl: menuItem.imageUrl,
        textPrice: menuItem.textPrice,
        quantity: item.quantity,
      };
    });

    const requiredTextCount = snapshotInput.reduce(
      (total, item) => total + item.textPrice * item.quantity,
      0,
    );
    const actualTextCount = countMeaningfulChars(dto.paymentText);

    if (actualTextCount < requiredTextCount) {
      throw new BadRequestException(`当前文字数量不足，需要至少 ${requiredTextCount} 个字。`);
    }

    const order = await this.prismaService.$transaction(async (tx) => {
      const createdOrder = await tx.order.create({
        data: {
          customerId,
          chefId: dto.chefId,
          requiredTextCount,
          paymentText: dto.paymentText,
          items: {
            create: snapshotInput,
          },
        },
        include: {
          items: true,
          customer: true,
          chef: true,
          reviews: true,
        },
      });

      await tx.journalSnapshot.create({
        data: {
          orderId: createdOrder.id,
          customerId,
          structuredData: {
            orderId: createdOrder.id,
            createdAt: createdOrder.createdAt.toISOString(),
            chefId: createdOrder.chefId,
            items: snapshotInput,
            paymentText: dto.paymentText,
          } as Prisma.InputJsonValue,
        },
      });

      return createdOrder;
    });

    const notifyStatus = await this.notificationService.notifyOrderCreated(order.id);
    await this.prismaService.order.update({
      where: { id: order.id },
      data: { notifyStatus },
    });

    await this.domainEventService.publish('order.created', {
      orderId: order.id,
      customerId,
      chefId: dto.chefId,
      notifyStatus,
    });

    return this.detail(customerId, order.id);
  }

  async list(userId: string, query: ListOrdersQueryDto) {
    const role = query.role ?? 'all';
    const where: Prisma.OrderWhereInput = {
      ...(query.status ? { status: query.status } : {}),
      ...(role === 'customer'
        ? { customerId: userId }
        : role === 'chef'
          ? { chefId: userId }
          : { OR: [{ customerId: userId }, { chefId: userId }] }),
    };

    return this.prismaService.order.findMany({
      where,
      include: {
        items: true,
        reviews: true,
        customer: true,
        chef: true,
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async detail(userId: string, id: string) {
    const order = await this.prismaService.order.findUnique({
      where: { id },
      include: {
        items: true,
        reviews: true,
        customer: true,
        chef: true,
        journalSnapshot: true,
      },
    });

    if (!order) {
      throw new NotFoundException('订单不存在');
    }

    if (order.customerId !== userId && order.chefId !== userId) {
      throw new ForbiddenException('无权查看该订单');
    }

    return order;
  }

  async complete(chefId: string, id: string, dto: CompleteOrderDto) {
    const order = await this.prismaService.order.findUnique({ where: { id } });
    if (!order) {
      throw new NotFoundException('订单不存在');
    }

    if (order.chefId !== chefId) {
      throw new ForbiddenException('只有绑定厨师可以完成订单');
    }

    if (order.status === 'completed') {
      throw new BadRequestException('订单已完成');
    }

    const updated = await this.prismaService.order.update({
      where: { id },
      data: {
        status: 'completed',
        chefReply: dto.chefReply,
        completedAt: new Date(),
      },
      include: {
        items: true,
        reviews: true,
        customer: true,
        chef: true,
      },
    });

    await this.journalService.markOrderCompleted(updated.id, dto.chefReply);
    await this.domainEventService.publish('order.completed', {
      orderId: updated.id,
      chefId,
    });

    return updated;
  }
}
