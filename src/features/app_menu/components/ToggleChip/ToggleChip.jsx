import React, { memo } from "react"
import Chip from '@mui/material/Chip'
import './ToggleChip.css'

const ToggleChip = (props) => {
    const { stateProps, toggleHandler, label, state } = props
    var chipProps = {
        label: label,
        val: label,
        color: stateProps[state].color,
        icon: stateProps[state].icon,
        onClick: toggleHandler,
        onDelete: props.onDelete
    }
    
    return (
        <Chip {...chipProps} />
    )
}

export default memo(ToggleChip)