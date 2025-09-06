import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Request, Response } from 'express';

@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(HttpExceptionFilter.name);

  catch(exception: unknown, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    let status: number;
    let message: string | object;
    let error: string;

    if (exception instanceof HttpException) {
      status = exception.getStatus();
      const exceptionResponse = exception.getResponse();
      
      if (typeof exceptionResponse === 'string') {
        message = exceptionResponse;
        error = exception.name;
      } else {
        message = (exceptionResponse as any).message || exceptionResponse;
        error = (exceptionResponse as any).error || exception.name;
      }
    } else {
      // Error no manejado
      status = HttpStatus.INTERNAL_SERVER_ERROR;
      message = 'Error interno del servidor';
      error = 'InternalServerError';
      
      // Log del error completo para debugging
      this.logger.error(
        `Error no manejado: ${exception}`,
        exception instanceof Error ? exception.stack : undefined,
      );
    }

    // Log estructurado del error
    this.logger.error(
      `HTTP ${status} Error: ${message}`,
      {
        timestamp: new Date().toISOString(),
        path: request.url,
        method: request.method,
        ip: request.ip,
        userAgent: request.get('User-Agent'),
        body: request.body,
        query: request.query,
        params: request.params,
        error: error,
        stack: exception instanceof Error ? exception.stack : undefined,
      }
    );

    const errorResponse = {
      statusCode: status,
      timestamp: new Date().toISOString(),
      path: request.url,
      method: request.method,
      error: error,
      message: message,
    };

    response.status(status).json(errorResponse);
  }
}
