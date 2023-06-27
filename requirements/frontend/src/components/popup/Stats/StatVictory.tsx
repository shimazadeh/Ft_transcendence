import React, {CSSProperties} from 'react';
import { PublicUserInfo} from '../../types';
import crown from '../../../img/history/crown.png'
import skull from '../../../img/history/skull.png'

interface Props {
    profile: PublicUserInfo;
}

const StatVictory: React.FC<Props> = ({profile}) => {

    const StatVictory: CSSProperties = {
        flexBasis:'25%', height:'75%', alignSelf:'center',
        background :'rgba(0, 0, 0, 0.7)', borderRadius:'30px',  
        fontWeight:'800', fontSize:'40px', fontFamily:'Montserrat, sans-serif', textAlign:'center', color:'white',
        display:'flex', flexDirection:'column', justifyContent:'space-around',
    }
    const Center: CSSProperties = {
        width:'35%', height:'35%',
        alignSelf:'center', fontSize:'56px',
        position: 'relative',
        display:'flex', flexDirection:'column', justifyContent:'center',
        alignItems: 'center'

    }
    const Bottom: CSSProperties = {
        width:'70%', height:'25%',
        alignSelf:'center', fontSize:'24px',
        position: 'relative',
        display:'flex', flexDirection:'column', justifyContent:'center',
    }
    const textCrown: CSSProperties = {
       display:'flex', flexDirection: 'row', justifyContent:'center',
       marginLeft:'-9px'
    }
    const Crown: CSSProperties = {
        width:'50px', height:'50px', marginTop:'-5px', marginBottom:'-5px', marginRight:'-6px',
    }
    const textSkull: CSSProperties = {
        display:'flex', flexDirection: 'row', justifyContent:'center', 
     }
     const Skull: CSSProperties = {
         width:'30px', height:'28px', marginTop:'3px', marginRight:'6px',
     }

    let ratio: string = profile.win + profile.loose === 0 ? '0' : ((profile.win / (profile.win + profile.loose)) * 100).toFixed(1);
    ratio = ratio.endsWith('.0') ? ratio.slice(0, -2) : ratio;

    return (
        <div style={StatVictory}>
            <span className='text bold neon-little-yellow'>Victories</span>
            <div style={Center} className='text bold neon-purple'>
                <span>{ratio}%</span>
            </div>
            <div style={Bottom}>
                <div style={textCrown}>
                    <img src={crown} alt='crown' style={Crown}/>
                    <span className='text neon-green'>{profile.win} Win</span>
                </div>
                <div style={textSkull}>
                    <img src={skull} alt='skull' style={Skull}/>
                    <span className='text neon-red'>{profile.loose} Defeat</span>
                </div>
            </div>
        </div>
    );
}

export default StatVictory
