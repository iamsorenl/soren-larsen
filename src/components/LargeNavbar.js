import React from 'react';
import { styled, ThemeProvider } from '@mui/material/styles';
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
import SchoolIcon from '@mui/icons-material/School';
import theme from '../theme';

const Root = styled('div')({
    display: 'flex',
});

const RightAlignedStack = styled(Stack)({
    marginLeft: 'auto',
    marginRight: theme.spacing(2), // Add some margin on the right for better spacing
    position: 'fixed',
    right: 0,
});

const menuItems = [
    { text: 'About', icon: <AccountBoxIcon /> },
    { text: 'Resume', icon: <DescriptionIcon /> },
    { text: 'Skills', icon: <BuildIcon /> },
    { text: 'Projects', icon: <WorkIcon /> },
    { text: 'Experience', icon: <BusinessIcon /> },
    { text: 'Education', icon: <SchoolIcon /> },
    { text: 'Contact', icon: <MailIcon /> },
];

const CustomListItemButton = styled(ListItemButton)(({ theme }) => ({
    paddingTop: theme.spacing(2.5),
    paddingBottom: theme.spacing(2.5),
    '& .MuiListItemIcon-root': {
        color: "#e8eaf6",
        minWidth: 'auto',
    },
    '&:hover': {
        backgroundColor: theme.palette.primary.main,
    },
}));

function LargeNavbar() {
    const handleButtonClick = (text) => {
        console.log(`Large Clicked on: ${text}`);
    };

    return (
        <ThemeProvider theme={theme}>
            <CssBaseline />
            <Root>
                <AppBar position="fixed">
                    <Toolbar>
                        <Typography variant="h6" noWrap>
                            Soren Larsen
                        </Typography>
                        <RightAlignedStack direction="row">
                            {menuItems.map((item) => (
                                <CustomListItemButton key={item.text} onClick={() => handleButtonClick(item.text)}>
                                    <Stack direction="row" alignItems="center" spacing={0.5}>
                                        <ListItemIcon>{item.icon}</ListItemIcon>
                                        <ListItemText primary={item.text} />
                                    </Stack>
                                </CustomListItemButton>
                            ))}
                        </RightAlignedStack>
                    </Toolbar>
                </AppBar>
            </Root>
        </ThemeProvider>
    );
}

export default LargeNavbar;