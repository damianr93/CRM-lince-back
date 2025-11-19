import {
  BadRequestException,
  Inject,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
  Logger,
} from '@nestjs/common';
import { Model } from 'mongoose';
import { Client } from './schema/customer.schema';
import { CustomerFollowUpService } from './follow-up/customer-follow-up.service';
import { CustomerStatus } from './follow-up/follow-up.types';
import { CreateClientDto } from './dto/create-customer.dto';
import { UpdateClientDto } from './dto/update-customer.dto';
import * as ExcelJS from 'exceljs';
import { Response } from 'express';
import { CustomValidators } from '../../common/validators/custom-validators';

@Injectable()
export class ClientsService {
  private readonly logger = new Logger(ClientsService.name);

  constructor(
    @Inject('CLIENT_MODEL') private readonly clientModel: Model<Client>,
    private readonly followUpService: CustomerFollowUpService,
  ) {}

  async create(dto: CreateClientDto) {
    try {
      // Validar datos de entrada
      this.validateClientData(dto);

      // Verificar si ya existe un cliente con el mismo teléfono
      let isReconsulta = false;
      if (dto.telefono) {
        const existingClient = await this.clientModel.findOne({
          telefono: dto.telefono,
        });
        if (existingClient) {
          isReconsulta = true;
          this.logger.log(
            `Reconsulta detectada para el teléfono ${dto.telefono}, cliente original ${existingClient._id}`,
          );
        }
      }

      dto.isReconsulta = isReconsulta;

      const createdCustomer = await this.clientModel.create(dto);

      if (!createdCustomer) {
        throw new BadRequestException('No se pudo crear el cliente');
      }

      this.logger.log(`Cliente creado exitosamente: ${createdCustomer._id}`);

      await this.scheduleFollowUpSafely(createdCustomer as Client, null);

      return createdCustomer;
    } catch (error) {
      if (error instanceof BadRequestException) {
        throw error;
      }
      
      this.logger.error(`Error al crear cliente: ${error.message}`, error.stack);
      
      if (error.name === 'ValidationError') {
        throw new BadRequestException(
          `Datos de cliente inválidos: ${error.message}`
        );
      }
      
      throw new InternalServerErrorException(
        'Error interno al crear el cliente. Por favor, intente nuevamente.'
      );
    }
  }

  async findAll() {
    try {
      const clients = await this.clientModel.find().lean().sort({ createdAt: -1 });
      this.logger.log(`Se obtuvieron ${clients.length} clientes`);
      return clients;
    } catch (error) {
      this.logger.error(`Error al obtener clientes: ${error.message}`, error.stack);
      throw new InternalServerErrorException(
        'Error al cargar la lista de clientes. Por favor, intente nuevamente.'
      );
    }
  }

  async findOne(id: string) {
    try {
      CustomValidators.validateMongoId(id, 'id');
      
      const client = await this.clientModel.findById(id).lean();
      
      if (!client) {
        throw new NotFoundException(`Cliente con ID ${id} no encontrado`);
      }
      
      return client;
    } catch (error) {
      if (error instanceof NotFoundException || error instanceof BadRequestException) {
        throw error;
      }
      
      this.logger.error(`Error al buscar cliente ${id}: ${error.message}`, error.stack);
      throw new InternalServerErrorException(
        'Error al buscar el cliente. Por favor, intente nuevamente.'
      );
    }
  }

  async update(id: string, dto: UpdateClientDto) {
    try {
      CustomValidators.validateMongoId(id, 'id');
      
      // Validar datos de entrada si se proporcionan
      if (Object.keys(dto).length > 0) {
        this.validateClientData(dto, true);
      }

      // Verificar si el teléfono ya existe en otro cliente
      if (dto.telefono) {
        const existingClient = await this.clientModel.findOne({ 
          telefono: dto.telefono,
          _id: { $ne: id }
        });
        if (existingClient) {
          throw new BadRequestException(
            `Ya existe otro cliente con el teléfono ${dto.telefono}`
          );
        }
      }

      const currentClient = await this.clientModel.findById(id).lean();

      if (!currentClient) {
        throw new NotFoundException(`Cliente con ID ${id} no encontrado`);
      }

      const previousStatus = currentClient.estado as CustomerStatus | undefined;

      const updated = await this.clientModel
        .findByIdAndUpdate(id, dto, { new: true, runValidators: true })
        .lean();

      if (!updated) {
        throw new NotFoundException(`Cliente con ID ${id} no encontrado`);
      }

      this.logger.log(`Cliente actualizado exitosamente: ${id}`);

      await this.scheduleFollowUpSafely(updated as Client, previousStatus ?? null);

      return updated;
    } catch (error) {
      if (error instanceof NotFoundException || error instanceof BadRequestException) {
        throw error;
      }
      
      this.logger.error(`Error al actualizar cliente ${id}: ${error.message}`, error.stack);
      
      if (error.name === 'ValidationError') {
        throw new BadRequestException(
          `Datos de cliente inválidos: ${error.message}`
        );
      }
      
      throw new InternalServerErrorException(
        'Error interno al actualizar el cliente. Por favor, intente nuevamente.'
      );
    }
  }

  async remove(id: string) {
    try {
      CustomValidators.validateMongoId(id, 'id');
      
      const deletedClient = await this.clientModel.findByIdAndDelete(id);
      
      if (!deletedClient) {
        throw new NotFoundException(`Cliente con ID ${id} no encontrado`);
      }
      
      this.logger.log(`Cliente eliminado exitosamente: ${id}`);
      return { message: 'Cliente eliminado correctamente', id };
    } catch (error) {
      if (error instanceof NotFoundException || error instanceof BadRequestException) {
        throw error;
      }
      
      this.logger.error(`Error al eliminar cliente ${id}: ${error.message}`, error.stack);
      throw new InternalServerErrorException(
        'Error interno al eliminar el cliente. Por favor, intente nuevamente.'
      );
    }
  }

  /**
   * Normaliza números de teléfono argentinos
   */
  private normalizeArgentinePhone(phone: string): string {
    if (!phone) return phone;
    
    // Remover espacios, guiones y paréntesis
    let cleanPhone = phone.replace(/[\s\-\(\)]/g, '');
    
    // Si empieza con +549, removerlo
    if (cleanPhone.startsWith('+549')) {
      return cleanPhone.substring(4);
    }
    
    // Si empieza con 549, removerlo
    if (cleanPhone.startsWith('549')) {
      return cleanPhone.substring(3);
    }
    
    // Si empieza con +54, removerlo
    if (cleanPhone.startsWith('+54')) {
      return cleanPhone.substring(3);
    }
    
    // Si empieza con 54, removerlo
    if (cleanPhone.startsWith('54')) {
      return cleanPhone.substring(2);
    }
    
    // Si empieza con 0, removerlo (código de área local)
    if (cleanPhone.startsWith('0')) {
      return cleanPhone.substring(1);
    }
    
    return cleanPhone;
  }

  /**
   * Limpia datos del CRM/ManyChat removiendo placeholders y valores inválidos
   */
  private cleanCrmData(value: any): any {
    if (!value || value === null || value === undefined) {
      return null;
    }

    const stringValue = String(value).trim();
    
    // Si está vacío después del trim
    if (stringValue === '') {
      return null;
    }

    // Detectar placeholders de ManyChat/CRM
    if (stringValue.includes('{{cuf_') || 
        stringValue.includes('{{') || 
        stringValue.includes('}}') ||
        stringValue.match(/^\{\{[^}]+\}\}$/)) {
      return null;
    }

    // Detectar otros patrones comunes de placeholders
    if (stringValue.match(/^[a-zA-Z_]+_\d+$/) && stringValue.length > 10) {
      return null;
    }

    // Detectar valores genéricos sin sentido
    const genericValues = [
      'null', 'undefined', 'N/A', 'n/a', 'NA', 'na', 
      'sin datos', 'sin informacion', 'no disponible',
      'placeholder', 'test', 'ejemplo', 'demo'
    ];
    
    if (genericValues.includes(stringValue.toLowerCase())) {
      return null;
    }

    return stringValue;
  }

  /**
   * Valida los datos del cliente
   */
  private validateClientData(dto: any, isUpdate: boolean = false): void {
    // Limpiar y validar nombre (requerido)
    if (dto.nombre !== undefined) {
      dto.nombre = this.cleanCrmData(dto.nombre);
      if (!dto.nombre) {
        throw new BadRequestException('El nombre es requerido y no puede estar vacío');
      }
      dto.nombre = CustomValidators.sanitizeText(dto.nombre);
    }

    // Limpiar apellido (opcional)
    if (dto.apellido !== undefined) {
      dto.apellido = this.cleanCrmData(dto.apellido);
      if (dto.apellido) {
        dto.apellido = CustomValidators.sanitizeText(dto.apellido);
      }
    }

    // Limpiar y validar teléfono (opcional)
    if (dto.telefono !== undefined) {
      dto.telefono = this.cleanCrmData(dto.telefono);
      if (dto.telefono) {
        // Normalizar teléfono argentino antes de validar
        dto.telefono = this.normalizeArgentinePhone(dto.telefono);
        dto.telefono = CustomValidators.validatePhone(dto.telefono);
      }
    }

    // Limpiar y validar email (opcional)
    if (dto.correo !== undefined) {
      dto.correo = this.cleanCrmData(dto.correo);
      if (dto.correo) {
        dto.correo = CustomValidators.validateEmail(dto.correo);
      }
    }

    // Limpiar cabezas (opcional, ahora es string)
    if (dto.cabezas !== undefined) {
      dto.cabezas = this.cleanCrmData(dto.cabezas);
      if (dto.cabezas) {
        dto.cabezas = CustomValidators.sanitizeText(dto.cabezas);
      }
    }

    // Limpiar mesesSuplemento (opcional, ahora es string)
    if (dto.mesesSuplemento !== undefined) {
      dto.mesesSuplemento = this.cleanCrmData(dto.mesesSuplemento);
      if (dto.mesesSuplemento) {
        dto.mesesSuplemento = CustomValidators.sanitizeText(dto.mesesSuplemento);
      }
    }

    // Limpiar y validar actividad (opcional, debe ser una opción válida)
    if (dto.actividad !== undefined) {
      dto.actividad = this.cleanCrmData(dto.actividad);
      if (dto.actividad) {
        const actividadesValidas = ['CRIA', 'RECRIA', 'MIXTO', 'DISTRIBUIDOR'];
        dto.actividad = CustomValidators.validateEnum(dto.actividad, actividadesValidas, 'actividad');
      }
    }

    // Limpiar y validar medioAdquisicion (opcional, debe ser una opción válida)
    if (dto.medioAdquisicion !== undefined) {
      dto.medioAdquisicion = this.cleanCrmData(dto.medioAdquisicion);
      if (dto.medioAdquisicion) {
        const mediosValidos = ['INSTAGRAM', 'WEB', 'WHATSAPP', 'FACEBOOK', 'OTRO'];
        dto.medioAdquisicion = CustomValidators.validateEnum(dto.medioAdquisicion, mediosValidos, 'medioAdquisicion');
      }
    }

    // Limpiar y validar estado (opcional, debe ser una opción válida)
    if (dto.estado !== undefined) {
      dto.estado = this.cleanCrmData(dto.estado);
      if (dto.estado) {
        const estadosValidos = ['PENDIENTE', 'NO_CONTESTO', 'SE_COTIZO_Y_PENDIENTE', 'SE_COTIZO_Y_NO_INTERESO', 'DERIVADO_A_DISTRIBUIDOR', 'COMPRO'];
        dto.estado = CustomValidators.validateEnum(dto.estado, estadosValidos, 'estado');
      }
    }

    // Limpiar y validar siguiendo (opcional, debe ser una opción válida)
    if (dto.siguiendo !== undefined) {
      dto.siguiendo = this.cleanCrmData(dto.siguiendo);
      if (dto.siguiendo) {
        const siguiendoValidos = ['EZEQUIEL', 'DENIS', 'MARTIN', 'SIN_ASIGNAR'];
        dto.siguiendo = CustomValidators.validateEnum(dto.siguiendo, siguiendoValidos, 'siguiendo');
      }
    }

    // Limpiar observaciones (opcional)
    if (dto.observaciones !== undefined) {
      dto.observaciones = this.cleanCrmData(dto.observaciones);
      if (dto.observaciones) {
        dto.observaciones = CustomValidators.sanitizeText(dto.observaciones);
      }
    }

    // Limpiar producto (opcional)
    if (dto.producto !== undefined) {
      dto.producto = this.cleanCrmData(dto.producto);
      if (dto.producto) {
        dto.producto = CustomValidators.sanitizeText(dto.producto);
      }
    }

    // Limpiar localidad (opcional)
    if (dto.localidad !== undefined) {
      dto.localidad = this.cleanCrmData(dto.localidad);
      if (dto.localidad) {
        dto.localidad = CustomValidators.sanitizeText(dto.localidad);
      }
    }
  }


  private async scheduleFollowUpSafely(
    customer: Client,
    previousStatus: CustomerStatus | null,
  ): Promise<void> {
    if (!customer) {
      return;
    }

    try {
      await this.followUpService.scheduleForStatusChange(customer, previousStatus);
    } catch (error) {
      const message = (error as Error)?.message ?? 'Error desconocido al programar seguimiento';
      this.logger.warn(
        `No se pudo programar el seguimiento automático para el cliente ${customer._id?.toString?.() ?? 'sin-id'}: ${message}`,
        (error as Error)?.stack,
      );
    }
  }

  async generateExcel(res: Response): Promise<void> {
    const clients = await this.clientModel.find();
    if (!clients || clients.length === 0) {
      throw new NotFoundException('No hay clientes para exportar');
    }

    const workbook = new ExcelJS.Workbook();

    workbook.creator = 'Tu App CRM';
    workbook.created = new Date();

    const sheet = workbook.addWorksheet('Clientes');

    sheet.columns = [
      { header: 'Nombre', key: 'nombre', width: 25 },
      { header: 'Apellido', key: 'apellido', width: 25 },
      { header: 'Teléfono', key: 'telefono', width: 20 },
      { header: 'Email', key: 'correo', width: 30 },
      { header: 'Actividad', key: 'actividad', width: 15 },
      { header: 'Siguiendo', key: 'siguiendo', width: 15 },
      { header: 'Estado', key: 'estado', width: 20 },
      { header: 'Creado El', key: 'createdAt', width: 20 },
      { header: 'Producto', key: 'producto', width: 25 },
      { header: 'Localidad', key: 'localidad', width: 20 },
      { header: 'Cabezas', key: 'cabezas', width: 10 },
      { header: 'Meses Supl.', key: 'mesesSuplemento', width: 12 },
      { header: 'Medio Adq.', key: 'medioAdquisicion', width: 15 },
      { header: 'Observaciones', key: 'observaciones', width: 40 },
    ];

    clients.forEach((c: any) => {
      let createdAtStr = '-';
      if (c.createdAt) {
        const d = new Date(c.createdAt);
        const yyyy = d.getUTCFullYear();
        const mm = String(d.getUTCMonth() + 1).padStart(2, '0');
        const dd = String(d.getUTCDate()).padStart(2, '0');
        createdAtStr = `${yyyy}/${mm}/${dd}`;
      }

      sheet.addRow({
        nombre: c.nombre || '',
        apellido: c.apellido || '',
        telefono: c.telefono || '',
        correo: c.correo || '',
        actividad: c.actividad || '',
        siguiendo: c.siguiendo || '',
        estado: c.estado || '',
        createdAt: createdAtStr,
        producto: c.producto || '',
        localidad: c.localidad || '',
        cabezas: c.cabezas || '',
        mesesSuplemento: c.mesesSuplemento || '',
        medioAdquisicion: c.medioAdquisicion || '',
        observaciones: c.observaciones || '',
      });
    });

    sheet.getRow(1).eachCell((cell) => {
      cell.font = { bold: true };
      cell.fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'FFEEEEEE' },
      };
      cell.border = {
        top: { style: 'thin' },
        left: { style: 'thin' },
        bottom: { style: 'thin' },
        right: { style: 'thin' },
      };
    });

    res.setHeader(
      'Content-Type',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    );
    res.setHeader(
      'Content-Disposition',
      'attachment; filename="clientes_completos.xlsx"',
    );

    await workbook.xlsx.write(res);
    res.end();
  }
}
