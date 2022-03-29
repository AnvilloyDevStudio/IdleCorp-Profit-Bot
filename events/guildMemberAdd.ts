const Event: import("../types/event").Event = {
	name: "guildMemberAdd",
	execute(member: import("discord.js").GuildMember, client, database) {
		member.guild.channels.fetch("801057721205522432").then((channel: import("discord.js").TextChannel) => channel.send("Welcome "+member.toString()+", this is the IdleCorp Profit project server. Feel free to use the bot. you can take over <#801060352108134440> to understand the rules."));
	},
}
export {Event};