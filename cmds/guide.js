import * as Discord from "discord.js";
import setting from "../setting.json";
import { StringHandlers } from "../funcs/StringHandlers.js";
import guidelist from "../guide.json";
const Command = {
    name: "guide",
    aliases: ["gid", "gud"],
    syntax: "guide [--aliases] [--advanced] [<guide>[.<section>]]",
    description: "Showing the guide from this bot.",
    args: [
        ["--aliases", "The list of the aliases on a related guide topic."],
        ["--advanced", "The advanced guide."],
        ["<guide>", "The guide of the related topic."],
        ["[.<section>]", "The specific related section."]
    ],
    argaliases: [
        ["--aliases", ["--alias", "--als"]],
        ["--advanced", ["--adv"]],
        ["<guide>", ["*All aliases are listed in `guide`*"]]
    ],
    manual: {
        description: "You can use this command to query the whole (community) guide, this guide can also be seen in the IdleCorp Wiki.",
        examples: [
            "guide",
            "guide --advanced",
            "guide land",
            "guide retail.good thing"
        ],
        note: "This guide might not be 100% accurate. Everyone can help improve this guide."
    },
    execute(message, args) {
        if (!args.length)
            return message.channel.send("__**Guides:**__" + Object.entries(guidelist).slice(0, 2).reduce((a, b) => a + "\n\n**" + StringHandlers.capitalize(b[0]) + ":**\n" + Object.keys(b[1]).join("\n"), "") + "\n\nVersion: v." + guidelist.version);
        const alias = ["--aliases", "--alias", "--als"].includes(args[0]);
        if (alias)
            args.shift();
        const level = (["--advanced", "--adv"].includes(args[0])) ? "advanced" : "basic";
        if (level === "advanced")
            args.shift();
        if (!args.length)
            return message.channel.send("`EN0001`: Missing guide topic.");
        args = args.join(" ").split(".");
        if (!Object.keys(guidelist[level]).includes(args[0]))
            args[0] = Object.entries(guidelist.aliases[level]).find(a => a[1]["_index"].includes(args[0]))?.[0];
        if (!(args[0] in guidelist[level]))
            return message.channel.send("`EN0002`: The guide topic was invalid.");
        const name = args.shift();
        const part = (!Object.keys(guidelist[level][name]).includes(args[0])) ? Object.entries(guidelist.aliases[level][name]).find((a) => a[1].includes(args[0]))?.[0] : args[0];
        if (part === undefined && args.length)
            return message.channel.send("`EN0002`: Invalid guide section.");
        let embed = new Discord.MessageEmbed();
        if (!alias) {
            if (part) {
                embed.setTitle("Guide -- " + StringHandlers.capitalize(name) + " -- " + StringHandlers.capitalize(part))
                    .setColor([136, 136, 255])
                    .setDescription(guidelist[level][name][part])
                    .addField("\u200b", "Version: v." + guidelist["version"])
                    .setFooter({ text: message.client.user.username + " | " + setting.version, iconURL: message.client.user.displayAvatarURL() });
                message.channel.send({ embeds: [embed] });
            }
            else {
                embed.setTitle("Guide -- " + StringHandlers.capitalize(name))
                    .setColor([136, 136, 255])
                    .setDescription(Object.entries(guidelist[level][name]).reduce((a, b) => a + StringHandlers.capitalize(b[0]) + " -- " + b[1] + "\n", ""))
                    .addField("\u200b", "Version: v." + guidelist["version"])
                    .setFooter({ text: message.client.user.username + " | " + setting.version, iconURL: message.client.user.displayAvatarURL() });
                message.channel.send({ embeds: [embed] });
            }
        }
        else {
            if (part) {
                if (part === "_index")
                    return message.channel.send("`EN0006`: The guide name was invalid.");
                embed.setTitle("Guide Aliases -- " + StringHandlers.capitalize(name) + " -- " + StringHandlers.capitalize(part))
                    .setColor([136, 136, 255])
                    .setDescription("Aliases: " + (guidelist["aliases"][level][name][part].join(", ") || "None"))
                    .addField("\u200b", "Version: v." + guidelist["version"])
                    .setFooter({ text: message.client.user.username + " | " + setting.version, iconURL: message.client.user.displayAvatarURL() });
                message.channel.send({ embeds: [embed] });
            }
            else {
                embed.setTitle("Guide Aliases -- " + StringHandlers.capitalize(name))
                    .setColor([136, 136, 255])
                    .setDescription(Object.entries(guidelist["aliases"][level][name]).reduce((a, b) => a + StringHandlers.capitalize(b[0]) + " -- Aliases: " + (b[1].join(", ") || "None") + "\n", ""))
                    .addField("\u200b", "Version: v." + guidelist["version"])
                    .setFooter({ text: message.client.user.username + " | " + setting.version, iconURL: message.client.user.displayAvatarURL() });
                message.channel.send({ embeds: [embed] });
            }
        }
    }
};
export { Command };
//# sourceMappingURL=guide.js.map