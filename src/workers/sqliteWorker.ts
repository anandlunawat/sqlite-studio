// @ts-nocheck

// src/workers/sqlite-worker.ts
// This will be the worker file

import { sqlite3Worker1Promiser } from '@sqlite.org/sqlite-wasm';

// Worker context - this code runs in the worker thread
let db: any = null;
let dbId: any = null;

// Initialize the SQLite worker
const promiser1 = new Promise((resolve)=>{
  const _promiser = sqlite3Worker1Promiser({
    onready: () => {
      self.postMessage({ type: 'ready' })
      resolve(_promiser)
    }
  });
}) 
// .then(async (promiser) => {
  // Worker is ready
  promiser1.then((promiser)=>{
    self.onmessage = async (event) => {
      const { type, payload } = event.data;
      
      try {
        switch (type) {
          case 'init': {
            // Check OPFS support (in worker context)
            let supportsOPFS = false;
            try {
              supportsOPFS = (
                typeof self.navigator?.storage?.getDirectory === "function" && 
                self.isSecureContext === true
              );

              const configResponse = await promiser('config-get', {});
              console.log('Running SQLite3 version', configResponse);
              
              if (supportsOPFS) {
                await self.navigator.storage.getDirectory();
              }
            } catch (e) {
              console.log('OPFS access failed:', e);
              supportsOPFS = false;
            }

            const filename = supportsOPFS
              ? 'file:mydb.sqlite3?vfs=opfs'
              : 'mydb.sqlite3'; // fallback
            
            const openResponse = await promiser('open', { filename });
            dbId = openResponse.dbId;
            
            self.postMessage({
              type: 'initialized',
              payload: { 
                dbId,
                supportsOPFS,
                filename: openResponse.result.filename
              }
            });
            break;
          }
          
          case 'exec': {
            if (!dbId) {
              throw new Error("Database not initialized");
            }
            
            const { sql } = payload;
            const result = await promiser("exec", {
              dbId,
              sql,
              returnValue: "resultRows",
              rowMode: "object",
            });
            
            self.postMessage({
              type: 'execResult',
              payload: { result }
            });
            break;
          }
          
          case 'close': {
            if (dbId) {
              await promiser('close', { dbId });
              self.postMessage({
                type: 'closed',
                payload: { success: true }
              });
            }
            break;
          }
        }
      } catch (err) {
        self.postMessage({
          type: 'error',
          payload: { 
            message: err instanceof Error ? err.message : String(err),
            operation: type
          }
        });
      }
    };
  }) 
// });