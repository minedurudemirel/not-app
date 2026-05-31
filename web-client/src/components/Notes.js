import React, { useState, useEffect } from 'react';
import { Container, Typography, Button, TextField, List, ListItem, ListItemText } from '@mui/material';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

function Notes() {
  const { authToken, logout } = useAuth();
  const navigate = useNavigate();
  const [notes, setNotes] = useState([]);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');

  useEffect(() => {
    if (!authToken) {
      navigate('/login');
      return;
    }

    const fetchNotes = async () => {
      try {
        const res = await axios.get('http://localhost:5000/api/notes', {
          headers: { Authorization: `Bearer ${authToken}` },
        });
        setNotes(res.data);
      } catch (err) {
        alert('Notlar alınamadı');
      }
    };

    fetchNotes();
  }, [authToken, navigate]);

  const handleAddNote = async () => {
    if (!title) return alert('Başlık boş olamaz');
    try {
      await axios.post(
        'http://localhost:5000/api/notes',
        { title, content },
        { headers: { Authorization: `Bearer ${authToken}` } }
      );
      setTitle('');
      setContent('');
    } catch {
      alert('Not eklenemedi');
    }
  };

  return (
    <Container maxWidth="md">
      <Typography variant="h4" align="center" gutterBottom>
        Notlarım
      </Typography>
      <TextField fullWidth margin="normal" label="Başlık" value={title} onChange={(e) => setTitle(e.target.value)} />
      <TextField fullWidth margin="normal" label="İçerik" value={content} onChange={(e) => setContent(e.target.value)} />
      <Button variant="contained" color="primary" onClick={handleAddNote} sx={{ mt: 2, mb: 4 }}>
        Not Ekle
      </Button>

      <List>
        {notes.map((note) => (
          <ListItem key={note.id}>
            <ListItemText primary={note.title} secondary={note.content} />
          </ListItem>
        ))}
      </List>

      <Button variant="outlined" color="secondary" onClick={() => { logout(); navigate('/login'); }}>
        Çıkış Yap
      </Button>
    </Container>
  );
}

export default Notes;
