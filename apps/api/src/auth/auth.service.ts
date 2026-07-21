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
    const appId = process.env.WECHAT_APP_ID;
    const secret = process.env.WECHAT_APP_SECRET;
    const allowMockWechat = process.env.AUTH_ALLOW_MOCK_WECHAT !== 'false';

    let openId: string | null = null;

    // 优先用真实微信登录 code 换 openid（需要 appId + secret 都配置）
    if (dto.code && appId && secret) {
      try {
        openId = await this.exchangeWechatOpenId(appId, secret, dto.code);
      } catch (error) {
        if (!allowMockWechat) {
          throw new UnauthorizedException(`微信登录失败：${(error as Error).message}`);
        }
        openId = null;
      }
    }

    // 回退（仅当 AUTH_ALLOW_MOCK_WECHAT=true 的开发态才允许）：
    // 显式传入 mockOpenId，或本地开发用 mock_${code}。
    // 注意：生产必须 AUTH_ALLOW_MOCK_WECHAT=false，否则任何人可用 mockOpenId 冒充任意用户。
    if (!openId && allowMockWechat && dto.mockOpenId) {
      openId = dto.mockOpenId;
    } else if (!openId && allowMockWechat && dto.code) {
      openId = `mock_${dto.code}`;
    }

    if (!openId) {
      throw new UnauthorizedException(
        '无法获取微信 openid：请配置 WECHAT_APP_ID / WECHAT_APP_SECRET，或开启 AUTH_ALLOW_MOCK_WECHAT。',
      );
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

  /**
   * 调用微信 jscode2session，用登录 code 换取 openid。
   * 文档：https://developers.weixin.qq.com/miniprogram/dev/api-backend/open-api/login/auth.code2Session.html
   */
  private async exchangeWechatOpenId(appId: string, secret: string, code: string): Promise<string> {
    const url =
      `https://api.weixin.qq.com/sns/jscode2session` +
      `?appid=${encodeURIComponent(appId)}` +
      `&secret=${encodeURIComponent(secret)}` +
      `&js_code=${encodeURIComponent(code)}` +
      `&grant_type=authorization_code`;

    const response = await fetch(url);
    const data = (await response.json()) as {
      openid?: string;
      session_key?: string;
      unionid?: string;
      errcode?: number;
      errmsg?: string;
    };

    if (!response.ok || data.errcode || !data.openid) {
      throw new Error(`code2session errcode=${data.errcode ?? 'n/a'} errmsg=${data.errmsg ?? 'n/a'}`);
    }

    return data.openid;
  }
}
