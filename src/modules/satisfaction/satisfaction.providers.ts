import { Connection } from 'mongoose';
import { SatisfactionSchema } from './schema/satisfaction.schema';


export const SatisfactionProviders = [
  {
    provide: 'SATISFACTION_MODEL',
    useFactory: (connection: Connection) =>
      connection.model('Satisfaction', SatisfactionSchema),
    inject: ['DATABASE_CONNECTION'],
  },
];
