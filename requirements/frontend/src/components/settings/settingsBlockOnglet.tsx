import { useState } from 'react';
import { User } from '../types'
import { CSSProperties } from 'styled-components'
import ConfirmationPopUp from '../popup/ConfirmationPopUp';

interface props {
    block: blocked
    updateBlock: (id: number) => (void)
}

interface blocked {
    senderId: number
    sender: User
    recipientId: number
    recipient: User
    id: number
}

const SettingsBlockOnglet = ({ block, updateBlock }: props) => {

    const [visible, setVisible] = useState(false)
    let stop = false
    const [message, setMessage] = useState('void')

    const padd: CSSProperties = {
        paddingLeft: '7%',
        overflowX: 'auto',
        textShadow: 'none',
        fontSize: '20px'
    }

    const padding = {
        marginRight: '6%',
        height: '20px',
        width: '20px',
    }

    const handleNo = () => {
        setMessage("Unblock this User ?")
        if (!stop)
            setVisible(true)
        if (stop)
            stop = true;
    }

    const onConfirm = async (confirm: boolean) => {
        if (confirm) {
            updateBlock(block.id)
            const req = `http://${process.env.REACT_APP_DOMAIN}:${process.env.REACT_APP_DOMAIN_PORT}/users/deleteBlock/` + block.id
            await fetch(req, { method: "DELETE", credentials: "include" })
        }
        if (!confirm)
            stop = true
    }

    const onVisible = (state: boolean) => {
        setVisible(state)
    }

    return (
        <div className='containerBlockOnglet'>
            {visible === true && <ConfirmationPopUp onConfirm={onConfirm} onVisible={onVisible} opacity={true} message={message} />}
            <div className='nameText' style={padd}>{block.recipient.gameLogin}</div>
            <div style={padding} className='noButton' title='unblock' onClick={handleNo} />
        </div>
    )
}

export default SettingsBlockOnglet