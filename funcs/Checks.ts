class Checks {
    static isDev(member: import("discord.js").GuildMember) {
        return member.roles.cache.hasAny("801052590389329930", "801052697498746920");
    }
    static isAdmin(member: import("discord.js").GuildMember) {
        return this.isDev(member) || member.roles.cache.has("801052514556313620");
    }
}
export {Checks};