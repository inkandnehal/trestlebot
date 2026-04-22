import { Client, GatewayIntentBits, Collection, REST, Routes } from "discord.js";
import { Command } from "./Command";

import path from "node:path";
import fs from "node:fs";
import { pathToFileURL } from "node:url";

export class TrestleClient extends Client {
    public commands = new Collection<string, Command>();

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
            
            const username = readiedClient.user!.username;
            const id = readiedClient.user.id;

            console.info(`${username} (${id}) is now active :)`);
            this.loadCommands();
        });

        this.on("interactionCreate", async interaction => {
            if (!interaction.isChatInputCommand()) return;
            const command = this.commands.get(interaction.commandName);

            if (!command) {
                console.error(`No command matching ${interaction.commandName} was found.`);
                return;
            }
            
            try {
                command.interaction = interaction;
                command.client = this;
                await command.exec();
            } catch (error) {
                console.error(`Error executing ${interaction.commandName}`);
                console.error(error);
            }
        });
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
                console.log("File URL is this", fileUrl);
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

        const rest = new REST({ version: "10" }).setToken(process.env.DISCORD_TOKEN!);

        try {
            console.log("Started refreshing application (/) commands.");
            await rest.put(
                Routes.applicationCommands(this.user!.id),
                { body: commands.map(cmd => cmd.data) }
            );

            console.log("Successfully reloaded application (/) commands.");
        } catch (error) {
            console.error(error);
        }

        console.info(`Loaded ${this.commands.size} commands!`);
    }
}