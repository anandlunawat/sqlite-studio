import { sqlite3Worker1Promiser } from '@sqlite.org/sqlite-wasm';

const log = console.log;
const error = console.error;
let promiser: unknown;

export const initializeSQLite = async () => {
  if(!promiser) {
    try {
      log('Loading and initializing SQLite3 module...');
  
      promiser = await new Promise((resolve) => {
        const _promiser = sqlite3Worker1Promiser({
          onready: () => resolve(_promiser),
        });
      });
  
      log('Done initializing. Running demo...');
  
      const configResponse = await promiser('config-get', {});
      log('Running SQLite3 version', configResponse.result.version.libVersion);
  
      const openResponse = await promiser('open', {
        filename: 'file:mydb.sqlite3?vfs=opfs',
      });
      const { dbId } = openResponse;
      log(
        'OPFS is available, created persisted database at',
        openResponse.result.filename.replace(/^file:(.*?)\?vfs=opfs$/, '$1'),
      );
      // Your SQLite code here.
    } catch (err) {
      if (!(err instanceof Error)) {
        err = new Error(err.result.message);
      }
      error(err.name, err.message);
    }
  }
};