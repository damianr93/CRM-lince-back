import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { MyLogger } from './services/logger/logger';
import { ConfigModule } from '@nestjs/config';
import { ScheduleModule } from '@nestjs/schedule';
import { ThrottlerModule } from '@nestjs/throttler';
import { UsersModule } from './modules/users/users.module';
import { AuthModule } from './modules/auth/auth.module';
import { APP_GUARD, APP_FILTER, APP_INTERCEPTOR } from '@nestjs/core';
import { AuthGuard } from './modules/auth/auth.guard';
import { ClientsModule } from './modules/customer/customer.module';
import { AnalyticsModule } from './modules/analytics/analytics.module';
import { SatisfactionModule } from './modules/satisfaction/satisfaction.module';
import { GeoModule } from './modules/geo/geo.module';
import { WebhooksModule } from './modules/webhooks/webhooks.module';
import { HttpExceptionFilter } from './common/filters/http-exception.filter';
import { LoggingInterceptor } from './common/interceptors/logging.interceptor';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    ScheduleModule.forRoot(),
    ThrottlerModule.forRoot([{ ttl: 60000, limit: 100 }]),
    UsersModule,
    AuthModule,
    ClientsModule,
    AnalyticsModule,
    SatisfactionModule,
    GeoModule,
    WebhooksModule
  ],
  controllers: [AppController],
  providers: [
    MyLogger,
    {
      provide: APP_GUARD,
      useClass: AuthGuard,
    },
    {
      provide: APP_FILTER,
      useClass: HttpExceptionFilter,
    },
    {
      provide: APP_INTERCEPTOR,
      useClass: LoggingInterceptor,
    },
  ],
})
export class AppModule { }
