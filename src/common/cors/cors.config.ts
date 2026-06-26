import { Injectable } from '@nestjs/common';
import { CorsOptions } from '@nestjs/common/interfaces/external/cors-options.interface.js';
import { ConfigService } from '@nestjs/config';

@Injectable()
class CorsConfig {
  constructor(private readonly configService: ConfigService) {}

  get options(): CorsOptions {
    return {
      origin: this.configService.getOrThrow<string[]>('app.cors.origins'),

      methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],

      allowedHeaders: [
        'Content-Type',
        'Accept',
        'Authorization',
        'X-Request-Id',
        'Idempotency-Key',
        'x-api-key',
      ],

      exposedHeaders: ['X-Request-Id'],

      credentials: true,

      maxAge: 86400,
    };
  }
}

export { CorsConfig };
