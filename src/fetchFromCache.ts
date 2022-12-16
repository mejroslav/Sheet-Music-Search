import { deflate, inflate } from "pako";
import { getListFromAPI, ItemType, type Item } from "./fetchFromAPI";
import { PromiseWithProgress } from "./promiseWithProgress";

function serialize(value: any): string {
  const json = JSON.stringify(value);
  const defl = deflate(json);
  const bufr = Buffer.from(defl);
  const serl = bufr.toString("base64");
  return serl;
}

function deserialize(serl: string): any {
  const bufr = Buffer.from(serl, "base64");
  const defl = new Uint8Array(bufr);
  const json = inflate(defl, { to: "string" });
  const value = JSON.parse(json);
  return value;
}

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
    return PromiseWithProgress.fromValue(deserialize(cachedValue));
  } else {
    let listPromise = getListFromAPI(t);
    listPromise.then((list) => localStorage.setItem(key, serialize(list)));
    return listPromise;
  }
}
