import React, { useState } from 'react';
import styled from 'styled-components';
import { Button } from './index';
import { GEOLOCATION_ERRORS, getErrorMessage } from '../../services/geolocation';

const FallbackContainer = styled.div`
  background-color: #fff3cd;
  border: 1px solid #ffeaa7;
  border-radius: 6px;
  padding: 1rem;
  margin: 0.5rem 0;
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
`;

const ErrorInfo = styled.div`
  display: flex;
  align-items: flex-start;
  gap: 0.5rem;
`;

const ErrorIcon = styled.span`
  font-size: 1.2rem;
  flex-shrink: 0;
  margin-top: 0.1rem;
`;

const ErrorContent = styled.div`
  flex: 1;
`;

const ErrorTitle = styled.h4`
  margin: 0 0 0.25rem 0;
  color: #856404;
  font-size: 0.95rem;
  font-weight: 600;
`;

const ErrorMessage = styled.p`
  margin: 0 0 0.5rem 0;
  color: #856404;
  font-size: 0.875rem;
  line-height: 1.4;
`;

const SuggestionsList = styled.ul`
  margin: 0;
  padding-left: 1.2rem;
  color: #856404;
  font-size: 0.875rem;
  
  li {
    margin-bottom: 0.25rem;
  }
`;

const ActionButtons = styled.div`
  display: flex;
  gap: 0.5rem;
  flex-wrap: wrap;
  align-items: center;
`;

const ManualInputPrompt = styled.div`
  background-color: #f8f9fa;
  border: 1px solid #dee2e6;
  border-radius: 4px;
  padding: 0.75rem;
  margin-top: 0.5rem;
`;

const ManualInputText = styled.p`
  margin: 0 0 0.5rem 0;
  color: #495057;
  font-size: 0.875rem;
`;

const InputGroup = styled.div`
  display: flex;
  gap: 0.5rem;
  align-items: center;
  flex-wrap: wrap;
`;

const ManualInput = styled.input`
  flex: 1;
  min-width: 200px;
  padding: 0.5rem;
  border: 1px solid #ced4da;
  border-radius: 4px;
  font-size: 0.875rem;
  
  &:focus {
    outline: none;
    border-color: var(--primary-yellow);
    box-shadow: 0 0 0 2px rgba(255, 193, 7, 0.25);
  }
`;

const GeolocationFallback = ({ 
  error, 
  onRetry, 
  onManualInput, 
  onDismiss,
  isRetrying = false,
  showManualInput = true 
}) => {
  const [manualLocation, setManualLocation] = useState('');
  const [showInput, setShowInput] = useState(false);

  const handleManualSubmit = () => {
    if (manualLocation.trim()) {
      onManualInput(manualLocation.trim());
      setManualLocation('');
      setShowInput(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleManualSubmit();
    }
  };

  const getSuggestions = (errorType) => {
    switch (errorType) {
      case GEOLOCATION_ERRORS.PERMISSION_DENIED:
        return [
          'Click the location icon in your browser\'s address bar',
          'Go to browser settings and allow location access for this site',
          'Check your device\'s location settings',
          'Try refreshing the page and allowing location access'
        ];
      
      case GEOLOCATION_ERRORS.POSITION_UNAVAILABLE:
        return [
          'Check your internet connection',
          'Make sure GPS is enabled on your device',
          'Try moving to an area with better signal',
          'Restart your browser and try again'
        ];
      
      case GEOLOCATION_ERRORS.TIMEOUT:
        return [
          'Check your internet connection',
          'Try again in a few moments',
          'Make sure your device has a clear view of the sky (for GPS)',
          'Close other apps that might be using location services'
        ];
      
      case GEOLOCATION_ERRORS.NOT_SUPPORTED:
        return [
          'Update your browser to the latest version',
          'Try using a different browser (Chrome, Firefox, Safari)',
          'Use the manual input option below'
        ];
      
      default:
        return [
          'Try refreshing the page',
          'Check your internet connection',
          'Make sure location services are enabled',
          'Use the manual input option below'
        ];
    }
  };

  const errorType = error?.message || GEOLOCATION_ERRORS.UNKNOWN;
  const errorMessage = getErrorMessage(errorType);
  const suggestions = getSuggestions(errorType);
  const canRetry = errorType !== GEOLOCATION_ERRORS.NOT_SUPPORTED && 
                   errorType !== GEOLOCATION_ERRORS.PERMISSION_DENIED;

  return (
    <FallbackContainer>
      <ErrorInfo>
        <ErrorIcon>📍</ErrorIcon>
        <ErrorContent>
          <ErrorTitle>Location Access Issue</ErrorTitle>
          <ErrorMessage>{errorMessage}</ErrorMessage>
          
          <SuggestionsList>
            {suggestions.map((suggestion, index) => (
              <li key={index}>{suggestion}</li>
            ))}
          </SuggestionsList>
        </ErrorContent>
      </ErrorInfo>

      <ActionButtons>
        {canRetry && (
          <Button
            onClick={onRetry}
            disabled={isRetrying}
            variant="outline"
            size="small"
          >
            {isRetrying ? 'Retrying...' : 'Try Again'}
          </Button>
        )}
        
        {showManualInput && (
          <Button
            onClick={() => setShowInput(!showInput)}
            variant="outline"
            size="small"
          >
            Enter Manually
          </Button>
        )}
        
        {onDismiss && (
          <Button
            onClick={onDismiss}
            variant="text"
            size="small"
          >
            Dismiss
          </Button>
        )}
      </ActionButtons>

      {showInput && showManualInput && (
        <ManualInputPrompt>
          <ManualInputText>
            Enter your pickup location manually:
          </ManualInputText>
          <InputGroup>
            <ManualInput
              type="text"
              placeholder="e.g., 123 Main St, City, State"
              value={manualLocation}
              onChange={(e) => setManualLocation(e.target.value)}
              onKeyDown={handleKeyPress}
            />
            <Button
              onClick={handleManualSubmit}
              disabled={!manualLocation.trim()}
              variant="primary"
              size="small"
            >
              Use This Location
            </Button>
          </InputGroup>
        </ManualInputPrompt>
      )}
    </FallbackContainer>
  );
};

export default GeolocationFallback;