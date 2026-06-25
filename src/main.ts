import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module.js';
import { ConfigService } from '@nestjs/config';
import { CorsConfig } from './common/cors/cors.config.js';
import { appValidationPipe } from './common/pipes/app-validation.pipe.js';
import cookieParser from 'cookie-parser';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const corsConfig = app.get(CorsConfig);
  const configService = app.get(ConfigService);

  app.enableCors(corsConfig.options);
  app.setGlobalPrefix('api/vi');
  app.enableShutdownHooks();
  app.useGlobalPipes(appValidationPipe);
  app.use(cookieParser());

  const port = configService.get<number>('app.port') ?? 3000;

  await app.listen(port ?? 3000, '0.0.0.0');
}
bootstrap();
