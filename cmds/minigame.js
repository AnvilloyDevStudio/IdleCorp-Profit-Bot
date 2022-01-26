const fetch = require("node-fetch");
const cmdInfo = require("../cmdsinfo.json");

module.exports = {
	name: "minigame",
	execute(message, args) {
        args = args.map((a, b) => (!b)? Object.entries(cmdInfo["aliases"]["minigame"]).find(b => b[1].includes(a))?.[0] || a: a);
        if (["generate", "profile", "shop", "buy", "info", "start"].includes(args[0]))
            fetch("https://api.bit.io/api/v1beta/query/", {method: "POST", headers: {Accept: "application/json", "Content-Type": "application/json", Authorization: "Bearer 9Nen_UuTrFikB2Mpjw6r3ic3YVpd"}, body: JSON.stringify({query_string: "SELECT * FROM \"BenChueng0422/IdleCorp-Profit\".\"minigame\" WHERE user_id = \'"+message.author.id+"\';"})}).then(d => d.json()).then(dt => {
                let data = dt["data"];
                let pro = Promise.resolve();
                if (data.length) pro = fetch("https://api.bit.io/api/v1beta/query/", {method: "POST", headers: {Accept: "application/json", "Content-Type": "application/json", Authorization: "Bearer 9Nen_UuTrFikB2Mpjw6r3ic3YVpd"}, body: JSON.stringify({query_string: "UPDATE \"BenChueng0422/IdleCorp-Profit\".\"minigame\" SET data = \'"+JSON.stringify(data[0][1])+"\'::JSON WHERE user_id = \'"+message.author.id+"\';"})});
                return pro.then(() => require("./expan/minigame/"+args[0]).execute(message, args.slice(1)));
            })
        else message.channel.send("`EN1011`: Missing subcommand.");
    }
}