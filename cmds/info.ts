import * as Discord from "discord.js";
import setting from "../setting.json";
import * as fs from "fs/promises";
import icals from "../icaliases.json";
import ICDetails from "../icdetails.json";
import {StringHandlers} from "../funcs/StringHandlers.js";
import {constants as fsConstants} from "fs";

const Command: import("../types/command").Command = {
    name: "info",
    aliases: ["if", "examine", "e"],
    syntax: "info {--theme {<theme>|all|aliases} | <IdleCorp-related>}",
    description: "Examining anything about IdleCorp.",
    args: [
        ["--theme <theme>", "Getting the information theme related to IdleCorp."],
        ["--theme all", "Listing all the available themes."],
        ["--theme aliases", "List all the aliases for the available themes."],
        ["<IdleCorp-related>", "Anything that you can search from IdleCorp by `$$examine`."]
    ],
    argaliases: [
        ["<IdleCorp-related>", ["*All aliases are followed to IdleCorp*"]],
        ["--theme", ["--t"]],
        ["<theme>", ["*All are listed in `info --theme aliases`*"]]
    ],
    manual: {
        description: "You can use this command to examine anything about IdleCorp.",
        examples: [
            "info --theme all",
            "info --theme assets",
            "info steel mill"
        ]
    },
    execute(message, args) {
        let techlv = 0;
        const icinfo = ICDetails.info;
        let theme = false;
        if (["--topic", "--t", "--theme"].includes(args[0])) {
            args.shift();
            theme = true;
        }
        let req = args.join(" ");
        if (theme) {
            req = Object.entries(icinfo.themes.aliases).find(a => a[1].includes(req))?.[0] ?? req;
            let embed = new Discord.MessageEmbed().setColor("GREYPLE").setTimestamp().setFooter({text: message.client.user.username+" | "+setting.version, iconURL: message.client.user.displayAvatarURL()});
            if (req==="all") return message.channel.send({embeds: [embed.setTitle("Theme -- All themes").setDescription("Themes:\n"+Object.keys(icinfo.themes.themes).map(a => "> "+StringHandlers.capitalize(a)).join("\n"))]});
            else if (req==="aliases") return message.channel.send({embeds: [embed.setTitle("Theme -- Aliases of all themes").setDescription("Theme aliases:\n"+Object.entries(icinfo.themes.themes).map(a => "> "+a[0]+" | "+(a[1].join("\n") || "None")))]});
            if (!(req in icinfo.themes.themes)) return message.channel.send("`EN0002`: The theme name is invalid.")
            return message.channel.send({embeds: [embed.setTitle("Theme -- "+StringHandlers.capitalize(req)).setDescription(icinfo.themes.themes[req].join("\n"))]});
        }
        req = req.replaceAll(" ", "_");
        function findName(req: string, alias=true) {
            for (const a of Object.values(icinfo)) if (req in a) return req;
            if (alias) for (const [a, b] of Object.values(icals.ic).flatMap(a => Object.entries(a))) if (b.includes(req)) return a;
            return undefined;
        }
        let reqsl = findName(req);
        if (!reqsl) return message.channel.send(`\`EN0002\`: Input \"${req}\" is invalid, or it is just not exist.`);
        if (reqsl.endsWith("_u")) reqsl = reqsl.slice(0, -2), techlv = 1;
        else if (reqsl.endsWith("_uu")) reqsl = reqsl.slice(0, -3), techlv = 2;
        if (!findName(reqsl, false)) return message.channel.send(`\`EN0131\`: Input \"${req}\" is not exist.`);
        const infoclass = Object.entries(icinfo).find(a => reqsl in a[1])[0];
        const infoObj: object = icinfo[infoclass][reqsl];
        let embed = new Discord.MessageEmbed()
            .setTitle(`Info -- ${StringHandlers.capitalize(infoclass)} -- ${StringHandlers.capitalize(reqsl.replaceAll("_", " "))}`)
            .setColor("GREYPLE")
            .setTimestamp()
            .setFooter({text: message.client.user.username+" | "+setting.version, iconURL: message.client.user.displayAvatarURL()});
        let img: string = null, imgset: Promise<any> = null;
        if (infoclass === "assets") {
            embed.addFields([{name: "IdleCorp Examine:", value: infoObj["icinfo"]+((infoObj["difficulty"])? "\nDifficulty: "+infoObj["difficulty"].toUpperCase(): "")+"\n\n"+((infoObj["market"])? "It's tradable in market": "It's not tradable in market")+((infoObj["retail"])? "\nIt can sold in retail store\nIt can be scrapped into "+infoObj["retail"]+" scraps": "\nIt cannot sold in retail storen\nIt cannot be scrapped")+((infoObj["rarity"])? "\n\nRarity: **"+infoObj["rarity"]+"**": "")+"\n\nNPC market buy price(if valid): "+(ICDetails["assets"][reqsl]*2).toString()+"\nNPC market sell price: "+ICDetails["assets"][reqsl].toString(), inline: false},
                {name: "IdleCorp Wiki:", value: infoObj["icwiki"], inline: false},
                {name: "Wikipedia:", value: infoObj["wikipedia"], inline: false}]);
            if ("icp" in infoObj) embed.addField("More:", infoObj["icp"], false);
            img = "./images/info/"+((reqsl.startsWith("galactic_coordinates"))? "galactic_coordinates": (reqsl.startsWith("relic"))? "relic": reqsl)+".png"
            imgset = fs.access(img, fsConstants.F_OK).catch(() => img = "./images/info/box.png");
            embed.addField("\u200b", (icals["ic"]["assets"][reqsl].length)? "Aliases: "+icals["ic"]["assets"][reqsl].join(", "): "Aliases: None"+"\n\n[IdleCorp Wiki](https://wiki.idlecorp.xyz/index.php/"+reqsl+")\n"+(
                (reqsl === "led")? "[Wikipedia](https://en.wikipedia.org/wiki/Light-emitting_diode)":
                (reqsl === "rubber")? "[Wikipedia](https://en.wikipedia.org/wiki/synthetic_rubber)":
                (reqsl === "energy")? "[Wikipedia](https://en.wikipedia.org/wiki/electricity)":
                (reqsl === "lamp")? "[Wikipedia](https://en.wikipedia.org/wiki/light_fixture)":
                (reqsl === "ccd")? "[Wikipedia](https://en.wikipedia.org/wiki/charge-coupled_device)":
                (reqsl === "hq")? "[Wikipedia](https://en.wikipedia.org/wiki/Headquarters)":
                (infoObj["wikipedia"] !== "None")? "[Wikipedia](https://en.wikipedia.org/wiki/"+reqsl+"})": ""
            ), false);
        } else if (infoclass === "facilities") {
            embed.addFields([{name: "IdleCorp Examine:", value: infoObj["icinfo"], inline: false},
                {name: "Construction materials:", value: Object.entries(infoObj["construct"]).map((a: [string, number]) => (a[0] === "money")? "> $"+a[1].toLocaleString("en-US", {minimumFractionDigits: 2}): "> "+a[1].toLocaleString("en-US")+" **"+StringHandlers.capitalize(a[0])+"**").join("\n"), inline: false},
                {name: "IdleCorp Wiki:", value: infoObj["icwiki"], inline: false},
                {name: "Wikipedia:", value: infoObj["wikipedia"], inline: false}]);
            if (reqsl in ICDetails["facilities"]){
                const facpro = ICDetails["facilities"][reqsl];
                embed.addField("Production:", "**Consumes**\n"+((facpro["consumes"] === "None")? "> None\n": Object.entries(facpro["consumes"]).map((a: [string, number]) => "> **"+(StringHandlers.capitalize(a[0])).replaceAll("_", " ")+"** | "+a[1].toLocaleString("en-US", {minimumFractionDigits: 2}), []).join("\n"))+"\n**Produces**\n"+((facpro["produces"] === "None")? "> None\n": Object.entries(facpro["produces"]).map((a: [string, number]) => "> **"+(StringHandlers.capitalize(a[0])).replaceAll("_", " ")+"** | "+a[1].toLocaleString("en-US", {minimumFractionDigits: 2}), []).join("\n"))+"\nSpeed: "+ICDetails["facilities"][reqsl]["speed"].toString()+" seconds", false);
            }
            if ("icp" in infoObj) embed.addField("More:", infoObj["icp"], false);
            img = "./images/info/"+reqsl+".png"
            imgset = fs.access(img, fsConstants.F_OK).catch(() => img = ((reqsl.endsWith("mine"))? "./images/info/mine.png":
                (["ccd_factory", "cpu_factory", "cell_phone_factory", "laptop_factory", "digital_camera_factory", "television_factory"].includes(reqsl))? "./images/info/tech_facility.png":
                (["retail_store", "research_facility", "customer_support_center", "hq"].includes(reqsl))? "./images/info/office_building.png":
                (["research_chemical_factory", "prescription_drug_factory"].includes(reqsl))? "./images/info/chemical_plant.png": "./images/info/facility.png")
            );
            embed.addField("\u200b", ((icals["ic"]["facilities"][reqsl].length)? "Aliases: "+icals["ic"]["facilities"][reqsl].join(", "): "Aliases: None")+(
                (reqsl === "steel_mill"&&Math.random() <= 0.02)? "\n\n*I always typo this facility name as \"still mill\"*": "")+(
                (reqsl === "furniture_factory")? (
                    (Math.random() <= 0.2)? "\n\n*Why the IdleCorp Wiki page has so many words...*": "")+(
                    (Math.random() <= 0.1)? "\n\n*Because the IdleCorp Wiki page has too many work, I had to change the layout of all...*": ""
                ): "")+((reqsl.endsWith("factory")&&Math.random() <= 0.05)? "\n\n*I really want to know who made this facility page...*": "")+(
                (reqsl === "research_chemical_factory"&&Math.random() < (1/3))? "\n\n*Why this facility has so many aliases...*": "")+"\n\n\n[IdleCorp Wiki](https://wiki.idlecorp.xyz/index.php/"+reqsl+")"+((infoObj["wikipedia"] !== "None")? "\n[Wikipedia](https://en.wikipedia.org/wiki/"+reqsl+")": "")
            , false);
        } else if (infoclass === "blueprints") {
            embed.addFields([{name: "IdleCorp Examine:", value: infoObj["icinfo"]+"\n\nRarity: "+infoObj["rarity"]+"\n\nAll blueprints **cannot** trade and be sold in the market and the retail stores.", inline: false},
                {name: "Requires:", value: Object.entries(infoObj["require"]).map((a: [string, number]) => a[1].toLocaleString("en-US", {minimumFractionDigits: 2})+" **"+StringHandlers.capitalize(a[0])+"**", []), inline: false},
                {name: "IdleCorp Wiki:", value: infoObj["icwiki"], inline: false}]);
            if ("icp" in infoObj) embed.addField("More:", infoObj["icp"], false);
            img = "./images/info/blueprint.png";
            embed.addField("\u200b", ((icals["ic"]["blueprints"][reqsl].length)? "Aliases: "+icals["ic"]["blueprints"][reqsl].join(", "): "Aliases: None")+"\n\n\n[IdleCorp Wiki](https://wiki.idlecorp.xyz/index.php/"+reqsl+")", false);
        } else if (infoclass === "technologies") {
            if (techlv&&infoObj["upgrade"]["u".repeat(techlv)] === "None") return message.channel.send("`EN0004`: The technology has no \""+"u".repeat(techlv)+"\" upgrade.");
            embed.addFields([{name: "IdleCorp Info(Examine):", value: ((techlv)? 
                infoObj["upgrade"]["u".repeat(techlv)]["icinfo"]+"\nRarity: "+infoObj["rarity"]+"\nIt can be scrapped into "+infoObj["upgrade"]["u".repeat(techlv)]["scrap"]+" scraps\n\nAll technologies **can** trade and **cannot** be sold in the market and the retail stores respectively."+((techlv === 1&&infoObj["upgrade"]["uu"] !== "None")? "\n\nNext upgrade: "+reqsl.replaceAll("_", " ")+" uu": ""):
                infoObj["icinfo"]+"\n\nRarity: "+infoObj["rarity"]+"\nIt can be scrapped into "+infoObj["scrap"]+" scraps"+"\n\nAll technologies **can** trade and **cannot** be sold in the market and the retail stores respectively."+((infoObj["upgrade"]["u"] !== "None")? "\n\nNext upgrade: "+reqsl.replaceAll("_", " ")+" u": "")
                )+"The tech affected on "+StringHandlers.capitalize(infoObj["affect"]), inline: false},
                {name: "IdleCorp Wiki:", value: infoObj["icwiki"]+"\n\n"+infoObj["boost"].map((a, b) => "Level "+b+" boost: "+a.replace("+", "and")).join("\n"), inline: false}]);
            if ("icp" in infoObj) embed.addField("More:", infoObj["icp"], false);
            img = "./images/info/technology.png";
            embed.addField("\u200b", ((icals["ic"]["technologies"][reqsl+((techlv)? "_"+"u".repeat(techlv): "")].length)? "Aliases: "+icals["ic"]["technologies"][reqsl+((techlv)? "_"+"u".repeat(techlv): "")].join(", "): "Aliases: None")+"\n\n\n[IdleCorp Wiki](https://wiki.idlecorp.xyz/index.php/"+reqsl+")"+((infoObj["wikipedia"] !== "None")? "\n[Wikipedia](https://en.wikipedia.org/wiki/"+reqsl+")": ""), false);
        } else if (infoclass === "services") {
            embed.addField("IdleCorp Examine:", infoObj["icinfo"]+"\nAffects: "+infoObj["effect"]+"\nCost: **$"+infoObj["cost"].toLocaleString("en-US", {minimumFractionDigits: 2})+"**", false);
            if ("icp" in infoObj) embed.addField("More:", infoObj["icp"], false);
            img = "./images/info/crane.png";
            embed.addField("\u200b", ((icals["ic"]["services"][reqsl].length)? "Aliases: "+icals["ic"]["services"][reqsl].join(", "): "Aliases: None")+(
                (infoObj["wikipedia"] !== "None")? "\n\n[Wikipedia](https://en.wikipedia.org/wiki/"+reqsl+")": ""), false)
        } else if (infoclass === "pollicies") {
            embed.addField("IdleCorp Examine:", "Affect: "+infoObj["affect"]+"\nCost: "+infoObj["cost"]+" *Funding points*", false);
            if ("icp" in infoObj) embed.addField("More:", infoObj["icp"], false);
            embed.addField("\u200b", ((icals["ic"]["policies"][reqsl].length)? "Aliases: "+icals["ic"]["policies"][reqsl].join(", "): "Aliases: None")+(
                (infoObj["wikipedia"] !== "None")? "\n\n[Wikipedia](https://en.wikipedia.org/wiki/"+reqsl+")": ""), false)
        } else return message.channel.send("`EN0131`: The type of the input is not handled.");
        if (!img) message.channel.send({embeds: [embed]});
        else {
            embed.setThumbnail("attachment://img.png");
            let att: Discord.MessageAttachment;
            if (imgset) {
                imgset.then(() => {att = new Discord.MessageAttachment(img, "img.png");
                message.channel.send({embeds: [embed], files: [att]});})
            } else {
                att = new Discord.MessageAttachment(img, "img.png");
                message.channel.send({embeds: [embed], files: [att]});
            }
        }
    }
}
export {Command};