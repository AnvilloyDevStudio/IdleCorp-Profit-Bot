import * as Discord from "discord.js";
import setting from "../setting.json";
import {StringHandlers} from "../funcs/StringHandlers";
import icals from "../icaliases.json";
import {NumberHandlers} from "../funcs/NumberHandlers";
import {calculate} from "../funcs/calculate";
import {youKnow} from "../funcs/youKnow";
import ICDetail from "../icdetails.json";
import * as IdleCorpTypes from "../types/IdleCorpTypes.js";
import {APIListener} from "../funcs/APIListener.js";
import { IdleCorpConnection } from "../funcs/IdleCorpConnection";
import Decimal from "decimal.js";

const Command: import("../types/command").Command = {
    name: "profitcomplete",
    aliases: ["pfc", "pfcomp"],
    syntax: "profitcomplete [--region:<region ID>] [--<time unit>] <facility> [<amount>]",
    description: "Calculating and giving more detailed profit calculation information of the facilities.",
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
        description: "This command is used to calculate the profit of the specific facility (at a specific amount) and resulting with more information about the result.",
        examples: [
            "profit steel mill",
            "profit --region:801019800682758145 steel mill",
            "profit --day drug fac 20"
        ]
    },
    execute(message, args, extra) {
        if (!args.length) return message.channel.send("`EN0001`: Missing facility name.")
        let regionId: string = null;
        if (["--region:", "--modifiers:", "--mods:"].some(a => args[0].toLowerCase().startsWith(a))) {
            regionId = args.shift().split(":")[1];
        }
        let num = (args[args.length-1].match(/^\d+[kmb]?$/))? NumberHandlers.numalias(args.pop()): 1,
        unit = "second";
        if (args[0].startsWith("--")) {
            let flag = args.shift().toLowerCase().slice(2);
            const flagals = {"sec": "second", "s": "second", "min": "minute", "m": "minute", "hr": "hour", "h": "hour", "d": "day"}
            if (flag in flagals) flag = flagals[flag], unit = flag;
            else if (!["second", "minute", "hour", "day"].includes(flag)) return message.channel.send("`EN0012`: Invalid time unit detected.");
        }
        let fac = args.join(" ").toLowerCase();
        if (!(fac.replaceAll(" ", "_") in ICDetail["facilities"])) fac = Object.entries(icals["ic"]["facilities"]).find(a => (a[1]?.includes(fac)))?.[0];
        else fac = fac.replaceAll(" ", "_")
        if (!(fac in ICDetail["facilities"])) return message.channel.send("`EN0002`: Invalid facility: "+args.join(" ")+".");
        const oriNum = num;
        num *= {"day": 60*60*24, "hour": 60*60, "minute": 60}[unit]??1;
        const ICDetails: IdleCorpTypes.FacilitiesNoArray = JSON.parse(JSON.stringify(Object.assign({}, ICDetail.facilities, {airport: Object.assign({}, ICDetail.facilities.airport, {speed: 20})})));
        const facDetail: IdleCorpTypes.FacilityDetailsNoArray = ICDetails[fac];
        let modpro = Promise.resolve();
        if (regionId) modpro = APIListener.DiscordAuthorization.getAuthbyID(extra.database, message.author.id).then(auth => {
            if (!auth) {
                const state = Date.now().toString()+"-"+message.author.id;
                const listener = new APIListener.DiscordAuthorization(extra.database, state);
                return new Promise<void>(rs => message.channel.send({embeds: [new Discord.MessageEmbed().setTitle("Discord account authorization").setURL(APIListener.DiscordAuthorization.authString+state)]}).then(msg => {
                    listener.on("timeout", () => {
                        msg.edit({embeds: [new Discord.MessageEmbed().setTitle("Authorization Timeout").setDescription("Calculating without regional modifiers instead...").setColor("RED").setTimestamp()]});
                        rs();
                        listener.removeAllListeners();
                    })
                    listener.on("authorized", auth => {
                        IdleCorpConnection.getRegionalModifiers(auth.token, regionId, null).then(b => {
                            if (b===null) msg.edit({embeds: [new Discord.MessageEmbed().setTitle("Invalid Region ID").setDescription("Calculating without regional modifiers instead...").setColor("RED").setTimestamp()]});
                            else {
                                for (const f in ICDetails) if (f in b) ICDetails[f].speed = Math.round(new Decimal(b[f]).mul(ICDetails[f].speed).div(100+b["happiness"]).toNumber());
                                    else ICDetails[f].speed = Math.round(new Decimal(ICDetails[f].speed).div(100+b["happiness"]).toNumber());
                            }
                            rs();
                        })
                        listener.removeAllListeners();
                    })
                }))
            } else {
                return IdleCorpConnection.getRegionalModifiers(auth.token, regionId, null).then(b => {for (const f in ICDetails) if (f in b) ICDetails[f].speed = Math.round(new Decimal(b[f]).mul(ICDetails[f].speed).div(100+b["happiness"]).toNumber());
                    else ICDetails[f].speed = Math.round(new Decimal(ICDetails[f].speed).div(100+b["happiness"]).toNumber());});
            }
        })
        modpro.then(() => {
            const facratio = calculate.facratio(facDetail, oriNum, ICDetails);
            const firstfac = calculate.firstFac(facratio[2], num);
            const remain = calculate.produceRemain(facDetail, facratio[2], oriNum, firstfac[2], ICDetails)
            const sol = calculate.productProfit(facDetail, "all", num);
            const soland = calculate.productProfitLand(facDetail, "all", num, firstfac[2]);
            let s2: string[] = [],
            count = 0,
            pf: string, pfland: string;
            for (const a of [sol[0], sol[1], soland[1]]) {
                let s = []
                if (a !== null) {
                    for (let b of Object.entries(a)) {
                        const bb = b[1].split(".");
                        s.push("> **"+StringHandlers.capitalize(b[0]).replaceAll("_", " ")+"** | $"+NumberHandlers.numberToLocaleString(parseInt(bb[0]))+((bb[1])? "."+bb[1]: ".00")+((count === 2)? "/land": ""));
                    }
                    s2.push(s.join("\n"));
                } else s2.push("> *None*");
                count++;
            }
            {
                const pf1 = sol[2].split(".")
                console.log(pf1)
                pf = "> $"+NumberHandlers.numberToLocaleString(parseInt(pf1[0]))+((pf1[1])? "."+pf1[1]: ".00");
                const pfland1 = soland[2].split(".");
                pfland = "> $"+NumberHandlers.numberToLocaleString(parseInt(pfland1[0]))+((pfland1[1])? "."+pfland1[1]: ".00")+"/land";
            }
            let rem: string[] = [];
            for (let a of remain[0]) {
                const aa = a[1].split(".");
                rem.push("> **"+StringHandlers.capitalize(a[0]).replaceAll("_", " ")+"** | "+NumberHandlers.numberToLocaleString(parseInt(aa[0]))+((aa[1])? "."+aa[1]: ".00"));
            }
            rem.push("");
            for (const a of remain[1]) {
                const aa = a[1].split(".");
                rem.push("> **"+StringHandlers.capitalize(a[0]).replaceAll("_", " ")+"** | $"+NumberHandlers.numberToLocaleString(parseInt(aa[0]))+((aa[1])? "."+aa[1]: ".00"));
            }
            const embed = new Discord.MessageEmbed()
                .setTitle(StringHandlers.capitalize(fac).replaceAll("_", " "))
                .setColor("BLUE")
                .setDescription("Unit: "+StringHandlers.capitalize(unit))
                .setTimestamp()
                .setAuthor({name: message.client.user.username, iconURL: message.client.user.displayAvatarURL()})
                .addFields([{name: "Consumes", value: s2[0], inline: false},
                    {name: "Produces", value: s2[1]+"\n\n"+s2[2], inline: false},
                    {name: "Profit", value: pf+"\n\n"+pfland, inline: false},
                    {name: "Complete Information", value: "Ratio (order follow to above): "+facratio[0]+" "+facratio[1]+"\n\n**Required facilities:**\n"+firstfac[0]+"\n"+firstfac[1], inline: false},
                    {name: "Produce Remains", value: rem.join("\n")+"\n\nTotal remain: $"+remain[2]+"/land", inline: false},
                    {name: "Note", value: "The result of this command is for calculation the basic values only, the actual profit may vary.\nThe calculation on **profit** also takes into account the consumption of the facility. While the **produce** section describes the gross profit without taking into account consumption.", inline: false}])
                .setFooter({text: message.client.user.username+" | "+setting["version"], iconURL: message.client.user.displayAvatarURL()});
            youKnow.embed(embed, message);
        })
    }
}
export {Command};