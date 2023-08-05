import React, { useState, useEffect } from 'react';
import AppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import Stack from '@mui/material/Stack';
import SwipeableDrawer from '@mui/material/SwipeableDrawer';
import MenuIcon from '@mui/icons-material/Menu';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import { makeStyles } from '@mui/styles';

// Define your custom theme
const theme = createTheme({
    palette: {
        primary: {
            main: '#2196f3', // Custom primary color
        },
        // Add other customizations to the theme as needed
    },
    // Add other theme settings as needed
});

const useStyles = makeStyles((theme) => ({
    // Define your custom styles here
    list: {
        width: 200,
    },
    padding: {
        paddingRight: 30,
        cursor: 'pointer',
    },
    sideBarIcon: {
        padding: 0,
        color: 'white',
        cursor: 'pointer',
    },
}));

function Navbar() {
    const [drawerActivate, setDrawerActivate] = useState(false);
    const [drawer, setDrawer] = useState(false);

    const handleResize = () => {
        if (window.innerWidth <= 600) {
            setDrawerActivate(true);
        } else {
            setDrawerActivate(false);
        }
    };

    // Debounce the resize event to avoid unnecessary rendering
    const debounceResize = (func, delay) => {
        let timer;
        return function () {
            clearTimeout(timer);
            timer = setTimeout(func, delay);
        };
    };

    // Check the initial screen width when the component mounts
    useEffect(() => {
        const checkInitialWidth = () => {
            if (window.innerWidth <= 600) {
                setDrawerActivate(true);
            }
        };

        checkInitialWidth(); // Call the function on mount
        const debouncedResize = debounceResize(handleResize, 200); // Adjust the delay as needed
        window.addEventListener('resize', debouncedResize);

        return () => {
            window.removeEventListener('resize', debouncedResize);
        };
    }, []);

    const classes = useStyles(); // Get the custom styles using makeStyles

    // Small Screens
    const createDrawer = () => {
        return (
            <div>
                <AppBar>
                    <Toolbar>
                        <Stack direction="row" alignItems="center" gap={2}>
                            <MenuIcon onClick={() => setDrawer(true)} />
                            <Typography color="inherit" variant="h6">Soren Larsen</Typography>
                        </Stack>
                    </Toolbar>
                </AppBar>

                <SwipeableDrawer
                    open={drawer}
                    onClose={() => setDrawer(false)}
                    onOpen={() => setDrawer(true)}
                >
                    <div
                        tabIndex={0}
                        role="button"
                        onClick={() => setDrawer(false)}
                        onKeyDown={() => setDrawer(false)}
                    >
                        <List className={classes.list}> {/* Use the custom styles here */}
                            <ListItem key={1} button divider> Option 1 </ListItem>
                            <ListItem key={2} button divider> Option 2 </ListItem>
                            <ListItem key={3} button divider> Option 3 </ListItem>
                        </List>
                    </div>
                </SwipeableDrawer>
            </div>
        );
    }

    // Larger Screens
    const destroyDrawer = () => {
        return (
            <AppBar>
                <Toolbar>
                    <Typography variant="h6" style={{ flexGrow: 1 }} color="inherit">Soren Larsen</Typography>
                    <Typography variant="subtitle1" className={classes.padding} color="inherit">OPTION 1</Typography> {/* Use the custom styles here */}
                    <Typography variant="subtitle1" className={classes.padding} color="inherit">OPTION 2</Typography> {/* Use the custom styles here */}
                    <Typography variant="subtitle1" className={classes.padding} color="inherit">OPTION 3</Typography> {/* Use the custom styles here */}
                </Toolbar>
            </AppBar>
        );
    }

    return (
        <ThemeProvider theme={theme}>
            <div>
                {drawerActivate ? createDrawer() : destroyDrawer()}
            </div>
        </ThemeProvider>
    );
}

export default Navbar;
