const Discord = require("discord.js");
const setting = require("../setting.json");
const APIListener = require("../funcs/APIListener");
const fetch = require("node-fetch");
const Decimal = require("decimal.js");
const StringHandlers = require("../funcs/StringHandlers");

module.exports = {
    name: "corporation",
    execute(message, args) {
        let id;
        if (/[0-9]+/.test(args[args.length-1])) id = args.pop()
        args = args.join(" ")
        if (args&&!["regions", "reg", "season", "season pass", "seasonpass", "pass", "challenges", "challenge"].includes(args)) return message.channel.send("`EN0002`: Invalid corporation information.")
        args = {"reg": "regions", "season": "season pass", "seasonpass": "season pass", "pass": "season pass", "challenge": "challenges", "daily": "challenges"}[args] ?? args;
        const state = String(Date.now())+"-"+message.author.id;
        const listener = new APIListener.DiscordAuthorization(state, 60);
        message.channel.send(new Discord.MessageEmbed().setTitle("Discord account authorization").setURL(`http://discord.com/api/oauth2/authorize?response_type=token&client_id=801019508387086346&redirect_uri=http%3A%2F%2Flocalhost%3A3000%2Fapi&scope=identify%20email%20guilds&state=`+state)).then(msg => {
            listener.on("timeout", () => {
                msg.edit(new Discord.MessageEmbed().setTitle("Authorization Timeout").setColor("RED").setTimestamp())
                listener.removeAllListeners()
            })
            listener.on("authorized", auth => {
                fetch("https://ic-hg-service.teemaw.dev/corporation/@me"+(args? "/"+args.replace(" ", "_"): ""), {headers: {Accept: "application/json", "Content-Type": "application/json", Authorization: "Bearer "+auth[1]}}).then(a => a.json()).then(dt => {
                    console.log(dt)
                    const embed = new Discord.MessageEmbed()
                    let extra = ""
                    if (!args) {
                        extra = `Founded on ${dt["foundedTimestamp"]["date"]["year"]}/${dt["foundedTimestamp"]["date"]["month"]}/${dt["foundedTimestamp"]["date"]["day"]}`
                        embed.setTitle("Corporation -- "+dt["name"])
                        if (dt["description"]) embed.setDescription(dt["description"])
                        embed.addField("Information", "Capital: "+dt["capital"]+"\nReincorporation token/score: "+dt["riTokens"]+"/"+dt["riScore"]+"\nLeader Board: "+(dt["leaderboardOptIn"]? "Yes": "No")+"\nTechnology Slots: "+dt["techSlots"])
                        embed.addField("Notifications", "Research: "+(dt["notifyResearch"]? "Yes": "No")+"\nMarket: "+(dt["notifyMarket"]? "Yes": "No")+"\nVote: "+(dt["notifyVote"]? "Yes": "No")+"\nExport: "+(dt["notifyExport"]? "Yes": "No"))
                    } else if (args==="regions") {
                        if (!id) {
                            embed.setDescription("List of regions available (id):\n"+Object.keys(dt).join("\n"))
                        } else {
                            if (!(id in dt)) return message.channel.send("`EN0002`: Invalid region ID.")
                            const region = dt[id]
                            embed.setTitle("Region -- "+id)
                            if (region["fromDb"]) {
                                embed.setDescription("Land: "+region["region"]["landCount"]+"\nPopulation: "+region["region"]["population"]+"\nHappiness: "+region["region"]["happiness"])
                                const prod = (num) => {
                                    num = ((num-1)*100).toFixed(2)
                                    return num>=0? "+"+num+"%": num+"%";
                                }
                                const pol = {
                                    university: 20000000000,
                                    office_region: 10000000000,
                                    office_land_management: 50000000000,
                                    park_small: 10000000,
                                    park_medium: 100000000,
                                    park_large: 1000000000
                                }
                                embed.addFields([
                                    {name: "Production", value: Object.entries(region["region"]["productionCoeffs"]).map(a => "**"+a[0].replaceAll("_", " ")+"** | "+prod(a[1])).join("\n")},
                                    {name: "Active policy", value: region["region"]["activePolicies"].map(a => StringHandlers.capitalize(a["id"].replaceAll("_", " "))).join(", ")},
                                    {name: "Services", value: Object.entries(region["region"]["servicesProgress"]).map(a => "**"+StringHandlers.capitalize(a[0].replaceAll("_", " "))+"** | "+a[1]+` (${Decimal(a[1]).div(pol[a[0]]).mul(100).toFixed(2)}%)`)}
                                ])
                            } else {
                                embed.setDescription("No data.")
                            }
                        }
                    } else if (args === "season pass") {
                        embed.setTitle("Season "+dt["season"])
                        .setDescription("Points: "+dt["points"])
                    } else {
                        embed.setTitle("Season Daily Challenges")
                        .setDescription("Unavailable.")
                    }
                    return message.channel.send(embed.setTimestamp().setFooter((extra? extra+" • ": "")+message.client.user.username+" | "+setting.version, message.client.user.displayAvatarURL()))
                })
                listener.removeAllListeners()
            })
        })
    },
};