import { Checks } from "../funcs/Checks";
const Command = {
    name: "send",
    aliases: ["sd"],
    syntax: "send <channel>",
    description: "Sending a message with the bot.",
    args: [
        ["<channel>", "The channel mention."]
    ],
    manual: {
        description: "Sending a message with the bot. This is used in bot development.",
        examples: [
            "send <#801019992719360000>"
        ]
    },
    perm: 2,
    execute(message, args) {
        if (!Checks.isDev(message.member))
            return message.channel.send("`EN0111`: You don't have enough permission.");
        const channels = message.guild.channels.cache;
        const arg = args.join("");
        const chid = arg.match(/\d+/)?.[0];
        if (!channels.has(chid))
            return message.channel.send("`EN0006`: The channel id was invalid.");
        channels.get(chid).send("This is a message");
    }
};
export { Command };
//# sourceMappingURL=send.js.map