import { Module } from '@nestjs/common';
import { SatisfactionService } from './satisfaction.service';
import { SatisfactionController } from './satisfaction.controller';
import { DatabaseModule } from 'src/services/database/database.module';
import { SatisfactionProviders } from './satisfaction.providers';

@Module({
  imports: [DatabaseModule],
  controllers: [SatisfactionController],
  providers: [SatisfactionService, ...SatisfactionProviders],
})
export class SatisfactionModule {}
