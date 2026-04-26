import { CacheType, Interaction } from "discord.js";
import { Listener } from "../struct/Listener";

export default class slashHandle extends Listener {
    public constructor() {
        super("interactionCreate", true);
    }

    public async exec(interaction: Interaction<CacheType>) {
        if (!interaction.isChatInputCommand()) return;
        const command = this.client.commands.get(interaction.commandName);

        if (!command) {
            console.error(`No command matching ${interaction.commandName} was found.`);
            return;
        }

        try {
            command.interaction = interaction;
            command.client = this.client;
            await command.exec();
        } catch (error) {
            console.error(`Error executing ${interaction.commandName}`);
            console.error(error);
        }
    }
}