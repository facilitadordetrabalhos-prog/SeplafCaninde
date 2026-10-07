import { Body, Controller, Get, NotFoundException, Param, Post, Query } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Transform } from 'class-transformer';
import { IsBoolean, IsEmail, IsIn, IsNotEmpty, IsOptional, IsString, MaxLength } from 'class-validator';
import { MoreThanOrEqual, Repository } from 'typeorm';
import { ConfigStore } from '../common/config-store.service';
import { ProtocoloService } from '../common/protocolo.service';
import { bool, hoje, normalizar } from '../common/util';
import { Conteudo, Duvida, Modulo, Prazo, ServicoOnline } from '../entities';
import { MailService } from '../mail/mail.service';

@Controller()
export class PublicoController {
  constructor(
    private readonly store: ConfigStore,
    @InjectRepository(Modulo) private readonly modulos: Repository<Modulo>,
    @InjectRepository(ServicoOnline) private readonly servicos: Repository<ServicoOnline>,
    @InjectRepository(Prazo) private readonly prazos: Repository<Prazo>,
    @InjectRepository(Conteudo) private readonly conteudos: Repository<Conteudo>,
    private readonly mail: MailService,
  ) {}

  @Get('config/publica')
  async configPublica() {
    const contatos = (await this.store.get('contatos')) ?? {};
    const nfseCfg = (await this.store.get<any>('nfse')) ?? {};
    const nfse = {
      dataInicio: nfseCfg.dataInicio ?? null,
      emissorUrl: nfseCfg.emissorUrl ?? null,
      issMunicipalUrl: nfseCfg.issMunicipalUrl ?? null,
      prazoSubstituicaoDias: nfseCfg.prazoSubstituicaoDias ?? null,
      prazoCancelamentoDias: nfseCfg.prazoCancelamentoDias ?? null,
    };
    const modulos = await this.modulos.find({ where: { publico: true }, order: { chave: 'ASC' } });
    return {
      contatos,
      nfse,
      emailAtivo: this.mail.ativo,
      modulos: modulos.map((m) => ({ chave: m.chave, nome: m.nome, ativo: m.ativo })),
    };
  }

  @Get('servicos')
  listarServicos() {
    return this.servicos.find({ where: { ativo: true }, order: { ordem: 'ASC', id: 'ASC' } });
  }

  @Get('prazos')
  listarPrazos() {
    return this.prazos.find({
      where: { ativo: true, ate: MoreThanOrEqual(hoje()) },
      order: { ate: 'ASC', id: 'ASC' },
    });
  }

  @Get('conteudos')
  async listarConteudos(
    @Query('tipo') tipo?: string,
    @Query('publico') publico?: string,
    @Query('destaque') destaque?: string,
  ) {
    const qb = this.conteudos.createQueryBuilder('c').where('c.status = :s', { s: 'publicado' });
    if (tipo) qb.andWhere('c.tipo = :tipo', { tipo });
    if (publico) qb.andWhere('(c.publico = :p OR c.publico = :todos)', { p: publico, todos: 'todos' });
    const d = bool(destaque);
    if (d !== undefined) qb.andWhere('c.destaque = :d', { d });
    qb.orderBy('c.publicadoEm', 'DESC').addOrderBy('c.id', 'DESC');
    const lista = await qb.getMany();
    return lista.map(({ corpo: _corpo, ...resto }) => resto);
  }

  @Get('conteudos/:slug')
  async conteudo(@Param('slug') slug: string) {
    const c = await this.conteudos.findOne({ where: { slug, status: 'publicado' } });
    if (!c) throw new NotFoundException('Conteúdo não encontrado.');
    return c;
  }

  @Get('faq')
  async faq(@Query('publico') publico?: string, @Query('q') q?: string) {
    let lista = await this.conteudos.find({
      where: { tipo: 'faq', status: 'publicado' },
      order: { destaque: 'DESC', publicadoEm: 'DESC', id: 'ASC' },
    });
    if (publico && publico !== 'todos') lista = lista.filter((c) => c.publico === publico || c.publico === 'todos');
    const termo = normalizar(q);
    if (termo) {
      const palavras = termo.split(/\s+/).filter(Boolean);
      lista = lista.filter((c) => {
        const alvo = normalizar(`${c.titulo} ${c.resumo ?? ''} ${c.corpo ?? ''}`.replace(/<[^>]+>/g, ' '));
        return palavras.every((p) => alvo.includes(p));
      });
    }
    return lista.map((c) => ({
      id: c.id,
      pergunta: c.titulo,
      resposta: c.corpo,
      publico: c.publico,
      baseOficial: c.baseOficial,
      atualizadoEm: c.atualizadoEm,
    }));
  }
}

class CriarDuvidaDto {
  @IsString() @IsNotEmpty() @MaxLength(200) nome: string;
  @IsEmail() @MaxLength(255) email: string;
  @IsString() @IsNotEmpty() @MaxLength(100) perfil: string;
  @IsString() @IsNotEmpty() @MaxLength(200) assunto: string;
  @IsString() @IsNotEmpty() @MaxLength(5000) texto: string;
  @Transform(({ value }) => bool(value) ?? false) @IsBoolean() autorizaPublicar: boolean;
  @IsOptional() @IsIn(['portal', 'nfse']) origem?: 'portal' | 'nfse';
  @IsOptional() @IsString() @MaxLength(40) telefone?: string;
  @IsOptional() @IsString() @MaxLength(100) segmento?: string;
}

@Controller('duvidas')
export class DuvidasPublicasController {
  constructor(
    @InjectRepository(Duvida) private readonly duvidas: Repository<Duvida>,
    private readonly protocolos: ProtocoloService,
    private readonly mail: MailService,
  ) {}

  @Post()
  async criar(@Body() dto: CriarDuvidaDto) {
    const d = await this.protocolos.criarDuvida({
      nome: dto.nome.trim(),
      email: dto.email.trim().toLowerCase(),
      telefone: dto.telefone?.trim() || null,
      perfil: dto.perfil,
      assunto: dto.assunto,
      segmento: dto.segmento?.trim() || null,
      texto: dto.texto.trim(),
      autorizaPublicar: dto.autorizaPublicar,
      origem: dto.origem ?? 'portal',
      status: 'nova',
    });
    void this.mail.enviar({
      to: d.email,
      subject: `Dúvida recebida — protocolo ${d.protocolo}`,
      text:
        `Olá, ${d.nome}.\n\nRecebemos a sua dúvida sobre "${d.assunto}". O seu protocolo é ${d.protocolo}.\n` +
        `A resposta será enviada para este e-mail. Você também pode acompanhar pelo protocolo no portal.\n\n` +
        `Secretaria Municipal de Finanças de Canindé`,
    });
    return { protocolo: d.protocolo };
  }

  /**
   * Situação do protocolo. A resposta só é devolvida a quem informa o mesmo e-mail usado na pergunta
   * (protocolos são sequenciais; sem o e-mail, ninguém lê a resposta de outra pessoa).
   */
  @Get('protocolo/:protocolo')
  async consultar(@Param('protocolo') protocolo: string, @Query('email') email?: string) {
    const d = await this.duvidas.findOne({ where: { protocolo: protocolo.trim().toUpperCase() } });
    if (!d) throw new NotFoundException('Protocolo não encontrado.');
    const base = { protocolo: d.protocolo, status: d.status, criadoEm: d.criadoEm, respondidoEm: d.respondidoEm };
    const emailConfere = !!email && email.trim().toLowerCase() === (d.email ?? '').trim().toLowerCase();
    const respondida = d.status === 'respondida' || d.status === 'publicada';
    if (!emailConfere) return { ...base, emailConfere: false };
    return { ...base, emailConfere: true, resposta: respondida ? d.resposta : null, baseOficial: respondida ? d.baseOficial : null };
  }
}
