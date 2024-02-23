import Service from "../core/Service";
import Command from "../core/Command";

class CommandService extends Service {
    public readonly name = 'command';
    public readonly commands = new Map<string, Command>();

    public addCommand(command: Command) {
        this.commands.set(command.name, command);

        for (const alias of command.aliases) {
            this.commands.set(alias, command);
        }
    }
}

export default CommandService;