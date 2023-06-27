import { useState, useEffect} from 'react';
import { disableTwoFA, check2FA } from '../Api';
import TwoFASetup from './TwoFASetup';

const SettingsAuth = () => {
  const [otpauthUrl, setOtpauthUrl] = useState(null);
  const [qrVisible, setQrVisible] = useState(false);
  const [twoFAVerified, setTwoFAVerified] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      const response = await fetch(`http://${process.env.REACT_APP_DOMAIN}:${process.env.REACT_APP_DOMAIN_PORT}/twofa/generate-2fa-secret`, {
        method: "GET",
        credentials: 'include'
      });
      if (response.ok) {
        await response.text();
        setOtpauthUrl(otpauthUrl);
      } else {
        console.error("Error fetching 2FA secret:", response.status, response.statusText);
      }
      const isTwoFAenabled : boolean = await check2FA();
      setTwoFAVerified(isTwoFAenabled);
    }

    fetchData();
  }, []);

  const handleTwoFA = async (code : string) => {
    try {
      if (code === 'enable') {
        setSuccessMessage(null);
        setQrVisible(true);
      }
      else if (code === 'disable') {
        await disableTwoFA();
        setSuccessMessage('Two-Factor Authentication successfully disabled');
        setTwoFAVerified(false);
        setQrVisible(false);
      }
    } catch (error) {
      console.error(error);
      alert('An Error occured with two-factor authentication');
    }
  };

  const handleVerification = (isVerified: boolean) => {
    setTwoFAVerified(isVerified);
    setQrVisible(!isVerified);
    setSuccessMessage('Two-Factor Authentication successfully enabled')
  };

  return (
    <>
      { !qrVisible && <p className='text bold neon-yellow'>2FA Authentication</p> }
      { !qrVisible && <p className='text bold' style={{textAlign: 'center'}}>For added security, we highly recommend enabling Two-Factor Authentication.</p> }
      { !qrVisible && !twoFAVerified && <button className='button-2fa' onClick={() => handleTwoFA('enable')}>Enable Two Factor Authentication</button> }
      { twoFAVerified && <button className='button-2fa' onClick={() => handleTwoFA('disable')}>Disable Two Factor Authentication</button> }
      { !twoFAVerified && qrVisible && <TwoFASetup onVerification={handleVerification} />}
      {successMessage && <p className="text bold neon-green">{successMessage}</p>}
    </>
  );
}


export default SettingsAuth;
