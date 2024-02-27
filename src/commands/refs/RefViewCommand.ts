import Command from "../../core/Command";
import { Context } from "../../core/CommandContext";
import ReferralService from "../../services/ReferralService";
import { Colors, heading, HeadingLevel, time } from "discord.js";
import { ArgumentType } from "../../core/Arguments";

class RefViewCommand extends Command {
    public readonly name = 'ref::view';
    public readonly description = 'View a referral information.';
    public readonly group = 'refs';
    public readonly syntax = '<code: string>';
    public readonly supportsInteractions = false;
    public readonly aliases = ['ref::show'];

    public async handle(context: Context) {
        const code: string = (context.type === "legacy" ? await context.args.at(1, ArgumentType.String, false, {
            required: "Please provide a referral code to view the statistics!"
        }) : context.interaction.options.getString('code', true));

        await context.defer({
            ephemeral: true
        });

        const ref = this.client
            .getService<ReferralService>('referral')
            .findRef(code, context.isRanByModerator() ? undefined : context.user.id, context.isRanByModerator() ? undefined : context.guild.id);

        if (!ref) {
            return context.error({
                ephemeral: true,
                content: "Could not find a referral with that code!"
            });
        }

        await context.reply({
            embeds: [
                {
                    title: `Referral #${ref.id}`,
                    description: `${heading("Code", HeadingLevel.Three)}\n||${ref.code}||`,
                    color: Colors.Blurple,
                    fields: [
                        {
                            name: "Uses",
                            value: ref.usedBy.length.toString(),
                            inline: true
                        },
                        ...(ref.createdBy !== context.user.id ? [
                            {
                                name: "Created By",
                                value: ref.usedBy.length.toString(),
                                inline: true
                            }
                        ] : []),
                        {
                            name: "Last Used At",
                            value: ref.usedBy.length === 0 ? '*Not yet*' : `${time(ref.lastUsedAt, 'F')} (${time(ref.lastUsedAt, 'R')})`
                        }
                    ],
                    footer: {
                        text: `Only ${ref.createdBy === context.user.id ? 'you' : 'the creator'} and the moderators can see statistics for this referral`
                    },
                    timestamp: ref.createdAt.toISOString()
                }
            ]
        });
    }
}

export default RefViewCommand;