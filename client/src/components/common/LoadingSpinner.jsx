import React from 'react';
import styled, { keyframes } from 'styled-components';

const spin = keyframes`
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
`;

const SpinnerContainer = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  padding: ${props => props.size === 'large' ? '3rem' : '1rem'};
`;

const Spinner = styled.div`
  width: ${props => {
    switch(props.size) {
      case 'small': return '20px';
      case 'large': return '50px';
      default: return '30px';
    }
  }};
  height: ${props => {
    switch(props.size) {
      case 'small': return '20px';
      case 'large': return '50px';
      default: return '30px';
    }
  }};
  border: 3px solid #f3f3f3;
  border-top: 3px solid var(--primary-yellow);
  border-radius: 50%;
  animation: ${spin} 1s linear infinite;
`;

const LoadingText = styled.p`
  margin-left: 1rem;
  color: var(--text-light);
  font-size: ${props => props.size === 'large' ? '1.1rem' : '0.9rem'};
`;

const LoadingSpinner = ({ size = 'medium', text = 'Loading...', showText = true }) => {
  return (
    <SpinnerContainer size={size}>
      <Spinner size={size} />
      {showText && <LoadingText size={size}>{text}</LoadingText>}
    </SpinnerContainer>
  );
};

export default LoadingSpinner;