import { Column, CreateDateColumn, Entity, Index, PrimaryGeneratedColumn } from 'typeorm';

@Entity('oficinas')
export class Oficina {
  @PrimaryGeneratedColumn() id: number;
  @Column({ type: 'varchar', length: 300 }) titulo: string;
  /** YYYY-MM-DD */
  @Column({ type: 'varchar', length: 10 }) data: string;
  /** HH:MM */
  @Column({ type: 'varchar', length: 10, default: '' }) hora: string;
  @Column({ type: 'varchar', length: 300, default: '' }) local: string;
  @Column({ type: 'varchar', length: 200, default: '' }) publico: string;
  @Column({ type: 'int', default: 0 }) vagas: number;
  @Column({ type: 'boolean', default: true }) ativo: boolean;
}

@Entity('inscricoes_oficina')
export class InscricaoOficina {
  @PrimaryGeneratedColumn() id: number;
  @Index() @Column({ type: 'int' }) oficinaId: number;
  @Column({ type: 'varchar', length: 200 }) nome: string;
  @Column({ type: 'varchar', length: 255 }) email: string;
  @Column({ type: 'varchar', length: 40, nullable: true }) telefone: string | null;
  @CreateDateColumn() criadoEm: Date;
}
