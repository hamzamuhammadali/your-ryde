import React from 'react';
import styled from 'styled-components';
import { Button, LoadingSpinner } from './index';

const RetryContainer = styled.div`
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 1rem;
  background-color: #f8f9fa;
  border: 1px solid #dee2e6;
  border-radius: 6px;
  margin: 0.5rem 0;
`;

const RetryIcon = styled.span`
  font-size: 1.2rem;
  color: #6c757d;
`;

const RetryContent = styled.div`
  flex: 1;
`;

const RetryMessage = styled.p`
  margin: 0 0 0.25rem 0;
  color: #495057;
  font-size: 0.9rem;
  font-weight: 500;
`;

const RetryDetails = styled.p`
  margin: 0;
  color: #6c757d;
  font-size: 0.8rem;
`;

const RetryActions = styled.div`
  display: flex;
  gap: 0.5rem;
  align-items: center;
`;

const RetryButton = ({ 
  onRetry, 
  isRetrying = false, 
  retryCount = 0,
  maxRetries = 3,
  error = null,
  message = "Something went wrong",
  showDetails = true,
  size = "small",
  variant = "outline"
}) => {
  const getRetryMessage = () => {
    if (isRetrying) {
      return retryCount > 0 ? `Retrying... (attempt ${retryCount})` : 'Retrying...';
    }
    
    if (retryCount > 0) {
      return `Failed after ${retryCount} attempt${retryCount > 1 ? 's' : ''}`;
    }
    
    return message;
  };

  const getRetryDetails = () => {
    if (!showDetails) return null;
    
    if (isRetrying) {
      return 'Please wait while we try again...';
    }
    
    if (error?.message) {
      return error.message;
    }
    
    if (retryCount >= maxRetries) {
      return 'Maximum retry attempts reached. Please try again later.';
    }
    
    return 'Click retry to try again.';
  };

  const canRetry = !isRetrying && retryCount < maxRetries;
  const details = getRetryDetails();

  return (
    <RetryContainer>
      <RetryIcon>
        {isRetrying ? '🔄' : '⚠️'}
      </RetryIcon>
      
      <RetryContent>
        <RetryMessage>{getRetryMessage()}</RetryMessage>
        {details && <RetryDetails>{details}</RetryDetails>}
      </RetryContent>
      
      <RetryActions>
        {canRetry && (
          <Button
            onClick={onRetry}
            disabled={isRetrying}
            variant={variant}
            size={size}
          >
            {isRetrying ? (
              <>
                <LoadingSpinner size="small" showText={false} />
                Retrying...
              </>
            ) : (
              'Retry'
            )}
          </Button>
        )}
      </RetryActions>
    </RetryContainer>
  );
};

export default RetryButton;