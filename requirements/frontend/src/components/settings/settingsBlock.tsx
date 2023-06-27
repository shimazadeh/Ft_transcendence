import { useState, useEffect } from 'react';
import { User } from '../types';
import SettingsBlockOnglet from './settingsBlockOnglet';

interface blockedI {
	senderId: number
	sender: User
	recipientId: number
	recipient: User
	id: number
}

const SettingsBlock = () => {

	const [blocked, setBlocked] = useState<blockedI[]>([])

	useEffect(() => {
		const setBlock = async () => {
			const req = `http://${process.env.REACT_APP_DOMAIN}:${process.env.REACT_APP_DOMAIN_PORT}/users/blockUser`
			const data = await fetch(req, { method: "GET", credentials: "include" })
			const list = await data.json()
			setBlocked(list)
		}
		setBlock()
	}, [])

	const updateBlock = (id: number) => {
		setBlocked(prevBlocked => {
			const updatedBlocked = prevBlocked.filter(blocked => blocked.id !== id);
			return updatedBlocked;
		});
	}

	return (
		<>
			<p className='text bold'>Blocked User:</p>
			{blocked.length ?
				(blocked.map((block: blockedI) => <SettingsBlockOnglet key={block.id} block={block} updateBlock={updateBlock} />))
				:
				(< p className='text bold'>Blocked User will apear here ! </p>)
			}
		</>
	);
}

export default SettingsBlock;