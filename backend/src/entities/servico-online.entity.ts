import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity('servicos_online')
export class ServicoOnline {
  @PrimaryGeneratedColumn() id: number;
  @Column({ type: 'varchar', length: 200 }) titulo: string;
  @Column({ type: 'text' }) descricao: string;
  @Column({ type: 'varchar', length: 500 }) url: string;
  @Column({ type: 'varchar', length: 20, default: '' }) icone: string;
  @Column({ type: 'text', nullable: true }) aviso: string | null;
  @Column({ type: 'varchar', length: 10, nullable: true }) avisoTipo: 'mudanca' | 'boa' | null;
  @Column({ type: 'boolean', default: false }) destaque: boolean;
  @Column({ type: 'int', default: 0 }) ordem: number;
  @Column({ type: 'boolean', default: true }) ativo: boolean;
}
