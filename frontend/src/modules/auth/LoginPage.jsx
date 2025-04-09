import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { useAuth } from '../../shared/hooks/useAuth';
import Card from '../../shared/components/common/Card';
import Button from '../../shared/components/common/Button';
import Input from '../../shared/components/common/Input';

const Container = styled.div`
  max-width: 500px;
  margin: 40px auto;
`;

const Title = styled.h1`
  font-size: 28px;
  margin-bottom: 24px;
  color: #1f2937;
  text-align: center;
`;

const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: 20px;
`;

const Error = styled.div`
  background-color: #fee2e2;
  color: #ef4444;
  padding: 12px;
  border-radius: 8px;
  margin-bottom: 16px;
`;

const LinkContainer = styled.div`
  text-align: center;
  margin-top: 16px;
  font-size: 14px;
`;

const LoginPage = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [formError, setFormError] = useState('');
  
  const { login, loading, error } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError('');
    
    // Validation
    if (!formData.email || !formData.password) {
      setFormError('Bitte gib deine E-Mail und dein Passwort ein');
      return;
    }
    
    try {
      await login(formData.email, formData.password);
      navigate('/');
    } catch (err) {
      console.error('Login error:', err);
      // Error is handled by the auth context and displayed below
    }
  };

  return (
    <Container>
      <Title>Anmelden</Title>
      
      <Card>
        <Form onSubmit={handleSubmit}>
          {(error || formError) && (
            <Error>{formError || error}</Error>
          )}
          
          <Input
            label="E-Mail"
            name="email"
            type="email"
            placeholder="deine.email@beispiel.de"
            value={formData.email}
            onChange={handleChange}
            required
          />
          
          <Input
            label="Passwort"
            name="password"
            type="password"
            placeholder="Dein Passwort"
            value={formData.password}
            onChange={handleChange}
            required
          />
          
          <Button 
            type="submit" 
            fullWidth 
            disabled={loading}
          >
            {loading ? 'Anmelden...' : 'Anmelden'}
          </Button>
        </Form>
        
        <LinkContainer>
          Noch kein Konto? <Link to="/register">Registrieren</Link>
        </LinkContainer>
      </Card>
    </Container>
  );
};

export default LoginPage; 