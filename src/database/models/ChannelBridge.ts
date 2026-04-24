import { Schema, model, Document } from "mongoose";

export interface IChannelBridge extends Document {
  id?: string;

  guildAId: string;
  channelAId: string;

  guildBId: string;
  channelBId: string;

  status: "pending" | "connected" | "disconnected";
  connectionKey: string;

  createdBy: string;
  connectedAt?: Date;

  createdAt: Date;
  updatedAt: Date;
}

const ChannelBridgeSchema = new Schema<IChannelBridge>(
  {
    id: String,

    guildAId: { type: String, required: true },
    channelAId: { type: String, required: true, unique: true },

    guildBId: { type: String, defualt: null },
    channelBId: { type: String, unique: true, default: null },

    status: {
      type: String,
      enum: ["pending", "connected", "disconnected"],
      default: "pending",
    },

    connectionKey: { type: String, required: true, unique: true },

    createdBy: { type: String, required: true },
    connectedAt: Date,
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

export const ChannelBridge = model<IChannelBridge>(
  "ChannelBridge",
  ChannelBridgeSchema
);