import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import Button from '../common/Button';
import { GradientButton } from '../ui/GradientButton';

const HeaderContainer = styled.header`
  background-color: var(--color-background-translucent);
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
  position: sticky;
  top: 0;
  z-index: 100;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.08);
  transition: all 0.3s ease;
`;

const HeaderInner = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.75rem 1.25rem;
  max-width: 1200px;
  margin: 0 auto;
  
  @media (min-width: 768px) {
    padding: 1rem 2rem;
  }
`;

const LogoContainer = styled(Link)`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  text-decoration: none;
  z-index: 20;
  position: relative;
`;

const LogoIcon = styled.span`
  font-size: 1.5rem;
  
  @media (min-width: 768px) {
    font-size: 1.75rem;
  }
`;

const LogoText = styled.span`
  font-size: 1.25rem;
  font-weight: 700;
  background: linear-gradient(135deg, var(--color-primary) 0%, var(--color-primary-dark) 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  display: none;
  
  @media (min-width: 480px) {
    display: inline-block;
  }
  
  @media (min-width: 768px) {
    font-size: 1.5rem;
  }
`;

const HamburgerButton = styled.button`
  width: 2rem;
  height: 2rem;
  display: flex;
  flex-direction: column;
  justify-content: space-around;
  background: transparent;
  border: none;
  cursor: pointer;
  z-index: 20;
  padding: 0;
  
  &:focus {
    outline: none;
  }
  
  @media (min-width: 768px) {
    display: none;
  }
`;

const HamburgerLine = styled.span`
  width: 100%;
  height: 2px;
  background-color: var(--color-primary);
  transition: all 0.3s linear;
  position: relative;
  transform-origin: 1px;
  
  &:first-child {
    transform: ${({ $isOpen }) => $isOpen ? 'rotate(45deg)' : 'rotate(0)'};
  }
  
  &:nth-child(2) {
    opacity: ${({ $isOpen }) => $isOpen ? '0' : '1'};
    transform: ${({ $isOpen }) => $isOpen ? 'translateX(-20px)' : 'translateX(0)'};
  }
  
  &:nth-child(3) {
    transform: ${({ $isOpen }) => $isOpen ? 'rotate(-45deg)' : 'rotate(0)'};
  }
`;

const Nav = styled.nav`
  display: flex;
  position: absolute;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background-color: var(--color-background-translucent);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  top: 0;
  right: ${({ $isOpen }) => $isOpen ? '0' : '-100%'};
  height: 100vh;
  width: 80%;
  max-width: 300px;
  padding: 2rem;
  transition: right 0.3s ease-in-out;
  box-shadow: ${({ $isOpen }) => $isOpen ? '-5px 0 15px rgba(0, 0, 0, 0.1)' : 'none'};
  z-index: 10;
  
  @media (min-width: 768px) {
    position: static;
    flex-direction: row;
    background-color: transparent;
    backdrop-filter: none;
    height: auto;
    width: auto;
    padding: 0;
    box-shadow: none;
    justify-content: flex-end;
    gap: 1.5rem;
  }
`;

const Overlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100vh;
  background-color: rgba(0, 0, 0, 0.3);
  opacity: ${({ $isOpen }) => $isOpen ? '1' : '0'};
  visibility: ${({ $isOpen }) => $isOpen ? 'visible' : 'hidden'};
  transition: all 0.3s ease-in-out;
  z-index: 5;
  backdrop-filter: blur(3px);
  -webkit-backdrop-filter: blur(3px);
`;

const NavLinkContainer = styled.div`
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  margin-bottom: 2rem;
  
  @media (min-width: 768px) {
    flex-direction: row;
    margin-bottom: 0;
    width: auto;
    gap: 1.5rem;
  }
`;

const NavLink = styled(Link)`
  color: var(--color-text-secondary);
  text-decoration: none;
  font-weight: 500;
  position: relative;
  padding: 0.25rem 0;
  font-size: 1.125rem;
  
  &::after {
    content: '';
    position: absolute;
    left: 0;
    bottom: 0;
    width: ${({ $isActive }) => $isActive ? '100%' : '0'};
    height: 2px;
    background-color: var(--color-primary);
    transition: width 0.3s ease;
  }
  
  &:hover::after {
    width: 100%;
  }
  
  &:hover {
    color: var(--color-primary);
  }
  
  @media (min-width: 768px) {
    font-size: 0.9375rem;
  }
`;

const UserContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
  width: 100%;
  
  @media (min-width: 768px) {
    flex-direction: row;
    width: auto;
    margin-left: 0.5rem;
  }
`;

const UserInfo = styled.div`
  font-weight: 600;
  font-size: 0.875rem;
  color: var(--color-text-secondary);
  background-color: var(--color-gray-100);
  padding: 0.25rem 0.75rem;
  border-radius: 9999px;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  
  &::before {
    content: '👤';
    font-size: 0.875rem;
  }
`;

const AuthButtonsContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1rem;
  width: 100%;
  
  @media (min-width: 768px) {
    flex-direction: row;
    width: auto;
    align-items: center;
  }
`;

const StyledButton = styled(Button)`
  width: 100%;
  
  @media (min-width: 768px) {
    width: auto;
  }
`;

const StyledGradientButton = styled(GradientButton)`
  width: 100%;
  
  @media (min-width: 768px) {
    width: auto;
  }
`;

const Header = () => {
  const { user, logout, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 10);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    // Close mobile menu when location changes
    setIsOpen(false);
  }, [location]);

  useEffect(() => {
    // Prevent scrolling when menu is open
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  const handleLogout = () => {
    logout();
    navigate('/login');
    setIsOpen(false);
  };

  const toggleMenu = () => {
    setIsOpen(!isOpen);
  };

  return (
    <HeaderContainer style={{ boxShadow: scrolled ? '0 4px 20px rgba(0, 0, 0, 0.08)' : undefined }}>
      <HeaderInner>
        <LogoContainer to="/">
          <LogoIcon role="img" aria-label="Koch-App Logo">👨‍🍳</LogoIcon>
          <LogoText>Koch-Assistent</LogoText>
        </LogoContainer>
        
        <HamburgerButton onClick={toggleMenu} aria-label="Menu">
          <HamburgerLine $isOpen={isOpen} />
          <HamburgerLine $isOpen={isOpen} />
          <HamburgerLine $isOpen={isOpen} />
        </HamburgerButton>
        
        <Overlay $isOpen={isOpen} onClick={() => setIsOpen(false)} />
        
        <Nav $isOpen={isOpen} onClick={(e) => e.stopPropagation()}>
          <NavLinkContainer>
            <NavLink to="/" $isActive={location.pathname === '/'}>
              Home
            </NavLink>
            <NavLink to="/recipes" $isActive={location.pathname.startsWith('/recipes')}>
              Rezepte
            </NavLink>
          </NavLinkContainer>
          
          {isAuthenticated ? (
            <UserContainer>
              <NavLink to="/profile" $isActive={location.pathname === '/profile'}>
                Profil
              </NavLink>
              <UserInfo>{user.username}</UserInfo>
              <StyledGradientButton 
                onClick={handleLogout}
              >
                Abmelden
              </StyledGradientButton>
            </UserContainer>
          ) : (
            <AuthButtonsContainer>
              <NavLink to="/login" $isActive={location.pathname === '/login'}>
                Anmelden
              </NavLink>
              <Link to="/register">
                <GradientButton 
                  style={{ minWidth: 'auto', padding: '0.6rem 1.5rem' }}
                >
                  Registrieren
                </GradientButton>
              </Link>
            </AuthButtonsContainer>
          )}
        </Nav>
      </HeaderInner>
    </HeaderContainer>
  );
};

export default Header; 