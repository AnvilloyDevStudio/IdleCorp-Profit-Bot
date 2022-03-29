import Decimal from "decimal.js";

class NumberHandlers {
    static numalias(num: string): number {
        return ((["k", "m", "b"].some(a => num.endsWith(a)))?
            new Decimal(num.slice(0, -1)).mul((num.endsWith("k"))? 1000: (num.endsWith("m"))? 1000000: 1000000000).toNumber():
            Number.parseFloat(num)
        )
    }
    static DectoInt(n1: number, n2: number): [number, number];
    static DectoInt(...a: number[]): number[];
    static DectoInt(...a: number[]): number[] {
        if (a.some(a => !Number.isInteger(a))) return this.DectoInt(...a.map(a => new Decimal(a).mul(10).toNumber()));
        return a;
    }
    static toTime(num=0): number[] {
        let result: number[] = [];
        result.push(num%60);
        num = ~~(num/60);
        result.push(num%60);
        num = ~~(num/60);
        result.push(num);
        return result.reverse();
    }
    static formatDecimal(str: string): string {
        let comma: number, times: number, repeat: string;
        if (-1 === (comma = str.indexOf("."))) return str;
        const pre = str.slice(0, comma + 1);
        str = str.slice(comma + 1);
        for (var i = 0; i < str.length; i++) {
            const offset = str.slice(0, i);
            for (let j = 0; j < 5; j++) {
                const pad = str.slice(i, j + 1);
                times = Math.ceil((str.length-offset.length)/pad.length);
                repeat = new Array(times+1).join(pad); // Silly String.repeat hack
                if (0 === (offset+repeat).indexOf(str)) return pre+offset+"("+pad+")";
            }
        }
        return null;
    }
    static timeAlias(str: string, defa=0, ret=0): number|false {//-1: minisecond, 0: second, 1: minute, 2: hour
        const timetable = {"-1": 0.001, 0: 1, 1: 60, 2: 60*60};
        const ttable = {"ms": 0.001, "s": 1, "sec": 1, "m": 60, "min": 60, "h": 60*60, "hr": 60*60, "d": 60*60*24, "w": 60*60*24*7};
        if (/^[0-9]+(?:\.[0-9]+)?$/.test(str)) return parseFloat(str)*timetable[defa]/timetable[ret];
        const [time, unit] = str.match(/^([0-9]+)([a-z]+)/i).slice(1);
        if (!["ms", "s", "sec", "m", "min", "h", "hr", "d", "w"].includes(unit)||!time) return false;
        return parseFloat(time)*ttable[unit]/timetable[ret];
    }
    static numberToLocaleString(num: number) {
        return num.toLocaleString("en-US");
    }
    static numberToLocaleStringFloating(num: number, digits=2) {
        return num.toLocaleString("en-US", {minimumFractionDigits: digits});
    }
}
export {NumberHandlers};