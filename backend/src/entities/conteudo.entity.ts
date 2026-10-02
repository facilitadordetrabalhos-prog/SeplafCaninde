import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';

export const TIPOS_CONTEUDO = ['guia', 'dica', 'noticia_local', 'video', 'material', 'faq'] as const;
export type TipoConteudo = (typeof TIPOS_CONTEUDO)[number];
export const PUBLICOS = ['todos', 'mei', 'empresa', 'servico', 'contador', 'cidadao'] as const;
export type PublicoConteudo = (typeof PUBLICOS)[number];
export const STATUS_CONTEUDO = ['rascunho', 'aguardando', 'publicado'] as const;
export type StatusConteudo = (typeof STATUS_CONTEUDO)[number];

@Entity('conteudos')
export class Conteudo {
  @PrimaryGeneratedColumn() id: number;
  @Column({ type: 'varchar', length: 20 }) tipo: TipoConteudo;
  @Column({ type: 'varchar', length: 500 }) titulo: string;
  @Column({ type: 'varchar', length: 255, unique: true }) slug: string;
  @Column({ type: 'varchar', length: 20, default: 'todos' }) publico: PublicoConteudo;
  @Column({ type: 'text', nullable: true }) resumo: string | null;
  @Column({ type: 'text', nullable: true }) corpo: string | null;
  @Column({ type: 'varchar', length: 500, nullable: true }) baseOficial: string | null;
  @Column({ type: 'varchar', length: 500, nullable: true }) videoUrl: string | null;
  @Column({ type: 'varchar', length: 500, nullable: true }) anexoUrl: string | null;
  @Column({ type: 'boolean', default: false }) destaque: boolean;
  @Column({ type: 'varchar', length: 12, default: 'rascunho' }) status: StatusConteudo;
  @Column({ type: 'int', nullable: true }) autorId: number | null;
  @CreateDateColumn() criadoEm: Date;
  @UpdateDateColumn() atualizadoEm: Date;
  /** ISO 8601 */
  @Column({ type: 'varchar', length: 30, nullable: true }) publicadoEm: string | null;
}
