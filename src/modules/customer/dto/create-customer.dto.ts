import {
  IsString,
  IsEmail,
  IsInt,
  IsEnum,
  Min,
  MaxLength,
  IsOptional,
  IsNotEmpty,
} from 'class-validator';
import {
  ApiProperty,
  ApiPropertyOptional,
} from '@nestjs/swagger';
import { Type } from 'class-transformer';

export enum Actividad {
  CRIA = 'CRIA',
  RECRIA = 'RECRIA',
  MIXTO = 'MIXTO',
  DISTRIBUIDOR = 'DISTRIBUIDOR',
}

export class CreateClientDto {
  @ApiProperty({ example: 'Juan', description: 'Nombre del cliente' })
  @IsString()
  @MaxLength(50)
  nombre: string;

  @ApiProperty({ example: 'Pérez', description: 'Apellido del cliente' })
  @IsOptional()
  @MaxLength(50)
  apellido: string;

  @ApiProperty({ example: '+54 9 351 555-1234', description: 'Teléfono de contacto' })
  @IsNotEmpty()
  @MaxLength(20)
  telefono: string;

  @ApiProperty({ example: 'juan@example.com', description: 'Correo electrónico' })
  @IsOptional()
  @IsEmail()
  correo: string;

  @ApiProperty({ example: 120, minimum: 0, description: 'Cantidad de cabezas de ganado' })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  cabezas: number;

  @ApiProperty({ example: 6, minimum: 0, description: 'Meses que va a suplementar' })
  @IsOptional()
  mesesSuplemento: string;

  @ApiProperty({ example: 'PIPO Bovino 18%', description: 'Producto comprado' })
  @IsOptional()
  @IsString()
  producto: string;

  @ApiProperty({ example: 'Córdoba', description: 'Localidad del cliente' })
  @IsOptional()
  @IsString()
  localidad: string;

  @ApiProperty({ enum: Actividad, description: 'Actividad principal' })
  @IsOptional()
  @IsEnum(Actividad)
  actividad: Actividad;

  @ApiPropertyOptional({
    example: 'Prefiere entrega los lunes por la mañana',
    description: 'Observaciones adicionales',
    maxLength: 300,
  })
  @IsOptional()
  @IsString()
  @MaxLength(300)
  observaciones?: string;

  @ApiProperty({
    enum: ['EZEQUIEL', 'DENIS', 'MARTIN', 'SIN_ASIGNAR'],
    default: 'SIN_ASIGNAR',
    description: 'Quien está siguiendo al cliente',
  })
  @IsOptional()
  @IsString()
  siguiendo?:string

  @ApiProperty({
    enum: ['Instagram', 'Web', 'Whatsapp', 'Facebook', 'Otro'],
    default: 'Otro',  
  })
  @IsOptional()
  medioAdquisicion?: 'INSTAGRAM' | 'WEB' | 'WHATSAPP' | 'FACEBOOK' | 'OTRO';

  @IsOptional()
  @IsString()
  @MaxLength(300)
  createdAt?: string;
}
