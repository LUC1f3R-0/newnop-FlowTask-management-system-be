import { registerAs } from '@nestjs/config';

export const appConfig = registerAs('test', () => ({
  port: parseInt(process.env.PORT!, 10),
  test: process.env.SOMETHING,
  nodeEnv: process.env.NODE_ENV ?? 'production',
}));
