import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn } from 'typeorm';

export const STATUS_AGENDAMENTO = ['agendado', 'atendido', 'faltou', 'cancelado'] as const;
export type StatusAgendamento = (typeof STATUS_AGENDAMENTO)[number];

@Entity('agendamentos')
export class Agendamento {
  @PrimaryGeneratedColumn() id: number;
  @Column({ type: 'varchar', length: 20 }) cpfCnpj: string;
  @Column({ type: 'varchar', length: 200 }) nome: string;
  @Column({ type: 'varchar', length: 255, nullable: true }) email: string | null;
  @Column({ type: 'varchar', length: 40, nullable: true }) telefone: string | null;
  @Column({ type: 'text' }) motivo: string;
  /** YYYY-MM-DD */
  @Column({ type: 'varchar', length: 10 }) dataPreferida: string;
  @Column({ type: 'varchar', length: 6 }) turno: 'manha' | 'tarde';
  @Column({ type: 'varchar', length: 10, default: 'agendado' }) status: StatusAgendamento;
  @Column({ type: 'text', nullable: true }) observacao: string | null;
  @CreateDateColumn() criadoEm: Date;
}
