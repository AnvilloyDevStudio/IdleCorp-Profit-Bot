const cmdInfo = require("../cmdsinfo.json");

module.exports = {
	name: "suggest",
	execute(message, args) {
        args = args.map((a, b) => (!b)? Object.entries(cmdInfo["aliases"]["suggest"]).find(b => b[1].includes(a))?.[0] || a: a);
        if (["change", "remove"].includes(args[0])&&!message.member.roles.cache.findKey((a, b) => ["841622372351344650", "801052590389329930", "801052697498746920"].includes(b))) return message.channel.send("`EN0111`: You don't have enough permission.");
        if (["add", "edit", "vote", "info", "change", "remove"].includes(args[0])&&args.length>1||args[0]==="status") return require("./expan/suggest/"+args[0]).execute(message, args.slice(1));
        message.channel.send("Commands:\n`suggest add`\n`suggest edit`\n`suggest vote`\n`suggest info`\n`suggest status`"+((message.member.roles.cache.findKey((a, b) => ["841622372351344650", "801052590389329930", "801052697498746920"].includes(b)))? "\n`suggest change`\n`suggest remove`": "")+"\nStatus: in_review, verified, pass, not_pass, done");
    }
}