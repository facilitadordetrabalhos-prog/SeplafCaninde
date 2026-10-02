import {
  CanActivate,
  createParamDecorator,
  ExecutionContext,
  ForbiddenException,
  Injectable,
  SetMetadata,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Perfil, Usuario } from '../entities';

export const PERFIS_KEY = 'perfis';
/** Restringe a rota aos perfis informados (o gestor sempre pode, pois só é listado quando permitido). */
export const Perfis = (...perfis: Perfil[]) => SetMetadata(PERFIS_KEY, perfis);

export interface UsuarioToken {
  id: number;
  nome: string;
  email: string;
  perfil: Perfil;
}

export const UsuarioAtual = createParamDecorator((_: unknown, ctx: ExecutionContext): UsuarioToken => {
  return ctx.switchToHttp().getRequest().usuario;
});

@Injectable()
export class JwtAuthGuard implements CanActivate {
  constructor(
    private readonly jwt: JwtService,
    @InjectRepository(Usuario) private readonly usuarios: Repository<Usuario>,
  ) {}

  async canActivate(ctx: ExecutionContext): Promise<boolean> {
    const req = ctx.switchToHttp().getRequest();
    const header: string = req.headers['authorization'] ?? '';
    const [tipo, token] = header.split(' ');
    if (tipo !== 'Bearer' || !token) throw new UnauthorizedException('Faça login para continuar.');
    let payload: { sub: number };
    try {
      payload = await this.jwt.verifyAsync(token);
    } catch {
      throw new UnauthorizedException('Sessão expirada ou inválida. Faça login novamente.');
    }
    const u = await this.usuarios.findOne({ where: { id: payload.sub } });
    if (!u || !u.ativo) throw new UnauthorizedException('Usuário inativo ou inexistente.');
    req.usuario = { id: u.id, nome: u.nome, email: u.email, perfil: u.perfil } as UsuarioToken;
    return true;
  }
}

@Injectable()
export class PerfisGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(ctx: ExecutionContext): boolean {
    const perfis = this.reflector.getAllAndOverride<Perfil[] | undefined>(PERFIS_KEY, [
      ctx.getHandler(),
      ctx.getClass(),
    ]);
    if (!perfis || perfis.length === 0) return true;
    const usuario: UsuarioToken | undefined = ctx.switchToHttp().getRequest().usuario;
    if (!usuario) throw new UnauthorizedException('Faça login para continuar.');
    if (!perfis.includes(usuario.perfil)) {
      throw new ForbiddenException('Seu perfil não tem permissão para esta ação.');
    }
    return true;
  }
}
