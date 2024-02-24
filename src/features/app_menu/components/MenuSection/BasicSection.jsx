import React, { useState, forwardRef, useImperativeHandle, useEffect } from "react";
import Accordion from "@mui/material/Accordion";
import AccordionSummary from '@mui/material/AccordionSummary';
import AccordionDetails from '@mui/material/AccordionDetails';
import Typography from "@mui/material/Typography";
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ToggleChip from "../ToggleChip/ToggleChip.jsx";
import Stack from "@mui/system/Stack";
import { objectMapToArray } from "../../../../common/ObjectMap"

const BasicSection = forwardRef((props, _ref) => {
    const {expanded, sectionTitle, options, menuState, setMenuState, toggleStates} = props

    useEffect(() => {
        console.log("menu", menuState)
        if (!menuState[sectionTitle]) {
            setMenuState({
                ...menuState,
                [sectionTitle]: Object.fromEntries(options.map(k => [k, 0]))
            })
        }
    }, [options])

    const toggleHandler = (e) => {
        const label = e.currentTarget.textContent
        setMenuState((prevState) => {return {
            ...menuState,
            [sectionTitle]: { ...menuState[sectionTitle], [label]: (prevState[sectionTitle][label] + 1) % toggleStates.length }
        }})
    }

    useImperativeHandle(_ref, () => ({
        clearChipStates: () => {
            setMenuState((prevState) => {return {
                ...prevState,
                [sectionTitle]: Object.fromEntries(options.map(k => [k, 0]))
            }})
        }
    }), [])

    return (
        <Accordion defaultExpanded={expanded} disableGutters>
            <AccordionSummary
                expandIcon={<ExpandMoreIcon />}
                aria-controls="panel1a-content">
                <Typography>{sectionTitle}</Typography>
            </AccordionSummary>
            <AccordionDetails>
                <Typography>
                    {props.description}
                </Typography>
                <Stack sx={{ flexWrap: 'wrap', gap: 1 }} direction="row" spacing={1}>
                    {menuState[sectionTitle] ? objectMapToArray(menuState[sectionTitle], (state, label) => <ToggleChip
                        key={label}
                        stateProps={toggleStates}
                        toggleHandler={toggleHandler}
                        label={label}
                        state={state} />) : []}
                </Stack>
            </AccordionDetails>
        </Accordion>
    )
})

export default React.memo(BasicSection)