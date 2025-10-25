import { Logger } from '@nestjs/common';
import { MessageChannelType } from '../follow-up.types';
import { MessagePayload, MessagingChannel } from './message-channel.interface';
import { envs } from '../../../../config/envs';

/**
 * Canal de WhatsApp Business API (Oficial)
 * 
 * Para usar este canal:
 * 1. Configura las variables de entorno en .env:
 *    - WHATSAPP_API_TOKEN=tu_token_de_whatsapp_business
 *    - WHATSAPP_API_PHONE_NUMBER_ID=tu_phone_number_id
 *    - WHATSAPP_API_BUSINESS_ACCOUNT_ID=tu_business_account_id
 * 
 * 2. Descomenta la línea en channel-config.ts
 * 3. Agrega el canal a messaging.providers.ts
 * 
 * Documentación: https://developers.facebook.com/docs/whatsapp/cloud-api
 */
export class WhatsAppAPIMessagingChannel implements MessagingChannel {
  private readonly logger: Logger;

  constructor(public readonly type: MessageChannelType) {
    this.logger = new Logger(`WhatsAppAPIMessagingChannel:${type}`);
  }

  async send(payload: MessagePayload): Promise<void> {
    try {
      // Verificar configuración
      if (!this.isConfigured()) {
        throw new Error('WhatsApp Business API no está configurado. Verifica las variables de entorno.');
      }

      // Formatear el número de teléfono
      const formattedNumber = this.formatPhoneNumber(payload.recipient);
      
      if (!formattedNumber) {
        throw new Error(`Número de teléfono inválido: ${payload.recipient}`);
      }

      // Enviar mensaje usando WhatsApp Business API
      const response = await this.sendWhatsAppMessage(formattedNumber, payload.body);

      this.logger.log(
        `WhatsApp API enviado exitosamente a ${formattedNumber} | MessageID: ${response.id} | template: ${payload.metadata?.templateId ?? 'n/a'}`,
      );

    } catch (error: any) {
      this.logger.error(
        `Error al enviar WhatsApp API a ${payload.recipient}: ${error.message}`,
        error.stack,
      );
      throw error;
    }
  }

  private isConfigured(): boolean {
    return !!(
      envs.WHATSAPP_API_TOKEN &&
      envs.WHATSAPP_API_PHONE_NUMBER_ID &&
      envs.WHATSAPP_API_BUSINESS_ACCOUNT_ID
    );
  }

  private formatPhoneNumber(phoneNumber: string): string | null {
    try {
      // Limpiar el número (remover espacios, guiones, paréntesis)
      const cleaned = phoneNumber.replace(/[\s\-\(\)]/g, '');
      
      // Si ya tiene formato correcto, devolverlo
      if (cleaned.startsWith('+549') && cleaned.length >= 13) {
        return cleaned;
      }
      
      // Si empieza con +54, devolverlo
      if (cleaned.startsWith('+54')) {
        return cleaned;
      }
      
      // Si es un número argentino sin +54, agregarlo
      if (cleaned.startsWith('54')) {
        return `+${cleaned}`;
      }
      
      // Si es un número local argentino (sin código de país)
      if (cleaned.length >= 10 && !cleaned.startsWith('54')) {
        return `+549${cleaned}`;
      }
      
      // Si no se puede formatear, devolver null
      this.logger.warn(`No se pudo formatear el número de teléfono: ${phoneNumber}`);
      return null;
    } catch (error) {
      this.logger.error(`Error al formatear número de teléfono ${phoneNumber}:`, error);
      return null;
    }
  }

  private async sendWhatsAppMessage(to: string, message: string): Promise<any> {
    const url = `https://graph.facebook.com/v18.0/${envs.WHATSAPP_API_PHONE_NUMBER_ID}/messages`;
    
    const payload = {
      messaging_product: 'whatsapp',
      to: to,
      type: 'text',
      text: {
        body: message
      }
    };

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${envs.WHATSAPP_API_TOKEN}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(`WhatsApp API error: ${errorData.error?.message || 'Unknown error'}`);
    }

    return await response.json();
  }

  /**
   * Método para verificar la configuración
   */
  async verifyConfiguration(): Promise<boolean> {
    try {
      if (!this.isConfigured()) {
        this.logger.warn('WhatsApp Business API no está configurado');
        return false;
      }
      
      // Verificar que el token sea válido haciendo una petición de prueba
      const url = `https://graph.facebook.com/v18.0/${envs.WHATSAPP_API_PHONE_NUMBER_ID}`;
      
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${envs.WHATSAPP_API_TOKEN}`,
        },
      });

      if (response.ok) {
        this.logger.log('WhatsApp Business API verificado correctamente');
        return true;
      } else {
        this.logger.error('Error al verificar WhatsApp Business API');
        return false;
      }
    } catch (error: any) {
      this.logger.error(`Error al verificar configuración de WhatsApp API: ${error.message}`);
      return false;
    }
  }

  /**
   * Método para enviar mensaje de prueba
   */
  async sendTestMessage(to: string, message?: string): Promise<void> {
    const testPayload: MessagePayload = {
      recipient: to,
      body: message || `🧪 MENSAJE DE PRUEBA - WhatsApp Business API LinceCRM

Este es un mensaje de prueba enviado desde el sistema LinceCRM usando WhatsApp Business API.

Fecha: ${new Date().toLocaleString()}
Sistema: Mensajería Automática WhatsApp Business API

Si recibes este mensaje, la configuración de WhatsApp Business API está funcionando correctamente.`,
    };

    await this.send(testPayload);
  }
}
