import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  TextField,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  CircularProgress,
  Alert,
  useTheme,
} from '@mui/material';
import { AccountBalance, AttachMoney, Schedule } from '@mui/icons-material';
import { apiService } from '../../services/api';

interface LoanType {
  id: number;
  loanTypeName: string;
  interestRate: number;
}

interface LoanRequestFormProps {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

const LoanRequestForm: React.FC<LoanRequestFormProps> = ({ open, onClose, onSuccess }) => {
  const [formData, setFormData] = useState({
    amount: '',
    loanTypeId: '',
    dueDate: '',
  });
  const [loanTypes, setLoanTypes] = useState<LoanType[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const theme = useTheme();

  // Fetch loan types
  const fetchLoanTypes = async () => {
    try {
      setLoading(true);
      const response = await apiService.get<LoanType[]>('/api/Loan/types');
      setLoanTypes(response);
    } catch (err: any) {
      console.error('Failed to fetch loan types:', err);
      // If loan types endpoint doesn't exist, create some default options
      setLoanTypes([
        { id: 1, loanTypeName: 'Marriage Loan', interestRate: 1.5 },
        { id: 2, loanTypeName: 'Personal Loan', interestRate: 2.5 },
      ]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (open) {
      fetchLoanTypes();
      // Set default due date to 30 days from now
      const defaultDueDate = new Date();
      defaultDueDate.setDate(defaultDueDate.getDate() + 30);
      setFormData({
        amount: '',
        loanTypeId: '',
        dueDate: defaultDueDate.toISOString().split('T')[0],
      });
      setError(null);
    }
  }, [open]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.amount || !formData.loanTypeId || !formData.dueDate) {
      setError('Please fill in all required fields.');
      return;
    }

    setSaving(true);
    setError(null);

    try {
      await apiService.post('/api/dashboard/loan-requests', {
        amount: parseFloat(formData.amount),
        loanTypeId: parseInt(formData.loanTypeId),
        dueDate: formData.dueDate,
      });

      onSuccess();
      onClose();
      setFormData({ amount: '', loanTypeId: '', dueDate: '' });
      // The onSuccess callback will handle refreshing the data
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to submit loan request.');
    } finally {
      setSaving(false);
    }
  };

  const handleClose = () => {
    if (!saving) {
      onClose();
      setFormData({ amount: '', loanTypeId: '', dueDate: '' });
      setError(null);
    }
  };

  const selectedLoanType = loanTypes.find(lt => lt.id === parseInt(formData.loanTypeId));

  // Calculate expected interest amount
  const calculateInterestAmount = () => {
    if (!selectedLoanType || !formData.amount || !formData.dueDate) return 0;
    
    const amount = parseFloat(formData.amount);
    const monthlyInterestRate = selectedLoanType.interestRate / 100; // Convert percentage to decimal
    const startDate = new Date();
    const dueDate = new Date(formData.dueDate);
    
    // Calculate months between start date and due date
    const monthsDiff = (dueDate.getFullYear() - startDate.getFullYear()) * 12 + 
                      (dueDate.getMonth() - startDate.getMonth());
    
    // Calculate total interest (monthly interest rate * number of months * principal amount)
    const totalInterest = amount * monthlyInterestRate * monthsDiff;
    
    return totalInterest;
  };

  const expectedInterestAmount = calculateInterestAmount();

  return (
    <Dialog 
      open={open} 
      onClose={handleClose}
      maxWidth="sm"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 3,
          maxHeight: '90vh',
          overflow: 'auto'
        }
      }}
      sx={{
        zIndex: 1300
      }}
    >
      <DialogTitle 
        sx={{ 
          backgroundColor: theme.palette.primary.main,
          color: 'white',
          fontWeight: 600,
          display: 'flex',
          alignItems: 'center',
          gap: 1,
        }}
      >
        <AccountBalance />
        New Loan Request
      </DialogTitle>
      
      <DialogContent sx={{ pt: 3 }}>
        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}

        <Box component="form" onSubmit={handleSubmit} sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
          {/* Loan Type Selection */}
          <FormControl fullWidth required sx={{ mt: 2 }}>
            <InputLabel>Loan Type</InputLabel>
            <Select
              value={formData.loanTypeId}
              onChange={(e) => {
                const loanTypeId = e.target.value;
                const selectedType = loanTypes.find(lt => lt.id === parseInt(loanTypeId));
                
                if (selectedType) {
                  // Calculate due date based on loan type
                  const today = new Date();
                  let dueDate = new Date();
                  
                  if (selectedType.loanTypeName === 'Marriage Loan') {
                    dueDate.setMonth(dueDate.getMonth() + 6); // 6 months
                  } else if (selectedType.loanTypeName === 'Personal Loan') {
                    dueDate.setMonth(dueDate.getMonth() + 3); // 3 months
                  } else {
                    dueDate.setMonth(dueDate.getMonth() + 1); // Default 1 month
                  }
                  
                  setFormData({ 
                    ...formData, 
                    loanTypeId: loanTypeId,
                    dueDate: dueDate.toISOString().split('T')[0]
                  });
                } else {
                  setFormData({ ...formData, loanTypeId: loanTypeId });
                }
              }}
              label="Loan Type"
              disabled={loading}
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

          {/* Amount */}
          <TextField
            label="Loan Amount"
            type="number"
            value={formData.amount}
            onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
            fullWidth
            required
            InputProps={{ 
              startAdornment: <AttachMoney sx={{ color: 'text.secondary', mr: 1 }} />,
              inputProps: { min: 0, step: 0.01 }
            }}
            helperText="Enter the amount you wish to borrow"
          />

          {/* Due Date */}
          <TextField
            label="Due Date"
            type="date"
            value={formData.dueDate}
            onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
            fullWidth
            required
            disabled={formData.loanTypeId !== ''}
            InputLabelProps={{ shrink: true }}
            InputProps={{ 
              startAdornment: <Schedule sx={{ color: 'text.secondary', mr: 1 }} />
            }}
            helperText={formData.loanTypeId !== '' ? "Auto-calculated based on loan type" : "Select a loan type to auto-calculate due date"}
          />

          {/* Summary */}
          {selectedLoanType && formData.amount && (
            <Box sx={{ 
              p: 2, 
              backgroundColor: theme.palette.grey[50], 
              borderRadius: 2,
              border: `1px solid ${theme.palette.divider}`
            }}>
              <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <AccountBalance color="primary" />
                Request Summary
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
                    ₹{parseFloat(formData.amount).toLocaleString()}
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
                    ₹{(parseFloat(formData.amount) + expectedInterestAmount).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </Typography>
                </Box>
              </Box>
            </Box>
          )}
        </Box>
      </DialogContent>
      
      <DialogActions sx={{ p: 3 }}>
        <Button 
          onClick={handleClose} 
          variant="outlined"
          disabled={saving}
          sx={{ borderRadius: 2 }}
        >
          Cancel
        </Button>
        <Button 
          onClick={handleSubmit} 
          variant="contained"
          disabled={saving || !formData.amount || !formData.loanTypeId || !formData.dueDate}
          sx={{ borderRadius: 2 }}
        >
          {saving ? <CircularProgress size={20} /> : 'Submit Request'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default LoanRequestForm; 