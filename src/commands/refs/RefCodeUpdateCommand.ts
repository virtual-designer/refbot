import Command from "../../core/Command";
import { Context } from "../../core/CommandContext";
import ReferralService from "../../services/ReferralService";
import { Colors, heading, HeadingLevel, time } from "discord.js";
import { ArgumentType } from "../../core/Arguments";

class RefCodeUpdateCommand extends Command {
    public readonly name = 'ref::codeupdate';
    public readonly description = 'Update a referral code.';
    public readonly group = 'refs';
    public readonly syntax = '<code: string>';
    public readonly supportsInteractions = false;

    public async handle(context: Context) {
        const code: string = (context.type === "legacy" ? await context.args.at(1, ArgumentType.String, false, {
            required: "Please provide a referral code to view the statistics!"
        }) : context.interaction.options.getString('code', true));
        const newCode: string | null = (context.type === "legacy" ? await context.args.at(2, ArgumentType.String, true) : context.interaction.options.getString('new_code'));

        await context.defer({
            ephemeral: true
        });

        const { code: generatedCode, error } = await this.client
            .getService<ReferralService>('referral')
            .updateRefCode(code, context.isRanByModerator() ? undefined : context.user.id, newCode ?? undefined, context.isRanByModerator() ? undefined : context.user.id);

        if (error) {
            return context.error({
                ephemeral: true,
                content: `${error}`
            });
        }

        await context.reply({
            embeds: [
                {
                    description: `${heading("New Code", HeadingLevel.Three)}\n||${generatedCode}||`,
                    color: Colors.Blurple,
                    footer: {
                        text: `Referral code was updated`
                    },
                    timestamp: new Date().toISOString()
                }
            ]
        });
    }
}

export default RefCodeUpdateCommand;