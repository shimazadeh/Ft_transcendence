import React from 'react'
import '../css/GameChoice.css'
import Play from './Play'

interface props {
    changeComponent: (str: string) => void
}

const GameChoice = ({ changeComponent }: props) => {

    const style = {
        fontSize: '50px'
    }

    const pointer = {
        cursor: 'pointer'
    }

    const normal = () => {
        changeComponent('queuen')
    }

    const bonus = () => {
        changeComponent('queueb')
    }

    return (
        <div className='containerMenue'>
            <div style={pointer} className='containerLeftMenue'>
                <div style={style} className='nameText' onClick={normal}>Normal Mode</div>
            </div>
            <div style={pointer} className='containerLeftMenue'>
                <div style={style} className='nameText' onClick={bonus}>Bonus Mode</div>
            </div>
        </div>
    )
}

export default GameChoice