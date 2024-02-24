import { HasClient } from "../utils/HasClient";
import { Awaitable, ChatInputCommandInteraction, Message } from "discord.js";
import { InteractionCommandContext, LegacyCommandContext } from "./CommandContext";
import { Arguments } from "./Arguments";

abstract class Command extends HasClient {
    public abstract readonly name: string;
    public abstract readonly group: string;
    public abstract readonly description: string;
    public abstract readonly syntax: string;
    public readonly aliases: string[] = [];

    abstract handle(context: InteractionCommandContext | LegacyCommandContext): Awaitable<void>;

    public execute(message: Message | ChatInputCommandInteraction, args?: Arguments) {
        let context;

        if (message instanceof Message) {
            context = new LegacyCommandContext(this.client, message, args);
        }
        else {
            context = new InteractionCommandContext(this.client, message);
        }

        return this.handle(context);
    }
}

export default Command;