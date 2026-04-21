import React from 'react';
import styled from 'styled-components';

const SuccessContainer = styled.div`
  background-color: #d4edda;
  color: #155724;
  padding: 1rem;
  border-radius: 5px;
  border: 1px solid #c3e6cb;
  margin: 1rem 0;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  
  @media (max-width: 768px) {
    padding: 0.8rem;
    font-size: 0.9rem;
  }
`;

const SuccessIcon = styled.span`
  font-size: 1.2rem;
  flex-shrink: 0;
`;

const SuccessText = styled.span`
  flex: 1;
`;

const SuccessMessage = ({ message, icon = '✅' }) => {
  if (!message) return null;
  
  return (
    <SuccessContainer>
      <SuccessIcon>{icon}</SuccessIcon>
      <SuccessText>{message}</SuccessText>
    </SuccessContainer>
  );
};

export default SuccessMessage;