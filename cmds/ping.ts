const Command: import("../types/command").Command = {
    name: "ping",
    aliases: ["p"],
    syntax: "ping",
    description: "Showing the latency of the bot.",
    manual: {
        description: "Showing the gateway latency and responding.",
        examples: [
            "ping"
        ]
    },
    execute(message, args) {
        message.channel.send("Ping/Latency: "+message.client.ws.ping+"ms");
    }
}
export {Command};