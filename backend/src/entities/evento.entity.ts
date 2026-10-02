import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity('eventos')
export class Evento {
  @PrimaryGeneratedColumn() id: number;
  @Column({ type: 'varchar', length: 150, unique: true }) slug: string;
  @Column({ type: 'varchar', length: 200 }) nome: string;
  /** YYYY-MM-DD */
  @Column({ type: 'varchar', length: 10 }) data: string;
  @Column({ type: 'text', nullable: true }) descricao: string | null;
  @Column({ type: 'varchar', length: 500, nullable: true }) imagemUrl: string | null;
  @Column({ type: 'int', default: 0 }) totalInscritos: number;
  @Column({ type: 'int', default: 0 }) totalPessoas: number;
}
