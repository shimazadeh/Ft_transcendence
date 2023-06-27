import React, {useState, useEffect, useRef} from 'react'
import { CSSProperties } from 'react'
import { io, Socket } from 'socket.io-client';
import { User } from '../types';
import RoomEntry from './RoomEntry';
import retLogo from '../../img/navBar/returnLogo.png'
import friendImage from '../../img/menue/friend.png'
import Message from './MessageEntry';
import './RoomSelect.css'
import ChatRoom from './ChatRoom';
import { Room } from './chatTypes';

interface PassObj {
    id: number;
    roomName: string;
    type: string;
    owner?: string;
}

interface Props {
    user: User;
    socket?: Socket;
    changeComponent: (component: string) => void;
    message?: string;
    status: string;
}

const RoomSelect:React.FC<Props> = ({user, socket, changeComponent, message, status}) => {

    const username = user.username;
    const [rooms, setRooms] = useState<Room[]>([]);
    const [hover, setHover] = useState<boolean>(false);

    const [createRoom, setCreateRoom] = useState<boolean>(false);

    const [showPopup, setShowPopup] = useState(false);
    const [popMsg, setPopMsg] = useState('');

    const [showPass, setShowPass] = useState(false);
    const [pass, setPass] = useState('');
    const [passInfo, setPassInfo] = useState<PassObj>();

    const popupRef = useRef<HTMLDivElement>(null);
    const createRef = useRef<HTMLFormElement>(null);
    const passRef = useRef<HTMLFormElement>(null);

    useEffect(() => {
        if (message)
        {
            setPopMsg(message);
            setShowPopup(true);
        }

        socket?.emit('findAllRooms', {}, (response: Room[]) => setRooms(response));
        socket?.on('disconnect', () => {
            console.log('Disconnected from Socket.IO server');
        });

        socket?.on('connect_error', (error) => {
            console.log('Connection error:', error);
        });
        socket?.on('errorMessage', (msg) => {
            setPopMsg(msg);
            setShowPopup(true);
        })
        socket?.on('passError', (response) => {
            setPopMsg(response.message);
            setShowPopup(true);
        })
        socket?.on('passSuccess', (response) => {
            const toRoom : string = 'room' + response.id;
            changeComponent(toRoom);
        })
        socket?.on('newRoom', (room: Room) => {
            setRooms((prevRooms) => [...prevRooms, room]);
        })
        socket?.on('deleted', (roomId: number) => {
            setRooms((prevRooms) => prevRooms.filter(room => room.id !== roomId));
        })
        const handleClickOutside = (event:MouseEvent) => {
            if (popupRef.current && !popupRef.current.contains(event.target as Node)) {
                setShowPopup(false);
            }
            else if (createRef.current && event.target && !createRef.current.contains(event.target as Node)) {
                setCreateRoom(false);
                setCreateRoomName('');
            }
            else if (passRef.current && event.target && !passRef.current.contains(event.target as Node)) {
                setShowPass(false);
                setPass('');
                setPassVisible('password');
            }
        }
        document.addEventListener('mousedown', handleClickOutside);
      return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      };
    }, []);

    const privateRooms = rooms.filter(room => room.type === 'private' || room.type === 'direct');
    const publicRooms = rooms.filter(room => room.type !== 'private' && room.type !== 'direct');

    const handleSelect = (id: number, roomName: string, type: string, owner?: string) => {
        if (type === 'protected' && showPass === false && owner !== user.username)
        {
            setPassInfo({id: id, roomName:roomName, type:type, owner:owner});
            setShowPass(true);
            return ;
        }
        socket?.emit('verifyPassword', {roomId:id, password: pass});
        setPass('');
        setShowPass(false);
    };
    const submitPass = (e:React.FormEvent) => {
        e.preventDefault();
        if (passInfo)
            handleSelect(passInfo.id, passInfo.roomName, passInfo.type, passInfo.owner);
        setPassVisible('password');
    }

    const handlePassTyping = (event: React.ChangeEvent<HTMLInputElement>) => {
        if (event.target.value.length >= 20)
            return ;
        setPass(event.target.value);
    };

    const [roomsDisplayed, setRoomsDisplayed] = useState<string>(status);
    const colorPrivA = roomsDisplayed === 'PUBLIC' ? '#0ff' : '#f0f';
    const colorPrivB = roomsDisplayed === 'PUBLIC' ? '#055' : '#a0a';
    const colorCreaA = roomsDisplayed === 'PUBLIC' ? '#0f5' : '#d52';
    const colorCreaB = roomsDisplayed === 'PUBLIC' ? '#093' : '#a31';
    const variables = document.documentElement;
    variables.style.setProperty('--salon-a', colorPrivA);
    variables.style.setProperty('--salon-b', colorPrivB);
    variables.style.setProperty('--crea-a', colorCreaA);
    variables.style.setProperty('--crea-b', colorCreaB);
    const createRoomText = roomsDisplayed === 'PUBLIC' ? 'Create Public Room' : 'Create Private Room';

    const submitCreateRoom = (e:React.FormEvent) => {
        e.preventDefault();
        if (!createRoomName)
            return;
        socket?.emit('createRoom', { roomName:createRoomName, type:createType},
        (response: Room) => {
            setCreateRoomName('');
            setCreateRoom(false);
        })
    }

    const createType: string = roomsDisplayed === 'PUBLIC' ? 'public' : 'private';
    const [createRoomName, setCreateRoomName] = useState<string>('');
    const handleCreateTyping = (event: React.ChangeEvent<HTMLInputElement>) => {
        if (event.target.value.length >= 14 || (event.target.value && /^[a-zA-Z0-9_-éèàç]+$/.test(event.target.value) === false))
            return ;
        setCreateRoomName(event.target.value);
    }

    const [passVisible, setPassVisible] = useState<string>('password');

  return (
        <div className='Container'>

            {/* Top bar with select rooms options */}
            <div className='TopBar'>
            <span className='ChatRoomsText'>CHAT ROOMS</span>
            <button className='SalonType' 
                onClick={() => setRoomsDisplayed(roomsDisplayed === 'PUBLIC' ? 
                'PRIVATE':'PUBLIC')}>{roomsDisplayed}</button>
                <button className='CreateButton' 
                onClick={() => setCreateRoom(true)}>{createRoomText}</button>
                <div className='friendBox'>
                    <img className='friendImg' src={friendImage} onClick={() => changeComponent('friend')}></img>
                </div>
            </div>

            {/* Selection of Rooms */}
            <div className='SelectScreen'>
            {roomsDisplayed === 'PUBLIC' && publicRooms.length === 0 && <div className='EmptySelection'>You don't have any rooms yet !</div>}
            {roomsDisplayed === 'PRIVATE' && privateRooms.length === 0 && <div className='EmptySelection'>You don't have any rooms yet !</div>}
            {roomsDisplayed === 'PUBLIC' && publicRooms.map((room) => <RoomEntry room={room} key={room.id} handleSelect={handleSelect} socket={socket} user={user}/>)}
            {roomsDisplayed === 'PRIVATE' && privateRooms.map((room) => <RoomEntry room={room} key={room.id} handleSelect={handleSelect} socket={socket} user={user}/>)}
            </div>

            {/* Create Room popup */}
            {createRoom && <form ref={createRef} className='passPopup' onSubmit={submitCreateRoom}>
				<input className='createPopupInput' placeholder='Room name...' value={createRoomName} onChange={handleCreateTyping}/>
				<button className='PassButton'>Submit</button>
				</form>}

            {/* Ask password popup */}

                {showPass && <form ref={passRef} className='passPopup' onSubmit={submitPass}>
				<div className='PassTop'>
				<input className='createPopupInput' type={passVisible} placeholder='Password...' value={pass} onChange={handlePassTyping}/>
				<div className='PassShow' onClick={() => setPassVisible(passVisible === 'input' ? 'password' : 'input')}>Show</div>
				</div>
				<button className='PassButton'>Submit</button>
				</form>}

            {/* Error popup */}
            {showPopup && <div ref={popupRef} className='passPopup'>
                <div className='errorMessage'>{popMsg}</div>
			</div>}

        </div>
  )
}

export default RoomSelect
