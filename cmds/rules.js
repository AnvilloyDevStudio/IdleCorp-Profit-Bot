const fs = require('fs');
const cmdInfo = require("../cmdsinfo.json");
const Discord = require("discord.js");
const setting = require("../setting.json");
const ruledt = require("../rules.json");

module.exports = {
	name: "rules",
	execute(message, args) {
        let embed;
        if (args.length) {
            let version, ru;
            if (args[0].startsWith("--")) {
                version = args.shift().slice(2);
                if (version in ruledt) ru = ruledt[version]
                else return message.channel.send("`EN0012`: Invalid rule version.");
            } else version = Object.keys(ruledt).slice(-1)[0], ru = ruledt[version];
            if (args.length>1) return message.channel.send("`EN0013`: Too many parameters.");
            let num = 0;
            if (args.length) {
                if (Number.parseInt(args[0])) num = +args[0];
                else return message.channel.send("`EN0002`: The rule number was invalid.")
            }
            if (!num) {
                let prints = []
                for (const a in ru) {
                    if (a === "end") {
                        prints = prints.concat(ru[a]);
                        continue;
                    }
                    if (Array.isArray(ru[a])) {
                        for (let count = 0; count<(ru[a].length); count++)
                            if (a === "head_notes") prints.push("*"+ru[a][count]+"*");
                            else if (a === "rules") prints.push("**"+(count+1)+".**"+ru[a][count]);
                            else prints.push(ru[a][count]);
                    } else prints.push(ru[a])
                }
                prints.push("\n**v."+version+"** of the server rules");
                embed = new Discord.MessageEmbed()
                    .setTitle("Server Rules and Regards")
                    .setColor("ORANGE")
                    .setTimestamp()
                    .addFields([{name: "\u200b", value: prints.splice(0, ~~(prints.length/2)).join("\n"), inline: false},
                    {name: "\u200b", value: prints.join("\n"), inline: false}]);
            } else embed = new Discord.MessageEmbed()
                .setTitle("Server Rules and Regards")
                .setDescription("**"+num+".**"+ru["rules"]?.[num-1]+"\n\nv."+version)
                .setColor("ORANGE")
                .setTimestamp();
        } else {
            const ru = Object.entries(ruledt).slice(-1)[0],
            version = ru[0],
            rule = ru[1];
            let prints = [];
            for (const a in rule) {
                if (a === "end") {
                    prints = prints.concat(rule[a]);
                    continue
                }
                if (Array.isArray(rule[a])) {
                    for (let count = 0; count<(rule[a].length); count++)
                        if (a === "head_notes") prints.push(rule[a][count])
                        else if (a === "rules") prints.push("**"+(count+1)+".**"+rule[a][count]);
                        else prints.push(rule[a]);
                } else prints.push(rule[a]);
            }
            prints.push("\n**v."+version+"** of the server rules");
            embed = new Discord.MessageEmbed()
                .setTitle("Server Rules")
                .setColor("ORANGE")
                .setTimestamp()
                .addFields([{name: "\u200b", value: prints.splice(0, ~~(prints.length/2)).join("\n"), inline: false},
                {name: "\u200b", value: prints.join("\n"), inline: false}]);
        }
        embed.setFooter(message.client.user.username+" | "+setting["version"], message.client.user.displayAvatarURL());
        message.channel.send(embed);
    }
}