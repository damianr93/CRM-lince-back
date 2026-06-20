import { BadRequestException, Inject, Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { CreateSatisfactionDto } from './dto/create-satisfaction.dto';
import { UpdateSatisfactionDto } from './dto/update-satisfaction.dto';
import { Model } from 'mongoose';
import { Satisfaction } from './schema/satisfaction.schema';

@Injectable()
export class SatisfactionService {

  constructor(
    @Inject('SATISFACTION_MODEL') private readonly satisfactionModel: Model<Satisfaction>,
  ){}

  async create(createSatisfactionDto: CreateSatisfactionDto) {
    try {
      return await this.satisfactionModel.create(createSatisfactionDto);
    } catch (error) {
      throw new InternalServerErrorException('Error al cargar la respuesta de satisfacción');
    }
  }

  async findAll(): Promise<any[]> {
    try {
      return await this.satisfactionModel.find().lean().sort({ createdAt: -1 });
    } catch (error) {
      throw new InternalServerErrorException('Error al obtener las respuestas de satisfacción');
    }
  }

  async findOne(id: string): Promise<any> {
    try {
      const satisfaction = await this.satisfactionModel.findById(id).lean();
      if (!satisfaction) throw new NotFoundException('Respuesta de satisfacción no encontrada');
      return satisfaction;
    } catch (error) {
      if (error instanceof NotFoundException || error instanceof BadRequestException) throw error;
      throw new InternalServerErrorException('Error al obtener la respuesta de satisfacción');
    }
  }

  async update(id: string, updateSatisfactionDto: UpdateSatisfactionDto): Promise<any> {
    try {
      const updatedSatisfaction = await this.satisfactionModel.findByIdAndUpdate(id, updateSatisfactionDto, { new: true }).lean();
      if (!updatedSatisfaction) throw new NotFoundException('Respuesta de satisfacción no encontrada');
      return updatedSatisfaction;
    } catch (error) {
      if (error instanceof NotFoundException || error instanceof BadRequestException) throw error;
      throw new InternalServerErrorException('Error al actualizar la respuesta de satisfacción');
    }
  }

  async remove(id: string) {
    try {
      const deletedSatisfaction = await this.satisfactionModel.findByIdAndDelete(id);
      if (!deletedSatisfaction) throw new NotFoundException('Respuesta de satisfacción no encontrada');
      return { message: 'Respuesta de satisfacción eliminada correctamente' };
    } catch (error) {
      if (error instanceof NotFoundException || error instanceof BadRequestException) throw error;
      throw new InternalServerErrorException('Error al eliminar la respuesta de satisfacción');
    }
  }
}
