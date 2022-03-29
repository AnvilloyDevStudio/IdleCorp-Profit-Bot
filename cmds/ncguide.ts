import ncgl from "../newcomerguide.json";
import * as Discord from "discord.js";
import setting from "../setting.json";
import {StringHandlers} from "../funcs/StringHandlers.js";

const Command: import("../types/command").Command = {
    name: "ncguide",
    aliases: ["ncg", "newcomerguide"],
    syntax: "ncguide {[<part>[.<section>]] | version}",
    description: "Showing the newcomer guide.",
    args: [
        ["<part>", "The part of the guide."],
        ["[.<section>]", "The specific section in number."],
        ["version", "Getting the versions of the newcomer guide."]
    ],
    argaliases: [
        ["<part>", ["*A lot of reasonable aliases are accepted*"]]
    ],
    manual: {
        description: "This command is used to show the guide from Dermella. It is for newcomers. you can choose to see a specific section of the guide. Shows whole guide when there is no parameter is inputted.",
        examples: [
            "ncguide",
            "ncguide fac",
            "ncguide fac.4"
        ],
        note: "The newcomer guide only includes the basic of the basic of IdleCorp. Some further information may not included in this guide.\nThis guide is different to the guide in `guide`."
    },
    execute(message, args) {
        const temp_ver = setting.ncguide.tempVer; //template: the template of the embed sent, structure: the guide json structure
        let num: number = null;
        args = args.join(" ").split(".");
        if (/[0-9]+/.test(args[args.length-1])) num = parseInt(args.pop());
        const guide = args.join("");
        if (!guide) {
            let res = ncgl.guide.pages.map(a => a.content.flat().map(a => "\u200b"+a).concat("~~**--------------------------------------------------------**~~"));
            res.pop();
            let length = 0,
            b: string[] = [],
            c: string[][] = [];
            for (const a of res) {
                if ((length+a.length)>1000) {
                    b.push(c.join("\n"));
                    c = [],
                    length = 0;
                }
                c.push(a);
                length += a.length+2;
            }
            b.push(c.join("\n"));
            const p = b;
            const embeds = [(res.reduce((a, b) => a+b.length, 0)>6000)? new Discord.MessageEmbed().setTitle("Newcomer guide").setColor([200, 225, 255]).setDescription(`Structure&template version: ${ncgl.guide.structure_version}&${temp_ver}\nVersion: ${ncgl.guide.version}`):
                new Discord.MessageEmbed().setTitle("Newcomer guide").setColor([200, 225, 255]).setDescription(`Structure & Template version: ${ncgl.guide.structure_version}&${temp_ver}\nVersion: ${ncgl.guide.version}`).setTimestamp()];
            let ind = 1;
            for (const a of p) {
                embeds.slice(-1)[0].addField("\u200b", a, false);
                if ((ind%6) === 0 && p.slice(ind).length>0) embeds.push((p.slice(ind).length>6)? new Discord.MessageEmbed().setColor([200, 225, 255]): new Discord.MessageEmbed().setColor([200, 225, 255]).setTimestamp());
                ind++;
            }
            embeds.slice(-1)[0].setFooter({text: message.client.user.username+" | "+setting.version, iconURL: message.client.user.displayAvatarURL()});
            return message.channel.send({embeds: embeds});
        } else if (["versions", "vers", "vs"].includes(guide)) return message.channel.send("Current guide version: `"+ncgl.guide.version+"`\nCurrent template version: `"+setting.ncguide.tempVer+"`\nCurrent structure version: `"+ncgl.guide.structure_version+"`");
        let arg = guide.toLowerCase();
        arg = [
            [".", ""], ["fac", "facilities"], ["&", "and"], [" n ", " and "], ["prod", "production"], ["pro", "production"], ["trade", "trading"], ["mk", "market"], ["res", "research"], ["log", "logistics"], ["tech", "technology"], ["reg", "region"], ["mod", "modifiers"], ["ser", "services"], ["sv", "services"], ["ric", "reincorporation"], ["ri", "reincorporation"], ["reincorp", "reincorporation"], ["misc", "miscellaneous"]
        ].reduce((a, b) => a.replaceAll(b[0], b[1]), arg);
        const alsche = {"i": "intro", "it": "intro", "a": "assets", "f and p": "facilities and production", "t and m": "trading and market", "r and t": "research and technology", "r and l": "region and logistics", "m and s": "modifiers and services", "r and m": "reincorporation and miscellaneous", "t": "thanks", "thx": "thanks", "end": "thanks"};
        if (arg in alsche) arg = alsche[arg];
        if (Object.values(alsche).flatMap(a => a.split(" ")).includes(arg))
            arg = Object.values(alsche).find(a => a.includes(arg))
        if (!ncgl.guide.pages.map(a => a.name).includes(arg)) return message.channel.send("`EN0002`: The part was invalid.");
        const guidev = ncgl.guide;
        let embed = new Discord.MessageEmbed()
            .setTitle("Newcomer guide")
            .setDescription(`Structure & Template version: ${guidev.structure_version}&${temp_ver}\nVersion: ${guidev.version}`)
            .setColor([200, 225, 255])
            .setTimestamp()
            .setFooter({text: message.client.user.username+" | "+setting.version, iconURL: message.client.user.displayAvatarURL()});
        let res: string[] = [],
        c: string[] = [],
        length = 0;
        if (num!==null&&arg!=="thanks") {
            num--;
            const ctn = guidev["pages"].find(a => a["name"] === arg);
            if (num>ctn.content[1].length||num<0) return message.channel.send("`EN0002`: The number is out of range.");
            embed.addField(((ctn.name==="intro")? "Disclaimer": StringHandlers.capitalize(ctn.name))+" | Point "+(num+1), "\u200b"+ctn.content[1][num]);
            return message.channel.send({embeds: [embed]});
        }
        for (const a of guidev["pages"].find(a => a["name"] === arg)["content"].flat()) {
            if (length+a.length>1000) {
                res.push(c.join("\n"))
                c = [],
                length = 0;
            }
            c.push("\u200b"+a);
            length += a.length+2;
        }
        res.push(c.join("\n"));
        for (let a = 0; a<res.length; a++) embed.addField((!a)? StringHandlers.capitalize(arg): "\u200b", res[a], false);
        message.channel.send({embeds: [embed]});
    }
}
export {Command};