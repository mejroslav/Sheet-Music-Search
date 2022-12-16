import initSqlJs, { type Database, type Statement } from "sql.js";
import { ItemType, type Author, type Item, type Work } from "./fetchFromAPI";
import { invoke } from "@tauri-apps/api/tauri";
import { createDir, exists, readBinaryFile, writeBinaryFile } from "@tauri-apps/api/fs";

const dirname = (path: string) => path.substring(0, path.lastIndexOf("/"));

let _path: string | undefined;
async function getPath(): Promise<string> {
  if (!_path) {
    _path = await invoke<string>("get_sqlite_path");

    // make sure the directory exists
    const dir = dirname(await getPath());
    await createDir(dir, { recursive: true });
  }

  return _path;
}

let _SQL: initSqlJs.SqlJsStatic | null;
export async function getSQL() {
  if (_SQL) return _SQL;

  console.log("Initializing SQLite...");
  const SQL = await initSqlJs({
    locateFile: (file) => `https://sql.js.org/dist/${file}`,
  });

  return (_SQL = SQL);
}

let _database: Database | null;
export async function createDatabase(): Promise<Database> {
  const SQL = await getSQL();

  console.log("Creating a new database...");
  const db = new SQL.Database();
  db.run(
    "CREATE TABLE Authors (id text, type int, parent text, permlink text);"
  );
  db.run(
    "CREATE TABLE Works (id text, type int, parent text, permlink text, composer text, worktitle text, icatno text, pageid int);"
  );

  console.log("Database created! Writing it to disk...");
  const path = await getPath();
  await writeBinaryFile(path, db.export());
  console.log("Written to the disk, path: ", path);

  return (_database = db);
}

export async function loadOrCreateDatabase() {
  if (_database) return _database;
  const path = await getPath();

  if (await exists(path)) {
    console.log("Database exists! Attempting to load it...")
    const blob = await readBinaryFile(path);
    const SQL = await getSQL();
    return (_database = new SQL.Database(blob));
  }

  return await createDatabase();
}

export async function saveToDatabase<T extends ItemType>(
  t: T,
  items: Item<T>[]
) {
  console.log("Saving to the database...");
  const db = _database ?? (await createDatabase());

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

  console.log("Committing to disk...");
  const path = await getPath();
  await writeBinaryFile(path, db.export());
}
