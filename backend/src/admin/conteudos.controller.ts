import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  NotFoundException,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { IsBoolean, IsIn, IsNotEmpty, IsOptional, IsString, MaxLength } from 'class-validator';
import { Not, Repository } from 'typeorm';
import { JwtAuthGuard, Perfis, PerfisGuard, UsuarioAtual, UsuarioToken } from '../common/auth';
import { agoraIso, slugify } from '../common/util';
import { Conteudo, PUBLICOS, PublicoConteudo, StatusConteudo, TIPOS_CONTEUDO, TipoConteudo } from '../entities';

/** Gera um slug único para a tabela de conteúdos. */
export async function slugUnico(repo: Repository<Conteudo>, base: string, ignorarId?: number): Promise<string> {
  const raiz = slugify(base, 100);
  let slug = raiz;
  for (let i = 2; ; i++) {
    const where = ignorarId ? { slug, id: Not(ignorarId) } : { slug };
    if (!(await repo.count({ where }))) return slug;
    slug = `${raiz}-${i}`;
  }
}

class CriarConteudoDto {
  @IsIn(TIPOS_CONTEUDO as unknown as string[]) tipo: TipoConteudo;
  @IsString() @IsNotEmpty() @MaxLength(500) titulo: string;
  @IsOptional() @IsIn(PUBLICOS as unknown as string[]) publico?: PublicoConteudo;
  @IsOptional() @IsString() resumo?: string;
  @IsOptional() @IsString() corpo?: string;
  @IsOptional() @IsString() @MaxLength(500) baseOficial?: string;
  @IsOptional() @IsString() @MaxLength(500) videoUrl?: string | null;
  @IsOptional() @IsString() @MaxLength(500) anexoUrl?: string | null;
  @IsOptional() @IsBoolean() destaque?: boolean;
  @IsOptional() @IsBoolean() enviarParaAprovacao?: boolean;
  @IsOptional() @IsBoolean() publicar?: boolean;
  @IsOptional() @IsString() @MaxLength(255) slug?: string;
}

class AtualizarConteudoDto {
  @IsOptional() @IsIn(TIPOS_CONTEUDO as unknown as string[]) tipo?: TipoConteudo;
  @IsOptional() @IsString() @IsNotEmpty() @MaxLength(500) titulo?: string;
  @IsOptional() @IsIn(PUBLICOS as unknown as string[]) publico?: PublicoConteudo;
  @IsOptional() @IsString() resumo?: string;
  @IsOptional() @IsString() corpo?: string;
  @IsOptional() @IsString() @MaxLength(500) baseOficial?: string;
  @IsOptional() @IsString() @MaxLength(500) videoUrl?: string | null;
  @IsOptional() @IsString() @MaxLength(500) anexoUrl?: string | null;
  @IsOptional() @IsBoolean() destaque?: boolean;
  @IsOptional() @IsBoolean() enviarParaAprovacao?: boolean;
  @IsOptional() @IsBoolean() publicar?: boolean;
  @IsOptional() @IsIn(['rascunho', 'aguardando']) status?: 'rascunho' | 'aguardando';
  @IsOptional() @IsString() @MaxLength(255) slug?: string;
}

@Controller('admin/conteudos')
@UseGuards(JwtAuthGuard, PerfisGuard)
@Perfis('gestor', 'editor')
export class ConteudosAdminController {
  constructor(@InjectRepository(Conteudo) private readonly repo: Repository<Conteudo>) {}

  @Get()
  listar(@Query('status') status?: string, @Query('tipo') tipo?: string) {
    const where: Record<string, unknown> = {};
    if (status) where.status = status;
    if (tipo) where.tipo = tipo;
    return this.repo.find({ where, order: { atualizadoEm: 'DESC', id: 'DESC' } });
  }

  @Get(':id')
  async ver(@Param('id', ParseIntPipe) id: number) {
    const c = await this.repo.findOne({ where: { id } });
    if (!c) throw new NotFoundException('Conteúdo não encontrado.');
    return c;
  }

  @Post()
  async criar(@Body() dto: CriarConteudoDto, @UsuarioAtual() u: UsuarioToken) {
    const { enviarParaAprovacao, publicar, slug, ...campos } = dto;
    let status: StatusConteudo = enviarParaAprovacao ? 'aguardando' : 'rascunho';
    if (publicar && u.perfil === 'gestor') status = 'publicado';
    return this.repo.save(
      this.repo.create({
        publico: 'todos',
        destaque: false,
        ...campos,
        slug: await slugUnico(this.repo, slug || dto.titulo),
        status,
        autorId: u.id,
        publicadoEm: status === 'publicado' ? agoraIso() : null,
      }),
    );
  }

  /**
   * Atualização parcial. Edição feita por editor em conteúdo já publicado volta para `aguardando`.
   * Gestor pode enviar `publicar:true` para publicar direto.
   */
  @Patch(':id')
  async atualizar(@Param('id', ParseIntPipe) id: number, @Body() dto: AtualizarConteudoDto, @UsuarioAtual() u: UsuarioToken) {
    const c = await this.ver(id);
    const { enviarParaAprovacao, publicar, slug, status, ...campos } = dto;
    Object.assign(c, campos);
    if (slug && slug !== c.slug) c.slug = await slugUnico(this.repo, slug, c.id);
    if (status) c.status = status;
    if (enviarParaAprovacao) c.status = 'aguardando';
    if (u.perfil !== 'gestor' && c.status === 'publicado') c.status = 'aguardando';
    if (publicar && u.perfil === 'gestor') {
      c.status = 'publicado';
      c.publicadoEm = c.publicadoEm ?? agoraIso();
    }
    return this.repo.save(c);
  }

  @Post(':id/aprovar')
  @Perfis('gestor')
  @HttpCode(200)
  async aprovar(@Param('id', ParseIntPipe) id: number) {
    const c = await this.ver(id);
    c.status = 'publicado';
    c.publicadoEm = c.publicadoEm ?? agoraIso();
    return this.repo.save(c);
  }

  @Delete(':id')
  @Perfis('gestor')
  async remover(@Param('id', ParseIntPipe) id: number) {
    await this.ver(id);
    await this.repo.delete({ id });
    return { ok: true };
  }
}
