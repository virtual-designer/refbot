import EventListener from "../../core/EventListener";
import { Awaitable, Events, Message } from "discord.js";

class MessageCreateEventListener extends EventListener<Events.MessageCreate> {
    public readonly name = Events.MessageCreate;

    public override async handle(message: Message): Promise<void> {
        if (message.author.bot) {
            return;
        }
    }
}

export default MessageCreateEventListener;