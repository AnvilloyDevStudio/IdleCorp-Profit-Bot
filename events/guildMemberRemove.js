const Event = {
    name: "guildMemberRemove",
    execute(member, client) {
        member.guild.channels.fetch("801057721205522432").then((channel) => channel.send(member.toString() + " left this server."));
    },
};
export { Event };
//# sourceMappingURL=guildMemberRemove.js.map