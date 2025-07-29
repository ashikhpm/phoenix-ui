import React from 'react';
import { Box, Container } from '@mui/material';
import LoginForm from './LoginForm';

const AuthManager: React.FC = () => {
  return (
    <Container maxWidth="sm">
      <Box sx={{ width: '100%', mt: 4 }}>
        <LoginForm />
      </Box>
    </Container>
  );
};

export default AuthManager; 