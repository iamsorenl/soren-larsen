import React from 'react';
import './App.css';
import Navbar from './components/Navbar';
import Body from './components/Body';
import { ThemeProvider } from '@mui/material/styles';
import theme from './theme';

function App() {
  return (
    <ThemeProvider theme={theme}>
      <div className="App">
        <Navbar />
        <div style={{ marginTop: '64px' }}>
          <Body />
        </div>
      </div>
    </ThemeProvider>
  );
}

export default App;
