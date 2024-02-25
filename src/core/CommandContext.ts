import {
    ChatInputCommandInteraction, GuildMember, InteractionDeferReplyOptions,
    InteractionReplyOptions, InteractionResponse,
    Message,
    MessageCreateOptions,
    MessagePayload, User
} from "discord.js";
import { Arguments } from "./Arguments";
import Client from "./Client";
import { isModerator } from "../utils/utils";

abstract class CommandContext {
    public readonly type: "legacy" | "interaction" = 'interaction';

    protected constructor(protected readonly client: Client) {}

    reply(options: MessageCreateOptions | MessagePayload | InteractionReplyOptions | string) {
        if (this instanceof LegacyCommandContext) {
            return this.message.reply(options as MessageCreateOptions) as Promise<Message>;
        }
        else if (this instanceof InteractionCommandContext) {
            if (this.interaction.deferred) {
                return this.interaction.editReply(options as InteractionReplyOptions) as Promise<Message>;
            }
            else {
                return this.interaction.reply(options as InteractionReplyOptions) as Promise<InteractionResponse>;
            }
        }
    }

    error(options: MessageCreateOptions | MessagePayload | InteractionReplyOptions | string) {
        return this.replyWithPrefix(':x:', options);
    }

    success(options: MessageCreateOptions | MessagePayload | InteractionReplyOptions | string) {
        return this.replyWithPrefix(':check:', options);
    }

    private replyWithPrefix(prefix: string, options: MessageCreateOptions | MessagePayload | InteractionReplyOptions | string) {
        const content = `${prefix} ${typeof options === 'string' ? options : 'content' in options ? options.content : ''}`;
        const finalOptions = typeof options === 'string' ? content : {
            ...options,
            content
        };

        return this.reply(finalOptions as MessageCreateOptions);
    }

    get user(): User {
        return this instanceof InteractionCommandContext ? this.interaction.user : this instanceof LegacyCommandContext ? this.message.author : (null as never);
    }

    get member(): GuildMember {
        return this instanceof InteractionCommandContext ? this.interaction.member as GuildMember : this instanceof LegacyCommandContext ? this.message.member! : (null as never);
    }

    public defer(options?: InteractionDeferReplyOptions) {
        if (this instanceof InteractionCommandContext && !this.interaction.deferred) {
            return this.interaction.deferReply(options);
        }
    }

    public isRanByModerator() {
        return isModerator(this.client, this.member);
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