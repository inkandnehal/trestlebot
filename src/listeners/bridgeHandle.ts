import { Message } from "discord.js";
import { Listener } from "../struct/Listener";

export default class bridgeHandle extends Listener {
    public constructor() {
        super("messageCreate", true);
    }

    public async exec(message: Message<true>) {
        const bridge = this.client.channelBridgeService.getBridge(message.guildId!, message.channelId);
        if (!bridge) return;

        const targetChannelId = message.channelId === bridge.channelAId ? bridge.channelBId : bridge.channelAId;
        const targetGuildId = message.guildId === bridge.guildAId ? bridge.guildBId : bridge.guildAId;

        const targetGuild = this.client.guilds.cache.get(targetGuildId);
        if (!targetGuild) {
            console.error(`Target guild ${targetGuildId} not found for channel bridge ${bridge.id}`);
            return;
        }

        const targetChannel = targetGuild.channels.cache.get(targetChannelId);

        if (!targetChannel || !targetChannel.isTextBased()) {
            console.error(`Target channel ${targetChannelId} not found or is not text-based for channel bridge ${bridge.id}`);
            return;
        }

        if (message.author.id === this.client.user!.id) {
            return;
        }

        try {
            await targetChannel.send({
                content: `**${message.author.tag}**: ${message.content}`,
                files: message.attachments.map(att => att.url)
            });
        } catch (error) {
            console.error(`Failed to send message through channel bridge ${bridge.id}`);
        }
    }
}