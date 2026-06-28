"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.appConfig = void 0;
const config_1 = require("@nestjs/config");
exports.appConfig = (0, config_1.registerAs)('test', () => ({
    port: parseInt(process.env.PORT, 10),
    test: process.env.SOMETHING,
    nodeEnv: process.env.NODE_ENV ?? 'production',
}));
//# sourceMappingURL=app.config.js.map