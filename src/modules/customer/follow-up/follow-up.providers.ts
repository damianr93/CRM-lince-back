import { Connection } from 'mongoose';
import { FollowUpTaskSchema } from './follow-up-task.schema';
import { FollowUpEventSchema } from './follow-up-event.schema';

export const FollowUpTaskProviders = [
  {
    provide: 'FOLLOW_UP_TASK_MODEL',
    useFactory: (connection: Connection) =>
      connection.model('CustomerFollowUpTask', FollowUpTaskSchema),
    inject: ['DATABASE_CONNECTION'],
  },
];

export const FollowUpEventProviders = [
  {
    provide: 'FOLLOW_UP_EVENT_MODEL',
    useFactory: (connection: Connection) =>
      connection.model('CustomerFollowUpEvent', FollowUpEventSchema),
    inject: ['DATABASE_CONNECTION'],
  },
];

