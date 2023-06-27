import React, { ChangeEvent, useRef, useState } from 'react';
import './Login.css';
import { User } from '../types';
import AvatarEditor from 'react-avatar-editor';
import { setAvatarSelected, setDefaultAvatar, updateAvatar } from '../Api';

interface SelectLoginProps {
  user: User;
  refreshUser: () => void; 
}

interface Position {
	x: number;
	y: number;
  }
  
  interface State {
	image: string;
	allowZoomOut: boolean;
	position: Position;
	scale: number;
	rotate: number;
	borderRadius: number;
	preview: null | string;
	width: number;
	height: number;
  }

const SelectAvatar: React.FC<SelectLoginProps> = ({user, refreshUser}) => {
  const [isDefaultAvatar, setIsDefaultAvatar] = useState<boolean>(false);
	const editorRef = useRef<AvatarEditor | null>(null);
	const [errorMessage, setErrorMessage] = useState<string | null>(null);

	const initialState: State = {
	  image: '',
	  allowZoomOut: false,
	  position: { x: 0.5, y: 0.5 },
	  scale: 1,
	  rotate: 0,
	  borderRadius: 50,
	  preview: null,
	  width: 100,
	  height: 100,
	}
	const [state, setState] = useState<State>(initialState);

  const handleScale = (event: ChangeEvent<HTMLInputElement>) => {
		const scale = parseFloat(event.target.value);
		setState({ ...state, scale });
    setErrorMessage(null);
	  };
	
	  const handlePositionChange = (position: Position) => {
		setState({ ...state, position });
    setErrorMessage(null);
	  };

    const handleNewImage = (event: ChangeEvent<HTMLInputElement>) => {
      if (event.target.files && event.target.files.length > 0) {
        const file = event.target.files[0];
  
        if (!file.type.startsWith('image/')) {
        setErrorMessage('Please select an image file.');
        return;
        }
  
        const imageUrl = URL.createObjectURL(file);
        setState({ ...state, image: imageUrl });
        setIsDefaultAvatar(false);
        setErrorMessage(null);
      }
      };

      const handleSkip = async () => {
        await setDefaultAvatar();
        await setAvatarSelected();
        refreshUser();
      }
    
      const handle42AvatarSelected = async () => {
        await setAvatarSelected();
        refreshUser();
      }

      const handleSubmit = async () => {
        if (isDefaultAvatar) {
          return;
        }
        if (!state.image) {
          setErrorMessage(null);
          setErrorMessage('No avatar selected!');
          return;
        }
        if (editorRef.current) {
          const img = editorRef.current.getImageScaledToCanvas().toDataURL();
    
          fetch(img)
          .then(res => res.blob())
          .then(async (blob) => {
            const file = new File([blob], "user_avatar.png", { type: "image/png" });
            try {
            await updateAvatar(file);
            await setAvatarSelected();
            refreshUser();
            } catch (err) {
            if (err instanceof Error)
              setErrorMessage(err.message);
            }
          })
        }
        };

  return (
    <div className="baground">
      <div className='containerFullPage'>
        <div className='container-avatar'>
          <div className='selectAvatar-container'>
            <h4>You can set your 42 profile image as avatar</h4>
            <img className='avatar-select' src={user.avatar} />
            <button className='button-avatar' onClick={handle42AvatarSelected}>Select 42 avatar</button>
            <h4>Or upload a new avatar</h4>
              <AvatarEditor
              ref={editorRef}
              scale={state.scale}
              width={state.width}
              height={state.height}
              position={state.position}
              onPositionChange={handlePositionChange}
              rotate={parseFloat(state.rotate.toString())}
              borderRadius={state.width / (100 / state.borderRadius)}
              image={state.image}
              color={[255, 255, 255, 0.3]}
              className="editor-canvas"
              />
            <label className="btn-little-avatar text bold cyan-stroke">
                  <input
                    name="upload-img-input"
                    type="file"
                    onChange={handleNewImage}
                    className="hide-input"
                  />
                  Upload Avatar
                  </label>
                  <input
                  className="neon-range"
                name="scale"
                type="range"
                onChange={handleScale}
                min={state.allowZoomOut ? "0.1" : "1"}
                max="2"
                step="0.01"
                defaultValue="1"
              />
              <button className='button-avatar' onClick={handleSubmit}>Submit avatar</button>
  		        {errorMessage && <p className="text bold neon-red error-message">{errorMessage}</p>}
              <div className='skip-button'>
              <h4>Or skip this step, a default avatar will be set</h4>
                <button className='button-avatar' onClick={handleSkip}>Skip this step</button>
              </div>
              <h5 className='neon-yellow'>You will be able to change your avatar in the parameters later !</h5>        
          </div>
        </div>
      </div>
    </div>
  );
}

export default SelectAvatar;
