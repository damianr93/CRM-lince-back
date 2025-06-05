import { CanActivate, ExecutionContext, Inject, Injectable, UnauthorizedException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { useToken } from 'src/utils/use.token';
import { IUseToken } from './interface/auth.interface';
import { Model } from 'mongoose';
import { User } from '../users/interface/users.interface';
import { envs } from 'src/config/envs';

@Injectable()
export class AuthGuard implements CanActivate {

  constructor(
    @Inject('USER_MODEL')
    private readonly userModel: Model<User>,
    private readonly reflector: Reflector
  ) { }

  async canActivate(
    context: ExecutionContext,
  ) {
    const isPublic = this.reflector.get<boolean>(
      'PUBLIC',
      context.getHandler()
    )

    if (isPublic) {
      return true
    }

    const req = context.switchToHttp().getRequest();


    let token = req.headers['codrr_token'];

    if (token == envs.EXTERNAL_FIXED_TOKEN) {
      return true;
    }

    // Si no hay token en el header, verificar en las cookies
    if (!token || Array.isArray(token)) {
      token = req.cookies?.Authentication;

      // Si tampoco hay cookie válida
      if (!token) {
        throw new UnauthorizedException('Token no proporcionado');
      }
    }

    const manageToken: IUseToken | string = useToken(token);

    if (typeof manageToken === 'string') {
      throw new UnauthorizedException(manageToken);
    }

    if (manageToken.isExpires) {
      throw new UnauthorizedException('Token expirado');
    }

    const { sub } = manageToken;

    const user = await this.userModel.findById(sub);

    if (!user) {
      throw new UnauthorizedException('Usuario inválido!');
    }

    req.user = {
      id: user.id,
      username: user.username,
      role: user.role
    };

    return true;
  }
}