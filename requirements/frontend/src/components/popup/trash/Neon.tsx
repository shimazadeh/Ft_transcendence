import React from 'react'
import './Neon.css'

interface Props {
    text: string;
    color: string;
    linear?: string;
    stroke? : boolean;
    blur? : string;
    moreBlur? : string;
}

const Neon: React.FC<Props> = ({text, color, linear=color, stroke=true, blur='40px', moreBlur='false'}) => {
     
    return (  
    <div className='neonText'
     style={
        {   
            '--topColor': color,
            '--bottomColor': linear,
            '--blur': blur,
        } as React.CSSProperties}>
        
            <span className='Blur'>{text}</span>

            <span className='Shadow'>{text}</span>

            {/* {moreBlur !== 'false' ? <span className='Blur' style = {{'--blur':moreBlur} as React.CSSProperties}>{text}</span> : null} */}
        
            {stroke ? <span className='Stroke'>{text}</span> : null}

            <span className='Solid'>{text}</span>
    </div>
  )
}

export default Neon
