import './App.css';
//import ProjectCard from './components/ProjectCard';
import Navbar from './components/Navbar';
import { ThemeProvider } from '@mui/material/styles';
//import Container from '@mui/material/Container';
//import Grid from '@mui/material/Grid';
import theme from './theme'; // Import your custom theme

function App() {
  return (
    <ThemeProvider theme={theme}>
      <div className="App">
        <Navbar />
      </div>
    </ThemeProvider>
  );
}

export default App;