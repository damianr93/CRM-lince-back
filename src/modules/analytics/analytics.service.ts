import { Inject, Injectable, InternalServerErrorException } from '@nestjs/common';
import { CreateAnalyticsDto } from './dto/create-analytics.dto';
import { UpdateAnalyticsDto } from './dto/update-analytics.dto';
import mongoose, { Model } from 'mongoose';
import { Client } from '../customer/schema/customer.schema';
import { ChannelData, ProductData, TimePoint } from './interface/analytics.interface';
import { FollowUpEventsService } from '../customer/follow-up/follow-up-events.service';
import {
  FollowUpEventStatus,
} from '../customer/follow-up/follow-up-event.schema';
import { MessageChannelType } from '../customer/follow-up/follow-up.types';

type FollowUpEventView = {
  id: string;
  customerName?: string;
  customerLastName?: string;
  assignedTo?: string;
  customerPhone?: string;
  product?: string;
  triggerStatus: string;
  templateId: string;
  message: string;
  channels: MessageChannelType[];
  contactValue?: string | null;
  scheduledFor: string;
  status: FollowUpEventStatus;
  readyAt?: string | null;
  createdAt: string;
  completedAt?: string | null;
  notes?: string | null;
};

@Injectable()
export class AnalyticsService {
  constructor(
    @Inject('CLIENT_MODEL')
    private readonly clientModel: Model<Client>,
    private readonly followUpEventsService: FollowUpEventsService,
  ) {}

  /**
   * Devuelve:
   *  - totalContacts: nÃºmero total de documentos en la colecciÃ³n clients
   *  - byChannel: arreglo de { channel, total }, agrupado por medioAdquisicion
   */
  async totales(): Promise<{ totalContacts: number; byChannel: ChannelData[] }> {
    try {
      // 1) Cuenta total de clientes
      const totalContacts = await this.clientModel.countDocuments().exec();

      // 2) AgrupaciÃ³n por medioAdquisicion
      const aggregation: Array<{ _id: string; count: number }> = await this.clientModel
        .aggregate([
          {
            $group: {
              _id: '$medioAdquisicion',
              count: { $sum: 1 },
            },
          },
          {
            $sort: { count: -1 }, // opcional: ordenar de mayor a menor
          },
        ])
        .exec();

      const byChannel: ChannelData[] = aggregation.map((entry) => ({
        channel: entry._id || 'OTRO',
        total: entry.count,
      }));

      return { totalContacts, byChannel };
    } catch (err) {
      console.error('Error en AnalyticsService.totales:', err);
      throw new InternalServerErrorException('Error al obtener totales de clientes');
    }
  }

  /**
   * Retorna un arreglo de { date: "YYYY-MM", total }, 
   * contando cuÃ¡ntos clientes se crearon en cada mes de 2025.
   */
  async evolution(): Promise<TimePoint[]> {
    try {
      // Podemos parametrizar el rango, pero de momento fija 2025.
      const startOfYear = new Date('2025-01-01T00:00:00.000Z');
      const endOfYear = new Date('2025-12-31T23:59:59.999Z');

      const pipeline: mongoose.PipelineStage[] = [
        {
          $match: {
            createdAt: {
              $gte: startOfYear,
              $lt: endOfYear,
            },
          },
        },
        {
          $group: {
            _id: {
              year: { $year: '$createdAt' },
              month: { $month: '$createdAt' },
            },
            count: { $sum: 1 },
          },
        },
        {
          $sort: { '_id.year': 1, '_id.month': 1 },
        },
        {
          $project: {
            _id: 0,
            date: {
              $concat: [
                { $toString: '$_id.year' },
                '-',
                {
                  $cond: [
                    { $lt: ['$_id.month', 10] },
                    { $concat: ['0', { $toString: '$_id.month' }] },
                    { $toString: '$_id.month' },
                  ],
                },
              ],
            },
            total: '$count',
          },
        },
      ];

      const result: Array<{ date: string; total: number }> = await this.clientModel
        .aggregate(pipeline)
        .exec();

      // Si quisieras asegurar que haya entrada para cada mes (incluso con total=0), podrÃ­as
      // post-procesar aquÃ­. Dejo la versiÃ³n bÃ¡sica.
      return result.map((item) => ({
        date: item.date,
        total: item.total,
      }));
    } catch (err) {
      console.error('Error en AnalyticsService.evolution:', err);
      throw new InternalServerErrorException('Error al obtener evoluciÃ³n de clientes');
    }
  }

  /**
   * Retorna un arreglo de los productos mÃ¡s consultados/comprados:
   *  { product, total } ordenado de mayor a menor en base a la cuenta de clientes asociados a cada producto.
   */
  async demandOfProduct(): Promise<ProductData[]> {
    try {
      const aggregation: Array<{ _id: string; count: number }> = await this.clientModel
        .aggregate([
          {
            $group: {
              _id: '$producto',
              count: { $sum: 1 },
            },
          },
          {
            $sort: { count: -1 },
          },
          {
            $limit: 10, // opcional: solo top 10
          },
        ])
        .exec();

      const result: ProductData[] = aggregation.map((entry) => ({
        product: entry._id || 'Desconocido',
        total: entry.count,
      }));

      return result;
    } catch (err) {
      console.error('Error en AnalyticsService.demandOfProduct:', err);
      throw new InternalServerErrorException('Error al obtener demanda de productos');
    }
  }

  async purchaseStatus(): Promise<{ status: string; total: number; percentage: number }[]> {
  try {
    const aggregation: Array<{ _id: string; count: number }> = await this.clientModel
      .aggregate([
        {
          $group: {
            _id: '$estado',
            count: { $sum: 1 },
          },
        },
        {
          $sort: { count: -1 },
        },
      ])
      .exec();

    const totalClients = await this.clientModel.countDocuments().exec();

    const statusMap = {
      'COMPRO': 'Compras',
      'NO_COMPRO': 'No Compras', 
      'PENDIENTE': 'Pendientes',
    };

    const statusCount = {
      'Compras': 0,
      'No Compras': 0,
      'Pendientes': 0,
    };

    aggregation.forEach((entry) => {
      const normalizedStatus = statusMap[entry._id] || 'Pendientes';
      statusCount[normalizedStatus] += entry.count;
    });

    const result = Object.entries(statusCount).map(([status, total]) => ({
      status,
      total,
      percentage: totalClients > 0 ? Math.round((total / totalClients) * 100) : 0,
    }));

    return result;
  } catch (err) {
    console.error('Error en AnalyticsService.purchaseStatus:', err);
    throw new InternalServerErrorException('Error al obtener estado de compras');
  }
}

  async followUpEvents(assignedTo?: string, statusesParam?: string): Promise<FollowUpEventView[]> {
    try {
      let statuses: FollowUpEventStatus[] = ['READY'];

      if (statusesParam) {
        const parsed = statusesParam
          .split(',')
          .map((status) => status.trim().toUpperCase())
          .filter((status): status is FollowUpEventStatus =>
            ['READY', 'COMPLETED', 'CANCELLED', 'SCHEDULED'].includes(status),
          );

        if (parsed.length > 0) {
          statuses = parsed;
        }
      }

      const events = await this.followUpEventsService.getEventsByStatus(
        statuses,
        100,
        assignedTo,
      );

      return events.map((event) => ({
        id: event._id.toString(),
        customerName: event.customerName,
        customerLastName: event.customerLastName,
        assignedTo: event.assignedTo,
        customerPhone: event.customerPhone,
        product: event.product,
        triggerStatus: event.triggerStatus,
        templateId: event.templateId,
        message: event.message,
        channels: event.channels as MessageChannelType[],
        contactValue: event.contactValue ?? null,
        scheduledFor: new Date(event.scheduledFor).toISOString(),
        status: event.status as FollowUpEventStatus,
        readyAt: event.readyAt ? new Date(event.readyAt).toISOString() : null,
        createdAt: event.createdAt
          ? new Date(event.createdAt).toISOString()
          : new Date(event.scheduledFor).toISOString(),
        completedAt: event.completedAt ? new Date(event.completedAt).toISOString() : null,
        notes: event.notes ?? null,
      }));
    } catch (err) {
      console.error('Error en AnalyticsService.followUpEvents:', err);
      throw new InternalServerErrorException('Error al obtener eventos de seguimiento');
    }
  }
}

