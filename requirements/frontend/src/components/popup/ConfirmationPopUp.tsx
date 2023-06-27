import React from 'react'
import './ConfirmationPopUp.css'
import { CSSProperties } from 'react';

type propsConf = {
    onConfirm: (confirm: boolean) => void;
    onVisible: (state: boolean) => void
    opacity: boolean
    message: string
}

const ConfirmationPopUp = ({ onConfirm, onVisible, opacity, message }: propsConf) => {

    const background: CSSProperties = {
        position: 'fixed',
        top: '0',
        left: '0',
        width: '100%',
        height: '100%',
        backgroundColor: 'rgba(0,0,0,0.5)',
        zIndex: '999'
    }

    const pad = {
        paddingTop: "40px",
        textShadow: 'none',
        cursor: 'auto',
        zIndex: '1200'
    }

    const handleYes = () => {
        onConfirm(true)
        onVisible(false)
    }
    const handleNo = () => {
        onVisible(false)
        onConfirm(false)
    }

    return (
        <div>
            {opacity && <div style={background} />}
            <div className='containerBlock'>
                <div style={pad} className='nameText'>{message}</div>
                <div className='containerChoice'>
                    <div className='nameText' onClick={handleYes}>yes</div>
                    <div className='nameText' onClick={handleNo}>no</div>
                </div>
            </div>
        </div>
    )
}

export default ConfirmationPopUp