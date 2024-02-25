import EventListener from "../core/EventListener";
import { Awaitable, Events } from "discord.js";
import type ConfigService from "../services/ConfigService";
import type CommandService from "../services/CommandService";

class ReadyEventListener extends EventListener<Events.ClientReady> {
    public readonly name = Events.ClientReady;

    public async handle() {
        this.client.logger.info(`Logged in successfully as @${this.client.user?.username}`);
        this.client.getService<ConfigService>('config').onReady();
        await this.client.getService<CommandService>('command').onReady();
    }
}

export default ReadyEventListener;