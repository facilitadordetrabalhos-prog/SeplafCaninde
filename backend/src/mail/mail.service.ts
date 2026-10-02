import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';

export interface Email {
  to: string;
  subject: string;
  text: string;
  html?: string;
}

@Injectable()
export class MailService {
  private readonly logger = new Logger('E-mail');
  private transporter: nodemailer.Transporter | null = null;
  private readonly from: string;

  constructor(config: ConfigService) {
    const host = config.get<string>('SMTP_HOST');
    this.from = config.get<string>('SMTP_FROM') || 'Secretaria de Finanças de Canindé <nao-responda@localhost>';
    if (host) {
      const port = Number(config.get('SMTP_PORT') || 587);
      const user = config.get<string>('SMTP_USER');
      this.transporter = nodemailer.createTransport({
        host,
        port,
        secure: port === 465,
        auth: user ? { user, pass: config.get<string>('SMTP_PASS') } : undefined,
      });
    }
  }

  /** Envia o e-mail (ou apenas registra no log sem SMTP). Nunca lança exceção; retorna sucesso. */
  async enviar(email: Email): Promise<boolean> {
    if (!this.transporter) {
      this.logger.log(`[sem SMTP] Para: ${email.to} | Assunto: ${email.subject}\n${email.text}`);
      return true;
    }
    try {
      await this.transporter.sendMail({ from: this.from, ...email });
      this.logger.log(`Enviado para ${email.to}: ${email.subject}`);
      return true;
    } catch (e) {
      this.logger.error(`Falha ao enviar para ${email.to}: ${(e as Error).message}`);
      return false;
    }
  }
}
