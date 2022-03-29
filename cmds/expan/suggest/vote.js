export default (message, args, extra) => {
    const suggest_id = parseInt(args.shift());
    if (Number.isNaN(suggest_id))
        return message.channel.send("`EN0002`: The number was invalid.");
    extra.database.query("SELECT votes FROM \"suggestions\" WHERE suggestion_id = " + suggest_id).then(dt => {
        if (!dt.rowCount)
            return message.channel.send("`EN0002`: The suggestion id was invalid.");
        const value = dt.rows[0].votes;
        if (value.includes(message.author.id))
            return message.channel.send("`EN0002`: You already voted the suggestion.");
        value.push(message.author.id);
        extra.database.query(`UPDATE \"suggestions\" SET votes = \'${JSON.stringify(value)}\'::JSON WHERE suggestion_id = ${suggest_id}; UPDATE \"updated\" SET updated = false WHERE table = \'suggestions\';`).then(() => message.channel.send("You have voted the suggestion `" + suggest_id + "`"));
    });
};
//# sourceMappingURL=vote.js.map