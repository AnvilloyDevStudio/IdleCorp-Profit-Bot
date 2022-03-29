import cdslist from "../codes.json";
import { StringHandlers } from "../funcs/StringHandlers.js";
import { Checks } from "../funcs/Checks.js";
/**
 * @remarks
 * ```txt
 * ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
 * Update:
 *   U, perm(D/A/N), {from 0}type(command(Hiperm), command(normal), event(include you_know), codes, alliases, easter eggs), commands(add, change, remove, add(history), change(history), remove(history), codes, aliases, other), size(history(1), statusread(1), status(2), codes(1), aliases(1), you_know(2)), number(two digits)
 * Error:
 *   E, perm(D/A/N), {from 0}type(command(common), command(rare), event handling, search(wiki)),
 *    Common:
 *      {from 0}type(argumenterror, checkerror(permission etc)),
 *        argumenterror:
 *          argumenttype(normal, flag, flagparameter), number(1 digit)
 *        checkerror:
 *          checktype(permission(role), permission(other), profile missing), number(1 digit)
 *    Rare and other:
 *      {from 0}type(subcommand),
 *        Subcommand:
 *          type(command, argument), number(1 digit)
 *    Command handling:
 *      {from 0}type(main command handling, after you_know, error situation),
 *        Other:
 *          {from 0}commonness(common, uncommon), number(1 digit),
 *        Error situation:
 *          problemdepth(only command, temporary, permanent), number(1 digit)
 * ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
 * ```
 */
const Command = {
    name: "codes",
    aliases: ["cds"],
    syntax: "codes {{update|error} <code> | {version|list}}",
    description: "Querying a code.",
    args: [
        ["<code>", "The code which is needed to be queried."]
    ],
    manual: {
        description: "You can use this command to query any of the codes you saw.",
        examples: [
            "codes error EN0001"
        ]
    },
    subcommands: {
        update: {
            name: "update",
            aliases: ["up", "ud", "u"],
            syntax: "codes update <code>",
            description: "Query an update code."
        },
        error: {
            name: "error",
            aliases: ["er", "e"],
            syntax: "codes error <code>",
            description: "Query an error code."
        },
        version: {
            name: "version",
            aliases: ["v"],
            syntax: "codes version",
            description: "Show the code version."
        },
        list: {
            name: "list",
            aliases: ["l", "ls"],
            syntax: "codes list",
            description: "Show the list of valid codes."
        }
    },
    execute(message, args, extra) {
        if (!args.length)
            return message.channel.send(`Subcommands: \`update\`, \`error\`\nThe current Codes version is v.${cdslist["version"]}`);
        args[0] = StringHandlers.findCmdName(args[0], Command.subcommands);
        switch (args[0]) {
            case "update":
            case "error":
                import("./expan/codes/" + args[0]).then(m => m(message, args.slice(1), extra));
                break;
            case "version":
                message.channel.send(`The current code version is ${cdslist.version}.`);
                break;
            case "list":
                message.channel.send("The list of codes:`" + (Checks.isDev(message.member) ? Object.values(cdslist.codes).reduce((a, b) => a + "\n" + Object.keys(b).sort().join("\n"), "") : Checks.isAdmin(message.member) ? Object.values(cdslist["codes"]).reduce((a, b) => a + "\n" + Object.keys(b).filter(a => !a.includes("D")).sort().join("\n"), "") : Object.values(cdslist.codes).reduce((a, b) => a + "\n" + Object.keys(b).filter(a => !(a.includes("D") || a.includes("A"))).sort().join("\n"), "")) + `\`\n\nCode version: v.${cdslist.version}`);
                break;
            default:
                message.channel.send("`EN1012`: Invalid subcommand.");
        }
    }
};
export { Command };
//# sourceMappingURL=codes.js.map