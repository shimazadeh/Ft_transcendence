import React, { FC } from 'react'
import { useState, useEffect } from 'react';
import '../css/friend.css'
import { User } from '../../../types';
import FriendOnglet from './FriendOnglet';
import FriendAdd from './FriendAdd';
import FriendRequest from './FriendRequest';
import FriendOption from './FriendOption';
import { Socket } from 'socket.io-client';

interface FriendProps {
  changeComponent: (component: string) => void;
  socket?: Socket;
}

interface FriendInterface {
  id: number;
  createdAt: string;
  userId: number
  friendId: number
  friend: User
}

interface friendReq {
  id: number;
  senderId: number;
  recipientId: number;
  sender: User
}

const Friend: FC<FriendProps> = ({ changeComponent, socket }) => {

  const [friend, setFriend] = useState<FriendInterface[]>([])
  const [searchText, setSearchText] = useState<string>('')
  const [searchFriend, setSearchFriend] = useState<FriendInterface[]>([])
  const [component, setComponent] = useState<string>('add')
  const [friendReq, setFriendReq] = useState<friendReq[]>([])
  const [option, setOption] = useState(0)


  useEffect(() => {
    socket?.emit('getFriend', {}, (response: FriendInterface[]) => {
      setFriend(response)
      setSearchFriend(sortFriend(response))
    })
    socket?.emit('getFriendReq', {}, (response: friendReq[]) => {
      setFriendReq(response)
    })
    socket?.on('friendRequestNotification', ({ req }: { req: friendReq }) => {
      setFriendReq((prevFriendReq) => [...prevFriendReq, req])
      console.log("Request from on", req)
    })
    socket?.on('receiveFriend', ({ friends }: { friends: FriendInterface[] }) => {
      setFriend(friends)
      setSearchFriend(sortFriend(friends))
    })
    socket?.on('receiveReq', ({ req }: { req: friendReq[] }) => {
      if (Array.isArray(req))
        setFriendReq(req)
      else
        setFriendReq([])
    })
    return () => {
      socket?.off('friendRequestNotification')
      socket?.off('receiveFriend')
      socket?.off('receiveReq')
    }
  }, [])

  const sortFriend = (friend: FriendInterface[]) => {
    return friend.sort((a, b) => (a.friend.state !== 'offline' ? -1 : 1))
  }

  const handleSearch = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value.toLowerCase()
    setSearchText(value)
    const filteredFriends = friend.filter((friend) => friend.friend.gameLogin?.toLowerCase().startsWith(value))
    const sortedFriend = filteredFriends.sort((a, b) => (a.friend.state !== 'offline' ? -1 : 1))
    setSearchFriend(sortedFriend)
  }

  const changeComponentFriend = (compo: string) => {
    setComponent(compo)
  }

  const handleClick = () => {
    if (component === 'add')
      setComponent('friendRequest')
    else
      setComponent('add')
  }

  const switchComponent = (id: number) => {
    setComponent('friend')
    setOption(id)
  }

  return (
    <div className='containerFriends' >
      <div className='containerLeft'>
        <div className='containerSearchHeader'>
          <div className='containerSearch'>
            <input className='inputFriend' type='text' value={searchText} onChange={handleSearch} placeholder='FriendName' />
            <div className='loopButton' />
          </div>
          <div className='containerAddFriend'>
            {(component === 'friendRequest' || component === 'friend') && <div className='addFriendLogo' onClick={handleClick} title='add friend' />}
            {component === 'add' && friendReq.length && <div className='mailLogo' onClick={handleClick} title='you get a friend request !' />}
            {component === 'add' && !friendReq.length && <div className='mailLogo2' onClick={handleClick} title='friend request' />}
          </div>
        </div>
        <div className='containerFriendBody'>
          <div className='containerFriendBodyLeft'>
            {!searchFriend.length ?
              (<div className='noFriend'><p className='pFriend'>Your friends will appear here !</p></div>) :
              (searchFriend.map((friend) =>
                <FriendOnglet key={friend.id} friend={friend.friend} switchComponent={switchComponent} />
              ))
            }
          </div>
          <div className='containerFriendBodyRight'>
            {component === 'add' && <FriendAdd socket={socket} />}
            {component === 'friendRequest' && <FriendRequest sender={friendReq} socket={socket} />}
            {component === 'friend' && <FriendOption friend={searchFriend[searchFriend.findIndex((friend) => friend.friendId === option)].friend} changeComponent={changeComponent} change={changeComponentFriend} socket={socket} />}
          </div>
        </div>
      </div>
    </div >
  )
}

export default Friend