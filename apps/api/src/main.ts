import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import cookieParser from 'cookie-parser';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { SESSION_COOKIE_NAME } from './auth/auth.constants';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.use(cookieParser());
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  const swaggerConfig = new DocumentBuilder()
    .setTitle('Mini Pay API')
    .setDescription('미니페이 인증, 지갑, 거래 API 문서')
    .setVersion('1.0.0')
    .addCookieAuth(SESSION_COOKIE_NAME, {
      type: 'apiKey',
      in: 'cookie',
      name: SESSION_COOKIE_NAME,
      description: '로그인 시 발급되는 세션 쿠키',
    })
    .build();
  const swaggerDocument = SwaggerModule.createDocument(app, swaggerConfig);

  SwaggerModule.setup('docs', app, swaggerDocument, {
    swaggerOptions: {
      persistAuthorization: true,
    },
  });

  await app.listen(process.env.PORT ?? 4301);
}
void bootstrap();
