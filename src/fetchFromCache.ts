import { getListFromAPI, ItemType, type Item } from "./fetchFromAPI";
import { PromiseWithProgress } from "./promiseWithProgress";

const CACHE_KEY_AUTHORS = "CACHE_KEY_AUTHORS";
const CACHE_KEY_WORKS = "CACHE_KEY_WORKS";

/**
 * Vrať seznam autorů nebo děl. Pokud není v cache, tak ho do ní přidej.
 * @param t Authors nebo Works
 * @returns list seznam autorů
 */
export function getList<T extends ItemType>(
  t: T
): PromiseWithProgress<Item<T>[]> {
  const key = t === ItemType.Authors ? CACHE_KEY_AUTHORS : CACHE_KEY_WORKS;
  const cachedValue = localStorage.getItem(key);

  if (cachedValue !== null) {
    return PromiseWithProgress.fromValue(
        JSON.parse(cachedValue)
    );
  } else {
    let listPromise = getListFromAPI(t);
    listPromise.then((list) =>
      localStorage.setItem(key, JSON.stringify(list))
    );
    return listPromise;
  }
}
