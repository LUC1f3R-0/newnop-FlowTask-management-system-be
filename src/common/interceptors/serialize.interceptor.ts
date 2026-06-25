import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { plainToInstance } from 'class-transformer';
import { map, Observable } from 'rxjs';
import { SERIALIZE_DTO_KEY } from '../decorators/serialize.decorator.js';

@Injectable()
export class SerializeInterceptor implements NestInterceptor {
  constructor(private readonly reflector: Reflector) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    const dto = this.reflector.getAllAndOverride<
      new (...args: any[]) => unknown
    >(SERIALIZE_DTO_KEY, [context.getHandler(), context.getClass()]);

    if (!dto) {
      return next.handle();
    }

    return next
      .handle()
      .pipe(map((response) => this.serializeResponse(dto, response)));
  }

  private serializeResponse(
    dto: new (...args: any[]) => unknown,
    response: unknown,
  ) {
    if (Array.isArray(response)) {
      return response.map((item) => this.serializeItem(dto, item));
    }

    if (this.isObject(response) && 'user' in response) {
      return {
        ...response,
        user: this.serializeItem(dto, response.user),
      };
    }

    if (
      this.isObject(response) &&
      'users' in response &&
      Array.isArray(response.users)
    ) {
      return {
        ...response,
        users: response.users.map((user) => this.serializeItem(dto, user)),
      };
    }

    return this.serializeItem(dto, response);
  }

  private serializeItem(dto: new (...args: any[]) => unknown, item: unknown) {
    return plainToInstance(dto, item, {
      excludeExtraneousValues: true,
    });
  }

  private isObject(value: unknown): value is Record<string, any> {
    return typeof value === 'object' && value !== null;
  }
}
