import { SlashCommandBuilder, ChatInputCommandInteraction } from "discord.js";
import { Command } from "../../struct/Command";

export default class PingCommand extends Command {
  constructor() {
    super(
      new SlashCommandBuilder()
        .setName("ping")
        .setDescription("Replies with Pong!")
        .toJSON()
    );
  }

  async exec() {
    await this.interaction.reply("Ahlelele Ahlelas!");
  }
}