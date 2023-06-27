import React, { useEffect, useState } from 'react'
import { Messaging } from "react-cssfx-loading";
import '../css/Queue.css'
import { Socket } from 'socket.io-client';
import { CSSProperties } from 'styled-components';

interface props {
    mode: string
    name: string | undefined
    socket?: Socket
    changeComponent: (str: string) => void
}

interface Opponent {
    username : string
    id: number
}

const Queue = ({ mode, name, socket, changeComponent }: props) => {
    const [find, setFind] = useState(false)
    const [vs, setVs] = useState('void')
    const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));
    const [errorShow, setErrorShow] = useState(false);
    const [errorMessage, setErrorMessage] = useState(false);
    let error : boolean = false;

    useEffect(() => {
        const emitStr = 'addQueue' + mode
        const quit = 'quitQueue' + mode
        socket?.emit(emitStr, {})
        socket?.on('vsName', async ({ opponent }: { opponent: Opponent }) => {
            await delay(2000)
            setFind(true)
            setVs(opponent.username)
            await delay(3000)
            const change = 'game' + opponent.id + mode;
            changeComponent(change)
        })
        socket?.on('errorQueue', async (message) => {
            // eslint-disable-next-line
            error = true;
            setErrorMessage(message);
            setErrorShow(true);
            await delay(3000);
            changeComponent('play');
        })

        return () => {
            socket?.off('vsName')
            socket?.off('errorQueue')
            if (!error)
                socket?.emit(quit, {error: error})
        }
    }, [])

    const modeStr = () => {
        if (mode === 'n')
            return 'Normal Mode'
        else
            return 'Bonus Mode'
    }

    const nameText : CSSProperties = {
        fontSize: '48px', cursor:'default', display: 'flex', alignItems:'center', justifyContent:'center', flexDirection: 'column', paddingTop: '20%',
    }

    return (
        <div className='containerQueue'>
        { errorShow ? <div className='nameText' style={nameText}>{errorMessage}</div>
         :
        <div className='containerQueue'>
            {!find ? (<div className='headerQ'>Looking For An Opponent</div>) :
                (<div className='headerQ'>Match is about to Start</div>)}
            < div className='containerBotQ'>
                <div className='headerBotQ'>{modeStr()}</div>
                <div className='containerQ'>
                    <div className='containerName'>
                        <div className='headerBotQ'>{name}</div>
                    </div>
                    <div className='containerPong'>
                        <div className='bloc'></div>
                        <div className='ball'></div>
                        <div className='bloc2'></div>
                    </div>
                    <div className='containerName'>
                        {!find ? (<Messaging color='#FFFFFF' />) :
                            (<div>{vs}</div>)}
                    </div>
                </div>
            </div>
        </div >}
        <div className='instruction'>Use the up/down keys to control your paddle</div>
        </div>
    )
}

export default Queue
