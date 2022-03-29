import * as Discord from "discord.js";
import { Checks } from "../../../funcs/Checks";

export default (message: Discord.Message, args: import("../../../types/command").Input, extra: import("../../../types/command").extraArgs) => {
    if (Checks.isDev(message.member)) return message.channel.send("`EN0111`: Missing permission.");
    const suggest_id = parseInt(args.shift());
    if (Number.isNaN(suggest_id)) return message.channel.send("`EN0002`: The number was invalid.");
    extra.database.query("SELECT status FROM \"suggestions\" WHERE suggestion_id = "+suggest_id).then(dt => {
        if (!dt.rowCount) return message.channel.send("`EN0002`: The suggestion id was invalid.");
        extra.database.query("DELETE FROM \"suggestions\" WHERE suggestion_id = "+suggest_id+"; UPDATE \"updated\" SET updated = false WHERE table = \'suggestions\';").then(() => message.channel.send("Deleted the suggestion `"+suggest_id+"`."));
    })
}