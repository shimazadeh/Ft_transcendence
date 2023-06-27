import React from 'react';
import './Home.css'
import { useNavigate } from "react-router-dom"
import { useState, useEffect } from 'react';
import Name from './header/NameLeft/src/Name';
import NavBar from './header/NavBar/src/NavBar';
import Play from './play/src/Play';
import Menue from './menue/src/Menue';
import History from '../popup/History/History';
import Rank from '../popup/Rank/Rank';
import Classement from '../popup/Rank/Classement';
import Settings from '../settings/Settings';
import Stats from '../popup/Stats/Stats';
import Friend from '../friend/list/src/friend';
import { User } from '../types'
import Game from './play/src/Game';
import RoomSelect from '../chat/RoomSelect';
import { io, Socket } from 'socket.io-client';
import GameChoice from './play/src/GameChoice';
import Queue from './play/src/Queue';
import InvitePlay from './play/src/InvitePlay';
import ConfirmationPopUp from '../popup/ConfirmationPopUp';
import Verify2FA from '../Login/Verify-2fa';
import { check2FA, check2FAVerified, unsetTwoFAVerified, getUserProfile, logout } from '../Api';
import SelectLogin from '../Login/SelectLogin';
import SelectAvatar from '../Login/SelectAvatar';
import GameOver from './play/src/Game-over';
import PublicProfile from '../popup/PublicProfile';
import ChatRoom from '../chat/ChatRoom'

function Home() {

    const [user, setUser] = useState<User>({ username: '', id: -1, elo: -1, win: -1, loose: -1, createAt: '', updateAt: '', state: 'inexistant' })
    const [activeComponent, setActiveComponent] = useState<string>('play')
    const [stack, setStack] = useState<string[]>([]);
    const [socket, setSocket] = useState<Socket>();
    const [message, setMessage] = useState('void')
    const [visible, setVisible] = useState(false)
    const navigate = useNavigate()
    const existingRanks: string[] = ['bronze', 'silver', 'gold', 'crack', 'ultime'];
    const userRank: string =  user.elo > 5000 || user.elo < 0 ? 'ultime' : existingRanks[Math.floor(user.elo / 1000)];
    const [twoFAEnabled, setTwoFAEnabled] = useState<boolean>(false);
    const [is2FAVerified, set2FAVerified] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [friendIdInvite, setFriendIdInvite] = useState(-1)
    const [modeInvite, setModeInvite] = useState('invite')
    // const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

    const push = (item: string) => {
        setStack([...stack, item])
    }
    const pop = () => {
        setStack(stack.slice(0, -1))
    };
    const front = () => {
        if (activeComponent.startsWith("game"))
            socket?.emit("player-left");
        if (activeComponent.startsWith("watch"))
            socket?.emit("spectator-left")
        if (stack.length === 1) {
            setActiveComponent(stack[stack.length - 1])
            return;
        }
        if (stack.length === 0) {
            setActiveComponent('play')
            return;
        }
        if (stack[stack.length - 1].startsWith("game") || stack[stack.length - 1].startsWith("watch") )
        {
            setActiveComponent(stack[stack.length - 2]);
            pop();
            pop();
        }
        else{
            setActiveComponent(stack[stack.length - 1])
            pop()
        }

    }

    const onVisible = (state: boolean) => {
        setVisible(state)
    }

    const onConfirm = (confirm: boolean) => {
        if (confirm) {
            setModeInvite('receive')
            changeComponent('invitePlay' + friendIdInvite)
        }
        if (!confirm) {
            socket?.emit('refuseInvitation', { id: friendIdInvite })
        }
    }

    const changeMode = () => {
        if (modeInvite === 'receive')
            setModeInvite('invite')
    }

    const changeComponent = (component: string) => {
        if (activeComponent.startsWith("game"))
            socket?.emit("player-left");
        if (activeComponent.startsWith("watch"))
            socket?.emit("spectator-left");
        if (activeComponent !== component && !activeComponent.startsWith("queue") && !activeComponent.startsWith('invitePlay')) {
            push(activeComponent)
        }
        setActiveComponent(component)
    }

    const getUser = async () => {
        const userFromServer = await getUserProfile();
        setUser(userFromServer)
    }

    useEffect(() => {
        getUser()

        const sock = io(`http://${process.env.REACT_APP_DOMAIN}:${process.env.REACT_APP_DOMAIN_PORT}`, { withCredentials: true });
        setSocket(sock);
        sock.on('invitePlayReq', async ({ friendId }: { friendId: number }) => {
            setFriendIdInvite(friendId)
            getMessage(friendId)
            setVisible(true)
        })

        sock.on('closePopup', () => {
            setVisible(false);
        })

        return () => {
            socket?.disconnect();
            socket?.off('invitePlayReq')
        };
    // eslint-disable-next-line
}, [])


    const fecthMessage = async (id: number) => {
        const data = await fetch(`http://${process.env.REACT_APP_DOMAIN}:${process.env.REACT_APP_DOMAIN_PORT}/friend/` + id, {
            method: "GET",
            credentials: "include",
        });
        const username = await data.text()
        return username
    }

    const getMessage = async (id: number) => {
        const message = await fecthMessage(id)
        const txt = 'Player ' + message + '  invite you to play'
        setMessage(txt)
    }

    const extractId = (str: string) => {
        const regex = /\d+/g;
        const numbers = str.match(regex)
        if (numbers)
            return numbers[0]
        else
            return -1
    }

    const extractText = (str: string) => {
        return str[str.length - 1]
    }

	const handleLogout = async () => {
		try {
          if (activeComponent.startsWith("game"))
            socket?.emit("player-left");
          await unsetTwoFAVerified();
		  await logout();
		  navigate('/');
          socket?.disconnect()
		} catch (error) {
		  console.error("Error while disconnect :", error);
		}
	  };

const handle2FASuccess = () => {
    set2FAVerified(true);
}


const check2FAEnabled = async () => {
    try {
        const result = await check2FA();
        setTwoFAEnabled(result);
        setIsLoading(false);
    } catch (error) {
        console.error(error);
        setIsLoading(false);
    }
}

useEffect(() => {
    check2FAEnabled();
}, []);

const TwoFAVerified = async () => {
    try {
        const result = await check2FAVerified();
        set2FAVerified(result);
        setIsLoading(false);
    } catch (error) {
        console.error(error);
        setIsLoading(false);
    }
}

useEffect(() => {
    TwoFAVerified();
}, []);

    if (isLoading) {
        return <div className="baground"/>
    }
	if (twoFAEnabled && !is2FAVerified) {
		return <Verify2FA onVerifySuccess={handle2FASuccess} />;
	}
    if (user.avatarSelected === false) {
        return <SelectAvatar user={user} refreshUser={getUser} />;
    }
	if (user.gameLogin === null)
	{
		return <SelectLogin user={user} onLoginUpdated={getUser}  />;
	}


    return (
        <div className="baground">
            <div className='containerFullPage'>
                <div className='containerRectangle'>
                    <div className='rectangleLeft' />
                    <div className='rectangleRight' />
                    <div className='rectangleTop' />
                    <div className='rectangleBottomLeft' />
                    <div className='rectangleBottomRight' />
                    {activeComponent !== "login" && <div className='containerHeader'>
                        <Name
                            user={user}
                            changeComponent={changeComponent}
                        />
                        <NavBar
							user={user}
                            changeComponent={changeComponent}
                            front={front}
                            handleLogout={handleLogout}
                        />
                    </div>}
                    <div className='containerCenter'>

                        {visible === true && <ConfirmationPopUp onConfirm={onConfirm} onVisible={onVisible} opacity={true} message={message} />}
                        {activeComponent === "play" && <Play changeComponent={changeComponent} />}
                        {activeComponent.startsWith("game") && <Game changeComponent={changeComponent} socket={socket} opponentID={extractId(activeComponent.substring(0,activeComponent.length - 1))} gameMode={activeComponent[activeComponent.length - 1]} watchmode={false}/>}
                        {activeComponent.startsWith("invitePlay") && <InvitePlay changeComponent={changeComponent} name={user.gameLogin} socket={socket} friendId={+extractId(activeComponent)} mode={modeInvite} changeMode={changeMode} previousActiveComponent={front}/>}
                        {activeComponent.startsWith("GameOver") && <GameOver changeComponent={changeComponent} msg={activeComponent.substring(8,activeComponent.length - 1)} />}
                        {activeComponent === "menue" && <Menue changeComponent={changeComponent} user={user} />}
                        {activeComponent === "settings" && <Settings user={user} changeComponent={changeComponent} refreshUser={getUser} />}
                        {activeComponent === "history" && <History changeComponent={changeComponent}/>}
                        {activeComponent === "stat" && <Stats user={user} changeComponent={changeComponent} />}
                        {activeComponent === "friend" && <Friend changeComponent={changeComponent} socket={socket}/>}

                        {activeComponent.startsWith('privchat') && <RoomSelect user={user} socket={socket} changeComponent={changeComponent}
                        message={activeComponent.substring(9)} status='PRIVATE'/>}
                        {activeComponent.startsWith('pubchat') && <RoomSelect user={user} socket={socket} changeComponent={changeComponent}
                        message={activeComponent.substring(8)} status='PUBLIC'/>}
                        {activeComponent.startsWith("room") && <ChatRoom roomIdStr={activeComponent.substring(4)} user={user} socket={socket} changeComponent={changeComponent} />}

                        {activeComponent === "leader" && <Classement rank={userRank} changeComponent={changeComponent} />}
                        {activeComponent === "bronzeLead" && <Classement rank={'bronze'} changeComponent={changeComponent} />}
                        {activeComponent === "silverLead" && <Classement rank={'silver'} changeComponent={changeComponent} />}
                        {activeComponent === "goldLead" && <Classement rank={'gold'} changeComponent={changeComponent} />}
                        {activeComponent === "crackLead" && <Classement rank={'crack'} changeComponent={changeComponent} />}
                        {activeComponent === "ultimeLead" && <Classement rank={'ultime'} changeComponent={changeComponent} />}
                        {activeComponent.startsWith("watch") && <Game changeComponent={changeComponent} socket={socket} opponentID={extractId(activeComponent)} gameMode={activeComponent[activeComponent.length - 1]} watchmode={true} />}
						{activeComponent.startsWith("PublicProfile") && <PublicProfile profileId={extractId(activeComponent)} changeComponent={changeComponent} />}
                        {activeComponent.startsWith("queue") && <Queue mode={extractText(activeComponent)} name={user.gameLogin} socket={socket} changeComponent={changeComponent} />}
                        {activeComponent === "rank" && <Rank user={user} changeComponent={changeComponent} />}
                        {activeComponent === "Choices" && <GameChoice changeComponent={changeComponent} />}
                    </div>
                </div>
            </div>
        </div>
    );
}

export default Home;
