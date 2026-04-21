import React from 'react';
import styled from 'styled-components';

const CardContainer = styled.div`
  background: var(--primary-white);
  border-radius: 10px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  padding: ${props => {
    switch(props.padding) {
      case 'small': return '1rem';
      case 'large': return '2rem';
      default: return '1.5rem';
    }
  }};
  margin-bottom: 1.5rem;
  transition: box-shadow 0.3s ease, transform 0.3s ease;
  
  ${props => props.hoverable && `
    &:hover {
      box-shadow: 0 8px 15px rgba(0, 0, 0, 0.15);
      transform: translateY(-2px);
    }
  `}
  
  @media (max-width: 768px) {
    padding: ${props => {
      switch(props.padding) {
        case 'small': return '0.8rem';
        case 'large': return '1.5rem';
        default: return '1rem';
      }
    }};
    margin-bottom: 1rem;
  }
`;

const CardHeader = styled.div`
  margin-bottom: 1rem;
  padding-bottom: 1rem;
  border-bottom: 1px solid var(--border-color);
  
  &:last-child {
    margin-bottom: 0;
    padding-bottom: 0;
    border-bottom: none;
  }
`;

const CardTitle = styled.h3`
  margin: 0 0 0.5rem 0;
  color: var(--text-dark);
  font-size: 1.25rem;
  font-weight: 600;
  
  @media (max-width: 768px) {
    font-size: 1.1rem;
  }
`;

const CardSubtitle = styled.p`
  margin: 0;
  color: var(--text-light);
  font-size: 0.9rem;
`;

const CardBody = styled.div`
  color: var(--text-dark);
  line-height: 1.6;
`;

const CardFooter = styled.div`
  margin-top: 1rem;
  padding-top: 1rem;
  border-top: 1px solid var(--border-color);
  
  &:first-child {
    margin-top: 0;
    padding-top: 0;
    border-top: none;
  }
`;

const Card = ({ 
  children, 
  title, 
  subtitle, 
  padding = 'medium', 
  hoverable = false,
  header,
  footer,
  ...props 
}) => {
  return (
    <CardContainer padding={padding} hoverable={hoverable} {...props}>
      {(title || subtitle || header) && (
        <CardHeader>
          {header || (
            <>
              {title && <CardTitle>{title}</CardTitle>}
              {subtitle && <CardSubtitle>{subtitle}</CardSubtitle>}
            </>
          )}
        </CardHeader>
      )}
      
      <CardBody>
        {children}
      </CardBody>
      
      {footer && (
        <CardFooter>
          {footer}
        </CardFooter>
      )}
    </CardContainer>
  );
};

export default Card;