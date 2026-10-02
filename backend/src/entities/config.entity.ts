import { Column, Entity, PrimaryColumn } from 'typeorm';

@Entity('config')
export class Config {
  @PrimaryColumn({ type: 'varchar', length: 100 }) chave: string;
  @Column({ type: 'simple-json', nullable: true }) valor: any;
}
