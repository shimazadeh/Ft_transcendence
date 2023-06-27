import React, {CSSProperties} from 'react';
import { PublicUserInfo } from '../../types';
import './StatStyle.css'
import RankIcon from '../Rank/RankIcon';

interface Props {
    profile: PublicUserInfo;
}

const StatRanking: React.FC<Props> = ({profile}) => {

    const StatRanking: CSSProperties = {
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
        marginTop: '20px'
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

    let icon = 'bronze';
    if (profile.elo >= 1000 && profile.elo < 2000)
        icon = 'silver'
    else if (profile.elo >= 2000 && profile.elo < 3000)
        icon = 'gold'
    else if (profile.elo >= 3000 && profile.elo < 4000)
        icon = 'crack'
    else if (profile.elo >= 4000)
        icon = 'ultime'

    return (
        <div style={StatRanking}>
            <span className='text bold neon-dark-purple'>Ranking</span>
            <div style={Center} className='iconborder'>
                <br/>
                <div>
                <p className='text bold big' style={textStyle}>{icon}</p>
                    <RankIcon icon={icon}/>
                </div>
            </div>
            <div style={Bottom}>
                <p style={textStyle} className='neon-dark-purple'>Current elo :</p>
                <p style={textStyle} className='text bold neon-purple'>{profile.elo}</p>
            </div>
        </div>
    );
}

export default StatRanking
