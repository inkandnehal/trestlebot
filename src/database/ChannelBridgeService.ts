import { TrestleClient } from "../struct/TrestleClient";
import { db } from "../config/db";
import keygen from "keygen";

type ChannelBridge = {
    id: string;
    guildAId: string;
    channelAId: string;
    guildBId: string;
    channelBId: string;
    connectionKey: string;
    status: "pending" | "connected";
};

export class ChannelBridgeService {
    createBridge(guildId: string, channelId: string, createdBy: string): ChannelBridge {
        const existingBridge = db.prepare(
            `select * from channelBridge
            where (guildAId = ? and channelAId = ?) or (guildBId = ? and channelBId = ?)
            `
        ).get(guildId, channelId, guildId, channelId);

        if (existingBridge) {
            throw new Error("Channel is already bridged");
        }

        const bridgeId = keygen.url(16);
        const connectionKey = keygen.url(22);

        db.prepare(
            `insert into channelBridge (id, guildAId, channelAId, createdBy, connectionKey)
            values (?, ?, ?, ?, ?)
            `
        ).run(bridgeId, guildId, channelId, createdBy, connectionKey);

        const bridge = db.prepare(
            `select * from channelBridge where id = ?`
        ).get(bridgeId);

        return bridge as ChannelBridge;
    }

    connectBridge(connectionKey: string, guildId: string, channelId: string) {
        const bridge = db.prepare(
            `select * from channelBridge where connectionKey = ?`
        ).get(connectionKey);

        if (!bridge) {
            throw new Error("Invalid connection key!");
        }

        db.prepare(
            `update channelBridge set guildBId = ?, channelBId = ?, status = 'connected' where connectionKey = ?`
        ).run(guildId, channelId, connectionKey);

        return db.prepare(
            `select * from channelBridge where connectionKey = ?`
        ).get(connectionKey);
    }

    getBridge(guildId: string, channelId: string): ChannelBridge | undefined {
        const bridge = db.prepare(
            `select * from channelBridge
            where ((guildAId = ? and channelAId = ?) or (guildBId = ? and channelBId = ?))
            and status = 'connected'
            `
        ).get(guildId, channelId, guildId, channelId);

        return bridge as ChannelBridge;
    }
}

// import { TrestleClient } from "../struct/TrestleClient";
// import { ChannelBridge, IChannelBridge } from "./models/ChannelBridge";
// import keygen from "keygen";

// export class ChannelBridgeService {
//     async createBridge(data: Omit<IChannelBridge, "id" | "createdAt" | "updatedAt">) {
//         const existingBridge = await ChannelBridge.findOne({
//             $or: [
//                 { guildAId: data.guildAId, channelAId: data.channelAId },
//                 { guildBId: data.guildAId, channelBId: data.channelAId }
//             ]
//         });

//         if (existingBridge) {
//             throw new Error("Channel is already bridged");
//         }

//         const bridge = new ChannelBridge(data);
//         bridge.id = keygen.url(keygen.medium);
//         bridge.connectionKey = keygen.url(keygen.medium);

//         await bridge.save();
//         return bridge;
//     }

//     async connectBridge(connectionKey: string, guildBId: string, channelBId: string) {
//         const bridge = await ChannelBridge.findOne({ connectionKey });
//         if (!bridge) {
//             throw new Error("Invalid connection key");
//         }

//         bridge.guildBId = guildBId;
//         bridge.channelBId = channelBId;
//         bridge.status = "connected";
//         bridge.connectedAt = new Date();

//         await bridge.save();
//         return bridge;
//     }

//     async getChannelBridge(channelId: string, guildId: string) {
//         const bridge = await ChannelBridge.findOne({
//             $or: [
//                 { guildAId: guildId, channelAId: channelId },
//                 { guildBId: guildId, channelBId: channelId }
//             ],
//             status: "connected"
//         });

//         return bridge;
//     }
// }