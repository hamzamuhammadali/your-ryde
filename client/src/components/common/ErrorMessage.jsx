import React from 'react';
import styled from 'styled-components';

const ErrorContainer = styled.div`
  background-color: #f8d7da;
  color: #721c24;
  padding: 1rem;
  border-radius: 5px;
  border: 1px solid #f5c6cb;
  margin: 1rem 0;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  
  @media (max-width: 768px) {
    padding: 0.8rem;
    font-size: 0.9rem;
  }
`;

const ErrorIcon = styled.span`
  font-size: 1.2rem;
  flex-shrink: 0;
`;

const ErrorText = styled.span`
  flex: 1;
`;

const ErrorMessage = ({ message, icon = '⚠️' }) => {
  if (!message) return null;
  
  return (
    <ErrorContainer>
      <ErrorIcon>{icon}</ErrorIcon>
      <ErrorText>{message}</ErrorText>
    </ErrorContainer>
  );
};

export default ErrorMessage;