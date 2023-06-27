import React, { useEffect, useState } from 'react'
import { Socket } from 'socket.io-client'
import { Messaging } from 'react-cssfx-loading'
import { CSSProperties } from 'styled-components'

interface props {
    name: string | undefined
    changeComponent: (str: string) => void
    changeMode: () => void
    socket?: Socket
    friendId: number | undefined
    mode: string
    previousActiveComponent: () => void
}

interface FriendProps {
    username: string
    id: number
}

const InvitePlay = ({ name, changeComponent, socket, friendId, mode, changeMode, previousActiveComponent }: props) => {
    const [find, setFind] = useState(false)
    const [vs, setVs] = useState('void')
    const [refuse, setRefuse] = useState(false)
    const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

    console.log("inside invite play")
    const background: CSSProperties = {
        position: 'fixed',
        top: '0',
        left: '0',
        width: '100%',
        height: '100%',
        backgroundColor: 'rgba(0,0,0,0.7)',
        zIndex: '999'
    }

    useEffect(() => {
        const launchEmit = async () => {
            if (mode === 'invite')
                socket?.emit('invitePlay', { id: friendId })
            if (mode === 'receive') {
                socket?.emit('acceptInvitation', { id: friendId })
                await delay(2000)
                setFind(true)
                const data = await fetch(`http://${process.env.REACT_APP_DOMAIN}:${process.env.REACT_APP_DOMAIN_PORT}/friend/` + friendId, {
                    method: "GET",
                    credentials: "include",
                });
                const gameLogin = await data.text()
                setVs(gameLogin)
                await delay(3000)
                const change = 'game' + friendId + "n";
                changeComponent(change)
            }
        }
        launchEmit()
        socket?.on('accepted', async ({ friend }: { friend: FriendProps }) => {
            await delay(2000)
            setFind(true)
            setVs(friend.username)
            await delay(3000)
            const change = 'game' + friend.id + "n";
            changeComponent(change)
        })
        socket?.on('refused', async () => {
            setRefuse(true)
            await delay(3000)
            // changeComponent(previousActiveComponent)
            previousActiveComponent()
        })
        return () => {
            socket?.off('refused')
            socket?.off('accepted')
            changeMode()
        }
    // eslint-disable-next-line
    }, [])

    return (
        <div className='containerQueue'>
            {refuse && <div style={background}><div className='refuse'>Your friend declined your invitation</div></div>}
            {!find ? (<div className='headerQ'>Waiting for Your friend</div>) :
                (<div className='headerQ'>Match is about to Start</div>)}
            < div className='containerBotQ'>
                <div className='headerBotQ'>Normal</div>
                <div className='containerQ'>
                    <div className='containerName'>
                        <div>{name}</div>
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
            <div className='instruction'>Use the up/down keys to control your paddle</div>
        </div >

    )
}

export default InvitePlay
