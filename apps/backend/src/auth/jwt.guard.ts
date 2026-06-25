import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Request } from 'express';

@Injectable()
export class JwtGuard implements CanActivate {
  constructor(private jwtService: JwtService) {}

  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest<Request>();
    const token = request.cookies?.token;

    if (!token) throw new UnauthorizedException('Token não encontrado');

    try {
      const payload = this.jwtService.verify(token, {
        secret: process.env.JWT_SECRET || 'secret',
      });
      request['user'] = payload;
      return true;
    } catch {
      throw new UnauthorizedException('Token inválido');
    }
  }
}
