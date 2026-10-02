import { Agendamento } from './agendamento.entity';
import { Config } from './config.entity';
import { Conteudo } from './conteudo.entity';
import { Duvida } from './duvida.entity';
import { Evento } from './evento.entity';
import { Modulo } from './modulo.entity';
import { NoticiaOficial } from './noticia-oficial.entity';
import { InscricaoOficina, Oficina } from './oficina.entity';
import { Prazo } from './prazo.entity';
import { Prestador } from './prestador.entity';
import { ServicoOnline } from './servico-online.entity';
import { TemaEvento } from './tema-evento.entity';
import { Usuario } from './usuario.entity';

export * from './agendamento.entity';
export * from './config.entity';
export * from './conteudo.entity';
export * from './duvida.entity';
export * from './evento.entity';
export * from './modulo.entity';
export * from './noticia-oficial.entity';
export * from './oficina.entity';
export * from './prazo.entity';
export * from './prestador.entity';
export * from './servico-online.entity';
export * from './tema-evento.entity';
export * from './usuario.entity';

export const ENTIDADES = [
  Usuario,
  Config,
  Modulo,
  ServicoOnline,
  NoticiaOficial,
  Prazo,
  Conteudo,
  Duvida,
  Evento,
  TemaEvento,
  Oficina,
  InscricaoOficina,
  Agendamento,
  Prestador,
];
