import { Module } from '@nestjs/common';
import { DatabaseModule } from 'src/services/database/database.module';
import { ClientsController } from './customer.controller';
import { ClientProviders } from './customer.providers';
import { ClientsService } from './customer.service';

@Module({
  imports: [DatabaseModule],
  controllers: [ClientsController],
  providers: [...ClientProviders, ClientsService],
  exports: [...ClientProviders]
})
export class ClientsModule {}