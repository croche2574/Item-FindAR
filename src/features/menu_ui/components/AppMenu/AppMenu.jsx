import React, { useEffect, useState } from "react";
import BasicSection from "../MenuSection/BasicSection.jsx";
import SearchSection from "../MenuSection/SearchSection.jsx";
import ModeSelector from "../ModeSelector/ModeSelector.jsx";
import Popover from "@mui/material/Popover";
import Snackbar from "@mui/material/Snackbar";
import './AppMenu.css'
import AppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography'
import Button from '@mui/material/Button';
import { useReadCypher } from 'use-neo4j'

export default function AppMenu(props) {
    const [infoToggle, setInfoToggle] = useState(null)
    const [searchToggle, setSearchToggle] = useState(null)
    const [settingsToggle, setSettingsToggle] = useState(null)
    const [settingsClosed, setSettingsClosed] = useState(0)
    const [anchor, setAnchor] = useState(null)

    const handleClose = () => {
        if (settingsToggle) {
            setSettingsClosed(settingsClosed + 1)
        }
        setInfoToggle(null);
        setSearchToggle(null);
        setSettingsToggle(null);
    };

    useEffect(() => {
        setAnchor(document.getElementById('selector'))
        if (anchor) {
            //console.log('anchor set')
        }
    })

    const infoOpen = Boolean(infoToggle);
    const infoID = infoOpen ? 'simple-popover' : undefined;

    const searchOpen = Boolean(searchToggle);
    const searchID = searchOpen ? 'simple-popover' : undefined;

    const settingsOpen = Boolean(settingsToggle);
    const settingsID = settingsOpen ? 'simple-popover' : undefined;

    const InfoMenu = (props) => {
        return (
            <Popover
                id={infoID}
                open={infoOpen}
                anchorEl={infoToggle}
                onClose={handleClose}
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
                        </Toolbar>
                    </AppBar>
                </div>
            </Popover>
        )
    }

    const { loading: ingredientLoading, records: ingredientRecords} = useReadCypher('MATCH (in:Ingredient) RETURN in.name ORDER BY in.name')
    const { loading: itemLoading, records: itemRecords } = useReadCypher('MATCH (i:Item) RETURN i.name ORDER BY i.name')
    const { loading: allergenLoading, records: allergenRecords } = useReadCypher('MATCH (a:Allergen) RETURN a.name ORDER BY a.name')
    const { loading: itemTagLoading, records: itemTagRecords } = useReadCypher('MATCH (t:ItemTag) RETURN t.name ORDER BY t.name')
    const [ingredientList, setIngredientList] = useState(null)
    const [itemList, setItemList] = useState(null)
    const [allergenList, setAllergenList] = useState(null)
    const [tagList, setTaglist] = useState(null)

    if (ingredientRecords && (ingredientList === null)) {setIngredientList(ingredientRecords.map(row => row.get('in.name')))}
    if (itemRecords && (itemList === null)) {setItemList(itemRecords.map(row => row.get('i.name')))}
    if (allergenRecords && (allergenList === null)) {setAllergenList(allergenRecords.map(row => row.get('a.name')))}
    if (itemTagRecords && (tagList === null)) {setTaglist(itemTagRecords.map(row => row.get('t.name')))}

    //console.log(ingredientList)
    const SearchMenu = (props) => {

        if (ingredientLoading || allergenLoading || itemTagLoading || itemLoading) {
            return (
                <Snackbar
                open={true}
                message="Loading Data..."
                key={'loadmessage'} />
            )
        }

        return (
            <Popover
                id={searchID}
                open={searchOpen}
                anchorEl={searchToggle}
                onClose={handleClose}
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
                            <Button color="inherit">Clear</Button>
                        </Toolbar>
                    </AppBar>
                    <SearchSection sectionTitle='Items' options={itemList}/>
                    <BasicSection sectionTitle='Allergens' options={allergenList} />
                    <SearchSection sectionTitle='Item Tags' options={tagList}/>
                    <SearchSection sectionTitle='Ingredients' options={ingredientList}/>
                </div>
            </Popover>
        )
    }

    const SettingsMenu = (props) => {
        return (
            <Popover
                id={settingsID}
                open={settingsOpen}
                anchorEl={settingsToggle}
                onClose={handleClose}
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
                                Settings
                            </Typography>
                        </Toolbar>
                    </AppBar>
                </div>
            </Popover>
        )
    }

    return (
        <div className="AppMenu">
            <div id='selector'>
                <ModeSelector
                    infoHandler={(event) => setInfoToggle(document.getElementById('selector'))}
                    searchHandler={(event) => setSearchToggle(document.getElementById('selector'))}
                    settingsHandler={(event) => setSettingsToggle(document.getElementById('selector'))}
                    closed={settingsClosed}
                />
            </div>
            <InfoMenu />
            <SearchMenu />
            <SettingsMenu />
        </div>
    )
}