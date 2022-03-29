import * as Discord from "discord.js";
import { StringHandlers } from "../../../funcs/StringHandlers";
import { Pages } from "../../../funcs/Pages";
import setting from "../../../setting.json";
export default (message, args, extra) => {
    const check = { "w": "waiting", "v": "verified", "dis": "discarded", "dev": "developing", "a": "active", "achi": "archived", "act": "activity" };
    const type = check[args[0]] ?? (args.join("_") || undefined);
    if (type && !["in_review", "verified", "pass", "not_pass", "done"].includes(type))
        return message.channel.send("`EN0002`: Invalid suggestion status detected.");
    extra.database.query("SELECT * FROM \"suggestions\";").then(dt => {
        const page = type !== undefined ? new Pages(dt.rows.filter(a => a.status === type).sort((a, b) => b.votes.length - a.votes.length).map(a => `${a.suggestion_id}  ${a.suggestions.split("\n")[0]} [${StringHandlers.capitalize(a.status).replaceAll("_", " ")}] Votes: **${a.votes.length}** -- by: <@!${a.userid}>`), 10) : new Pages(dt.rows.sort((a, b) => b.votes.length - a.votes.length).map(a => `${a.suggestion_id}  ${a.suggestions.split("\n")[0]} [${StringHandlers.capitalize(a.status).replaceAll("_", " ")}] Votes: **${a.votes.length}** -- by: <@!${a.userid}>`), 10);
        let pn = 1;
        let embed = new Discord.MessageEmbed()
            .setTitle("Suggestion Status List" + (type ? " -- " + StringHandlers.capitalize(type) : ""))
            .setDescription("Pages: 1/" + page.length())
            .setColor([187, 187, 119])
            .addField("\u200b", page.page(1).join("\n") || "*None*")
            .setTimestamp()
            .setFooter({ text: message.client.user.username + " | " + setting.version, iconURL: message.client.user.displayAvatarURL() });
        message.channel.send({ embeds: [embed] }).then(msg => msg.react("◀").then(() => msg.react("▶"))
            .then(() => {
            const back = msg.createReactionCollector({ filter: (r, u) => r.emoji.name === "◀" && u.id === message.author.id, time: 30000 });
            back.on("collect", () => {
                pn = (pn === 1) ? page.length() : pn - 1;
                embed.fields[0].value = page.page(pn).join("\n") || "*None*";
                embed.setDescription("Pages: " + pn + "/" + page.length());
                msg.edit({ embeds: [embed] });
            });
            const front = msg.createReactionCollector({ filter: (r, u) => r.emoji.name === "▶" && u.id === message.author.id, time: 30000 });
            front.on("collect", () => {
                pn = (pn === page.length()) ? 1 : pn + 1;
                embed.fields[0].value = page.page(pn).join("\n") || "*None*";
                embed.setDescription("Pages: " + pn + "/" + page.length());
                msg.edit({ embeds: [embed] });
            });
        }));
    });
};
//# sourceMappingURL=status.js.map