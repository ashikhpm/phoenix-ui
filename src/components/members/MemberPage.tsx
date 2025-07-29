import React, { useState } from 'react';
import AuthenticatedLayout from '../layout/AuthenticatedLayout';
import MemberForm from './MemberForm';
import MemberList from './MemberList';
import { Tabs, Tab, Box, Container } from '@mui/material';
import { People, PersonAdd } from '@mui/icons-material';

export interface Member {
  id: number;
  name: string;
  address: string;
  email: string;
  phone: string;
}

const MemberPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState(0);
  const [selectedMember, setSelectedMember] = useState<Member | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setActiveTab(newValue);
  };

  const handleEdit = (member: Member) => {
    setSelectedMember(member);
    setActiveTab(1);
  };

  const handleFormSaved = () => {
    setSelectedMember(null);
    setActiveTab(0);
    setRefreshKey((k) => k + 1);
  };

  const handleCancelEdit = () => {
    setSelectedMember(null);
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
              aria-label="member management tabs"
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
                label="Member List" 
                icon={<People />} 
                iconPosition="start"
              />
              <Tab 
                label={selectedMember ? 'Edit Member' : 'Add Member'} 
                icon={<PersonAdd />} 
                iconPosition="start"
              />
            </Tabs>
          </Box>
          
          <Box role="tabpanel" hidden={activeTab !== 0}>
            {activeTab === 0 && (
              <MemberList 
                onEdit={handleEdit} 
                refreshKey={refreshKey}
              />
            )}
          </Box>
          
          <Box role="tabpanel" hidden={activeTab !== 1}>
            {activeTab === 1 && (
              <MemberForm 
                member={selectedMember} 
                onSaved={handleFormSaved}
                onCancelEdit={handleCancelEdit}
              />
            )}
          </Box>
        </Box>
      </Box>
    </AuthenticatedLayout>
  );
};

export default MemberPage; 