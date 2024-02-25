import Service from "../core/Service";
import Command, { Builder } from "../core/Command";
import { ChatInputCommandInteraction, Collection, Message, SlashCommandBuilder } from "discord.js";
import { Arguments } from "../core/Arguments";
import type ConfigService from "./ConfigService";

class CommandService extends Service {
    public readonly name = 'command';
    public readonly commands = new Collection<string, Command>();

    public async registerCommands() {
        const builders: Builder[] = this.commands
            .filter((c, k) => !c.name.includes('::') && c.supportsInteractions && k === c.name)
            .map(command => {
                return command.build(new SlashCommandBuilder().setName(command.name).setDescription(command.description));
            });

        if (!process.env.NO_REGISTER_GLOBAL_COMMANDS) {
            await this.registerGlobalCommands(builders);
        }

        const entries = this.client.getService<ConfigService>('config').entries();

        for (const guildId in entries) {
            if (entries[guildId].register_commands_locally) {
                const guild = this.client.guilds.cache.get(guildId);

                if (!guild) {
                    continue;
                }

                this.client.logger.info(`Registering application commands for guild: ${guild.name} (${guild.id})`);
                await guild.commands.set(builders);
            }
        }
    }

    private async registerGlobalCommands(builders: Builder[]) {
        this.client.logger.info(`Registering global application commands`);
        await this.client.application?.commands.set(builders);
    }

    public addCommand(command: Command) {
        this.commands.set(command.name, command);

        for (const alias of command.aliases) {
            this.commands.set(alias, command);
        }
    }

    public async runFromMessage(message: Message) {
        const args = new Arguments(this.client, message);
        const commandName = args.getCommandName();
        const command = this.commands.get(commandName);

        if (!command || !command.supportsLegacy) {
            return false;
        }

        await command.execute(message, args);
        return true;
    }

    public async runFromInteraction(interaction: ChatInputCommandInteraction) {
        const command = this.commands.get(interaction.commandName);

        if (!command || !command.supportsInteractions) {
            return false;
        }

        await command.execute(interaction);
        return true;
    }

    public async onReady() {
        await this.registerCommands();
    }
}

export default CommandService;