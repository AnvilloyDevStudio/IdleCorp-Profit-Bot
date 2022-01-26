const Discord = require("discord.js");
const setting = require("../../../setting.json");
const fetch = require("node-fetch");

module.exports = {
    execute(message, args) {
        const suggest_id = Number(args.shift()),
        new_suggest = args.join(" ");
        if (Number.isNaN(suggest_id)) return message.channel.send("`EN0002`: The number was invalid.");
        if (!new_suggest.length) return message.channel.send(`\`EN0001\`: Missing new suggestion.`);
        fetch("https://api.bit.io/api/v1beta/query/", {method: "POST", headers: {Accept: "application/json", "Content-Type": "application/json", Authorization: "Bearer 9Nen_UuTrFikB2Mpjw6r3ic3YVpd"}, body: JSON.stringify({query_string: "SELECT suggestion_id, user_id FROM \"BenChueng0422/IdleCorp-Profit\".\"suggestions\""})}).then(d => d.json()).then(dt => {
            const check = dt["data"];
            if (!check.find(a => a[0] === suggest_id)) return message.channel.send("`EN0002`: The suggestion id was invalid.");
            if (!check.find(a => a[0] === message.author.id)&&!message.member.roles.cache.findKey((a, b) => ["841622372351344650", "801052590389329930", "801052697498746920"].includes(b))) return message.channel.send("`EN0122`: You were not the author of the suggestion.");
            fetch("https://api.bit.io/api/v1beta/query/", {method: "POST", headers: {Accept: "application/json", "Content-Type": "application/json", Authorization: "Bearer 9Nen_UuTrFikB2Mpjw6r3ic3YVpd"}, body: JSON.stringify({query_string: `UPDATE \"BenChueng0422/IdleCorp-Profit\".\"suggestions\" SET suggestions = \'${new_suggest}\' WHERE suggestion_id = ${suggest_id}; UPDATE \"BenChueng0422/IdleCorp-Profit\".\"check_update log\" SET updated = false WHERE tables = \'suggestions\'`})})
            message.channel.send(`Edited the suggestion \`${suggest_id}\` to \"${new_suggest}\"`);
        })
    }
}