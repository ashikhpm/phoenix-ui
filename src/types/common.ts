// Common interfaces used across the application

export interface User {
  id: number;
  name: string;
  email: string;
  address: string;
  phone: string;
  isActive: boolean;
  inactiveDate: string | null;
  joiningDate: string | null;
  userRoleId: number;
  userRole: {
    id: number;
    name: string;
    description: string;
    users: any[];
  };
  attendances: any[];
  meetingPayments: any[];
}

export interface Loan {
  id: number;
  userId: number;
  userName: string;
  date: string;
  dueDate: string;
  closedDate?: string;
  loanTypeId: number;
  loanTypeName: string;
  interestRate: number;
  amount: number;
  interestAmount: number;
  interestReceived: number;
  status: string;
  daysSinceIssue: number;
  isOverdue: boolean;
  daysOverdue: number;
}

export interface LoanType {
  id: number;
  loanTypeName: string;
  interestRate: number;
}

export interface LoanRequest {
  id: number;
  userId: number;
  userName: string;
  date: string;
  dueDate: string;
  interestRate: number;
  amount: number;
  status: string;
  reason?: string;
}

export interface Meeting {
  id: number;
  date: string;
  time: string;
  description?: string;
  location?: string;
  totalMainPayment: number;
  totalWeeklyPayment: number;
  presentAttendanceCount: number;
  totalAttendanceCount: number;
  attendancePercentage: number;
  attendedUsersCount: number;
}

export interface OverdueLoan {
  id: number;
  userId: number;
  userName: string;
  date: string;
  dueDate: string;
  interestRate: number;
  amount: number;
  interestAmount: number;
  status: string;
  daysOverdue: number;
  daysUntilDue: number | null;
}

export interface LoansDueResponse {
  overdueLoans: OverdueLoan[];
  dueTodayLoans: OverdueLoan[];
  dueThisWeekLoans: OverdueLoan[];
  totalOverdueCount: number;
  totalDueTodayCount: number;
  totalDueThisWeekCount: number;
  totalOverdueAmount: number;
  totalDueTodayAmount: number;
  totalDueThisWeekAmount: number;
}

export interface DashboardSummary {
  totalLoans: number;
  totalAmount: number;
  totalInterest: number;
  totalOverdueLoans: number;
  totalOverdueAmount: number;
  recentLoans: Loan[];
  recentMeetings: Meeting[];
  loanTypeBreakdown: {
    loanTypeName: string;
    count: number;
    totalAmount: number;
  }[];
}

// API Response types
export interface ApiResponse<T> {
  data: T;
  message?: string;
  success: boolean;
}

export interface LoginResponse {
  token: string;
  user: User;
}

// Form data types
export interface RepaymentFormData {
  closedDate: string;
  amount: number;
  interestAmount: number;
}

export interface LoanFormData {
  userId: number;
  date: string;
  dueDate: string;
  closedDate: string | null;
  loanTypeId: number;
  amount: number;
  status: string;
}

export interface AttendanceSummary {
  meetingId: number;
  meeting: {
    id: number;
    date: string;
    time: string;
    description?: string;
    location?: string;
  };
  attendedUsers: {
    id: number;
    name: string;
    address: string;
    email: string;
    phone: string;
  }[];
  absentUsers: {
    id: number;
    name: string;
    address: string;
    email: string;
    phone: string;
  }[];
  totalUsers: number;
  attendedCount: number;
  absentCount: number;
  attendancePercentage: number;
}

export interface MeetingPaymentResponse {
  meetingId: number;
  users: {
    id: number;
    name: string;
    mainPayment: number;
    weeklyPayment: number;
  }[];
} 