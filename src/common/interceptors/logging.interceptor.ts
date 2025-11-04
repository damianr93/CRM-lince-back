import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  Logger,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { Request, Response } from 'express';

@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  private readonly logger = new Logger(LoggingInterceptor.name);

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const ctx = context.switchToHttp();
    const request = ctx.getRequest<Request>();
    const response = ctx.getResponse<Response>();
    const { method, url, body, query, params } = request;
    const userAgent = request.get('User-Agent') || '';
    const ip = request.ip;

    const now = Date.now();

    this.logger.log(
      `Incoming Request: ${method} ${url}`,
      {
        method,
        url,
        ip,
        userAgent,
        body: this.sanitizeBody(body),
        query,
        params,
        timestamp: new Date().toISOString(),
      }
    );

    return next.handle().pipe(
      tap({
        next: (data) => {
          const responseTime = Date.now() - now;
          
          // Calcular tamaño de data de forma segura
          let dataSize: number | string = 0;
          try {
            if (Buffer.isBuffer(data)) {
              dataSize = data.length;
            } else if (data && typeof data === 'object' && 'getStream' in data) {
              // StreamableFile de NestJS
              dataSize = 'stream';
            } else if (data !== undefined && data !== null) {
              dataSize = JSON.stringify(data).length;
            }
          } catch (error) {
            dataSize = 'unknown';
          }
          
          this.logger.log(
            `Outgoing Response: ${method} ${url} - ${response.statusCode} (${responseTime}ms)`,
            {
              method,
              url,
              statusCode: response.statusCode,
              responseTime,
              dataSize,
              timestamp: new Date().toISOString(),
            }
          );
        },
        error: (error) => {
          const responseTime = Date.now() - now;
          this.logger.error(
            `Request Error: ${method} ${url} - ${error.status || 500} (${responseTime}ms)`,
            {
              method,
              url,
              statusCode: error.status || 500,
              responseTime,
              error: error.message,
              stack: error.stack,
              timestamp: new Date().toISOString(),
            }
          );
        },
      }),
    );
  }

  private sanitizeBody(body: any): any {
    if (!body) return body;
    
    // Crear una copia del body para sanitizar
    const sanitized = { ...body };
    
    // Remover campos sensibles si existen
    const sensitiveFields = ['password', 'token', 'secret', 'key'];
    sensitiveFields.forEach(field => {
      if (sanitized[field]) {
        sanitized[field] = '[REDACTED]';
      }
    });
    
    return sanitized;
  }
}
