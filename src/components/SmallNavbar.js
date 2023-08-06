import React from 'react';
import { styled, ThemeProvider } from '@mui/material/styles';
import Drawer from '@mui/material/Drawer';
import CssBaseline from '@mui/material/CssBaseline';
import AppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import List from '@mui/material/List';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import MenuIcon from '@mui/icons-material/Menu';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import AccountBoxIcon from '@mui/icons-material/AccountBox';
import DescriptionIcon from '@mui/icons-material/Description';
import BuildIcon from '@mui/icons-material/Build';
import WorkIcon from '@mui/icons-material/Work';
import BusinessIcon from '@mui/icons-material/Business';
import MailIcon from '@mui/icons-material/Mail';
import theme from '../styles';

const drawerWidth = 240;

const Root = styled('div')({
    display: 'flex',
    backgroundColor: '#dfd5a5',
});

const StyledAppBar = styled(AppBar)(({ theme }) => ({
    zIndex: theme.zIndex.drawer + 1,
    backgroundColor: theme.palette.one.main,
}));

const StyledDrawer = styled(Drawer)({
    width: drawerWidth,
    flexShrink: 0,
});

const StyledDrawerPaper = styled('div')({
    width: drawerWidth,
});

const StyledDrawerHeader = styled('div')({
    display: 'flex',
    alignItems: 'center',
    padding: theme.spacing(0, 1),
    // necessary for content to be below app bar
    ...theme.mixins.toolbar,
    justifyContent: 'flex-end',
});

const StyledMain = styled('main')({
    flexGrow: 1,
    padding: theme.spacing(3),
    transition: theme.transitions.create('margin', {
        easing: theme.transitions.easing.sharp,
        duration: theme.transitions.duration.leavingScreen,
    }),
    marginLeft: -drawerWidth,
});

const CenteredListItemButton = styled(ListItemButton)({
    display: 'flex',
    justifyContent: 'center',
    '& .MuiListItemIcon-root': {
        minWidth: 'auto',
    },
    '& .MuiListItemText-root': {
        textAlign: 'center',
    },
});

function SmallNavbar() {
    const [open, setOpen] = React.useState(false);

    const handleToggleDrawer = () => {
        setOpen((o) => !o);
    };

    const handleButtonClick = (text) => {
        console.log(`Small Clicked on: ${text}`);
    };

    return (
        <ThemeProvider theme={theme}>
            <Root>
                <CssBaseline />
                <StyledAppBar position="fixed">
                    <Toolbar>
                        <IconButton
                            color="inherit"
                            aria-label="open drawer"
                            onClick={handleToggleDrawer}
                            edge="start"
                            sx={{ marginRight: 2 }}
                        >
                            <MenuIcon />
                        </IconButton>
                        <Typography variant="h6" noWrap>
                            Soren Larsen
                        </Typography>
                    </Toolbar>
                </StyledAppBar>
                <StyledDrawer
                    variant="persistent"
                    anchor="top"
                    open={open}
                    classes={{ paper: StyledDrawerPaper }}
                >
                    <StyledDrawerHeader>
                        <IconButton onClick={handleToggleDrawer}>
                            {theme.direction === 'ltr' ? <ChevronLeftIcon /> : <ChevronRightIcon />}
                        </IconButton>
                    </StyledDrawerHeader>
                    <List>
                        {[
                            { text: 'About', icon: <AccountBoxIcon /> },
                            { text: 'Resume', icon: <DescriptionIcon /> },
                            { text: 'Skills', icon: <BuildIcon /> },
                            { text: 'Projects', icon: <WorkIcon /> },
                            { text: 'Experience', icon: <BusinessIcon /> },
                            { text: 'Contact', icon: <MailIcon /> },
                        ].map((item) => (
                            <CenteredListItemButton key={item.text} onClick={() => handleButtonClick(item.text)}>
                                <Stack direction='row' alignItems='center' spacing={0.5}>
                                    <ListItemIcon>{item.icon}</ListItemIcon>
                                    <ListItemText primary={item.text} />
                                </Stack>
                            </CenteredListItemButton>
                        ))}
                    </List>
                </StyledDrawer>
                <StyledMain>
                    <StyledDrawerHeader />
                </StyledMain>
            </Root>
        </ThemeProvider>
    );
}

export default SmallNavbar;
