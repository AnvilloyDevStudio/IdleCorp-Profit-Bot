import Decimal from "decimal.js";
import * as Discord from "discord.js";
import { IdleCorpConnection } from "../funcs/IdleCorpConnection";

export default async (client: import("discord.js").Client, database: import("pg").Client) => {
    let lastCheck = parseInt((await database.query<{lastcheck: string}>("SELECT lastcheck from lastchecks WHERE name = \'marketsub\';")).rows[0].lastcheck);
    const int = setInterval(() => {
        try {
            const now = lastCheck;
            lastCheck = Date.now();
            IdleCorpConnection.market.recent().then(mk => {
                database.query<{userid: string, subscription: [string[], string[]]}>("SELECT * FROM market_sub;").then(dt => {
                    for (const recent of mk.filter(a => a.timestamp>=now))
                        for (const subs of dt.rows) {
                            client.users.cache.get(subs.userid).createDM().then(dm => {
                                if (!recent.isBuyOffer&&subs.subscription[0].includes(recent.itemId)) dm.send({embeds: [new Discord.MessageEmbed().setTitle("New Market Sell Offer").setTimestamp().setDescription(recent.amount+" of "+recent.itemId.replaceAll("_", " ")+" with price $"+new Decimal(recent.price).div(100).toFixed(2)+".")]})
                                else if (recent.isBuyOffer&&subs.subscription[1].includes(recent.itemId)) dm.send({embeds: [new Discord.MessageEmbed().setTitle("New Market Buy Offer").setTimestamp().setDescription(recent.amount+" of "+recent.itemId.replaceAll("_", " ")+" with price $"+new Decimal(recent.price).div(100).toFixed(2)+".")]})
                            })
                        }
                    database.query("UPDATE lastchecks SET lastcheck = \'"+lastCheck+"\' WHERE name = \'marketsub\';");
                }).catch(e => {
                    clearInterval(int);
                    console.error(e)
                })
            }).catch(e => {
                clearInterval(int);
                console.error(e)
            })
        } catch (error) {
            clearInterval(int);
            console.error(error)
        }
    }, 10000);
}