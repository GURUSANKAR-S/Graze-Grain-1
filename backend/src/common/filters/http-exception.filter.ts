import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { MulterError } from 'multer';

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    const isMulterError = exception instanceof MulterError;
    const isInvalidFileTypeError =
      exception instanceof Error &&
      exception.message.startsWith('INVALID_FILE_TYPE');

    const status =
      exception instanceof HttpException
        ? exception.getStatus()
        : isMulterError || isInvalidFileTypeError
          ? HttpStatus.BAD_REQUEST
          : HttpStatus.INTERNAL_SERVER_ERROR;

    const errorResponse: {
      success: false;
      error: {
        code: string;
        message: string;
        statusCode: number;
      };
    } = {
      success: false,
      error: {
        statusCode: status,
        message: 'Internal server error',
        code: 'INTERNAL_ERROR',
      },
    };

    if (exception instanceof HttpException) {
      const exceptionResponse = exception.getResponse();
      const payload =
        typeof exceptionResponse === 'string'
          ? { message: exceptionResponse }
          : (exceptionResponse as Record<string, unknown>);

      const message = payload.message;
      errorResponse.error.message = Array.isArray(message)
        ? message.join(', ')
        : (message as string) || exception.message;
      errorResponse.error.code =
        (payload.code as string) ||
        request.method + '_' + status.toString() + '_ERROR';
    } else if (isMulterError) {
      errorResponse.error.code = 'FILE_UPLOAD_ERROR';
      errorResponse.error.message = 'Invalid upload payload';
    } else if (isInvalidFileTypeError) {
      errorResponse.error.code = 'INVALID_FILE_TYPE';
      errorResponse.error.message =
        'Only jpg, jpeg, png, webp files are allowed';
    } else {
      console.error(exception);
    }

    response.status(status).json(errorResponse);
  }
}
