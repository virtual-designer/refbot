import Command from "../../core/Command";
import { Context } from "../../core/CommandContext";
import ReferralService from "../../services/ReferralService";
import { Colors, EmbedBuilder, heading, HeadingLevel, Message, Snowflake, time } from "discord.js";
import { ArgumentType } from "../../core/Arguments";
import Pagination from "../../utils/Pagination";
import Client from "../../core/Client";

class RefListCommand extends Command {
    public readonly name = 'ref::list';
    public readonly description = 'List all referrals.';
    public readonly group = 'refs';
    public readonly syntax = '<guild: Snowflake>';
    public readonly supportsInteractions = false;
    public readonly moderatorOnly = true;

    public async handle(context: Context) {
        const guildId: Snowflake | null = (context.type === "legacy" ? await context.args.at(1, ArgumentType.String, true) : context.interaction.options.getString('guild_id', false));

        await context.defer({
            ephemeral: true
        });

        const refs = this.client.getService<ReferralService>('referral').getRefs(guildId ?? undefined);
        const guild = guildId ? this.client.guilds.cache.get(guildId) : undefined;
        const timestamp = new Date().toISOString();

        const paginator = new Pagination(refs.reverse(), {
            client: this.client as Client<boolean>,
            guildId: context.guild.id,
            channelId: context.channel.id,
            userId: context.user.id,
            limit: 15,
            timeout: 180_000,
            metadata: {},
            embedBuilder({ data, maxPages, currentPage }) {
                let description = '';

                for (const ref of data) {
                    description += `* \`${ref.code}\` - Created by <@${ref.createdBy}> (${ref.createdBy}) - ${ref.usedBy.length} uses\n`;
                }

                description = description.trim() === '' || refs.length === 0 ? '*No entries.*' : description;

                return new EmbedBuilder({
                    author: {
                        icon_url: guild?.iconURL() ?? undefined,
                        name: guild ? `Referrals in ${guild.name}` : `All referrals`
                    },
                    description,
                    footer: {
                        text: `Page ${currentPage} of ${maxPages}`
                    },
                    color: Colors.Blurple,
                    timestamp
                });
            }
        });

        let message = await context.reply(await paginator.getMessageOptions());

        if (context.type === "interaction") {
            message = await context.interaction.fetchReply();
        }

        await paginator.start(message as Message);
    }
}

export default RefListCommand;