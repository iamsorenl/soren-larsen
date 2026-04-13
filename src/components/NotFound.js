import React from 'react';
import { Box, Button, Container, Paper, Typography } from '@mui/material';
import HomeIcon from '@mui/icons-material/Home';

const NotFound = ({ homeHref = '/' }) => {
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
        <Typography
          variant="h1"
          component="h1"
          color="primary"
          sx={{ fontWeight: 700, mb: 1 }}
        >
          404
        </Typography>
        <Typography variant="h5" component="h2" gutterBottom>
          Page Not Found
        </Typography>
        <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
          The page you are looking for does not exist or has been moved.
        </Typography>
        <Box sx={{ display: 'flex', justifyContent: 'center' }}>
          <Button
            variant="contained"
            color="primary"
            size="large"
            startIcon={<HomeIcon />}
            href={homeHref}
          >
            Back to Home
          </Button>
        </Box>
      </Paper>
    </Container>
  );
};

export default NotFound;
