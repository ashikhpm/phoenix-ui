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
  Container
} from '@mui/material';
import { PersonAdd } from '@mui/icons-material';
import { Member } from './MemberPage';

interface MemberFormData {
  name: string;
  address: string;
  phone: string;
  email: string;
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
});

const MemberForm: React.FC<MemberFormProps> = ({ member, onSaved, onCancelEdit }) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitMessage, setSubmitMessage] = useState<{
    type: 'success' | 'error';
    message: string;
  } | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    formState: { errors },
  } = useForm<MemberFormData>({
    resolver: yupResolver(memberSchema),
  });

  // Prefill form when editing
  useEffect(() => {
    if (member) {
      setValue('name', member.name);
      setValue('address', member.address);
      setValue('phone', member.phone);
      setValue('email', member.email);
    } else {
      reset();
    }
  }, [member, setValue, reset]);

  const onSubmit = async (data: MemberFormData) => {
    try {
      setIsSubmitting(true);
      setSubmitMessage(null);
      if (member) {
        // Edit mode: PUT
        await apiService.put(`/api/User/${member.id}`, {
          name: data.name,
          address: data.address,
          email: data.email,
          phone: data.phone
        });
        setSubmitMessage({ type: 'success', message: 'Member updated successfully!' });
      } else {
        // Add mode: POST
        await apiService.post('/api/User', {
          name: data.name,
          address: data.address,
          email: data.email,
          phone: data.phone
        });
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