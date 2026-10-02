import 'reflect-metadata';
import { Logger } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';
import { AppModule } from './app.module';
import { criarValidationPipe } from './common/validacao';
import { garantirPastaDados } from './database';

async function bootstrap() {
  garantirPastaDados();
  const app = await NestFactory.create<NestExpressApplication>(AppModule);
  const logger = new Logger('Seplaf');

  app.setGlobalPrefix('api');
  app.useGlobalPipes(criarValidationPipe());
  app.enableShutdownHooks();
  app.set('trust proxy', 1);

  const origens = (process.env.CORS_ORIGIN ?? '')
    .split(',')
    .map((o) => o.trim())
    .filter(Boolean);
  if (process.env.NODE_ENV !== 'production') origens.push('http://localhost:5173', 'http://127.0.0.1:5173');
  if (origens.length) app.enableCors({ origin: origens, credentials: true });

  const porta = Number(process.env.PORT) || 3000;
  await app.listen(porta, '0.0.0.0');
  logger.log(`API em http://localhost:${porta}/api (NODE_ENV=${process.env.NODE_ENV ?? 'development'})`);
}

bootstrap();
