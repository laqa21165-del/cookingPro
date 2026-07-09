import { BadRequestException, ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { DomainEventService } from '../common/domain-event.service';
import { PrismaService } from '../common/prisma.service';
import { CreateReviewDto } from './dto/create-review.dto';

@Injectable()
export class ReviewService {
  constructor(
    private readonly prismaService: PrismaService,
    private readonly domainEventService: DomainEventService,
  ) {}

  async create(userId: string, dto: CreateReviewDto) {
    const order = await this.prismaService.order.findUnique({
      where: { id: dto.orderId },
      include: { reviews: true },
    });

    if (!order) {
      throw new NotFoundException('订单不存在');
    }

    if (order.status !== 'completed') {
      throw new BadRequestException('订单完成后才可以评价');
    }

    let reviewerRole: 'customer' | 'chef';
    if (order.customerId === userId) {
      reviewerRole = 'customer';
    } else if (order.chefId === userId) {
      reviewerRole = 'chef';
    } else {
      throw new ForbiddenException('无权评价该订单');
    }

    const existed = order.reviews.find((review) => review.reviewerRole === reviewerRole);
    if (existed) {
      throw new BadRequestException('该角色已经评价过一次了');
    }

    const review = await this.prismaService.review.create({
      data: {
        orderId: dto.orderId,
        reviewerId: userId,
        reviewerRole,
        content: dto.content,
        imageUrl: dto.imageUrl,
      },
    });

    await this.domainEventService.publish('review.created', {
      orderId: dto.orderId,
      reviewerId: userId,
      reviewerRole,
    });

    return review;
  }
}
