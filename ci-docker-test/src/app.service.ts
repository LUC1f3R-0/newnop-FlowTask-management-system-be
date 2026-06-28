import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { HelloResponse } from './app.dto';

@Injectable()
export class AppService {
  constructor(private readonly configService: ConfigService) {}

  getHello(): HelloResponse {
    return {
      runningFrom:
        this.configService.get<string>('test.test') ?? 'hardcoded secret',
      runningOn: this.configService.get<string>('test.nodeEnv') ?? 'unknown',
    };
  }
}
