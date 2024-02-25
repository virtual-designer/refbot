import Command from "../../core/Command";
import { Context } from "../../core/CommandContext";
import ReferralService from "../../services/ReferralService";
import { Colors, heading, HeadingLevel, time } from "discord.js";
import { ArgumentType } from "../../core/Arguments";

class RefUsersCommand extends Command {
    public readonly name = 'ref::users';
    public readonly description = 'List the users of a referral.';
    public readonly group = 'refs';
    public readonly syntax = '<code: string>';
    public readonly supportsInteractions = false;

    public async handle(context: Context) {
        const code: string = (context.type === "legacy" ? await context.args.at(1, ArgumentType.String, false, {
            required: "Please provide a referral code!"
        }) : context.interaction.options.getString('code', true));

        await context.defer({
            ephemeral: true
        });

        const ref = await this.client.getService<ReferralService>('referral').findRef(code, context.isRanByModerator() ? undefined : context.user.id);

        if (!ref) {
            return context.error({
                ephemeral: true,
                content: "Could not find a referral with that code!"
            });
        }

        let description = '';

        for (const user of ref.usedBy) {
            description += `* <@${user.id}> - \`${user.id}\` - ${time(user.createdAt, 'R')}\n`;
        }

        await context.reply({
            embeds: [
                {
                    title: `Users of Referral #${ref.id}`,
                    color: Colors.Blurple,
                    description: description === '' ? '*No users yet*' : description,
                    fields: [
                        {
                            name: "Total Uses",
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
                            value: ref.usedBy.length === 0 ? '*Not yet*' : `${time(ref.updatedAt, 'F')} (${time(ref.updatedAt, 'R')})`
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

export default RefUsersCommand;