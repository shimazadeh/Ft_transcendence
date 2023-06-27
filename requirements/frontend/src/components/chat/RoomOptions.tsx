import React from 'react'
import { Socket } from 'socket.io-client';
import './ChatRoom.css'
import { User } from '../types';
import { Room } from './chatTypes';

interface Props {
    position : {x: number, y: number};
    socket?: Socket;
    user : User;
    admins : User[];
    changeComponent: (component: string) => void;
    setRoomClicked: (value: React.SetStateAction<boolean>) => void;
    room: Room | undefined;
    setAskPass: React.Dispatch<React.SetStateAction<boolean>>;
    type: string;
    returnTo: string;
}

const RoomOptions: React.FC<Props> = ({position, setRoomClicked, user, admins, changeComponent, socket, room, setAskPass, type, returnTo}) => {

    const popupStyle: React.CSSProperties = { top: position.y, left: position.x,};
    const isAdmin = admins.some((admin) => admin.id === user.id);
    let isOwner: boolean = false;
    if (room?.owner)
      isOwner = room.owner.id === user.id;

    const handleQuit = () => {
      socket?.emit('quitRoom', {roomId: room?.id});
      changeComponent(`${returnTo}`);
    }
    const handleDelete = () => {
      socket?.emit('deleteRoom', {roomId: room?.id});
      changeComponent(`${returnTo}`);
    }
    const handleProtect = () => {
        setAskPass(true);
        setRoomClicked(false);
    }
    const handleUnprotect = () => {
        socket?.emit('unprotectRoom', {roomId: room?.id});
        setRoomClicked(false);
    }

  return (
    <div className='roomOptions' style={popupStyle} onMouseLeave={() => setRoomClicked(false)}>
      {!isOwner && <div className='roomOptionsContent' onClick={handleQuit}>Quit Room</div>}
      {isOwner && <div className='roomOptionsContent' onClick={handleDelete}>Delete Room</div>}
      {isAdmin && type === 'public' && <div className='roomOptionsContent' onClick={handleProtect}>Add Password</div>}
      {type === 'protected' && <div className='roomOptionsContent' onClick={handleUnprotect}>Remove Password</div>}
    </div>
  )
}

export default RoomOptions
