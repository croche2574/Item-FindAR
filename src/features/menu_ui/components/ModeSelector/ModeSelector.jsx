import React, { useEffect, useState } from 'react'
import cx from 'classnames'
import NonPassiveTouchTarget from '../../NonPassiveTouchTarget.jsx'
import TouchCarousel, { clamp } from 'react-touch-carousel'
import touchWithMouseHOC from 'react-touch-carousel/lib/touchWithMouseHOC'
import Fab from '@mui/material/Fab';
import InfoIcon from '@mui/icons-material/Info';
import SearchIcon from '@mui/icons-material/Search';
import SettingsIcon from '@mui/icons-material/Settings';
import { Zoom } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import './ModeSelector.css'
const fabStyle = {
    //position: 'absolute',
};

const cardSize = 70
const cardPadCount = 0
const carouselWidth = clamp(window.innerWidth, 0, 400)

export default function ModeSelector(props) {
    const theme = useTheme()
    const [mode, setMode] = useState('Info')
    const transitionDuration = {
        enter: theme.transitions.duration.enteringScreen,
        exit: theme.transitions.duration.leavingScreen,
    }
    const data = [
        {
            symbol: <InfoIcon />,
            mode: 'Info',
            color: 'primary',
            id: 0,
            sx: fabStyle,
            handler: props.infoHandler
        },
        {
            symbol: <SearchIcon />,
            mode: 'Search',
            color: 'primary',
            id: 1,
            sx: fabStyle,
            handler: props.searchHandler
        },
        {
            symbol: <SettingsIcon />,
            mode: 'Settings',
            color: 'primary',
            id: 2,
            sx: fabStyle,
            handler: props.settingsHandler
        }
    ]

    function OnRest(index, modIndex, cursor)   {
        const item = data[modIndex]
        console.log(item.mode)
        if (modIndex === Math.abs(cursor)) {
            setMode(item.mode)
        }
    }
    function CarouselContainer(props) {
        const { cursor, carouselState: { active, dragging }, ...rest } = props
        let current = -Math.round(cursor) % data.length
        while (current < 0) {
            current += data.length
        }
        // Put current card at center
        const translateX = (cursor - cardPadCount) * cardSize + (carouselWidth - cardSize) / 2
        return (
            <NonPassiveTouchTarget
                className={cx(
                    'carousel-container',
                    {
                        'is-active': active,
                        'is-dragging': dragging
                    }
                )}
            >
                <NonPassiveTouchTarget
                    className='carousel-track'
                    style={{ transform: `translate3d(${translateX}px, 0, 0)` }}
                    {...rest}
                />
    
    
            </NonPassiveTouchTarget>
        )
    }

    function renderCard(index, modIndex, cursor) {
        const item = data[modIndex]
        return (
            <div
                key={index}
                className='carousel-card'
            >
                <div
                    className='carousel-card-inner'
                    style={{ 
                        backgroundColor: item.background,
                        display:'flex',
                        justifyContent:'center',
                        alignItems:'center' }}
                >
                    <Zoom
                        key={item.id}
                        in={item.id === Math.abs(cursor)}
                        timeout={transitionDuration}
                        style={{
                            transitionDelay: `${item.id === Math.abs(cursor) ? transitionDuration.exit : 0}ms`,
                        }}
                        unmountOnExit
                    >
                        <Fab
                            sx={item.sx} color={item.color} size='medium' onClick={item.handler}
                        >
                            {item.symbol}
                            {item.mode === 'Settings' ? <img hidden src onError={item.handler}></img> : null}
                        </Fab>
                    </Zoom>
                    <Zoom
                        key={item.color}
                        in={(item.id != Math.abs(Math.round(cursor)))}
                        timeout={transitionDuration}
                        style={{
                            transitionDelay: `${item.id != Math.abs(cursor) ? transitionDuration.exit : 0}ms`,
                        }}
                        unmountOnExit
                    >
                        <div className='slider-symbol'>{item.symbol}</div>
                    </Zoom>
                </div>
            </div>
        )
    }
    const Container = touchWithMouseHOC(CarouselContainer)
    
    let child = React.createRef()
    useEffect(() => prevCard(), [props.closed])
    const prevCard = () => {
        child.current.prev()
    }

    return (
        <React.StrictMode>
            <TouchCarousel
                ref={child}
                component={Container}
                cardSize={cardSize}
                cardCount={data.length}
                cardPadCount={cardPadCount}
                loop={false}
                autoplay={false}
                renderCard={renderCard}
                onRest={OnRest}
                mode={mode}
            />
        </React.StrictMode>
    )
}