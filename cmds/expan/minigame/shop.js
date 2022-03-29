import * as Discord from "discord.js";
import setting from "../../../setting.json";
import GameAssets from "./assets.json";
export default (message, args, extra) => {
    message.channel.send({ embeds: [new Discord.MessageEmbed()
                .setTitle("Minigame shop")
                .setDescription(GameAssets.map((a, b) => `\`${b + 1}\` ${a.price} energy -- ${a.name}`).join("\n"))
                .setTimestamp()
                .setFooter({ text: message.client.user.username + " | " + setting.version, iconURL: message.client.user.displayAvatarURL() })] });
};
//# sourceMappingURL=shop.js.map