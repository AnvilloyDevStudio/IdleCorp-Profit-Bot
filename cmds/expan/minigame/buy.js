const Discord = require("discord.js");
const setting = require("../../../setting.json");
const fetch = require("node-fetch");
const StringHandlers = require("../../../funcs/StringHandlers");

module.exports = {
    execute(message, args) {
        if (!args.length) return message.channel.send("`EN0001`: Missing asset id.");
        const id = Number(args[0]);
        const assets = [{id: "0-0", name: "Hand-cranked generator MK2", price: 10, generateRate: 3}, {id: "0-1", name: "Hand-cranked generator MK3", price: 30, generateRate: 6}, {id: "0-2", name: "Hand-cranked generator MK4", price: 60, generateRate: 15}, {id: "0-3", name: "Bicycle generator", price: 100, generateRate: 20}, {id: "0-4", name: "Bicycle generator MK2", price: 150, generateRate: 50}];
        const asset = assets[id-1];
        const userID = message.author.id;
        if (!asset) return message.channel.send("`EN0002`: Invalid asset id detected.");
        fetch("https://api.bit.io/api/v1beta/query/", {method: "POST", headers: {Accept: "application/json", "Content-Type": "application/json", Authorization: "Bearer 9Nen_UuTrFikB2Mpjw6r3ic3YVpd"}, body: JSON.stringify({query_string: "SELECT * FROM \"BenChueng0422/IdleCorp-Profit\".\"minigame\" WHERE user_id = \'"+userID+"\';"})}).then(d => d.json()).then(dt => {
            let data = dt["data"]?.[0]?.[1];
            if (!data) return message.channel.send("`EN0131`: There is not any data about the user.")
            if (data.inventory.some(a => a.id === asset.id)) return message.channel.send("`EN0002`: The asset you want to buy has already exist in your inventory.")
            if (data.energy<asset.price) return message.channel.send("You do not have enough energy to buy the asset.");
            asset.addedTimestamp = Date.now();
            data.energy -= asset.price;
            data.inventory.push(asset);
            fetch("https://api.bit.io/api/v1beta/query/", {method: "POST", headers: {Accept: "application/json", "Content-Type": "application/json", Authorization: "Bearer 9Nen_UuTrFikB2Mpjw6r3ic3YVpd"}, body: JSON.stringify({query_string: "UPDATE \"BenChueng0422/IdleCorp-Profit\".\"minigame\" SET data = \'"+JSON.stringify(data)+"\'::JSON WHERE user_id = \'"+userID+"\';"})}).then(() => message.channel.send("You have bought asset `"+asset.name+"` successfully."));
        })
    }
}