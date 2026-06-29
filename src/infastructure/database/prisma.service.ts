import { Injectable, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaMariaDb } from '@prisma/adapter-mariadb';
import { PrismaClient } from '../../../generated/prisma/client.js';

function createMariaDbAdapterConfig(databaseUrl: string, ssl: boolean) {
  const url = new URL(databaseUrl);

  if (url.protocol !== 'mysql:') {
    throw new Error('DATABASE_URL must start with mysql://');
  }

  const database = url.pathname.replace('/', '');

  if (!database) {
    throw new Error('DATABASE_URL must include a database name');
  }

  const isLambda = Boolean(process.env.AWS_LAMBDA_FUNCTION_NAME);

  return {
    host: url.hostname,
    port: url.port ? Number(url.port) : 3306,
    user: decodeURIComponent(url.username),
    password: decodeURIComponent(url.password),
    database: decodeURIComponent(database),

    // Lambda should not keep a large/stale DB pool alive.
    connectionLimit: isLambda ? 1 : 5,
    connectTimeout: 10_000,
    acquireTimeout: 10_000,
    idleTimeout: isLambda ? 5 : 300,

    allowPublicKeyRetrieval: true,

    // Required for AWS RDS when require_secure_transport=ON.
    // Better production version: use the RDS CA bundle with rejectUnauthorized: true.
    ssl: ssl ? { rejectUnauthorized: false } : undefined,
  };
}

@Injectable()
export class PrismaService
  extends PrismaClient
  implements OnModuleInit, OnModuleDestroy
{
  constructor(private readonly configService: ConfigService) {
    const databaseUrl = configService.getOrThrow<string>('database.url');
    const ssl = configService.getOrThrow<boolean>('database.ssl');

    const adapter = new PrismaMariaDb(
      createMariaDbAdapterConfig(databaseUrl, ssl),
    );

    super({
      adapter,
    });
  }

  async onModuleInit() {
    // In Lambda, avoid opening a DB connection during cold start.
    // Let the first real DB query open it.
    if (!process.env.AWS_LAMBDA_FUNCTION_NAME) {
      await this.$connect();
    }
  }

  async onModuleDestroy() {
    await this.$disconnect();
  }
}
