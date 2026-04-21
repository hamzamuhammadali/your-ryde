import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import styled from 'styled-components';

const SidebarContainer = styled.aside`
  width: 250px;
  background: #343a40;
  color: white;
  position: fixed;
  height: 100vh;
  left: 0;
  top: 0;
  z-index: 1000;
  transition: transform 0.3s ease;
  
  @media (max-width: 768px) {
    transform: ${props => props.isOpen ? 'translateX(0)' : 'translateX(-100%)'};
  }
`;

const SidebarHeader = styled.div`
  padding: 1.5rem 1rem;
  border-bottom: 1px solid #495057;
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const Logo = styled.h2`
  margin: 0;
  color: #ffc107;
  font-size: 1.5rem;
  font-weight: bold;
`;

const MobileToggle = styled.button`
  display: none;
  background: none;
  border: none;
  color: white;
  font-size: 1.5rem;
  cursor: pointer;
  
  @media (max-width: 768px) {
    display: block;
  }
`;

const NavList = styled.ul`
  list-style: none;
  padding: 0;
  margin: 0;
`;

const NavItem = styled.li`
  margin: 0;
`;

const NavLink = styled(Link)`
  display: block;
  padding: 1rem 1.5rem;
  color: #adb5bd;
  text-decoration: none;
  transition: all 0.2s;
  border-left: 3px solid transparent;

  &:hover {
    background: #495057;
    color: white;
  }

  &.active {
    background: #495057;
    color: #ffc107;
    border-left-color: #ffc107;
  }
`;

const Overlay = styled.div`
  display: none;
  
  @media (max-width: 768px) {
    display: ${props => props.isOpen ? 'block' : 'none'};
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0, 0, 0, 0.5);
    z-index: 999;
  }
`;

const Sidebar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();

  const toggleSidebar = () => {
    setIsOpen(!isOpen);
  };

  const closeSidebar = () => {
    setIsOpen(false);
  };

  const isActive = (path) => {
    return location.pathname === path ? 'active' : '';
  };

  return (
    <>
      <Overlay isOpen={isOpen} onClick={closeSidebar} />
      <SidebarContainer isOpen={isOpen}>
        <SidebarHeader>
          <Logo>Ryde Admin</Logo>
          <MobileToggle onClick={toggleSidebar}>
            ×
          </MobileToggle>
        </SidebarHeader>
        <nav>
          <NavList>
            <NavItem>
              <NavLink 
                to="/admin/dashboard" 
                className={isActive('/admin/dashboard')}
                onClick={closeSidebar}
              >
                📊 Dashboard
              </NavLink>
            </NavItem>
            <NavItem>
              <NavLink 
                to="/admin/rides" 
                className={isActive('/admin/rides')}
                onClick={closeSidebar}
              >
                🚗 Ride Management
              </NavLink>
            </NavItem>
          </NavList>
        </nav>
      </SidebarContainer>
    </>
  );
};

export default Sidebar;