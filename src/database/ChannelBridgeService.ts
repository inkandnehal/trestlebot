import { TrestleClient } from "../struct/TrestleClient";
import { ChannelBridge, IChannelBridge } from "./models/ChannelBridge";
import keygen from "keygen";

export class ChannelBridgeService {
    async createBridge(data: Omit<IChannelBridge, "id" | "createdAt" | "updatedAt">) {
        const existingBridge = await ChannelBridge.findOne({
            $or: [
                { guildAId: data.guildAId, channelAId: data.channelAId },
                { guildBId: data.guildAId, channelBId: data.channelAId }
            ]
        });

        if (existingBridge) {
            throw new Error("Channel is already bridged");
        }

        const bridge = new ChannelBridge(data);
        bridge.id = keygen.url(keygen.medium);
        bridge.connectionKey = keygen.url(keygen.medium);

        await bridge.save();
        return bridge;
    }

    async connectBridge(connectionKey: string, guildBId: string, channelBId: string) {
        const bridge = await ChannelBridge.findOne({ connectionKey });
        if (!bridge) {
            throw new Error("Invalid connection key");
        }

        bridge.guildBId = guildBId;
        bridge.channelBId = channelBId;
        bridge.status = "connected";
        bridge.connectedAt = new Date();

        await bridge.save();
        return bridge;
    }

    async getChannelBridge(channelId: string, guildId: string) {
        const bridge = await ChannelBridge.findOne({
            $or: [
                { guildAId: guildId, channelAId: channelId },
                { guildBId: guildId, channelBId: channelId }
            ],
            status: "connected"
        });

        return bridge;
    }
}