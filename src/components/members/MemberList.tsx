import React, { useState, useEffect, useCallback } from 'react';
import { apiService } from '../../services/api';
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Typography,
  CircularProgress,
  Alert,
  Box,
  TablePagination,
  Container,
  Chip,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Button,
  useTheme
} from '@mui/material';
import { People, Email, Phone, LocationOn, Edit, Delete, RestoreFromTrash, Security } from '@mui/icons-material';
import { Member } from './MemberPage';

interface MemberListProps {
  onEdit: (member: Member) => void;
  refreshKey: number;
}

const MemberList: React.FC<MemberListProps> = ({ onEdit, refreshKey }) => {
  const theme = useTheme();
  const [members, setMembers] = useState<Member[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [reactivateId, setReactivateId] = useState<number | null>(null);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [reactivateOpen, setReactivateOpen] = useState(false);

  const fetchMembers = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await apiService.get<Member[]>('/api/User');
      setMembers(response);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to fetch members. Please try again.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchMembers();
  }, [fetchMembers, refreshKey]);

  const handleChangePage = (event: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleDeleteClick = (id: number) => {
    setDeleteId(id);
    setConfirmOpen(true);
  };

  const handleReactivateClick = (id: number) => {
    setReactivateId(id);
    setReactivateOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (deleteId == null) return;
    try {
      setLoading(true);
      await apiService.delete(`/api/User/${deleteId}`);
      setMembers((prev) => prev.filter((m) => m.id !== deleteId));
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to delete member.');
    } finally {
      setLoading(false);
      setConfirmOpen(false);
      setDeleteId(null);
    }
  };

  const handleReactivateConfirm = async () => {
    if (reactivateId == null) return;
    try {
      setLoading(true);
      // Assuming there's a reactivate endpoint
      await apiService.put(`/api/User/${reactivateId}/reactivate`, {});
      // Refresh the members list
      await fetchMembers();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to reactivate member.');
    } finally {
      setLoading(false);
      setReactivateOpen(false);
      setReactivateId(null);
    }
  };

  const handleDeleteCancel = () => {
    setConfirmOpen(false);
    setDeleteId(null);
  };

  const handleReactivateCancel = () => {
    setReactivateOpen(false);
    setReactivateId(null);
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString();
  };

  const getStatusColor = (isActive: boolean) => {
    return isActive ? 'success' : 'error';
  };

  const getStatusLabel = (isActive: boolean) => {
    return isActive ? 'Active' : 'Inactive';
  };

  const paginatedMembers = members.slice(
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
            <People sx={{ color: 'white', fontSize: 28 }} />
          </Box>
          <Box>
            <Typography variant="h4" component="h2" sx={{ fontWeight: 600, mb: 1 }}>
              Member List
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Manage your organization's members
            </Typography>
          </Box>
          <Chip 
            label={`${members.length} members`} 
            color="primary" 
            variant="outlined" 
            sx={{ ml: 'auto', fontWeight: 600 }}
          />
        </Box>

        {members.length === 0 ? (
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
              <People sx={{ fontSize: 60, color: 'text.secondary' }} />
            </Box>
            <Typography variant="h5" color="text.secondary" gutterBottom sx={{ fontWeight: 500 }}>
              No members found
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Start by adding some members using the form above.
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
                '&::-webkit-scrollbar': {
                  height: 8,
                },
                '&::-webkit-scrollbar-track': {
                  backgroundColor: theme.palette.grey[100],
                  borderRadius: 4,
                },
                '&::-webkit-scrollbar-thumb': {
                  backgroundColor: theme.palette.grey[400],
                  borderRadius: 4,
                  '&:hover': {
                    backgroundColor: theme.palette.grey[500],
                  },
                },
              }}
            >
              <Table sx={{ 
                minWidth: { xs: 800, sm: 1000, md: 1200 }, // Responsive minimum width
                '& th': { 
                  backgroundColor: theme.palette.primary.main,
                  color: 'white',
                  fontWeight: 600,
                  whiteSpace: 'nowrap', // Prevent header text wrapping
                },
                '& td': {
                  whiteSpace: 'nowrap', // Prevent cell content wrapping
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
                    <TableCell sx={{ py: 3 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <People sx={{ mr: 2, fontSize: 24 }} />
                        Name
                      </Box>
                    </TableCell>
                    <TableCell sx={{ py: 3 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <Security sx={{ mr: 2, fontSize: 24 }} />
                        Role
                      </Box>
                    </TableCell>
                    <TableCell sx={{ py: 3 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <LocationOn sx={{ mr: 2, fontSize: 24 }} />
                        Address
                      </Box>
                    </TableCell>
                    <TableCell sx={{ py: 3 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <Email sx={{ mr: 2, fontSize: 24 }} />
                        Email
                      </Box>
                    </TableCell>
                    <TableCell sx={{ py: 3 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <Phone sx={{ mr: 2, fontSize: 24 }} />
                        Phone
                      </Box>
                    </TableCell>
                    <TableCell sx={{ py: 3 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <Security sx={{ mr: 2, fontSize: 24 }} />
                        Aadhar
                      </Box>
                    </TableCell>
                    <TableCell sx={{ py: 3 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <People sx={{ mr: 2, fontSize: 24 }} />
                        Status
                      </Box>
                    </TableCell>
                    <TableCell sx={{ py: 3 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <People sx={{ mr: 2, fontSize: 24 }} />
                        Joining Date
                      </Box>
                    </TableCell>
                    <TableCell align="center" sx={{ py: 3 }}>Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {paginatedMembers.map((member, index) => (
                    <TableRow 
                      key={member.id} 
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
                      <TableCell sx={{ py: 3 }}>
                        <Typography variant="body1" fontWeight="600" sx={{ color: theme.palette.primary.main }}>
                          {member.name}
                        </Typography>
                      </TableCell>
                      <TableCell sx={{ py: 3 }}>
                        <Chip 
                          label={member.userRole.name} 
                          color="primary" 
                          variant="outlined"
                          size="small"
                        />
                      </TableCell>
                      <TableCell sx={{ py: 3 }}>
                        <Typography variant="body2" color="text.secondary">
                          {member.address}
                        </Typography>
                      </TableCell>
                      <TableCell sx={{ py: 3 }}>
                        <Typography variant="body2">
                          {member.email}
                        </Typography>
                      </TableCell>
                      <TableCell sx={{ py: 3 }}>
                        <Typography variant="body2">
                          {member.phone}
                        </Typography>
                      </TableCell>
                      <TableCell sx={{ py: 3 }}>
                        <Typography variant="body2" sx={{ fontFamily: 'monospace' }}>
                          {member.aadharNumber ? 
                            `${member.aadharNumber.slice(0, 4)}-${member.aadharNumber.slice(4, 8)}-${member.aadharNumber.slice(8, 12)}` : 
                            'N/A'
                          }
                        </Typography>
                      </TableCell>
                      <TableCell sx={{ py: 3 }}>
                        <Chip 
                          label={getStatusLabel(member.isActive)} 
                          color={getStatusColor(member.isActive) as any}
                          size="small"
                        />
                      </TableCell>
                      <TableCell sx={{ py: 3 }}>
                        <Typography variant="body2" color="text.secondary">
                          {formatDate(member.joiningDate)}
                        </Typography>
                      </TableCell>
                      <TableCell align="center" sx={{ py: 3 }}>
                        <Box sx={{ display: 'flex', gap: 1, justifyContent: 'center' }}>
                          <IconButton 
                            color="primary" 
                            onClick={() => onEdit(member)}
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
                          {member.isActive ? (
                            <IconButton 
                              color="error" 
                              onClick={() => handleDeleteClick(member.id)}
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
                          ) : (
                            <IconButton 
                              color="success" 
                              onClick={() => handleReactivateClick(member.id)}
                              sx={{ 
                                backgroundColor: theme.palette.success.light + '20',
                                '&:hover': {
                                  backgroundColor: theme.palette.success.light + '40',
                                  transform: 'scale(1.1)',
                                },
                                transition: 'all 0.2s ease-in-out',
                              }}
                            >
                              <RestoreFromTrash />
                            </IconButton>
                          )}
                        </Box>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>

            <Box sx={{ mt: 3 }}>
              <TablePagination
                rowsPerPageOptions={[5, 10, 25]}
                component="div"
                count={members.length}
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

      {/* Delete Confirmation Dialog */}
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
          Delete Member
        </DialogTitle>
        <DialogContent sx={{ pt: 3 }}>
          <DialogContentText sx={{ fontSize: '1.1rem' }}>
            Are you sure you want to delete this member? This action cannot be undone.
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

      {/* Reactivate Confirmation Dialog */}
      <Dialog 
        open={reactivateOpen} 
        onClose={handleReactivateCancel}
        PaperProps={{
          sx: {
            borderRadius: 3,
            minWidth: 400,
          }
        }}
      >
        <DialogTitle sx={{ 
          backgroundColor: theme.palette.success.main,
          color: 'white',
          fontWeight: 600,
        }}>
          Reactivate Member
        </DialogTitle>
        <DialogContent sx={{ pt: 3 }}>
          <DialogContentText sx={{ fontSize: '1.1rem' }}>
            Are you sure you want to reactivate this member? They will be able to access the system again.
          </DialogContentText>
        </DialogContent>
        <DialogActions sx={{ p: 3 }}>
          <Button 
            onClick={handleReactivateCancel} 
            variant="outlined"
            sx={{ borderRadius: 2 }}
          >
            Cancel
          </Button>
          <Button 
            onClick={handleReactivateConfirm} 
            color="success" 
            variant="contained"
            sx={{ borderRadius: 2 }}
          >
            Reactivate
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default MemberList; 