import React, {CSSProperties} from 'react';
import { PublicUserInfo} from '../../types';
import './StatStyle.css'

interface Props {
    profile: PublicUserInfo;
}

const StatProfile: React.FC<Props> = ({profile}) => {

    const StatVictory: CSSProperties = {
        flexBasis:'25%', height:'75%', alignSelf:'center',
        background :'rgba(0, 0, 0, 0.7)', borderRadius:'30px',  
        fontWeight:'800', fontSize:'40px', fontFamily:'Montserrat, sans-serif', textAlign:'center', color:'white',
        display:'flex', flexDirection:'column', justifyContent:'space-around',
    }
    const Center: CSSProperties = {
        width:'35%', height:'35%',
        alignSelf:'center', fontSize:'24px',
        position: 'relative',
        display:'flex', flexDirection:'column', justifyContent:'center',
        alignItems: 'center',
        marginTop: '10px'

    }
    const Bottom: CSSProperties = {
        width:'70%', height:'20%', fontSize:'24px',
        alignSelf:'center',
        position: 'relative',
        display:'flex', flexDirection:'column', justifyContent:'center',    
    }

    const textStyle: CSSProperties = {
        padding: '2px',
        margin: '0px',
    }

    // let ratio: string = profile.win + profile.loose === 0 ? '0' : ((profile.win / (profile.win + profile.loose)) * 100).toFixed(1);
    // ratio = ratio.endsWith('.0') ? ratio.slice(0, -2) : ratio;

    function formatNumber(n: number): string {
        return n < 10 ? `0${n}` : `${n}`;
      }
      
    const dateObject = new Date(profile.createAt);
    const creationDate = `${dateObject.getFullYear()}/${formatNumber(dateObject.getMonth() + 1)}/${formatNumber(dateObject.getDate())}`;
      

    return (
        <div style={StatVictory}>
            <span className='text bold neon-big-cyan'>Profile</span>
            <div style={Center}>
                <img src={profile.avatar} className='avatar-public' alt='avatar'/>
                <p className='text bold neon-purple'>{profile.gameLogin}</p>
            </div>
            <div style={Bottom}>
                <p style={textStyle} className='text bold neon-white'>Player since : </p>
                <p style={textStyle} className='text bold neon-big-cyan'>{creationDate}</p>
            </div>
        </div>
    );
}

export default StatProfile
