import React from 'react';
import { Chip } from '@mui/material';
import { getStatusColor } from '../../utils/helpers';

interface StatusChipProps {
  status: string;
  size?: 'small' | 'medium';
  variant?: 'filled' | 'outlined';
}

const StatusChip: React.FC<StatusChipProps> = ({ 
  status, 
  size = 'small', 
  variant = 'outlined' 
}) => {
  return (
    <Chip 
      label={status}
      color={getStatusColor(status)}
      size={size}
      variant={variant}
    />
  );
};

export default StatusChip; 