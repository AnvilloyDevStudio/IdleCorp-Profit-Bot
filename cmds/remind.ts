import {NumberHandlers} from "../funcs/NumberHandlers";

const Command: import("../types/command").Command = {
    name: "remind",
    aliases: ["rm", "rmd", "reminder"],
    syntax: "remind <time>[<time unit>] [<value>]",
    description: "A reminder.",
    args: [
        ["<time>", "The number of the time unit. Does not accept the time which is lower than 60 seconds."],
        ["[<time unit>]", "The time unit, defaults with second."],
        ["[<value>]", "The message to remind in reminding."]
    ],
    argaliases: [
        ["second", ["s", "sec"]],
        ["minute", ["m", "min"]],
        ["hour", ["h", "hr"]],
        ["day", ["d"]],
        ["week", ["w"]]
    ],
    manual: {
        description: "This command is used to remind the user.",
        examples: [
            "reminder 60",
            "reminder 1000000ms",
            "reminder 5d",
            "reminder 5h Time's up"
        ],
        
    },
    execute(message, args, extra) {
        if (!args.length) return message.channel.send("`EN0001`: Missing parameter.")
        const time = NumberHandlers.timeAlias(args.shift());
        if (!time) return message.channel.send("`EN0002`: The time is invalid.");
        if (time<60) return message.channel.send("`EN0002`: The time is too small.");
        extra.database.query(`INSERT INTO \"reminder\" VALUES (${Date.now()+(time)*1000}, \'${args.join(" ")}\', ${message.author.id}, false);`).then(res => message.channel.send(`You will be reminded at <t:${~~(Date.now()/1000)+time}>.`));
    }
}
export {Command};