import { Injectable, Logger } from '@nestjs/common';
import { WhatsAppAPIMessagingChannel } from './whatsapp-api.channel';
import { envs } from '../../../../config/envs';

@Injectable()
export class WhatsAppAPIService {
  private readonly logger = new Logger(WhatsAppAPIService.name);
  private readonly whatsappChannel: WhatsAppAPIMessagingChannel;

  constructor() {
    this.whatsappChannel = new WhatsAppAPIMessagingChannel('WHATSAPP_API');
  }

  /**
   * Verifica si WhatsApp Business API está configurado y funcionando
   */
  async isConfigured(): Promise<boolean> {
    try {
      return await this.whatsappChannel.verifyConfiguration();
    } catch (error) {
      this.logger.error('Error al verificar configuración de WhatsApp API:', error);
      return false;
    }
  }

  /**
   * Envía un mensaje de prueba
   */
  async sendTestMessage(to: string, message?: string): Promise<void> {
    try {
      await this.whatsappChannel.sendTestMessage(to, message);
      this.logger.log(`Mensaje de prueba enviado exitosamente a ${to}`);
    } catch (error) {
      this.logger.error(`Error al enviar mensaje de prueba a ${to}:`, error);
      throw error;
    }
  }

  /**
   * Obtiene el estado de la configuración de WhatsApp Business API
   */
  async getConfigurationStatus() {
    const isConfigured = await this.isConfigured();
    
    return {
      enabled: envs.WHATSAPP_API_ENABLED,
      configured: isConfigured,
      hasToken: !!envs.WHATSAPP_API_TOKEN,
      hasPhoneNumberId: !!envs.WHATSAPP_API_PHONE_NUMBER_ID,
      hasBusinessAccountId: !!envs.WHATSAPP_API_BUSINESS_ACCOUNT_ID,
      status: this.getStatusMessage(isConfigured),
    };
  }

  /**
   * Obtiene un mensaje descriptivo del estado
   */
  private getStatusMessage(isConfigured: boolean): string {
    if (!envs.WHATSAPP_API_ENABLED) {
      return 'WhatsApp Business API está deshabilitado';
    }
    
    if (!envs.WHATSAPP_API_TOKEN) {
      return 'Falta configurar WHATSAPP_API_TOKEN';
    }
    
    if (!envs.WHATSAPP_API_PHONE_NUMBER_ID) {
      return 'Falta configurar WHATSAPP_API_PHONE_NUMBER_ID';
    }
    
    if (!envs.WHATSAPP_API_BUSINESS_ACCOUNT_ID) {
      return 'Falta configurar WHATSAPP_API_BUSINESS_ACCOUNT_ID';
    }
    
    if (isConfigured) {
      return 'WhatsApp Business API está configurado y funcionando correctamente';
    }
    
    return 'WhatsApp Business API está configurado pero hay un error en la conexión';
  }

  /**
   * Verifica la conectividad con WhatsApp Business API
   */
  async verifyConnectivity(): Promise<{ success: boolean; message: string }> {
    try {
      const isConfigured = await this.isConfigured();
      
      if (isConfigured) {
        return {
          success: true,
          message: 'Conexión exitosa con WhatsApp Business API'
        };
      } else {
        return {
          success: false,
          message: 'No se pudo conectar con WhatsApp Business API. Verifica la configuración.'
        };
      }
    } catch (error: any) {
      return {
        success: false,
        message: `Error de conectividad: ${error.message}`
      };
    }
  }
}

