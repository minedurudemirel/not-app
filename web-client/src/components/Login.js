import React, { useState, useEffect } from 'react';
import { Container, TextField, Button, Typography } from '@mui/material';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';

function Login() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const { login, authToken } = useAuth();
  const navigate = useNavigate();

  // Eğer kullanıcı zaten giriş yaptıysa direkt notlara yönlendir
  useEffect(() => {
    if (authToken) {
      navigate('/notes');
    }
  }, [authToken, navigate]);

  const handleLogin = async () => {
    if (!username || !password) {
      alert('Lütfen kullanıcı adı ve şifre girin.');
      return;
    }

    setLoading(true);
    try {
      const response = await axios.post('http://localhost:5000/api/login', {
        username,
        password,
      });
      

      const token = response.data.access_token;

      if (!token) {
        alert('Token alınamadı. Backend’i kontrol edin.');
        console.error('Token API cevabında yok:', response.data);
        setLoading(false);
        return;
      }

      // Token'ı Context ve localStorage'a kaydet
      login(token);
      alert('Giriş başarılı!');

      // 🔹 Token kaydettikten hemen sonra yönlendirme yap
      navigate('/notes');

    } catch (error) {
      console.error('Login error:', error);
      const message = error.response?.data?.msg || 'Giriş başarısız!';
      alert(message);
    }
    setLoading(false);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      handleLogin();
    }
  };

  return (
    <Container maxWidth="sm" sx={{ mt: 8 }}>
      <Typography variant="h4" align="center" gutterBottom>
        Giriş Yap
      </Typography>

      <TextField
        label="Kullanıcı Adı"
        fullWidth
        margin="normal"
        value={username}
        onChange={(e) => setUsername(e.target.value)}
        onKeyDown={handleKeyDown}
        autoFocus
      />
      <TextField
        label="Şifre"
        type="password"
        fullWidth
        margin="normal"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        onKeyDown={handleKeyDown}
      />

      <Button
        variant="contained"
        color="primary"
        fullWidth
        onClick={handleLogin}
        disabled={loading}
        sx={{ mt: 2 }}
      >
        {loading ? 'Giriş yapılıyor...' : 'Giriş Yap'}
      </Button>

      <Typography variant="body2" align="center" sx={{ mt: 2 }}>
        Üyelik oluşturmak için <Link to="/register">Kayıt Ol</Link>
      </Typography>
    </Container>
  );
}

export default Login;
