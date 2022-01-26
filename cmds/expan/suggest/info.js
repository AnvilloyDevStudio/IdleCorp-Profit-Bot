const Discord = require("discord.js");
const setting = require("../../../setting.json");
const fetch = require("node-fetch");
const StringHandlers = require("../../../funcs/StringHandlers");

module.exports = {
    execute(message, args) {
        const suggest_id = Number(args.shift());
        if (Number.isNaN(suggest_id)) return message.channel.send("`EN0002`: The number was invalid.");
        fetch("https://api.bit.io/api/v1beta/query/", {method: "POST", headers: {Accept: "application/json", "Content-Type": "application/json", Authorization: "Bearer 9Nen_UuTrFikB2Mpjw6r3ic3YVpd"}, body: JSON.stringify({query_string: "SELECT * FROM \"BenChueng0422/IdleCorp-Profit\".\"suggestions\" WHERE suggestion_id = "+suggest_id})}).then(d => d.json()).then(dt => {
            if (!dt["data"].length) return message.channel.send("`EN0002`: The suggestion id was invalid.");
            const value = dt["data"][0];
            message.client.users.fetch(value[4]).then(user => {
                embed = new Discord.MessageEmbed()
                    .setTitle("Suggestion info")
                    .setColor([255, 255, 190])
                    .setDescription("**"+value[5].length+"**")
                    .setTimestamp()
                    .setAuthor(user.id, user.displayAvatarURL())
                    .addField(value[0]+" \t\t\t ["+StringHandlers.capitalize(value[2]).replaceAll("_", " ")+"]", `${value[1]}\n\nSuggestion creator: <@!${value[4]}>\nCreated at: <t:${~~(new Date(value[3]).getTime()/1000)}> (UTC)`)
                    .setFooter(message.client.user.username+" | "+setting.version, message.client.user.displayAvatarURL());;
                message.channel.send(embed);
            })
        })
    }
}