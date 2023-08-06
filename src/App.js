import React from 'react';
import './App.css';
import Navbar from './components/Navbar';
import { ThemeProvider } from '@mui/material/styles';
import Typography from '@mui/material/Typography';
import theme from './theme';

function App() {
  return (
    <ThemeProvider theme={theme}>
      <div className="App">
        <Navbar />
        <div style={{ marginTop: '64px' }}>
          {/* 64px is the height of the Navbar. Adjust this value based on your Navbar's height */}
          <Typography variant="h6" style={{ color: 'white' }}>
            This is some white text below the Navbar.
          </Typography>
          {/* Your other components can also be added here */}
        </div>
      </div>
    </ThemeProvider>
  );
}

export default App;
