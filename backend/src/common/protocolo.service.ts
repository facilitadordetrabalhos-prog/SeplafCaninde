import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Like, Repository } from 'typeorm';
import { Duvida } from '../entities';

/** Gera protocolos DUV-AAAA-NNNNN sequenciais por ano e cria a dúvida (com nova tentativa em caso de colisão). */
@Injectable()
export class ProtocoloService {
  constructor(@InjectRepository(Duvida) private readonly duvidas: Repository<Duvida>) {}

  async proximo(): Promise<string> {
    const ano = new Date().getFullYear();
    const prefixo = `DUV-${ano}-`;
    const ultima = await this.duvidas.findOne({
      where: { protocolo: Like(`${prefixo}%`) },
      order: { protocolo: 'DESC' },
      select: { id: true, protocolo: true },
    });
    const n = ultima ? parseInt(ultima.protocolo.slice(prefixo.length), 10) + 1 : 1;
    return `${prefixo}${String(n).padStart(5, '0')}`;
  }

  async criarDuvida(dados: Partial<Duvida>): Promise<Duvida> {
    let erro: unknown;
    for (let tentativa = 0; tentativa < 5; tentativa++) {
      try {
        const protocolo = await this.proximo();
        return await this.duvidas.save(this.duvidas.create({ ...dados, protocolo }));
      } catch (e) {
        erro = e;
        const msg = String((e as Error)?.message ?? '').toLowerCase();
        if (!msg.includes('unique') && !msg.includes('duplicate')) throw e;
      }
    }
    throw erro;
  }
}
