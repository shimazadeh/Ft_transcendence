import { useState, useEffect } from 'react';
import AuthCode from 'react-auth-code-input';

const TwoFASetup = ({ onVerification }: { onVerification: (isVerified: boolean) => void }) => {
  const [qrCodeUrl, setQrCodeUrl] = useState<string | null>(null);
  const [twoFACode, setTwoFACode] = useState('');
  const [isVerified, setIsVerified] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const DOMAIN = process.env.REACT_APP_DOMAIN
  const PORT = process.env.REACT_APP_DOMAIN_PORT

  useEffect(() => {
    const fetchData = async () => {
      const response = await fetch(`http://${DOMAIN}:${PORT}/twofa/generate-2fa-secret`, {
        method: "GET",
        credentials: 'include'
      });

      if(response.ok) {
        const data = await response.text();
        setQrCodeUrl(data);
      } else {
        console.error("Error fetching 2FA secret:", response.status, response.statusText);
      }
    }

    fetchData();
  }, []);

  const handleFormSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    verifyCode();
  };

  const handleCodeChange = (code: string) => {
    setTwoFACode(code);
    if (code.length < 6)
      setErrorMessage(null);
  };

  const verifyCode = async () => {
    try {
      const response = await fetch(`http://${DOMAIN}:${PORT}/twofa/confirm-enable-2fa`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ code: twoFACode }),
        credentials: 'include'
      });
      if(response.ok) {
        setIsVerified(true);
        onVerification(true);
      } else {
        setErrorMessage('Invalid 2FA code')
      }
    } catch (error) {
      console.error(error);
      alert('An Error occured verifying the 2FA code');
    }
  };

  return (
    <div>
      {!isVerified && qrCodeUrl && (
        <>
          <p className='text bold' style={{textAlign: 'center'}}>Please add this QR code to your Two-Factor Authentication app. 
          The two-factor authentication will be activated once the code is validated.</p>
          <div className='twofa-container'>
          <img src={qrCodeUrl} className="qrCodeImage" width={150} height={150} alt="QR code" />
          <form onSubmit={handleFormSubmit}>
            <AuthCode containerClassName="auth-code-container" inputClassName="auth-code-input-cell-settings" allowedCharacters="numeric" onChange={handleCodeChange}/>
            <button type="submit" className='button-2fa'>Verify Code</button>
          </form>
          {errorMessage && <p className="text bold neon-red twofa-error">{errorMessage}</p>}
          </div>
        </>
      )}
    </div>
  );
  
};

export default TwoFASetup;

