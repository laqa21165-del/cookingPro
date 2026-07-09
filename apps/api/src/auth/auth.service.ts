import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../common/prisma.service';
import { LoginDto } from './dto/login.dto';

@Injectable()
export class AuthService {
  constructor(
    private readonly prismaService: PrismaService,
    private readonly jwtService: JwtService,
  ) {}

  async login(dto: LoginDto) {
    const allowMockWechat = process.env.AUTH_ALLOW_MOCK_WECHAT !== 'false';
    const openId = dto.mockOpenId ?? (allowMockWechat ? `mock_${dto.code}` : null);

    if (!openId) {
      throw new UnauthorizedException('当前环境未开启 mock 微信登录，请接入真实微信 code 换取 openid。');
    }

    const user = await this.prismaService.user.upsert({
      where: { openId },
      update: {
        nickname: dto.nickname ?? undefined,
        avatarUrl: dto.avatarUrl ?? undefined,
      },
      create: {
        openId,
        nickname: dto.nickname,
        avatarUrl: dto.avatarUrl,
      },
    });

    const accessToken = await this.jwtService.signAsync({
      sub: user.id,
      openId: user.openId,
    });

    return {
      accessToken,
      refreshToken: accessToken,
      user,
    };
  }
}
