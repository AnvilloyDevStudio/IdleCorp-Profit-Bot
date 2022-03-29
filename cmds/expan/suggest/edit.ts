import * as Discord from "discord.js";
import { Checks } from "../../../funcs/Checks";

export default (message: Discord.Message, args: import("../../../types/command").Input, extra: import("../../../types/command").extraArgs) => {
    const suggest_id = parseInt(args.shift()),
    new_suggest = args.join(" ");
    if (Number.isNaN(suggest_id)) return message.channel.send("`EN0002`: The number was invalid.");
    if (!new_suggest.length) return message.channel.send(`\`EN0001\`: Missing new suggestion.`);
    extra.database.query<{userid: string}>("SELECT userid FROM \"suggestions\" WHERE suggestion_id = "+suggest_id+";").then(dt => {
        if (!dt.rowCount) return message.channel.send("`EN0002`: The suggestion id was invalid.");
        if (!Checks.isDev(message.member)&&!(dt.rows[0].userid === message.author.id)) return message.channel.send("`EN0122`: You were not the author of the suggestion.");
        extra.database.query(`UPDATE \"suggestions\" SET suggestions = \'${new_suggest}\' WHERE suggestion_id = ${suggest_id}; UPDATE \"updated\" SET updated = false WHERE table = \'suggestions\';`).then(() => message.channel.send(`Edited the suggestion \`${suggest_id}\` to \"${new_suggest}\".`));
    })
}