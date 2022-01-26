module.exports = {
	name: "guildMemberRemove",
	execute(member, client) {
		member.guild.channels.cache.get("801057721205522432").send("Oh "+member.toString()+" has just left here...")
	}
};