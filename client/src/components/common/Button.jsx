import React from 'react';
import styled from 'styled-components';

const StyledButton = styled.button`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  padding: ${props => {
    switch(props.size) {
      case 'small': return '0.5rem 1rem';
      case 'large': return '1rem 2rem';
      default: return '0.75rem 1.5rem';
    }
  }};
  border: none;
  border-radius: 5px;
  cursor: pointer;
  font-size: ${props => {
    switch(props.size) {
      case 'small': return '0.875rem';
      case 'large': return '1.125rem';
      default: return '1rem';
    }
  }};
  font-weight: 600;
  text-decoration: none;
  text-align: center;
  transition: all 0.3s ease;
  width: ${props => props.$fullWidth ? '100%' : 'auto'};
  
  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
    transform: none !important;
  }
  
  ${props => {
    switch(props.variant) {
      case 'secondary':
        return `
          background-color: var(--primary-black);
          color: var(--primary-white);
          
          &:hover:not(:disabled) {
            background-color: #333;
            transform: translateY(-2px);
          }
        `;
      case 'outline':
        return `
          background-color: transparent;
          color: var(--primary-yellow);
          border: 2px solid var(--primary-yellow);
          
          &:hover:not(:disabled) {
            background-color: var(--primary-yellow);
            color: var(--primary-black);
            transform: translateY(-2px);
          }
        `;
      case 'danger':
        return `
          background-color: var(--error-color);
          color: white;
          
          &:hover:not(:disabled) {
            background-color: #c82333;
            transform: translateY(-2px);
          }
        `;
      default:
        return `
          background-color: var(--primary-yellow);
          color: var(--primary-black);
          
          &:hover:not(:disabled) {
            background-color: #E6C200;
            transform: translateY(-2px);
          }
        `;
    }
  }}
  
  @media (max-width: 768px) {
    padding: ${props => {
      switch(props.size) {
        case 'small': return '0.4rem 0.8rem';
        case 'large': return '0.8rem 1.6rem';
        default: return '0.6rem 1.2rem';
      }
    }};
    font-size: ${props => {
      switch(props.size) {
        case 'small': return '0.8rem';
        case 'large': return '1rem';
        default: return '0.9rem';
      }
    }};
  }
`;

const Button = ({ 
  children, 
  variant = 'primary', 
  size = 'medium', 
  fullWidth = false,
  loading = false,
  disabled = false,
  onClick,
  type = 'button',
  ...props 
}) => {
  return (
    <StyledButton
      variant={variant}
      size={size}
      $fullWidth={fullWidth}
      disabled={disabled || loading}
      onClick={onClick}
      type={type}
      {...props}
    >
      {loading && <span className="loading-spinner" />}
      {children}
    </StyledButton>
  );
};

export default Button;