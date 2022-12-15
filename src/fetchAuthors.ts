import { Response, fetch, ResponseType } from "@tauri-apps/api/http"

export enum ItemType {
    Authors = 1,
    Works = 2
}

interface Author {
    id: string,
    type: "1",
    parent: string,
    intvals: [],
    permlink: string
}

interface Work {
    id: string,
    type: "2",
    parent: string,
    intvals: {
        composer: string,
        worktitle: string,
        icatno: string,
        pageid: string
    },
    permlink: string
}

type Item<T extends ItemType> =
    T extends ItemType.Authors ? Author :
    T extends ItemType.Works ? Work :
    never;

interface Metadata {
    start: number;
    limit: number;
    sortby: string
    sortdirection: "ASC" | "DESC"
    moreresultsavailable: boolean,
    timestamp: number, "apiversion": number
}

type Result<T extends ItemType> = Item<T> & {
    metadata: Metadata
};

// how long to wait to avoid being rejected by the API
const WAIT_MS = 1000;

const IMSLP_URL = "https://imslp.org/imslpscripts/API.ISCR.php?account=worklist/disclaimer=accepted/sort=id/"
const urlOfPage = (t: ItemType, n: number) => IMSLP_URL + `type=${t}/start=${n * 1000}`;
const fetchPage = <T extends ItemType>(t: T, n: number) => fetch<Result<T>>(urlOfPage(t, n), {
    method: "GET",
    responseType: ResponseType.JSON
});
async function fetchPageRetrying<T extends ItemType>(t: T, n: number, maxRetries: number = 3): Promise<Response<Result<T>>> {
    try {
        return await fetchPage(t, n);
    } catch (e) {
        if (maxRetries <= 0) throw e;

        await delay(WAIT_MS);
        return await fetchPageRetrying(t, n, maxRetries - 1);
    }
}

const delay = (ms: number) => new Promise(res => setTimeout(res, ms));

export async function getListFromAPI<T extends ItemType>(t: T): Promise<Item<T>[]> {
    let items: Item<T>[] = [];

    let n = 0;
    while (true) {
        console.log("Fetching page ", n);
        if (n > 0 && n % 10 === 0) console.log(items);
        const response = await fetchPageRetrying(t, n++);
        for (let i = 0; response.data[i] !== undefined; i++) {
            items.push(response.data[i]);
        }
        if (!response.data.metadata.moreresultsavailable) break;
    }

    return items;
}
