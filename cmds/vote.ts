const Command: import("../types/command").Command = {
    name: "vote",
    aliases: ["vt"],
    syntax: "vote",
    description: "Showing the top.gg voting link.",
    manual: {
        description: "Showing the top.gg voting link.",
        examples: [
            "vote"
        ]
    },
    execute(message, args) {
        message.channel.send("Vote on top.gg:\nIdleCorp Profit project server: https://top.gg/servers/801019800682758145\nIdleCorp Profit Bot Lite: https://top.gg/bot/916604853625716747");
    }
}
export {Command};