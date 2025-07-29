import React from 'react';
import Navbar from '../navigation/Navbar';
import Footer from './Footer';
import { Box, useTheme } from '@mui/material';

interface AuthenticatedLayoutProps {
  children: React.ReactNode;
}

const AuthenticatedLayout: React.FC<AuthenticatedLayoutProps> = ({ children }) => {
  const theme = useTheme();

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <Navbar />
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          mt: { xs: 8, sm: 10 }, // 8*8=64px for xs, 10*8=80px for sm and up
          pb: 2,
          px: 2,
        }}
      >
        {children}
      </Box>
      <Footer />
    </Box>
  );
};

export default AuthenticatedLayout; 