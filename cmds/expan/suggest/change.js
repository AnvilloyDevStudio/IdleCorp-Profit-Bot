import { Checks } from "../../../funcs/Checks";
export default (message, args, extra) => {
    if (!Checks.isDev(message.member))
        return message.channel.send("`EN0111`: Missing required permission.");
    const alias = { "ir": "in_review", "i": "in_review", "v": "verified", "p": "pass", "np": "not_pass", "n": "not_pass", "d": "done" }, suggest_id = parseInt(args.shift());
    let status = args.shift().replaceAll(" ", "_");
    if (status in alias)
        status = alias[status];
    if (Number.isNaN(suggest_id))
        return message.channel.send("`EN0002`: The number was invalid.");
    if (!["in_review", "verified", "pass", "not_pass", "done"].includes(status))
        return message.channel.send("`EN0002`: The status was invalid.");
    extra.database.query("SELECT status FROM \"BenChueng0422/IdleCorp-Profit\".\"suggestions\" WHERE suggestion_id = " + suggest_id).then(dt => {
        if (!dt.rowCount)
            return message.channel.send("`EN0006`: The suggestion id was invalid.");
        if (dt.rows[0].status === status)
            return message.channel.send("`EN0002`: The status of the suggestion was already `" + status + "`.");
        extra.database.query(`UPDATE \"suggestions\" SET status = \'${status}\' WHERE suggestion_id = ${suggest_id}; UPDATE \"updated\" SET updated = false WHERE table = \'suggestions\';`).then(() => message.channel.send("Changed the status of the suggestion into `" + status + "`."));
    });
};
//# sourceMappingURL=change.js.map