const EventEmitter = require("events")
const fetch = require("node-fetch")

module.exports = class {
    static DiscordAuthorization = class extends EventEmitter{
        constructor(state, timeout=60) {
            super();
            this.state = state;
            let count = 0;
            const int = setInterval(() => {
                fetch("https://api.bit.io/api/v1beta/query/", {method: "POST", headers: {Accept: "application/json", "Content-Type": "application/json", Authorization: "Bearer 9Nen_UuTrFikB2Mpjw6r3ic3YVpd"}, body: JSON.stringify({query_string: "SELECT * FROM \"BenChueng0422/IdleCorp-Profit\".\"discordauthorization\" WHERE state = \'"+this.state+"\';"})}).then(d => d.json()).then(dt => {
                    if (count>timeout/12) {
                        this.emit("timeout");
                        clearInterval(int)
                    }
                    if (dt["data"].length) {
                        this.emit("authorized", dt["data"][0])
                        clearInterval(int)
                    }
                    count++;
                })
            }, 5000)
        }
    }
}