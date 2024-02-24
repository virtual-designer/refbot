import {
    ChatInputCommandInteraction,
    InteractionReplyOptions, InteractionResponse,
    Message,
    MessageCreateOptions,
    MessagePayload
} from "discord.js";
import { Arguments } from "./Arguments";
import Client from "./Client";

abstract class CommandContext {
    public readonly type: "legacy" | "interaction" = 'interaction';

    protected constructor(protected readonly client: Client) {}

    reply(options: MessageCreateOptions | MessagePayload | InteractionReplyOptions | string) {
        if (this instanceof LegacyCommandContext) {
            return this.message.reply(options as MessageCreateOptions) as Promise<Message>;
        }
        else if (this instanceof InteractionCommandContext) {
            return this.interaction.reply(options as InteractionReplyOptions) as Promise<InteractionResponse>;
        }
    }
}

class LegacyCommandContext extends CommandContext {
    public override readonly type = "legacy";
    public readonly args: Arguments;
    public readonly commandName: string;

    constructor(protected readonly client: Client, public readonly message: Message, args?: Arguments) {
        super(client);
        this.args = args ?? new Arguments(client, message);
        this.commandName = this.args.getCommandName();
    }
}

class InteractionCommandContext extends CommandContext {
    public override readonly type = "interaction";
    public readonly commandName: string;

    constructor(protected readonly client: Client, public readonly interaction: ChatInputCommandInteraction) {
        super(client);
        this.commandName = interaction.commandName;
    }
}

export type Context = InteractionCommandContext | LegacyCommandContext;

export {
    InteractionCommandContext,
    LegacyCommandContext
};