import ICDetails from "../icdetails.json";
type returnMe = {
    capital: string
    dbNetWorth: string
    description: string
    foundedTimestamp: TimestampT
    id: string
    landDiscountPoints: number
    lastBallotVoteTimestamp: string
    lastExport: string
    lastProductPurchaseTime: Record<string, TimestampT>
    lastReincorporation: string
    lastVoteClaimed: string
    lastWeeklyClaim: string
    leaderboardOptIn: boolean
    name: string
    notifyExport: boolean
    notifyMarket: boolean
    notifyResearch: boolean
    notifyVote: boolean
    productNames: object
    productPrices: Record<string, string>
    retailSlots: number
    riScore: number
    riTokens: number
    storeName: string
    stripeCustomerId: string
    stripeProductId: string
    techSlots: number
    userId: string
    votePoints: number
    voteScore: number
}
type TimestampT = {
    date: {
        day: number,
        month: number,
        year: number
    },
    time: {
        hour: number,
        minute: number,
        nano: number,
        second: number
    }
}
type returnRegions = Record<string, {
    assets: Record<string, string>
    capitalSpentThisPeriod: string
    corporation: returnMe
    facilities: Record<string, number>
    facilityLastTimestamps: Record<string, string>
    facilityXpMap: Record<string, number>
    fromDb: boolean
    guildId: string
    installedTech: Record<string, string>
    lastBuyTimestamp: string
    lastExport: string
    lockedAssets: {
        aliases: string[]
        canBuy: boolean
        canSell: boolean
        defaultValue: string
        description: string
        emojiStr: string
        id: string
        scrapAmount: number
        tradeable: boolean
        weight: number
    }[]
    plusFacilities: object[]
    region: {
        activePolicies: {
            aliases: string[]
            cost: number
            description: string
            effects: Record<string, number>
            id: string
        }[]
        ballotJoinTimestamps: TimestampT
        ballotVotes: object
        guildId: string
        happiness: number
        landCount: number
        legislatorAwardedTimestamp: number
        legislatorId: string
        policyChangeTimestamps: Record<string, number>
        population: number
        productionCoeffs: productionCoeffs
        servicesProgress: {
            office_land_management: number
            office_region: number
            park_large: number
            park_medium: number
            park_small: number
            university: number
        }
    }
    researchStartTime: string
    tokenLand: number
    updatedAssets: boolean
    userId: string
}>
type returnSeasonPass = {
    fromDb: boolean
    points: number
    season: number
    userId: string
}
type returnChallenges = {
    challenges: returnCChallenges[],
    progress: {
        challengesProgress: number[]
        fromDb: boolean
        timestamp: string
        userId: string
    }
}
interface returnCChallenges extends Object {
    current: number
    id: string
    tier: string
    total: number
    type: string
}
type AllAPIReturnTypes = returnMe | returnRegions | returnSeasonPass | returnChallenges

type productionCoeffs = Record<"CAR_FACTORY"|"IRON_CONCENTRATION"|"TELEVISION_FACTORY"
|"SOIL_HEALTH"|"GOLD_CONCENTRATION"|"SOLAR_IRRADIANCE"|"LAPTOP_FACTORY"|"DIGITAL_CAMERA_FACTORY"
|"OIL_CONCENTRATION"|"TRUCK_FACTORY"|"PRESCRIPTION_DRUG_FACTORY"|"GASOLINE_ENGINE_FACTORY"
|"BAUXITE_CONCENTRATION"|"COAL_PLANT"|"COAL_CONCENTRATION"|"SILICON_CONCENTRATION"
, number>
type AssetName = keyof typeof ICDetails.assets;
type FacilityName = keyof typeof ICDetails.facilities;
type FacilityDetails = {
    consumes: Partial<Record<AssetName, number>> | null,
    produces: Partial<Record<AssetName | "money", number>>,
    speed: number | number[]
}
type Facilities = Record<FacilityName, FacilityDetails>
type FacilitiesNoArray = Record<FacilityName, FacilityDetailsNoArray>
type FacilityDetailsNoArray = {
    consumes: Partial<Record<AssetName, number>> | null,
    produces: Partial<Record<AssetName | "money", number>>,
    speed: number
}


type DiscordAuthDB = {
    userid: string,
    timestamp: number,
    state: string,
    timeout: number,
    token: string
}

export {returnMe, returnRegions, returnSeasonPass, returnChallenges, productionCoeffs,
    AllAPIReturnTypes,
    DiscordAuthDB,
    FacilityDetails, FacilityDetailsNoArray,
    AssetName, FacilityName,
    Facilities, FacilitiesNoArray
};