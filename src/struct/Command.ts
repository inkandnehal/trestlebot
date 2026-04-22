import { ChatInputApplicationCommandData } from "discord.js";
import { TrestleClient } from "./TrestleClient";

export class Command {
    public name: string;
    public description: string;
    public client!: TrestleClient;

    constructor(data: ChatInputApplicationCommandData) {
        this.name = data.name;
        this.description = data.description;    
    }

    exec() {
        throw new Error("Default 'exec' performed in " + this.name);
    }
}