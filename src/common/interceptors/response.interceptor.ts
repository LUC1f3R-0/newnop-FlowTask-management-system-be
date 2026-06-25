import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { map, Observable } from 'rxjs';
import { RESPONSE_MESSAGE_KEY } from '../decorators/response-message.decorator.js';

type Meta = Record<string, unknown> | null;

type StandardSuccessResponse<T> = {
  success: true;
  message: string;
  data: T | null;
  meta: Meta;
  errors: null;
};

type ResponseWithMeta<T> = {
  data: T;
  meta?: Meta;
};

@Injectable()
export class ResponseInterceptor<T> implements NestInterceptor<
  T,
  StandardSuccessResponse<T>
> {
  constructor(private readonly reflector: Reflector) {}

  intercept(
    context: ExecutionContext,
    next: CallHandler,
  ): Observable<StandardSuccessResponse<T>> {
    const message =
      this.reflector.getAllAndOverride<string>(RESPONSE_MESSAGE_KEY, [
        context.getHandler(),
        context.getClass(),
      ]) ?? 'Request successful';

    return next.handle().pipe(
      map((response: T | ResponseWithMeta<T>) => {
        if (this.isAlreadyFormatted(response)) {
          return response as StandardSuccessResponse<T>;
        }

        if (this.hasPaginationMeta(response)) {
          return {
            success: true,
            message,
            data: response.data,
            meta: response.meta ?? null,
            errors: null,
          };
        }

        return {
          success: true,
          message,
          data: response ?? null,
          meta: null,
          errors: null,
        };
      }),
    );
  }

  private isAlreadyFormatted(value: unknown): boolean {
    return (
      typeof value === 'object' &&
      value !== null &&
      'success' in value &&
      'message' in value &&
      'data' in value &&
      'errors' in value
    );
  }

  private hasPaginationMeta(value: unknown): value is ResponseWithMeta<T> {
    return (
      typeof value === 'object' &&
      value !== null &&
      'data' in value &&
      'meta' in value
    );
  }
}
