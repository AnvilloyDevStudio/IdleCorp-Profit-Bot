module.exports = {
	name: "guildMemberAdd",
	execute(member, client) {
		member.guild.channels.cache.get("801057721205522432").send("Welcome "+member.toString()+", here is IdleCorp Profit, feel free to use the bot, you can go to <#801060352108134440> to read rules.")
	}
};