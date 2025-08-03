import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { hasAdminPrivilegesFromUser } from '../../utils/helpers';
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  IconButton,
  Menu,
  MenuItem,
  Box,
  useTheme,
  useMediaQuery,
  Avatar
} from '@mui/material';
import {
  Menu as MenuIcon,
  AccountCircle,
  Dashboard,
  People,
  Event,
  Settings,
  Logout,
  AccountBalance,
  AccountTree
} from '@mui/icons-material';

const Navbar: React.FC = () => {
  const { user, logout } = useAuth();
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [mobileMenuAnchor, setMobileMenuAnchor] = useState<null | HTMLElement>(null);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  const handleUserMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleUserMenuClose = () => {
    setAnchorEl(null);
  };

  const handleMobileMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setMobileMenuAnchor(event.currentTarget);
  };

  const handleMobileMenuClose = () => {
    setMobileMenuAnchor(null);
  };

  const handleLogout = () => {
    logout();
    handleUserMenuClose();
    handleMobileMenuClose();
  };

  const handleNavigation = (hash: string) => {
    window.location.hash = hash;
    handleMobileMenuClose();
  };

  return (
    <AppBar position="fixed" sx={{ zIndex: theme.zIndex.drawer + 1 }}>
      <Toolbar>
        <Box sx={{ display: 'flex', alignItems: 'center', mr: 3 }}>
          <img 
            src="/logo.png" 
            alt="Phoenix Sangam Logo" 
            style={{ 
              height: 40, 
              width: 'auto',
              marginRight: 12
            }}
            onError={(e) => {
              // Hide logo if file doesn't exist
              e.currentTarget.style.display = 'none';
            }}
          />
          <Typography variant="h6" component="div" sx={{ fontWeight: 600 }}>
            Phoenix Sangam
          </Typography>
        </Box>

        {isMobile ? (
          <>
            <IconButton
              size="large"
              edge="start"
              color="inherit"
              aria-label="menu"
              onClick={handleMobileMenuOpen}
              sx={{ ml: 'auto' }}
            >
              <MenuIcon />
            </IconButton>
            <Menu
              anchorEl={mobileMenuAnchor}
              open={Boolean(mobileMenuAnchor)}
              onClose={handleMobileMenuClose}
              anchorOrigin={{
                vertical: 'bottom',
                horizontal: 'left',
              }}
              transformOrigin={{
                vertical: 'top',
                horizontal: 'left',
              }}
            >
              <MenuItem onClick={() => handleNavigation('#dashboard')}>
                <Dashboard sx={{ mr: 1 }} />
                Dashboard
              </MenuItem>
              <MenuItem onClick={() => handleNavigation('#loans')}>
                <AccountBalance sx={{ mr: 1 }} />
                Loans
              </MenuItem>
              {hasAdminPrivilegesFromUser(user) && (
                <>
                  <MenuItem onClick={() => handleNavigation('#members')}>
                    <People sx={{ mr: 1 }} />
                    Members
                  </MenuItem>
                  <MenuItem onClick={() => handleNavigation('#meetings')}>
                    <Event sx={{ mr: 1 }} />
                    Meetings
                  </MenuItem>
                  <MenuItem onClick={() => handleNavigation('#activity')}>
                    <AccountTree sx={{ mr: 1 }} />
                    Activity
                  </MenuItem>
                </>
              )}
              <MenuItem onClick={() => handleNavigation('#profile')}>
                <AccountCircle sx={{ mr: 1 }} />
                Profile
              </MenuItem>
              <MenuItem onClick={() => handleNavigation('#settings')}>
                <Settings sx={{ mr: 1 }} />
                Settings
              </MenuItem>
              <MenuItem onClick={handleLogout}>
                <Logout sx={{ mr: 1 }} />
                Logout
              </MenuItem>
            </Menu>
          </>
        ) : (
          <>
            <Box sx={{ display: 'flex', gap: 2, mr: 'auto' }}>
              <Button
                color="inherit"
                onClick={() => handleNavigation('#dashboard')}
                startIcon={<Dashboard />}
              >
                Dashboard
              </Button>
              <Button
                color="inherit"
                onClick={() => handleNavigation('#loans')}
                startIcon={<AccountBalance />}
              >
                Loans
              </Button>
              {hasAdminPrivilegesFromUser(user) && (
                <>
                  <Button
                    color="inherit"
                    onClick={() => handleNavigation('#members')}
                    startIcon={<People />}
                  >
                    Members
                  </Button>
                  <Button
                    color="inherit"
                    onClick={() => handleNavigation('#meetings')}
                    startIcon={<Event />}
                  >
                    Meetings
                  </Button>
                  <Button
                    color="inherit"
                    onClick={() => handleNavigation('#activity')}
                    startIcon={<AccountTree />}
                  >
                    Activity
                  </Button>
                </>
              )}
            </Box>

            <IconButton
              size="large"
              aria-label="account of current user"
              aria-controls="user-menu"
              aria-haspopup="true"
              onClick={handleUserMenuOpen}
              color="inherit"
            >
              <Avatar sx={{ width: 32, height: 32 }}>
                {user?.name?.charAt(0)?.toUpperCase() || 'U'}
              </Avatar>
            </IconButton>
            <Menu
              id="user-menu"
              anchorEl={anchorEl}
              open={Boolean(anchorEl)}
              onClose={handleUserMenuClose}
              anchorOrigin={{
                vertical: 'bottom',
                horizontal: 'right',
              }}
              transformOrigin={{
                vertical: 'top',
                horizontal: 'right',
              }}
            >
              <MenuItem onClick={() => handleNavigation('#profile')}>
                <AccountCircle sx={{ mr: 1 }} />
                Profile
              </MenuItem>
              <MenuItem onClick={() => handleNavigation('#settings')}>
                <Settings sx={{ mr: 1 }} />
                Settings
              </MenuItem>
              <MenuItem onClick={handleLogout}>
                <Logout sx={{ mr: 1 }} />
                Logout
              </MenuItem>
            </Menu>
          </>
        )}
      </Toolbar>
    </AppBar>
  );
};

export default Navbar; 