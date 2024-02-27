import Command from "../../core/Command";
import { Context } from "../../core/CommandContext";
import ReferralService from "../../services/ReferralService";
import { Colors } from "discord.js";
import { ArgumentType } from "../../core/Arguments";

class RefCreateCommand extends Command {
    public readonly name = 'ref::create';
    public readonly description = 'Create referrals.';
    public readonly group = 'refs';
    public readonly syntax = '[code: string]';
    public readonly supportsInteractions = false;

    public async handle(context: Context) {
        const code: string | null = (context.type === "legacy" ? await context.args.at(1, ArgumentType.String, true) : context.interaction.options.getString('code'));

        if (code && code.length > 50) {
            return context.error("Referral code have less than 50 characters!");
        }

        await context.defer({
            ephemeral: true
        });

        const ref = await this.client
            .getService<ReferralService>('referral')
            .createCode(context.user.id, context.guild.id, code ?? undefined);

        if (!ref) {
            return context.error(context.isRanByModerator() ? `The referral code is already taken. You're being told the exact reason because you're a moderator.` : `That referral code is not available at the moment.`);
        }

        await context.reply({
            embeds: [
                {
                    title: `Referral #${ref.id}`,
                    description: `||${ref.code}||`,
                    color: Colors.Blurple,
                    footer: {
                        text: `Only you and the moderators can see statistics for this referral`
                    },
                    timestamp: new Date().toISOString()
                }
            ]
        });
    }
}

export default RefCreateCommand;