import { Module } from '@nestjs/common';
import { DatabaseModule } from 'src/services/database/database.module';
import { ClientsController } from './customer.controller';
import { ClientProviders } from './customer.providers';
import { ClientsService } from './customer.service';
import { FollowUpTaskProviders, FollowUpEventProviders } from './follow-up/follow-up.providers';
import { FollowUpEventsController } from './follow-up/follow-up-events.controller';
import { CustomerFollowUpService } from './follow-up/customer-follow-up.service';
import { MessagingProviders } from './follow-up/messaging/messaging.providers';
import { MessagingGateway } from './follow-up/messaging/messaging.gateway';
import { FollowUpEventsService } from './follow-up/follow-up-events.service';

@Module({
  imports: [DatabaseModule],
  controllers: [
    ClientsController, 
    FollowUpEventsController,
  ],
  providers: [
    ...ClientProviders,
    ...FollowUpTaskProviders,
    ...FollowUpEventProviders,
    ...MessagingProviders,
    MessagingGateway,
    ClientsService,
    CustomerFollowUpService,
    FollowUpEventsService,
  ],
  exports: [
    ...ClientProviders, 
    CustomerFollowUpService,
    FollowUpEventsService,
  ],
})
export class ClientsModule {}
