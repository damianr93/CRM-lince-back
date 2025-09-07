import { BadRequestException } from '@nestjs/common';

export class CustomValidators {
  /**
   * Valida que un string no esté vacío o solo contenga espacios
   */
  static validateRequiredString(value: any, fieldName: string): string {
    if (!value || typeof value !== 'string' || value.trim().length === 0) {
      throw new BadRequestException(`El campo '${fieldName}' es requerido y no puede estar vacío`);
    }
    return value.trim();
  }

  /**
   * Valida formato de email
   */
  static validateEmail(email: string, fieldName: string = 'email'): string {
    if (!email) return email; // Email es opcional
    
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      throw new BadRequestException(`El campo '${fieldName}' debe tener un formato de email válido`);
    }
    return email;
  }

  /**
   * Valida y normaliza formato de teléfono argentino
   */
  static validatePhone(phone: string, fieldName: string = 'telefono'): string {
    if (!phone) return phone; // Teléfono es opcional
    
    // Remover espacios, guiones y paréntesis
    let cleanPhone = phone.replace(/[\s\-\(\)]/g, '');
    
    // Normalizar números argentinos
    cleanPhone = this.normalizeArgentinePhone(cleanPhone);
    
    // Validar que solo contenga números y tenga al menos 8 dígitos
    if (!/^\d{8,15}$/.test(cleanPhone)) {
      throw new BadRequestException(`El campo '${fieldName}' debe contener entre 8 y 15 dígitos`);
    }
    
    return cleanPhone;
  }

  /**
   * Normaliza números de teléfono argentinos
   */
  private static normalizeArgentinePhone(phone: string): string {
    // Si empieza con +549, removerlo
    if (phone.startsWith('+549')) {
      return phone.substring(4);
    }
    
    // Si empieza con 549, removerlo
    if (phone.startsWith('549')) {
      return phone.substring(3);
    }
    
    // Si empieza con +54, removerlo
    if (phone.startsWith('+54')) {
      return phone.substring(3);
    }
    
    // Si empieza con 54, removerlo
    if (phone.startsWith('54')) {
      return phone.substring(2);
    }
    
    // Si empieza con 0, removerlo (código de área local)
    if (phone.startsWith('0')) {
      return phone.substring(1);
    }
    
    return phone;
  }

  /**
   * Valida que un número sea positivo
   */
  static validatePositiveNumber(value: any, fieldName: string): number {
    const num = Number(value);
    if (isNaN(num) || num < 0) {
      throw new BadRequestException(`El campo '${fieldName}' debe ser un número positivo`);
    }
    return num;
  }

  /**
   * Valida que un valor esté en una lista de opciones válidas
   */
  static validateEnum(value: any, validOptions: string[], fieldName: string): string {
    if (!validOptions.includes(value)) {
      throw new BadRequestException(
        `El campo '${fieldName}' debe ser uno de: ${validOptions.join(', ')}`
      );
    }
    return value;
  }

  /**
   * Valida formato de fecha ISO
   */
  static validateISODate(dateString: string, fieldName: string): string {
    if (!dateString) return dateString;
    
    const date = new Date(dateString);
    if (isNaN(date.getTime())) {
      throw new BadRequestException(`El campo '${fieldName}' debe ser una fecha válida en formato ISO`);
    }
    return dateString;
  }

  /**
   * Sanitiza texto removiendo caracteres peligrosos
   */
  static sanitizeText(text: string): string {
    if (!text) return text;
    return text
      .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '') // Remover scripts
      .replace(/[<>]/g, '') // Remover < y >
      .trim();
  }

  /**
   * Valida ID de MongoDB
   */
  static validateMongoId(id: string, fieldName: string = 'id'): string {
    if (!id) {
      throw new BadRequestException(`El campo '${fieldName}' es requerido`);
    }
    
    const mongoIdRegex = /^[0-9a-fA-F]{24}$/;
    if (!mongoIdRegex.test(id)) {
      throw new BadRequestException(`El campo '${fieldName}' debe ser un ID válido de MongoDB`);
    }
    
    return id;
  }
}
