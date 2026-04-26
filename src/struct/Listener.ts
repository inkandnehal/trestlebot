import { ClientEvents } from "discord.js";
import { TrestleClient } from "./TrestleClient";

export class Listener<K extends keyof ClientEvents = keyof ClientEvents> {
    public name: K;
    public once: boolean;
    public client!: TrestleClient;

    constructor(name: K, once = false) {
        this.name = name;
        this.once = once;
    }

    exec(...args: ClientEvents[K]): void | Promise<void> {
        throw new Error("Default 'exec' performed in " + String(this.name));
    }
}