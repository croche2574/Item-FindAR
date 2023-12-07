import React, { useState } from "react";
import Accordion from "@mui/material/Accordion";
import AccordionSummary from '@mui/material/AccordionSummary';
import AccordionDetails from '@mui/material/AccordionDetails';
import Typography from "@mui/material/Typography";
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ToggleChip from "../ToggleChip/ToggleChip.jsx";
import Stack from "@mui/system/Stack";

export default function BasicSection(props) {
    const [options, setOptions] = useState(props.options)
    const [allowedOptions, setAllowed] = useState([])
    const [deniedOptions, setDenied] = useState([])
    const toggleHandler = (label, state) => {
        if (state === 'Allowed') {
            setAllowed(allowedOpts => [...allowedOpts, label])
        } else if (state === 'Denied') {
            setAllowed(allowedOpts => allowedOpts.filter(opt => opt != label))
            setDenied(deniedOpts => [...deniedOpts, label])
        } else {
            setDenied(deniedOpts => deniedOpts.filter(opt => opt != label))
        }
    }
    console.log(options)
    return (
        <Accordion allowed={allowedOptions} denied={deniedOptions}>
            <AccordionSummary
                expandIcon={<ExpandMoreIcon />}
                aria-controls="panel1a-content">
                <Typography>{props.sectionTitle}</Typography>
            </AccordionSummary>
            <AccordionDetails>
                <Stack sx={{ flexWrap: 'wrap', gap: 1 }} direction="row" spacing={1}>
                    {options.map(option => <ToggleChip key={option} label={option} onToggle={toggleHandler} />)}
                </Stack>
            </AccordionDetails>
        </Accordion>
    )
}