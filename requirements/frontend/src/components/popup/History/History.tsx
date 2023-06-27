import React, {useState, useEffect} from 'react'
import HistoryEntry from './HistoryEntry'
import { historyData } from './typeHistory'
import { CSSProperties } from 'react'
import './History.css'

interface Props {
  changeComponent: (component: string) => void;
}

const History:React.FC<Props> = ({changeComponent}) => {

  const Container: CSSProperties = {

    border: '4px solid #40DEFF',
    boxShadow: '0 0 10px #40DEFF, 0 0 60px #40DEFF, inset 0 0 40px #40DEFF',

    position: 'relative',
    flexGrow: 1,
    height: '90%',
    margin: '30px',
    marginBottom: '85px',

    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'flex-start',
}

  const Entries : CSSProperties = {
    marginTop: '5px',
    flexGrow: '1',

    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'flex-start',

    overflowY: 'auto'
  }

  const [entryData, setEntryData] = useState<historyData[]>([]);

  const fetchHistory = async () => {
    const data = await fetch(`http://${process.env.REACT_APP_DOMAIN}:${process.env.REACT_APP_DOMAIN_PORT}/history/display` ,{ method:"GET", credentials: "include" })
    const jsonData = await data.json();
    return jsonData;
  }

  useEffect(() => {
    const getHistory = async () => {
        const HistoryFromServer = await fetchHistory()
        setEntryData(HistoryFromServer)
    }
    getHistory();
  }, [])

  const reversedEntryData = [...entryData].reverse();

  return (
    <div style={Container}>
    {entryData.length === 0 && <div className='EmptyMessage' onClick={() => changeComponent('play')}>Play some games to see your history !</div>}
      <div style={Entries}>
        {reversedEntryData.map((entry) => (<HistoryEntry entry={entry} key={entry.id} />))}
        </div>
      </div>
  )
}

export default History
