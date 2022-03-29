import * as Discord from "discord.js";
import setting from "../setting.json";
import udslist from "../updates.json";
import udsals from "../updatesaliases.json";
import {StringHandlers} from "../funcs/StringHandlers";
import { ValueOf } from "../types/ValueOf";

const Command: import("../types/command").Command = {
    name: "updates",
    aliases: ["uds", "changelog", "log"],
    syntax: "updates [--<version>] [<part>]",
    description: "Showing the bot update logs of each version.",
    args: [
        ["[--version]", "The specific bot update version log, defaults with the latest."],
        ["[<part>]", "The specific section of the update log, uses \".\" for the separator for inner parts."]
    ],
    argaliases: [
        ["commands", ["cmds", "c"]],
        ["other", ["o"]],
        ["plans to update", ["ptu", "p"]],
        ["note", ["n"]],
        ["adds", ["ad", "a"]],
        ["changes", ["cg", "c"]],
        ["deletes", ["dl", "d"]],
        ["systems", ["st", "s"]],
        ["others", ["o"]]
    ],
    manual: {
        description: "This command is used to show the update log if the bot.",
        examples: [
            "updates",
            "updates --1.2.0",
            "updates commands",
            "updates commands.adds"
        ]
    },
    execute(message, args) {
        const defformver = (ver) => (ver === "Alpha.0.2")? "Alpha.1": (["Alpha.0.2.1", "Alpha.0.3.0", "Beta.0.1.0"].includes(ver))? "Alpha.2": "Alpha.2";
        let embed = new Discord.MessageEmbed()
            .setTitle("Bot Updates")
            .setColor("BLURPLE")
            .setTimestamp();;
        if (args.length) {
            let version: string, ud: {
                head: string,
                commands: {
                    adds: Record<string, string>
                    changes: Record<string, string>
                    deletes: Record<string, string>
                },
                other: string[],
                "plans to update": {
                    commands: Record<string, string>
                    systems: Record<string, string>
                    others: Record<string, string>
                },
                note: string[],
                end: string
            };
            if (args[0].startsWith("--")) {
                version = args.shift().slice(2),
                ud = udslist[version];
                if (!ud) return message.channel.send("`EN0012`: The version was invalid.");
            } else version = Object.keys(udslist).slice(-1)[0], ud = Object.values(udslist).slice(-1)[0];
            const mores = args.join(" ");
            if (mores) {
                let more = mores.split(".").map(a => a.replaceAll("_", " ")),
                fn = "",
                moo: string[] = [],
                b: typeof ud|ValueOf<typeof ud>|Record<string, string>|string[]|string = ud;
                const first = Object.entries(udsals["first"]),
                second = Object.entries(udsals["second"]),
                third = Object.entries(udsals["third"]);
                for (const a in more) {
                    if (!Number(a)) {if (!first.flatMap(a => a[1]).includes(more[a])) more[a] = first.find(b => b[1].includes(more[a]))?.[0];}
                    else if (!(second.flatMap(a => a[1]).includes(more[a])||third.flatMap(a => a[1]).includes(more[a]))) more[a] = (more[a] !== "plans to update")? second.find(b => b[1].includes(more[a]))?.[0]: third.find(b => b[1].includes(more[a]))?.[0];
                    b = b[more[a]];
                    if (!b) return message.channel.send("`EN0002`: The argument is invalid or unexist in this version of update");
                    moo.push(more[a]);
                }
                more = moo;
                let store = b,
                prints: string;
                if (!(store["length"]||Object.keys(store).length)) prints = "\n**Nothing to show**";
                else {
                    if (Array.isArray(store)) {
                        prints = store.join("\n");
                        fn = " -- "+more.map(a => StringHandlers.capitalize(a)).join(" - ");
                    } else if (typeof(store) === "object") {
                        let noth: number = 0,
                        store2: string[] = [];
                        for (const a in store) {
                            if (more[0] === "commands") {
                                if (["adds", "changes", "deletes"].includes(a)) {
                                    if (!Object.keys(store[a]).length) continue;
                                    noth+=Object.keys(store[a]).length;
                                    store2.push("**"+StringHandlers.capitalize(a)+":**");
                                    for (const b of Object.entries(store[a])) {
                                        if (b[0][0].match(/[A-Z]/)) store2.push(b[0]+" -- "+b[1]);
                                        else store2.push("`"+b[0]+"` -- "+b[1]);
                                    }
                                } else {
                                    if (a[0].match(/[A-Z]/)) store2.push(+a+" -- "+store[a]);
                                    else store2.push("`"+a+"` -- "+store[a]);
                                }
                            } else if (more[0] === "other") {if (store[a]) store2.push("\""+a+"\" -- "+store[a]);}
                            else if (more[0] === "plans to update") {
                                if (a in ud["plans to update"]) {
                                    if (store[a]) prints = "\n**Nothing to show**", noth = 1
                                    else store2.push("**"+StringHandlers.capitalize(a)+":**", ...Object.entries(store[a]).map((a: [string, string]) => "\""+StringHandlers.capitalize(a[0])+"\" -- "+((a[1].startsWith("v"))? b: StringHandlers.capitalize(a[1]))));
                                } else if (typeof b === "string") store2.push("\""+StringHandlers.capitalize(a)+"\" -- "+((b.startsWith("v"))? b: StringHandlers.capitalize(b)));
                            }
                        }
                        if (store2.length) prints = store2.join("\n");
                        else if (more[0] === "commands"&&!noth) prints = "\n**Nothing to show**"
                        fn = " -- "+more.map(a => StringHandlers.capitalize(a)).join(" - ");
                    } else {
                        if (store.split(" ").length === 1) prints = StringHandlers.capitalize(store);
                        else prints = store;
                        fn = " -- "+more.map(a => StringHandlers.capitalize(a)).join(" - ");
                    }
                }
                prints += "\n\nVersion: **v."+version+"**";
                embed.addField(version+fn, prints, false);
            } else {
                const formver = defformver(version);
                let prints: string[] = [];
                for (const a in ud) {
                    if (Array.isArray(ud[a])) {
                        if (!ud[a].length) continue;
                        prints.push("**"+StringHandlers.capitalize(a)+((formver==="Alpha.1")? ((a === "note")? "": ":"): ":")+"**");
                        prints.push(...ud[a].map(a => "> "+a));
                    } else if (typeof(ud[a]) === "object") {
                        if (!Object.values<Record<string, string>>(ud[a]).reduce((a, b) => a+Object.keys(b).length, 0)) continue;
                        prints.push("**"+StringHandlers.capitalize(a)+":**");
                        for (const c in ud[a]) {
                            if (!Object.keys(ud[a][c]).length) continue;
                            if (a === "other") {
                                prints.push("> \""+c+"\" -- "+ud[a][c]);
                                continue;
                            }
                            prints.push("> **"+StringHandlers.capitalize(c)+":**");
                            for (const [e, f] of Object.entries<string>(ud[a][c])) {
                                if (a === "commands") {
                                    if (a[0].match(/[A-Z]/)) prints.push("> "+e+" -- "+f);
                                    else prints.push("> `"+e+"` -- "+f);
                                } else if (a === "plans to update") prints.push("> \""+e+"\" -- "+StringHandlers.capitalize(f));
                            }
                        }
                    } else prints.push(ud[a]);
                }
                prints = prints.map(a => a.replace("{}", version));
                if (prints.join("\n").length>1000) {
                    let tlist = [prints.splice(0, ~~(prints.length/2)), prints];
                    for (const i in tlist) {
                        while (tlist[i].join("\n").length>1000) {
                            if (!i) tlist[1].unshift(tlist[0].pop());
                            else tlist[0].push(tlist[1].shift());
                        }
                    }
                    embed.addFields([{name: version, value: tlist[0].join("\n"), inline: false},
                        {name: "\u200b", value: tlist[1].join("\n"), inline: false}]);
                } else embed.addField(version, prints.join("\n"), false);
            }
        } else {
            const [version, ud] = Object.entries(udslist).slice(-1)[0],
            formver = defformver(version);
            let prints = [];
            for (const a in ud) {
                if (Array.isArray(ud[a])) {
                    if (!ud[a].length) continue;
                    prints.push("**"+StringHandlers.capitalize(a)+((formver==="Alpha.1")? ((a === "note")? "": ":"): ":")+"**");
                    prints.push(...ud[a].map(a => "> "+a));
                } else if (typeof(ud[a]) === "object") {
                    if (!Object.values<Record<string, string>>(ud[a]).reduce((a, b) => a+Object.keys(b).length, 0)) continue;
                    prints.push("**"+StringHandlers.capitalize(a)+":**");
                    for (const c in ud[a]) {
                        if (!Object.keys(ud[a][c]).length) continue;
                        if (a === "other") {
                            prints.push("> \""+c+"\" -- "+ud[a][c]);
                            continue;
                        }
                        prints.push("> **"+StringHandlers.capitalize(c)+":**");
                        for (const [e, f] of Object.entries<string>(ud[a][c])) {
                            if (a === "commands") {
                                if (a[0].match(/[A-Z]/)) prints.push("> "+e+" -- "+f);
                                else prints.push("> `"+e+"` -- "+f);
                            } else if (a === "plans to update") prints.push("> \""+e+"\" -- "+StringHandlers.capitalize(f));
                        }
                    }
                } else prints.push(ud[a]);
            }
            prints = prints.map(a => a.replace("{}", version));
            if (prints.join("\n").length>1000) {
                let tlist = [prints.splice(0, ~~(prints.length/2)), prints];
                for (const i in tlist) {
                    while (tlist[i].join("\n").length>1024) {
                        if (!i) tlist[1].unshift(tlist[0].pop());
                        else tlist[0].push(tlist[1].shift());
                    }
                }
                embed.addFields([{name: version, value: tlist[0].join("\n"), inline: false},
                    {name: "\u200b", value: tlist[1].join("\n"), inline: false}]);
            } else embed.addField(version, prints.join("\n"), false);
        }
        embed.setFooter({text: message.client.user.username+" | "+setting["version"], iconURL: message.client.user.displayAvatarURL()});
        message.channel.send({embeds: [embed]});
    }
}
export {Command};