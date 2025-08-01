import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Box,
  Typography,
  CircularProgress,
  Alert,
  FormControl,
  InputLabel,
  Select,
  MenuItem
} from '@mui/material';
import { AttachMoney, TrendingUp, Schedule } from '@mui/icons-material';
import { apiService } from '../../services/api';

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
  interestRate: number;
  amount: number;
  interestAmount: number;
  interestReceived: number;
  status: string;
  daysSinceIssue: number;
  isOverdue: boolean;
  daysOverdue: number;
}

interface LoanRepaymentProps {
  open: boolean;
  onClose: () => void;
  loan: Loan | null;
  onSaved: () => void;
}

interface RepaymentFormData {
  closedDate: string;
  amount: number;
  interestAmount: number;
}

const LoanRepayment: React.FC<LoanRepaymentProps> = ({ open, onClose, loan, onSaved }) => {
  const [formData, setFormData] = useState<RepaymentFormData>({
    closedDate: '',
    amount: 0,
    interestAmount: 0
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (loan) {
      // Set today's date as default if no closed date exists
      const today = new Date().toISOString().split('T')[0];
      setFormData({
        closedDate: loan.closedDate || today,
        amount: loan.amount,
        interestAmount: loan.interestAmount
      });
    }
  }, [loan]);

  const handleAmountChange = (value: string) => {
    const amount = Number(value) || 0;
    setFormData(prev => ({ ...prev, amount }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!loan) return;

    setSaving(true);
    setError(null);
    try {
      const repaymentData = {
        loanId: loan.id,
        userId: loan.userId,
        loanAmount: formData.amount,
        interestAmount: formData.interestAmount,
        closedDate: formData.closedDate
      };

      await apiService.post('/api/Loan/Repayment', repaymentData);
      onSaved();
      onClose();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to update loan repayment.');
    } finally {
      setSaving(false);
    }
  };

  if (!loan) return null;

  return (
    <Dialog 
      open={open} 
      onClose={onClose}
      maxWidth="sm"
      fullWidth
    >
      <DialogTitle>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <AttachMoney sx={{ color: 'primary.main' }} />
          <Typography variant="h6">
            Loan Repayment - {loan.userName}
          </Typography>
        </Box>
      </DialogTitle>

      <DialogContent>
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        <Box component="form" onSubmit={handleSubmit} sx={{ mt: 2 }}>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
            
            {/* Loan Information Summary */}
            <Box sx={{ 
              p: 2, 
              bgcolor: 'grey.50', 
              borderRadius: 1,
              border: '1px solid',
              borderColor: 'divider'
            }}>
              <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                Original Loan Details
              </Typography>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                <Typography variant="body2">Original Amount:</Typography>
                <Typography variant="body2" fontWeight="600">₹{loan.amount.toLocaleString()}</Typography>
              </Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                <Typography variant="body2">Interest Rate:</Typography>
                <Typography variant="body2" fontWeight="600">{loan.interestRate}%</Typography>
              </Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                <Typography variant="body2">Due Date:</Typography>
                <Typography variant="body2" fontWeight="600">
                  {loan.dueDate ? new Date(loan.dueDate).toLocaleDateString() : '-'}
                </Typography>
              </Box>
            </Box>

            {/* Closed Date */}
            <TextField
              label="Closed Date"
              type="date"
              value={formData.closedDate}
              onChange={e => setFormData({ ...formData, closedDate: e.target.value })}
              fullWidth
              InputLabelProps={{ shrink: true }}
              required
              helperText="Date when the loan was closed"
            />

            {/* Repayment Amount */}
            <TextField
              label="Repayment Amount"
              type="number"
              value={formData.amount}
              onChange={e => handleAmountChange(e.target.value)}
              fullWidth
              required
              InputProps={{ 
                startAdornment: <span>₹</span>,
                inputProps: { min: 0 }
              }}
              helperText="Enter the final repayment amount"
            />

            {/* Interest Amount */}
            <TextField
              label="Interest Amount"
              type="number"
              value={formData.interestAmount}
              onChange={e => setFormData({ ...formData, interestAmount: Number(e.target.value) })}
              fullWidth
              required
              InputProps={{ 
                startAdornment: <span>₹</span>,
                inputProps: { min: 0 }
              }}
              helperText={`Loan interest amount: ₹${loan.interestAmount.toLocaleString()}`}
            />

            {/* Total Amount */}
            <Box sx={{ 
              p: 2, 
              bgcolor: 'primary.50', 
              borderRadius: 1,
              border: '1px solid',
              borderColor: 'primary.200'
            }}>
              <Typography variant="subtitle2" color="primary.main" gutterBottom>
                Total Amount
              </Typography>
              <Typography variant="h6" color="primary.main" fontWeight="600">
                ₹{(formData.amount + formData.interestAmount).toLocaleString()}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Repayment: ₹{formData.amount.toLocaleString()} + Interest: ₹{formData.interestAmount.toLocaleString()}
              </Typography>
            </Box>

          </Box>
        </Box>
      </DialogContent>

      <DialogActions sx={{ p: 3, pt: 1 }}>
        <Button 
          onClick={onClose}
          disabled={saving}
        >
          Cancel
        </Button>
        <Button 
          onClick={handleSubmit}
          variant="contained"
          disabled={saving || !formData.closedDate || formData.amount <= 0}
          startIcon={saving ? <CircularProgress size={20} /> : <AttachMoney />}
        >
          {saving ? 'Saving...' : 'Save Repayment'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default LoanRepayment; 