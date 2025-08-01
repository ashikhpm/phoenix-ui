import { useState, useCallback } from 'react';
import { apiService } from '../services/api';
import { Loan, LoanType } from '../types/common';
import { API_ENDPOINTS } from '../constants';
import { calculateDueDate } from '../utils/helpers';

interface UseLoansState {
  loans: Loan[];
  loanTypes: LoanType[];
  loading: boolean;
  error: string | null;
}

interface UseLoansReturn extends UseLoansState {
  fetchLoans: () => Promise<void>;
  fetchLoanTypes: () => Promise<void>;
  createLoan: (loanData: Partial<Loan>) => Promise<boolean>;
  updateLoan: (id: number, loanData: Partial<Loan>) => Promise<boolean>;
  deleteLoan: (id: number) => Promise<boolean>;
  calculateLoanDueDate: (startDate: string, loanTypeName: string) => string;
}

export const useLoans = (): UseLoansReturn => {
  const [state, setState] = useState<UseLoansState>({
    loans: [],
    loanTypes: [],
    loading: false,
    error: null,
  });

  const fetchLoans = useCallback(async () => {
    setState(prev => ({ ...prev, loading: true, error: null }));
    try {
      const loans = await apiService.get<Loan[]>(API_ENDPOINTS.LOANS.BASE);
      setState(prev => ({ ...prev, loans, loading: false }));
    } catch (err: any) {
      setState(prev => ({ 
        ...prev, 
        loading: false, 
        error: err.response?.data?.message || 'Failed to fetch loans' 
      }));
    }
  }, []);

  const fetchLoanTypes = useCallback(async () => {
    try {
      const loanTypes = await apiService.get<LoanType[]>(API_ENDPOINTS.LOANS.TYPES);
      setState(prev => ({ ...prev, loanTypes }));
    } catch (err: any) {
      // Fallback to default loan types if API fails
      setState(prev => ({
        ...prev,
        loanTypes: [
          { id: 1, loanTypeName: 'Marriage Loan', interestRate: 1.5 },
          { id: 2, loanTypeName: 'Personal Loan', interestRate: 2.5 },
        ]
      }));
    }
  }, []);

  const createLoan = useCallback(async (loanData: Partial<Loan>): Promise<boolean> => {
    setState(prev => ({ ...prev, loading: true, error: null }));
    try {
      // Transform loan data to match new API format
      const apiData = {
        userId: loanData.userId,
        date: loanData.date,
        dueDate: loanData.dueDate,
        closedDate: null,
        loanTypeId: loanData.loanTypeId,
        amount: loanData.amount,
        status: loanData.status || 'active'
      };
      
      await apiService.post(API_ENDPOINTS.LOANS.BASE, apiData);
      await fetchLoans(); // Refresh the list
      setState(prev => ({ ...prev, loading: false }));
      return true;
    } catch (err: any) {
      setState(prev => ({ 
        ...prev, 
        loading: false, 
        error: err.response?.data?.message || 'Failed to create loan' 
      }));
      return false;
    }
  }, [fetchLoans]);

  const updateLoan = useCallback(async (id: number, loanData: Partial<Loan>): Promise<boolean> => {
    setState(prev => ({ ...prev, loading: true, error: null }));
    try {
      await apiService.put(`${API_ENDPOINTS.LOANS.BASE}/${id}`, loanData);
      await fetchLoans(); // Refresh the list
      setState(prev => ({ ...prev, loading: false }));
      return true;
    } catch (err: any) {
      setState(prev => ({ 
        ...prev, 
        loading: false, 
        error: err.response?.data?.message || 'Failed to update loan' 
      }));
      return false;
    }
  }, [fetchLoans]);

  const deleteLoan = useCallback(async (id: number): Promise<boolean> => {
    setState(prev => ({ ...prev, loading: true, error: null }));
    try {
      await apiService.delete(`${API_ENDPOINTS.LOANS.BASE}/${id}`);
      await fetchLoans(); // Refresh the list
      setState(prev => ({ ...prev, loading: false }));
      return true;
    } catch (err: any) {
      setState(prev => ({ 
        ...prev, 
        loading: false, 
        error: err.response?.data?.message || 'Failed to delete loan' 
      }));
      return false;
    }
  }, [fetchLoans]);

  const calculateLoanDueDate = useCallback((startDate: string, loanTypeName: string): string => {
    return calculateDueDate(startDate, loanTypeName);
  }, []);

  return {
    ...state,
    fetchLoans,
    fetchLoanTypes,
    createLoan,
    updateLoan,
    deleteLoan,
    calculateLoanDueDate,
  };
}; 