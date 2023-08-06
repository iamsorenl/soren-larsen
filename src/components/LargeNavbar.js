import React from 'react';
import { styled, createTheme, ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import AppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import AccountBoxIcon from '@mui/icons-material/AccountBox';
import DescriptionIcon from '@mui/icons-material/Description';
import BuildIcon from '@mui/icons-material/Build';
import WorkIcon from '@mui/icons-material/Work';
import BusinessIcon from '@mui/icons-material/Business';
import MailIcon from '@mui/icons-material/Mail';

const theme = createTheme();

const Root = styled('div')({
    display: 'flex',
});

const StyledAppBar = styled(AppBar)({
    zIndex: theme.zIndex.drawer + 1,
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

const RightAlignedStack = styled(Stack)({
    marginLeft: 'auto',
    marginRight: theme.spacing(2), // Add some margin on the right for better spacing
    position: 'fixed',
    right: 0,
});

function LargeNavbar() {
    return (
        <ThemeProvider theme={theme}>
            <CssBaseline />
            <Root>
                <StyledAppBar position="fixed">
                    <Toolbar>
                        <Typography variant="h6" noWrap>
                            Soren Larsen
                        </Typography>
                        <RightAlignedStack direction="row" spacing={2}>
                            <CenteredListItemButton>
                                <Stack direction="row" alignItems="center" spacing={0.5}>
                                    <ListItemIcon style={{ color: 'white' }}>
                                        <AccountBoxIcon />
                                    </ListItemIcon>
                                    <ListItemText primary="About" />
                                </Stack>
                            </CenteredListItemButton>
                            <CenteredListItemButton>
                                <Stack direction="row" alignItems="center" spacing={0.5}>
                                    <ListItemIcon style={{ color: 'white' }}>
                                        <DescriptionIcon />
                                    </ListItemIcon>
                                    <ListItemText primary="Resume" />
                                </Stack>
                            </CenteredListItemButton>
                            <CenteredListItemButton>
                                <Stack direction="row" alignItems="center" spacing={0.5}>
                                    <ListItemIcon style={{ color: 'white' }}>
                                        <BuildIcon />
                                    </ListItemIcon>
                                    <ListItemText primary="Skills" />
                                </Stack>
                            </CenteredListItemButton>
                            <CenteredListItemButton>
                                <Stack direction="row" alignItems="center" spacing={0.5}>
                                    <ListItemIcon style={{ color: 'white' }}>
                                        <WorkIcon />
                                    </ListItemIcon>
                                    <ListItemText primary="Projects" />
                                </Stack>
                            </CenteredListItemButton>
                            <CenteredListItemButton>
                                <Stack direction="row" alignItems="center" spacing={0.5}>
                                    <ListItemIcon style={{ color: 'white' }}>
                                        <BusinessIcon />
                                    </ListItemIcon>
                                    <ListItemText primary="Experience" />
                                </Stack>
                            </CenteredListItemButton>
                            <CenteredListItemButton>
                                <Stack direction="row" alignItems="center" spacing={0.5}>
                                    <ListItemIcon style={{ color: 'white' }}>
                                        <MailIcon />
                                    </ListItemIcon>
                                    <ListItemText primary="Contact" />
                                </Stack>
                            </CenteredListItemButton>
                        </RightAlignedStack>
                    </Toolbar>
                </StyledAppBar>
            </Root>
        </ThemeProvider>
    );
}

export default LargeNavbar;
