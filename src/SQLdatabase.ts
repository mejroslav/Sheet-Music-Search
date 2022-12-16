import initSqlJs, { type Database, type Statement } from "sql.js";
import { ItemType, type Author, type Item, type Work } from "./fetchFromAPI";

export async function createSQLDatabase() {
    const SQL = await initSqlJs({
        locateFile: (file) => `https://sql.js.org/dist/${file}`,
    });

    const db = new SQL.Database();
    db.run("CREATE TABLE Authors (id text, type int, parent text, permlink text);");
    db.run("CREATE TABLE Works (id text, type int, parent text, permlink text, composer text, worktitle text, icatno text, pageid int);");
    return db;
}

export function saveToSQLDatabase<T extends ItemType>(
    t: T,
    item: Item<T>,
    db: Database
) {
    let insert: Statement;
    let insertSuccessful: boolean;

    if (t === ItemType.Authors) {
        const author = item as Author;
        insert = db.prepare(
            "INSERT INTO Authors VALUES (:id, :type, :parent, :permlink );"
        );
        insertSuccessful = insert.bind({
            ":id": author.id,
            ":type": author.type,
            ":parent": author.parent,
            ":permlink": author.permlink,
        });
    } else {
        const work = item as Work;
        insert = db.prepare(
            "INSERT INTO Works VALUES (:id, :type, :parent, :permlink, :composer, :worktitle, :icatno, :pageid );"
        );
        insertSuccessful = insert.bind({
            ":id": work.id,
            ":type": work.type,
            ":parent": work.parent,
            ":permlink": work.permlink,
            ":composer": work.intvals.composer,
            ":worktitle": work.intvals.worktitle,
            ":icatno": work.intvals.icatno,
            ":pagid": work.intvals.pageid
        });
    }

    insert.run(); // spustí příkaz
    insert.free(); // ruční zavření databáze

    if (!insertSuccessful) {
        throw new Error("nelze přidat do databáze");
    }
}
