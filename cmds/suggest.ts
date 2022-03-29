import { Checks } from "../funcs/Checks";
import { StringHandlers } from "../funcs/StringHandlers";

const Command: import("../types/command").Command = {
    name: "suggest",
    aliases: ["sug", "sg", "sgt"],
    syntax: "suggest {add|edit|vote|info|change|remove} [...]",
    description: "Suggestion system about the server or the bot.",
    args: [
        ["<suggestion>", "The suggestion which is being suggested. You can include details."],
        ["<suggestion id>", "The suggestion id of a suggestion. It can be found from the table in <#856913820978642964> or at `suggest status`."],
        ["<new suggestion>", "The new suggestion of the suggestion to replace the original."],
        ["<status>", "The suggestion's status."]
    ],
    argaliases: [
        ["in_review", ["ir", "i"]],
        ["verified", ["v"]],
        ["pass", ["p"]],
        ["not_pass", ["np"]],
        ["done", ["d"]]
    ],
    subcommands: {
        add: {
            name: "add",
            aliases: ["a"],
            description: "Adding a new suggestion.",
            syntax: "suggest add <suggestion>",
            examples: [
                "suggest add A New Suggestion",
                "suggest add A New Suggestion\nWith Details"
            ]
        },
        edit: {
            name: "edit",
            aliases: ["e"],
            description: "Editing a suggestion.",
            syntax: "suggest edit <suggestion id> <new suggestion>",
            examples: ["suggest edit 123 A Suggestion"]
        },
        info: {
            name: "info",
            aliases: ["if", "i"],
            description: "Querying the details of a suggestion.",
            syntax: "suggest info <suggestion id>",
            examples: ["suggest info 123"]
        },
        change: {
            name: "change",
            aliases: ["cg", "c"],
            description: "Changing the status of a suggestion.",
            syntax: "suggest change <suggestion id> <status>",
            examples: ["suggest change 123 done"]
        },
        remove: {
            name: "remove",
            aliases: ["rm", "delete", "del", "d", "r"],
            description: "Removing a suggestion.",
            syntax: "suggest remove <suggestion id>",
            examples: ["suggest remove 123"]
        },
        status: {
            name: "status",
            aliases: ["s"],
            description: "Querying all the suggestions.",
            syntax: "suggest status [<status>]",
            examples: [
                "suggest status",
                "suggest status in review"    
            ]
        },
        vote: {
            name: "vote",
            aliases: ["v"],
            description: "Adding a new suggestion.",
            syntax: "suggest vote <suggestion id>",
            examples: ["suggest vote 123"]
        }
    },
    manual: {
        description: "This command is used to suggest and vote the suggestions by anyone.",
        examples: [
            "suggest add A New Suggestion",
            "suggest add A New Suggestion\nWith Details",
            "suggest edit 123 A Suggestion",
            "suggest info 123",
            "suggest change 123 done",
            "suggest remove 123",
            "suggest status",
            "suggest status in review",
            "suggest vote 123"
        ],
        note: "The suggestion system is separated from the suggestion channel. You can still suggest in the suggestion channel <#801067404759007292>."
    },
    execute(message, args, extra) {
        if (!args.length) return message.channel.send(`Subcommands: \`add\`, \`edit\`, \`vote\`, \`info\`, \`status\`${Checks.isDev(message.member)? "`change`, `remove`": ""}\nStatus: in review, verified, pass, not pass, done.`);
        args[0] = StringHandlers.findCmdName(args[0], Command.subcommands);
        switch (args[0]) {
            case "add":
            case "edit":
            case "vote":
            case "info":
            case "change":
            case "remove":
            case "status":
                import("./expan/suggest/"+args[0]).then(m => m(message, args.slice(1), extra));
                break;
            default:
                message.channel.send("`EN1012`: Invalid subcommand.");
        }
    }
}
export {Command};