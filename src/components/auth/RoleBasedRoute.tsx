import React from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { Box, Typography, Button, Container } from '@mui/material';
import { Security, ArrowBack } from '@mui/icons-material';

interface RoleBasedRouteProps {
  children: React.ReactNode;
  allowedRoles: ('Admin' | 'User')[];
  fallbackComponent?: React.ReactNode;
}

const RoleBasedRoute: React.FC<RoleBasedRouteProps> = ({ 
  children, 
  allowedRoles, 
  fallbackComponent 
}) => {
  const { user, isAuthenticated } = useAuth();

  // If not authenticated, show login prompt
  if (!isAuthenticated) {
    return (
      <Container maxWidth="sm">
        <Box sx={{ 
          display: 'flex', 
          flexDirection: 'column', 
          alignItems: 'center', 
          justifyContent: 'center', 
          minHeight: '60vh',
          textAlign: 'center'
        }}>
          <Security sx={{ fontSize: 80, color: 'warning.main', mb: 3 }} />
          <Typography variant="h4" gutterBottom>
            Authentication Required
          </Typography>
          <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
            Please log in to access this page.
          </Typography>
          <Button 
            variant="contained" 
            onClick={() => window.location.hash = '#login'}
          >
            Go to Login
          </Button>
        </Box>
      </Container>
    );
  }

  // If no user data, show loading or error
  if (!user) {
    return (
      <Container maxWidth="sm">
        <Box sx={{ 
          display: 'flex', 
          flexDirection: 'column', 
          alignItems: 'center', 
          justifyContent: 'center', 
          minHeight: '60vh',
          textAlign: 'center'
        }}>
          <Typography variant="h6" color="error">
            User data not available
          </Typography>
        </Box>
      </Container>
    );
  }

  // Check if user has required role
  const hasRequiredRole = allowedRoles.includes(user.role);

  if (!hasRequiredRole) {
    // Show custom fallback or default access denied
    if (fallbackComponent) {
      return <>{fallbackComponent}</>;
    }

    return (
      <Container maxWidth="sm">
        <Box sx={{ 
          display: 'flex', 
          flexDirection: 'column', 
          alignItems: 'center', 
          justifyContent: 'center', 
          minHeight: '60vh',
          textAlign: 'center'
        }}>
          <Security sx={{ fontSize: 80, color: 'error.main', mb: 3 }} />
          <Typography variant="h4" gutterBottom>
            Access Denied
          </Typography>
          <Typography variant="body1" color="text.secondary" sx={{ mb: 2 }}>
            You don't have permission to access this page.
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            Required roles: {allowedRoles.join(', ')}
            <br />
            Your role: {user.role}
          </Typography>
          <Button 
            variant="contained" 
            startIcon={<ArrowBack />}
            onClick={() => window.location.hash = '#dashboard'}
          >
            Go to Dashboard
          </Button>
        </Box>
      </Container>
    );
  }

  // User has required role, render children
  return <>{children}</>;
};

export default RoleBasedRoute; 