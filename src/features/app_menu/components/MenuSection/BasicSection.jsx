import React, { useState, forwardRef, useImperativeHandle, useCallback } from "react";
import Accordion from "@mui/material/Accordion";
import AccordionSummary from '@mui/material/AccordionSummary';
import AccordionDetails from '@mui/material/AccordionDetails';
import Typography from "@mui/material/Typography";
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ToggleChip from "../ToggleChip/ToggleChip.jsx";
import Stack from "@mui/system/Stack";
import { objectMapToArray } from "../../../../common/ObjectMap"

const BasicSection = forwardRef((props, _ref) => {
    const [optionState, setOptionState] = useState(Object.fromEntries(props.options.map(k => [k, 0])))
    const toggleStates = props.toggleStates
    
    const toggleHandler = useCallback((e) => {
        const label = e.currentTarget.textContent
        setOptionState((prevState) => ({
            ...optionState,
            [label]: (prevState[label] + 1) % toggleStates.length
        }))
    }, [optionState])

    useImperativeHandle(_ref, () => ({
        getChipStates: () => {return optionState}
    }))

    return (
        <Accordion defaultExpanded={props.expanded}>
            <AccordionSummary
                expandIcon={<ExpandMoreIcon />}
                aria-controls="panel1a-content">
                <Typography>{props.sectionTitle}</Typography>
            </AccordionSummary> 
            <AccordionDetails>
                <Typography>
                    {props.description}
                </Typography>
                <Stack sx={{ flexWrap: 'wrap', gap: 1 }} direction="row" spacing={1}>
                    {objectMapToArray(optionState, (state, label) => <ToggleChip 
                    key={label} 
                    stateProps={toggleStates} 
                    toggleHandler={toggleHandler} 
                    label={label} 
                    state={state} />)}
                </Stack>
            </AccordionDetails>
        </Accordion>
    )
})

export default React.memo(BasicSection)