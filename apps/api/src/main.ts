import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { FastifyAdapter, NestFastifyApplication } from '@nestjs/platform-fastify';
import multipart from '@fastify/multipart';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app.module';

async function bootstrap() {
  const adapter = new FastifyAdapter();

  const app = await NestFactory.create<NestFastifyApplication>(
    AppModule,
    adapter,
  );

  // 解决「无 body 的 DELETE/GET 返回 400」：微信 wx.request 会给所有请求自动带上
  // content-type: application/json，但 DELETE/GET 没有 body。Fastify 默认 JSON 解析器遇到
  // 空 body 会抛 FST_ERR_CTP_EMPTY_JSON_BODY 并直接 400，导致删除菜品 / 删除绑定等无 body 接口统统 400。
  // 这里用 onRequest 钩子，在解析前把空 body 请求的 content-type 摘掉，让 Fastify 不进 JSON 解析器
  // （body 视为 undefined）。注意：不能用 addContentTypeParser 覆盖 application/json（会与 Nest 自带的
  // JSON 解析器冲突，报 FST_ERR_CTP_ALREADY_PRESENT），所以改用钩子方式。
  const fastify = app.getHttpAdapter().getInstance();
  fastify.addHook('onRequest', (request, _reply, done) => {
    const ct = request.headers['content-type'];
    const cl = request.headers['content-length'];
    if (ct && ct.indexOf('application/json') !== -1 && (!cl || cl === '0')) {
      delete request.headers['content-type'];
    }
    done();
  });

  await app.register(multipart, {
    limits: {
      fileSize: 10 * 1024 * 1024,
      files: 1,
    },
  });

  app.setGlobalPrefix('api/v1');
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: true,
    }),
  );

  const swaggerConfig = new DocumentBuilder()
    .setTitle('文字支付点单小程序 API')
    .setDescription('正式版开发接口，覆盖绑定、菜单、订单、评价、通知、文件上传。')
    .setVersion('1.0.0')
    .addBearerAuth()
    .build();

  if (process.env.ENABLE_SWAGGER_UI === 'true') {
    const document = SwaggerModule.createDocument(app, swaggerConfig);
    SwaggerModule.setup('api/docs', app, document);
  }

  const port = Number(process.env.PORT || 3000);
  await app.listen(port, '0.0.0.0');
}

bootstrap();