import React from 'react';
import { useAuth } from '../../contexts/AuthContext';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Avatar,
  Chip,
  Paper,
  Container
} from '@mui/material';
import { Person, Email, Security } from '@mui/icons-material';
import AuthenticatedLayout from '../layout/AuthenticatedLayout';

const ProfilePage: React.FC = () => {
  const { user } = useAuth();

  if (!user) {
    return (
      <AuthenticatedLayout>
        <Container>
          <Typography variant="h6" color="error">
            User not found
          </Typography>
        </Container>
      </AuthenticatedLayout>
    );
  }

  const getRoleColor = (role: string) => {
    return role === 'Admin' ? 'error' : 'primary';
  };

  return (
    <AuthenticatedLayout>
      <Container maxWidth="md">
        <Box sx={{ py: 4 }}>
          <Typography variant="h4" component="h1" gutterBottom>
            Profile
          </Typography>
          
          <Paper elevation={3} sx={{ p: 4, mt: 3 }}>
            <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, gap: 4 }}>
              <Box sx={{ 
                display: 'flex', 
                flexDirection: 'column', 
                alignItems: 'center',
                flex: { xs: '1', md: '0 0 300px' }
              }}>
                <Avatar
                  sx={{
                    width: 120,
                    height: 120,
                    bgcolor: 'primary.main',
                    fontSize: '3rem',
                    mb: 2
                  }}
                >
                  {user.name.charAt(0).toUpperCase()}
                </Avatar>
                <Chip
                  label={user.role}
                  color={getRoleColor(user.role) as any}
                  icon={<Security />}
                  sx={{ mb: 2 }}
                />
              </Box>
              
              <Box sx={{ 
                display: 'flex', 
                flexDirection: 'column', 
                gap: 3,
                flex: '1'
              }}>
                <Card>
                  <CardContent>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                      <Person sx={{ mr: 2, color: 'primary.main' }} />
                      <Typography variant="h6">Personal Information</Typography>
                    </Box>
                    <Typography variant="body1" sx={{ mb: 1 }}>
                      <strong>Name:</strong> {user.name}
                    </Typography>
                    <Typography variant="body1">
                      <strong>User ID:</strong> {user.id}
                    </Typography>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                      <Email sx={{ mr: 2, color: 'primary.main' }} />
                      <Typography variant="h6">Contact Information</Typography>
                    </Box>
                    <Typography variant="body1">
                      <strong>Email:</strong> {user.email}
                    </Typography>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                      <Security sx={{ mr: 2, color: 'primary.main' }} />
                      <Typography variant="h6">Account Information</Typography>
                    </Box>
                    <Typography variant="body1" sx={{ mb: 1 }}>
                      <strong>Role:</strong> {user.role}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {user.role === 'Admin' 
                        ? 'You have full access to all features and can manage all data.'
                        : 'You have limited access to dashboard features only.'
                      }
                    </Typography>
                  </CardContent>
                </Card>
              </Box>
            </Box>
          </Paper>
        </Box>
      </Container>
    </AuthenticatedLayout>
  );
};

export default ProfilePage; 