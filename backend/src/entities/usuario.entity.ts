import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn } from 'typeorm';

export type Perfil = 'gestor' | 'editor' | 'equipe';
export const PERFIS: Perfil[] = ['gestor', 'editor', 'equipe'];

@Entity('usuarios')
export class Usuario {
  @PrimaryGeneratedColumn() id: number;
  @Column({ type: 'varchar', length: 150 }) nome: string;
  @Column({ type: 'varchar', length: 255, unique: true }) email: string;
  @Column({ type: 'varchar', length: 100, select: false }) senhaHash: string;
  @Column({ type: 'varchar', length: 10 }) perfil: Perfil;
  @Column({ type: 'boolean', default: true }) ativo: boolean;
  @CreateDateColumn() criadoEm: Date;
}
