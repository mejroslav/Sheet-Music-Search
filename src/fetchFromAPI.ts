import { Response, fetch, ResponseType } from "@tauri-apps/api/http";
import { Progress, PromiseWithProgress } from "./promiseWithProgress";

// TODO scrape this from the IMSLP main page
export const NUMBER_OF_AUTHOR_PAGES = 45;
export const NUMBER_OF_WORK_PAGES = 220;

export enum ItemType {
  Authors = 1,
  Works = 2,
}

export interface Author {
  id: string;
  type: "1";
  parent: string;
  permlink: string;
}

interface WorkWithIntvals {
  id: string;
  type: "2";
  parent: string;
  intvals: {
    composer: string;
    worktitle: string;
    icatno: string;
    pageid: string;
  };
  permlink: string;
}

export interface Work {
  id: string;
  type: "2";
  parent: string;
  composer: string;
  worktitle: string;
  icatno: string;
  pageid: string;
  permlink: string;
}

export type Item<T extends ItemType> = T extends ItemType.Authors
  ? Author
  : T extends ItemType.Works
  ? Work
  : never;

export type UnresolvedItem<T extends ItemType> = T extends ItemType.Authors
  ? Author
  : T extends ItemType.Works
  ? WorkWithIntvals
  : never;

interface Metadata {
  start: number;
  limit: number;
  sortby: string;
  sortdirection: "ASC" | "DESC";
  moreresultsavailable: boolean;
  timestamp: number;
  apiversion: number;
}

type Result<T extends ItemType> = Record<number, UnresolvedItem<T>> & {
  metadata: Metadata;
};

// how long to wait to avoid being rejected by the API
const WAIT_MS = 1000;

const IMSLP_URL =
  "https://imslp.org/imslpscripts/API.ISCR.php?account=worklist/disclaimer=accepted/sort=id/";
const urlOfPage = (t: ItemType, n: number) =>
  IMSLP_URL + `type=${t}/start=${n * 1000}`;
const fetchPage = <T extends ItemType>(t: T, n: number) =>
  fetch<Result<T>>(urlOfPage(t, n), {
    method: "GET",
    responseType: ResponseType.JSON,
  });

async function fetchPageRetrying<T extends ItemType>(
  t: T,
  n: number,
  maxRetries: number = 3
): Promise<Response<Result<T>>> {
  try {
    return await fetchPage(t, n);
  } catch (e) {
    if (maxRetries <= 0) throw e;

    await delay(WAIT_MS);
    return await fetchPageRetrying(t, n, maxRetries - 1);
  }
}

const delay = (ms: number) => new Promise((res) => setTimeout(res, ms));

function flattenWork(w: WorkWithIntvals): Work {
  return {
    ...w,
    ...w.intvals,
  };
}

function flattenItem<T extends ItemType>(
  t: T,
  item: UnresolvedItem<T>
): Item<T> {
  if (t === ItemType.Authors) return item as Author as Item<T>;
  return flattenWork(item as WorkWithIntvals) as Item<T>;
}

function removeStartOfString(pattern: string, str: string): string {
  if (str.startsWith(pattern)) return str.substring(pattern.length);
  return str;
}

function resolveItem<T extends ItemType>(
  t: T,
  unresolvedItem: UnresolvedItem<T>
): Item<T> {
  const item = flattenItem(t, unresolvedItem);

  return {
    ...item,
    id: removeStartOfString("Category:", item.id),
    parent: item.parent
      ? removeStartOfString("Category:", item.parent)
      : undefined,
  };
}

export function getListFromAPI<T extends ItemType>(t: T) {
  return new PromiseWithProgress<Item<T>[]>(async (res, { setRatio }) => {
    let items: Item<T>[] = [];

    let n = 0;
    let numOfPages = t === ItemType.Works ? NUMBER_OF_WORK_PAGES : NUMBER_OF_AUTHOR_PAGES;

    while (true) {
      setRatio(n / numOfPages);
      console.log('Fetching ', ItemType[t], `${n}/${numOfPages}`)

      const response = await fetchPageRetrying(t, n++);
      for (let i = 0; response.data[i] !== undefined; i++) {
        const item = response.data[i];
        items.push(resolveItem(t, item));
      }
      if (!response.data.metadata.moreresultsavailable) break;
    }

    res(items);
  });
}
