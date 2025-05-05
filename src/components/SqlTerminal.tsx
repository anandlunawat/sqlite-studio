import React, { useRef, useState } from "react";
// import Prism from "prismjs";
// import { execQuery } from "../workers/sqliteWorker";
import TableComponent from "./TableComponent";

interface SQLiteHook {
  isReady: boolean;
  error: string | null;
  isPersisted: boolean;
  execQuery: (sql: string) => Promise<any>;
  closeDatabase: () => Promise<void>;
}

export default function SqlTerminal({sqliteHook,onQueryExecuted}: {sqliteHook: SQLiteHook,onQueryExecuted : ()=> void }) {
  console.log("In SqlTerminal")
  const [input, setInput] = useState("");
  const editableRef = useRef<HTMLDivElement>(null);
  const [queryResult, setQueryResult] = useState<{
    resultType: 'exec' | 'error' | null;
    result: any[] | null;
    errorResult: string | null;
  }>({
    resultType: null,
    result: null,
    errorResult: null,
  });

  const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (e.key === "Enter" && (e.ctrlKey || e.metaKey)) {
      e.preventDefault();
      executeQuery();
    }
  };

  const handleInput = () => {
    setInput(editableRef.current?.innerText || "");
  };

  const executeQuery = async () => {
   if(sqliteHook.isReady) {
    const results = await sqliteHook.execQuery(input);
    const resultType = results.type; // 'exec' or 'error'
  
    if (resultType && resultType === 'exec') {
      console.log("Query Results", results.result?.resultRows || []);
      setQueryResult({
        resultType: 'exec',
        result: results.result?.resultRows || [],
        errorResult: null,
      });
    } else {
      setQueryResult({
        resultType: 'error',
        result: null,
        errorResult: results,
      });
    }
   }
  };
  

  return (
    <div className="flex flex-col bg-[#fafbfc]">
      <div className="flex w-full">
        <span className="bg-[#d4d3d370] w-fit p-2 text-xs font-euclidCircular">Input</span>
        <button className="ml-auto font-arial text-[14px] font-bold" onClick={executeQuery}>Run SQL</button>
      </div>
      <div
        ref={editableRef}
        contentEditable
        onInput={handleInput}
        onKeyDown={handleKeyDown}
        style={{
          fontFamily: 'monospace'
        }}
        className="bg-[#d4d3d370] p-4 border-0 focus:border-0 outline-none focus:outline-none"
        spellCheck={false}
      />
      <div>
        <span className="font-euclidCircular text-xs">Output: </span>
        {
          (sqliteHook.error ? <span className="font-euclidCircular font-normal text-xs text-red-600">{sqliteHook.error}</span> :  <TableComponent result={queryResult.result}/>)
        }
      </div>
    </div>
  );
}
