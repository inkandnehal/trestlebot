import { Client, GatewayIntentBits, Collection, REST, Routes, Guild } from "discord.js";
import { ChannelBridgeService } from "../database/ChannelBridgeService";
import { Command } from "./Command";

import path from "node:path";
import fs from "node:fs";
import { pathToFileURL } from "node:url";

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

        this.on("messageCreate", async message => {
            console.log("Message created", message.content);
            const bridge = await this.channelBridgeService.getChannelBridge(message.channelId, message.guildId!);
            if (!bridge) return;

            const targetChannelId = message.channelId === bridge.channelAId ? bridge.channelBId : bridge.channelAId;
            const targetGuildId = message.guildId === bridge.guildAId ? bridge.guildBId : bridge.guildAId;

            const targetGuild = this.guilds.cache.get(targetGuildId);
            if (!targetGuild) {
                console.error(`Target guild ${targetGuildId} not found for channel bridge ${bridge.id}`);
                return;
            }

            const targetChannel = targetGuild.channels.cache.get(targetChannelId);

            if (!targetChannel || !targetChannel.isTextBased()) {
                console.error(`Target channel ${targetChannelId} not found or is not text-based for channel bridge ${bridge.id}`);
                return;
            }

            if (message.author.id === this.user!.id) {
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