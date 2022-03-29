import * as Discord from "discord.js";
import GameAssets from "./assets.json";
import * as EgameData from "./types/EgameData";

export default (message: Discord.Message, args: import("../../../types/command").Input, extra: import("../../../types/command").extraArgs) => {
    if (!args.length) return message.channel.send("`EN0001`: Missing asset id.");
    const id = Number(args[0]);
    const asset = GameAssets[id-1];
    const userID = message.author.id;
    if (!asset) return message.channel.send("`EN0002`: Invalid asset id detected.");
    extra.database.query<EgameData.User>("SELECT * FROM \"minigame\" WHERE userid = \'"+userID+"\';").then(res => {
        if (!res.rowCount) return message.channel.send("`EN0131`: There is no data about the user.");
        let data = res.rows[0];
        if (data.inventory.some(a => a.id === asset.id)) return message.channel.send("`EN0002`: The asset you want to buy has already been existed in your inventory.")
        if (data.energy<asset.price) return message.channel.send("You do not have enough energy to buy the asset.");
        const a: EgameData.inventoryAsset = {...asset, addedTimestamp: Date.now()}
        data.energy -= asset.price;
        data.inventory.push(a);
        extra.database.query("UPDATE \"minigame\" SET energy = "+data.energy+"::JSON, inventory = \'"+JSON.stringify(data.inventory)+"\'::JSON WHERE userid = \'"+userID+"\';").then(() => message.channel.send("You have bought asset `"+asset.name+"` successfully."));
    })
}