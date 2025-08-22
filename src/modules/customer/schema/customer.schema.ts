import { Schema, Document } from 'mongoose';

export interface Client extends Document {
  nombre?: string;
  apellido?: string;
  telefono: string;
  correo?: string;
  cabezas?: string;
  mesesSuplemento?: string;
  producto?: string;
  localidad?: string;
  actividad?: 'CRIA' | 'RECRIA' | 'MIXTO' | 'DISTRIBUIDOR';
  medioAdquisicion?: 'INSTAGRAM' | 'WEB' | 'WHATSAPP' | 'FACEBOOK' | 'OTRO';
  estado?: 'PENDIENTE'| 'NO_CONTESTO' | 'SE_COTIZO_Y_PENDIENTE' | 'SE_COTIZO_Y_NO_INTERESO' | 'COMPRO';
  siguiendo?: 'EZEQUIEL' | 'DENIS' | 'MARTIN' | 'SIN_ASIGNAR';
  observaciones?: string;
  createdAt?: Date;
  provincia?: string;
}

export const ClientSchema = new Schema<Client>(
  {
    nombre: { type: String},
    apellido: { type: String },
    telefono: { type: String, required: true  },
    correo: { type: String, lowercase: true },
    cabezas: { type: String },
    mesesSuplemento: { 
      type: String
    },
    producto: { type: String },
    localidad: { type: String },
    provincia: { type: String },
    actividad: {
      type: String,
      enum: ['CRIA', 'RECRIA', 'MIXTO', 'DISTRIBUIDOR'],
    },
    medioAdquisicion: {
      type: String,
      enum: ['INSTAGRAM', 'WEB', 'WHATSAPP', 'FACEBOOK', 'OTRO'],
      default: 'OTRO',
    },
    estado: {
      type: String,
      enum: ['PENDIENTE' ,'NO_CONTESTO' , 'SE_COTIZO_Y_PENDIENTE' , 'SE_COTIZO_Y_NO_INTERESO' , 'COMPRO'],
      default: 'PENDIENTE',
    },
    siguiendo: {
      type: String,
      enum: ['EZEQUIEL', 'DENIS', 'MARTIN', 'SIN_ASIGNAR'],
      default: 'SIN_ASIGNAR',
    },
    observaciones: String,
    createdAt: {
      type: Date,
      default: Date.now,
      immutable: false
    },
  },
  {
    timestamps: { createdAt: false, updatedAt: true }
  },
);

ClientSchema.set("toJSON", {
  virtuals: true,
  versionKey: false,
  transform(doc, ret) {

    ret.id = ret._id.toString();

    delete ret._id;
  },
});