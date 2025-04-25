// src/hooks/useSQLite.ts
import { useEffect, useRef, useState, useCallback } from 'react';

// Vite-specific way to import a worker
// The ?worker syntax is Vite-specific and creates a Web Worker
import SQLiteWorker from '../workers/sqliteWorker.ts?worker';

interface SQLiteHook {
  isReady: boolean;
  error: string | null;
  isPersisted: boolean;
  execQuery: (sql: string) => Promise<any>;
  closeDatabase: () => Promise<void>;
}

export function useSQLite(): SQLiteHook {
  const workerRef = useRef<Worker | null>(null);
  const [isReady, setIsReady] = useState(false);
  const [isPersisted, setIsPersisted] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const callbacksRef = useRef<Map<string, { resolve: Function; reject: Function }>>(new Map());

  useEffect(() => {
    // Create worker
    const worker = new SQLiteWorker();
    workerRef.current = worker;

    // Set up message handler
    worker.onmessage = (event) => {
      const { type, payload } = event.data;
      
      switch (type) {
        case 'ready':
          // Worker is ready, initialize the database
          worker.postMessage({ type: 'init' });
          break;
          
        case 'initialized':
          setIsReady(true);
          setIsPersisted(payload.supportsOPFS);
          console.log(`SQLite initialized with ${payload.supportsOPFS ? 'persistent' : 'in-memory'} storage at ${payload.filename}`);
          break;
          
        case 'execResult':
          // Resolve the pending promise for the exec operation
          const execCallback = callbacksRef.current.get('exec');
          if (execCallback) {
            execCallback.resolve(payload.result);
            callbacksRef.current.delete('exec');
          }
          break;
          
        case 'closed':
          const closeCallback = callbacksRef.current.get('close');
          if (closeCallback) {
            closeCallback.resolve();
            callbacksRef.current.delete('close');
          }
          break;
          
        case 'error':
          setError(payload.message);
          // Reject any pending promises
          const errorCallback = callbacksRef.current.get(payload.operation);
          if (errorCallback) {
            errorCallback.reject(new Error(payload.message));
            callbacksRef.current.delete(payload.operation);
          }
          break;
      }
    };

    // Clean up worker on unmount
    return () => {
      if (workerRef.current) {
        workerRef.current.terminate();
        workerRef.current = null;
      }
    };
  }, []);

  const execQuery = useCallback((sql: string): Promise<any> => {
    return new Promise((resolve, reject) => {
      if (!workerRef.current || !isReady) {
        reject(new Error("SQLite is not initialized yet"));
        return;
      }
      
      // Store the callbacks to be called when the worker responds
      callbacksRef.current.set('exec', { resolve, reject });
      
      // Send the command to the worker
      workerRef.current.postMessage({
        type: 'exec',
        payload: { sql }
      });
    });
  }, [isReady]);

  const closeDatabase = useCallback((): Promise<void> => {
    return new Promise((resolve, reject) => {
      if (!workerRef.current || !isReady) {
        resolve();
        return;
      }
      
      callbacksRef.current.set('close', { resolve, reject });
      
      workerRef.current.postMessage({ type: 'close' });
    });
  }, [isReady]);

  return {
    isReady,
    error,
    isPersisted,
    execQuery,
    closeDatabase
  };
}