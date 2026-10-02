import { Column, Entity, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';

export const PERFIS_PRESTADOR = ['MEI', 'Simples', 'Presumido', 'Real', 'Outro'] as const;
export type PerfilPrestador = (typeof PERFIS_PRESTADOR)[number];
export const SITUACOES_PRESTADOR = ['sem_acesso', 'acessou', 'emitindo', 'bloqueado'] as const;
export type SituacaoPrestador = (typeof SITUACOES_PRESTADOR)[number];

@Entity('prestadores')
export class Prestador {
  @PrimaryGeneratedColumn() id: number;
  @Column({ type: 'varchar', length: 200 }) nome: string;
  @Column({ type: 'varchar', length: 20, unique: true }) cpfCnpj: string;
  @Column({ type: 'varchar', length: 10, default: 'Outro' }) perfil: PerfilPrestador;
  @Column({ type: 'varchar', length: 12, default: 'sem_acesso' }) situacao: SituacaoPrestador;
  @Column({ type: 'varchar', length: 200, nullable: true }) contador: string | null;
  @Column({ type: 'varchar', length: 255, nullable: true }) email: string | null;
  @UpdateDateColumn() atualizadoEm: Date;
}
