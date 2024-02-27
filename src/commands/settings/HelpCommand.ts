import Command from "../../core/Command";
import { Context } from "../../core/CommandContext";
import { ArgumentType } from "../../core/Arguments";
import CommandService from "../../services/CommandService";
import { codeBlock, Colors, heading, HeadingLevel, inlineCode } from "discord.js";

class HelpCommand extends Command {
    public readonly name = 'help';
    public readonly description = 'Shows help information about different commands.';
    public readonly group = 'settings';
    public readonly syntax = '[command_name]';
    public readonly aliases = ['?'];

    public async handle(context: Context) {
        const command: string | undefined = (context.type === "legacy" ? await context.args.at(0, ArgumentType.String, true) : context.interaction.options.getString('command'))?.toLowerCase();
        const subcommand: string | undefined = (context.type === "legacy" ? await context.args.at(1, ArgumentType.String, true) : context.interaction.options.getString('subcommand'))?.toLowerCase();
        const finalCommandName = command && subcommand ? `${command}::${subcommand}` : command;

        if (!finalCommandName) {
            let description = `${heading(":blue_book: Help")}\n`;
            const commands = this.client.getService<CommandService>('command').commands;

            for (const [name, command] of commands) {
                if (command.name !== name || command.name.includes('::')) {
                    continue;
                }

                const trimmedDescription = command.description.slice(0, 50);
                description += `${heading(command.name, HeadingLevel.Three)}\n`;
                description += `${trimmedDescription}${trimmedDescription.length !== command.description.length ? '\n[...]' : ''}`;
                description += "\n";
            }

            return context.reply({
                embeds: [
                    {
                        description,
                        color: Colors.Blurple,
                        footer: {
                            text: `Run \`help <command>\` for more info about a specific command`
                        }
                    }
                ]
            });
        }
        else {
            const command = this.client.getService<CommandService>('command').commands.get(finalCommandName);

            if (!command) {
                return context.error(`Command \`${finalCommandName.replace('::', ' ')}\` does not exist.`);
            }

            let description = '';

            description += `${heading(`${command.name.replace('::', ' ')}`)}\n`;
            description += `**Group**: ${inlineCode(command.group)}\n`;
            description += `**Aliases**: ${command.aliases.length === 0 ? '*None*' : inlineCode(command.aliases.map(c => c.replace('::', ' ')).join('`, `'))}\n`;

            if (command.subcommands.length > 0) {
                description += `**Subcommands:** \`${command.subcommands.join('`, `')}\`\n`;
            }

            description += `**Syntax**:\n${codeBlock(`${finalCommandName} ${command.syntax}`)}\n`;
            description += `**Description:**\n${command.description}\n`;

            return context.reply({
                embeds: [
                    {
                        description,
                        color: Colors.Blurple,
                        footer: {
                            text: "Need more help? Feel free to contact rakinar2@onesoftnet.eu.org."
                        }
                    }
                ]
            });
        }
    }
}

export default HelpCommand;