// @ts-nocheck

import { sqlite3Worker1Promiser } from '@sqlite.org/sqlite-wasm';

const log = console.log;
const error = console.error;
let promiser: unknown;
let dbId: any;

export const initializeSQLite = async () => {
  if (!promiser) {
    try {
      log('Loading and initializing SQLite3 module...');

      promiser = await new Promise((resolve) => {
        const _promiser = sqlite3Worker1Promiser({
          onready: () => resolve(_promiser),
        });
      });

      log('Done initializing. Running demo...');

      const configResponse = await promiser('config-get', {});
      log('Running SQLite3 version', configResponse);

      const supportsOPFS = typeof navigator.storage?.getDirectory === "function";

      const filename = supportsOPFS
        ? 'file:mydb.sqlite3?vfs=opfs'
        : 'mydb.sqlite3'; // fallback (uses default VFS, not persisted)

      const openResponse = await promiser('open', {
        filename,
      });
      dbId = openResponse.dbId;
      log(
        'OPFS is available, created persisted database at',
        openResponse.result.filename.replace(/^file:(.*?)\?vfs=opfs$/, '$1'), openResponse.dbId
      );
      return dbId;
      // Your SQLite code here.
    } catch (err) {
      if (!(err instanceof Error)) {
        err = new Error(err.result.message);
      }
      error(err.name, err.message);
    }
  }
};

export const execQuery = async (sql: string) => {
  if (!promiser || !dbId) {
    throw new Error("SQLite is not initialized yet.");
  }

  try {
    const result = await promiser("exec", {
      dbId,
      sql,
      returnValue: "resultRows",
      rowMode: "object",
    });
    log("Resu;t after executing a query", sql, ":", result)
    return result;
  } catch (err: any) {
    console.log(err)
    return err;
  }
};
