import React, { CSSProperties, useEffect, useRef, useState } from 'react'
import { Socket } from 'socket.io-client';
import { User } from '../types';
import './ChatRoom.css'
import {ChatRoomData, Message, Room} from './chatTypes';
import EntryUsersChat from './EntryUsersChat'
import PopupChat from './PopupChat';
import RoomOptions from './RoomOptions';
import sendLogo from '../../img/sendblue.png'
import MessageEntry from './MessageEntry';

interface Props {
    socket: Socket | undefined;
	roomIdStr: string;
	user: User;
	changeComponent: (component: string) => void
}

// const sortFriend = (friend: FriendInterface[]) => {
//     return friend.sort((a, b) => (a.friend.state !== 'offline' ? -1 : 1))
//   }
// const filteredFriends = searchFriend.map((friend) => friend.friend).filter((user) => !whitelist.some((whitelistedUser) => whitelistedUser.id === user.id));

const ChatRoom:React.FC<Props> = ({socket, roomIdStr, user, changeComponent}) => {

	const roomId = Number(roomIdStr);

	const [whitelist, setWhiteList] = useState<User[]>([]);
	const [admins, setAdmins] = useState<User[]>([]);
	const [banned, setBanned] = useState<User[]>([]);
	const [connected, setConnected] = useState<User[]>([]);
	const [friends, setFriends] = useState<User[]>([]);
	const [blocked, setBlocked] = useState<User[]>([]);
	const [room, setRoom] = useState<Room>();
	const [owner, setOwner] = useState<User>();
	const [messages, setMessages] = useState<Message[]>([]);
	const [type, setType] = useState<string>('');
	const [directDisplay, setDirectDisplay] = useState<string>('');

	const filteredWhitelist = whitelist.filter((user) =>
	 !banned.some((bannedUser) => bannedUser.id === user.id));

	 const passPopupRef = useRef<HTMLFormElement>(null);

	 useEffect(() => {
		socket?.emit('join', {roomId:roomId});

		socket?.on('joinSuccess', (roomName) => {
			socket?.emit('getChatRoomData', {roomId:roomId}, (data: ChatRoomData) => {
				setWhiteList(data.whitelist);
				setAdmins(data.admins);
				setBanned(data.banned);
				setConnected(data.connected);
				setFriends(data.friends);
				setBlocked(data.blocked);
				setRoom(data.room);
				setOwner(data.owner);
				setType(data.room.type);
			});
		})
			socket?.emit('displayDirect', {roomId: roomId}, (nameDisplay: string) => {
				setDirectDisplay(nameDisplay);
			}) ;
			  socket?.on('joinError', (response) => {
			if (!response.room)
				changeComponent(`privchat-${response.msg}`);
			if (response.type === 'public' || response.type === 'protected')
				changeComponent(`pubchat-${response.msg}`);
			else
				changeComponent(`privchat-${response.msg}`);
		})

		socket?.emit('findRoomMessages', {id:roomId}, (messages: Message[]) => {
			setMessages(messages);
		});

		socket?.on('refreshFriends', (newUser: User, undo: boolean) => {
            if (undo)
				setFriends((prev) => prev.filter((old) => old.id !== newUser.id))
			else
				setFriends((prevList) => [...prevList, newUser]);
        })
		socket?.on('refreshMessages', (newMsg: Message, undo: boolean) => {
            if (undo)
				setMessages((prev) => prev.filter((old) => old.id !== newMsg.id))
			else
				setMessages((prevList) => [...prevList, newMsg]);
        })
		socket?.on('refreshType', (newType: string) => {
			setType(newType);
        })
		socket?.on('refreshWhiteList', (newUser: User, undo: boolean) => {
            if (undo)
				setWhiteList((prev) => prev.filter((user) => user.id !== newUser.id))
			else
				setWhiteList((prevList) => [...prevList, newUser]);
        })
		socket?.on('refreshAdmins', (newUser: User, undo: boolean) => {
			if (undo)
				setAdmins((prev) => prev.filter((user) => user.id !== newUser.id))
			else
            	setAdmins((prevList) => [...prevList, newUser]);
        })
		socket?.on('refreshBanned', (newUser: User, unban: boolean) => {
			if (unban)
				setBanned((prev) => prev.filter((user) => user.id !== newUser.id))
            else
				setBanned((prevList) => [...prevList, newUser]);
        })
		socket?.on('refreshConnected', (newUser: User, undo: boolean) => {
            if (undo)
				setConnected((prev) => prev.filter((user) => user.id !== newUser.id))
			else
				setConnected((prevList) => [...prevList, newUser]);
        })
		socket?.on('refreshBlocked', (newUser: User, undo: boolean) => {
            if (undo)
				setBlocked((prev) => prev.filter((user) => user.id !== newUser.id))
			else
				setBlocked((prevList) => [...prevList, newUser]);
        })
		socket?.on('kickUser', (response) => {
            changeComponent(`${returnTo}-You got kicked from ${response.name}`);
        })
		socket?.on('msgError', (response) => {
            setPopMsg(response.message);
            setShowPopup(true);
        })

		const handleClickOutside = (event: MouseEvent) => {
			if (popupRef.current && !popupRef.current.contains(event.target as Node)) {
                setShowPopup(false);
            }
			else if (
			  passPopupRef.current &&
			  event.target &&
			  !passPopupRef.current.contains(event.target as Node)
			) {
			  	setAskPass(false);
				setInputPass('');
				setShowPass('password');
			}
		  };

		  document.addEventListener('mousedown', handleClickOutside);

        return () => {
			document.removeEventListener('mousedown', handleClickOutside);
            socket?.emit('leave', {roomId: roomId}, () => {})
            socket?.off('message');
            socket?.off('joinSuccess');
            socket?.off('joinError');
            socket?.off('refreshFriends');
            socket?.off('refreshMessages');
            socket?.off('refreshType');
            socket?.off('refreshWhiteList');
            socket?.off('refreshAdmins');
            socket?.off('refreshBanned');
            socket?.off('refreshConnected');
            socket?.off('refreshBlocked');
            socket?.off('kickUser');
            socket?.off('msgError');
        };
    // eslint-disable-next-line
}, []);

	const [usersField, setUsersField] = useState('salon');
	const colorField : string = (usersField === 'salon') ? '#0ff'
	: (usersField === 'friends') ? '#f0f' : '#e00';
	const subColorField : string = (usersField === 'salon') ? '#055'
	: (usersField === 'friends') ? '#606' : '#700';

	const UsersList: CSSProperties = {	border: `3px solid ${colorField}`,
		boxShadow: `inset 0 0 50px ${subColorField}, 0 0 10px ${colorField}`,
	}
	const selectUsersField = (field : string) => {
		setUsersField(field);
	}
	const salonButton: CSSProperties = {height: usersField === 'salon' ? '40px': '30px',}
	const blockedButton: CSSProperties = {height: usersField === 'banned' ? '40px': '30px',}
	const friendsButton: CSSProperties = {height: usersField === 'friends' ? '40px': '30px',}

	const [selectedTarget, setSelectedTarget] = useState<User | null>(null);
    const [popupPosition, setPopupPosition] = useState({ x: 0, y: 0 });

	const handleUserClick = (target: User, event: React.MouseEvent<HTMLSpanElement>) => {
		if (target.username !== user.username)
		{
			setSelectedTarget(target);
			setPopupPosition({ x: event.clientX, y: event.clientY });
		}
	};
	const [roomClicked, setRoomClicked] = useState(false);
	const handleRoomClick = (event: React.MouseEvent<HTMLSpanElement>) => {
		setRoomClicked(true);
		setPopupPosition({ x: event.clientX, y: event.clientY });
	}

    const [showPopup, setShowPopup] = useState(false);
    const[popMsg, setPopMsg] = useState('');
    const popupRef = useRef<HTMLDivElement>(null);
    // eslint-disable-next-line
	const handleClickOutside = (event:MouseEvent) => {
		if (popupRef.current && !popupRef.current.contains(event.target as Node)) {
		  setShowPopup(false);
		}
		document.addEventListener('mousedown', handleClickOutside);
		return () => {
		document.removeEventListener('mousedown', handleClickOutside);
		};
	}

	let roomRank: string;
	if (owner) {
		roomRank =  user.id === owner.id ? 'Owner' :
		admins.some((admin) => admin.id === user.id) ? 'Admin' : 'Member';
	}	else {
		roomRank = 'Member';
	}
	let colorCodeRank : string = roomRank === 'Owner' ? '#fa0' : roomRank === 'Admin' ? '#e0e' : '#eee';
	const rankColor: CSSProperties = {
		textShadow:` 0 0 10px ${colorCodeRank}, 0 0 40px ${colorCodeRank}, 0 0 60px ${colorCodeRank}`,
		boxShadow: `0 0 10px ${colorCodeRank}, 0 0 100px ${colorCodeRank}`,
	}

	const [inputText, setInputText] = useState<string>('');
	const handleTyping = (event: React.ChangeEvent<HTMLInputElement>) => {
        if (event.target.value.length >= 200)
            return ;
		setInputText(event.target.value);
	};
	const submitMessage = (e: React.FormEvent) => {
		e.preventDefault();
		if (!inputText)
			return ;
		socket?.emit('createMessage', {roomId: roomId, text:inputText});
		setInputText('');
	}
	const [inputPass, setInputPass] = useState<string>('');
	const [showPass, setShowPass] = useState<string>('password');
	const handlePass = (event: React.ChangeEvent<HTMLInputElement>) => {
		if (event.target.value.length >= 20)
			return ;
		setInputPass(event.target.value);
	};
	const submitPass = (e: React.FormEvent) => {
		e.preventDefault();
		if (!inputPass)
			return;
		socket?.emit('protectRoom', {roomId: room?.id, password: inputPass});
		setInputPass('');
		setAskPass(false);
	}

    // eslint-disable-next-line
    const sortedMessages =  messages.sort((a, b) => b.id - a.id);

	const [askPass, setAskPass] = useState(false);
	const returnTo : string = (room?.type === 'public' || room?.type === 'protected')  ? 'pubchat' : 'privchat';

	const nameDisplay = room?.type ==='direct' ?
	directDisplay
	: room?.name;

	const buttonNerfed: CSSProperties = {cursor: room?.type === 'direct' ? 'default' : 'pointer',}

    return (
		<div className='ChatRoom'>
			<div>
			{/* Popup On Error */}
            {showPopup && <div ref={popupRef} className='passPopup'>
                <div className='popupMsgText'>{popMsg}</div>
			</div>}
			</div>

			{/* Left Block with users options*/}
        <div className='UsersBlock'>
			<div className='UsersTopBar'>
			{room?.type !== 'direct' && <button style={salonButton} className='salonButton' onClick={() => selectUsersField('salon')}>SALON</button>}
			{room?.type !== 'direct' && <button style={blockedButton} className='blockedButton' onClick={() => selectUsersField('banned')}>BANNED</button>}
			{room?.type !== 'direct' && <button style={friendsButton} className='friendsButton' onClick={() => selectUsersField('friends')}>FRIENDS</button>}
			</div>
			<div className='UsersList' style={UsersList}>
			{usersField === 'salon' && filteredWhitelist.map((target) => <EntryUsersChat socket={socket} user={user}
			 target={target} field='salon' changeComponent={changeComponent} handleUserClick={handleUserClick} connected={connected} key={target.id} admins={admins} owner={owner} blocked={blocked} room={room}/>)}
			{usersField === 'banned' && banned.map((target) => <EntryUsersChat socket={socket} user={user}
			 target={target} field='banned' changeComponent={changeComponent} handleUserClick={handleUserClick} connected={connected} key={target.id} admins={admins} owner={owner} blocked={blocked} room={room}/>)}
			{usersField === 'friends' && friends.map((target) => <EntryUsersChat socket={socket} user={user}
			 target={target} field='friends' changeComponent={changeComponent} handleUserClick={handleUserClick} connected={connected} key={target.id} admins={admins} owner={owner} blocked={blocked} room={room}/>)}
			</div>
	    </div>

   			{/* Popup on user selection */}
	<div>
	{selectedTarget && <PopupChat user={selectedTarget} position={popupPosition} setSelectedTarget={setSelectedTarget} socket={socket}
	 room={room} clientName={user.username} changeComponent={changeComponent} field={usersField} whitelist={whitelist} returnTo={returnTo} friends={friends}/>}
   </div>

		<div className='RightBlock'>

   			{/* Upper Block with Chatroom Options */}
			   <div className='RoomBlock'>
			  {room?.type !== 'direct' && <span className='RoomRank' style={rankColor}> <div>Rank : {roomRank} </div> </span>}
			   <button className='RoomName' onClick={handleRoomClick} style={buttonNerfed}> <div>{nameDisplay}</div> </button>
			   <button className='Leave'
			   onClick={() => changeComponent(returnTo)}>
				<div>Leave</div> </button>
			   </div>
   			{/* Popup on room click */}
			{roomClicked && room?.type !== 'direct' && <RoomOptions position={popupPosition} socket={socket} changeComponent={changeComponent} setRoomClicked={setRoomClicked} user={user} admins={admins} room={room} setAskPass={setAskPass} type={type} returnTo={returnTo} />}

			{/* Popup for password */}
				{askPass && <form ref={passPopupRef} className='passPopup' onSubmit={submitPass}>
				<div className='PassTop'>
				<input className='PassInput' type={showPass} placeholder='Password' value={inputPass} onChange={handlePass}/>
				<div className='PassShow' onClick={() => setShowPass(showPass === 'input' ? 'password' : 'input')}>Show</div>
				</div>
				<button className='PassButton'>Submit</button>
				</form>}

				{/* display messages */}
				<div className='MessagesBlock'>
				{messages.map((message) => <MessageEntry author={message.author} text={message.text}  key={message.id} admins={admins} owner={owner} handleUserClick={handleUserClick} blocked={blocked} room={room}/>)}
				</div>

				{/* input for messages */}
				<form className='MessageBar' onSubmit={submitMessage}>
				<input className='InputMessages' placeholder='Your message...' value={inputText}
				onChange={handleTyping}></input>
				<img className='SendIcon' src={sendLogo} onClick={submitMessage} alt='logo'></img>
				</form>
			   </div>
    </div>
  )
}

export default ChatRoom
