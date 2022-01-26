const Decimal = require("decimal.js");
const math = require("mathjs");
const calculate = require("../funcs/calculate");
const NumberHandlers = require("../funcs/NumberHandlers");
const Fraction = require("fraction.js");
const StringHandlers = require("../funcs/StringHandlers");

module.exports = {
    name: "calculate",
    execute(message, args) {
        if (!args.length) return message.channel.send("`EN0001`: Missing parameter(s).");
        if (args[0].startsWith("--formula:")||args[0].startsWith("--f:")) {
            const fnum = Number(args.shift().split(":")[1]);
            if (!args.length) return message.channel.send("`EN0001`: Missing formula input number(s);");
            if (!fnum||fnum>5) return message.channel.send("`EN0002`: Invalid formula number delected.");
            let res;
            const unitT = {"s": 1, "m": 60, "h": 60*60, "d": 60*60*24, "w": 60*60*24*7};
            const checknum = (a) => a.some(a => !/^[0-9]+(?:\.[0-9]+)?$/.test(a));
            switch(fnum) {
                case 1:
                    if (args.length<2) return message.channel.send("`EN0001`: Missing necessary parameter(s) for the formula.");
                    if (checknum(args.slice(0, 2))) return message.channel.send("`EN0002`: Invalid number(s) detected.");
                    res = Fraction(args[0]).div(args[1]).mul(unitT[args[2]]||1).toString();
                    break;
                case 2:
                    if (args.length<3) return message.channel.send("`EN0001`: Missing necessary parameter(s) for the formula.");
                    if (checknum(args.slice(0, 3))) return message.channel.send("`EN0002`: Invalid number(s) detected.");
                    res = Fraction(args[0]).div(args[1]).mul(args[2]).mul(unitT[args[3]]||1).toString();
                    break;
                case 3:
                    if (args.length<2) return message.channel.send("`EN0001`: Missing necessary parameter(s) for the formula.");
                    if (checknum(args)) return message.channel.send("`EN0002`: Invalid number(s) detected.");
                    res = calculate.simratio(args.map(a => Fraction(a))).join(":");
                    break;
                case 4:
                    if (checknum(args.slice(0, 1))) return message.channel.send("`EN0002`: Invalid number(s) detected.");
                    res = NumberHandlers.toTime(args[0]).join(":");
                    break;
                case 5:
                    if (args.length<2) return message.channel.send("`EN0001`: Missing necessary parameter(s) for the formula.");
                    if (checknum(args)) return message.channel.send("`EN0002`: Invalid number(s) detected.");
                    res = calculate.gcd(...args);
                    break;
            }
            return message.channel.send("Formula: "+StringHandlers.fillZeros(fnum)+"\nResult: "+res);
        }
        let option;
        if (isNaN(parseFloat(args[0]))) option = args.shift().toLowerCase();
        let res = [],
        express = args.join(" ").split(/ *\| */);
        if (express.length === 1&&!express[0]) return message.channel.send("`EN0001`: Missing expression.");
        try {
            if (["+", "plus", "p"].includes(option)) {
                for (const a of express) res.push(Decimal.sum(...a.split(/ *[,|\+] */)));
            } else if (["*", "x", "times", "t"].includes(option)) {
                for (const a of express) res.push(a.split(/ *[,|\*] */).reduce((a, b) => a.times(b), Decimal(1)));
            } else for (const a of express) res.push(math.evaluate(a))
        } catch (e) {
            return message.channel.send((e.message.startsWith("Undefined symbol"))? "`EN0002`: Invalid expression detected.": "`EN0002`: Invalid expression: "+e.message+".")
        }
        message.channel.send("Result:\n> "+res.join("\n> "))
    }
}