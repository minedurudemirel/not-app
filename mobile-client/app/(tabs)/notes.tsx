import React, { useState, useEffect } from 'react';
import { 
  View, Text, TextInput, FlatList, TouchableOpacity, 
  StyleSheet, Alert, KeyboardAvoidingView, Platform, Button 
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import { useRouter } from 'expo-router';

interface Note {
  id: string;
  title: string;
  content: string;
}

const API_URL = 'http://10.42.89.60:5000/api/notes';

// ⚠️ Telefon ya da emulator ile testte localhost değil bilgisayarın IP adresi kullanılmalı.

export default function NotesScreen() {
  const [notes, setNotes] = useState<Note[]>([]);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [authToken, setAuthToken] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    const loadTokenAndFetchNotes = async () => {
      try {
        const token = await AsyncStorage.getItem('@authToken');
        if (token) {
          setAuthToken(token);
          await fetchNotes(token);
        } else {
          // Token yoksa login sayfasına yönlendir
          router.replace('/(auth)/login');
        }
      } catch (error) {
        console.error('Token alınamadı:', error);
      }
    };
    loadTokenAndFetchNotes();
  }, []);

  const fetchNotes = async (token: string) => {
    try {
      const res = await axios.get(API_URL, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setNotes(res.data);
    } catch (error) {
      console.error('Notlar alınamadı:', error);
      Alert.alert('Hata', 'Notlar alınamadı, lütfen tekrar deneyin.');
    }
  };

  const saveNote = async () => {
    if (!title.trim() || !content.trim()) {
      Alert.alert('Hata', 'Lütfen hem başlık hem içerik giriniz.');
      return;
    }

    try {
      if (!authToken) {
        Alert.alert('Hata', 'Giriş yapmanız gerekiyor.');
        router.replace('/(auth)/login');
        return;
      }

      if (editingId) {
        // Not güncelle
        await axios.put(
          `${API_URL}/${editingId}`,
          { title, content },
          { headers: { Authorization: `Bearer ${authToken}` } }
        );
        setEditingId(null);
      } else {
        // Yeni not ekle
        await axios.post(
          API_URL,
          { title, content },
          { headers: { Authorization: `Bearer ${authToken}` } }
        );
      }
      setTitle('');
      setContent('');
      await fetchNotes(authToken);
    } catch (error) {
      console.error('Not eklenemedi/güncellenemedi:', error);
      Alert.alert('Hata', 'Not kaydedilirken bir hata oluştu.');
    }
  };

  const deleteNote = (id: string) => {
    Alert.alert(
      'Not Silinecek',
      'Bu notu silmek istediğinizden emin misiniz?',
      [
        { text: 'İptal', style: 'cancel' },
        {
          text: 'Sil',
          style: 'destructive',
          onPress: async () => {
            try {
              if (!authToken) {
                Alert.alert('Hata', 'Giriş yapmanız gerekiyor.');
                router.replace('/(auth)/login');
                return;
              }

              await axios.delete(`${API_URL}/${id}`, {
                headers: { Authorization: `Bearer ${authToken}` },
              });
              await fetchNotes(authToken);
            } catch (error) {
              console.error('Not silinemedi:', error);
              Alert.alert('Hata', 'Not silinirken bir hata oluştu.');
            }
          },
        },
      ]
    );
  };

  const editNote = (note: Note) => {
    setTitle(note.title);
    setContent(note.content);
    setEditingId(note.id);
  };

  const cancelEdit = () => {
    setEditingId(null);
    setTitle('');
    setContent('');
  };

  const handleLogout = async () => {
    await AsyncStorage.removeItem('@authToken');
    setAuthToken(null);
    setNotes([]);
    router.replace('/(auth)/login');
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <View style={styles.headerRow}>
        <Text style={styles.title}>Notlarım</Text>
        <Button title="Çıkış Yap" onPress={handleLogout} color="#d9534f" />
      </View>

      <View style={styles.form}>
        <TextInput
          style={styles.input}
          placeholder="Başlık"
          value={title}
          onChangeText={setTitle}
        />
        <TextInput
          style={[styles.input, styles.textArea]}
          placeholder="İçerik"
          value={content}
          onChangeText={setContent}
          multiline
          numberOfLines={4}
        />
        <View style={styles.buttonRow}>
          {editingId ? (
            <>
              <Button title="Güncellemeyi Kaydet" onPress={saveNote} />
              <Button title="İptal" onPress={cancelEdit} color="grey" />
            </>
          ) : (
            <Button title="Not Ekle" onPress={saveNote} />
          )}
        </View>
      </View>

      <FlatList
        data={notes}
        keyExtractor={item => item.id}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.noteItem}
            onPress={() => editNote(item)}
          >
            <View style={styles.noteHeader}>
              <Text style={styles.noteTitle}>{item.title}</Text>
              <TouchableOpacity onPress={() => deleteNote(item.id)}>
                <Text style={styles.deleteButton}>Sil</Text>
              </TouchableOpacity>
            </View>
            <Text style={styles.noteContent}>{item.content}</Text>
          </TouchableOpacity>
        )}
        ListEmptyComponent={<Text style={{ textAlign: 'center', marginTop: 20 }}>Henüz not yok.</Text>}
      />
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, backgroundColor: '#fff' },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  form: {
    marginBottom: 16,
  },
  input: {
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginBottom: 8,
    fontSize: 16,
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top',
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  noteItem: {
    backgroundColor: '#f9f9f9',
    padding: 12,
    borderRadius: 6,
    marginBottom: 10,
    elevation: 1,
  },
  noteHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  noteTitle: {
    fontWeight: 'bold',
    fontSize: 16,
  },
  deleteButton: {
    color: 'red',
    fontWeight: '600',
  },
  noteContent: {
    fontSize: 14,
    color: '#333',
  },
});
