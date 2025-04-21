import { useEffect, useState } from 'react';
import './App.css';
import { execQuery, initializeSQLite } from './workers/sqliteWorker';
import SqlTerminal from './components/SqlTerminal';
import TableComponent from './components/TableComponent'; // Import TableComponent

function App() {
  const [resultsArray, setResultsArray] = useState<any[]>([]); // Store query results for all tables

  useEffect(() => {
    console.log('In Use Effect');
    initDbTables();
  }, []);

  async function initDbTables() {
    const results = await initializeSQLite();
    if(results) {
      onQueryExecuted()
    }
  }

  async function setTable() {
    const results = await execQuery(`SELECT name FROM sqlite_master WHERE type = 'table' AND name NOT LIKE 'sqlite_%';`);
    if (results?.type === 'exec') {
      const tables = results.result?.resultRows;
        const allResults: any[] = []; // Temporary array to hold all table results
  
        for (const table of tables) {
          try {
            const query = `SELECT * FROM ${table.name}`;
            const queryResults = await execQuery(query);
            
            // Handle results
            if (queryResults.type === 'exec') {
              allResults.push({
                tableName: table.name,
                data: queryResults.result.resultRows,
              });
            } else {
              console.error(`Error in table ${table.name}:`, queryResults.result.stack[0]);
            }
          } catch (error) {
            console.error('Error executing query', error);
          }
        }
  
        setResultsArray(allResults);
    }
  }

  function onQueryExecuted() {
    setTable()
  }

  return (
    <div className="p-2 md:flex-row md:flex flex-col flex gap-2">
      <div className="basis-9/12">
        <SqlTerminal onQueryExecuted={onQueryExecuted }/>
      </div>
      <div className="basis-3/12">
        {/* Render TableComponent for each table result */}
        {resultsArray.length > 0 ? (
          resultsArray.map((resultItem, index) => (
            <div key={index}>
              <h2 className="font-bold">{resultItem.tableName}</h2>
              <TableComponent result={resultItem.data} /> {/* Pass resultItem to TableComponent */}
            </div>
          ))
        ) : (
          <div>No results to display</div>
        )}
      </div>
    </div>
  );
}

export default App;
