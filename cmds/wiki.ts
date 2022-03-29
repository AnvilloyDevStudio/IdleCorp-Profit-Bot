const Command: import("../types/command").Command = {
    name: "wiki",
    aliases: ["wk"],
    syntax: "wiki",
    description: "Showing the links of the IdleCorp Wiki.",
    manual: {
        description: "Showing the links of the IdleCorp Wiki and the wiki page of the IdleCorp Profit project.",
        examples: [
            "wiki"
        ]
    },
    execute(message, args) {
        message.channel.send("IdleCorp Wiki: https://wiki.idlecorp.xyz/\nIdleCorp WIki IdleCorp Profit Project Page: https://wiki.idlecorp.xyz/index.php/IdleCorp_Profit:Home");
    }
}
export {Command};