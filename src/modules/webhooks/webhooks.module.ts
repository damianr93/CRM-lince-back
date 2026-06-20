import { Module } from '@nestjs/common';
import { SatisfactionModule } from '../satisfaction/satisfaction.module';
import { WebhooksController } from './webhooks.controller';
import { WebhooksService } from './webhooks.service';

@Module({
  imports: [SatisfactionModule],
  controllers: [WebhooksController],
  providers: [WebhooksService],
})
export class WebhooksModule {}
