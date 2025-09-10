import React, { useState } from 'react';
import { TextField, Button, Typography, Box, Container, Alert } from '@mui/material';
import { login, register } from '../services/auth'; // Import auth functions
import { useNavigate } from 'react-router-dom';

function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isRegistering, setIsRegistering] = useState(false);
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState('info'); // 'success', 'error', 'info'

  const handleSubmit = async (event) => {
    event.preventDefault();
    setMessage(''); // Clear previous messages
    try {
      if (isRegistering) {
        await register(email, password);
        setMessage('Registro bem-sucedido! Faça login agora.');
        setMessageType('success');
        setIsRegistering(false); // Switch to login mode after successful registration
      } else {
    const data = await login(email, password);
    setMessage('Login bem-sucedido! Redirecionando...');
    setMessageType('success');
    setPassword('');
    // Redirect to dashboard
    navigate('/dashboard');
      }
    } catch (error) {
      setMessage(error.message || 'Ocorreu um erro.');
      setMessageType('error');
    }
  };

  const navigate = useNavigate();

  return (
    <Container component="main" maxWidth="xs">
      <Box
        sx={{
          marginTop: 8,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
        }}
      >
        <Typography component="h1" variant="h5">
          {isRegistering ? 'Registrar' : 'Login'}
        </Typography>
        {message && (
          <Alert severity={messageType} sx={{ width: '100%', mt: 2 }}>
            {message}
          </Alert>
        )}
        <Box component="form" onSubmit={handleSubmit} noValidate sx={{ mt: 1 }}>
          <TextField
            margin="normal"
            required
            fullWidth
            id="email"
            label="Email Address"
            name="email"
            autoComplete="email"
            autoFocus
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <TextField
            margin="normal"
            required
            fullWidth
            name="password"
            label="Password"
            type="password"
            id="password"
            autoComplete={isRegistering ? 'new-password' : 'current-password'}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <Button
            type="submit"
            fullWidth
            variant="contained"
            sx={{ mt: 3, mb: 2 }}
          >
            {isRegistering ? 'Registrar' : 'Entrar'}
          </Button>
          <Button
            fullWidth
            variant="text"
            onClick={() => setIsRegistering(!isRegistering)}
          >
            {isRegistering ? 'Já tem uma conta? Faça login' : 'Não tem uma conta? Registre-se'}
          </Button>
        </Box>
      </Box>
    </Container>
  );
}

export default LoginPage;