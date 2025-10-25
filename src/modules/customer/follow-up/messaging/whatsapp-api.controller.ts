import { Controller, Post, Get, Body, HttpException, HttpStatus } from '@nestjs/common';
import { WhatsAppAPIService } from './whatsapp-api.service';

interface TestMessageDto {
  to: string;
  message?: string;
}

@Controller('whatsapp-api')
export class WhatsAppAPIController {
  constructor(private readonly whatsappAPIService: WhatsAppAPIService) {}

  /**
   * Obtiene el estado de la configuración de WhatsApp Business API
   */
  @Get('status')
  async getStatus() {
    try {
      return await this.whatsappAPIService.getConfigurationStatus();
    } catch (error: any) {
      throw new HttpException(
        `Error al obtener el estado: ${error.message}`,
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  /**
   * Envía un mensaje de prueba
   */
  @Post('test')
  async sendTestMessage(@Body() body: TestMessageDto) {
    try {
      if (!body.to) {
        throw new HttpException(
          'El campo "to" es requerido',
          HttpStatus.BAD_REQUEST
        );
      }

      await this.whatsappAPIService.sendTestMessage(body.to, body.message);
      
      return { 
        success: true,
        message: 'Mensaje de prueba enviado correctamente',
        to: body.to
      };
    } catch (error: any) {
      throw new HttpException(
        `Error al enviar mensaje de prueba: ${error.message}`,
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  /**
   * Verifica la configuración y conectividad
   */
  @Get('verify')
  async verifyConfiguration() {
    try {
      const connectivity = await this.whatsappAPIService.verifyConnectivity();
      const status = await this.whatsappAPIService.getConfigurationStatus();
      
      return {
        ...status,
        connectivity,
        timestamp: new Date().toISOString()
      };
    } catch (error: any) {
      throw new HttpException(
        `Error al verificar configuración: ${error.message}`,
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  /**
   * Endpoint de salud para monitoreo
   */
  @Get('health')
  async healthCheck() {
    try {
      const isConfigured = await this.whatsappAPIService.isConfigured();
      
      return {
        status: isConfigured ? 'healthy' : 'unhealthy',
        service: 'WhatsApp Business API',
        timestamp: new Date().toISOString(),
        configured: isConfigured
      };
    } catch (error: any) {
      return {
        status: 'unhealthy',
        service: 'WhatsApp Business API',
        timestamp: new Date().toISOString(),
        error: error.message
      };
    }
  }
}

