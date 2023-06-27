import React, {useState, CSSProperties} from 'react'
import { User } from '../../types';
import crown from '../../../img/history/crown.png'
import skull from '../../../img/history/skull.png'

interface Props {
    user: User;
    changeComponent: (component: string) => void;
}

const StatMatch:React.FC<Props> = ({user, changeComponent}) => {
  
    const [isHovered, setIsHovered] = useState<boolean>(false);

    const handleClick = () => {
        changeComponent('historic');
    }
    const handleHover = () => {
        setIsHovered(!isHovered);
    }

    const StatMatch: CSSProperties = {
        flexBasis:'25%', height:'75%', alignSelf:'center',
        background :'rgba(0, 0, 0, 0.7)', borderRadius:'30px',  
        fontWeight:'800', fontSize:'40px', fontFamily:'Montserrat, sans-serif', textAlign:'center', color:'white',
        display:'flex', flexDirection:'column', justifyContent:'space-around',
    }
    const Recent: CSSProperties = {
        fontSize: '24px',  
    }
    const Icons: CSSProperties = {
        display:'flex', justifyContent: 'space-around',
    }
    const Skull: CSSProperties = {
        height: '40px', width:'40px',
    }
    const Crown: CSSProperties = {
        height: '65px', width:'65px', marginTop:'-13px', marginLeft: '-10px', marginRight: '-10px',
    }
    const HistoryLink: CSSProperties = {
        cursor: isHovered ? 'pointer' : 'auto',
    }

    //No user Rank / no history in DB

    return (
    <div style={StatMatch}>
      <span>RANK</span>
      <span>197</span>
      <div onClick={handleClick} onMouseEnter={handleHover} onMouseLeave={handleHover} style={HistoryLink}>
      <span style={Recent}>Recent Match</span>
      <div style={Icons}>
        {/* Fetch them from history */}
      <img src={skull} alt='skull' style={Skull}/>
      <img src={crown} alt='crown' style={Crown}/>
      <img src={skull} alt='skull' style={Skull}/>
      <img src={skull} alt='skull' style={Skull}/>
      <img src={skull} alt='skull' style={Skull}/>
      </div>
      </div>
    </div>
  )
}

export default StatMatch
