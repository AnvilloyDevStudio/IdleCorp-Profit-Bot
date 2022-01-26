const Discord = require("discord.js");
const setting = require("../../../setting.json");
const fetch = require("node-fetch");
const StringHandlers = require("../../../funcs/StringHandlers");
const Pages = require("../../../funcs/Pages");

module.exports = {
    execute(message, args) {
        const check = {"w": "waiting", "v": "verified", "dis": "discarded", "dev": "developing", "a": "active", "achi": "archived", "act": "activity"};
        const type = check[args[0]] ?? args[0];
        if (type&&!["in_review", "verified", "pass", "not_pass", "done"].includes(type)) return message.channel.send("`EN0002`: Invalid suggestino status detected.");
        fetch("https://api.bit.io/api/v1beta/query/", {method: "POST", headers: {Accept: "application/json", "Content-Type": "application/json", Authorization: "Bearer 9Nen_UuTrFikB2Mpjw6r3ic3YVpd"}, body: JSON.stringify({query_string: "SELECT * FROM \"BenChueng0422/IdleCorp-Profit\".\"suggestions\""})}).then(d => d.json()).then(dt => {
            const page = type? new Pages(dt["data"].find(a => a[2]===type).sort((a, b) => b[5].length-a[5].length).map(a => `${a[0]}  ${a[1].split("\n").slice(0, 1)} [${StringHandlers.capitalize(a[2]).replaceAll("_", " ")}] Votes: **${a[5].length}** -- by: <@!${a[4]}>`), 10): new Pages(dt["data"].sort((a, b) => b[5].length-a[5].length).map(a => `${a[0]}  ${a[1].split("\n").slice(0, 1)} [${StringHandlers.capitalize(a[2]).replaceAll("_", " ")}] Votes: **${a[5].length}** -- by: <@!${a[4]}>`), 10);
            let pn = 1;
            let embed = new Discord.MessageEmbed()
                .setTitle("Suggestion Status List"+(type? " -- "+StringHandlers.capitalize(type): ""))
                .setDescription("Pages: 1/"+page.length())
                .setColor([187, 187, 119])
                .addField("\u200b", page.page(1).join("\n")||"*None*")
                .setTimestamp()
                .setFooter(message.client.user.username+" | "+setting.version, message.client.user.displayAvatarURL())
            message.channel.send(embed).then(msg => 
                msg.react("◀").then(() => msg.react("▶"))
                .then(() => {
                    const back = msg.createReactionCollector((r, u) => r.emoji.name==="◀"&&u.id===message.author.id, {time: 30000})
                    back.on("collect", () => {
                        pn = (pn===1)? page.length(): pn-1
                        embed.fields[0].value = page.page(pn).join("\n") || "*None*"
                        embed.setDescription("Pages: "+pn+"/"+page.length())
                        msg.edit(embed)
                    });
                    const front = msg.createReactionCollector((r, u) => r.emoji.name==="▶"&&u.id===message.author.id, {time: 30000})
                    front.on("collect", () => {
                        pn = (pn===page.length())? 1: pn+1
                        embed.fields[0].value = page.page(pn).join("\n") || "*None*"
                        embed.setDescription("Pages: "+pn+"/"+page.length())
                        msg.edit(embed)
                    })
                })
            )
        })
    }
}