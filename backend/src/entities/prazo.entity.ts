import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity('prazos')
export class Prazo {
  @PrimaryGeneratedColumn() id: number;
  @Column({ type: 'varchar', length: 300 }) titulo: string;
  @Column({ type: 'varchar', length: 300, default: '' }) quem: string;
  /** YYYY-MM-DD */
  @Column({ type: 'varchar', length: 10 }) ate: string;
  @Column({ type: 'varchar', length: 500, default: '' }) fonte: string;
  @Column({ type: 'boolean', default: true }) ativo: boolean;
  @Column({ type: 'int', nullable: true }) noticiaId: number | null;
}
