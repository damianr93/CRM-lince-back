import { Logger } from '@nestjs/common';
import * as nodemailer from 'nodemailer';
import { MessagePayload, MessagingChannel } from './message-channel.interface';
import { envs } from '../../../../config/envs';

export class InternalEmailChannel implements MessagingChannel {
  private readonly logger: Logger;
  private readonly transporter: nodemailer.Transporter | null;

  constructor(public readonly type: 'INTERNAL_EMAIL') {
    this.logger = new Logger(`InternalEmailChannel`);
    
    // Verificar si hay configuración de email
    if (!this.isEmailConfigured()) {
      this.logger.warn('Configuración de email no encontrada. Correos internos no estarán disponibles.');
      this.transporter = null;
      return;
    }

    // Crear transporter de nodemailer
    this.transporter = nodemailer.createTransport({
      host: envs.MAILER_HOST,
      port: envs.MAILER_PORT,
      secure: envs.MAILER_SECURE, // true para 465, false para otros puertos
      auth: {
        user: envs.MAILER_EMAIL,
        pass: envs.MAILER_SECRET_KEY,
      },
    });
    
    this.logger.log('Transporter de correos internos inicializado correctamente');
  }

  private isEmailConfigured(): boolean {
    return !!(
      envs.MAILER_HOST &&
      envs.MAILER_EMAIL &&
      envs.MAILER_SECRET_KEY
    );
  }

  async send(payload: MessagePayload): Promise<void> {
    try {
      // Verificar si el transporter está configurado
      if (!this.transporter) {
        throw new Error('Transporter de correos internos no está configurado. Verifica las variables de entorno de email.');
      }

      // Validar que el email sea válido
      if (!payload.recipient || !this.isValidEmail(payload.recipient)) {
        throw new Error(`Email inválido: ${payload.recipient}`);
      }

      // Configurar el mensaje
      const mailOptions = {
        from: `"LinceCRM - Sistema Interno" <${envs.MAILER_EMAIL}>`,
        to: payload.recipient,
        subject: payload.subject || 'Notificación Interna - LinceCRM',
        text: payload.body,
        html: this.formatAsHtml(payload.body),
      };

      // Enviar el email
      const info = await this.transporter.sendMail(mailOptions);

      this.logger.log(
        `Correo interno enviado exitosamente a ${payload.recipient} | MessageID: ${info.messageId}`,
      );
    } catch (error: any) {
      this.logger.error(
        `Error al enviar correo interno a ${payload.recipient}: ${error.message}`,
        error.stack,
      );
      throw error;
    }
  }

  private isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  private formatAsHtml(text: string): string {
    // Convertir saltos de línea a <br> y mantener formato básico
    return text
      .replace(/\n/g, '<br>')
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.*?)\*/g, '<em>$1</em>');
  }

  /**
   * Método para verificar la conexión SMTP
   */
  async verifyConnection(): Promise<boolean> {
    try {
      if (!this.transporter) {
        this.logger.warn('Transporter de correos internos no está configurado');
        return false;
      }
      
      await this.transporter.verify();
      this.logger.log('Conexión SMTP de correos internos verificada correctamente');
      return true;
    } catch (error: any) {
      this.logger.error(`Error al verificar conexión SMTP de correos internos: ${error.message}`);
      return false;
    }
  }
}
