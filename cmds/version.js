import setting from "../setting.json";
const Command = {
    name: "version",
    aliases: ["vs", "ver", "v"],
    syntax: "version",
    description: "Showing the version of the bot.",
    manual: {
        description: "Showing current version of the bot.",
        examples: [
            "version"
        ]
    },
    execute(message, args) {
        message.channel.send("The current bot version: " + setting["version"]);
    }
};
export { Command };
//# sourceMappingURL=version.js.map