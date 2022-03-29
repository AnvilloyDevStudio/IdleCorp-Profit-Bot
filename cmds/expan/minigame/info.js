import * as Discord from "discord.js";
import setting from "../../../setting.json";
export default (message, args, extra) => {
    const version = setting.minigameVersion;
    extra.database.query("SELECT COUNT(*) FROM \"minigame\";").then(data => {
        message.channel.send({ embeds: [new Discord.MessageEmbed()
                    .setTitle("Minigame Information")
                    .setDescription("A minigame system\nYou generate energy for better energy generator.\n\nPlayers joined: " + data.rows[0].count + "\n\n\nGame version: v." + version)
                    .setTimestamp()
                    .setFooter({ text: message.client.user.username + " | " + setting.version, iconURL: message.client.user.displayAvatarURL() })] });
    });
};
//# sourceMappingURL=info.js.map