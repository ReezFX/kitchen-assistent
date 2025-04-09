import React from 'react';
import styled from 'styled-components';
import { Link } from 'react-router-dom';

const HeaderContainer = styled.header`
  background-color: white;
  box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06);
  padding: 16px 24px;
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const Logo = styled(Link)`
  font-size: 24px;
  font-weight: 700;
  color: #4f46e5;
  text-decoration: none;
  display: flex;
  align-items: center;
  gap: 8px;
`;

const Nav = styled.nav`
  display: flex;
  gap: 24px;
`;

const NavLink = styled(Link)`
  color: #4b5563;
  text-decoration: none;
  font-weight: 500;
  transition: color 0.2s ease;
  
  &:hover {
    color: #4f46e5;
  }
  
  &.active {
    color: #4f46e5;
  }
`;

const Header = () => {
  return (
    <HeaderContainer>
      <Logo to="/">
        <span role="img" aria-label="Koch-App Logo">👨‍🍳</span>
        Koch-Assistent
      </Logo>
      
      <Nav>
        <NavLink to="/">Home</NavLink>
        <NavLink to="/recipes">Rezepte</NavLink>
        <NavLink to="/cooking-assistant">Kochassistent</NavLink>
        <NavLink to="/profile">Profil</NavLink>
      </Nav>
    </HeaderContainer>
  );
};

export default Header; 