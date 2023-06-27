import React from 'react'
import { CSSProperties } from 'styled-components';
import { User } from '../types';
import { Room } from './chatTypes';


interface Props {
    author : User;
    text: string;  
    admins : User[];
    owner: User | undefined;
    handleUserClick: (target: User, event: React.MouseEvent<HTMLSpanElement>) => void;
    blocked: User[];
    room?: Room;
}

const MessageEntry:React.FC<Props> = ({author, text, admins, owner, handleUserClick, blocked, room}) => {
	
  let roomRank: string;
	if (owner && room?.type !== 'direct') {
		roomRank =  author.id === owner.id ? 'Owner' :
		admins.some((admin) => admin.id === author.id) ? 'Admin' : 'Member';
	}	else {
		roomRank = 'Member';
	}
	let colorCodeRank : string = roomRank === 'Owner' ? '#fe0' : roomRank === 'Admin' ? '#e0e' : '#fff';

const messageStyle: CSSProperties = {
    color: colorCodeRank,  fontFamily: 'Montserrat, sans-serif', fontSize: '18px',
    padding: '4px', paddingLeft: '10px', paddingRight: '10px'
}
const authorStyle: CSSProperties = {
  color: colorCodeRank, cursor: 'pointer',
}
const textStyle: CSSProperties = {
  color: '#ccc',
}

  const hide : boolean = blocked.some((guy) => guy.id === author.id);

  return (
    <div>
    {!hide && <div style={messageStyle}>
       <span style={authorStyle} onClick={(e) => handleUserClick(author, e)}> [{author.gameLogin}] :   </span>
    <span style={textStyle}>{text}</span>
    </div>}
    </div>
  )
}

export default MessageEntry
