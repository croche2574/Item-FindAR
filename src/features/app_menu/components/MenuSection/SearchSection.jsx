import React, { useCallback } from "react";
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

const SearchSection = (props) => {
    const { expanded, sectionTitle, options, menuState, setMenuState, toggleStates } = props

    const toggleHandler = useCallback((e) => {
        const label = e.currentTarget.textContent
        setMenuState((prevState) => {
            return {
                ...prevState,
                [sectionTitle]: { ...prevState[sectionTitle], [label]: (prevState[sectionTitle][label] + 1) % toggleStates.length }
            }
        })
    }, [])

    const deleteHandler = useCallback((e) => {
        const label = e.target.parentNode.innerText
        console.log('delete ', label)
        setMenuState((prevState) => {
            return {
                ...prevState,
                [sectionTitle]: Object.keys(prevState[sectionTitle]).filter(key => key != label).reduce((newObj, key) => {
                    newObj[key] = prevState[sectionTitle][key]
                    return newObj
                }, {})
            }
        }
        )
    }, [])

    return (
        <Accordion defaultExpanded={expanded} disableGutters>
            <AccordionSummary
                expandIcon={<ExpandMoreIcon />}
                aria-controls="panel1a-content">
                <Typography>{sectionTitle}</Typography>
            </AccordionSummary>
            <AccordionDetails>
                <Stack direction="column">
                    <Autocomplete
                        multiple
                        id="search-box"
                        renderTags={() => { }}
                        filterSelectedOptions
                        value={menuState[sectionTitle] ? Object.keys(menuState[sectionTitle]) : []}
                        onChange={(e) => {
                            setMenuState((prevState) => {
                                return {
                                    ...prevState,
                                    [sectionTitle]: { ...prevState[sectionTitle], [e.target.innerText]: 0 }
                                }
                            })
                        }
                        }
                        options={options}
                        size="small"
                        renderInput={(params) => <TextField variant="filled" {...params} label={'Search ' + sectionTitle} />}
                    />

                    <Stack sx={{ flexWrap: 'wrap', gap: 1, margin: 1 }} direction="row" spacing={1}>
                        {menuState[sectionTitle] && objectMapToArray(menuState[sectionTitle], (state, label) => <ToggleChip
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
}

export default React.memo(SearchSection)