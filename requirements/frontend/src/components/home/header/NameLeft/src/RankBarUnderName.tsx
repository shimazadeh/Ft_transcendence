import React from 'react'
import '../css/RankBarUnderName.css'
import { User } from '../../../../types'

type RankProps = {
    elo: number;
    rank: string;
    changeComponent: (component: string) => void;
}

const RankBarUnderName = ({elo, rank, changeComponent}:RankProps) => {
let porcent:number = 0

const calculWidth = (elo: number) => {
    if (elo < 1000)
       porcent = elo * 100 / 1000
    if (elo > 5000)
         porcent= 100
    else
        porcent = (elo % 1000) * 100 / 1000
    return `${porcent}%`
}

const printRadius = (porcent: number) => {
    if (porcent > 96)
        return '25px'
    else
        return '25px 0px 0px 25px'
}

const progressBar = {
    background: 'linear-gradient(90.03deg, #4070E2 49.97%, #39B9E6 99.64%)',
    width: `${calculWidth(elo)}`,
    height: '100%',
    borderRadius: `${printRadius(porcent)}`
}

  return (
    <div className='containerFooter'
    onClick={() => changeComponent('rank')}
    >
        <div className='containerEloUnderName' >
            <div style={progressBar} ></div>
            <div className='eloText'>{elo} ELO</div>
        </div>
        <div className={rank} />
    </div>
  )
}

export default RankBarUnderName