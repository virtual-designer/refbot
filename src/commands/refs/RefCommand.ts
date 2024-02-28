import Command, { Builder } from "../../core/Command";
import { Context } from "../../core/CommandContext";
import { ArgumentType } from "../../core/Arguments";
import CommandService from "../../services/CommandService";
import { SlashCommandBuilder } from "discord.js";

class RefCommand extends Command {
    public readonly name = 'ref';
    public readonly description = 'Referral management command.';
    public readonly group = 'refs';
    public readonly syntax = '<subcommand> [...args]';
    public readonly subcommands = ["create", "delete", "update", "list", "view", "show", "users", "use"];
    public readonly requiredError = `Please specify a valid subcommand! The available subcommands are: \`${this.subcommands.join('`, `')}\`.`;
    public readonly aliases = ['refs'];

    public build(builder: SlashCommandBuilder): Builder {
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
            )
            .addSubcommand(subcommand =>
                subcommand.setName("delete").setDescription("Delete a referral")
                    .addStringOption(option =>
                        option.setName("code").setDescription("The unique code of the referral.").setRequired(true)
                    )
            )
            .addSubcommand(subcommand =>
                subcommand.setName("use").setDescription("Use a referral")
                    .addStringOption(option =>
                        option.setName("code").setDescription("The unique code of the referral.").setRequired(true)
                    )
            )
            .addSubcommand(subcommand =>
                subcommand.setName("list").setDescription("List all referrals available. [Moderator-only]")
            )
            .addSubcommand(subcommand =>
                subcommand.setName("codeupdate").setDescription("Update a referral code")
                    .addStringOption(option =>
                        option.setName("code").setDescription("The current unique code of the referral.").setRequired(true),
                    )
                    .addStringOption(option =>
                        option.setName("new_code").setDescription("The new unique code of the referral. Leave empty to auto-generate.")
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

        if (command.moderatorOnly && !context.isRanByModerator()) {
            return context.error({
                content: "You don't have permission to run this command.",
                ephemeral: true
            });
        }

        return command.handle(context);
    }
}

export default RefCommand;