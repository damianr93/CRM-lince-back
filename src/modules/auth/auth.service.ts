import {
  Inject,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import { Model } from 'mongoose';
import { User } from '../users/interface/users.interface';

@Injectable()
export class AuthService {
  constructor(
    @Inject('USER_MODEL')
    private user: Model<User>,
    private jwtService: JwtService,
  ) { }

  async validateUser(username: string, pass: string) {
    if (!username || !pass) {
      throw new UnauthorizedException('Username and password is required');
    }
    
    const user = await this.user.findOne({username: username})
    
    if (!user) {
      throw new NotFoundException('User not found');
    }

    const matches = await bcrypt.compare(pass, user.password);
    if (!matches) {
      throw new UnauthorizedException('Invalid credentials');
    }

    return user;
  }

  async signToken(payload: { sub: number; username: string; role: string; }) {
    return this.jwtService.signAsync(payload, { expiresIn: '1h' });
  }
}