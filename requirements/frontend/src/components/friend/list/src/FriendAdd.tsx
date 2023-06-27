import React, { FormEvent } from 'react'
import { useState } from 'react';
import '../css/FriendAdd.css'
import { User } from '../../../types';
import FriendAddOnglet from './FriendAddOnglet';
import { Socket } from 'socket.io-client';

const FriendAdd = ({ socket }: { socket?: Socket }) => {

    const inputStyle = {
        width: '70%',
        height: '72%',
        fontSize: '2.2vh',
    }

    const loopStyle = {
        minHeight: '40px',
        minWidth: '42px',
        height: '3.5vh',
        width: '3.6vh',
        textDecoration: 'none',
        backgroundColor: 'transparent',
        border: 'none',
        outline: 'none',
    }

    const [input, setInput] = useState<string>('')
    const [friendList, setFriendList] = useState<User[]>([])
    const [search, setSearch] = useState(false)

    const fetchFriendsList = async (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault()
        if (!input)
            return;
        try {
            const req = `http://${process.env.REACT_APP_DOMAIN}:${process.env.REACT_APP_DOMAIN_PORT}/friend/add/` + input
            const data = await fetch(req, { method: "GET", credentials: "include" })
            if (data.status !== 200 && data.status !== 304)
            {
                setFriendList([])
                console.log("error loking for friend", data.status);
                setSearch(true)
                return ;
            }
            const friend = await data.json()
            setFriendList(friend)
            setSearch(true)
        }
        catch (error) {
            setFriendList([])
            console.log("Wrong req");
            setSearch(true)
        }
    }

    const handleInput = (event: React.ChangeEvent<HTMLInputElement>) => {
        setInput(event.target.value)
    }

    const style = {
        textShadow: 'none',
    }

    return (

        <div className='containerAddFriendInside'>
            <form className='containerAddFriendHeader' onSubmit={fetchFriendsList}>
                <input style={inputStyle} className='inputFriend' type='text' placeholder='NewFriendName' onChange={handleInput} maxLength={30}/>
                <button style={loopStyle} className='loopButton' type='submit' />
            </form>
            <div className='containerAddFriendBody'>
                {friendList.length === 0 ? (
                    <div className='containerMsg'>
                        {!search && <div className='nameText' style={style}>Find new friends above ! </div>}
                    </div>
                ) : (
                    friendList.map((friend) =>
                        <FriendAddOnglet key={friend.id} friend={friend} socket={socket} />)
                )}
            </div>
        </div>
    )
}

export default FriendAdd