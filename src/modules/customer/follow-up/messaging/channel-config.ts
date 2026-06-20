import { envs } from '../../../../config/envs';
import { FollowUpDeliveryOption } from '../follow-up.rules';

export function getActiveChannels(): FollowUpDeliveryOption[] {
  const channels: FollowUpDeliveryOption[] = [];

  if (envs.YCLOUD_ENABLED) {
    channels.push({ channel: 'YCLOUD_WHATSAPP', contactPreference: 'PHONE' });
  }

  return channels;
}

export function isChannelActive(channelType: string): boolean {
  return getActiveChannels().some((ch) => ch.channel === channelType);
}
