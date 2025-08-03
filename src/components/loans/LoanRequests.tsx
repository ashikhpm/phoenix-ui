import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  CardActions,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
  CircularProgress,
  Alert,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Tooltip,
  Container,
  Chip,
  useTheme,
  TablePagination,
  DialogContentText,
  Radio,
  RadioGroup,
  FormControlLabel,
  FormControl,
  FormLabel,
  TextField,
} from '@mui/material';
import { 
  Person, 
  AccountBalance, 
  AttachMoney, 
  Schedule, 
  TrendingUp, 
  CheckCircle, 
  Cancel,
  ThumbUp,
  ThumbDown
} from '@mui/icons-material';
import { apiService } from '../../services/api';
import { useAuth } from '../../contexts/AuthContext';

interface LoanRequest {
  id: number;
  userId: number;
  userName: string;
  date: string;
  dueDate: string;
  interestRate: number;
  amount: number;
  status: string;
  description?: string;
  chequeNumber?: string;
}

const LoanRequests: React.FC = () => {
  const [loanRequests, setLoanRequests] = useState<LoanRequest[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [actionDialogOpen, setActionDialogOpen] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState<LoanRequest | null>(null);
  const [action, setAction] = useState<string>('');
  const [description, setReason] = useState<string>('');
  const [chequeNumber, setChequeNumber] = useState<string>('');
  const [saving, setSaving] = useState(false);
  const theme = useTheme();
  const { user } = useAuth();

  // Fetch loan requests
  const fetchLoanRequests = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await apiService.get<LoanRequest[]>('/api/dashboard/loan-requests');
      setLoanRequests(response);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to fetch loan requests.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLoanRequests();
  }, []);

  const handleActionClick = (request: LoanRequest) => {
    setSelectedRequest(request);
    setAction('');
    setReason('');
    setChequeNumber('');
    setActionDialogOpen(true);
  };

  const handleActionClose = () => {
    setActionDialogOpen(false);
    setSelectedRequest(null);
    setAction('');
    setReason('');
    setChequeNumber('');
  };

  const handleActionSubmit = async () => {
    if (!selectedRequest || !action) return;
    
    // Check if reason is required for rejection
    if (action === 'Rejected' && !description.trim()) {
      setError('Reason is required when rejecting a loan request.');
      return;
    }

    // Check if cheque number is required for acceptance
    if (action === 'Accepted' && !chequeNumber.trim()) {
      setError('Cheque number is required when accepting a loan request.');
      return;
    }

    setSaving(true);
    setError(null);
    try {
      const payload: any = { 
        action: action,
        chequeNumber: action === 'Accepted' ? chequeNumber.trim() : null,
        description: action === 'Rejected' ? description.trim() : null
      };
      
      await apiService.put(`/api/Dashboard/loan-requests/${selectedRequest.id}/action`, payload);
      handleActionClose();
      fetchLoanRequests(); // Refresh the list
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to update loan request.');
    } finally {
      setSaving(false);
    }
  };

  const handleChangePage = (event: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const paginatedRequests = loanRequests.slice(
    page * rowsPerPage,
    page * rowsPerPage + rowsPerPage
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
              backgroundColor: theme.palette.primary.main,
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
            <AccountBalance sx={{ color: 'white', fontSize: 28 }} />
          </Box>
          <Box>
            <Typography variant="h4" component="h2" sx={{ fontWeight: 600, mb: 1 }}>
              Loan Requests
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Review and manage loan requests from members
            </Typography>
          </Box>
          <Chip 
            label={`${loanRequests.length} requests`} 
            color="primary" 
            variant="outlined" 
            sx={{ ml: 'auto', fontWeight: 600 }}
          />
        </Box>

        {loanRequests.length === 0 ? (
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
              <AccountBalance sx={{ fontSize: 60, color: 'text.secondary' }} />
            </Box>
            <Typography variant="h5" color="text.secondary" gutterBottom sx={{ fontWeight: 500 }}>
              No loan requests found
            </Typography>
            <Typography variant="body1" color="text.secondary">
              There are currently no pending loan requests to review.
            </Typography>
          </Box>
        ) : (
          <>
            <TableContainer 
              sx={{ 
                borderRadius: 2,
                border: `1px solid ${theme.palette.divider}`,
                overflow: 'hidden',
              }}
            >
              <Table sx={{ 
                '& th': { 
                  backgroundColor: theme.palette.primary.main,
                  color: 'white',
                  fontWeight: 600,
                },
                '& tr:hover': {
                  backgroundColor: theme.palette.action.hover,
                  transform: 'scale(1.01)',
                  transition: 'all 0.2s ease-in-out',
                },
                '& tr': {
                  transition: 'all 0.2s ease-in-out',
                }
              }}>
                <TableHead>
                  <TableRow>
                    <TableCell sx={{ py: 3 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <Person sx={{ mr: 2, fontSize: 24 }} />
                        Member
                      </Box>
                    </TableCell>
                    <TableCell sx={{ py: 3 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <Schedule sx={{ mr: 2, fontSize: 24 }} />
                        Request Date
                      </Box>
                    </TableCell>
                    <TableCell sx={{ py: 3 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <Schedule sx={{ mr: 2, fontSize: 24 }} />
                        Due Date
                      </Box>
                    </TableCell>
                    <TableCell sx={{ py: 3 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <TrendingUp sx={{ mr: 2, fontSize: 24 }} />
                        Interest Rate
                      </Box>
                    </TableCell>
                    <TableCell sx={{ py: 3 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <AttachMoney sx={{ mr: 2, fontSize: 24 }} />
                        Amount
                      </Box>
                    </TableCell>
                    <TableCell sx={{ py: 3 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <AccountBalance sx={{ mr: 2, fontSize: 24 }} />
                        Status
                      </Box>
                    </TableCell>
                    <TableCell sx={{ py: 3 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <AccountBalance sx={{ mr: 2, fontSize: 24 }} />
                        Reason/Cheque Number
                      </Box>
                    </TableCell>
                    <TableCell align="center" sx={{ py: 3 }}>Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {paginatedRequests.map((request) => (
                    <TableRow 
                      key={request.id} 
                      hover
                      sx={{ 
                        '&:nth-of-type(odd)': {
                          backgroundColor: theme.palette.grey[50],
                        },
                        '&:hover': {
                          backgroundColor: theme.palette.primary.light + '20',
                          boxShadow: 2,
                        }
                      }}
                    >
                      <TableCell sx={{ py: 3 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Person fontSize="small" />
                          <Box>
                            <Typography variant="body1" fontWeight="600" sx={{ color: theme.palette.primary.main }}>
                              {request.userName}
                            </Typography>
                          </Box>
                        </Box>
                      </TableCell>
                      <TableCell sx={{ py: 3 }}>
                        <Typography variant="body2">
                          {request.date ? new Date(request.date).toLocaleDateString() : ''}
                        </Typography>
                      </TableCell>
                      <TableCell sx={{ py: 3 }}>
                        <Typography variant="body2">
                          {request.dueDate ? new Date(request.dueDate).toLocaleDateString() : ''}
                        </Typography>
                      </TableCell>
                      <TableCell sx={{ py: 3 }}>
                        <Typography variant="body2">
                          {request.interestRate}%
                        </Typography>
                      </TableCell>
                      <TableCell sx={{ py: 3 }}>
                        <Typography variant="body2" fontWeight={600}>
                          ₹{request.amount.toLocaleString()}
                        </Typography>
                      </TableCell>
                      <TableCell sx={{ py: 3 }}>
                        <Chip 
                          label={request.status}
                          color={
                            request.status.toLowerCase() === 'Accepted' ? 'success' : 
                            request.status.toLowerCase() === 'Rejected' ? 'error' : 
                            request.status.toLowerCase() === 'Requested' ? 'warning' : 
                            'default'
                          }
                          size="small"
                          variant="outlined"
                        />
                      </TableCell>
                      <TableCell sx={{ py: 3 }}>
                        <Typography variant="body2" color="text.secondary">
                          {request.status.toLowerCase() === 'rejected' ? (request.description || 'N/A') :
                           request.status.toLowerCase() === 'accepted' ? (request.chequeNumber || 'N/A') :
                           'N/A'}
                        </Typography>
                      </TableCell>
                      <TableCell align="center" sx={{ py: 3 }}>
                        <Tooltip 
                          title={
                            request.status.toLowerCase() !== 'requested' ? 'Decision made already' :
                            request.userId === user?.id ? 'Cannot review your own request' :
                            'Review loan request'
                          }
                          placement="top"
                        >
                          <span>
                            <Button
                              variant="contained"
                              color="primary"
                              size="small"
                              onClick={() => handleActionClick(request)}
                              startIcon={<CheckCircle />}
                              disabled={request.status.toLowerCase() !== 'requested' || request.userId === user?.id}
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
                          </span>
                        </Tooltip>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>

            <Box sx={{ mt: 3 }}>
              <TablePagination
                rowsPerPageOptions={[5, 10, 25]}
                component="div"
                count={loanRequests.length}
                rowsPerPage={rowsPerPage}
                page={page}
                onPageChange={handleChangePage}
                onRowsPerPageChange={handleChangeRowsPerPage}
                sx={{
                  '& .MuiTablePagination-selectLabel, & .MuiTablePagination-displayedRows': {
                    fontWeight: 500,
                  }
                }}
              />
            </Box>
          </>
        )}
      </Paper>

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
              onChange={(e) => {
                console.log('Action changed to:', e.target.value);
                setAction(e.target.value);
                // Clear reason when switching to Accept
                if (e.target.value === 'Accepted') {
                  setReason('');
                }
                // Clear cheque number when switching to Reject
                if (e.target.value === 'Rejected') {
                  setChequeNumber('');
                }
              }}
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
          
          {/* Reason Text Area - Only show when Reject is selected */}
          {action === 'Rejected' && (
            <Box sx={{ mt: 3 }}>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                Debug: Action is "{action}"
              </Typography>
              <TextField
                fullWidth
                label="Reason for Rejection"
                placeholder="Please provide a reason for rejecting this loan request..."
                multiline
                rows={4}
                value={description}
                onChange={(e) => setReason(e.target.value)}
                required
                error={action === 'Rejected' && !description.trim()}
                helperText={action === 'Rejected' && !description.trim() ? 'Reason is required when rejecting a request' : ''}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                      borderColor: theme.palette.error.main,
                    },
                  },
                }}
              />
            </Box>
          )}

          {/* Cheque Number Text Field - Only show when Accept is selected */}
          {action === 'Accepted' && (
            <Box sx={{ mt: 3 }}>
              <TextField
                fullWidth
                label="Cheque Number"
                placeholder="Enter the cheque number..."
                value={chequeNumber}
                onChange={(e) => setChequeNumber(e.target.value)}
                required
                error={action === 'Accepted' && !chequeNumber.trim()}
                helperText={action === 'Accepted' && !chequeNumber.trim() ? 'Cheque number is required when accepting a request' : ''}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                      borderColor: theme.palette.success.main,
                    },
                  },
                }}
              />
            </Box>
          )}
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
            disabled={!action || saving || (action === 'Rejected' && !description.trim()) || (action === 'Accepted' && !chequeNumber.trim())}
            sx={{ borderRadius: 2 }}
          >
            {saving ? <CircularProgress size={20} /> : 'Save Decision'}
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default LoanRequests; 