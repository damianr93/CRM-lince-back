import { Connection } from 'mongoose';
import { ClientSchema } from './schema/customer.schema';

export const ClientProviders = [
  {
    provide: 'CLIENT_MODEL',
    useFactory: (connection: Connection) =>
      connection.model('Client', ClientSchema),
    inject: ['DATABASE_CONNECTION'],
  },
];
