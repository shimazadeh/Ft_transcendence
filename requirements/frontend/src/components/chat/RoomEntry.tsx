import React, { useEffect, useState } from 'react'
import { Socket } from 'socket.io-client';
import { CSSProperties } from 'styled-components';
import { User } from '../types';
import msgGrey from '../../img/msgGrey.png'
import msgGreen from '../../img/msgGreen.png'
import { Room } from './chatTypes';

interface MessageObj {
  id: number;
  name: string;
  text: string;
  roomId: number;
}

interface Props {
	room: Room;
	key: number;
  handleSelect: (id: number, roomName: string, type: string, owner?: string) => void;
  socket?: Socket;
  user: User;
}

const RoomEntry:React.FC<Props> = ({room, handleSelect, socket, user}) => {

const [owner, setOwner] = useState(room.owner);
const [newMsg, setNewMsg] = useState<boolean>(false);
const [roomType, setRoomType] = useState<string>(room.type);
const [nameDisplay, setNameDisplay] = useState<string>('');

const RoomsContainer: CSSProperties = {
  boxShadow: newMsg ? 'inset 0 0 30px #0a0' : 'null',
}
const Type: CSSProperties = {
  color: (roomType === 'public') ? '#00ee13'
  : (roomType === 'protected') ? '#eeaa00'
  : '#ff0000',
}

const Block: CSSProperties = {
  display: 'flex', flexDirection:'column', justifyContent: 'space-around',
}

useEffect(() => {
  if (room.type === 'direct')
  { 
    socket?.emit('displayDirect', {roomId: room.id}, (nameDisplay: string) => {
      setNameDisplay(nameDisplay);
    }) 
  }

  socket?.on('newMessage', (message: MessageObj) => {
    if (message.roomId === room.id)
      setNewMsg(true);
  })
  socket?.on('joinSuccess', (response) => {
    if (response.id === room.id)
      setNewMsg(false);
    })
  
		socket?.on('refreshRoomSelectType', (roomId: number, newType: string) => {
      if (room.id === roomId)
			  setRoomType(newType);
    })
    return () => {
            socket?.off('newMessage');
            socket?.off('joinSuccess');
            socket?.off('refreshRoomSelectType');
        };
  }, []);

	// function getOtherUser(roomName: string, username: string | undefined): string | null {
	// 	const [userA, userB] = roomName.split(' - ');
	// 	if (username === userA) {
	// 	  return userB;
	// 	} else if (username === userB) {
	// 	  return userA;
	// 	}
	// 	return null;
	// }
	// const nameDisplay = room?.type ==='direct' ?
	// getOtherUser(room.name, user.gameLogin)
	// : room?.name;
  
  return (
    <div className='RoomBox' style={RoomsContainer} onClick={() => handleSelect(room.id, room.name, roomType, owner?.username)}>
      {room.type !== 'direct' && <div style={Block}>
      <span className='legend'>Salon Name</span>
        <span className='salon'>{room.name}</span>
      </div>}
      {room.type !== 'direct' && <div style={Block}>
        <span className='legend'>Owner</span>
        <span className='ownerTxt'>{owner?.gameLogin}</span>
      </div>}
      {room.type !== 'direct' && <div style={Block}>
        <span className='legend'>Status</span>
        <span style={Type}>{roomType.toUpperCase()}</span>
      </div>}
      {room.type === 'direct' && <div style={Block}>
        <span className='directMsgEntry'>{nameDisplay}</span>
      </div>}
      {!newMsg && <img src={msgGrey} className='iconMsg'></img>}
      {newMsg && <img src={msgGreen} className='iconMsg'></img>}

    </div>
  )
}

export default RoomEntry
