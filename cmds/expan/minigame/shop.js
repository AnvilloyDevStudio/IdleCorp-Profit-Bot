const Discord = require("discord.js");
const setting = require("../../../setting.json");
const StringHandlers = require("../../../funcs/StringHandlers");

module.exports = {
    execute(message, args) {
        message.channel.send(new Discord.MessageEmbed()
            .setTitle("Minigame shop")
            .setDescription("`1` 10 energy -- Hand-cranked generator MK2\n`2` 30 energy -- Hand-cranked generator MK3\n`3` 60 energy -- Hand-cranked generator MK4\n`4` 100 energy -- Bicycle generator\n`5` 150 energy -- Bicycle generator MK2")
            .setTimestamp()
            .setFooter(message.client.user.username+" | "+setting["version"], message.client.user.displayAvatarURL()));
    }
}