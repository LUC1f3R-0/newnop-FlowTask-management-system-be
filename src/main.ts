import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module.js';
import { ConfigService } from '@nestjs/config';
import { CorsConfig } from './common/cors/cors.config.js';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const corsConfig = app.get(CorsConfig);
  const configService = app.get(ConfigService);

  app.enableCors(corsConfig.options);
  app.setGlobalPrefix('api/vi');
  app.enableShutdownHooks();

  const port = configService.get<number>('app.port') ?? 3000;

  await app.listen(port ?? 3000, '0.0.0.0');
}
bootstrap();
