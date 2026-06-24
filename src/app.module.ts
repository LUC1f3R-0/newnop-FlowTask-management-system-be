import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { appConfig, dataConfig, smtpConfig } from './config/app.config.js';
import validationSchema from './config/valication.config.js';
import { SmtpModule } from './infastructure/smtp/smtp.module.js';
import { DatabaseModule } from './infastructure/database/database.module.js';
import { CorsConfig } from './common/cors/cors.config.js';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [appConfig, dataConfig, smtpConfig],
      validationSchema,
      validationOptions: {
        abortEarly: false,
        allowUnknown: true,
      },
    }),
    SmtpModule,
    DatabaseModule,
  ],
  providers: [CorsConfig],
})
export class AppModule {}
