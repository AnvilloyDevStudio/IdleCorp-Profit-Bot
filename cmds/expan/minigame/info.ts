import * as Discord from "discord.js";
import setting from "../../../setting.json";

export default (message: Discord.Message, args: import("../../../types/command").Input, extra: import("../../../types/command").extraArgs) => {
    const version = setting.minigameVersion;
    extra.database.query<{count: number}>("SELECT COUNT(*) FROM \"minigame\";").then(data => {
        message.channel.send({embeds: [new Discord.MessageEmbed()
            .setTitle("Minigame Information")
            .setDescription("A minigame system\nYou generate energy for better energy generator.\n\nPlayers joined: "+data.rows[0].count+"\n\n\nGame version: v."+version)
            .setTimestamp()
            .setFooter({text: message.client.user.username+" | "+setting.version, iconURL: message.client.user.displayAvatarURL()})]});
    })
}