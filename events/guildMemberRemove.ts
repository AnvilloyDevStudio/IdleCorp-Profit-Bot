const Event: import("../types/event").Event = {
	name: "guildMemberRemove",
	execute(member: import("discord.js").GuildMember, client: import("discord.js").Client) {
		member.guild.channels.fetch("801057721205522432").then((channel: import("discord.js").TextChannel) => channel.send(member.toString()+" left this server."));
	},
}
export {Event};