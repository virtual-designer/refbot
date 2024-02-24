import Client from "../core/Client";
import { Snowflake } from "discord.js";

class Fetcher {
    public static client: Client;

    public static async getUser(userId: Snowflake) {
        try {
            return await this.client.users.fetch(userId);
        }
        catch {
            return null;
        }
    }

    public static async getChannel(guildId: Snowflake, channelId: Snowflake) {
        try {
            return await this.client.guilds.cache.get(guildId)?.channels.fetch(channelId);
        }
        catch {
            return null;
        }
    }

    public static async getGuildMember(guildId: Snowflake, memberId: Snowflake) {
        try {
            return await this.client.guilds.cache.get(guildId)?.members.fetch(memberId);
        }
        catch {
            return null;
        }
    }
}

export default Fetcher;