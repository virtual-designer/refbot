import EventListener from "../core/EventListener";
import { Awaitable, Events } from "discord.js";
import ConfigService from "../services/ConfigService";

class ReadyEventListener extends EventListener<Events.ClientReady> {
    public readonly name = Events.ClientReady;

    public async handle() {
        this.client.logger.info(`Logged in successfully as @${this.client.user?.username}`);
        this.client.getService<ConfigService>('config').onReady();
    }
}

export default ReadyEventListener;