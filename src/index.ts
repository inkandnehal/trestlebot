import "./config/env";
import "./config/db";

import { TrestleClient } from "./struct/TrestleClient";
const client = new TrestleClient();

client.login(process.env.DISCORD_TOKEN);