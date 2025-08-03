import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  TextField,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  CircularProgress,
  Alert,
  Chip,
  useTheme,
  TablePagination,
  Container,
  Grid,
  IconButton,
  Tooltip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from '@mui/material';
import {
  Search,
  FilterList,
  Refresh,
  Visibility,
  AccountTree,
  Schedule,
  Person,
  Code,
  Wifi,
  CheckCircle,
  Error,
  Info,
} from '@mui/icons-material';
import { apiService } from '../../services/api';
import AuthenticatedLayout from '../layout/AuthenticatedLayout';

interface UserActivity {
  id: number;
  userId: number;
  userName: string;
  userRole: string;
  action: string;
  entityType: string;
  entityId: number | null;
  description: string;
  details: string;
  httpMethod: string;
  endpoint: string;
  ipAddress: string;
  userAgent: string;
  statusCode: number;
  isSuccess: boolean;
  errorMessage: string | null;
  timestamp: string;
  durationMs: number;
  user: {
    id: number;
    name: string;
    address: string;
    email: string;
    phone: string;
    aadharNumber: string;
    isActive: boolean;
    inactiveDate: string | null;
    joiningDate: string;
    userRoleId: number;
    userRole: any;
    attendances: any[];
    meetingPayments: any[];
  };
}

interface UserActivityResponse {
  activities: UserActivity[];
  totalCount: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

interface User {
  id: number;
  name: string;
}

const UserActivity: React.FC = () => {
  const theme = useTheme();
  const [activities, setActivities] = useState<UserActivity[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [totalCount, setTotalCount] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  
  // Get default dates for last 5 days
  const getDefaultDates = () => {
    const endDate = new Date();
    endDate.setHours(23, 59, 59, 999); // Set to 11:59:59.999 PM
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - 5);
    startDate.setHours(0, 0, 0, 0); // Set to 12:00:00.000 AM
    
    return {
      startDate: startDate.toISOString().split('T')[0],
      endDate: endDate.toISOString().split('T')[0],
    };
  };

  // Filter states
  const [filters, setFilters] = useState({
    userId: '',
    action: '',
    entityType: '',
    startDate: getDefaultDates().startDate,
    endDate: getDefaultDates().endDate,
    page: 1,
    pageSize: 50,
  });

  const [users, setUsers] = useState<User[]>([]);
  const [selectedActivity, setSelectedActivity] = useState<UserActivity | null>(null);
  const [detailsDialogOpen, setDetailsDialogOpen] = useState(false);

  // Predefined options for dropdowns
  const actionOptions = [
    'View', 'Create', 'Update', 'Delete', 'Login', 'Logout', 'Export', 'Import'
  ];

  const entityTypeOptions = [
    'User', 'Loan', 'Meeting', 'Payment', 'Attendance', 'Member', 'Dashboard'
  ];

  // Fetch users for dropdown
  const fetchUsers = async () => {
    try {
      const response = await apiService.get<User[]>('/api/Loan/users');
      setUsers(response);
    } catch (err) {
      console.error('Failed to fetch users:', err);
    }
  };

  // Fetch activities
  const fetchActivities = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const params = new URLSearchParams();
      
      if (filters.userId) params.append('userId', filters.userId);
      if (filters.action) params.append('action', filters.action);
      if (filters.entityType) params.append('entityType', filters.entityType);
      if (filters.startDate) params.append('startDate', filters.startDate);
      if (filters.endDate) {
        // Set end date to 11:59:59 PM of the selected date
        const endDate = new Date(filters.endDate);
        endDate.setHours(23, 59, 59, 999);
        params.append('endDate', endDate.toISOString());
      }
      params.append('page', filters.page.toString());
      params.append('pageSize', filters.pageSize.toString());

      const response = await apiService.get<UserActivityResponse>(`/api/UserActivity?${params.toString()}`);
      
      setActivities(response.activities);
      setTotalCount(response.totalCount);
      setTotalPages(response.totalPages);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to fetch user activities.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  useEffect(() => {
    fetchActivities();
  }, [filters]);

  const handleFilterChange = (field: string, value: string | number) => {
    setFilters(prev => ({
      ...prev,
      [field]: value,
      page: 1, // Reset to first page when filters change
    }));
  };

  const handlePageChange = (event: unknown, newPage: number) => {
    handleFilterChange('page', newPage + 1);
  };

  const handlePageSizeChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const newPageSize = parseInt(event.target.value, 10);
    handleFilterChange('pageSize', newPageSize);
  };

  const handleResetFilters = () => {
    setFilters({
      userId: '',
      action: '',
      entityType: '',
      startDate: '',
      endDate: '',
      page: 1,
      pageSize: 50,
    });
  };

  const handleViewDetails = (activity: UserActivity) => {
    setSelectedActivity(activity);
    setDetailsDialogOpen(true);
  };

  const handleCloseDetails = () => {
    setDetailsDialogOpen(false);
    setSelectedActivity(null);
  };

  const getStatusColor = (isSuccess: boolean) => {
    return isSuccess ? 'success' : 'error';
  };

  const getActionColor = (action: string) => {
    switch (action.toLowerCase()) {
      case 'create': return 'success';
      case 'update': return 'warning';
      case 'delete': return 'error';
      case 'view': return 'info';
      case 'login': return 'primary';
      case 'logout': return 'secondary';
      default: return 'default';
    }
  };

  const formatDuration = (durationMs: number) => {
    if (durationMs < 1000) return `${durationMs}ms`;
    return `${(durationMs / 1000).toFixed(2)}s`;
  };

  return (
    <AuthenticatedLayout>
      <Box sx={{ p: 3 }}>
        {/* Header */}
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
            <AccountTree sx={{ color: 'white', fontSize: 28 }} />
          </Box>
          <Box>
            <Typography variant="h4" component="h1" sx={{ fontWeight: 600, mb: 1 }}>
              User Activity
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Monitor and analyze user activities across the system
            </Typography>
          </Box>
          <Chip 
            label={`${totalCount} activities`} 
            color="primary" 
            variant="outlined" 
            sx={{ ml: 'auto', fontWeight: 600 }}
          />
        </Box>

        {/* Filters */}
        <Card sx={{ mb: 3 }}>
          <CardContent>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <FilterList sx={{ mr: 1 }} />
              <Typography variant="h6">Filters</Typography>
            </Box>
            
            <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', md: 'repeat(4, 1fr)' }, gap: 2 }}>
              <Box>
                <FormControl fullWidth size="small">
                  <InputLabel>User</InputLabel>
                  <Select
                    value={filters.userId}
                    onChange={(e) => handleFilterChange('userId', e.target.value)}
                    label="User"
                  >
                    <MenuItem value="">All Users</MenuItem>
                    {users.map((user) => (
                      <MenuItem key={user.id} value={user.id}>
                        {user.name}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Box>

              <Box>
                <FormControl fullWidth size="small">
                  <InputLabel>Action</InputLabel>
                  <Select
                    value={filters.action}
                    onChange={(e) => handleFilterChange('action', e.target.value)}
                    label="Action"
                  >
                    <MenuItem value="">All Actions</MenuItem>
                    {actionOptions.map((action) => (
                      <MenuItem key={action} value={action}>
                        {action}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Box>

              <Box>
                <FormControl fullWidth size="small">
                  <InputLabel>Entity Type</InputLabel>
                  <Select
                    value={filters.entityType}
                    onChange={(e) => handleFilterChange('entityType', e.target.value)}
                    label="Entity Type"
                  >
                    <MenuItem value="">All Entities</MenuItem>
                    {entityTypeOptions.map((entityType) => (
                      <MenuItem key={entityType} value={entityType}>
                        {entityType}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Box>

              <Box>
                <FormControl fullWidth size="small">
                  <InputLabel>Page Size</InputLabel>
                  <Select
                    value={filters.pageSize}
                    onChange={(e) => handleFilterChange('pageSize', e.target.value)}
                    label="Page Size"
                  >
                    <MenuItem value={10}>10</MenuItem>
                    <MenuItem value={25}>25</MenuItem>
                    <MenuItem value={50}>50</MenuItem>
                    <MenuItem value={100}>100</MenuItem>
                  </Select>
                </FormControl>
              </Box>

              <Box>
                <TextField
                  label="Start Date"
                  type="date"
                  value={filters.startDate}
                  onChange={(e) => handleFilterChange('startDate', e.target.value)}
                  fullWidth
                  size="small"
                  InputLabelProps={{ shrink: true }}
                />
              </Box>

              <Box>
                <TextField
                  label="End Date"
                  type="date"
                  value={filters.endDate}
                  onChange={(e) => handleFilterChange('endDate', e.target.value)}
                  fullWidth
                  size="small"
                  InputLabelProps={{ shrink: true }}
                />
              </Box>

              <Box>
                <Button
                  variant="contained"
                  startIcon={<Search />}
                  onClick={fetchActivities}
                  disabled={loading}
                  fullWidth
                  sx={{ height: 40 }}
                >
                  Search
                </Button>
              </Box>

              <Box>
                <Button
                  variant="outlined"
                  startIcon={<Refresh />}
                  onClick={handleResetFilters}
                  fullWidth
                  sx={{ height: 40 }}
                >
                  Reset
                </Button>
              </Box>
            </Box>
          </CardContent>
        </Card>

        {/* Error Alert */}
        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}

        {/* Loading */}
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
            <CircularProgress size={60} />
          </Box>
        ) : (
          <>
            {/* Activities Table */}
            <Paper 
              elevation={8} 
              sx={{ 
                borderRadius: 3,
                background: `linear-gradient(135deg, ${theme.palette.background.paper} 0%, ${theme.palette.grey[50]} 100%)`,
                border: `1px solid ${theme.palette.divider}`,
              }}
            >
              <TableContainer sx={{ borderRadius: 3 }}>
                <Table sx={{ 
                  '& th': { 
                    backgroundColor: theme.palette.primary.main,
                    color: 'white',
                    fontWeight: 600,
                  },
                  '& tr:hover': {
                    backgroundColor: theme.palette.action.hover,
                  },
                }}>
                  <TableHead>
                    <TableRow>
                      <TableCell>User</TableCell>
                      <TableCell>Action</TableCell>
                      <TableCell>Entity</TableCell>
                      <TableCell>Description</TableCell>
                      <TableCell>Status</TableCell>
                      <TableCell>Duration</TableCell>
                      <TableCell>Timestamp</TableCell>
                      <TableCell align="center">Details</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {activities.map((activity) => (
                      <TableRow key={activity.id} hover>
                        <TableCell>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <Person fontSize="small" />
                            <Box>
                              <Typography variant="body2" fontWeight={600}>
                                {activity.userName}
                              </Typography>
                              <Typography variant="caption" color="text.secondary">
                                {activity.userRole}
                              </Typography>
                            </Box>
                          </Box>
                        </TableCell>
                        <TableCell>
                          <Chip
                            label={activity.action}
                            color={getActionColor(activity.action) as any}
                            size="small"
                            variant="outlined"
                          />
                        </TableCell>
                        <TableCell>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <AccountTree fontSize="small" />
                            <Typography variant="body2">
                              {activity.entityType}
                            </Typography>
                          </Box>
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2" sx={{ maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis' }}>
                            {activity.description}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            {activity.isSuccess ? (
                              <CheckCircle color="success" fontSize="small" />
                            ) : (
                              <Error color="error" fontSize="small" />
                            )}
                            <Chip
                              label={activity.statusCode}
                              color={getStatusColor(activity.isSuccess)}
                              size="small"
                            />
                          </Box>
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2" color="text.secondary">
                            {formatDuration(activity.durationMs)}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2" color="text.secondary">
                            {new Date(activity.timestamp).toLocaleString()}
                          </Typography>
                        </TableCell>
                        <TableCell align="center">
                          <Tooltip title="View Details">
                            <IconButton
                              size="small"
                              onClick={() => handleViewDetails(activity)}
                              sx={{ color: theme.palette.primary.main }}
                            >
                              <Visibility />
                            </IconButton>
                          </Tooltip>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>

              {/* Pagination */}
              <TablePagination
                rowsPerPageOptions={[10, 25, 50, 100]}
                component="div"
                count={totalCount}
                rowsPerPage={filters.pageSize}
                page={filters.page - 1}
                onPageChange={handlePageChange}
                onRowsPerPageChange={handlePageSizeChange}
                sx={{
                  '& .MuiTablePagination-selectLabel, & .MuiTablePagination-displayedRows': {
                    fontWeight: 500,
                  }
                }}
              />
            </Paper>
          </>
        )}

        {/* Activity Details Dialog */}
        <Dialog 
          open={detailsDialogOpen} 
          onClose={handleCloseDetails}
          maxWidth="md"
          fullWidth
        >
          <DialogTitle>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Info color="primary" />
              Activity Details
            </Box>
          </DialogTitle>
          <DialogContent>
            {selectedActivity && (
              <Box sx={{ mt: 2 }}>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                  <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, gap: 3 }}>
                    <Box sx={{ flex: 1 }}>
                      <Typography variant="h6" gutterBottom>User Information</Typography>
                      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                        <Box>
                          <Typography variant="body2" color="text.secondary">Name</Typography>
                          <Typography variant="body1" fontWeight={600}>{selectedActivity.userName}</Typography>
                        </Box>
                        <Box>
                          <Typography variant="body2" color="text.secondary">Role</Typography>
                          <Typography variant="body1">{selectedActivity.userRole}</Typography>
                        </Box>
                        <Box>
                          <Typography variant="body2" color="text.secondary">Email</Typography>
                          <Typography variant="body1">{selectedActivity.user.email}</Typography>
                        </Box>
                        <Box>
                          <Typography variant="body2" color="text.secondary">Phone</Typography>
                          <Typography variant="body1">{selectedActivity.user.phone}</Typography>
                        </Box>
                      </Box>
                    </Box>

                    <Box sx={{ flex: 1 }}>
                      <Typography variant="h6" gutterBottom>Activity Information</Typography>
                      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                        <Box>
                          <Typography variant="body2" color="text.secondary">Action</Typography>
                          <Chip label={selectedActivity.action} color={getActionColor(selectedActivity.action) as any} size="small" />
                        </Box>
                        <Box>
                          <Typography variant="body2" color="text.secondary">Entity Type</Typography>
                          <Typography variant="body1">{selectedActivity.entityType}</Typography>
                        </Box>
                        <Box>
                          <Typography variant="body2" color="text.secondary">Description</Typography>
                          <Typography variant="body1">{selectedActivity.description}</Typography>
                        </Box>
                        <Box>
                          <Typography variant="body2" color="text.secondary">Status</Typography>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            {selectedActivity.isSuccess ? (
                              <CheckCircle color="success" fontSize="small" />
                            ) : (
                              <Error color="error" fontSize="small" />
                            )}
                            <Typography variant="body1">{selectedActivity.statusCode}</Typography>
                          </Box>
                        </Box>
                      </Box>
                    </Box>
                  </Box>

                  <Box sx={{ width: '100%' }}>
                    <Typography variant="h6" gutterBottom>Technical Details</Typography>
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                      <Box>
                        <Typography variant="body2" color="text.secondary">Endpoint</Typography>
                        <Typography variant="body1" fontFamily="monospace">{selectedActivity.endpoint}</Typography>
                      </Box>
                      <Box>
                        <Typography variant="body2" color="text.secondary">HTTP Method</Typography>
                        <Typography variant="body1">{selectedActivity.httpMethod}</Typography>
                      </Box>
                      <Box>
                        <Typography variant="body2" color="text.secondary">IP Address</Typography>
                        <Typography variant="body1">{selectedActivity.ipAddress}</Typography>
                      </Box>
                      <Box>
                        <Typography variant="body2" color="text.secondary">Duration</Typography>
                        <Typography variant="body1">{formatDuration(selectedActivity.durationMs)}</Typography>
                      </Box>
                      <Box>
                        <Typography variant="body2" color="text.secondary">Timestamp</Typography>
                        <Typography variant="body1">{new Date(selectedActivity.timestamp).toLocaleString()}</Typography>
                      </Box>
                      {selectedActivity.errorMessage && (
                        <Box>
                          <Typography variant="body2" color="text.secondary">Error Message</Typography>
                          <Typography variant="body1" color="error">{selectedActivity.errorMessage}</Typography>
                        </Box>
                      )}
                      <Box>
                        <Typography variant="body2" color="text.secondary">Details</Typography>
                        <Typography variant="body1" fontFamily="monospace" sx={{ 
                          backgroundColor: 'grey.100', 
                          p: 1, 
                          borderRadius: 1,
                          fontSize: '0.875rem'
                        }}>
                          {selectedActivity.details}
                        </Typography>
                      </Box>
                    </Box>
                  </Box>
                </Box>
              </Box>
            )}
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCloseDetails}>Close</Button>
          </DialogActions>
        </Dialog>
      </Box>
    </AuthenticatedLayout>
  );
};

export default UserActivity; 