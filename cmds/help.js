import * as Discord from "discord.js";
import setting from "../setting.json";
import cmdInfo from "../cmdsinfo.json";
import { StringHandlers } from "../funcs/StringHandlers.js";
import { Checks } from "../funcs/Checks.js";
const Command = {
    name: "help",
    aliases: ["h"],
    syntax: "help [--info {list|<information>}|[--details] <command>]",
    description: "Showing a list of commands and more detailed.",
    args: [
        ["--info list", "Getting the list of available information topics."],
        ["--info <information>", "Getting the information of a specific topic."],
        ["[--details]", "Getting the information about a command with detailed information as a manual."],
        ["<command>", "Getting the information of a specific command."]
    ],
    argaliases: [
        ["--info", ["--if"]],
        ["list", ["l"]],
        ["--details", ["--details", "--detail", "--d", "--manual", "--man"]]
    ],
    manual: {
        description: "You can use this command to get all the available commands, the information about a specfic command or topic about this bot.",
        examples: [
            "help",
            "help help",
            "help --info list",
            "help --info profitcomplete",
            "help --man help"
        ]
    },
    execute(message, args, extra) {
        let embed = new Discord.MessageEmbed();
        if (!args.length) {
            embed.setTitle("Help -- Commands")
                .setDescription("All the commands will be shown by categories. You would not able to see higher permission commands when you do not have enough permission.")
                .setColor("GREEN")
                .setTimestamp();
            let res = {};
            const cates = [
                ["Information", ["botinfo", "codes", "help", "info", "search"]],
                ["Calculation", ["calculate", "speed", "profit", "profitcomplete", "production"]],
                ["Administration", ["send", "task", "idea"]]
            ];
            for (const a of cates)
                res[a[0]] = [];
            res["Other"] = [];
            for (const cmd of extra.commands.values()) {
                const cate = cates.find(a => a[1].includes(cmd.name))?.[0] || "Other";
                if (cmd.perm > 0 && Checks.isAdmin(message.member))
                    continue;
                res[cate].push(cmd);
            }
            for (const a in res)
                embed.addField("**" + StringHandlers.capitalize(a) + "**", res[a].map(a => "**" + a.name + "**\nDescription: " + a.description + "\nSyntax: " + a.syntax).join("\n\n"), false);
        }
        else {
            if (["--info", "--if"].includes(args[0])) {
                args.shift();
                if (!args.length)
                    return message.channel.send("`EN0001`: Missing information header.");
                const info = args.join(" ");
                let infoctn = Object.keys(cmdInfo.aliases).find((a) => cmdInfo.aliases[a].includes(info)) ?? info;
                if (!(infoctn in cmdInfo["info"]))
                    return message.channel.send("`EN0002`: The information parameter was invalid.");
                embed.setTitle("Help -- Information -- " + StringHandlers.capitalize(infoctn))
                    .setDescription(cmdInfo["info"][infoctn] + ((infoctn === "list") ? Object.keys(cmdInfo["info"]).slice(1).map(a => "> " + a).join("\n") : ""))
                    .setColor([17, 255, 170])
                    .setTimestamp();
            }
            else {
                const ifDetail = ["--details", "--detail", "--d", "--manual", "--man"].includes(args[0]);
                if (ifDetail)
                    args.shift();
                if (!args.length)
                    return message.channel.send("`EN0001`: Missing command name.");
                let cmdName = [extra.commands.get(args[0]) || [...extra.commands.values()].find(a => a.aliases.includes(args[0]))];
                if (cmdName[0] === undefined)
                    return message.channel.send("`EN0002`: Invalid command `" + args[0] + "`.");
                let currentCmd;
                for (let i in args.slice(1)) {
                    const subAliases = cmdName[cmdName.length - 1].subcommands;
                    if (subAliases === undefined)
                        return message.channel.send("`EN0002`: There is no subcommand in command `" + cmdName.map(a => a.name).join(" ") + "`.");
                    currentCmd = StringHandlers.findCmd(args[Number(i) + 1], subAliases);
                    if (currentCmd === undefined)
                        return message.channel.send(`\`EN0002\`: Invalid subcommand ${args[Number(i) + 1]} in command ${cmdName.map(a => a.name).join(" ")}`);
                    cmdName.push(currentCmd);
                }
                embed.setTitle("Help -- Command -- " + StringHandlers.capitalize(cmdName[0].name))
                    .setColor("GREEN")
                    .setTimestamp();
                const lastCmd = cmdName[cmdName.length - 1];
                if (!ifDetail) {
                    if (cmdName.indexOf(lastCmd) === 0)
                        embed.addField(lastCmd.name, `${lastCmd.description}\nSyntax: ${lastCmd.syntax}\nPermission: ${(!cmdName[0].perm) ? "General" : cmdName[0].perm === 1 ? "Administrator's" : "Developer's"}\nAlias(s): ${lastCmd.aliases.join(", ") || "None"}${"" + Object.keys(cmdName[0].subcommands || {}).join(", ") || ""}`);
                    else
                        embed.addField(cmdName.map(a => a.name).join(" "), `${lastCmd.description}\nSyntax: \`${lastCmd.syntax}\`\nAlias(s): ${lastCmd.aliases.join(", ") || "None"}${"" + Object.keys(lastCmd.subcommands || {}).join(", ") || ""}`);
                }
                else {
                    embed.addField(cmdName.map(a => a.name).join(" ") + " -- Manual", lastCmd.description + "\n" +
                        `Syntax: \`${lastCmd.syntax}\`\n${cmdName[0].args ? "Parameter(s):\n" + cmdName[0].args.map(a => "> `" + a[0] + "` -- " + a[1]).join("\n") + "\n" : ""}` +
                        "Permission: " + ((!cmdName[0].perm) ? "General" : cmdName[0].perm === 1 ? "Administrator's" : "Developer's") + "\n" +
                        (cmdName[0].argaliases ? `Parameter Alias(s):\n${cmdName[0].argaliases.map(a => "> " + a[0] + " | " + a[1].join(", ")).join("\n")}\n` : "") +
                        (lastCmd["examples"] ? `Example(s):\n${lastCmd["examples"].map((a) => "> `" + a + "`").join("\n")}\n` : `Example(s):\n${cmdName[0].manual.examples.map(a => "> `" + a + "`").join("\n")}\n`) +
                        (lastCmd.subcommands ? `Subcommand(s):\n${Object.values(lastCmd.subcommands).map(a => `> \`${a.name}\`\n${"> \t" + a.description + "\n"}> \tSyntax: \`${a.syntax}\n> \tAlias(s): ${a.aliases.join(", ") || "None"}\``)}\n` : "") +
                        (lastCmd["extraInfo"] ? lastCmd["extraInfo"] + "\n" : "") +
                        (cmdName[0].manual.extra ? cmdName[0].manual.extra + "\n" : "") +
                        (cmdName[0].manual.note ? "Note:\n" + cmdName[0].manual.note.split("\n").map(a => "> " + a).join("\n") + "\n" : "") +
                        `Alias(s): ${lastCmd.aliases.join(", ") || "None"}`, false);
                }
            }
        }
        embed.setAuthor({ name: message.client.user.username, iconURL: message.client.user.displayAvatarURL() })
            .setFooter({ text: message.client.user.username + " | " + setting.version, iconURL: message.client.user.displayAvatarURL() });
        let v;
        for (let f = 0; f < embed.fields.length; f++)
            if ((v = embed.fields[f].value).length > 1024) {
                let vv = v.split("\n");
                embed.spliceFields(f, 1, { name: embed.fields[f].name, value: vv.splice(0, ~~(vv.length / 2)).join("\n"), inline: false });
                embed.spliceFields(f + 1, 0, { name: "\u200b", value: vv.join("\n"), inline: false });
            }
        message.channel.send({ embeds: [embed] });
    }
};
export { Command };
//# sourceMappingURL=help.js.map