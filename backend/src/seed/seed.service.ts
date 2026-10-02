import { Injectable, Logger, OnApplicationBootstrap } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import * as bcrypt from 'bcryptjs';
import { Repository } from 'typeorm';
import { ConfigStore } from '../common/config-store.service';
import { agoraIso } from '../common/util';
import { Conteudo, Evento, Modulo, Prazo, ServicoOnline, TemaEvento, Usuario } from '../entities';
import { CONFIG_SEED, EVENTO_SEED, FAQ_SEED, GUIA_SEED, MODULOS_SEED, PRAZOS_SEED, SERVICOS_SEED } from './dados.seed';
import { TEMAS_EVENTO_SEED } from './temas-evento.seed';

/** Insere os dados iniciais no boot, de forma idempotente (cada item só quando ausente). */
@Injectable()
export class SeedService implements OnApplicationBootstrap {
  private readonly logger = new Logger('Seed');

  constructor(
    private readonly config: ConfigService,
    private readonly store: ConfigStore,
    @InjectRepository(Usuario) private readonly usuarios: Repository<Usuario>,
    @InjectRepository(Modulo) private readonly modulos: Repository<Modulo>,
    @InjectRepository(ServicoOnline) private readonly servicos: Repository<ServicoOnline>,
    @InjectRepository(Prazo) private readonly prazos: Repository<Prazo>,
    @InjectRepository(Conteudo) private readonly conteudos: Repository<Conteudo>,
    @InjectRepository(Evento) private readonly eventos: Repository<Evento>,
    @InjectRepository(TemaEvento) private readonly temas: Repository<TemaEvento>,
  ) {}

  async onApplicationBootstrap() {
    try {
      await this.admin();
      await this.configuracoes();
      await this.seedModulos();
      await this.seedServicos();
      await this.seedPrazos();
      await this.seedConteudos();
      await this.seedEvento();
    } catch (e) {
      this.logger.error(`Falha ao inserir dados iniciais: ${(e as Error).message}`, (e as Error).stack);
    }
  }

  private async admin() {
    if ((await this.usuarios.count()) > 0) return;
    const email = this.config.get<string>('ADMIN_EMAIL')?.trim().toLowerCase();
    const senha = this.config.get<string>('ADMIN_SENHA');
    if (!email || !senha) {
      this.logger.warn('Nenhum usuário cadastrado e ADMIN_EMAIL/ADMIN_SENHA não definidos: o primeiro gestor não foi criado.');
      return;
    }
    await this.usuarios.save(
      this.usuarios.create({
        nome: this.config.get<string>('ADMIN_NOME') || 'Administrador',
        email,
        perfil: 'gestor',
        ativo: true,
        senhaHash: await bcrypt.hash(senha, 10),
      }),
    );
    this.logger.log(`Primeiro gestor criado: ${email}`);
  }

  private async configuracoes() {
    for (const [chave, valor] of Object.entries(CONFIG_SEED)) {
      if (!(await this.store.existe(chave))) await this.store.set(chave, valor);
    }
  }

  private async seedModulos() {
    for (const m of MODULOS_SEED) {
      if (!(await this.modulos.count({ where: { chave: m.chave } }))) await this.modulos.save(this.modulos.create(m));
    }
  }

  private async seedServicos() {
    if ((await this.servicos.count()) > 0) return;
    await this.servicos.save(SERVICOS_SEED.map((s) => this.servicos.create(s)));
    this.logger.log(`${SERVICOS_SEED.length} serviços online inseridos.`);
  }

  private async seedPrazos() {
    if ((await this.prazos.count()) > 0) return;
    await this.prazos.save(PRAZOS_SEED.map((p) => this.prazos.create(p)));
    this.logger.log(`${PRAZOS_SEED.length} prazos inseridos.`);
  }

  private async seedConteudos() {
    const publicadoEm = agoraIso();
    if (!(await this.conteudos.count({ where: { slug: GUIA_SEED.slug } }))) {
      await this.conteudos.save(this.conteudos.create({ ...GUIA_SEED, publicadoEm }));
    }
    if ((await this.conteudos.count({ where: { tipo: 'faq' } })) === 0) {
      await this.conteudos.save(
        FAQ_SEED.map((f) =>
          this.conteudos.create({ tipo: 'faq', resumo: null, destaque: false, ...f, status: 'publicado', publicadoEm }),
        ),
      );
      this.logger.log(`${FAQ_SEED.length} perguntas frequentes inseridas.`);
    }
  }

  private async seedEvento() {
    let evento = await this.eventos.findOne({ where: { slug: EVENTO_SEED.slug } });
    if (!evento) evento = await this.eventos.save(this.eventos.create(EVENTO_SEED));
    if ((await this.temas.count({ where: { eventoId: evento.id } })) === 0) {
      await this.temas.save(TEMAS_EVENTO_SEED.map((t) => this.temas.create({ ...t, eventoId: evento!.id, aprovado: false })));
      this.logger.log(`${TEMAS_EVENTO_SEED.length} temas do evento inseridos.`);
    }
  }
}
