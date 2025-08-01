// Common utility functions used across the application

/**
 * Format a date string to a localized date format
 */
export const formatDate = (dateString: string): string => {
  if (!dateString) return '';
  return new Date(dateString).toLocaleDateString();
};

/**
 * Format a time string to a localized time format
 */
export const formatTime = (timeString: string): string => {
  if (!timeString) return '';
  return new Date(`2000-01-01T${timeString}`).toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit'
  });
};

/**
 * Format a number as currency
 */
export const formatCurrency = (amount: number): string => {
  return `₹${amount.toLocaleString()}`;
};

/**
 * Calculate the difference in months between two dates
 */
export const calculateMonthsDifference = (startDate: Date, endDate: Date): number => {
  return (endDate.getFullYear() - startDate.getFullYear()) * 12 + 
         (endDate.getMonth() - startDate.getMonth());
};

/**
 * Calculate interest amount based on principal, rate, and time
 */
export const calculateInterestAmount = (
  principal: number, 
  monthlyRate: number, 
  months: number
): number => {
  return principal * (monthlyRate / 100) * months;
};

/**
 * Get status color for chips
 */
export const getStatusColor = (status: string): 'success' | 'error' | 'warning' | 'default' => {
  const statusLower = status.toLowerCase();
  if (statusLower === 'accepted' || statusLower === 'ongoing') return 'success';
  if (statusLower === 'rejected' || statusLower === 'overdue') return 'error';
  if (statusLower === 'requested' || statusLower === 'pending') return 'warning';
  return 'default';
};

/**
 * Check if user has Secretary role
 */
export const isSecretary = (role?: string): boolean => {
  return role === 'Secretary';
};

/**
 * Check if user has Member role
 */
export const isMember = (role?: string): boolean => {
  return role === 'Member';
};

/**
 * Get today's date in YYYY-MM-DD format
 */
export const getTodayDate = (): string => {
  return new Date().toISOString().split('T')[0];
};

/**
 * Calculate due date based on loan type and start date
 */
export const calculateDueDate = (startDate: string, loanTypeName: string): string => {
  const start = new Date(startDate);
  const dueDate = new Date(start);
  
  switch (loanTypeName) {
    case 'Marriage Loan':
      dueDate.setMonth(dueDate.getMonth() + 6);
      break;
    case 'Personal Loan':
      dueDate.setMonth(dueDate.getMonth() + 3);
      break;
    default:
      dueDate.setMonth(dueDate.getMonth() + 1);
  }
  
  return dueDate.toISOString().split('T')[0];
}; 