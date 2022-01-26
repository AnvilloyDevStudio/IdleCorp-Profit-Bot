const fetch = require("node-fetch")
const Discord = require("discord.js");
const StringHandlers = require("../funcs/StringHandlers");

module.exports = (client) => {
    // const err = (e) => 
    const int = setInterval(() => {
        try {
            fetch("https://api.bit.io/api/v1beta/query/", {method: "POST", headers: {Accept: "application/json", "Content-Type": "application/json", Authorization: "Bearer 9Nen_UuTrFikB2Mpjw6r3ic3YVpd"}, body: JSON.stringify({query_string: "SELECT updated FROM \"BenChueng0422/IdleCorp-Profit\".\"check_update log\" WHERE tables = \'suggestions\'"})}).then(d => d.json()).then(dt => {
                const datacheck = dt["data"][0][0];
                if (datacheck) return;
                fetch("https://api.bit.io/api/v1beta/query/", {method: "POST", headers: {Accept: "application/json", "Content-Type": "application/json", Authorization: "Bearer 9Nen_UuTrFikB2Mpjw6r3ic3YVpd"}, body: JSON.stringify({query_string: "SELECT * FROM \"BenChueng0422/IdleCorp-Profit\".\"suggestions\""})}).then(d => d.json()).then(dt => {
                    const values = dt["data"].sort((a, b) => {[a, b] = [a[5], b[5]]; return ((a < b) ? 1 : ((a > b) ? -1 : 0))});
                    let res = [[]], ind = 0;
                    for (const a of values) {
                        if ((72+res[ind].join("\n").length)>1000) {
                            ind++; res.push([]);
                            if (ind>5) break;
                        }
                        res[ind].push(`${a[0]}  ${(a[1].length>10)? a[1].slice(0, 15)+"...": a[1]} [${StringHandlers.capitalize(a[2]).replaceAll("_", " ")}] Votes: **${a[5].length}** -- by: <@!${a[4]}>`);
                    }
                    if (res.reduce((a, b) => a+b.reduce((a, b) => a+b.length, 0), 0)> 5500) {
                        res = [[]], ind = 0, i = 0
                        for (const a of values) {
                            if ((72+res[ind].join("\n").length)>1000) {
                                ind++; res.push([]);
                                if (ind>5) {res[6].push("And "+values.length-i-1+" more..."); break;}
                            }
                            res[ind].push(`${a[0]}  [${StringHandlers.capitalize(a[2]).replaceAll("_", " ")}] Votes: **${a[5].length}** -- by: <@!${a[4]}>`);
                            i++;
                        }
                    }
                    client.guilds.cache.get("801019800682758145").channels.cache.get("856913820978642964").messages.fetch("856914255064203274").then(msg => msg.edit(new Discord.MessageEmbed().setTitle("Suggestions").addFields(res.map(a => ({name: "\u200b", value: a.join("\n"), inline:false})))));
                    fetch("https://api.bit.io/api/v1beta/query/", {method: "POST", headers: {Accept: "application/json", "Content-Type": "application/json", Authorization: "Bearer 9Nen_UuTrFikB2Mpjw6r3ic3YVpd"}, body: JSON.stringify({query_string: `UPDATE \"BenChueng0422/IdleCorp-Profit\".\"check_update log\" SET updated = true WHERE tables = \'suggestions\'`})}).catch(e => {
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