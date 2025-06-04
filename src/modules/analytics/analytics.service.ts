import { Inject, Injectable, InternalServerErrorException } from '@nestjs/common';
import { CreateAnalyticsDto } from './dto/create-analytics.dto';
import { UpdateAnalyticsDto } from './dto/update-analytics.dto';
import mongoose, { Model } from 'mongoose';
import { Client } from '../customer/schema/customer.schema';
import { ChannelData, ProductData, TimePoint } from './interface/analytics.interface';

@Injectable()
export class AnalyticsService {
  constructor(
    @Inject('CLIENT_MODEL')
    private readonly clientModel: Model<Client>,
  ) {}

  /**
   * Devuelve:
   *  - totalContacts: número total de documentos en la colección clients
   *  - byChannel: arreglo de { channel, total }, agrupado por medioAdquisicion
   */
  async totales(): Promise<{ totalContacts: number; byChannel: ChannelData[] }> {
    try {
      // 1) Cuenta total de clientes
      const totalContacts = await this.clientModel.countDocuments().exec();

      // 2) Agrupación por medioAdquisicion
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
   * contando cuántos clientes se crearon en cada mes de 2025.
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

      // Si quisieras asegurar que haya entrada para cada mes (incluso con total=0), podrías
      // post-procesar aquí. Dejo la versión básica.
      return result.map((item) => ({
        date: item.date,
        total: item.total,
      }));
    } catch (err) {
      console.error('Error en AnalyticsService.evolution:', err);
      throw new InternalServerErrorException('Error al obtener evolución de clientes');
    }
  }

  /**
   * Retorna un arreglo de los productos más consultados/comprados:
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
}