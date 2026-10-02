import { Column, Entity, Index, PrimaryGeneratedColumn } from 'typeorm';

export interface LinkTema {
  rotulo: string;
  rota: string;
}

@Entity('temas_evento')
export class TemaEvento {
  @PrimaryGeneratedColumn() id: number;
  @Index() @Column({ type: 'int' }) eventoId: number;
  @Column({ type: 'varchar', length: 50 }) chave: string;
  @Column({ type: 'varchar', length: 300 }) titulo: string;
  @Column({ type: 'text', nullable: true }) resposta: string | null;
  @Column({ type: 'varchar', length: 500, nullable: true }) baseOficial: string | null;
  @Column({ type: 'simple-json', nullable: true }) links: LinkTema[] | null;
  @Column({ type: 'int', default: 0 }) ordem: number;
  @Column({ type: 'boolean', default: false }) aprovado: boolean;
}
