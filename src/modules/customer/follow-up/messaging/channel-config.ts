// ========================================
// CONFIGURACIÓN DE CANALES DE MENSAJERÍA
// ========================================
// 
// CONFIGURACIÓN ACTUAL:
// - WhatsApp Business API: Desactivado temporalmente
// - RESPOND_IO: Eliminado completamente
// - EMAIL para clientes: Eliminado completamente
// - EMAIL interno al equipo: Siempre activo
//
// Para activar WhatsApp, cambiar WHATSAPP_API de null a la configuración

import { FollowUpDeliveryOption } from '../follow-up.rules';

export const CHANNEL_CONFIG: Record<string, FollowUpDeliveryOption | null> = {
  // WhatsApp Business API - Desactivado temporalmente
  WHATSAPP_API: null,
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
