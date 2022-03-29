import * as https from "https";
import * as Parser from "node-html-parser";
import * as Discord from "discord.js";
import setting from "../setting.json";
import { StringHandlers } from '../funcs/StringHandlers';
const Command = {
    name: "search",
    aliases: ["sr"],
    syntax: "search <page>[#<section>]",
    description: "Searching something in the IdleCorp Wiki.",
    args: [
        ["<pages>", "The name of the wiki page."],
        ["[#<section>]", "The section of the wiki page."]
    ],
    manual: {
        description: "You can search the IdleCorp Wiki with the page name or title.",
        examples: [
            "search Main_Page",
            "search market",
            "search Export#Trivia"
        ]
    },
    execute(message, args) {
        const [search, section] = args.join(" ").match(/([\w :\(\)$\.&%!-]*)#?([\w :\(\)#$\.&%!-]*)/).slice(1);
        const host = new URL("https://wiki.idlecorp.xyz/api.php");
        host.search = new URLSearchParams({ action: "parse", format: "json", page: search, prop: "text|sections|categories", "redirects": "1", "disabletoc": "1", }).toString();
        new Promise((rs, rj) => https.request(host, (resp) => {
            let data = "";
            resp.on("data", (chunk) => {
                data += chunk;
            });
            resp.on("end", () => {
                rs(JSON.parse(data));
            });
        }).on("error", (err) => {
            rj("Error: " + err.message);
        }).end()).then(d => {
            if ("error" in d)
                return message.channel.send({ embeds: [new Discord.MessageEmbed().setTitle("Error").setDescription(d["error"]["info"]).setFooter({ text: message.client.user.username + " | " + setting.version, iconURL: message.client.user.displayAvatarURL() }).setColor([255, 85, 119])] });
            d = d["parse"];
            if (section) {
                const number = d["sections"].find(a => a["line"] === StringHandlers.capitalize(section) || a["anchor"] === encodeURIComponent(StringHandlers.capitalize(section).replaceAll(" ", "_")).replaceAll("%", "."))?.["number"];
                if (!number)
                    return message.channel.send("`EN0006`: The wiki page section is invalid");
                const host = new URL("https://wiki.idlecorp.xyz/api.php");
                host.search = new URLSearchParams({ action: "parse", format: "json", page: search, prop: "text|categories", "redirects": "1", "disabletoc": "1", "section": number, }).toString();
                const dd = d;
                return new Promise((rs, rj) => https.request(host, (resp) => {
                    let data = "";
                    resp.on("data", (chunk) => {
                        data += chunk;
                    });
                    resp.on("end", () => {
                        rs(JSON.parse(data));
                    });
                }).on("error", (err) => {
                    rj("Error: " + err.message);
                }).end()).then((d) => {
                    if ("error" in d)
                        return message.channel.send({ embeds: [new Discord.MessageEmbed().setTitle("Error").setDescription(d["error"]["info"]).setFooter({ text: message.client.user.username + " | " + setting.version, iconURL: message.client.user.displayAvatarURL() }).setColor([255, 85, 119])] });
                    d = d["parse"];
                    let ctn = Parser.parse(d["text"]["*"]).querySelector("div");
                    const title = ctn.querySelector("h2").innerText.slice(0, -6);
                    const content = ctn.querySelector("p").innerHTML.split(/<a href=\"([\w\/\.:-]+)\"[\w =\":-]+>([\w :-]+)<\/a>/);
                    for (let i = 0; i < content.length; i++) {
                        if (i % 3 === 1) {
                            let temp = content[i];
                            content[i] = content[i + 1];
                            content[i + 1] = temp;
                            i += 2;
                        }
                    }
                    let res = "";
                    for (let i = 0; i < content.length; i++) {
                        if (!(i % 3) && i + 1 < content.length) {
                            res += content[i] + "[" + content[i + 1] + "](https://wiki.idlecorp.xyz" + content[i + 2] + ")";
                            i += 2;
                        }
                    }
                    const embed = new Discord.MessageEmbed()
                        .setTitle(d["title"] + "#" + dd["sections"][number - 1]["anchor"])
                        .setColor([221, 221, 234])
                        .setURL("https://wiki.idlecorp.xyz/index.php/" + d["title"].replaceAll(" ", "_") + "#" + dd["sections"][number - 1]["anchor"])
                        .setFooter({ text: message.client.user.username + " | " + setting.version, iconURL: message.client.user.displayAvatarURL() })
                        .setDescription(res + content.slice(-1)[0] + ((d["categories"].length) ? "\n\nCategories: " + d["categories"].map(a => "[" + a["*"] + "](https://wiki.idlecorp.xyz/index.php/" + a["*"] + ")").join(" | ") : "") + ((d["redirects"]?.length) ? "\n(Redirected from: [" + d["redirects"][0]["from"] + "](https://wiki.idlecorp.xyz/index.php/" + d["redirects"][0]["from"] + "))" : ""));
                    message.channel.send({ embeds: [embed] });
                });
            }
            const embed = new Discord.MessageEmbed()
                .setTitle(d["title"])
                .setColor([221, 221, 234])
                .setURL("https://wiki.idlecorp.xyz/index.php/" + d["title"].replace(" ", "_"))
                .setFooter({ text: message.client.user.username + " | " + setting.version, iconURL: message.client.user.displayAvatarURL() });
            let cnt = Parser.parse(d["text"]["*"]).querySelector("div").querySelector("p").innerText.split(/<a href=\"([\w\/\.:-]+)\"[\w =\":-]+>([\w :-]+)<\/a>/);
            for (let i = 0; i < cnt.length; i++) {
                if (i % 3 === 1) {
                    let temp = cnt[i];
                    cnt[i] = cnt[i + 1];
                    cnt[i + 1] = temp;
                    i += 2;
                }
            }
            let res = "";
            for (let i = 0; i < cnt.length; i++) {
                if (!(i % 3) && i + 1 < cnt.length) {
                    res += cnt[i] + "[" + cnt[i + 1] + "](https://wiki.idlecorp.xyz" + cnt[i + 2] + ")";
                    i += 2;
                }
            }
            message.channel.send({ embeds: [embed.setDescription(res + cnt.slice(-1)[0] + ((d["sections"].length) ? "\n\nSections: " + d["sections"].map(a => a["anchor"]).join(", ") : "") + ((d["categories"].length) ? "\nCategories: " + d["categories"].map(a => "[" + a["*"] + "](https://wiki.idlecorp.xyz/index.php/" + a["*"] + ")").join(" | ") : "") + ((d["redirects"]?.length) ? "\n(Redirected from: [" + d["redirects"][0]["from"] + "](https://wiki.idlecorp.xyz/index.php/" + d["redirects"][0]["from"] + "))" : ""))] });
        });
    }
};
export { Command };
//# sourceMappingURL=search.js.map