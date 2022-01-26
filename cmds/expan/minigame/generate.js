const Discord = require("discord.js");
const setting = require("../../../setting.json");
const fetch = require("node-fetch");
const StringHandlers = require("../../../funcs/StringHandlers");

module.exports = {
    execute(message, args) {
        const userID = message.author.id;
        fetch("https://api.bit.io/api/v1beta/query/", {method: "POST", headers: {Accept: "application/json", "Content-Type": "application/json", Authorization: "Bearer 9Nen_UuTrFikB2Mpjw6r3ic3YVpd"}, body: JSON.stringify({query_string: "SELECT * FROM \"BenChueng0422/IdleCorp-Profit\".\"minigame\" WHERE user_id = \'"+userID+"\';"})}).then(d => d.json()).then(dt => {
            let data = dt["data"]?.[0]?.[1];
            if (!data) return message.channel.send("`EN0131`: There is not any data about the user.")
            const gen = data.inventory.slice().sort((a, b) => b.generateRate-a.generateRate)[0]?.generateRate ?? 1;
            data.energy += gen;
            fetch("https://api.bit.io/api/v1beta/query/", {method: "POST", headers: {Accept: "application/json", "Content-Type": "application/json", Authorization: "Bearer 9Nen_UuTrFikB2Mpjw6r3ic3YVpd"}, body: JSON.stringify({query_string: "UPDATE \"BenChueng0422/IdleCorp-Profit\".\"minigame\" SET data = \'"+JSON.stringify(data)+"\'::JSON WHERE user_id = \'"+userID+"\';"})}).then(() => message.channel.send("You have generated "+gen+" energy."));
        })
    }
}