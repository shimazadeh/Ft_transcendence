import '../css/FriendRequest.css'
import React, { FC, CSSProperties } from 'react'
import { useState, useEffect } from 'react';
import { User } from '../../../types';
import FriendReqOnglet from './FriendReqOnglet';
import { Socket } from 'socket.io-client';

interface friendReq {
    id: number;
    senderId: number;
    recipientId: number;
    sender: User
}

const FriendRequest = ({ sender, socket }: { sender: friendReq[], socket?: Socket }) => {

    const style = {
        paddingLeft: '15%',
        paddingRight: '15%',
        textShadow: 'none',
    }

    return (
        <div className='containerFriendReq'>
            {sender.length === 0 ? (
                <div className='noFriendReq'>
                    <div style={style} className='nameText'>Friends Requests will apear here !</div>
                </div>
            ) : (
                sender.map((sender) =>
                    <FriendReqOnglet key={sender.id} sender={sender.sender} socket={socket} />)
            )}
        </div>
    )
}

export default FriendRequest