import React from 'react'
import { CSSProperties } from 'react'
import RankEntry from './RankEntry'
import {User} from '../../types'

interface Props {
  user: User;
  changeComponent: (component: string) => void;
}

const Rank:React.FC<Props> = ({user, changeComponent}) => {

  const existingRanks: string[] = ['bronze', 'silver', 'gold', 'crack', 'ultime']; 

  const rank: string =  user.elo > 5000 || user.elo < 0 ? 'ultime' : existingRanks[Math.floor(user.elo / 1000)];

  const eloLimited : number = user.elo >= 5000 ? 5000 : user.elo;

    const rankContainer: CSSProperties = {
        flexBasis: '1750px',
        height: '600px',
        // border: '3px solid red',

        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'flex-start',
    }

    const rankIcons: CSSProperties = {
      flexBasis: '400px',
      // border: '3px solid blue',
      margin: '20px',

      display: 'flex',
      flexDirection: 'row',
      justifyContent: 'space-between',
  }

  const Bar: CSSProperties = {
  
    border: '3px solid #fff',
    borderRadius: '30px',
    height: '30px',
    width: 'auto',
  }
  const progress: CSSProperties = {
    height: '30px',
    borderRadius: '30px',

    background: 'linear-gradient(to right, #F45BE2, #29B2FF)',
    width: user.elo > 100 ?  eloLimited / 50 + '%' : 100 / 50 + '%',
    
    color: 'white',
    textAlign: 'center',
    fontWeight : '600',
    fontSize : '20px',
    fontFamily: 'Montserrat, sans-serif',
    letterSpacing : '5px',

  }

  const handleClick = (component: string) => {
    changeComponent(component + 'Lead');
  }

  return (
    <div style={rankContainer}>
        <div style={Bar}>
           <div style={progress}>{
              user.elo > 249 ? <span>{user.elo}</span>: null} </div>
        </div>
        <div style={rankIcons}>
        <div onClick={() => handleClick('bronze')}><RankEntry rank='bronze' elo={0} userLevel={rank === 'bronze'} user={user}/></div>
        <div onClick={() => handleClick('silver')}><RankEntry rank='silver' elo={1000} userLevel={rank === 'silver'} user={user}/></div>
        <div onClick={() => handleClick('gold')}><RankEntry rank='gold'  elo={2000} userLevel={rank === 'gold'} user={user}/></div>
        <div onClick={() => handleClick('crack')}><RankEntry rank='crack' elo={3000} userLevel={rank === 'crack'} user={user}/></div>
        <div onClick={() => handleClick('ultime')}><RankEntry rank='ultime' elo={4000} userLevel={rank === 'ultime'} user={user}/></div>
        </div>
    </div>
  )
  return (
    <div></div>
  )
}

export default Rank
