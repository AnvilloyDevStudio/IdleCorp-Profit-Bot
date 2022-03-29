import {StringHandlers} from "../funcs/StringHandlers";
import * as Discord from "discord.js";

export default (client: Discord.Client, database: import("pg").Client) => {
    const int = setInterval(() => {
        try {
            database.query<{updated: boolean}>("SELECT updated FROM \"updated\" WHERE \"table\" = \'suggestions\'").then((dt) => {
                if (dt.rows[0].updated) return;
                database.query<{suggestion_id: number, suggestions: string, status: string, date: Date, userid: string, votes: string[]}>("SELECT * FROM \"suggestions\";").then(dt => {
                    const values = dt.rows.sort((a, b) => b.votes.length-a.votes.length);
                    let res: string[][] = [[]], ind = 0;
                    for (const a of values) {
                        if ((72+res[ind].join("\n").length)>1000) {
                            ind++; res.push([]);
                            if (ind>5) break;
                        }
                        res[ind].push(`${a.suggestion_id}  ${(a.suggestions.length>10)? a.suggestions.slice(0, 15)+"...": a.suggestions} [${StringHandlers.capitalize(a.status).replaceAll("_", " ")}] Votes: **${a.votes.length}** -- by: <@!${a.userid}>`);
                    }
                    if (res.reduce((a, b) => a+b.reduce((a, b) => a+b.length, 0), 0)> 5500) {
                        res = [[]], ind = 0
                        let i = 0
                        for (const a of values) {
                            if ((72+res[ind].join("\n").length)>1000) {
                                ind++; res.push([]);
                                if (ind>5) {res[6].push("And "+(values.length-i-1)+" more..."); break;}
                            }
                            res[ind].push(`${a.suggestion_id}  [${StringHandlers.capitalize(a.status).replaceAll("_", " ")}] Votes: **${a.votes.length}** -- by: <@!${a.userid}>`);
                            i++;
                        }
                    }
                    (<Discord.TextChannel>client.guilds.cache.get("801019800682758145").channels.cache.get("856913820978642964")).messages.fetch("856914255064203274").then(msg => msg.edit({embeds: [new Discord.MessageEmbed().setTitle("Suggestions").addFields(res.map(a => ({name: "\u200b", value: a.join("\n"), inline:false})))]}));
                    database.query(`UPDATE \"updated\" SET updated = true WHERE table = \'suggestions\';`).catch(e => {
                        clearInterval(int);
                        console.error(e)
                    })
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
    }, 5000);
}