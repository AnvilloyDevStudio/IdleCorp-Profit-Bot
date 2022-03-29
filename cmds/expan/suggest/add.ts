import * as Discord from "discord.js";

export default (message: Discord.Message, args: import("../../../types/command").Input, extra: import("../../../types/command").extraArgs) => {
    extra.database.query<{suggestion_id: number}>("SELECT suggestion_id FROM \"suggestions\";").then(dt =>{
        const check = dt.rows.flat().map(a => a.suggestion_id),
        suggest = args.join(" ");
        let unique = true,
        suggest_id: number;
        while (unique) {
            suggest_id = ~~(Math.random()*9999999)+1;
            if (!check.includes(suggest_id)) unique = false;
        }
        extra.database.query(`INSERT INTO \"suggestions\" (suggestions, userid, suggestion_id) VALUES (\'${suggest}\', \'${message.author.id}\', ${suggest_id}); UPDATE \"updated\" SET updated = false WHERE table = \'suggestions\';`).then(() => message.channel.send("Added suggestion \""+suggest+"\"."));
    });
}