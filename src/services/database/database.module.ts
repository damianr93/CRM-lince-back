import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { databaseProviders } from './database.providers';

@Module({
  imports: [ConfigModule],
  providers: [
    ...databaseProviders,
    {
      provide: ConfigService,
      useClass: ConfigService,
    },
  ],
  exports: [...databaseProviders, ConfigService],
})
export class DatabaseModule {
  static forFeature(arg0: { name: any; schema: any; }[]): import("@nestjs/common").Type<any> | import("@nestjs/common").DynamicModule | Promise<import("@nestjs/common").DynamicModule> | import("@nestjs/common").ForwardReference<any> {
    throw new Error('Method not implemented.');
  }
}