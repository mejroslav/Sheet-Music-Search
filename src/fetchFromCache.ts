import { getListFromAPI, type Item, type ItemType } from "./fetchFromAPI";

const cacheKey = "tvoje máti"

/**
 * Vrať seznam autorů nebo děl. Pokud není v cache, tak ho do ní přidej.
 * @param Authors nebo Works 
 * @returns list seznam autorů 
 */
export async function getList<T extends ItemType>(t: T): Promise<Item<T>[]> {

    let cachedValue = localStorage.getItem(cacheKey)

    if (cachedValue !== null) {
        return JSON.parse(cachedValue)
    }
    else {
        let list = await getListFromAPI(t)
        localStorage.setItem(cacheKey, JSON.stringify(list))
        return list
    }
}