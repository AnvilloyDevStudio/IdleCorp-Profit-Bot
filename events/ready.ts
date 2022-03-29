import setting from "../setting.json";
import * as fs from "fs";

const Event: import("../types/event").Event = {
	name: "ready",
	once: true,
	execute(client: import("discord.js").Client, database: import("pg").Client) {
		fs.readdir("./loops", (e, f) => {for (const a of f.filter(a => a.endsWith(".js"))) import("../loops/"+a).then(m => m.default(client, database))});
		client.user.setPresence({activities: [{name: "v."+setting.version+" | +help", type: "WATCHING"}]})
		console.log("Bot Client Ready");
	},
}
export {Event};