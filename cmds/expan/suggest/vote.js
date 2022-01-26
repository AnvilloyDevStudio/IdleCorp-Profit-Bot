const Discord = require("discord.js");
const setting = require("../../../setting.json");
const fetch = require("node-fetch");

module.exports = {
    execute(message, args) {
        const suggest_id = Number(args.shift());
        if (Number.isNaN(suggest_id)) return message.channel.send("`EN0002`: The number was invalid.");
        fetch("https://api.bit.io/api/v1beta/query/", {method: "POST", headers: {Accept: "application/json", "Content-Type": "application/json", Authorization: "Bearer 9Nen_UuTrFikB2Mpjw6r3ic3YVpd"}, body: JSON.stringify({query_string: "SELECT votes FROM \"BenChueng0422/IdleCorp-Profit\".\"suggestions\" WHERE suggestion_id = "+suggest_id})}).then(d => d.json()).then(dt => {
            if (!dt["data"].length) return message.channel.send("`EN0002`: The suggestion id was invalid.");
            const value = dt["data"][0][0];
            if (value.includes(message.author.id)) return message.channel.send("`EN0002`: You already voted the suggestion.");
            value.push(message.author.id);
            fetch("https://api.bit.io/api/v1beta/query/", {method: "POST", headers: {Accept: "application/json", "Content-Type": "application/json", Authorization: "Bearer 9Nen_UuTrFikB2Mpjw6r3ic3YVpd"}, body: JSON.stringify({query_string: `UPDATE \"BenChueng0422/IdleCorp-Profit\".\"suggestions\" SET votes = \'${JSON.stringify(value)}\'::JSON WHERE suggestion_id = ${suggest_id}; UPDATE \"BenChueng0422/IdleCorp-Profit\".\"check_update log\" SET updated = false WHERE tables = \'suggestions\'`})});
            message.channel.send("You have voted the suggestion `"+suggest_id+"`");
        })
    }
}