import { Client, GatewayIntentBits, Collection } from "discord.js";
import { ChannelBridgeService } from "../database/ChannelBridgeService";
import { Command } from "./Command";

import path from "node:path";
import fs from "node:fs";
import { pathToFileURL } from "node:url";
import { Listener } from "./Listener";

export class TrestleClient extends Client {
    public commands = new Collection<string, Command>();
    public channelBridgeService = new ChannelBridgeService();

    constructor() {
        super({
            intents: [
                GatewayIntentBits.MessageContent,
                GatewayIntentBits.Guilds,
                GatewayIntentBits.GuildMessages
            ],

            allowedMentions: {
                parse: ["everyone", "roles"]
            }
        });

        this.loadListeners();
    }

    async loadListeners() {
        const filesPath = path.join(process.cwd(), "src", "listeners");
        const files = fs.readdirSync(filesPath)
            .filter((f) => f.endsWith(".ts") || f.endsWith(".ts"));
        
        for (const filePath of files) {
            const fileURL = pathToFileURL(path.join(filesPath, filePath)).href;
            const imported = await import(fileURL);

            const ListenerClass = imported.default;
            if (!ListenerClass) {
                console.warn("No default export found in ${filePath}");
                continue;
            }

            const listener: Listener = new ListenerClass();
            listener.client = this;
            this[listener.once ? "once" : "on"](listener.name, (...args) => listener.exec(...args));
        }
    }

    async getCommands() {
        const commands = new Collection<string, Command>();

        const foldersPath = path.join(process.cwd(), "src", "commands");
        const commandFolders = fs.readdirSync(foldersPath);

        for (const folder of commandFolders) {
            const commandsPath = path.join(foldersPath, folder);
            const commandFiles = fs.readdirSync(commandsPath)
                .filter(file => file.endsWith(".ts") || file.endsWith(".js"));

            for (const file of commandFiles) {
                const filePath = path.join(commandsPath, file);
                
                const fileUrl = pathToFileURL(filePath).href;
                const imported = await import(fileUrl);

                const CommandClass = imported.default;

                if (!CommandClass) {
                    console.warn("No default export found in ${filePath}");
                    continue;
                }

                const command: Command = new CommandClass();
                
                if (!command.name) {
                    console.warn(`Command in ${filePath} is missing a name`);
                    continue;
                }

                commands.set(command.name, command);
            }
        }

        return commands;
    }

    async loadCommands() {
        const commands = await this.getCommands();

        commands.forEach((command, name) => {
            this.commands.set(name, command);
        });

        // const rest = new REST({ version: "10" }).setToken(process.env.DISCORD_TOKEN!);

        // try {
        //     console.log("Started refreshing application (/) commands.");
        //     await rest.put(
        //         Routes.applicationCommands(this.user!.id),
        //         { body: commands.map(cmd => cmd.data) }
        //     );

        //     console.log("Successfully reloaded application (/) commands.");
        // } catch (error) {
        //     console.error(error);
        // }

        console.info(`Loaded ${this.commands.size} commands!`);
    }
}