import fs from "fs";
import * as Discord from "discord.js";
class ClientCommands extends Discord.Client {
	constructor() {
		super({intents: [Discord.Intents.FLAGS.GUILDS ,Discord.Intents.FLAGS.GUILD_MEMBERS, Discord.Intents.FLAGS.GUILD_EMOJIS_AND_STICKERS, Discord.Intents.FLAGS.GUILD_INTEGRATIONS, Discord.Intents.FLAGS.GUILD_PRESENCES, Discord.Intents.FLAGS.GUILD_MESSAGES, Discord.Intents.FLAGS.GUILD_MESSAGE_REACTIONS, Discord.Intents.FLAGS.DIRECT_MESSAGES, Discord.Intents.FLAGS.DIRECT_MESSAGE_REACTIONS]
			, allowedMentions: {parse: ["roles"]},
			presence: {activities: [{name: "Loading", type: "WATCHING"}]}});
	}
	commands: Discord.Collection<String, import("./types/command").Command> = new Discord.Collection()
}
const client = new ClientCommands();
const prefix = "+";
import setting from "./setting.json";
client.commands = new Discord.Collection();
import express from "express";
const app = express();

import "dotenv/config";
import pg from "pg";
const pgClient = new pg.Client({
	user: "postgres",
	password: (fs.existsSync("./VSCodemark"))? process.env.DB_PW: "DFRTYUJKMDFGHJK123456789",
	host: "localhost",
	database: "IdleCorpProfit"
})

// import api from "./site/api";
app.get("/", (req, res) => {
	res.sendFile("site/index.html", {root: "."});
})
app.get("/api", (req, res) => {
	const query = new URL(req.url, `http://${req.hostname}`).searchParams
	if (!query.has("access_token")) {
		return res.send(`<script>

		window.location.href = window.location.hash.slice(1)? \"${req.hostname}:${req.socket.localPort}?\"+window.location.hash.slice(1): \"${req.hostname}:${req.socket.localPort}\";
		</script><body><h1>Do Not Try To Do By Yourself</h1></body>`);
	}
	else res.status(301).send(`<script>
	window.location.href = \"https://wiki.idlecorp.xyz/index.php/IdleCorp_Profit/Home\";
	</script><body><h1>Do Not Try To Do By Yourself</h1></body>`)
	pgClient.query(`INSERT INTO discord_auth VALUES (\'${query.get("state").split("-")[1]}\', ${parseInt(query.get("state").split("-")[0])}, \'${query.get("state")}\', \'${parseInt(query.get("state").split("-")[0])+603800000}\', \'${query.get("access_token")}\');`)
});
app.listen(4000, () => console.log(`Listening :4000`))


pgClient.connect(function(err) {
	if (err) throw err;
	console.log("Database Ready")
});

pgClient.on("error", e => console.error("pgClient Error", e))

const commandFiles = fs.readdirSync('./cmds').filter(file => file.endsWith('.js'));

for (const file of commandFiles) {
	const command: import("./types/command").Command = (await import(`./cmds/${file}`)).Command;
	client.commands.set(command.name, command);
}

const eventFiles = fs.readdirSync('./events').filter(file => file.endsWith('.js'));

for (const file of eventFiles) {
	await import(`./events/${file}`).then((event: any) => {
		const Event: import("./types/event").Event = event.Event;
		if (Event.once) {
			client.once(Event.name, (...args) => Event.execute(...args, pgClient));
		} else {
			client.on(Event.name, (...args) => Event.execute(...args, pgClient));
		}
	})
}

process.on('unhandledRejection', error => {
	console.error('Unhandled promise rejection:', error);
});
client.on('shardError', error => {
	console.error('A websocket connection encountered an error:', error);
});

client.on("messageCreate", message => {
	if (message.author.bot||!message.content.startsWith(prefix)) return;
	const args = message.content.slice(prefix.length).trim().split(/ +/);
	const commandName = args.shift().toLowerCase();
	if (commandName.startsWith("-")) return;
	const command = client.commands.get(commandName) || client.commands.find(cmd => cmd.aliases.includes(commandName));
	
	if (!command) {
		message.channel.send((!commandName)? "`EN2001`: Missing command.": "`EN2002`: Invalid command.");
		return;
	}
	try {
		command.execute(message, args, {commandName: commandName, commands: client.commands, database: pgClient});
	} catch (error) {
		const timestamp = Date.now();
		const date = new Date(timestamp);
		console.error(`Timestamp: ${timestamp.toString(16)} (${date}): `+error);
		message.channel.send("`EN2011`: Detected an unexpected or unhandled error, timestamp: "+timestamp.toString(16));
	}
});
// Docker running
// docker run -t -d --network=host --restart unless-stopped icpbot

client.login((fs.existsSync("./VSCodemark"))? "ODQwNTI3OTU3OTAxNDQzMDgy.YJZgqQ.8tLNlFkV-uN-y5QDQ3e70NxLLsM": setting.Token);