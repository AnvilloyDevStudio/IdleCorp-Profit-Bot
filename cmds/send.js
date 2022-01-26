const fs = require('fs');
const cmdInfo = require("../cmdsinfo.json");

module.exports = {
	name: "send",
	execute(message, args) {
        if (!message.member.roles.cache.findKey((a, b) => ["841622372351344650", "801052590389329930", "801052697498746920"].includes(b))) return message.channel.send("`EN0111`: You don't have enough permission.");
        const channels = message.guild.channels.cache;
        args = args.join("");
        const chid = args.match(/\d+/)?.[0];
        if (!channels.has(chid)) return message.channel.send("`EN0006`: The channel id was invalid.")
        channels.get(chid).send("This is a message")
    }
}