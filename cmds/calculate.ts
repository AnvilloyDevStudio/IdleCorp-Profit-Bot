import Decimal from "decimal.js";
import * as math from "mathjs";
import {calculate} from "../funcs/calculate.js";
import {NumberHandlers} from "../funcs/NumberHandlers.js";
import Fraction from "fraction.js";
import {StringHandlers} from "../funcs/StringHandlers.js";

const Command: import("../types/command").Command = {
    name: "calculate",
    aliases: ["cal", "=", "calc", "=+", "=*"],
    syntax: "calculate{{+|*} <number(s)> | <expression(s)> | --formula:<formula number> <arg(s)>}",
    description: "Quick calculating with a list of numbers or expressions.",
    args: [
        ["{+|*}", "Choose \"+ (plus)\" or \"* (times)\" if just want to sum up or multiple all the numbers. This is optional."],
        ["<number(s)>", "Calculates all the numbers with separators \`,\` and \`|\`."],
        ["<expression(s)>", "Calculates all the expression(s) with separator \`|\`."],
        ["--formula:<formula number> <arg(s)>", "Caluclate with a formula, formulas are listed at the below. \"arg(s)\" are the formula parameters."]
    ],
    argaliases: [
        ["--formula", ["--f"]]
    ],
    manual: {
        description: "You can use this command when you don't want to open calculator.",
        examples: [
            "=+ 1, 2, 3, 4 | 5+6+7+8",
            "=* 1, 2, 3, 4 | 5*6*7*8",
            "calculate --formula:1 1 10"
        ],
        extra: "Formulas:\n> 01 -- Speed | <num> <time> [unit] | `num` for the asset production; `time` for the asset production time, defaults with second; `unit` for the time unit that multiply the `time`, use time unit letters."+
            "\n> 02 -- Profit | <num> <time> <price> [unit] | `num` for the asset production; `time` for the asset production time, defaults with second; `price` is the asset price; `unit` for the time unit that multiply the `time`, use time unit letters."+
            "\n> 03 -- Perfect Ratio | <numA> <numB> [...] | The input numbers are the items in a ratio."+
            "\n> 04 -- To Time 60 | <num> | Converting `num` into the format `x:x:x`."+
            "\n> 05 -- GCD/HCF | <numA> <numB> [...] | Calculating the GCD/HCF of the inputed numbers."+
            "\n> 06 -- Land Price Calculator | <landsToBuy> [landsBought] | Calculating the land price by the number of lands to be bought (`landsToBuy`) and the number of lands have been bought (`landsBought` defaults with 0).",
        note: "`+` and `*` options are only available on aliases `=+` and `=*`."+
            "\n`+`/`*` and `,` separators are available only on summing or multiplying numbers with `+` or `*` option."
    },
    execute(message, args, other) {
        if (!args.length) return message.channel.send("`EN0001`: Missing parameter(s).");
        if (args[0].startsWith("--formula:")||args[0].startsWith("--f:")) {
            const fnum = parseInt(args.shift().split(":")[1]);
            if (!args.length) return message.channel.send("`EN0001`: Missing formula input number(s);");
            if (!fnum||fnum>6) return message.channel.send("`EN0002`: Invalid formula number delected.");
            let res: string;
            const unitT = {"s": 1, "m": 60, "h": 60*60, "d": 60*60*24, "w": 60*60*24*7};
            const checknum = (a: string[]) => a.some(a => !/^[0-9]+(?:\.[0-9]+)?$/.test(a));
            switch(fnum) {
                case 1:
                    if (args.length<2) return message.channel.send("`EN0001`: Missing necessary parameter(s) for the formula.");
                    if (checknum(args.slice(0, 2))) return message.channel.send("`EN0002`: Invalid number(s) detected.");
                    res = new Fraction(args[0]).div(args[1]).mul(unitT[args[2]]||1).toString();
                    break;
                case 2:
                    if (args.length<3) return message.channel.send("`EN0001`: Missing necessary parameter(s) for the formula.");
                    if (checknum(args.slice(0, 3))) return message.channel.send("`EN0002`: Invalid number(s) detected.");
                    res = new Fraction(args[0]).div(args[1]).mul(args[2]).mul(unitT[args[3]]||1).toString();
                    break;
                case 3:
                    if (args.length<2) return message.channel.send("`EN0001`: Missing necessary parameter(s) for the formula.");
                    if (checknum(args)) return message.channel.send("`EN0002`: Invalid number(s) detected.");
                    res = calculate.simratio(args.map(a => new Fraction(a))).join(":");
                    break;
                case 4:
                    if (checknum(args.slice(0, 1))) return message.channel.send("`EN0002`: Invalid number(s) detected.");
                    res = NumberHandlers.toTime(parseInt(args[0])).join(":");
                    break;
                case 5:
                    if (args.length<2) return message.channel.send("`EN0001`: Missing necessary parameter(s) for the formula.");
                    if (checknum(args)) return message.channel.send("`EN0002`: Invalid number(s) detected.");
                    res = calculate.gcd(...args.map(a => parseFloat(a))).toString();
                    break;
                case 6:
                    if (checknum(args)) return message.channel.send("`EN0002`: Invalid number(s) detected.");
                    let price = new Decimal(0);
                    for (let i = args.length>1? parseInt(args[1]): 0; i<parseInt(args[0]); i++) price = price.add(new Decimal(1.0961757).pow(i).mul(600));
                    res = "Approximately **$"+NumberHandlers.numberToLocaleString(parseFloat(price.toFixed(2)))+"**";
            }
            return message.channel.send("Formula: "+StringHandlers.fillZeros(fnum.toString(), 2)+"\nResult: "+res);
        }
        let res = [],
        express = args.join(" ").split(/ *\| */);
        if (express.length === 1&&!express[0]) return message.channel.send("`EN0001`: Missing expression.");
        try {
            switch (other.commandName) {
                case "=+":
                    for (const a of express) res.push(Decimal.sum(...a.split(/ *[,|\+] */)));
                    break;
                case "=*":
                    for (const a of express) res.push(a.split(/ *[,|\*] */).reduce((a, b) => a.times(b), new Decimal(1)));
                    break;
                default:
                    for (const a of express) res.push(math.evaluate(a));
            }
        } catch (e) {
            return message.channel.send((e.message.startsWith("Undefined symbol"))? "`EN0002`: Invalid expression detected.": "`EN0002`: Invalid expression: "+e.message+".")
        }
        message.channel.send("Result(s):\n> "+res.join("\n> "))
    }
}
export {Command};