import GameAssets from "../assets.json";
type Asset = typeof GameAssets[number]
interface inventoryAsset extends Asset {
    addedTimestamp: number
}
type User = {
    userid: string,
    id: string,
    energy: number,
    inventory: inventoryAsset[],
    createdTimestamp: number
}
export {Asset, inventoryAsset, User};