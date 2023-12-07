import React, {useState} from "react"
import Chip from '@mui/material/Chip'
import './ToggleChip.css'

const stateProps = [
    {
        stateName: 'Neutral',
        color: ''
    },
    {
        stateName: 'Allowed',
        color: 'success'
    },
    {
        stateName: 'Denied',
        color: 'error'
    }
]

export default function ToggleChip(props)    {
    const [state, setState] = useState(0)
    const toggleState = () => {
        setState((prevState) => (prevState + 1) % 3)
        props.onToggle(props.label, stateProps[(state + 1) % 3].stateName)
    }

    var chipProps = {
        label: props.label,
        val: props.label,
        state: stateProps[state].stateName,
        onClick: toggleState
    }

    if (state != 0) {
        chipProps.color = stateProps[state].color
    }


    if (props.onDelete) {
        chipProps.onDelete = props.onDelete
    }
    

    return (
        <Chip {...chipProps} />
    )
}