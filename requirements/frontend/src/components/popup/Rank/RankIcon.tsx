import React from 'react'
import { CSSProperties, useState } from 'react'
import { User } from '../../types'

import bronze from '../../../img/bronzeRank.png'
import silver from '../../../img/silverRank.png'
import gold from '../../../img/goldRank.png'
import crack from '../../../img/crakRank.png'
import ultime from '../../../img/ultimeCrackRank.png'

interface Props {
    user?: User;
    icon?: string;
    scale?: number;
    y?: number;
    x?: number;
    changeComponent?: (component: string) => void;

}

const RankIcon: React.FC<Props> = ({ user, icon, scale = 1, y = 0, x = 0, changeComponent }) => {

    const [isHovered, setIsHovered] = useState<boolean>(false);

    const existingRanks: string[] = ['bronze', 'silver', 'gold', 'crack', 'ultime']; 

    let display: string;
    if (icon)
        display = icon;
    else if (user)
        display = user.elo > 5000 || user.elo < 0 ? 'ultime' : existingRanks[Math.floor(user.elo / 1000)];
    else
        return (null);


    const handleHover = () => {
        setIsHovered(!isHovered);
    };

    const handleClick = () => {
        if (changeComponent)
            changeComponent(display + 'Lead')
    }

    let auraColor: string;
    switch (display) {
        case 'bronze':
            auraColor = 'brown';
            break;
        case 'silver':
            auraColor = 'white';
            break;
        case 'gold':
            auraColor = 'gold';
            break;
        case 'crack':
            auraColor = 'pink';
            break;
        case 'ultime':
            auraColor = 'red';
            break;
        default:
            auraColor = 'white';
            break;
    }
    const Container: CSSProperties = {
        cursor: isHovered ? 'pointer' : 'auto',
        filter: isHovered ? 'drop-shadow(0px 0px 30px ' + auraColor + ')' : 'none',
        transition: 'all 0.3s ease-in-out',
    }
    const bronzePic: CSSProperties = {
        height: (250 * scale) + 'px',
        width: (170 * scale) + 'px',
        alignSelf: 'center',
        marginTop: (-45 - y) + 'px',
        marginLeft: x + 'px',
        paddingRight: '5px',

    }
    const silverPic: CSSProperties = {
        height: (250 * scale) + 'px',
        width: (140 * scale) + 'px',
        alignSelf: 'center',
        marginTop: (-45 - y) + 'px',
        marginLeft: x + 'px',
        paddingRight: '5px',
    }
    const goldPic: CSSProperties = {
        height: (250 * scale) + 'px',
        width: (190 * scale) + 'px',
        alignSelf: 'center',
        marginTop: (-45 - y) + 'px',
        marginLeft: x + 'px',
        paddingRight: '12px',
    }
    const crackPic: CSSProperties = {
        height: (230 * scale) + 'px',
        width: (155 * scale) + 'px',
        alignSelf: 'center',
        marginTop: (-25 - y) + 'px',
        marginLeft: x + 'px',
        paddingRight: '5px',
    }
    const ultimePic: CSSProperties = {
        height: (200 * scale) + 'px',
        width: (220 * scale) + 'px',
        alignSelf: 'center',
        marginTop: (-15 - y) + 'px',
        marginLeft: x + 'px',
        paddingRight: '5px',
    }

    return (
        <div onClick={handleClick} onMouseEnter={handleHover} onMouseLeave={handleHover} style={Container}>
            {display === 'bronze' && <img src={bronze} alt='bronze' style={bronzePic} />}
            {display === 'silver' && <img src={silver} alt='silver' style={silverPic} />}
            {display === 'gold' && <img src={gold} alt='gold' style={goldPic} />}
            {display === 'crack' && <img src={crack} alt='crack' style={crackPic} />}
            {display === 'ultime' && <img src={ultime} alt='ultime' style={ultimePic} />}
        </div>
    )
}

export default RankIcon
