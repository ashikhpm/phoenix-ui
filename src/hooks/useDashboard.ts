import { useState, useCallback } from 'react';
import { apiService } from '../services/api';
import { Meeting, OverdueLoan, LoanRequest, LoansDueResponse } from '../types/common';
import { API_ENDPOINTS } from '../constants';

interface UseDashboardState {
  meetings: Meeting[];
  overdueLoans: OverdueLoan[];
  upcomingLoans: OverdueLoan[];
  loanRequests: LoanRequest[];
  loading: boolean;
  error: string | null;
}

interface UseDashboardReturn extends UseDashboardState {
  fetchMeetings: () => Promise<void>;
  fetchOverdueLoans: () => Promise<void>;
  fetchLoanRequests: () => Promise<void>;
  handleLoanRequestAction: (requestId: number, action: string) => Promise<boolean>;
}

export const useDashboard = (): UseDashboardReturn => {
  const [state, setState] = useState<UseDashboardState>({
    meetings: [],
    overdueLoans: [],
    upcomingLoans: [],
    loanRequests: [],
    loading: false,
    error: null,
  });

  const fetchMeetings = useCallback(async () => {
    try {
      const meetings = await apiService.get<Meeting[]>(API_ENDPOINTS.MEETINGS);
      setState(prev => ({ ...prev, meetings }));
    } catch (err: any) {
      console.error('Failed to fetch meetings:', err);
      // Don't set error state for meetings as it's not critical
    }
  }, []);

  const fetchOverdueLoans = useCallback(async () => {
    try {
      const response = await apiService.get<LoansDueResponse>(API_ENDPOINTS.DASHBOARD.OVERDUE_LOANS);
      setState(prev => ({ 
        ...prev, 
        overdueLoans: response.overdueLoans,
        upcomingLoans: [...response.dueTodayLoans, ...response.dueThisWeekLoans] 
      }));
    } catch (err: any) {
      console.error('Failed to fetch overdue loans:', err);
      // Don't set error state for overdue loans as it's not critical
    }
  }, []);

  const fetchLoanRequests = useCallback(async () => {
    try {
      const loanRequests = await apiService.get<LoanRequest[]>(API_ENDPOINTS.DASHBOARD.LOAN_REQUESTS);
      setState(prev => ({ ...prev, loanRequests }));
    } catch (err: any) {
      console.error('Failed to fetch loan requests:', err);
      // Don't set error state for loan requests as it's not critical
    }
  }, []);

  const handleLoanRequestAction = useCallback(async (requestId: number, action: string): Promise<boolean> => {
    setState(prev => ({ ...prev, loading: true, error: null }));
    try {
      await apiService.post(API_ENDPOINTS.LOAN_REQUESTS.ACTION(requestId), { action });
      await fetchLoanRequests(); // Refresh the list
      setState(prev => ({ ...prev, loading: false }));
      return true;
    } catch (err: any) {
      setState(prev => ({ 
        ...prev, 
        loading: false, 
        error: err.response?.data?.message || 'Failed to process loan request' 
      }));
      return false;
    }
  }, [fetchLoanRequests]);

  return {
    ...state,
    fetchMeetings,
    fetchOverdueLoans,
    fetchLoanRequests,
    handleLoanRequestAction,
  };
}; 