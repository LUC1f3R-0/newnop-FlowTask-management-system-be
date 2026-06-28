import { ConfigService } from '@nestjs/config';
import { HelloResponse } from './app.dto';
export declare class AppService {
    private readonly configService;
    constructor(configService: ConfigService);
    getHello(): HelloResponse;
}
