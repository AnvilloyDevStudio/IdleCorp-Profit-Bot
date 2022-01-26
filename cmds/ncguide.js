const cmdInfo = require("../cmdsinfo.json");
const ncgl = require("../newcomerguide.json");
const Discord = require("discord.js");
const setting = require("../setting.json");
const StringHandlers = require("../funcs/StringHandlers");

module.exports = {
	name: "ncguide",
	execute(message, args) {
        const temp_ver = "1.0" //template: the template of the embed sent, structure: the guide json structure
        let num = null;
        args = args.join(" ").split(".");
        if (/[0-9]+/.test(args.slice(-1)[0])) num = parseInt(args.pop());
        args = args.join("")
        if (!args) {
            let res = ncgl["guide"].slice(-1)[0]["pages"].reduce((a, b) => a.concat([...b["content"].flat().map(a => "\u200b"+a), "~~**--------------------------------------------------------**~~"]), []);
            res.pop();
            let length = 0,
            b = [],
            c = [];
            for (a of res) {
                if ((length+a.length)>1000) {
                    b.push(c.join("\n"));
                    c = [],
                    length = 0;
                }
                c.push(a);
                length += a.length+2;
            }
            b.push(c.join("\n"));
            res = b;
            embeds = [(res.reduce((a, b) => a+b.length, 0)>6000)? new Discord.MessageEmbed().setTitle("New comer guide").setColor([200, 225, 255]).setDescription(`Structure&template version: ${ncgl["guide"][0]["structure_version"]}&${temp_ver}\nVersion: ${ncgl["guide"][0]["version"]}`):
                new Discord.MessageEmbed().setTitle("New comer guide").setColor([200, 225, 255]).setDescription(`Structure & Template version: ${ncgl["guide"][0]["structure_version"]}&${temp_ver}\nVersion: ${ncgl["guide"][0]["version"]}`).setTimestamp()];
            ind = 1
            for (a of res) {
                embeds.slice(-1)[0].addField("\u200b", a, false);
                if ((ind%6) === 0 && res.slice(ind).length>0) embeds.push((res.slice(ind).length>6)? new Discord.MessageEmbed().setColor([200, 225, 255]): new Discord.MessageEmbed().setColor([200, 225, 255]).setTimestamp());
                ind++
            }
            embeds.slice(-1)[0].setFooter(message.client.user.username+" | "+setting["version"], message.client.user.displayAvatarURL());
            for (a of embeds) message.channel.send(a);
            return
        } else if (["versions", "vers", "vs"].includes(args)) return message.channel.send("Valid guide versions:\n"+ncgl["guide"].map(a => "`"+a["version"]+"`").join("\n"));
        let arg = args.toLowerCase();
        arg = [[".", ""], ["fac", "facilities"], ["&", "and"], [" n ", " and "], ["prod", "production"], ["pro", "production"], ["trade", "trading"], ["mk", "market"], ["res", "research"], ["log", "logistics"], ["tech", "technology"], ["reg", "region"], ["mod", "modifiers"], ["ser", "services"], ["sv", "services"], ["ric", "reincorporation"], ["ri", "reincorporation"], ["reincorp", "reincorporation"], ["misc", "miscellaneous"]].reduce((a, b) => a.replaceAll(b[0], b[1]), arg);
        const alsche = {"i": "intro", "it": "intro", "a": "assets", "f and p": "facilities and production", "t and m": "trading and market", "r and t": "research and technology", "r and l": "region and logistics", "m and s": "modifiers and services", "r and m": "reincorporation and miscellaneous", "t": "thanks", "thx": "thanks", "end": "thanks"};
        if (arg in alsche) arg = alsche[arg];
        if (Object.values(alsche).flatMap(a => a.split(" ")).includes(arg))
            arg = Object.values(alsche).find(a => a.includes(arg))
        if (!ncgl["guide"].slice(-1)[0]["pages"].map(a => a["name"]).includes(arg)) return message.channel.send("`EN0002`: The part was invalid.");
        const guidev = ncgl["guide"].slice(-1)[0];
        let embed = new Discord.MessageEmbed()
            .setTitle("New comer guide")
            .setDescription(`Structure & Template version: ${guidev["structure_version"]}&${temp_ver}\nVersion: ${guidev["version"]}`)
            .setColor([200, 225, 255])
            .setTimestamp()
            .setFooter(message.client.user.username+" | "+setting["version"], message.client.user.displayAvatarURL());
        let res = [],
        c = [],
        length = 0;
        if (num!==null&&arg!=="thanks") {
            num--;
            const ctn = guidev["pages"].find(a => a["name"] === arg);
            if (num>ctn.content[1].length||num<0) return message.channel.send("`EN0002`: The number is out of range.");
            embed.addField(((ctn.name==="intro")? "Disclaimer": StringHandlers.capitalize(ctn.name))+" | Point "+(num+1), "\u200b"+ctn.content[1][num])
            return message.channel.send(embed);
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
        message.channel.send(embed)
    }
}