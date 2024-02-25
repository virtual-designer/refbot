import { HasClient } from "../utils/HasClient";
import {
    Awaitable,
    ChatInputCommandInteraction,
    Message,
    SlashCommandBuilder,
    SlashCommandOptionsOnlyBuilder, SlashCommandSubcommandsOnlyBuilder
} from "discord.js";
import { InteractionCommandContext, LegacyCommandContext } from "./CommandContext";
import { Arguments, InvalidArgumentException } from "./Arguments";

export type Builder = SlashCommandBuilder | SlashCommandOptionsOnlyBuilder | SlashCommandSubcommandsOnlyBuilder;

abstract class Command extends HasClient {
    public abstract readonly name: string;
    public abstract readonly group: string;
    public abstract readonly description: string;
    public abstract readonly syntax: string;
    public readonly aliases: string[] = [];
    public readonly subcommands: string[] = [];
    public readonly supportsInteractions: boolean = true;
    public readonly supportsLegacy: boolean = true;
    public readonly moderatorOnly: boolean = false;

    abstract handle(context: InteractionCommandContext | LegacyCommandContext): Awaitable<unknown>;

    public build(builder: SlashCommandBuilder): Builder {
        return builder;
    }

    public async execute(message: Message | ChatInputCommandInteraction, args?: Arguments) {
        let context;

        if (message instanceof Message) {
            context = new LegacyCommandContext(this.client, message, args);
        }
        else {
            context = new InteractionCommandContext(this.client, message);
        }

        if (this.moderatorOnly && !context.isRanByModerator()) {
            return context.error({
                content: "You don't have permission to run this command.",
                ephemeral: true
            });
        }

        try {
            return this.handle(context);
        }
        catch (error) {
            if (error instanceof InvalidArgumentException) {
                this.client.logger.debug(`[command ${this.name}] Argument Error (${error.getType()}) [index ${error.getIndex()} ${error.message}`);

                await context.reply({
                    content: error.message,
                    ephemeral: true
                });
            }
            else {
                this.client.logger.error(error);
            }
        }
    }
}

export default Command;