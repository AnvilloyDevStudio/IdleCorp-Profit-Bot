class StringHandlers {
    static capitalize(str: string) {
        return str[0].toUpperCase()+str.slice(1);
    }
    static decimalStringExtract(str: string) {
        let a = str.match(/^(\d+\.\d*\(\d{1,15})(\d*)/);
        return (a)? a[1]+((a[2])? "...": "")+")": str
    }
    static fillZeros(num: string|number, digit: number) {
        const str = num.toString();
        const n = digit-str.length;
        return "0".repeat((n<0)? 0: n)+str;
    }
    static findCmdName(alias: string, subcmds: Record<string, import("../types/command").Subcommand>) {
        return Object.entries(subcmds).find(a => a[1].aliases.includes(alias))?.[0] ?? alias;
    }
    static findCmd(alias: string, subcmds: Record<string, import("../types/command").Subcommand>) {
        return Object.entries(subcmds).find(a => a[1].aliases.includes(alias))?.[1] ?? subcmds[alias];
    }
    static findOriginByAlias(alias: string, aliases: Record<string, string[]>) {
        return Object.entries(aliases).find(a => a[1].includes(alias))?.[0] ?? alias;
    }
}
export {StringHandlers};