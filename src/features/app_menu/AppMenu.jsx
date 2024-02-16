import React, { useRef, useState, memo } from "react";
import BasicSection from "./components/MenuSection/BasicSection.jsx";
import SearchSection from "./components/MenuSection/SearchSection.jsx";
import ModeSelector from "./components/ModeSelector/ModeSelector.jsx";
import Popover from "@mui/material/Popover";
import Snackbar from "@mui/material/Snackbar";
import './AppMenu.css'
import AppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography'
import Button from '@mui/material/Button';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';
import DoNotDisturbAltIcon from '@mui/icons-material/DoNotDisturbAlt';
import RadioButtonUncheckedIcon from '@mui/icons-material/RadioButtonUnchecked';
import { useReadCypher } from 'use-neo4j'
import { toggleSession } from '@react-three/xr'

const InfoMenu = memo((props) => {
    const infoOpen = Boolean(props.anchorEl);
    const infoID = infoOpen ? 'simple-popover' : undefined;

    const allergenSettingsRef = useRef([])
    const dietaryRestrictionsRef = useRef([])

    const { loading: allergenLoading, records: allergenResults } = useReadCypher('MATCH (a:Allergen) RETURN a.name ORDER BY a.name')
    const toggleStatesAllergens = [
        {
            stateName: 'Neutral',
            color: 'default',
            icon: <RadioButtonUncheckedIcon/>
        },
        {
            stateName: 'Mild',
            color: 'warning',
            icon: <ErrorOutlineIcon/>
        },
        {
            stateName: 'Severe',
            color: 'error',
            icon: <DoNotDisturbAltIcon/>
        }
    ]

    const dietTags = [
        "Gluten-Free",
        "Kosher",
        "Lactose-Free",
        "Vegan",
        "Vegetarian"
    ]
    const toggleStatesDietary = [
        {
            stateName: 'Neutral',
            color: 'default',
            icon: <RadioButtonUncheckedIcon/>
        },
        {
            stateName: 'Allowed',
            color: 'success',
            icon: <CheckCircleOutlineIcon/>
        }
    ]

    const clearHandler = (e) => {
        allergenSettingsRef.current.clearChipStates()
        dietaryRestrictionsRef.current.clearChipStates()
    }

    if (allergenLoading) {
        console.log("Loading")
        return (
            <Snackbar
                open={true}
                message={"Loading Data..."}
                key={'loadmessage'} />
        )
    } else if (allergenResults) {
        return (
            <Popover
                id={infoID}
                open={infoOpen}
                anchorEl={props.anchorEl}
                onClose={props.closeHandler}
                anchorOrigin={{
                    vertical: 'top',
                    horizontal: 'center',
                }}
                transformOrigin={{
                    vertical: 'bottom',
                    horizontal: 'center',
                }}>
                <div className="popup-contents">
                    <AppBar position="static">
                        <Toolbar>
                            <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
                                Info
                            </Typography>
                            <Button color="inherit" onClick={clearHandler}>Clear</Button>
                        </Toolbar>
                    </AppBar>
                    <BasicSection ref={allergenSettingsRef} expanded={true} sectionTitle='Allergens' options={allergenResults.map(row => row.get('a.name'))} toggleStates={toggleStatesAllergens} />
                    <BasicSection ref={dietaryRestrictionsRef} expanded={true} sectionTitle='Dietary Restrictions' options={dietTags} toggleStates={toggleStatesDietary} />
                </div>
            </Popover>
        )
    }
})

//console.log(ingredientList)
const SearchMenu = memo((props) => {
    const { loading: ingredientLoading, records: ingredientResults } = useReadCypher('MATCH (in:Ingredient) RETURN in.name ORDER BY in.name')
    const { loading: itemLoading, records: itemResults } = useReadCypher('MATCH (i:Item) RETURN i.name ORDER BY i.name')
    const { loading: allergenLoading, records: allergenResults } = useReadCypher('MATCH (a:Allergen) RETURN a.name ORDER BY a.name')
    const { loading: itemTagLoading, records: itemTagResults } = useReadCypher('MATCH (t:ItemTag) RETURN t.name ORDER BY t.name')

    const ingredientRef = useRef([])
    const allergenRef = useRef([])
    const itemtagRef = useRef([])
    const itemRef = useRef([])

    const searchOpen = Boolean(props.anchorEl)
    const searchID = searchOpen ? 'simple-popover' : undefined;

    const basicToggleStates = [
        {
            stateName: 'Neutral',
            color: 'default',
            icon: <RadioButtonUncheckedIcon/>
        },
        {
            stateName: 'Allowed',
            color: 'success',
            icon: <CheckCircleOutlineIcon/>
        },
        {
            stateName: 'Denied',
            color: 'error',
            icon: <DoNotDisturbAltIcon/>
        }
    ]

    const searchToggleStates = [
        {
            stateName: 'Allowed',
            color: 'success',
            icon: <CheckCircleOutlineIcon/>
        },
        {
            stateName: 'Denied',
            color: 'error',
            icon: <DoNotDisturbAltIcon/>
        }
    ]

    const clearHandler = (e) => {
        ingredientRef.current.clearChipStates()
        allergenRef.current.clearChipStates()
        itemtagRef.current.clearChipStates()
        itemRef.current.clearChipStates()
    }

    if (ingredientLoading || allergenLoading || itemTagLoading || itemLoading) {
        console.log("Loading")
        return (
            <Snackbar
                open={true}
                message={"Loading Data..."}
                key={'loadmessage'} />
        )
    } else if (ingredientResults && itemResults && allergenResults && itemTagResults) {
        return (
            <Popover
                id={searchID}
                open={searchOpen}
                anchorEl={props.anchorEl}
                onClose={props.closeHandler}
                anchorOrigin={{
                    vertical: 'top',
                    horizontal: 'center'
                }}
                transformOrigin={{
                    vertical: 'bottom',
                    horizontal: 'center',
                }}>
                <div className="popup-contents">
                    <AppBar position="static">
                        <Toolbar>
                            <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
                                Search
                            </Typography>
                            <Button color="inherit" onClick={clearHandler}>Clear</Button>
                        </Toolbar>
                    </AppBar>
                    <SearchSection ref={itemRef} sectionTitle='Items' options={itemResults.map(row => row.get('i.name'))} toggleStates={searchToggleStates} />
                    <BasicSection ref={allergenRef} sectionTitle='Allergens' options={allergenResults.map(row => row.get('a.name'))} toggleStates={basicToggleStates} />
                    <SearchSection ref={itemtagRef} sectionTitle='Item Tags' options={itemTagResults.map(row => row.get('t.name'))} toggleStates={searchToggleStates} />
                    <SearchSection ref={ingredientRef} sectionTitle='Ingredients' options={ingredientResults.map(row => row.get('in.name'))} toggleStates={searchToggleStates} />
                </div>
            </Popover>
        )
    }
})

export const AppMenu = memo((props) => {
    const [infoAnchorEl, setInfoAnchorEl] = useState(null)
    const [searchAnchorEl, setSearchAnchorEl] = useState(null)

    const menuStyle = {
        height: '100%',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        flexDirection: 'column',
    }

    return (
        <div className="AppMenu" style={menuStyle}>
            <ModeSelector
                id={'selector'}
                infoHandler={(event) => setInfoAnchorEl(event.currentTarget.parentNode.parentNode.parentNode.parentNode.parentNode.parentNode)}
                searchHandler={(event) => setSearchAnchorEl(event.currentTarget.parentNode.parentNode.parentNode.parentNode.parentNode.parentNode)}
                closeHandler={(event) => toggleSession('immersive-ar')}
            />
            <InfoMenu closeHandler={(event) => setInfoAnchorEl(null)} anchorEl={infoAnchorEl} />
            <SearchMenu closeHandler={(event) => setSearchAnchorEl(null)} anchorEl={searchAnchorEl} />
        </div>
    )
})