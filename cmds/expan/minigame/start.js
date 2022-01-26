const Discord = require("discord.js");
const setting = require("../../../setting.json");
const fetch = require("node-fetch");
const StringHandlers = require("../../../funcs/StringHandlers");

module.exports = {
    execute(message, args) {
        const userID = message.author.id;
        fetch("https://api.bit.io/api/v1beta/query/", {method: "POST", headers: {Accept: "application/json", "Content-Type": "application/json", Authorization: "Bearer 9Nen_UuTrFikB2Mpjw6r3ic3YVpd"}, body: JSON.stringify({query_string: "SELECT * FROM \"BenChueng0422/IdleCorp-Profit\".\"minigame\" WHERE user_id = \'"+userID+"\';"})}).then(d => d.json()).then(dt => {
            let data = dt["data"];
            if (data.length) return message.channel.send("`EN0131`: The profile has already existed.");
            fetch("https://api.bit.io/api/v1beta/query/", {method: "POST", headers: {Accept: "application/json", "Content-Type": "application/json", Authorization: "Bearer 9Nen_UuTrFikB2Mpjw6r3ic3YVpd"}, body: JSON.stringify({query_string: "SELECT * FROM \"BenChueng0422/IdleCorp-Profit\".\"minigame\";"})}).then(d => d.json()).then(dt => {
                fetch("https://api.bit.io/api/v1beta/query/", {method: "POST", headers: {Accept: "application/json", "Content-Type": "application/json", Authorization: "Bearer 9Nen_UuTrFikB2Mpjw6r3ic3YVpd"}, body: JSON.stringify({query_string: "INSERT INTO \"BenChueng0422/IdleCorp-Profit\".\"minigame\" VALUES (\'"+message.author.id+"\', \'"+JSON.stringify({id: dt["data"].length, userID: message.author.id, name: message.author.name, energy: 0, inventory: [], createdTimestamp: Date.now()})+"\'::JSON);"})}).then(() => message.channel.send("The minigame profile has been created."));
            })
        })
    }
}