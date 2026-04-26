import { Client } from "discord.js";
import { Listener } from "../struct/Listener";

export default class readyListener extends Listener {
    public constructor() {
        super("clientReady", true);
    }

    public exec(readiedClient: Client<true>) {
        console.info("Bot Connection Established!");

        const username = readiedClient.user!.username;
        const id = readiedClient.user.id;

        console.info(`${username} (${id}) is now active :)`);
        this.client.loadCommands();
    }
}