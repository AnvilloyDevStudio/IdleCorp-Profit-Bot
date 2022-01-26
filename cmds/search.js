const fs = require('fs');
const cmdInfo = require("../cmdsinfo.json");
const https = require("https");
const Parser = require("node-html-parser");
const Discord = require("discord.js");
const setting = require("../setting.json");
const StringHandlers = require('../funcs/StringHandlers');

module.exports = {
	name: "search",
	execute(message, args) {
        const [search, section] = args.join(" ").match(/([\w :\(\)$\.&%!-]*)#?([\w :\(\)#$\.&%!-]*)/).slice(1);
        const host = new URL("https://wiki.idlecorp.xyz/api.php")
        host.search = new URLSearchParams({action: "parse", format: "json", page: search, prop: "text|sections|categories", "redirects": 1, "disabletoc": 1,}).toString();
        new Promise((rs, rj) => https.request(host, (resp) => {
            let data = "";
            resp.on("data", (chunk) => {
                data += chunk;
            })
            resp.on("end", () => {
                rs(JSON.parse(data));
            })
        }).on("error", (err) => {
            rj("Error: "+err.message);
        }).end()).then((d) => {
            if ("error" in d) return message.channel.send(new Discord.MessageEmbed().setTitle("Error").setDescription(d["error"]["info"]).setFooter(message.client.user.username+" | "+setting.version, message.client.user.displayAvatarURL()).setColor([255, 85, 119]));
            d = d["parse"];
            if (section) {
                const number = d["sections"].find(a => a["line"] === StringHandlers.capitalize(section) || a["anchor"] === encodeURIComponent(StringHandlers.capitalize(section).replaceAll(" ", "_")).replaceAll("%", "."))?.["number"];
                if (!number) return message.channel.send("`EN0006`: The wiki page section is invalid");
                const host = new URL("https://wiki.idlecorp.xyz/api.php")
                host.search = new URLSearchParams({action: "parse", format: "json", page: search, prop: "text|categories", "redirects": 1, "disabletoc": 1, "section": number,}).toString();
                const dd = d;
                return new Promise((rs, rj) => https.request(host, (resp) => {
                    let data = "";
                    resp.on("data", (chunk) => {
                        data += chunk;
                    })
                    resp.on("end", () => {
                        rs(JSON.parse(data));
                    })
                }).on("error", (err) => {
                    rj("Error: "+err.message);
                }).end()).then((d) => {
                    if ("error" in d) return message.channel.send(new Discord.MessageEmbed().setTitle("Error").setDescription(d["error"]["info"]).setFooter(message.client.user.username+" | "+setting.version, message.client.user.displayAvatarURL()).setColor([255, 85, 119]));
                    d = d["parse"]
                    let cnt = Parser.parse(d["text"]["*"]).querySelector("div");
                    const title = cnt.querySelector("h2").innerText.slice(0, -6)
                    cnt = cnt.querySelector("p").innerHTML.split(/<a href=\"([\w\/\.:-]+)\"[\w =\":-]+>([\w :-]+)<\/a>/)
                    for (let i = 0; i<cnt.length; i++) {
                        if (i%3===1) {
                            let temp = cnt[i];
                            cnt[i] = cnt[i+1];
                            cnt[i+1] = temp;
                            i += 2;
                        }
                    }
                    let res = ""
                    for (let i = 0; i<cnt.length; i++) {
                        if (!(i%3)&&i+1<cnt.length) {
                            res += cnt[i]+"["+cnt[i+1]+"](https://wiki.idlecorp.xyz"+cnt[i+2]+")";
                            i += 2;
                        }
                    }
                    embed = new Discord.MessageEmbed()
                        .setTitle(d["title"]+"#"+dd["sections"][number-1]["anchor"])
                        .setColor([221, 221, 234])
                        .setURL("https://wiki.idlecorp.xyz/index.php/"+d["title"].replaceAll(" ", "_")+"#"+dd["sections"][number-1]["anchor"])
                        .setFooter(message.client.user.username+" | "+setting.version, message.client.user.displayAvatarURL())
                        .setDescription(res+cnt.slice(-1)[0]+((d["categories"].length)? "\n\nCategories: "+d["categories"].map(a => "["+a["*"]+"](https://wiki.idlecorp.xyz/index.php/"+a["*"]+")").join(" | "): "")+((d["redirects"]?.length)? "\n(Redirected from: ["+d["redirects"][0]["from"]+"](https://wiki.idlecorp.xyz/index.php/"+d["redirects"][0]["from"]+"))": ""));
                    message.channel.send(embed)
                    })
            }
            embed = new Discord.MessageEmbed()
                .setTitle(d["title"])
                .setColor([221, 221, 234])
                .setURL("https://wiki.idlecorp.xyz/index.php/"+d["title"].replace(" ", "_"))
                .setFooter(message.client.user.username+" | "+setting.version, message.client.user.displayAvatarURL());
            let cnt = Parser.parse(d["text"]["*"]).querySelector("div").querySelector("p").innerText.split(/<a href=\"([\w\/\.:-]+)\"[\w =\":-]+>([\w :-]+)<\/a>/);
            for (let i = 0; i<cnt.length; i++) {
                if (i%3===1) {
                    let temp = cnt[i];
                    cnt[i] = cnt[i+1];
                    cnt[i+1] = temp;
                    i += 2;
                }
            }
            let res = ""
            for (let i = 0; i<cnt.length; i++) {
                if (!(i%3)&&i+1<cnt.length) {
                    res += cnt[i]+"["+cnt[i+1]+"](https://wiki.idlecorp.xyz"+cnt[i+2]+")";
                    i += 2;
                }
            }
            message.channel.send(embed.setDescription(res+cnt.slice(-1)[0]+((d["sections"].length)? "\n\nSections: "+d["sections"].map(a => a["anchor"]).join(", "): "")+((d["categories"].length)? "\nCategories: "+d["categories"].map(a => "["+a["*"]+"](https://wiki.idlecorp.xyz/index.php/"+a["*"]+")").join(" | "): "")+((d["redirects"]?.length)? "\n(Redirected from: ["+d["redirects"][0]["from"]+"](https://wiki.idlecorp.xyz/index.php/"+d["redirects"][0]["from"]+"))": "")));
        })
    }
}