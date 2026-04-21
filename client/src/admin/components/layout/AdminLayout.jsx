import React from 'react';
import styled from 'styled-components';
import AdminHeader from './AdminHeader';
import Sidebar from './Sidebar';

const AdminLayoutContainer = styled.div`
  display: flex;
  min-height: 100vh;
  background-color: #f8f9fa;
`;

const MainContent = styled.main`
  flex: 1;
  display: flex;
  flex-direction: column;
  margin-left: 250px;
  
  @media (max-width: 768px) {
    margin-left: 0;
  }
`;

const ContentArea = styled.div`
  flex: 1;
  padding: 2rem;
  
  @media (max-width: 768px) {
    padding: 1rem;
  }
`;

const AdminLayout = ({ children }) => {
  return (
    <AdminLayoutContainer>
      <Sidebar />
      <MainContent>
        <AdminHeader />
        <ContentArea>
          {children}
        </ContentArea>
      </MainContent>
    </AdminLayoutContainer>
  );
};

export default AdminLayout;