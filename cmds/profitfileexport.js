const Discord = require("discord.js");
const setting = require("../setting.json");
const StringHandlers = require("../funcs/StringHandlers");
const icals = require("../icaliases.json");
const NumberHandlers = require("../funcs/NumberHandlers");
const calculate = require("../funcs/calculate");
const fs = require("fs")
const pffdt = require("../profitfiledata.json");
const archiver = require("archiver");
const BufferStream = require("../funcs/BufferStream");

module.exports = {
	name: "profitfileexport",
	execute(message, args) {
        let flag = args.filter(a => a.startsWith("--"));
        args = args.filter(a => !flag.includes(a));
        let comp, emb, pastver, region, icd;
        if (["--version:", "--v:", "--ver:"].some(a => flag[0]?.toLowerCase().startsWith(a))) {
            let flag = args.shift().split(":")[1].toLowerCase();
            if (fs.readdirSync("./icdetailvers").map(a => a.slice(9, -5)).includes(flag)) icd = require("../icdetailvers/icdetail_"+flag+".json");
            else return message.channel.send("`EN0022`: The IdleCorp source version was invalid.");
        } else icd = require("../icdetailvers/"+fs.readdirSync("./icdetailvers").slice(-1)[0])
        if (["--rm:", "--regionmodifier:", "--modifier:", "--mod:"].some(a => flag[0]?.toLowerCase().startsWith(a))) {
            let flag = args.shift().split(":")[1].toLowerCase();
            if (["hq", "icp", "idlecorp", "idlecorpprofit", "idlecorphq"].includes(flag)) region = {"idlecorp": "hq", "idlecorphq": "hq", "idlecorpprofit": "icp"}[flag]??flag;
            else return message.channel.send("`EN0022`: The region name was invalid.");
        }
        if (flag.includes("--zip")) {
            comp = true;
            flag.splice(flag.indexOf("--zip"), 1);
        }
        if (flag.includes("--embed")) {
            emb = true;
            flag.splice(flag.indexOf("--embed"), 1);
        }
        if (flag.includes("--Beta")) {
            pastver = true;
            flag.splice(flag.indexOf("--Beta"), 1);
        }
        if (flag.length) return message.channel.send("`EN0012`: Invalid flag(s) detected.");
        if (args.length > 2) return message.channel.send("`EN0013`: Too many parameters.");
        if (!args.length) {
            if (pastver) {
                let resf;
                if (comp) resf = new Promise(rs => fs.readdir("./icpfiles/RARs", (e, f) => rs([(f.slice(-1)[0].endsWith("p"))? "1.0": f.slice(-1)[0].slice(10, -4), new Discord.MessageAttachment("./icpfiles/RARs/"+f.slice(-1)[0])])));
                else resf = new Promise(rs => fs.readdir("./icpfiles/Ori-files", (e, f) => rs([(f.slice(-1)[0].endsWith("p"))? "1.0": f.slice(-1)[0].slice(10), new Discord.MessageAttachment("./icpfiles/Ori-files/"+f.slice(-1)[0]+"/profit.txt")])));
                return resf.then(f => message.channel.send({content: "Version: v.Beta."+f[0], files: [f[1]]}))
            }
        }
        if (pastver) {
            return new Promise(rs => fs.readdir("./icpfiles/Ori-files", (e, f) => rs(f.map(a => (a.endsWith("p"))? "1.0": a.slice(10))))).then(pasts => {
                if (pasts.includes(args[0])) {
                    let resf;
                    if (comp) resf = new Promise(rs => fs.readdir("./icpfiles/RARs", (e, f) => rs([pasts[pasts.indexOf(args[0])], new Discord.MessageAttachment("./icpfiles/RARs/"+f[pasts.indexOf(args[0])])])));
                    else resf = new Promise(rs => fs.readdir("./icpfiles/Ori-files", (e, f) => rs([pasts[pasts.indexOf(args[0])], new Discord.MessageAttachment("./icpfiles/Ori-files/"+f[pasts.indexOf(args[0])]+"/profit.txt")])));
                    return resf.then(f => message.channel.send({content: "Version: v.Beta."+f[0], files: [f[1]]}));
                } else return message.channel.send("`EN0002`: Invalid Beta version.");
            })
        }
        let ver;
        if (args[0] in pffdt) ver = args.shift();
        else ver = Object.keys(pffdt).slice(-1)[0];
        let unit;
        if (args.length) {
            const theals = {"sec": "second", "s": "second", "min": "minute", "m": "minute", "hr": "hour", "h": "hour", "d": "day"};
            if (!(args[0] in theals)&&!["second", "minute", "hour", "day"].includes()) return message.channel.send("`EN0002`: Invalid time unit.");
            unit = (["second", "minute", "hour", "day"].includes(args[0]))? args[0]: theals[args[0]]
            if (!unit) return message.channel.send("`EN0002`: Invalid time unit.");
        } else unit = "second";
        let result = [];
        const num = {"day": 60*60*24, "hour": 60*60, "minute": 60}[unit]??1;
        let prom = Promise.resolve();
        for (const fac in icd["facilities"]) {
            prom = prom.then(() => calculate.facratio(fac, 1, Boolean(region), region, icd)).then(facratio => {
                const firstfac = calculate.firstFac(fac, facratio[2], (emb)? false: true);
                Promise.all([calculate.produceRemain(fac, facratio[2], 1, firstfac[2], Boolean(region), region, icd),
                    calculate.productProfit(fac, "all", num, Boolean(region), region, icd),
                    calculate.productProfitLand(fac, "all", num, firstfac[2], Boolean(region), region, icd)]
                    ).then(rresult => {
                    const [remain, sol, soland] = rresult;
                    let s2 = [],
                    count = 0,
                    pf;
                    for (const a of [sol[0], sol[1], soland[1]]) {
                        let s = [];
                        if (a !== "None") {
                            for (const b in a) {
                                a[b] = a[b].split(".");
                                if (count !== 2) s.push(((emb)? "> **": "| ")+StringHandlers.capitalize(b).replaceAll("_", " ")+((emb)? "** | $": " | $")+Number(a[b][0]).toLocaleString("en-US").toString()+((a[b][1])? "."+a[b].slice(1).join("."): ".00"));
                                else s.push(((emb)? "**": "| ")+StringHandlers.capitalize(b).replaceAll("_", " ")+((emb)? "** | $": "$")+Number(a[b][0]).toLocaleString("en-US").toString()+((a[b][1])? "."+a[b].slice(1).join("."): ".00")+"/land");
                            }
                            s2.push(s.join("\n"));
                        } else {
                            if (emb) s2.push(">  None");
                            else s2.push("| None");
                        }
                        count++;
                    }
                    const [c, p, pland] = s2;
                    if (Array.isArray(sol[2])) {
                        const pfs = sol[2];
                        for (let a of Object.values(pfs[0])) {
                            a = a.split(".");
                            if (emb) pf = "> **Max** | $"+Number(a[0]).toLocaleString("en-US").toString()+((a[1])? "."+a.slice(1).join("."): ".00")+"\n";
                            else pf = "| Max | $"+Number(a[0]).toLocaleString("en-US").toString()+((a[1])? "."+a.slice(1).join("."): ".00")+"\n";
                        }
                        for (let a of Object.values(pfs[1])) {
                            a = a.split(".");
                            if (emb) pf += "> **Min** | $"+Number(a[0]).toLocaleString("en-US").toString()+((a[1])? "."+a.slice(1).join("."): ".00");
                            else pf += "| Min | $"+Number(a[0]).toLocaleString("en-US").toString()+((a[1])? "."+a.slice(1).join("."): ".00");
                        }
                    } else {
                        pf = sol[2].split(".");
                        if (emb) pf = "> $"+Number(pf[0]).toLocaleString("en-US").toString()+((pf[1])? "."+pf.slice(1).join("."): ".00");
                        else pf = "| $"+Number(pf[0]).toLocaleString("en-US").toString()+((pf[1])? "."+pf.slice(1).join("."): ".00");
                    }
                    if (Array.isArray(soland[2])) {
                        pfs = soland[2];
                        for (let a of Object.values(pfs[0])) {
                            a = a.split(".");
                            if (emb) pfland = "> **Max** | $"+Number(a[0]).toLocaleString("en-US").toString()+((a[1])? "."+a.slice(1).join("."): ".00")+"/land\n";
                            else pfland = "| Max | $"+Number(a[0]).toLocaleString("en-US").toString()+((a[1])? "."+a.slice(1).join("."): ".00")+"/land\n";
                        }
                        for (let a of Object.values(pfs[1])) {
                            a = a.split(".");
                            if (emb) pfland += "> **Min** | $"+Number(a[0]).toLocaleString("en-US").toString()+((a[1])? "."+a.slice(1).join("."): ".00")+"/land";
                            else pfland += "| Min | $"+Number(a[0]).toLocaleString("en-US").toString()+((a[1])? "."+a.slice(1).join("."): ".00")+"/land";
                        }
                    } else {
                        pfland = soland[2].split(".");
                        if (emb) pfland = "> $"+Number(pfland[0]).toLocaleString("en-US").toString()+((pfland[1])? "."+pfland.slice(1).join("."): ".00")+"/land";
                        else pfland = "| $"+Number(pfland[0]).toLocaleString("en-US").toString()+((pfland[1])? "."+pfland.slice(1).join("."): ".00")+"/land";
                    }
                    let rem = [];
                    for (let a of remain[0]) {
                        a[1] = a[1].split(".");
                        if (emb) rem.push("> **"+StringHandlers.capitalize(a[0]).replaceAll("_", " ")+"** | "+Number(a[1][0]).toLocaleString("en-US").toString()+((a[1][1])? "."+a[1].slice(1).join("."): ".00"));
                        else rem.push("| "+StringHandlers.capitalize(a[0]).replaceAll("_", " ")+" | "+Number(a[1][0]).toLocaleString("en-US").toString()+((a[1][1])? "."+a[1].slice(1).join("."): ".00"));
                    }
                    if (emb) rem.push("> ");
                    else rem.push("------");
                    for (let a of remain[1]) {
                        a[1] = a[1].split(".");
                        if (emb) rem.push("> **"+StringHandlers.capitalize(a[0])+"** | $"+Number(a[1][0]).toLocaleString("en-US").toString()+((a[1][1])? "."+a[1].slice(1).join("."): ".00"));
                        else rem.push("| "+StringHandlers.capitalize(a[0])+" | $"+Number(a[1][0]).toLocaleString("en-US").toString()+((a[1][1])? "."+a[1].slice(1).join("."): ".00"));
                    }
                    let sp;
                    if (Array.isArray(icd["facilities"][fac]["speed"])) {
                        sp = icd["facilities"][fac]["speed"].map(a => a.toString()+"s")
                        sp.splice(1, 0, "to");
                    }
                    if (emb) result.push([StringHandlers.capitalize(fac).replaceAll("_", " "), "**Construct materials**\n"+Object.entries(icd["info"]["facilities"][fac]["construct"]).map(a => (a[0] === "money")? "> $"+a[1]: "> **"+StringHandlers.capitalize(a[0]).replaceAll("_", " ")+"** | "+a[1]).join("\n")+"\n\n**Consumes**\n"+c+"\n**Produces**\n"+p+"\n\n**Profit**\n"+pf+"\n\nRatio(order follow to above): "+facratio[0]+" "+facratio[1]+"\nFirst Facility(First Fac)\n"+firstfac[0]+"\n"+firstfac[1]+"\n**Produce Remains**\n"+rem.join("\n")+"\n"+"Speed: "+((Array.isArray(icd["facilities"][fac]["speed"]))? sp.join(" "): icd["facilities"][fac]["speed"].toString()+"s")+"\n\n\n_ _"]);
                    else result.push(StringHandlers.capitalize(fac).replaceAll("_", " ")+"\nConstruct materials\n"+Object.entries(icd["info"]["facilities"][fac]["construct"]).map(a => (a[0] === "money")? "| $"+a[1]: "| "+StringHandlers.capitalize(a[0]).replaceAll("_", " ")+" | "+a[1]).join("\n")+"\nConsumes\n"+c+"\nProduces\n"+p+"\nProfit\n"+pf+"\nRatio(order follow to above): "+facratio[0]+" "+facratio[1]+"\nFirst Facility(First Fac)\n"+firstfac[0]+"\n"+firstfac[1]+"\nProduce Remains\n------\n"+rem.join("\n")+"\n------\n"+"Speed: "+((Array.isArray(icd["facilities"][fac]["speed"]))? sp.join(" "): icd["facilities"][fac]["speed"].toString()+"s"));
                })
            })
        }
        prom.then(() => {
            if (!emb) {
                let resf;
                if (comp) {
                    let faclist = [];
                    for (const a in icd["facilities"]) {
                        let stuff = [],
                        i = [0, 0];
                        for (const b of Object.entries(icd["facilities"][a])) {
                            if (["consumes", "produces"].includes(b[0])) {
                                const e = ["consumes", "produces"].indexOf(b[0]);
                                if (i[e] === 0) stuff.push(StringHandlers.capitalize(b).replaceAll("_", " "));
                                if (b[1] === "None") stuff.push("| None");
                                else {
                                    for (const d in b[1]) {
                                        if (d === "money") stuff.push("| $"+b[1][d]);
                                        stuff.push("| "+StringHandlers.capitalize(d).replaceAll("_", " ")+" | "+b[1][d]);
                                    }
                                }
                            }
                            if (b === "consumes") i[0]++;
                            else i[1]++;
                        }
                        let speed;
                        if (Array.isArray(icd["facilities"][a]["speed"])) {
                            speed = [];
                            for (const b of icd["facilities"][a]["speed"]) speed.push(NumberHandlers.toTime(b).slice(1).map(a => (a.toString()<2)? "0"+a: a).join(":"));
                            speed.splice(1, 0, "to");
                            speed = speed.join(" ");
                        } else speed = NumberHandlers.toTime(icd["facilities"][a]["speed"]).slice(1).map(a => (a.toString()<2)? "0"+a: a).join(":");
                        faclist.push(StringHandlers.capitalize(a).replaceAll("_", " ")+"\nConstruct materials\n"+Object.entries(icd["info"]["facilities"][a]["construct"]).map(a => (a[0] === "money")? "| $"+a[1]: "| "+StringHandlers.capitalize(a[0]).replaceAll("_", " ")+" | "+a[1]).join("\n")+"\n"+stuff.join("\n")+"\nEvery "+speed);
                    }
                    let facspeed = [];
                    for (const f in icd["facilities"]) {
                        calculate.productSpeed(f, "all", num, Boolean(region), region, icd).then(sol => {
                            let cspd, cssp, pdpd, pdsp;
                            if (sol[0] === "None") cspd = "None";
                            else {
                                cspd = Object.keys(sol[0]);
                                cssp = Object.values(sol[0]);
                            }
                            if (sol[1] !== "None") {
                                pdpd = Object.keys(sol[1]);
                                pdsp = Object.values(sol[1]);
                            } else pdpd = "None";
                            let s = [],
                            s2 = [],
                            stuff = ["Consumes"];
                            if (cspd !== "None") {
                                for (let [a, b] of cspd.map((a, b) => [a, cssp[b]])) {
                                    b = b.split(".");
                                    s.push("| "+StringHandlers.capitalize(a).replaceAll("_", " ")+" | "+Number(b[0]).toLocaleString("en-US").toString()+((b[1])? "."+b.slice(1).join("."): ".00"));
                                }
                                stuff.push(s.join("\n"));
                            } else stuff.push("| None");
                            stuff.push("Produces");
                            if (pdpd !== "None") {
                                for (let [a, b] of pdpd.map((a, b) => [a, pdsp[b]])) {
                                    b = b.split(".");
                                    s2.push("| "+StringHandlers.capitalize(a).replaceAll("_", " ")+" | "+Number(b[0]).toLocaleString("en-US").toString()+((b[1])? "."+b.slice(1).join("."): ".00"));
                                }
                                stuff.push(s2.join("\n"));
                            } else stuff.push("| None");
                            let speed;
                            if (Array.isArray(icd["facilities"][f]["speed"])) {
                                speed = [];
                                for (const b of icd["facilities"][f]["speed"]) speed.push(NumberHandlers.toTime(b).slice(1).map(a => (a.toString()<2)? "0"+a: a).join(":"));
                                speed.splice(1, 0, "to");
                                speed = speed.join(" ");
                            } else speed = NumberHandlers.toTime(icd["facilities"][f]["speed"]).slice(1).map(a => (a.toString()<2)? "0"+a: a).join(":");
                            facspeed.push(StringHandlers.capitalize(f).replaceAll("_", " ")+"\n"+stuff.join("\n")+"\nEvery "+speed);
                        })
                    }
                    const archive = archiver("zip", {zlib: {level: 9}})
                    archive.append("Unit: "+StringHandlers.capitalize(unit)+"\n\n"+result.join("\n\n"), {name: "profit.txt"});
                    archive.append(faclist.join("\n\n"), {name: "facility_list.txt"});
                    archive.append("Unit: "+StringHandlers.capitalize(unit)+"\n\n"+facspeed.join("\n\n"), {name: "production_speed.txt"});
                    for (const [a, b] of Object.entries(pffdt[ver])) archive.append(b.join("\n"), {name: a});
                    resf = new BufferStream();
                    archive.pipe(resf);
                    archive.finalize().then(() => message.channel.send({content: "Version: v."+ver, files: [new Discord.MessageAttachment(resf.getBuffer(), "IdleCorp Profit.zip")]}))
                } else {
                    resf = new Discord.MessageAttachment(Buffer.from("Unit: "+StringHandlers.capitalize(unit)+"\n\n"+result.join("\n\n")), "profit.txt");
                    message.channel.send({content: "Version: v."+ver, files: [resf]});
                }
            } else {
                let embed = [new Discord.MessageEmbed().setTitle("Profit Embed Full")],
                check = 0;
                for (const a of result) {
                    if ((check+a[0].length+a[1].length)>5800) {
                        embed.push(new Discord.MessageEmbed())
                        check = 0;
                    }
                    check+=a[0].length+a[1].length;
                    if (a[1].length>1000) {
                        a[1] = a[1].split("\n");
                        embed.slice(-1)[0].addField(a[0], a[1].splice(0, ~~(a[1].length/2)).join("\n"), false)
                        embed.slice(-1)[0].addField("\u200b", a[1].join("\n"), false);
                    } else embed.slice(-1)[0].addField(a[0], a[1], false);
                }
                let b = Promise.resolve();
                for (const a of embed) {
                    if (!message.author.dmChannel) b = b.then(() => message.author.createDM().then(() => message.author.dmChannel.send(a)));
                    else b = b.then(() => message.author.dmChannel.send(a));
                }
                b.then(() => message.channel.send("It has sent via your DM"));
            }
        })
    }
}