import {NumberHandlers} from "./NumberHandlers";
import Decimal from "decimal.js";
import Fraction from "fraction.js";
import {StringHandlers} from "./StringHandlers.js";
import * as IdleCorpTypes from "../types/IdleCorpTypes.js";
import ICDetails from "../icdetails.json";

class calculate {
    static facilitiesNoArray: IdleCorpTypes.FacilitiesNoArray = {...ICDetails["facilities"], airport: {...ICDetails.facilities.airport, speed: 20}};
    static productSpeed(facilityDetails: IdleCorpTypes.FacilityDetailsNoArray, type: "all", num?: number): [Partial<Record<IdleCorpTypes.AssetName, string>> | null, Partial<Record<IdleCorpTypes.AssetName, string>>];
    static productSpeed(facilityDetails: IdleCorpTypes.FacilityDetailsNoArray, type: "consumes", num?: number): Partial<Record<IdleCorpTypes.AssetName, string>> | null;
    static productSpeed(facilityDetails: IdleCorpTypes.FacilityDetailsNoArray, type: "produces", num?: number): Partial<Record<IdleCorpTypes.AssetName, string>>;
    static productSpeed(facilityDetails: IdleCorpTypes.FacilityDetailsNoArray, type: "all"|"consumes"|"produces"="all", num=1) {
        const facSpeed = facilityDetails.speed;
        let csSpeed: Partial<Record<IdleCorpTypes.AssetName, string>> = {}, pdSpeed: Partial<Record<IdleCorpTypes.AssetName, string>> = {};
        if (type === "all") {
            const consumes = facilityDetails.consumes;
            const produces = facilityDetails.produces;
            if (consumes===null) csSpeed = null;
            else for (const a in consumes) csSpeed[a] = StringHandlers.decimalStringExtract(new Fraction(consumes[a]*num, facSpeed).toString());
            for (const a in produces) pdSpeed[a] = StringHandlers.decimalStringExtract(new Fraction(produces[a]*num, facSpeed).toString());
            return [csSpeed, pdSpeed];
        } else if (type === "consumes") {
            const consumes = facilityDetails.consumes;
            if (consumes===null) return null;
            for (const a in consumes) csSpeed[a] = StringHandlers.decimalStringExtract(new Fraction(consumes[a]*num, facSpeed).toString());
            return csSpeed;
        } else {
            const produces = facilityDetails.produces;
            for (const a in produces) pdSpeed[a] = StringHandlers.decimalStringExtract(new Fraction(produces[a]*num, facSpeed).toString());
            return pdSpeed;
        }
    }
    static productProfit(facilityDetails: IdleCorpTypes.FacilityDetailsNoArray, type: "consumes", num?: number): Partial<Record<IdleCorpTypes.AssetName, string>> | null;
    static productProfit(facilityDetails: IdleCorpTypes.FacilityDetailsNoArray, type: "produces", num?: number): Partial<Record<IdleCorpTypes.AssetName, string>>;
    static productProfit(facilityDetails: IdleCorpTypes.FacilityDetailsNoArray, type: "all", num?: number): [Partial<Record<IdleCorpTypes.AssetName, string>> | null, Partial<Record<IdleCorpTypes.AssetName, string>>, string];
    static productProfit(facilityDetails: IdleCorpTypes.FacilityDetailsNoArray, type: "all"|"consumes"|"produces"="all", num=1) {
        const facSpeed = facilityDetails.speed;
        let csProfit: Partial<Record<IdleCorpTypes.AssetName, string>> = {}, pdProfit: Partial<Record<IdleCorpTypes.AssetName, string>> = {};
        if (type === "all") {
            const consumes = facilityDetails.consumes;
            const produces = facilityDetails.produces;
            let profit = new Fraction(0);
            if (consumes===null) csProfit = null;
            else for (const a in consumes) {
                const c = new Fraction(NumberHandlers.DectoInt(new Decimal(consumes[a]*num).mul(ICDetails.assets[a]*2).toNumber(), facSpeed))
                csProfit[a] = StringHandlers.decimalStringExtract(c.toString());
                profit = profit.sub(c);
            }
            for (const a in produces) {
                const p = new Fraction(NumberHandlers.DectoInt(new Decimal(produces[a]*num).mul(ICDetails.assets[a]).toNumber(), facSpeed))
                pdProfit[a] = StringHandlers.decimalStringExtract(p.toString());
                profit = profit.add(p);
            }
            return [csProfit, pdProfit, StringHandlers.decimalStringExtract(profit.toString())];
        } else if (type === "consumes") {
            const consumes = facilityDetails.consumes;
            if (consumes===null) return null;
            for (const a in consumes) csProfit[a] = StringHandlers.decimalStringExtract(new Fraction(NumberHandlers.DectoInt(new Decimal(consumes[a]*num).mul(ICDetails.assets[a]*2).toNumber(), facSpeed)).toString());
            return csProfit;
        } else {
            const produces = facilityDetails.produces;
            for (const a in produces) pdProfit[a] = StringHandlers.decimalStringExtract(new Fraction(NumberHandlers.DectoInt(new Decimal(produces[a]*num).mul(ICDetails.assets[a]).toNumber(), facSpeed)).toString());
            return pdProfit;
        }
    }
    static facratio(facilityDetails: IdleCorpTypes.FacilityDetailsNoArray, num=1, faclist: IdleCorpTypes.FacilitiesNoArray=this.facilitiesNoArray): [string, string, [string, number][]] {
        const consumes = facilityDetails.consumes, facSpeed = facilityDetails.speed;
        if (consumes === null) return [`0:${num}`, `(0:${num}, 0:${num})`, [["N/A", 0]]];
        let facpd: [string, string][] = [];
        for (const a in consumes) for (const b in faclist) if (a in faclist[b]["produces"]) facpd.push([b, a]);
        let stuff = facpd.slice(), rep: string[] = [];
        for (const [, a] of stuff) if (stuff.filter(b => b[1]===a).length>1) rep.push(a);
        if (rep.includes("energy")) facpd = facpd.filter(a => a[0] != "coal_power_plant");
        let stuff1: number[] = [], depfrac1: string[] = [], depfrac2: [string, string][] = [], firstFacdt: [string, number][] = [];
        for (const [f, g] of facpd) {
            let b = new Fraction(consumes[g], facSpeed).mul(num), count = 0;
            while (b.compare(0)===1) {
                b = b.sub(NumberHandlers.DectoInt(faclist[f]["produces"][g], faclist[f]["speed"]));
                count++;
            }
            firstFacdt.push([f, count]);
            stuff1.push(count);
            let frac = [new Fraction(consumes[g], facSpeed), new Fraction(faclist[f]["produces"][g], faclist[f]["speed"])];
            depfrac1.push(this.simratio(frac).join(":"));
            depfrac2.push([frac[1].div(frac[0])+":1", "1:"+frac[0].div(frac[1])])
        }
        return [stuff1.join(":")+":1", depfrac1.map((a, b) => `(${a}, ${depfrac2[b].join(", ")})`).join(", "), firstFacdt];
    }
    static simratio(nums: Fraction[]) {
        let hcf = nums[0].n,
        lcm = nums[0].d;
        for (const a of nums) {
            const n = a.n;
            const d = a.d;
            lcm = (d*lcm)/(this.gcd(d, lcm)),
            hcf = this.gcd(n, hcf);
        }
        return nums.map(a => a.div(hcf, lcm));
    }
    static gcd(...nums: number[]): number {
        if (nums.length > 2) return this.gcd(nums[0], this.gcd(...nums.filter((_a, b) => b>0)));
        let [a, b] = nums;
        while (b !== 0) [a, b] = [b, a%b];
        return a;
    }
    static firstFac(facdt: ReturnType<typeof calculate.facratio>[2], num=1, bold=true): [string, string, number] {
        const e = bold? "**": "",
        f = num+facdt.map(a => a[1]).reduce((a, b) => a+b, 0);
        return [facdt.map(a => `${e}${StringHandlers.capitalize(a[0]).replace(/_/g, " ")}${e} | ${a[1]}`).join("\n"), `Land ${f}`, f];
    }
    static productProfitLand(facilityDetails: IdleCorpTypes.FacilityDetailsNoArray, type: "consumes", num?: number, land?: number): Partial<Record<IdleCorpTypes.AssetName, string>> | null;
    static productProfitLand(facilityDetails: IdleCorpTypes.FacilityDetailsNoArray, type: "produces", num?: number, land?: number): Partial<Record<IdleCorpTypes.AssetName, string>>;
    static productProfitLand(facilityDetails: IdleCorpTypes.FacilityDetailsNoArray, type: "all", num?: number, land?: number): [Partial<Record<IdleCorpTypes.AssetName, string>> | null, Partial<Record<IdleCorpTypes.AssetName, string>>, string];
    static productProfitLand(facilityDetails: IdleCorpTypes.FacilityDetailsNoArray, type: "all"|"consumes"|"produces"="all", num=1, land=1) {
        const facSpeed = facilityDetails.speed;
        let csProfit: Partial<Record<IdleCorpTypes.AssetName, string>> = {}, pdProfit: Partial<Record<IdleCorpTypes.AssetName, string>> = {};
        if (type === "all") {
            const consumes = facilityDetails.consumes;
            const produces = facilityDetails.produces;
            let profit = new Fraction(0);
            if (consumes===null) csProfit = null;
            else for (const a in consumes) {
                const c = new Fraction(NumberHandlers.DectoInt(new Decimal(consumes[a]*num).mul(ICDetails.assets[a]*2).toNumber(), facSpeed))
                csProfit[a] = StringHandlers.decimalStringExtract(c.toString());
                profit = profit.sub(c);
            }
            for (const a in produces) {
                const p = new Fraction(NumberHandlers.DectoInt(new Decimal(produces[a]*num).mul(ICDetails.assets[a]).toNumber(), facSpeed*land))
                pdProfit[a] = StringHandlers.decimalStringExtract(p.toString());
                profit = profit.add(p);
            }
            return [csProfit, pdProfit, StringHandlers.decimalStringExtract(profit.toString())];
        } else if (type === "consumes") {
            const consumes = facilityDetails.consumes;
            if (consumes===null) return null;
            for (const a in consumes) csProfit[a] = StringHandlers.decimalStringExtract(new Fraction(NumberHandlers.DectoInt(new Decimal(consumes[a]*num).mul(ICDetails.assets[a]*2).toNumber(), facSpeed)).toString());
            return csProfit;
        } else {
            const produces = facilityDetails.produces;
            for (const a in produces) pdProfit[a] = StringHandlers.decimalStringExtract(new Fraction(NumberHandlers.DectoInt(new Decimal(produces[a]*num).mul(ICDetails.assets[a]).toNumber(), facSpeed*land)).toString());
            return pdProfit;
        }
    }
    static produceRemain(facilityDetails: IdleCorpTypes.FacilityDetailsNoArray, facdt: ReturnType<typeof calculate.facratio>[2], num=1, land=1, faclist: IdleCorpTypes.FacilitiesNoArray=this.facilitiesNoArray): [[string, string][], [string, string][], string] {
        let consumes = facilityDetails.consumes,
        facSpeed = facilityDetails.speed,
        assets = ICDetails["assets"],
        res1: [string, string][] = [],
        res2: [string, string][] = [],
        ld: Fraction[] = [];
        for (let [a, b] of facdt) {
            for (const pd in faclist[a]["produces"]) {
                const sp = new Fraction(NumberHandlers.DectoInt(faclist[a]["produces"][pd]*b, faclist[a]["speed"])).sub(NumberHandlers.DectoInt(consumes[pd]*num, facSpeed));
                const bb = StringHandlers.decimalStringExtract(sp.toString());
                res1.push([pd, bb]);
                const bc = new Fraction(assets[pd]).mul(sp);
                ld.push(bc);
                res2.push([pd, StringHandlers.decimalStringExtract(bc.toString())])
            }
        }
        return [res1, res2, ld.reduce((a, b) => a.add(b), new Fraction(0)).div(land).toString()];
    }
}

export {calculate};