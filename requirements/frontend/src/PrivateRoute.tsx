import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './components/home/Home.css'
import { CSSProperties } from 'styled-components';
import LogoutImage from './img/logout.png'

const Container: CSSProperties = {
	height: '70%',
	width: '30%',
	backgroundColor: 'rgba(0, 0, 0, 0.8)',
	borderRadius: '30px',
	display: 'flex',
	flexDirection: 'column',
	justifyContent: 'center',
	alignItems: 'center',
	fontWeight: '1000',
	fontFamily: 'Montserrat, sans-serif',
	color: '#FFFFFF',
	textAlign: 'center',
	textShadow: '0 0 8px rgba(255, 255, 255, 0.8)',
};

const Text: CSSProperties = {
  fontSize: '24px',
  maxWidth: '90%',
  wordWrap: 'break-word',
};

const Image: CSSProperties = {
	maxWidth: '100%',
  };

const PrivateRoute: React.FC<{ children: React.ReactElement }> = ({ children }) => {
  const navigate = useNavigate();
  const [isLogged, setLogged] = useState<boolean | null>(null);

  useEffect(() => {
    const checkUserToken = async () => {
      try {
        const response = await fetch(`http://${process.env.REACT_APP_DOMAIN}:${process.env.REACT_APP_DOMAIN_PORT}/users/profile`, {
          credentials: 'include'
        });

        if (response.status === 403) {
          setLogged(false);
          return;
        }

        if (response.ok) {
          setLogged(true);
        } else {
          setLogged(false);
        }
      } catch (error) {
        setLogged(false);
      }
    };

    checkUserToken();
  }, []);

  useEffect(() => {
    if (!isLogged) {
      const navigateWithDelay = setTimeout(() => {
        navigate('/', { replace: true });
      }, 1000);

      return () => clearTimeout(navigateWithDelay);
    }
  }, [isLogged, navigate]);

  if (isLogged === null) {
	return null;
  }
  
  if (isLogged) {
	return children;
  }

  return (
	<>
	  <div className="baground">
	  <div className='containerFullPage'>
	  	<div style={Container}>
   		 <div style={Text}>You're not logged, return to the login page...</div>
		  <img src={LogoutImage} style={Image} alt='logout'/>
		  </div>
		  </div>
		</div>
	  
	</>
  )
};

export default PrivateRoute;
