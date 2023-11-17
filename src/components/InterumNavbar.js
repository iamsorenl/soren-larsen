import React from 'react';
import { styled, ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import AppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import theme from '../theme';

const Root = styled('div')({
    display: 'flex',
});

function LargeNavbar() {

    return (
        <ThemeProvider theme={theme}>
            <CssBaseline />
            <Root>
                <AppBar position="static">
                    <Toolbar>
                        <Typography variant="h6" noWrap>
                            Soren Larsen
                        </Typography>
                    </Toolbar>
                </AppBar>
            </Root>
        </ThemeProvider>
    );
}

export default LargeNavbar;