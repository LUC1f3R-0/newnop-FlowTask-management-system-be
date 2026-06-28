import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import {
  apiConfig,
  appConfig,
  dataConfig,
  smtpConfig,
} from './config/app.config.js';
import validationSchema from './config/valication.config.js';
import { SmtpModule } from './infastructure/smtp/smtp.module.js';
import { DatabaseModule } from './infastructure/database/database.module.js';
import { CorsConfig } from './common/cors/cors.config.js';
import { AuthModule } from './modules/auth/auth.module.js';
import { APP_GUARD, APP_INTERCEPTOR } from '@nestjs/core';
import { ApiKeyGuard } from './common/guards/api-key.guard.js';
import { ResponseInterceptor } from './common/interceptors/response.interceptor.js';
import { SerializeInterceptor } from './common/interceptors/serialize.interceptor.js';
import { UserModule } from './modules/users/users.module.js';
import { DashboardModule } from './modules/dashboard/dashboard.module.js';
import { TaskModule } from './modules/tasks/tasks.module.js';
import { HealthModule } from './modules/healthCheck/health.module.js';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [appConfig, dataConfig, smtpConfig, apiConfig],
      validationSchema,
      validationOptions: {
        abortEarly: false,
        allowUnknown: true,
      },
    }),
    HealthModule,
    SmtpModule,
    DatabaseModule,
    AuthModule,
    UserModule,
    DashboardModule,
    TaskModule,
  ],
  providers: [
    CorsConfig,
    {
      provide: APP_GUARD,
      useClass: ApiKeyGuard,
    },
    {
      provide: APP_INTERCEPTOR,
      useClass: ResponseInterceptor,
    },
    {
      provide: APP_INTERCEPTOR,
      useClass: SerializeInterceptor,
    },
  ],
})
export class AppModule {}
