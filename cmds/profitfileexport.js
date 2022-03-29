import Discord from "discord.js";
import { StringHandlers } from "../funcs/StringHandlers";
import { NumberHandlers } from "../funcs/NumberHandlers";
import { calculate } from "../funcs/calculate";
import archiver from "archiver";
import { BufferStream } from "../funcs/BufferStream";
import ICDetail from "../icdetails.json";
import { APIListener } from "../funcs/APIListener";
import { IdleCorpConnection } from "../funcs/IdleCorpConnection";
import Decimal from "decimal.js";
const Command = {
    name: "profitfileexport",
    aliases: ["pffep", "profitfile", "pff"],
    syntax: "profitfileexport [--region:<region ID>] [--{embed|zip}] [--dm] [<time unit>]",
    description: "Exporting the profit.txt to a file or embeds, also zip file.",
    args: [
        ["[--region:<region ID>]", "The optional parameter that specifies the regional production effects for facilities."],
        ["[--embed]", "The optional parameter which turns the result into embed format."],
        ["[--zip]", "The optional parameter which turns the profit.txt into whole zip file."],
        ["[--dm]", "The optional parameter which sent the result in the DM channel instead of the server's."],
        ["[<time unit >]", "The time unit of the result, per each of the unit."]
    ],
    argaliases: [
        ["--region:", ["--modifiers:", "--mods:"]],
        ["second", ["sec", "s"]],
        ["minute", ["min", "m"]],
        ["hour", ["hr", "h"]],
        ["day", ["d"]]
    ],
    manual: {
        description: "This command is used to show the IdleCorp Profit zip file, embed version of profit.txt or profit.txt (by default). This command calculates the results dynamicaly.",
        examples: [
            "profitfileexport",
            "profitfileexport --embed --dm",
            "profitfileexport --region:801019800682758145 --zip",
            "profitfileexport hour"
        ]
    },
    execute(message, args, extra) {
        if (!args.length)
            return message.channel.send("`EN0001`: Missing facility name.");
        let regionId = null;
        if (["--region:", "--modifiers:", "--mods:"].some(a => args[0].toLowerCase().startsWith(a))) {
            regionId = args.shift().split(":")[1];
        }
        let version = 0;
        if (args[0].toLowerCase() === "--zip") {
            version = 1;
            args.shift();
        }
        else if (args[0].toLowerCase() === "--embed") {
            version = 2;
            args.shift();
        }
        // let md = false;
        // if (args[0].toLowerCase()==="--md"||args[0].toLowerCase()==="--markdown") {
        //     md = true;
        // }
        let DM = false;
        if (args[0].toLowerCase() === "--dm") {
            DM = true;
        }
        let unit = "second";
        if (args.length) {
            const theals = { "sec": "second", "s": "second", "min": "minute", "m": "minute", "hr": "hour", "h": "hour", "d": "day" };
            unit = (["second", "minute", "hour", "day"].includes(args[0])) ? args[0] : theals[args[0]];
            if (!unit)
                return message.channel.send("`EN0002`: Invalid time unit.");
        }
        let result = [];
        let resultEmbed = [];
        const num = { "day": 60 * 60 * 24, "hour": 60 * 60, "minute": 60 }[unit] ?? 1;
        const ICDetails = JSON.parse(JSON.stringify(ICDetail));
        let modpro = Promise.resolve();
        if (regionId)
            modpro = APIListener.DiscordAuthorization.getAuthbyID(extra.database, message.author.id).then(auth => {
                if (!auth) {
                    const state = Date.now().toString() + "-" + message.author.id;
                    const listener = new APIListener.DiscordAuthorization(extra.database, state);
                    return new Promise(rs => message.channel.send({ embeds: [new Discord.MessageEmbed().setTitle("Discord account authorization").setURL(APIListener.DiscordAuthorization.authString + state)] }).then(msg => {
                        listener.on("timeout", () => {
                            msg.edit({ embeds: [new Discord.MessageEmbed().setTitle("Authorization Timeout").setDescription("Calculating without regional modifiers instead...").setColor("RED").setTimestamp()] });
                            rs();
                            listener.removeAllListeners();
                        });
                        listener.on("authorized", auth => {
                            IdleCorpConnection.getRegionalModifiers(auth.token, regionId, null).then(b => {
                                if (b === null)
                                    msg.edit({ embeds: [new Discord.MessageEmbed().setTitle("Invalid Region ID").setDescription("Calculating without regional modifiers instead...").setColor("RED").setTimestamp()] });
                                else {
                                    for (const f in ICDetails.facilities)
                                        if (f in b)
                                            ICDetails[f].speed = Math.round(new Decimal(b[f]).mul(ICDetails[f].speed).div(100 + b["happiness"]).toNumber());
                                        else
                                            ICDetails.facilities[f].speed = Math.round(new Decimal(ICDetails[f].speed).div(100 + b["happiness"]).toNumber());
                                }
                                rs();
                            });
                            listener.removeAllListeners();
                        });
                    }));
                }
                else {
                    return IdleCorpConnection.getRegionalModifiers(auth.token, regionId, null).then(b => {
                        for (const f in ICDetails.facilities)
                            if (f in b)
                                ICDetails.facilities[f].speed = Math.round(new Decimal(b[f]).mul(ICDetails.facilities[f].speed).div(100 + b["happiness"]).toNumber());
                            else
                                ICDetails.facilities[f].speed = Math.round(new Decimal(ICDetails.facilities[f].speed).div(100 + b["happiness"]).toNumber());
                    });
                }
            });
        const Facilities = { ...ICDetails.facilities, airport: { ...ICDetails.facilities.airport, speed: 20 } };
        modpro.then(() => {
            for (const fac in ICDetails["facilities"]) {
                const facratio = calculate.facratio(Facilities[fac], 1, Facilities);
                const firstfac = calculate.firstFac(facratio[2], num);
                const remain = calculate.produceRemain(Facilities[fac], facratio[2], 1, firstfac[2], Facilities);
                const sol = calculate.productProfit(Facilities[fac], "all", num);
                const soland = calculate.productProfitLand(Facilities[fac], "all", num, firstfac[2]);
                let s2 = [], count = 0, pf, pfland;
                for (const a of [sol[0], sol[1], soland[1]]) {
                    let s = [];
                    if (a !== null) {
                        for (let b of Object.entries(a)) {
                            const bb = b[1].split(".");
                            s.push((version === 2 ? "> **" : "| ") + StringHandlers.capitalize(b[0]).replaceAll("_", " ") + (version === 2 ? "**" : "") + " | $" + NumberHandlers.numberToLocaleString(parseInt(bb[0])) + ((bb[1]) ? "." + bb[1] : ".00") + ((count === 2) ? "/land" : ""));
                        }
                        s2.push(s.join("\n"));
                    }
                    else
                        s2.push(version === 2 ? "> *None*" : "| None");
                    count++;
                }
                {
                    const pf1 = sol[2].split(".");
                    pf = (version === 2 ? "> " : "| ") + "$" + NumberHandlers.numberToLocaleString(parseInt(pf1[0])) + ((pf1[1]) ? "." + pf1[1] : ".00");
                    const pfland1 = soland[2].split(".");
                    pfland = (version === 2 ? "> " : "| ") + "$" + NumberHandlers.numberToLocaleString(parseInt(pfland1[0])) + ((pfland[1]) ? "." + pfland[1] : ".00") + "/land";
                }
                let rem = [];
                for (let a of remain[0]) {
                    const aa = a[1].split(".");
                    rem.push((version === 2 ? "> **" : "| ") + StringHandlers.capitalize(a[0]).replaceAll("_", " ") + (version === 2 ? "**" : "") + " | " + NumberHandlers.numberToLocaleString(parseInt(aa[0])) + ((aa[1]) ? "." + aa[1] : ".00"));
                }
                rem.push(version === 2 ? "> " : "------");
                for (const a of remain[1]) {
                    const aa = a[1].split(".");
                    rem.push((version === 2 ? "> **" : "| ") + StringHandlers.capitalize(a[0]).replaceAll("_", " ") + (version === 2 ? "**" : "") + " | $" + NumberHandlers.numberToLocaleString(parseInt(aa[0])) + ((aa[1]) ? "." + aa[1] : ".00"));
                }
                if (version === 2)
                    resultEmbed.push([StringHandlers.capitalize(fac).replaceAll("_", " "), "**Construct materials**\n" + Object.entries(ICDetails["info"]["facilities"][fac]["construct"]).map(a => (a[0] === "money") ? "> $" + a[1] : "> **" + StringHandlers.capitalize(a[0]).replaceAll("_", " ") + "** | " + a[1]).join("\n") + "\n\n**Consumes**\n" + s2[0] + "\n**Produces**\n" + s2[1] + "\n\n" + s2[2] + "\n\n**Profit**\n" + pf + "\n\nRatio(order follow to above): " + facratio[0] + " " + facratio[1] + "\nFirst Facility(First Fac)\n" + firstfac[0] + "\n" + firstfac[1] + "\n**Produce Remains**\n" + rem.join("\n") + "\n" + "Speed: " + ICDetails["facilities"][fac]["speed"].toString() + "s" + "\n\n\n_ _"]);
                else
                    result.push(StringHandlers.capitalize(fac).replaceAll("_", " ") + "\nConstruct materials\n" + Object.entries(ICDetails["info"]["facilities"][fac]["construct"]).map(a => (a[0] === "money") ? "| $" + a[1] : "| " + StringHandlers.capitalize(a[0]).replaceAll("_", " ") + " | " + a[1]).join("\n") + "\nConsumes\n" + s2[0] + "\nProduces\n" + s2[1] + "\n\n" + s2[2] + "\nProfit\n" + pf + "\nRatio(order follow to above): " + facratio[0] + " " + facratio[1] + "\nFirst Facility(First Fac)\n" + firstfac[0] + "\n" + firstfac[1] + "\nProduce Remains\n------\n" + rem.join("\n") + "\n------\n" + "Speed: " + ICDetails["facilities"][fac]["speed"].toString() + "s");
            }
            if (version === 1) {
                let faclist = [];
                for (const a in Facilities) {
                    let stuff = [], i = [0, 0];
                    for (const b of Object.entries(Facilities[a])) {
                        if (["consumes", "produces"].includes(b[0])) {
                            const e = ["consumes", "produces"].indexOf(b[0]);
                            if (i[e] === 0)
                                stuff.push(StringHandlers.capitalize(b[0]).replaceAll("_", " "));
                            if (b[1] === null)
                                stuff.push("| None");
                            else {
                                for (const d in b[1]) {
                                    if (d === "money")
                                        stuff.push("| $" + b[1][d]);
                                    stuff.push("| " + StringHandlers.capitalize(d).replaceAll("_", " ") + " | " + b[1][d]);
                                }
                            }
                        }
                        if (b[0] === "consumes")
                            i[0]++;
                        else
                            i[1]++;
                    }
                    let speed;
                    if (Array.isArray(ICDetails["facilities"][a]["speed"])) {
                        let speedar = [];
                        for (const b of ICDetails["facilities"][a]["speed"])
                            speedar.push(NumberHandlers.toTime(b).slice(1).map(a => (a.toString().length < 2) ? "0" + a : a).join(":"));
                        speedar.splice(1, 0, "to");
                        speed = speedar.join(" ");
                    }
                    else
                        speed = NumberHandlers.toTime(ICDetails["facilities"][a]["speed"]).slice(1).map(a => (a.toString().length < 2) ? "0" + a : a).join(":");
                    faclist.push(StringHandlers.capitalize(a).replaceAll("_", " ") + "\nConstruct materials\n" + Object.entries(ICDetails["info"]["facilities"][a]["construct"]).map(a => (a[0] === "money") ? "| $" + a[1] : "| " + StringHandlers.capitalize(a[0]).replaceAll("_", " ") + " | " + a[1]).join("\n") + "\n" + stuff.join("\n") + "\nEvery " + speed);
                }
                let facspeed = [];
                for (const f in Facilities) {
                    const sol = calculate.productSpeed(Facilities[f], "all", num);
                    let s = [], s2 = [], stuff = ["Consumes"];
                    if (sol[0] !== null) {
                        for (let [a, b] of Object.entries(sol[0])) {
                            const bb = b.split(".");
                            s.push("| " + StringHandlers.capitalize(a).replaceAll("_", " ") + " | " + NumberHandlers.numberToLocaleString(parseInt(bb[0])) + ((bb[1]) ? "." + bb[1] : ".00"));
                        }
                        stuff.push(s.join("\n"));
                    }
                    else
                        stuff.push("| None");
                    stuff.push("Produces");
                    for (let [a, b] of Object.entries(sol[1])) {
                        const bb = b.split(".");
                        s2.push("| " + StringHandlers.capitalize(a).replaceAll("_", " ") + " | " + NumberHandlers.numberToLocaleString(parseInt(bb[0])) + ((bb[1]) ? "." + bb[1] : ".00"));
                    }
                    stuff.push(s2.join("\n"));
                    let speed;
                    if (Array.isArray(ICDetails["facilities"][f]["speed"])) {
                        let speedarr = [];
                        for (const b of ICDetails["facilities"][f]["speed"])
                            speedarr.push(NumberHandlers.toTime(b).slice(1).map(a => (a.toString().length < 2) ? "0" + a : a).join(":"));
                        speedarr.splice(1, 0, "to");
                        speed = speedarr.join(" ");
                    }
                    else
                        speed = NumberHandlers.toTime(ICDetails["facilities"][f]["speed"]).slice(1).map(a => (a.toString().length < 2) ? "0" + a : a).join(":");
                    facspeed.push(StringHandlers.capitalize(f).replaceAll("_", " ") + "\n" + stuff.join("\n") + "\nEvery " + speed);
                }
                const archive = archiver("zip", { zlib: { level: 9 } });
                archive.append("Unit: " + StringHandlers.capitalize(unit) + "\n\n" + result.join("\n\n"), { name: "profit.txt" });
                archive.append(faclist.join("\n\n"), { name: "facility list.txt" });
                archive.append("Unit: " + StringHandlers.capitalize(unit) + "\n\n" + facspeed.join("\n\n"), { name: "production speed.txt" });
                archive.file("../profitfiles/Copyright Notice.txt", { name: "Copyright Notice.txt" });
                archive.file("../profitfiles/Readme.md", { name: "Readme.md" });
                const resf = new BufferStream();
                archive.pipe(resf);
                archive.finalize().then(() => {
                    if (DM)
                        message.author.createDM().then(channel => channel.send({ content: "Zipped Profit Files", files: [new Discord.MessageAttachment(resf.getBuffer(), "IdleCorp Profit Files.zip")] }).then(() => message.channel.send("It has sent via your DM.")));
                    else
                        message.channel.send({ content: "Zipped Profit Files", files: [new Discord.MessageAttachment(resf.getBuffer(), "IdleCorp Profit Files.zip")] });
                });
            }
            else if (version === 2) {
                let embed = [new Discord.MessageEmbed().setTitle("IdleCorp Profit Embed Full")], check = 0;
                for (const a of result) {
                    if ((check + a[0].length + a[1].length) > 5800) {
                        embed.push(new Discord.MessageEmbed());
                        check = 0;
                    }
                    check += a[0].length + a[1].length;
                    if (a[1].length > 1000) {
                        const aa = a[1].split("\n");
                        embed.slice(-1)[0].addField(a[0], aa.splice(0, ~~(aa.length / 2)).join("\n"), false);
                        embed.slice(-1)[0].addField("\u200b", aa.join("\n"), false);
                    }
                    else
                        embed.slice(-1)[0].addField(a[0], a[1], false);
                }
                if (DM)
                    message.author.createDM().then(channel => channel.send({ embeds: embed }).then(() => message.channel.send("It has sent via your DM.")));
                else
                    message.channel.send({ embeds: embed });
            }
            else {
                const resf = new Discord.MessageAttachment(Buffer.from("Unit: " + StringHandlers.capitalize(unit) + "\n\n" + result.join("\n\n")), "profit.txt");
                if (DM)
                    message.author.createDM().then(channel => channel.send({ content: "IdleCorp Profit profit.txt", files: [resf] }).then(() => message.channel.send("It has sent via your DM.")));
                else
                    message.channel.send({ content: "IdleCorp Profit profit.txt", files: [resf] });
            }
        });
    }
};
export { Command };
//# sourceMappingURL=profitfileexport.js.map