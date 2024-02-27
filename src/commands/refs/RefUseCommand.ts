import Command from "../../core/Command";
import { Context } from "../../core/CommandContext";
import ReferralService from "../../services/ReferralService";
import {
    Colors,
    Embed,
    EmbedData,
    heading,
    HeadingLevel,
    Snowflake,
    TextChannel,
    time,
    APIEmbed,
    MessagePayload, MessageCreateOptions
} from "discord.js";
import { ArgumentType } from "../../core/Arguments";
import Client from "../../core/Client";

class RefUseCommand extends Command {
    public readonly name = 'ref::use';
    public readonly description = 'Use a referral.';
    public readonly group = 'refs';
    public readonly syntax = '<code: string>';
    public readonly supportsInteractions = false;
    protected static _client: Client;

    constructor(client: Client) {
        super(client);
        RefUseCommand._client = client;
    }

    public static async use(code: string, isMod: boolean, guildId: Snowflake | undefined, userId: Snowflake): Promise<{
        error?: string;
        success?: string | MessageCreateOptions;
    }> {
        const service = this._client.getService<ReferralService>('referral');
        const ref = service.findRef(code);

        if (!ref) {
            return {
                error: "Could not find a referral with that code!"
            };
        }

        check:
        if (!isMod && guildId !== ref.guildId) {
            let inviteCode: string | undefined;
            let isMember = false;
            const guild = this._client.guilds.cache.get(ref.guildId) ?? (await this._client.guilds.fetch(ref.guildId));

            if (!guild) {
                return {
                    error: "This referral is currently unavailable."
                };
            }

            try {
                await guild.members.fetch(userId);
                isMember = true;
            }
            catch {
                isMember = false;
            }

            if (!isMember) {
                if (guild?.vanityURLCode) {
                    inviteCode = guild.vanityURLCode;
                }
                else {
                    const invite = guild.invites.cache.first() ?? (await guild.invites.fetch()).first() ?? (await guild.invites.create(guild.channels.cache.find(c => c.isTextBased()) as TextChannel));
                    inviteCode = invite.code;
                }
            }

            if (isMember && !guildId) {
                break check;
            }

            return {
                success: {
                    embeds: [
                        {
                            author: guild ? {
                                name: guild.name,
                                icon_url: guild.iconURL() ?? undefined
                            } : undefined,
                            description: `${heading(guildId ? "This referral is not for this server!" : "You must join this server to use the referral code!", HeadingLevel.Three)}\n${isMember ? `You're already a member of that server. Please run this command in that server instead.` : `Join the server using the following invite link: https://discord.gg/${inviteCode}`}`,
                            color: Colors.Blurple,
                        }
                    ]
                }
            };
        }

        const { error } = await service.addUser(ref.code, ref.guildId, userId);

        if (error) {
            return {
                error
            };
        }

        return {
            success: ":tada: You've successfully used the referral code!"
        };
    }

    public async handle(context: Context) {
        const code: string = (context.type === "legacy" ? await context.args.at(1, ArgumentType.String, false, {
            required: "Please provide a referral code!"
        }) : context.interaction.options.getString('code', true));

        await context.defer({
            ephemeral: true
        });

        const { error, success } = await RefUseCommand.use(
            code,
            context.isRanByModerator(),
            context.guild.id,
            context.user.id,
        );

        if (error) {
            return context.error(error);
        }

        return context.reply(success!);
    }
}

export default RefUseCommand;