import { SlashCommandBuilder } from "discord.js";
import { Command } from "../../struct/Command";

export default class BridgeCommand extends Command {
    constructor() {
        super(
            new SlashCommandBuilder()
                .setName("bridge")
                .setDescription("Manage channel bridges")
                .addSubcommand((sub) => {
                    sub.setName("create")
                        .setDescription("Create a new channel bridge")
                        .addChannelOption((option) =>
                            option.setName("channel")
                                .setDescription("The channel to bridge")
                                .setRequired(true)
                        );
                        
                    return sub;
                })
                .addSubcommand((sub) => {
                    sub.setName("connect")
                        .setDescription("Connect a channel to a bridge")
                        .addChannelOption((option) =>
                            option.setName("channel")
                                .setDescription("The channel to connect")
                                .setRequired(true)
                        )
                        .addStringOption((option) =>
                            option.setName("key")
                                .setDescription("The connection key for the bridge")
                                .setRequired(true)
                        );
                    return sub;
                })
                .toJSON()
        )
    }

    public async exec() {
        const i = this.interaction;


        if (i.options.getSubcommand() === "create") {
            if (!i.guildId) {
                return;
            }

            const channel = i.options.getChannel("channel", true);

            const bridge = this.client.channelBridgeService.createBridge(
                i.guildId,
                channel.id,
                i.user.id,
            );

            i.reply({
                content: `Bridge created! Connection key:\n\`${bridge.connectionKey}\``,
                flags: "Ephemeral"
            });
        }

        if (i.options.getSubcommand() === "connect") {
            if (!i.guildId) {
                return;
            }

            const channel = i.options.getChannel("channel", true);
            const key = i.options.getString("key", true);

            try {
                this.client.channelBridgeService.connectBridge(key, i.guildId, channel.id);
                i.reply({
                    content: "Channel successfully connected to bridge!",
                    flags: "Ephemeral"
                });
            } catch (error) {
                i.reply({
                    content: `Error connecting to bridge: ${(error as Error).message}`,
                    flags: "Ephemeral"
                });
            }
        }
    }
}