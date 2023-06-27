import React from 'react';
import { useState } from 'react';
import './Settings.css'
import '../../css/Text.css'
import settings_svg from '../../img/settings.svg';
import frog_svg from '../../img/frog.svg';
import username_svg from '../../img/username.svg';
import block_svg from '../../img/block.svg';
import lock_svg from '../../img/lock.svg';
import {User} from '../types'
import {Cont, HeaderBar} from '../container/container'
import SettingsUsername from './settingsUsername';
import SettingsAuth from './settingsAuth';
import SettingsAvatar from './settingsAvatar';
import SettingsBlock from './settingsBlock';

type ButtonOptionProps = {
	image?: string;
	text?: string;
	onClick?: () => void;
}

type SettingsOptionsProps = {
	setSelectedOption: (option: string) => void;
  };

const SettingsTitle = () => {
	return (
		<div className='display-settings'>
			<div className='symbol'>
				<img src={settings_svg} alt='settings' className='vector-neon'/>
			</div>
				<p className='text big bold cyan-stroke'>Settings</p>
		</div>
	);
}

const SettingsOptions = ({setSelectedOption}: SettingsOptionsProps) => {

	const handleOptionClick = (option: string) => {
		setSelectedOption(option);
	  };

	return (
		<React.Fragment>
		<Cont padding='0px' width='45%' height='10%' borderBottom='1px solid white'>
			<Option text='Profile'/>
		</Cont>
		<ButtonOption image={frog_svg} text='Avatar' onClick={() => handleOptionClick("avatar")}/>
		<ButtonOption image={username_svg} text='Username' onClick={() => handleOptionClick("username")}/>
		<ButtonOption image={block_svg} text='Blocked users' onClick={() => handleOptionClick("block")}/>
		<Cont  padding='0px' width='95%' height='10%' borderBottom='1px solid white'>
			<Option text='Confidentiality'/>
		</Cont>
		<ButtonOption image={lock_svg} text='2FA authentication'onClick={() => handleOptionClick("lock")}/>
		</React.Fragment>
	);
}

const Option = ({text}: ButtonOptionProps) => {
	return (
		<div style={{ marginTop: '-28px', zIndex: '0' }}>
    		<p className='text big bold purple-stroke'>{text}</p>
		</div>
	);
}

const ButtonOption = ({ image, text, onClick}: ButtonOptionProps) => {

  const handleTextClick = () => {
		if (onClick)
			onClick();
  };

  return (
    <button className='btn'
      style={{ border: 'none', justifyContent: 'left', display: 'flex',
        	   flexDirection: 'row', gap: '1vw', zIndex: '1', backgroundColor: 'transparent' }}
	  onClick={handleTextClick} // call le onclick de props
    >
      <img src={image} alt='' />
      <p className='text bold'>{text}</p>
    </button>
  );
};

interface settingsProps {
	user: User;
	changeComponent: (component: string) => void;
	refreshUser: () => void;
}

function Settings({ user, refreshUser }: settingsProps) {

	const [selectedOption, setSelectedOption] = useState('avatar'); // stock l'option selectionnee

	return (
        <div className="center">
			<Cont width='50vw' height='50vh' direction='column' borderRadius='15px' backgroundColor='rgba(0, 0, 0, 0.75)' minWidth='679px' minHeight='450px'>
				<HeaderBar borderBottom='1px solid #ffffff'>
					<SettingsTitle />
				</HeaderBar>
				<Cont width='100%' height='80%'direction='row'>
					<Cont borderRight='1px solid #ffffff' minHeight='330px' minWidth='237px' width='25vw' height='90%' borderRadius='15px' >
						<SettingsOptions setSelectedOption={setSelectedOption}/>
					</Cont>
					<Cont minWidth='270px' minHeight='340px' width='75vw' height='38vh' alignItems='center'>
						{selectedOption === "username"  && <SettingsUsername user={user} refreshUser={refreshUser} />}
						{selectedOption === "avatar"  && <SettingsAvatar user={user} refreshUser={refreshUser}/>}
						{selectedOption === "block"  && <SettingsBlock />}
						{selectedOption === "lock"  && <SettingsAuth />}
					</Cont>
				</Cont>
			</Cont>
        </div>
    );
}

export default Settings;
