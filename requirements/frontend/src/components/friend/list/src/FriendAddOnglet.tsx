import React from 'react'
import '../css/FriendAddOnglet.css'
import { User } from '../../../types';
import { useState } from 'react';
import { Socket } from 'socket.io-client';

const FriendAddOnglet = ({ friend, socket }: { friend: User, socket?: Socket }) => {


    const [button, setButton] = useState<boolean>(false)

    const handleClick = async () => {
        // const req = 'http://localhost:5000/friend/send/' + friend.id
        // await fetch(req, { method: "POST", credentials: "include" })
        setButton(true)
        socket?.emit('send', { id: friend.id })
    }

    const nameFriend = {
        fontSize: '20px',
        paddingLeft: '3%'
    }

    const displayButtonOpacity = () => {
        if (button)
            return '0.4'
        else
            return '1'
    }

    const friendLogomo = {
        minHeight: '30px',
        minWidth: '30px',
        textDecoration: 'none',
        backgroundColor: 'transparent',
        border: 'none',
        outline: 'none',
        opacity: `${displayButtonOpacity()}`
    }


    return (
        <div className='containerAddOnglet'>
            <div style={nameFriend} className='nameText'>{friend.gameLogin}</div>
            <button style={friendLogomo} className='addFriendLogo' onClick={handleClick} />
        </div>
    )
}

export default FriendAddOnglet