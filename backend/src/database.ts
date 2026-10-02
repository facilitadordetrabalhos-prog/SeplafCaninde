import { Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { TypeOrmModuleOptions } from '@nestjs/typeorm';
import { mkdirSync } from 'fs';
import { join } from 'path';
import { ENTIDADES } from './entities';

/** Pasta `backend/data` (funciona tanto em `src/` via ts quanto em `dist/`). */
export const PASTA_DADOS = join(__dirname, '..', 'data');

export function garantirPastaDados() {
  mkdirSync(PASTA_DADOS, { recursive: true });
}

export function opcoesBanco(config: ConfigService): TypeOrmModuleOptions {
  const tipo = (config.get<string>('DB_TYPE') || 'sqljs').toLowerCase();
  const producao = config.get<string>('NODE_ENV') === 'production';
  const dbSync = String(config.get('DB_SYNC') ?? '').toLowerCase() === 'true';
  // Fora de produção o schema é sincronizado sempre; em produção só com DB_SYNC=true.
  const synchronize = !producao || dbSync;
  const ssl = String(config.get('DB_SSL') ?? '').toLowerCase() === 'true' ? { rejectUnauthorized: false } : undefined;
  const url = config.get<string>('DATABASE_URL') || undefined;
  const logger = new Logger('Banco');

  if (tipo === 'postgres') {
    logger.log(`Usando PostgreSQL (synchronize=${synchronize}).`);
    return {
      type: 'postgres',
      url,
      host: url ? undefined : config.get<string>('DB_HOST') || 'localhost',
      port: url ? undefined : Number(config.get('DB_PORT') || 5432),
      username: url ? undefined : config.get<string>('DB_USER'),
      password: url ? undefined : config.get<string>('DB_PASSWORD'),
      database: url ? undefined : config.get<string>('DB_NAME'),
      ssl,
      entities: ENTIDADES,
      synchronize,
    };
  }

  if (tipo === 'mysql' || tipo === 'mariadb') {
    logger.log(`Usando MySQL/MariaDB (synchronize=${synchronize}).`);
    return {
      type: 'mysql',
      url,
      host: url ? undefined : config.get<string>('DB_HOST') || 'localhost',
      port: url ? undefined : Number(config.get('DB_PORT') || 3306),
      username: url ? undefined : config.get<string>('DB_USER'),
      password: url ? undefined : config.get<string>('DB_PASSWORD'),
      database: url ? undefined : config.get<string>('DB_NAME'),
      charset: 'utf8mb4',
      timezone: 'Z',
      ssl,
      entities: ENTIDADES,
      synchronize,
    };
  }

  if (tipo !== 'sqljs') logger.warn(`DB_TYPE "${tipo}" desconhecido; usando sqljs.`);
  garantirPastaDados();
  const location = join(PASTA_DADOS, 'seplaf.sqlite');
  logger.log(`Usando sql.js em ${location}`);
  return {
    type: 'sqljs',
    autoSave: true,
    location,
    entities: ENTIDADES,
    // sql.js é só para desenvolvimento/arquivo local: sempre sincroniza o schema.
    synchronize: true,
  };
}
