import { useState, ChangeEvent } from 'react';
import { Cont } from '../container/container'
import { User } from '../types'
import '../../css/Text.css'

interface SettingsUsernameProps {
  user: User;
	refreshUser: () => void;
}

const SettingsUsername = ({ user, refreshUser}: SettingsUsernameProps) => {

  const [gameLogin, setgameLogin] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const handlegameLogin = (event: ChangeEvent<HTMLInputElement>) => {
    setgameLogin(event.target.value);
  }

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError(null);
    setSuccess(null);
    try {
      const response = await fetch(`http://${process.env.REACT_APP_DOMAIN}:${process.env.REACT_APP_DOMAIN_PORT}/users/update-gameLogin`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json'},
        body: JSON.stringify({ gameLogin }),
        credentials: "include",  
      });
      if (!response.ok) {
        const errorData = await response.json();
        setError(errorData.message || 'Something went wrong');
        return;
      }
      setSuccess("Username has been successfully updated.");
      refreshUser();
    } catch (error) {
      if (error instanceof Error) {
        setError(error.message);
      }
    }
  }

  return (
    <Cont alignItems='center' padding='0px' margin='0px' width='380px' height='70%'>
      <p className='text medium neon-purple neon-red'>{user.gameLogin}</p>
      <p className='text bold neon-purple' style={{textAlign: 'center'}}>If you want to change, please enter a new username :</p>
      <input
        className="text bold username-input"
        type="text"
        value={gameLogin}
        onChange={handlegameLogin}
      />
      <br />
      <button 
        className="button-username"
        onClick={handleSubmit} >Change Username</button>
      {error && <p style={{textAlign: 'center'}} className="text bold red neon-red">{error}</p>}
      {success && <p className="text bold green neon-green">{success}</p>}
    </Cont>
  );
}

export default SettingsUsername;
