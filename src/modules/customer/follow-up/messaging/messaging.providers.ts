import { YCloudMessagingChannel } from './ycloud-api.channel';
import { InternalEmailChannel } from './internal-email.channel';
import { MessagingChannel } from './message-channel.interface';
import { envs } from '../../../../config/envs';

export const MessagingProviders = [
  {
    provide: 'MESSAGING_CHANNELS',
    useFactory: (): MessagingChannel[] => {
      const channels: MessagingChannel[] = [];

      // Agregar YCloud si está habilitado
      if (envs.YCLOUD_ENABLED) {
        channels.push(new YCloudMessagingChannel('YCLOUD_WHATSAPP'));
      }

      // Agregar canal de correos internos (siempre activo)
      channels.push(new InternalEmailChannel('INTERNAL_EMAIL'));

      return channels;
    },
  },
];

