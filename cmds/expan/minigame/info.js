const Discord = require("discord.js");
const setting = require("../../../setting.json");
const fetch = require("node-fetch");
const StringHandlers = require("../../../funcs/StringHandlers");

module.exports = {
    execute(message, args) {
        const version = "1.0.0"
        fetch("https://api.bit.io/api/v1beta/query/", {method: "POST", headers: {Accept: "application/json", "Content-Type": "application/json", Authorization: "Bearer 9Nen_UuTrFikB2Mpjw6r3ic3YVpd"}, body: JSON.stringify({query_string: "SELECT * FROM \"BenChueng0422/IdleCorp-Profit\".\"minigame\";"})}).then(d => d.json()).then(dt => {
            message.channel.send(new Discord.MessageEmbed()
                .setTitle("Minigame Information")
                .setDescription("A minigame system\nYou generate energy for better energy generator.\n\nPlayers joined: "+dt["data"].length+"\n\n\nVersion: v."+version)
                .setTimestamp()
                .setFooter(message.client.user.username+" | "+setting["version"], message.client.user.displayAvatarURL()));
        })
    }
}