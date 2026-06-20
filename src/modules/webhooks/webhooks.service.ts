import { Injectable, Logger } from '@nestjs/common';
import { SatisfactionService } from '../satisfaction/satisfaction.service';

// Valores que el Flow puede mandar que difieren del enum del schema
const VALORACION_MAP: Record<string, string> = {
  CALIDAD: 'CALIDAD',
  PRECIO_CALIDAD: 'CALIDAD',
  TIEMPO_ENTREGA: 'TIEMPO_ENTREGA',
  ATENCION: 'ATENCION',
  RESOLUCION_INCONVENIENTES: 'RESOLUCION_INCONVENIENTES',
};

const INCONVENIENTES_MAP: Record<string, string> = {
  EXCELENTE: 'EXCELENTE',
  BUENA: 'BUENA',
  BUENO: 'BUENA',
  MALA: 'MALA',
  MALO: 'MALA',
  N_A: 'N_A',
};

@Injectable()
export class WebhooksService {
  private readonly logger = new Logger(WebhooksService.name);

  constructor(private readonly satisfactionService: SatisfactionService) {}

  async processYCloudEvent(body: any): Promise<void> {
    this.logger.log(
      `YCloud event: type=${body?.type} | msg.type=${body?.data?.message?.type} | interactive.type=${body?.data?.message?.interactive?.type} | context.type=${body?.data?.message?.interactive?.context?.type}`,
    );

    if (body?.type !== 'whatsapp.inbound_message.received') {
      this.logger.warn(`Event ignorado: ${body?.type}`);
      return;
    }

    const message = body?.data?.message;

    // YCloud no incluye message.type — el campo interactive está directo en el message
    const interactive = message?.interactive;
    if (!interactive) {
      this.logger.warn(`Mensaje ignorado (sin campo interactive): ${JSON.stringify(Object.keys(message ?? {}))}`);
      return;
    }

    const nfmReply = interactive?.nfm_reply;
    if (interactive?.type !== 'nfm_reply' || nfmReply?.name !== 'flow') {
      this.logger.warn(
        `Interactive ignorado: type=${interactive?.type} nfm_reply.name=${nfmReply?.name}`,
      );
      return;
    }

    // YCloud: message.from = teléfono del cliente (quien completó el flow)
    const phone: string = message.from ?? message.to;

    let responseJson: Record<string, any>;
    try {
      responseJson = JSON.parse(nfmReply.response_json);
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
      valoracion: VALORACION_MAP[responseJson.factorImportante] ?? undefined,
      anteInconvenientes: INCONVENIENTES_MAP[responseJson.anteInconvenientes] ?? undefined,
      porQueNosCompra: responseJson.porQueNosCompra,
      comentarios: responseJson.comentarios,
      source: 'FLOW',
    } as any);

    this.logger.log(`Encuesta guardada desde Flow | Tel: ${phone} | Nombre: ${responseJson.nombre}`);
  }
}
