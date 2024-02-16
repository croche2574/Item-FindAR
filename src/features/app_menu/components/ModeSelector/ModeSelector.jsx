import React, { useState, memo } from 'react'
import Fab from '@mui/material/Fab';
import InfoIcon from '@mui/icons-material/Info';
import SearchIcon from '@mui/icons-material/Search';
import CloseIcon from '@mui/icons-material/Close';
import Slider from 'react-slick'
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import './ModeSelector.css'

const ModeButton = memo((props) => {
    const buttonData = props.data

    return (
        <Fab color={buttonData.id === props.index ? buttonData.color : 'default'} size='medium' onClick={buttonData.handler} >
            {buttonData.symbol}
        </Fab>
    )
})

const ModeSelector = memo((props) => {
    const [index, setIndex] = useState(0)

    const data = [
        {
            symbol: <InfoIcon />,
            mode: 'Info',
            color: 'primary',
            id: 0,
            handler: props.infoHandler
        },
        {
            symbol: <SearchIcon />,
            mode: 'Search',
            color: 'primary',
            id: 1,
            handler: props.searchHandler
        },
        {
            symbol: <CloseIcon />,
            mode: 'Exit',
            color: 'error',
            id: 2,
            handler: props.closeHandler
        }
    ]

    const settings = {
        centerMode: false,
        infinite: true,
        slidesToShow: 3,
        slidesToScroll: 1,
        swipeToSlide: true,
        focusOnSelect: true,
        arrows: false,
        beforeChange: (current, next) => {
            setIndex(next)
        },
    }

    return (
        <div style={{ width: '50%', marginTop: 'auto', marginBottom: '26px'}}>
            <Slider {...settings} >
                <ModeButton data={data[0]} index={index} />
                <ModeButton data={data[1]} index={index} />
                <ModeButton data={data[2]} index={index} />
            </Slider>
        </div>
    )
})

export default ModeSelector