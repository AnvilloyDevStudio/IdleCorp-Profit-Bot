const Discord = require("discord.js");
const setting = require("../../../setting.json");
const fetch = require("node-fetch");

module.exports = {
    execute(message, args) {
        fetch("https://api.bit.io/api/v1beta/query/", {method: "POST", headers: {Accept: "application/json", "Content-Type": "application/json", Authorization: "Bearer 9Nen_UuTrFikB2Mpjw6r3ic3YVpd"}, body: JSON.stringify({query_string: "SELECT suggestion_id FROM \"BenChueng0422/IdleCorp-Profit\".\"suggestions\""})}).then(d => d.json()).then(dt => {
            const check = dt["data"].flat(),
            suggest = args.join(" ")
            let unique = true,
            suggest_id;
            while (unique) {
                suggest_id = ~~(Math.random()*9999999)+1;
                if (!check.includes(suggest_id)) unique = false;
            }
            fetch("https://api.bit.io/api/v1beta/query/", {method: "POST", headers: {Accept: "application/json", "Content-Type": "application/json", Authorization: "Bearer 9Nen_UuTrFikB2Mpjw6r3ic3YVpd"}, body: JSON.stringify({query_string: `INSERT INTO \"BenChueng0422/IdleCorp-Profit\".\"suggestions\" (suggestions, user_id, suggestion_id) VALUES (\'${suggest}\', ${message.author.id}, ${suggest_id}); UPDATE \"BenChueng0422/IdleCorp-Profit\".\"check_update log\" SET updated = false WHERE tables = \'suggestions\'`})});
            message.channel.send("Added suggestion \""+suggest+"\"");
        })
    }
}