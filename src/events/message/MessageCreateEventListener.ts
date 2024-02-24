import EventListener from "../../core/EventListener";
import { Awaitable, Events, Message, ChannelType } from "discord.js";
import CommandService from "../../services/CommandService";
import type ConfigService from "../../services/ConfigService";

class MessageCreateEventListener extends EventListener<Events.MessageCreate> {
    public readonly name = Events.MessageCreate;

    public override async handle(message: Message): Promise<void> {
        if (message.author.bot || message.channel.type === ChannelType.DM || !message.guild) {
            return;
        }

        const prefix = this.client.getService<ConfigService>('config').config(message.guildId)?.prefix;

        if (!prefix || !message.content.startsWith(prefix)) {
            return;
        }

        await this.client.getService<CommandService>('command').runFromMessage(message);
    }
}

export default MessageCreateEventListener;