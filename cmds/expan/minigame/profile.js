const Discord = require("discord.js");
const setting = require("../../../setting.json");
const fetch = require("node-fetch");
const StringHandlers = require("../../../funcs/StringHandlers");

module.exports = {
    execute(message, args) {
        fetch("https://api.bit.io/api/v1beta/query/", {method: "POST", headers: {Accept: "application/json", "Content-Type": "application/json", Authorization: "Bearer 9Nen_UuTrFikB2Mpjw6r3ic3YVpd"}, body: JSON.stringify({query_string: "SELECT * FROM \"BenChueng0422/IdleCorp-Profit\".\"minigame\" WHERE user_id = \'"+message.author.id+"\';"})}).then(d => d.json()).then(dt => {
            let data = dt["data"]?.[0]?.[1];
            if (!data) return message.channel.send("`EN0131`: There is not any data about the user.")
            message.channel.send(new Discord.MessageEmbed()
                .setTitle("Minigame Player profile")
                .setAuthor(message.author.username, message.author.defaultAvatarURL)
                .addField("Profile", "Energy: "+data.energy+"\nCreated on: <t:"+~~(data.createdTimestamp/1000)+">")
                .addField("Inventory", data.inventory.map(a => a.name).join("\n") || "None")
                .setTimestamp()
                .setFooter(message.client.user.username+" | "+setting["version"], message.client.user.displayAvatarURL()));
        })
    }
}