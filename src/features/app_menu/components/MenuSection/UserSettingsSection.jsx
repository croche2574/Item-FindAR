import React, { memo } from "react"
import Accordion from "@mui/material/Accordion";
import AccordionSummary from '@mui/material/AccordionSummary';
import AccordionDetails from '@mui/material/AccordionDetails';
import Typography from "@mui/material/Typography";
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { FormGroup, FormControlLabel, Switch, FormHelperText } from "@mui/material";

export const UserSettingsSection = memo((props) => {
    const handleCookieSwitch = () => {
        props.setUseCookies((prevState) => {return !prevState})
    }

    return (
        <Accordion defaultExpanded={props.expanded} disableGutters>
            <AccordionSummary
                expandIcon={<ExpandMoreIcon />}
                aria-controls="panel1a-content">
                <Typography>{props.sectionTitle}</Typography>
            </AccordionSummary> 
            <AccordionDetails>
                    <FormGroup>
                        <FormControlLabel control={<Switch onChange={handleCookieSwitch} checked={props.cookieState}/>} label={"Save User Settings"}/>
                        <FormControlLabel control={<Switch disabled={true}/>} label={"Add to your Home Screen."}/>
                        <FormHelperText>Creates necessary cookies or workers for optional features.</FormHelperText>
                    </FormGroup>
            </AccordionDetails>
        </Accordion>
    )
})