import { WhatsAppAPIMessagingChannel } from './whatsapp-api.channel';
import { InternalEmailChannel } from './internal-email.channel';
import { MessagingChannel } from './message-channel.interface';
import { envs } from '../../../../config/envs';

export const MessagingProviders = [
  {
    provide: 'MESSAGING_CHANNELS',
    useFactory: (): MessagingChannel[] => {
      const channels: MessagingChannel[] = [];

      // Agregar WhatsApp Business API si está habilitado
      if (envs.WHATSAPP_API_ENABLED) {
        channels.push(new WhatsAppAPIMessagingChannel('WHATSAPP_API'));
      }

      // Agregar canal de correos internos (siempre activo)
      channels.push(new InternalEmailChannel('INTERNAL_EMAIL'));

      return channels;
    },
  },
];

