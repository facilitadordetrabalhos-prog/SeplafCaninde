import {
  BadRequestException,
  Body,
  ConflictException,
  Controller,
  Delete,
  Get,
  NotFoundException,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Put,
  UseGuards,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import * as bcrypt from 'bcryptjs';
import { IsBoolean, IsEmail, IsIn, IsInt, IsNotEmpty, IsOptional, IsString, Matches, MaxLength, MinLength } from 'class-validator';
import { IsNull, Not, Repository } from 'typeorm';
import { JwtAuthGuard, Perfis, PerfisGuard, UsuarioAtual, UsuarioToken } from '../common/auth';
import { ConfigStore } from '../common/config-store.service';
import { hoje, RE_DATA } from '../common/util';
import {
  Agendamento,
  Conteudo,
  Duvida,
  Modulo,
  NoticiaOficial,
  Perfil,
  PERFIS,
  Prazo,
  ServicoOnline,
  Usuario,
} from '../entities';

// ------------------------------------------------------------------ resumo
@Controller('admin')
@UseGuards(JwtAuthGuard, PerfisGuard)
export class ResumoController {
  constructor(
    @InjectRepository(Duvida) private readonly duvidas: Repository<Duvida>,
    @InjectRepository(NoticiaOficial) private readonly noticias: Repository<NoticiaOficial>,
    @InjectRepository(Conteudo) private readonly conteudos: Repository<Conteudo>,
    @InjectRepository(Agendamento) private readonly agendamentos: Repository<Agendamento>,
  ) {}

  @Get('resumo')
  async resumo() {
    const [duvidasNovas, duvidasEmResposta, noticiasNovas, conteudosAguardando, agendamentosHoje, perguntasEventoPendentes] =
      await Promise.all([
        this.duvidas.count({ where: { status: 'nova', origem: Not('evento') } }),
        this.duvidas.count({ where: { status: 'em_resposta' } }),
        this.noticias.count({ where: { status: 'nova' } }),
        this.conteudos.count({ where: { status: 'aguardando' } }),
        this.agendamentos.count({ where: { dataPreferida: hoje(), status: 'agendado' } }),
        this.duvidas.count({ where: { origem: 'evento', tema: IsNull() } }),
      ]);
    return { duvidasNovas, duvidasEmResposta, noticiasNovas, conteudosAguardando, agendamentosHoje, perguntasEventoPendentes };
  }
}

// ------------------------------------------------------------------ prazos
class PrazoDto {
  @IsString() @IsNotEmpty() @MaxLength(300) titulo: string;
  @IsOptional() @IsString() @MaxLength(300) quem?: string;
  @Matches(RE_DATA) ate: string;
  @IsOptional() @IsString() @MaxLength(500) fonte?: string;
  @IsOptional() @IsBoolean() ativo?: boolean;
  @IsOptional() @IsInt() noticiaId?: number | null;
}

class AtualizarPrazoDto {
  @IsOptional() @IsString() @IsNotEmpty() @MaxLength(300) titulo?: string;
  @IsOptional() @IsString() @MaxLength(300) quem?: string;
  @IsOptional() @Matches(RE_DATA) ate?: string;
  @IsOptional() @IsString() @MaxLength(500) fonte?: string;
  @IsOptional() @IsBoolean() ativo?: boolean;
  @IsOptional() @IsInt() noticiaId?: number | null;
}

@Controller('admin/prazos')
@UseGuards(JwtAuthGuard, PerfisGuard)
@Perfis('gestor', 'editor')
export class PrazosAdminController {
  constructor(@InjectRepository(Prazo) private readonly repo: Repository<Prazo>) {}

  @Get()
  listar() {
    return this.repo.find({ order: { ate: 'ASC', id: 'ASC' } });
  }

  @Post()
  criar(@Body() dto: PrazoDto) {
    return this.repo.save(this.repo.create({ quem: '', fonte: '', ativo: true, noticiaId: null, ...dto }));
  }

  private async achar(id: number) {
    const p = await this.repo.findOne({ where: { id } });
    if (!p) throw new NotFoundException('Prazo não encontrado.');
    return p;
  }

  @Patch(':id')
  async atualizar(@Param('id', ParseIntPipe) id: number, @Body() dto: AtualizarPrazoDto) {
    const p = await this.achar(id);
    Object.assign(p, dto);
    return this.repo.save(p);
  }

  @Delete(':id')
  async remover(@Param('id', ParseIntPipe) id: number) {
    await this.achar(id);
    await this.repo.delete({ id });
    return { ok: true };
  }
}

// ------------------------------------------------------------------ usuários
class CriarUsuarioDto {
  @IsString() @IsNotEmpty() @MaxLength(150) nome: string;
  @IsEmail() @MaxLength(255) email: string;
  @IsIn(PERFIS) perfil: Perfil;
  @IsString() @MinLength(8) @MaxLength(100) senha: string;
  @IsOptional() @IsBoolean() ativo?: boolean;
}

class AtualizarUsuarioDto {
  @IsOptional() @IsString() @IsNotEmpty() @MaxLength(150) nome?: string;
  @IsOptional() @IsEmail() @MaxLength(255) email?: string;
  @IsOptional() @IsIn(PERFIS) perfil?: Perfil;
  @IsOptional() @IsString() @MinLength(8) @MaxLength(100) senha?: string;
  @IsOptional() @IsBoolean() ativo?: boolean;
}

function semSenha(u: Usuario) {
  return { id: u.id, nome: u.nome, email: u.email, perfil: u.perfil, ativo: u.ativo, criadoEm: u.criadoEm };
}

@Controller('admin/usuarios')
@UseGuards(JwtAuthGuard, PerfisGuard)
export class UsuariosAdminController {
  constructor(@InjectRepository(Usuario) private readonly repo: Repository<Usuario>) {}

  /** Lista resumida `{id, nome, perfil}` dos ativos; para gestor inclui também e-mail, ativo e inativos. */
  @Get()
  async listar(@UsuarioAtual() eu: UsuarioToken) {
    if (eu.perfil === 'gestor') {
      return (await this.repo.find({ order: { nome: 'ASC' } })).map(semSenha);
    }
    const lista = await this.repo.find({ where: { ativo: true }, order: { nome: 'ASC' } });
    return lista.map((u) => ({ id: u.id, nome: u.nome, perfil: u.perfil }));
  }

  @Post()
  @Perfis('gestor')
  async criar(@Body() dto: CriarUsuarioDto) {
    const email = dto.email.trim().toLowerCase();
    if (await this.repo.count({ where: { email } })) throw new ConflictException('Já existe um usuário com este e-mail.');
    const u = await this.repo.save(
      this.repo.create({
        nome: dto.nome.trim(),
        email,
        perfil: dto.perfil,
        ativo: dto.ativo ?? true,
        senhaHash: await bcrypt.hash(dto.senha, 10),
      }),
    );
    return semSenha(u);
  }

  @Patch(':id')
  @Perfis('gestor')
  async atualizar(@Param('id', ParseIntPipe) id: number, @Body() dto: AtualizarUsuarioDto, @UsuarioAtual() eu: UsuarioToken) {
    const u = await this.repo.findOne({ where: { id } });
    if (!u) throw new NotFoundException('Usuário não encontrado.');
    if (u.id === eu.id && (dto.ativo === false || (dto.perfil && dto.perfil !== 'gestor'))) {
      throw new BadRequestException('Você não pode desativar nem rebaixar o seu próprio usuário.');
    }
    if (dto.email) {
      const email = dto.email.trim().toLowerCase();
      if (await this.repo.count({ where: { email, id: Not(id) } })) throw new ConflictException('Já existe um usuário com este e-mail.');
      u.email = email;
    }
    if (dto.nome) u.nome = dto.nome.trim();
    if (dto.perfil) u.perfil = dto.perfil;
    if (dto.ativo !== undefined) u.ativo = dto.ativo;
    const campos: Partial<Usuario> = { nome: u.nome, email: u.email, perfil: u.perfil, ativo: u.ativo };
    if (dto.senha) campos.senhaHash = await bcrypt.hash(dto.senha, 10);
    await this.repo.update({ id }, campos);
    return semSenha(u);
  }
}

// ------------------------------------------------------------------ serviços online
class ServicoDto {
  @IsString() @IsNotEmpty() @MaxLength(200) titulo: string;
  @IsString() descricao: string;
  @IsString() @IsNotEmpty() @MaxLength(500) url: string;
  @IsOptional() @IsString() @MaxLength(20) icone?: string;
  @IsOptional() @IsString() aviso?: string | null;
  @IsOptional() @IsIn(['mudanca', 'boa', null]) avisoTipo?: 'mudanca' | 'boa' | null;
  @IsOptional() @IsBoolean() destaque?: boolean;
  @IsOptional() @IsInt() ordem?: number;
  @IsOptional() @IsBoolean() ativo?: boolean;
}

class AtualizarServicoDto {
  @IsOptional() @IsString() @IsNotEmpty() @MaxLength(200) titulo?: string;
  @IsOptional() @IsString() descricao?: string;
  @IsOptional() @IsString() @IsNotEmpty() @MaxLength(500) url?: string;
  @IsOptional() @IsString() @MaxLength(20) icone?: string;
  @IsOptional() @IsString() aviso?: string | null;
  @IsOptional() @IsIn(['mudanca', 'boa', null]) avisoTipo?: 'mudanca' | 'boa' | null;
  @IsOptional() @IsBoolean() destaque?: boolean;
  @IsOptional() @IsInt() ordem?: number;
  @IsOptional() @IsBoolean() ativo?: boolean;
}

@Controller('admin/servicos')
@UseGuards(JwtAuthGuard, PerfisGuard)
@Perfis('gestor')
export class ServicosAdminController {
  constructor(@InjectRepository(ServicoOnline) private readonly repo: Repository<ServicoOnline>) {}

  @Get()
  listar() {
    return this.repo.find({ order: { ordem: 'ASC', id: 'ASC' } });
  }

  private async achar(id: number) {
    const s = await this.repo.findOne({ where: { id } });
    if (!s) throw new NotFoundException('Serviço não encontrado.');
    return s;
  }

  @Get(':id')
  ver(@Param('id', ParseIntPipe) id: number) {
    return this.achar(id);
  }

  @Post()
  criar(@Body() dto: ServicoDto) {
    return this.repo.save(this.repo.create({ icone: '', aviso: null, avisoTipo: null, destaque: false, ordem: 0, ativo: true, ...dto }));
  }

  @Patch(':id')
  async atualizar(@Param('id', ParseIntPipe) id: number, @Body() dto: AtualizarServicoDto) {
    const s = await this.achar(id);
    Object.assign(s, dto);
    return this.repo.save(s);
  }

  @Delete(':id')
  async remover(@Param('id', ParseIntPipe) id: number) {
    await this.achar(id);
    await this.repo.delete({ id });
    return { ok: true };
  }
}

// ------------------------------------------------------------------ config e módulos
class AtualizarModuloDto {
  @IsOptional() @IsBoolean() ativo?: boolean;
  @IsOptional() @IsBoolean() publico?: boolean;
  @IsOptional() @IsString() @IsNotEmpty() @MaxLength(150) nome?: string;
  @IsOptional() @IsString() @MaxLength(500) descricao?: string;
}

@Controller('admin')
@UseGuards(JwtAuthGuard, PerfisGuard)
@Perfis('gestor')
export class ConfigAdminController {
  constructor(
    private readonly store: ConfigStore,
    @InjectRepository(Modulo) private readonly modulos: Repository<Modulo>,
  ) {}

  @Get('config/:chave')
  async ver(@Param('chave') chave: string) {
    if (!(await this.store.existe(chave))) throw new NotFoundException('Configuração não encontrada.');
    return this.store.get(chave);
  }

  /** O corpo é o próprio valor JSON da chave (substitui o valor atual). */
  @Put('config/:chave')
  async salvar(@Param('chave') chave: string, @Body() valor: unknown) {
    if (!/^[a-z0-9_-]{1,100}$/i.test(chave)) throw new BadRequestException('Chave inválida.');
    if (valor === undefined) throw new BadRequestException('Envie o valor em JSON.');
    return this.store.set(chave, valor);
  }

  @Get('modulos')
  listarModulos() {
    return this.modulos.find({ order: { chave: 'ASC' } });
  }

  @Patch('modulos/:chave')
  async atualizarModulo(@Param('chave') chave: string, @Body() dto: AtualizarModuloDto) {
    const m = await this.modulos.findOne({ where: { chave } });
    if (!m) throw new NotFoundException('Módulo não encontrado.');
    Object.assign(m, dto);
    return this.modulos.save(m);
  }
}
