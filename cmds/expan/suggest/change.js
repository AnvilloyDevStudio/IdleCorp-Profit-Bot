const Discord = require("discord.js");
const setting = require("../../../setting.json");
const fetch = require("node-fetch");

module.exports = {
    execute(message, args) {
        const alias = {"ir": "in_review", "i": "in_review", "v": "verified", "p": "pass", "np": "not_pass", "n": "not_pass", "d": "done"},
        suggest_id = Number(args.shift());
        let status = args.shift();
        if (status in alias) status = alias[status];
        if (Number.isNaN(suggest_id)) return message.channel.send("`EN0002`: The number was invalid.");
        if (!["in_review", "verified", "pass", "not_pass", "done"].includes(status)) return message.channel.send("`EN0002`: The status was invalid.");
        fetch("https://api.bit.io/api/v1beta/query/", {method: "POST", headers: {Accept: "application/json", "Content-Type": "application/json", Authorization: "Bearer 9Nen_UuTrFikB2Mpjw6r3ic3YVpd"}, body: JSON.stringify({query_string: "SELECT status FROM \"BenChueng0422/IdleCorp-Profit\".\"suggestions\" WHERE suggestion_id = "+suggest_id})}).then(d => d.json()).then(dt => {
            if (!dt["data"].length) return message.channel.send("`EN0006`: The suggestion id was invalid.");
            if (dt["data"][0][0] === status) return message.channel.send("`EN0002`: The status of the suggestion was already `"+status+"`");
            fetch("https://api.bit.io/api/v1beta/query/", {method: "POST", headers: {Accept: "application/json", "Content-Type": "application/json", Authorization: "Bearer 9Nen_UuTrFikB2Mpjw6r3ic3YVpd"}, body: JSON.stringify({query_string: `UPDATE \"BenChueng0422/IdleCorp-Profit\".\"suggestions\" SET status = \'${status}\' WHERE suggestion_id = ${suggest_id}; UPDATE \"BenChueng0422/IdleCorp-Profit\".\"check_update log\" SET updated = false WHERE tables = \'suggestions\'`})});
            message.channel.send("Changed the suggestion into `"+status+"`");
        })
    }
}