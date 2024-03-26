import React, { useRef, useState, memo, useCallback } from "react";
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
import { UserSettingsSection } from "./components/MenuSection/UserSettingsSection.jsx";
import { useCookieState } from "./hooks/UseCookieState.jsx";

const InfoMenu = memo((props) => {
    const infoOpen = Boolean(props.anchorEl);
    const infoID = infoOpen ? 'simple-popover' : undefined;
    const [menuState, setMenuState, enabled, setEnabled] = useCookieState('usrSettings', {})
    const allergenSettingsRef = useRef()
    const dietaryRestrictionsRef = useRef()

    const { loading: allergenLoading, records: allergenResults } = useReadCypher('MATCH (a:Allergen) RETURN a.name ORDER BY a.name')
    const toggleStatesAllergens = [
        {
            stateName: 'Neutral',
            color: 'default',
            icon: <RadioButtonUncheckedIcon />
        },
        {
            stateName: 'Mild',
            color: 'warning',
            icon: <ErrorOutlineIcon />
        },
        {
            stateName: 'Severe',
            color: 'error',
            icon: <DoNotDisturbAltIcon />
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
            icon: <RadioButtonUncheckedIcon />
        },
        {
            stateName: 'Allowed',
            color: 'success',
            icon: <CheckCircleOutlineIcon />
        }
    ]

    //const allergenDescription = "Tap the options below to change between Neutral, Mild, or Severe.\n"

    const clearHandler = useCallback((e) => {
        allergenSettingsRef.current.clearChipStates()
        dietaryRestrictionsRef.current.clearChipStates()
        setEnabled(false)
    }, [])

    const closeHandler = useCallback(() => {
        console.log('menustate ', menuState)
        props.formatInfo(menuState)
        props.setAnchorEl(null)
    }, [menuState])

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
                onClose={closeHandler}
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
                                General Info
                            </Typography>
                            <Button color="inherit" onClick={clearHandler}>Clear</Button>
                        </Toolbar>
                    </AppBar>
                    <BasicSection ref={allergenSettingsRef} expanded={true} sectionTitle='Allergens' options={allergenResults.map(row => row.get('a.name'))} menuState={menuState} setMenuState={setMenuState} toggleStates={toggleStatesAllergens} />
                    <BasicSection ref={dietaryRestrictionsRef} expanded={true} sectionTitle='Dietary Restrictions' options={dietTags} menuState={menuState} setMenuState={setMenuState} toggleStates={toggleStatesDietary} />
                    <UserSettingsSection expanded={true} sectionTitle='User Settings' setUseCookies={setEnabled} cookieState={enabled} />
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

    const searchOpen = Boolean(props.anchorEl)
    const searchID = searchOpen ? 'simple-popover' : undefined;
    const [menuState, setMenuState] = useState({})
    const allergenRef = useRef()

    const basicToggleStates = [
        {
            stateName: 'Neutral',
            color: 'default',
            icon: <RadioButtonUncheckedIcon />
        },
        {
            stateName: 'Allowed',
            color: 'success',
            icon: <CheckCircleOutlineIcon />
        },
        {
            stateName: 'Denied',
            color: 'error',
            icon: <DoNotDisturbAltIcon />
        }
    ]

    const searchToggleStates = [
        {
            stateName: 'Allowed',
            color: 'success',
            icon: <CheckCircleOutlineIcon />
        },
        {
            stateName: 'Denied',
            color: 'error',
            icon: <DoNotDisturbAltIcon />
        }
    ]

    const clearHandler = useCallback((e) => {
        setMenuState({})
        allergenRef.current.clearChipStates()
    }, [])

    const closeHandler = useCallback((e) => {
        props.formatClasses(menuState)
        props.setAnchorEl(null)
    }, [menuState])

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
                onClose={closeHandler}
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
                    <SearchSection expanded={true} sectionTitle='Items' options={itemResults.map(row => row.get('i.name'))} menuState={menuState} setMenuState={setMenuState} toggleStates={searchToggleStates} />
                    <BasicSection ref={allergenRef} expanded={true} sectionTitle='Allergens' options={allergenResults.map(row => row.get('a.name'))} menuState={menuState} setMenuState={setMenuState} toggleStates={basicToggleStates} />
                    <SearchSection expanded={true} sectionTitle='Item Tags' options={itemTagResults.map(row => row.get('t.name'))} menuState={menuState} setMenuState={setMenuState} toggleStates={searchToggleStates} />
                    <SearchSection expanded={true} sectionTitle='Ingredients' options={ingredientResults.map(row => row.get('in.name'))} menuState={menuState} setMenuState={setMenuState} toggleStates={searchToggleStates} />
                </div>
            </Popover>
        )
    }
})

export const AppMenu = memo((props) => {
    const [infoAnchorEl, setInfoAnchorEl] = useState(null)
    const [searchAnchorEl, setSearchAnchorEl] = useState(null)
    const anchorRef = useRef()
    const menuStyle = {
        height: '100%',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        flexDirection: 'column',
    }

    const formatInfo = useCallback((state) => {
        const allergens = Object.keys(state['Allergens']).reduce((newObj, key) => {
            if (state['Allergens'][key] != 0) newObj[key] = state['Allergens'][key]
            return newObj
        }, {})
        const dietary = Object.keys(state['Dietary Restrictions']).reduce((newObj, key) => {
            if (state['Dietary Restrictions'][key] != 0) newObj[key] = state['Dietary Restrictions'][key]
            return newObj
        }, {})

        props.setUserInfo({ allergens: { ...allergens }, restrictions: { ...dietary } })
    }, [])

    const formatClassQuery = useCallback((state) => {
        const formattedData = Object.keys(state).reduce((newObj, key) => {
            const section = state[key]
            Object.keys(section).forEach((option) => {
                if (key === 'Allergens') {
                    if (section[option] === 1) newObj['allowed'].push(option)
                    if (section[option] === 2) newObj['denied'].push(option)
                } else {
                    if (section[option] === 0) newObj['allowed'].push(option)
                    if (section[option] === 1) newObj['denied'].push(option)
                }
            })
            return newObj
        }, { allowed: [], denied: [] })

        const allowed = formattedData.allowed.map(i => `'${i}'`).join(',')
        const denied = formattedData.denied.map(i => `'${i}'`).join(',')
        let op = ""
        if (allowed.length === 0 && denied.length === 0) {
            props.setQuery(`
                Match (i:Item) where i.name = 'none'
                WITH collect(i.class_code) as codes
                Return codes'`)
        } else {
            props.setQuery(`
                OPTIONAL MATCH (a:Allergen|Ingredient|ItemTag WHERE a.name IN [${allowed}])
                OPTIONAL MATCH (d:Allergen|Ingredient|ItemTag WHERE d.name IN [${denied}])
                WITH collect(a) AS allowed, collect(d) as denied
                MATCH (items:Item) WHERE ALL(a IN allowed WHERE (items)--(a) OR (items)--()-[:CONTAINS_SUBINGREDIENT]->(a)) 
                MATCH (items:Item) WHERE NONE(d IN denied WHERE (items)--(d) OR (items)--()-[:CONTAINS_SUBINGREDIENT]->(d))
                RETURN items.class_code AS class_codes`)
        }
    }, [])

    return (
        <div className="AppMenu" style={menuStyle}>
            <ModeSelector
                id={'selector'}
                anchorRef={anchorRef}
                infoHandler={(event) => setInfoAnchorEl(anchorRef.current)}
                searchHandler={(event) => setSearchAnchorEl(anchorRef.current)}
                closeHandler={(event) => toggleSession('immersive-ar')}
                setSearchMode={props.setSearchMode}
            />
            <InfoMenu
                anchorEl={infoAnchorEl}
                setAnchorEl={setInfoAnchorEl}
                setUseCookies={props.setUseCookies}
                formatInfo={formatInfo} />
            <SearchMenu
                anchorEl={searchAnchorEl}
                setAnchorEl={setSearchAnchorEl}
                formatClasses={formatClassQuery} />
        </div>
    )
})