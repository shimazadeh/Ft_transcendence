import React, { useEffect, useState } from 'react';
import { User } from '../types';
import { Socket } from 'socket.io-client';
import { Room } from './chatTypes';

interface PopupProps {
  user: User;
  position : {x: number, y: number};
  setSelectedTarget: React.Dispatch<React.SetStateAction<User | null>>;
  socket?: Socket;
  room: Room | undefined;
  clientName: string;
  changeComponent: (component: string) => void;
  field: string;
  whitelist: User[];
  friends: User[];
  returnTo: string;
}

interface popupInfo {
  ban: boolean;
  mute: boolean;
  admin: boolean;
  clientAdmin: boolean;
}

const PopupChat: React.FC<PopupProps> = ({ user, position, setSelectedTarget, socket, room, clientName, changeComponent, field, whitelist, returnTo, friends}) => {

	// const [isVisible, setIsVisible] = useState(true);
	const [ban, setBan] = useState('Ban');
	const [mute, setMute] = useState('Mute');
	const [admin, setAdmin] = useState('Promote as admin');
	const [clientAdmin, setClientAdmin] = useState(false);


  // const roomName = room ? room.name : null;
  const roomId = room ? room.id : null;

	const popupStyle: React.CSSProperties = {
		position: 'fixed',
		top: position.y,
		left: position.x,
		backgroundColor: '#000',
		padding: '10px',
		border: '2px solid #fff',

		display: 'flex',
		flexDirection: 'column',
	  };

	  const UsernameStyle: React.CSSProperties = {
		padding: '10px 10px',
		fontSize: '20px',
		fontWeight: 'bold',
		borderRadius: '5px',
		background: '#000',
		color: '#ffa',
		transition: 'background-color 0.3s ease',
		boxShadow: '0px 2px 4px rgba(0, 0, 0, 0.25)',
		alignSelf: 'center',
	};

	  const Buttons: React.CSSProperties = {
		margin: '10px',
		// padding: '5px 10px',
		fontSize: '12px',
		fontWeight: 'bold',
		borderRadius: '5px',
		border: 'none',
		background: '#000',
		color: 'white',
		cursor: 'pointer',
		transition: 'background-color 0.3s ease',
		boxShadow: '0px 2px 4px rgba(0, 0, 0, 0.25)',
	};

  useEffect(() => {

    socket?.emit('popupInfos', { id:user.id, roomId:roomId},
    (response: popupInfo) => {
      if (response.ban === true)
        setBan('Unban');
      if (response.mute === true)
        setMute('Unmute');
      if (response.admin === true)
        setAdmin('Demote admin');
      if (response.clientAdmin === true)
        setClientAdmin(true);
    });


    return () => {
    };

  }, []);

  const handleSendMessage = () => {
    changeComponent(`${returnTo}`);
    socket?.emit('createDirectMessage', {targetId: user.id});
  };

  const handleInviteToPlay = () => {
    changeComponent('invitePlay' + user.id)
  };

  const handleSeeProfile = () => {
    changeComponent('PublicProfile' + user.id)
  };

  const handleAddFriend = () => {
    socket?.emit('send', { id: user.id });
  };

  const handleBlock = () => {
      socket?.emit('bloqueFriend', { id: user.id });
  };

  const handleBan = () => {
    if (ban === 'Ban')
	    socket?.emit('ban', {targetId : user.id, roomId: roomId});
    else if (ban === 'Unban')
      socket?.emit('unban', {targetId : user.id, roomId: roomId});
  };

  const handleKick = () => {
    socket?.emit('kick', {targetId: user.id, roomId: roomId});
  };

  const handleMute = () => {
    if (mute === 'Mute')
      socket?.emit('mute', {targetId: user.id, roomId: roomId});
    else if (mute === 'Unmute')
      socket?.emit('unmute', {targetId: user.id, roomId: roomId});
  };

  const handlePromoteAdmin = () => {
    if (admin === 'Promote as admin')
	    socket?.emit('promoteAdmin', {targetId : user.id, roomId: roomId});
    else if (admin === 'Demote admin')
      socket?.emit('demoteAdmin', {targetId : user.id, roomId: roomId});
  };

  const handleClickOutside = () => {
      setSelectedTarget(null);
  };

  const handleAddToChat = () => {
    socket?.emit('addToChat', {friendId: user.id, roomId:roomId});
  }

  const isWhitelisted =  whitelist.some((guy) => guy.id === user.id);
  const isFriend = friends.some((guy) => guy.id === user.id);

  return (
    <div style={popupStyle} onClick={handleClickOutside} onMouseLeave={handleClickOutside}>
      <span style={UsernameStyle}>{user.gameLogin}</span>
      <button style={Buttons} onClick={handleSeeProfile}>See Profile</button>
      {room?.type !== 'direct' && <button style={Buttons} onClick={handleSendMessage}>Send Message</button>}
      <button style={Buttons} onClick={handleInviteToPlay}>Invite to Play</button>
      {field !== 'friends' && !isFriend && <button style={Buttons} onClick={handleAddFriend}>Add Friend</button>}
      <button style={Buttons} onClick={handleBlock}>Block</button>
      {clientAdmin && field !== 'friends' && <button style={Buttons} onClick={handleBan}>{ban}</button>}
      {clientAdmin && field === 'salon' && <button style={Buttons} onClick={handleKick}>Kick</button>}
      {clientAdmin && field === 'salon' && <button style={Buttons} onClick={handleMute}>{mute}</button>}
      {clientAdmin && field === 'salon' && <button style={Buttons} onClick={handlePromoteAdmin}>{admin}</button>}
      {clientAdmin && field === 'friends' && !isWhitelisted && <button style={Buttons} onClick={handleAddToChat}>Add to chatroom</button>}
    </div>
  );
};

export default PopupChat
