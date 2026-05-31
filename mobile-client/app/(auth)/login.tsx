import React, { useState } from 'react';
import { View, Text, TextInput, Button, StyleSheet, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';

const API_URL = 'http://10.42.89.60:5000';
// ⚠️ localhost yerine bilgisayarınızın IP adresini yazın (örn: 192.168.x.x)

export default function LoginScreen() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const router = useRouter();

  const handleLogin = async () => {
    if (username.trim() === '' || password.trim() === '') {
      Alert.alert('Hata', 'Lütfen kullanıcı adı ve şifre girin.');
      return;
    }

    try {
      console.log('Giriş isteği gönderiliyor:', { username, password });

      const res = await axios.post(`${API_URL}/api/login`, { username, password });
      console.log('API cevabı:', res.data);

      const token = res.data.access_token;

      if (token) {
        await AsyncStorage.setItem('@authToken', token);
        console.log('Token AsyncStorage\'a kaydedildi:', token);

        console.log('Giriş başarılı, sayfa değiştiriliyor...');
        router.replace('/(tabs)/notes');
      } else {
        Alert.alert('Hata', 'Token alınamadı.');
        console.error('Token API cevabında yok:', res.data);
      }
    } catch (error) {
      console.error('Giriş sırasında hata oluştu:', error);
      Alert.alert('Giriş Başarısız', 'Kullanıcı adı veya şifre hatalı.');
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Giriş Yap</Text>

      <TextInput
        style={styles.input}
        placeholder="Kullanıcı adı"
        value={username}
        onChangeText={setUsername}
        autoCapitalize="none"
        autoCorrect={false}
      />

      <TextInput
        style={styles.input}
        placeholder="Şifre"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
        autoCapitalize="none"
        autoCorrect={false}
      />

      <Button title="Giriş Yap" onPress={handleLogin} />
      <Button title="Kayıt Ol" onPress={() => router.push('/(auth)/register')} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', padding: 20 },
  title: { fontSize: 24, marginBottom: 20, textAlign: 'center' },
  input: { borderWidth: 1, marginBottom: 15, padding: 10, borderRadius: 5 },
});
