import { Injectable, Logger } from '@nestjs/common';
import { SatisfactionService } from '../satisfaction/satisfaction.service';

@Injectable()
export class WebhooksService {
  private readonly logger = new Logger(WebhooksService.name);

  constructor(private readonly satisfactionService: SatisfactionService) {}

  async processYCloudEvent(body: any): Promise<void> {
    if (body?.type !== 'whatsapp.inbound_message.received') return;

    const message = body?.data?.message;
    if (message?.type !== 'interactive') return;

    const interactive = message?.interactive;
    if (interactive?.type !== 'nfm_reply' || interactive?.nfm_reply?.name !== 'flow') return;

    const phone: string = message.from;

    let responseJson: Record<string, any>;
    try {
      responseJson = JSON.parse(interactive.nfm_reply.response_json);
    } catch {
      this.logger.error('No se pudo parsear response_json del flow');
      return;
    }

    const n = (v: any): number | undefined => {
      const parsed = parseFloat(v);
      return isNaN(parsed) ? undefined : parsed;
    };

    await this.satisfactionService.create({
      phone,
      name: responseJson.nombre,
      comoNosConocio: responseJson.comoNosConocio,
      calidad: n(responseJson.calidad),
      relacionPrecioCalidad: n(responseJson.relacionPrecioCalidad),
      tiempoForme: n(responseJson.tiempoEntrega),
      atencionComercial: n(responseJson.atencionComercial),
      atencionAdmin: n(responseJson.atencionAdmin),
      nps: n(responseJson.nps),
      valoracion: responseJson.factorImportante,
      anteInconvenientes: responseJson.anteInconvenientes,
      porQueNosCompra: responseJson.porQueNosCompra,
      comentarios: responseJson.comentarios,
      source: 'FLOW',
    } as any);

    this.logger.log(`Encuesta de satisfacción guardada desde Flow | Tel: ${phone}`);
  }
}
