import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { Response } from 'express';

@Catch(HttpException)
export class HttpExceptionFilter implements ExceptionFilter {
  catch(exception: HttpException, host: ArgumentsHost): void {
    const context = host.switchToHttp();
    const response = context.getResponse<Response>();

    const status = exception.getStatus();
    const exceptionResponse = exception.getResponse();

    let code = 'INTERNAL_SERVER_ERROR';
    let message = 'Unexpected error.';
    let fields: Record<string, string[]> | undefined;

    if (typeof exceptionResponse === 'string') {
      message = exceptionResponse;
      code = this.mapCodeByStatus(status);
    }

    if (typeof exceptionResponse === 'object' && exceptionResponse !== null) {
      const payload = exceptionResponse as {
        code?: string;
        message?: string | string[];
        fields?: Record<string, string[]>;
      };

      if (payload.code) {
        code = payload.code;
      } else {
        code = this.mapCodeByStatus(status);
      }

      if (Array.isArray(payload.message)) {
        message = payload.message[0] ?? message;
      } else if (typeof payload.message === 'string') {
        message = payload.message;
      }

      if (payload.fields) {
        fields = payload.fields;
      }
    }

    response.status(status).json({
      data: null,
      meta: null,
      error: {
        code,
        message,
        ...(fields ? { fields } : {}),
      },
    });
  }

  private mapCodeByStatus(status: HttpStatus): string {
    switch (status) {
      case HttpStatus.BAD_REQUEST:
        return 'VALIDATION_ERROR';
      case HttpStatus.UNAUTHORIZED:
        return 'UNAUTHORIZED';
      case HttpStatus.FORBIDDEN:
        return 'FORBIDDEN';
      case HttpStatus.NOT_FOUND:
        return 'NOT_FOUND';
      case HttpStatus.CONFLICT:
        return 'CONFLICT';
      default:
        return 'INTERNAL_SERVER_ERROR';
    }
  }
}
