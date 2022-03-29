export default (message, args, extra) => {
    const userID = message.author.id;
    extra.database.query("SELECT COUNT(*) FROM \"minigame\" WHERE userid = \'" + userID + "\';").then(data => {
        if (data)
            return message.channel.send("`EN0131`: The profile has already been existed. You have alerady started the minigame.");
        extra.database.query("SELECT COUNT(*) FROM \"minigame\";").then(data => {
            extra.database.query(`INSERT INTO \"minigame\" VALUES (\'${message.author.id}\', \'${data.rows[0].count}\', 0, \'[]\', ${Date.now()})`).then(() => message.channel.send("The minigame profile has been created."));
        });
    });
};
//# sourceMappingURL=start.js.map