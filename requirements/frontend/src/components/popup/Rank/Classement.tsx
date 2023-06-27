import React from 'react'
import { CSSProperties, useState, useEffect } from 'react'
import { User} from '../../types'
import ClassementEntry from './ClassementEntry'
import RankIcon from './RankIcon'

interface Props {
  rank : string;
  changeComponent: (component: string) => void;
}

const Classement:React.FC<Props> = ({rank, changeComponent}) => {

  let gradient: string;
  let elo: number;
  switch (rank) {
      case 'bronze':
          gradient = 'linear-gradient(to bottom, #741010, #CC9C1F, #000) 1';
          elo = 0;
          break;
      case 'silver':
          gradient = 'linear-gradient(to bottom, #FFF, #86CFCB, #000) 1';
          elo = 1000;
          break;
      case 'gold':
          gradient = 'linear-gradient(to bottom, #F3CA37, #D26637, #000) 1';
          elo = 2000;
          break;
      case 'crack':
          gradient = 'linear-gradient(to bottom, #BB7DD9, #9409AA, #000) 1';
          elo = 3000;
          break;
      case 'ultime':
          gradient = 'linear-gradient(to bottom, #FFF, #D26637, #000) 1';
          elo = 4000;
          break;
      default:
          gradient = 'linear-gradient(to bottom, #F3CA37, #EFA81F, #000) 1';
          elo = 0;
          break;
  }

  const Container: CSSProperties = {
    flexBasis: '100%',
    height:'100%',
    margin: '5px',

    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'flex-start',

}

  const Classement: CSSProperties = {
    flexGrow: '1',
    height:'95%',
    margin: '5px',

    background: 'rgba(0, 0, 0, 0.6)',
    border: '4px solid',
    borderImage: gradient,
    borderRadius: '15px',

    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'flex-start',
}

const Header: CSSProperties = {
  flexBasis: '150px',
  margin: '0px',

  background: 'rgba(0, 0, 0, 0.9)',
  borderRadius: '15px',

  display: 'flex',
  flexDirection: 'row',
  justifyContent: 'space-around',

}
  // const goldPic: CSSProperties = {
  //   height: '250px',
  //   width: '190px',
  //   alignSelf: 'center',
  //   margin: '-45px',
  // }
  const headerTitle: CSSProperties = {
    alignSelf: 'center',

    fontWeight : '800',
    fontSize : '64px',
    fontFamily: 'Montserrat, sans-serif',
    letterSpacing : '5px',

    background: gradient.substring(0, gradient.length - 2),
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
  }
  const headerElo: CSSProperties = {
    alignSelf: 'center',
    marginTop: '10px',
    borderRadius: '15px',

    fontWeight : '800',
    fontSize : '24px',
    fontFamily: 'Montserrat, sans-serif',
    letterSpacing : '5px',

    background: gradient.substring(0, gradient.length - 2),
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
  }

  const Legend: CSSProperties = {
    flexBasis: '50px',
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginLeft: '80px',
  }
    const legendText: CSSProperties = {
      flexBasis: '50px',
      marginTop: '10px',
      marginRight: '30px',

      fontWeight : '600',
      fontSize : '24px',
      fontFamily: 'Montserrat, sans-serif',
      color: '#fff',
    }

  const Entries: CSSProperties = {
    flexBasis: '58%',
    margin: '5px',

    borderRadius: '15px',

    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'flex-start',
    overflow: 'auto',
  }
  const chooseRank: CSSProperties = {
    height:'80%', alignSelf:'center', margin: '10px',
    background: 'rgba(0, 0, 0, 0.8)', borderRadius: '30px',
    display:'flex', flexDirection:'column', justifyContent:'center',
  }

  const [leaders, setLeaders] = useState<User[]>([]);

  const fetchUsers = async () => {
    const data = await fetch(`http://${process.env.REACT_APP_DOMAIN}:${process.env.REACT_APP_DOMAIN_PORT}/users/leaderboard/` ,{ method:"GET", credentials: "include",
  });
    console.log(data);
    const jsonData = await data.json();
    return jsonData;
  }

  useEffect(() => {
    const getLeaders = async () => {
        const leaderDatabase = await fetchUsers();
        setLeaders(leaderDatabase);
    }
    getLeaders();
  }, [])

  const leadersSorted: User[] = leaders.sort((a, b) => b.elo - a.elo).filter((player) => player.elo >= elo && (player.elo < elo + 1000 || elo >= 4000));
  leadersSorted.forEach((player, index) => { player.rank = index + 1});


  interface choices {
    rank : string,
    x: number,
    y: number,
  }

  const ranksChoices: choices[] = [
    {rank:'bronze', x:18, y:0}, {rank:'silver', x:26, y:-5}, {rank:'gold', x:10, y:0}, {rank:'crack', x:20, y:0}, {rank:'ultime', x:4, y:0}
  ].filter((choice) => choice.rank !== rank);

  const [leftBar, setLeftBar] = useState<boolean>(false);
  const handleLeftBar = () => {
    setLeftBar(!leftBar);
  };
  return (
    <div style={Container}>

      { leftBar ? <div style={chooseRank}>
          {ranksChoices.map((choice) => <RankIcon icon={choice.rank} scale={0.5} x={choice.x} y={choice.y} changeComponent={changeComponent}/>)}
      </div> : null}

      <div style={Classement}>
        <div style={Header}>
          <div onClick={handleLeftBar}><RankIcon icon={rank} scale={0.7} y={-20}/></div>
          <span style={headerTitle}>{rank.toLocaleUpperCase()}</span>
          <span style={headerElo}>ELO {elo} - {elo + 1000}</span>
        </div>
        <div style={Legend}>
          <span style={legendText}>RANK</span>
          <span style={legendText}>USER</span>
          <span style={legendText}>ELO</span>
          <span style={legendText}>VICTORY</span>
          <span style={legendText}>RATIO</span>
        </div>
        <div style={Entries}>
          {leadersSorted.map((leader) => <ClassementEntry leader={leader} />)}
        </div>
      </div>
    </div>
  )
}

export default Classement
