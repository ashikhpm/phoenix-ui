import React, { memo } from 'react';
import { Card, CardContent, CardProps } from '@mui/material';

interface MemoizedCardProps extends CardProps {
  children: React.ReactNode;
  title?: string;
  subtitle?: string;
}

const MemoizedCard: React.FC<MemoizedCardProps> = memo(({ 
  children, 
  title, 
  subtitle, 
  ...cardProps 
}) => {
  return (
    <Card {...cardProps}>
      <CardContent>
        {title && (
          <div style={{ marginBottom: subtitle ? '8px' : '16px' }}>
            <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 600 }}>
              {title}
            </h3>
            {subtitle && (
              <p style={{ 
                margin: '4px 0 0 0', 
                fontSize: '0.875rem', 
                color: '#666',
                opacity: 0.8 
              }}>
                {subtitle}
              </p>
            )}
          </div>
        )}
        {children}
      </CardContent>
    </Card>
  );
});

MemoizedCard.displayName = 'MemoizedCard';

export default MemoizedCard; 