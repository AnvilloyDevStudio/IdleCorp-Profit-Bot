const Event = {
    name: "guildMemberAdd",
    execute(member, client, database) {
        member.guild.channels.fetch("801057721205522432").then((channel) => channel.send("Welcome " + member.toString() + ", this is the IdleCorp Profit project server. Feel free to use the bot. you can take over <#801060352108134440> to understand the rules."));
    },
};
export { Event };
//# sourceMappingURL=guildMemberAdd.js.map