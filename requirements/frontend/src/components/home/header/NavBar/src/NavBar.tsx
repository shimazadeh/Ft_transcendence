import React, { FC } from 'react'
import '../css/NavBar.css'
import { User } from '../../../../types';

interface NavBarProps {
	user: User
    changeComponent: (component: string) => void;
    front: () => void;
	handleLogout: () => void;
}

const NavBar: FC<NavBarProps> = ({user, changeComponent, front, handleLogout }) => {
  return (
    <div className='containerNavBar'>
      <div
        onClick={() => front()}
        className='returnLogo'
        title='return'
      />
      <div
        onClick={() => changeComponent("menue")}
        className='menueLogo'
        title='menue'
      />
      <div
        onClick={handleLogout}
        className='logoutLogo'
        />
        <div
        onClick={() => changeComponent('PublicProfile' + user.id)}
		style={{backgroundImage: `url(${user.avatar})`}}
        className='avatar'
        title='stat'
      />
    </div>
  )
}

export default NavBar