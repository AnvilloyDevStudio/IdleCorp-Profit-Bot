import * as Discord from "discord.js";
import setting from "../../../setting.json";
import cdslist from "../../../codes.json";
import { Checks } from "../../../funcs/Checks.js";
export default (message, args) => {
    const cds = cdslist.codes.error;
    if (!args.length)
        return message.channel.send("`EN0001`: Missing code or the code cannot be detected.");
    const code = args.pop().toUpperCase();
    for (const a in cds) {
        if (code === a) {
            if (code[1] === "D" && !Checks.isDev(message.member)) {
                return message.channel.send("`EN0111`: The code was required permission.");
            }
            else if (code[1] === "A" && !Checks.isAdmin(message.member))
                return message.channel.send("`EN0112`: The code was required permission.");
            const embed = new Discord.MessageEmbed()
                .setTitle(`Error code ${a}`)
                .setDescription(cds[a] + "\n\nCode v." + cdslist.version)
                .setColor("DARK_RED")
                .setTimestamp()
                .setFooter({ text: message.client.user.username + " | " + setting.version, iconURL: message.client.user.avatarURL() });
            return message.channel.send({ embeds: [embed] });
        }
    }
    if (code[0] !== "E")
        return message.channel.send("`EN0002`: Invalid code type.");
    message.channel.send("`EN0002`: Invalid code");
};
//# sourceMappingURL=error.js.map