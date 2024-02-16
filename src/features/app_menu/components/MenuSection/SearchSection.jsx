import React, { useState, forwardRef, useImperativeHandle } from "react";
import Accordion from "@mui/material/Accordion";
import AccordionSummary from '@mui/material/AccordionSummary';
import AccordionDetails from '@mui/material/AccordionDetails';
import Typography from "@mui/material/Typography";
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ToggleChip from "../ToggleChip/ToggleChip.jsx";
import Stack from "@mui/system/Stack";
import Autocomplete from "@mui/material/Autocomplete";
import TextField from "@mui/material/TextField";
import { objectMapToArray } from "../../../../common/ObjectMap.jsx";

const SearchSection = forwardRef((props, _ref) => {
    const toggleStates = props.toggleStates
    const [selected, setSelected] = useState({})

    const toggleHandler = (e) => {
        const label = e.currentTarget.textContent
        setSelected((prevState) => ({
            ...selected,
            [label]: (prevState[label] + 1) % toggleStates.length
        }))
        console.log("selected after", selected)
    }

    const deleteHandler = (e) => {
        const label = e.target.parentNode.innerText
        console.log("delete ", selected)
        setSelected(
            Object.keys(selected).filter(key => key != label).reduce((newObj, key) => {
                newObj[key] = selected[key]
                return newObj
            }, {})
        )
    }

    useImperativeHandle(_ref, () => ({
        getChipStates: () => { return selected },
        clearChipStates: () => {setSelected([])}
    }))

    console.log("selected ", selected)
    return (
        <Accordion defaultExpanded={props.expanded}>
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
                        value={selected ? Object.keys(selected) : []}
                        onChange={(e) => { setSelected((prevState) => ({ ...prevState, [e.target.innerText]: 0 })) }}
                        options={props.options}
                        size="small"
                        renderInput={(params) => <TextField variant="filled" {...params} label={'Search ' + props.sectionTitle} />}
                    />

                    <Stack sx={{ flexWrap: 'wrap', gap: 1, margin: 1 }} direction="row" spacing={1}>
                        {selected && objectMapToArray(selected, (state, label) => <ToggleChip
                            key={label}
                            stateProps={toggleStates}
                            toggleHandler={toggleHandler}
                            label={label}
                            state={state}
                            onDelete={deleteHandler} />)}
                    </Stack>
                </Stack>
            </AccordionDetails>
        </Accordion>
    )
})

export default React.memo(SearchSection)