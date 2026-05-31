import React, { useState } from 'react';
import { View, Text, TextInput, Button, StyleSheet, Alert } from 'react-native';
import { useRouter } from 'expo-router';

export default function RegisterScreen() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const router = useRouter();

  const handleRegister = () => {
    if (username.trim() === '' || password.trim() === '') {
      Alert.alert('Hata', 'Lütfen kullanıcı adı ve şifre girin.');
      return;
    }
    // Şifre karakter sınırı yok, direkt kayıt işlemi
    Alert.alert('Başarılı', 'Kayıt başarılı! Giriş yapabilirsiniz.');
    router.replace("/(auth)/login");
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Kayıt Ol</Text>

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
        autoCapitalize="none"
        autoCorrect={false}
        // secureTextEntry kaldırıldı, şifre görünür
      />

      <Button title="Kayıt Ol" onPress={handleRegister} />
      <View style={{ marginTop: 10 }}>
        <Button title="Giriş Yap" onPress={() => router.push("/(auth)/login")} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', padding: 20, backgroundColor: '#fff' },
  title: { fontSize: 24, marginBottom: 20, textAlign: 'center', color: '#000' },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    marginBottom: 15,
    padding: 10,
    borderRadius: 5,
    color: '#000',
    backgroundColor: '#fff',
  },
});
