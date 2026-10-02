import { Column, CreateDateColumn, Entity, Index, PrimaryGeneratedColumn } from 'typeorm';

export const ORIGENS_DUVIDA = ['portal', 'nfse', 'evento'] as const;
export type OrigemDuvida = (typeof ORIGENS_DUVIDA)[number];
export const STATUS_DUVIDA = ['nova', 'em_resposta', 'respondida', 'publicada', 'incompleta'] as const;
export type StatusDuvida = (typeof STATUS_DUVIDA)[number];

@Entity('duvidas')
export class Duvida {
  @PrimaryGeneratedColumn() id: number;
  @Column({ type: 'varchar', length: 20, unique: true }) protocolo: string;
  @Column({ type: 'varchar', length: 200 }) nome: string;
  @Column({ type: 'varchar', length: 255 }) email: string;
  @Column({ type: 'varchar', length: 40, nullable: true }) telefone: string | null;
  @Column({ type: 'varchar', length: 100 }) perfil: string;
  @Column({ type: 'varchar', length: 200 }) assunto: string;
  @Column({ type: 'varchar', length: 100, nullable: true }) segmento: string | null;
  @Column({ type: 'text' }) texto: string;
  @Column({ type: 'boolean', default: false }) autorizaPublicar: boolean;
  @Column({ type: 'varchar', length: 10, default: 'portal' }) origem: OrigemDuvida;
  @Index() @Column({ type: 'int', nullable: true }) eventoId: number | null;
  @Column({ type: 'varchar', length: 50, nullable: true }) tema: string | null;
  @Column({ type: 'varchar', length: 12, default: 'nova' }) status: StatusDuvida;
  @Column({ type: 'int', nullable: true }) responsavelId: number | null;
  @Column({ type: 'text', nullable: true }) resposta: string | null;
  @Column({ type: 'varchar', length: 500, nullable: true }) baseOficial: string | null;
  @CreateDateColumn() criadoEm: Date;
  /** ISO 8601 */
  @Column({ type: 'varchar', length: 30, nullable: true }) respondidoEm: string | null;
}
