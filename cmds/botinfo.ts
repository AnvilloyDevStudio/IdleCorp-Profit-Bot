import * as Discord from "discord.js";
import setting from "../setting.json";
const Command: import("../types/command").Command = {
    name: "botinfo",
    aliases: ["bif"],
    syntax: "botinfo",
    description: "Showing the bot information.",
    manual: {
        description: "You can view the detailed information about the bot with this command.",
        examples: [
            "botinfo"
        ],
    },
    execute(message, args) {
        const embed = new Discord.MessageEmbed()
            .setTitle("Bot info")
            .setColor("DARK_BLUE")
            .setTimestamp()
            .setDescription("A calculator and assistant bot for IdleCorp players.")
            .addField("Bot", `The project founder and the bot developer: <@484883489846591491>/<@683694351855255590>\nVersion: v.${setting.version}`, false)
            .addField("Wiki", "https://wiki.idlecorp.xyz/\nProject: https://wiki.idlecorp.xyz/index.php/IdleCorp_Profit:Home")
            .addField("Art", "Art rightfully related to IdleCorp is under Attribution-NonCommercial-ShareAlike 4.0 International (CC BY-NC-SA 4.0) https://creativecommons.org/licenses/by-nc-sa/4.0/.")
            .setFooter({text: message.client.user.username+" | "+setting.version, iconURL: message.client.user.displayAvatarURL()});
        message.channel.send({embeds: [embed]});
    }
}
export {Command};