import { Expose } from 'class-transformer';
import { Role } from '../../../../generated/prisma/enums.js';

export class PublicUserInput {
  @Expose()
  uuid!: string;

  @Expose()
  name!: string;

  @Expose()
  email!: string;

  @Expose()
  role!: Role;

  @Expose()
  createdAt!: Date;

  @Expose()
  updatedAt!: Date;
}
