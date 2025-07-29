import React, { useEffect, useState } from 'react';
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
  TextField,
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
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Tabs,
  Tab,
  Container,
  Chip,
  useTheme,
  TablePagination,
  DialogContentText,
} from '@mui/material';
import { Add, Edit, Delete, Person, AccountBalance, PersonAdd, AttachMoney, Schedule, TrendingUp, Payment } from '@mui/icons-material';
import { apiService } from '../../services/api';
import AuthenticatedLayout from '../layout/AuthenticatedLayout';
import LoanRepayment from './LoanRepayment';

interface User {
  id: number;
  name: string;
  address: string;
  email: string;
  phone: string;
}

interface Loan {
  id: number;
  userId: number;
  user: User;
  date: string;
  dueDate: string;
  closedDate?: string;
  interestRate: number;
  amount: number;
  interestAmount: number;
  status: string;
}

const emptyLoan: Partial<Loan> = {
  userId: 0,
  date: '',
  dueDate: '',
  closedDate: '',
  interestRate: 0,
  amount: 0,
  interestAmount: 0,
  status: '',
};

const LoanManager: React.FC = () => {
  const [loans, setLoans] = useState<Loan[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState(0);
  const [selectedLoan, setSelectedLoan] = useState<Loan | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);
  const [saving, setSaving] = useState(false);
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [repaymentDialogOpen, setRepaymentDialogOpen] = useState(false);
  const [selectedLoanForRepayment, setSelectedLoanForRepayment] = useState<Loan | null>(null);
  const [users, setUsers] = useState<User[]>([]);

  // Fetch loans
  const fetchLoans = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await apiService.get<Loan[]>('/api/Loan');
      setLoans(response);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to fetch loans.');
    } finally {
      setLoading(false);
    }
  };

  // Fetch users for dropdown
  const fetchUsers = async () => {
    try {
      const response = await apiService.get<User[]>('/api/User');
      setUsers(response);
    } catch (err) {
      // ignore user fetch error for now
    }
  };

  useEffect(() => {
    fetchLoans();
    fetchUsers();
  }, []);

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setActiveTab(newValue);
  };

  const handleEdit = (loan: Loan) => {
    setSelectedLoan(loan);
    setActiveTab(1);
  };

  const handleFormSaved = () => {
    setSelectedLoan(null);
    setActiveTab(0);
    setRefreshKey((k) => k + 1);
  };

  const handleCancelEdit = () => {
    setSelectedLoan(null);
    setActiveTab(0);
  };

  const handleRepayment = (loan: Loan) => {
    setSelectedLoanForRepayment(loan);
    setRepaymentDialogOpen(true);
  };

  const handleRepaymentClose = () => {
    setRepaymentDialogOpen(false);
    setSelectedLoanForRepayment(null);
  };

  const handleRepaymentSaved = () => {
    fetchLoans();
    handleRepaymentClose();
  };

  // Handle save (create or update)
  const handleSave = async (formData: Partial<Loan>) => {
    setSaving(true);
    setError(null);
    try {
      const loanData = {
        userId: formData.userId,
        date: formData.date,
        dueDate: formData.dueDate,
        closedDate: formData.closedDate || null,
        interestRate: formData.interestRate,
        amount: formData.amount,
        status: formData.status
      };

      if (selectedLoan?.id) {
        await apiService.put(`/api/Loan/${selectedLoan.id}`, loanData);
      } else {
        await apiService.post('/api/Loan', loanData);
      }
      handleFormSaved();
      fetchLoans();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to save loan.');
    } finally {
      setSaving(false);
    }
  };

  // Handle delete
  const handleDelete = async () => {
    if (!deleteId) return;
    setSaving(true);
    setError(null);
    try {
      await apiService.delete(`/api/Loan/${deleteId}`);
      setDeleteDialogOpen(false);
      setDeleteId(null);
      fetchLoans();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to delete loan.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <AuthenticatedLayout>
      <Box sx={{ p: 3 }}>
        <Box sx={{ width: '100%' }}>
          <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
            <Tabs 
              value={activeTab} 
              onChange={handleTabChange} 
              aria-label="loan management tabs"
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
                label="Loan List" 
                icon={<AccountBalance />} 
                iconPosition="start"
              />
              <Tab 
                label={selectedLoan ? 'Edit Loan' : 'Add Loan'} 
                icon={<PersonAdd />} 
                iconPosition="start"
              />
            </Tabs>
          </Box>
          
          <Box role="tabpanel" hidden={activeTab !== 0}>
            {activeTab === 0 && (
              <LoanList 
                loans={loans}
                loading={loading}
                error={error}
                onEdit={handleEdit}
                onDelete={(id) => { setDeleteId(id); setDeleteDialogOpen(true); }}
                onRepayment={handleRepayment}
                refreshKey={refreshKey}
              />
            )}
          </Box>
          
          <Box role="tabpanel" hidden={activeTab !== 1}>
            {activeTab === 1 && (
              <LoanForm 
                loan={selectedLoan}
                users={users}
                onSaved={handleFormSaved}
                onCancelEdit={handleCancelEdit}
                saving={saving}
                onSave={handleSave}
              />
            )}
          </Box>
        </Box>

        {/* Delete Confirmation Dialog */}
        <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)}>
          <DialogTitle>Delete Loan</DialogTitle>
          <DialogContent>
            <Typography>Are you sure you want to delete this loan?</Typography>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setDeleteDialogOpen(false)} disabled={saving}>Cancel</Button>
            <Button onClick={handleDelete} color="error" variant="contained" disabled={saving}>
              {saving ? <CircularProgress size={20} /> : 'Delete'}
            </Button>
          </DialogActions>
        </Dialog>

        {/* Loan Repayment Dialog */}
        <LoanRepayment
          open={repaymentDialogOpen}
          onClose={handleRepaymentClose}
          loan={selectedLoanForRepayment}
          onSaved={handleRepaymentSaved}
        />
      </Box>
    </AuthenticatedLayout>
  );
};

// LoanList Component
interface LoanListProps {
  loans: Loan[];
  loading: boolean;
  error: string | null;
  onEdit: (loan: Loan) => void;
  onDelete: (id: number) => void;
  onRepayment: (loan: Loan) => void;
  refreshKey: number;
}

const LoanList: React.FC<LoanListProps> = ({ loans, loading, error, onEdit, onDelete, onRepayment }) => {
  const theme = useTheme();
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [confirmOpen, setConfirmOpen] = useState(false);

  const getDueDateColor = (dueDate: string) => {
    const today = new Date();
    const due = new Date(dueDate);
    const oneWeekFromNow = new Date();
    oneWeekFromNow.setDate(today.getDate() + 7);
    
    if (due < today) {
      return 'error.main'; // Red for overdue
    } else if (due <= oneWeekFromNow) {
      return 'success.main'; // Green for due within 1 week
    } else {
      return 'text.primary'; // Default color
    }
  };

  const handleChangePage = (event: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleDeleteClick = (id: number) => {
    setDeleteId(id);
    setConfirmOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (deleteId == null) return;
    try {
      onDelete(deleteId);
    } catch (err: any) {
      // Error handling is done in parent component
    } finally {
      setConfirmOpen(false);
      setDeleteId(null);
    }
  };

  const handleDeleteCancel = () => {
    setConfirmOpen(false);
    setDeleteId(null);
  };

  const paginatedLoans = loans.slice(
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
              Loan List
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Manage your organization's loans
            </Typography>
          </Box>
          <Chip 
            label={`${loans.length} loans`} 
            color="primary" 
            variant="outlined" 
            sx={{ ml: 'auto', fontWeight: 600 }}
          />
        </Box>

        {loans.length === 0 ? (
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
              No loans found
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Start by adding some loans using the form above.
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
                        Date
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
                        <Schedule sx={{ mr: 2, fontSize: 24 }} />
                        Closed Date
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
                        <TrendingUp sx={{ mr: 2, fontSize: 24 }} />
                        Interest Amount
                      </Box>
                    </TableCell>
                    <TableCell sx={{ py: 3 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <AccountBalance sx={{ mr: 2, fontSize: 24 }} />
                        Status
                      </Box>
                    </TableCell>
                    <TableCell align="center" sx={{ py: 3 }}>Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {paginatedLoans.map((loan) => (
                    <TableRow 
                      key={loan.id} 
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
                              {loan.user?.name}
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                              {loan.user?.email}
                            </Typography>
                          </Box>
                        </Box>
                      </TableCell>
                      <TableCell sx={{ py: 3 }}>
                        <Typography variant="body2">
                          {loan.date ? new Date(loan.date).toLocaleDateString() : ''}
                        </Typography>
                      </TableCell>
                      <TableCell sx={{ py: 3 }}>
                        <Typography 
                          sx={{ 
                            color: loan.dueDate ? getDueDateColor(loan.dueDate) : 'text.primary',
                            fontWeight: loan.dueDate && (new Date(loan.dueDate) < new Date() || new Date(loan.dueDate) <= new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)) ? 600 : 400
                          }}
                        >
                          {loan.dueDate ? new Date(loan.dueDate).toLocaleDateString() : ''}
                        </Typography>
                      </TableCell>
                      <TableCell sx={{ py: 3 }}>
                        <Typography variant="body2" color="text.secondary">
                          {loan.closedDate ? new Date(loan.closedDate).toLocaleDateString() : '-'}
                        </Typography>
                      </TableCell>
                      <TableCell sx={{ py: 3 }}>
                        <Typography variant="body2">
                          {loan.interestRate}%
                        </Typography>
                      </TableCell>
                      <TableCell sx={{ py: 3 }}>
                        <Typography variant="body2" fontWeight={600}>
                          ₹{loan.amount.toLocaleString()}
                        </Typography>
                      </TableCell>
                      <TableCell sx={{ py: 3 }}>
                        <Typography variant="body2" fontWeight={600}>
                          ₹{loan.interestAmount.toLocaleString()}
                        </Typography>
                      </TableCell>
                      <TableCell sx={{ py: 3 }}>
                        <Chip 
                          label={loan.status}
                          color={
                            loan.status === 'Ongoing' ? 'info' : 
                            loan.status === 'Due date exceeded' ? 'error' : 
                            'success'
                          }
                          size="small"
                          variant="outlined"
                        />
                      </TableCell>
                      <TableCell align="center" sx={{ py: 3 }}>
                        <Box sx={{ display: 'flex', gap: 1, justifyContent: 'center' }}>
                          <IconButton 
                            color="primary" 
                            onClick={() => onEdit(loan)}
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
                          <IconButton 
                            color="success" 
                            onClick={() => onRepayment(loan)}
                            sx={{ 
                              backgroundColor: theme.palette.success.light + '20',
                              '&:hover': {
                                backgroundColor: theme.palette.success.light + '40',
                                transform: 'scale(1.1)',
                              },
                              transition: 'all 0.2s ease-in-out',
                            }}
                          >
                            <Payment />
                          </IconButton>
                          <IconButton 
                            color="error" 
                            onClick={() => handleDeleteClick(loan.id)}
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
                count={loans.length}
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
          Delete Loan
        </DialogTitle>
        <DialogContent sx={{ pt: 3 }}>
          <DialogContentText sx={{ fontSize: '1.1rem' }}>
            Are you sure you want to delete this loan? This action cannot be undone.
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
    </Container>
  );
};

// LoanForm Component
interface LoanFormProps {
  loan: Loan | null;
  users: User[];
  onSaved: () => void;
  onCancelEdit: () => void;
  saving: boolean;
  onSave: (formData: Partial<Loan>) => void;
}

const LoanForm: React.FC<LoanFormProps> = ({ loan, users, onSaved, onCancelEdit, saving, onSave }) => {
  const [formData, setFormData] = useState<Partial<Loan>>(loan || emptyLoan);

  useEffect(() => {
    setFormData(loan || emptyLoan);
  }, [loan]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <Box component="form" onSubmit={handleSubmit} sx={{ maxWidth: 600, mx: 'auto' }}>
      <Typography variant="h5" gutterBottom>
        {loan ? 'Edit Loan' : 'Add New Loan'}
      </Typography>
      
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3, mt: 3 }}>
        <FormControl fullWidth required>
          <InputLabel>Member</InputLabel>
          <Select
            value={formData.userId || ''}
            onChange={e => setFormData({ ...formData, userId: Number(e.target.value) })}
            label="User"
          >
            {users.map((user) => (
              <MenuItem key={user.id} value={user.id}>
                {user.name}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        <TextField
          label="Date"
          type="date"
          value={formData.date ? formData.date.slice(0, 10) : ''}
          onChange={e => setFormData({ ...formData, date: e.target.value })}
          fullWidth
          InputLabelProps={{ shrink: true }}
          required
        />

        <TextField
          label="Due Date"
          type="date"
          value={formData.dueDate ? formData.dueDate.slice(0, 10) : ''}
          onChange={e => setFormData({ ...formData, dueDate: e.target.value })}
          fullWidth
          InputLabelProps={{ shrink: true }}
          required
        />

        <TextField
          label="Closed Date"
          type="date"
          value={formData.closedDate ? formData.closedDate.slice(0, 10) : ''}
          onChange={e => setFormData({ ...formData, closedDate: e.target.value })}
          fullWidth
          InputLabelProps={{ shrink: true }}
          helperText="Leave empty if loan is not closed yet"
        />

        <TextField
          label="Interest Rate (%)"
          type="number"
          value={formData.interestRate || ''}
          onChange={e => setFormData({ ...formData, interestRate: Number(e.target.value) })}
          fullWidth
          required
        />

        <TextField
          label="Amount"
          type="number"
          value={formData.amount || ''}
          onChange={e => setFormData({ ...formData, amount: Number(e.target.value) })}
          fullWidth
          required
          InputProps={{ startAdornment: <span>₹</span> }}
        />

        <FormControl fullWidth required>
          <InputLabel>Status</InputLabel>
          <Select
            value={formData.status || ''}
            onChange={e => setFormData({ ...formData, status: e.target.value })}
            label="Status"
          >
            <MenuItem value="Ongoing">Ongoing</MenuItem>
            <MenuItem value="Due date exceeded">Due date exceeded</MenuItem>
            <MenuItem value="Closed">Closed</MenuItem>
          </Select>
        </FormControl>

        <Box sx={{ display: 'flex', gap: 2, mt: 2 }}>
          <Button 
            type="button" 
            variant="outlined" 
            onClick={onCancelEdit}
            disabled={saving}
          >
            Cancel
          </Button>
          <Button 
            type="submit" 
            variant="contained" 
            disabled={saving}
          >
            {saving ? <CircularProgress size={20} /> : 'Save'}
          </Button>
        </Box>
      </Box>
    </Box>
  );
};

export default LoanManager;

