import React from 'react';
import { Button, Container, Paper, Typography } from '@mui/material';
import RefreshIcon from '@mui/icons-material/Refresh';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    // Log error to console so it shows up in devtools / monitoring if wired up later.
    // eslint-disable-next-line no-console
    console.error('ErrorBoundary caught an error:', error, errorInfo);
  }

  handleReload = () => {
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      return (
        <Container
          maxWidth="sm"
          sx={{
            minHeight: '100vh',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            py: 4,
          }}
        >
          <Paper
            elevation={3}
            sx={{
              p: { xs: 3, sm: 5 },
              textAlign: 'center',
              width: '100%',
              borderRadius: 4,
            }}
          >
            <Typography variant="h3" component="h1" gutterBottom color="primary">
              Something went wrong
            </Typography>
            <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
              An unexpected error occurred while rendering this page. You can try
              reloading to get back on track.
            </Typography>
            <Button
              variant="contained"
              color="primary"
              size="large"
              startIcon={<RefreshIcon />}
              onClick={this.handleReload}
            >
              Reload Page
            </Button>
          </Paper>
        </Container>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
