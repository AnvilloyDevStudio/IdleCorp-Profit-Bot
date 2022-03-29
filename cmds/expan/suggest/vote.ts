import * as Discord from "discord.js";

export default (message: Discord.Message, args: import("../../../types/command").Input, extra: import("../../../types/command").extraArgs) => {
    const suggest_id = parseInt(args.shift());
    if (Number.isNaN(suggest_id)) return message.channel.send("`EN0002`: The number was invalid.");
    extra.database.query<{votes: string[]}>("SELECT votes FROM \"suggestions\" WHERE suggestion_id = "+suggest_id).then(dt => {
        if (!dt.rowCount) return message.channel.send("`EN0002`: The suggestion id was invalid.");
        const value = dt.rows[0].votes;
        if (value.includes(message.author.id)) return message.channel.send("`EN0002`: You already voted the suggestion.");
        value.push(message.author.id);
        extra.database.query(`UPDATE \"suggestions\" SET votes = \'${JSON.stringify(value)}\'::JSON WHERE suggestion_id = ${suggest_id}; UPDATE \"updated\" SET updated = false WHERE table = \'suggestions\';`).then(() => message.channel.send("You have voted the suggestion `"+suggest_id+"`"));
    })
}