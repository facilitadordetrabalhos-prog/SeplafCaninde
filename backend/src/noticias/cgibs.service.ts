import { Injectable, Logger, OnApplicationBootstrap, OnModuleDestroy } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { SchedulerRegistry } from '@nestjs/schedule';
import { InjectRepository } from '@nestjs/typeorm';
import * as cheerio from 'cheerio';
import { CronJob } from 'cron';
import { Repository } from 'typeorm';
import { ConfigStore } from '../common/config-store.service';
import { agoraIso, normalizar } from '../common/util';
import { NoticiaOficial, TipoNoticia } from '../entities';

const BASE = 'https://www.cgibs.gov.br';
const FONTE =
  `${BASE}/_service/conteudo/pagedlistfilho?id=104&templatename=pagina.listanoticias.cards&currentPage=1&pageSize=20` +
  '&fields%5B%5D=Titulo&fields%5B%5D=TituloCurto&fields%5B%5D=Texto&form%5Bordem%5D=RECENTES';

export interface ItemCgibs {
  link: string;
  titulo: string;
  resumo: string | null;
  data: string | null;
  imagemUrl: string | null;
}

export interface ResultadoSync {
  novas: number;
  total: number;
  ultimaVerificacao: string | null;
  erro?: string;
}

function absoluto(href: string | undefined | null): string | null {
  if (!href) return null;
  try {
    return new URL(href.trim(), BASE).toString();
  } catch {
    return null;
  }
}

function normalizarData(v: string | undefined): string | null {
  if (!v) return null;
  // "2026-09-30T15:13:00-0300" -> insere ":" no fuso para ficar ISO 8601 válido
  const ajustada = v.trim().replace(/([+-]\d{2})(\d{2})$/, '$1:$2');
  const d = new Date(ajustada);
  return isNaN(d.getTime()) ? v.trim().slice(0, 30) : d.toISOString();
}

function inferirTipo(titulo: string, resumo: string | null): TipoNoticia {
  const t = normalizar(`${titulo} ${resumo ?? ''}`);
  if (/\b(resolucao|lei complementar|decreto|portaria|instrucao normativa|ato conjunto)\b/.test(t)) return 'legislacao';
  if (/\b(comunicado|esquemas? xsd|endpoints?|nota tecnica|manual|orientacao conjunta)\b/.test(t)) return 'comunicado';
  return 'noticia';
}

export function parseCgibs(html: string): ItemCgibs[] {
  const $ = cheerio.load(html);
  const itens: ItemCgibs[] = [];
  $('.artigo__listapaginas__item').each((_, el) => {
    const item = $(el);
    const a = item.find('h3 a').first();
    const titulo = a.text().replace(/\s+/g, ' ').trim();
    const link = absoluto(a.attr('href') ?? item.find('a').first().attr('href'));
    if (!titulo || !link) return;
    const resumo = item.find('p.artigo__listapaginas__item__descricao').first().text().replace(/\s+/g, ' ').trim();
    itens.push({
      link,
      titulo: titulo.slice(0, 500),
      resumo: resumo || null,
      data: normalizarData(item.find('time[datetime]').first().attr('datetime')),
      imagemUrl: absoluto(item.find('img[src]').first().attr('src')),
    });
  });
  return itens;
}

@Injectable()
export class CgibsService implements OnApplicationBootstrap, OnModuleDestroy {
  private readonly logger = new Logger('CGIBS');
  private executando = false;
  private timer: NodeJS.Timeout | null = null;

  constructor(
    @InjectRepository(NoticiaOficial) private readonly noticias: Repository<NoticiaOficial>,
    private readonly store: ConfigStore,
    private readonly config: ConfigService,
    private readonly scheduler: SchedulerRegistry,
  ) {}

  private ativo(): boolean {
    return String(this.config.get('CGIBS_SYNC_ATIVO') ?? 'true').toLowerCase() !== 'false';
  }

  onApplicationBootstrap() {
    if (!this.ativo()) {
      this.logger.log('Sincronização automática desativada (CGIBS_SYNC_ATIVO=false).');
      return;
    }
    const expr = this.config.get<string>('CGIBS_SYNC_CRON') || '0 */2 * * *';
    try {
      const job = new CronJob(expr, () => void this.sincronizar(), null, false, 'America/Fortaleza');
      this.scheduler.addCronJob('cgibs-sync', job);
      job.start();
      this.logger.log(`Sincronização agendada: "${expr}".`);
    } catch (e) {
      this.logger.error(`Expressão cron inválida em CGIBS_SYNC_CRON ("${expr}"): ${(e as Error).message}`);
    }
    this.timer = setTimeout(async () => {
      try {
        if ((await this.noticias.count()) === 0) await this.sincronizar();
      } catch (e) {
        this.logger.error(`Falha na sincronização inicial: ${(e as Error).message}`);
      }
    }, 10_000);
  }

  onModuleDestroy() {
    if (this.timer) clearTimeout(this.timer);
  }

  async ultimaVerificacao(): Promise<string | null> {
    const c = await this.store.get<any>('cgibs');
    return c?.ultimaVerificacao ?? null;
  }

  /** Busca as notícias do CGIBS e grava as inéditas. Nunca lança exceção. */
  async sincronizar(): Promise<ResultadoSync> {
    if (this.executando) {
      return { novas: 0, total: 0, ultimaVerificacao: await this.ultimaVerificacao(), erro: 'Sincronização já em andamento.' };
    }
    this.executando = true;
    try {
      const resp = await fetch(FONTE, {
        headers: { Accept: 'application/json', 'User-Agent': 'SeplafCaninde/1.0 (+portal da Secretaria de Financas de Caninde)' },
        signal: AbortSignal.timeout(30_000),
      });
      if (!resp.ok) throw new Error(`HTTP ${resp.status}`);
      const json = (await resp.json()) as { recordcount?: number; body?: string };
      const itens = parseCgibs(json.body ?? '');
      const cfg = (await this.store.get<any>('cgibs')) ?? {};
      const autoPublicar = cfg.autoPublicarTituloLink !== false;
      let novas = 0;
      for (const item of itens) {
        const existe = await this.noticias.count({ where: { link: item.link } });
        if (existe) continue;
        const temPrazo = normalizar(`${item.titulo} ${item.resumo ?? ''}`).includes('prazo');
        await this.noticias.save(
          this.noticias.create({
            ...item,
            tipo: inferirTipo(item.titulo, item.resumo),
            status: autoPublicar ? 'publicada' : 'nova',
            publicadaEm: autoPublicar ? agoraIso() : null,
            temPrazo,
          }),
        );
        novas++;
      }
      const ultimaVerificacao = agoraIso();
      await this.store.merge('cgibs', { ultimaVerificacao });
      this.logger.log(`Sincronização concluída: ${itens.length} itens lidos, ${novas} novos.`);
      return { novas, total: itens.length, ultimaVerificacao };
    } catch (e) {
      const msg = (e as Error).message;
      this.logger.error(`Falha ao sincronizar com o CGIBS: ${msg}`);
      return { novas: 0, total: 0, ultimaVerificacao: await this.ultimaVerificacao().catch(() => null), erro: msg };
    } finally {
      this.executando = false;
    }
  }
}
