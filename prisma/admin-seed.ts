import bcrypt from 'bcrypt';
import { Logger } from '@nestjs/common';
import { PrismaMariaDb } from '@prisma/adapter-mariadb';
import { PrismaClient, Role } from '../generated/prisma/client.js';
// require('dotenv').config();

class UserSeeder {
  private prisma: PrismaClient;
  private logger: Logger;

  constructor() {
    const databaseUrl = process.env.DATABASE_URL;
    console.log(databaseUrl);
    if (!databaseUrl) {
      throw new Error('DATABASE_URL is missing');
    }

    const url = new URL(databaseUrl);

    const adapter = new PrismaMariaDb({
      host: url.hostname,
      port: Number(url.port || 3306),
      user: decodeURIComponent(url.username),
      password: decodeURIComponent(url.password),
      database: url.pathname.replace('/', ''),
      connectionLimit: 5,
    });

    this.prisma = new PrismaClient({ adapter });
    this.logger = new Logger('UserSeeder');
  }

  async seedAdmin() {
    const uuid = '00000000-0000-0000-0000-000000000001';

    const email = process.env.ADMIN_EMAIL;
    const password = process.env.ADMIN_PASSWORD;

    if (!email) {
      throw new Error('ADMIN_EMAIL is missing');
    }

    if (!password) {
      throw new Error('ADMIN_PASSWORD is missing');
    }

    const hashedPassword = await bcrypt.hash(password, 12);

    const user = await this.prisma.users.findUnique({
      where: { email },
    });
    if (user != null) {
      this.logger.error(`there is a person with ${user.email}`);
      this.logger.warn('change the email in the environment variable');
    } else {
      await this.prisma.users.upsert({
        where: { uuid },
        update: {
          name: 'admin',
          email,
          password: hashedPassword,
          role: Role.ADMIN,
        },
        create: {
          uuid,
          name: 'admin',
          email,
          password: hashedPassword,
          role: Role.ADMIN,
        },
      });
      this.logger.log('Admin user created/updated');
      this.logger.log(`admin email: ${email}`);
    }
  }

  async run() {
    await this.seedAdmin();
  }

  async disconnect() {
    await this.prisma.$disconnect();
  }
}

async function main() {
  const seeder = new UserSeeder();

  try {
    await seeder.run();
  } catch (err) {
    console.error(err);
    process.exit(1);
  } finally {
    await seeder.disconnect();
  }
}

main();
