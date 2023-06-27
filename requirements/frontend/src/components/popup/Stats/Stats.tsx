import React, {CSSProperties} from 'react';
import { User } from '../../types';
import StatElo from './StatElo';
import StatMatch from './StatMatch';

interface Props {
    user: User;
    changeComponent: (component: string) => void;

}

const Stats: React.FC<Props> = ({user, changeComponent}) => {

    const Container: CSSProperties = {
        position: 'relative', flexGrow: 1, height: '90%',
        margin: '30px', marginBottom: '55px', 
        border: '4px solid #40DEFF', boxShadow: '0 0 10px #40DEFF, 0 0 60px #40DEFF, inset 0 0 40px #40DEFF',
        display: 'flex', flexDirection: 'row', justifyContent: 'space-around',
    }

    // const testUser:User = {username: 'gmansuy', id: 3, elo: 1678};

  return (
    <div style={Container}>
        {/* <StatVictory user={user}/> */}
        <div style={{color: 'white'}}>
          {user.gameLogin}
        </div>
        <StatElo user={user} changeComponent={changeComponent}/>
        <StatMatch user={user} changeComponent={changeComponent}/>
    </div>
  )
}

export default Stats
