import {
  BadRequestException,
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
import { IsBoolean, IsIn, IsInt, IsNotEmpty, IsOptional, IsString, MaxLength } from 'class-validator';
import { Repository } from 'typeorm';
import { JwtAuthGuard, PerfisGuard, UsuarioAtual, UsuarioToken } from '../common/auth';
import { agoraIso, htmlParaTexto } from '../common/util';
import { Conteudo, Duvida, PUBLICOS, PublicoConteudo, STATUS_DUVIDA, StatusDuvida, Usuario } from '../entities';
import { MailService } from '../mail/mail.service';
import { slugUnico } from './conteudos.controller';

class AtualizarDuvidaDto {
  @IsOptional() @IsIn(STATUS_DUVIDA as unknown as string[]) status?: StatusDuvida;
  @IsOptional() @IsInt() responsavelId?: number | null;
  @IsOptional() @IsString() @MaxLength(50) tema?: string | null;
}

class ResponderDto {
  @IsString() @IsNotEmpty() resposta: string;
  @IsOptional() @IsString() @MaxLength(500) baseOficial?: string;
  @IsOptional() @IsBoolean() publicarNoFaq?: boolean;
  @IsOptional() @IsIn(PUBLICOS as unknown as string[]) publicoFaq?: PublicoConteudo;
}

@Controller('admin/duvidas')
@UseGuards(JwtAuthGuard, PerfisGuard)
export class DuvidasAdminController {
  constructor(
    @InjectRepository(Duvida) private readonly repo: Repository<Duvida>,
    @InjectRepository(Conteudo) private readonly conteudos: Repository<Conteudo>,
    @InjectRepository(Usuario) private readonly usuarios: Repository<Usuario>,
    private readonly mail: MailService,
  ) {}

  @Get()
  listar(@Query('status') status?: string, @Query('origem') origem?: string, @Query('eventoId') eventoId?: string) {
    const where: Record<string, unknown> = {};
    if (status) where.status = status;
    if (origem) where.origem = origem;
    if (eventoId && /^\d+$/.test(eventoId)) where.eventoId = Number(eventoId);
    return this.repo.find({ where, order: { criadoEm: 'DESC', id: 'DESC' } });
  }

  @Get(':id')
  async ver(@Param('id', ParseIntPipe) id: number) {
    const d = await this.repo.findOne({ where: { id } });
    if (!d) throw new NotFoundException('Dúvida não encontrada.');
    return d;
  }

  @Patch(':id')
  async atualizar(@Param('id', ParseIntPipe) id: number, @Body() dto: AtualizarDuvidaDto) {
    const d = await this.ver(id);
    if (dto.responsavelId) {
      const existe = await this.usuarios.count({ where: { id: dto.responsavelId, ativo: true } });
      if (!existe) throw new BadRequestException('Responsável não encontrado.');
    }
    Object.assign(d, dto);
    if (dto.responsavelId && d.status === 'nova' && !dto.status) d.status = 'em_resposta';
    return this.repo.save(d);
  }

  @Post(':id/responder')
  @HttpCode(200)
  async responder(@Param('id', ParseIntPipe) id: number, @Body() dto: ResponderDto, @UsuarioAtual() u: UsuarioToken) {
    const d = await this.ver(id);
    d.resposta = dto.resposta;
    d.baseOficial = dto.baseOficial ?? d.baseOficial ?? null;
    d.respondidoEm = agoraIso();
    d.responsavelId = d.responsavelId ?? u.id;
    d.status = 'respondida';
    if (dto.publicarNoFaq && d.autorizaPublicar) {
      d.status = 'publicada';
      const titulo = d.texto.length > 480 ? `${d.texto.slice(0, 477)}...` : d.texto;
      await this.conteudos.save(
        this.conteudos.create({
          tipo: 'faq',
          titulo,
          slug: await slugUnico(this.conteudos, `faq-${titulo}`),
          publico: dto.publicoFaq ?? 'todos',
          resumo: null,
          corpo: dto.resposta,
          baseOficial: d.baseOficial,
          destaque: false,
          status: 'aguardando',
          autorId: u.id,
        }),
      );
    }
    await this.repo.save(d);
    if (d.email) {
      await this.mail.enviar({
        to: d.email,
        subject: `Resposta à sua dúvida — protocolo ${d.protocolo}`,
        text:
          `Olá, ${d.nome}.\n\nSua pergunta:\n"${d.texto}"\n\nResposta da Secretaria de Finanças:\n${htmlParaTexto(dto.resposta)}\n\n` +
          (d.baseOficial ? `Base oficial: ${d.baseOficial}\n\n` : '') +
          `Protocolo: ${d.protocolo}\nSecretaria Municipal de Finanças de Canindé`,
      });
    }
    return d;
  }
}
