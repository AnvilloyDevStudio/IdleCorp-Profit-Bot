import * as Discord from "discord.js";
import setting from "../setting.json";
import { StringHandlers } from "../funcs/StringHandlers";
import icals from "../icaliases.json";
import { NumberHandlers } from "../funcs/NumberHandlers";
import { calculate } from "../funcs/calculate";
import { youKnow } from "../funcs/youKnow";
import ICDetails from "../icdetails.json";
import { APIListener } from "../funcs/APIListener";
import { IdleCorpConnection } from "../funcs/IdleCorpConnection";
import Decimal from "decimal.js";
const Command = {
    name: "speed",
    aliases: ["sp"],
    syntax: "speed [--region:<region ID>] [--<time unit>] <facility> [<amount>]",
    description: "Calculating the speed of the facilities.",
    args: [
        ["[--region:<region ID>>]", "The optional parameter that specifies the regional production effects for facilities."],
        ["[--<time unit>]", "The time unit of the result. Available time unit: \"second\", \"minute\", \"hour\", \"day\". Defaults with second."],
        ["<facility>", "The specific facility needed to be calculated."],
        ["[<amount>]", "The specific amount of the specific facility in the calculation, defaults with 1."]
    ],
    argaliases: [
        ["--region:", ["--modifiers:", "--mods:"]],
        ["second", ["sec", "s"]],
        ["minute", ["min", "m"]],
        ["hour", ["hr", "h"]],
        ["day", ["d"]]
    ],
    manual: {
        description: "This command is used to calculate the production speeds of the specific facility.",
        examples: [
            "speed steel mill",
            "speed --region:801019800682758145 steel mill",
            "speed --day drug fac 20"
        ]
    },
    execute(message, args, extra) {
        if (!args.length)
            return message.channel.send("`EN0001`: Missing facility name.");
        let regionId = null;
        if (["--region:", "--modifiers:", "--mods:"].some(a => args[0].toLowerCase().startsWith(a))) {
            regionId = args.shift().split(":")[1];
        }
        let num = (args[args.length - 1].match(/^\d+[kmb]?$/)) ? NumberHandlers.numalias(args.pop()) : 1, unit = "second";
        if (args[0].startsWith("--")) {
            let flag = args.shift().toLowerCase().slice(2);
            const flagals = { "sec": "second", "s": "second", "min": "minute", "m": "minute", "hr": "hour", "h": "hour", "d": "day" };
            if (flag in flagals)
                flag = flagals[flag], unit = flag;
            else if (!["second", "minute", "hour", "day"].includes(flag))
                return message.channel.send("`EN0012`: Invalid time unit detected.");
        }
        let fac = args.join(" ").toLowerCase();
        if (!(fac.replaceAll(" ", "_") in ICDetails["facilities"]))
            fac = Object.entries(icals["ic"]["facilities"]).find(a => (a[1].includes(fac)))?.[0];
        else
            fac = fac.replaceAll(" ", "_");
        if (!(fac in ICDetails["facilities"]))
            return message.channel.send("`EN0002`: Invalid facility: " + args.join(" ") + ".");
        const facDetail = fac !== "airport" ? Object.assign({}, ICDetails.facilities[fac]) : { ...ICDetails.facilities.airport, speed: 20 };
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
                            IdleCorpConnection.getRegionalModifiers(auth.token, regionId, fac).then(b => {
                                if (b === null)
                                    msg.edit({ embeds: [new Discord.MessageEmbed().setTitle("Invalid Region ID").setDescription("Calculating without regional modifiers instead...").setColor("RED").setTimestamp()] });
                                else
                                    facDetail.speed = Math.round(new Decimal(b).mul(facDetail.speed).toNumber());
                                rs();
                            });
                            listener.removeAllListeners();
                        });
                    }));
                }
                else {
                    return IdleCorpConnection.getRegionalModifiers(auth.token, regionId, fac).then(b => { facDetail.speed = Math.round(new Decimal(b).mul(facDetail.speed).toNumber()); });
                }
            });
        modpro.then(() => {
            const sol = calculate.productSpeed(facDetail, "all", num);
            let s = [], c, p;
            if (sol[0] !== null) {
                for (let a of Object.entries(sol[0])) {
                    const aa = a[1].split(".");
                    s.push("> **" + StringHandlers.capitalize(a[0]).replaceAll("_", " ") + "**" + " | " + NumberHandlers.numberToLocaleString(parseInt(aa[0])) + ((aa[1]) ? "." + aa[1] : ".00"));
                }
                c = s.join("\n");
            }
            else
                c = "> None";
            s = [];
            for (let a of Object.entries(sol[1])) {
                const aa = a[1].split(".");
                s.push("> **" + StringHandlers.capitalize(a[0]).replaceAll("_", " ") + "**" + " | " + NumberHandlers.numberToLocaleString(parseInt(aa[0])) + ((aa[1]) ? "." + aa[1] : ".00"));
            }
            p = s.join("\n");
            const embed = new Discord.MessageEmbed()
                .setTitle(StringHandlers.capitalize(fac).replaceAll("_", " "))
                .setColor("BLUE")
                .setDescription("Unit: " + StringHandlers.capitalize(unit))
                .setTimestamp()
                .setAuthor({ name: message.client.user.username, iconURL: message.client.user.displayAvatarURL() })
                .addFields([{ name: "Consumes", value: c, inline: false },
                { name: "Produces", value: p, inline: false },
                { name: "Note", value: "The result of this command is for calculation the basic values only, The actual production speeds may vary", inline: false }])
                .setFooter({ text: message.client.user.username + " | " + setting["version"], iconURL: message.client.user.displayAvatarURL() });
            youKnow.embed(embed, message);
        });
    }
};
export { Command };
//# sourceMappingURL=speed.js.map