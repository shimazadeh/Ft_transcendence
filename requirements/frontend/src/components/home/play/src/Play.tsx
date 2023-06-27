import React, { FC } from 'react'
import '../css/Play.css'

interface PlayProps {
    changeComponent: (component: string) => void;
}

const Play:FC<PlayProps> = ({changeComponent}) => {

  const click = () => {
    changeComponent('Choices')
  }
  return (
    <div className='containerPlay' onClick={click}>
        <h2 className='playTxt'>PLAY</h2>
        <div className='playButton' />
    </div>
  )
}

export default Play
