import * as Discord from "discord.js";
import * as EgameData from "./types/EgameData";

export default (message: Discord.Message, args: import("../../../types/command").Input, extra: import("../../../types/command").extraArgs) => {
    const userID = message.author.id;
    extra.database.query<EgameData.User>("SELECT * FROM \"minigame\" WHERE userid = \'"+userID+"\';").then(res => {
        if (!res.rowCount) return message.channel.send("`EN0131`: There is no data about the user.");
        let data = res.rows[0];
        const gen = data.inventory.sort((a, b) => b.generateRate-a.generateRate)[0]?.generateRate ?? 1;
        data.energy += gen;
        extra.database.query("UPDATE \"minigame\" SET energy = "+data.energy+"\' WHERE userid = \'"+userID+"\';").then(() => message.channel.send("You have generated "+gen+" energy."));
    })
}
