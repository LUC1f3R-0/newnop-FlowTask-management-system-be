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
        'X-Request-Id',
        'Idempotency-Key',
      ],
      exposedHeaders: ['X-Request-Id'],
      credentials: false,
      maxAge: 86400,
    };
  }
}

export { CorsConfig };
