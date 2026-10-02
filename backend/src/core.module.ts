import { Global, Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JwtAuthGuard, PerfisGuard } from './common/auth';
import { ConfigStore } from './common/config-store.service';
import { ProtocoloService } from './common/protocolo.service';
import { ENTIDADES } from './entities';
import { MailService } from './mail/mail.service';

@Global()
@Module({
  imports: [
    TypeOrmModule.forFeature(ENTIDADES),
    JwtModule.registerAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        secret: config.getOrThrow<string>('JWT_SECRET'),
        signOptions: { expiresIn: config.get<string>('JWT_EXPIRES_IN') || '12h' },
      }),
    }),
  ],
  providers: [ConfigStore, ProtocoloService, MailService, JwtAuthGuard, PerfisGuard],
  exports: [TypeOrmModule, JwtModule, ConfigStore, ProtocoloService, MailService, JwtAuthGuard, PerfisGuard],
})
export class CoreModule {}
