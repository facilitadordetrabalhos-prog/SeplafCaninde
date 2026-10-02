import {
  BadRequestException,
  Body,
  ConflictException,
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
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { InjectRepository } from '@nestjs/typeorm';
import { IsBoolean, IsEmail, IsIn, IsInt, IsNotEmpty, IsOptional, IsString, Matches, MaxLength, Min } from 'class-validator';
import { MoreThanOrEqual, Repository } from 'typeorm';
import { JwtAuthGuard, PerfisGuard } from '../common/auth';
import { ConfigStore } from '../common/config-store.service';
import { hoje, normalizar, RE_DATA, somenteDigitos } from '../common/util';
import {
  Agendamento,
  InscricaoOficina,
  Oficina,
  PERFIS_PRESTADOR,
  PerfilPrestador,
  Prestador,
  SITUACOES_PRESTADOR,
  SituacaoPrestador,
  STATUS_AGENDAMENTO,
  StatusAgendamento,
} from '../entities';
import { lerCsv } from '../eventos/eventos.service';
import { UPLOAD_CSV } from '../eventos/eventos.controller';

class InscricaoDto {
  @IsString() @IsNotEmpty() @MaxLength(200) nome: string;
  @IsEmail() @MaxLength(255) email: string;
  @IsOptional() @IsString() @MaxLength(40) telefone?: string;
}

class AgendamentoDto {
  @IsString() @Matches(/^[\d.\-\/\s]{11,20}$/) cpfCnpj: string;
  @IsString() @IsNotEmpty() @MaxLength(200) nome: string;
  @IsOptional() @IsEmail() @MaxLength(255) email?: string;
  @IsOptional() @IsString() @MaxLength(40) telefone?: string;
  @IsString() @IsNotEmpty() @MaxLength(2000) motivo: string;
  @Matches(RE_DATA) dataPreferida: string;
  @IsIn(['manha', 'tarde']) turno: 'manha' | 'tarde';
}

async function contarInscritos(repo: Repository<InscricaoOficina>, oficinaId: number) {
  return repo.count({ where: { oficinaId } });
}

@Controller('nfse')
export class NfsePublicoController {
  constructor(
    @InjectRepository(Oficina) private readonly oficinas: Repository<Oficina>,
    @InjectRepository(InscricaoOficina) private readonly inscricoes: Repository<InscricaoOficina>,
    @InjectRepository(Agendamento) private readonly agendamentos: Repository<Agendamento>,
    private readonly store: ConfigStore,
  ) {}

  @Get('oficinas')
  async listarOficinas() {
    const lista = await this.oficinas.find({
      where: { ativo: true, data: MoreThanOrEqual(hoje()) },
      order: { data: 'ASC', hora: 'ASC' },
    });
    return Promise.all(
      lista.map(async (o) => ({
        id: o.id,
        titulo: o.titulo,
        data: o.data,
        hora: o.hora,
        local: o.local,
        publico: o.publico,
        vagas: o.vagas,
        inscritos: await contarInscritos(this.inscricoes, o.id),
      })),
    );
  }

  @Post('oficinas/:id/inscricoes')
  async inscrever(@Param('id', ParseIntPipe) id: number, @Body() dto: InscricaoDto) {
    const o = await this.oficinas.findOne({ where: { id, ativo: true } });
    if (!o || o.data < hoje()) throw new NotFoundException('Oficina não encontrada ou encerrada.');
    const email = dto.email.trim().toLowerCase();
    if (await this.inscricoes.count({ where: { oficinaId: id, email } })) {
      throw new ConflictException('Este e-mail já está inscrito nesta oficina.');
    }
    if (o.vagas > 0 && (await contarInscritos(this.inscricoes, id)) >= o.vagas) {
      throw new ConflictException('Oficina lotada.');
    }
    await this.inscricoes.save(
      this.inscricoes.create({ oficinaId: id, nome: dto.nome.trim(), email, telefone: dto.telefone?.trim() || null }),
    );
    return { ok: true };
  }

  @Post('agendamentos')
  async agendar(@Body() dto: AgendamentoDto) {
    if (dto.dataPreferida < hoje()) throw new BadRequestException('Escolha uma data a partir de hoje.');
    const doc = somenteDigitos(dto.cpfCnpj);
    if (doc.length !== 11 && doc.length !== 14) throw new BadRequestException('Informe um CPF ou CNPJ válido.');
    if (!dto.email && !dto.telefone) throw new BadRequestException('Informe um e-mail ou telefone para contato.');
    const a = await this.agendamentos.save(
      this.agendamentos.create({
        cpfCnpj: doc,
        nome: dto.nome.trim(),
        email: dto.email?.trim().toLowerCase() || null,
        telefone: dto.telefone?.trim() || null,
        motivo: dto.motivo.trim(),
        dataPreferida: dto.dataPreferida,
        turno: dto.turno,
        status: 'agendado',
      }),
    );
    const c = (await this.store.get<any>('contatos')) ?? {};
    const [a1, m, d] = dto.dataPreferida.split('-');
    const mensagem =
      `Atendimento agendado para ${d}/${m}/${a1}, turno da ${dto.turno === 'manha' ? 'manhã' : 'tarde'}. ` +
      `Compareça à ${c.orgao ?? 'Diretoria de Arrecadação'}: ${c.endereco ?? ''}. ` +
      `Horário de atendimento: ${c.horario ?? ''}. Leve documento com foto e o CPF/CNPJ.`;
    return { id: a.id, mensagem };
  }
}

class AtualizarAgendamentoDto {
  @IsOptional() @IsIn(STATUS_AGENDAMENTO as unknown as string[]) status?: StatusAgendamento;
  @IsOptional() @IsString() @MaxLength(2000) observacao?: string | null;
}

class OficinaDto {
  @IsString() @IsNotEmpty() @MaxLength(300) titulo: string;
  @Matches(RE_DATA) data: string;
  @IsOptional() @IsString() @MaxLength(10) hora?: string;
  @IsOptional() @IsString() @MaxLength(300) local?: string;
  @IsOptional() @IsString() @MaxLength(200) publico?: string;
  @IsOptional() @IsInt() @Min(0) vagas?: number;
  @IsOptional() @IsBoolean() ativo?: boolean;
}

class AtualizarOficinaDto {
  @IsOptional() @IsString() @IsNotEmpty() @MaxLength(300) titulo?: string;
  @IsOptional() @Matches(RE_DATA) data?: string;
  @IsOptional() @IsString() @MaxLength(10) hora?: string;
  @IsOptional() @IsString() @MaxLength(300) local?: string;
  @IsOptional() @IsString() @MaxLength(200) publico?: string;
  @IsOptional() @IsInt() @Min(0) vagas?: number;
  @IsOptional() @IsBoolean() ativo?: boolean;
}

function perfilPrestador(v: string | undefined): PerfilPrestador {
  const s = normalizar(v);
  if (!s) return 'Outro';
  if (s.includes('mei') || s.includes('microempreendedor')) return 'MEI';
  if (s.includes('simples')) return 'Simples';
  if (s.includes('presumido')) return 'Presumido';
  if (s.includes('real')) return 'Real';
  return (PERFIS_PRESTADOR.find((p) => normalizar(p) === s) as PerfilPrestador) ?? 'Outro';
}

function situacaoPrestador(v: string | undefined): SituacaoPrestador {
  const s = normalizar(v).replace(/[\s-]+/g, '_');
  if ((SITUACOES_PRESTADOR as readonly string[]).includes(s)) return s as SituacaoPrestador;
  if (s.startsWith('bloq')) return 'bloqueado';
  if (s.startsWith('emit')) return 'emitindo';
  if (s.startsWith('acess')) return 'acessou';
  return 'sem_acesso';
}

@Controller('admin/nfse')
@UseGuards(JwtAuthGuard, PerfisGuard)
export class NfseAdminController {
  constructor(
    @InjectRepository(Oficina) private readonly oficinas: Repository<Oficina>,
    @InjectRepository(InscricaoOficina) private readonly inscricoes: Repository<InscricaoOficina>,
    @InjectRepository(Agendamento) private readonly agendamentos: Repository<Agendamento>,
    @InjectRepository(Prestador) private readonly prestadores: Repository<Prestador>,
  ) {}

  // ---- agendamentos
  @Get('agendamentos')
  listarAgendamentos(@Query('data') data?: string, @Query('status') status?: string) {
    const where: Record<string, unknown> = {};
    if (data) where.dataPreferida = data;
    if (status) where.status = status;
    return this.agendamentos.find({ where, order: { dataPreferida: 'ASC', turno: 'ASC', id: 'ASC' } });
  }

  @Get('agendamentos/:id')
  async agendamento(@Param('id', ParseIntPipe) id: number) {
    const a = await this.agendamentos.findOne({ where: { id } });
    if (!a) throw new NotFoundException('Agendamento não encontrado.');
    return a;
  }

  @Patch('agendamentos/:id')
  async atualizarAgendamento(@Param('id', ParseIntPipe) id: number, @Body() dto: AtualizarAgendamentoDto) {
    const a = await this.agendamento(id);
    Object.assign(a, dto);
    return this.agendamentos.save(a);
  }

  // ---- oficinas
  @Get('oficinas')
  async listarOficinas() {
    const lista = await this.oficinas.find({ order: { data: 'DESC', hora: 'ASC' } });
    return Promise.all(lista.map((o) => this.comInscricoes(o)));
  }

  private async comInscricoes(o: Oficina) {
    const inscricoes = await this.inscricoes.find({ where: { oficinaId: o.id }, order: { id: 'ASC' } });
    return { ...o, inscritos: inscricoes.length, inscricoes };
  }

  private async oficina(id: number) {
    const o = await this.oficinas.findOne({ where: { id } });
    if (!o) throw new NotFoundException('Oficina não encontrada.');
    return o;
  }

  @Get('oficinas/:id')
  async verOficina(@Param('id', ParseIntPipe) id: number) {
    return this.comInscricoes(await this.oficina(id));
  }

  @Post('oficinas')
  criarOficina(@Body() dto: OficinaDto) {
    return this.oficinas.save(this.oficinas.create({ hora: '', local: '', publico: '', vagas: 0, ativo: true, ...dto }));
  }

  @Patch('oficinas/:id')
  async atualizarOficina(@Param('id', ParseIntPipe) id: number, @Body() dto: AtualizarOficinaDto) {
    const o = await this.oficina(id);
    Object.assign(o, dto);
    return this.oficinas.save(o);
  }

  @Delete('oficinas/:id')
  async removerOficina(@Param('id', ParseIntPipe) id: number) {
    await this.oficina(id);
    await this.inscricoes.delete({ oficinaId: id });
    await this.oficinas.delete({ id });
    return { ok: true };
  }

  // ---- prestadores
  @Get('prestadores')
  async listarPrestadores(@Query('situacao') situacao?: string) {
    const todos = await this.prestadores.find({ order: { nome: 'ASC' } });
    const prestadores = situacao ? todos.filter((p) => p.situacao === situacao) : todos;
    const conta = (s: SituacaoPrestador[]) => todos.filter((p) => s.includes(p.situacao)).length;
    return {
      prestadores,
      funil: {
        total: todos.length,
        acessou: conta(['acessou', 'emitindo']),
        emitindo: conta(['emitindo']),
        bloqueados: conta(['bloqueado']),
      },
    };
  }

  @Post('prestadores/importar')
  @HttpCode(200)
  @UseInterceptors(FileInterceptor('arquivo', UPLOAD_CSV))
  async importarPrestadores(@UploadedFile() arquivo?: Express.Multer.File) {
    if (!arquivo?.buffer?.length) throw new BadRequestException('Envie o arquivo CSV no campo "arquivo".');
    const linhas = lerCsv(arquivo.buffer);
    let importados = 0;
    let atualizados = 0;
    for (const l of linhas) {
      const cpfCnpj = somenteDigitos(l.cpf_cnpj);
      const nome = (l.nome ?? '').trim();
      if (!cpfCnpj || !nome) continue;
      const dados = {
        nome: nome.slice(0, 200),
        perfil: perfilPrestador(l.perfil),
        situacao: situacaoPrestador(l.situacao),
        contador: (l.contador ?? '').trim().slice(0, 200) || null,
        email: (l.email ?? '').trim().toLowerCase().slice(0, 255) || null,
      };
      const existente = await this.prestadores.findOne({ where: { cpfCnpj } });
      if (existente) {
        Object.assign(existente, dados);
        await this.prestadores.save(existente);
        atualizados++;
      } else {
        await this.prestadores.save(this.prestadores.create({ cpfCnpj, ...dados }));
        importados++;
      }
    }
    return { importados, atualizados };
  }
}
