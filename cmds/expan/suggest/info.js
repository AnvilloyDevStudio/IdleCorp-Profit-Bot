import * as Discord from "discord.js";
import { StringHandlers } from "../../../funcs/StringHandlers";
import setting from "../../../setting.json";
export default (message, args, extra) => {
    if (!args.length)
        return message.channel.send("`EN0001`: Missing suggestion id.");
    const suggest_id = parseInt(args.shift());
    if (Number.isNaN(suggest_id))
        return message.channel.send("`EN0002`: The suggesion id was invalid.");
    extra.database.query("SELECT * FROM \"suggestions\" WHERE suggestion_id = " + suggest_id).then(dt => {
        if (!dt.rowCount)
            return message.channel.send("`EN0002`: The suggestion id was invalid.");
        const value = dt.rows[0];
        message.client.users.fetch(value.userid).then(user => {
            const embed = new Discord.MessageEmbed()
                .setTitle("Suggestion info")
                .setColor([255, 255, 190])
                .setDescription("**" + value.votes.length + "**")
                .setTimestamp()
                .setAuthor({ name: user?.id, iconURL: user?.displayAvatarURL() })
                .addField(value.suggestion_id + " \t\t\t [" + StringHandlers.capitalize(value.status).replaceAll("_", " ") + "]", `${value.suggestions}\n\nSuggestion creator: <@!${value.userid}>\nCreated at: <t:${~~(new Date(value.date).getTime() / 1000)}>`)
                .setFooter({ text: message.client.user.username + " | " + setting.version, iconURL: message.client.user.displayAvatarURL() });
            ;
            message.channel.send({ embeds: [embed] });
        });
    });
};
//# sourceMappingURL=info.js.map