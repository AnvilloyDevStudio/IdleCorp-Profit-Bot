import * as Discord from "discord.js";
import setting from "../../../setting.json";

export default (message: Discord.Message, args: import("../../../types/command").Input, extra: import("../../../types/command").extraArgs) => {
    extra.database.query<import("./types/EgameData").User>("SELECT * FROM \"minigame\" WHERE userid = \'"+message.author.id+"\';").then(dt => {
        if (!dt.rowCount) return message.channel.send("`EN0131`: There is not any data about the user.");
        const data = dt.rows[0];
        message.channel.send({embeds: [new Discord.MessageEmbed()
            .setTitle("Minigame Player profile")
            .setAuthor({name: message.author.username, iconURL: message.author.defaultAvatarURL})
            .addField("Profile", "Energy: "+data.energy+"\nCreated at: <t:"+~~(data.createdTimestamp/1000)+">")
            .addField("Inventory", data.inventory.map(a => a.name).join("\n") || "*None*")
            .setTimestamp()
            .setFooter({text: message.client.user.username+" | "+setting.version, iconURL: message.client.user.displayAvatarURL()})]});
    })
}