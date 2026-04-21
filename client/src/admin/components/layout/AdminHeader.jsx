import React from 'react';
import styled from 'styled-components';
import { authService } from '../../services/adminApi';

const HeaderContainer = styled.header`
  background: white;
  padding: 1rem 2rem;
  border-bottom: 1px solid #e9ecef;
  display: flex;
  justify-content: space-between;
  align-items: center;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
  
  @media (max-width: 768px) {
    padding: 1rem;
  }
`;

const Title = styled.h1`
  margin: 0;
  color: #333;
  font-size: 1.5rem;
  
  @media (max-width: 768px) {
    font-size: 1.2rem;
  }
`;

const UserSection = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
`;

const UserInfo = styled.span`
  color: #666;
  font-weight: 500;
  
  @media (max-width: 768px) {
    display: none;
  }
`;

const LogoutButton = styled.button`
  background: #dc3545;
  color: white;
  border: none;
  padding: 0.5rem 1rem;
  border-radius: 4px;
  cursor: pointer;
  font-weight: 500;
  transition: background-color 0.2s;

  &:hover {
    background: #c82333;
  }
  
  @media (max-width: 768px) {
    padding: 0.4rem 0.8rem;
    font-size: 0.9rem;
  }
`;

const AdminHeader = () => {
  const currentUser = authService.getCurrentUser();

  const handleLogout = () => {
    authService.logout();
  };

  return (
    <HeaderContainer>
      <Title>Ryde Admin Dashboard</Title>
      <UserSection>
        {currentUser && (
          <UserInfo>Welcome, {currentUser.email}</UserInfo>
        )}
        <LogoutButton onClick={handleLogout}>
          Logout
        </LogoutButton>
      </UserSection>
    </HeaderContainer>
  );
};

export default AdminHeader;