import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { apiService } from '../../services/api';
import AuthenticatedLayout from '../layout/AuthenticatedLayout';
import {
  Typography,
  Box,
  Button,
  Avatar,
  Container,
  Card,
  CardContent,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  CircularProgress,
  Alert,
  IconButton,
  useTheme,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Radio,
  RadioGroup,
  FormControlLabel,
  FormLabel
} from '@mui/material';
import {
  AccountCircle,
  Email,
  Dashboard as DashboardIcon,
  Logout,
  Event,
  LocationOn,
  Group,
  Payment,
  Visibility,
  Warning,
  AccountBalance,
  Add,
  ThumbUp,
  ThumbDown
} from '@mui/icons-material';
import LoanRequestForm from '../loans/LoanRequestForm';

interface Meeting {
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
  attendedUsersCount: number;
}

interface OverdueLoan {
  id: number;
  userId: number;
  userName: string;
  date: string;
  dueDate: string;
  interestRate: number;
  amount: number;
  interestAmount: number;
  status: string;
  daysOverdue: number;
  daysUntilDue: number | null;
}

interface LoansDueResponse {
  overdueLoans: OverdueLoan[];
  upcomingLoans: OverdueLoan[];
}

interface LoanRequest {
  id: number;
  userId: number;
  userName: string;
  date: string;
  dueDate: string;
  interestRate: number;
  amount: number;
  status: string;
  reason?: string;
}

const UserDashboard: React.FC = () => {
  const { user, logout } = useAuth();
  const theme = useTheme();
  
  // Meeting list state
  const [meetings, setMeetings] = useState<Meeting[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [totalCount, setTotalCount] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [totalMainPaymentAllEntries, setTotalMainPaymentAllEntries] = useState(0);
  const [totalWeeklyPaymentAllEntries, setTotalWeeklyPaymentAllEntries] = useState(0);
  
  // Overdue loans state
  const [overdueLoans, setOverdueLoans] = useState<OverdueLoan[]>([]);
  const [upcomingLoans, setUpcomingLoans] = useState<OverdueLoan[]>([]);
  const [loansLoading, setLoansLoading] = useState(false);
  const [loansError, setLoansError] = useState<string | null>(null);
  
  // Loan request form state
  const [loanRequestDialogOpen, setLoanRequestDialogOpen] = useState(false);
  
  // Loan requests state
  const [loanRequests, setLoanRequests] = useState<LoanRequest[]>([]);
  const [loanRequestsLoading, setLoanRequestsLoading] = useState(false);
  const [loanRequestsError, setLoanRequestsError] = useState<string | null>(null);
  const [actionDialogOpen, setActionDialogOpen] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState<LoanRequest | null>(null);
  const [action, setAction] = useState<string>('');
  const [saving, setSaving] = useState(false);
  
  // Set default dates to current month start to today
  const getDefaultDates = () => {
    const now = new Date();
    const currentMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    
    // Format dates for datetime-local input (YYYY-MM-DDTHH:mm)
    const formatDateForInput = (date: Date) => {
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      const hours = String(date.getHours()).padStart(2, '0');
      const minutes = String(date.getMinutes()).padStart(2, '0');
      return `${year}-${month}-${day}T${hours}:${minutes}`;
    };
    
    return {
      startDate: formatDateForInput(currentMonthStart),
      endDate: formatDateForInput(now)
    };
  };
  
  const defaultDates = getDefaultDates();
  const [startDate, setStartDate] = useState(defaultDates.startDate);
  const [endDate, setEndDate] = useState(defaultDates.endDate);

  const handleLogout = () => {
    logout();
  };

  const handleLoanRequestClick = () => {
    setLoanRequestDialogOpen(true);
  };

  const handleLoanRequestClose = () => {
    setLoanRequestDialogOpen(false);
  };

  const handleLoanRequestSuccess = () => {
    // Refresh the loan requests data after successful submission
    fetchLoanRequests();
  };

  // Fetch loan requests
  const fetchLoanRequests = async () => {
    setLoanRequestsLoading(true);
    setLoanRequestsError(null);
    try {
      const response = await apiService.get<LoanRequest[]>('/api/dashboard/loan-requests');
      setLoanRequests(response);
    } catch (err: any) {
      setLoanRequestsError(err.response?.data?.message || 'Failed to fetch loan requests.');
    } finally {
      setLoanRequestsLoading(false);
    }
  };

  const handleActionClick = (request: LoanRequest) => {
    setSelectedRequest(request);
    setAction('');
    setActionDialogOpen(true);
  };

  const handleActionClose = () => {
    setActionDialogOpen(false);
    setSelectedRequest(null);
    setAction('');
  };

  const handleActionSubmit = async () => {
    if (!selectedRequest || !action) return;

    setSaving(true);
    setLoanRequestsError(null);
    try {
      await apiService.put(`/api/Dashboard/loan-requests/${selectedRequest.id}/action`, {
        action: action
      });
      handleActionClose();
      fetchLoanRequests(); // Refresh the list
    } catch (err: any) {
      setLoanRequestsError(err.response?.data?.message || 'Failed to update loan request.');
    } finally {
      setSaving(false);
    }
  };

  const fetchMeetings = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Convert datetime-local format to ISO string for API
      const formatDateForAPI = (dateTimeLocal: string) => {
        const date = new Date(dateTimeLocal);
        return date.toISOString();
      };
      
      const params = new URLSearchParams({
        page: page.toString(),
        pageSize: pageSize.toString(),
        startDate: formatDateForAPI(startDate),
        endDate: formatDateForAPI(endDate)
      });
      
      const response = await apiService.get<any>(`/api/Dashboard/meetings?${params.toString()}`);
      console.log(response);  
      // Handle different response structures
      let meetingsData: Meeting[] = [];
      if (response && Array.isArray(response.meetings)) {
        meetingsData = response.meetings;
        setTotalCount(response.pagination?.totalCount || meetingsData.length);
        setTotalPages(response.pagination?.totalPages || 1);
        setTotalMainPaymentAllEntries(response.totalMainPaymentAllEntries || 0);
        setTotalWeeklyPaymentAllEntries(response.totalWeeklyPaymentAllEntries || 0);
      } else {
        meetingsData = [];
        setTotalCount(0);
        setTotalPages(1);
        setTotalMainPaymentAllEntries(0);
        setTotalWeeklyPaymentAllEntries(0);
      }
      setMeetings(meetingsData);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to fetch meetings.');
      setMeetings([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchOverdueLoans = async () => {
    try {
      setLoansLoading(true);
      setLoansError(null);
      const response = await apiService.get<LoansDueResponse>('/api/Dashboard/loans-due');
      setOverdueLoans(response.overdueLoans || []);
      setUpcomingLoans(response.upcomingLoans || []);
    } catch (err: any) {
      setLoansError(err.response?.data?.message || 'Failed to fetch overdue loans.');
    } finally {
      setLoansLoading(false);
    }
  };

  useEffect(() => {
    fetchMeetings();
    fetchOverdueLoans();
    fetchLoanRequests();
  }, [page, pageSize, startDate, endDate]);

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

  return (
    <AuthenticatedLayout>
      <Box sx={{ p: 3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Typography variant="h4" component="h1">
            Dashboard
          </Typography>
          
                  {/* Loan Request Button - Only show for non-secretary users */}
        {user && user.role !== 'Secretary' && (
            <Button
              variant="contained"
              color="primary"
              startIcon={<Add />}
              onClick={handleLoanRequestClick}
              sx={{
                borderRadius: 2,
                textTransform: 'none',
                fontWeight: 600,
                px: 3,
                py: 1,
                '&:hover': {
                  transform: 'translateY(-2px)',
                  boxShadow: theme.shadows[8],
                },
                transition: 'all 0.2s ease-in-out',
              }}
            >
              Request Loan
            </Button>
          )}
        </Box>
        
                  {/* Loans Due Section */}
          <Box sx={{ mt: 6 }}>
            <Typography variant="h5" component="h2" gutterBottom>
              Loans Due
            </Typography>
            
            {loansError && (
              <Alert severity="error" sx={{ mb: 3 }}>
                {loansError}
              </Alert>
            )}
            
            {loansLoading ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
                <CircularProgress size={60} />
              </Box>
            ) : (
              <>
                {/* Overdue Loans */}
                {overdueLoans.length > 0 && (
                  <Card sx={{ mb: 3 }}>
                    <CardContent>
                      <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                        <Warning sx={{ mr: 1, color: 'error.main' }} />
                        <Typography variant="h6" color="error.main">
                          {overdueLoans.length} Overdue Loan{overdueLoans.length !== 1 ? 's' : ''}
                        </Typography>
                      </Box>
                      
                      <Box sx={{ overflowX: 'auto' }}>
                        <Box component="table" sx={{ width: '100%', borderCollapse: 'collapse' }}>
                          <Box component="thead">
                            <Box component="tr" sx={{ borderBottom: 1, borderColor: 'divider' }}>
                                                                  <Box component="th" sx={{ p: 2, textAlign: 'left', fontWeight: 600 }}>Member</Box>
                                    <Box component="th" sx={{ p: 2, textAlign: 'left', fontWeight: 600 }}>Due Date</Box>
                                    <Box component="th" sx={{ p: 2, textAlign: 'left', fontWeight: 600 }}>Amount</Box>
                                    <Box component="th" sx={{ p: 2, textAlign: 'left', fontWeight: 600 }}>Interest</Box>
                                    <Box component="th" sx={{ p: 2, textAlign: 'left', fontWeight: 600 }}>Days Overdue</Box>
                                    <Box component="th" sx={{ p: 2, textAlign: 'left', fontWeight: 600 }}>Status</Box>
                            </Box>
                          </Box>
                          <Box component="tbody">
                            {overdueLoans.map((loan) => (
                              <Box 
                                key={loan.id} 
                                component="tr" 
                                sx={{ 
                                  borderBottom: 1, 
                                  borderColor: 'divider',
                                  '&:hover': { backgroundColor: 'action.hover' }
                                }}
                              >
                                <Box component="td" sx={{ p: 2 }}>
                                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                    <AccountBalance sx={{ fontSize: 16, color: 'text.secondary' }} />
                                    <Typography variant="body2" fontWeight={600}>
                                      {loan.userName}
                                    </Typography>
                                  </Box>
                                </Box>
                                <Box component="td" sx={{ p: 2 }}>
                                  <Typography 
                                    variant="body2" 
                                    sx={{ color: 'error.main', fontWeight: 600 }}
                                  >
                                    {loan.dueDate ? new Date(loan.dueDate).toLocaleDateString() : ''}
                                  </Typography>
                                </Box>
                                                                      <Box component="td" sx={{ p: 2 }}>
                                        <Typography variant="body2" fontWeight={600}>
                                          ₹{loan.amount.toLocaleString()}
                                        </Typography>
                                      </Box>
                                      <Box component="td" sx={{ p: 2 }}>
                                        <Typography variant="body2" fontWeight={600}>
                                          ₹{loan.interestAmount.toLocaleString()}
                                        </Typography>
                                      </Box>
                                      <Box component="td" sx={{ p: 2 }}>
                                        <Chip 
                                          label={`${loan.daysOverdue} days`}
                                          color="error"
                                          size="small"
                                          sx={{ fontWeight: 600 }}
                                        />
                                      </Box>
                                <Box component="td" sx={{ p: 2 }}>
                                  <Chip 
                                    label={loan.status}
                                    color={loan.status === 'Ongoing' ? 'warning' : 'error'}
                                    size="small"
                                  />
                                </Box>
                              </Box>
                            ))}
                          </Box>
                        </Box>
                      </Box>
                    </CardContent>
                  </Card>
                )}

                {/* Upcoming Loans */}
                {upcomingLoans.length > 0 && (
                  <Card sx={{ mb: 3 }}>
                    <CardContent>
                      <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                        <AccountBalance sx={{ mr: 1, color: 'info.main' }} />
                        <Typography variant="h6" color="info.main">
                          {upcomingLoans.length} Upcoming Due{upcomingLoans.length !== 1 ? 's' : ''}
                        </Typography>
                      </Box>
                      
                      <Box sx={{ overflowX: 'auto' }}>
                        <Box component="table" sx={{ width: '100%', borderCollapse: 'collapse' }}>
                          <Box component="thead">
                            <Box component="tr" sx={{ borderBottom: 1, borderColor: 'divider' }}>
                                                                  <Box component="th" sx={{ p: 2, textAlign: 'left', fontWeight: 600 }}>Member</Box>
                                    <Box component="th" sx={{ p: 2, textAlign: 'left', fontWeight: 600 }}>Due Date</Box>
                                    <Box component="th" sx={{ p: 2, textAlign: 'left', fontWeight: 600 }}>Amount</Box>
                                    <Box component="th" sx={{ p: 2, textAlign: 'left', fontWeight: 600 }}>Interest</Box>
                                    <Box component="th" sx={{ p: 2, textAlign: 'left', fontWeight: 600 }}>Days Until Due</Box>
                                    <Box component="th" sx={{ p: 2, textAlign: 'left', fontWeight: 600 }}>Status</Box>
                            </Box>
                          </Box>
                          <Box component="tbody">
                            {upcomingLoans.map((loan) => (
                              <Box 
                                key={loan.id} 
                                component="tr" 
                                sx={{ 
                                  borderBottom: 1, 
                                  borderColor: 'divider',
                                  '&:hover': { backgroundColor: 'action.hover' }
                                }}
                              >
                                <Box component="td" sx={{ p: 2 }}>
                                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                    <AccountBalance sx={{ fontSize: 16, color: 'text.secondary' }} />
                                    <Typography variant="body2" fontWeight={600}>
                                      {loan.userName}
                                    </Typography>
                                  </Box>
                                </Box>
                                <Box component="td" sx={{ p: 2 }}>
                                  <Typography 
                                    variant="body2" 
                                    sx={{ color: 'info.main', fontWeight: 600 }}
                                  >
                                    {loan.dueDate ? new Date(loan.dueDate).toLocaleDateString() : ''}
                                  </Typography>
                                </Box>
                                                                      <Box component="td" sx={{ p: 2 }}>
                                        <Typography variant="body2" fontWeight={600}>
                                          ₹{loan.amount.toLocaleString()}
                                        </Typography>
                                      </Box>
                                      <Box component="td" sx={{ p: 2 }}>
                                        <Typography variant="body2" fontWeight={600}>
                                          ₹{loan.interestAmount.toLocaleString()}
                                        </Typography>
                                      </Box>
                                      <Box component="td" sx={{ p: 2 }}>
                                        <Chip 
                                          label={`${loan.daysUntilDue} days`}
                                          color="info"
                                          size="small"
                                          sx={{ fontWeight: 600 }}
                                        />
                                      </Box>
                                <Box component="td" sx={{ p: 2 }}>
                                  <Chip 
                                    label={loan.status}
                                    color={loan.status === 'Ongoing' ? 'info' : 'default'}
                                    size="small"
                                  />
                                </Box>
                              </Box>
                            ))}
                          </Box>
                        </Box>
                      </Box>
                    </CardContent>
                  </Card>
                )}

                {/* No Loans Due */}
                {overdueLoans.length === 0 && upcomingLoans.length === 0 && !loansLoading && (
                  <Box sx={{ textAlign: 'center', py: 4 }}>
                    <AccountBalance sx={{ fontSize: 60, color: 'success.main', mb: 2 }} />
                    <Typography variant="h6" color="success.main" gutterBottom>
                      No loans due
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      All loans are up to date!
                    </Typography>
                  </Box>
                )}
              </>
            )}
          </Box>
        
        {/* Loan Requests Section */}
        <Box sx={{ mt: 6 }}>
          <Typography variant="h5" component="h2" gutterBottom>
            Loan Requests
          </Typography>
          
          {loanRequestsError && (
            <Alert severity="error" sx={{ mb: 3 }}>
              {loanRequestsError}
            </Alert>
          )}
          
          {loanRequestsLoading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
              <CircularProgress size={60} />
            </Box>
          ) : (
            <>
              {loanRequests.length === 0 ? (
                <Box sx={{ textAlign: 'center', py: 4 }}>
                  <AccountBalance sx={{ fontSize: 60, color: 'text.secondary', mb: 2 }} />
                  <Typography variant="h6" color="text.secondary" gutterBottom>
                    No loan requests
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    There are currently no loan requests to review.
                  </Typography>
                </Box>
              ) : (
                <Card>
                  <CardContent>
                    <Box sx={{ overflowX: 'auto' }}>
                      <Box component="table" sx={{ width: '100%', borderCollapse: 'collapse' }}>
                        <Box component="thead">
                          <Box component="tr" sx={{ borderBottom: 1, borderColor: 'divider' }}>
                            {user?.role === 'Secretary' && (
                              <Box component="th" sx={{ p: 2, textAlign: 'left', fontWeight: 600 }}>Member</Box>
                            )}
                            <Box component="th" sx={{ p: 2, textAlign: 'left', fontWeight: 600 }}>Request Date</Box>
                            <Box component="th" sx={{ p: 2, textAlign: 'left', fontWeight: 600 }}>Due Date</Box>
                            <Box component="th" sx={{ p: 2, textAlign: 'left', fontWeight: 600 }}>Amount</Box>
                            <Box component="th" sx={{ p: 2, textAlign: 'left', fontWeight: 600 }}>Interest Rate</Box>
                            <Box component="th" sx={{ p: 2, textAlign: 'left', fontWeight: 600 }}>Status</Box>
                            {user?.role === 'Secretary' && (
                              <Box component="th" sx={{ p: 2, textAlign: 'center', fontWeight: 600 }}>Actions</Box>
                            )}
                          </Box>
                        </Box>
                        <Box component="tbody">
                          {loanRequests.map((request) => (
                            <Box 
                              key={request.id} 
                              component="tr" 
                              sx={{ 
                                borderBottom: 1, 
                                borderColor: 'divider',
                                '&:hover': { backgroundColor: 'action.hover' }
                              }}
                            >
                              {user?.role === 'Secretary' && (
                                <Box component="td" sx={{ p: 2 }}>
                                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                    <AccountBalance sx={{ fontSize: 16, color: 'text.secondary' }} />
                                    <Typography variant="body2" fontWeight={600}>
                                      {request.userName}
                                    </Typography>
                                  </Box>
                                </Box>
                              )}
                              <Box component="td" sx={{ p: 2 }}>
                                <Typography variant="body2">
                                  {request.date ? new Date(request.date).toLocaleDateString() : ''}
                                </Typography>
                              </Box>
                              <Box component="td" sx={{ p: 2 }}>
                                <Typography variant="body2">
                                  {request.dueDate ? new Date(request.dueDate).toLocaleDateString() : ''}
                                </Typography>
                              </Box>
                              <Box component="td" sx={{ p: 2 }}>
                                <Typography variant="body2" fontWeight={600}>
                                  ₹{request.amount.toLocaleString()}
                                </Typography>
                              </Box>
                              <Box component="td" sx={{ p: 2 }}>
                                <Typography variant="body2">
                                  {request.interestRate}%
                                </Typography>
                              </Box>
                              <Box component="td" sx={{ p: 2 }}>
                                <Chip 
                                  label={request.status}
                                  color={
                                    request.status.toLowerCase() === 'accepted' ? 'success' : 
                                    request.status.toLowerCase() === 'rejected' ? 'error' : 
                                    request.status.toLowerCase() === 'requested' ? 'warning' : 
                                    'default'
                                  }
                                  size="small"
                                />
                              </Box>
                              {user?.role === 'Secretary' && (
                                <Box component="td" sx={{ p: 2, textAlign: 'center' }}>
                                  <Button
                                    variant="contained"
                                    color="primary"
                                    size="small"
                                    onClick={() => handleActionClick(request)}
                                    startIcon={<Add />}
                                    sx={{
                                      borderRadius: 2,
                                      textTransform: 'none',
                                      fontWeight: 600,
                                      '&:hover': {
                                        transform: 'scale(1.05)',
                                      },
                                      transition: 'all 0.2s ease-in-out',
                                    }}
                                  >
                                    Review
                                  </Button>
                                </Box>
                              )}
                            </Box>
                          ))}
                        </Box>
                      </Box>
                    </Box>
                  </CardContent>
                </Card>
              )}
            </>
          )}
        </Box>
        
        {/* Meeting List Section */}
        <Box sx={{ mt: 6 }}>
          <Typography variant="h5" component="h2" gutterBottom>
            Recent Meetings
          </Typography>
          
          {/* Filter Controls */}
          <Card sx={{ mb: 3, p: 3 }}>
            <Typography variant="h6" gutterBottom>Filter Options</Typography>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, alignItems: 'center' }}>
              <Box sx={{ flex: '1 1 200px', minWidth: 0 }}>
                <TextField
                  label="Page"
                  type="number"
                  value={page}
                  onChange={(e) => setPage(parseInt(e.target.value) || 1)}
                  size="small"
                  fullWidth
                />
              </Box>
              <Box sx={{ flex: '1 1 200px', minWidth: 0 }}>
                <FormControl fullWidth size="small">
                  <InputLabel>Page Size</InputLabel>
                  <Select
                    value={pageSize}
                    label="Page Size"
                    onChange={(e) => setPageSize(e.target.value as number)}
                  >
                    <MenuItem value={5}>5</MenuItem>
                    <MenuItem value={10}>10</MenuItem>
                    <MenuItem value={20}>20</MenuItem>
                    <MenuItem value={50}>50</MenuItem>
                  </Select>
                </FormControl>
              </Box>
              <Box sx={{ flex: '1 1 300px', minWidth: 0 }}>
                <TextField
                  label="Start Date"
                  type="datetime-local"
                  value={startDate.slice(0, 16)}
                  onChange={(e) => setStartDate(e.target.value + ':00')}
                  size="small"
                  fullWidth
                  InputLabelProps={{ shrink: true }}
                />
              </Box>
              <Box sx={{ flex: '1 1 300px', minWidth: 0 }}>
                <TextField
                  label="End Date"
                  type="datetime-local"
                  value={endDate.slice(0, 16)}
                  onChange={(e) => setEndDate(e.target.value + ':00')}
                  size="small"
                  fullWidth
                  InputLabelProps={{ shrink: true }}
                />
              </Box>
            </Box>
          </Card>

          {/* Error Display */}
          {error && (
            <Alert severity="error" sx={{ mb: 3 }}>
              {error}
            </Alert>
          )}

          {/* Loading State */}
          {loading && (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
              <CircularProgress size={60} />
            </Box>
          )}

          {/* Totals Row */}
          {!loading && !error && (
            <Box sx={{ display: 'flex', gap: 4, mb: 2, flexWrap: 'wrap' }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Payment sx={{ color: 'success.main' }} />
                <Typography variant="subtitle1" color="success.main">
                  Total Main Payment (All): ₹{totalMainPaymentAllEntries}
                </Typography>
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Payment sx={{ color: 'info.main' }} />
                <Typography variant="subtitle1" color="info.main">
                  Total Weekly Payment (All): ₹{totalWeeklyPaymentAllEntries}
                </Typography>
              </Box>
            </Box>
          )}

          {/* Meeting Cards */}
          {!loading && !error && Array.isArray(meetings) && (
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 3 }}>
              {meetings.map((meeting) => (
                <Box sx={{ flex: '1 1 350px', minWidth: 0 }} key={meeting.id}>
                  <Card 
                    elevation={3}
                    sx={{
                      height: '100%',
                      display: 'flex',
                      flexDirection: 'column',
                      transition: 'transform 0.2s ease-in-out',
                      '&:hover': {
                        transform: 'translateY(-4px)',
                        boxShadow: theme.shadows[8],
                      },
                    }}
                  >
                    <CardContent sx={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
                      {/* Header */}
                      <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                        <Event sx={{ mr: 1, color: 'primary.main' }} />
                        <Typography variant="h6" component="h3" sx={{ flex: 1 }}>
                          Meeting #{meeting.id}
                        </Typography>
                      </Box>
                      {/* Date and Time */}
                      <Typography variant="body2" color="text.secondary" gutterBottom>
                        <strong>Date:</strong> {formatDate(meeting.date)}
                      </Typography>
                      <Typography variant="body2" color="text.secondary" gutterBottom>
                        <strong>Time:</strong> {formatTime(meeting.time)}
                      </Typography>
                      {/* Location */}
                      {meeting.location && (
                        <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                          <LocationOn sx={{ fontSize: 16, mr: 0.5, color: 'text.secondary' }} />
                          <Typography variant="body2" color="text.secondary">
                            {meeting.location}
                          </Typography>
                        </Box>
                      )}
                      {/* Description */}
                      {meeting.description && (
                        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                          {meeting.description}
                        </Typography>
                      )}
                      {/* Summary Stats */}
                      <Box sx={{ mt: 'auto', pt: 2 }}>
                        <Box sx={{ display: 'flex', gap: 1 }}>
                          <Box sx={{ flex: 1, textAlign: 'center' }}>
                            <Payment sx={{ fontSize: 20, color: 'success.main', mb: 0.5 }} />
                            <Typography variant="caption" display="block" color="text.secondary">
                              Main Payment
                            </Typography>
                            <Typography variant="body2" fontWeight="bold" color="success.main">
                              ₹{meeting.totalMainPayment}
                            </Typography>
                          </Box>
                          <Box sx={{ flex: 1, textAlign: 'center' }}>
                            <Payment sx={{ fontSize: 20, color: 'info.main', mb: 0.5 }} />
                            <Typography variant="caption" display="block" color="text.secondary">
                              Weekly Payment
                            </Typography>
                            <Typography variant="body2" fontWeight="bold" color="info.main">
                              ₹{meeting.totalWeeklyPayment}
                            </Typography>
                          </Box>
                        </Box>
                        {/* Attendance */}
                        <Box sx={{ mt: 2, textAlign: 'center' }}>
                          <Group sx={{ fontSize: 20, color: 'primary.main', mb: 0.5 }} />
                          <Typography variant="caption" display="block" color="text.secondary">
                            Attendance
                          </Typography>
                          <Typography variant="body2" fontWeight="bold" color="primary.main">
                            {meeting.attendedUsersCount}/{meeting.totalAttendanceCount}
                          </Typography>
                          <Chip
                            label={`${meeting.attendancePercentage.toFixed(1)}%`}
                            size="small"
                            color={meeting.attendancePercentage >= 80 ? 'success' : meeting.attendancePercentage >= 60 ? 'warning' : 'error'}
                            sx={{ mt: 0.5 }}
                          />
                        </Box>
                      </Box>
                    </CardContent>
                  </Card>
                </Box>
              ))}
            </Box>
          )}

          {/* Pagination Controls */}
          {!loading && !error && totalPages > 1 && (
            <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
              <FormControl size="small">
                <InputLabel>Page</InputLabel>
                <Select
                  value={page}
                  label="Page"
                  onChange={(e) => setPage(Number(e.target.value))}
                >
                  {Array.from({ length: totalPages }, (_, i) => (
                    <MenuItem key={i + 1} value={i + 1}>{i + 1}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Box>
          )}

          {/* Empty State */}
          {!loading && !error && Array.isArray(meetings) && meetings.length === 0 && (
            <Box sx={{ textAlign: 'center', py: 6 }}>
              <Event sx={{ fontSize: 80, color: 'text.secondary', mb: 2 }} />
              <Typography variant="h6" color="text.secondary" gutterBottom>
                No meetings found
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Try adjusting your filter parameters or date range.
              </Typography>
            </Box>
          )}
        </Box>
      </Box>

      {/* Loan Request Form Dialog */}
      <LoanRequestForm
        open={loanRequestDialogOpen}
        onClose={handleLoanRequestClose}
        onSuccess={handleLoanRequestSuccess}
      />

      {/* Action Dialog */}
      <Dialog 
        open={actionDialogOpen} 
        onClose={handleActionClose}
        PaperProps={{
          sx: {
            borderRadius: 3,
            minWidth: 500,
          }
        }}
      >
        <DialogTitle sx={{ 
          backgroundColor: theme.palette.primary.main,
          color: 'white',
          fontWeight: 600,
        }}>
          Review Loan Request
        </DialogTitle>
        <DialogContent sx={{ pt: 3 }}>
          {selectedRequest && (
            <Box sx={{ mb: 3 }}>
              <Typography variant="h6" gutterBottom>
                Request Details
              </Typography>
              <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2, mb: 2 }}>
                <Box>
                  <Typography variant="body2" color="text.secondary">Member</Typography>
                  <Typography variant="body1" fontWeight={600}>{selectedRequest.userName}</Typography>
                </Box>
                <Box>
                  <Typography variant="body2" color="text.secondary">Amount</Typography>
                  <Typography variant="body1" fontWeight={600}>₹{selectedRequest.amount.toLocaleString()}</Typography>
                </Box>
                <Box>
                  <Typography variant="body2" color="text.secondary">Interest Rate</Typography>
                  <Typography variant="body1">{selectedRequest.interestRate}%</Typography>
                </Box>
                <Box>
                  <Typography variant="body2" color="text.secondary">Due Date</Typography>
                  <Typography variant="body1">
                    {selectedRequest.dueDate ? new Date(selectedRequest.dueDate).toLocaleDateString() : ''}
                  </Typography>
                </Box>
              </Box>
            </Box>
          )}
          
          <FormControl component="fieldset" fullWidth>
            <FormLabel component="legend" sx={{ fontWeight: 600, mb: 2 }}>
              Select Action
            </FormLabel>
            <RadioGroup
              value={action}
              onChange={(e) => setAction(e.target.value)}
              sx={{ gap: 2 }}
            >
              <FormControlLabel
                value="Accepted"
                control={<Radio color="success" />}
                label={
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <ThumbUp color="success" />
                    <Typography>Accept Request</Typography>
                  </Box>
                }
              />
              <FormControlLabel
                value="Rejected"
                control={<Radio color="error" />}
                label={
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <ThumbDown color="error" />
                    <Typography>Reject Request</Typography>
                  </Box>
                }
              />
            </RadioGroup>
          </FormControl>
        </DialogContent>
        <DialogActions sx={{ p: 3 }}>
          <Button 
            onClick={handleActionClose} 
            variant="outlined"
            disabled={saving}
            sx={{ borderRadius: 2 }}
          >
            Cancel
          </Button>
          <Button 
            onClick={handleActionSubmit} 
            variant="contained"
            disabled={!action || saving}
            sx={{ borderRadius: 2 }}
          >
            {saving ? <CircularProgress size={20} /> : 'Save Decision'}
          </Button>
        </DialogActions>
      </Dialog>
    </AuthenticatedLayout>
  );
};

export default UserDashboard; 