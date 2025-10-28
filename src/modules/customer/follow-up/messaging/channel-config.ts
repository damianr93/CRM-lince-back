// ========================================
// CONFIGURACIÓN DE CANALES DE MENSAJERÍA
// ========================================
// 
// CONFIGURACIÓN ACTUAL:
// - YCloud WhatsApp: Canal principal para mensajería
// - EMAIL interno al equipo: Siempre activo
//
// Para activar YCloud, configurar las variables de entorno correspondientes

import { FollowUpDeliveryOption } from '../follow-up.rules';

export const CHANNEL_CONFIG: Record<string, FollowUpDeliveryOption | null> = {
  // YCloud WhatsApp - Canal principal
  YCLOUD_WHATSAPP: {
    channel: 'YCLOUD_WHATSAPP',
    contactPreference: 'PHONE'
  },
};

/**
 * Obtiene la lista de canales activos basada en la configuración
 * @returns Array de canales activos en orden de prioridad
 */
export function getActiveChannels(): FollowUpDeliveryOption[] {
  return Object.values(CHANNEL_CONFIG).filter(channel => channel !== null) as FollowUpDeliveryOption[];
}

/**
 * Verifica si un canal específico está activo
 * @param channelType Tipo de canal a verificar
 * @returns true si el canal está activo, false en caso contrario
 */
export function isChannelActive(channelType: string): boolean {
  return Object.values(CHANNEL_CONFIG).some(channel => 
    channel !== null && channel.channel === channelType
  );
}

/**
 * Obtiene información sobre la configuración actual de canales
 * @returns Objeto con información de configuración
 */
export function getChannelConfigInfo() {
  const activeChannels = getActiveChannels();
  const availableChannels = ['WHATSAPP_API'];
  
  return {
    activeChannels: activeChannels.map(c => c.channel),
    inactiveChannels: availableChannels.filter(c => !isChannelActive(c)),
    totalActive: activeChannels.length,
    defaultChannel: activeChannels[0]?.channel || null,
  };
}
