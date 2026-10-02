import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { parse } from 'csv-parse/sync';
import { In, IsNull, Not, Repository } from 'typeorm';
import { ProtocoloService } from '../common/protocolo.service';
import { agoraIso, bool, htmlParaTexto, normalizar } from '../common/util';
import { Duvida, Evento, TemaEvento } from '../entities';
import { MailService } from '../mail/mail.service';

export interface ResultadoImportacao {
  inscricoes: number;
  pessoas: number;
  comPergunta: number;
  novas: number;
}

/** Lê um CSV separado por ";" (UTF-8, com ou sem BOM) e devolve linhas com cabeçalhos normalizados. */
export function lerCsv(buffer: Buffer): Record<string, string>[] {
  let texto = buffer.toString('utf8');
  if (texto.charCodeAt(0) === 0xfeff) texto = texto.slice(1);
  try {
    return parse(texto, {
      delimiter: ';',
      columns: (cab: string[]) => cab.map((c) => normalizar(c).replace(/\s+/g, '_')),
      skip_empty_lines: true,
      relax_column_count: true,
      relax_quotes: true,
      trim: true,
      bom: true,
    }) as Record<string, string>[];
  } catch (e) {
    throw new BadRequestException(`Não foi possível ler o CSV: ${(e as Error).message}`);
  }
}

@Injectable()
export class EventosService {
  constructor(
    @InjectRepository(Evento) private readonly eventos: Repository<Evento>,
    @InjectRepository(TemaEvento) private readonly temas: Repository<TemaEvento>,
    @InjectRepository(Duvida) private readonly duvidas: Repository<Duvida>,
    private readonly protocolos: ProtocoloService,
    private readonly mail: MailService,
    private readonly config: ConfigService,
  ) {}

  async porId(id: number): Promise<Evento> {
    const e = await this.eventos.findOne({ where: { id } });
    if (!e) throw new NotFoundException('Evento não encontrado.');
    return e;
  }

  private contarPerguntas(eventoId: number) {
    return this.duvidas.count({ where: { origem: 'evento', eventoId } });
  }

  async listar() {
    const lista = await this.eventos.find({ order: { data: 'DESC', id: 'DESC' } });
    return Promise.all(lista.map(async (e) => ({ ...e, totalPerguntas: await this.contarPerguntas(e.id) })));
  }

  async listarPublico() {
    const lista = await this.listar();
    return lista.map((e) => ({
      id: e.id,
      slug: e.slug,
      nome: e.nome,
      data: e.data,
      descricao: e.descricao,
      imagemUrl: e.imagemUrl,
      totalPessoas: e.totalPessoas,
      totalPerguntas: e.totalPerguntas,
    }));
  }

  /** Página pública: só temas aprovados (≠ incompleta), com citações anônimas. Nunca nome/e-mail. */
  async publico(slug: string) {
    const e = await this.eventos.findOne({ where: { slug } });
    if (!e) throw new NotFoundException('Evento não encontrado.');
    const temas = await this.temas.find({
      where: { eventoId: e.id, aprovado: true, chave: Not('incompleta') },
      order: { ordem: 'ASC', id: 'ASC' },
    });
    const perguntas = await this.duvidas.find({
      where: { origem: 'evento', eventoId: e.id, tema: Not(IsNull()) },
      select: { id: true, texto: true, segmento: true, tema: true },
      order: { id: 'ASC' },
    });
    return {
      id: e.id,
      slug: e.slug,
      nome: e.nome,
      data: e.data,
      descricao: e.descricao,
      imagemUrl: e.imagemUrl,
      totalInscritos: e.totalInscritos,
      totalPessoas: e.totalPessoas,
      totalPerguntas: await this.contarPerguntas(e.id),
      temas: temas.map((t) => {
        const doTema = perguntas.filter((p) => p.tema === t.chave);
        return {
          id: t.id,
          chave: t.chave,
          titulo: t.titulo,
          resposta: t.resposta,
          baseOficial: t.baseOficial,
          links: t.links ?? [],
          qtd: doTema.length,
          citacoes: doTema
            .filter((p) => (p.texto ?? '').trim().length > 12)
            .slice(0, 3)
            .map((p) => ({ pergunta: p.texto.trim(), segmento: p.segmento })),
        };
      }),
    };
  }

  async temasComQtd(eventoId: number) {
    await this.porId(eventoId);
    const temas = await this.temas.find({ where: { eventoId }, order: { ordem: 'ASC', id: 'ASC' } });
    const perguntas = await this.duvidas.find({
      where: { origem: 'evento', eventoId },
      select: { id: true, tema: true },
    });
    return temas.map((t) => ({ ...t, qtd: perguntas.filter((p) => p.tema === t.chave).length }));
  }

  async importar(eventoId: number, buffer: Buffer): Promise<ResultadoImportacao> {
    const evento = await this.porId(eventoId);
    const linhas = lerCsv(buffer);
    if (linhas.length && !('tax_question' in linhas[0]) && !('email' in linhas[0])) {
      throw new BadRequestException('CSV sem as colunas esperadas (email, tax_question).');
    }
    const existentes = await this.duvidas.find({
      where: { origem: 'evento', eventoId },
      select: { id: true, email: true, texto: true },
    });
    const chaves = new Set(existentes.map((d) => `${normalizar(d.email)}|${normalizar(d.texto)}`));
    let pessoas = 0;
    let comPergunta = 0;
    let novas = 0;
    for (const l of linhas) {
      const qtd = parseInt(String(l.attendees_count ?? '').replace(/\D/g, ''), 10);
      pessoas += qtd > 0 ? qtd : 1;
      const pergunta = (l.tax_question ?? '').trim();
      if (!pergunta) continue;
      comPergunta++;
      const email = (l.email ?? '').trim().toLowerCase();
      const chave = `${normalizar(email)}|${normalizar(pergunta)}`;
      if (chaves.has(chave)) continue;
      chaves.add(chave);
      await this.protocolos.criarDuvida({
        nome: ((l.full_name ?? '').trim() || 'Participante').slice(0, 200),
        email: email.slice(0, 255),
        telefone: (l.phone ?? '').trim().slice(0, 40) || null,
        perfil: ((l.role_title ?? '').trim() || 'Participante').slice(0, 100),
        assunto: 'Conexão Empresarial',
        segmento: (l.segment ?? '').trim().slice(0, 100) || null,
        texto: pergunta,
        autorizaPublicar: bool(l.consent) ?? false,
        origem: 'evento',
        eventoId: evento.id,
        tema: null,
        status: 'nova',
      });
      novas++;
    }
    evento.totalInscritos = linhas.length;
    evento.totalPessoas = pessoas;
    await this.eventos.save(evento);
    return { inscricoes: linhas.length, pessoas, comPergunta, novas };
  }

  async perguntas(eventoId: number) {
    await this.porId(eventoId);
    const lista = await this.duvidas.find({ where: { origem: 'evento', eventoId }, order: { id: 'ASC' } });
    return lista.map((d) => ({
      id: d.id,
      nome: d.nome,
      segmento: d.segmento,
      pergunta: d.texto,
      tema: d.tema,
      status: d.status,
    }));
  }

  async classificar(duvidaId: number, tema: string | null) {
    const d = await this.duvidas.findOne({ where: { id: duvidaId, origem: 'evento' } });
    if (!d) throw new NotFoundException('Pergunta não encontrada.');
    if (tema && d.eventoId) {
      const existe = await this.temas.count({ where: { eventoId: d.eventoId, chave: tema } });
      if (!existe) throw new BadRequestException('Tema inexistente para este evento.');
    }
    d.tema = tema || null;
    if (tema === 'incompleta') d.status = 'incompleta';
    else if (d.status === 'incompleta') d.status = 'nova';
    await this.duvidas.save(d);
    return { id: d.id, nome: d.nome, segmento: d.segmento, pergunta: d.texto, tema: d.tema, status: d.status };
  }

  async enviarRespostas(eventoId: number): Promise<{ enviadas: number }> {
    const evento = await this.porId(eventoId);
    const temas = await this.temas.find({ where: { eventoId, aprovado: true, chave: Not('incompleta') } });
    if (!temas.length) return { enviadas: 0 };
    const porChave = new Map(temas.map((t) => [t.chave, t]));
    const pendentes = await this.duvidas.find({
      where: {
        origem: 'evento',
        eventoId,
        tema: In([...porChave.keys()]),
        status: Not(In(['respondida', 'publicada', 'incompleta'])),
      },
      order: { id: 'ASC' },
    });
    const base = (this.config.get<string>('PUBLIC_URL') || 'http://localhost:5173').replace(/\/+$/, '');
    const pagina = `${base}/eventos/${evento.slug}`;
    let enviadas = 0;
    for (const d of pendentes) {
      const t = porChave.get(d.tema!)!;
      if (!d.email) continue;
      const texto =
        `Olá, ${d.nome}.\n\n` +
        `Você enviou esta pergunta na inscrição do evento "${evento.nome}":\n"${d.texto}"\n\n` +
        `Tema: ${t.titulo}\n\n${htmlParaTexto(t.resposta)}\n\n` +
        (t.baseOficial ? `Base oficial: ${t.baseOficial}\n\n` : '') +
        `Veja todas as respostas na página do evento: ${pagina}\n\n` +
        `Protocolo: ${d.protocolo}\nSecretaria Municipal de Finanças de Canindé`;
      const ok = await this.mail.enviar({
        to: d.email,
        subject: `${evento.nome}: resposta à sua pergunta`,
        text: texto,
        html:
          `<p>Olá, ${escapar(d.nome)}.</p><p>Você enviou esta pergunta na inscrição do evento <b>${escapar(evento.nome)}</b>:<br><i>“${escapar(d.texto)}”</i></p>` +
          `<h3>${escapar(t.titulo)}</h3>${t.resposta ?? ''}` +
          (t.baseOficial ? `<p><small>Base oficial: ${escapar(t.baseOficial)}</small></p>` : '') +
          `<p><a href="${pagina}">Veja todas as respostas na página do evento</a></p><p><small>Protocolo: ${d.protocolo}</small></p>`,
      });
      if (!ok) continue;
      d.status = 'respondida';
      d.resposta = t.resposta;
      d.baseOficial = t.baseOficial;
      d.respondidoEm = agoraIso();
      await this.duvidas.save(d);
      enviadas++;
    }
    return { enviadas };
  }
}

function escapar(s: string | null | undefined): string {
  return (s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]!);
}
