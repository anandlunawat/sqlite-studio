import { useEffect } from 'react'
import './App.css'
import { initializeSQLite } from './workers/sqliteWorker'
import SqlTerminal from './components/SqlTerminal'

function App() {

  useEffect(()=>{
    console.log("In Use Effect")
    initializeSQLite()
  },[])

  return (
    <SqlTerminal />
  );
}

export default App
