import { Module } from '@nestjs/common';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { DatabaseModule } from 'src/services/database/database.module';
import { UserProviders } from './users.providers';

@Module({
  imports:[DatabaseModule],
  controllers: [UsersController],
  providers: [...UserProviders, UsersService],
  exports:   [...UserProviders],
})
export class UsersModule {}
