import {EventEmitter} from "events";
import * as IdleCorpTypes from "../types/IdleCorpTypes.js";

class APIListener {
    static DiscordAuthorization = class extends EventEmitter {
        state: string;
        static authString = "http://discord.com/api/oauth2/authorize?response_type=token&client_id=801019508387086346&redirect_uri=http%3A%2F%2Flocalhost%3A4000%2Fapi&scope=identify%20email%20guilds&state=";
        constructor(database: import("pg").Client, state: string, timeout=60) {
            super();
            this.state = state;
            let count = 0;
            const int = setInterval(() => {
                database.query<IdleCorpTypes.DiscordAuthDB>("SELECT * FROM \"discord_auth\" WHERE state = \'"+this.state+"\';", (err, res) => {
                    if (err) console.error(err);
                    if (count>timeout/12) {
                        this.emit("timeout");
                        clearInterval(int)
                    }
                    if (res.rowCount) {
                        this.emit("authorized", res.rows[0]);
                        clearInterval(int)
                    }
                    count++;
                })
            }, 5000)
        }
        on(event: "timeout", listener: () => void): this;
        on(event: "authorized", listener: (auth: IdleCorpTypes.DiscordAuthDB) => void): this;
        on(event: string, listener: (...args: any[]) => void) {
            return super.on(event, listener);
        }
        static getAuthbyID(database: import("pg").Client, userID: string) {
            return database.query<IdleCorpTypes.DiscordAuthDB>("SELECT * FROM \"discord_auth\" WHERE userid = \'"+userID+"\';").then(data => {
                if (!data.rowCount) return null;
                return data.rows[0];
            })
        }
    }
}
export {APIListener};