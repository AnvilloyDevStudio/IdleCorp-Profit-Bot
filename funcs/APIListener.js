var __setFunctionName = (this && this.__setFunctionName) || function (f, name, prefix) {
    if (typeof name === "symbol") name = name.description ? "[".concat(name.description, "]") : "";
    return Object.defineProperty(f, "name", { configurable: true, value: prefix ? "".concat(prefix, " ", name) : name });
};
var _a;
import { EventEmitter } from "events";
class APIListener {
}
APIListener.DiscordAuthorization = (_a = class extends EventEmitter {
        constructor(database, state, timeout = 60) {
            super();
            this.state = state;
            let count = 0;
            const int = setInterval(() => {
                database.query("SELECT * FROM \"discord_auth\" WHERE state = \'" + this.state + "\';", (err, res) => {
                    if (err)
                        console.error(err);
                    if (count > timeout / 12) {
                        this.emit("timeout");
                        clearInterval(int);
                    }
                    if (res.rowCount) {
                        this.emit("authorized", res.rows[0]);
                        clearInterval(int);
                    }
                    count++;
                });
            }, 5000);
        }
        on(event, listener) {
            return super.on(event, listener);
        }
        static getAuthbyID(database, userID) {
            return database.query("SELECT * FROM \"discord_auth\" WHERE userid = \'" + userID + "\';").then(data => {
                if (!data.rowCount)
                    return null;
                return data.rows[0];
            });
        }
    },
    __setFunctionName(_a, "DiscordAuthorization"),
    _a.authString = "http://discord.com/api/oauth2/authorize?response_type=token&client_id=801019508387086346&redirect_uri=http%3A%2F%2Flocalhost%3A4000%2Fapi&scope=identify%20email%20guilds&state=",
    _a);
export { APIListener };
//# sourceMappingURL=APIListener.js.map