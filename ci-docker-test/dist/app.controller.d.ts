import { AppService } from './app.service';
import { HelloResponse } from './app.dto';
export declare class AppController {
    private readonly appService;
    constructor(appService: AppService);
    getHello(): HelloResponse;
}
