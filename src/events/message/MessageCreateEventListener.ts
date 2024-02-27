import EventListener from "../../core/EventListener";
import { Awaitable, Events, Message, ChannelType } from "discord.js";
import CommandService from "../../services/CommandService";
import type ConfigService from "../../services/ConfigService";
import { LegacyCommandContext } from "../../core/CommandContext";
import RefUseCommand from "../../commands/refs/RefUseCommand";

class MessageCreateEventListener extends EventListener<Events.MessageCreate> {
    public readonly name = Events.MessageCreate;

    public override async handle(message: Message): Promise<void> {
        if (message.author.bot) {
            return;
        }

        if (message.channel.type === ChannelType.DM || !message.guild) {
            const context = new LegacyCommandContext(this.client, message);
            const { error, success } = await RefUseCommand.use(
                message.content,
                false,
                undefined,
                context.user.id,
            );

            if (error) {
                await context.error(error);
                return;
            }

            await context.reply(success!);
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