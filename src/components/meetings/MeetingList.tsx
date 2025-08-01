import React, { useState, useEffect, useCallback } from 'react';
import { apiService } from '../../services/api';
import {
  Paper,
  Typography,
  CircularProgress,
  Alert,
  Box,
  Container,
  Chip,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Button,
  useTheme,
  Card,
  CardContent,
  Avatar,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Divider,
  useMediaQuery,
  Pagination
} from '@mui/material';
import { 
  Event, 
  Group, 
  Payment, 
  LocationOn, 
  Edit, 
  Delete, 
  Visibility,
  CheckCircle,
  Cancel,
  People
} from '@mui/icons-material';

interface Meeting {
  id: number;
  date: string;
  time: string;
  description?: string;
  location?: string;
}

interface MeetingSummary {
  id: number;
  date: string;
  time: string;
  description?: string;
  location?: string;
  totalMainPayment: number;
  totalWeeklyPayment: number;
  presentAttendanceCount: number;
  totalAttendanceCount: number;
  attendancePercentage: number;
}

interface MeetingListProps {
  onEdit?: (meeting: Meeting) => void;
  refreshKey: number;
}

const MeetingList: React.FC<MeetingListProps> = ({ onEdit, refreshKey }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [meetings, setMeetings] = useState<Meeting[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [attendedUsers, setAttendedUsers] = useState<any[]>([]);
  const [attendedUsersOpen, setAttendedUsersOpen] = useState(false);
  const [selectedMeetingForAttendance, setSelectedMeetingForAttendance] = useState<Meeting | null>(null);
  const [meetingSummary, setMeetingSummary] = useState<MeetingSummary | null>(null);

  const fetchMeetings = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await apiService.get<Meeting[]>('/api/Meeting');
      setMeetings(response);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to fetch meetings. Please try again.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchMeetings();
  }, [fetchMeetings, refreshKey]);

  const handleChangePage = (event: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangePageSize = (event: React.ChangeEvent<HTMLSelectElement>) => {
    setPageSize(parseInt(event.target.value, 10));
    setPage(1);
  };

  const handleDeleteClick = (id: number) => {
    setDeleteId(id);
    setConfirmOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (deleteId == null) return;
    try {
      setLoading(true);
      await apiService.delete(`/api/Meeting/${deleteId}`);
      setMeetings((prev) => prev.filter((m) => m.id !== deleteId));
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to delete meeting.');
    } finally {
      setLoading(false);
      setConfirmOpen(false);
      setDeleteId(null);
    }
  };

  const handleDeleteCancel = () => {
    setConfirmOpen(false);
    setDeleteId(null);
  };

  const handleViewDetails = (meeting: Meeting) => {
    window.location.hash = `#meetings/${meeting.id}`;
  };

  const handleViewAttendedUsers = async (meeting: Meeting) => {
    try {
      setLoading(true);
      
      // Fetch meeting summary
      const summaryResponse = await apiService.get<MeetingSummary>(`/api/Meeting/${meeting.id}/summary`);
      setMeetingSummary(summaryResponse);
      
      // Fetch attended users for this meeting
      const response = await apiService.get<any[]>(`/api/Attendance/meeting/${meeting.id}`);
      // Filter only users who are present and extract user names
      const presentUsers = response
        .filter((attendance: any) => attendance.isPresent)
        .map((attendance: any) => attendance.user);
      setAttendedUsers(presentUsers);
      setSelectedMeetingForAttendance(meeting);
      setAttendedUsersOpen(true);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to fetch attended users.');
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'upcoming': return 'info';
      case 'ongoing': return 'warning';
      case 'completed': return 'success';
      case 'cancelled': return 'error';
      default: return 'default';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'upcoming': return <Event />;
      case 'ongoing': return <Event />;
      case 'completed': return <CheckCircle />;
      case 'cancelled': return <Cancel />;
      default: return <Event />;
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
    // Handle datetime format like "2025-07-20T20:00:00"
    let timeOnly = timeString;
    if (timeString.includes('T')) {
      // Extract time portion from datetime string
      timeOnly = timeString.split('T')[1].split('.')[0]; // Remove milliseconds if present
    }
    
    // Convert 24-hour format (HH:mm:ss) to 12-hour format with AM/PM
    const [hours, minutes] = timeOnly.split(':').map(Number);
    const period = hours >= 12 ? 'PM' : 'AM';
    const displayHours = hours === 0 ? 12 : hours > 12 ? hours - 12 : hours;
    return `${displayHours}:${minutes.toString().padStart(2, '0')} ${period}`;
  };

  const paginatedMeetings = meetings.slice(
    (page - 1) * pageSize,
    (page - 1) * pageSize + pageSize
  );

  if (loading) {
    return (
      <Container maxWidth="lg">
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 200 }}>
          <CircularProgress size={60} />
        </Box>
      </Container>
    );
  }

  if (error) {
    return (
      <Container maxWidth="lg">
        <Alert severity="error" sx={{ mt: 2 }}>
          {error}
        </Alert>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg">
      <Paper 
        elevation={8} 
        sx={{ 
          p: 4, 
          borderRadius: 3,
          background: `linear-gradient(135deg, ${theme.palette.background.paper} 0%, ${theme.palette.grey[50]} 100%)`,
          border: `1px solid ${theme.palette.divider}`,
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 4 }}>
          <Box
            sx={{
              backgroundColor: theme.palette.secondary.main,
              borderRadius: '50%',
              width: 56,
              height: 56,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              mr: 3,
              boxShadow: 3,
            }}
          >
            <Event sx={{ color: 'white', fontSize: 28 }} />
          </Box>
          <Box>
            <Typography variant="h4" component="h2" sx={{ fontWeight: 600, mb: 1 }}>
              Meetings
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Manage your organization's meetings and attendance
            </Typography>
          </Box>
          <Chip 
            label={`${meetings.length} meetings`} 
            color="secondary" 
            variant="outlined" 
            sx={{ ml: 'auto', fontSize: '1rem', fontWeight: 600 }}
          />
        </Box>

        {meetings.length === 0 ? (
          <Box sx={{ textAlign: 'center', py: 8 }}>
            <Box
              sx={{
                backgroundColor: theme.palette.grey[100],
                borderRadius: '50%',
                width: 120,
                height: 120,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                mx: 'auto',
                mb: 3,
              }}
            >
              <Event sx={{ fontSize: 60, color: 'text.secondary' }} />
            </Box>
            <Typography variant="h5" color="text.secondary" gutterBottom sx={{ fontWeight: 500 }}>
              No meetings found
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Start by creating a new meeting.
            </Typography>
          </Box>
        ) : (
          <>
            <Box sx={{ 
              display: 'flex', 
              flexDirection: 'column', 
              gap: 2 
            }}>
              {paginatedMeetings.map((meeting) => (
                <Card 
                  key={meeting.id}
                  sx={{ 
                    borderRadius: 2,
                    border: `1px solid ${theme.palette.divider}`,
                    transition: 'all 0.2s ease-in-out',
                    '&:hover': {
                      backgroundColor: theme.palette.secondary.light + '20',
                      boxShadow: 3,
                      transform: 'translateY(-2px)',
                    }
                  }}
                >
                  <CardContent sx={{ p: 3 }}>
                    <Box sx={{ 
                      display: 'flex', 
                      flexDirection: isMobile ? 'column' : 'row',
                      gap: 2,
                      alignItems: isMobile ? 'stretch' : 'center'
                    }}>
                      {/* Date & Time */}
                      <Box sx={{ 
                        flex: isMobile ? 'none' : 1,
                        minWidth: isMobile ? 'auto' : 200
                      }}>
                        <Typography variant="h6" fontWeight="600" gutterBottom>
                          {formatDate(meeting.date)}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          {formatTime(meeting.time)}
                        </Typography>
                      </Box>

                      {/* Description */}
                      <Box sx={{ 
                        flex: isMobile ? 'none' : 2,
                        minWidth: isMobile ? 'auto' : 200
                      }}>
                        <Typography variant="body1" color="text.secondary" sx={{ mb: 1 }}>
                          {meeting.description || 'No description'}
                        </Typography>
                      </Box>

                      {/* Location */}
                      <Box sx={{ 
                        flex: isMobile ? 'none' : 1,
                        minWidth: isMobile ? 'auto' : 150,
                        display: 'flex',
                        alignItems: 'center'
                      }}>
                        <LocationOn sx={{ mr: 1, fontSize: 20, color: 'text.secondary' }} />
                        <Typography variant="body2">
                          {meeting.location || 'No location'}
                        </Typography>
                      </Box>

                      {/* Actions */}
                      <Box sx={{ 
                        display: 'flex', 
                        gap: 1, 
                        justifyContent: isMobile ? 'center' : 'flex-end',
                        flexWrap: 'wrap'
                      }}>
                        <IconButton 
                          color="info" 
                          onClick={() => handleViewDetails(meeting)}
                          sx={{ 
                            backgroundColor: theme.palette.info.light + '20',
                            '&:hover': {
                              backgroundColor: theme.palette.info.light + '40',
                              transform: 'scale(1.1)',
                            },
                            transition: 'all 0.2s ease-in-out',
                          }}
                        >
                          <Visibility />
                        </IconButton>
                        <IconButton 
                          color="secondary" 
                          onClick={() => handleViewAttendedUsers(meeting)}
                          sx={{ 
                            backgroundColor: theme.palette.secondary.light + '20',
                            '&:hover': {
                              backgroundColor: theme.palette.secondary.light + '40',
                              transform: 'scale(1.1)',
                            },
                            transition: 'all 0.2s ease-in-out',
                          }}
                        >
                          <People />
                        </IconButton>
                        {onEdit && (
                          <IconButton 
                            color="primary" 
                            onClick={() => onEdit(meeting)}
                            sx={{ 
                              backgroundColor: theme.palette.primary.light + '20',
                              '&:hover': {
                                backgroundColor: theme.palette.primary.light + '40',
                                transform: 'scale(1.1)',
                              },
                              transition: 'all 0.2s ease-in-out',
                            }}
                          >
                            <Edit />
                          </IconButton>
                        )}
                        <IconButton 
                          color="error" 
                          onClick={() => handleDeleteClick(meeting.id)}
                          sx={{ 
                            backgroundColor: theme.palette.error.light + '20',
                            '&:hover': {
                              backgroundColor: theme.palette.error.light + '40',
                              transform: 'scale(1.1)',
                            },
                            transition: 'all 0.2s ease-in-out',
                          }}
                        >
                          <Delete />
                        </IconButton>
                      </Box>
                    </Box>
                  </CardContent>
                </Card>
              ))}
            </Box>

            {/* Pagination */}
            <Box sx={{ 
              mt: 3, 
              display: 'flex', 
              justifyContent: 'center',
              flexDirection: 'column',
              alignItems: 'center',
              gap: 2
            }}>
              <Pagination
                count={Math.ceil(meetings.length / pageSize)}
                page={page}
                onChange={handleChangePage}
                color="primary"
                size={isMobile ? "small" : "medium"}
                showFirstButton
                showLastButton
              />
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Typography variant="body2">Items per page:</Typography>
                <select
                  value={pageSize}
                  onChange={handleChangePageSize}
                  style={{
                    padding: '4px 8px',
                    borderRadius: '4px',
                    border: `1px solid ${theme.palette.divider}`,
                    fontSize: '14px'
                  }}
                >
                  <option value={5}>5</option>
                  <option value={10}>10</option>
                  <option value={25}>25</option>
                </select>
              </Box>
            </Box>
          </>
        )}
      </Paper>

      {/* Delete Confirmation Dialog */}
      <Dialog 
        open={confirmOpen} 
        onClose={handleDeleteCancel}
        PaperProps={{
          sx: {
            borderRadius: 3,
            minWidth: 400,
          }
        }}
      >
        <DialogTitle sx={{ 
          backgroundColor: theme.palette.error.main,
          color: 'white',
          fontWeight: 600,
        }}>
          Delete Meeting
        </DialogTitle>
        <DialogContent sx={{ pt: 3 }}>
          <DialogContentText sx={{ fontSize: '1.1rem' }}>
            Are you sure you want to delete this meeting? This action cannot be undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions sx={{ p: 3 }}>
          <Button 
            onClick={handleDeleteCancel} 
            variant="outlined"
            sx={{ borderRadius: 2 }}
          >
            Cancel
          </Button>
          <Button 
            onClick={handleDeleteConfirm} 
            color="error" 
            variant="contained"
            sx={{ borderRadius: 2 }}
          >
            Delete
          </Button>
        </DialogActions>
      </Dialog>

      {/* Attended Users Dialog */}
      <Dialog 
        open={attendedUsersOpen} 
        onClose={() => setAttendedUsersOpen(false)}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 3,
          }
        }}
      >
        <DialogTitle sx={{ 
          backgroundColor: theme.palette.secondary.main,
          color: 'white',
          fontWeight: 600,
        }}>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <People sx={{ mr: 2 }} />
            Attended Users
            {selectedMeetingForAttendance && (
              <Typography variant="body2" sx={{ ml: 2, opacity: 0.8 }}>
                - {formatDate(selectedMeetingForAttendance.date)} at {formatTime(selectedMeetingForAttendance.time)}
              </Typography>
            )}
          </Box>
        </DialogTitle>
        <DialogContent sx={{ pt: 3 }}>
          {/* Meeting Summary */}
          {meetingSummary && (
            <Box sx={{ mb: 3 }}>
              <Card sx={{ bgcolor: 'primary.50', mb: 2 }}>
                <CardContent>
                  <Typography variant="h6" gutterBottom>Meeting Summary</Typography>
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
                    <Box>
                      <Typography variant="body2" color="text.secondary">Total Main Payment</Typography>
                      <Typography variant="h6" color="primary.main">₹{meetingSummary.totalMainPayment}</Typography>
                    </Box>
                    <Box>
                      <Typography variant="body2" color="text.secondary">Total Weekly Payment</Typography>
                      <Typography variant="h6" color="primary.main">₹{meetingSummary.totalWeeklyPayment}</Typography>
                    </Box>
                    <Box>
                      <Typography variant="body2" color="text.secondary">Attendance</Typography>
                      <Typography variant="h6" color="success.main">
                        {meetingSummary.presentAttendanceCount}/{meetingSummary.totalAttendanceCount} ({(meetingSummary.attendancePercentage || 0).toFixed(1)}%)
                      </Typography>
                    </Box>
                  </Box>
                </CardContent>
              </Card>
            </Box>
          )}

          {/* Attended Users */}
          <Typography variant="h6" gutterBottom>Attended Users</Typography>
          {attendedUsers.length === 0 ? (
            <Box sx={{ textAlign: 'center', py: 4 }}>
              <People sx={{ fontSize: 60, color: 'text.secondary', mb: 2 }} />
              <Typography variant="h6" color="text.secondary" gutterBottom>
                No users attended this meeting
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Attendance has not been recorded yet.
              </Typography>
            </Box>
          ) : (
            <List>
              {attendedUsers.map((user, index) => (
                <React.Fragment key={user.id}>
                  <ListItem>
                    <ListItemAvatar>
                      <Avatar>{user.name?.charAt(0) || 'U'}</Avatar>
                    </ListItemAvatar>
                    <ListItemText
                      primary={user.name}
                      secondary={user.email}
                    />
                    <Chip
                      label="Present"
                      color="success"
                      size="small"
                      icon={<CheckCircle />}
                    />
                  </ListItem>
                  {index < attendedUsers.length - 1 && <Divider />}
                </React.Fragment>
              ))}
            </List>
          )}
        </DialogContent>
        <DialogActions sx={{ p: 3 }}>
          <Button 
            onClick={() => setAttendedUsersOpen(false)} 
            variant="contained"
            sx={{ borderRadius: 2 }}
          >
            Close
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default MeetingList; 