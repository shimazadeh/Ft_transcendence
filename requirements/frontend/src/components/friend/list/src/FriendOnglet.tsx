import React from 'react'
import '../css/FriendOnlget.css'
import { User } from '../../../types'
import calculRank from '../../../utils'
import { CSSProperties } from 'react';

type Interface = {
    friend: User
    switchComponent: (id: number) => void
}

const FriendOnglet = ({ friend, switchComponent }: Interface) => {

    const rankLogo = {
        position: 'relative' as const,
        marginBottom: '3%',
    }

    const colorStat = (state: string) => {
        if (state !== 'offline')
            return '#30FF83'
        else
            return '#D96161'
    }

    const colorAvatar = (state: string) => {
        if (state !== 'offline')
            return '1'
        else
            return '0.3'
    }

    const nameFriend: CSSProperties = {
        fontSize: '40px',
        textShadow: 'none',
        overflowX: 'auto',
        width: '120%'
    }

    const stateFriendTxt = {
        color: `${colorStat(friend.state)}`,
    }

    const avatarOpacity = {
        opacity: `${colorAvatar(friend.state)}`
    }

    const handleClick = () => {
        switchComponent(friend.id)
    }

    return (
        <div className='containerFriendOnglet' onClick={handleClick}>
            <div style={rankLogo} className={calculRank(friend.elo)} />
            <div className='containerTextFriendName'>
                <div style={nameFriend} className='nameText' >{friend.gameLogin}</div>
                <div style={stateFriendTxt} className='stateFriend'>{friend.state}</div>
            </div>
            <div style={avatarOpacity} className='containerAvatarFriend'>
                <div className='avatar' />
            </div>
        </div>
    )
}

export default FriendOnglet