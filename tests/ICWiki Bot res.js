const https = require("https");
const fetch = require("node-fetch");
const mwn = require("mwn");
const guide = require("../guide.json");
const StringHandlers = require("../funcs/StringHandlers");

const bot = new mwn.mwn({apiUrl: "https://wiki.idlecorp.xyz/api.php"});
bot.login({username: "Bencheung0422@IdleCorp_Profit", password: "7tabj4fcqvj3ig23oov13blp38acqgq6"}).then(res => {
    console.log(res);
    const ctn = ":\'\'This is a bot-generated guide that is copied from the [[IdleCorp Profit]] Bot\'\'\nThis can be seen by using <code>+guide</code> command on the bot. All the page update operations are done by using Bot. Everyone can suggest any change on this guide in the wiki channel (or the IdleCorp Profit suggest channel) or just edit by yourself.\n\n== Basic ==\n\n"+
        Object.entries(guide.basic).map(a => "=== "+StringHandlers.capitalize(a[0])+" ===\n\n"+Object.entries(a[1]).map(a => ":*"+StringHandlers.capitalize(a[0])+" -- "+a[1]).join("\n")).join("\n\n")+"\n\n== Advanced ==\n\n"+
        Object.entries(guide.advanced).map(a => "=== "+StringHandlers.capitalize(a[0])+" ===\n\n"+Object.entries(a[1]).map(a => ":*"+StringHandlers.capitalize(a[0])+" -- "+a[1]).join("\n")).join("\n\n")+"\n\n== Disclaimer ==\n\n''The information in this guide may not true at all, if there is any information and detail is false, all follow to the developer.<br>All the information has not been corrected by any long-time player or the developer.''";
    bot.edit(272, () => ({text: ctn, summary: "(Bot) Update the guide with corrected information", bot: true, watchlist: "preferences"})).then(res => {
        const readline = require('readline').createInterface({
            input: process.stdin,
            output: process.stdout
        });
        const id = res.captcha.id;
        console.log(res.captcha)
        let ans;
        // readline.question("Captcha ID: ", a => {
        //     id = Number(a);
            readline.question("Captcha Ans: ", a => {
                ans = a;
                readline.close();
                bot.edit(272, () => ({text: ctn, summary: "(Bot) Update the guide with corrected information", bot: true, watchlist: "preferences", captchaid: id, captchaword: ans})).then(console.log)
            })
        // });
    })
})
// const host = new URL("https://wiki.idlecorp.xyz/api.php")
// host.search = new URLSearchParams({"action": "query", "format": "json", "meta": "tokens", "type": "login"}).toString();
// new Promise((rs, rj) => https.request(host, {method: "POST", headers: {"Content-Type": "application/json", Accept: "application/json"}}, (res) => {
//     let data = "";
//     res.on("data", (chunk) => {
//         data += chunk;
//     })
//     res.on("end", () => {
//         rs([JSON.parse(data), res.headers["set-cookie"]]);
//     })
// }).on("error", (err) => {
//     rj("Error: "+err.message);
// }).end()).then((dt) => {
//     let d = dt[0];
//     let cookie = dt[1].map(tough.parse);
//     const logintoken = d["query"]["tokens"]["logintoken"];
//     const host = new URL("https://wiki.idlecorp.xyz/api.php")
//     host.search = new URLSearchParams({"action": "login", "format": "json", "lgname": "Bencheung0422@IdleCorp_Profit"}).toString();
//     // fetch(host, {method: "POST", headers: {Accept: "application/json", "Content-Type": "application/json", Cookie: cookie2}, body: "{lgpassword: \"7tabj4fcqvj3ig23oov13blp38acqgq6\", lgtoken: \""+logintoken+"\"}"}).then(d => d.json())
//     const content = JSON.stringify({"lgpassword": "7tabj4fcqvj3ig23oov13blp38acqgq6", "lgtoken": logintoken})
//     new Promise((rs, rj) => {
//         let req = https.request(host, {method: "POST", headers: {"Content-Type": "application/json", Accept: "application/json", "Content-Length": content.length, Cookie: cookie.map(a => a.cookieString())}}, (res) => {
//             let data = "";
//             res.on("data", (chunk) => {
//                 data += chunk;
//             })
//             res.on("end", () => {
//                 rs(JSON.parse(data));
//             })
//         }).on("error", (err) => {
//             rj("Error: "+err.message);
//         })
//         req.end(content)
//     })
//     .then((d) => {
//         console.log(d)
//     })
// })