import { Logger } from '@nestjs/common';
import { MessageChannelType } from '../follow-up.types';
import { MessagePayload, MessagingChannel } from './message-channel.interface';

export class ConsoleMessagingChannel implements MessagingChannel {
  private readonly logger: Logger;

  constructor(public readonly type: MessageChannelType) {
    this.logger = new Logger(`MessagingChannel:${type}`);
  }

  async send(payload: MessagePayload): Promise<void> {
    const preview =
      payload.body.length > 120 ? `${payload.body.slice(0, 117)}...` : payload.body;

    this.logger.log(
      `Simulated send to ${payload.recipient} | subject: ${payload.subject ?? 'n/a'} | body: ${preview}`,
    );
  }
}

