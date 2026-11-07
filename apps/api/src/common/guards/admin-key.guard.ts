import { timingSafeEqual } from 'node:crypto';
import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import type { Request } from 'express';

const iguales = (a: string, b: string): boolean => {
  const x = Buffer.from(a);
  const y = Buffer.from(b);
  return x.length === y.length && timingSafeEqual(x, y);
};

// Protege las tareas que gastan cuota de IA: exige el header x-admin-key
@Injectable()
export class AdminKeyGuard implements CanActivate {
  constructor(private readonly config: ConfigService) {}

  canActivate(ctx: ExecutionContext): boolean {
    const esperada = this.config.get<string>('ADMIN_KEY');
    if (!esperada) {
      throw new ForbiddenException('Las tareas de administración están desactivadas');
    }
    const enviada = ctx.switchToHttp().getRequest<Request>().headers['x-admin-key'];
    const valor = Array.isArray(enviada) ? enviada[0] : enviada;
    if (!valor || !iguales(valor, esperada)) {
      throw new UnauthorizedException('Clave de administración inválida');
    }
    return true;
  }
}