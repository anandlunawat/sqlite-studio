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

      // Check if OPFS is supported
      let supportsOPFS = false;
      try {
        supportsOPFS = (
          typeof navigator.storage?.getDirectory === "function" && 
          window.isSecureContext === true
        );
        
        // Additional verification - try to actually access OPFS
        if (supportsOPFS) {
          await navigator.storage.getDirectory();
        }
      } catch (e) {
        log('OPFS access failed:', e);
        supportsOPFS = false;
      }

      log('OPFS support detected:', supportsOPFS);

      const filename = 'mydb.sqlite3';
        //supportsOPFS
        //? 'file:mydb.sqlite3?vfs=opfs'
        //: 'mydb.sqlite3'; // fallback (uses default VFS, not persisted)

      const openResponse = await promiser('open', {
        filename,
      });
      dbId = openResponse.dbId;
      
      log(
        supportsOPFS 
          ? 'Created persisted database with OPFS at' 
          : 'Created in-memory database at',
        openResponse.result.filename,
        'dbId:', openResponse.dbId
      );
      
      return dbId;
    } catch (err) {
      if (!(err instanceof Error)) {
        err = new Error(err.result?.message || String(err));
      }
      error(err.name, err.message);
      throw err; // Re-throw to allow caller to handle the error
    }
  }
  
  return dbId;
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
