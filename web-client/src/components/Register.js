// src/components/Register.js

import React, { useState } from 'react';
import { Container, TextField, Button, Typography } from '@mui/material';
import axios from 'axios';
import { Link, useNavigate } from 'react-router-dom';

function Register() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  const handleRegister = async () => {
    try {
      await axios.post('http://localhost:5000/api/register', {
        username,
        password,
      });

      alert('Kayıt başarılı! Şimdi giriş yapabilirsiniz.');
      navigate('/login'); // login sayfasına yönlendirme
    } catch (err) {
      console.error(err);
      alert('Kayıt başarısız! Lütfen tekrar deneyin.');
    }
  };

  return (
    <Container maxWidth="sm">
      <Typography variant="h4" align="center" gutterBottom>
        Kayıt Ol
      </Typography>

      <TextField
        label="Kullanıcı Adı"
        fullWidth
        margin="normal"
        value={username}
        onChange={(e) => setUsername(e.target.value)}
      />

      <TextField
        label="Şifre"
        type="password"
        fullWidth
        margin="normal"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />

      <Button
        variant="contained"
        color="primary"
        fullWidth
        onClick={handleRegister}
        sx={{ mt: 2 }}
      >
        Kayıt Ol
      </Button>

      <Typography variant="body2" align="center" sx={{ mt: 2 }}>
        Zaten hesabınız var mı? <Link to="/login">Giriş Yap</Link>
      </Typography>
    </Container>
  );
}

export default Register;
