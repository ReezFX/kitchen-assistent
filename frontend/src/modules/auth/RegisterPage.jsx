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

const RegisterPage = () => {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [formError, setFormError] = useState('');
  
  const { register, loading, error } = useAuth();
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
    if (!formData.username || !formData.email || !formData.password) {
      setFormError('Bitte fülle alle Felder aus');
      return;
    }
    
    if (formData.password !== formData.confirmPassword) {
      setFormError('Passwörter stimmen nicht überein');
      return;
    }
    
    if (formData.password.length < 6) {
      setFormError('Passwort muss mindestens 6 Zeichen lang sein');
      return;
    }
    
    try {
      await register(formData.username, formData.email, formData.password);
      navigate('/');
    } catch (err) {
      console.error('Registration error:', err);
      // Error is handled by the auth context and displayed below
    }
  };

  return (
    <Container>
      <Title>Registrieren</Title>
      
      <Card>
        <Form onSubmit={handleSubmit}>
          {(error || formError) && (
            <Error>{formError || error}</Error>
          )}
          
          <Input
            label="Benutzername"
            name="username"
            type="text"
            placeholder="Dein Benutzername"
            value={formData.username}
            onChange={handleChange}
            required
          />
          
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
          
          <Input
            label="Passwort bestätigen"
            name="confirmPassword"
            type="password"
            placeholder="Passwort wiederholen"
            value={formData.confirmPassword}
            onChange={handleChange}
            required
          />
          
          <Button 
            type="submit" 
            fullWidth 
            disabled={loading}
          >
            {loading ? 'Registrierung...' : 'Registrieren'}
          </Button>
        </Form>
        
        <LinkContainer>
          Bereits registriert? <Link to="/login">Anmelden</Link>
        </LinkContainer>
      </Card>
    </Container>
  );
};

export default RegisterPage; 