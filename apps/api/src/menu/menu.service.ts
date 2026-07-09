import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../common/prisma.service';
import { CreateMenuItemDto } from './dto/create-menu-item.dto';
import { UpdateMenuItemDto } from './dto/update-menu-item.dto';

@Injectable()
export class MenuService {
  constructor(private readonly prismaService: PrismaService) {}

  list(chefId?: string) {
    return this.prismaService.menuItem.findMany({
      where: chefId ? { chefId } : undefined,
      orderBy: [{ sortOrder: 'asc' }, { createdAt: 'desc' }],
    });
  }

  create(chefId: string, dto: CreateMenuItemDto) {
    return this.prismaService.menuItem.create({
      data: {
        chefId,
        name: dto.name,
        description: dto.description,
        imageUrl: dto.imageUrl,
        textPrice: dto.textPrice,
        sortOrder: dto.sortOrder ?? 0,
      },
    });
  }

  async update(chefId: string, id: string, dto: UpdateMenuItemDto) {
    await this.assertOwner(chefId, id);
    return this.prismaService.menuItem.update({
      where: { id },
      data: dto,
    });
  }

  async updateStatus(chefId: string, id: string, status: 'active' | 'inactive') {
    await this.assertOwner(chefId, id);
    return this.prismaService.menuItem.update({
      where: { id },
      data: { status },
    });
  }

  async remove(chefId: string, id: string) {
    await this.assertOwner(chefId, id);
    await this.prismaService.menuItem.delete({ where: { id } });
    return { deleted: true };
  }

  private async assertOwner(chefId: string, id: string) {
    const item = await this.prismaService.menuItem.findUnique({ where: { id } });
    if (!item) {
      throw new NotFoundException('菜品不存在');
    }

    if (item.chefId !== chefId) {
      throw new ForbiddenException('无权操作该菜品');
    }
  }
}
