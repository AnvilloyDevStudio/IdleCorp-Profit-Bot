import * as Discord from "discord.js";
import setting from "../setting.json";
import { APIListener } from "../funcs/APIListener.js";
import Decimal from "decimal.js";
import { StringHandlers } from "../funcs/StringHandlers.js";
import { IdleCorpConnection } from "../funcs/IdleCorpConnection.js";
import { NumberHandlers } from "../funcs/NumberHandlers";
const Command = {
    name: "corporation",
    aliases: ["corp", "c", "profile"],
    syntax: "corporation [<type>]",
    description: "Querying the corporation profile of an IdleCorp player.",
    args: [
        ["[<type>]", "The profile type, accepts blank, \"regions\", \"season pass\", \"challenges\""]
    ],
    argaliases: [
        ["regions", ["reg"]],
        ["season pass", ["season", "seasonpass", "pass"]],
        ["challenges", ["challenge", "daily"]]
    ],
    manual: {
        description: "You can only query your corporation profile, regional profiles, season pass and challenge profile. Queries corporation profile by default.",
        examples: [
            "corporation",
            "corporation regions"
        ],
        note: "You can only query your profiles by the limitation of the API."
    },
    execute(message, args, extra) {
        let id;
        if (/[0-9]+/.test(args[args.length - 1]))
            id = args.pop();
        let arg = args.join(" ");
        if (arg && !["regions", "reg", "season", "season pass", "seasonpass", "pass", "challenges", "challenge"].includes(arg))
            return message.channel.send("`EN0002`: Invalid corporation information.");
        arg = { "reg": "regions", "season": "season pass", "seasonpass": "season pass", "pass": "season pass", "challenge": "challenges", "daily": "challenges" }[arg] ?? arg;
        const state = String(Date.now()) + "-" + message.author.id;
        const listener = new APIListener.DiscordAuthorization(extra.database, state, 60);
        APIListener.DiscordAuthorization.getAuthbyID(extra.database, message.author.id).then(auth => {
            if (!auth)
                message.channel.send({ embeds: [new Discord.MessageEmbed().setTitle("Discord account authorization").setURL(APIListener.DiscordAuthorization.authString + state)] }).then(msg => {
                    listener.on("timeout", () => {
                        msg.edit({ embeds: [new Discord.MessageEmbed().setTitle("Authorization Timeout").setColor("RED").setTimestamp()] });
                        listener.removeAllListeners();
                    });
                    listener.on("authorized", auth => {
                        IdleCorpConnection.request(auth.token, arg ? "/" + arg : "").then(dt => {
                            const embed = new Discord.MessageEmbed();
                            let extra = "";
                            if (!arg) {
                                extra = `Founded on ${dt["foundedTimestamp"]["date"]["year"]}/${dt["foundedTimestamp"]["date"]["month"]}/${dt["foundedTimestamp"]["date"]["day"]}`;
                                embed.setTitle("Corporation -- " + dt["name"]);
                                if (dt["description"])
                                    embed.setDescription(dt["description"]);
                                embed.addField("Information", "Capital: " + dt["capital"] + "\nReincorporation token/score: " + dt["riTokens"] + "/" + dt["riScore"] + "\nLeader Board: " + (dt["leaderboardOptIn"] ? "Yes" : "No") + "\nTechnology Slots: " + dt["techSlots"]);
                                embed.addField("Notifications", "Research: " + (dt["notifyResearch"] ? "Yes" : "No") + "\nMarket: " + (dt["notifyMarket"] ? "Yes" : "No") + "\nVote: " + (dt["notifyVote"] ? "Yes" : "No") + "\nExport: " + (dt["notifyExport"] ? "Yes" : "No"));
                            }
                            else if (arg === "regions") {
                                if (!id) {
                                    embed.setDescription("List of regions available (id):\n" + Object.keys(dt).join("\n"));
                                }
                                else {
                                    if (!(id in dt))
                                        return message.channel.send("`EN0002`: Invalid region ID.");
                                    const region = dt[id];
                                    embed.setTitle("Region -- " + id);
                                    if (region["fromDb"]) {
                                        embed.setDescription("Land: " + region["region"]["landCount"] + "\nPopulation: " + region["region"]["population"] + "\nHappiness: " + region["region"]["happiness"]);
                                        const prod = (num) => {
                                            const perc = ((num - 1) * 100).toFixed(2);
                                            return parseFloat(perc) >= 0 ? "+" + perc + "%" : perc + "%";
                                        };
                                        const pol = {
                                            university: 20000000000,
                                            office_region: 10000000000,
                                            office_land_management: 50000000000,
                                            park_small: 10000000,
                                            park_medium: 100000000,
                                            park_large: 1000000000
                                        };
                                        embed.addFields([
                                            { name: "Production", value: Object.entries(region["region"]["productionCoeffs"]).map((a) => "**" + a[0].replaceAll("_", " ") + "** | " + prod(a[1])).join("\n") },
                                            { name: "Active policy", value: region["region"]["activePolicies"].map(a => StringHandlers.capitalize(a["id"].replaceAll("_", " "))).join(", ") },
                                            { name: "Services", value: Object.entries(region["region"]["servicesProgress"]).map((a) => "**" + StringHandlers.capitalize(a[0].replaceAll("_", " ")) + "** | " + a[1] + ` (${new Decimal(a[1]).div(pol[a[0]]).mul(100).toFixed(2)}%)`) }
                                        ]);
                                    }
                                    else {
                                        embed.setDescription("No data.");
                                    }
                                }
                            }
                            else if (arg === "season pass") {
                                embed.setTitle("Season " + dt["season"])
                                    .setDescription("Points: " + dt["points"]);
                            }
                            else {
                                embed.setTitle("Season Daily Challenges")
                                    .setDescription("Unavailable.");
                            }
                            return message.channel.send({ embeds: [embed.setTimestamp().setFooter({ text: (extra ? extra + " • " : "") + message.client.user.username + " | " + setting.version, iconURL: message.client.user.displayAvatarURL() })] });
                        });
                        listener.removeAllListeners();
                    });
                });
            else {
                IdleCorpConnection.request(auth.token, arg ? "/" + arg : "").then(dt => {
                    const embed = new Discord.MessageEmbed();
                    let extra = "";
                    if (!arg) {
                        extra = `Founded on ${dt["foundedTimestamp"]["date"]["year"]}/${dt["foundedTimestamp"]["date"]["month"]}/${dt["foundedTimestamp"]["date"]["day"]}`;
                        embed.setTitle("Corporation -- " + dt["name"]);
                        if (dt["description"])
                            embed.setDescription(dt["description"]);
                        embed.addField("Information", "Capital: " + dt["capital"] + "\nReincorporation token/score: " + dt["riTokens"] + "/" + dt["riScore"] + "\nLeader Board: " + (dt["leaderboardOptIn"] ? "Yes" : "No") + "\nTechnology Slots: " + dt["techSlots"]);
                        embed.addField("Notifications", "Research: " + (dt["notifyResearch"] ? "Yes" : "No") + "\nMarket: " + (dt["notifyMarket"] ? "Yes" : "No") + "\nVote: " + (dt["notifyVote"] ? "Yes" : "No") + "\nExport: " + (dt["notifyExport"] ? "Yes" : "No"));
                    }
                    else if (arg === "regions") {
                        if (!id) {
                            embed.setDescription("List of regions available (id):\n" + Object.keys(dt).join("\n"));
                        }
                        else {
                            if (!(id in dt))
                                return message.channel.send("`EN0002`: Invalid region ID.");
                            const region = dt[id];
                            embed.setTitle("Region -- " + id);
                            if (region["fromDb"]) {
                                embed.setDescription("Land: " + region["region"]["landCount"] + "\nPopulation: " + region["region"]["population"] + "\nHappiness: " + region["region"]["happiness"]);
                                const prod = (num) => {
                                    const perc = ((num - 1) * 100).toFixed(2);
                                    return parseFloat(perc) >= 0 ? "+" + perc + "%" : perc + "%";
                                };
                                const pol = {
                                    university: 20000000000,
                                    office_region: 10000000000,
                                    office_land_management: 50000000000,
                                    park_small: 10000000,
                                    park_medium: 100000000,
                                    park_large: 1000000000,
                                    fiber: 1000000000000
                                };
                                embed.addFields([
                                    { name: "Production", value: Object.entries(region["region"]["productionCoeffs"]).map((a) => "**" + a[0].replaceAll("_", " ") + "** | " + prod(a[1])).join("\n") },
                                    { name: "Active policy", value: region["region"]["activePolicies"].map(a => StringHandlers.capitalize(a["id"].replaceAll("_", " "))).join(", ") || "*No active policy.*" },
                                    { name: "Services", value: Object.entries(region["region"]["servicesProgress"]).map((a) => "**" + StringHandlers.capitalize(a[0].replaceAll("_", " ")) + "** | " + NumberHandlers.numberToLocaleString(a[1]) + ` (${new Decimal(a[1]).div(pol[a[0]]).mul(100).toFixed(2)}%)`).join("\n") || "*No progress*" }
                                ]);
                            }
                            else {
                                embed.setDescription("No data.");
                            }
                        }
                    }
                    else if (arg === "season pass") {
                        embed.setTitle("Season " + dt["season"])
                            .setDescription("Points: " + dt["points"]);
                    }
                    else {
                        embed.setTitle("Season Daily Challenges")
                            .setDescription("Unavailable.");
                    }
                    return message.channel.send({ embeds: [embed.setTimestamp().setFooter({ text: (extra ? extra + " • " : "") + message.client.user.username + " | " + setting.version, iconURL: message.client.user.displayAvatarURL() })] });
                });
            }
        });
    }
};
export { Command };
//# sourceMappingURL=corporation.js.map