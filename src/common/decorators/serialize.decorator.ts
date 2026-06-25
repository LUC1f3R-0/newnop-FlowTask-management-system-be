import { SetMetadata } from '@nestjs/common';

export const SERIALIZE_DTO_KEY = 'serialize_dto';

export const Serialize = (dto: new (...args: any[]) => unknown) =>
  SetMetadata(SERIALIZE_DTO_KEY, dto);
