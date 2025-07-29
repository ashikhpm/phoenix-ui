import React from 'react';
import {
  Paper,
  Typography,
  Box,
  Container,
  Button
} from '@mui/material';
import { Construction } from '@mui/icons-material';

interface PlaceholderPageProps {
  title: string;
  description?: string;
  icon?: React.ReactNode;
}

const PlaceholderPage: React.FC<PlaceholderPageProps> = ({ 
  title, 
  description = "This page is under construction. Check back soon for updates!",
  icon = <Construction />
}) => {
  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ mt: 4, mb: 4 }}>
        <Paper elevation={3} sx={{ p: 6, textAlign: 'center' }}>
          <Box sx={{ mb: 3 }}>
            <Box sx={{ fontSize: 64, color: 'primary.main', mb: 2 }}>
              {icon}
            </Box>
            <Typography variant="h4" component="h1" gutterBottom>
              {title}
            </Typography>
            <Typography variant="body1" color="text.secondary" paragraph>
              {description}
            </Typography>
          </Box>
          
          <Box sx={{ display: 'flex', justifyContent: 'center', gap: 2 }}>
            <Button
              variant="outlined"
              onClick={() => window.location.hash = '#dashboard'}
            >
              Go to Dashboard
            </Button>
            <Button
              variant="outlined"
              onClick={() => window.location.hash = '#members'}
            >
              Manage Members
            </Button>
          </Box>
        </Paper>
      </Box>
    </Box>
  );
};

export default PlaceholderPage; 