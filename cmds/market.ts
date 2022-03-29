import { IdleCorpConnection } from "../funcs/IdleCorpConnection";
import ICAlias from "../icaliases.json";
import * as Discord from "discord.js";
import Decimal from "decimal.js";
import setting from "../setting.json";
import { StringHandlers } from "../funcs/StringHandlers";

const Command: import("../types/command").Command = {
    name: "market",
    aliases: ["mk"],
    syntax: "market [--selloffer|--buyoffer] [subscribe|unsubscribe [<asset>]] [<asset>]",
    description: "Showing the market.",
    args: [
        ["[--selloffer|--buyoffer]", "Specifying only sell offers or buy offers. Defaults with both."],
        ["[subscribe|unsubscribe [<assets>]]", "To subscribe or unsubscribe market offers. Defaults with all."],
        ["[<asset>]", "Specifying asset for quering. Defaults with recent 9 offers."]
    ],
    manual: {
        description: "Showing the market place and subscribe the market.",
        examples: [
            "ping"
        ]
    },
    execute(message, args, extra) {
        let sellOrBuy: 0|1|2 = 0;
        if (["--sell", "--s", "--selloffer", "--soffer"].includes(args[0])) {
            sellOrBuy = 1;
            args.shift();
        } else if (["--buy", "--b", "--buyoffer", "--boffer"].includes(args[0])) {
            sellOrBuy = 2;
            args.shift();
        }
        if (args.length) {
            let subscribe: boolean | null = null;
            if (["subscribe", "sub"].includes(args[0])) {
                subscribe = true;
                args.shift();
            } else if (["unsubscribe", "unsub"].includes(args[0])) {
                subscribe = false;
                args.shift();
            }
            if (!args.length&&!subscribe) return message.channel.send("`EN0001`: Missing asset name.");
            if (subscribe!==null) {
                if (args.length) {
                    const arg = args.join(" ").split(/, ?/);
                    const asset = arg.map(arg => Object.entries(ICAlias.ic.assets).find(a => a[1].includes(arg))?.[0] ?? arg);
                    if (asset.some(a => !(a in ICAlias.ic.assets))) return message.channel.send("`EN0002`: Invalid asset name: "+asset.filter(a => !(a in ICAlias.ic.assets)).join(", ")+".");    
                    return extra.database.query<{subscription: [string[], string[]]}>("SELECT subscription FROM market_sub WHERE userid = \'"+message.author.id+"\';").then(dt => {
                        const newV = !dt.rowCount;
                        const value: [string[], string[]] = dt.rowCount? dt.rows[0].subscription: [[], []];
                        if (sellOrBuy===0) {
                            if (subscribe) value[0].push(...asset);
                            else value[0] = value[0].filter(a => !asset.includes(a));
                            if (subscribe) value[1].push(...asset);
                            else value[1] = value[1].filter(a => !asset.includes(a));
                        } else if (sellOrBuy===1) {
                            if (subscribe) value[0].push(...asset);
                            else value[0] = value[0].filter(a => !asset.includes(a));
                        } else {
                            if (subscribe) value[1].push(...asset);
                            else value[1] = value[1].filter(a => !asset.includes(a));
                        }
                        extra.database.query(newV? "INSERT INTO market_sub VALUES (\'"+message.author.id+"\', \'"+JSON.stringify([[...new Set(value[0])], [...new Set(value[1])]])+"\'::JSON)"
                        :"UPDATE market_sub SET subscription = \'"+JSON.stringify([[...new Set(value[0])], [...new Set(value[1])]])+"\'::JSON WHERE userid = \'"+message.author.id+"\';").then(() => message.channel.send(subscribe? "Subscribed successfully.": "Unsubscribed successfully"));
                    })
                } else return extra.database.query<{subscription: [string[], string[]]}>("SELECT subscription FROM market_sub WHERE userid = \'"+message.author.id+"\';").then(dt => {
                    const newV = !dt.rowCount;
                    const value: [string[], string[]] = dt.rowCount? dt.rows[0].subscription: [[], []];
                    if (sellOrBuy===0) {
                        if (subscribe) value[0].push(...Object.keys(ICAlias.ic.assets));
                        else value[0] = [];
                        if (subscribe) value[1].push(...Object.keys(ICAlias.ic.assets));
                        else value[1] = [];
                    } else if (sellOrBuy===1) {
                        if (subscribe) value[0].push(...Object.keys(ICAlias.ic.assets));
                        else value[0] = [];
                    } else {
                        if (subscribe) value[1].push(...Object.keys(ICAlias.ic.assets));
                        else value[1] = [];
                    }
                    extra.database.query(newV? "INSERT INTO market_sub VALUES (\'"+message.author.id+"\', \'"+JSON.stringify([[...new Set(value[0])], [...new Set(value[1])]])+"\'::JSON)"
                        :"UPDATE market_sub SET subscription = \'"+JSON.stringify([[...new Set(value[0])], [...new Set(value[1])]])+"\'::JSON WHERE userid = \'"+message.author.id+"\';").then(() => message.channel.send(subscribe? "Subscribed successfully.": "Unsubscribed successfully"));
                })
            }
            const arg = args.join(" ");
            const asset = Object.entries(ICAlias.ic.assets).find(a => a[1].includes(arg))?.[0] ?? arg;
            if (!(asset in ICAlias.ic.assets)) return message.channel.send("`EN0002`: Invalid asset name: "+asset+".");
            else IdleCorpConnection.market.asset(asset).then(mk => {
                if (mk===null) return message.channel.send("`EN0131`: Missing market data with asset `"+asset+"`.");
                const embed = new Discord.MessageEmbed().setTimestamp().setFooter({text: message.client.user.username+" | "+setting.version, iconURL: message.client.user.displayAvatarURL()});
                if (sellOrBuy===0) {
                    const orders: [string[], string[]] = [[], []]
                    for (const p in mk.buyOffers) orders[0].push("> $"+new Decimal(p).div(100).toFixed(2)+" -- "+mk.buyOffers[p])
                    for (const p in mk.sellOffers) orders[1].push("> $"+new Decimal(p).div(100).toFixed(2)+" -- "+mk.sellOffers[p])
                    embed.setTitle("Market -- "+StringHandlers.capitalize(asset.replaceAll("_", " "))).setDescription("**Buy Offers**\n"+(orders[0].join("\n")||"*No orders*")+"\n\n**Sell Offers**\n"+(orders[1].join("\n")||"*No orders*"))
                } else if (sellOrBuy === 1) {
                    const orders: string[] = [];
                    for (const p in mk.sellOffers) orders.push("> $"+new Decimal(p).div(100).toFixed(2)+" -- "+mk.sellOffers[p])
                    embed.setTitle("Market -- "+StringHandlers.capitalize(asset.replaceAll("_", " "))+" Sell Offers").setDescription(orders.join("\n")||"*No orders*")
                } else {
                    const orders: string[] = [];
                    for (const p in mk.buyOffers) orders.push("> $"+new Decimal(p).div(100).toFixed(2)+" -- "+mk.buyOffers[p])
                    embed.setTitle("Market -- "+StringHandlers.capitalize(asset.replaceAll("_", " "))+" Buy Offers").setDescription(orders.join("\n")||"*No orders*")
                }
                message.channel.send({embeds: [embed]});
            })
        } else {
            const embed = new Discord.MessageEmbed().setTimestamp().setFooter({text: message.client.user.username+" | "+setting.version, iconURL: message.client.user.displayAvatarURL()});
            IdleCorpConnection.market.recent().then(dt => {
                if (sellOrBuy === 0)
                    embed.addFields(dt.slice(0, 9).map(a => ({name: StringHandlers.capitalize(a.itemId.replaceAll("_", " ")), value: `<t:${~~(a.timestamp/1000)}:R>\nPrice: $${new Decimal(a.price).div(100).toFixed(2)}\n${a.isBuyOffer? "Buying amount: "+a.amount: "Selling ammount: "+a.amount}\nAmount Filled: ${a.amountFilled}`, inline: true})))
                    .setTitle("Market -- Recent (9)")
                else if (sellOrBuy === 1)
                    embed.addFields(dt.filter(a => !a.isBuyOffer).slice(0, 9).map(a => ({name: StringHandlers.capitalize(a.itemId.replaceAll("_", " ")), value: `<t:${~~(a.timestamp/1000)}:R>\nPrice: $${new Decimal(a.price).div(100).toFixed(2)}\n${"Selling ammount: "+a.amount}\nAmount Filled: ${a.amountFilled}`, inline: true})))
                    .setTitle("Market -- Recent Sell (9)")
                else
                    embed.addFields(dt.filter(a => a.isBuyOffer).slice(0, 9).map(a => ({name: StringHandlers.capitalize(a.itemId.replaceAll("_", " ")), value: `<t:${~~(a.timestamp/1000)}:R>\nPrice: $${new Decimal(a.price).div(100).toFixed(2)}\n${"Buying amount: "+a.amount}\nAmount Filled: ${a.amountFilled}`, inline: true})))
                    .setTitle("Market -- Recent Buy (9)")
                message.channel.send({embeds: [embed]});
            })
        }
    }
}
export {Command};