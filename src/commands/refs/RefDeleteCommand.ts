import Command from "../../core/Command";
import { Context } from "../../core/CommandContext";
import ReferralService from "../../services/ReferralService";
import { Colors } from "discord.js";
import { ArgumentType } from "../../core/Arguments";

class RefDeleteCommand extends Command {
    public readonly name = 'ref::delete';
    public readonly description = 'Delete a referral.';
    public readonly group = 'refs';
    public readonly syntax = '<code: string>';
    public readonly supportsInteractions = false;

    public async handle(context: Context) {
        const code: string = (context.type === "legacy" ? await context.args.at(1, ArgumentType.String, false, {
            required: "Please provide a referral code to delete!"
        }) : context.interaction.options.getString('code', true));

        await context.defer({
            ephemeral: true
        });

        const success = await this.client
            .getService<ReferralService>('referral')
            .deleteRef(code, context.isRanByModerator() ? undefined : context.user.id, context.isRanByModerator() ? undefined : context.user.id);

        if (!success) {
            return context.error({
                ephemeral: true,
                content: "Could not find a referral with that code!"
            });
        }

        return context.success("Successfully deleted the referral.");
    }
}

export default RefDeleteCommand;