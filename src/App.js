import './App.css';
import Navbar from './components/Navbar';
import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';

function App() {

  return (
    <div className="App" style={{ position: 'relative', minHeight: '100vh' }}>
      <Navbar />
      <div style={{ position: 'absolute', top: '64px', left: 0, right: 0 }}>
        <Container>
          <Typography>
            poop
          </Typography>
        </Container>
      </div>
    </div>
  );
}

export default App;
