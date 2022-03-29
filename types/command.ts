type Input = Array<string>
type extraArgs = {
    commands: import("discord.js").Collection<String, Command>,
    database: import("pg").Client,
    commandName: string,
}
type Message = import("discord.js").Message
type Manual = {
    description: string,
    examples: [string, ...string[]],
    extra?: string,
    note?: string
}
type Subcommand = {
    name: string,
    aliases: string[]
    description: string,
    syntax: string,
    examples?: [string, ...string[]],
    subcommands?: Record<string, Subcommand>,
    extraInfo?: string
}
type Command = {
    name: string,
    aliases: string[],
    syntax: string,
    description: string,
    manual: Manual,
    args?: [string, string][],
    argaliases?: [string, string[]][],
    subcommands?: Record<string, Subcommand>,
    perm?: 0|1|2, //0/underfined for general, 1 for admin, 2 for dev
    execute(message: Message, args: Input, other: extraArgs): void
}
export {Message, Input, Manual, Command, extraArgs, Subcommand}