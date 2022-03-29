import * as Discord from "discord.js";
import setting from "../setting.json";
import ruledt from "../rules.json";

const Command: import("../types/command").Command = {
    name: "rules",
    aliases: ["rl", "r", "ru"],
    syntax: "rules [--<version>] [<rule number>]",
    description: "Showing the current or previous versions of the server rules or the specific rule.",
    args: [
        ["[--<version>]", "The rule version, defaults with the latest."],
        ["[<rule number>]", "Specifying the specific rule number, defaults with the whole rules."]
    ],
    manual: {
        description: "This command is used to show the whole or the specific server rules.",
        examples: [
            "rules",
            "rules --1.0.1",
            "rules 4"
        ]
    },
    execute(message, args) {
        let embed = new Discord.MessageEmbed()
            .setTitle("Server Rules and Regards")
            .setColor("ORANGE")
            .setTimestamp();
        if (args.length) {
            let version: string, ru: {
                head: string;
                head_notes: string[];
                rules: string[];
                end: string[];
            };
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
                let prints: string[] = []
                for (const a in ru) {
                    if (a === "end") {
                        prints.push(...ru[a]);
                        continue;
                    }
                    if (Array.isArray(ru[a])) {
                        if (a === "head_notes") prints.push(...ru[a].map(a => "*"+a+"*"));
                        else if (a === "rules") prints.push(...ru[a].map((a, b) => `**${b}.**${a}`));
                        else prints.push(...ru[a]);
                    } else prints.push(ru[a]);
                }
                prints.push("\n**v."+version+"** of the server rules");
                embed.setDescription(prints.join("\n"))
            } else embed.setDescription("**"+num+".**"+(ru["rules"]?.[num-1]??"Unexist.")+"\n\nv."+version)
        } else {
            const ru = Object.entries<{
                head: string;
                head_notes: string[];
                rules: string[];
                end: string[];
            }>(ruledt).slice(-1)[0],
            version = ru[0],
            rule = ru[1];
            let prints = [];
            for (const a in rule) {
                if (a === "end") {
                    prints.push(...rule[a]);
                    continue;
                }
                if (Array.isArray(rule[a])) {
                    if (a === "head_notes") prints.push(...rule[a].map(a => "*"+a+"*"));
                    else if (a === "rules") prints.push(...rule[a].map((a, b) => `**${b}.**${a}`));
                    else prints.push(...rule[a]);
                } else prints.push(rule[a]);
            }
        prints.push("\n**v."+version+"** of the server rules");
            embed.addFields([{name: "\u200b", value: prints.splice(0, ~~(prints.length/2)).join("\n"), inline: false},
                {name: "\u200b", value: prints.join("\n"), inline: false}]);
        }
        embed.setFooter({text: message.client.user.username+" | "+setting["version"], iconURL: message.client.user.displayAvatarURL()});
        message.channel.send({embeds: [embed]});
    }
}
export {Command};