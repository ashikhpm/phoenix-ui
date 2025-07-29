import React, { useState, useEffect, useMemo } from 'react';
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
  Card,
  CardContent,
  Checkbox,
  Divider
} from '@mui/material';
import { Event, Group, Payment } from '@mui/icons-material';
import { Member } from '../members/MemberPage';

interface MeetingFormData {
  date: string;
  time: string;
  description?: string;
  location?: string;
}

interface MeetingFormProps {
  onSaved?: () => void;
  onCancel?: () => void;
}

const meetingSchema = yup.object({
  date: yup
    .string()
    .required('Date is required'),
  time: yup
    .string()
    .required('Time is required'),
  description: yup
    .string()
    .max(200, 'Description must be at most 200 characters')
    .optional(),
  location: yup
    .string()
    .max(100, 'Location must be at most 100 characters')
    .optional(),
});

const MeetingForm: React.FC<MeetingFormProps> = ({ onSaved, onCancel }) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitMessage, setSubmitMessage] = useState<{
    type: 'success' | 'error';
    message: string;
  } | null>(null);

  // Calculate coming Sunday and set default time to 8 PM
  const defaultValues = useMemo(() => {
    const today = new Date();
    const currentDay = today.getDay(); // 0 = Sunday, 1 = Monday, ..., 6 = Saturday
    const daysUntilSunday = currentDay === 0 ? 7 : 7 - currentDay; // If today is Sunday, get next Sunday
    
    const comingSunday = new Date();
    comingSunday.setDate(today.getDate() + daysUntilSunday);
    
    // Format date for input (YYYY-MM-DD)
    const year = comingSunday.getFullYear();
    const month = String(comingSunday.getMonth() + 1).padStart(2, '0');
    const day = String(comingSunday.getDate()).padStart(2, '0');
    const defaultDate = `${year}-${month}-${day}`;
    
    // Set time to 8 PM (20:00)
    const defaultTime = '20:00';
    
    return {
      date: defaultDate,
      time: defaultTime,
      description: 'Weekly Meeting',
      location: 'Pattanikoop'
    };
  }, []);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(meetingSchema),
    defaultValues: {
      date: defaultValues.date,
      time: defaultValues.time,
      description: defaultValues.description,
      location: defaultValues.location
    }
  });

  const onSubmit = async (data: any) => {
    try {
      setIsSubmitting(true);
      setSubmitMessage(null);
      const meetingData = {
        date: data.date,
        time: data.time,
        description: data.description || '',
        location: data.location || '',
      };
      await apiService.post('/api/Meeting', meetingData);
      setSubmitMessage({
        type: 'success',
        message: 'Meeting created successfully!'
      });
      reset({
        date: defaultValues.date,
        time: defaultValues.time,
        description: defaultValues.description,
        location: defaultValues.location
      });
      if (onSaved) onSaved();
    } catch (err: any) {
      setSubmitMessage({
        type: 'error',
        message: err.response?.data?.message || 'Failed to create meeting. Please try again.'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Container maxWidth="sm">
      <Paper elevation={3} sx={{ p: 4 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 4 }}>
          <Event sx={{ mr: 2, color: 'primary.main', fontSize: 32 }} />
          <Typography variant="h4" component="h2" sx={{ fontWeight: 600 }}>
            Create New Meeting
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
              {...register('date')}
              fullWidth
              label="Date"
              type="date"
              variant="outlined"
              error={!!errors.date}
              helperText={errors.date?.message}
              disabled={isSubmitting}
              InputLabelProps={{ shrink: true }}
            />
            <TextField
              {...register('time')}
              fullWidth
              label="Time"
              type="time"
              variant="outlined"
              error={!!errors.time}
              helperText={errors.time?.message}
              disabled={isSubmitting}
              InputLabelProps={{ shrink: true }}
            />
            <TextField
              {...register('description')}
              fullWidth
              label="Description"
              variant="outlined"
              multiline
              rows={2}
              error={!!errors.description}
              helperText={errors.description?.message}
              disabled={isSubmitting}
              inputProps={{ maxLength: 200 }}
            />
            <TextField
              {...register('location')}
              fullWidth
              label="Location"
              variant="outlined"
              error={!!errors.location}
              helperText={errors.location?.message}
              disabled={isSubmitting}
              inputProps={{ maxLength: 100 }}
            />
            <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2, mt: 3 }}>
              {onCancel && (
                <Button
                  variant="outlined"
                  onClick={onCancel}
                  disabled={isSubmitting}
                >
                  Cancel
                </Button>
              )}
              <Button
                type="submit"
                variant="contained"
                disabled={isSubmitting}
                startIcon={isSubmitting ? <CircularProgress size={20} /> : <Event />}
              >
                {isSubmitting ? 'Creating...' : 'Create Meeting'}
              </Button>
            </Box>
          </Box>
        </Box>
      </Paper>
    </Container>
  );
};

export default MeetingForm; 