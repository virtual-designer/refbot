import Service from "../core/Service";
import { Snowflake } from "discord.js";
import { z } from "zod";
import path from "node:path";
import FileSystem from "../core/FileSystem";

const zSnowflake = z.string().regex(/^\d+$/, "Must be a valid snowflake");

const configSchema = z.object({
    prefix: z.string().default("!"),
    register_commands_locally: z.boolean().default(false),
    moderator_permissions: z.object({
        permission_sets: z.array(z.array(z.string())).default([['BanMembers'], ['ManageGuild']]),
        roles: z.array(zSnowflake).default([]),
        users: z.array(zSnowflake).default([]),
    }).default({})
});
const configContainerSchema = z.record(zSnowflake, configSchema);

class ConfigService extends Service {
    public readonly name = "config";
    public readonly configPath = process.env.CONFIG_FILE_PATH ?? path.resolve(__dirname, '../../config.json');
    private _config: z.infer<typeof configContainerSchema> = {};

    public override async boot() {
        await this.load();
    }

    public async load() {
        if (await FileSystem.exists(this.configPath)) {
            this.client.logger.info(`Loading configuration from: ${this.configPath}`);
            const config = await FileSystem.readFile(this.configPath, { json: true });
            this._config = await configContainerSchema.parseAsync(config);
        }
        else {
            this.client.logger.warn(`Configuration file not found: ${this.configPath}`);
        }
    }

    public config(guildId: Snowflake | undefined | null) {
        if (!guildId) {
            return null;
        }

        return this._config[guildId] ?? null;
    }

    public entries() {
        return this._config;
    }

    public onReady() {
        for (const guildId of this.client.guilds.cache.keys()) {
            this.autoConfigureGuild(guildId);
        }
    }

    public autoConfigureGuild(guildId: Snowflake) {
        if (!this._config[guildId]) {
            this._config[guildId] = configSchema.parse({});
            this.client.logger.info(`Auto-configured guild with default settings: ${this.client.guilds.cache.get(guildId)?.name} (${guildId})`);
        }
    }
}

export default ConfigService;