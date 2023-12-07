import React, { useState } from "react";
import Accordion from "@mui/material/Accordion";
import AccordionSummary from '@mui/material/AccordionSummary';
import AccordionDetails from '@mui/material/AccordionDetails';
import Typography from "@mui/material/Typography";
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ToggleChip from "../ToggleChip/ToggleChip.jsx";
import Stack from "@mui/system/Stack";
import Autocomplete from "@mui/material/Autocomplete";
import TextField from "@mui/material/TextField";

export default function SearchSection(props) {
    const [options, setOptions] = useState(props.options)
    const [selected, setSelected] = useState([])
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

    return (
        <Accordion allowed={allowedOptions} denied={deniedOptions}>
            <AccordionSummary
                expandIcon={<ExpandMoreIcon />}
                aria-controls="panel1a-content">
                <Typography>{props.sectionTitle}</Typography>
            </AccordionSummary>
            <AccordionDetails>
                <Stack direction="column">
                    <Autocomplete
                        multiple
                        id="search-box"
                        renderTags={() => { }}
                        filterSelectedOptions
                        value={selected}
                        onChange={(e, newValue) => setSelected(newValue)}
                        options={options}
                        size="small"
                        renderInput={(params) => <TextField variant="filled" {...params} label={'Search ' + props.sectionTitle} />}
                    />

                    <Stack sx={{ flexWrap: 'wrap', gap: 1, margin: 1 }} direction="row" spacing={1}>
                        {selected.map(val => <ToggleChip
                            key={val}
                            label={val}
                            onToggle={toggleHandler}
                            onDelete={() => setSelected(selected.filter(entry => entry !== val))} />)}
                    </Stack>

                </Stack>
            </AccordionDetails>
        </Accordion>
    )

}