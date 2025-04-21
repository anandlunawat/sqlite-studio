import React, { useRef, useState } from "react";
// import Prism from "prismjs";
import { execQuery } from "../workers/sqliteWorker";
import TableComponent from "./TableComponent";

export default function SqlTerminal() {
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
    onQueryExecuted()
    const results = await execQuery(input);
    const resultType = results.type; // 'exec' or 'error'
  
    if (resultType === 'error') {
      const errorMessage = results.result?.stack?.[0] || "Unknown error";
      console.error("Query Error", errorMessage);
  
      setQueryResult({
        resultType: 'error',
        result: null,
        errorResult: errorMessage,
      });
    } else {
      console.log("Query Results", results.result?.resultRows || []);
      setQueryResult({
        resultType: 'exec',
        result: results.result?.resultRows || [],
        errorResult: null,
      });
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
        <span className="font-euclidCircular text-xs">Output</span>
        {
          (queryResult.resultType) && 
            (queryResult.resultType === 'error' ? <span>{queryResult.errorResult}</span> :  <TableComponent result={queryResult.result}/>)
        }
      </div>
    </div>
  );
}
