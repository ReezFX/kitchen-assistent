import React, { useState, useEffect, useRef } from 'react';
import styled from 'styled-components';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../../hooks/useAuth';
import Button from '../common/Button';
import { GradientButton } from '../ui/GradientButton';
import ThemeToggle from '../common/ThemeToggle';

// SVG Icons for Bottom Navigation
const HomeIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
    <path d="M12 2.09998L1 12H4V21H11V15H13V21H20V12H23L12 2.09998ZM18 19H15V13H9V19H6V10.2L12 4.79998L18 10.2V19Z"/>
  </svg>
);

const RecipeIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
    <path d="M8.1 13.34L9.87 15.1L11.27 13.7L9.5 11.94L10.92 10.52L12.68 12.29L14.09 10.88L12.33 9.11L13.74 7.7L15.5 9.47L16.92 8.06L15.15 6.29L16.57 4.88L18.87 7.18L17.93 8.12L18.88 9.07L19.82 8.13L22.12 10.43L18.36 14.19L13.57 9.4L9.81 13.16L9.45 12.8L8.1 13.34ZM20 3.88L21.12 5C21.5 5.38 21.5 5.99 21.12 6.37L20.16 7.32L16.68 3.84L17.63 2.88C18.01 2.5 18.62 2.5 19 2.88L20 3.88ZM4 17.54L3.41 21.08L6.97 20.5L17.17 10.3L13.7 6.83L4 17.03V17.54Z"/>
  </svg>
);

const ProfileIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
    <path d="M12 2C6.48 2 2 6.48 2 12C2 17.52 6.48 22 12 22C17.52 22 22 17.52 22 12C22 6.48 17.52 2 12 2ZM12 5C13.66 5 15 6.34 15 8C15 9.66 13.66 11 12 11C10.34 11 9 9.66 9 8C9 6.34 10.34 5 12 5ZM12 19.2C9.5 19.2 7.29 17.92 6 15.98C6.03 13.99 10 12.9 12 12.9C13.99 12.9 17.97 13.99 18 15.98C16.71 17.92 14.5 19.2 12 19.2Z"/>
  </svg>
);

const LogoutIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
    <path d="M17 7L15.59 8.41L18.17 11H8V13H18.17L15.59 15.58L17 17L22 12L17 7ZM4 5H12V3H4C2.9 3 2 3.9 2 5V19C2 20.1 2.9 21 4 21H12V19H4V5Z"/>
  </svg>
);

// ============== Styled Components ==============

// Core container - mobile first approach
const HeaderContainer = styled.header`
  position: sticky;
  top: 0;
  width: 100%;
  z-index: 1000;
  background-color: var(--color-background-translucent);
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
  /* Fallback for browsers that don't support backdrop-filter */
  @supports not ((-webkit-backdrop-filter: blur(10px)) or (backdrop-filter: blur(10px))) {
    background-color: var(--color-background);
  }
  box-shadow: ${({ $isScrolled }) => 
    $isScrolled ? '0 2px 8px rgba(0, 0, 0, 0.1)' : '0 1px 3px rgba(0, 0, 0, 0.05)'};
  transition: box-shadow 0.3s ease, background-color 0.3s ease;
`;

const HeaderInner = styled.div`
  width: 100%;
  max-width: 1200px;
  margin: 0 auto;
  padding: 0.75rem 1rem;
  display: flex;
  align-items: center;
  justify-content: space-between;
  position: relative;
  
  @media (min-width: 768px) {
    padding: 0.75rem 2rem;
  }
`;

// Logo with improved accessibility and styling
const Logo = styled(Link)`
  display: flex;
  align-items: center;
  text-decoration: none;
  gap: 0.5rem;
  z-index: 20;
  transition: transform 0.2s ease;
  
  &:hover, &:focus, &:active, &:visited {
    text-decoration: none;
    transform: translateY(-1px);
  }
  
  &:active {
    transform: translateY(0);
  }
`;

const LogoIcon = styled.span`
  font-size: 1.5rem;
  
  @media (min-width: 768px) {
    font-size: 1.75rem;
  }
`;

const LogoText = styled.span`
  font-weight: 700;
  font-size: 1.125rem;
  background: linear-gradient(135deg, var(--color-primary) 0%, var(--color-primary-dark) 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  white-space: nowrap;
  
  @media (min-width: 768px) {
    font-size: 1.5rem;
  }
`;

// Desktop navigation
const DesktopNav = styled.nav`
  display: none;
  
  @media (min-width: 768px) {
    display: flex;
    align-items: center;
    gap: 2rem;
  }
`;

// Navigation links styling with active states
const NavLinks = styled.div`
  display: flex;
  gap: 1.5rem;
`;

const NavLink = styled(Link)`
  font-size: 0.9375rem;
  font-weight: 500;
  color: var(--color-text-secondary);
  text-decoration: none;
  position: relative;
  transition: color 0.2s ease;
  padding: 0.25rem 0;
  
  &:hover, &:focus, &:active, &:visited {
    color: var(--color-primary);
    text-decoration: none;
  }
  
  &:after {
    content: '';
    position: absolute;
    bottom: 0;
    left: 0;
    width: 100%;
    height: 2px;
    background: linear-gradient(90deg, var(--color-primary) 0%, var(--color-primary-dark) 100%);
    transform: scaleX(0);
    transform-origin: right;
    transition: transform 0.3s ease;
  }
  
  &:hover:after {
    transform: scaleX(1);
    transform-origin: left;
  }
  
  ${({ $isActive }) => $isActive && `
    color: var(--color-primary);
    
    &:after {
      transform: scaleX(1);
    }
  `}
`;

// User profile section with connected design
const UserProfile = styled.div`
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.5rem 0.75rem;
  background-color: var(--color-gray-100);
  border-radius: 9999px;
  transition: background-color 0.2s ease;
  cursor: pointer;
  position: relative;
  z-index: 10;
  margin-left: -2rem;
  height: 40px;
  
  &:hover {
    background-color: var(--color-gray-200);
  }
`;

const UserAvatar = styled.div`
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background-color: var(--color-primary-light);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.125rem;
  color: var(--color-text-primary);
`;

const UserName = styled.span`
  font-weight: 600;
  color: var(--color-text-primary);
  font-size: 0.9375rem;
  white-space: nowrap;
  max-width: 150px;
  overflow: hidden;
  text-overflow: ellipsis;
`;

const ProfileDropdown = styled.div`
  position: absolute;
  top: calc(100% + 0.5rem);
  right: 0;
  width: 200px;
  background-color: var(--color-background);
  border-radius: var(--border-radius);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  padding: 0.5rem;
  z-index: 1001;
  border: 1px solid var(--color-border);
`;

const DropdownLink = styled(Link)`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1rem;
  color: var(--color-text-primary);
  text-decoration: none;
  border-radius: var(--border-radius-sm);
  transition: background-color 0.2s ease;
  
  &:hover, &:focus, &:active, &:visited {
    background-color: var(--color-gray-100);
    color: var(--color-primary);
    text-decoration: none;
  }
`;

const DropdownButton = styled.button`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1rem;
  background: none;
  border: none;
  width: 100%;
  text-align: left;
  color: var(--color-text-primary);
  border-radius: var(--border-radius-sm);
  transition: background-color 0.2s ease;
  cursor: pointer;
  
  &:hover, &:focus {
    background-color: var(--color-gray-100);
    color: var(--color-danger);
  }
`;

// Theme toggle wrapper
const ThemeToggleWrapper = styled.div`
  display: flex;
  align-items: center;
  position: relative;
  z-index: 5;
  
  @media (min-width: 768px) {
    margin: 0;
  }
`;

const ThemeToggleContainer = styled.div`
  display: flex;
  align-items: center;
  justify-content: flex-start;
  padding: 0.5rem 2.5rem 0.5rem 0.75rem;
  background-color: var(--color-gray-200);
  border-radius: 9999px;
  transition: background-color 0.2s ease;
  cursor: pointer;
  height: 40px;
  width: auto;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  
  &:hover {
    background-color: var(--color-gray-300);
  }
`;

// Bottom Mobile Navigation Dock
const BottomNavDock = styled.nav`
  position: fixed;
  bottom: 0;
  left: 0;
  width: 100%;
  background-color: var(--color-background-translucent);
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
  /* Fallback for browsers that don't support backdrop-filter */
  @supports not ((-webkit-backdrop-filter: blur(10px)) or (backdrop-filter: blur(10px))) {
    background-color: var(--color-background);
  }
  box-shadow: 0 -1px 3px rgba(0, 0, 0, 0.05);
  z-index: 1000;
  padding: 0.75rem 0.25rem 1rem;
  display: flex;
  justify-content: space-around;
  align-items: center;
  border-top: 1px solid var(--color-border);
  
  @media (min-width: 768px) {
    display: none;
  }
`;

const NavItem = styled(Link)`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 0.5rem;
  text-decoration: none;
  color: ${({ $isActive }) => 
    $isActive ? 'var(--color-primary)' : 'var(--color-text-secondary)'};
  transition: color 0.2s ease;
  width: 100%;
  max-width: 80px;
  
  &:hover, &:focus, &:active, &:visited {
    color: var(--color-primary);
    text-decoration: none;
  }
`;

const NavIcon = styled.span`
  margin-bottom: 0.25rem;
  display: flex;
  justify-content: center;
  align-items: center;
  height: 24px;
`;

const NavLabel = styled.span`
  font-size: 0.75rem;
  font-weight: 500;
  margin-top: 0.25rem;
`;

// Profile Button for non-authenticated users
const ProfileButton = styled.button`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 0.5rem;
  background: none;
  border: none;
  color: ${({ $isActive }) => 
    $isActive ? 'var(--color-primary)' : 'var(--color-text-secondary)'};
  transition: color 0.2s ease;
  width: 100%;
  max-width: 80px;
  cursor: pointer;
  
  &:hover, &:focus {
    color: var(--color-primary);
  }
`;

// Mobile header for simplification
const MobileActions = styled.div`
  display: flex;
  align-items: center;
  
  @media (min-width: 768px) {
    display: none;
  }
`;

// ============== Component Implementation ==============

const Header = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [showProfileDropdown, setShowProfileDropdown] = useState(false);
  const { user, logout, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const dropdownRef = useRef(null);
  const profileRef = useRef(null);
  
  // Fix for mobile viewport height
  useEffect(() => {
    // Set the --vh custom property to the actual viewport height
    const setVh = () => {
      const vh = window.innerHeight * 0.01;
      document.documentElement.style.setProperty('--vh', `${vh}px`);
    };
    
    // Initial set
    setVh();
    
    // Update on resize and orientation change
    window.addEventListener('resize', setVh);
    window.addEventListener('orientationchange', setVh);
    
    return () => {
      window.removeEventListener('resize', setVh);
      window.removeEventListener('orientationchange', setVh);
    };
  }, []);
  
  // Handle scroll events with throttling for performance
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    
    // Throttle scroll event for better performance
    let timeoutId;
    const throttledScroll = () => {
      if (!timeoutId) {
        timeoutId = setTimeout(() => {
          handleScroll();
          timeoutId = null;
        }, 100);
      }
    };
    
    window.addEventListener('scroll', throttledScroll);
    return () => {
      window.removeEventListener('scroll', throttledScroll);
      clearTimeout(timeoutId);
    };
  }, []);
  
  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        showProfileDropdown &&
        dropdownRef.current && 
        !dropdownRef.current.contains(event.target) &&
        profileRef.current &&
        !profileRef.current.contains(event.target)
      ) {
        setShowProfileDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showProfileDropdown]);
  
  // Handle profile action for non-authenticated users
  const handleProfileAction = () => {
    if (isAuthenticated) {
      navigate('/profile');
    } else {
      navigate('/login');
    }
  };
  
  // Handle logout
  const handleLogout = async () => {
    setShowProfileDropdown(false);
    await logout();
    navigate('/');
  };

  // Toggle profile dropdown
  const toggleProfileDropdown = () => {
    setShowProfileDropdown(!showProfileDropdown);
  };
  
  return (
    <>
      <HeaderContainer $isScrolled={isScrolled} role="banner">
        <HeaderInner>
          {/* Logo */}
          <Logo to="/" aria-label="Koch-Assistent Homepage">
            <LogoIcon>🍳</LogoIcon>
            <LogoText>Koch-Assistent</LogoText>
          </Logo>
          
          {/* Desktop Navigation */}
          <DesktopNav role="navigation" aria-label="Main Navigation">
            <NavLinks>
              <NavLink to="/" $isActive={location.pathname === '/'}>
                Home
              </NavLink>
              <NavLink to="/recipes" $isActive={location.pathname.startsWith('/recipes')}>
                Rezepte
              </NavLink>
            </NavLinks>
            
            {/* Authentication (Desktop) */}
            {isAuthenticated ? (
              <div style={{ display: 'flex', alignItems: 'center' }}>
                {/* Theme Toggle (Desktop) */}
                <ThemeToggleWrapper>
                  <ThemeToggleContainer>
                    <ThemeToggle />
                  </ThemeToggleContainer>
                </ThemeToggleWrapper>
                
                <div style={{ position: 'relative' }}>
                  <UserProfile 
                    onClick={toggleProfileDropdown} 
                    onKeyDown={(e) => e.key === 'Enter' && toggleProfileDropdown()} 
                    tabIndex={0} 
                    role="button" 
                    aria-label="User profile"
                    aria-expanded={showProfileDropdown}
                    aria-haspopup="true"
                    ref={profileRef}
                  >
                    <UserAvatar>
                      {user?.displayName?.[0] || user?.email?.[0] || '👤'}
                    </UserAvatar>
                    <UserName title={user?.displayName || user?.email}>
                      {user?.displayName || user?.email}
                    </UserName>
                  </UserProfile>
                  
                  {showProfileDropdown && (
                    <ProfileDropdown ref={dropdownRef}>
                      <DropdownLink to="/profile">
                        <ProfileIcon />
                        Mein Profil
                      </DropdownLink>
                      <DropdownButton onClick={handleLogout}>
                        <LogoutIcon />
                        Abmelden
                      </DropdownButton>
                    </ProfileDropdown>
                  )}
                </div>
              </div>
            ) : (
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                {/* Theme Toggle (Desktop) */}
                <ThemeToggleWrapper>
                  <ThemeToggleContainer>
                    <ThemeToggle />
                  </ThemeToggleContainer>
                </ThemeToggleWrapper>
                
                <Button as={Link} to="/login">
                  Login
                </Button>
                <GradientButton as={Link} to="/register">
                  Registrieren
                </GradientButton>
              </div>
            )}
          </DesktopNav>
          
          {/* Mobile Actions */}
          <MobileActions>
            <ThemeToggleWrapper>
              <ThemeToggleContainer>
                <ThemeToggle />
              </ThemeToggleContainer>
            </ThemeToggleWrapper>
          </MobileActions>
        </HeaderInner>
      </HeaderContainer>
      
      {/* Bottom Navigation Dock for Mobile */}
      <BottomNavDock role="navigation" aria-label="Mobile Navigation">
        <NavItem to="/" $isActive={location.pathname === '/'}>
          <NavIcon>
            <HomeIcon />
          </NavIcon>
          <NavLabel>Start</NavLabel>
        </NavItem>
        
        <NavItem to="/recipes" $isActive={location.pathname.startsWith('/recipes')}>
          <NavIcon>
            <RecipeIcon />
          </NavIcon>
          <NavLabel>Rezepte</NavLabel>
        </NavItem>
        
        {isAuthenticated ? (
          <>
            <NavItem to="/profile" $isActive={location.pathname.startsWith('/profile')}>
              <NavIcon>
                <ProfileIcon />
              </NavIcon>
              <NavLabel>Profil</NavLabel>
            </NavItem>
            
            <ProfileButton 
              onClick={handleLogout}
              $isActive={false}
              aria-label="Abmelden"
            >
              <NavIcon>
                <LogoutIcon />
              </NavIcon>
              <NavLabel>Abmelden</NavLabel>
            </ProfileButton>
          </>
        ) : (
          <ProfileButton 
            onClick={handleProfileAction} 
            $isActive={location.pathname === '/login' || location.pathname === '/register'}
          >
            <NavIcon>
              <ProfileIcon />
            </NavIcon>
            <NavLabel>Login</NavLabel>
          </ProfileButton>
        )}
      </BottomNavDock>
    </>
  );
};

export default Header; 