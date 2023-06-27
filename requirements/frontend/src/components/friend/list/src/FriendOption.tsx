import '../css/FriendOption.css'
import { User } from '../../../types'
import FriendOptionOnglet from './FriendOptionOnglet'
import FriendOnglet from './FriendOnglet'
import { Socket } from 'socket.io-client'

type propsOption = {
    friend: User
    changeComponent: (component: string) => void;
    change: (compo: string) => void
    socket?: Socket
}


const FriendOption = ({ friend, changeComponent, change, socket }: propsOption) => {

    return (
        <div className='containerFriendOption'>
            <FriendOnglet friend={friend} switchComponent={(id: number) => (id)} />
            {friend.state.startsWith("is") && <FriendOptionOnglet changeComponent={changeComponent} context='watchGame' txt='Watch Game' friend={friend} change={change} socket={socket} />}
            <FriendOptionOnglet changeComponent={changeComponent} context='viewProfile' txt='View Profile' friend={friend} change={change} socket={socket} />            
            <FriendOptionOnglet changeComponent={changeComponent} context='sendMessage' txt='Send Messages' friend={friend} change={change} socket={socket} />
            {friend.state === ("online") && <FriendOptionOnglet changeComponent={changeComponent} context='invitePlay' txt='Invite To play' friend={friend} change={change} socket={socket} />}
            <FriendOptionOnglet changeComponent={changeComponent} context='removeFriend' txt='Remove this User' friend={friend} change={change} socket={socket} />
            <FriendOptionOnglet changeComponent={changeComponent} context='block' txt='Block this User' friend={friend} change={change} socket={socket} />
        </div>
    )
}

export default FriendOption