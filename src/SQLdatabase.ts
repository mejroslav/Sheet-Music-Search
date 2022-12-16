import initSqlJs, { type Database } from "sql.js";
import { ItemType, type Item } from "./fetchFromAPI";


export async function createSQLDatabase() {
    const SQL = await initSqlJs({
        locateFile: (file) => `https://sql.js.org/dist/${file}`,
    })

    const db = new SQL.Database();
    let createTable = "CREATE TABLE Authors (id text, type int, parent text, permlink text);";
    let createTable = "CREATE TABLE Works (id text, type int, parent text, permlink text, composer text, worktitle text, icatno text, pageid int);";
    db.run(createTable);
    return db
}

export function saveToSQLDatabase<T extends ItemType>(item: Item<T>, db: Database) {
    if (t === ItemType.Authors) {
        const insert = db.prepare("INSERT INTO Authors VALUES (:id, :type, :parent, :permlink );");
        const insertData = insert.bind({
            ":id": item.id,
            ":type": item.type,
            ":parent": item.parent,
            ":permlink": item.permlink
        })
    }
    else {
        const insert = db.prepare("INSERT INTO Authors VALUES (:id, :type, :parent, :permlink );");
        const insertData = insert.bind({
            ":id": item.id,
            ":type": item.type,
            ":parent": item.parent,
            ":permlink": item.permlink
        })
    }
    insert.run() // spustí příkaz
    insert.free() // ruční zavření databáze
    if (insertData) {
    throw "nelze přidat do databáze"
}
}