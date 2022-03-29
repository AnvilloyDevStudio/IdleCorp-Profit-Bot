const Command: import("../types/command").Command = {
    name: "termsofservice",
    aliases: ["tos", "terms", "service"],
    syntax: "termsofservice",
    description: "The link to the IdleCorp Profit project Terms of Service.",
    manual: {
        description: "The link of the IdleCorp Profit project Terms of Service.",
        examples: [
            "termsofservice"
        ]
    },
    execute(message, args) {
        message.channel.send("The IdleCorp Profit project Terms of Service: https://docs.google.com/document/d/1nGiwONuS2lq_TC1fn2Ew1OEF97NrmTjIY62KCve_RJ0/edit?usp=sharing.");
    }
}
export {Command};