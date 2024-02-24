import EventListener from "../../core/EventListener";
import { Events, Guild } from "discord.js";
import ConfigService from "../../services/ConfigService";

class GuildCreateEventListener extends EventListener<Events.GuildCreate> {
    public readonly name = Events.GuildCreate;

    public async handle(guild: Guild) {
        this.client.logger.info(`New guild added: ${guild.name} (${guild.id})`);
        this.client.getService<ConfigService>('config').autoConfigureGuild(guild.id);
    }
}

export default GuildCreateEventListener;