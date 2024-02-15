import React from "react"
import Chip from '@mui/material/Chip'
import './ToggleChip.css'

const ToggleChip = (props) => {
    const { stateProps, toggleHandler, label, state } = props
    console.log("state: ", state)
    var chipProps = {
        label: label,
        val: label,
        color: stateProps[state].color,
        onClick: toggleHandler,
        onDelete: props.onDelete
    }
    
    return (
        <Chip {...chipProps} />
    )
}

export default React.memo(ToggleChip)