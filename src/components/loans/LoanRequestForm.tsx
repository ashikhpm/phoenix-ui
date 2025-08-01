import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  TextField,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  CircularProgress,
  Alert,
} from '@mui/material';
import { AccountBalance, Calculate } from '@mui/icons-material';
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
    loanTerm: '',
    dueDate: '',
  });
  const [loanTypes, setLoanTypes] = useState<LoanType[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedLoanTypeId, setSelectedLoanTypeId] = useState<number | ''>('');

  // Fetch loan types
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
    if (open) {
      fetchLoanTypes();
    }
  }, [open]);

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
      
      // Calculate due date based on loan term
      const today = new Date();
      const dueDate = new Date(today);
      dueDate.setMonth(dueDate.getMonth() + defaultLoanTerm);
      
      setFormData({
        ...formData,
        loanTypeId: loanTypeId.toString(),
        loanTerm: defaultLoanTerm.toString(),
        dueDate: dueDate.toISOString().split('T')[0]
      });
    }
  };

  // Calculate expected interest amount
  const calculateInterestAmount = () => {
    if (!selectedLoanType || !formData.amount || !formData.loanTerm) return 0;
    
    const amount = parseFloat(formData.amount) || 0;
    const monthlyInterestRate = (selectedLoanType.interestRate || 0) / 100; // Convert percentage to decimal
    const loanTerm = parseInt(formData.loanTerm) || 0;
    
    // Calculate total interest (monthly interest rate * loan term * principal amount)
    const totalInterest = amount * monthlyInterestRate * loanTerm;
    
    return totalInterest;
  };

  const selectedLoanType = loanTypes.find(lt => lt.id === selectedLoanTypeId);
  const expectedInterestAmount = calculateInterestAmount();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);

    try {
      await apiService.post('/api/dashboard/loan-requests', {
        amount: parseFloat(formData.amount),
        loanTypeId: parseInt(formData.loanTypeId),
        loanTerm: parseInt(formData.loanTerm),
        dueDate: formData.dueDate,
      });

      // Reset form
      setFormData({
        amount: '',
        loanTypeId: '',
        loanTerm: '',
        dueDate: '',
      });
      setSelectedLoanTypeId('');
      
      onSuccess();
      onClose();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to create loan request.');
    } finally {
      setSaving(false);
    }
  };

  const handleClose = () => {
    setFormData({
      amount: '',
      loanTypeId: '',
      loanTerm: '',
      dueDate: '',
    });
    setSelectedLoanTypeId('');
    setError(null);
    onClose();
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <DialogTitle>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <AccountBalance color="primary" />
          Request New Loan
        </Box>
      </DialogTitle>
      
      <DialogContent>
        <Box component="form" onSubmit={handleSubmit} sx={{ mt: 2 }}>
          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}

          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
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
              value={formData.loanTerm}
              onChange={e => {
                const loanTerm = e.target.value;
                setFormData({ ...formData, loanTerm });
                
                // Recalculate due date if loan term is set
                if (loanTerm && !isNaN(parseInt(loanTerm))) {
                  const today = new Date();
                  const dueDate = new Date(today);
                  dueDate.setMonth(dueDate.getMonth() + parseInt(loanTerm));
                  
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
              label="Amount"
              type="number"
              value={formData.amount}
              onChange={e => setFormData({ ...formData, amount: e.target.value })}
              fullWidth
              required
              InputProps={{ startAdornment: <span>₹</span> }}
            />

            <TextField
              label="Due Date"
              type="date"
              value={formData.dueDate}
              onChange={e => setFormData({ ...formData, dueDate: e.target.value })}
              fullWidth
              required
              InputLabelProps={{ shrink: true }}
              disabled={selectedLoanTypeId !== ''}
              helperText={selectedLoanTypeId !== '' ? "Auto-calculated based on loan term" : "Select a loan type to auto-calculate due date"}
            />

            {/* Summary Section */}
            {selectedLoanType && formData.amount && formData.loanTerm && (
              <Box sx={{ 
                p: 2, 
                backgroundColor: 'grey.50', 
                borderRadius: 2,
                border: '1px solid',
                borderColor: 'divider'
              }}>
                <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Calculate color="primary" />
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
                       ₹{(parseFloat(formData.amount) || 0).toLocaleString()}
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
                       ₹{((parseFloat(formData.amount) || 0) + expectedInterestAmount).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                     </Typography>
                   </Box>
                </Box>
              </Box>
            )}
          </Box>
        </Box>
      </DialogContent>
      
      <DialogActions>
        <Button onClick={handleClose} disabled={saving}>
          Cancel
        </Button>
        <Button 
          onClick={handleSubmit} 
          variant="contained" 
          disabled={saving || !formData.amount || !formData.loanTypeId || !formData.loanTerm || !formData.dueDate}
        >
          {saving ? <CircularProgress size={20} /> : 'Submit Request'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default LoanRequestForm; 