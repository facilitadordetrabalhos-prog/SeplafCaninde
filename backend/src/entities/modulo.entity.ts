import { Column, Entity, PrimaryColumn } from 'typeorm';

@Entity('modulos')
export class Modulo {
  @PrimaryColumn({ type: 'varchar', length: 50 }) chave: string;
  @Column({ type: 'varchar', length: 150 }) nome: string;
  @Column({ type: 'varchar', length: 500, default: '' }) descricao: string;
  @Column({ type: 'boolean', default: true }) ativo: boolean;
  @Column({ type: 'boolean', default: true }) publico: boolean;
}
