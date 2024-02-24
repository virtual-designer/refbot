import EventListener from "../../core/EventListener";
import { Events, Interaction } from "discord.js";
import CommandService from "../../services/CommandService";

class InteractionCreateEventListener extends EventListener<Events.InteractionCreate> {
    public readonly name = Events.InteractionCreate;

    public async handle(interaction: Interaction) {
        if (!interaction.isChatInputCommand()) {
            return;
        }

        await this.client.getService<CommandService>('command').runFromInteraction(interaction);
    }
}

export default InteractionCreateEventListener;