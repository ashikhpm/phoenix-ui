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
import { Add, Edit, Delete, Person, AccountBalance, PersonAdd, AttachMoney, Schedule, TrendingUp, Payment, Assignment } from '@mui/icons-material';
import { apiService } from '../../services/api';
import { useAuth } from '../../contexts/AuthContext';
import AuthenticatedLayout from '../layout/AuthenticatedLayout';
import LoanRepayment from './LoanRepayment';
import LoanRequests from './LoanRequests';

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
  userName: string;
  date: string;
  dueDate: string;
  closedDate?: string;
  loanTypeId: number;
  loanTypeName: string;
  loanTerm: number; // in months
  interestRate: number;
  amount: number;
  interestAmount: number;
  interestReceived: number;
  status: string;
  daysSinceIssue: number;
  isOverdue: boolean;
  daysOverdue: number;
}

interface LoanType {
  id: number;
  loanTypeName: string;
  interestRate: number;
}

const emptyLoan: Partial<Loan> = {
  userId: 0,
  date: '',
  dueDate: '',
  closedDate: '',
  loanTypeId: 0,
  loanTypeName: '',
  loanTerm: 0,
  interestRate: 0,
  amount: 0,
  interestAmount: 0,
  status: '',
};

const LoanManager: React.FC = () => {
  const theme = useTheme();
  const { user } = useAuth();
  const isSecretary = user?.role === 'Secretary';
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
  const [loanTypes, setLoanTypes] = useState<LoanType[]>([]);

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

  // Fetch loan types for dropdown
  const fetchLoanTypes = async () => {
    try {
      const response = await apiService.get<LoanType[]>('/api/Loan/types');
      setLoanTypes(response);
    } catch (err) {
      console.error('Failed to fetch loan types:', err);
      // Set default loan types if API fails
      setLoanTypes([
        { id: 1, loanTypeName: 'Marriage Loan', interestRate: 1.5 },
        { id: 2, loanTypeName: 'Personal Loan', interestRate: 2.5 },
      ]);
    }
  };

  useEffect(() => {
    fetchLoans();
    fetchUsers();
    fetchLoanTypes();
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
        closedDate: null, // Always null for new loans
        loanTypeId: formData.loanTypeId || 0,
        loanTerm: formData.loanTerm || 0,
        amount: formData.amount,
        status: formData.status || 'Active'
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
              {isSecretary && (
                <Tab 
                  label={selectedLoan ? 'Edit Loan' : 'Add Loan'} 
                  icon={<PersonAdd />} 
                  iconPosition="start"
                />
              )}
              {isSecretary && (
                <Tab 
                  label="Loan Requests" 
                  icon={<Assignment />} 
                  iconPosition="start"
                />
              )}
            </Tabs>
          </Box>
          
          <Box role="tabpanel" hidden={activeTab !== 0}>
            {activeTab === 0 && (
              <LoanList 
                loans={loans}
                loading={loading}
                error={error}
                onEdit={isSecretary ? handleEdit : undefined}
                onDelete={isSecretary ? (id) => { setDeleteId(id); setDeleteDialogOpen(true); } : undefined}
                onRepayment={handleRepayment}
                refreshKey={refreshKey}
                isSecretary={isSecretary}
              />
            )}
          </Box>
          
          {isSecretary && (
            <Box role="tabpanel" hidden={activeTab !== 1}>
              {activeTab === 1 && (
                <LoanForm 
                  loan={selectedLoan}
                  users={users}
                  loanTypes={loanTypes}
                  onSaved={handleFormSaved}
                  onCancelEdit={handleCancelEdit}
                  saving={saving}
                  onSave={handleSave}
                />
              )}
            </Box>
          )}
          
          {isSecretary && (
            <Box role="tabpanel" hidden={activeTab !== 2}>
              {activeTab === 2 && (
                <LoanRequests />
              )}
            </Box>
          )}
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
  onEdit?: (loan: Loan) => void;
  onDelete?: (id: number) => void;
  onRepayment: (loan: Loan) => void;
  refreshKey: number;
  isSecretary?: boolean;
}

const LoanList: React.FC<LoanListProps> = ({ loans, loading, error, onEdit, onDelete, onRepayment, isSecretary = false }) => {
  const theme = useTheme();
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [confirmOpen, setConfirmOpen] = useState(false);

  const getDueDateColor = (loan: Loan) => {
    if (loan.isOverdue) {
      return 'error.main'; // Red for overdue
    } else if (loan.daysOverdue > 0) {
      return 'warning.main'; // Orange for approaching due date
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
    if (onDelete) {
      setDeleteId(id);
      setConfirmOpen(true);
    }
  };

  const handleDeleteConfirm = async () => {
    if (deleteId == null || !onDelete) return;
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
                overflow: 'auto',
                maxWidth: '100%',
              }}
            >
              <Table sx={{ 
                minWidth: 1200,
                '& th': { 
                  backgroundColor: theme.palette.primary.main,
                  color: 'white',
                  fontWeight: 600,
                  whiteSpace: 'nowrap',
                },
                '& td': {
                  whiteSpace: 'nowrap',
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
                     {isSecretary && (
                       <TableCell sx={{ py: 3 }}>
                         <Box sx={{ display: 'flex', alignItems: 'center' }}>
                           <Person sx={{ mr: 2, fontSize: 24 }} />
                           Member
                         </Box>
                       </TableCell>
                     )}
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
                         <Payment sx={{ mr: 2, fontSize: 24 }} />
                         Interest Received
                       </Box>
                     </TableCell>
                     <TableCell sx={{ py: 3 }}>
                       <Box sx={{ display: 'flex', alignItems: 'center' }}>
                         <Schedule sx={{ mr: 2, fontSize: 24 }} />
                         Days Since Issue
                       </Box>
                     </TableCell>
                     <TableCell sx={{ py: 3 }}>
                       <Box sx={{ display: 'flex', alignItems: 'center' }}>
                         <AccountBalance sx={{ mr: 2, fontSize: 24 }} />
                         Status
                       </Box>
                     </TableCell>
                     {isSecretary && (
                       <TableCell align="center" sx={{ py: 3, minWidth: 200 }}>Actions</TableCell>
                     )}
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
                       {isSecretary && (
                         <TableCell sx={{ py: 3 }}>
                           <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                             <Person fontSize="small" />
                             <Box>
                               <Typography variant="body1" fontWeight="600" sx={{ color: theme.palette.primary.main }}>
                                 {loan.userName}
                               </Typography>
                             </Box>
                           </Box>
                         </TableCell>
                       )}
                      <TableCell sx={{ py: 3 }}>
                        <Typography variant="body2">
                          {loan.date ? new Date(loan.date).toLocaleDateString() : ''}
                        </Typography>
                      </TableCell>
                      <TableCell sx={{ py: 3 }}>
                        <Typography 
                          sx={{ 
                            color: getDueDateColor(loan),
                            fontWeight: loan.isOverdue || loan.daysOverdue > 0 ? 600 : 400
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
                        <Typography variant="body2" fontWeight={600}>
                          ₹{loan.interestReceived.toLocaleString()}
                        </Typography>
                      </TableCell>
                      <TableCell sx={{ py: 3 }}>
                        <Typography variant="body2" color="text.secondary">
                          {loan.daysSinceIssue} days
                        </Typography>
                      </TableCell>
                      <TableCell sx={{ py: 3 }}>
                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
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
                          {loan.isOverdue && (
                            <Chip 
                              label={`${loan.daysOverdue} days overdue`}
                              color="error"
                              size="small"
                              variant="filled"
                            />
                          )}
                        </Box>
                      </TableCell>
                                             {isSecretary && (
                         <TableCell align="center" sx={{ py: 3, minWidth: 200 }}>
                           <Box sx={{ display: 'flex', gap: 1, justifyContent: 'center' }}>
                             {onEdit && (
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
                             )}
                             <IconButton 
                               color="success" 
                               onClick={() => onRepayment(loan)}
                               disabled={loan.status.toLowerCase() === 'closed'}
                               sx={{ 
                                 backgroundColor: loan.status.toLowerCase() === 'closed' 
                                   ? theme.palette.grey[300] 
                                   : theme.palette.success.light + '20',
                                 '&:hover': {
                                   backgroundColor: loan.status.toLowerCase() === 'closed'
                                     ? theme.palette.grey[300]
                                     : theme.palette.success.light + '40',
                                   transform: loan.status.toLowerCase() === 'closed' ? 'none' : 'scale(1.1)',
                                 },
                                 transition: 'all 0.2s ease-in-out',
                                 opacity: loan.status.toLowerCase() === 'closed' ? 0.5 : 1,
                               }}
                             >
                               <Payment />
                             </IconButton>
                             {onDelete && (
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
                             )}
                           </Box>
                         </TableCell>
                       )}
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
  loanTypes: LoanType[];
  onSaved: () => void;
  onCancelEdit: () => void;
  saving: boolean;
  onSave: (formData: Partial<Loan>) => void;
}

const LoanForm: React.FC<LoanFormProps> = ({ loan, users, loanTypes, onSaved, onCancelEdit, saving, onSave }) => {
  const [formData, setFormData] = useState<Partial<Loan>>(loan || emptyLoan);
  const [selectedLoanTypeId, setSelectedLoanTypeId] = useState<number | ''>('');
  const theme = useTheme();

  useEffect(() => {
    setFormData(loan || emptyLoan);
    // Reset loan type selection when loan changes
    setSelectedLoanTypeId('');
  }, [loan]);

  // Handle loan type selection
  const handleLoanTypeChange = (loanTypeId: number) => {
    setSelectedLoanTypeId(loanTypeId);
    const selectedType = loanTypes.find(lt => lt.id === loanTypeId);
    if (selectedType) {
      // Set default loan term based on loan type
      let defaultLoanTerm = 1; // Default 1 month
      if (selectedType.loanTypeName === 'Marriage Loan') {
        defaultLoanTerm = 6; // 6 months
      } else if (selectedType.loanTypeName === 'Personal Loan') {
        defaultLoanTerm = 3; // 3 months
      }
      
      // Calculate due date based on selected date and loan term
      const selectedDate = formData.date ? new Date(formData.date) : new Date();
      const dueDate = new Date(selectedDate);
      dueDate.setMonth(dueDate.getMonth() + defaultLoanTerm);
      
      setFormData({ 
        ...formData, 
        loanTerm: defaultLoanTerm,
        interestRate: selectedType.interestRate,
        dueDate: dueDate.toISOString().split('T')[0]
      });
    }
  };

  // Calculate expected interest amount
  const calculateInterestAmount = () => {
    if (!selectedLoanType || !formData.amount || !formData.loanTerm) return 0;
    
    const amount = parseFloat(formData.amount.toString()) || 0;
    const monthlyInterestRate = (selectedLoanType.interestRate || 0) / 100; // Convert percentage to decimal
    const loanTerm = formData.loanTerm || 0;
    
    // Calculate total interest (monthly interest rate * loan term * principal amount)
    const totalInterest = amount * monthlyInterestRate * loanTerm;
    
    return totalInterest;
  };

  const selectedLoanType = loanTypes.find(lt => lt.id === selectedLoanTypeId);
  const expectedInterestAmount = calculateInterestAmount();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      ...formData,
      loanTypeId: selectedLoanTypeId as number
    });
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

        <FormControl fullWidth required>
          <InputLabel>Loan Type</InputLabel>
          <Select
            value={selectedLoanTypeId}
            onChange={e => handleLoanTypeChange(Number(e.target.value))}
            label="Loan Type"
          >
            {loanTypes.map((loanType) => (
              <MenuItem key={loanType.id} value={loanType.id}>
                <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
                  <Typography variant="body1" fontWeight={600}>
                    {loanType.loanTypeName}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Interest Rate: {loanType.interestRate}%
                  </Typography>
                </Box>
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        <TextField
          label="Loan Term (Months)"
          type="number"
          value={formData.loanTerm || ''}
          onChange={e => {
            const loanTerm = Number(e.target.value);
            setFormData({ ...formData, loanTerm });
            
            // Recalculate due date if date is selected
            if (formData.date && loanTerm > 0) {
              const selectedDate = new Date(formData.date);
              const dueDate = new Date(selectedDate);
              dueDate.setMonth(dueDate.getMonth() + loanTerm);
              
              setFormData(prev => ({ 
                ...prev, 
                loanTerm,
                dueDate: dueDate.toISOString().split('T')[0]
              }));
            }
          }}
          fullWidth
          required
          inputProps={{ min: 1, max: 120 }}
          helperText="Enter the loan term in months"
        />

        <TextField
          label="Date"
          type="date"
          value={formData.date ? formData.date.slice(0, 10) : ''}
          onChange={e => {
            const newDate = e.target.value;
            setFormData({ ...formData, date: newDate });
            
            // Recalculate due date if loan term is set
            if (formData.loanTerm && newDate) {
              const selectedDate = new Date(newDate);
              const dueDate = new Date(selectedDate);
              dueDate.setMonth(dueDate.getMonth() + formData.loanTerm);
              
              setFormData(prev => ({ 
                ...prev, 
                date: newDate,
                dueDate: dueDate.toISOString().split('T')[0]
              }));
            }
          }}
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
          disabled={selectedLoanTypeId !== ''}
          helperText={selectedLoanTypeId !== '' ? "Auto-calculated based on loan type" : "Select a loan type to auto-calculate due date"}
        />



        <TextField
          label="Interest Rate (%)"
          type="number"
          value={formData.interestRate || ''}
          onChange={e => setFormData({ ...formData, interestRate: Number(e.target.value) })}
          fullWidth
          required
          InputProps={{ 
            readOnly: selectedLoanTypeId !== '',
            startAdornment: <span>%</span>
          }}
          helperText={selectedLoanTypeId !== '' ? "Auto-filled based on selected loan type" : "Enter interest rate or select a loan type above"}
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

        {/* Summary Section */}
        {selectedLoanType && formData.amount && formData.loanTerm && (
          <Box sx={{ 
            p: 2, 
            backgroundColor: theme.palette.grey[50], 
            borderRadius: 2,
            border: `1px solid ${theme.palette.divider}`
          }}>
            <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <AccountBalance color="primary" />
              Loan Summary
            </Typography>
            <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2 }}>
              <Box>
                <Typography variant="body2" color="text.secondary">Loan Type</Typography>
                <Typography variant="body1" fontWeight={600}>{selectedLoanType.loanTypeName}</Typography>
              </Box>
              <Box>
                <Typography variant="body2" color="text.secondary">Interest Rate</Typography>
                <Typography variant="body1" fontWeight={600}>{selectedLoanType.interestRate}% per month</Typography>
              </Box>
                             <Box>
                 <Typography variant="body2" color="text.secondary">Amount</Typography>
                 <Typography variant="body1" fontWeight={600} color="success.main">
                   ₹{(formData.amount || 0).toLocaleString()}
                 </Typography>
               </Box>
              <Box>
                <Typography variant="body2" color="text.secondary">Loan Term</Typography>
                <Typography variant="body1" fontWeight={600}>
                  {formData.loanTerm} months
                </Typography>
              </Box>
              <Box>
                <Typography variant="body2" color="text.secondary">Due Date</Typography>
                <Typography variant="body1" fontWeight={600}>
                  {formData.dueDate ? new Date(formData.dueDate).toLocaleDateString() : ''}
                </Typography>
              </Box>
              <Box>
                <Typography variant="body2" color="text.secondary">Expected Interest</Typography>
                <Typography variant="body1" fontWeight={600} color="warning.main">
                  ₹{expectedInterestAmount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </Typography>
              </Box>
                             <Box>
                 <Typography variant="body2" color="text.secondary">Total Repayment</Typography>
                 <Typography variant="body1" fontWeight={600} color="info.main">
                   ₹{((formData.amount || 0) + expectedInterestAmount).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                 </Typography>
               </Box>
            </Box>
          </Box>
        )}

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

