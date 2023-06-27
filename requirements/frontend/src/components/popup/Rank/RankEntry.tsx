import React from 'react'
import { CSSProperties, useState } from 'react'
import { User } from '../../types'

import bronze from '../../../img/bronzeRank.png'
import silver from '../../../img/silverRank.png'
import gold from '../../../img/goldRank.png'
import crack from '../../../img/crakRank.png'
import ultime from '../../../img/ultimeCrackRank.png'

interface Props {
    rank: string;
    userLevel?: boolean;
    elo: number;
    user: User;
}

const RankEntry:React.FC<Props> = ({rank, userLevel=false, elo, user}) => {
  
    const [isHovered, setIsHovered] = useState<boolean>(false);

    let gradient: string;
    switch (rank) {
        case 'bronze':
            gradient = 'linear-gradient(to bottom, #741010, #CC9C1F, #000) 1';
            break;
        case 'silver':
            gradient = 'linear-gradient(to bottom, #FFF, #86CFCB, #000) 1';
            break;
        case 'gold':
            gradient = 'linear-gradient(to bottom, #F3CA37, #D26637, #000) 1';
            break;
        case 'crack':
            gradient = 'linear-gradient(to bottom, #BB7DD9, #9409AA, #000) 1';
            break;
        case 'ultime':
            gradient = 'linear-gradient(to bottom, #FFF, #D26637, #000) 1';
            break;
        default:
            gradient = 'linear-gradient(to bottom, #F3CA37, #EFA81F, #000) 1';
            break;
    }

    const rankContainer: CSSProperties = {
        flexBasis: '200px',
        height: userLevel ? '400px' : '250px',
        margin: '5px',
        marginTop: userLevel ? '0px' : '60px',

        background: 'rgba(0, 0, 0, 0.9)',
        
        border: '4px solid',
        borderImage: gradient,
        borderRadius: '15px',
        
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-around',

        boxShadow: isHovered ? 
        '0px 0px 10px #fff, 0px 0px 30px #fff, 0px 0px 60px #fff'
        : '0px 0px 0px transparent',
        transition: 'box-shadow 0.3s ease-out',


        cursor: isHovered ? 'pointer' : 'auto',
    }
    
    const rankElo: CSSProperties = {
        alignSelf: 'center',
        marginTop: '-35px',

        fontWeight : '800',
        fontSize : '36px',
        fontFamily: 'Montserrat, sans-serif',
        letterSpacing : '5px',

        background: gradient.substring(0, gradient.length - 2),
        WebkitBackgroundClip: 'text',
        WebkitTextFillColor: 'transparent',
    }

    const rankName: CSSProperties = {
        alignSelf: 'center',

        fontWeight : '800',
        fontSize : '32px',
        fontFamily: 'Montserrat, sans-serif',
        letterSpacing : '5px',

        background: gradient.substring(0, gradient.length - 2),
        WebkitBackgroundClip: 'text',
        WebkitTextFillColor: 'transparent',
    }

    const bronzePic: CSSProperties = {
        height: '250px',
        width: '170px',
        alignSelf: 'center',
        marginTop: '-45px',
        paddingRight: '5px',
    }
    const silverPic: CSSProperties = {
        height: '250px',
        width: '140px',
        alignSelf: 'center',
        marginTop: '-45px',
        paddingRight: '5px',
    }
    const goldPic: CSSProperties = {
        height: '250px',
        width: '190px',
        alignSelf: 'center',
        marginTop: '-45px',
        paddingRight: '5px',
    }
    const crackPic: CSSProperties = {
        height: '230px',
        width: '155px',
        alignSelf: 'center',
        marginTop: '-25px',
        paddingRight: '5px',
    }
    const ultimePic: CSSProperties = {
        height: '200px',
        width: '220px',
        alignSelf: 'center',
        marginTop: '-15px',
        paddingRight: '5px',
    }

    const currElo: CSSProperties = {
        alignSelf: 'center',
        marginTop: '-55px',

        fontWeight : '800',
        fontSize : '28px',
        fontFamily: 'Montserrat, sans-serif',
        letterSpacing : '5px',

        background: gradient.substring(0, gradient.length - 2),
        WebkitBackgroundClip: 'text',
        WebkitTextFillColor: 'transparent',
    }

    const nextRank: CSSProperties = {
        alignSelf: 'center',
        marginTop: '-30px',

        fontWeight : '800',
        fontSize : '22px',
        fontFamily: 'Montserrat, sans-serif',
        letterSpacing : '3px',
        textAlign: 'center',

        background: gradient.substring(0, gradient.length - 2),
        WebkitBackgroundClip: 'text',
        WebkitTextFillColor: 'transparent',
    }

    const aura: CSSProperties = {
        width: '100px',
        height: '100px',
        background: 'red',
    }

    const handleHover = () => {
        setIsHovered(!isHovered);
    };

    return (
    <div style={rankContainer} onMouseEnter={handleHover} onMouseLeave={handleHover}>
        <span style={rankName}> {rank.toUpperCase()} </span>
        {rank === 'bronze' && <img src={bronze} alt='bronze' style={bronzePic}/>}
        {rank === 'silver' && <img src={silver} alt='silver' style={silverPic}/>}
        {rank === 'gold' && <img src={gold} alt='gold' style={goldPic}/>}
        {rank === 'crack' && <img src={crack} alt='crack' style={crackPic}/>}
        {rank === 'ultime' && <img src={ultime} alt='ultime' style={ultimePic}/>}
        { userLevel ?  <span style={currElo}>ELO {user.elo} </span>
        : <span style={rankElo}> {elo} </span>}
        { userLevel && rank != 'ultime' ?  <span style={nextRank}>Next Rank {elo + 1000} </span>
        : null}
    </div>
  )
}

export default RankEntry
