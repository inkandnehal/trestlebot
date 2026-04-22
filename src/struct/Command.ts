import { 
    ChatInputCommandInteraction, 
    RESTPostAPIChatInputApplicationCommandsJSONBody 
} from "discord.js";
import { TrestleClient } from "./TrestleClient";

export class Command {
    public name: string;
    public description: string;
    public data: RESTPostAPIChatInputApplicationCommandsJSONBody;
    public client!: TrestleClient;
    public interaction!: ChatInputCommandInteraction;

    constructor(data: RESTPostAPIChatInputApplicationCommandsJSONBody) {
        this.name = data.name;
        this.description = data.description;  
        this.data = data;  
    }

    exec(): void {
        throw new Error("Default 'exec' performed in " + this.name);
    }
}