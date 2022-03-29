import setting from "../setting.json";
import * as fs from "fs";
const Event = {
    name: "ready",
    once: true,
    execute(client, database) {
        fs.readdir("./loops", (e, f) => { for (const a of f.filter(a => a.endsWith(".js")))
            import("../loops/" + a).then(m => m.default(client, database)); });
        client.user.setPresence({ activities: [{ name: "v." + setting.version + " | +help", type: "WATCHING" }] });
        console.log("Bot Client Ready");
    },
};
export { Event };
//# sourceMappingURL=ready.js.map