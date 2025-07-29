import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import ProtectedRoute from './auth/ProtectedRoute';
import AuthManager from './auth/AuthManager';
import UserDashboard from './dashboard/UserDashboard';
import MemberPage from './members/MemberPage';
import MeetingPage from './meetings/MeetingPage';
import MeetingDetailsPage from './meetings/MeetingDetailsPage';
import PlaceholderPage from './pages/PlaceholderPage';
import LoanManager from './loans/LoanManager';
import { Box, CircularProgress, Typography } from '@mui/material';

const AppRouter: React.FC = () => {
  const { isAuthenticated, isLoading } = useAuth();
  const [currentPage, setCurrentPage] = useState('members');
  const [meetingId, setMeetingId] = useState<string | null>(null);

  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash.slice(1);
      const [page, ...params] = hash.split('/');
      
      switch (page) {
        case 'login':
          setCurrentPage('login');
          break;
        case 'dashboard':
          setCurrentPage('dashboard');
          break;
        case 'members':
          setCurrentPage('members');
          break;
        case 'meetings':
          if (params[0] && !isNaN(Number(params[0]))) {
            setCurrentPage('meeting-details');
            setMeetingId(params[0]);
          } else {
            setCurrentPage('meetings');
          }
          break;
        case 'profile':
          setCurrentPage('profile');
          break;
        case 'settings':
          setCurrentPage('settings');
          break;
        case 'loans':
          setCurrentPage('loans');
          break;
        default:
          setCurrentPage('members');
      }
    };

    handleHashChange();
    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  if (isLoading) {
    return (
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: '100vh',
          gap: 2,
        }}
      >
        <CircularProgress size={60} />
        <Typography variant="h6" color="text.secondary">
          Loading application...
        </Typography>
      </Box>
    );
  }

  if (!isAuthenticated) {
    return <ProtectedRoute><div /></ProtectedRoute>;
  }

  const renderPage = () => {
    switch (currentPage) {
      case 'login':
        return <AuthManager />;
      case 'dashboard':
        return <UserDashboard />;
      case 'members':
        return <MemberPage />;
      case 'meetings':
        return <MeetingPage />;
      case 'meeting-details':
        return <MeetingDetailsPage onBack={() => window.location.hash = '#meetings'} />;
      case 'profile':
        return <PlaceholderPage title="Profile" description="Profile page coming soon..." />;
      case 'settings':
        return <PlaceholderPage title="Settings" description="Settings page coming soon..." />;
      case 'loans':
        return <LoanManager />;
      default:
        return <MemberPage />;
    }
  };

  return renderPage();
};

export default AppRouter; 