import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Config } from '../entities';

/** Leitura/escrita das chaves da tabela `config`. */
@Injectable()
export class ConfigStore {
  constructor(@InjectRepository(Config) private readonly repo: Repository<Config>) {}

  async get<T = any>(chave: string, padrao: T | null = null): Promise<T | null> {
    const c = await this.repo.findOne({ where: { chave } });
    return c ? (c.valor as T) : padrao;
  }

  async existe(chave: string): Promise<boolean> {
    return (await this.repo.count({ where: { chave } })) > 0;
  }

  async set<T = any>(chave: string, valor: T): Promise<T> {
    await this.repo.save(this.repo.create({ chave, valor }));
    return valor;
  }

  /** Mescla campos num objeto JSON existente. */
  async merge<T extends object>(chave: string, parcial: Partial<T>): Promise<T> {
    const atual = ((await this.get<T>(chave)) ?? {}) as T;
    return this.set<T>(chave, { ...atual, ...parcial });
  }
}
