import React, { useState } from 'react';
import AuthenticatedLayout from '../layout/AuthenticatedLayout';
import MeetingForm from './MeetingForm';
import MeetingList from './MeetingList';
import { Tabs, Tab, Box, Container } from '@mui/material';
import { Event, List } from '@mui/icons-material';

const MeetingPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState(0);
  const [refreshKey, setRefreshKey] = useState(0);

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setActiveTab(newValue);
  };

  const handleMeetingSaved = () => {
    setActiveTab(0);
    setRefreshKey((k) => k + 1);
  };

  const handleCancelCreate = () => {
    setActiveTab(0);
  };

  return (
    <AuthenticatedLayout>
      <Box sx={{ p: 3 }}>
        <Box sx={{ width: '100%' }}>
          <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
            <Tabs 
              value={activeTab} 
              onChange={handleTabChange} 
              aria-label="meeting management tabs"
              centered
              sx={{
                '& .MuiTab-root': {
                  minHeight: 64,
                  fontSize: '1rem',
                  fontWeight: 500,
                }
              }}
            >
              <Tab 
                label="Meeting List" 
                icon={<List />} 
                iconPosition="start"
              />
              <Tab 
                label="Create Meeting" 
                icon={<Event />} 
                iconPosition="start"
              />
            </Tabs>
          </Box>
          
          <Box role="tabpanel" hidden={activeTab !== 0}>
            {activeTab === 0 && (
              <MeetingList 
                refreshKey={refreshKey}
              />
            )}
          </Box>
          
          <Box role="tabpanel" hidden={activeTab !== 1}>
            {activeTab === 1 && (
              <MeetingForm 
                onSaved={handleMeetingSaved}
                onCancel={handleCancelCreate}
              />
            )}
          </Box>
        </Box>
      </Box>
    </AuthenticatedLayout>
  );
};

export default MeetingPage; 