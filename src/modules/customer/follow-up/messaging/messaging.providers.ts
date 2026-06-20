import { YCloudMessagingChannel } from './ycloud-api.channel';
import { InternalEmailChannel } from './internal-email.channel';
import { MessagingChannel } from './message-channel.interface';
import { isChannelActive } from './channel-config';

export const MessagingProviders = [
  {
    provide: 'MESSAGING_CHANNELS',
    useFactory: (): MessagingChannel[] => {
      const channels: MessagingChannel[] = [];

      if (isChannelActive('YCLOUD_WHATSAPP')) {
        channels.push(new YCloudMessagingChannel('YCLOUD_WHATSAPP'));
      }

      // Email interno: siempre activo
      channels.push(new InternalEmailChannel('INTERNAL_EMAIL'));

      return channels;
    },
  },
];
