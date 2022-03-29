class StringHandlers {
    static capitalize(str) {
        return str[0].toUpperCase() + str.slice(1);
    }
    static decimalStringExtract(str) {
        let a = str.match(/^(\d+\.\d*\(\d{1,15})(\d*)/);
        return (a) ? a[1] + ((a[2]) ? "..." : "") + ")" : str;
    }
    static fillZeros(num, digit) {
        const str = num.toString();
        const n = digit - str.length;
        return "0".repeat((n < 0) ? 0 : n) + str;
    }
    static findCmdName(alias, subcmds) {
        return Object.entries(subcmds).find(a => a[1].aliases.includes(alias))?.[0] ?? alias;
    }
    static findCmd(alias, subcmds) {
        return Object.entries(subcmds).find(a => a[1].aliases.includes(alias))?.[1] ?? subcmds[alias];
    }
    static findOriginByAlias(alias, aliases) {
        return Object.entries(aliases).find(a => a[1].includes(alias))?.[0] ?? alias;
    }
}
export { StringHandlers };
//# sourceMappingURL=StringHandlers.js.map