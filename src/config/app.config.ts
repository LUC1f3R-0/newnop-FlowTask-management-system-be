import { registerAs } from '@nestjs/config';

export const appConfig = registerAs('app', () => ({
  port: parseInt(process.env.PORT ?? '3000', 10),
  cors: {
    origins:
      process.env.CORS_ORIGINS?.split(',').map((origin) => origin.trim()) ?? [],
  },
}));

export const dataConfig = registerAs('database', () => ({
  url: process.env.DATABASE_URL,
  // host: process.env.DATABASE_HOST,
  // port: parseInt(process.env.DATABASE_PORT ?? '5432', 10),
  // username: process.env.DATABASE_USER,
  // password: process.env.DATABASE_PASSWORD,
  // name: process.env.DATABASE_NAME,
  ssl: process.env.DB_SSL === 'true',
  logging: process.env.DB_LOGGING === 'true',
}));

export const smtpConfig = registerAs('smtp', () => ({
  host: process.env.SMTP_HOST,
  port: parseInt(process.env.SMTP_PORT ?? '587', 10),
  secure: process.env.SMTP_SECURE === 'true',
  user: process.env.SMTP_USER,
  password: process.env.SMTP_PASS,
}));
