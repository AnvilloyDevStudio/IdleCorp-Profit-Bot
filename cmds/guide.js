const Discord = require("discord.js");
const setting = require("../setting.json");
const cmdInfo = require("../cmdsinfo.json");
const StringHandlers = require("../funcs/StringHandlers.js");
const guidelist = require("../guide.json");

module.exports = {
    name: "guide",
    execute(message, args) {
        if (!args.length) return message.channel.send("__**Guides:**__"+Object.entries(guidelist).slice(0, 2).reduce((a, b) => a+"\n\n**"+StringHandlers.capitalize(b[0])+":**\n"+Object.keys(b[1]).join("\n"), "")+"\n\nVersion: v."+guidelist.version);
        const alias = ["--aliases", "--alias", "--als"].includes(args[0]);
        if (alias) args.shift();
        const level = (["--advanced", "--adv"].includes(args[0]))? "advanced": "basic";
        if (["--advanced", "--adv"].includes(args[0])) args.shift();
        if (!args.length) return message.channel.send("`EN0001`: Missing guide name.");
        args = args.join(" ").split(".");
        if (!Object.keys(guidelist[level]).includes(args[0])) args[0] = Object.entries(guidelist["aliases"][level]).find(a => a[1]["_index"].includes(args[0]))?.[0]
        if (!(args[0] in guidelist[level])) return message.channel.send("`EN0002`: The guide name was invalid.");
        const name = args.shift();
        const part = (!Object.keys(guidelist[level][name]).includes(args[0]))? Object.entries(guidelist["aliases"][level][name]).find(a => a[1].includes(args[0]))?.[0]: args[0];
        if (part === undefined&&args.length) return message.channel.send("`EN0002`: Invalid guide part.")
        let embed;
        if (!alias) {
            if (part) {
                embed = new Discord.MessageEmbed()
                    .setTitle("Guide -- "+StringHandlers.capitalize(name)+" -- "+StringHandlers.capitalize(part))
                    .setColor([136, 136, 255])
                    .setDescription(guidelist[level][name][part])
                    .addField("\u200b", "Version: v."+guidelist["version"])
                    .setFooter(message.client.user.username+" | "+setting.version, message.client.user.displayAvatarURL());
                message.channel.send(embed)
            } else {
                embed = new Discord.MessageEmbed()
                    .setTitle("Guide -- "+StringHandlers.capitalize(name))
                    .setColor([136, 136, 255])
                    .setDescription(Object.entries(guidelist[level][name]).reduce((a, b) => a+StringHandlers.capitalize(b[0])+" -- "+b[1]+"\n",  ""))
                    .addField("\u200b", "Version: v."+guidelist["version"])
                    .setFooter(message.client.user.username+" | "+setting.version, message.client.user.displayAvatarURL());
                message.channel.send(embed)
            }
        } else {
            if (part) {
                if (part === "_index") return message.channel.send("`EN0006`: The guide name was invalid.");
                embed = new Discord.MessageEmbed()
                    .setTitle("Guide Aliases -- "+StringHandlers.capitalize(name)+" -- "+StringHandlers.capitalize(part))
                    .setColor([136, 136, 255])
                    .setDescription("Aliases: "+(guidelist["aliases"][level][name][part].join(", ") || "None"))
                    .addField("\u200b", "Version: v."+guidelist["version"])
                    .setFooter(message.client.user.username+" | "+setting.version, message.client.user.displayAvatarURL());
                message.channel.send(embed)
            } else {
                embed = new Discord.MessageEmbed()
                    .setTitle("Guide Aliases -- "+StringHandlers.capitalize(name))
                    .setColor([136, 136, 255])
                    .setDescription(Object.entries(guidelist["aliases"][level][name]).reduce((a, b) => a+StringHandlers.capitalize(b[0])+" -- Aliases: "+(b[1].join(", ") || "None")+"\n",  ""))
                    .addField("\u200b", "Version: v."+guidelist["version"])
                    .setFooter(message.client.user.username+" | "+setting.version, message.client.user.displayAvatarURL());
                message.channel.send(embed)
            }
        }
    }
}