import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { apiService } from '../../services/api';
import {
  TextField,
  Button,
  Box,
  Typography,
  Alert,
  Paper,
  CircularProgress,
  Container,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormControlLabel,
  Switch,
  Chip
} from '@mui/material';
import { PersonAdd, Security } from '@mui/icons-material';
import { Member } from './MemberPage';

interface UserRole {
  id: number;
  name: string;
}

interface MemberFormData {
  name: string;
  address: string;
  phone: string;
  email: string;
  aadharNumber: string;
  userRoleId?: number | null;
  joiningDate: string;
  isActive: boolean;
}

interface MemberFormProps {
  member?: Member | null;
  onSaved?: () => void;
  onCancelEdit?: () => void;
}

const memberSchema = yup.object({
  name: yup
    .string()
    .min(2, 'Name must be at least 2 characters')
    .required('Name is required'),
  address: yup
    .string()
    .min(5, 'Address must be at least 5 characters')
    .required('Address is required'),
  phone: yup
    .string()
    .matches(/^[+]?[1-9][\d]{0,15}$/, 'Please enter a valid phone number')
    .required('Phone number is required'),
  email: yup
    .string()
    .email('Please enter a valid email address')
    .required('Email is required'),
  aadharNumber: yup
    .string()
    .matches(/^[0-9]{12}$/, 'Aadhar number must be exactly 12 digits')
    .required('Aadhar number is required'),
  userRoleId: yup
    .number()
    .nullable()
    .optional(),
  joiningDate: yup
    .string()
    .required('Joining date is required'),
  isActive: yup
    .boolean()
    .required('Status is required'),
});

const MemberForm: React.FC<MemberFormProps> = ({ member, onSaved, onCancelEdit }) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [userRoles, setUserRoles] = useState<UserRole[]>([]);
  const [loadingRoles, setLoadingRoles] = useState(true);
  const [submitMessage, setSubmitMessage] = useState<{
    type: 'success' | 'error';
    message: string;
  } | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(memberSchema),
    context: { isEdit: !!member },
    defaultValues: {
      isActive: true,
      joiningDate: new Date().toISOString().split('T')[0],
      userRoleId: null,
    }
  });

  const isActive = watch('isActive');
  const userRoleId = watch('userRoleId');
  const joiningDate = watch('joiningDate');

  // Fetch user roles
  useEffect(() => {
    const fetchUserRoles = async () => {
      try {
        setLoadingRoles(true);
        const response = await apiService.get<UserRole[]>('/api/User/roles');
        setUserRoles(response);
      } catch (err) {
        console.error('Failed to fetch user roles:', err);
        // Set default roles if API fails
        setUserRoles([
          { id: 1, name: 'Secretary' },
          { id: 2, name: 'President' },
          { id: 3, name: 'Treasurer' },
          { id: 4, name: 'Member' },
        ]);
      } finally {
        setLoadingRoles(false);
      }
    };

    fetchUserRoles();
  }, []);

  // Prefill form when editing
  useEffect(() => {
    if (member) {
      setValue('name', member.name);
      setValue('address', member.address);
      setValue('phone', member.phone);
      setValue('email', member.email);
      setValue('aadharNumber', member.aadharNumber);
      setValue('userRoleId', member.userRoleId);
      setValue('isActive', member.isActive);
      setValue('joiningDate', member.joiningDate ? new Date(member.joiningDate).toISOString().split('T')[0] : new Date().toISOString().split('T')[0]);
    } else {
      reset();
      setValue('isActive', true);
      setValue('joiningDate', new Date().toISOString().split('T')[0]);
      setValue('userRoleId', null);
    }
  }, [member, setValue, reset]);

  const onSubmit = async (data: MemberFormData) => {
    try {
      setIsSubmitting(true);
      setSubmitMessage(null);
      
      const memberData = {
        name: data.name,
        address: data.address,
        email: data.email,
        phone: data.phone,
        aadharNumber: data.aadharNumber,
        ...(data.userRoleId && { userRoleId: data.userRoleId }),
        joiningDate: data.joiningDate,
        isActive: data.isActive,
      };

      if (member) {
        // Edit mode: PUT
        await apiService.put(`/api/User/${member.id}`, memberData);
        setSubmitMessage({ type: 'success', message: 'Member updated successfully!' });
      } else {
        // Add mode: POST
        await apiService.post('/api/User', memberData);
        setSubmitMessage({ type: 'success', message: 'Member saved successfully!' });
      }
      reset();
      if (onSaved) onSaved();
    } catch (err: any) {
      setSubmitMessage({
        type: 'error',
        message: err.response?.data?.message || 'Failed to save member. Please try again.'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Container maxWidth="md">
      <Paper elevation={3} sx={{ p: 4 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
          <PersonAdd sx={{ mr: 2, color: 'primary.main' }} />
          <Typography variant="h5" component="h2">
            {member ? 'Edit Member' : 'Add New Member'}
          </Typography>
        </Box>

        {submitMessage && (
          <Alert 
            severity={submitMessage.type} 
            sx={{ mb: 3 }}
            onClose={() => setSubmitMessage(null)}
          >
            {submitMessage.message}
          </Alert>
        )}

        <Box component="form" onSubmit={handleSubmit(onSubmit)}>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
            <TextField
              {...register('name')}
              fullWidth
              label="Full Name"
              variant="outlined"
              error={!!errors.name}
              helperText={errors.name?.message}
              disabled={isSubmitting}
            />
            
            <TextField
              {...register('address')}
              fullWidth
              label="Address"
              variant="outlined"
              multiline
              rows={3}
              error={!!errors.address}
              helperText={errors.address?.message}
              disabled={isSubmitting}
            />
            
            <Box sx={{ display: 'flex', gap: 2, flexDirection: { xs: 'column', sm: 'row' } }}>
              <TextField
                {...register('phone')}
                fullWidth
                label="Phone Number"
                variant="outlined"
                error={!!errors.phone}
                helperText={errors.phone?.message}
                disabled={isSubmitting}
              />
              
              <TextField
                {...register('email')}
                fullWidth
                label="Email Address"
                variant="outlined"
                type="email"
                error={!!errors.email}
                helperText={errors.email?.message}
                disabled={isSubmitting}
              />
            </Box>

            <TextField
              {...register('aadharNumber')}
              fullWidth
              label="Aadhar Number"
              variant="outlined"
              placeholder="Enter 12-digit Aadhar number"
              error={!!errors.aadharNumber}
              helperText={errors.aadharNumber?.message}
              disabled={isSubmitting}
              inputProps={{
                maxLength: 12,
                pattern: '[0-9]*'
              }}
            />

            <Box sx={{ display: 'flex', gap: 2, flexDirection: { xs: 'column', sm: 'row' } }}>
              <FormControl fullWidth error={!!errors.userRoleId} disabled={isSubmitting || loadingRoles}>
                <InputLabel>Role</InputLabel>
                <Select
                  value={userRoleId || ''}
                  onChange={(e) => setValue('userRoleId', e.target.value ? Number(e.target.value) : null)}
                  label="Role"
                  displayEmpty
                  renderValue={(selected) => {
                    if (!selected) {
                      return <Typography color="text.secondary">Select a role</Typography>;
                    }
                    const role = userRoles.find(r => r.id === selected);
                    return role ? role.name : 'Select a role';
                  }}
                >
                  <MenuItem value="" disabled>
                    <Typography color="text.secondary">Select a role</Typography>
                  </MenuItem>
                  {userRoles.map((role) => (
                    <MenuItem key={role.id} value={role.id}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Security sx={{ fontSize: 20 }} />
                        <Typography variant="body1">{role.name}</Typography>
                      </Box>
                    </MenuItem>
                  ))}
                </Select>
                {errors.userRoleId && (
                  <Typography variant="caption" color="error" sx={{ mt: 0.5 }}>
                    {errors.userRoleId.message}
                  </Typography>
                )}
              </FormControl>

              <TextField
                value={joiningDate || ''}
                onChange={(e) => setValue('joiningDate', e.target.value)}
                fullWidth
                label="Joining Date"
                variant="outlined"
                type="date"
                error={!!errors.joiningDate}
                helperText={errors.joiningDate?.message}
                disabled={isSubmitting}
                InputLabelProps={{ shrink: true }}
              />
            </Box>

            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <FormControlLabel
                control={
                  <Switch
                    {...register('isActive')}
                    checked={isActive}
                    onChange={(e) => setValue('isActive', e.target.checked)}
                    disabled={isSubmitting}
                  />
                }
                label="Active Member"
              />
              <Chip 
                label={isActive ? 'Active' : 'Inactive'} 
                color={isActive ? 'success' : 'error'} 
                variant="outlined"
              />
            </Box>
            
            <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
              {member && (
                <Button
                  variant="outlined"
                  color="secondary"
                  onClick={onCancelEdit}
                  disabled={isSubmitting}
                >
                  Cancel
                </Button>
              )}
              <Button
                type="submit"
                variant="contained"
                disabled={isSubmitting}
                startIcon={isSubmitting ? <CircularProgress size={20} /> : <PersonAdd />}
              >
                {isSubmitting ? (member ? 'Saving...' : 'Saving...') : member ? 'Update Member' : 'Save Member'}
              </Button>
            </Box>
          </Box>
        </Box>
      </Paper>
    </Container>
  );
};

export default MemberForm; 