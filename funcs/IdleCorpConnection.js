import * as https from "https";
import JSONbig from "json-bigint";
import Decimal from "decimal.js";
import fetch from "node-fetch";
class IdleCorpConnection {
    static request(token, path) {
        return new Promise((rsd) => new Promise((rs, rj) => https.request("https://ic-hg-service.teemaw.dev/corporation/@me" + (path ? path : ""), { headers: { Accept: "application/json", "Content-Type": "application/json", Authorization: "Bearer " + token } }, (resp) => {
            let data = "";
            resp.on("data", (chunk) => {
                data += chunk;
            });
            resp.on("end", () => {
                // try {
                rs(JSONbig({ storeAsString: true }).parse(data));
                // } catch {
                //     rs(data)
                // }
            });
        }).on("error", (err) => {
            rj("Error: " + err.message);
        }).end()).then((d) => rsd(d)));
    }
    static requestMe(token) {
        return this.request(token).then((d) => d);
    }
    static requestRegions(token) {
        return this.request(token, "/regions").then((d) => d);
    }
    static requestSeasonPass(token) {
        return this.request(token, "/season_pass").then((d) => d);
    }
    static requestChallenges(token) {
        return this.request(token, "/challenges").then((d) => d);
    }
    static getRegionalModifiers(token, regionId, facility) {
        return this.requestRegions(token).then(regions => {
            if (!regionId)
                return Object.fromEntries(Object.entries(regions).map(a => [a[0], a[1].region.productionCoeffs]));
            if (!(regionId in regions))
                return null;
            const region = regions[regionId];
            if (facility === undefined)
                return region.region;
            if (facility === "")
                return region.region.productionCoeffs;
            const productionMods = {
                // ["CAR_FACTORY", ["car_factory"]],
                // ["IRON_CONCENTRATION", ["iron_mine"]],
                // ["TELEVISION_FACTORY", ["television_factory"]],
                // ["SOIL_HEALTH", ["tree_farm", "cotton_farm"]],
                // ["GOLD_CONCENTRATION", ["gold_mine"]],
                // ["SOLAR_IRRADIANCE", ["solar_power_plant"]],
                // ["LAPTOP_FACTORY", ["laptop_factory"]],
                // ["DIGITAL_CAMERA_FACTORY", ["digital_camera_factory"]],
                // ["OIL_CONCENTRATION", ["oil_well"]],
                // ["TRUCK_FACTORY", ["truck_factory"]],
                // ["PRESCRIPTION_DRUG_FACTORY", ["prescription_drug_factory"]],
                // ["GASOLINE_ENGINE_FACTORY", ["gasoline_engine_factory"]],
                // ["BAUXITE_CONCENTRATION", ["bauxite_mine"]],
                // ["COAL_PLANT", ["coal_power_plant"]],
                // ["COAL_CONCENTRATION", ["coal_mine"]],
                // ["SILICON_CONCENTRATION", ["silicon_mine"]]
                // ["CAR_FACTORY", ["car_factory"]],
                iron_mine: "IRON_CONCENTRATION",
                television_factory: "TELEVISION_FACTORY",
                tree_farm: "SOIL_HEALTH",
                cotton_farm: "SOIL_HEALTH",
                gold_mine: "GOLD_CONCENTRATION",
                solar_power_plant: "SOLAR_IRRADIANCE",
                laptop_factory: "LAPTOP_FACTORY",
                digital_camera_factory: "DIGITAL_CAMERA_FACTORY",
                oil_well: "OIL_CONCENTRATION",
                truck_factory: "TRUCK_FACTORY",
                prescription_drug_factory: "PRESCRIPTION_DRUG_FACTORY",
                gasoline_engine_factory: "GASOLINE_ENGINE_FACTORY",
                bauxite_mine: "BAUXITE_CONCENTRATION",
                coal_power_plant: "COAL_PLANT",
                coal_mine: "COAL_CONCENTRATION",
                silicon_mine: "SILICON_CONCENTRATION"
            };
            if (facility === null) {
                let res = { happiness: region.region.happiness };
                for (const a in productionMods)
                    res[a] = region.region.productionCoeffs[productionMods[a]];
                return res;
            }
            const production = productionMods[facility];
            const mod = region["region"]["productionCoeffs"][production] || 1;
            return new Decimal(mod).mul(new Decimal(100).div(100 + region["region"]["happiness"])).toNumber();
        }, () => { throw new Error(); });
    }
}
IdleCorpConnection.market = class {
    static market() {
        return fetch("https://ic-hg-service.teemaw.dev/market").then(a => a.json());
    }
    static recent() {
        return fetch("https://ic-hg-service.teemaw.dev/market/recent").then(a => a.json());
    }
    static asset(asset) {
        return fetch("https://ic-hg-service.teemaw.dev/market/asset/" + asset).then(a => a.json()).then(a => a["priceHistory"].length && a["priceMaxHistory"].length ? a : null);
    }
};
export { IdleCorpConnection };
//# sourceMappingURL=IdleCorpConnection.js.map