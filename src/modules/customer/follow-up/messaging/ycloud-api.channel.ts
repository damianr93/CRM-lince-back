import { Logger } from '@nestjs/common';
import { MessageChannelType } from '../follow-up.types';
import { MessagePayload, MessagingChannel } from './message-channel.interface';
import { envs } from '../../../../config/envs';

/**
 * Canal de YCloud WhatsApp API
 *
 * Para usar este canal:
 * 1. Configura las variables de entorno en .env:
 *    - YCLOUD_API_KEY=tu_token_de_ycloud
 *    - YCLOUD_BASE_URL=https://api.ycloud.com/v2
 *    - YCLOUD_ENABLED=true
 *    - YCLOUD_EZEQUIEL_PHONE=whatsapp:+1234567890
 *    - YCLOUD_DENIS_PHONE=whatsapp:+0987654321
 *    - YCLOUD_MARTIN_PHONE=whatsapp:+1122334455
 *
 * 2. El canal se activa automáticamente cuando YCLOUD_ENABLED=true
 *
 * Documentación: https://docs.ycloud.com/reference/introduction
 */
export class YCloudMessagingChannel implements MessagingChannel {
  private readonly logger: Logger;
  private readonly apiKey: string;
  private readonly baseUrl: string;

  constructor(public readonly type: MessageChannelType) {
    this.logger = new Logger(`YCloudMessagingChannel:${type}`);
    this.apiKey = envs.YCLOUD_API_KEY;
    this.baseUrl = envs.YCLOUD_BASE_URL;
  }

  async send(payload: MessagePayload): Promise<void> {
    try {
      if (!this.isConfigured()) {
        throw new Error(
          'YCloud API no está configurado. Verifica las variables de entorno.',
        );
      }

      // Determinar el número origen basado en el asesor
      const fromNumber = this.getAdvisorPhoneNumber(
        payload.metadata?.advisor as string,
      );

      if (!fromNumber) {
        throw new Error(
          `No hay número configurado para el asesor: ${payload.metadata?.advisor}`,
        );
      }

      // Formatear número de destino
      const formattedNumber = this.formatPhoneNumber(payload.recipient);

      if (!formattedNumber) {
        throw new Error(`Número de teléfono inválido: ${payload.recipient}`);
      }

      // Intentar enviar mensaje
      await this.sendWhatsAppMessage(fromNumber, formattedNumber, payload.body);

      this.logger.log(
        `YCloud WhatsApp enviado exitosamente desde ${fromNumber} a ${formattedNumber} | Asesor: ${payload.metadata?.advisor}`,
      );
    } catch (error: any) {
      this.logger.error(
        `Error al enviar YCloud WhatsApp a ${payload.recipient}: ${error.message}`,
        error.stack,
      );
      // Notificar al asesor sobre el fallo
      await this.notifyAdvisorOfFailure(payload, error);

      throw error;
    }
  }

  private isConfigured(): boolean {
    return !!(this.apiKey && this.baseUrl);
  }

  private getAdvisorPhoneNumber(advisor?: string): string | null {
    const advisorPhones = {
      EZEQUIEL: envs.YCLOUD_EZEQUIEL_PHONE,
      DENIS: envs.YCLOUD_DENIS_PHONE,
      MARTIN: envs.YCLOUD_MARTIN_PHONE,
    };

    return advisorPhones[advisor] || null;
  }

  private getAdvisorEmail(advisor?: string): string | null {
    const advisorEmails = {
      EZEQUIEL: envs.FOLLOW_UP_NOTIFY_EZEQUIEL_EMAIL,
      DENIS: envs.FOLLOW_UP_NOTIFY_DENIS_EMAIL,
      MARTIN: envs.FOLLOW_UP_NOTIFY_MARTIN_EMAIL,
    };

    return advisorEmails[advisor] || null;
  }

  private formatPhoneNumber(phone: string): string | null {
    // Remover caracteres no numéricos
    const cleaned = phone.replace(/\D/g, '');

    // Validar formato básico
    if (cleaned.length < 10) {
      return null;
    }

    // Agregar código de país si no lo tiene (Argentina)
    if (cleaned.length === 10) {
      return `+54${cleaned}`;
    }

    return `+${cleaned}`;
  }

  private async sendWhatsAppMessage(
    fromNumber: string,
    toNumber: string,
    message: string,
  ): Promise<void> {
    try {
      // Intentar enviar mensaje https://api.ycloud.com/v2/whatsapp/messages/sendDirectly
      const response = await fetch(`${this.baseUrl}/whatsapp/messages/sendDirectly`, {
        method: 'POST',
        headers: {
          'X-API-Key': this.apiKey,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          from: fromNumber,
          to: toNumber,
          type: "text",
          text: { body: message },
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();

        // Si es error de contacto no encontrado, crear contacto y reintentar
        if (this.isContactNotFoundError(errorData)) {
          await this.createContact(toNumber);

          // Reintentar envío
          const retryResponse = await fetch(
            `${this.baseUrl}/whatsapp/messages/sendDirectly`,
            {
              method: 'POST',
              headers: {
                'X-API-Key': this.apiKey,
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                from: fromNumber,
                type: "text",
                to: toNumber,
                text: { body: message },
              }),
            },
          );

          if (!retryResponse.ok) {
            throw new Error(
              `Error al reintentar envío: ${retryResponse.statusText}`,
            );
          }
        } else {
          throw new Error(
            `Error de YCloud: ${errorData.message || response.statusText}`,
          );
        }
      }
    } catch (error) {
      this.logger.error(`Error en sendWhatsAppMessage: ${error.message}`);
      throw error;
    }
  }

  private async createContact(phoneNumber: string): Promise<void> {
    try {
      const response = await fetch(`${this.baseUrl}/contacts`, {
        method: 'POST',
        headers: {
          'X-API-Key': this.apiKey,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          phone: phoneNumber,
        }),
      });

      if (!response.ok) {
        throw new Error(`Error al crear contacto: ${response.statusText}`);
      }

      this.logger.log(`Contacto creado exitosamente: ${phoneNumber}`);
    } catch (error) {
      this.logger.error(
        `Error al crear contacto ${phoneNumber}: ${error.message}`,
      );
      throw error;
    }
  }

  private isContactNotFoundError(errorData: any): boolean {
    // Basado en la documentación de YCloud, verificar si es error de contacto no encontrado
    return (
      errorData.code === 'CONTACT_NOT_FOUND' ||
      errorData.message?.includes('contact not found') ||
      errorData.message?.includes('Contact not found')
    );
  }

  private async notifyAdvisorOfFailure(
    payload: MessagePayload,
    error: any,
  ): Promise<void> {
    try {
      const advisor = payload.metadata?.advisor as string;
      const advisorEmail = this.getAdvisorEmail(advisor);

      if (!advisorEmail) {
        this.logger.warn(
          `No se encontró email para notificar al asesor: ${advisor}`,
        );
        return;
      }

      // Crear mensaje de notificación
      const notificationSubject = `❌ Fallo en envío de WhatsApp - Cliente: ${payload.metadata?.customerName || 'N/A'}`;
      const notificationBody = this.buildFailureNotificationMessage(
        payload,
        error,
      );

      // Enviar notificación por email interno
      const notificationPayload: MessagePayload = {
        recipient: advisorEmail,
        body: notificationBody,
        subject: notificationSubject,
        metadata: {
          type: 'WHATSAPP_FAILURE_NOTIFICATION',
          originalCustomerId: payload.metadata?.customerId,
          advisor: advisor,
          error: error.message,
        },
      };

      // Usar el canal de email interno para enviar la notificación
      const { InternalEmailChannel } = await import('./internal-email.channel');
      const emailChannel = new InternalEmailChannel('INTERNAL_EMAIL');

      await emailChannel.send(notificationPayload);

      this.logger.log(
        `Notificación de fallo enviada al asesor ${advisor} en ${advisorEmail}`,
      );
    } catch (notificationError) {
      this.logger.error(
        `Error al notificar al asesor sobre el fallo: ${notificationError.message}`,
      );
    }
  }

  private buildFailureNotificationMessage(
    payload: MessagePayload,
    error: any,
  ): string {
    const customerName = payload.metadata?.customerName || 'N/A';
    const customerLastName = payload.metadata?.customerLastName || '';
    const customerPhone = payload.recipient;
    const advisor = payload.metadata?.advisor || 'N/A';
    const errorMessage = error.message || 'Error desconocido';
    const timestamp = new Date().toLocaleString('es-AR');

    return `
🚨 FALLO EN ENVÍO DE WHATSAPP

📅 Fecha y Hora: ${timestamp}
👤 Asesor: ${advisor}
👥 Cliente: ${customerName} ${customerLastName}
📱 Teléfono: ${customerPhone}
❌ Error: ${errorMessage}

📋 Detalles del Mensaje:
${payload.body}

🔧 Acción Requerida:
Por favor, revisa el estado del cliente y contacta manualmente si es necesario.

---
Sistema LinceCRM - Notificación Automática
    `.trim();
  }
}
