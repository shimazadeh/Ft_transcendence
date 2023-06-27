import '../css/FriendOptionOnglet.css'
import { User } from '../../../types';
import ConfirmationPopUp from '../../../popup/ConfirmationPopUp';
import { useState } from 'react';
import { Socket } from 'socket.io-client';


type PropsOnglet = {
    txt: string;
    context: string;
    changeComponent: (component: string) => void;
    friend: User
    change: (compo: string) => void
    socket?: Socket
}

const FriendOptionOnglet = ({ changeComponent, context, txt, friend, change, socket }: PropsOnglet) => {

    const [visible, setVisible] = useState(false)
    let stop = false
    const [message, setMessage] = useState('void')

    const onConfirm = (confirm: boolean) => {
        if (confirm && context === 'removeFriend') {
            actionRemove()
        }
        if (confirm && context === 'block') {
            block()
        }
        if (!confirm)
            stop = true
    }

    const onVisible = (state: boolean) => {
        setVisible(state)
    }

    const handleClick = () => {
        if (context === 'watchGame')
            watchGame()
        else if (context === 'viewProfile')
            viewProfile()
        else if (context === 'sendMessage')
            sendMessage()
        else if (context === 'block')
            blockFriend()
        else if (context === 'invitePlay')
            invitePlay()
        else if (context === 'removeFriend')
            removeFriend()
    }

    const removeFriend = () => {
        setMessage("Delete this User ?")
        if (!stop)
            setVisible(true)
        if (stop)
            stop = true;
    }

    const blockFriend = () => {
        setMessage("Block this User ?")
        if (!stop)
            setVisible(true)
        if (stop)
            stop = true;
    }

    const actionRemove = async () => {
        socket?.emit('deleteFriend', { id: friend.id })
        change('add')
    }

    const invitePlay = () => {
        changeComponent('invitePlay' + friend.id)
    }

    const block = () => {
        socket?.emit('bloqueFriend', { id: friend.id })
        change('add')
    }

    const sendMessage = () => {
        changeComponent('chat');
        socket?.emit('createDirectMessage', {targetId: friend.id});
    }

    const viewProfile = () => {
        const compo = "PublicProfile" + friend.id
        changeComponent(compo);
    }

    const watchGame = () => {
        const compo = "watch" + friend.id
        changeComponent(compo)
    }

    let imageUrl = require('../../../../img/yes.png')
    if (context === 'watchGame')
        imageUrl = require('../../../../img/watch.png')
    else if (context === 'sendMessage')
        imageUrl = require('../../../../img/menue/chat.png')
    else if (context === 'block')
        imageUrl = require('../../../../img/bloque.png')
    else if (context === 'invitePlay')
        imageUrl = require('../../../../img/invite.png')
    else if (context === 'removeFriend')
        imageUrl = require('../../../../img/remove.png')

    const style = {
        backgroundImage: `url(${imageUrl})`,
        minHeight: '36px',
        minWidth: '36px',
    }

    const styleImage = {
        backgroundImage: `url(${imageUrl})`,
        minHeight: '30px',
        minWidth: '30px',
    }

    const padding = {
        paddingLeft: '15px'
    }

    return (
        <div className='containerFriendOptionOnglet' onClick={handleClick}>
            {visible === true && <ConfirmationPopUp onConfirm={onConfirm} onVisible={onVisible} opacity={true} message={message} />}
            <div className='nameText' style={padding}>{txt}</div>
            {context === 'sendMessage' ?
                (<div className='image' style={styleImage} />) :
                (<div className='image' style={style} />)
            }
        </div>
    )
}

export default FriendOptionOnglet
