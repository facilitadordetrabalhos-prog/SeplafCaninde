import { DynamicModule, Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ScheduleModule } from '@nestjs/schedule';
import { ServeStaticModule } from '@nestjs/serve-static';
import { TypeOrmModule } from '@nestjs/typeorm';
import { existsSync } from 'fs';
import { join } from 'path';
import {
  ConfigAdminController,
  PrazosAdminController,
  ResumoController,
  ServicosAdminController,
  UsuariosAdminController,
} from './admin/admin.controller';
import { ConteudosAdminController } from './admin/conteudos.controller';
import { DuvidasAdminController } from './admin/duvidas.controller';
import { AuthController } from './auth/auth.controller';
import { CoreModule } from './core.module';
import { opcoesBanco } from './database';
import { EventosAdminController, EventosPublicosController } from './eventos/eventos.controller';
import { EventosService } from './eventos/eventos.service';
import { NfseAdminController, NfsePublicoController } from './nfse/nfse.controller';
import { CgibsService } from './noticias/cgibs.service';
import { NoticiasAdminController, NoticiasPublicasController } from './noticias/noticias.controller';
import { DuvidasPublicasController, PublicoController } from './publico/publico.controller';
import { SeedService } from './seed/seed.service';

/** Em produção, serve o build do frontend (../frontend/dist) fora de /api. */
const frontendEstatico: DynamicModule = ServeStaticModule.forRootAsync({
  inject: [ConfigService],
  useFactory: (config: ConfigService) => {
    const raiz = join(__dirname, '..', '..', 'frontend', 'dist');
    if (config.get<string>('NODE_ENV') !== 'production' || !existsSync(raiz)) return [];
    return [{ rootPath: raiz, exclude: ['/api', '/api/(.*)'] }];
  },
});

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true, envFilePath: [join(__dirname, '..', '.env'), '.env'] }),
    TypeOrmModule.forRootAsync({ inject: [ConfigService], useFactory: opcoesBanco }),
    ScheduleModule.forRoot(),
    CoreModule,
    frontendEstatico,
  ],
  controllers: [
    PublicoController,
    DuvidasPublicasController,
    NoticiasPublicasController,
    EventosPublicosController,
    NfsePublicoController,
    AuthController,
    ResumoController,
    NoticiasAdminController,
    PrazosAdminController,
    ConteudosAdminController,
    DuvidasAdminController,
    UsuariosAdminController,
    EventosAdminController,
    NfseAdminController,
    ServicosAdminController,
    ConfigAdminController,
  ],
  providers: [SeedService, CgibsService, EventosService],
})
export class AppModule {}
