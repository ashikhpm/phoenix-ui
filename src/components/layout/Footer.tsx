import React from 'react';
import {
  Box,
  Container,
  Typography,
  Link,
  Divider,
  useTheme,
  IconButton,
  Stack
} from '@mui/material';
import {
  GitHub,
  LinkedIn,
  Twitter,
  Email,
  Phone,
  LocationOn
} from '@mui/icons-material';

const Footer: React.FC = () => {
  const theme = useTheme();
  const currentYear = new Date().getFullYear();

  return (
    <Box
      component="footer"
      sx={{
        backgroundColor: theme.palette.primary.main,
        color: 'white',
        py: 4,
        mt: 'auto',
        borderTop: `1px solid ${theme.palette.primary.dark}`,
      }}
    >
      <Container maxWidth="lg">
        <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, gap: 4 }}>
          {/* Company Info */}
          <Box sx={{ flex: 1 }}>
            <Typography variant="h6" component="h2" sx={{ fontWeight: 600, mb: 2 }}>
              Phoenix Sangam
            </Typography>
            <Typography variant="body2" sx={{ mb: 2, opacity: 0.9 }}>
              Empowering communities through organized meetings, member management, and financial services.
            </Typography>
            <Stack direction="row" spacing={1}>
              <IconButton 
                size="small" 
                sx={{ color: 'white', '&:hover': { backgroundColor: 'rgba(255,255,255,0.1)' } }}
              >
                <Email fontSize="small" />
              </IconButton>
              <IconButton 
                size="small" 
                sx={{ color: 'white', '&:hover': { backgroundColor: 'rgba(255,255,255,0.1)' } }}
              >
                <Phone fontSize="small" />
              </IconButton>
              <IconButton 
                size="small" 
                sx={{ color: 'white', '&:hover': { backgroundColor: 'rgba(255,255,255,0.1)' } }}
              >
                <LocationOn fontSize="small" />
              </IconButton>
            </Stack>
          </Box>

          {/* Quick Links */}
          <Box sx={{ flex: 1 }}>
            <Typography variant="h6" component="h3" sx={{ fontWeight: 600, mb: 2 }}>
              Quick Links
            </Typography>
            <Stack spacing={1}>
              <Link 
                href="#dashboard" 
                color="inherit" 
                sx={{ 
                  textDecoration: 'none', 
                  '&:hover': { textDecoration: 'underline' },
                  opacity: 0.9
                }}
              >
                Dashboard
              </Link>
              <Link 
                href="#members" 
                color="inherit" 
                sx={{ 
                  textDecoration: 'none', 
                  '&:hover': { textDecoration: 'underline' },
                  opacity: 0.9
                }}
              >
                Members
              </Link>
              <Link 
                href="#meetings" 
                color="inherit" 
                sx={{ 
                  textDecoration: 'none', 
                  '&:hover': { textDecoration: 'underline' },
                  opacity: 0.9
                }}
              >
                Meetings
              </Link>
              <Link 
                href="#loans" 
                color="inherit" 
                sx={{ 
                  textDecoration: 'none', 
                  '&:hover': { textDecoration: 'underline' },
                  opacity: 0.9
                }}
              >
                Loans
              </Link>
            </Stack>
          </Box>

          {/* Contact Info */}
          <Box sx={{ flex: 1 }}>
            <Typography variant="h6" component="h3" sx={{ fontWeight: 600, mb: 2 }}>
              Contact Info
            </Typography>
            <Stack spacing={1}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Email fontSize="small" sx={{ opacity: 0.8 }} />
                <Typography variant="body2" sx={{ opacity: 0.9 }}>
                  info.phoenixsangam@gmail.com
                </Typography>
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Phone fontSize="small" sx={{ opacity: 0.8 }} />
                <Typography variant="body2" sx={{ opacity: 0.9 }}>
                  +91 98765 43210
                </Typography>
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <LocationOn fontSize="small" sx={{ opacity: 0.8 }} />
                <Typography variant="body2" sx={{ opacity: 0.9 }}>
                  Pattanikoop, Kerala, India
                </Typography>
              </Box>
            </Stack>
          </Box>
        </Box>

        <Divider sx={{ my: 3, borderColor: 'rgba(255,255,255,0.2)' }} />

        {/* Copyright */}
        <Box sx={{ 
          display: 'flex', 
          flexDirection: { xs: 'column', sm: 'row' }, 
          justifyContent: 'space-between', 
          alignItems: { xs: 'flex-start', sm: 'center' },
          gap: 2
        }}>
          <Typography variant="body2" sx={{ opacity: 0.8 }}>
            © {currentYear} Phoenix Sangam. All rights reserved.
          </Typography>
          <Typography variant="body2" sx={{ opacity: 0.8 }}>
            Version 1.0.0
          </Typography>
        </Box>
      </Container>
    </Box>
  );
};

export default Footer; 