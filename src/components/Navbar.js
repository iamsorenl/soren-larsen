import React, { useState, useEffect } from 'react';
import AppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import Stack from '@mui/material/Stack';
import SwipeableDrawer from '@mui/material/SwipeableDrawer';
import MenuIcon from '@mui/icons-material/Menu';
import { createTheme, ThemeProvider, styled } from '@mui/material/styles';

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

// Styled AppBar to customize the styles
const StyledAppBar = styled(AppBar)(({ theme }) => ({
    // Add custom styles here if needed
}));

// Styled Typography to customize the styles
const StyledTypography = styled(Typography)(({ theme }) => ({
    flexGrow: 1,
    // Add custom styles here if needed
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

    // Small Screens
    const createDrawer = () => {
        return (
            <div>
                <StyledAppBar>
                    <Toolbar>
                        <Stack direction="row" alignItems="center" gap={2}>
                            <MenuIcon onClick={() => setDrawer(true)} />
                            <StyledTypography color="inherit" variant="h6">
                                Soren Larsen
                            </StyledTypography>
                        </Stack>
                    </Toolbar>
                </StyledAppBar>

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
                        <List sx={{ width: 200 }}>
                            {/* Use the custom styles here */}
                            <ListItem key={1} button divider>
                                Option 1
                            </ListItem>
                            <ListItem key={2} button divider>
                                Option 2
                            </ListItem>
                            <ListItem key={3} button divider>
                                Option 3
                            </ListItem>
                        </List>
                    </div>
                </SwipeableDrawer>
            </div>
        );
    };

    // Larger Screens
    const destroyDrawer = () => {
        return (
            <StyledAppBar>
                <Toolbar>
                    <StyledTypography variant="h6" color="inherit">
                        Soren Larsen
                    </StyledTypography>
                    <Stack direction="row" alignItems="center" gap={2}>
                        {/* Use the custom styles here */}
                        <Typography variant="subtitle1" sx={{ cursor: 'pointer' }} color="inherit">
                            About
                        </Typography>
                        {/* Use the custom styles here */}
                        <Typography variant="subtitle1" sx={{ cursor: 'pointer' }} color="inherit">
                            Resume
                        </Typography>
                        {/* Use the custom styles here */}
                        <Typography variant="subtitle1" sx={{ cursor: 'pointer' }} color="inherit">
                            Skills
                        </Typography>
                        {/* Use the custom styles here */}
                        <Typography variant="subtitle1" sx={{ cursor: 'pointer' }} color="inherit">
                            Projects
                        </Typography>
                        {/* Use the custom styles here */}
                        <Typography variant="subtitle1" sx={{ cursor: 'pointer' }} color="inherit">
                            Experience
                        </Typography>
                        <Typography variant="subtitle1" sx={{ cursor: 'pointer' }} color="inherit">
                            Contact
                        </Typography>
                    </Stack>
                </Toolbar>
            </StyledAppBar>
        );
    };

    return (
        <ThemeProvider theme={theme}>
            <div>
                {drawerActivate ? createDrawer() : destroyDrawer()}
            </div>
        </ThemeProvider>
    );
}

export default Navbar;
