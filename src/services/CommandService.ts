import Service from "../core/Service";
import Command from "../core/Command";
import { ChatInputCommandInteraction, Message } from "discord.js";
import { Arguments } from "../core/Arguments";

class CommandService extends Service {
    public readonly name = 'command';
    public readonly commands = new Map<string, Command>();

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

        if (!command) {
            return false;
        }

        await command.execute(message, args);
        return true;
    }

    public async runFromInteraction(interaction: ChatInputCommandInteraction) {
        const command = this.commands.get(interaction.commandName);

        if (!command) {
            return false;
        }

        await command.execute(interaction);
        return true;
    }
}

export default CommandService;