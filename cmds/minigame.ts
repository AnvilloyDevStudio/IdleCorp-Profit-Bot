import { StringHandlers } from "../funcs/StringHandlers";

const Command: import("../types/command").Command = {
    name: "minigame",
    aliases: ["mg", "game"],
    syntax: "minigame {generate|profile|shop|buy} [...]",
    description: "A minigame.",
    subcommands: {
        buy: {
            name: "buy",
            aliases: ["b"],
            syntax: "minigame buy <asset Id>",
            description: "Buying assets for generation."
        },
        generate: {
            name: "generate",
            aliases: ["gen", "g"],
            syntax: "minigame generate",
            description: "Generating energy by generator."
        },
        info: {
            name: "info",
            aliases: ["i", "if"],
            syntax: "minigame info",
            description: "Getting the information about the minigame."
        },
        profile: {
            name: "profile",
            aliases: ["p", "pf", "c"],
            syntax: "minigame profile",
            description: "Getting the profile of a player from the minigame."
        },
        shop: {
            name: "shop",
            aliases: ["s", "store"],
            syntax: "minigame shop",
            description: "Viewing the assets that are buyable."
        },
        start: {
            name: "start",
            aliases: [],
            syntax: "minigame start",
            description: "Starting the minigame by initializing the player profile."
        }
    },
    args: [
        ["<asset>", "The asset Id in the minigame. The Ids are shown in `minigame shop`."]
    ],
    manual: {
        description: "You can play the minigame in this bot via this command.",
        examples: [
            "minigame start"
        ]
    },
    execute(message, args, extra) {
        if (!args.length) return message.channel.send(`Subcommands: \`buy\`, \`generate\`, \`info\`, \`profile\`, \`shop\`, \`start\`.`)
        args[0] = StringHandlers.findCmdName(args[0], Command.subcommands);
        switch (args[0]) {
            case "generate":
            case "profile":
            case "shop":
            case "buy":
            case "info":
            case "start":
                import("./expan/minigame/"+args[0]).then(m => m(message, args.slice(1), extra));
                break;
            default:
                message.channel.send("`EN1012`: Invalid subcommand.");
        }
    }
}
export {Command};