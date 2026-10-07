import {
  Body,
  Controller,
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
import { Type } from 'class-transformer';
import {
  IsBoolean,
  IsIn,
  IsNotEmpty,
  IsOptional,
  IsString,
  Matches,
  MaxLength,
  ValidateNested,
} from 'class-validator';
import { Repository } from 'typeorm';
import { JwtAuthGuard, Perfis, PerfisGuard } from '../common/auth';
import { agoraIso, bool, RE_DATA } from '../common/util';
import { NoticiaOficial, Prazo, STATUS_NOTICIA, StatusNoticia } from '../entities';
import { CgibsService } from './cgibs.service';

const SETE_DIAS = 7 * 24 * 60 * 60 * 1000;

/** `nova` = item com data no CGIBS nos últimos 7 dias (itens sem data, como guias e vídeos, nunca são "novos"). */
function comNova(n: NoticiaOficial) {
  const t = n.data ? new Date(n.data).getTime() : NaN;
  return { ...n, nova: !isNaN(t) && Date.now() - t <= SETE_DIAS };
}

/** Mais recentes primeiro; itens sem data (guias, cartilhas, vídeos) vão para o fim. Igual em qualquer banco. */
function ordenar(lista: NoticiaOficial[]): NoticiaOficial[] {
  return [...lista].sort((a, b) => {
    if (!!a.data !== !!b.data) return a.data ? -1 : 1;
    if (a.data && b.data && a.data !== b.data) return a.data < b.data ? 1 : -1;
    return b.id - a.id;
  });
}

@Controller('noticias')
export class NoticiasPublicasController {
  constructor(
    @InjectRepository(NoticiaOficial) private readonly repo: Repository<NoticiaOficial>,
    private readonly cgibs: CgibsService,
  ) {}

  @Get()
  async listar(
    @Query('tipo') tipo?: string,
    @Query('prazo') prazo?: string,
    @Query('local') local?: string,
    @Query('limite') limite?: string,
  ) {
    const qb = this.repo.createQueryBuilder('n').where('n.status = :s', { s: 'publicada' });
    const tipos = (tipo ?? '').split(',').map((t) => t.trim()).filter(Boolean);
    if (tipos.length) qb.andWhere('n.tipo IN (:...tipos)', { tipos });
    if (bool(prazo)) qb.andWhere('n.temPrazo = :tp', { tp: true });
    if (bool(local)) qb.andWhere("n.explicacaoLocal IS NOT NULL AND n.explicacaoLocal <> ''");
    const lim = parseInt(limite ?? '', 10);
    const lista = ordenar(await qb.getMany());
    return (lim > 0 ? lista.slice(0, Math.min(lim, 200)) : lista).map(comNova);
  }

  @Get('sincronizacao')
  async sincronizacao() {
    return { ultimaVerificacao: await this.cgibs.ultimaVerificacao() };
  }
}

class PrazoNoticiaDto {
  @IsString() @IsNotEmpty() @MaxLength(300) titulo: string;
  @IsOptional() @IsString() @MaxLength(300) quem?: string;
  @Matches(RE_DATA) ate: string;
  @IsOptional() @IsString() @MaxLength(500) fonte?: string;
}

class AtualizarNoticiaDto {
  @IsOptional() @IsIn(STATUS_NOTICIA as unknown as string[]) status?: StatusNoticia;
  @IsOptional() @IsString() @MaxLength(100) publico?: string | null;
  @IsOptional() @IsBoolean() temPrazo?: boolean;
  @IsOptional() @IsBoolean() prazoAlterado?: boolean;
  @IsOptional() @IsString() explicacaoLocal?: string | null;
  @IsOptional() @ValidateNested() @Type(() => PrazoNoticiaDto) prazo?: PrazoNoticiaDto;
}

@Controller('admin/noticias')
@UseGuards(JwtAuthGuard, PerfisGuard)
@Perfis('gestor', 'editor')
export class NoticiasAdminController {
  constructor(
    @InjectRepository(NoticiaOficial) private readonly repo: Repository<NoticiaOficial>,
    @InjectRepository(Prazo) private readonly prazos: Repository<Prazo>,
    private readonly cgibs: CgibsService,
  ) {}

  @Get()
  async listar(@Query('status') status?: string) {
    const lista = await this.repo.find({ where: status ? { status: status as StatusNoticia } : {} });
    return ordenar(lista).map(comNova);
  }

  @Patch(':id')
  async atualizar(@Param('id', ParseIntPipe) id: number, @Body() dto: AtualizarNoticiaDto) {
    const n = await this.repo.findOne({ where: { id } });
    if (!n) throw new NotFoundException('Notícia não encontrada.');
    const { prazo, ...campos } = dto;
    Object.assign(n, campos);
    if (n.status === 'publicada' && !n.publicadaEm) n.publicadaEm = agoraIso();
    if (prazo) n.temPrazo = true;
    await this.repo.save(n);
    if (prazo) {
      await this.prazos.save(
        this.prazos.create({
          titulo: prazo.titulo,
          quem: prazo.quem ?? '',
          ate: prazo.ate,
          fonte: prazo.fonte ?? `CGIBS: ${n.titulo}`.slice(0, 500),
          ativo: true,
          noticiaId: n.id,
        }),
      );
    }
    return comNova(n);
  }

  @Post('sincronizar')
  @HttpCode(200)
  async sincronizar() {
    const r = await this.cgibs.sincronizar();
    return r;
  }
}
