// Application constants

export const APP_NAME = 'Phoenix Sangam';

export const API_ENDPOINTS = {
  AUTH: {
    LOGIN: '/api/user/login',
    LOGOUT: '/api/auth/logout',
    ME: '/api/User/me',
  },
  USERS: '/api/User',
  LOANS: {
    BASE: '/api/Loan',
    TYPES: '/api/Loan/types',
    REPAYMENT: '/api/Loan/Repayment',
  },
  LOAN_REQUESTS: {
    BASE: '/api/dashboard/loan-requests',
    ACTION: (id: number) => `/api/Dashboard/loan-requests/${id}/action`,
  },
  MEETINGS: '/api/meetings',
  DASHBOARD: {
    OVERDUE_LOANS: '/api/dashboard/loans-due',
    LOAN_REQUESTS: '/api/dashboard/loan-requests',
    SUMMARY: '/api/dashboard/summary',
  },
} as const;

export const LOAN_TYPES = {
  MARRIAGE: 'Marriage Loan',
  PERSONAL: 'Personal Loan',
} as const;

export const LOAN_DURATIONS = {
  [LOAN_TYPES.MARRIAGE]: 6, // months
  [LOAN_TYPES.PERSONAL]: 3, // months
  DEFAULT: 1, // month
} as const;

export const STATUS_COLORS = {
  SUCCESS: ['accepted', 'ongoing'],
  ERROR: ['rejected', 'overdue'],
  WARNING: ['requested', 'pending'],
} as const;

export const PAGINATION = {
  DEFAULT_PAGE_SIZE: 10,
  PAGE_SIZE_OPTIONS: [5, 10, 25],
} as const;

export const DATE_FORMATS = {
  API: 'YYYY-MM-DD',
  DISPLAY: 'DD/MM/YYYY',
  DATETIME: 'YYYY-MM-DDTHH:mm',
} as const;

export const CURRENCY = {
  SYMBOL: '₹',
  LOCALE: 'en-IN',
} as const; 