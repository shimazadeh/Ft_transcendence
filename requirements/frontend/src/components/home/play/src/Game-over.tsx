import React, { FC } from 'react'
import '../css/Game.css'

interface GameOverProps {
    changeComponent: (component: string) => void;
    msg: string;
  }

const GameOver:FC<GameOverProps> = ({changeComponent, msg}) => {

  const click = () => {
    changeComponent('Choices')
  }
  return (
    <div className='containerGameOver' onClick = {click}>
        <h2 className='gameoverText'>{msg}</h2>
        <div className='tryagainButton'/>
    </div>
  )
}

export default GameOver
