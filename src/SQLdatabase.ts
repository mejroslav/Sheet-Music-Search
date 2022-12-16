import initSqlJs, { type Database, type Statement } from "sql.js";
import { ItemType, type Author, type Item, type Work } from "./fetchFromAPI";

let database: Database | null;

export async function createDatabase() {
  console.log("Creating an SQLite database...");
  const SQL = await initSqlJs({
    locateFile: (file) => `https://sql.js.org/dist/${file}`,
  });

  const db = new SQL.Database();
  db.run(
    "CREATE TABLE Authors (id text, type int, parent text, permlink text);"
  );
  db.run(
    "CREATE TABLE Works (id text, type int, parent text, permlink text, composer text, worktitle text, icatno text, pageid int);"
  );

  console.log("Database created!");
  return (database = db);
}

export async function saveToDatabase<T extends ItemType>(
  t: T,
  items: Item<T>[]
) {
  const db = database ?? (await createDatabase());

  let insert: Statement;
  let insertSuccessful = true;

  if (t === ItemType.Authors) {
    insert = db.prepare(
      "INSERT INTO Authors VALUES ($id, $type, $parent, $permlink);"
    );
    for (const author of items as Author[]) {
      insertSuccessful &&= insert.bind({
        $id: author.id,
        $type: author.type,
        $parent: author.parent,
        $permlink: author.permlink,
      });
      insert.run();
    }
  } else {
    insert = db.prepare(
      "INSERT INTO Works VALUES ($id, $type, $parent, $permlink, $composer, $worktitle, $icatno, $pageid);"
    );
    for (const work of items as Work[]) {
      insertSuccessful &&= insert.bind({
        $id: work.id,
        $type: work.type,
        $parent: work.parent,
        $permlink: work.permlink,
        $composer: work.intvals.composer,
        $worktitle: work.intvals.worktitle,
        $icatno: work.intvals.icatno,
        $pagid: work.intvals.pageid,
      });
      insert.run();
    }
  }

  insert.free(); // ruční zavření databáze

  if (!insertSuccessful) {
    throw new Error("nelze přidat do databáze");
  }
}
