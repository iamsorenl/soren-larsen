import React from 'react';
import './App.css';
//import Navbar from './components/Navbar';
import InterumNavbar from './components/InterumNavbar';
import Body from './components/Body';
import { ThemeProvider } from '@mui/material/styles';
import theme from './theme';

function App() {
  return (
    <ThemeProvider theme={theme}>
      <div className="App">
        {/*<Navbar /> trying to figure out how to scroll by id*/}
        <InterumNavbar />
        <Body />
        {/*<div style={{ marginTop: '64px' }}>
          <Body />
        </div>*/}
      </div>
    </ThemeProvider>
  );
}

export default App;
