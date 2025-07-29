import React, { useState, useEffect } from 'react';
import { apiService } from '../../services/api';
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
  IconButton
} from '@mui/material';
import {
  Event,
  Group,
  Payment,
  ArrowBack,
  Save
} from '@mui/icons-material';
import { Member } from '../members/MemberPage';

interface Meeting {
  id: number;
  date: string;
  time: string;
  description?: string;
  location?: string;
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
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  
  // Attendance state
  const [attendance, setAttendance] = useState<{ [key: number]: boolean }>({});
  
  // Payment state
  const [payments, setPayments] = useState<{ [key: number]: { mainPayment: string; weeklyPayment: string } }>({});

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Fetch meeting details
        const meetingResponse = await apiService.get<Meeting>(`/api/Meeting/${meetingId}`);
        setMeeting(meetingResponse);
        
        // Fetch all members
        const membersResponse = await apiService.get<Member[]>('/api/User');
        setMembers(membersResponse);
        
        // Initialize attendance and payments
        const initialAttendance: { [key: number]: boolean } = {};
        const initialPayments: { [key: number]: { mainPayment: string; weeklyPayment: string } } = {};
        
        membersResponse.forEach(member => {
          initialAttendance[member.id] = false;
          initialPayments[member.id] = { mainPayment: '200', weeklyPayment: '10' };
        });
        
        setAttendance(initialAttendance);
        setPayments(initialPayments);
        
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

  const handleSaveAttendance = async () => {
    try {
      setSavingAttendance(true);
      setSuccessMessage(null);
      
      // Get all members with their attendance status
      const attendancePromises = members.map(member => {
        const isPresent = attendance[member.id] || false;
        return apiService.post('/api/Attendance', {
          userId: member.id,
          meetingId: parseInt(meetingId),
          isPresent: isPresent
        });
      });
      
      // Save all attendance records
      await Promise.all(attendancePromises);
      
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
      
      const paymentData = Object.entries(payments)
        .filter(([_, payment]) => payment.mainPayment.trim() !== '' || payment.weeklyPayment.trim() !== '')
        .map(([memberId, payment]) => ({
          userId: parseInt(memberId),
          meetingId: parseInt(meetingId),
          mainPayment: payment.mainPayment ? parseFloat(payment.mainPayment) : 0,
          weeklyPayment: payment.weeklyPayment ? parseFloat(payment.weeklyPayment) : 0
        }));
      
      // Save payments
      for (const payment of paymentData) {
        await apiService.post('/api/MeetingPayment', payment);
      }
      
      setSuccessMessage('Payment details saved successfully!');
      
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to save payment details.');
    } finally {
      setSavingPayments(false);
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
                  {members.map((member, index) => (
                    <React.Fragment key={member.id}>
                      <ListItem>
                        <Checkbox
                          checked={attendance[member.id] || false}
                          onChange={(e) => handleAttendanceChange(member.id, e.target.checked)}
                          color="primary"
                        />
                        <ListItemAvatar>
                          <Avatar>{member.name.charAt(0)}</Avatar>
                        </ListItemAvatar>
                        <ListItemText
                          primary={member.name}
                          secondary={member.email}
                        />
                      </ListItem>
                      {index < members.length - 1 && <Divider />}
                    </React.Fragment>
                  ))}
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
                        <ListItemAvatar>
                          <Avatar>{member.name.charAt(0)}</Avatar>
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
      </Paper>
    </Box>
  );
};

export default MeetingDetailsPage; 