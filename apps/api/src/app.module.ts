import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { AppController } from './app.controller';
import { PrismaModule } from './common/prisma.module';
import { RedisModule } from './common/redis.module';
import { AuthModule } from './auth/auth.module';
import { UserModule } from './user/user.module';
import { BindingModule } from './binding/binding.module';
import { MenuModule } from './menu/menu.module';
import { OrderModule } from './order/order.module';
import { ReviewModule } from './review/review.module';
import { FileModule } from './file/file.module';
import { NotificationModule } from './notification/notification.module';
import { JournalModule } from './journal/journal.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      cache: true,
      envFilePath: ['.env.local', '.env'],
    }),
    JwtModule.registerAsync({
      global: true,
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        // 不设置兜底默认值：JWT_SECRET 缺失时启动即失败，避免误用已知弱密钥签发令牌
        secret: configService.get<string>('JWT_SECRET'),
        signOptions: {
          expiresIn: configService.get<string>('JWT_EXPIRES_IN', '7d') as any,
        },
      }),
    }),
    PrismaModule,
    RedisModule,
    AuthModule,
    UserModule,
    BindingModule,
    MenuModule,
    OrderModule,
    ReviewModule,
    FileModule,
    NotificationModule,
    JournalModule,
  ],
  controllers: [AppController],
})
export class AppModule {}
