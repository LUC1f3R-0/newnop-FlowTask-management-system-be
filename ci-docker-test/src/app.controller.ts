import { Controller, Get } from '@nestjs/common';
import { AppService } from './app.service';
import { HelloResponse } from './app.dto';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  getHello(): HelloResponse {
    return this.appService.getHello();
  }
}
