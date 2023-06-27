import React, { useState } from "react";
import { setTwoFAVerified, verifyTwoFACode } from "../Api";
import AuthCode from 'react-auth-code-input';
import { CSSProperties } from "styled-components";
import './Login.css'
import Lock from './../../img/et_lock.svg'

const Form: CSSProperties = {
	width: '80%',
	margin: '20px 0',
};

const AuthCodeContainer: CSSProperties = {
	display: 'flex',
	justifyContent: 'center',
	margin: '20px 0',
	flexDirection: 'row'
  };

interface Verify2FAProps {
  onVerifySuccess: () => void;
}

const Verify2FA: React.FC<Verify2FAProps> = ({onVerifySuccess}) => {
  const [code, setCode] = useState("");
  const [error, setError] = useState<string | null>(null);

  const handleInputChange = (code: string) => {
    setCode(code);
    if (code.length < 6) {
        setError(null);
    }
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    try {
      await verifyTwoFACode(code);
      await setTwoFAVerified();
      setError(null);
      onVerifySuccess();
    } catch (error) {
      setError("Invalid 2FA code.");
    }
  };

  return (
	<div className="baground">
	  <div className='containerFullPage'>
		<div className='container'>
		  <img src={Lock} className='lock-image' />
	      <h1>Verify 2FA</h1>
	      <form onSubmit={handleSubmit} style={Form}>
			<h3>This account has two-factor authentication enabled.</h3>
	        <label>
	          Enter your 2FA code:
	        </label>
	        <div style={AuthCodeContainer}>
	          <AuthCode containerClassName="auth-code-container" inputClassName="auth-code-input-cell" allowedCharacters="numeric" onChange={handleInputChange}/>
	        </div>
	        <button type="submit" className="button neon-button" >Verify Code</button>
	      </form>
	      <div style={{width: '80%'}}>
	        {error && <p className="bold neon-red">{error}</p>}
	      </div>
	    </div>
	  </div>
	</div>
  );
}

export default Verify2FA;
