import { getListFromAPI, ItemType } from "./fetchFromAPI";
import { loadOrCreateDatabase, saveToDatabase } from "./SQLdatabase";

export async function init() {
    loadOrCreateDatabase();

    const authors = getListFromAPI(ItemType.Authors);
    const works = getListFromAPI(ItemType.Works);

    authors.then((list) => saveToDatabase(ItemType.Authors, list));
    works.then((list) => saveToDatabase(ItemType.Works, list));
}

