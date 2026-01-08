import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe, VersioningType } from '@nestjs/common';
import helmet from 'helmet';
import * as compression from 'compression';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { MyLogger } from './services/logger/logger';
import { ConfigService } from '@nestjs/config';
import { envs } from './config/envs';
import * as cookieParser from 'cookie-parser';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  const configService = app.get(ConfigService);
  app.use(cookieParser());

  app.enableVersioning({
    type: VersioningType.URI,
  });

  // Configurar orígenes permitidos
  const allowedOrigins = [envs.FRONTEND_URL];
  
  // Agregar URLs adicionales si están configuradas
  if (envs.ADDITIONAL_FRONTEND_URLS) {
    const additionalUrls = envs.ADDITIONAL_FRONTEND_URLS
      .split(',')
      .map(url => url.trim())
      .filter(url => url.length > 0);
    allowedOrigins.push(...additionalUrls);
  }

  // En desarrollo, permitir localhost en diferentes puertos
  if (envs.NODE_ENV === 'development') {
    allowedOrigins.push(
      'http://localhost:3000',
      'http://localhost:3001',
      'http://localhost:5173',
      'http://localhost:5174',
      'http://127.0.0.1:3000',
      'http://127.0.0.1:3001',
      'http://127.0.0.1:5173',
      'http://127.0.0.1:5174'
    );
  }

  app.enableCors({
    origin: allowedOrigins,
    allowedHeaders: [
      'Content-Type',
      'Authorization',
      'codrr_token',
      'X-Requested-With',
    ],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  });

  app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));
  app.useLogger(app.get(MyLogger));
  app.use(compression());
  app.use(
    helmet({
      crossOriginResourcePolicy: { policy: 'cross-origin' },
    }),
  );

  const swaggerConfig = new DocumentBuilder()
    .setTitle('CRM API Documentation :)')
    .setDescription('CRM a medida para Lince')
    .setVersion('1.0')
    .build();
  const document = SwaggerModule.createDocument(app, swaggerConfig);
  SwaggerModule.setup('docs', app, document);

  await app.listen(envs.PORT);
}
bootstrap();
