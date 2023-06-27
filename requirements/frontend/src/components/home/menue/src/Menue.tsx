import React, { FC } from 'react'
import '../css/Menue.css'
import Play from '../../play/src/Play'
import { User } from '../../../types';

interface MenueProps {
    changeComponent: (component: string) => void;
    user: User;
}

const Menue:FC<MenueProps> = ({changeComponent, user}) => {

  return (
    <div className='containerMenue'>
        <div className='containerLeftMenue'>
            <div className='containerTop'>
                <div
                className='containerFriend'
                onClick={() => changeComponent('friend')}
                >
                    <div className='friendLogo' />
                    <h3 className='friendTxt'>Friends</h3>
                </div>
                <div className='containerStat'
                onClick={() => changeComponent('PublicProfile' + user.id)}
                >
                    <div className='statLogo' />
                    <h3 className='statTxt'>Statistics</h3>
                </div>
                <div className='containerLeader'
                onClick={() => changeComponent('leader')}
                >
                    <div className='leaderLogo' />
                    <h3 className='leaderTxt'>Leader</h3>
                </div>
            </div>
            <div className='containerBot'>
                <div className='containerSettings'
                onClick={() => changeComponent('settings')}
                >
                    <div className='settingsLogo' />
                    <h3 className='settingsTxt'>Settings</h3>
                </div>
                <div className='containerChat'
                onClick={() => changeComponent('privchat')}
                >
                    <div className='chatLogo' />
                    <h3 className='chatTxt'>Chat</h3>
                </div>
                <div className='containerHistoric'
                onClick={() => changeComponent('history')}
                >
                    <div className='historicLogo' />
                    <h3 className='historicTxt'>History</h3>
                </div>
            </div>
        </div>
        <Play changeComponent={changeComponent}/>
    </div>
  )
}

export default Menue
