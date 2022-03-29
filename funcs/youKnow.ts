import ykl from "../you_know.json";
import setting from "../setting.json";
import * as Discord from "discord.js";

class youKnow {
    static this() {
        return ykl["list"][~~(Math.random()*ykl["list"].length)];
    }
    static embed(embed: Discord.MessageEmbed, message: Discord.Message) {
        return message.channel.send({embeds: [new Discord.MessageEmbed()
                .setTitle("Did you know")
                .setColor([85, 85, 85])
                .setTimestamp()
                .setDescription(youKnow.this())
                .setAuthor({name: message.client.user.username, iconURL: message.client.user.displayAvatarURL()})
                .setFooter({text: message.client.user.username+" | "+setting.version, iconURL: message.client.user.displayAvatarURL()})
        ]}).then(msg => {setTimeout(() => msg.edit({embeds: [embed]}), 3000); return msg;});
    }
}
export {youKnow};