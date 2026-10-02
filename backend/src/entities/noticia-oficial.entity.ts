import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn } from 'typeorm';

export const TIPOS_NOTICIA = ['noticia', 'comunicado', 'legislacao'] as const;
export type TipoNoticia = (typeof TIPOS_NOTICIA)[number];
export const STATUS_NOTICIA = ['nova', 'publicada', 'ignorada'] as const;
export type StatusNoticia = (typeof STATUS_NOTICIA)[number];

@Entity('noticias_oficiais')
export class NoticiaOficial {
  @PrimaryGeneratedColumn() id: number;
  @Column({ type: 'varchar', length: 500, unique: true }) link: string;
  @Column({ type: 'varchar', length: 500 }) titulo: string;
  @Column({ type: 'text', nullable: true }) resumo: string | null;
  /** Data da notícia no CGIBS (YYYY-MM-DD, ou ISO completo quando houver hora). */
  @Column({ type: 'varchar', length: 30, nullable: true }) data: string | null;
  @Column({ type: 'varchar', length: 12, default: 'noticia' }) tipo: TipoNoticia;
  @Column({ type: 'varchar', length: 500, nullable: true }) imagemUrl: string | null;
  @Column({ type: 'varchar', length: 10, default: 'nova' }) status: StatusNoticia;
  @Column({ type: 'varchar', length: 100, nullable: true }) publico: string | null;
  @Column({ type: 'boolean', default: false }) temPrazo: boolean;
  @Column({ type: 'boolean', default: false }) prazoAlterado: boolean;
  @Column({ type: 'text', nullable: true }) explicacaoLocal: string | null;
  @CreateDateColumn() capturadaEm: Date;
  /** ISO 8601 */
  @Column({ type: 'varchar', length: 30, nullable: true }) publicadaEm: string | null;
}
