import React, { useState, useEffect } from 'react';
import { apiService } from '../../services/api';
import AuthenticatedLayout from '../layout/AuthenticatedLayout';
import { AttendanceSummary, MeetingPaymentResponse } from '../../types/common';
import { Editor } from '@tinymce/tinymce-react';
import { TINYMCE_API_KEY, TINYMCE_CONFIG } from '../../config/tinymce';
import {
  Container,
  Paper,
  Typography,
  Box,
  CircularProgress,
  Alert,
  Card,
  CardContent,
  Checkbox,
  TextField,
  Button,
  Divider,
  Avatar,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  useTheme,
  IconButton,
  Tabs,
  Tab
} from '@mui/material';
import {
  Event,
  Group,
  Payment,
  ArrowBack,
  Save,
  Description
} from '@mui/icons-material';
import { Member } from '../members/MemberPage';

interface Meeting {
  id: number;
  date: string;
  time: string;
  description?: string;
  location?: string;
}

interface MeetingMinutes {
  meetingId: number;
  meetingMinutes: string;
  updatedAt: string;
  updatedBy: string;
}

interface MeetingMinutesRequest {
  meetingId: number;
  meetingMinutes: string;
}

interface MeetingDetailsPageProps {
  onBack?: () => void;
}

const MeetingDetailsPage: React.FC<MeetingDetailsPageProps> = ({ onBack }) => {
  const theme = useTheme();
  
  // Extract meeting ID from URL hash
  const meetingId = window.location.hash.split('/')[1];
  
  const [meeting, setMeeting] = useState<Meeting | null>(null);
  const [members, setMembers] = useState<Member[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [savingAttendance, setSavingAttendance] = useState(false);
  const [savingPayments, setSavingPayments] = useState(false);
  const [savingMinutes, setSavingMinutes] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState(0);
  
  // Meeting minutes state
  const [meetingMinutes, setMeetingMinutes] = useState('');
  const [existingMinutes, setExistingMinutes] = useState<string | null>(null);
  const [minutesUpdateInfo, setMinutesUpdateInfo] = useState<{ updatedAt: string; updatedBy: string } | null>(null);
  
  // Attendance state
  const [attendance, setAttendance] = useState<{ [key: number]: boolean }>({});
  const [attendanceSummary, setAttendanceSummary] = useState<AttendanceSummary | null>(null);
  
  // Payment state
  const [payments, setPayments] = useState<{ [key: number]: { mainPayment: string; weeklyPayment: string } }>({});
  const [selectedPayments, setSelectedPayments] = useState<{ [key: number]: boolean }>({});
  const [meetingPaymentResponse, setMeetingPaymentResponse] = useState<MeetingPaymentResponse | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Fetch meeting details
        const meetingResponse = await apiService.get<Meeting>(`/api/Meeting/${meetingId}`);
        setMeeting(meetingResponse);
        
        // Fetch all members
        const membersResponse = await apiService.get<Member[]>('/api/User/Active');
        setMembers(membersResponse);
        
        // Initialize attendance and payments
        const initialAttendance: { [key: number]: boolean } = {};
        const initialPayments: { [key: number]: { mainPayment: string; weeklyPayment: string } } = {};
        
        membersResponse.forEach(member => {
          initialAttendance[member.id] = false;
          initialPayments[member.id] = { mainPayment: '200', weeklyPayment: '10' };
        });
        
        // Initialize selected payments (all unchecked by default)
        const initialSelectedPayments: { [key: number]: boolean } = {};
        membersResponse.forEach(member => {
          initialSelectedPayments[member.id] = false;
        });
        setSelectedPayments(initialSelectedPayments);
        
        // Fetch attendance summary to pre-populate attendance
        try {
          const attendanceResponse = await apiService.get<AttendanceSummary>(`/api/Attendance/meeting/${meetingId}/summary`);
          setAttendanceSummary(attendanceResponse);
          
          // Mark attended users as checked
          const updatedAttendance = { ...initialAttendance };
          attendanceResponse.attendedUsers.forEach(user => {
            updatedAttendance[user.id] = true;
          });
          setAttendance(updatedAttendance);
        } catch (err) {
          // If attendance summary doesn't exist yet, use default initialization
          setAttendance(initialAttendance);
        }
        
        // Fetch meeting payment details to pre-populate payment fields
        try {
          const paymentResponse = await apiService.get<MeetingPaymentResponse>(`/api/MeetingPayment/meeting/${meetingId}`);
          setMeetingPaymentResponse(paymentResponse);
          
          // Populate payment fields with existing data
          const updatedPayments = { ...initialPayments };
          const updatedSelectedPayments = { ...initialSelectedPayments };
          
          paymentResponse.users.forEach(user => {
            updatedPayments[user.id] = {
              mainPayment: user.mainPayment.toString(),
              weeklyPayment: user.weeklyPayment.toString()
            };
            updatedSelectedPayments[user.id] = true; // Mark as selected if they have payment data
          });
          
          setPayments(updatedPayments);
          setSelectedPayments(updatedSelectedPayments);
        } catch (err) {
          // If payment data doesn't exist yet, use default initialization
          setPayments(initialPayments);
        }

        // Fetch existing meeting minutes
        try {
          const minutesResponse = await apiService.get<MeetingMinutes>(`/api/Meeting/${meetingId}/minutes`);
          setExistingMinutes(minutesResponse.meetingMinutes);
          setMeetingMinutes(minutesResponse.meetingMinutes);
          setMinutesUpdateInfo({ updatedAt: minutesResponse.updatedAt, updatedBy: minutesResponse.updatedBy });
        } catch (err) {
          // If minutes don't exist yet, start with empty content
          setMeetingMinutes('');
        }
        
      } catch (err: any) {
        setError(err.response?.data?.message || 'Failed to fetch meeting details.');
      } finally {
        setLoading(false);
      }
    };

    if (meetingId) {
      fetchData();
    }
  }, [meetingId]);

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setActiveTab(newValue);
  };

  const handleAttendanceChange = (memberId: number, checked: boolean) => {
    setAttendance(prev => ({
      ...prev,
      [memberId]: checked
    }));
  };

  const handlePaymentChange = (memberId: number, paymentType: 'mainPayment' | 'weeklyPayment', value: string) => {
    // Update local state only
    setPayments(prev => ({
      ...prev,
      [memberId]: {
        ...prev[memberId],
        [paymentType]: value
      }
    }));
  };

  const handlePaymentSelectionChange = (memberId: number, checked: boolean) => {
    setSelectedPayments(prev => ({
      ...prev,
      [memberId]: checked
    }));
  };

  const handleSaveAttendance = async () => {
    try {
      setSavingAttendance(true);
      setSuccessMessage(null);
      
      // Prepare attendance data in the new bulk format
      const attendances = members.map(member => ({
        userId: member.id,
        isPresent: attendance[member.id] || false
      }));
      
      // Save attendance using the new bulk endpoint
      await apiService.post('/api/Attendance/bulk', {
        meetingId: parseInt(meetingId),
        attendances: attendances
      });
      
      setSuccessMessage('Attendance saved successfully!');
      
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to save attendance.');
    } finally {
      setSavingAttendance(false);
    }
  };

  const handleSavePayments = async () => {
    try {
      setSavingPayments(true);
      setSuccessMessage(null);
      
      // Prepare payment data in the new bulk format - only for selected members
      const paymentsData = Object.entries(payments)
        .filter(([memberId, payment]) => {
          const isSelected = selectedPayments[parseInt(memberId)] || false;
          const hasPaymentData = payment.mainPayment.trim() !== '' || payment.weeklyPayment.trim() !== '';
          return isSelected && hasPaymentData;
        })
        .map(([memberId, payment]) => ({
          userId: parseInt(memberId),
          mainPayment: payment.mainPayment ? parseFloat(payment.mainPayment) : 0,
          weeklyPayment: payment.weeklyPayment ? parseFloat(payment.weeklyPayment) : 0
        }));
      
      // Save payments using the new bulk endpoint
      await apiService.post('/api/MeetingPayment/bulk', {
        meetingId: parseInt(meetingId),
        payments: paymentsData
      });
      
      setSuccessMessage('Payment details saved successfully!');
      
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to save payment details.');
    } finally {
      setSavingPayments(false);
    }
  };

  const handleSaveMinutes = async () => {
    try {
      setSavingMinutes(true);
      setSuccessMessage(null);
      
      const minutesData: MeetingMinutesRequest = {
        meetingId: parseInt(meetingId),
        meetingMinutes: meetingMinutes
      };
      
      await apiService.post('/api/Meeting/minutes', minutesData);
      
      setSuccessMessage('Meeting minutes saved successfully!');
      setExistingMinutes(meetingMinutes);
      setMinutesUpdateInfo({ updatedAt: new Date().toISOString(), updatedBy: 'User' }); // Assuming current user is the updater
      
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to save meeting minutes.');
    } finally {
      setSavingMinutes(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const formatTime = (timeString: string) => {
    let timeOnly = timeString;
    if (timeString.includes('T')) {
      timeOnly = timeString.split('T')[1].split('.')[0];
    }
    
    const [hours, minutes] = timeOnly.split(':').map(Number);
    const period = hours >= 12 ? 'PM' : 'AM';
    const displayHours = hours === 0 ? 12 : hours > 12 ? hours - 12 : hours;
    return `${displayHours}:${minutes.toString().padStart(2, '0')} ${period}`;
  };

  if (loading) {
    return (
      <Box sx={{ p: 3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 400 }}>
          <CircularProgress size={60} />
        </Box>
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="error" sx={{ mt: 2 }}>
          {error}
        </Alert>
      </Box>
    );
  }

  if (!meeting) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="warning" sx={{ mt: 2 }}>
          Meeting not found.
        </Alert>
      </Box>
    );
  }

  return (
    <AuthenticatedLayout>
      <Box sx={{ p: 3 }}>
        <Paper elevation={3} sx={{ p: 4, mt: 2 }}>
        {/* Header */}
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 4 }}>
          <IconButton onClick={onBack} sx={{ mr: 2 }}>
            <ArrowBack />
          </IconButton>
          <Box sx={{ display: 'flex', alignItems: 'center', flex: 1 }}>
            <Event sx={{ mr: 2, color: 'primary.main', fontSize: 32 }} />
            <Box>
              <Typography variant="h4" component="h1" sx={{ fontWeight: 600 }}>
                Meeting Details
              </Typography>
              <Typography variant="body1" color="text.secondary">
                {formatDate(meeting.date)} at {formatTime(meeting.time)}
              </Typography>
            </Box>
          </Box>
        </Box>

        {successMessage && (
          <Alert severity="success" sx={{ mb: 3 }} onClose={() => setSuccessMessage(null)}>
            {successMessage}
          </Alert>
        )}

        {/* Meeting Info */}
        <Card sx={{ mb: 4, bgcolor: 'grey.50' }}>
          <CardContent>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 3 }}>
              <Box sx={{ flex: '1 1 300px', minWidth: 0 }}>
                <Typography variant="h6" gutterBottom>Meeting Information</Typography>
                <Typography variant="body1">
                  <strong>Date:</strong> {formatDate(meeting.date)}
                </Typography>
                <Typography variant="body1">
                  <strong>Time:</strong> {formatTime(meeting.time)}
                </Typography>
                {meeting.description && (
                  <Typography variant="body1">
                    <strong>Description:</strong> {meeting.description}
                  </Typography>
                )}
                {meeting.location && (
                  <Typography variant="body1">
                    <strong>Location:</strong> {meeting.location}
                  </Typography>
                )}
              </Box>
            </Box>
          </CardContent>
        </Card>

        {/* Meeting Summary */}
        {attendanceSummary && (
          <Card sx={{ mb: 4, bgcolor: 'success.50' }}>
            <CardContent>
              <Typography variant="h6" gutterBottom sx={{ color: 'success.main', fontWeight: 600 }}>
                Current Meeting Summary
              </Typography>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 3 }}>
                <Box>
                  <Typography variant="body2" color="text.secondary">Total Members</Typography>
                  <Typography variant="h6" color="primary.main">{attendanceSummary.totalUsers}</Typography>
                </Box>
                <Box>
                  <Typography variant="body2" color="text.secondary">Present</Typography>
                  <Typography variant="h6" color="success.main">{attendanceSummary.attendedCount}</Typography>
                </Box>
                <Box>
                  <Typography variant="body2" color="text.secondary">Absent</Typography>
                  <Typography variant="h6" color="error.main">{attendanceSummary.absentCount}</Typography>
                </Box>
                <Box>
                  <Typography variant="body2" color="text.secondary">Attendance Rate</Typography>
                  <Typography variant="h6" color="info.main">
                    {attendanceSummary.attendancePercentage.toFixed(1)}%
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        )}

        {/* Tabs */}
        <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
          <Tabs value={activeTab} onChange={handleTabChange} aria-label="meeting details tabs">
            <Tab label="Attendance & Payments" />
            <Tab label="Meeting Minutes" />
          </Tabs>
        </Box>

        {/* Tab Content */}
        {activeTab === 0 && (
          <>
            {/* Two Column Layout */}
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
              {/* Attendance Column */}
              <Box sx={{ flex: '1 1 400px', minWidth: 0 }}>
                <Card>
                  <CardContent>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                      <Group sx={{ mr: 2, color: 'primary.main' }} />
                      <Typography variant="h6" sx={{ fontWeight: 600 }}>
                        Attendance
                      </Typography>
                    </Box>
                    
                    <List>
                      {members.map((member, index) => {
                        const isCurrentlyAttended = attendanceSummary?.attendedUsers.some(user => user.id === member.id) || false;
                        return (
                          <React.Fragment key={member.id}>
                            <ListItem>
                              <Checkbox
                                checked={attendance[member.id] || false}
                                onChange={(e) => handleAttendanceChange(member.id, e.target.checked)}
                                color="primary"
                              />
                              <ListItemAvatar>
                                <Avatar sx={{ 
                                  bgcolor: isCurrentlyAttended ? 'success.main' : 'grey.300',
                                  color: isCurrentlyAttended ? 'white' : 'text.primary'
                                }}>
                                  {member.name.charAt(0)}
                                </Avatar>
                              </ListItemAvatar>
                              <ListItemText
                                primary={
                                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                    {member.name}
                                    {isCurrentlyAttended && (
                                      <Typography 
                                        variant="caption" 
                                        sx={{ 
                                          bgcolor: 'success.main', 
                                          color: 'white', 
                                          px: 1, 
                                          py: 0.5, 
                                          borderRadius: 1,
                                          fontSize: '0.7rem'
                                        }}
                                      >
                                        Previously Attended
                                      </Typography>
                                    )}
                                  </Box>
                                }
                                secondary={member.email}
                              />
                            </ListItem>
                            {index < members.length - 1 && <Divider />}
                          </React.Fragment>
                        );
                      })}
                    </List>
                  </CardContent>
                </Card>
              </Box>

              {/* Payment Column */}
              <Box sx={{ flex: '1 1 400px', minWidth: 0 }}>
                <Card>
                  <CardContent>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                      <Payment sx={{ mr: 2, color: 'success.main' }} />
                      <Typography variant="h6" sx={{ fontWeight: 600 }}>
                        Payment Details
                      </Typography>
                    </Box>
                    
                    <List>
                      {members.map((member, index) => (
                        <React.Fragment key={member.id}>
                          <ListItem>
                            <Checkbox
                              checked={selectedPayments[member.id] || false}
                              onChange={(e) => handlePaymentSelectionChange(member.id, e.target.checked)}
                              color="success"
                            />
                            <ListItemAvatar>
                              <Avatar sx={{ bgcolor: 'success.main' }}>{member.name.charAt(0)}</Avatar>
                            </ListItemAvatar>
                            <ListItemText
                              primary={member.name}
                              secondary={member.email}
                            />
                            <Box sx={{ display: 'flex', gap: 1, minWidth: 300, ml: 2 }}>
                              <TextField
                                type="number"
                                placeholder="Main Payment"
                                value={payments[member.id]?.mainPayment || ''}
                                onChange={(e) => handlePaymentChange(member.id, 'mainPayment', e.target.value)}
                                size="small"
                                sx={{ width: 150 }}
                                InputProps={{
                                  startAdornment: <Typography sx={{ mr: 1 }}>₹</Typography>,
                                }}
                              />
                              <TextField
                                type="number"
                                placeholder="Weekly Payment"
                                value={payments[member.id]?.weeklyPayment || ''}
                                onChange={(e) => handlePaymentChange(member.id, 'weeklyPayment', e.target.value)}
                                size="small"
                                sx={{ width: 150 }}
                                InputProps={{
                                  startAdornment: <Typography sx={{ mr: 1 }}>₹</Typography>,
                                }}
                              />
                            </Box>
                          </ListItem>
                          {index < members.length - 1 && <Divider />}
                        </React.Fragment>
                      ))}
                    </List>
                  </CardContent>
                </Card>
              </Box>
            </Box>

            {/* Save Buttons */}
            <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2, mt: 4 }}>
              <Button
                variant="outlined"
                onClick={handleSaveAttendance}
                disabled={savingAttendance}
                startIcon={savingAttendance ? <CircularProgress size={20} /> : <Group />}
                size="large"
                color="primary"
              >
                {savingAttendance ? 'Saving...' : 'Save Attendance'}
              </Button>
              <Button
                variant="outlined"
                onClick={handleSavePayments}
                disabled={savingPayments}
                startIcon={savingPayments ? <CircularProgress size={20} /> : <Payment />}
                size="large"
                color="success"
              >
                {savingPayments ? 'Saving...' : 'Save Payment Details'}
              </Button>
            </Box>
          </>
        )}

        {activeTab === 1 && (
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                <Description sx={{ mr: 2, color: 'info.main' }} />
                <Typography variant="h6" sx={{ fontWeight: 600 }}>
                  Meeting Minutes
                </Typography>
              </Box>
              
              {minutesUpdateInfo && (
                <Box sx={{ mb: 2, p: 2, bgcolor: 'grey.50', borderRadius: 1 }}>
                  <Typography variant="body2" color="text.secondary">
                    Last updated: {new Date(minutesUpdateInfo.updatedAt).toLocaleString()} by {minutesUpdateInfo.updatedBy}
                  </Typography>
                </Box>
              )}
              
              <Box sx={{ mb: 3 }}>
                <Editor
                  apiKey={TINYMCE_API_KEY}
                  value={meetingMinutes}
                  onEditorChange={(content) => setMeetingMinutes(content)}
                  init={TINYMCE_CONFIG}
                />
              </Box>
              
              <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
                <Button
                  variant="contained"
                  onClick={handleSaveMinutes}
                  disabled={savingMinutes}
                  startIcon={savingMinutes ? <CircularProgress size={20} /> : <Save />}
                  size="large"
                  color="info"
                >
                  {savingMinutes ? 'Saving...' : 'Save Meeting Minutes'}
                </Button>
              </Box>
            </CardContent>
          </Card>
        )}
      </Paper>
    </Box>
    </AuthenticatedLayout>
  );
};

export default MeetingDetailsPage; 