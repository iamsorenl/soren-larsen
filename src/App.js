import React from 'react';
import './App.css';
import Navigation from './components/Navigation';
import Body from './components/Body';
import ErrorBoundary from './components/ErrorBoundary';
import ChatWidget from './components/chat/ChatWidget';
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
          <ChatWidget />
        </div>
      </ErrorBoundary>
    </ThemeProvider>
  );
}

export default App;
