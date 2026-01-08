import { Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { UsersModule } from 'src/modules/users/users.module';
import { JwtModule } from '@nestjs/jwt';
import { envs } from 'src/config/envs';
import { DatabaseModule } from 'src/services/database/database.module';
import { UserProviders } from '../users/users.providers';


@Module({
  imports: [
    UsersModule,
    JwtModule.register({
      global: true,
      secret: envs.JWT_SECTRET,
      signOptions: { expiresIn: '60s' },
    }),
    DatabaseModule,
  ],
  controllers: [AuthController],
  providers: [...UserProviders,AuthService],
})
export class AuthModule {}
