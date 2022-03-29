import * as Discord from "discord.js";
import setting from "../setting.json";
import {StringHandlers} from "../funcs/StringHandlers.js";
import icals from "../icaliases.json";
import {NumberHandlers} from "../funcs/NumberHandlers.js";
import {youKnow} from "../funcs/youKnow";
import {IdleCorpConnection} from "../funcs/IdleCorpConnection.js";
import Decimal from "decimal.js";
import Fraction from "fraction.js";
import {Pages} from "../funcs/Pages.js";
import ICDetails from "../icdetails.json";
import * as IdleCorpTypes from "../types/IdleCorpTypes.js";
import {APIListener} from "../funcs/APIListener.js";

const Command: import("../types/command").Command = {
    name: "production",
    aliases: ["pd", "pdt", "product", "produce"],
    syntax: "production [--region:<region ID>] {--to <amount> <facility> [<amount>] | [<optional effects>] <facilities> [<assets>]}",
    description: "Calcualting the productions.",
    args: [
        ["[--region:<region ID>]", "The optional parameter that specifies the regional production effects for facilities."],
        ["--to <amount>", "This is used to calculate the requirements for producing specific amount of the production."],
        ["<facility> [<amount>]", "Specifying a facility and amount of the facility."],
        ["[<optional effects>]", "The optional effects include `--technology <technologies>`, `--policy <policies>` and `--service <services>`. They are all optional."],
        ["<facilities>", "Specifying all the facilities in the production calculation, it follows to a format of `{<facility>: <amount>[, ...]}`."],
        ["[<assets>]", "Specifying all the assets needed for the production. The format is as same as facilities parameter. Specifiying this parameter also calculates the time of the production maintains."]
    ],
    argaliases: [
        ["--region:", ["--modifiers:", "--mods:"]],
        ["--to", ["--until", "--goal"]],
        ["--technology", ["--tech"]],
        ["--service", ["--serv"]]
    ],
    manual: {
        description: "You can use this command to calculate the production of specfic facilities.",
        examples: [
            "production --to 1000 steel mill",
            "production {steel mill: 1}",
            "production --region:801019800682758145 {steel mill: 2} {coal: 10000, iron: 15000}"
        ]
    },
    async execute(message, args, extra) {
        if (!args.length) return message.channel.send("`EN0001`: Missing parameter.")
        let regionId: string = null;
        if (["--region:", "--modifiers:", "--mods:"].some(a => args[0].toLowerCase().startsWith(a))) {
            regionId = args.shift().split(":")[1];
        }
        const ICDetail = ICDetails;
        if (["--to", "--until", "--goal"].includes(args[0].toLowerCase())) {
            args.shift();
            if (!args.length) return message.channel.send("`EN0021`: Missing production goal parameter.");
            let goal = Math.ceil(NumberHandlers.numalias(args.shift()));
            if (isNaN(goal)) return message.channel.send("`EN0022`: The production goal was invalid.");
            let num = 1;
            if (parseInt(args[args.length])) {
                num = parseInt(args.pop());
            }
            let fac = args.join(" ").toLowerCase();
            if (!(fac.replaceAll(" ", "_") in ICDetails["facilities"])) fac = Object.entries(icals["ic"]["facilities"]).find(a => (a[1].includes(fac)))?.[0];
            else fac = fac.replaceAll(" ", "_")
            if (!(fac in ICDetails["facilities"])) return message.channel.send("`EN0002`: Invalid facility name: "+args.join(" ")+".");
            let faclist: Record<string, IdleCorpTypes.FacilityDetailsNoArray> = {...ICDetails["facilities"], airport: {...ICDetails.facilities.airport, speed: 20}},
            faccs = faclist[fac]["consumes"], speed = faclist[fac]["speed"],
            modpro: Promise<void>;
            if (regionId&&fac!=="airport") {
                modpro = APIListener.DiscordAuthorization.getAuthbyID(extra.database, message.author.id).then(auth => {
                    if (!auth) {
                        const state = Date.now().toString()+"-"+message.author.id;
                        const listener = new APIListener.DiscordAuthorization(extra.database, state);
                        return new Promise(rs => message.channel.send({embeds: [new Discord.MessageEmbed().setTitle("Discord account authorization").setURL(APIListener.DiscordAuthorization.authString+state)]}).then(msg => {
                            listener.on("timeout", () => {
                                msg.edit({embeds: [new Discord.MessageEmbed().setTitle("Authorization Timeout").setDescription("Calculating without regional modifiers instead...").setColor("RED").setTimestamp()]});
                                rs()
                                listener.removeAllListeners();
                            })
                            listener.on("authorized", auth => {
                                IdleCorpConnection.getRegionalModifiers(auth.token, regionId, fac).then(b => {
                                    if (b===null) msg.edit({embeds: [new Discord.MessageEmbed().setTitle("Invalid Region ID").setDescription("Calculating without regional modifiers instead...").setColor("RED").setTimestamp()]});
                                    else speed = /*Array.isArray(speed)? speed.map(a => Math.round(new Decimal(b).mul(a).toNumber())):*/ Math.round(new Decimal(b).mul(speed).toNumber());
                                    rs();
                                })
                                listener.removeAllListeners();
                            })
                        }))
                    } else {
                        return IdleCorpConnection.getRegionalModifiers(auth.token, regionId, fac).then(b => {speed = /*Array.isArray(speed)? speed.map(a => Math.round(new Decimal(b).mul(a).toNumber())):*/ Math.round(new Decimal(b).mul(speed).toNumber())});
                    }
                })
            } else modpro = Promise.resolve();
            modpro.then(() => {
                const cycle = new Fraction(goal).div(Object.values(faclist[fac]["produces"])[0]).div(num);
                if (Array.isArray(speed)) speed = speed[0];
                const production = parseInt(cycle.ceil().toString())*speed;
                const embed = new Discord.MessageEmbed()
                    .setTitle(StringHandlers.capitalize(fac).replaceAll("_", " "))
                    .setColor("BLUE")
                    .setTimestamp()
                    .setAuthor({name: message.client.user.username, iconURL: message.client.user.displayAvatarURL()})
                    .setDescription("Production time: "+production+" seconds ("+NumberHandlers.toTime(production).reduce((a, b, c) => (!c&&b === 0)? a: a.concat((b<10)? "0"+b: b), []).join(":")+")\nProduction cycle(s): "+cycle.toString()+" (at least needed: "+cycle.ceil()+")")
                    .addField("Required assets", (faccs === null)? "> None": Object.entries(faccs).map(a => "> **"+StringHandlers.capitalize(a[0]).replaceAll("_", " ")+"** | "+a[1]*production*num).join("\n"), false)
                    .addField("Note", "The result of this command is for calculating the basic values only, the actual values may vary.", false)
                    .setFooter({text: message.client.user.username+" | "+setting.version, iconURL: message.client.user.displayAvatarURL()})
                youKnow.embed(embed, message);
            });
        } else {
            if (!args.length) return message.channel.send("`EN0021`: Missing production parameter(s).");
            let mods: {technology: [string, number][], service: string[], policy: string[], happiness: number} = {technology: [], service: [], policy: [], happiness: 0}
            let arg = "";
            let region: {happiness: number, productionCoeffs: Partial<IdleCorpTypes.productionCoeffs>, policies: string[], services: string[]} = {happiness: 0, productionCoeffs: {}, policies: [], services: []};
            if (regionId) {
                let auth = await APIListener.DiscordAuthorization.getAuthbyID(extra.database, message.author.id);
                if (!auth) {
                    const state = Date.now().toString()+"-"+message.author.id;
                    const listener = new APIListener.DiscordAuthorization(extra.database, state);
                    await new Promise<void>(rs => message.channel.send({embeds: [new Discord.MessageEmbed().setTitle("Discord account authorization").setURL(APIListener.DiscordAuthorization.authString+state)]}).then(msg => {
                        listener.on("timeout", () => {
                            msg.edit({embeds: [new Discord.MessageEmbed().setTitle("Authorization Timeout").setDescription("Calculating without regional modifiers instead...").setColor("RED").setTimestamp()]});
                            listener.removeAllListeners();
                            rs();
                        })
                        listener.on("authorized", a => {auth = a; rs();});
                    }))
                }
                if (auth !== null) await IdleCorpConnection.getRegionalModifiers(auth.token, regionId).then(r => {
                    region.happiness = r.happiness;
                    region.productionCoeffs = r.productionCoeffs;
                    region.policies = r.activePolicies.map(a => a.id==="income_tax_high"? "high_income_tax": a.id==="income_tax_low"? "low_income_tax": a.id);
                    if (r.servicesProgress.park_large===1000000000) region.services.push("large_park");
                    if (r.servicesProgress.park_medium===100000000) region.services.push("medium_park");
                    if (r.servicesProgress.park_small===10000000) region.services.push("small_park");
                })
            }
            const ICDetails: typeof ICDetail = JSON.parse(JSON.stringify(ICDetail));
            const Facilities: IdleCorpTypes.FacilitiesNoArray = {...ICDetails.facilities, airport: {...ICDetails.facilities.airport, speed: 20}};
            const Assets = ICDetails.assets;
            if (args[0].startsWith("--")) {
                if (args.length<3) return message.channel.send("`EN0021`: Missing production parameter(s).");
                let c = args.filter(a => a.startsWith("--"))
                if (c.some(a => !["--technology", "--tech", "--service", "--serv", "--policy"].includes(a))) return message.channel.send("`EN0022`: Invalid flag detected.")
                const b = c.map(a => ({"--tech": "technology", "--serv": "service"}[a] ?? a.slice(2)))
                const a = args.join(" ").match(new RegExp(c.reduce((a, b) => a+b+" {([\\w ]+(?:: ?[0-9]+)?(?:, ?[\\w ]+(?:: ?[0-9]+))*)} ", "^").slice(0, -1)+"([\\w\\{\\}:, ]+)$"))
                arg = a[a.length-1].startsWith(" {")? a.pop().slice(1): "";
                if (!a) return message.channel.send("`EN0022`: Invalid items detected.")
                for (let t = 1; t<a.length; t++) {
                    switch(b[t-1]) {
                        case "technology": mods.technology = a[t].split(/, ?/).map(a => a.split(/: ?/)).map(a => [a[0], a[1]===undefined? 1: parseInt(a[1])]); break;
                        case "service": mods.service = a[t].split(/, ?/); break;
                        case "policy": mods.policy = a[t].split(/, ?/); break;
                    }
                }
                if (mods["technology"].filter(a => !(a[0] in icals["ic"]["technologies"])).length) return message.channel.send("`EN0022`: Invalid items detected (in technology).");
                if (mods["service"].filter(a => !(a[0] in icals["ic"]["services"])).length) return message.channel.send("`EN0022`: Invalid items detected (in service).");
                if (mods["policy"].filter(a => !(a[0] in icals["ic"]["policies"])).length) return message.channel.send("`EN0022`: Invalid items detected (in policy).");
                if (mods["technology"].some(a => isNaN(a[1]))) return message.channel.send("`EN0022`: Invalid number parameter detected, in technology parameter.");
                mods.happiness += region.happiness;
                mods.service.push(...region.services);
                mods.policy.push(...region.policies);
                // Levels are ignored
                if (mods.technology.length) { // airport tram is ignored
                    if ("oil_mapping" in mods.technology) Facilities.oil_well.produces.crude_oil = 14;
                    if ("oil_mapping_u" in mods.technology) Facilities.oil_well.produces.crude_oil = 18;
                    if ("oil_mapping_uu" in mods.technology) Facilities.oil_well.produces.crude_oil = 100;
                    if ("coal_detector" in mods.technology) Facilities.coal_mine.produces.coal = 12;
                    if ("coal_detector_u" in mods.technology) Facilities.coal_mine.produces.coal = 16;
                    if ("coal_detector_uu" in mods.technology) Facilities.coal_mine.produces.coal = 80;
                    if ("advanced_woodworking" in mods.technology) Facilities.furniture_factory.speed = 200;
                    if ("advanced_woodworking_u" in mods.technology) Facilities.furniture_factory.speed = 160;
                    if ("advanced_woodworking_uu" in mods.technology) Facilities.furniture_factory.speed = 30;
                    if ("bauxite_detector" in mods.technology) Facilities.bauxite_mine.produces.bauxite = 50;
                    if ("bauxite_detector_u" in mods.technology) Facilities.bauxite_mine.produces.bauxite = 60;
                    if ("vacuum_distillation" in mods.technology) Facilities.oil_refinery.speed = 15;
                    if ("vacuum_distillation_u" in mods.technology) Facilities.oil_refinery.speed = 8;
                    if ("jet_fuel_refining" in mods.technology) {
                        Facilities.oil_refinery.produces.jet_fuel = Facilities.oil_refinery.produces.gasoline;
                        Facilities.oil_refinery.produces.gasoline = 0;
                    }
                    if ("jet_fuel_refining_u" in mods.technology) {
                        Facilities.oil_refinery.produces.jet_fuel = Facilities.oil_refinery.produces.gasoline;
                        Facilities.oil_refinery.produces.gasoline = 0;
                        Facilities.oil_refinery.speed = 8;
                    }
                    if ("gold_detector" in mods.technology) Facilities.gold_mine.produces.gold = 6;
                    if ("gold_detector_u" in mods.technology) Facilities.gold_mine.produces.gold = 8;
                    if ("gold_detector_uu" in mods.technology) Facilities.gold_mine.produces.gold = 10;
                    if (mods.technology.some(a => a[0].startsWith("robotic_automation"))) {
                        const boost = mods.technology.filter(a => a[0].startsWith("robotic_automation")).reduce((a, b) => a+b[1]*(b[0].endsWith("_uu")? 0.06: b[0].endsWith("_u")? 0.04: 0.025), 0)
                        Object.values(Facilities).map(a => a.speed = a.speed*boost);
                    }
                    for (const [tech] of new Set(mods.technology)) {
                        switch (tech) {
                            case "log_loader_uu": Facilities.tree_farm.produces.wood = 4;
                            case "log_loader_u": Facilities.tree_farm.speed -= 1;
                            case "log_loader": Facilities.tree_farm.speed -= 1;
                                break;
                        }
                    }
                }
                if (mods.service.length) {
                    for (const service of new Set(mods.service)) switch (service) {
                        case "small_park": mods.happiness += 1; break;
                        case "medium_park": mods.happiness += 2; break;
                        case "large_park": mods.happiness += 3; break;
                    }
                }
                if (mods.policy.length) {
                    const buildPriceIndices: Partial<Record<keyof typeof ICDetails.info.facilities, number>> = Object.fromEntries(Object.keys(ICDetails.info.facilities).map(a => [a, 1]));
                    let energyPrice = 1;
                    let landPrice = 1;
                    for (const policy of new Set(mods.policy)) switch (policy) {
                        case "solar_subsidies":
                            Assets.energy *= 0.9;
                            buildPriceIndices.solar_power_plant -= 0.1;
                            break;
                        case "public_logistics_access": for (const f in buildPriceIndices) buildPriceIndices[f] += 0.1; break;
                        case "regional_planning":
                            for (const f in buildPriceIndices) buildPriceIndices[f] -= 0.25;
                            landPrice += 0.05;
                            break;
                        case "tourism_campaign": Facilities.airport.consumes.jet_fuel += 4; break;
                        case "low_income_tax": mods.happiness += 2; break;
                        case "research_grant": energyPrice += 0.1; break;
                        case "organic_farming":
                            region.productionCoeffs.SOIL_HEALTH += 0.1;
                            buildPriceIndices.tree_farm += 0.1;
                            buildPriceIndices.cotton_farm += 0.1;
                            break;
                        case "high_income_tax": mods.happiness -= 5; break;
                        case "land_grant":
                            landPrice -= 0.05;
                            for (const f in buildPriceIndices) buildPriceIndices[f] += 0.25;
                            break;
                    }
                    Assets.energy *= energyPrice;
                    for (const f in buildPriceIndices) ICDetails.info.facilities[f].construct.money *= Math.round(buildPriceIndices[f]*100)/100;
                }
                const productionMods: Record<keyof IdleCorpTypes.productionCoeffs, IdleCorpTypes.FacilityName[]> = {
                    CAR_FACTORY: ["car_factory"],
                    IRON_CONCENTRATION: ["iron_mine"],
                    TELEVISION_FACTORY: ["television_factory"],
                    SOIL_HEALTH: ["tree_farm", "cotton_farm"],
                    GOLD_CONCENTRATION: ["gold_mine"],
                    SOLAR_IRRADIANCE: ["solar_power_plant"],
                    LAPTOP_FACTORY: ["laptop_factory"],
                    DIGITAL_CAMERA_FACTORY: ["digital_camera_factory"],
                    OIL_CONCENTRATION: ["oil_well"],
                    TRUCK_FACTORY: ["truck_factory"],
                    PRESCRIPTION_DRUG_FACTORY: ["prescription_drug_factory"],
                    GASOLINE_ENGINE_FACTORY: ["gasoline_engine_factory"],
                    BAUXITE_CONCENTRATION: ["bauxite_mine"],
                    COAL_PLANT: ["coal_power_plant"],
                    COAL_CONCENTRATION: ["coal_mine"],
                    SILICON_CONCENTRATION: ["silicon_mine"]
                }
                for (const coeff in region.productionCoeffs) for (const f of productionMods[coeff]) Facilities[f]["speed"] *= region.productionCoeffs[coeff];
                for (const f in Facilities) Facilities[f].speed = Math.round(Facilities[f].speed/((100+mods.happiness)/100));
                if (Facilities.airport.speed<20) Facilities.airport.speed = 20;
            }
            const [facs, assets] = (arg? arg: args.join(" ")).match(/^{([\w ]+: ?[0-9]+(?:, ?[\w ]+: ?[0-9]+)*)}(?: {([\w ]+: ?[0-9]+(?:, ?[\w ]+: ?[0-9]+)*)})?$/)?.slice(1)??[];
            if (!facs) return message.channel.send("`EN0022`: Invalid facilities and/or assets detected.")
            const Facs: [string, number][] = facs.split(/, ?/).map(a => a.split(/: ?/)).map(a => [Object.entries(icals["ic"]["facilities"]).find(b => b[1]?.includes(a[0]))?.[0] ?? a[0].replaceAll(" ", "_"), parseInt(a[1])??1])
            if (Facs.filter(a => !(a[0] in icals["ic"]["facilities"])).length) return message.channel.send("`EN0022`: Invalid facilities and/or assets detected.")
            if (!assets) {
                let production: [string, Fraction][] = Object.keys(Assets).map(a => [a, new Fraction(0)])
                for (const [a, b] of Facs) {
                    const c: IdleCorpTypes.FacilityDetailsNoArray = Facilities[a];
                    if (c["consumes"] !== null) for (const d of Object.entries(c["consumes"])) {
                        const e = production.find(a => a[0]===d[0])
                        e[1] = e[1].sub(new Fraction(d[1], c["speed"]).mul(b))
                    }
                    for (const d of Object.entries(c["produces"])) {
                        const e = production.find(a => a[0]===d[0])
                        e[1] = e[1].add(new Fraction(d[1], c["speed"]).mul(b))
                    }
                }
                production = production.filter(a => !a[1].equals(0))
                const profit = production.reduce((a, b) => a.add(b[1].mul(Assets[b[0]]*((b[1].compare(0)===-1)? 2: 1))), new Fraction(0))
                const page = new Pages(production.map(a => `**${StringHandlers.capitalize(a[0]).replaceAll("_", " ")}** | ${a[1].toString()}/s ${a[1].mul(60).toString()}/m ${a[1].mul(60*60).toString()}/h`), 6)
                let pn = 1;
                let embed = new Discord.MessageEmbed()
                    .setTitle("Production")
                    .setColor("BLUE")
                    .setDescription("Pages: 1/"+page.length())
                    .setTimestamp()
                    .addField("Input", "Facility\n> "+Facs.map(a => StringHandlers.capitalize(a[0]).replaceAll("_", " ")+" | "+a[1]).join("\n> ")+(mods["technology"].length? "\nTechnology\n> "+mods["technology"].map(a => StringHandlers.capitalize(a[0].replaceAll("_", " "))+ " | "+a[1]).join("\n> "): "")+(mods["service"].length? "\nService\n> "+mods["service"].map(a => StringHandlers.capitalize(a[0].replaceAll("_", " "))).join("\n> "): "")+(mods["policy"].length? "\nPolicy\n> "+mods["policy"].map(a => StringHandlers.capitalize(a[0].replaceAll("_", " "))).join("\n> "): ""))
                    .addField("Result (profit)", "Net profit: "+profit.toString()+"/s "+profit.mul(60).toString()+"/min "+profit.mul(60*60).toString()+"/hr"+"\n\nAsset speed")
                    .addField("Result (asset speed(s))", page.page(1).join("\n"))
                    .setFooter({text: message.client.user.username+" | "+setting["version"], iconURL: message.client.user.displayAvatarURL()});
                return youKnow.embed(embed, message).then(msg => {
                    msg.react("◀").then(() => msg.react("▶")).then(() => {
                        const back = msg.createReactionCollector({filter: (r, u) => r.emoji.name === "◀" && u.id === message.author.id, time: 30000 });
                        back.on("collect", () => {
                            pn = (pn === 1) ? page.length() : pn - 1;
                            embed.fields[2].value = page.page(pn).join("\n");
                            embed.setDescription("Pages: " + pn + "/" + page.length());
                            msg.edit({embeds: [embed]});
                        });
                        const front = msg.createReactionCollector({filter: (r, u) => r.emoji.name === "▶" && u.id === message.author.id, time: 30000 });
                        front.on("collect", () => {
                            pn = (pn === page.length()) ? 1 : pn + 1;
                            embed.fields[2].value = page.page(pn).join("\n");
                            embed.setDescription("Pages: " + pn + "/" + page.length());
                            msg.edit({embeds: [embed]});
                        });
                    })
                })
            } else {
                let Aass: [string, number][] = assets.split(/, ?/).map(a => a.split(/: /)).map(a => [Object.entries(icals["ic"]["assets"]).find(b => b[1]?.includes(a[0]))?.[0] ?? a[0], parseInt(a[1])??1])
                let production: [string, Fraction][] = Object.entries(Assets).map(a => [a[0], new Fraction(0)])
                let consumes: [string, number, number][] = [];
                if (Aass.some(a => !(a[0] in icals["ic"]["assets"]))) return message.channel.send("`EN0022`: Invalid asset(s) detected.");
                for (const [a, b] of Facs) {
                    const c: IdleCorpTypes.FacilityDetailsNoArray = Facilities[a];
                    if (c["consumes"] !== null) for (const d of Object.entries(c["consumes"])) {
                        const e = production.find(a => a[0]===d[0])
                        e[1] = e[1].sub(new Fraction(d[1], c["speed"]).mul(b))
                        consumes.push([d[0], d[1], c["speed"]])
                    }
                    for (const d of Object.entries(c["produces"])) {
                        const e = production.find(a => a[0]===d[0])
                        e[1] = e[1].add(new Fraction(d[1], c["speed"]).mul(b))
                    }
                }
                for (let a = 0; a<consumes.length; a++) {
                    for (let b = 0; b<consumes.length; b++) {
                        if (a!==b&&consumes[a][0]===consumes[b][0]) {
                            const f = new Fraction(consumes[a][1], consumes[a][2]).add(new Fraction(consumes[b][1], consumes[b][2]));
                            consumes[a][1] = f.n
                            consumes[a][2] = f.d
                            consumes.splice(b, 1);
                        }
                    }
                }
                let remain: [string, string][] = [], cycle: [string, number, number][] = [], low = 0;
                for (const a of Aass) {
                    const cc = consumes.find(b => b[0]===a[0])
                    const c = ~~(a[1]/cc[1])
                    cycle.push([a[0], c, cc[2]*c])
                }
                const cycle1: [string, number][] = cycle.map(a => [a[0], a[2]])
                for (let a = 0, lows = 0; a<cycle1.length; a++) {
                    if (cycle1[lows][1]>cycle1[a][1]) lows = a;
                    low = cycle1[lows][1]
                }
                const cycle2: [number, number][] = [];
                for (const a of Aass) {
                    const cc = consumes.find(b => b[0]===a[0])
                    const c = ~~(low/cc[2])
                    cycle2.push([c, c*cc[2]])
                    remain.push([a[0], new Fraction(a[1]).sub(c*cc[1]).toString()])
                }
                production = production.filter(a => !a[1].equals(0));
                const page = new Pages(production.map(a => `**${StringHandlers.capitalize(a[0]).replaceAll("_", " ")}** | ${a[1].toString()}/s ${a[1].mul(60).toString()}/m ${a[1].mul(60*60).toString()}/h`), 6)
                const page1 = new Pages(remain.map((a, b) => `**${a[0]}** | ${a[1]} | ${cycle2[b][0]} (${cycle2[b][1]}s)`))
                let pn = 1, pn1 = 1;
                let embed = new Discord.MessageEmbed()
                    .setTitle("Production")
                    .setColor("BLUE")
                    .setDescription("Pages: 1/"+page.length()+"\nPages: 1/"+page1.length())
                    .setTimestamp()
                    .addField("Input", "Facility\n> "+Facs.map(a => StringHandlers.capitalize(a[0]).replaceAll("_", " ")+" | "+a[1]).join("\n> ")+"\nAsset\n> "+Aass.map(a => StringHandlers.capitalize(a[0]).replaceAll("_", " ")+" | "+a[1]).join("\n> ")+
                    (mods["technology"].length? "\nTechnology\n> "+mods["technology"].map(a => StringHandlers.capitalize(a[0].replaceAll("_", " "))+ " | "+a[1]).join("\n> "): "")+(mods["service"].length? "\nService\n> "+mods["service"].map(a => StringHandlers.capitalize(a[0].replaceAll("_", " "))).join("\n> "): "")+
                    (mods["policy"].length? "\nPolicy\n> "+mods["policy"].map(a => StringHandlers.capitalize(a[0].replaceAll("_", " "))).join("\n> "): ""))
                    .addField("Result (asset speed(s))", page.page(1).join("\n"))
                    .addField("Result (remain asset(s))", page1.page(1).join("\n"))
                    .setFooter({text: message.client.user.username+" | "+setting["version"], iconURL: message.client.user.displayAvatarURL()});
                return youKnow.embed(embed, message).then(msg => msg.react("◀").then(() => msg.react("▶"))
                    .then(() => {
                        const back = msg.createReactionCollector({filter: (r, u) => r.emoji.name === "◀" && u.id === message.author.id, time: 30000 });
                        back.on("collect", () => {
                            pn = (pn === 1) ? page.length() : pn - 1;
                            embed.fields[1].value = page.page(pn).join("\n");
                            pn1 = (pn1 === 1) ? page.length() : pn1 - 1;
                            embed.fields[2].value = page1.page(pn1).join("\n");
                            embed.setDescription("Pages: " + pn + "/" + page.length() + "\nPages: " + pn1 + "/" + page1.length());
                            msg.edit({embeds: [embed]});
                        });
                        const front = msg.createReactionCollector({filter: (r, u) => r.emoji.name === "▶" && u.id === message.author.id, time: 30000 });
                        front.on("collect", () => {
                            pn = (pn === page.length()) ? 1 : pn + 1;
                            embed.fields[1].value = page.page(pn).join("\n");
                            pn = (pn1 === page1.length()) ? 1 : pn1 + 1;
                            embed.fields[2].value = page1.page(pn1).join("\n");
                            embed.setDescription("Pages: " + pn + "/" + page.length() + "\nPages: " + pn1 + "/" + page1.length());
                            msg.edit({embeds: [embed]});
                        });
                    })
                )
            }
        }
    }
}
export {Command};
