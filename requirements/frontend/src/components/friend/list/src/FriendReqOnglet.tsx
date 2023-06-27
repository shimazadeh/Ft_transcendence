import { User } from '../../../types';
import '../css/FriendReqOnglet.css'
import { CSSProperties } from 'react';
import { Socket } from 'socket.io-client';

type propsRem = {
	sender: User;
	socket?: Socket
}

const FriendReqOnglet = ({ sender, socket }: propsRem) => {

	const padd: CSSProperties = {
		paddingLeft: '7%',
		overflowX: 'auto',
		textShadow: 'none'
	}

	const handleYes = async () => {
		socket?.emit('acceptFriend', { id: sender.id })
	}

	const handleNo = async () => {
		socket?.emit('refuseFriend', { id: sender.id })
	}

	const handleBloque = async () => {
		socket?.emit('bloqueUser', { id: sender.id })
	}

	return (
		<div className='containerFriendReqOnglet'>
			<div style={padd} className='nameText'>{sender.gameLogin}</div>
			<div className='containerCheck'>
				<div className='yesButton' title='accept' onClick={handleYes} />
				<div className='noButton' title='refuse' onClick={handleNo} />
				<div className='bloqueButton' title='block' onClick={handleBloque} />
			</div>
		</div>
	)
}

export default FriendReqOnglet