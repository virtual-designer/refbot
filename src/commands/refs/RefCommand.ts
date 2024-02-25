import Command from "../../core/Command";
import { Context } from "../../core/CommandContext";
import { ArgumentType } from "../../core/Arguments";
import CommandService from "../../services/CommandService";
import { SlashCommandBuilder } from "discord.js";

class RefCommand extends Command {
    public readonly name = 'ref';
    public readonly description = 'Referral management command.';
    public readonly group = 'refs';
    public readonly syntax = '<subcommand> [...args]';
    public readonly subcommands = ["create", "delete", "update", "list", "view", "show", "users"];
    public readonly requiredError = `Please specify a valid subcommand! The available subcommands are: \`${this.subcommands.join('`, `')}\`.`;
    public readonly aliases = ['refs'];

    public build(builder: SlashCommandBuilder) {
        return builder
            .addSubcommand(subcommand =>
                subcommand.setName("create").setDescription("Create a referral")
                    .addStringOption(option =>
                        option.setName("code").setDescription("An unique code for the referral. Leave empty to generate automatically.")
                    )
            )
            .addSubcommand(subcommand =>
                subcommand.setName("view").setDescription("View a referral by code")
                    .addStringOption(option =>
                        option.setName("code").setDescription("The unique code of the referral.").setRequired(true)
                    )
            )
            .addSubcommand(subcommand =>
                subcommand.setName("users").setDescription("List the users of a referral")
                    .addStringOption(option =>
                        option.setName("code").setDescription("The unique code of the referral.").setRequired(true)
                    )
            );
    }

    public async handle(context: Context) {
        const subcommand: string = (context.type === "legacy" ? await context.args.at(0, ArgumentType.String, false, {
            required: this.requiredError
        }) : context.interaction.options.getSubcommand(true)).toLowerCase();

        if (!this.subcommands.includes(subcommand)) {
            return context.error(this.requiredError);
        }

        const command = this.client.getService<CommandService>('command').commands.get(`${this.name}::${subcommand}`);

        if (!command) {
            return context.error(`Invalid subcommand: ${subcommand}`);
        }

        return command.handle(context);
    }
}

export default RefCommand;