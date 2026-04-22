import { Schema, model, Document } from "mongoose";

export interface IBridgeMessage extends Document {
    id: string;
    bridgeId: string;

    sourceMessageId: string;
    sourceGuildId: string;

    targetMessageId: string;
    targetGuildId: string;

    sourceChannelId: string;
    targetChannelId: string;
}

const BridgeMessage = new Schema<IBridgeMessage>({
    // Postponed update
}, {
    timestamps: true,
    versionKey: false
});