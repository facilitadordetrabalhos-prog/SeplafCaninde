import { Body, Controller, Get, HttpCode, Post, UnauthorizedException, UseGuards } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import * as bcrypt from 'bcryptjs';
import { IsEmail, IsNotEmpty, IsString } from 'class-validator';
import { Repository } from 'typeorm';
import { JwtAuthGuard, UsuarioAtual, UsuarioToken } from '../common/auth';
import { Usuario } from '../entities';

class LoginDto {
  @IsEmail() email: string;
  @IsString() @IsNotEmpty() senha: string;
}

@Controller('auth')
export class AuthController {
  constructor(
    @InjectRepository(Usuario) private readonly usuarios: Repository<Usuario>,
    private readonly jwt: JwtService,
  ) {}

  @Post('login')
  @HttpCode(200)
  async login(@Body() dto: LoginDto) {
    const u = await this.usuarios
      .createQueryBuilder('u')
      .addSelect('u.senhaHash')
      .where('LOWER(u.email) = :email', { email: dto.email.trim().toLowerCase() })
      .getOne();
    if (!u || !u.ativo || !(await bcrypt.compare(dto.senha, u.senhaHash))) {
      throw new UnauthorizedException('E-mail ou senha inválidos.');
    }
    const token = await this.jwt.signAsync({ sub: u.id, perfil: u.perfil });
    return { token, usuario: { id: u.id, nome: u.nome, email: u.email, perfil: u.perfil } };
  }

  @Get('eu')
  @UseGuards(JwtAuthGuard)
  eu(@UsuarioAtual() u: UsuarioToken) {
    return { id: u.id, nome: u.nome, email: u.email, perfil: u.perfil };
  }
}
