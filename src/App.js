import React from 'react';
import './App.css';
import Navigation from './components/Navigation';
import Body from './components/Body';
import ErrorBoundary from './components/ErrorBoundary';
import { ThemeProvider } from './contexts/ThemeContext';
import { Box } from '@mui/material';

function App() {
  return (
    <ThemeProvider>
      <ErrorBoundary>
        <div className="App">
          <Navigation />
          <Box sx={{ pt: 8 }}>
            <Body />
          </Box>
        </div>
      </ErrorBoundary>
    </ThemeProvider>
  );
}

export default App;
