import { Client, GatewayIntentBits } from "discord.js";

export class TrestleClient extends Client {
    constructor() {
        super({
            intents: [
                GatewayIntentBits.MessageContent
            ],

            allowedMentions: {
                parse: ["everyone", "roles"]
            }
        });

        this.once("clientReady", readiedClient => {
            console.info("Bot Connection Established!");
            
            const username = readiedClient.user.username;
            const id = readiedClient.user.id;

            console.info(`${username} (${id}) is now active :)`);
        });
    }
}