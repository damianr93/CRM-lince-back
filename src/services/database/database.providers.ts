import * as mongoose from 'mongoose';
import { ConfigService } from '@nestjs/config';
import { envs } from '../../config/envs';

export const databaseProviders = [
  {
    provide: 'DATABASE_CONNECTION',
    inject: [ConfigService],
    useFactory: async (): Promise<typeof mongoose> => {
      return await mongoose.connect(envs.MONGO_URI);
    },
  },
];
