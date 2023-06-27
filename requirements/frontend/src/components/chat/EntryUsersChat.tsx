import React, { CSSProperties, useEffect, useRef, useState } from 'react'
import { Socket } from 'socket.io-client';
import { User } from '../types';
import './ChatRoom.css'
import {ChatRoomData, Room} from './chatTypes';

interface Props {
    socket: Socket | undefined;
	user: User;
	target: User;
	field: string;
	changeComponent: (component: string) => void;
	handleUserClick: (target: User, event: React.MouseEvent<HTMLSpanElement>) => void;
	connected: User[];
	admins: User[];
	owner: User | undefined;
	blocked: User[];
	room?: Room ;
}

const EntryUsersChat:React.FC<Props> = ({socket, user, target, field, changeComponent, handleUserClick, connected, admins, owner, blocked, room}) => {

    useEffect(() => {

    }, []);
	const isConnected = connected.some((connectedUser) => connectedUser.id === target.id);
	
	let roomRank: string;
	if (owner && room?.type !== 'direct') {
		roomRank =  target.id === owner.id ? 'Owner' :
		admins.some((admin) => admin.id === target.id) ? 'Admin' : 'Member';
	}	else {
		roomRank = 'Member';
	}
	let colorCodeRank : string = roomRank === 'Owner' ? '#fe0' : roomRank === 'Admin' ? '#e0e' : '#eee';

	const displayRank : string = ` (${roomRank})`;

	const EntryUser : CSSProperties = {
		color: isConnected ? colorCodeRank : '#555',
	}

	const hide : boolean = blocked.some((guy) => guy.id === target.id);
	const self : boolean = user.id === target.id;

    return (
		<div>
        {!hide && !self && <div className='EntryUser' style={EntryUser}  onClick={(e) => handleUserClick(target, e)}>
			{target.gameLogin}
			{roomRank != 'Member' && displayRank}
	    </div>}
		</div>

  )
}

export default EntryUsersChat
